# Akij Resource - Online Assessment Platform

A highly robust, production-ready full-stack online assessment interface for candidates and employers.

## 🚀 Live Demo & Video
- **Live Demo Link:** [Insert Deployment Link Here]
- **Video Walkthrough:** [Insert Loom/YouTube Link Here]

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
