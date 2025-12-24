# Incidents Dashboard

A modern dashboard application for viewing and managing security incidents, built with React, TypeScript, and HeroUI.

## Features

- 📊 Interactive incidents table with severity, category, source, timestamp, and status
- 🎨 Modern UI built with HeroUI components
- 🌓 Dark/Light theme support
- ⚡ Fast development with Vite
- 📱 Responsive design

## Technologies Used

- [Vite](https://vitejs.dev/guide/) - Next generation frontend tooling
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [HeroUI](https://heroui.com) - React component library
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion) - Animation library

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd incidents-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── config/        # Configuration files
├── layouts/       # Layout components
├── styles/        # Global styles
└── types/         # TypeScript type definitions
```

## License

Licensed under the [MIT license](LICENSE).
