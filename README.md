<div align="center">

🇬🇧 English | [🇻🇳 Tiếng Việt](README_vi.md)

# Class Management

A toolkit that helps homeroom teachers visualize and manage their classroom: a peer-support tree, a seating chart, and a numerology table — all running entirely in the browser, no backend required.

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

**[View live demo](https://kokoroou.github.io/class-management/)**

</div>

---

## Overview

**Class Management** is a web app that bundles several small tools for a homeroom teacher's everyday work, built around a student list imported from Excel or entered by hand. Every tool supports: starting from a ready-made sample, visual editing (select, drag-and-drop, quick edit), autosave to the browser (localStorage), and exporting results as a PNG image or an Excel file.

## Pages / routes

| Route | Tool |
| --- | --- |
| `/` | Home — list of tools |
| `/support-tree` | Peer-support tree |
| `/seating` | Seating chart |
| `/numerology` | Numerology |

## Features shared across tools

- **3 starting points**: start blank, start from built-in sample data, or upload an Excel/CSV file.
- **Select & quick-edit**: click to select one or more items (drag to marquee-select an area, hold Ctrl/Shift to add to the selection), double-click to rename/edit content in place.
- **Autosave**: work-in-progress data is saved to the browser's `localStorage`, so nothing is lost on reload.
- **Reset button**: clears the current data and returns to the starting-point screen.
- **Export**: most tools can export a PNG image and/or an Excel file.

## Tool details

### 1. Peer-support tree (`/support-tree`)

Builds a "study buddy" / peer-support network for the class as a hierarchical tree diagram.

- Import from Excel (columns: No., Student Name, Supervisor No.) or generate a built-in 30-student sample.
- Automatic tree layout via Dagre; re-layout anytime with the **Auto-arrange** button.
- Add/remove nodes and connect/remove relationships (edges) directly on the canvas; a new node auto-connects to the currently selected node.
- Export the diagram as a PNG image, or export the relationship list back to an Excel file.

### 2. Seating chart (`/seating`)

Arrange student seating by dragging students onto a customizable desk layout.

- Customize the number of rows/columns and desk type (1–4 seats per desk).
- Drag students between the waiting pool and desks, or swap two students' positions.
- Select multiple desks/students to **merge** them into a larger desk, or **split** a desk back into single ones.
- Built-in sample: 30 students seated at two-seat desks (3 desks/row x 5 rows).
- Export as a PNG image or an Excel file (with a config sheet); re-importing that exported file restores the full seating layout, not just the student list.

### 3. Numerology (`/numerology`)

Enter each student's birth date and full name to automatically compute numerology indices, useful for grouping/class placement.

- Automatically computes a **Life Path Number** (from birth date) and a **Name Number** (from full name) for each student, along with each number's meaning.
- Import from Excel (columns: Student Name, Birth Date dd/mm/yyyy) or start from a built-in 15-student sample.
- Sort by No./name/Life Path Number/Name Number, and filter by Life Path Number to group similar students.
- Add/remove students, and edit name and birth date directly in the table.
- Export the table as a PNG image or an Excel file.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool
- [React Router](https://reactrouter.com/) — navigation between tools
- [@xyflow/react](https://reactflow.dev/) — node/edge diagramming (peer-support tree)
- [Dagre](https://github.com/dagrejs/dagre) — automatic tree layout
- [SheetJS (xlsx)](https://sheetjs.com/) — read/write Excel files
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [html-to-image](https://github.com/bubkoo/html-to-image) — export diagrams/tables as PNG
- [lucide-react](https://lucide.dev/) — icons

## Getting started

### Requirements

- [Node.js](https://nodejs.org/) 18+
- [Bun](https://bun.sh/) (recommended — the project uses `bun.lock`) or npm/pnpm/yarn

### Install

```bash
bun install
# or: npm install
```

### Run in development

```bash
bun run dev
# or: npm run dev
```

The app runs at `http://localhost:3000`.

### Build for production

```bash
bun run build
# or: npm run build
```

The build output is in the `dist/` directory.

### Type-check (TypeScript)

```bash
bun run lint
# or: npm run lint
```

## Input Excel file format

Each tool accepts a slightly different set of columns (column names are matched flexibly, position doesn't matter):

| Tool | Required columns | Example |
| --- | --- | --- |
| Peer-support tree | No., Student Name, Supervisor No. | `1`, `Nguyễn Văn A`, `1` |
| Seating chart | No., Student Name | `1`, `Nguyễn Văn A` |
| Numerology | Student Name, Birth Date (dd/mm/yyyy) | `Nguyễn Văn A`, `01/02/2010` |

You can start from the built-in sample data in each tool (the **Start from sample** button on the starting screen) to see the expected format.

## Project structure

```
class-management/
├── src/
│   ├── components/     # Layout, ResetButton, ToolPageToolbar, StartingPointPicker...
│   ├── hooks/           # useLocalStorage, useSelection, useMarqueeSelection, useResetTool...
│   ├── pages/            # HomePage, SupportTreePage, SeatingPage, NumerologyPage
│   ├── utils/            # numerology.ts — Life Path/Name Number calculations
│   ├── App.tsx           # Route declarations
│   ├── main.tsx          # React app entry point
│   └── index.css         # Tailwind CSS entry
├── index.html
├── vite.config.ts
└── package.json
```

## Deployment

The project is configured to auto-deploy to **GitHub Pages** via GitHub Actions on every push to the `main` branch. See the workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Once deployed, the site is available at: https://kokoroou.github.io/class-management/

## License

This project is released under the [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/) license — free to use, copy, and modify for **non-commercial** purposes, with attribution. See the [`LICENSE`](LICENSE) file for details.
