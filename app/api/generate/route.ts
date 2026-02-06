import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

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
  try {
    const { articleText } = await request.json();

    if (!articleText || articleText.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide article text (at least 20 characters)" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Google AI API key not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Use the working model from your list
    const model = genAI.getGenerativeModel({
      model: "models/gemini-flash-latest"
    });

    // Smart prompt for design generation
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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON");
    }

    const designData = JSON.parse(jsonMatch[0]);

    // Generate image URL using Unsplash Source API (proxied as data URL to avoid CORS)
    const imageKeyword = (designData.imageDescription || "abstract technology")
      .split(' ')
      .slice(0, 2)
      .join(',');
    const unsplashUrl = `https://source.unsplash.com/1200x630/?${encodeURIComponent(imageKeyword)}`;

    // Try to fetch image and convert to base64 to prevent CORS issues
    let imageUrl = FALLBACK_IMAGE_PATH;
    try {
      const dataUrl = await toBase64DataUrl(unsplashUrl);
      if (dataUrl) imageUrl = dataUrl;
    } catch (e) {
      console.warn("Failed to proxy image, using local fallback", e);
    }

    // Parse color scheme
    const colors = (designData.colorScheme || "#4F46E5,#FBBF24,#FFFFFF")
      .split(',')
      .map((c: string) => c.trim());

    return NextResponse.json({
      success: true,
      title: designData.title || "AI Generated Design",
      quote: designData.quote || "Innovation meets creativity",
      imagePrompt: designData.imageDescription || "Abstract digital art",
      hashtags: designData.hashtags || "#AI #Design #Future",
      imageUrl: imageUrl,
      template: {
        backgroundColor: colors[0] || "#4F46E5",
        accentColor: colors[1] || "#FBBF24",
        textColor: colors[2] || "#FFFFFF"
      },
      rawResponse: responseText.substring(0, 200) + "..."
    });

  } catch (error: any) {
    console.error("Generation error:", error);

    const errorMessage =
      typeof error?.message === "string"
        ? error.message
        : "AI request failed";
    const isRateLimit = /429|quota|rate limit/i.test(errorMessage);

    return NextResponse.json({
      success: false,
      error: isRateLimit
        ? "AI rate limit reached. Using a fallback design."
        : "AI generation failed. Using a fallback design.",
      errorCode: isRateLimit ? "RATE_LIMIT" : "AI_ERROR",
      title: "The Future of AI Design",
      quote: "Artificial intelligence is revolutionizing how we create visual content",
      imagePrompt: "Futuristic digital art with neural networks",
      hashtags: "#AI #Design #Innovation",
      imageUrl: FALLBACK_IMAGE_PATH,
      template: {
        backgroundColor: "#4F46E5",
        accentColor: "#FBBF24",
        textColor: "#FFFFFF"
      }
    }, { status: 200 });
  }
}
