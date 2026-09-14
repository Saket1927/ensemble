/**
 * ENSEMBLE Real-Time Cross-Device Synchronization Service
 * 
 * Provides instantaneous, sub-100ms cross-device event broadcasting between:
 * 1. Physical Customer Mobile Phones (QR Scans, Session Creation, Orders, Calls, Bill Requests)
 * 2. Captain Floor Terminal (Live Table Occupancy, Order Fulfillment, Clear Table Actions)
 * 3. Restaurant Dashboard & Master Portals
 * 
 * Multi-Transport Architecture:
 * - Cloud Transport: Server-Sent Events (SSE) + HTTP POST via ntfy.sh (Zero-credential, works across all cellular 4G/5G and Wi-Fi networks worldwide)
 * - Local Transport: Native BroadcastChannel for sub-millisecond same-browser tab-to-tab synchronization
 * - Deduplication: High-performance LRU / ID set preventing double-processing
 */

export type RealtimeEventType =
  | 'TABLE_SCAN'
  | 'SESSION_CREATED'
  | 'MEMBER_JOINED'
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_DELIVERED'
  | 'CALL_CAPTAIN'
  | 'RESOLVE_CALL'
  | 'BILL_REQUESTED'
  | 'CLEAR_TABLE'
  | 'MENU_SYNC'
  | 'SPIN_CONFIG_SYNC'
  | 'TABLE_SPIN_COMPLETED';

export interface RealtimeEnvelope<T = any> {
  id: string;
  type: RealtimeEventType;
  restaurantId: string;
  restaurantSlug: string;
  tableNumber?: number;
  payload: T;
  timestamp: string;
  senderDeviceId: string;
}

// Unique identifier for this client session to ignore self-echoes if needed
const DEVICE_ID = typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export type RealtimeListener = (event: RealtimeEnvelope) => void;

class RealtimeHub {
  private listeners: Map<string, Set<RealtimeListener>> = new Map();
  private localChannels: Map<string, BroadcastChannel> = new Map();
  private eventSources: Map<string, EventSource> = new Map();
  private processedEventIds = new Set<string>();
  private maxProcessedIds = 1000;

  private getTopic(slug: string): string {
    const clean = slug.toLowerCase().replace(/[^a-z0-9]/g, '_').trim();
    // Unique namespaced topic per restaurant
    return `ensemble_dining_${clean}_v1`;
  }

  /**
   * Publishes an event to both the local browser BroadcastChannel and the Cloud SSE topic.
   */
  public async publish<T>(
    slug: string,
    type: RealtimeEventType,
    restaurantId: string,
    payload: T,
    tableNumber?: number
  ): Promise<void> {
    const cleanSlug = slug.toLowerCase().trim();
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const envelope: RealtimeEnvelope<T> = {
      id: eventId,
      type,
      restaurantId,
      restaurantSlug: cleanSlug,
      tableNumber,
      payload,
      timestamp: new Date().toISOString(),
      senderDeviceId: DEVICE_ID,
    };

    // Mark self-processed
    this.markProcessed(eventId);

    // 1. Broadcast locally to same-device tabs
    try {
      const channel = this.getOrCreateBroadcastChannel(cleanSlug);
      channel.postMessage(envelope);
    } catch {
      // Ignore broadcast channel errors
    }

    // 2. Publish to Cloud Relay (ntfy.sh) for cross-device mobile-to-laptop synchronization
    try {
      const topic = this.getTopic(cleanSlug);
      // Fire and forget, don't block user UI
      fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Title': `ENSEMBLE ${type} Table ${tableNumber || ''}`.trim(),
        },
        body: JSON.stringify(envelope),
        keepalive: true,
      }).catch(() => {
        // Fallback or retry if needed
      });
    } catch {
      // Ignore network errors in offline situations
    }
  }

  /**
   * Subscribes to real-time events for a restaurant.
   * Connects both the local BroadcastChannel and the Cloud SSE stream.
   */
  public subscribe(slug: string, callback: RealtimeListener): () => void {
    const cleanSlug = slug.toLowerCase().trim();

    if (!this.listeners.has(cleanSlug)) {
      this.listeners.set(cleanSlug, new Set());
    }
    this.listeners.get(cleanSlug)!.add(callback);

    // Initialize local channel if not active
    this.getOrCreateBroadcastChannel(cleanSlug);

    // Initialize cloud SSE connection if not active
    this.ensureCloudConnection(cleanSlug);

    // Return cleanup function
    return () => {
      const set = this.listeners.get(cleanSlug);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(cleanSlug);
          this.closeConnections(cleanSlug);
        }
      }
    };
  }

  private markProcessed(id: string): boolean {
    if (this.processedEventIds.has(id)) {
      return false; // Already processed
    }
    this.processedEventIds.add(id);
    if (this.processedEventIds.size > this.maxProcessedIds) {
      const first = this.processedEventIds.values().next().value;
      if (first) this.processedEventIds.delete(first);
    }
    return true; // Newly processed
  }

  private dispatch(slug: string, envelope: RealtimeEnvelope) {
    if (!this.markProcessed(envelope.id)) {
      return; // Skip duplicate
    }

    const listeners = this.listeners.get(slug.toLowerCase().trim());
    if (listeners) {
      listeners.forEach((fn) => {
        try {
          fn(envelope);
        } catch (err) {
          console.error('[RealtimeHub] Listener error:', err);
        }
      });
    }
  }

  private getOrCreateBroadcastChannel(slug: string): BroadcastChannel {
    if (this.localChannels.has(slug)) {
      return this.localChannels.get(slug)!;
    }
    const channelName = `ensemble_bc_${slug}`;
    const channel = new BroadcastChannel(channelName);
    channel.onmessage = (event) => {
      if (event.data && event.data.id && event.data.type) {
        this.dispatch(slug, event.data as RealtimeEnvelope);
      }
    };
    this.localChannels.set(slug, channel);
    return channel;
  }

  private ensureCloudConnection(slug: string) {
    if (this.eventSources.has(slug)) {
      return;
    }
    const topic = this.getTopic(slug);
    const sseUrl = `https://ntfy.sh/${topic}/sse`;

    try {
      const es = new EventSource(sseUrl);
      es.onmessage = (e) => {
        try {
          const raw = JSON.parse(e.data);
          if (raw.event === 'message' && raw.message) {
            const envelope = JSON.parse(raw.message) as RealtimeEnvelope;
            if (envelope && envelope.id && envelope.type) {
              this.dispatch(slug, envelope);
            }
          }
        } catch {
          // Ignore non-json messages
        }
      };

      es.onerror = () => {
        // EventSource automatically reconnects with exponential backoff
      };

      this.eventSources.set(slug, es);

      // Replay recent events from the last 15 minutes to catch any scan that occurred before Captain was mounted
      this.catchUpRecentEvents(slug, topic);
    } catch (err) {
      console.warn('[RealtimeHub] Cloud SSE unavailable:', err);
    }
  }

  private async catchUpRecentEvents(slug: string, topic: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=24h`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const raw = JSON.parse(line);
            if (raw.event === 'message' && raw.message) {
              const envelope = JSON.parse(raw.message) as RealtimeEnvelope;
              if (envelope && envelope.id && envelope.type) {
                this.dispatch(slug, envelope);
              }
            }
          } catch {
            // Ignore malformed line
          }
        }
      }
    } catch {
      // Non-critical: catchup failed, live stream continues
    }
  }

  private closeConnections(slug: string) {
    const bc = this.localChannels.get(slug);
    if (bc) {
      bc.close();
      this.localChannels.delete(slug);
    }

    const es = this.eventSources.get(slug);
    if (es) {
      es.close();
      this.eventSources.delete(slug);
    }
  }
}

export const realtimeHub = new RealtimeHub();
