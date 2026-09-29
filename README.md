# ONE PERCENT

> A minimal strength and body tracker built around one simple idea: get 1% better every day.

<p align="center">
  <strong>Track your training. Understand your progress. Stay consistent.</strong>
</p>

<p align="center">
  <a href="https://github.com/aman482006-beep/1-Better-everyday">Repository</a>
  ·
  <a href="https://github.com/aman482006-beep/1-Better-everyday/issues">Issues</a>
</p>

## Overview

**ONE PERCENT** is a minimal, offline-first fitness tracker focused on strength progression and body-composition trends.

The product is designed to keep the experience simple: log training, review progress, and use the resulting data to make better decisions over time.

## Highlights

- Strength and workout tracking
- Progressive-overload analytics
- Body-composition trend tracking
- Offline-first experience
- Responsive, mobile-friendly interface
- PWA support for an app-like experience
- Optional Gemini-powered functionality

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI | React 19 |
| Language | TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Animation | Motion |
| Icons | Lucide React |
| AI | Google Gemini API |
| PWA | Vite PWA |
| Runtime | Bun / Node.js |

## Project Structure

```text
.
├── public/              # Static assets and PWA icons
├── scripts/             # Utility scripts
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/         # Application state/context
│   ├── data/            # Application data
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript types
│   ├── utils/           # Shared utilities
│   ├── App.tsx          # Main application
│   └── main.tsx         # Application entry point
├── .env.example         # Environment variable template
├── index.html           # HTML entry point
├── package.json         # Scripts and dependencies
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- Git

### Installation

```bash
git clone https://github.com/aman482006-beep/1-Better-everyday.git
cd 1-Better-everyday
npm install
```

Using Bun:

```bash
bun install
```

### Environment

Create a local `.env` file from the provided template:

```bash
cp .env.example .env
```

Add the required values for any environment-specific integrations you plan to use.

### Development

With npm:

```bash
npm run dev
```

With Bun:

```bash
bun run dev
```

The Vite development server runs on port **3000**.

### Production Build

```bash
npm run build
```

Preview the production build locally with:

```bash
npm run preview
```

## Code Quality

Run the TypeScript check with:

```bash
npm run lint
```

## Configuration

Secrets and environment-specific values should be kept out of source control. Use `.env.example` as the reference for local configuration.

> Never commit real API keys or other secrets to the repository.

## Design Philosophy

The project follows three principles:

1. **Minimal** — keep the interface focused on useful information.
2. **Measurable** — turn training history into understandable progress.
3. **Consistent** — make small improvements repeatable over time.

## Status

This repository contains the current working implementation of ONE PERCENT.

The project is intentionally kept lightweight so the core experience stays fast, focused, and maintainable.

## License

No license has been specified for this repository yet.
