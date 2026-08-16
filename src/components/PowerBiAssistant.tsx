import React, { useState } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Database, 
  Code2, 
  Copy, 
  Check, 
  Layers, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle,
  Download,
  Table,
  Cpu
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';
import { PowerBIData, DaxMeasure, DataModelTable, DashboardWidget } from '../types';
import { AdvancedExplainerModal } from './AdvancedExplainerModal';
import { Zap } from 'lucide-react';

const defaultPowerBI: PowerBIData = {
  dashboardTitle: "SaaS Subscription & Customer Analytics Architecture",
  summary: "Comprehensive Power BI data model engineered for high-performance reporting. Includes star-schema fact/dimension modeling, time intelligence DAX measures, and Power Query ETL transformations.",
  daxMeasures: [
    {
      measureName: "Total Revenue",
      category: "Core Metrics",
      formula: "Total Revenue = SUM(FactSales[NetRevenue])",
      explanation: "Calculates the base sum of all net revenue across active filter context.",
      returnType: "Currency ($)",
      performanceTip: "Store FactSales[NetRevenue] as Fixed Decimal Currency in Power BI to minimize memory footprint and optimize VertiPaq compression.",
    },
    {
      measureName: "YoY Revenue Growth %",
      category: "Time Intelligence",
      formula: `YoY Revenue Growth % = 
VAR CurrentRev = [Total Revenue]
VAR PriorYearRev = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(DimDate[Date]))
RETURN
    DIVIDE(CurrentRev - PriorYearRev, PriorYearRev, 0)`,
      explanation: "Computes Year-Over-Year percentage growth using SAMEPERIODLASTYEAR, safely handling zero/null denominators with DIVIDE.",
      returnType: "Percentage (0.0%)",
      performanceTip: "Always mark DimDate as an official Date Table in Power BI for optimal time intelligence calculation.",
    },
    {
      measureName: "Customer Lifetime Value (LTV)",
      category: "Customer Analytics",
      formula: `Customer LTV = 
VAR TotalCustRevenue = [Total Revenue]
VAR DistinctCustomers = DISTINCTCOUNT(FactSales[CustomerID])
VAR AvgRevenuePerCust = DIVIDE(TotalCustRevenue, DistinctCustomers, 0)
VAR AvgLifespanYears = 3.2
RETURN
    AvgRevenuePerCust * AvgLifespanYears`,
      explanation: "Estimates long-term customer worth by multiplying average customer historical spend by retention duration.",
      returnType: "Currency ($)",
      performanceTip: "Use DISTINCTCOUNT over COUNTROWS when calculating unique entity counts across transactional tables.",
    },
    {
      measureName: "Rolling 90-Day Moving Average",
      category: "Trend Analysis",
      formula: `Rolling 90-Day Avg = 
CALCULATE(
    AVERAGEX(
        DATESINPERIOD(DimDate[Date], MAX(DimDate[Date]), -90, DAY),
        [Total Revenue]
    )
)`,
      explanation: "Smooths short-term fluctuations by averaging daily sales over the trailing 90-day window.",
      returnType: "Currency ($)",
      performanceTip: "DATESINPERIOD leverages the clustered columnstore index on DimDate for sub-second query speeds.",
    },
  ],
  powerQueryMCode: [
    {
      tableName: "FactSales_Transform",
      description: "Cleans dirty timestamps, filters out test transactions, and types decimal columns.",
      mCode: `let
    Source = Csv.Document(File.Contents("sales_data.csv"),[Delimiter=",", Columns=8, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{{"OrderID", type text}, {"OrderDate", type date}, {"NetRevenue", Currency.Type}, {"Quantity", Int64.Type}}),
    #"Filtered Test Orders" = Table.SelectRows(#"Changed Type", each not Text.StartsWith([OrderID], "TEST_")),
    #"Added Net Margin" = Table.AddColumn(#"Filtered Test Orders", "GrossProfit", each [NetRevenue] * 0.42, Currency.Type)
in
    #"Added Net Margin"`,
    },
  ],
  dataModel: {
    tables: [
      {
        name: "FactSales",
        type: "Fact Table",
        columns: ["SalesKey", "OrderDate", "CustomerID", "ProductID", "StoreLocationID", "Quantity", "NetRevenue", "DiscountAmount"],
      },
      {
        name: "DimCustomer",
        type: "Dimension Table",
        columns: ["CustomerID", "CustomerName", "Segment", "Region", "FirstPurchaseDate", "LoyaltyTier"],
      },
      {
        name: "DimProduct",
        type: "Dimension Table",
        columns: ["ProductID", "ProductName", "Category", "SubCategory", "UnitCost", "UnitPrice"],
      },
      {
        name: "DimDate",
        type: "Dimension Table (Date)",
        columns: ["Date", "Year", "Quarter", "MonthName", "MonthNumber", "DayOfWeek", "IsWeekend", "FiscalPeriod"],
      },
    ],
    relationships: [
      {
        fromTable: "DimCustomer",
        fromColumn: "CustomerID",
        toTable: "FactSales",
        toColumn: "CustomerID",
        cardinality: "1 to Many (1:*)",
        crossFilterDirection: "Single",
      },
      {
        fromTable: "DimProduct",
        fromColumn: "ProductID",
        toTable: "FactSales",
        toColumn: "ProductID",
        cardinality: "1 to Many (1:*)",
        crossFilterDirection: "Single",
      },
      {
        fromTable: "DimDate",
        fromColumn: "Date",
        toTable: "FactSales",
        toColumn: "OrderDate",
        cardinality: "1 to Many (1:*)",
        crossFilterDirection: "Single",
      },
    ],
  },
  dashboardWidgets: [
    {
      title: "Total YTD Revenue",
      visualType: "kpi_card",
      primaryValue: "$4.82M",
      subtitle: "vs Target ($4.50M)",
      trend: "+14.2% YoY",
      trendDirection: "up",
      chartData: [
        { name: "Q1", value: 980000, target: 950000 },
        { name: "Q2", value: 1240000, target: 1100000 },
        { name: "Q3", value: 1350000, target: 1200000 },
        { name: "Q4", value: 1250000, target: 1250000 },
      ],
    },
    {
      title: "Active Customers",
      visualType: "kpi_card",
      primaryValue: "28,450",
      subtitle: "94.2% Retention",
      trend: "+8.5% MoM",
      trendDirection: "up",
      chartData: [
        { name: "Jan", value: 24000 },
        { name: "Feb", value: 25200 },
        { name: "Mar", value: 26100 },
        { name: "Apr", value: 27400 },
        { name: "May", value: 28450 },
      ],
    },
    {
      title: "Monthly Revenue & Target Trend",
      visualType: "line_chart",
      primaryValue: "$412K / mo",
      subtitle: "Last 6 Months Trend",
      trend: "Strong Upward Momentum",
      trendDirection: "up",
      chartData: [
        { name: "Jan", value: 320000, target: 300000 },
        { name: "Feb", value: 345000, target: 310000 },
        { name: "Mar", value: 380000, target: 330000 },
        { name: "Apr", value: 395000, target: 360000 },
        { name: "May", value: 420000, target: 390000 },
        { name: "Jun", value: 450000, target: 410000 },
      ],
    },
    {
      title: "Revenue by Product Tier",
      visualType: "bar_chart",
      primaryValue: "Enterprise Software (44%)",
      subtitle: "Top Category",
      trend: "High Margin",
      trendDirection: "up",
      chartData: [
        { name: "Enterprise", value: 2120000 },
        { name: "Pro SaaS", value: 1450000 },
        { name: "Starter", value: 780000 },
        { name: "Add-ons", value: 470000 },
      ],
    },
  ],
};

export const PowerBiAssistant: React.FC = () => {
  const [data, setData] = useState<PowerBIData>(defaultPowerBI);
  const [domain, setDomain] = useState("SaaS Subscription & Customer Analytics");
  const [businessGoal, setBusinessGoal] = useState("Optimize customer retention, track MRR growth, and visualize cohort churn");
  const [requestedMetric, setRequestedMetric] = useState("YoY Growth, MoM Churn Rate, Customer Lifetime Value (LTV), Rolling 90-Day Revenue");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<'model_view' | 'dax_vault'>('model_view');
  const [explainerTopic, setExplainerTopic] = useState<string>('');
  const [explainerContext, setExplainerContext] = useState<string>('');
  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);

  const openAdvancedExplainer = (topic: string, context?: string) => {
    setExplainerTopic(topic);
    setExplainerContext(context || '');
    setIsExplainerOpen(true);
  };

  const presets = [
    { name: "E-Commerce & Retail", domain: "E-Commerce Sales", goal: "Basket size analysis, inventory turnover, customer repurchase rate" },
    { name: "SaaS & Subscriptions", domain: "SaaS & Subscriptions", goal: "MRR, Net Retention Rate (NRR), Churn rate, LTV:CAC ratio" },
    { name: "Healthcare & Operations", domain: "Healthcare Clinic Operations", goal: "Patient wait times, bed utilization %, doctor productivity metrics" },
    { name: "Supply Chain & Logistics", domain: "Supply Chain Logistics", goal: "On-Time-In-Full (OTIF) delivery %, freight cost per unit, stockout rate" },
  ];

  const handleGenerate = async (presetDomain?: string, presetGoal?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tools/powerbi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: presetDomain || domain,
          businessGoal: presetGoal || businessGoal,
          requestedMetric,
        }),
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setData(resData.data);
      }
    } catch (err) {
      console.error("Power BI API error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyDax = (formula: string, idx: number) => {
    navigator.clipboard.writeText(formula);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadDaxScript = () => {
    let script = `// ==========================================\n// Power BI DAX Script: ${data.dashboardTitle}\n// Generated by AI Tools Studio\n// ==========================================\n\n`;
    data.daxMeasures.forEach((m) => {
      script += `// Measure: ${m.measureName} [${m.category}]\n// ${m.explanation}\n// Return Type: ${m.returnType}\n${m.formula}\n\n`;
    });
    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.dashboardTitle.replace(/\s+/g, "_")}_DAX_Measures.dax`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Power BI & DAX Architect
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Generate production DAX calculations, Star Schema data models, Power Query M-code, and interactive dashboard mockups.
          </p>
        </div>

        {/* Action */}
        <div className="flex items-center space-x-3">
          <button
            id="download-dax-script-btn"
            onClick={handleDownloadDaxScript}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs sm:text-sm flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .DAX Script</span>
          </button>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm text-white">Power BI Model & DAX Generator</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Gemini 3.7 Flash Engine</span>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Industry Templates:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDomain(p.domain);
                setBusinessGoal(p.goal);
                handleGenerate(p.domain, p.goal);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Business Domain / Industry</label>
            <input
              id="powerbi-domain-input"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              placeholder="e.g. SaaS Subscription & Customer Retention"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Specific KPIs / Metrics Needed</label>
            <input
              id="powerbi-metrics-input"
              type="text"
              value={requestedMetric}
              onChange={(e) => setRequestedMetric(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              placeholder="e.g. YoY Growth, MoM Churn %, LTV, Rolling 90-Day Revenue"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            id="btn-generate-powerbi"
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isLoading ? "Architecting DAX Model..." : "Generate Power BI Model & DAX"}</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveView('model_view')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeView === 'model_view'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Interactive Power BI Report & DAX Model</span>
        </button>

        <button
          onClick={() => setActiveView('dax_vault')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeView === 'dax_vault'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>DAX Engine & Power BI Architecture Vault</span>
        </button>
      </div>

      {activeView === 'dax_vault' ? (
        /* Comprehensive DAX Engine & Power BI Architecture Vault */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              DAX VertiPaq Engine & Enterprise Power BI Architecture Guide
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Deep dive into filter contexts, context transition, memory columnar compression, time intelligence, and query optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vault Card 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs">01</span>
                <h3 className="font-bold text-slate-900 text-base">Row Context vs Filter Context</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The fundamental mental model for all DAX evaluation:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Filter Context:</strong> The set of active filters injected by visual slicers, matrix row headers, report page filters, and CALCULATE modifiers.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Row Context:</strong> Current row pointer during table iteration (e.g. calculated columns or iterator functions like SUMX, FILTER, AVERAGEX).</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Context Transition:</strong> Calling CALCULATE inside a row context transforms all current row values into filter context conditions!</span>
                </li>
              </ul>
            </div>

            {/* Vault Card 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">02</span>
                <h3 className="font-bold text-slate-900 text-base">CALCULATE Filter Modifiers</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Control and manipulate filter contexts with surgical precision:
              </p>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div><code className="text-indigo-600 font-mono">ALL(Table[Col])</code>: Removes existing filters to compute grand totals or share of total.</div>
                <div><code className="text-indigo-600 font-mono">ALLEXCEPT(Table, Col)</code>: Clears all filters except designated slice column.</div>
                <div><code className="text-indigo-600 font-mono">KEEPFILTERS()</code>: Intersects with existing filters rather than overwriting them.</div>
                <div><code className="text-indigo-600 font-mono">USERELATIONSHIP()</code>: Activates inactive relationships on the fly (e.g., ShipDate vs OrderDate).</div>
              </div>
            </div>

            {/* Vault Card 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">03</span>
                <h3 className="font-bold text-slate-900 text-base">VertiPaq In-Memory Columnar Engine</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                How Power BI compresses billions of rows into megabytes of RAM:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Value Encoding:</strong> Subtracts the mathematical minimum value to reduce integer bit-width.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Dictionary Encoding:</strong> Replaces distinct strings/dates with zero-indexed integer IDs.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Run-Length Encoding (RLE):</strong> Compresses contiguous repeating values into (Value, Count) pairs.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Rule:</strong> High-cardinality columns (e.g., GUIDs or timestamps with seconds) kill compression. Split Date and Time into 2 columns!</span>
                </li>
              </ul>
            </div>

            {/* Vault Card 4 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">04</span>
                <h3 className="font-bold text-slate-900 text-base">Star Schema vs Snowflake Schema</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Golden architectural rule for high performance Power BI reports:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Star Schema:</strong> Fact table in the center directly connected to single-depth Dimension tables. Maximizes VertiPaq relationship caching.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Snowflake Anti-Pattern:</strong> Normalized chains of dimensions (Product → SubCategory → Category). Causes slow multi-hop joins; flatten them in Power Query!</span>
                </li>
              </ul>
            </div>

            {/* Vault Card 5 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700 font-bold text-xs">05</span>
                <h3 className="font-bold text-slate-900 text-base">Master Time Intelligence</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standardized patterns for enterprise period comparisons:
              </p>
              <div className="p-2.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
                <div className="text-amber-400">// Year-over-Year Growth %</div>
                <div>YoY % =</div>
                <div>VAR CurrentRev = [Total Revenue]</div>
                <div>VAR PriorRev = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR('DimDate'[Date]))</div>
                <div>RETURN DIVIDE(CurrentRev - PriorRev, PriorRev, 0)</div>
              </div>
              <p className="text-xs text-slate-600">
                Always mark your DimDate as a designated Date Table and never rely on auto-date/time hierarchies.
              </p>
            </div>

            {/* Vault Card 6 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">06</span>
                <h3 className="font-bold text-slate-900 text-base">DAX Performance & Anti-Patterns</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Techniques to eliminate visual lag and engine CPU throttling:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Never use IFERROR / raw /:</strong> Use <code className="text-indigo-600 font-mono">DIVIDE(Num, Den, 0)</code> to prevent division-by-zero errors without breaking vectorization.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Avoid repeated measure calls:</strong> Store measure results in <code className="text-indigo-600 font-mono">VAR</code> so they compute exactly once per cell.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Filter columns, not tables:</strong> Prefer <code className="text-indigo-600 font-mono">CALCULATE([Sales], DimProduct[Color] = "Red")</code> over filtering entire <code className="text-indigo-600 font-mono">FILTER(FactSales, ...)</code>.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <>
      {/* Dashboard Live Mockup & Recharts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <span>Interactive Power BI Report Mockup</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">Simulated Canvas View</span>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{data.dashboardTitle}</h3>
              <p className="text-xs text-slate-400">{data.summary}</p>
            </div>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold self-start sm:self-auto">
              Live BI Mockup
            </span>
          </div>

          {/* Interactive KPI & Chart Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.dashboardWidgets.map((w, idx) => {
              const isLine = w.visualType === 'line_chart';
              const isBar = w.visualType === 'bar_chart';

              if (isLine || isBar) {
                return (
                  <div
                    key={idx}
                    className="md:col-span-2 bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{w.title}</span>
                        <span className="text-[11px] text-slate-400">{w.subtitle}</span>
                      </div>
                      <span className="text-sm font-extrabold text-amber-400">{w.primaryValue}</span>
                    </div>

                    {/* Chart Container */}
                    <div className="h-44 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        {isLine ? (
                          <LineChart data={w.chartData || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                            <YAxis stroke="#94a3b8" fontSize={11} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc" }}
                            />
                            <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                            {w.chartData?.[0]?.target && (
                              <Line type="monotone" dataKey="target" stroke="#60a5fa" strokeDasharray="4 4" />
                            )}
                          </LineChart>
                        ) : (
                          <BarChart data={w.chartData || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                            <YAxis stroke="#94a3b8" fontSize={11} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc" }}
                            />
                            <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              }

              // KPI Card
              return (
                <div
                  key={idx}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between space-y-2"
                >
                  <span className="text-xs font-semibold text-slate-300">{w.title}</span>
                  <div className="text-2xl font-extrabold text-white">{w.primaryValue}</div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-700/60">
                    <span className="text-slate-400">{w.subtitle}</span>
                    {w.trend && (
                      <span className="text-emerald-400 font-semibold flex items-center space-x-0.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{w.trend}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DAX Measures Architecture */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <span>Production DAX Measures ({data.daxMeasures.length})</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">VertiPaq Optimized</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.daxMeasures.map((measure, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3 flex flex-col justify-between hover:border-amber-400 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-base">{measure.measureName}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {measure.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{measure.explanation}</p>

                {/* DAX Code Box */}
                <div className="relative group">
                  <pre className="bg-slate-900 text-amber-300 p-3.5 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    <code>{measure.formula}</code>
                  </pre>
                  <button
                    onClick={() => handleCopyDax(measure.formula, idx)}
                    className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy DAX</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Performance Tip */}
              {measure.performanceTip && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700">⚡ Performance Tip: </span>
                  {measure.performanceTip}
                </div>
              )}

              {/* Advanced Explainer Trigger Button */}
              <button
                onClick={() =>
                  openAdvancedExplainer(
                    `DAX Measure Architecture: ${measure.measureName}`,
                    `Formula:\n${measure.formula}\n\nCategory: ${measure.category}\nExplanation: ${measure.explanation}\nTip: ${measure.performanceTip}`
                  )
                }
                className="w-full py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors border border-indigo-200/80 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Explain at Advanced Level (Bytecode & Memory)</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Star Schema Data Model */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Star Schema Data Model & Relationships</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">Facts & Dimensions</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.dataModel.tables.map((tbl, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-4 border space-y-2 ${
                  tbl.type.includes("Fact")
                    ? "bg-amber-50/50 border-amber-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="font-bold text-sm text-slate-900">{tbl.name}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      tbl.type.includes("Fact")
                        ? "bg-amber-200 text-amber-900"
                        : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    {tbl.type}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-700">
                  {tbl.columns.map((col, cIdx) => (
                    <div key={cIdx} className="flex items-center space-x-1.5 font-mono text-[11px]">
                      <span className="text-slate-400">•</span>
                      <span>{col}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Relationships table */}
          {data.dataModel.relationships && data.dataModel.relationships.length > 0 && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Active Cardinality Relationships</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {data.dataModel.relationships.map((rel, rIdx) => (
                  <div key={rIdx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="font-semibold text-slate-900">
                      {rel.fromTable} → {rel.toTable}
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Key: <code className="text-indigo-600">{rel.fromColumn}</code> = <code className="text-indigo-600">{rel.toColumn}</code>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Cardinality: {rel.cardinality} ({rel.crossFilterDirection || "Single"} filter)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* Advanced Technical Explainer Modal */}
      <AdvancedExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        initialTopic={explainerTopic}
        sourceTool="Power BI & DAX Architect"
        contextSnippet={explainerContext}
      />
    </div>
  );
};
