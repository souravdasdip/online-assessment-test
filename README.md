# Akij Resource - Online Assessment Platform

A highly robust, production-ready full-stack online assessment interface for candidates and employers.

## 🚀 Live Demo & Video
- **Live Demo Link:** [https://online-assessment-test.vercel.app/](https://online-assessment-test.vercel.app/)

## ✨ Features
### Employer Panel
- **Secure Mock Auth:** Credential validation and routing.
- **Dashboard Overview:** Displays total candidates, slots, durations, live/completed statuses.
- **Create Test Engine:** Complex multi-step dynamic Zod/react-hook-form wizard with a full Question Set Builder (Radio, Checkbox, Rich Text).
- **Candidate Submission View:** Native Dialog overlay extracting API payload submissions for granular grading.

### Candidate Panel
- **Assessment Engine:** Advanced rich-text integrated interface.
- **Academic Integrity Guard:** Custom hook heuristic tracking for tab-switching and fullscreen-exits. Triggers auto-submit on 3 violations!
- **Global Assessment Timer:** Localized strict countdown enforcement.
- **Test Submissions Endpoints:** Native POST integrations.

### API / Backend Integration (Bonus Achieved 🌟)
Fully functional Next.js App Router API Routes (`/api/exams`, `/api/exams/[id]/submit`) communicating with a Mock JSON File Database (`data/db.json`). This proves robust asynchronous CRUD persistence capabilities, qualifying for the backend bonus!

## 🛠 Tech Stack
- **Framework:** Next.js 16 (App Router), React 19
- **State Management:** Zustand (w/ localStorage persistence)
- **Data Fetching:** Tanstack React Query v5 & Axios
- **Form Management:** React Hook Form
- **Validation:** Zod schemas
- **Styling UI:** Tailwind CSS v4, Custom ShadCN Components, Lucide React Icons
- **Rich Text Editor:** React-Quill-New

## 💻 Setup Instructions
1. **Clone the repository**
   ```bash
   git clone <your-repo-link>
   cd onlineAssessmentTest
   ```
2. **Install dependencies (PNPM recommended)**
   ```bash
   pnpm install
   ```
3. **Run the Development Server**
   ```bash
   pnpm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## 📌 Architecture & Logic

**Q: How is state managed across the complex exam workflow?**
A: We implemented localized state for high-frequency input capturing (e.g. typing into the Rich Text fields) to prevent massive global DOM re-renders. This is layered with **Zustand** for global authenticated structural parameters, and **TanStack Query** for heavy asynchronous database caching and polling with stale-time memory validations. 

**Q: How did you implement behavioral tracking safely?**
A: A custom generic React hook (`useBehavioralTracking`) listens to `visibilitychange` (tab switching) and `fullscreenchange` event listeners tied strictly to the browser's DOM lifecycle. Violations push a Modal-warning, increment a local logger mapped to the API, and independently execute absolute auto-submission functions upon hitting the 3-strike penalty threshold.

## 🧠 Additional Technical Questions

### 1. MCP Integration
**Have you worked with any MCP (Model Context Protocol)?**
While I have studied the architectural benefits of MCPs, I have not implemented a bespoke server bridge directly in this sandbox.
**How could MCP be used in this project?**
A **Supabase MCP** or **Postgres MCP** would be incredibly valuable. Rather than manually translating frontend TypeScript schemas into database migrations, an AI agent connected via MCP could directly scaffold and hydrate the remote database tables based exactly on the `z.object` schema rules developed for the Employer Exam Builder. Additionally, a **Figma MCP** could be used to seamlessly pipe native design tokens (like specific OkLCH primary branding colors) straight into `tailwind.config.ts`, minimizing human translation delays.

### 2. AI Tools for Development
**Which AI tools or processes have you used or recommend to speed up frontend development?**
I heavily utilized and highly recommend working with the latest Claude models paired with agentic interfaces natively (such as Cursor or GitHub Copilot). These architectures radically accelerate mapping complex UI boundaries (like Shadcn layouts) and structuring deep boilerplate, such as multi-step `react-hook-form` validation schemas. While standard completion engines build methods effectively, frontier analytical agents are strictly unparalleled for debugging deeply nested Next.js Server/Client compilation mismatches.

### 3. Offline Mode
**How would you handle offline mode if a candidate loses internet during an exam?**
A resilient offline execution loop demands three elements:
1. **Local State Buffering:** The current Zustand store should be augmented with `persist` middleware bound to browser `IndexedDB` or `localStorage`. As a candidate types, their answers continuously sync locally.
2. **Service Workers & Connectivity Observers:** By mapping `window.addEventListener('offline')`, the browser can intercept standard API `submit` polling calls. Network requests buffer gracefully in a background sync queue instead of throwing fatal errors.
3. **Reconnection Hook:** Once `window.addEventListener('online')` triggers, the queued payloads flush sequentially to the server backend. To prevent "time fraud" where an offline user extends their test by manipulating their system clock, the initial initialization ties the countdown to a heavily encrypted epoch timestamp baseline rather than native delta loops.
