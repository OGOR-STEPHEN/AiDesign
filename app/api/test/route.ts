import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "No API key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use EXACT model name from your list
    const model = genAI.getGenerativeModel({ 
      model: "models/gemini-flash-latest"  // ⬅️ CORRECT NAME
    });
    
    const result = await model.generateContent("Say 'AI is working perfectly!'");
    const response = result.response;
    const text = response.text();
    
    return NextResponse.json({
      success: true,
      message: "✅ Google Generative AI is working!",
      geminiResponse: text,
      modelUsed: "models/gemini-flash-latest",
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: "Try models/gemini-2.0-flash-001 or models/gemini-pro-latest"
    }, { status: 500 });
  }
}