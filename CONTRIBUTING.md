# Contributing to CanvasAI Designer

We love your input! We want to make contributing to CanvasAI Designer as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features

## 🛠️ Development Workflow

We use **GitHub Flow**, so all code changes happen through pull requests.

1. **Fork the repo** and create your branch from `main`.
2. **Install dependencies**:
   ```bash
   npm install
   ```
   > We use `npm` and `package-lock.json` to ensure deterministic builds.

3. **Set up your environment**:
   Make sure you have a valid `GOOGLE_AI_API_KEY` in your `.env.local` file.
   
4. **Make your changes**:
   - If you add a new component, ensure it is responsive.
   - If you modify the API, please test the error handling cases.

5. **Test your changes**:
   Run the dev server and verify the functionality manually:
   ```bash
   npm run dev
   ```

6. **Submit a Pull Request** via GitHub.

## 🧩 Code Style & Standards

- **TypeScript**: We use TypeScript for everything. Please avoid `any` types whenever possible.
- **Tailwind CSS**: We use Tailwind for styling. Keep classes organized and avoid arbitrary values (e.g., `w-[123px]`) unless absolutely necessary.
- **Components**: Keep components small and functional. The `CanvasTemplate` component handles the visualization, while `page.tsx` handles the logic.

## 🐛 Report Bugs using GitHub Issues

We use GitHub issues to track public bugs. Report a bug by opening a new issue; it's that easy!

## 📜 License

By contributing, you agree that your contributions will be licensed under its MIT License.
