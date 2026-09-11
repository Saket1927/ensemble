import { MenuItem } from '../../types/tenant';

export interface ExcelMenuRow {
  rowNumber: number;
  name: string;
  category: string;
  price: number;
  description: string;
  isVeg: boolean;
  imageUrl?: string;
  isValid: boolean;
  errorReason?: string;
}

export interface ExcelConflictItem {
  id: string;
  importedRow: ExcelMenuRow;
  existingItem: MenuItem;
  resolution: 'keep_existing' | 'overwrite' | 'skip';
}

export interface ParseResult {
  validRows: ExcelMenuRow[];
  invalidRows: ExcelMenuRow[];
  conflicts: ExcelConflictItem[];
}

export class MenuExcelParser {
  /**
   * Parse raw text/CSV or simulated spreadsheet data with conflict detection
   */
  static parseMenuData(rawContent: string, currentItems: MenuItem[]): ParseResult {
    const lines = rawContent.split('\n').map((l) => l.trim()).filter(Boolean);
    const validRows: ExcelMenuRow[] = [];
    const invalidRows: ExcelMenuRow[] = [];
    const conflicts: ExcelConflictItem[] = [];

    // Check if header exists
    let startIndex = 0;
    if (lines[0] && (lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('dish'))) {
      startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Split by comma or tab
      const cols = line.includes('\t') ? line.split('\t') : line.split(',');
      const rowNumber = i + 1;

      const name = (cols[0] || '').trim();
      const category = (cols[1] || '').trim();
      const priceRaw = (cols[2] || '').trim().replace(/[^0-9.]/g, '');
      const description = (cols[3] || '').trim();
      const vegRaw = (cols[4] || '').trim().toLowerCase();
      const imageUrl = (cols[5] || '').trim();

      const price = parseFloat(priceRaw);
      const isVeg = vegRaw === 'veg' || vegRaw === 'true' || vegRaw === '1' || vegRaw === 'yes';

      // Validation
      if (!name) {
        invalidRows.push({
          rowNumber,
          name: name || '[Empty]',
          category,
          price: isNaN(price) ? 0 : price,
          description,
          isVeg,
          isValid: false,
          errorReason: 'Missing mandatory dish name',
        });
        continue;
      }

      if (isNaN(price) || price <= 0) {
        invalidRows.push({
          rowNumber,
          name,
          category,
          price: 0,
          description,
          isVeg,
          isValid: false,
          errorReason: 'Invalid price amount (must be positive number)',
        });
        continue;
      }

      const validRow: ExcelMenuRow = {
        rowNumber,
        name,
        category: category || 'Mains',
        price,
        description: description || `Delicious freshly prepared ${name}.`,
        isVeg,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        isValid: true,
      };

      // Conflict detection against existing items in same category
      const existing = currentItems.find(
        (item) =>
          item.name.toLowerCase() === name.toLowerCase() &&
          item.category.toLowerCase() === validRow.category.toLowerCase()
      );

      if (existing) {
        conflicts.push({
          id: `conflict_${rowNumber}`,
          importedRow: validRow,
          existingItem: existing,
          resolution: 'keep_existing',
        });
      } else {
        validRows.push(validRow);
      }
    }

    return { validRows, invalidRows, conflicts };
  }
}
