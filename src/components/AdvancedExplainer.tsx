import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  BarChart2, 
  Code2, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Zap, 
  Layers, 
  ArrowRight, 
  Sliders, 
  BookOpen, 
  Database, 
  Sheet, 
  FileText, 
  Presentation, 
  ShieldAlert, 
  RefreshCw 
} from 'lucide-react';
import { AdvancedExplainerData, ActiveTool } from '../types';

interface AdvancedExplainerProps {
  onNavigateToTool?: (tool: ActiveTool) => void;
}

export const AdvancedExplainer: React.FC<AdvancedExplainerProps> = ({ onNavigateToTool }) => {
  const [query, setQuery] = useState<string>(
    'VertiPaq In-Memory Columnar Database Compression & Filter Context Transition in CALCULATE'
  );
  const [domain, setDomain] = useState<string>('Power BI & Data Architecture');
  const [depthLevel, setDepthLevel] = useState<string>('Staff / Principal Engineer');
  const [focusAspects, setFocusAspects] = useState<string[]>([
    'First Principles Theory & Mathematical Bounds',
    'Runtime Execution Mechanics & Bytecode Tracing',
    'Production Failure Modes & Edge Case Matrix',
    'Comparative Performance & Memory Benchmarks',
    'Production Enterprise Code / Implementation Script',
  ]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<AdvancedExplainerData | null>(null);
  const [activeTab, setActiveTab] = useState<'theory' | 'mechanics' | 'pitfalls' | 'benchmark' | 'code' | 'checklist'>('theory');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const presetTopics = [
    {
      category: 'Power BI & Data Engineering',
      icon: Database,
      items: [
        {
          title: 'VertiPaq Columnar Compression & Context Transition',
          query: 'VertiPaq In-Memory Columnar Database Compression & Filter Context Transition in CALCULATE',
          domain: 'Power BI & Data Architecture',
        },
        {
          title: 'DirectQuery vs Import Mode Query Folding',
          query: 'Power Query M-Code Query Folding & DirectQuery SQL Translation Performance Optimization',
          domain: 'Power BI & Data Architecture',
        },
        {
          title: 'Star Schema vs Snowflake Cardinality Bottlenecks',
          query: 'High-Scale Star Schema vs Snowflake Relationship Traversal & Cross-Filter Direction Memory Impact',
          domain: 'Power BI & Data Architecture',
        },
      ],
    },
    {
      category: 'Modern Excel & Financial Engineering',
      icon: Sheet,
      items: [
        {
          title: 'Dynamic Array Memory Allocation & Spill Mechanics',
          query: 'Excel Dynamic Array Spill Memory Management, LET Variable Caching, and Recalculation Dependency DAG',
          domain: 'Excel & Financial Engineering',
        },
        {
          title: '3-Statement Financial Model Circularity & Loops',
          query: 'Wall Street 3-Statement Financial Modeling Interest Rate Circular References & Iterative Solver Convergence',
          domain: 'Excel & Financial Engineering',
        },
        {
          title: 'VBA Memory Arrays vs Range COM Interop',
          query: 'High-Performance Excel VBA: Processing 1,000,000 Rows in RAM vs Slow .Select COM Object Overhead',
          domain: 'Excel & Financial Engineering',
        },
      ],
    },
    {
      category: 'Software Architecture & Distributed Systems',
      icon: Cpu,
      items: [
        {
          title: 'Raft Consensus & Distributed Log Replication',
          query: 'Raft Consensus Algorithm: Leader Election, Log Matching Invariant, and Network Partition Healing',
          domain: 'Distributed Systems & Backend Architecture',
        },
        {
          title: 'PostgreSQL MVCC & Vacuum Bloat Mechanics',
          query: 'PostgreSQL MVCC (Multi-Version Concurrency Control), Dead Tuple Visibility, and Autovacuum Wraparound',
          domain: 'Distributed Systems & Backend Architecture',
        },
        {
          title: 'Linux epoll vs select() Socket I/O Architecture',
          query: 'High-Concurrency Linux epoll vs select() Kernel Event Notification & Zero-Copy Socket Architecture',
          domain: 'Distributed Systems & Backend Architecture',
        },
      ],
    },
    {
      category: 'AI / ML & ATS Career Algorithms',
      icon: FileText,
      items: [
        {
          title: 'Workday & Taleo ATS NLP Tokenization & TF-IDF',
          query: 'How Enterprise ATS Parsers (Workday, Taleo, Greenhouse) Tokenize Resumes using NER and Semantic Embeddings',
          domain: 'ATS & Career Science',
        },
        {
          title: 'Transformer KV Caching & FlashAttention-2',
          query: 'Transformer Self-Attention Matrix Multiplication, KV Cache VRAM Footprint, and FlashAttention-2 IO-Aware SRAM Tiling',
          domain: 'AI & Machine Learning Systems',
        },
        {
          title: 'Executive Presentation Cognitive Bandwidth',
          query: 'Minto Pyramid Principle & Executive Keynote Visual Chunking: Reducing Audience Cognitive Load in High-Stakes Pitches',
          domain: 'Executive Presentation Architecture',
        },
      ],
    },
  ];

  const handleGenerate = async (customQuery?: string, customDomain?: string) => {
    const targetQuery = customQuery || query;
    const targetDomain = customDomain || domain;
    setIsLoading(true);

    try {
      const res = await fetch('/api/tools/advanced-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicOrCodeOrQuestion: targetQuery,
          sourceTool: targetDomain,
          depthLevel,
          focusAspects,
          customPrompt: customPrompt || undefined,
        }),
      });

      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to generate advanced breakdown:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!data) return;
    const text = `# ${data.title}\n\n**Depth Level:** ${data.depthLevel}\n**Domain:** ${data.conceptClassification}\n\n## Executive Summary\n${data.executiveSummary}\n\n## First Principles Theory\n${data.firstPrinciplesTheory.explanation}\n\n## Key Takeaways\n${data.keyTakeaways.map((t) => `- ${t}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    if (!data?.productionCodeOrScript?.code) return;
    navigator.clipboard.writeText(data.productionCodeOrScript.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!data) return;
    const markdown = `# ${data.title}
**Depth Level:** ${data.depthLevel}
**Domain:** ${data.conceptClassification}

## Executive Summary
${data.executiveSummary}

## 1. First Principles & Mathematical Bounds
${data.firstPrinciplesTheory.mathFormulaOrNotation ? `\`\`\`\n${data.firstPrinciplesTheory.mathFormulaOrNotation}\n\`\`\`\n` : ''}
${data.firstPrinciplesTheory.explanation}

### Core Tenets:
${data.firstPrinciplesTheory.coreTenets.map((t, idx) => `${idx + 1}. ${t}`).join('\n')}

## 2. Runtime Execution Mechanics
${data.executionMechanics.stepByStepFlow.map((s) => `### Stage ${s.step}: ${s.phase}\n- **What Happens:** ${s.whatHappens}\n- **Engine State:** ${s.engineState}`).join('\n\n')}

**Hardware & CPU Impact:**
${data.executionMechanics.memoryAndCpuImpact}

## 3. Production Failure Modes & Pitfalls
${data.productionPitfallsAndEdgeCases.map((p) => `### [${p.severity}] ${p.pitfall}\n- **Symptom:** ${p.symptom}\n- **Root Cause:** ${p.rootCause}\n- **Prevention:** ${p.prevention}`).join('\n\n')}

${data.comparativeBenchmark ? `## 4. Benchmark vs Alternative (${data.comparativeBenchmark.alternative})
- **Throughput/Latency:** ${data.comparativeBenchmark.performanceVsAlternative}
- **Memory Footprint:** ${data.comparativeBenchmark.memoryVsAlternative}
- **Recommended When:** ${data.comparativeBenchmark.recommendedWhen}` : ''}

${data.productionCodeOrScript ? `## 5. Production Code (${data.productionCodeOrScript.filename || data.productionCodeOrScript.language})
\`\`\`${data.productionCodeOrScript.language}
${data.productionCodeOrScript.code}
\`\`\`

### Annotations:
${data.productionCodeOrScript.annotations.map((a) => `- ${a}`).join('\n')}` : ''}

## 6. Principal Engineering Mastery Checklist
${data.advancedMasteryChecklist.map((c) => `- [x] ${c}`).join('\n')}

## Key Takeaways
${data.keyTakeaways.map((k) => `- ${k}`).join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Advanced Deep-Dive Intelligence Engine</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Granular Technical Details • Mathematical Bounds • Production Pitfalls • Bytecode Tracing
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Explain Any Technical Concept or System at an Advanced Level
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Deconstruct complex DAX measures, spreadsheet algorithms, ATS tokenizers, system design architectures, and executive strategic formulas with uncompromising depth, hardware state tracing, and battle-tested production code.
          </p>
        </div>
      </div>

      {/* Interactive Control Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-extrabold text-slate-900">
            What technical concept, formula, measure, code, or architecture would you like to analyze?
          </label>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. VertiPaq Columnar Compression, Raft Consensus Invariants, ATS TF-IDF Tokenization, LET / LAMBDA Optimization..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-sm sm:text-base text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-hidden transition-all shadow-inner"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerate();
              }}
            />
          </div>

          {/* Depth & Domain Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Depth & Rigor Level:</label>
              <select
                value={depthLevel}
                onChange={(e) => setDepthLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Staff / Principal Engineer">Staff / Principal Engineer (Architecture & Performance)</option>
                <option value="VP / Executive Strategic">VP / Executive Strategic (ROI, Governance, Org Scale)</option>
                <option value="PhD / Research Theoretical">PhD / Research Rigor (Math Bounds & Proofs)</option>
                <option value="Senior Production Lead">Senior Production Lead (Zero-Downtime Resilience)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Domain Classification:</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Power BI & Data Architecture">Power BI & Data Architecture</option>
                <option value="Excel & Financial Engineering">Excel & Financial Engineering</option>
                <option value="Distributed Systems & Backend Architecture">Distributed Systems & Backend</option>
                <option value="ATS & Career Science">ATS Algorithms & Career Science</option>
                <option value="AI & Machine Learning Systems">AI / ML & LLM Architecture</option>
                <option value="Executive Presentation Architecture">Executive Presentation Strategy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Optional Custom Constraints / Focus:</label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Include AVX-512 SIMD, 1M rows, cache locality..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !query.trim()}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm flex items-center space-x-2 shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Generating Advanced Masterclass...' : 'Generate Advanced Deep-Dive Breakdown'}</span>
            </button>
          </div>
        </div>

        {/* Preset Library Quick Picks */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Explore Masterclass Presets Across Specialized Domains:
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {presetTopics.map((group, gIdx) => {
              const Icon = group.icon;
              return (
                <div key={gIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-bold text-xs text-slate-900 truncate">{group.category}</span>
                  </div>

                  <div className="space-y-1.5">
                    {group.items.map((item, iIdx) => (
                      <button
                        key={iIdx}
                        onClick={() => {
                          setQuery(item.query);
                          setDomain(item.domain);
                          handleGenerate(item.query, item.domain);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-white hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/80 text-[11px] font-medium text-slate-700 hover:text-indigo-900 transition-all cursor-pointer block line-clamp-1"
                        title={item.query}
                      >
                        • {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Generated Advanced Masterclass Results */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="text-lg font-extrabold text-slate-900">Synthesizing First-Principles Architecture & Execution Pipeline...</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Deconstructing theoretical foundations, calculating mathematical bounds, compiling runtime execution state transitions, and formulating battle-tested production code.
          </p>
        </div>
      ) : data ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          {/* Result Header Bar */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-xs font-bold">
                  {data.depthLevel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                  {data.conceptClassification}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{data.title}</h2>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleCopySummary}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Summary'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report (.md)</span>
              </button>
            </div>
          </div>

          {/* Executive Summary Card */}
          <div className="p-6 sm:p-8 bg-slate-900/95 text-slate-200 border-b border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider">
                Executive Synthesis & Architectural Thesis
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              {data.executiveSummary}
            </p>
          </div>

          {/* Lens Switcher Tabs */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center space-x-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'theory', label: '1. First Principles & Math', icon: Cpu },
              { id: 'mechanics', label: '2. Runtime Execution Mechanics', icon: Activity },
              { id: 'pitfalls', label: '3. Pitfalls & Failure Modes', icon: AlertTriangle },
              { id: 'benchmark', label: '4. Benchmarks & Trade-offs', icon: BarChart2 },
              { id: 'code', label: '5. Production Implementation', icon: Code2 },
              { id: 'checklist', label: '6. Principal Mastery Checklist', icon: CheckCircle2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-4 border-b-2 font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Lens Content Area */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* 1. Theory */}
            {activeTab === 'theory' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-6 space-y-4">
                  <h3 className="font-black text-indigo-950 text-lg flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-indigo-600" />
                    <span>{data.firstPrinciplesTheory.title}</span>
                  </h3>

                  {data.firstPrinciplesTheory.mathFormulaOrNotation && (
                    <div className="p-4 bg-slate-900 text-indigo-300 font-mono text-xs sm:text-sm rounded-xl overflow-x-auto border border-slate-800 shadow-inner">
                      <code>{data.firstPrinciplesTheory.mathFormulaOrNotation}</code>
                    </div>
                  )}

                  <p className="text-sm sm:text-base text-indigo-950 leading-relaxed font-medium">
                    {data.firstPrinciplesTheory.explanation}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                    Core Invariant Tenets:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.firstPrinciplesTheory.coreTenets.map((tenet, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 space-y-1.5">
                        <span className="font-black text-indigo-600 mr-2 font-mono text-sm">0{idx + 1}.</span>
                        <span className="leading-relaxed">{tenet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Mechanics */}
            {activeTab === 'mechanics' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-lg flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <span>{data.executionMechanics.title}</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Stage-by-Stage Hardware Tracing</span>
                </div>

                <div className="space-y-4">
                  {data.executionMechanics.stepByStepFlow.map((step) => (
                    <div key={step.step} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {step.step}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">{step.phase}</h4>
                        </div>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                          Pipeline Step {step.step} of {data.executionMechanics.stepByStepFlow.length}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 pl-10 leading-relaxed font-normal">
                        {step.whatHappens}
                      </p>

                      <div className="ml-10 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono flex items-center space-x-2">
                        <span className="text-indigo-600 font-bold">Engine & Memory State:</span>
                        <span>{step.engineState}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs sm:text-sm text-amber-950 space-y-2">
                  <span className="font-bold flex items-center space-x-1.5 text-amber-900">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Hardware & CPU Cache Utilization Profile:</span>
                  </span>
                  <p className="leading-relaxed">{data.executionMechanics.memoryAndCpuImpact}</p>
                </div>
              </div>
            )}

            {/* 3. Pitfalls */}
            {activeTab === 'pitfalls' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-black text-slate-900 text-lg flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>Production Failure Modes & Edge Case Matrix</span>
                  </h3>
                </div>

                <div className="space-y-4">
                  {data.productionPitfallsAndEdgeCases.map((pit, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            pit.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : pit.severity === 'High'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {pit.severity} Severity
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-base">{pit.pitfall}</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
                        <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                          <span className="font-bold text-rose-600 block">Symptom in Production:</span>
                          <span className="text-slate-700 leading-relaxed">{pit.symptom}</span>
                        </div>
                        <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                          <span className="font-bold text-amber-700 block">Underlying Root Cause:</span>
                          <span className="text-slate-700 leading-relaxed">{pit.rootCause}</span>
                        </div>
                        <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                          <span className="font-bold text-emerald-700 block">Architectural Prevention:</span>
                          <span className="text-slate-700 leading-relaxed">{pit.prevention}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Benchmarks */}
            {activeTab === 'benchmark' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-black text-slate-900 text-lg flex items-center space-x-2">
                    <BarChart2 className="w-5 h-5 text-indigo-600" />
                    <span>Comparative Performance Benchmarks & Trade-off Matrix</span>
                  </h3>
                </div>

                {data.comparativeBenchmark ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Alternative Comparison
                      </span>
                      <h4 className="font-black text-lg text-white">{data.comparativeBenchmark.alternative}</h4>

                      <div className="space-y-3 text-xs sm:text-sm">
                        <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 space-y-1">
                          <span className="text-emerald-400 font-bold block">Throughput / Latency Advantage:</span>
                          <span className="text-slate-200 leading-relaxed">{data.comparativeBenchmark.performanceVsAlternative}</span>
                        </div>
                        <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 space-y-1">
                          <span className="text-cyan-400 font-bold block">Memory & Cache Impact:</span>
                          <span className="text-slate-200 leading-relaxed">{data.comparativeBenchmark.memoryVsAlternative}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-emerald-50/90 border border-emerald-200 space-y-4">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Architectural Decision Matrix
                      </span>
                      <h4 className="font-black text-lg text-emerald-950">When to Choose this Pattern</h4>
                      <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
                        {data.comparativeBenchmark.recommendedWhen}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No comparative benchmarks recorded for this topic.</p>
                )}
              </div>
            )}

            {/* 5. Production Code */}
            {activeTab === 'code' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-2">
                    <Code2 className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-black text-slate-900 text-lg">Production Implementation Code</h3>
                    {data.productionCodeOrScript?.filename && (
                      <span className="text-xs font-mono text-slate-500">({data.productionCodeOrScript.filename})</span>
                    )}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                {data.productionCodeOrScript ? (
                  <div className="space-y-4">
                    <div className="p-5 bg-slate-950 text-slate-200 rounded-3xl font-mono text-xs sm:text-sm overflow-x-auto border border-slate-800 leading-relaxed shadow-xl">
                      <pre>{data.productionCodeOrScript.code}</pre>
                    </div>

                    {data.productionCodeOrScript.annotations && data.productionCodeOrScript.annotations.length > 0 && (
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                          Engineering Annotations & Code Directives:
                        </span>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                          {data.productionCodeOrScript.annotations.map((ann, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-indigo-600 font-bold">•</span>
                              <span>{ann}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No code snippet required for this conceptual analysis.</p>
                )}
              </div>
            )}

            {/* 6. Checklist */}
            {activeTab === 'checklist' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-black text-slate-900 text-lg flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Principal Engineering Mastery Checklist & Strategic Directives</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.advancedMasteryChecklist.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start space-x-3 shadow-2xs">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        ✓
                      </div>
                      <span className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-3xl space-y-3">
                  <span className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">
                    High-Impact Strategic Takeaways:
                  </span>
                  <ul className="space-y-2 text-xs sm:text-sm text-indigo-950 font-medium">
                    {data.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
