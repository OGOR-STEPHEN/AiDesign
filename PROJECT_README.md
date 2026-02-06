# CanvasAI Designer

CanvasAI Designer is an AI-powered content creation tool that transforms written articles into professional social media graphics in seconds. Built with **Next.js 14** and **Google Gemini AI**, it automates the design process by extracting key insights, generating relevant imagery contexts, and applying color psychology to create visually stunning assets.

## 🚀 Key Features

- **Article-to-Design Automation**: Simply paste your article or blog post, and the AI analyzes the content to highlight the most shareable quotes and titles.
- **Smart Context Understanding**: Uses Google's Gemini-Flash model to deeply understand the sentiment and core message of your text.
- **Dynamic Styling**: Automatically generates harmonious color palettes (Background, Accent, Text) based on the mood of the content.
- **Instant Visuals**: Generates relevant image descriptions and pairs them with high-quality visual placeholders (Unsplash integration).
- **Responsive Preview**: Real-time rendering of designs using the `CanvasTemplate` engine.
- **History & Regenerate**: Keep track of your generations and one-click regeneration for new variations.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **AI Engine**: [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai) (Gemini Flash)
- **UI & Styling**: [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Image Handling**: HTML-to-Image / HTML2Canvas (for export functionality)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/canvas-ai-designer.git
   cd canvas-ai-designer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your Google AI API key:
   ```env
   GOOGLE_AI_API_KEY=your_gemini_api_key_here
   ```
   > You can get a free API key from [Google AI Studio](https://aistudio.google.com/).

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open the Application**
   Visit `http://localhost:3000` in your browser.

## 📝 Usage Guide

1. **Input**: Paste your text content (min. 20 characters) into the main text area.
2. **Generate**: Click the "Generate Canva Design" button.
3. **Review**: Watch the AI analyze and build your design.
4. **Refine**: If you need a different look, hit "Regenerate".
5. **Export**: (Coming Soon) Download the design as a high-quality PNG.

## 🤝 License

This project is licensed under the MIT License.
