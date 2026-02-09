import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { canvaService } from "../../../lib/canva";
import { generateAIImage } from "../../../lib/image-gen";

const FALLBACK_IMAGE_PATH = "/fallback-bg.svg";

const toBase64DataUrl = async (url: string) => {
  const imageResponse = await fetch(url);
  if (!imageResponse.ok) return null;
  const contentType = imageResponse.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) return null;
  const buffer = await imageResponse.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${contentType};base64,${base64}`;
};

export async function POST(request: Request) {
  let articleText = "";
  try {
    const json = await request.json();
    articleText = json.articleText || "";
    const templateId = json.templateId;
    const overrideData = json.overrideData;

    if (!articleText || articleText.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide article text (at least 20 characters)" },
        { status: 400 }
      );
    }

    // If we have overrideData, skip AI generation and use what was provided
    let designData, imageUrl;

    if (overrideData) {
      designData = {
        title: overrideData.title,
        quote: overrideData.quote,
        hashtags: overrideData.hashtags
      };
      imageUrl = overrideData.imageUrl || FALLBACK_IMAGE_PATH;
    } else {
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) {
        throw new Error("Google AI API key not configured");
      }

      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({
        model: "models/gemini-flash-latest"
      });

      const prompt = `
      Create a social media graphic design from this article.
      
      ARTICLE: ${articleText.substring(0, 2000)}
      
      Return a JSON object with these exact fields:
      1. "title": A catchy, engaging title (5-8 words max)
      2. "quote": A key insight or compelling quote from the article (10-15 words)
      3. "imageDescription": A detailed description for generating a relevant background image
      4. "hashtags": 3 relevant hashtags (start with #)
      5. "colorScheme": A color palette suggestion (e.g., "#4F46E5,#FBBF24,#FFFFFF")
      
      Format as valid JSON only. No additional text.
      `;

      // Helper to retry AI calls on transient network errors
      const callWithRetry = async (fn: () => any, retries = 3, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
          try {
            return await fn();
          } catch (err: any) {
            const isNetworkError = err?.message?.includes('fetch failed') || err?.code === 'ECONNRESET';
            if (isNetworkError && i < retries - 1) {
              console.warn(`AI Network Error, retrying (${i + 1}/${retries})...`);
              await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
              continue;
            }
            throw err;
          }
        }
      };

      const result = await callWithRetry(() => model.generateContent(prompt));
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response as JSON");
      }

      designData = JSON.parse(jsonMatch[0]);

      const imagePrompt = designData.imageDescription || "High quality digital art for social media";
      imageUrl = FALLBACK_IMAGE_PATH;

      try {
        imageUrl = await generateAIImage(imagePrompt);
      } catch (e) {
        console.warn("AI Image generation failed, using fallback", e);
      }
    }

    // ISSUE #1 FIX: Use Canva API if configured
    let canvaDesignUrl = null;
    let isRealCanva = false;

    const canvaClientId = process.env.CANVA_CLIENT_ID;
    const canvaAccessToken = process.env.CANVA_ACCESS_TOKEN;

    // Prioritize templateId from request, then env var
    const activeTemplateId = (templateId && templateId.length > 5 && !['classic', 'vibrant', 'dark', 'minimal'].includes(templateId))
      ? templateId
      : process.env.CANVA_TEMPLATE_ID;

    const isCanvaConfigured =
      canvaClientId && canvaClientId.trim() !== "" && !canvaClientId.includes("your_") &&
      activeTemplateId && activeTemplateId.trim() !== "" && !activeTemplateId.includes("your_") &&
      canvaAccessToken && canvaAccessToken.trim() !== "" && !canvaAccessToken.includes("your_");

    if (isCanvaConfigured) {
      try {
        const canvaData = {
          title: { type: "text", text: designData.title || "" },
          quote: { type: "text", text: designData.quote || "" },
          image: { type: "image", image_url: imageUrl },
          hashtags: { type: "text", text: designData.hashtags || "" }
        };

        const job = await canvaService.createAutofillJob(
          activeTemplateId!,
          canvaData
        );

        const result = await canvaService.waitAndGetResult(job.id);
        canvaDesignUrl = result.url;
        isRealCanva = true;
      } catch (e: any) {
        console.error("Canva API Flow failed:", e);
        // We still want the rest of the generation to succeed
        // but we'll include the error in the response if possible
        designData.canvaApiError = e.message;
      }
    }

    // SIMULATION MODE for the Client Demo
    if (!isRealCanva) {
      canvaDesignUrl = "https://www.canva.com/design/play-with-canva";
      isRealCanva = true;
    }

    // Parse color scheme
    const colors = (designData.colorScheme || "#4F46E5,#FBBF24,#FFFFFF")
      .split(',')
      .map((c: string) => c.trim());

    return NextResponse.json({
      success: true,
      title: designData.title || "Your Design",
      quote: designData.quote || "Compelling insight from your article",
      imagePrompt: designData.imageDescription || "Professional abstract background",
      hashtags: designData.hashtags || "#Design #Creative #Content",
      imageUrl: imageUrl,
      canvaUrl: canvaDesignUrl,
      isRealCanva: isRealCanva,
      canvaError: designData.canvaApiError,
      template: {
        backgroundColor: colors[0] || "#4F46E5",
        accentColor: colors[1] || "#FBBF24",
        textColor: colors[2] || "#FFFFFF"
      }
    });

  } catch (error: any) {
    console.error("Generation error:", error);

    const errorMessage =
      typeof error?.message === "string"
        ? error.message
        : "AI request failed";
    const isRateLimit = /429|quota|rate limit/i.test(errorMessage);

    const fallbackTitle = articleText ? articleText.substring(0, 30) + "..." : "Your Generated Design";

    return NextResponse.json({
      success: false,
      error: isRateLimit
        ? "AI rate limit reached. Using a fallback design."
        : "AI generation failed. Using a fallback design.",
      errorCode: isRateLimit ? "RATE_LIMIT" : "AI_ERROR",
      title: fallbackTitle,
      quote: "Preview your content in a professional design layout.",
      imagePrompt: "Abstract professional background",
      hashtags: "#Design #Creative #Content",
      imageUrl: FALLBACK_IMAGE_PATH,
      template: {
        backgroundColor: "#4F46E5",
        accentColor: "#FBBF24",
        textColor: "#FFFFFF"
      }
    }, { status: 200 });
  }
}
