import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Code2, 
  FileText, 
  Compass, 
  BarChart3, 
  Sheet, 
  Presentation, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Terminal,
  ShieldCheck,
  Zap,
  BookOpen,
  Boxes
} from 'lucide-react';
import { ActiveTool } from '../types';

interface ArchitectureGuideProps {
  onSelectTool?: (tool: ActiveTool) => void;
  setActiveTool?: (tool: ActiveTool) => void;
}

export const ArchitectureGuide: React.FC<ArchitectureGuideProps> = ({ onSelectTool, setActiveTool }) => {
  const [selectedBlueprint, setSelectedBlueprint] = useState<'resume' | 'roadmap' | 'powerbi' | 'excel' | 'ppt'>('resume');

  const handleSelectTool = (tool: ActiveTool) => {
    if (typeof onSelectTool === 'function') {
      onSelectTool(tool);
    } else if (typeof setActiveTool === 'function') {
      setActiveTool(tool);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const coreFeatures = [
    {
      icon: Layers,
      title: '1. Structured JSON Output Contracts',
      badge: 'Core Reliability',
      description:
        'Instead of free-form unpredictable text, production AI tools enforce a strict JSON Schema (`responseSchema` with `@google/genai`). This guarantees the frontend receives typed arrays, numbers, and objects ready for instant UI rendering.',
      codeSnippet: `const response = await ai.models.generateContent({
  model: 'gemini-3.7-flash',
  contents: userPrompt,
  config: {
    responseMimeType: 'application/json',
    responseSchema: { type: Type.OBJECT, properties: { ... } }
  }
});`,
    },
    {
      icon: Terminal,
      title: '2. Persona & Grounding System Prompts',
      badge: 'Expert Output',
      description:
        'System instructions frame the AI as a specialized domain authority (e.g. "Microsoft MVP DAX Architect" or "Executive Resume ATS Optimizer") and instruct it to strictly follow proven industry frameworks like Google XYZ resume format.',
      codeSnippet: `config: {
  systemInstruction: "You are an elite ATS optimization and technical resume writer expert. Follow the STAR / XYZ formula (Accomplished [X] measured by [Y] by doing [Z])."
}`,
    },
    {
      icon: ShieldCheck,
      title: '3. Server-Side Proxy & API Protection',
      badge: 'Security & Safety',
      description:
        'API keys (`process.env.GEMINI_API_KEY`) remain strictly encapsulated on the Node/Express backend. The browser communicates exclusively via authenticated `/api/tools/*` endpoints, keeping credentials hidden from client-side DevTools.',
      codeSnippet: `// server.ts -> API Route Handler
app.post('/api/tools/resume', async (req, res) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const result = await ai.models.generateContent(...);
  res.json({ success: true, data: result.text });
});`,
    },
    {
      icon: Zap,
      title: '4. Deterministic Client-Side Parsers & Sandboxes',
      badge: 'Hybrid Execution',
      description:
        'The AI generates formulas, metrics, and models; the frontend executes them deterministically. For Excel formulas or Power BI visuals, the UI parses and renders charts live in the browser using SVG/Canvas/Recharts.',
      codeSnippet: `// Local calculation engine parses generated formulas
const evaluatedResult = executeFormula(cellFormula, gridData);
renderChartVisualizer(dashboardWidgets);`,
    },
    {
      icon: Boxes,
      title: '5. Dynamic Context & User File Injection',
      badge: 'Hyper-Personalized',
      description:
        'Users can inject existing job descriptions, target company requirements, raw CSV data, or current resume drafts directly into the prompt context payload for contextual tailoring.',
      codeSnippet: `const prompt = \`TARGET ROLE: \${targetRole}
JOB DESCRIPTION: \${jobDescription}
CURRENT DRAFT: \${JSON.stringify(currentData)}\`;`,
    },
    {
      icon: BookOpen,
      title: '6. Multi-Format Document Serialization',
      badge: 'Production Ready',
      description:
        'Modern AI tools transform generated state into real downloadable artifacts: Printable PDF resumes, DAX/M-code scripts, CSV spreadsheets, Markdown files, and full-screen PPT slide presentations.',
      codeSnippet: `exportToPdf(resumeElement);
downloadCsv(sheetGrid);
launchPresentationMode(slides);`,
    },
  ];

  const blueprints = {
    resume: {
      title: 'How to Build an AI Resume Builder',
      subtitle: 'ATS Keyword Scoring, Google X-Y-Z Bullet Polishing & Multi-Template Export',
      toolId: 'resume' as ActiveTool,
      buttonText: 'Launch Live Resume Builder',
      steps: [
        {
          step: '1. Ingest User Data & Target Job Description',
          detail: 'Provide structured inputs for personal details, work experience, projects, skills, plus the target job description to match against.',
        },
        {
          step: '2. Gemini ATS Analysis & Keyword Matching',
          detail: 'The AI compares the resume skills against the job posting, calculates an ATS match score (0-100), and outputs missing industry keywords.',
        },
        {
          step: '3. Metric Enhancement (STAR & Google XYZ)',
          detail: 'The AI transforms weak bullets ("wrote code for website") into high-impact achievements ("Engineered real-time API reducing latency by 42% for 120K users").',
        },
        {
          step: '4. Live Reactive Template Rendering & PDF Export',
          detail: 'Render into Modern, Minimalist, Tech, or Executive printable layout with zero CSS layout shift for clean browser print/PDF saving.',
        },
      ],
      samplePrompt: `System: "You are an ATS Optimization Expert. Output valid JSON schema."
User Prompt: "Tailor this software engineer resume for Senior Frontend Engineer at Stripe. Emphasize React, TypeScript, performance, and payment processing."`,
    },
    roadmap: {
      title: 'How to Build an AI Roadmap Generator',
      subtitle: 'Hierarchical Phase Trees, Skill Prerequisites & Interactive Checklists',
      toolId: 'roadmap' as ActiveTool,
      buttonText: 'Launch Live Roadmap Generator',
      steps: [
        {
          step: '1. Define Career Goal, Level & Timeline',
          detail: 'Accept user inputs for subject (e.g. AI Engineer, Full Stack), current proficiency (Beginner, Intermediate, Advanced), and target duration.',
        },
        {
          step: '2. Hierarchical Phase & Topic Schema Generation',
          detail: 'Gemini generates 4-6 sequential learning phases. Each phase contains distinct topics, practical mini-tasks, milestone projects, and curated documentation links.',
        },
        {
          step: '3. Interactive Visual Node Graph & State Tracker',
          detail: 'Render phases with color-coded badges, collapsible topic cards, and interactive progress check-offs stored in reactive state.',
        },
        {
          step: '4. Milestone Project Deliverable Checklist',
          detail: 'Each phase concludes with a portfolio-grade capstone project and concrete deliverables to prove job readiness.',
        },
      ],
      samplePrompt: `System: "You are a Tech Lead Curriculum Architect. Return JSON roadmap."
User Prompt: "Create a 6-month roadmap for Junior Developer to become Production AI Engineer specializing in LLMs, Gemini SDK, and FastAPI."`,
    },
    powerbi: {
      title: 'How to Build an AI Power BI & Analytics Studio',
      subtitle: 'DAX Measures, Power Query M-Code, Star Schema & Live Dashboard Visuals',
      toolId: 'powerbi' as ActiveTool,
      buttonText: 'Launch Live Power BI Studio',
      steps: [
        {
          step: '1. Ingest Business Domain & Metric Goals',
          detail: 'User specifies domain (E-Commerce, SaaS, Healthcare) and desired KPIs (YoY Revenue, Churn %, LTV, Rolling 90-Day Moving Average).',
        },
        {
          step: '2. High-Performance DAX Measure Synthesis',
          detail: 'Gemini generates verified DAX expressions with VAR/RETURN patterns, filter context handling, and calculation performance tips.',
        },
        {
          step: '3. Power Query M-Code & Star-Schema Modeling',
          detail: 'Designs Fact and Dimension tables (DimCustomer, DimDate, FactSales) with primary/foreign keys and 1:* cardinality relationships.',
        },
        {
          step: '4. Interactive Dashboard Mockup & Live Charts',
          detail: 'Frontend displays interactive KPI cards, bar charts, and line trends with Recharts to simulate an enterprise Power BI report.',
        },
      ],
      samplePrompt: `System: "You are a Microsoft Certified Power BI Architect. Output DAX and data models in JSON."
User Prompt: "Generate YoY Growth DAX, Customer Lifetime Value (LTV), and Star Schema for SaaS subscription analytics."`,
    },
    excel: {
      title: 'How to Build an AI Excel & Google Sheets Genius',
      subtitle: 'Formula Generator, Formula Explainer, VBA Macros & Live Interactive Spreadsheet',
      toolId: 'excel' as ActiveTool,
      buttonText: 'Launch Live Excel Engine',
      steps: [
        {
          step: '1. Plain-English Formula Query Parser',
          detail: 'User enters what they want to calculate (e.g., "Lookup price based on product and date, return 0 if missing").',
        },
        {
          step: '2. Modern vs Legacy Formula Generation',
          detail: 'Gemini generates modern formulas (XLOOKUP, FILTER, LET) and legacy alternatives (INDEX/MATCH, VLOOKUP) with component breakdowns.',
        },
        {
          step: '3. VBA Macro & Google Apps Script Creator',
          detail: 'Creates copyable VBA and Apps Script code blocks with installation steps for automated spreadsheet batch jobs.',
        },
        {
          step: '4. Live Sandbox Spreadsheet Grid',
          detail: 'Includes an editable 8x8 data grid where formulas like =SUM(), =AVERAGE(), =MAX() evaluate dynamically with CSV import/export.',
        },
      ],
      samplePrompt: `System: "You are an Excel MVP. Provide modern formula, legacy formula, explanation, and sample grid data."
User Prompt: "How to calculate employee bonus: 10% if sales > $50,000 and customer rating >= 4.5, otherwise 3%."`,
    },
    ppt: {
      title: 'How to Build an AI Slide Deck & PPT Creator',
      subtitle: 'Slide Deck Architect, Layout Synthesizer, Speaker Notes & Full-Screen Presentation Mode',
      toolId: 'ppt' as ActiveTool,
      buttonText: 'Launch Live Slide Deck Creator',
      steps: [
        {
          step: '1. Story Arc & Narrative Prompting',
          detail: 'User inputs topic, audience (Executives, Engineers, Students), slide count (3-10), and presentation style theme.',
        },
        {
          step: '2. Structured Slide Layout Synthesis',
          detail: 'Gemini structures slides into strategic layouts: Title Hook, Two-Column Compare, Key Metrics Highlight, and Bullet Cards.',
        },
        {
          step: '3. Keynote Speaker Notes Generation',
          detail: 'Each slide generates conversational, professional speaker notes to help presenters articulate key takeaways effortlessly.',
        },
        {
          step: '4. Full-Screen Presentation Viewport & Export',
          detail: 'Provides an interactive slide viewer with keyboard arrow navigation (Left/Right, Esc), theme toggle, and export capabilities.',
        },
      ],
      samplePrompt: `System: "You are an Executive Keynote Presentation Designer. Output slide deck JSON."
User Prompt: "Create a 5-slide pitch deck on AI Agents in Enterprise Automation for Series A investors."`,
    },
  };

  const currentBp = blueprints[selectedBlueprint];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Full Architecture & Implementation Blueprint</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How to Build & Run Production AI Tools
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Explore the 6 core architectural features powering modern AI applications, plus step-by-step implementation blueprints for Resume Builders, Roadmaps, Power BI, Excel, and Presentation tools.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            id="quick-start-resume"
            onClick={() => handleSelectTool('resume')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center space-x-2 cursor-pointer"
          >
            <span>Try Resume Builder</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            id="quick-start-roadmap"
            onClick={() => handleSelectTool('roadmap')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium text-sm transition-colors border border-slate-300 flex items-center space-x-2 cursor-pointer"
          >
            <span>Try Roadmaps</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            id="quick-start-powerbi"
            onClick={() => handleSelectTool('powerbi')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium text-sm transition-colors border border-slate-300 flex items-center space-x-2 cursor-pointer"
          >
            <span>Try Power BI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section 1: The 6 Core Features to Run AI Tools */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-indigo-600" />
            <span>The 6 Core Pillars to Run Production AI Tools</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Every reliable AI tool combines these 6 architectural foundations to deliver deterministic, structured, and fast user experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                id={`core-feature-card-${idx}`}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <pre className="bg-slate-900 text-cyan-300 text-[11px] p-2.5 rounded-lg overflow-x-auto font-mono leading-tight">
                    <code>{feat.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Interactive Blueprint Explorer */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Code2 className="w-6 h-6 text-indigo-600" />
            <span>How to Create Each AI Tool: Step-by-Step Blueprints</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Click on any tool below to inspect its data flow, prompt schema, and launch its working interactive interface.
          </p>
        </div>

        {/* Blueprint Selector Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {[
            { id: 'resume', label: '1. Resume Builder', icon: FileText },
            { id: 'roadmap', label: '2. Roadmap Generator', icon: Compass },
            { id: 'powerbi', label: '3. Power BI Studio', icon: BarChart3 },
            { id: 'excel', label: '4. Excel & Sheets Genius', icon: Sheet },
            { id: 'ppt', label: '5. Slide Deck PPT', icon: Presentation },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = selectedBlueprint === item.id;
            return (
              <button
                key={item.id}
                id={`blueprint-tab-${item.id}`}
                onClick={() => setSelectedBlueprint(item.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Blueprint Content Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Architectural Guide</span>
              <h3 className="text-2xl font-bold text-slate-900">{currentBp.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{currentBp.subtitle}</p>
            </div>
            <button
              id={`launch-blueprint-btn-${selectedBlueprint}`}
              onClick={() => handleSelectTool(currentBp.toolId)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
            >
              <span>{currentBp.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Step-by-Step Implementation */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Implementation Steps</span>
              </h4>
              <div className="space-y-3">
                {currentBp.steps.map((st, sIdx) => (
                  <div key={sIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="font-semibold text-slate-900 text-sm">{st.step}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{st.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Prompt & Schema Architecture */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-indigo-600" />
                <span>Prompt & Schema Architecture</span>
              </h4>
              <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-slate-300 space-y-3 overflow-x-auto">
                <div>
                  <span className="text-slate-500">// Gemini 3.7 Flash Execution Pipeline</span>
                </div>
                <div className="text-emerald-400">
                  {currentBp.samplePrompt}
                </div>
                <div className="border-t border-slate-800 pt-3">
                  <span className="text-amber-400">// Output JSON Format:</span>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Type-enforced JSON schema verified against TypeScript interfaces with automated fallback handling.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-indigo-950">Ready to test this tool live?</p>
                  <p className="text-[11px] text-indigo-700">Experience the working interface with customizable prompts & export options.</p>
                </div>
                <button
                  onClick={() => handleSelectTool(currentBp.toolId)}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Open Tool
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
