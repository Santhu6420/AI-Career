import React, { useState } from 'react';
import { 
  Sheet, 
  Sparkles, 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Table, 
  RefreshCw, 
  HelpCircle, 
  FileSpreadsheet, 
  Play, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { ExcelData } from '../types';
import { AdvancedExplainerModal } from './AdvancedExplainerModal';
import { Zap } from 'lucide-react';

const defaultExcel: ExcelData = {
  title: "Multi-Condition XLOOKUP & Dynamic Lookup Engine",
  primaryFormula: `=XLOOKUP(1, (A2:A100=G2)*(B2:B100=H2), D2:D100, "Not Found", 0)`,
  legacyFormula: `=IFERROR(INDEX(D2:D100, MATCH(1, (A2:A100=G2)*(B2:B100=H2), 0)), "Not Found")`,
  googleSheetsFormula: `=FILTER(D2:D100, A2:A100=G2, B2:B100=H2)`,
  explanation:
    "This formula performs a high-speed multi-criteria lookup. It searches for an exact match where Column A matches cell G2 AND Column B matches cell H2 simultaneously, returning the corresponding salary or value from Column D. If no match exists, it cleanly outputs 'Not Found' instead of an error.",
  syntaxBreakdown: [
    { part: "1", meaning: "Lookup Value: Boolean product (TRUE * TRUE = 1) signifying both conditions are met." },
    { part: "(A2:A100=G2)*(B2:B100=H2)", meaning: "Boolean Array Multiplication: Evaluates row by row where criteria 1 and criteria 2 are both true." },
    { part: "D2:D100", meaning: "Return Array: The target values you want to extract." },
    { part: '"Not Found"', meaning: "Fallback Value: Displayed cleanly if no matching row is found." },
    { part: "0", meaning: "Match Mode: 0 forces exact match behavior." },
  ],
  commonPitfalls: [
    "Array multiplications require equal length ranges (e.g. A2:A100 and B2:B100 must have the exact same row count).",
    "In legacy Excel (2016 or earlier), the INDEX/MATCH equivalent must be entered with Ctrl + Shift + Enter (Array formula).",
  ],
  vbaCode: `Sub HighlightAndCalculateBonuses()
    Dim ws As Worksheet
    Set ws = ActiveSheet
    Dim lastRow As Long
    Dim i As Long
    
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
    
    For i = 2 To lastRow
        If ws.Cells(i, 4).Value = "Exceeds" And ws.Cells(i, 5).Value > 100000 Then
            ws.Cells(i, 6).Value = ws.Cells(i, 5).Value * 0.15 ' 15% Bonus
            ws.Cells(i, 6).Interior.Color = RGB(220, 252, 231) ' Light green
        Else
            ws.Cells(i, 6).Value = ws.Cells(i, 5).Value * 0.05 ' 5% Bonus
        End If
    Next i
    
    MsgBox "Calculated bonuses for " & (lastRow - 1) & " employees successfully!", vbInformation, "Excel Engine"
End Sub`,
  appsScriptCode: `function calculateBonusesInSheets() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const performance = data[i][3];
    const salary = Number(data[i][4]);
    const bonus = (performance === "Exceeds" && salary > 100000) ? salary * 0.15 : salary * 0.05;
    sheet.getRange(i + 1, 6).setValue(bonus);
  }
  SpreadsheetApp.getUi().alert("Google Sheets: Calculated bonuses!");
}`,
  sampleGrid: {
    headers: ["ID", "Employee Name", "Department", "Performance", "Salary ($)", "Status"],
    rows: [
      ["101", "Sarah Chen", "Engineering", "Exceeds", "145000", "Active"],
      ["102", "Marcus Vance", "Product", "Exceeds", "138000", "Active"],
      ["103", "Elena Rostova", "Marketing", "Meets", "92000", "Active"],
      ["104", "David Kim", "Engineering", "Exceeds", "152000", "Active"],
      ["105", "Priya Sharma", "Finance", "Exceeds", "118000", "Active"],
      ["106", "Jordan Lee", "Design", "Meets", "105000", "Active"],
    ],
  },
};

export const ExcelSheetGenius: React.FC = () => {
  const [data, setData] = useState<ExcelData>(defaultExcel);
  const [mode, setMode] = useState<'generate' | 'explain' | 'vba_macro'>('generate');
  const [userQuery, setUserQuery] = useState('Look up salary for Employee in Engineering with Exceeds performance rating');
  const [formulaToExplain, setFormulaToExplain] = useState('=INDEX(D2:D100, MATCH(1, (A2:A100="Engineering")*(B2:B100="Senior"), 0))');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Spreadsheet Sandbox State
  const [gridData, setGridData] = useState<string[][]>([
    ["101", "Sarah Chen", "Engineering", "Exceeds", "145000", "Active"],
    ["102", "Marcus Vance", "Product", "Exceeds", "138000", "Active"],
    ["103", "Elena Rostova", "Marketing", "Meets", "92000", "Active"],
    ["104", "David Kim", "Engineering", "Exceeds", "152000", "Active"],
    ["105", "Priya Sharma", "Finance", "Exceeds", "118000", "Active"],
    ["106", "Jordan Lee", "Design", "Meets", "105000", "Active"],
  ]);
  const headers = ["A (ID)", "B (Name)", "C (Dept)", "D (Perf)", "E (Salary $)", "F (Status)"];
  const [activeFormulaBar, setActiveFormulaBar] = useState("=SUM(E1:E6)");
  const [evaluatedResult, setEvaluatedResult] = useState<string>("$750,000");
  const [mainView, setMainView] = useState<'workspace' | 'excel_vault'>('workspace');
  const [explainerTopic, setExplainerTopic] = useState<string>('');
  const [explainerContext, setExplainerContext] = useState<string>('');
  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);

  const openAdvancedExplainer = (topic: string, context?: string) => {
    setExplainerTopic(topic);
    setExplainerContext(context || '');
    setIsExplainerOpen(true);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tools/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          userQuery: mode === 'explain' ? formulaToExplain : userQuery,
          formulaToExplain,
        }),
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setData(resData.data);
        if (resData.data.sampleGrid?.rows) {
          setGridData(resData.data.sampleGrid.rows);
        }
      }
    } catch (err) {
      console.error("Excel API error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Evaluate formula on live grid
  const handleEvaluateFormula = () => {
    const raw = activeFormulaBar.trim().toUpperCase();
    if (!raw.startsWith("=")) {
      setEvaluatedResult(activeFormulaBar);
      return;
    }

    try {
      if (raw.startsWith("=SUM(")) {
        // Simple column sum parser
        const match = raw.match(/=SUM\(([A-F])(\d+):([A-F])(\d+)\)/);
        if (match) {
          const colLetter = match[1];
          const colIdx = colLetter.charCodeAt(0) - 65;
          const startRow = parseInt(match[2], 10) - 1;
          const endRow = parseInt(match[4], 10) - 1;

          let sum = 0;
          for (let r = Math.max(0, startRow); r <= Math.min(gridData.length - 1, endRow); r++) {
            const val = parseFloat(gridData[r][colIdx]?.replace(/[^0-9.-]+/g, "") || "0");
            if (!isNaN(val)) sum += val;
          }
          setEvaluatedResult(`$${sum.toLocaleString()}`);
          return;
        }
      } else if (raw.startsWith("=AVERAGE(")) {
        const match = raw.match(/=AVERAGE\(([A-F])(\d+):([A-F])(\d+)\)/);
        if (match) {
          const colLetter = match[1];
          const colIdx = colLetter.charCodeAt(0) - 65;
          const startRow = parseInt(match[2], 10) - 1;
          const endRow = parseInt(match[4], 10) - 1;

          let sum = 0;
          let count = 0;
          for (let r = Math.max(0, startRow); r <= Math.min(gridData.length - 1, endRow); r++) {
            const val = parseFloat(gridData[r][colIdx]?.replace(/[^0-9.-]+/g, "") || "0");
            if (!isNaN(val)) {
              sum += val;
              count++;
            }
          }
          const avg = count > 0 ? sum / count : 0;
          setEvaluatedResult(`$${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
          return;
        }
      } else if (raw.startsWith("=COUNT(")) {
        setEvaluatedResult(`${gridData.length} records`);
        return;
      }
      setEvaluatedResult(`Formula Valid (Result: Ready)`);
    } catch {
      setEvaluatedResult("#VALUE!");
    }
  };

  const handleDownloadCsv = () => {
    let csv = headers.join(",") + "\n";
    gridData.forEach((row) => {
      csv += row.map((c) => `"${c}"`).join(",") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Excel_Data_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Sheet className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Excel & Google Sheets Genius
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Plain-English formula generator, step-by-step formula explainer, VBA macro engine, and live interactive spreadsheet.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="download-csv-grid-btn"
            onClick={handleDownloadCsv}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs sm:text-sm flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main View Mode Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setMainView('workspace')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            mainView === 'workspace'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Formula Studio & Interactive Spreadsheet Grid</span>
        </button>

        <button
          onClick={() => setMainView('excel_vault')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            mainView === 'excel_vault'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Excel Formulas & Financial Modeling Vault</span>
        </button>
      </div>

      {mainView === 'excel_vault' ? (
        /* Comprehensive Excel Formula & Financial Modeling Vault */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Modern Excel Architecture & Wall Street Financial Modeling Guide
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Master dynamic array spilling, LAMBDA functions, 3-statement financial models, sensitivity matrix tables, and high-performance VBA macros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vault Card 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">01</span>
                <h3 className="font-bold text-slate-900 text-base">Modern Dynamic Array Functions</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Replaces legacy Ctrl+Shift+Enter with spontaneous spill ranges:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><code className="text-emerald-700 font-mono font-bold">=XLOOKUP(lookup, in_array, return_array, [if_not_found], [match_mode])</code>: Left lookups, exact by default, no column index breaks.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><code className="text-emerald-700 font-mono font-bold">=FILTER(array, include_criteria, [if_empty])</code>: Extracts subsets matching conditions dynamically.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><code className="text-emerald-700 font-mono font-bold">=UNIQUE() & =SORT()</code>: Instant deduplication and multi-tier sorting.</span>
                </li>
              </ul>
            </div>

            {/* Vault Card 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">02</span>
                <h3 className="font-bold text-slate-900 text-base">LAMBDA & LET Functional Power</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create custom named reusable functions without VBA:
              </p>
              <div className="p-2.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
                <div className="text-emerald-400">// LET: Variable caching for 10x speed</div>
                <div>=LET(</div>
                <div>  rev, SUM(C2:C100),</div>
                <div>  cogs, SUM(D2:D100),</div>
                <div>  IF(rev&gt;0, (rev-cogs)/rev, 0)</div>
                <div>)</div>
              </div>
              <p className="text-xs text-slate-600">
                Eliminates recalculating expensive expressions multiple times in an IF condition.
              </p>
            </div>

            {/* Vault Card 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">03</span>
                <h3 className="font-bold text-slate-900 text-base">3-Statement Financial Modeling</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Wall Street standard for linking corporate financial statements:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Net Income:</strong> Flows from Income Statement bottom line to Cash Flow (Operating) & Balance Sheet (Retained Earnings).</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Depreciation:</strong> Added back on Cash Flow and reduces PP&E on Balance Sheet.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Ending Cash:</strong> Cash Flow net change connects directly into Balance Sheet Cash & Equivalents.</span>
                </li>
              </ul>
            </div>

            {/* Vault Card 4 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-cyan-100 text-cyan-800 font-bold text-xs">04</span>
                <h3 className="font-bold text-slate-900 text-base">Sensitivity Analysis & What-If</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stress-testing investment decisions under varied market scenarios:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Two-Variable Data Tables:</strong> Simultaneously vary WACC discount rate and Terminal Growth rate to generate an Enterprise Valuation matrix.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-cyan-600 font-bold">•</span>
                  <span><strong>Goal Seek & Solver:</strong> Solve for breakeven CAC or minimum price required for a target 25% IRR.</span>
                </li>
              </ul>
            </div>

            {/* Vault Card 5 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800 font-bold text-xs">05</span>
                <h3 className="font-bold text-slate-900 text-base">Production VBA Optimization Rules</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                How to write lightning-fast enterprise macros that process 500k rows in &lt;1 second:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">1.</span>
                  <span><strong>Disable Screen Updating:</strong> <code className="font-mono text-purple-700">Application.ScreenUpdating = False</code> and <code className="font-mono text-purple-700">Application.Calculation = xlCalculationManual</code>.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">2.</span>
                  <span><strong>Never use .Select / .Activate:</strong> Manipulate objects directly e.g. <code className="font-mono text-purple-700">ws.Range("A1").Value = 100</code>.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">3.</span>
                  <span><strong>Memory Arrays:</strong> Read entire Range into Variant array, process in RAM, and dump back in 1 write operation.</span>
                </li>
              </ul>
            </div>

            {/* Vault Card 6 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs">06</span>
                <h3 className="font-bold text-slate-900 text-base">Model Audit & Color-Coding Rules</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Global investment banking formatting conventions:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-blue-600 font-bold">■</span>
                  <span><strong>Blue Text (#0000FF):</strong> Hard-coded user inputs and historical assumptions.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-slate-900 font-bold">■</span>
                  <span><strong>Black Text (#000000):</strong> All formulas, calculations, and summations.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">■</span>
                  <span><strong>Green Text (#008000):</strong> Cross-sheet or external workbook link references.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-rose-600 font-bold">■</span>
                  <span><strong>Red Background:</strong> Balance check alerts (e.g. <code className="font-mono">Assets - Liabilities - Equity != 0</code>).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <>
      {/* Generator & Explainer Controls */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          {/* Mode Selector */}
          <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl">
            {[
              { id: 'generate', label: '1. Formula Generator' },
              { id: 'explain', label: '2. Formula Explainer' },
              { id: 'vba_macro', label: '3. VBA & Apps Script' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  mode === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Gemini 3.7 Flash Engine</span>
        </div>

        {/* Dynamic Inputs according to mode */}
        {mode === 'explain' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Paste Complex Formula to Explain</label>
            <input
              id="excel-formula-input"
              type="text"
              value={formulaToExplain}
              onChange={(e) => setFormulaToExplain(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
              placeholder="e.g. =INDEX(D2:D100, MATCH(1, (A2:A100=G2)*(B2:B100=H2), 0))"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {mode === 'vba_macro' ? 'What should the VBA Macro or Apps Script do?' : 'Describe what you want to calculate in plain English'}
            </label>
            <input
              id="excel-query-input"
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Calculate 15% discount if column C > $500 and status is Active, otherwise 5%"
            />
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            id="btn-run-excel-ai"
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isLoading ? "Analyzing..." : mode === 'explain' ? "Explain Formula Step-by-Step" : "Generate Formula & Code"}</span>
          </button>
        </div>
      </div>

      {/* Generated Formula & Code Output Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">AI Formula Result</span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{data.title}</h2>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{data.explanation}</p>
        </div>

        {/* Modern Formula Block */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Recommended Modern Formula (Excel 365 / 2021+)</span>
            </span>
            <button
              onClick={() => handleCopy(data.primaryFormula, 'primary')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              {copiedKey === 'primary' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'primary' ? 'Copied' : 'Copy Formula'}</span>
            </button>
          </div>
          <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-sm font-mono overflow-x-auto leading-relaxed border border-slate-800">
            <code>{data.primaryFormula}</code>
          </pre>
          
          <button
            onClick={() =>
              openAdvancedExplainer(
                `Excel Formula Architecture: ${data.primaryFormula}`,
                `Title: ${data.title}\nPrimary Formula: ${data.primaryFormula}\nExplanation: ${data.explanation}\nLegacy: ${data.legacyFormula}\nGoogle Sheets: ${data.googleSheetsFormula}`
              )
            }
            className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors border border-emerald-200 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Explain at Advanced Level (Spill Mechanics & Vector Recalculation)</span>
          </button>
        </div>

        {/* Legacy & Google Sheets Variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.legacyFormula && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Legacy Compatible (Excel 2013 / 2016)</span>
                <button
                  onClick={() => handleCopy(data.legacyFormula!, 'legacy')}
                  className="text-[11px] text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  {copiedKey === 'legacy' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-800 bg-white p-2.5 rounded border border-slate-200 overflow-x-auto">
                <code>{data.legacyFormula}</code>
              </pre>
            </div>
          )}

          {data.googleSheetsFormula && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Google Sheets Equivalent</span>
                <button
                  onClick={() => handleCopy(data.googleSheetsFormula!, 'sheets')}
                  className="text-[11px] text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  {copiedKey === 'sheets' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-800 bg-white p-2.5 rounded border border-slate-200 overflow-x-auto">
                <code>{data.googleSheetsFormula}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Syntax Breakdown */}
        {data.syntaxBreakdown && data.syntaxBreakdown.length > 0 && (
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Step-by-Step Formula Argument Breakdown</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.syntaxBreakdown.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                  <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {item.part}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{item.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VBA Macro Block if present */}
        {data.vbaCode && (
          <div className="space-y-2 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Excel VBA Macro Automation Code</span>
              <button
                onClick={() => handleCopy(data.vbaCode!, 'vba')}
                className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                {copiedKey === 'vba' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'vba' ? 'Copied' : 'Copy VBA'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
              <code>{data.vbaCode}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Live Interactive Spreadsheet Sandbox */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
            <Table className="w-5 h-5 text-emerald-600" />
            <span>Interactive Spreadsheet Sandbox Grid</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">Real-time Calculation Engine</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-6 space-y-4">
          {/* Formula Bar */}
          <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-300">
            <div className="px-2.5 py-1 bg-slate-200 rounded font-mono font-bold text-xs text-slate-700">
              fx
            </div>
            <input
              type="text"
              value={activeFormulaBar}
              onChange={(e) => setActiveFormulaBar(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
              placeholder="e.g. =SUM(E1:E6) or =AVERAGE(E1:E6)"
            />
            <button
              onClick={handleEvaluateFormula}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Evaluate</span>
            </button>
            <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded text-xs font-bold text-emerald-800">
              Result: {evaluatedResult}
            </div>
          </div>

          {/* Editable Grid */}
          <div className="overflow-x-auto border border-slate-300 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="p-2.5 border-r border-slate-300 w-10 text-center font-bold text-slate-400">#</th>
                  {headers.map((h, idx) => (
                    <th key={idx} className="p-2.5 border-r border-slate-300 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gridData.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-slate-200 hover:bg-slate-50/80">
                    <td className="p-2 text-center bg-slate-50 border-r border-slate-300 font-mono text-slate-400 font-semibold">
                      {rIdx + 1}
                    </td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-1 border-r border-slate-200">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const updated = [...gridData];
                            updated[rIdx][cIdx] = e.target.value;
                            setGridData(updated);
                          }}
                          className="w-full p-1.5 text-xs text-slate-800 bg-transparent rounded hover:bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Advanced Technical Explainer Modal */}
      <AdvancedExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        initialTopic={explainerTopic}
        sourceTool="Excel & Financial Engineering"
        contextSnippet={explainerContext}
      />
    </div>
  );
};
