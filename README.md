# 🗂️ Daily Work Follow-Up Tracker

> **An enterprise-grade, single-page, offline-first daily task tracker built with pure HTML5, CSS3 & vanilla JavaScript — no frameworks, no CDN, no localStorage, no telemetry.**

A professional, secure, and fully responsive web application for managing daily work tasks, priorities, statuses, and completion details. The entire app runs locally in your browser with zero external dependencies and zero outbound network calls.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Screenshots](#-screenshots)
- [Key Features](#-key-features)
- [Security Highlights](#-security-highlights)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Task ID Format](#-task-id-format)
- [Data Persistence](#-data-persistence)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Browser Support](#-browser-support)
- [Accessibility](#-accessibility)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Disclaimer](#-disclaimer)
- [Author](#-author)

---

## 🔍 Overview

**Daily Work Follow-Up Tracker** is a static, single-page web app designed for individuals and teams who want a lightweight, secure, and dependency-free way to track their daily tasks.

It’s ideal for:
- 📋 Daily standups & personal to-dos
- 🧑‍💼 Freelancers tracking client work
- 🏢 Internal corporate task tracking where cloud apps aren't allowed
- 🔒 Privacy-conscious users — your data never leaves your browser

---

## 🚀 Live Demo

> 🌐 *Hosted on GitHub Pages:* `https://boopathiskv.github.io/daily-work-tracker/`

Just open `index.html` in any modern browser — no build step, no install.

---

## 📸 Screenshots

| Dashboard | Add Task Popup | Info Modal |
|-----------|----------------|------------|
| _(add screenshot)_ | _(add screenshot)_ | _(add screenshot)_ |

---

## ✨ Key Features

### 📊 Task Management
- ➕ **Add / Edit / Delete** tasks via clean popup modals
- 🔢 **Auto-generated Task IDs** from Start Date (`YYYYMMDD##` format)
- 🔍 **Search** across Task ID, Name, Priority, Category, Status, Remarks
- 🎯 **Filter** by Priority (P1/P2/P3), Category (Work/Personal/Other), Status, or Overdue
- 🔄 **Sort** by Task ID, Due Date, Priority, or Status
- ⚠️ **Overdue detection** — tasks past Due Date with non-Completed status are highlighted

### 📈 Dashboard
- **Summary cards** for:
  - Total Tasks
  - Not Started
  - In Progress
  - Waiting
  - Completed
  - Overdue

### 💾 Data Operations
- 📤 **Export to JSON** — download a file named `daily-work-tasks-YYYY-MM-DD.json`
- 📥 **Import from JSON** — restore data with full validation and preview
- 🗑️ **Clear All** — with confirmation popup
- 🛡️ **5MB import size limit** & deep validation of every imported task

### 🎨 UI / UX
- 🪟 **Popup-based design** — all messages, confirmations, and forms shown in modals
- 🎨 **Color-coded badges** for Priority (red/orange/green) and Status (gray/blue/yellow/green)
- ⚡ Smooth animations & professional enterprise-grade design
- 📱 **Fully responsive** — Desktop, Tablet & Mobile
- ⌨️ **ESC key** support to close any modal
- 🌑 **Dark-themed About / Info modal** with full app metadata

---

## 🔐 Security Highlights

This app was built with a **security-first** mindset:

| Protection                          | Implementation                                           |
|-------------------------------------|----------------------------------------------------------|
| **Content Security Policy (CSP)**   | Strict meta-tag policy — only self-hosted resources      |
| **X-Content-Type-Options**          | `nosniff`                                                |
| **X-Frame-Options**                 | `DENY` (prevents clickjacking)                           |
| **Referrer-Policy**                 | `no-referrer`                                            |
| **No `eval()` / `Function()`**      | Zero dynamic code execution                              |
| **No `innerHTML` with user data**   | All user content rendered via `textContent`              |
| **Input sanitization**              | Trim, length-cap, and whitelist validation               |
| **Duplicate Task ID prevention**    | Auto-generated, conflict-checked                         |
| **Safe JSON import**                | Wrapped in `try/catch` with strict schema validation     |
| **Destructive action confirmation** | Delete, Clear All, and Import require user confirmation  |
| **No external dependencies**        | Zero CDNs, zero third-party scripts                      |
| **No tracking / analytics**         | Zero outbound network requests                           |

---

## 🛠️ Tech Stack

- **HTML5** — semantic markup, ARIA roles, accessible labels
- **CSS3** — CSS variables, Grid, Flexbox, responsive layouts, dark-themed modal
- **Vanilla JavaScript (ES6+)** — no frameworks, no libraries
- **JSON** — for Import/Export persistence
- **MIT License**

---

## 📁 Project Structure

```
daily-work-tracker/
├── index.html       # Main HTML file (all markup + modals)
├── Css.css          # Stylesheet (themes, layout, modals, responsive)
├── app.js           # All application logic (CRUD, validation, IO)
└── README.md        # This file
```

That's it. No `node_modules`, no build tools, no config files.

---

## 🚀 Getting Started

### Option 1 — Open Directly
1. Clone or download this repo
2. Double-click `index.html`
3. Done. ✅

### Option 2 — Local Server (recommended)
```bash
# Python 3
python -m http.server 8080

# Node (with http-server installed globally)
npx http-server -p 8080
```
Then open: `http://localhost:8080`

### Option 3 — Deploy to GitHub Pages
1. Push to your GitHub repo
2. Settings → Pages → Source: `main` branch, root folder
3. Visit `https://github.com/boopathiskv/daily-work-tracker`

---

## 📖 Usage Guide

### ➕ Adding a Task
1. Click **`+ Add New Task`** (top-right of the header)
2. Fill in: Task Name, Priority, Category, Start Date, Due Date, Estimated Time, Status, etc.
3. **Task ID is generated automatically** based on your Start Date
4. Click **Add Task** — done!

### ✏️ Editing a Task
- Click **Edit** on any row → form pre-fills → make changes → **Update Task**

### 🗑️ Deleting a Task
- Click **Delete** on any row → confirmation popup → **Delete**

### 📤 Exporting Data
- Click **Data Options ▾ → Export JSON**
- Preview total tasks + filename → click **Download JSON**

### 📥 Importing Data
- Click **Data Options ▾ → Import JSON**
- Choose your previously exported `.json` file
- Preview valid task count → click **Import Tasks**
- ⚠️ This **replaces** the current in-memory data.

### 🧹 Clear All
- Click **Data Options ▾ → Clear All** → confirmation → done.

### ℹ️ About / Info
- Click the **ⓘ icon** in the header to view app version, features, security, license, etc.

---

## 🔢 Task ID Format

Task IDs are **auto-generated** from the Start Date in the format:

```
YYYYMMDD + 2-digit sequence
Example: 2026063001, 2026063002, 2026063003, ...
```

- Up to **99 tasks per Start Date**
- IDs are unique and conflict-checked
- Editing a task preserves its original ID

---

## 💾 Data Persistence

> ⚠️ **Important:** This app uses **in-memory storage only** — data is **NOT** saved to `localStorage`, cookies, or any server.

| Action            | Effect                                        |
|-------------------|-----------------------------------------------|
| Refresh page      | ❌ All tasks are cleared                       |
| Close tab/browser | ❌ All tasks are cleared                       |
| Export JSON       | ✅ Saves data as a file                        |
| Import JSON       | ✅ Restores data from a previously saved file  |

> 💡 **Workflow:** _Import → Work → Export_

A `beforeunload` warning will alert you if you try to close the tab with unsaved tasks.

---

## ⌨️ Keyboard Shortcuts

| Key       | Action                             |
|-----------|------------------------------------|
| `ESC`     | Close any open modal / dropdown    |
| `Tab`     | Navigate between form fields       |
| `Enter`   | Submit form in Add/Edit modal      |

---

## 🌐 Browser Support

Tested and working on the **latest versions** of:

- ✅ Google Chrome
- ✅ Microsoft Edge
- ✅ Mozilla Firefox
- ✅ Apple Safari
- ✅ Opera
- ✅ Brave

> Internet Explorer is **not** supported.

---

## ♿ Accessibility

- Semantic HTML5 structure (`<header>`, `<main>`, `<section>`, `<footer>`)
- ARIA roles for modals, dropdowns, dialogs, and live regions
- Screen-reader-only labels (`.sr-only`) on every input
- Keyboard-friendly (ESC, Tab, Enter)
- Color choices meet WCAG AA contrast guidelines

---

## 🗺️ Roadmap

Possible future enhancements:

- [ ] Optional `localStorage` toggle (opt-in)
- [ ] Drag-and-drop import
- [ ] CSV export support
- [ ] Bulk edit / bulk delete
- [ ] Multi-language (i18n)
- [ ] Print-friendly view
- [ ] Recurring tasks
- [ ] Custom categories & priorities
- [ ] PWA / Service Worker for full offline install

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/awesome-feature`
3. Commit your changes: `git commit -m 'Add awesome feature'`
4. Push to the branch: `git push origin feature/awesome-feature`
5. Open a Pull Request

Please ensure your code:
- Has **no console errors**
- Uses `addEventListener` (no inline handlers)
- Avoids `innerHTML` with user input
- Follows the existing code style

---

## 📜 License

This project is released under the **MIT License** — see [LICENSE](LICENSE) for details.

```
MIT License — Free for personal and commercial use.
Software provided "AS-IS", without warranty of any kind.
```

---

## ⚠️ Disclaimer

This software is provided **"AS-IS"**, without warranty of any kind, express or implied.

The author assumes **no liability** for:
- ❌ Data loss
- ❌ Security breaches
- ❌ Damages arising from use or misuse

**You are solely responsible** for your data. Always back up your JSON exports.

---

## 👤 Author

**Boopathi Subramanian**

- 💼 GitHub: https://github.com/boopathiskv


---

## ⭐ Show Your Support

If this project helped you, please consider giving it a ⭐ on GitHub — it means a lot!

---

<p align="center">
  Made with ❤️ using <strong>pure HTML, CSS &amp; JavaScript</strong> — no frameworks, no compromises.
</p>
