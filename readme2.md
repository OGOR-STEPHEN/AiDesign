# Canva AI Content & Design Automation Platform

## Overview
The principles and description of this project are followed.
- Users enter article content → AI generates text & images → users preview results → Canva automatically builds the design. 
- This project is built on Canva, Next.js, Google Generative AI, and a CLI playground.It enables users to transform article content into fully designed Canva assets through AI-powered text and image generation, template automation, and seamless preview-to-apply workflows.

The system is designed with reusability and scalability in mind: the same core connector logic is shared across the Canva App UI, backend APIs, and CLI tools.

---

## Key Features

- 📋 **Article Management UI**
  - ListView for browsing article entries
  - Create, submit, and edit article content via forms

- 🎨 **Canva Template Automation**
  - Template selection
  - Template duplication
  - Slot-based text and image replacement

- 🤖 **AI-Powered Content Generation**
  - Text generation for design slots
  - Image prompt creation from articles
  - AI image generation using Google Generative AI

- 👀 **Slot Preview & Apply Flow**
  - Preview generated content before applying
  - One-click apply to Canva designs via Editor APIs

- 🧪 **CLI Playground**
  - Test Canva API features from the command line
  - Test Google Generative AI features from the command line
  - Shared logic with backend APIs

---

## Architecture

The project uses a **pnpm-based monorepo architecture** to keep UI, backend, CLI, and shared logic cleanly separated while remaining tightly integrated.

```

monorepo/
├─ apps/
│  ├─ canva-app-ui        # Canva Apps SDK UI
│  ├─ next-api            # Next.js backend (API layer)
│  └─ cli-playground      # Developer CLI tools
│
├─ packages/
│  ├─ canva-api-connector     # Canva API integration logic
│  ├─ google-genai-connector  # Google Generative AI integration logic
│  ├─ shared-types            # Shared TypeScript types
│  └─ shared-utils            # Common utilities
```

---

## Core Components

### Canva App UI
- Built with **Canva Apps SDK**
- Handles all user interactions
- Displays lists, forms, previews, and actions
- Calls backend APIs and applies results using Canva Editor APIs

### Next.js Backend
- Acts as the central execution layer
- Hosts API endpoints for Canva and Google AI integrations
- Manages business logic, security, and third-party API calls

### API Connectors

#### Canva API Connector
- Template duplication
- Text replacement
- Image replacement
- Image export

#### Google Generative AI Connector
- Image generation
- Prompt creation from article content

> These connectors are UI-agnostic and reused by both the backend and CLI.

### CLI Playground
- Command-line interface for developers
- Enables direct testing of Canva and Google AI connectors
- Ideal for debugging, experimentation, and automation

---

## Goals & Outcomes

- 🚀 Accelerate content-to-design workflows
- 🔁 Ensure consistent behavior across UI, API, and CLI
- 🧩 Promote reusable, testable integration logic
- 📈 Provide a scalable foundation for future Canva + AI features

---

## Platform & Development Setup

### Monorepo & Package Management
- Uses **pnpm workspaces** for efficient dependency management
- Shared packages enable code reuse across UI, backend, and CLI

### Shared Types
- Centralized **shared type definitions** package
- Ensures type safety and consistency across all applications

### Development Environment
- **TypeScript** for static typing
- **ESLint** for code quality enforcement
- **Prettier** for consistent formatting

### Environment Variable Management
- Structured environment variable design per app and package
- Secure separation of public and private configuration values

### CI/CD
- Automated **CI/CD pipelines using GitHub Actions**
- Includes linting, type checking, and build validation
- Designed to scale with additional deployment steps

---

## Notes

- Canva Editor APIs are only invoked within the Canva App runtime
- The backend and CLI interact with Canva and Google APIs via shared connectors
- UI rendering is fully handled by Canva Apps SDK components

---

## Future Enhancements

- Support for additional AI providers
- Advanced slot-mapping strategies
- Batch design generation
- CI/CD integration for CLI automation

---

## 📚 Documentation

This project includes comprehensive documentation to help you get started and understand the system:

### Getting Started

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute quick start guide
- **[SETUP.md](SETUP.md)** - Detailed setup and installation instructions
- **[ENV_SETUP.md](ENV_SETUP.md)** - Environment variables configuration guide

### Understanding the Project

- **[PROJECT_README.md](PROJECT_README.md)** - Complete project documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design patterns
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contributing guidelines and coding standards

### API Documentation

- **Backend API**: <http://localhost:3001> (when running)
- **CLI Help**: `pnpm dev:cli --help`

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment variables
cd apps/next-api && cp .env.example .env
cd ../cli-playground && cp .env.example .env
cd ../canva-app-ui && cp .env.example .env
# Edit .env files with your API keys

# 3. Build packages
cd ../..
pnpm build

# 4. Start development (open 2 terminals)
pnpm dev:api         # Terminal 1: Backend (port 3001)
pnpm dev:canva-app   # Terminal 2: UI (port 3000)
```

For detailed instructions, see [QUICKSTART.md](QUICKSTART.md).

---

## 📦 Project Structure

```text
canva-ai-platform/
├── apps/
│   ├── canva-app-ui/              # Canva Apps SDK UI (React + Vite)
│   ├── next-api/                  # Next.js Backend API
│   └── cli-playground/            # CLI Tool (Commander.js)
├── packages/
│   ├── canva-api-connector/       # Canva API integration
│   ├── google-genai-connector/    # Google AI integration
│   ├── shared-types/              # TypeScript types
│   └── shared-utils/              # Utility functions
├── .github/workflows/             # CI/CD pipelines
└── Documentation files...
```

---

## 🛠️ Available Commands

### Development

```bash
pnpm dev:api         # Start Next.js API (port 3001)
pnpm dev:canva-app   # Start Canva App UI (port 3000)
pnpm dev:cli         # Start CLI playground
```

### Building

```bash
pnpm build           # Build all packages and apps
pnpm lint            # Lint all code
pnpm type-check      # Type check all code
pnpm format          # Format all code
```

### CLI Examples

```bash
pnpm dev:cli ai generate-text -p "Write a headline"
pnpm dev:cli ai analyze-article -c "Article content"
pnpm dev:cli canva list-templates
```

---

## 🌟 Features Highlight

### For Users

- Create articles with intuitive forms
- AI-generated headlines and content
- Preview before applying to designs
- One-click design generation

### For Developers

- Fully typed with TypeScript
- Shared connector logic
- CLI for testing and automation
- Comprehensive documentation
- CI/CD ready

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Code standards
- Pull request process
- Development workflow
- Commit message conventions

---

## 📖 Additional Resources

- [Canva Apps SDK Documentation](https://www.canva.com/developers/docs/apps/)
- [Google Generative AI Documentation](https://ai.google.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [pnpm Workspace Guide](https://pnpm.io/workspaces)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💡 Support

For questions and issues:

1. Check the documentation files listed above
2. Review [SETUP.md](SETUP.md#troubleshooting) for troubleshooting
3. Open an issue on GitHub

---

Made with ❤️ using Next.js, Canva Apps SDK, and Google Generative AI

