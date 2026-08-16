import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  BarChart2, 
  Code2, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  Layers,
  Zap,
  ArrowRight,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { AdvancedExplainerData } from '../types';

interface AdvancedExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic: string;
  sourceTool: string;
  contextSnippet?: string;
}

export const AdvancedExplainerModal: React.FC<AdvancedExplainerModalProps> = ({
  isOpen,
  onClose,
  initialTopic,
  sourceTool,
  contextSnippet,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [depthLevel, setDepthLevel] = useState<string>('Staff / Principal Engineer');
  const [activeTab, setActiveTab] = useState<'theory' | 'mechanics' | 'pitfalls' | 'benchmark' | 'code' | 'checklist'>('theory');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<AdvancedExplainerData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const fetchAdvancedExplanation = async (targetTopic: string, level: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tools/advanced-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicOrCodeOrQuestion: targetTopic,
          sourceTool,
          depthLevel: level,
          customPrompt: contextSnippet ? `Context Details:\n${contextSnippet}` : undefined,
        }),
      });
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to load advanced explanation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialTopic) {
      setTopic(initialTopic);
      fetchAdvancedExplanation(initialTopic, depthLevel);
    }
  }, [isOpen, initialTopic]);

  if (!isOpen) return null;

  const handleCopySummary = () => {
    if (!data) return;
    const text = `# ${data.title}\n\n**Level:** ${data.depthLevel} | **Domain:** ${data.conceptClassification}\n\n## Executive Summary\n${data.executiveSummary}\n\n## First Principles Theory\n${data.firstPrinciplesTheory.explanation}\n\n## Key Takeaways\n${data.keyTakeaways.map((t) => `- ${t}`).join('\n')}`;
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1">
                <Zap className="w-3 h-3 text-indigo-400" />
                <span>Advanced Deep-Dive Intelligence</span>
              </span>
              <span className="text-xs text-slate-400">• Source: {sourceTool}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white line-clamp-1">
              {data?.title || `Advanced Technical Breakdown: ${topic}`}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySummary}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Copy Summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Level Controls & Search Strip */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Depth Level:</span>
            <select
              value={depthLevel}
              onChange={(e) => {
                setDepthLevel(e.target.value);
                fetchAdvancedExplanation(topic, e.target.value);
              }}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
            >
              <option value="Staff / Principal Engineer">Staff / Principal Engineer (System Architecture)</option>
              <option value="VP / Executive Strategic">VP / Executive Strategic (ROI & Organization)</option>
              <option value="PhD / Research Theoretical">PhD / Research Rigor (Math & Algorithms)</option>
              <option value="Senior Production Lead">Senior Production Lead (Zero-Downtime Reliability)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Refine question or topic..."
              className="w-full sm:w-64 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchAdvancedExplanation(topic, depthLevel);
                }
              }}
            />
            <button
              onClick={() => fetchAdvancedExplanation(topic, depthLevel)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1 shrink-0 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Analyze</span>
            </button>
          </div>
        </div>

        {/* Multi-Lens Navigation Tabs */}
        <div className="bg-white border-b border-slate-200 px-4 flex items-center space-x-2 overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'theory', label: '1. First Principles & Math', icon: Cpu },
            { id: 'mechanics', label: '2. Runtime Execution Flow', icon: Activity },
            { id: 'pitfalls', label: '3. Pitfalls & Edge Cases', icon: AlertTriangle },
            { id: 'benchmark', label: '4. Benchmarks & Trade-offs', icon: BarChart2 },
            { id: 'code', label: '5. Production Code', icon: Code2 },
            { id: 'checklist', label: '6. Mastery Checklist', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 border-b-2 font-bold text-xs flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-bold text-slate-800">Generating Advanced Level Masterclass Breakdown...</p>
              <p className="text-xs text-slate-500">Deconstructing algorithms, engine states, mathematical proofs, and failure modes</p>
            </div>
          ) : !data ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              Click Analyze to generate advanced technical insights.
            </div>
          ) : (
            <>
              {/* Executive Summary Callout */}
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Executive Summary & Strategic Thesis</span>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {data.conceptClassification}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {data.executiveSummary}
                </p>
              </div>

              {/* Tab 1: Theory */}
              {activeTab === 'theory' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 space-y-3">
                    <h3 className="font-extrabold text-indigo-950 text-base flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-indigo-600" />
                      <span>{data.firstPrinciplesTheory.title}</span>
                    </h3>
                    {data.firstPrinciplesTheory.mathFormulaOrNotation && (
                      <div className="p-3 bg-slate-900 text-indigo-300 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800">
                        <code>{data.firstPrinciplesTheory.mathFormulaOrNotation}</code>
                      </div>
                    )}
                    <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed">
                      {data.firstPrinciplesTheory.explanation}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Core Architectural Tenets:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.firstPrinciplesTheory.coreTenets.map((tenet, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 space-y-1">
                          <span className="font-bold text-indigo-600 mr-1.5 font-mono">0{idx + 1}.</span>
                          <span>{tenet}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Execution Mechanics */}
              {activeTab === 'mechanics' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-indigo-600" />
                      <span>{data.executionMechanics.title}</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">Hardware & Memory Tracing</span>
                  </div>

                  <div className="space-y-3">
                    {data.executionMechanics.stepByStepFlow.map((step) => (
                      <div key={step.step} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                              {step.step}
                            </span>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">{step.phase}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                            Stage {step.step} of {data.executionMechanics.stepByStepFlow.length}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 pl-8 leading-relaxed">
                          {step.whatHappens}
                        </p>
                        <div className="ml-8 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-mono flex items-center space-x-1.5">
                          <span className="text-indigo-600 font-bold">State:</span>
                          <span>{step.engineState}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <span className="font-bold">Hardware & CPU Impact:</span>
                    <p>{data.executionMechanics.memoryAndCpuImpact}</p>
                  </div>
                </div>
              )}

              {/* Tab 3: Pitfalls & Edge Cases */}
              {activeTab === 'pitfalls' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Production Failure Modes & Edge Case Matrix</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {data.productionPitfallsAndEdgeCases.map((pit, pIdx) => (
                      <div key={pIdx} className="p-4.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                pit.severity === 'Critical'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : pit.severity === 'High'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {pit.severity} Severity
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm">{pit.pitfall}</h4>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                            <span className="font-bold text-rose-600 block">Symptom:</span>
                            <span className="text-slate-700">{pit.symptom}</span>
                          </div>
                          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                            <span className="font-bold text-amber-700 block">Root Cause:</span>
                            <span className="text-slate-700">{pit.rootCause}</span>
                          </div>
                          <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                            <span className="font-bold text-emerald-700 block">Prevention:</span>
                            <span className="text-slate-700">{pit.prevention}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Benchmarks */}
              {activeTab === 'benchmark' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                      <BarChart2 className="w-4 h-4 text-indigo-600" />
                      <span>Comparative Performance Benchmark & Architectural Trade-offs</span>
                    </h3>
                  </div>

                  {data.comparativeBenchmark ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                          Benchmark vs Alternative
                        </span>
                        <h4 className="font-bold text-base text-white">{data.comparativeBenchmark.alternative}</h4>
                        <div className="space-y-2 text-xs">
                          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                            <span className="text-emerald-400 font-bold block mb-1">Throughput / Latency:</span>
                            <span className="text-slate-200">{data.comparativeBenchmark.performanceVsAlternative}</span>
                          </div>
                          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                            <span className="text-cyan-400 font-bold block mb-1">Memory Footprint:</span>
                            <span className="text-slate-200">{data.comparativeBenchmark.memoryVsAlternative}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                          Architectural Decision Matrix
                        </span>
                        <h4 className="font-bold text-base text-emerald-950">When to Choose this Pattern</h4>
                        <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                          {data.comparativeBenchmark.recommendedWhen}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No comparative benchmarks recorded for this topic.</p>
                  )}
                </div>
              )}

              {/* Tab 5: Production Code */}
              {activeTab === 'code' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <Code2 className="w-4 h-4 text-indigo-600" />
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Production Implementation Script
                      </h3>
                      {data.productionCodeOrScript?.filename && (
                        <span className="text-xs font-mono text-slate-500">
                          ({data.productionCodeOrScript.filename})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {data.productionCodeOrScript ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                        <pre>{data.productionCodeOrScript.code}</pre>
                      </div>

                      {data.productionCodeOrScript.annotations && data.productionCodeOrScript.annotations.length > 0 && (
                        <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                          <span className="text-xs font-bold text-slate-900">Engineering Annotations:</span>
                          <ul className="space-y-1 text-xs text-slate-700">
                            {data.productionCodeOrScript.annotations.map((ann, aIdx) => (
                              <li key={aIdx} className="flex items-start space-x-1.5">
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

              {/* Tab 6: Mastery Checklist */}
              {activeTab === 'checklist' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Principal Engineering Mastery Checklist & Key Takeaways</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {data.advancedMasteryChecklist.map((chk, cIdx) => (
                      <div key={cIdx} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start space-x-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          ✓
                        </div>
                        <span className="text-xs sm:text-sm text-slate-800">{chk}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Key Takeaways:</span>
                    <ul className="space-y-1 text-xs text-indigo-950">
                      {data.keyTakeaways.map((takeaway, tIdx) => (
                        <li key={tIdx} className="flex items-start space-x-2">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>AI Studio Advanced Explainer Engine</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
