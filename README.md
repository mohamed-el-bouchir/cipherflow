# CipherFlow
### Animated Algorithm Pipeline Workbench

CipherFlow is an educational web application for exploring data transformation and introductory cryptographic operations. Inspired by CyberChef, it makes each transformation visible through an animated, step-by-step pipeline rather than hiding the process behind an immediate result.

Users can provide input data, configure operations, inspect intermediate states, control playback, and combine operations into reusable recipes.

---

## Project Overview

| Item | Description |
|---|---|
| Purpose | Educational exploration of data transformations and cryptographic concepts |
| Interface | Interactive workbench with animated execution traces |
| Main workflow | Input → Configure operations → Inspect trace → Build a recipe |
| Application guide | Dedicated in-app Guide page |
| Development server | Vite, default port 3000 |

## Features

- **Interactive Workbench** — enter input data and configure an algorithm.
- **Animated execution trace** — follow each transformation step by step.
- **Playback controls** — inspect the execution sequence at your own pace.
- **Recipe workflow** — chain operations into multi-step pipelines.
- **Preset management** — load predefined recipes and manage pipeline configurations.
- **Application Guide** — navigate an integrated guide explaining the interface and its main workflows.
- **Extensible algorithm structure** — algorithms use shared TypeScript contracts and a registry.

## Built-in Operations

| Operation | Category | Description |
|---|---|---|
| Caesar Cipher | Cipher | Shifts letters in the alphabet using a configurable key |
| Base64 Encode / Decode | Encoding | Converts data between text and Base64 representation |
| XOR Cipher | Bitwise | Applies a bitwise XOR operation using a key |
| Reverse Text | Text | Reverses the order of characters |

## Technology Stack

- **Frontend:** React 18, TypeScript
- **Build tooling:** Vite
- **Styling:** Tailwind CSS 4, Bootstrap 5 responsive layout utilities
- **Animation:** Motion
- **Icons:** Lucide React

Bootstrap is used selectively for responsive layout utilities in the Guide page; it does not replace the application's existing visual design.

## Getting Started

### Requirements

- Node.js
- npm
- A modern web browser

### 1. Clone the repository

```bash
git clone https://github.com/Elouzi-art/MyCipherFlow.git
cd MyCipherFlow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Vite serves the application at:

```text
http://localhost:3000
```

### 4. Run project checks

```bash
npm run lint
npm run build
```

## How to Use

1. Open the **Workbench** and enter the data you want to transform.
2. Select an operation and configure its parameters.
3. Inspect the generated trace and use playback controls to follow the transformation.
4. Combine multiple operations into a **Recipe** to create a pipeline.
5. Open the **Guide** from the application navigation for help understanding the interface and workflow.

## Project Structure

```text
src/
├── algorithms/       # Algorithm contracts, registry, and implementations
├── components/       # Shared UI components
├── pages/
│   └── Guide/        # Interactive application guide
├── App.tsx           # Application shell and navigation
└── main.tsx          # React entry point

public/               # Static assets
report/               # Progress reports and report resources
```

## Project Reports

Progress reports prepared for academic supervision are maintained separately from the application documentation.

- [Open the progress reports index](./report/README.md)
- The index tracks the existing reports and the structure for upcoming reports.

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server on port 3000 |
| `npm run lint` | Run TypeScript checks without emitting files |
| `npm run build` | Build the production application |
| `npm run preview` | Preview the production build |
| `npm run clean` | Remove generated build output and `server.js` |

---

*CipherFlow is an educational project. Its built-in operations are intended to demonstrate transformation workflows and should not be treated as a production cryptographic security toolkit.*
