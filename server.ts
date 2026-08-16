import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// Helper: Clean JSON string from potential Markdown code fences
// -------------------------------------------------------------
function cleanJsonString(raw: string): string {
  let cleaned = (raw || "").trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
  }
  return cleaned.trim();
}

// -------------------------------------------------------------
// Helper: Sleep for exponential backoff
// -------------------------------------------------------------
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// -------------------------------------------------------------
// Resilient Generation Helper with Circuit Breaker & Fallbacks
// -------------------------------------------------------------
interface ResilientGenerateOptions {
  contents: any;
  config?: any;
  primaryModel?: string;
  fallbackModels?: string[];
  maxRetriesPerModel?: number;
}

// In-memory circuit breaker cooldown timestamps for overloaded models
const modelCooldowns = new Map<string, number>();

async function generateWithRetryAndFallback(
  ai: GoogleGenAI,
  options: ResilientGenerateOptions
): Promise<{ text: string; modelUsed: string }> {
  const preferredPrimary = options.primaryModel || "gemini-3.7-flash";
  const fallbacks = options.fallbackModels || [
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.1-pro-preview",
  ];

  // Combine and deduplicate
  const allModels = Array.from(new Set([preferredPrimary, ...fallbacks]));

  // Sort candidate models: models NOT in cooldown come first
  const now = Date.now();
  const sortedCandidates = allModels.sort((a, b) => {
    const aCooldown = (modelCooldowns.get(a) || 0) > now ? 1 : 0;
    const bCooldown = (modelCooldowns.get(b) || 0) > now ? 1 : 0;
    return aCooldown - bCooldown;
  });

  let lastError: any = null;

  for (const model of sortedCandidates) {
    const isModelInCooldown = (modelCooldowns.get(model) || 0) > Date.now();
    // If all models are in cooldown or we are trying models, proceed
    const maxRetries = isModelInCooldown ? 0 : (options.maxRetriesPerModel ?? 1);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });

        const text = response.text || "";
        if (text) {
          // Reset cooldown on success
          modelCooldowns.delete(model);
          return { text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMessage = err?.message || String(err);
        const isHighDemandOr503 =
          err?.status === 503 ||
          err?.status === 429 ||
          errMessage.includes("503") ||
          errMessage.includes("UNAVAILABLE") ||
          errMessage.includes("high demand") ||
          errMessage.includes("ResourceExhausted") ||
          errMessage.includes("RESOURCE_EXHAUSTED") ||
          errMessage.includes("overloaded");

        if (isHighDemandOr503) {
          // Model is experiencing high demand: set 60s cooldown and immediately switch to next model
          modelCooldowns.set(model, Date.now() + 60000);
          console.info(
            `[Gemini Adaptive Router] Model ${model} is experiencing high demand (503/429). Instantly routing to next healthy model.`
          );
          // Break immediately to try the next model candidate without waiting
          break;
        }

        console.warn(
          `[Gemini Retry Handler] Model ${model} attempt ${attempt + 1} encountered: ${errMessage}`
        );

        if (attempt < maxRetries) {
          await sleep(300);
        }
      }
    }
  }

  throw lastError || new Error("All model generation attempts failed.");
}

// -------------------------------------------------------------
// Health Check Endpoint
// -------------------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: "gemini-3.7-flash",
  });
});

// -------------------------------------------------------------
// 1. Resume Builder API
// -------------------------------------------------------------
app.post("/api/tools/resume", async (req, res) => {
  try {
    const { action, currentResume, jobDescription, targetRole, userPrompt } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // High-quality deterministic fallback if no API key
      return res.json({
        success: true,
        source: "fallback",
        data: getFallbackResume(targetRole || "Full Stack Software Engineer", jobDescription),
      });
    }

    let prompt = "";
    let systemInstruction = "You are an elite ATS (Applicant Tracking System) optimization and technical resume writer expert. Output strictly valid JSON.";

    if (action === "tailor") {
      prompt = `Optimize and tailor the following resume for this target job description:
TARGET ROLE: ${targetRole || "Software Engineer"}
JOB DESCRIPTION:
${jobDescription || "Standard software development role"}

CURRENT RESUME DATA:
${JSON.stringify(currentResume)}

ADDITIONAL USER INSTRUCTIONS:
${userPrompt || "Make bullet points follow the Google X-Y-Z formula (Accomplished [X] as measured by [Y], by doing [Z]). Ensure high ATS keyword match."}

Return a structured resume object with atsScore (0-100), atsSuggestions (array of strings), summary, personalInfo, experience, education, skills, and projects.`;
    } else if (action === "enhance_bullets") {
      prompt = `Enhance the bullet points of this experience entry to be punchy, metric-driven, and ATS-optimized:
ROLE: ${targetRole}
BULLETS TO ENHANCE:
${JSON.stringify(currentResume?.experience || userPrompt)}

Return an updated experience list with metrics, strong action verbs, and quantified impact.`;
    } else {
      prompt = `Generate a complete, high-impact ATS-friendly professional resume for:
TARGET ROLE: ${targetRole || "Full Stack Developer"}
BACKGROUND INFO: ${userPrompt || "5 years experience building web applications, React, Node.js, Cloud, microservices"}
JOB DESCRIPTION (if any): ${jobDescription || "N/A"}

Create realistic, impressive achievements with quantifiable metrics, modern tech stack, and ATS score analysis.`;
    }

    const { text, modelUsed } = await generateWithRetryAndFallback(ai, {
      primaryModel: "gemini-3.7-flash",
      fallbackModels: ["gemini-3.1-flash-lite", "gemini-flash-latest"],
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: { type: Type.INTEGER, description: "ATS score out of 100" },
            atsSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable ATS optimization suggestions",
            },
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                title: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                github: { type: Type.STRING },
                portfolio: { type: Type.STRING },
              },
              required: ["fullName", "title", "email"],
            },
            summary: { type: Type.STRING, description: "Professional summary paragraph" },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  items: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["category", "items"],
              },
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  role: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["company", "role", "startDate", "endDate", "bullets"],
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  fieldOfStudy: { type: Type.STRING },
                  graduationYear: { type: Type.STRING },
                  gpaOrHonors: { type: Type.STRING },
                },
                required: ["institution", "degree", "graduationYear"],
              },
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  link: { type: Type.STRING },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["name", "description", "technologies", "bullets"],
              },
            },
          },
          required: ["atsScore", "atsSuggestions", "personalInfo", "summary", "skills", "experience", "education", "projects"],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonString(text) || "{}");
    return res.json({ success: true, source: "gemini", modelUsed, data: parsed });
  } catch (error: any) {
    console.error("Resume API error:", error);
    return res.json({
      success: true,
      source: "fallback",
      data: getFallbackResume(req.body.targetRole || "Full Stack Software Engineer", req.body.jobDescription),
      errorNote: error.message,
    });
  }
});

// -------------------------------------------------------------
// 2. Roadmap Generator API
// -------------------------------------------------------------
app.post("/api/tools/roadmap", async (req, res) => {
  try {
    const { topic, experienceLevel, timeframe, focusGoal } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "fallback",
        data: getFallbackRoadmap(topic || "Full Stack Web Development", experienceLevel || "Beginner"),
      });
    }

    const prompt = `Create an interactive, structured, comprehensive learning and career roadmap for:
TOPIC/CAREER: ${topic || "Modern AI & Full Stack Engineering"}
EXPERIENCE LEVEL: ${experienceLevel || "Beginner to Advanced"}
TIMEFRAME: ${timeframe || "6 Months"}
FOCUS GOAL: ${focusGoal || "Become job-ready with production-grade portfolio projects"}

Provide 4-6 sequential phases. Each phase must contain clear topics, practical hands-on tasks, key milestone projects, estimated hours, and curated free resources.`;

    const { text, modelUsed } = await generateWithRetryAndFallback(ai, {
      primaryModel: "gemini-3.7-flash",
      fallbackModels: ["gemini-3.1-flash-lite", "gemini-flash-latest"],
      contents: prompt,
      config: {
        systemInstruction: "You are a senior tech lead and curriculum architect. Return structured JSON with comprehensive learning pathways.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            overview: { type: Type.STRING },
            targetRole: { type: Type.STRING },
            estimatedTotalWeeks: { type: Type.INTEGER },
            prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  estimatedWeeks: { type: Type.STRING },
                  badgeColor: { type: Type.STRING },
                  topics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                        practicalTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                        resources: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              title: { type: Type.STRING },
                              url: { type: Type.STRING },
                              type: { type: Type.STRING },
                            },
                            required: ["title", "type"],
                          },
                        },
                      },
                      required: ["name", "summary", "keyConcepts", "practicalTasks"],
                    },
                  },
                  milestoneProject: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["title", "description", "deliverables"],
                  },
                },
                required: ["phaseNumber", "title", "description", "estimatedWeeks", "topics", "milestoneProject"],
              },
            },
          },
          required: ["title", "overview", "targetRole", "phases"],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonString(text) || "{}");
    return res.json({ success: true, source: "gemini", modelUsed, data: parsed });
  } catch (error: any) {
    console.error("Roadmap API error:", error);
    return res.json({
      success: true,
      source: "fallback",
      data: getFallbackRoadmap(req.body.topic || "Full Stack Web Development", req.body.experienceLevel || "Beginner"),
      errorNote: error.message,
    });
  }
});

// -------------------------------------------------------------
// 3. Power BI & Data Analytics Architect API
// -------------------------------------------------------------
app.post("/api/tools/powerbi", async (req, res) => {
  try {
    const { domain, businessGoal, tablesDescription, requestedMetric } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "fallback",
        data: getFallbackPowerBI(domain || "E-Commerce & Retail Sales"),
      });
    }

    const prompt = `You are a Microsoft Certified Power BI Solution Architect and DAX Master.
Design a complete Power BI architecture and DAX calculation model for:
BUSINESS DOMAIN: ${domain || "SaaS Subscription & Customer Analytics"}
BUSINESS GOAL: ${businessGoal || "Optimize customer retention, track MRR growth, and visualize cohort churn"}
TABLES / SCHEMA CONTEXT: ${tablesDescription || "FactSales, DimCustomer, DimDate, DimProduct"}
SPECIFIC METRICS / REQUIREMENTS: ${requestedMetric || "YoY Growth, MoM Churn Rate, Customer Lifetime Value (LTV), Rolling 90-Day Revenue"}

Provide:
1. Production DAX measures with exact syntax, formatting, and mathematical explanation.
2. Power Query M-Code transformations for data cleaning and ETL.
3. Star Schema data model with tables, primary/foreign keys, and cardinalities (1:*, *:1).
4. Interactive Dashboard Mockup Specs with KPI cards, line charts, bar charts, and slicers.
5. Sample dataset for live chart visualization.`;

    const { text, modelUsed } = await generateWithRetryAndFallback(ai, {
      primaryModel: "gemini-3.7-flash",
      fallbackModels: ["gemini-3.1-flash-lite", "gemini-flash-latest"],
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Power BI / DAX / Power Query architect. Return valid JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dashboardTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            daxMeasures: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  measureName: { type: Type.STRING },
                  category: { type: Type.STRING },
                  formula: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  returnType: { type: Type.STRING },
                  performanceTip: { type: Type.STRING },
                },
                required: ["measureName", "formula", "explanation"],
              },
            },
            powerQueryMCode: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tableName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  mCode: { type: Type.STRING },
                },
                required: ["tableName", "mCode"],
              },
            },
            dataModel: {
              type: Type.OBJECT,
              properties: {
                tables: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      type: { type: Type.STRING, description: "Fact or Dimension" },
                      columns: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["name", "type", "columns"],
                  },
                },
                relationships: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      fromTable: { type: Type.STRING },
                      fromColumn: { type: Type.STRING },
                      toTable: { type: Type.STRING },
                      toColumn: { type: Type.STRING },
                      cardinality: { type: Type.STRING },
                      crossFilterDirection: { type: Type.STRING },
                    },
                    required: ["fromTable", "fromColumn", "toTable", "toColumn", "cardinality"],
                  },
                },
              },
              required: ["tables", "relationships"],
            },
            dashboardWidgets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  visualType: { type: Type.STRING, description: "kpi_card | bar_chart | line_chart | pie_chart" },
                  primaryValue: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  trend: { type: Type.STRING },
                  trendDirection: { type: Type.STRING, description: "up | down | neutral" },
                  chartData: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        value: { type: Type.NUMBER },
                        target: { type: Type.NUMBER },
                      },
                      required: ["name", "value"],
                    },
                  },
                },
                required: ["title", "visualType", "primaryValue"],
              },
            },
          },
          required: ["dashboardTitle", "summary", "daxMeasures", "dataModel", "dashboardWidgets"],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonString(text) || "{}");
    return res.json({ success: true, source: "gemini", modelUsed, data: parsed });
  } catch (error: any) {
    console.error("Power BI API error:", error);
    return res.json({
      success: true,
      source: "fallback",
      data: getFallbackPowerBI(req.body.domain || "E-Commerce & Retail Sales"),
      errorNote: error.message,
    });
  }
});

// -------------------------------------------------------------
// 4. Excel & Google Sheets Engine API
// -------------------------------------------------------------
app.post("/api/tools/excel", async (req, res) => {
  try {
    const { mode, userQuery, formulaToExplain, tableContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "fallback",
        data: getFallbackExcel(mode || "generate", userQuery),
      });
    }

    let prompt = "";
    if (mode === "explain") {
      prompt = `Explain the following Excel / Google Sheets formula in clear, simple steps:
FORMULA: ${formulaToExplain || userQuery}
CONTEXT (if any): ${tableContext || "General business spreadsheet"}

Break down each function, argument, how edge cases (like #N/A or blank cells) are handled, and provide a modern alternative (e.g. XLOOKUP instead of VLOOKUP or INDEX/MATCH).`;
    } else if (mode === "vba_macro") {
      prompt = `Write a robust Excel VBA Macro or Google Apps Script for:
REQUIREMENT: ${userQuery || "Loop through column A, format duplicates in red, and export filtered rows to new sheet"}
Include step-by-step installation instructions, error handling, and comments.`;
    } else {
      prompt = `Generate the ideal Excel / Google Sheets formula for this requirement:
REQUIREMENT: ${userQuery || "Look up employee salary based on Department and Role with multiple criteria"}
TABLE CONTEXT (if any): ${tableContext || "Column A: Name, Column B: Department, Column C: Role, Column D: Salary"}

Provide:
1. Primary Modern Formula (e.g., XLOOKUP, FILTER, LAMBDA, LET)
2. Classic Legacy Formula (compatible with older Excel 2016/2013)
3. Google Sheets specific variant (if different)
4. Step-by-step explanation
5. Sample dataset for live demonstration grid.`;
    }

    const { text, modelUsed } = await generateWithRetryAndFallback(ai, {
      primaryModel: "gemini-3.7-flash",
      fallbackModels: ["gemini-3.1-flash-lite", "gemini-flash-latest"],
      contents: prompt,
      config: {
        systemInstruction: "You are a master Excel MVP and Google Sheets specialist. Return valid JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            primaryFormula: { type: Type.STRING },
            legacyFormula: { type: Type.STRING },
            googleSheetsFormula: { type: Type.STRING },
            explanation: { type: Type.STRING },
            syntaxBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  part: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                },
                required: ["part", "meaning"],
              },
            },
            commonPitfalls: { type: Type.ARRAY, items: { type: Type.STRING } },
            vbaCode: { type: Type.STRING },
            appsScriptCode: { type: Type.STRING },
            sampleGrid: {
              type: Type.OBJECT,
              properties: {
                headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                rows: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
              },
              required: ["headers", "rows"],
            },
          },
          required: ["title", "primaryFormula", "explanation", "syntaxBreakdown"],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonString(text) || "{}");
    return res.json({ success: true, source: "gemini", modelUsed, data: parsed });
  } catch (error: any) {
    console.error("Excel API error:", error);
    return res.json({
      success: true,
      source: "fallback",
      data: getFallbackExcel(req.body.mode || "generate", req.body.userQuery),
      errorNote: error.message,
    });
  }
});

// -------------------------------------------------------------
// 5. Presentation / PPT Creator API
// -------------------------------------------------------------
app.post("/api/tools/ppt", async (req, res) => {
  try {
    const { topic, targetAudience, slideCount, styleTheme, userPrompt } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "fallback",
        data: getFallbackPresentation(topic || "Introduction to Artificial Intelligence"),
      });
    }

    const numSlides = Math.max(Number(slideCount) || 5, 1);
    const prompt = `Create a professional, high-engagement interactive presentation slide deck with EXACTLY ${numSlides} slides for:
TOPIC: ${topic || "The Future of Generative AI & Autonomous Agents"}
AUDIENCE: ${targetAudience || "Executive Leadership & Tech Investors"}
SLIDE COUNT: ${numSlides} slides
STYLE THEME: ${styleTheme || "Modern Tech (Clean, High Contrast, Bold Metrics)"}
SPECIAL INSTRUCTIONS: ${userPrompt || "Include rich visual layouts, quantifiable chart metrics with numerical data points for charts, step-by-step process diagrams, interactive poll questions, and insightful speaker notes."}

Design a cohesive story arc across all ${numSlides} slides with diverse interactive visual layouts:
- Title & Hook (layout: title_slide)
- Problem vs Solution (layout: two_column_compare)
- Performance Data & ROI (layout: interactive_chart with chartData and chartType 'bar' or 'area' or 'line')
- Key Architectural Pillars (layout: bullet_cards or metrics_highlight)
- Execution Roadmap / Process Diagram (layout: process_diagram with processSteps)
- Interactive Audience Poll (layout: live_poll with pollData)
- Case Studies, Timeline, Milestones, and Strategic Call to Action`;

    const { text, modelUsed } = await generateWithRetryAndFallback(ai, {
      primaryModel: "gemini-3.7-flash",
      fallbackModels: ["gemini-3.1-flash-lite", "gemini-flash-latest"],
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class presentation designer, visual data architect, and executive keynote speechwriter. Return valid JSON only with rich visual data points for interactive charts and diagrams.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deckTitle: { type: Type.STRING },
            deckSubtitle: { type: Type.STRING },
            theme: { type: Type.STRING },
            totalSlides: { type: Type.INTEGER },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: { type: Type.INTEGER },
                  layout: {
                    type: Type.STRING,
                    description: "title_slide | bullet_cards | two_column_compare | metrics_highlight | timeline_quote | interactive_chart | process_diagram | live_poll",
                  },
                  headline: { type: Type.STRING },
                  subhead: { type: Type.STRING },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                  statCallout: {
                    type: Type.OBJECT,
                    properties: {
                      number: { type: Type.STRING },
                      label: { type: Type.STRING },
                    },
                  },
                  leftColumnTitle: { type: Type.STRING },
                  leftColumnItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                  rightColumnTitle: { type: Type.STRING },
                  rightColumnItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                  speakerNotes: { type: Type.STRING },
                  visualBadge: { type: Type.STRING },
                  chartType: { type: Type.STRING, description: "bar | area | line | pie" },
                  chartData: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        value: { type: Type.NUMBER },
                        target: { type: Type.NUMBER },
                      },
                      required: ["name", "value"],
                    },
                  },
                  processSteps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        step: { type: Type.INTEGER },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        tag: { type: Type.STRING },
                      },
                      required: ["step", "title", "description"],
                    },
                  },
                  pollData: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            label: { type: Type.STRING },
                            votes: { type: Type.INTEGER },
                          },
                          required: ["id", "label", "votes"],
                        },
                      },
                    },
                  },
                  imageUrl: { type: Type.STRING },
                  imageCaption: { type: Type.STRING },
                  imagePlacement: { type: Type.STRING },
                },
                required: ["slideNumber", "layout", "headline", "speakerNotes"],
              },
            },
            sourceDocumentName: { type: Type.STRING },
            pdfAnalysisSummary: { type: Type.STRING },
          },
          required: ["deckTitle", "deckSubtitle", "totalSlides", "slides"],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonString(text) || "{}");
    return res.json({ success: true, source: "gemini", modelUsed, data: parsed });
  } catch (error: any) {
    console.error("PPT API error:", error);
    return res.json({
      success: true,
      source: "fallback",
      data: getFallbackPresentation(req.body.topic || "Introduction to Artificial Intelligence"),
      errorNote: error.message,
    });
  }
});

// Convert Any PDF or Document into Interactive Visual Slides & Templates
app.post("/api/tools/ppt/from-pdf", async (req, res) => {
  try {
    const { pdfContent, fileName, slideCount, styleTheme, focusAreas } = req.body;
    const ai = getGeminiClient();
    const numSlides = Math.max(3, Math.min(25, Number(slideCount) || 6));

    if (!ai) {
      return res.json({
        success: true,
        source: "fallback",
        data: {
          ...getFallbackPresentation(fileName ? `Document Analysis: ${fileName}` : "PDF Executive Breakdown"),
          sourceDocumentName: fileName || "Uploaded Document.pdf",
          pdfAnalysisSummary: "Analyzed PDF document structure, key findings, quantitative metrics, comparison matrices, and generated interactive charts, diagrams, and image visual cards.",
        },
      });
    }

    const prompt = `You are a Principal Technical Writer, Data Visualizer, and Keynote Presentation Architect.
Analyze the following PDF / Document content and transform it into a stunning, highly interactive presentation deck with live charts, process flows, comparison matrices, audience polls, and image recommendations:

DOCUMENT FILE NAME: ${fileName || "Uploaded Document.pdf"}
DESIRED SLIDE COUNT: ${numSlides} slides
VISUAL THEME: ${styleTheme || "Modern Slate & Indigo"}
FOCUS AREAS / DIRECTIVES: ${focusAreas || "Extract key architecture, data statistics, process flows, core arguments, and interactive visual charts."}

DOCUMENT CONTENT EXTRACT:
"""
${(pdfContent || "Summary of strategic document and key findings").slice(0, 18000)}
"""

REQUIREMENTS:
1. Synthesize a cohesive deck that captures the core essence, data points, and recommendations of the PDF.
2. Mix and match diverse interactive layout types across slides:
   - 'title_slide' for executive hook and top stats
   - 'interactive_chart' (with numeric chartData points and chartType 'bar' | 'line' | 'area' | 'pie')
   - 'two_column_compare' for before vs after, pros vs cons, or legacy vs modern
   - 'process_diagram' for workflow steps or implementation phases
   - 'live_poll' for engaging audience questions based on the PDF's dilemmas
   - 'image_showcase' or 'image_split' or 'bullet_cards' with relevant high-quality visual keywords/images
   - 'metrics_highlight' for key quantitative findings
3. Provide a concise 'pdfAnalysisSummary' describing what was synthesized from the document.
4. Include detailed speaker notes for every slide.`;

    const { text, modelUsed } = await generateWithRetryAndFallback(ai, {
      primaryModel: "gemini-3.7-flash",
      fallbackModels: ["gemini-3.1-flash-lite", "gemini-flash-latest"],
      contents: prompt,
      config: {
        systemInstruction: "You are an expert at converting documents and PDFs into interactive visual keynote presentations with structured JSON schemas.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deckTitle: { type: Type.STRING },
            deckSubtitle: { type: Type.STRING },
            theme: { type: Type.STRING },
            totalSlides: { type: Type.INTEGER },
            sourceDocumentName: { type: Type.STRING },
            pdfAnalysisSummary: { type: Type.STRING },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: { type: Type.INTEGER },
                  layout: {
                    type: Type.STRING,
                    description: "title_slide | bullet_cards | two_column_compare | metrics_highlight | timeline_quote | interactive_chart | process_diagram | live_poll | image_showcase | image_split | pdf_visual_deck",
                  },
                  headline: { type: Type.STRING },
                  subhead: { type: Type.STRING },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                  statCallout: {
                    type: Type.OBJECT,
                    properties: {
                      number: { type: Type.STRING },
                      label: { type: Type.STRING },
                    },
                  },
                  leftColumnTitle: { type: Type.STRING },
                  leftColumnItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                  rightColumnTitle: { type: Type.STRING },
                  rightColumnItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                  speakerNotes: { type: Type.STRING },
                  visualBadge: { type: Type.STRING },
                  chartType: { type: Type.STRING, description: "bar | area | line | pie" },
                  chartData: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        value: { type: Type.NUMBER },
                        target: { type: Type.NUMBER },
                      },
                      required: ["name", "value"],
                    },
                  },
                  processSteps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        step: { type: Type.INTEGER },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        tag: { type: Type.STRING },
                      },
                      required: ["step", "title", "description"],
                    },
                  },
                  pollData: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            label: { type: Type.STRING },
                            votes: { type: Type.INTEGER },
                          },
                          required: ["id", "label", "votes"],
                        },
                      },
                    },
                  },
                  imageUrl: { type: Type.STRING },
                  imageCaption: { type: Type.STRING },
                  imagePlacement: { type: Type.STRING },
                },
                required: ["slideNumber", "layout", "headline", "speakerNotes"],
              },
            },
          },
          required: ["deckTitle", "deckSubtitle", "totalSlides", "slides"],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonString(text) || "{}");
    return res.json({ success: true, source: "gemini", modelUsed, data: parsed });
  } catch (error: any) {
    console.error("PDF to Slides API error:", error);
    return res.json({
      success: true,
      source: "fallback",
      data: {
        ...getFallbackPresentation(req.body.fileName ? `Document Analysis: ${req.body.fileName}` : "PDF Executive Breakdown"),
        sourceDocumentName: req.body.fileName || "Uploaded Document.pdf",
        pdfAnalysisSummary: "Analyzed PDF document structure, key findings, quantitative metrics, comparison matrices, and generated interactive charts, diagrams, and image visual cards.",
      },
      errorNote: error.message,
    });
  }
});

// Generate an individual custom slide to append to existing presentation
app.post("/api/tools/ppt/single-slide", async (req, res) => {
  try {
    const { topic, slideIntent, slideNumber, preferredLayout } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "fallback",
        data: {
          slideNumber: slideNumber || 1,
          layout: preferredLayout || "bullet_cards",
          headline: `${slideIntent || "Strategic Deep Dive"}: Key Priorities`,
          subhead: "Actionable execution details and quantitative benchmarks",
          bullets: [
            "Establish systematic milestones and automated verification checkpoints",
            "Accelerate cross-functional team productivity with dedicated AI tooling",
            "Maintain continuous performance analytics and iterative feedback loops",
          ],
          statCallout: { number: "3.5x", label: "Workflow Efficiency Gain" },
          speakerNotes: "This slide outlines the critical execution priorities needed to achieve our project objectives.",
          visualBadge: "Deep Dive",
        },
      });
    }

    const prompt = `Generate a single, highly detailed, visually compelling presentation slide for the deck:
DECK TOPIC: ${topic || "AI Autonomous Systems"}
NEW SLIDE INTENT / FOCUS: ${slideIntent || "Key Architectural Innovations and Quantifiable Impact"}
SLIDE NUMBER: ${slideNumber || 1}
PREFERRED LAYOUT (if any): ${preferredLayout || "any interactive layout suitable for the content"}

Create rich structured content with either:
- Layout: interactive_chart (with chartData array of 4-6 points with 'name', 'value', 'target')
- Layout: process_diagram (with 4 processSteps with 'step', 'title', 'description', 'tag')
- Layout: live_poll (with pollData containing question and 4 options)
- Layout: two_column_compare (with leftColumnTitle, leftColumnItems, rightColumnTitle, rightColumnItems)
- Layout: metrics_highlight or bullet_cards or timeline_quote`;

    const { text, modelUsed } = await generateWithRetryAndFallback(ai, {
      primaryModel: "gemini-3.7-flash",
      fallbackModels: ["gemini-3.1-flash-lite", "gemini-flash-latest"],
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class presentation slide designer. Return a single slide JSON object matching the requested schema with thorough, detailed, professional content.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slideNumber: { type: Type.INTEGER },
            layout: {
              type: Type.STRING,
              description: "title_slide | bullet_cards | two_column_compare | metrics_highlight | timeline_quote | interactive_chart | process_diagram | live_poll",
            },
            headline: { type: Type.STRING },
            subhead: { type: Type.STRING },
            bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            statCallout: {
              type: Type.OBJECT,
              properties: {
                number: { type: Type.STRING },
                label: { type: Type.STRING },
              },
            },
            leftColumnTitle: { type: Type.STRING },
            leftColumnItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            rightColumnTitle: { type: Type.STRING },
            rightColumnItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            speakerNotes: { type: Type.STRING },
            visualBadge: { type: Type.STRING },
            chartType: { type: Type.STRING, description: "bar | area | line | pie" },
            chartData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  target: { type: Type.NUMBER },
                },
                required: ["name", "value"],
              },
            },
            processSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  tag: { type: Type.STRING },
                },
                required: ["step", "title", "description"],
              },
            },
            pollData: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      votes: { type: Type.INTEGER },
                    },
                    required: ["id", "label", "votes"],
                  },
                },
              },
            },
          },
          required: ["slideNumber", "layout", "headline", "speakerNotes"],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonString(text) || "{}");
    return res.json({ success: true, source: "gemini", modelUsed, data: parsed });
  } catch (error: any) {
    console.error("Single Slide API error:", error);
    return res.json({
      success: true,
      source: "fallback",
      data: {
        slideNumber: req.body.slideNumber || 1,
        layout: "bullet_cards",
        headline: `${req.body.slideIntent || "Strategic Analysis"}`,
        subhead: "Actionable insights and architectural takeaways",
        bullets: [
          "Establish systematic milestones and automated verification checkpoints",
          "Accelerate cross-functional team productivity with dedicated AI tooling",
          "Maintain continuous performance analytics and iterative feedback loops",
        ],
        statCallout: { number: "3.5x", label: "Workflow Efficiency Gain" },
        speakerNotes: "Key execution directives for team alignment.",
        visualBadge: "Strategic Milestone",
      },
    });
  }
});

// -------------------------------------------------------------
// 6. Custom AI Runner / Prompt Tester API
// -------------------------------------------------------------
app.post("/api/tools/custom-runner", async (req, res) => {
  try {
    const { systemPrompt, userPrompt, temperature } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "fallback",
        output: `[SIMULATED AI RESPONSE]\n\nReceived prompt: "${userPrompt}"\n\nTo enable live real-time Gemini generation across all tools, ensure the GEMINI_API_KEY is configured in Settings > Secrets. The app seamlessly falls back to rich built-in models!`,
      });
    }

    const { text, modelUsed } = await generateWithRetryAndFallback(ai, {
      primaryModel: "gemini-3.7-flash",
      fallbackModels: ["gemini-3.1-flash-lite", "gemini-flash-latest"],
      contents: userPrompt || "Explain how AI tools work in 3 sentences.",
      config: {
        systemInstruction: systemPrompt || "You are an expert AI engineer.",
        temperature: typeof temperature === "number" ? temperature : 0.7,
      },
    });

    return res.json({
      success: true,
      source: "gemini",
      modelUsed,
      output: text,
    });
  } catch (error: any) {
    console.error("Custom runner error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// 7. Advanced Deep-Dive Explainer & Architecture Intelligence API
// -------------------------------------------------------------
app.post("/api/tools/advanced-explainer", async (req, res) => {
  try {
    const { topicOrCodeOrQuestion, sourceTool, depthLevel, focusAspects, customPrompt } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "fallback",
        data: getFallbackAdvancedExplainer(topicOrCodeOrQuestion || "VertiPaq In-Memory Columnar Database Compression & Filter Context Transition", depthLevel),
      });
    }

    const level = depthLevel || "Staff / Principal Engineer";
    const tool = sourceTool || "General Engineering & Architecture";
    const aspects = focusAspects && focusAspects.length > 0 ? focusAspects.join(", ") : "First Principles Theory, Step-by-Step Runtime Mechanics, Production Failure Modes & Pitfalls, Benchmark Trade-offs, Enterprise Production Code";

    const prompt = `You are a Principal Software Architect, Distinguished Engineer, and Technical Research Fellow.
Provide a world-class, uncompromising, deep-dive ADVANCED LEVEL explanation and comprehensive masterclass breakdown for:

TOPIC / CODE / FORMULA / QUESTION:
${topicOrCodeOrQuestion || "Distributed Consensus & State Machine Replication in High-Throughput Storage"}

SOURCE CONTEXT / DOMAIN: ${tool}
TARGET DEPTH LEVEL: ${level}
FOCUS CRITERIA: ${aspects}
SPECIFIC USER QUESTIONS / INSTRUCTIONS: ${customPrompt || "Explain underlying mechanics, mathematical proofs/formulas, step-by-step bytecode/execution flow, insidious production edge cases, and provide runnable production-grade code."}

REQUIREMENTS:
1. Explain at true ${level} depth. Do not use surface-level metaphors without providing the exact mathematical, algorithmic, memory, and engine-level mechanics.
2. Break down the execution into sequential steps with precise engine states and CPU/memory lifecycle impact.
3. Detail realistic production pitfalls, failure symptoms, root causes, and robust preventative measures.
4. Include comparative performance/memory trade-offs vs prominent alternatives.
5. Provide clean, annotated production code or implementation script with defensive error handling.
6. Provide an advanced engineering mastery checklist and high-impact key takeaways.`;

    const { text, modelUsed } = await generateWithRetryAndFallback(ai, {
      primaryModel: "gemini-3.7-flash",
      fallbackModels: ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.1-pro-preview"],
      contents: prompt,
      config: {
        systemInstruction: "You are a Principal Software Architect and distinguished technical research fellow. Output strictly valid JSON with exhaustive, rigorous, advanced-level technical breakdowns.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            conceptClassification: { type: Type.STRING },
            depthLevel: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            firstPrinciplesTheory: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                mathFormulaOrNotation: { type: Type.STRING },
                explanation: { type: Type.STRING },
                coreTenets: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["title", "explanation", "coreTenets"],
            },
            executionMechanics: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                stepByStepFlow: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      step: { type: Type.INTEGER },
                      phase: { type: Type.STRING },
                      whatHappens: { type: Type.STRING },
                      engineState: { type: Type.STRING },
                    },
                    required: ["step", "phase", "whatHappens", "engineState"],
                  },
                },
                memoryAndCpuImpact: { type: Type.STRING },
              },
              required: ["title", "stepByStepFlow", "memoryAndCpuImpact"],
            },
            productionPitfallsAndEdgeCases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pitfall: { type: Type.STRING },
                  symptom: { type: Type.STRING },
                  rootCause: { type: Type.STRING },
                  prevention: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "Critical | High | Medium" },
                },
                required: ["pitfall", "symptom", "rootCause", "prevention", "severity"],
              },
            },
            comparativeBenchmark: {
              type: Type.OBJECT,
              properties: {
                alternative: { type: Type.STRING },
                performanceVsAlternative: { type: Type.STRING },
                memoryVsAlternative: { type: Type.STRING },
                recommendedWhen: { type: Type.STRING },
              },
              required: ["alternative", "performanceVsAlternative", "memoryVsAlternative", "recommendedWhen"],
            },
            productionCodeOrScript: {
              type: Type.OBJECT,
              properties: {
                language: { type: Type.STRING },
                filename: { type: Type.STRING },
                code: { type: Type.STRING },
                annotations: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["language", "code", "annotations"],
            },
            advancedMasteryChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            "title",
            "conceptClassification",
            "depthLevel",
            "executiveSummary",
            "firstPrinciplesTheory",
            "executionMechanics",
            "productionPitfallsAndEdgeCases",
            "advancedMasteryChecklist",
            "keyTakeaways",
          ],
        },
      },
    });

    const parsed = JSON.parse(cleanJsonString(text) || "{}");
    return res.json({ success: true, source: "gemini", modelUsed, data: parsed });
  } catch (error: any) {
    console.error("Advanced Explainer API error:", error);
    return res.json({
      success: true,
      source: "fallback",
      data: getFallbackAdvancedExplainer(req.body.topicOrCodeOrQuestion || "VertiPaq Columnar Engine & Filter Context Transition", req.body.depthLevel),
      errorNote: error.message,
    });
  }
});

// -------------------------------------------------------------
// Fallback Data Generators
// -------------------------------------------------------------
function getFallbackResume(role: string, jobDesc?: string) {
  return {
    atsScore: 92,
    atsSuggestions: [
      "Include quantifiable impact metrics (% performance increase, revenue impact) in experience bullets.",
      "Add modern cloud infrastructure keywords (AWS/GCP, Docker, CI/CD) to pass technical ATS filters.",
      "Optimize section headers to standard naming conventions for ATS parser readability.",
      "Highlight specific tools mentioned in the job description: React, TypeScript, GraphQL, Node.js.",
    ],
    personalInfo: {
      fullName: "Payili Santhosh",
      title: role || "AI Solutions Architect & Full Stack Engineer",
      email: "payilisanthosh@gmail.com",
      phone: "+91 6300655960",
      location: "Hyderabad, India (Open to Remote)",
      linkedin: "linkedin.com/in/payilisanthosh",
      github: "github.com/payilisanthosh",
      portfolio: "payilisanthosh.dev",
    },
    summary:
      "Results-driven Senior Software Engineer with 6+ years of experience architecting high-scale distributed web applications and modern cloud-native systems. Proven track record of reducing latency by 42%, scaling APIs to 50M+ daily requests, and leading cross-functional engineering teams to ship high-impact features on time.",
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
}

function getFallbackRoadmap(topic: string, level: string) {
  return {
    title: `${topic} Master Roadmap`,
    overview: `A comprehensive, step-by-step curriculum engineered to take you from ${level} to industry-grade proficiency in ${topic}. Each phase builds on practical real-world milestones.`,
    targetRole: `${topic} Specialist / Engineer`,
    estimatedTotalWeeks: 24,
    prerequisites: ["Basic programming logic", "Command-line terminal comfort", "Problem solving mindset"],
    phases: [
      {
        phaseNumber: 1,
        title: "Phase 1: Foundations & Core Principles",
        description: "Master the foundational syntax, data structures, and developer workflows essential for professional work.",
        estimatedWeeks: "Weeks 1-4 (4 Weeks)",
        badgeColor: "emerald",
        topics: [
          {
            name: "Core Language & Modern Syntax",
            difficulty: "Beginner",
            summary: "Deep-dive into types, async control flow, functional programming, and memory patterns.",
            keyConcepts: ["Data Types & Scope", "Async/Await & Promises", "ES6+ Modules", "Error Handling"],
            practicalTasks: [
              "Build a command-line expense tracker with data persistence",
              "Implement custom asynchronous retry utilities with backoff",
            ],
            resources: [
              { title: "Official Documentation & Guides", url: "https://developer.mozilla.org", type: "Documentation" },
              { title: "Hands-on Interactive Exercises", url: "https://exercism.org", type: "Practice" },
            ],
          },
          {
            name: "Git, Version Control & Collaboration",
            difficulty: "Beginner",
            summary: "Master professional branching workflows, rebasing, pull requests, and CI checks.",
            keyConcepts: ["Git Branching Strategies", "Merge vs Rebase", "Conventional Commits", "PR Review Standards"],
            practicalTasks: [
              "Configure a GitHub repository with branch protection rules and GitHub Actions",
            ],
            resources: [
              { title: "Pro Git Free Handbook", url: "https://git-scm.com/book/en/v2", type: "Book" },
            ],
          },
        ],
        milestoneProject: {
          title: "Milestone 1: Modular CLI Developer Utility",
          description: "Build a production-grade CLI utility published with automated tests, semantic versioning, and documentation.",
          deliverables: ["Tested CLI package", "README with usage GIFs", "Automated CI testing workflow"],
        },
      },
      {
        phaseNumber: 2,
        title: "Phase 2: Architecture, Frameworks & State",
        description: "Build scalable user interfaces and services using modern component architectures and state machines.",
        estimatedWeeks: "Weeks 5-10 (6 Weeks)",
        badgeColor: "blue",
        topics: [
          {
            name: "Modern Component Architecture",
            difficulty: "Intermediate",
            summary: "Construct performant, accessible component systems with composable hooks and CSS frameworks.",
            keyConcepts: ["Component Lifecycles", "Memoization & Render Performance", "Accessibility (a11y)", "Tailwind Styling"],
            practicalTasks: [
              "Design a reusable Design System component library with Storybook",
              "Build an accessible data table with virtual scrolling",
            ],
            resources: [
              { title: "React Official Docs (Beta)", url: "https://react.dev", type: "Documentation" },
            ],
          },
          {
            name: "State Management & Data Fetching",
            difficulty: "Intermediate",
            summary: "Master client-side caching, optimistic updates, and global reactive state.",
            keyConcepts: ["TanStack Query", "Client State Stores", "Cache Invalidation", "WebSockets"],
            practicalTasks: [
              "Implement real-time notification feed with reconnection handling",
            ],
            resources: [
              { title: "TanStack Query Guides", url: "https://tanstack.com/query", type: "Tutorial" },
            ],
          },
        ],
        milestoneProject: {
          title: "Milestone 2: Collaborative Kanban Workspace",
          description: "Develop a multi-board Kanban application with drag-and-drop, optimistic UI updates, and filter capabilities.",
          deliverables: ["Live deployed application", "Interactive board with sub-tasks", "Lighthouse 95+ performance audit"],
        },
      },
      {
        phaseNumber: 3,
        title: "Phase 3: Backend Systems & Data Persistence",
        description: "Engineer resilient backend APIs, relational database schemas, auth workflows, and caching layers.",
        estimatedWeeks: "Weeks 11-16 (6 Weeks)",
        badgeColor: "indigo",
        topics: [
          {
            name: "REST & GraphQL API Design",
            difficulty: "Intermediate",
            summary: "Build secure, authenticated endpoints with rate limiting, input validation, and OpenAPI documentation.",
            keyConcepts: ["JWT & Session Auth", "Zod Schema Validation", "Rate Limiting & CORS", "OpenAPI Specs"],
            practicalTasks: [
              "Create a multi-tenant authentication microservice with refresh token rotation",
            ],
            resources: [
              { title: "REST API Security Best Practices", url: "https://owasp.org", type: "Guide" },
            ],
          },
          {
            name: "Relational & NoSQL Database Optimization",
            difficulty: "Advanced",
            summary: "Star-schema modeling, indexing strategies, migrations, and transactions under concurrent load.",
            keyConcepts: ["B-Tree & GIN Indexes", "ACID Transactions", "Connection Pooling", "ORM & Query Builders"],
            practicalTasks: [
              "Benchmark and optimize slow SQL queries with EXPLAIN ANALYZE",
            ],
            resources: [
              { title: "Use The Index, Luke (SQL Guide)", url: "https://use-the-index-luke.com", type: "Reference" },
            ],
          },
        ],
        milestoneProject: {
          title: "Milestone 3: E-Commerce Order & Inventory Engine",
          description: "Build an ACID-compliant inventory reservation and payment processing backend handling concurrent checkouts.",
          deliverables: ["Microservices architecture", "PostgreSQL database migrations", "Docker Compose setup"],
        },
      },
      {
        phaseNumber: 4,
        title: "Phase 4: Cloud DevOps, AI Integration & Production Readiness",
        description: "Deploy to production cloud infrastructure, integrate LLM intelligence, and monitor with observability tools.",
        estimatedWeeks: "Weeks 17-24 (8 Weeks)",
        badgeColor: "purple",
        topics: [
          {
            name: "Containerization & Cloud Deployments",
            difficulty: "Advanced",
            summary: "Containerize applications with multi-stage Docker builds and deploy to Cloud Run / Kubernetes.",
            keyConcepts: ["Docker Multi-stage Builds", "Serverless Containers", "Secrets Management", "Zero-downtime Deployments"],
            practicalTasks: [
              "Deploy a full-stack container to Google Cloud Run with automated CD pipelines",
            ],
            resources: [
              { title: "Docker Deep Dive", url: "https://docs.docker.com", type: "Documentation" },
            ],
          },
          {
            name: "LLM & AI Tool Engineering",
            difficulty: "Advanced",
            summary: "Incorporate structured JSON generative AI models, embeddings, and context pipelines.",
            keyConcepts: ["Gemini API SDK", "Structured Output Schemas", "Prompt Engineering", "Streaming Token Pipelines"],
            practicalTasks: [
              "Integrate Gemini Flash for automated content classification and real-time generation",
            ],
            resources: [
              { title: "Google AI Studio Documentation", url: "https://ai.google.dev", type: "Documentation" },
            ],
          },
        ],
        milestoneProject: {
          title: "Milestone 4: Capstone SaaS AI Platform",
          description: "A complete, production-grade SaaS product featuring user auth, AI capabilities, subscription billing, and telemetry.",
          deliverables: ["Production web app", "Architecture diagram & technical blog post", "GitHub repository with 100% CI pass"],
        },
      },
    ],
  };
}

function getFallbackPowerBI(domain: string) {
  return {
    dashboardTitle: `${domain} Executive Analytics Architecture`,
    summary: `Comprehensive Power BI data architecture featuring optimized star-schema tables, high-performance DAX measures, Power Query transformations, and interactive KPI mockups for ${domain}.`,
    daxMeasures: [
      {
        measureName: "Total Revenue",
        category: "Core Metrics",
        formula: "Total Revenue = SUM(FactSales[NetRevenue])",
        explanation: "Calculates total net sales revenue across all active filter contexts.",
        returnType: "Currency ($)",
        performanceTip: "Ensure FactSales[NetRevenue] is stored as Fixed Decimal Currency in Power BI to minimize memory footprint.",
      },
      {
        measureName: "YoY Revenue Growth %",
        category: "Time Intelligence",
        formula: `YoY Revenue Growth % = 
VAR CurrentRev = [Total Revenue]
VAR PriorYearRev = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(DimDate[Date]))
RETURN
    DIVIDE(CurrentRev - PriorYearRev, PriorYearRev, 0)`,
        explanation: "Computes year-over-year revenue percentage growth safely handling zero or null divisions.",
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
        explanation: "Calculates estimated Customer Lifetime Value based on average historical spend multiplied by customer retention lifespan.",
        returnType: "Currency ($)",
        performanceTip: "Use DISTINCTCOUNT over COUNTROWS for accurate customer segmentation.",
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
        performanceTip: "DATESINPERIOD uses column indexing on the Date dimension to return results sub-second.",
      },
    ],
    powerQueryMCode: [
      {
        tableName: "FactSales_Transform",
        description: "Cleans dirty timestamps, splits composite SKUs, and filters out test orders in Power Query M.",
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
        subtitle: "Last 6 Months",
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
        title: "Revenue by Product Category",
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
}

function getFallbackExcel(mode: string, query?: string) {
  return {
    title: "Excel & Sheets Formula Engine",
    primaryFormula: `=XLOOKUP(G2, A2:A100, D2:D100, "Not Found", 0)`,
    legacyFormula: `=IFERROR(INDEX(D2:D100, MATCH(G2, A2:A100, 0)), "Not Found")`,
    googleSheetsFormula: `=XLOOKUP(G2, A2:A100, D2:D100, "Not Found", 0)`,
    explanation:
      "This formula searches for the target ID or name located in cell G2 against column A (A2:A100) and returns the corresponding salary or value from column D (D2:D100). If no match exists, it gracefully returns 'Not Found' without throwing ugly #N/A errors.",
    syntaxBreakdown: [
      { part: "G2", meaning: "Lookup Value: The specific identifier or cell you want to search for." },
      { part: "A2:A100", meaning: "Lookup Array: The column containing the keys to search against." },
      { part: "D2:D100", meaning: "Return Array: The column with the results you want to retrieve." },
      { part: '"Not Found"', meaning: "If Not Found: Custom fallback string returned when no exact match exists." },
      { part: "0", meaning: "Match Mode: 0 specifies exact match lookup." },
    ],
    commonPitfalls: [
      "Avoid whole column references like A:A if your sheet contains hundreds of thousands of blank rows; specify ranges or use Excel Tables (Table1[ID]).",
      "Ensure data types match: looking up a text string '101' against numeric values 101 will cause a mismatch.",
      "In older Excel versions prior to 2021/365, use the legacy INDEX/MATCH formula.",
    ],
    vbaCode: `Sub AutoFormatAndHighlight()
    Dim ws As Worksheet
    Set ws = ActiveSheet
    Dim lastRow As Long
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
    
    ' Apply clean border and header formatting
    With ws.Range("A1:E" & lastRow)
        .Font.Name = "Segoe UI"
        .Font.Size = 10
        .Borders.LineStyle = xlContinuous
    End With
    
    ' Highlight header
    With ws.Range("A1:E1")
        .Interior.Color = RGB(37, 99, 235)
        .Font.Color = RGB(255, 255, 255)
        .Font.Bold = True
    End With
    
    MsgBox "Formatted " & (lastRow - 1) & " rows successfully!", vbInformation, "Excel Genius"
End Sub`,
    appsScriptCode: `function formatSpreadsheetData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var range = sheet.getDataRange();
  
  // Format header row
  var header = sheet.getRange(1, 1, 1, range.getLastColumn());
  header.setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
  
  sheet.autoResizeColumns(1, range.getLastColumn());
  SpreadsheetApp.getUi().alert("Sheet formatted successfully!");
}`,
    sampleGrid: {
      headers: ["ID", "Employee Name", "Department", "Performance", "Salary ($)", "Status"],
      rows: [
        ["101", "Sarah Chen", "Engineering", "Exceeds", "$145,000", "Active"],
        ["102", "Marcus Vance", "Product", "Exceeds", "$138,000", "Active"],
        ["103", "Elena Rostova", "Marketing", "Meets", "$92,000", "Active"],
        ["104", "David Kim", "Engineering", "Exceeds", "$152,000", "Active"],
        ["105", "Priya Sharma", "Finance", "Exceeds", "$118,000", "Active"],
        ["106", "Jordan Lee", "Design", "Meets", "$105,000", "Active"],
      ],
    },
  };
}

function getFallbackPresentation(topic: string) {
  return {
    deckTitle: `${topic}: Strategic Executive Overview`,
    deckSubtitle: "Architectural Foundations, Visual Analytics & Interactive Rollout",
    theme: "Modern Slate & Indigo",
    totalSlides: 6,
    slides: [
      {
        slideNumber: 1,
        layout: "title_slide" as const,
        headline: `${topic}`,
        subhead: "Unlocking Next-Generation Value & Autonomous Interactive Capabilities",
        bullets: [
          "Strategic Market Shift & Technology Convergence",
          "Architectural Foundations for Scalable Deployment",
          "Interactive Visual Analytics & 12-Month Execution Roadmap",
        ],
        statCallout: { number: "10x", label: "Productivity Velocity Acceleration" },
        speakerNotes:
          "Welcome everyone. Today we are exploring the transformative potential of this technology, how leading organizations are executing, and our concrete roadmap to capture first-mover advantage.",
        visualBadge: "Executive Keynote",
      },
      {
        slideNumber: 2,
        layout: "two_column_compare" as const,
        headline: "The Paradigm Shift: Legacy vs AI-Accelerated",
        subhead: "How AI tools revolutionize traditional manual workflows",
        leftColumnTitle: "Traditional Manual Process",
        leftColumnItems: [
          "Manual document authoring taking 4-8 hours per asset",
          "Brittle, static spreadsheets prone to formula corruption",
          "Siloed data pipelines requiring dedicated BI engineers",
          "High error rate and slow turnaround on executive requests",
        ],
        rightColumnTitle: "AI-Powered Autonomous Stack",
        rightColumnItems: [
          "Real-time dynamic synthesis in sub-5 seconds with strict schema validation",
          "Deterministic formula engines with automated sanity audits",
          "Natural language DAX & Power Query generation on-demand",
          "90%+ reduction in operational cycle time across teams",
        ],
        speakerNotes:
          "Notice the stark contrast on this slide. We are moving away from friction-heavy manual authoring toward real-time generative workflows that amplify human talent.",
        visualBadge: "Strategic Comparison",
      },
      {
        slideNumber: 3,
        layout: "interactive_chart" as const,
        headline: "Performance Velocity & ROI Projections",
        subhead: "Quarterly output velocity comparing automated AI tools vs traditional workflows",
        chartType: "area" as const,
        chartData: [
          { name: "Q1", value: 120, target: 80 },
          { name: "Q2", value: 240, target: 130 },
          { name: "Q3", value: 410, target: 190 },
          { name: "Q4", value: 680, target: 260 },
          { name: "Q5 (Est)", value: 950, target: 340 },
        ],
        statCallout: { number: "+280%", label: "Annual Velocity Growth" },
        bullets: [
          "Automated slide generation reduces authoring cycle time from 4h to 2min",
          "Sub-second DAX formula compilation with zero syntax mistakes",
          "Live interactive charting directly in presentations",
        ],
        speakerNotes:
          "This interactive visual highlights the exponential divergence in team output when equipped with intelligent agents.",
        visualBadge: "Live Visual Chart",
      },
      {
        slideNumber: 4,
        layout: "process_diagram" as const,
        headline: "End-to-End Autonomous Execution Pipeline",
        subhead: "The 4-stage pipeline translating intent into interactive presentations",
        processSteps: [
          { step: 1, title: "Intent & Context Ingestion", description: "System prompts capture audience context, goals, and style guidelines.", tag: "Input Stage" },
          { step: 2, title: "Structured Schema Synthesis", description: "Gemini formats data into type-safe JSON with visual tokens and metrics.", tag: "AI Engine" },
          { step: 3, title: "Interactive Canvas Binding", description: "Frontend renders interactive charts, flow diagrams, and poll widgets.", tag: "UI Rendering" },
          { step: 4, title: "Multi-Format Export", description: "Export to editable PowerPoint (.pptx), Markdown, or present full-screen.", tag: "Export" },
        ],
        speakerNotes:
          "Here is the architectural sequence that ensures every generated slide is both mathematically valid and dynamically interactive.",
        visualBadge: "Process Diagram",
      },
      {
        slideNumber: 5,
        layout: "live_poll" as const,
        headline: "Audience Interactive Poll: Priority Use Case",
        subhead: "Which AI accelerator will have the highest immediate impact in your workflow?",
        pollData: {
          question: "Which tool will your team deploy first?",
          options: [
            { id: "opt1", label: "AI ATS Resume & Career Optimizer", votes: 42 },
            { id: "opt2", label: "Interactive Visual Presentation / PPT Engine", votes: 88 },
            { id: "opt3", label: "Power BI DAX & M-Code Architect", votes: 65 },
            { id: "opt4", label: "Excel Formula Genius & VBA Generator", votes: 53 },
          ],
        },
        speakerNotes:
          "Let's get real-time feedback from everyone in the room. Click your choice to see live voting results with real-time percentages.",
        visualBadge: "Live Audience Interaction",
      },
      {
        slideNumber: 6,
        layout: "timeline_quote" as const,
        headline: "90-Day Implementation Plan & Next Milestones",
        subhead: "Actionable milestones for immediate deployment",
        bullets: [
          "Month 1: Pilot core AI tools across engineering, analytics, and HR teams",
          "Month 2: Integrate custom data schemas and company brand templates",
          "Month 3: Roll out company-wide access with automated telemetry and feedback loops",
        ],
        statCallout: { number: "90 Days", label: "Full Enterprise Deployment" },
        speakerNotes:
          "To conclude, our rollout is pragmatic and low-risk. Within 90 days, every department will have access to tailor-made AI tools that elevate output quality.",
        visualBadge: "Roadmap to Launch",
      },
    ],
  };
}

function getFallbackAdvancedExplainer(topic: string, depthLevel?: string) {
  const level = depthLevel || "Staff / Principal Engineer";
  return {
    title: `Advanced Architectural Breakdown: ${topic}`,
    conceptClassification: "High-Performance Systems & Advanced Execution Mechanics",
    depthLevel: level,
    executiveSummary: `A comprehensive, first-principles deconstruction of ${topic}. This masterclass analysis covers memory lifecycle management, CPU cache line optimizations, algorithmic state transitions, and high-concurrency production failure recovery mechanisms.`,
    firstPrinciplesTheory: {
      title: "Theoretical Foundations & Mathematical Bounds",
      mathFormulaOrNotation: "T(n) = O(log N) amortized lookup • M(V) = ∑ [bitwidth(col_i) × cardinality(col_i)]",
      explanation:
        "At the fundamental physical level, high-throughput systems transform random I/O operations into sequential memory accesses. By substituting pointer indirection with contiguous array buffers and dictionary encoding, systems achieve near-theoretical hardware cache efficiency (L1/L2 cache hit ratio > 96%).",
      coreTenets: [
        "Vectorized Batch Processing: Minimizes branch mispredictions by executing SIMD instructions over contiguous data vectors.",
        "Deterministic State Machine Transitions: Every context mutation evaluates as a pure function over immutable snapshots.",
        "Zero-Copy Memory Transfers: Eliminates kernel-to-userspace memory duplication via memory mapping and ring buffers.",
        "Asynchronous Backpressure: Throttles ingress producer rates before buffer saturation triggers unrecoverable OOM.",
      ],
    },
    executionMechanics: {
      title: "Runtime Execution Pipeline & Hardware Lifecycle",
      stepByStepFlow: [
        {
          step: 1,
          phase: "Syntax Parsing & Abstract Syntax Tree (AST) Generation",
          whatHappens:
            "Lexical tokens are compiled into an optimized expression tree with static semantic typing and dead-code pruning.",
          engineState: "Memory footprint: ~4KB AST heap allocation • Lock-free AST parsing",
        },
        {
          step: 2,
          phase: "Filter Context & Environment Binding",
          whatHappens:
            "Active filter vectors are intersected and pushed down into storage engine segment bitmaps for hardware-accelerated scanning.",
          engineState: "Bitmask cardinality evaluated • Context transition converts active row values to global filter predicates",
        },
        {
          step: 3,
          phase: "Vectorized Columnar Execution & SIMD Aggregation",
          whatHappens:
            "Engine iterates through dictionary-encoded integer indexes using multi-core parallel worker threads.",
          engineState: "Zero CPU cache thrashing • 8-way SIMD AVX-512 register saturation",
        },
        {
          step: 4,
          phase: "Materialization & Result Cache Injection",
          whatHappens:
            "Aggregated scalars are resolved against the metadata dictionary and populated into the transient visual cache.",
          engineState: "Intermediate bitmaps deallocated • Query execution plan cached with sub-millisecond TTL",
        },
      ],
      memoryAndCpuImpact:
        "Execution runs with O(1) auxiliary memory overhead per thread. CPU time is dominated (>85%) by raw vector aggregation loops with zero heap churn.",
    },
    productionPitfallsAndEdgeCases: [
      {
        pitfall: "Context Transition Cartesian Explosion",
        symptom: "Query execution latency spikes from 35ms to >15,000ms with 100% single-thread CPU lockup.",
        rootCause:
          "Invoking iterative evaluation inside an unfiltered high-cardinality table, causing N² row-by-row context transitions.",
        prevention:
          "Pre-filter candidate tables before iteration; cache intermediate measure values in VAR immutable variables.",
        severity: "Critical",
      },
      {
        pitfall: "High-Cardinality Column Storage Bloat",
        symptom: "Memory consumption expands by 12x, exceeding RAM limits during scheduled refresh.",
        rootCause: "Storing raw unrounded timestamps with seconds or UUID strings prevents Run-Length Encoding (RLE).",
        prevention: "Split Date and Time into distinct columns; hash or integer-encode foreign key identifiers.",
        severity: "High",
      },
      {
        pitfall: "Volatile Dynamic Recalculation Cascades",
        symptom: "Workbook or application locks UI thread on every single cell mutation.",
        rootCause: "Unbounded use of volatile functions forcing the dependency DAG to invalidate the entire workspace.",
        prevention: "Isolate dynamic lookups with modern array formulas and disable automatic screen updating in batch pipelines.",
        severity: "Medium",
      },
    ],
    comparativeBenchmark: {
      alternative: "Legacy Row-Oriented / Uncached Iterator Approach",
      performanceVsAlternative: "18.5x to 45x faster query throughput (P99 latency drops from 820ms to 18ms)",
      memoryVsAlternative: "72% lower memory footprint via dictionary integer substitution and run-length bit compression",
      recommendedWhen:
        "Recommended for all production analytical workloads exceeding 100,000 entities where interactive latency (<200ms) is required.",
    },
    productionCodeOrScript: {
      language: "typescript",
      filename: "OptimizedEnginePipeline.ts",
      code: `// Production-Grade High-Performance Vectorized Processing Pipeline
export class HighThroughputEngine<TRecord extends Record<string, any>> {
  private dictionary = new Map<string, number>();
  private reverseDict: string[] = [];
  private encodedSegments: Uint32Array[] = [];
  private isSealed = false;

  constructor(private readonly segmentSize = 65536) {}

  /**
   * Fast Dictionary Encoding with zero heap allocation per record
   */
  public encodeValue(rawVal: string): number {
    let id = this.dictionary.get(rawVal);
    if (id === undefined) {
      if (this.isSealed) throw new Error("Cannot mutate sealed dictionary");
      id = this.reverseDict.length;
      this.dictionary.set(rawVal, id);
      this.reverseDict.push(rawVal);
    }
    return id;
  }

  /**
   * Vectorized Bitmask Filter with SIMD-compatible contiguous buffer
   */
  public queryVector(targetId: number): number {
    let matchCount = 0;
    for (let s = 0; s < this.encodedSegments.length; s++) {
      const seg = this.encodedSegments[s];
      const len = seg.length;
      // Unrolled loop for CPU pipeline saturation
      for (let i = 0; i < len; i += 4) {
        if (seg[i] === targetId) matchCount++;
        if (seg[i + 1] === targetId) matchCount++;
        if (seg[i + 2] === targetId) matchCount++;
        if (seg[i + 3] === targetId) matchCount++;
      }
    }
    return matchCount;
  }
}`,
      annotations: [
        "Uses TypedArray Uint32Array to guarantee contiguous memory allocation and zero garbage collector overhead.",
        "Applies 4-way loop unrolling to maximize CPU instruction pipeline parallelism and branch prediction accuracy.",
        "Thread-safe sealed state prevents race conditions during concurrent read operations.",
      ],
    },
    advancedMasteryChecklist: [
      "Profile query execution plans using performance analyzers or engine trace events.",
      "Ensure all dimensional join columns use native integer keys rather than string UUIDs.",
      "Audit filter push-down to verify storage engine handles 90%+ of row filtering before formula engine materialization.",
      "Establish automated memory thresholds and alerting for batch data ingestion pipelines.",
    ],
    keyTakeaways: [
      "Memory locality and data encoding dictate performance orders of magnitude more than micro-optimizations.",
      "Context transition must be used deliberately: always wrap expensive expressions in VAR variables.",
      "Deep understanding of the underlying storage engine allows you to build models that scale effortlessly to 100M+ records.",
    ],
  };
}

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Tools Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
