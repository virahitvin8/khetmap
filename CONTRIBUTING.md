# 🤝 Contributing to KhetMap

Thank you for your interest in contributing to KhetMap! This project is open-source and community-driven. Every contribution helps Indian farmers access better tools.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Code Style Guide](#code-style-guide)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## 🤝 Code of Conduct

Be respectful, inclusive, and constructive. We welcome contributors from all backgrounds.

---

## 🛠️ How to Contribute

### 1. Fork & Clone

```bash
# Fork on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/khetmap.git
cd khetmap
```

### 2. Create a Branch

```bash
# Feature
git checkout -b feature/your-feature-name

# Bug fix
git checkout -b fix/bug-description

# Documentation
git checkout -b docs/update-readme
```

### 3. Set Up Development Environment

```bash
npm install
cp .env.example .env
# Edit .env with your API keys (all optional)
npm run dev
```

Open http://localhost:5173

### 4. Make Your Changes

- Follow the [Code Style Guide](#code-style-guide)
- Test your changes locally
- Keep changes focused — one PR per feature/fix

### 5. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
git commit -m "feat: add crop calendar for kharif season"

# Bug fix
git commit -m "fix: NDVI layer not rendering at zoom level < 5"

# Documentation
git commit -m "docs: add Telugu translation for welcome page"

# Performance
git commit -m "perf: lazy-load MultiSatelliteDashboard component"
```

### 6. Push and Open a Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub. Use the PR template and fill in all sections.

---

## 📝 Code Style Guide

### TypeScript

- **Strict typing** — no `any` types
- Use `interface` for object shapes, `type` for unions/primitives
- Export types from the same file as the component/function

### React

- **Functional components only** — no class components
- Use hooks for state (`useState`, `useEffect`, `useContext`)
- Keep components under 300 lines — split if larger

### File Naming

- Components: `PascalCase.tsx` (e.g., `FieldAnalysisReport.tsx`)
- Services: `camelCase.ts` (e.g., `fieldAnalysis.ts`)
- Styles: `camelCase.css` or Tailwind classes inline

### No Paid APIs

KhetMap must remain **100% free** for users. Do not add integrations that require paid API keys.

### Translations

If you add new UI text, add it to all 3 language files (English, Telugu, Hindi) in `src/constants/`.

---

## ✅ Pull Request Process

1. Ensure your PR passes the build: `npm run build`
2. Describe what you changed and why
3. Link any related issues: `Closes #123`
4. Wait for review — we respond within **48 hours**
5. Address review comments
6. PR is merged once approved by a maintainer

---

## 🐛 Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml):

- Describe the bug clearly
- Include steps to reproduce
- Mention your browser, OS, device
- Attach screenshots if possible

---

## 💡 Requesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml):

- Explain the farming use case
- Describe your proposed solution
- Mention if you can implement it yourself

---

## 🏷️ Good First Issues

Look for issues labeled [`good first issue`](https://github.com/virahitvin8/khetmap/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) — these are welcoming for first-time contributors!

---

*Built with ❤️ for the farming community of India*
