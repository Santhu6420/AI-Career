import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  Copy, 
  RefreshCw, 
  Check, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FolderGit2, 
  Sliders,
  Target
} from 'lucide-react';
import { ResumeData, WorkExperienceItem, EducationItem, SkillCategory, ProjectItem } from '../types';
import { AdvancedExplainerModal } from './AdvancedExplainerModal';
import { Zap } from 'lucide-react';

interface ResumeBuilderProps {
  initialData?: ResumeData;
}

const defaultResume: ResumeData = {
  atsScore: 94,
  atsSuggestions: [
    "Include quantifiable metrics (% speed increase, cost reduction) in experience bullets.",
    "Add cloud deployment keywords (Docker, AWS/GCP, CI/CD) to match modern job filters.",
    "Ensure section headers use standardized names for accurate parsing by Workday and Greenhouse ATS.",
    "Highlight specific frameworks (React 19, TypeScript, Node.js) in your skills summary.",
  ],
  personalInfo: {
    fullName: "Payili Santhosh",
    title: "AI Solutions Architect & Full Stack Engineer",
    email: "payilisanthosh@gmail.com",
    phone: "+91 6300655960",
    location: "Hyderabad, India (Open to Remote)",
    linkedin: "linkedin.com/in/payilisanthosh",
    github: "github.com/payilisanthosh",
    portfolio: "payilisanthosh.dev",
  },
  summary:
    "Results-driven Senior Software Engineer with 6+ years of experience architecting high-scale distributed web applications and modern cloud-native systems. Proven track record of reducing latency by 48%, scaling APIs to 50M+ daily requests, and leading cross-functional engineering teams to ship high-impact features on time.",
  skills: [
    {
      category: "Frontend Engineering",
      items: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux Toolkit", "WebSockets", "Vite"],
    },
    {
      category: "Backend & Databases",
      items: ["Node.js", "Express", "Python", "FastAPI", "PostgreSQL", "MongoDB", "Redis", "GraphQL"],
    },
    {
      category: "DevOps & Cloud",
      items: ["Docker", "Kubernetes", "AWS (ECS, S3, Lambda)", "CI/CD Pipelines", "Terraform", "Git"],
    },
    {
      category: "Architecture & Practices",
      items: ["Microservices", "RESTful APIs", "System Design", "TDD / Jest", "Agile / Scrum", "ATS Optimization"],
    },
  ],
  experience: [
    {
      company: "Apex Cloud Solutions",
      role: "Senior Full Stack Engineer",
      location: "San Francisco, CA",
      startDate: "2022",
      endDate: "Present",
      current: true,
      bullets: [
        "Architected real-time event streaming pipeline processing 35M+ telemetry events/day, reducing processing latency by 48%.",
        "Engineered responsive React/TypeScript frontend dashboard used by 120,000+ monthly active enterprise customers.",
        "Refactored legacy monolith into Node.js microservices, cutting server infrastructure costs by $85,000 annually.",
        "Mentored 6 junior and mid-level engineers through structured code reviews and bi-weekly architecture brown-bags.",
      ],
    },
    {
      company: "NextGen Software Labs",
      role: "Full Stack Software Engineer",
      location: "Austin, TX",
      startDate: "2019",
      endDate: "2022",
      current: false,
      bullets: [
        "Developed core billing and subscription checkout workflows, boosting checkout conversion by 18.5%.",
        "Implemented comprehensive automated testing suite with Jest and Cypress, increasing test coverage from 54% to 91%.",
        "Optimized PostgreSQL database queries and indexing strategies, decreasing P99 query latency from 850ms to 45ms.",
        "Collaborated with UX design and product management to deliver 14 high-priority sprint deliverables ahead of schedule.",
      ],
    },
  ],
  education: [
    {
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      graduationYear: "2019",
      gpaOrHonors: "3.85 GPA / Magna Cum Laude",
    },
  ],
  projects: [
    {
      name: "OmniData Analytics Platform",
      description: "High-performance data visualization engine supporting million-row interactive scatter plots and filtering.",
      technologies: ["React", "TypeScript", "D3.js", "Node.js", "Web Workers"],
      link: "github.com/alexrivera/omnidata",
      bullets: [
        "Built canvas-accelerated data visualizer rendering 500,000+ data points smoothly at 60 FPS.",
        "Adopted by 4,500+ GitHub developers with 1,200+ stars.",
      ],
    },
    {
      name: "AI Prompt Orchestration Hub",
      description: "Open-source developer tool for testing, versioning, and benchmarking LLM prompt workflows with structured schema validation.",
      technologies: ["Next.js", "Python", "FastAPI", "PostgreSQL", "Tailwind CSS"],
      link: "github.com/alexrivera/prompt-hub",
      bullets: [
        "Designed multi-provider fallback engine ensuring 99.9% prompt execution uptime.",
        "Implemented automated evaluation benchmarks scoring output consistency.",
      ],
    },
  ],
};

export const ResumeBuilder: React.FC<ResumeBuilderProps> = () => {
  const [resume, setResume] = useState<ResumeData>(defaultResume);
  const [targetRole, setTargetRole] = useState('Senior Full Stack Software Engineer');
  const [jobDescription, setJobDescription] = useState(
    'Seeking a Senior Full Stack Engineer with deep expertise in React, TypeScript, Node.js, distributed microservices, and AWS cloud architecture. Must have experience optimizing web performance and scaling APIs to millions of requests.'
  );
  const [userPrompt, setUserPrompt] = useState('Emphasize high scale distributed systems, latency reduction, and technical leadership.');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [template, setTemplate] = useState<'modern' | 'minimal' | 'tech' | 'executive'>('modern');
  const [copied, setCopied] = useState(false);
  const [builderMode, setBuilderMode] = useState<'editor_preview' | 'ats_vault'>('editor_preview');
  const [explainerTopic, setExplainerTopic] = useState<string>('');
  const [explainerContext, setExplainerContext] = useState<string>('');
  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);

  const openAdvancedExplainer = (topic: string, context?: string) => {
    setExplainerTopic(topic);
    setExplainerContext(context || '');
    setIsExplainerOpen(true);
  };

  const handleGenerateAi = async (action: 'generate' | 'tailor' | 'enhance_bullets') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tools/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          targetRole,
          jobDescription,
          userPrompt,
          currentResume: resume,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResume(data.data);
      }
    } catch (err) {
      console.error('Error calling resume API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `# ${resume.personalInfo.fullName}
**${resume.personalInfo.title}**
${resume.personalInfo.email} | ${resume.personalInfo.phone} | ${resume.personalInfo.location}
${resume.personalInfo.linkedin ? `LinkedIn: ${resume.personalInfo.linkedin}` : ''} | ${resume.personalInfo.github ? `GitHub: ${resume.personalInfo.github}` : ''}

## Professional Summary
${resume.summary}

## Technical Skills
${resume.skills.map((s) => `- **${s.category}:** ${s.items.join(', ')}`).join('\n')}

## Work Experience
${resume.experience
  .map(
    (exp) => `### ${exp.role} — ${exp.company}
*${exp.startDate} - ${exp.endDate} | ${exp.location}*
${exp.bullets.map((b) => `- ${b}`).join('\n')}`
  )
  .join('\n\n')}

## Education
${resume.education.map((edu) => `- **${edu.degree} in ${edu.fieldOfStudy}** — ${edu.institution} (${edu.graduationYear}) ${edu.gpaOrHonors ? `[${edu.gpaOrHonors}]` : ''}`).join('\n')}

## Projects
${resume.projects
  .map(
    (p) => `### ${p.name} (${p.technologies.join(', ')})
${p.description}
${p.bullets.map((b) => `- ${b}`).join('\n')}`
  )
  .join('\n\n')}`;

    navigator.clipboard.writeText(md);
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
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI ATS Resume Builder
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Build ATS-optimized resumes tailored for target job postings with metric-enhanced Google X-Y-Z bullet points.
          </p>
        </div>

        {/* ATS Score & Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-xs text-emerald-800 font-medium">ATS Match Score</div>
              <div className="text-lg font-extrabold text-emerald-700 leading-none">{resume.atsScore}/100</div>
            </div>
          </div>

          <button
            onClick={() =>
              openAdvancedExplainer(
                `Enterprise ATS Screening & Ranking Algorithm: ${targetRole}`,
                `Role: ${targetRole}\nATS Score: ${resume.atsScore}/100\nTarget JD:\n${jobDescription}\nATS Suggestions:\n${resume.atsSuggestions.join('\n')}`
              )
            }
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Explain ATS Algorithm</span>
          </button>

          <button
            id="print-resume-btn"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs sm:text-sm flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
          <button
            id="copy-markdown-btn"
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-medium text-xs sm:text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Markdown'}</span>
          </button>
        </div>
      </div>

      {/* AI Controls Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm text-white">AI Optimization & Tailoring Controls</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">Gemini 3.7 Flash Engine</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Role Title</label>
            <input
              id="resume-target-role-input"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Job Description (for ATS keyword matching)</label>
            <input
              id="resume-job-desc-input"
              type="text"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="Paste job posting snippet..."
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            id="btn-tailor-resume"
            onClick={() => handleGenerateAi('tailor')}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
            <span>{isLoading ? 'Optimizing...' : 'Tailor & Boost ATS Score'}</span>
          </button>
          <button
            id="btn-enhance-bullets"
            onClick={() => handleGenerateAi('enhance_bullets')}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Polish Bullets (Google STAR Formula)</span>
          </button>
          <button
            id="btn-regenerate-full"
            onClick={() => handleGenerateAi('generate')}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Generate New Role Profile</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setBuilderMode('editor_preview')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            builderMode === 'editor_preview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Resume Workspace & ATS Preview</span>
        </button>

        <button
          onClick={() => setBuilderMode('ats_vault')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            builderMode === 'ats_vault'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>ATS Algorithm & Recruiter Knowledge Vault</span>
        </button>
      </div>

      {builderMode === 'ats_vault' ? (
        /* Comprehensive ATS & Recruiter Knowledge Vault */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              ATS Screening Algorithm & Executive Recruiter Guide
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Complete breakdown of how modern Applicant Tracking Systems (Workday, Greenhouse, Taleo, Lever, iCIMS) parse and score candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vault Card 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">01</span>
                <h3 className="font-bold text-slate-900 text-base">The Google X-Y-Z Formula</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standardized by Laszlo Bock (Former Google Head of People Ops):
              </p>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-mono">
                "Accomplished [X], as measured by [Y], by doing [Z]"
              </div>
              <p className="text-xs text-slate-700">
                <strong>Example:</strong> "Reduced server latency by 48% (Y) on 35M daily requests (X) by architecting an asynchronous event streaming pipeline in Node.js (Z)."
              </p>
            </div>

            {/* Vault Card 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">02</span>
                <h3 className="font-bold text-slate-900 text-base">ATS Parser Architecture</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                How ATS parsers convert PDF/Word documents into structured database entities:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Section Header Parsing:</strong> Standard headers ("Work Experience", "Education", "Skills") get 100% recognition. Custom headers fail.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Taxonomy Matchers:</strong> Matches exact phrases against O*NET and internal company skill ontologies.</span>
                </li>
              </ul>
            </div>

            {/* Vault Card 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">03</span>
                <h3 className="font-bold text-slate-900 text-base">Formatting Landmines to Avoid</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Elements that cause ATS OCR engines to corrupt or discard resumes:
              </p>
              <ul className="space-y-1.5 text-xs text-rose-800">
                <li className="flex items-start space-x-1.5">
                  <span className="font-bold">✕</span>
                  <span><strong>Tables & Multi-Columns:</strong> Parsers read horizontally across columns, scrambling content.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="font-bold">✕</span>
                  <span><strong>Headers & Footers:</strong> Contact info placed in Word headers is ignored by Taleo.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="font-bold">✕</span>
                  <span><strong>Graphics & Skill Bar Sliders:</strong> Invisible to text parsers and looked down upon by hiring managers.</span>
                </li>
              </ul>
            </div>

            {/* Vault Card 4 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs">04</span>
                <h3 className="font-bold text-slate-900 text-base">High-Impact Action Verb Bank</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-900">Leadership:</span>
                  <span className="text-slate-600 ml-1">Spearheaded, Orchestrated, Championed, Directed, Mentored</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Architecture:</span>
                  <span className="text-slate-600 ml-1">Architected, Engineered, Formulated, Overhauled, Deployed</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Optimization:</span>
                  <span className="text-slate-600 ml-1">Accelerated, Compressed, Maximized, Streamlined, Reduced</span>
                </div>
              </div>
            </div>

            {/* Vault Card 5 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700 font-bold text-xs">05</span>
                <h3 className="font-bold text-slate-900 text-base">The 6-Second Recruiter Scan</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eye-tracking research shows human recruiters focus on 6 key anchor points:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700">
                <li>Candidate Name & Target Title</li>
                <li>Current Company & Title</li>
                <li>Current Start and End Date</li>
                <li>Previous Company & Title</li>
                <li>Previous Start and End Date</li>
                <li>Education & Core Tech Stack</li>
              </ol>
            </div>

            {/* Vault Card 6 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs">06</span>
                <h3 className="font-bold text-slate-900 text-base">Target Keyword Density Formula</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ideal keyword balance to pass ATS filters without keyword stuffing:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Primary Skills:</strong> Mention 2–3 times across summary, experience, and skills list.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Exact Job Title Match:</strong> Put the target job title in your header or summary.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Acronym + Spelled Out:</strong> e.g., "AWS (Amazon Web Services)", "CI/CD (Continuous Integration)".</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ATS Suggestions Callout */}
          {resume.atsSuggestions && resume.atsSuggestions.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                <Target className="w-4 h-4 text-amber-600" />
                <span>ATS Parser Insights & Recommended Keywords</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-800">
                {resume.atsSuggestions.map((sug, sIdx) => (
                  <div key={sIdx} className="flex items-start space-x-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

      {/* Main Content Layout: Editor & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Editor Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>Resume Data Editor</span>
            </h2>
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              {(['modern', 'minimal', 'tech', 'executive'] as const).map((t) => (
                <button
                  key={t}
                  id={`template-btn-${t}`}
                  onClick={() => setTemplate(t)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                    template === t ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Contact & Header</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-medium text-slate-600">Full Name</label>
                <input
                  type="text"
                  value={resume.personalInfo.fullName}
                  onChange={(e) =>
                    setResume({ ...resume, personalInfo: { ...resume.personalInfo, fullName: e.target.value } })
                  }
                  className="w-full text-xs p-2 rounded border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-medium text-slate-600">Professional Title</label>
                <input
                  type="text"
                  value={resume.personalInfo.title}
                  onChange={(e) =>
                    setResume({ ...resume, personalInfo: { ...resume.personalInfo, title: e.target.value } })
                  }
                  className="w-full text-xs p-2 rounded border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600">Email</label>
                <input
                  type="text"
                  value={resume.personalInfo.email}
                  onChange={(e) =>
                    setResume({ ...resume, personalInfo: { ...resume.personalInfo, email: e.target.value } })
                  }
                  className="w-full text-xs p-2 rounded border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600">Phone</label>
                <input
                  type="text"
                  value={resume.personalInfo.phone}
                  onChange={(e) =>
                    setResume({ ...resume, personalInfo: { ...resume.personalInfo, phone: e.target.value } })
                  }
                  className="w-full text-xs p-2 rounded border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-medium text-slate-600">Location</label>
                <input
                  type="text"
                  value={resume.personalInfo.location}
                  onChange={(e) =>
                    setResume({ ...resume, personalInfo: { ...resume.personalInfo, location: e.target.value } })
                  }
                  className="w-full text-xs p-2 rounded border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Summary Statement</h3>
            <textarea
              rows={4}
              value={resume.summary}
              onChange={(e) => setResume({ ...resume, summary: e.target.value })}
              className="w-full text-xs p-2.5 rounded border border-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Experience List Editor */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Work Experience ({resume.experience.length})</h3>
              <button
                onClick={() => {
                  const newExp: WorkExperienceItem = {
                    company: "New Company",
                    role: "Software Engineer",
                    location: "Remote",
                    startDate: "2023",
                    endDate: "Present",
                    current: true,
                    bullets: ["Led engineering initiatives delivering high impact results."],
                  };
                  setResume({ ...resume, experience: [newExp, ...resume.experience] });
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Role</span>
              </button>
            </div>

            {resume.experience.map((exp, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">
                    {exp.role || "Role"} at {exp.company || "Company"}
                  </span>
                  <button
                    onClick={() => {
                      const updated = resume.experience.filter((_, i) => i !== idx);
                      setResume({ ...resume, experience: updated });
                    }}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => {
                      const updated = [...resume.experience];
                      updated[idx].role = e.target.value;
                      setResume({ ...resume, experience: updated });
                    }}
                    placeholder="Role Title"
                    className="p-1.5 bg-white border border-slate-200 rounded text-xs"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...resume.experience];
                      updated[idx].company = e.target.value;
                      setResume({ ...resume, experience: updated });
                    }}
                    placeholder="Company Name"
                    className="p-1.5 bg-white border border-slate-200 rounded text-xs"
                  />
                </div>
                {/* Bullets */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-500">Bullet Points</label>
                  {exp.bullets.map((b, bIdx) => (
                    <textarea
                      key={bIdx}
                      rows={2}
                      value={b}
                      onChange={(e) => {
                        const updated = [...resume.experience];
                        updated[idx].bullets[bIdx] = e.target.value;
                        setResume({ ...resume, experience: updated });
                      }}
                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded font-normal text-slate-700 leading-normal"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Printable Resume Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Live ATS Document Preview</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">Standard Letter / A4 Proportions</span>
          </div>

          {/* The Printable Paper Container */}
          <div
            id="printable-resume-sheet"
            className={`bg-white border border-slate-300 rounded-xl shadow-md p-8 sm:p-10 space-y-6 text-slate-900 min-h-[850px] ${
              template === 'tech'
                ? 'font-sans border-t-8 border-t-slate-900'
                : template === 'minimal'
                ? 'font-sans'
                : template === 'executive'
                ? 'font-serif border-t-8 border-t-amber-900'
                : 'font-sans border-t-8 border-t-indigo-600'
            }`}
          >
            {/* Resume Header */}
            <div className="border-b border-slate-200 pb-4 space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {resume.personalInfo.fullName}
              </h1>
              <p className="text-base font-semibold text-indigo-700">
                {resume.personalInfo.title}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 pt-1">
                <span>{resume.personalInfo.email}</span>
                <span>•</span>
                <span>{resume.personalInfo.phone}</span>
                <span>•</span>
                <span>{resume.personalInfo.location}</span>
                {resume.personalInfo.linkedin && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-600 font-medium">{resume.personalInfo.linkedin}</span>
                  </>
                )}
                {resume.personalInfo.github && (
                  <>
                    <span>•</span>
                    <span className="text-slate-700 font-medium">{resume.personalInfo.github}</span>
                  </>
                )}
              </div>
            </div>

            {/* Professional Summary */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                Professional Summary
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                {resume.summary}
              </p>
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                Technical Proficiencies
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {resume.skills.map((grp, gIdx) => (
                  <div key={gIdx} className="text-slate-800">
                    <span className="font-bold text-slate-900">{grp.category}: </span>
                    <span className="text-slate-700">{grp.items.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                Professional Experience
              </h2>
              {resume.experience.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{exp.role}</span>
                      <span className="text-slate-600"> — {exp.company}</span>
                    </div>
                    <span className="text-slate-500 font-medium text-[11px]">
                      {exp.startDate} - {exp.endDate} | {exp.location}
                    </span>
                  </div>
                  <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-700 leading-relaxed">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                Technical Projects & Open Source
              </h2>
              {resume.projects.map((proj, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-bold text-slate-900">{proj.name}</span>
                    <span className="text-slate-500 text-[11px]">[{proj.technologies.join(', ')}]</span>
                  </div>
                  <p className="text-xs text-slate-600">{proj.description}</p>
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-700">
                    {proj.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                Education
              </h2>
              {resume.education.map((edu, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                    <span className="text-slate-600"> — {edu.institution}</span>
                  </div>
                  <span className="text-slate-500 font-medium text-[11px]">
                    {edu.graduationYear} {edu.gpaOrHonors && `• ${edu.gpaOrHonors}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Advanced Explainer Modal */}
      <AdvancedExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        initialTopic={explainerTopic}
        sourceTool="ATS Resume Builder"
        contextSnippet={explainerContext}
      />
    </div>
  );
};
