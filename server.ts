import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  getExpertAnswering, 
  materialsDatabase, 
  pricingTiers, 
  locationModifiers, 
  roleGuidelines, 
  engineeringSpecialties 
} from "./shattabhaKnowledge";

// Initialize environment variables
dotenv.config();

// Path to dynamic prices file
const PRICES_FILE_PATH = path.join(process.cwd(), "server", "dynamicPrices.json");

// Define basic labor interface
export interface LaborItem {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  unit: string;
}

// In-memory caches which initialize from shattabhaKnowledge but can be hot-reloaded dynamically!
let currentMaterialsList = [...materialsDatabase];
let currentPricingTiers: any = { ...pricingTiers };
let currentLaborRates: LaborItem[] = [
  { id: "LAB-01", nameAr: "سعر مصنعية السباكة للمتر", nameEn: "Plumbing labor rate per sqm", price: 120, unit: "ج.م / متر مربع" },
  { id: "LAB-02", nameAr: "سعر مصنعية الكهرباء للمتر", nameEn: "Electrical labor rate per sqm", price: 110, unit: "ج.م / متر مربع" },
  { id: "LAB-03", nameAr: "سعر مصنعية المحارة (بياض الحوائط)", nameEn: "Plastering labor per sqm", price: 85, unit: "ج.م / متر مربع" },
  { id: "LAB-04", nameAr: "سعر مصنعية تركيب السيراميك والبورسلين", nameEn: "Ceramic & Porcelain tiling labor per sqm", price: 130, unit: "ج.م / متر مربع" },
  { id: "LAB-05", nameAr: "سعر مصنعية أعمال الدهانات (معجون وبلاستيك)", nameEn: "Wall painting labor per sqm", price: 70, unit: "ج.م / متر مربع" },
  { id: "LAB-06", nameAr: "مصنعية تركيب الألواح الجبسية (أسقف جبسوم بورد)", nameEn: "Gypsum board installation labor per sqm", price: 95, unit: "ج.م / متر مربع" }
];

// Load function
function loadDynamicPrices() {
  try {
    if (fs.existsSync(PRICES_FILE_PATH)) {
      const dataStr = fs.readFileSync(PRICES_FILE_PATH, "utf8");
      const data = JSON.parse(dataStr);
      if (data.materials) currentMaterialsList = data.materials;
      if (data.packages) currentPricingTiers = data.packages;
      if (data.labor) currentLaborRates = data.labor;
      console.log("Successfully loaded dynamic prices from dynamicPrices.json");
    } else {
      // Save default
      const defaultData = {
        materials: currentMaterialsList,
        packages: currentPricingTiers,
        labor: currentLaborRates
      };
      // Ensure directory exists
      const dir = path.dirname(PRICES_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(PRICES_FILE_PATH, JSON.stringify(defaultData, null, 2), "utf8");
      console.log("Successfully created default dynamicPrices.json at", PRICES_FILE_PATH);
    }
  } catch (err) {
    console.error("Error loading dynamic prices:", err);
  }
}

// Invoke price loading
loadDynamicPrices();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header for telemetry
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initiated successfully on server side.");
  } catch (err) {
    console.error("Error creating GoogleGenAI instance:", err);
  }
} else {
  console.warn("GEMINI_API_KEY environment variable is not defined. Server will utilize local high-fidelity AI models fallback.");
}

// ----------------- DYNAMIC PRICING API ENDPOINTS -----------------

/**
 * Endpoint to retrieve all dynamic raw material costs, labor rates, and package tiers.
 */
app.get("/api/prices", (req, res) => {
  res.json({
    materials: currentMaterialsList,
    packages: currentPricingTiers,
    labor: currentLaborRates
  });
});

/**
 * Endpoint to update and persist dynamic prices on the server.
 */
app.post("/api/prices", (req, res) => {
  const { materials, packages, labor } = req.body;
  if (materials && Array.isArray(materials)) currentMaterialsList = materials;
  if (packages) currentPricingTiers = packages;
  if (labor && Array.isArray(labor)) currentLaborRates = labor;

  try {
    const defaultData = {
      materials: currentMaterialsList,
      packages: currentPricingTiers,
      labor: currentLaborRates
    };
    fs.writeFileSync(PRICES_FILE_PATH, JSON.stringify(defaultData, null, 2), "utf8");
    console.log("Successfully updated dynamic_prices.json with new prices");
    res.json({ success: true, message: "Prices updated successfully!" });
  } catch (err: any) {
    console.error("Error saving dynamic prices:", err);
    res.status(500).json({ error: "Failed to save prices on the server." });
  }
});


// ----------------- EMAIL NOTIFICATIONS API ENDPOINT -----------------
app.post("/api/send-email", async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: "Missing required parameters (to, subject, text)." });
  }

  // Check if Resend or SMTP is configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: `${process.env.SMTP_FROM_NAME || "Shattabha • شطبها"} <onboarding@resend.dev>`,
          to: [to],
          subject: subject,
          text: text,
          html: html || text
        })
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`[Resend] Email sent successfully to ${to} for subject: ${subject}`);
        return res.json({ success: true, provider: "resend", data });
      } else {
        console.error("[Resend] API Error:", data);
        throw new Error(JSON.stringify(data));
      }
    } catch (err: any) {
      console.error("[Resend] Failed to send email via Resend API:", err);
    }
  }

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || "شطبها • Shattabha"}" <${process.env.SMTP_FROM_EMAIL || smtpUser}>`,
        to,
        subject,
        text,
        html: html || text
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[SMTP] Email successfully delivered to ${to}. MessageId: ${info.messageId}`);
      return res.json({ success: true, provider: "smtp", messageId: info.messageId });
    } catch (err: any) {
      console.error(`[SMTP] Error sending email to ${to}:`, err);
      return res.status(500).json({ 
        success: false, 
        error: "SMTP delivery failed", 
        details: err.message || err 
      });
    }
  }

  // Fallback: Simulation mode log
  console.log("\n========================================================");
  console.log("             📬 [EMAIL NOTIFICATION DISPATCH - DEVMGMT] ");
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log("--------------------------------------------------------");
  console.log(`Text:    ${text}`);
  console.log("========================================================\n");

  return res.json({ 
    success: true, 
    simulated: true, 
    message: "Email logged to console. To enable actual delivery, configure SMTP_HOST or RESEND_API_KEY inside your Secrets panel!" 
  });
});


// ----------------- AI API ENDPOINTS -----------------

/**
 * 1. AI BID COMPARISON & FAIRNESS EVALUATOR
 */
app.post("/api/ai/compare-bids", async (req, res) => {
  const { request, offers, priority } = req.body;

  if (!request || !offers || !Array.isArray(offers) || offers.length === 0) {
    return res.status(400).json({ error: "Missing required request, offers list, or priority parameters." });
  }

  // --- LOCAL FALLBACK LOGIC (Used if GEMINI_API_KEY is not configured) ---
  const generateHeuristicLocalFallback = () => {
    // Determine cheapest offer, fastest, and best
    const sortedByPrice = [...offers].sort((a, b) => a.price - b.price);
    const sortedByDuration = [...offers].sort((a, b) => a.durationDays - b.durationDays);
    const cheapestOffer = sortedByPrice[0];
    const fastestOffer = sortedByDuration[0];

    // Build heuristic reviews
    const bidsAnalysis = offers.map(off => {
      let pricingFairness = "FAIR";
      const ratio = off.price / request.budget;
      if (ratio > 1.25) pricingFairness = "OVERPRICED";
      else if (ratio < 0.6) pricingFairness = "UNDERPRICED";

      const praisePoints = [
        `سعر المتر المربع يبلغ حوالي ${Math.round(off.price / request.area)} ج.م وهو مناسب لـمستويات الـ ${request.finishingLevel}.`,
        off.description.includes("سويدي") || off.materialsDetail?.includes("سويدي") 
          ? "تضمين كابلات السويدي المعتمدة لتأسيس الكهرباء." 
          : "توزيع ميزانية مريح للبنود التشطيبية.",
        `مدة التنفيذ (${off.durationDays} يوم) معقولة ومناسبة لدورة عمل سريعة.`
      ];

      const criticismPoints = [];
      if (pricingFairness === "OVERPRICED") {
        criticismPoints.push("السعر الإجمالي يتجاوز الميزانية المحددة للطلب بنسبة تزيد عن ٢٥٪.");
      }
      if (pricingFairness === "UNDERPRICED") {
        criticismPoints.push("السعر منخفض بشكل كبير مما يثير قلقاً فنيًا حول أصالة الخامات المستخدمة أو هامش الخطأ.");
      }
      if (off.durationDays < 45) {
        criticismPoints.push("مدة التنفيذ قصيرة جداً وقد تعني تسرعاً في عزل الحمامات أو فترات جفاف الجدران.");
      }
      if (!off.materialsDetail || off.materialsDetail.length < 20) {
        criticismPoints.push("تفاصيل الخامات مختصرة بعض الشيء وكان يفضل تحديد علامات المواسير والدهانات بدقة.");
      }

      const hasPremium = off.materialsDetail?.includes("سويدي") || off.materialsDetail?.includes("جوتن") || off.materialsDetail?.includes("باننجر");
      const materialsScore = hasPremium ? 95 : 85;

      return {
        offerId: off.id,
        pricingFairness,
        praisePoints,
        criticismPoints: criticismPoints.length > 0 ? criticismPoints : ["لا توجد عيوب فنية ظاهرة في مسودة البنود."],
        materialsScore,
        riskAssessment: pricingFairness === "UNDERPRICED" 
          ? "مخاطر متوسطة: قد يتفاجأ العميل بطلب فروق أسعار لاحقاً أو استخدام خامات فرز ثالث." 
          : "مخاطر منخفضة: التأسيس مريح ومتناسق فنيًا."
      };
    });

    // Recommend the balanced one
    const recommendationId = cheapestOffer.id;

    return {
      recommendationId,
      recommendationReason: `ننصح فنيًا بهذا العرض لمناسبته المالية الكبيرة للميزانية (${cheapestOffer.price.toLocaleString()} ج.م) مع الالتزام بالخامات الأساسية المريحة وتوفير فترة ضمان للأساسيات.`,
      bidsAnalysis,
      materialsSummaryComparison: `المقارنة الفنية توضح أن العروض تتنافس بشكل متقارب. البنود الأساسية ككابلات الكهرباء السويدي ومواسير بي آر للسباكة مضمونة ومطابقة بوضوح لمعايير الجودة المصرية.`,
      aiVerdict: `بصفتي خبيراً هندسياً بالمنصة، أنصح بالاستقرار على العرض الموصى به لتقليل الهدر، مع إلزام المقاول أثناء صياغة العقد الثلاثي بتدشين محضر معاينة أولي وتوثيق خطة الدفعات المرحلية.`
    };
  };

  // If no AI client, return heuristic feedback instantly
  if (!ai) {
    return res.json({
      success: true,
      mode: "local_heuristic",
      data: generateHeuristicLocalFallback()
    });
  }

  // --- GOOGLE GENAI LIVE INTERACTION ---
  try {
    const prompt = `
    You are a professional Egyptian senior engineering estimator and interior architectural consultant.
    Analyze the following property project information and the closing bids submitted by certified contractors.
    Identify:
    1. Which offer is the best recommendation (recommendationId) and why (recommendationReason).
    2. Deep analysis of each bid (praise points, criticisms, pricing fairness, materials quality index, and risk assessment).
    3. Generate warning flags if bids are suspiciously cheap (underpriced, risking supply cuts) or overpriced (bloated markup).
    4. Provide all analysis textual content in clear, professional, warm Egyptian Arabic text (اللغة العربية بلهجة هندسية مصرية راقية).

    PROJECT SPECIFICATIONS:
    - Unit Type: ${request.unitType}
    - Area: ${request.area} m²
    - Location: ${request.governorate} - ${request.city}
    - Desired Quality Level: ${request.finishingLevel}
    - Client Budget: ${request.budget} EGP
    - Client Notes: ${request.notes || "None"}

    SUBMITTED OFFERS:
    ${JSON.stringify(offers.map(o => ({
      id: o.id,
      price: o.price,
      durationDays: o.durationDays,
      description: o.description,
      materialsDetail: o.materialsDetail || "None",
      warrantyDetail: o.warrantyDetail || "None"
    })), null, 2)}

    Current Priority Metric SELECTED by client: ${priority || "BALANCED"} (E.g. BALANCED, PRICE, DURATION, RATING, MATERIALS). Keep this in mind for selecting the recommendation!

    Produce a reliable JSON reply.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an AI estimator system that must return strictly standard active JSON string object matching the requested schema. No conversational wrappers, no markdown code block backticks unless strictly JSON formatted.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["recommendationId", "recommendationReason", "bidsAnalysis", "materialsSummaryComparison", "aiVerdict"],
          properties: {
            recommendationId: { type: Type.STRING, description: "The exact offer.id being strictly recommended." },
            recommendationReason: { type: Type.STRING, description: "Comprehensive architectural explanation in Arabic for selecting this offer." },
            bidsAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["offerId", "pricingFairness", "praisePoints", "criticismPoints", "materialsScore", "riskAssessment"],
                properties: {
                  offerId: { type: Type.STRING },
                  pricingFairness: { type: Type.STRING, description: "Values must be exactly FAIR, OVERPRICED, or UNDERPRICED based on local market in Egypt." },
                  praisePoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Strengths of the bid in Arabic" },
                  criticismPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Issues or warnings about the bid in Arabic" },
                  materialsScore: { type: Type.INTEGER, description: "Technical score from 0 to 100 on quality of specified raw products" },
                  riskAssessment: { type: Type.STRING, description: "Risk text about this bid in Arabic" }
                }
              }
            },
            materialsSummaryComparison: { type: Type.STRING, description: "Comparison summary text of materials used across all bids in Arabic." },
            aiVerdict: { type: Type.STRING, description: "Architectural executive verdict and recommendation for next steps in clear Arabic." }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    return res.json({
      success: true,
      mode: "gemini_genai",
      data: parsedData
    });

  } catch (err: any) {
    console.log("Bids comparison utilizing smart local rules engine fallback.");
    return res.json({
      success: true,
      mode: "local_heuristic",
      data: generateHeuristicLocalFallback(),
      wasServiceOverloaded: true
    });
  }
});


/**
 * 1.5 AI-DRIVEN PRICING TRANSPARENCY ANALYZER
 */
app.post("/api/ai/analyze-pricing", async (req, res) => {
  const { request, offers, allRequests, companies } = req.body;

  if (!request || !offers || !Array.isArray(offers)) {
    return res.status(400).json({ error: "Missing required request or offers parameters." });
  }

  // --- LOCAL CALCULATION ---
  const calculatePricingMarketMetadata = () => {
    // Determine defaults based on finishing level in EGP
    let defaultRate = 3500;
    const finishing = (request.finishingLevel || '').trim();
    if (finishing.includes('اقتصادي')) defaultRate = 2200;
    else if (finishing.includes('بريميوم') || finishing.includes('VIP')) defaultRate = 4800;
    else if (finishing.includes('سوبر لوكس')) defaultRate = 3400;
    else if (finishing.includes('لوكس')) defaultRate = 2800;

    let rates: number[] = [defaultRate];
    let sources: string[] = [`سعر الباقة القياسي لمنصة شطبها: ${defaultRate.toLocaleString()} ج.م / م²`];

    // Read matching from company packages if available
    if (companies && Array.isArray(companies)) {
      companies.forEach(c => {
        if (c.packages && Array.isArray(c.packages)) {
          c.packages.forEach((pkg: any) => {
            if (pkg.pricePerSqm && pkg.pricePerSqm > 0) {
              const nameLower = (pkg.name || '').toLowerCase();
              const descLower = (pkg.description || '').toLowerCase();
              if (
                nameLower.includes(finishing) || 
                descLower.includes(finishing) ||
                (finishing === 'لوكس' && nameLower.includes('لوكس'))
              ) {
                rates.push(pkg.pricePerSqm);
                sources.push(`باقة الشركة ${c.companyName || ''}: ${pkg.pricePerSqm.toLocaleString()} ج.م / م²`);
              }
            }
          });
        }
      });
    }

    // Read matching requests
    let matchedRequestsCount = 0;
    if (allRequests && Array.isArray(allRequests)) {
      allRequests.forEach(r => {
        if (
          r.id !== request.id &&
          r.unitType === request.unitType &&
          r.finishingLevel === request.finishingLevel &&
          r.area > 0 &&
          r.budget > 0
        ) {
          const rRate = r.budget / r.area;
          rates.push(rRate);
          matchedRequestsCount++;
          sources.push(`طلب مماثل #${r.id} (${r.governorate || ''} - ${r.city || ''}) بمساحة ${r.area}م²: ${Math.round(rRate).toLocaleString()} ج.م / م²`);
        }
      });
    }

    const marketAverageSqm = Math.round(rates.reduce((sum, r) => sum + r, 0) / rates.length);
    const marketAverageTotal = marketAverageSqm * request.area;
    const marketRangeMin = Math.round(marketAverageTotal * 0.85);
    const marketRangeMax = Math.round(marketAverageTotal * 1.15);

    const bidsPricingAnalysis = offers.map(off => {
      const sqmRate = Math.round(off.price / request.area);
      const deviationPercentage = parseFloat((((sqmRate - marketAverageSqm) / marketAverageSqm) * 100).toFixed(1));

      let pricingTag = "STANDARD_AVERAGE";
      let transparencyWarning = "العرض يقع ضمن النطاق السعري لمتوسط السوق الطبيعي. البنود والخامات متوافقة ومتوازنة فنيًا.";
      let transparencyWarningEn = "This bid matches the standard market average. Core materials and rates are balanced.";

      if (deviationPercentage > 15) {
        pricingTag = "SIGNIFICANTLY_HIGH";
        transparencyWarning = `هذا العرض أعلى من متوسط السوق لطلبك بنسبة ${deviationPercentage}%. يرجى مراجعة البنود الإضافية والتأكد من عدم وجود مبالغة في هوامش الربح.`;
        transparencyWarningEn = `This bid is significantly higher (${deviationPercentage}%) than the market average. Review scope items for inflated markups.`;
      } else if (deviationPercentage < -15) {
        pricingTag = "SIGNIFICANTLY_LOW";
        transparencyWarning = `هذا العرض أقل من متوسط السوق بنسبة ${Math.abs(deviationPercentage)}%. هناك مخاطرة فنية ملموسة بتركيب خامات غير أصلية أو طلب ملحقات دفع لاحقاً لإكمال العمل.`;
        transparencyWarningEn = `This bid is ${Math.abs(deviationPercentage)}% lower than average. Risks of sub-standard materials or hidden change orders exist.`;
      }

      return {
        offerId: off.id,
        price: off.price,
        sqmRate,
        deviationPercentage,
        pricingTag,
        transparencyWarning,
        transparencyWarningEn
      };
    });

    return {
      marketAverageSqm,
      marketAverageTotal,
      marketRangeMin,
      marketRangeMax,
      matchedRequestsCount,
      sources: sources.slice(0, 5),
      bidsPricingAnalysis,
      expertVerdictAr: `مستند تسعير معتمد: بناء على تحليل المشاريع المماثلة المسجلة وباقات الشركات المعتمدة، يبلغ متوسط الكلفة العادل للمتر المربع في النطاق الجغرافي حوالي ${marketAverageSqm.toLocaleString()} ج.م. ننصح باختيار العرض الأقرب لمتوسط السعر لتجنب عيوب الجودة وسوء التأسيس أو تضخم الرسوم.`,
      expertVerdictEn: `Standard estimate: Similar historical projects and certified packages suggest an average sqm rate of ${marketAverageSqm.toLocaleString()} EGP. Bids close to this range optimize quality without overpayment.`
    };
  };

  const calculatedInfo = calculatePricingMarketMetadata();

  if (!ai) {
    return res.json({
      success: true,
      mode: "local_heuristic",
      data: calculatedInfo
    });
  }

  // --- LIVE CHAT WITH GEMINI ---
  try {
    const prompt = `
    You are an expert real estate estimator and quantity surveyor (حاسب كميات وهندسة تكاليف) for the Egyptian residential decoration market.
    Review the following decoration project and incoming bids, compared to calculated historical data:
    
    PROJECT CONF:
    - Unit Type: ${request.unitType}
    - Area: ${request.area} m²
    - Finishing Level: ${request.finishingLevel}
    - Location: ${request.governorate} - ${request.city}
    
    CALCULATED HISTORICAL BASELINE:
    - Estimated Market Average sqm rate: ${calculatedInfo.marketAverageSqm} EGP/m²
    - Standard total price range: ${calculatedInfo.marketRangeMin} - ${calculatedInfo.marketRangeMax} EGP
    - Similar projects verified: ${calculatedInfo.matchedRequestsCount}
    
    SUBMITTED BIDS FOR AUDIT:
    ${JSON.stringify(offers.map(o => ({
      id: o.id,
      company: o.companyName,
      price: o.price,
      sqmRate: Math.round(o.price / request.area),
      durationDays: o.durationDays,
      materialsDetail: o.materialsDetail || "",
      description: o.description || ""
    })), null, 2)}

    Create an advanced AI Pricing Analysis Report for transparency.
    Your system must evaluate each bid's square meter rate against the market average. 
    Point out if they use high-quality brands (like Jotun, El-Sewedy, Duravit, Saveto, Hansgrohe etc.) that might justify high prices, or warn of cost-cutting.
    Provide the response in the requested strictly valid JSON schema (no extra text).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an AI Cost & Contract Estimator. Return strictly a JSON object matching the requested schema with Arabic as the primary language.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["bidsPricingAnalysis", "expertVerdictAr", "expertVerdictEn"],
          properties: {
            bidsPricingAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["offerId", "pricingTag", "transparencyWarning", "transparencyWarningEn"],
                properties: {
                  offerId: { type: Type.STRING },
                  pricingTag: { type: Type.STRING, description: "Must be exactly SIGNIFICANTLY_HIGH, SIGNIFICANTLY_LOW, or STANDARD_AVERAGE" },
                  transparencyWarning: { type: Type.STRING, description: "Detailed cost analysis warning in Arabic detailing why the price is high or low and risk of under-tendering, mentioning specific raw brands if justified." },
                  transparencyWarningEn: { type: Type.STRING, description: "Same warning in English." }
                }
              }
            },
            expertVerdictAr: { type: Type.STRING, description: "Executive summary verdict in Arabic for the client to choose wisely." },
            expertVerdictEn: { type: Type.STRING, description: "Verdict in English." }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    
    // Merge calculated statistics with Gemini content to get absolute accuracy
    const mergedResult = {
      marketAverageSqm: calculatedInfo.marketAverageSqm,
      marketAverageTotal: calculatedInfo.marketAverageTotal,
      marketRangeMin: calculatedInfo.marketRangeMin,
      marketRangeMax: calculatedInfo.marketRangeMax,
      matchedRequestsCount: calculatedInfo.matchedRequestsCount,
      sources: calculatedInfo.sources,
      bidsPricingAnalysis: calculatedInfo.bidsPricingAnalysis.map(local => {
        const geminiDetails = parsed.bidsPricingAnalysis?.find((g: any) => g.offerId === local.offerId);
        return {
          ...local,
          pricingTag: geminiDetails?.pricingTag || local.pricingTag,
          transparencyWarning: geminiDetails?.transparencyWarning || local.transparencyWarning,
          transparencyWarningEn: geminiDetails?.transparencyWarningEn || local.transparencyWarningEn
        };
      }),
      expertVerdictAr: parsed.expertVerdictAr || calculatedInfo.expertVerdictAr,
      expertVerdictEn: parsed.expertVerdictEn || calculatedInfo.expertVerdictEn
    };

    return res.json({
      success: true,
      mode: "gemini_genai",
      data: mergedResult
    });

  } catch (err: any) {
    console.log("Pricing analyzer utilizing smart local estimation fallback:", err);
    return res.json({
      success: true,
      mode: "local_heuristic",
      data: calculatedInfo,
      wasServiceOverloaded: true
    });
  }
});


/**
 * 2. CONTRACTOR BID OPTIMIZER & MATERIAL BUILDER
 */
app.post("/api/ai/optimize-description", async (req, res) => {
  const { description, budget, area, unitType, isMaterials } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Missing text description inputs." });
  }

  // --- LOCAL FALLBACK LOGIC ---
  const generateLocalHeuristicOptimization = () => {
    if (isMaterials) {
      return `تأسيس السباكة: استخدام مواسير بولي بروبلين (BR أو الشريف) بالضمان المعتمد وعمر افتراضي طويل مع اختبار الضغط عند ٢٠ بار.\n` +
        `أعمال الكهرباء: سحب كابلات السويدي المعتمدة كليًا بمفاتيح ولوحة تحكم شنايدر العالمية لضمان الأمان في الأحمال وبمستويات حماية عالية.\n` +
        `أعمال الدهانات: تأسيس ممتاز بـ ٣ سكاكين معجون سافيتو ولواصق ودهان جوتن فينوماستيك أو جي إل سي سوبر ديلوكس المعمر.\n` +
        `الأرضيات: سيراميك كليوباترا فرز أول أو بورسلين رويال فرز ملكي مع استخدام لواصق كيميائية معتمدة (أديبوند أو مشابه) بدلاً من المونة العادية لتفادي الانفصال.\n\n` +
        `نص مدخل للتطوير الفني:\n${description}`;
    } else {
      return `نحن شركة معتمدة وكيان متكامل مسجل بمنصة شطبها بخبرة واسعة ومتميزة في التشطيبات المعمارية والديكور للـ ${unitType || "شقة"} بمساحة ${area || 120}م² وميزانية تقديرية ${budget ? budget.toLocaleString() : 'ملائمة'} ج.م.\n\n` +
        `خطتنا التنفيذية تشمل:\n` +
        `١. الالتزام بالجدول الزمني وعقد شطبها الموحد مع شروط جزائية.\n` +
        `٢. التوافق التام مع كود الفحص واستلام ممثلي الإشراف الفني والمهندسين لكل مرحلة.\n` +
        `٣. تقديم تقارير دورية مدعمة بالصور ومقاطع الفيديو للمالك أولاً بأول.\n\n` +
        `الصياغة المطورة لمدخلات المقترح:\n${description}`;
    }
  };

  if (!ai) {
    return res.json({
      success: true,
      mode: "local_heuristic",
      optimizedText: generateLocalHeuristicOptimization()
    });
  }

  try {
    const prompt = isMaterials
      ? `You are an expert construction estimating engineer in Egypt. 
         Optimize and expand the following rough construction material list specification into a professional, high-end technical material description suitable for a formal legal contract or tender on "Shattabha" platform.
         Ensure standard premium Egyptian brands are mentioned such as: Elsewedy Cables (السويدي) for wires, BR (بي آر) or El-Sherif (الشريف) for green PPR plumbing, Jotun (جوتن) or GLC for painting, Saveto (سافيتو) or Sika for chemicals/insulation, Cleopatra/Royal (كليوباترا/رويال) for tiles.
         Keep it in highly professional, technical Egyptian Arabic formatting.
         
         Rough input text to optimize and expand: "${description}"
         Project Area: ${area || 120} sqm, Unit Type: ${unitType || "شقة"}`
      : `You are an expert executive project manager for construction and interior finishings in Egypt.
         Optimize and rewrite the following rough company bid profile / proposal description into an extremely professional, convincing, competitive, and detail-oriented business bid proposal.
         Emphasize: commit to direct technical inspections, standard code audits, escrow account safety, smart tripartite contracts, high-quality finishing levels, and absolute transparency.
         Keep it in elegant, professional Egyptian Arabic.
         
         Rough input text to optimize and rewrite: "${description}"
         Project specs: Budget: ${budget || 300000} EGP, Area: ${area || 120} sqm, Unit Type: ${unitType || "شقة"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert builder and contractor consultant writing top-performing construction specifications and proposals in Arabic. Provide only the resulting optimized Arabic text directly, with no headers, markdown blocks, conversational prefixes or extra fluff.",
        temperature: 0.7,
      }
    });

    return res.json({
      success: true,
      mode: "gemini_genai",
      optimizedText: response.text?.trim() || generateLocalHeuristicOptimization()
    });

  } catch (err: any) {
    console.warn("Optimize description failed, fallback to local heuristic:", err);
    return res.json({
      success: true,
      mode: "local_heuristic",
      optimizedText: generateLocalHeuristicOptimization()
    });
  }
});


/**
 * 3. AI CHATBOT 'ADAM' - THE LICENSED TECHNICAL ADVISOR
 */
app.post("/api/ai/chatbot", async (req, res) => {
  const { message, history, role, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing chat message query." });
  }

  // Local fallback reply generator using Shattabha Knowledge rules
  const generateHeuristicChatbotReply = () => {
    // 1. Precise Knowledge Base Lookup Fallback (for engineering specialties, materials, and platform workflows)
    const expertAnswer = getExpertAnswering(message);
    if (expertAnswer) {
      return expertAnswer;
    }

    const msgLower = message.toLowerCase();
    const asksForMaterials = msgLower.includes("ماد") || msgLower.includes("خام") || msgLower.includes("اسمنت") || msgLower.includes("حديد") || msgLower.includes("دهان") || msgLower.includes("سعر") || msgLower.includes("أسعار") || msgLower.includes("اسعار") || msgLower.includes("متر") || msgLower.includes("بورصة");
    const asksForPackages = msgLower.includes("باق") || msgLower.includes("تشطيب") || msgLower.includes("سعر المتر") || msgLower.includes("تكلفة التشطيب") || msgLower.includes("مربع") || msgLower.includes("م²") || msgLower.includes("باقات");
    
    // Check if user is asking to analyze or compare bids/quotes/offers/prices
    const asksToCompareOffers = msgLower.includes("مقارن") || msgLower.includes("تحليل") || msgLower.includes("عرض") || msgLower.includes("عروض") || msgLower.includes("bid") || msgLower.includes("offer") || msgLower.includes("quote");
    if (asksToCompareOffers && context && context.requests && context.offers && context.offers.length > 0) {
      const reqs = context.requests;
      const offs = context.offers;
      const req = reqs[0]; // Active project
      
      if (req) {
        let defaultRate = 3400;
        const finishing = (req.finishingLevel || '').trim();
        if (finishing.includes('اقتصادي')) defaultRate = 2200;
        else if (finishing.includes('بريميوم') || finishing.includes('VIP')) defaultRate = 4800;
        else if (finishing.includes('سوبر لوكس')) defaultRate = 3400;
        else if (finishing.includes('لوكس')) defaultRate = 2800;

        let rates: number[] = [defaultRate];
        reqs.forEach((r: any) => {
          if (r.id !== req.id && r.unitType === req.unitType && r.finishingLevel === req.finishingLevel && r.area > 0 && r.budget > 0) {
            rates.push(r.budget / r.area);
          }
        });

        const marketAverageSqm = Math.round(rates.reduce((sum, r) => sum + r, 0) / rates.length);
        const marketAverageTotal = marketAverageSqm * req.area;

        let reply = `أهلاً بك أنا آدم مستشارك الهندسي المعتمد لمنصة شطبها. لقد قمت بتحليل عروض الأسعار ومقارنتها بالأسعار المرجعية للمشاريع المشابهة لمشروعك (مساحة: ${req.area}م²، فئة: ${req.finishingLevel}، موقع: ${req.governorate || ''} - ${req.city || ''}):\n\n`;
        reply += `📊 **المؤشرات المرجعية لمتوسط السوق اليوم:**\n`;
        reply += `- السعر المرجعي للمتر الفني المعتمد: **${marketAverageSqm.toLocaleString()} ج.م / م²**.\n`;
        reply += `- التكلفة الإجمالية التقديرية بموجب المساحة: **${marketAverageTotal.toLocaleString()} ج.م**.\n\n`;
        reply += `🔍 **تحليل عروض الشركات والمقاولين المستلمة لمشروعك:**\n`;

        offs.forEach((off: any) => {
          if (off.requestId === req.id) {
            const bidSqm = off.price / req.area;
            const diffPct = ((bidSqm - marketAverageSqm) / marketAverageSqm) * 100;
            reply += `🏢 **عرض شركة (${off.companyName}):**\n`;
            reply += `- القيمة الإجمالية للعرض: **${off.price.toLocaleString()} ج.م** (سعر المتر: **${Math.round(bidSqm).toLocaleString()} ج.م / م²**).\n`;
            
            if (diffPct > 15) {
              reply += `⚠️ **تنبيه هام:** هذا العرض أعلى من متوسط السوق العادل بـ **${Math.round(diffPct)}%**. ننصحك بمراجعة تفاصيل جدول الكميات للتأكد من عدم وجود مبالغات.\n`;
            } else if (diffPct < -15) {
              reply += `🚨 **تحذير جودة حرج:** هذا العرض منخفض عن متوسط السوق بـ **${Math.round(Math.abs(diffPct))}%**. يرجى الحذر الشديد من استخدام مواد تجارية غير معتمدة أو رديئة لتجنب المشاكل.\n`;
            } else {
              reply += `✅ **عرض متوازن للتشطيب:** هذا العرض يقع ضمن النطاق العادل للسوق اليوم ومواصفاته مطابقة للضمان الموحد.\n`;
            }
            reply += `\n`;
          }
        });
        
        reply += `💡 *توجيه المهندس آدم:* التزم بربط الدفعات مع المقاولين عبر **[حساب الضمان (Escrow)]** لتضمن استلام أعمالك مطابقة لأعلى المعايير الهندسية!`;
        return reply;
      }
    }
         const priceEzz = currentMaterialsList.find(m => m.id === "MAT-E01")?.priceEgp?.toLocaleString() || "38,200";
      const priceEgy = currentMaterialsList.find(m => m.id === "MAT-E02")?.priceEgp?.toLocaleString() || "37,600";
      const priceSweed = currentMaterialsList.find(m => m.id === "MAT-M01")?.priceEgp?.toLocaleString() || "2,280";
      const priceAssiut = currentMaterialsList.find(m => m.id === "MAT-M02")?.priceEgp?.toLocaleString() || "2,150";
      const priceJotun = currentMaterialsList.find(m => m.id === "MAT-D01")?.priceEgp?.toLocaleString() || "2,480";
      const priceGLC = currentMaterialsList.find(m => m.id === "MAT-D02")?.priceEgp?.toLocaleString() || "1,390";
      const priceCleo = currentMaterialsList.find(m => m.id === "MAT-F01")?.priceEgp?.toLocaleString() || "195";
      const priceRoyal = currentMaterialsList.find(m => m.id === "MAT-F02")?.priceEgp?.toLocaleString() || "520";

      const rangeEcon = currentPricingTiers.economic?.range || "٢,٠٠٠ إلى ٢,٥٠٠ ج.م للمتر المربع";
      const rangeLux = currentPricingTiers.lux?.range || "٢,٦٠٠ إلى ٣,٢٠٠ ج.م للمتر المربع";
      const rangeSuper = currentPricingTiers.superLux?.range || "٤,٥٠٠ إلى ٧,٥٠٠ ج.م للمتر المربع";
      const rangePremium = currentPricingTiers.premium?.range || "٨,٠٠٠ إلى ١٢,٠٠٠ ج.م للمتر المربع";

      if (asksForMaterials && !asksForPackages) {
        return "أهلاً بك! لقد قمت بتحليل استفسارك، وتبين لي رغبتك بالاطلاع على **أسعار الخامات والمواد الخام** لإعداد المونة والتأسيس. إليك نشرة الأسعار الدقيقة والممثلة للأسواق اليوم:\n\n" +
          `🧱 **حديد التسليح (Tension Steel Bars):**\n` +
          `- حديد عز التسليح الأصلي: **${priceEzz} ج.م / طن**.\n` +
          `- حديد المصريين للتشييد والتطوير: **${priceEgy} ج.م / طن**.\n\n` +
          `🌫️ **الأسمنت والمواد الخام الأساسية:**\n` +
          `- أسمنت السويدي الممتاز رتبة 52.5: **${priceSweed} ج.م / طن**.\n` +
          `- أسمنت أسيوط المقاوم للأملاح والرطوبة: **${priceAssiut} ج.م / طن**.\n\n` +
          `🎨 **الدهانات والمواد الكيماوية للجدران:**\n` +
          `- دهان جوتن فينوماستيك الأصلي (بستلة 15 لتر): **${priceJotun} ج.م**.\n` +
          `- دهان جي إل سي سوبر ديلوكس المعتمد (بستلة 15 لتر): **${priceGLC} ج.م**.\n\n` +
          `📐 **الأرضيات والتشطيب المعماري:**\n` +
          `- سيراميك كليوباترا فرز أول فاخر: **${priceCleo} ج.م / متر مربع**.\n` +
          `- بورسلين رويال فرز ملكي نخب ممتاز: **${priceRoyal} ج.م / متر مربع**.\n\n` +
          "💡 *توجيه فني من م/ آدم:* أسعار المواد الخام الفردية تتغير يومياً. يمكنك تثبيت هذه الأسعار وحجز كمية من المواد بخصم 6.5% من خلال حاسبة التوريد المخصصة في تبويب **[أسعار المواد]** ضمن لوحة المساعد الذكي!";
      }
      
      if (asksForPackages && !asksForMaterials) {
        return "أهلاً بك! تتوفر مقايساتنا في منصة شطبها على أربع باقات رئيسية ومتكاملة لـ **تشطيب الوحدات السكنية (سعر المتر المربع)** والتشغيل العازل بأعلى المواصفات الفنية:\n\n" +
          `1️⃣ **التشطيب الاقتصادي:** يتراوح بين **${rangeEcon}**.\n` +
          "   *المواصفات:* يشمل التأسيس المعتمد للكهرباء والسباكة مع دهانات GLC وديكورات مريحة وتلبيس سيراميك فرز ثاني.\n\n" +
          `2️⃣ **التشطيب المتوسط (لوكس / Lux):** يتراوح من **${rangeLux}**.\n` +
          "   *المواصفات:* يشمل أسلاك السويدي المعتمدة والسباكة الذكية مع دهانات جوتن الفينوماستيك وسيراميك فرز أول كليوباترا.\n\n" +
          `3️⃣ **التشطيب الفاخر (Super Lux):** يتراوح بين **${rangeSuper}**.\n` +
          "   *المواصفات:* يعتمد عزل الرطوبة المتكامل لجميع الحمامات والمطبخ، تكسية رخام مستورد للريسبشن وتأسيس أسقف معلقة جبس بورد متميزة.\n\n" +
          `4️⃣ **التشطيب الفائق (Premium / VIP):** يبدأ من **${rangePremium}**.\n` +
          "   *المواصفات:* أنظمة التحكم الذكي (Smart Home)، عزل صوت متقدم، بورسلين رويال الملكي وتفاصيل فنية تضفي فخامة عصرية وعقود كفالة ممتدة.\n\n" +
          "💡 *نصيحة المهندس آدم:* يمكنك تصفح عروض الشركات المقدمة لمشروعك ومقارنتها بمتوسط السوق تلقائياً عبر علامة التبويب **[توصية العروض]** للتأكد من نزاهة العروض والمقايسات.";
      }

      // If generic "الأسعار" or asks about both
      return "أهلاً بك! لقد قمت بتحليل نيتك الاستفسارية حول **الأسعار** في أسواق التشييد والتشطيب بمصر اليوم. لضمان أفضل تغطية، يقوم المساعد الذكي آدم بالتمييز التلقائي بين فئتين للرد عليك ببيانات دقيقة:\n\n" +
        "🏠 **الفئة الأولى: باقات التشطيب المتكاملة للوحدات (سعر المتر المربع):**\n" +
        `- **التشطيب الاقتصادي:** ${rangeEcon} (تأسيس أساسي وخامات عادية)\n` +
        `- **التشطيب المتوسط (لوكس):** ${rangeLux} (أسلاك السويدي مع سيراميك فرز أول)\n` +
        `- **التشطيب الفاخر (Super Lux):** ${rangeSuper} (يشمل عزل رطوبة معتمد، رخام وجبس بورد)\n` +
        `- **التشطيب الفائق (Premium):** ${rangePremium} (أنظمة ذكية، ديكورات خشبية وبورسلين ملكي)\n\n` +
        "🧱 **الفئة الثانية: البورصة الاسترشادية المتكاملة للمواد الخام (تحديث لحظي اليوم):**\n" +
        `- **حديد التسليح (عز):** ${priceEzz} ج.م / طن | **المصريين:** ${priceEgy} ج.م / طن\n` +
        `- **أسمنت السويدي رتبة 52.5:** ${priceSweed} ج.م / طن | **أسمنت أسيوط المقاوم:** ${priceAssiut} ج.م / طن\n` +
        `- **دهان جوتن فينوماستيك:** ${priceJotun} ج.م / بستلة ١٥ لتر | **دهان جي إل سي سوبر ديلوكس:** ${priceGLC} ج.م / بستلة ١٥ لتر\n` +
        `- **سيراميك كليوباترا فرز أول:** ${priceCleo} ج.م / م² | **بورسلين رويال فرز ملكي:** ${priceRoyal} ج.م / م²\n\n` +
        "💡 *توصية المساعد الذكي:* لمعرفة المزيد وتثبيت الكميات للموقع تفضل بزيارة:\n" +
        "1️⃣ علامة التبويب **[أسعار المواد]** لحساب الطلبات التقديرية بدقة بالطن والمتر وتثبيت السعر.\n" +
        "2️⃣ علامة التبويب **[توصية العروض]** لفرز وتدقيق العروض النشطة لمشروعك ومقارنتها بالمتوسط المرجعي للمنطقة.";
    if (msgLower.includes("ضمان") || msgLower.includes("صيان")) {
      return "تعتمد شروط ضمان منصة شطبها على ضرورة تقديم المقاولين والشركات المعتمدة لضمان معقول وموثق. ننصح بالحرص على فترة ضمان لا تقل عن ٥ إلى ١٠ سنوات لأعمال التأسيس كعزل السباكة والكهرباء الحيوية، وضمان عامين لجودة الديكورات ومفاتيح الطاقة.";
    }
    if (msgLower.includes("نصاب") || msgLower.includes("احتيال") || msgLower.includes("ضحك عليا") || msgLower.includes("امان") || msgLower.includes("مضمون")) {
      return "نظام شطبها يحميك تماماً! نحن نقوم بوضع أموال الدفعات في حساب ضمان مستقل (Escrow)، ولا يتسلم المقاول دفعة جراء أي مرحلة تشطيب إلا بعد نزول مهندس الاستلام الفني الشامل من طرفنا لمشروعك بشكل شخصي وتأكيده مطابقة المواصفات المعتمدة.";
    }
    return `أهلاً بك أنا آدم مستشارك الهندسي المعتمد لمنصة شطبها. يسعدني مساعدتك في تقدير أسعار بنود الكهرباء والسباكة والدهانات والمحارة، أو مراجعة عروض الأسعار المقدمة ومقارنتها بمتوسط السوق والأسعار التاريخية، أو شرح شروط العقد الموحد وحماية أموالك عبر حساب الضمان (Escrow). كيف يمكنني مساعدتك اليوم؟`;
  };

  if (!ai) {
    return res.json({
      success: true,
      mode: "local_heuristic",
      reply: generateHeuristicChatbotReply()
    });
  }

  try {
    const formattedHistory = (history || []).map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text || "" }]
    }));

    const systemInstruction = `
    You are 'Adam' (آدم - مستشارك الهندسي المعتمد لمنصة شطبها).
    Always identify yourself as 'آدم' (Adam).
    Your first response or greeting prefix must always start with: 'أهلاً بك أنا آدم مستشارك الهندسي المعتمد لمنصة شطبها'.
    You are a friendly, highly intelligent Egyptian construction consultant and expert estimator representing "شطبها" (Shattabha) platform.

    --- PLATFORM PHILOSOPHY & WORKFLOW (فلسفة شطبها ومراحل الطلب): ---
    Shattabha is NOT just a catalog or matchmaking broker. It is a strict technical supervision, quality assurance, and escrow provider.
    Its goal is protecting clients, enforcing standard Egyptian construction codes, and eliminating contractor fraud through:
    1. Escrow Account (حساب الضمان): Clients pre-fund milestones. Funds are LOCKED and ONLY released to the contractor after a certified Shattabha Supervisor (المشرف الفني / المفتش الميداني) conducts a professional, hands-on, multi-point inspection and writes an official approval report.
    2. Tripartite Standard Contract (العقد الموحد): Includes delay penalties, precise materials listings, and solid warranty structures.
    3. Workflow Stages:
       - Request Creation (تقديم الطلب)
       - Engineering Review (المراجعة المعمارية)
       - Tender/Bidding (المناقصة)
       - Offers/Bids Recommendation (توصية العروض)
       - Selecting Company (اختيار المقاول)
       - Tripartite Smart Signing (توقيع العقد)
       - Excavation/Execution (التنفيذ الفعلي)
       - Milestone Field Inspection (الاستلام الفني المرحلي)
       - Handover (التسليم النهائي)
       - Interactive Warranty activation (تفعيل شهادة الضمان)

    --- USER ROLE SPECIALIZATION AND ALIGNMENT (الاستجابة بحسب دور المستخدم): ---
    The user's active role is: "${role || 'CLIENT'}". Adopt your advisory tone dynamically based on guidelines:
    ${JSON.stringify(roleGuidelines, null, 2)}

    - If CLIENT: Comfort them. Explain how Escrow accounts protect them. Warn them never to pay contractors directly outside the platform. Explain how to request inspection visits.
    - If COMPANY/CONTRACTOR: Be strict, clear, and professional. Remind them of our rigid engineering codes (كود الفحص). Emphasize that no milestone is approved without direct inspection. Advise them to use our corporate raw materials supply store to get a 6.5% discount and save their margin.
    - If INSPECTOR (المشرف الفني): Act as an expert engineering senior peer. Remind them of their technical and legal duties. Emphasize standard inspection checklists: pressure testing block plumbing at 20 bar, flatness checks with structural straightedges, and photographing tests in high-res.

    --- RAW MATERIALS DATABASE, LABOR RATES & PRICING TIERS: ---
    You must rely on these exact prices and packages from our verified Shattabha materials, labor rates, and package catalog:
    - Raw Materials Catalog:
    ${JSON.stringify(currentMaterialsList, null, 2)}
    - Labor Rates Catalog (أسعار معلنة للمصنعية واليد العاملة):
    ${JSON.stringify(currentLaborRates, null, 2)}
    - Unit Package Estimates (سعر باقات التشطيب للمتر المربع):
    ${JSON.stringify(currentPricingTiers, null, 2)}
    
    Regional multipliers info:
    ${JSON.stringify(locationModifiers, null, 2)}

    --- CRITICAL FEAT - INTENT ANALYSIS FOR PRICE INQUIRIES (تحليل نية أسعار التشطيب مقابل المواد): ---
    Whenever the user asks about prices ("الأسعار", "سعر", "اسعار", "تكلفة", etc.), you must perform precise intent analysis:
    1. If they ask about Raw/Construction Materials (أسعار المواد الخام ومواد البناء):
       - Provide the precise raw material prices:
         * حديد عز التسليح الأصلي: 38,200 EGP / Ton
         * حديد المصريين للتشييد: 37,600 EGP / Ton
         * أسمنت السويدي رتبة 52.5: 2,280 EGP / Ton
         * أسمنت أسيوط المقاوم: 2,150 EGP / Ton
         * دهان جوتن فينوماستيك الأصلي (بستلة 15 لتر): 2,480 EGP
         * دهان جي إل سي سوبر ديلوكس (بستلة 15 لتر): 1,390 EGP
         * سيراميك كليوباترا فرز أول فني: 195 EGP / m²
         * بورسلين رويال فرز ملكي نخب ممتاز: 520 EGP / m²
       - Mention that they can calculate their custom procurement volumes, get a 6.5% discount, and lock their prices down in the dedicated "أسعار المواد" tab of the Smart Adam Panel.
    2. If they ask about Finishing Packages/Tiers or per square meter rates (باقات التشطيب وسعر المتر):
       - Provide the precise finishing package per-square-meter rate categories:
         * التشطيب الاقتصادي: 2,000 - 2,500 EGP / m²
         * التشطيب المتوسط (لوكس): 2,600 - 3,200 EGP / m²
         * التشطيب الفاخر (Super Lux): 4,500 - 7,500 EGP / m² (including waterproofing, marble, gypsum board)
         * التشطيب الفائق (Premium): 8,000 - 12,000 EGP / m² (smart systems, royal porcelain, custom wood craft)
       - Recommend they review and compare their bid proposals in the "توصية العروض" tab.
    3. If the query is ambiguous or general (e.g., they ask "الأسعار" or "اسعار البناء والتشطيب"):
       - Create a highly structured, beautiful dual-category report clearly separating:
         a) Category 1: Finishing Packages / Sqm Price (باقات التشطيب وسعر المتر المربع)
         b) Category 2: Raw/Construction Material Prices (أسعار مواد البناء والتشطيب الأساسية)
       - Clearly direct them to both interactive tabs in the Smart Adam Panel ("أسعار المواد" and "توصية العروض") to explore further.
    
    Do NOT confuse raw individual material prices with general all-inclusive finishing package per-square-meter rates! Ensure they are always logically classified and explained separately.

    --- CORE SERVICE - PRICING TRANSPARENCY ANALYZER (مقياس نزاهة الأسعار والعروض): ---
    You have direct access to historical requests and actual incoming bids (offers) inside this context object:
    ${JSON.stringify(context || {})}
    
    If the user asks directly or indirectly about comparing, checking, reviewing, or examining bids, offers, prices, or quotes (e.g., "حلل العروض", "قارن عروض الأسعار", "هل السعر مناسب؟", "bids comparison", "prices check", etc.):
    1. Identify the current client request (the area, unit type, location, and finishing level).
    2. Retrieve any bids/offers associated with this request from the context.
    3. Calculate the standard market average custom rate for this project based on standard platform metrics or historical similar projects present in the requests context (for example, Econ level: ~2200 EGP/sqm, Lux level: ~2800 EGP/sqm, Super Lux: ~3400 EGP/sqm, Premium/VIP: ~4850 EGP/sqm).
    4. Provide a thorough, direct pricing review for each bid in Egyptian Arabic.
    5. Highlight bids that are significantly higher (exceeding 15% above market average for that area and level) and WARN the client with warm Arabic advice that prices may be bloated or reflect unneeded premium additions.
    6. Highlight bids that are abnormally low (exceeding 15% below market average) and WARN the client with high alert: there is an extreme technical risk of using unbranded/fake materials or generating unprompted downstream change orders/fees.
    7. Specify exact prices, company names, and estimates to provide maximum transparency in Egyptian Arabic.

    --- PLATFORM FAQ & FEES (العمولات وفترات الضمان والتقديم): ---
    - Commissions: Client fee is 1% if they choose the specialized VIP supervisor option which handles full inspections. Contractor fee is 5% paid to Shattabha upon successful signing.
    - Warranty: 5 to 15 years on core electrical & plumbing installations, and 2 to 5 years on painting/carpentry finishes.
    - Best raw materials info:
      - Wires: Original Elsewedy Cables only (validate with QR). 2mm for lighting, 3mm for outlets, 4-6mm for heating/AC.
      - Plumbing: BR or Elsewedy green PP-R pipes, pressure tested at 20 bar. Basement floor polyurethane Sika 107 double coat isolations.
      - Plaster/Mortar: Straightedge (قدة) maximum allowance 1.5mm deviation, proper mesh on connection seams.
      - Tiles: Original Porcelain should only be fixed using specialist chemical adhesive, never raw cement mortar.

    Incorporate this deep engineering base, rules, and specialized guidelines to answer every inquiry perfectly. Keep your tone professional, consultative, extremely honest, and in warm Egyptian Arabic. Always start your response with 'أهلاً بك أنا آدم مستشارك الهندسي المعتمد لمنصة شطبها.'
    `;

    const chatInstance = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: formattedHistory
    });

    const response = await chatInstance.sendMessage({
      message: message
    });

    return res.json({
      success: true,
      mode: "gemini_genai",
      reply: response.text?.trim()
    });

  } catch (err: any) {
    console.warn("Gemini chatbot error. Fallback to local heuristic:", err);
    return res.json({
      success: true,
      mode: "local_heuristic",
      reply: generateHeuristicChatbotReply(),
      wasServiceOverloaded: true
    });
  }
});


// ----------------- VITE & STATIC FILES ROUTING -----------------

async function startServer() {
  // Mount Vite middleware for asset serving in Development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Shattabha server active and running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
