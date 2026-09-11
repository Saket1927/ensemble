import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { MapPin, AlertCircle, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface GeofenceModalProps {
  onDismiss?: () => void;
}

export const GeofenceModal: React.FC<GeofenceModalProps> = ({ onDismiss }) => {
  const {
    activeRestaurant,
    activeTable,
    geofenceStatus,
    setGeofenceStatus,
    requestGeofenceOverride,
  } = useTenant();

  const primaryColor = activeRestaurant.branding.primaryColor;
  const secondaryColor = activeRestaurant.branding.secondaryColor;

  if (geofenceStatus === 'passed' || geofenceStatus === 'overridden') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
        <div className="w-16 h-16 rounded-full bg-amber-50 mx-auto flex items-center justify-center border border-amber-200">
          <ShieldAlert className="w-8 h-8 text-amber-600 animate-pulse" />
        </div>

        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Section 5.1: GPS Fraud Check
          </span>
          <h3 className="text-xl font-serif font-bold text-slate-900 mt-2">
            Location Verification
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            To prevent remote QR fraud, dining tables must be accessed within <span className="font-bold text-slate-800">150 meters</span> of {activeRestaurant.name}.
          </p>
        </div>

        {geofenceStatus === 'requested_override' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-2 text-left">
            <div className="flex items-center space-x-2 font-bold text-amber-900">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Override Requested</span>
            </div>
            <p className="text-[11px] text-amber-700 leading-snug">
              An alert has been sent to the Captain Interface for Table {activeTable}. A staff member will verify your presence and approve access shortly.
            </p>
            <button
              onClick={() => setGeofenceStatus('overridden')}
              className="w-full text-center text-[10px] text-amber-800 underline font-semibold mt-1"
            >
              [Simulator: Simulate Captain Approval]
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Registered Coordinates:</span>
                <span className="font-mono text-slate-700 font-bold">19.2312° N, 72.9864° E</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Permitted Radius:</span>
                <span className="font-bold text-slate-700">150 meters</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => requestGeofenceOverride(activeTable)}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2"
                style={{ backgroundColor: primaryColor }}
              >
                <MapPin className="w-4 h-4" />
                <span>Ask Captain to Allow (Manual Override)</span>
              </button>

              <button
                onClick={() => setGeofenceStatus('passed')}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Simulate "GPS Inside Premises (15m)"
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
