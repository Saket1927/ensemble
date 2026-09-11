import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { MenuExcelParser, ParseResult, ExcelConflictItem, ExcelMenuRow } from '../../services/excel/MenuExcelParser';
import {
  FileSpreadsheet,
  Upload,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ExcelMenuUploadModalProps {
  onClose: () => void;
}

const SAMPLE_EXCEL_CSV = `Dish Name,Category,Price,Description,Veg/Non-Veg,Image URL
Murg Tikka Angara,Starters,480,Spicy charcoal-roasted chicken thigh chunks in curd marinade,Non-Veg,https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80
Paneer Lababdar,Mains,420,Cottage cheese simmered in rich creamy tomato and melon seed gravy,Veg,https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80
Peshawari Naan,Breads,110,Traditional clay oven flatbread stuffed with nuts and raisins,Veg,https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80
Broken Sample Dish,Starters,-50,Invalid test price row to show error reporting,Veg,
Shahi Tukda Awadhi,Desserts,260,Fried brioche soaked in saffron cardamom rabdi,Veg,https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80`;

export const ExcelMenuUploadModal: React.FC<ExcelMenuUploadModalProps> = ({ onClose }) => {
  const { activeRestaurant, activeMenuItems, batchImportMenuItems } = useTenant();

  const [rawText, setRawText] = useState(SAMPLE_EXCEL_CSV);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [conflictResolutions, setConflictResolutions] = useState<Record<string, 'keep_existing' | 'overwrite' | 'skip'>>({});
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const handleParse = () => {
    const result = MenuExcelParser.parseMenuData(rawText, activeMenuItems);
    setParseResult(result);

    // Default all conflicts to 'keep_existing'
    const initialResolutions: Record<string, 'keep_existing' | 'overwrite' | 'skip'> = {};
    result.conflicts.forEach((c) => {
      initialResolutions[c.id] = 'keep_existing';
    });
    setConflictResolutions(initialResolutions);
  };

  const handleResolutionChange = (conflictId: string, resolution: 'keep_existing' | 'overwrite' | 'skip') => {
    setConflictResolutions((prev) => ({
      ...prev,
      [conflictId]: resolution,
    }));
  };

  const handleExecuteImport = () => {
    if (!parseResult) return;

    // Filter valid rows: remove conflicting ones that are skipped or kept existing
    const itemsToImport: any[] = [];

    parseResult.validRows.forEach((row) => {
      const conflict = parseResult.conflicts.find((c) => c.importedRow.name === row.name);
      if (conflict) {
        const res = conflictResolutions[conflict.id];
        if (res === 'overwrite') {
          itemsToImport.push({
            restaurantId: activeRestaurant.id,
            name: row.name,
            category: row.category,
            price: row.price,
            description: row.description,
            imageUrl: row.imageUrl,
            isVeg: row.isVeg,
            isAvailable: true,
            rating: 4.8,
          });
        }
      } else {
        itemsToImport.push({
          restaurantId: activeRestaurant.id,
          name: row.name,
          category: row.category,
          price: row.price,
          description: row.description,
          imageUrl: row.imageUrl,
          isVeg: row.isVeg,
          isAvailable: true,
          rating: 4.8,
        });
      }
    });

    batchImportMenuItems(itemsToImport, 'overwrite');
    setImportSummary(
      `Successfully ingested ${itemsToImport.length} menu items into ${activeRestaurant.name}! Invalid rows were isolated into the error report.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Excel / CSV Menu Ingestion & Conflict Resolver
              </h3>
              <p className="text-xs text-slate-500">
                Section 6: Imports valid rows, reports errors, prompts individually on duplicates.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {importSummary ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-serif font-bold text-lg text-slate-900">Ingestion Complete</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {importSummary}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow"
            >
              Done / Return to Menu
            </button>
          </div>
        ) : !parseResult ? (
          <div className="space-y-3 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">
                Spreadsheet Data (CSV / Tab-Delimited)
              </label>
              <button
                onClick={() => setRawText(SAMPLE_EXCEL_CSV)}
                className="text-[11px] text-emerald-700 hover:underline font-semibold"
              >
                Load Sample Restaurant CSV
              </button>
            </div>

            <textarea
              rows={9}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
              placeholder="Paste columns: Dish Name, Category, Price, Description, Veg/Non-Veg, Image URL"
            />

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800 flex items-center space-x-1">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Expected Columns:</span>
              </p>
              <p>1. Dish Name (Required) | 2. Category | 3. Price (Numeric) | 4. Description | 5. Veg/Non-Veg | 6. Image URL (Optional)</p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleParse}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Validate & Detect Conflicts</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Summary Counters */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <span className="text-xl font-bold text-emerald-700 block">
                  {parseResult.validRows.length}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Valid Rows</span>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <span className="text-xl font-bold text-amber-700 block">
                  {parseResult.conflicts.length}
                </span>
                <span className="text-[10px] font-bold text-amber-800 uppercase">Duplicate Conflicts</span>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                <span className="text-xl font-bold text-rose-700 block">
                  {parseResult.invalidRows.length}
                </span>
                <span className="text-[10px] font-bold text-rose-800 uppercase">Invalid / Errors</span>
              </div>
            </div>

            {/* Error Report (Section 6: generate error report for invalid rows, don't reject whole file) */}
            {parseResult.invalidRows.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-2">
                <h4 className="text-xs font-bold text-rose-900 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Isolated Error Report ({parseResult.invalidRows.length} invalid rows)</span>
                </h4>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {parseResult.invalidRows.map((err) => (
                    <div
                      key={err.rowNumber}
                      className="text-[11px] text-rose-800 bg-white/80 p-1.5 rounded border border-rose-200 flex justify-between"
                    >
                      <span>
                        Row {err.rowNumber}: <strong>{err.name}</strong>
                      </span>
                      <span className="text-rose-600 italic">{err.errorReason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conflict Resolver (Section 6: prompt restaurant to confirm each conflict individually) */}
            {parseResult.conflicts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-950 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Per-Item Conflict Resolution Required</span>
                  </h4>
                  <span className="text-[10px] text-amber-800 font-semibold">No Silent Overwrites</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {parseResult.conflicts.map((conflict) => (
                    <div
                      key={conflict.id}
                      className="bg-white p-3 rounded-xl border border-amber-200 text-xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{conflict.importedRow.name}</span>
                        <span className="text-[10px] text-slate-500">
                          Existing: ₹{conflict.existingItem.price} | Excel: ₹{conflict.importedRow.price}
                        </span>
                      </div>

                      {/* Individual radio choice */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleResolutionChange(conflict.id, 'keep_existing')}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            conflictResolutions[conflict.id] === 'keep_existing'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Keep Existing
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolutionChange(conflict.id, 'overwrite')}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            conflictResolutions[conflict.id] === 'overwrite'
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Overwrite
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolutionChange(conflict.id, 'skip')}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            conflictResolutions[conflict.id] === 'skip'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setParseResult(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
              >
                Back / Edit Data
              </button>
              <button
                onClick={handleExecuteImport}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow"
              >
                Confirm Ingestion ({parseResult.validRows.length} Rows)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
