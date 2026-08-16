import React, { useState } from 'react';
import { 
  X, 
  FileUp, 
  Sparkles, 
  FileText, 
  Layers, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  UploadCloud,
  FileCheck,
  Zap,
  BarChart3,
  Presentation
} from 'lucide-react';
import { PresentationData } from '../types';

interface PdfToSlidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckGenerated: (deck: PresentationData) => void;
}

export const PdfToSlidesModal: React.FC<PdfToSlidesModalProps> = ({
  isOpen,
  onClose,
  onDeckGenerated,
}) => {
  const [fileName, setFileName] = useState<string>('');
  const [pdfContent, setPdfContent] = useState<string>('');
  const [slideCount, setSlideCount] = useState<number>(6);
  const [styleTheme, setStyleTheme] = useState<string>('Modern Slate & Indigo');
  const [focusAreas, setFocusAreas] = useState<string>('Extract all key architectures, KPI tables, comparison matrices, and process workflows.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsReadingFile(true);
    setUploadStatus(`Reading ${file.name}...`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPdfContent(content || '');
      setIsReadingFile(false);
      setUploadStatus(`Successfully loaded ${file.name} (${Math.round(file.size / 1024)} KB)`);
    };

    reader.onerror = () => {
      setIsReadingFile(false);
      setUploadStatus('Failed to read file. You can paste the document text manually.');
    };

    reader.readAsText(file);
  };

  const handleSamplePdf = (type: 'tech' | 'business' | 'architecture') => {
    if (type === 'tech') {
      setFileName('AI_Autonomous_Agents_Whitepaper.pdf');
      setPdfContent(`Title: Autonomous Multi-Agent Systems in Enterprise Cloud Architecture
Executive Summary:
Modern enterprise architectures are transitioning from static monolithic web services to dynamic autonomous agent swarms. In this model, intelligent agents coordinate via type-safe schemas to execute complex ETL pipelines, automated code reviews, and predictive analytics.

Key Metrics & Findings:
- Latency reduced by 64% using asynchronous message queues.
- Operational velocity increased 4.2x across knowledge engineering workflows.
- Error rates decreased from 14.2% to 0.3% with deterministic schema verification.

Core Pipeline Stages:
1. Context Ingestion & Semantic Indexing
2. Multi-Agent Reasoning & Schema Compilation
3. Deterministic Verification & Sanity Checks
4. Production Delivery & Telemetry Tracing

Comparison:
- Traditional Architecture: Brittle manual REST endpoints, monolithic databases, 4-day release cycles.
- Autonomous AI Architecture: Self-healing microservices, real-time vector indexes, sub-second streaming answers.`);
      setFocusAreas('Highlight the latency reduction metrics in charts, include the 4 pipeline stages diagram, and compare legacy vs autonomous architecture.');
      setUploadStatus('Loaded Sample AI Systems Whitepaper');
    } else if (type === 'business') {
      setFileName('Q4_Executive_Financial_Report.pdf');
      setPdfContent(`Title: Q4 Fiscal Performance, Revenue Breakdown & 2026 Expansion Roadmap
Financial Summary:
Total Annual Recurring Revenue reached $18.4M in FY2025, reflecting a 142% Year-over-Year growth driven by Enterprise SaaS subscriptions and AI Developer Tooling.

Revenue By Category:
- Enterprise Software: $9.2M (50%)
- Developer Tooling & APIs: $5.8M (32%)
- Consulting & Custom Models: $3.4M (18%)

Milestones:
- Q1: Achieved SOC2 Type II certification
- Q2: Expanded multi-region cloud cluster into EU & APAC
- Q3: Launched automated ATS resume & BI analytics engine
- Q4: Crossed 250,000 active platform users`);
      setFocusAreas('Generate quarterly financial growth charts, product breakdown pie visual, and 2026 milestone roadmap.');
      setUploadStatus('Loaded Sample Financial & Business Report');
    } else {
      setFileName('System_Security_and_Cloud_Infrastructure.pdf');
      setPdfContent(`Title: Zero-Trust Security Framework & Multi-Cloud Infrastructure Blueprint
Abstract:
This document details our defense-in-depth security posture, automated IAM policy enforcement, and multi-tenant isolation mechanisms.

Architecture Highlights:
1. Perimeter Defense with Edge Web Application Firewalls (WAF)
2. Fine-grained RBAC and Tokenized Session Validation
3. Real-time Anomaly Detection with Machine Learning
4. Immutable Audit Logs & Disaster Recovery Clusters`);
      setFocusAreas('Generate interactive security process flow, threat mitigation comparisons, and compliance timeline.');
      setUploadStatus('Loaded Sample Security Architecture Blueprint');
    }
  };

  const handleGenerateFromPdf = async () => {
    if (!pdfContent.trim()) {
      alert('Please upload a document or paste text content first.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/tools/ppt/from-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfContent,
          fileName: fileName || 'Uploaded Document.pdf',
          slideCount,
          styleTheme,
          focusAreas,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        onDeckGenerated(data.data);
        onClose();
      } else {
        alert('Could not synthesize presentation. Please try with different text.');
      }
    } catch (err: any) {
      console.error('PDF generation error:', err);
      alert('Error connecting to presentation synthesizer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <FileUp className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                  PDF & Doc Ingestion
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  Interactive Visuals
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Convert Any PDF or Document into Interactive Slides
              </h2>
            </div>
          </div>
          <p className="text-xs text-indigo-200 mt-2 max-w-2xl">
            Upload any research whitepaper, financial report, executive proposal, or PDF. The engine automatically extracts metrics, constructs interactive charts, comparison matrices, process diagrams, and visual templates.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Sample Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Or Load a Sample Document
              </label>
              <span className="text-[11px] text-slate-500">Click to autofill with realistic sample</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSamplePdf('tech')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 text-left transition-all text-xs font-medium text-slate-800 cursor-pointer"
              >
                <div className="font-bold text-indigo-600">AI Systems Whitepaper</div>
                <div className="text-[10px] text-slate-500">Latency, Multi-Agent & Architecture</div>
              </button>

              <button
                type="button"
                onClick={() => handleSamplePdf('business')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 text-left transition-all text-xs font-medium text-slate-800 cursor-pointer"
              >
                <div className="font-bold text-emerald-600">Q4 Executive Report</div>
                <div className="text-[10px] text-slate-500">ARR, Growth Charts & Categories</div>
              </button>

              <button
                type="button"
                onClick={() => handleSamplePdf('architecture')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 text-left transition-all text-xs font-medium text-slate-800 cursor-pointer"
              >
                <div className="font-bold text-cyan-600">Cloud Security Blueprint</div>
                <div className="text-[10px] text-slate-500">Zero-Trust & Process Pipelines</div>
              </button>
            </div>
          </div>

          {/* Upload Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Upload PDF / Document File (.pdf, .txt, .md, .docx)
            </label>
            <div className="relative border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-4 text-center bg-slate-50/70 hover:bg-indigo-50/30 transition-all cursor-pointer">
              <input
                type="file"
                accept=".pdf,.txt,.md,.docx,.json"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center space-y-1.5 pointer-events-none">
                <UploadCloud className="w-8 h-8 text-indigo-600" />
                <div className="text-xs font-bold text-slate-800">
                  {fileName ? fileName : 'Drag and drop your PDF or click to browse'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Extracts text, numerical data tables, architecture points, and key milestones
                </div>
              </div>
            </div>
            {uploadStatus && (
              <div className="flex items-center space-x-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadStatus}</span>
              </div>
            )}
          </div>

          {/* Extracted Document Text / Manual Paste */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Document Content Text Preview
              </label>
              <span className="text-[11px] text-slate-500">
                {pdfContent.length > 0 ? `${pdfContent.length} characters` : 'Paste or edit text'}
              </span>
            </div>
            <textarea
              rows={5}
              value={pdfContent}
              onChange={(e) => setPdfContent(e.target.value)}
              placeholder="Paste your PDF text extract, research paper, article summary, or business proposal here..."
              className="w-full border border-slate-300 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 font-mono focus:border-indigo-500 focus:outline-none bg-white"
            />
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Slide Count
              </label>
              <div className="flex items-center space-x-2">
                {[4, 6, 8, 10, 12, 16].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSlideCount(num)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      slideCount === num
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {num} Slides
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Visual Theme Style
              </label>
              <select
                value={styleTheme}
                onChange={(e) => setStyleTheme(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none bg-white"
              >
                <option value="Modern Slate & Indigo">Modern Slate & Indigo (Keynote High-Contrast)</option>
                <option value="Quantum Emerald">Quantum Emerald (Data & Financial)</option>
                <option value="Cyber Cyan & Obsidian">Cyber Cyan & Obsidian (Technical & Cloud)</option>
                <option value="Executive Crimson">Executive Crimson (Leadership & Strategy)</option>
                <option value="Quartz Studio (Light)">Quartz Studio Light (Clean Whiteboard)</option>
              </select>
            </div>
          </div>

          {/* Focus Areas Directive */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Focus Areas & Extraction Directives
            </label>
            <input
              type="text"
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
              placeholder="e.g. Extract quarterly growth percentages, system pipeline diagrams, and pros/cons comparison"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Transforms document findings into interactive Recharts & Process Diagrams
          </span>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateFromPdf}
              disabled={isLoading || !pdfContent.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isLoading ? 'Synthesizing Interactive Deck...' : `Generate ${slideCount} Interactive Slides`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
