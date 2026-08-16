import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  Copy, 
  Check, 
  Terminal, 
  Sliders, 
  RefreshCw, 
  Code2, 
  Layers 
} from 'lucide-react';

export const AiPlayground: React.FC = () => {
  const [systemPrompt, setSystemPrompt] = useState(
    'You are an expert AI software architect and developer. Provide clear, structured, production-ready explanations and code.'
  );
  const [userPrompt, setUserPrompt] = useState(
    'Explain how to design an automated AI prompt pipeline that generates both an ATS resume and a matching cover letter using structured JSON schemas.'
  );
  const [temperature, setTemperature] = useState(0.7);
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const presets = [
    {
      title: "ATS Resume Polish",
      sys: "You are an ATS Optimization Expert. Polish experience bullet points following the Google XYZ formula.",
      prompt: "Turn this bullet into high-impact ATS metric: 'Worked on payment system and fixed checkout bugs in React.'",
    },
    {
      title: "DAX Time Intelligence",
      sys: "You are a Microsoft Certified Power BI DAX Master. Provide production DAX formula and VertiPaq performance tips.",
      prompt: "Write a DAX measure for 3-Month Moving Average Revenue with filter context handling.",
    },
    {
      title: "Excel Dynamic Arrays",
      sys: "You are an Excel MVP. Provide modern Excel 365 formula with step-by-step breakdown.",
      prompt: "How to use FILTER and SORT to extract all Active employees in Marketing earning over $80,000?",
    },
    {
      title: "Roadmap Module Breakdown",
      sys: "You are a Tech Lead Curriculum Architect. Break down a complex skill into sequential mini-tasks.",
      prompt: "Break down 'Vector Databases & Semantic Search with Gemini Embeddings' into 4 practical coding exercises.",
    },
  ];

  const handleRun = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tools/custom-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          temperature,
        }),
      });
      const data = await res.json();
      if (data.output) {
        setOutput(data.output);
      }
    } catch (err) {
      console.error('Playground run error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Tools Engine Playground
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Test prompt engineering pipelines, persona system instructions, and observe real-time Gemini generation.
          </p>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">Quick Test Templates:</span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSystemPrompt(p.sys);
              setUserPrompt(p.prompt);
            }}
            className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Config Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Prompt Configuration</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">System Instruction (Persona)</label>
              <textarea
                rows={3}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500 text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">User Prompt</label>
              <textarea
                rows={5}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500 text-slate-800 font-mono"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Creativity / Temperature</span>
                <span>{temperature}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <button
              id="btn-run-playground"
              onClick={handleRun}
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{isLoading ? "Running Prompt..." : "Execute AI Request"}</span>
            </button>
          </div>
        </div>

        {/* Right Output Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3 min-h-[420px] flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  <span>Model Execution Output</span>
                </span>
                {output && (
                  <button
                    onClick={handleCopy}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy Output"}</span>
                  </button>
                )}
              </div>

              {output ? (
                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                  {output}
                </div>
              ) : (
                <div className="text-center py-20 space-y-2 text-slate-400">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">Click "Execute AI Request" to run your prompt with Gemini 3.7 Flash</p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 font-mono border-t border-slate-100 pt-2 flex items-center justify-between">
              <span>Model: gemini-3.7-flash</span>
              <span>Latency: Sub-second proxy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
