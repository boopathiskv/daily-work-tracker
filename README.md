# 🗂️ Daily Work Follow-Up Tracker

> **An enterprise-grade, single-page, offline-first daily task tracker built with pure HTML5, CSS3 & vanilla JavaScript — now with built-in AES-256-GCM encryption for Import/Export. No frameworks, no CDN, no localStorage, no telemetry.**

A professional, secure, and fully responsive web application for managing daily work tasks, priorities, statuses, and completion details. The entire app runs locally in your browser with zero external dependencies and zero outbound network calls — and your exported data can now be protected with strong, password-based encryption.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Screenshots](#-screenshots)
- [Key Features](#-key-features)
- [🔐 Encryption (AES-256-GCM)](#-encryption-aes-256-gcm)
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
- 🔐 Users who need **encrypted backups** of their task data

---

## 🚀 Live Demo

> 🌐 *Hosted on GitHub Pages:* `https://boopathiskv.github.io/daily-work-tracker/`

Just open `index.html` in any modern browser — no build step, no install.

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
- 📤 **Export to JSON** — download as plain or **encrypted** (`.enc.json`) file
- 📥 **Import from JSON** — auto-detects encrypted files and prompts for password
- 🔐 **AES-256-GCM encryption** with PBKDF2 key derivation (250,000 iterations)
- 🔑 **Password strength meter** (Weak → Strong) shown live
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

## 🔐 Encryption (AES-256-GCM)

This app provides **military-grade, password-based encryption** for your exported task data — fully client-side using the browser's built-in [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API). No external libraries, no servers, no compromises.

### 🧪 Algorithm Details

| Component                | Implementation                                    |
|--------------------------|---------------------------------------------------|
| **Cipher**               | AES-GCM (256-bit key, authenticated encryption)   |
| **Key Derivation**       | PBKDF2 with SHA-256                               |
| **PBKDF2 Iterations**    | 250,000                                           |
| **Salt**                 | 16 bytes, randomly generated per file             |
| **IV (Nonce)**           | 12 bytes, randomly generated per file             |
| **Output Encoding**      | Base64 inside a portable JSON envelope            |
| **Tamper Detection**     | Built-in via AES-GCM authentication tag           |

### 📦 Encrypted File Format

When you choose to encrypt, the exported file is a JSON envelope:

```json
{
  "format":     "DWT-AES-GCM-1",
  "algorithm":  "AES-GCM-256",
  "kdf":        "PBKDF2-SHA256",
  "iterations": 250000,
  "salt":       "base64-encoded-random-salt",
  "iv":         "base64-encoded-random-iv",
  "data":       "base64-encoded-ciphertext",
  "createdAt":  "2026-06-30T07:00:00.000Z"
}
```

- The salt & IV are stored in the envelope (safe to do so)
- The password is **NEVER** stored anywhere
- The same password + same data will produce **different ciphertext each time** (because of random salt/IV)

### 🔐 Encrypting an Export

1. Open **Data Options ▾ → Export JSON**
2. Tick ✅ **🔐 Encrypt with password (AES-256-GCM)**
3. Enter a password (minimum 6 characters) and confirm it
4. Watch the live **password strength meter** (Weak / Fair / Good / Strong)
5. Click **Download JSON**
6. The file is saved as `daily-work-tasks-YYYY-MM-DD.enc.json`

### 🔓 Decrypting an Import

1. Open **Data Options ▾ → Import JSON**
2. Choose your `.enc.json` file
3. App **auto-detects** the encrypted format and shows a 🔐 banner
4. Enter the decryption password
5. Click **🔓 Decrypt**
6. On success, the task preview appears — click **Import Tasks** to load

### ⚠️ Important Security Notes

- 🔑 **There is NO password recovery.** If you forget the password, your encrypted data is permanently inaccessible.
- 🔐 Use a **strong, unique password** (length ≥ 12, mix of upper, lower, digits, symbols).
- 📱 Encryption/decryption happens **entirely in your browser** — the password never leaves your device.
- 🛡️ The AES-GCM authentication tag will detect **any tampering** with the encrypted file.
- 💾 Always keep a backup of your encrypted exports in a safe location.

### 🔑 Password Strength Levels

| Score | Label   | Meaning                                                   |
|:-----:|---------|-----------------------------------------------------------|
| 1     | Weak    | ≥ 8 chars                                                  |
| 2     | Fair    | ≥ 12 chars                                                 |
| 3     | Good    | Mix of upper & lower case                                 |
| 4     | Strong  | Includes digits & symbols                                 |

---

## 🔐 Security Highlights

This app was built with a **security-first** mindset:

| Protection                          | Implementation                                                |
|-------------------------------------|---------------------------------------------------------------|
| **Content Security Policy (CSP)**   | Strict meta-tag policy — only self-hosted resources           |
| **X-Content-Type-Options**          | `nosniff`                                                     |
| **X-Frame-Options**                 | `DENY` (prevents clickjacking)                                |
| **Referrer-Policy**                 | `no-referrer`                                                 |
| **AES-256-GCM Encryption**          | Optional, password-based, authenticated encryption            |
| **PBKDF2 / 250K iterations**        | Strong key derivation to resist brute-force attacks           |
| **No `eval()` / `Function()`**      | Zero dynamic code execution                                   |
| **No `innerHTML` with user data**   | All user content rendered via `textContent`                   |
| **Input sanitization**              | Trim, length-cap, and whitelist validation                    |
| **Duplicate Task ID prevention**    | Auto-generated, conflict-checked                              |
| **Safe JSON import**                | Wrapped in `try/catch` with strict schema validation          |
| **Tamper detection**                | AES-GCM authentication tag rejects modified files             |
| **Destructive action confirmation** | Delete, Clear All, and Import require user confirmation       |
| **No external dependencies**        | Zero CDNs, zero third-party scripts                           |
| **No tracking / analytics**         | Zero outbound network requests                                |

---

## 🛠️ Tech Stack

- **HTML5** — semantic markup, ARIA roles, accessible labels
- **CSS3** — CSS variables, Grid, Flexbox, responsive layouts, dark-themed modal
- **Vanilla JavaScript (ES6+)** — no frameworks, no libraries
- **Web Crypto API** — browser-native AES-GCM & PBKDF2 (no third-party crypto libs)
- **JSON** — for Import/Export persistence
- **MIT License**

---

## 📁 Project Structure

```
daily-work-tracker/
├── index.html        # Main HTML file (all markup + modals)
├── Css.css           # Stylesheet (themes, layout, modals, responsive, encryption UI)
├── encryption.js     # AES-GCM encryption helpers (Web Crypto API)
├── app.js            # All application logic (CRUD, validation, IO, crypto integration)
└── README.md         # This file
```

That's it. No `node_modules`, no build tools, no config files.

> 📌 **Important:** `encryption.js` must be loaded **before** `app.js` in `index.html`:
> ```html
> encryption.js
> " defer></script>
> ```

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

> 💡 The Web Crypto API works on **both** `http://localhost` and `https://` origins. If you serve over a non-secure origin (other than localhost), `crypto.subtle` will be unavailable and encryption will fail.

### Option 3 — Deploy to GitHub Pages
1. Push to your GitHub repo
2. Settings → Pages → Source: `main` branch, root folder
3. Visit `https://github.com/boopathiskv/daily-work-tracker/tree/V5.2`

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

### 📤 Exporting Data (Plain or Encrypted)
- Click **Data Options ▾ → Export JSON**
- (Optional) Tick 🔐 **Encrypt with password (AES-256-GCM)**
  - Enter & confirm a password (min 6 chars)
  - Watch the live strength meter
- Click **Download JSON**
  - Plain file: `daily-work-tasks-YYYY-MM-DD.json`
  - Encrypted file: `daily-work-tasks-YYYY-MM-DD.enc.json`

### 📥 Importing Data (Plain or Encrypted)
- Click **Data Options ▾ → Import JSON**
- Choose any `.json` or `.enc.json` file
- App **auto-detects** encryption:
  - Plain file → preview appears instantly
  - Encrypted file → 🔐 banner + password field appear
- For encrypted files: enter password → click **🔓 Decrypt**
- Review preview → click **Import Tasks**
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
| Export JSON       | ✅ Saves data as a plain or encrypted file     |
| Import JSON       | ✅ Restores data (auto-decrypts if needed)     |

> 💡 **Workflow:** _Import → Work → Export (encrypted, for safety)_

A `beforeunload` warning will alert you if you try to close the tab with unsaved tasks.

---

## ⌨️ Keyboard Shortcuts

| Key       | Action                                       |
|-----------|----------------------------------------------|
| `ESC`     | Close any open modal / dropdown              |
| `Tab`     | Navigate between form fields                 |
| `Enter`   | Submit form in Add/Edit modal                |
| `Enter`   | Decrypt file (when password field focused)   |

---

## 🌐 Browser Support

Tested and working on the **latest versions** of:

- ✅ Google Chrome
- ✅ Microsoft Edge
- ✅ Mozilla Firefox
- ✅ Apple Safari
- ✅ Opera
- ✅ Brave

> Internet Explorer is **not** supported (Web Crypto API is not available).
> The encryption feature requires a browser with `crypto.subtle` support — all modern browsers since 2017+ support it.

---

## ♿ Accessibility

- Semantic HTML5 structure (`<header>`, `<main>`, `<section>`, `<footer>`)
- ARIA roles for modals, dropdowns, dialogs, and live regions
- Screen-reader-only labels (`.sr-only`) on every input
- Keyboard-friendly (ESC, Tab, Enter)
- Color choices meet WCAG AA contrast guidelines
- Password show/hide toggle for accessibility

---

## 🗺️ Roadmap

Possible future enhancements:

- [ ] Optional `localStorage` toggle (opt-in, with encryption-at-rest)
- [ ] Drag-and-drop import
- [ ] CSV export support (plain + encrypted)
- [ ] Bulk edit / bulk delete
- [ ] Multi-language (i18n)
- [ ] Print-friendly view
- [ ] Recurring tasks
- [ ] Custom categories & priorities
- [ ] PWA / Service Worker for full offline install
- [ ] Key-file (instead of password) encryption mode
- [ ] Argon2id support (modern KDF alternative)

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
- Never logs passwords or plaintext to console
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
- ❌ Data loss (including loss due to forgotten encryption passwords)
- ❌ Security breaches
- ❌ Damages arising from use or misuse

**You are solely responsible** for:
- 💾 Backing up your JSON exports
- 🔑 Remembering your encryption passwords
- 🔐 Storing encrypted files in secure locations

> 🔐 **Cryptography disclaimer:** While this app uses industry-standard algorithms (AES-256-GCM, PBKDF2), no encryption can protect against weak passwords. Always use a strong, unique password.

---

## 👨‍💻 Author

**Boopathi Subramanian**

- 💼 Role: Software Engineer
- 📍 Location: Bengaluru, India
- 🔗 GitHub: [@boopathiskv](https://github.com/boopathiskv/daily-work-tracker/tree/V5.2)
- 💬 LinkedIn: [linkedin.com/in/boopathiskv](https://linkedin.com/in/boopathiskv)

---

## ⭐ Show Your Support

If this project helped you, please consider giving it a ⭐ on GitHub — it means a lot!

---

<p align="center">
  Made with ❤️ using <strong>pure HTML, CSS, JavaScript &amp; Web Crypto API</strong> — no frameworks, no compromises.
</p>
