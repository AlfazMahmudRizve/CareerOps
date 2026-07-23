# AI Resume Tailor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build an AI Resume Tailor feature that takes an uploaded PDF resume's text and a Job Description, and generates a tailored ATS-aligned resume payload (without inventing fake experience), with 1-click export to PDF or the Resume Builder (`/build`).

**Architecture:** Create a `lib/tailor/` engine (NVIDIA NIM LLM pipeline + Compromise.js legacy fallback), a serverless `POST /api/tailor` route (`maxDuration = 60`), unit test coverage in `scripts/run-qa-tests.ts`, and a `TailorDrawer.tsx` UI component integrated into `/optimize`.

**Tech Stack:** Next.js 14 App Router, TypeScript, NVIDIA NIM (`meta/llama-3.1-8b-instruct`), Lucide React, Framer Motion, `@react-pdf/renderer`.

---

### Task 1: Backend Tailor Engine (`lib/tailor/`)

**Files:**
- Create: `lib/tailor/legacy.ts`
- Create: `lib/tailor/nim.ts`
- Create: `lib/tailor/index.ts`

**Step 1: Create legacy rule-based fallback (`lib/tailor/legacy.ts`)**
- Implement `tailorLegacy({ resumeText, jdText, missingKeywords })`.
- Extracts contact info, parses existing sections, injects missing keywords into the `skills` list and `summary`, and returns a `TailoredResumePayload`.

**Step 2: Create NIM LLM tailor caller & guardrails (`lib/tailor/nim.ts`)**
- Implement `tailorWithNim({ resumeText, jdText, missingKeywords })`.
- Enforce strict anti-hallucination system prompt rules (zero fake claims, re-word real experience).
- Implement schema validator for `TailoredResumePayload`.

**Step 3: Create dispatcher (`lib/tailor/index.ts`)**
- Implement `tailor(input: AnalyzeInput): Promise<TailoredResumePayload>`.
- Calls `tailorWithNim` when `ANALYZER_BACKEND=nim`, falling back automatically to `tailorLegacy` if NIM is unreachable or times out.

---

### Task 2: API Route Handler (`app/api/tailor/route.ts`)

**Files:**
- Create: `app/api/tailor/route.ts`

**Step 1: Write serverless POST handler**
- Configure `export const maxDuration = 60;` and `export const dynamic = 'force-dynamic';`.
- Enforce per-IP rate limiting (`checkRateLimit`).
- Validate input fields (`resumeText`, `jdText`).
- Dispatch `tailor({ resumeText, jdText })` and return JSON payload.

---

### Task 3: Automated QA Unit Testing (`scripts/run-qa-tests.ts`)

**Files:**
- Modify: `scripts/run-qa-tests.ts`

**Step 1: Add unit tests for tailor engine**
- Test `tailorLegacy` output structure and skill integration.
- Test `detectInjection` guardrails against prompt injection in tailor inputs.
- Verify array/string default fallbacks.
- Run `npx tsx scripts/run-qa-tests.ts` to confirm 100% test pass rate.

---

### Task 4: Frontend UI Drawer (`components/optimization/TailorDrawer.tsx`)

**Files:**
- Create: `components/optimization/TailorDrawer.tsx`

**Step 1: Build slide-over drawer component**
- Display projected ATS match score gauge (e.g. 92%).
- Render list of integrated missing keywords with green checkmarks.
- Implement **"Open & Edit in Builder"** button: saves payload to `localStorage` (`careerops_resume_data`) and navigates to `/build`.
- Implement **"Download Tailored PDF"** button: dynamically imports `@react-pdf/renderer` with `ExecutiveTemplate`.

---

### Task 5: Results Dashboard Integration (`/optimize`)

**Files:**
- Modify: `components/optimization/ResultsDashboard.tsx`
- Modify: `app/optimize/page.tsx`

**Step 1: Add CTA to ResultsDashboard**
- Add **"✨ Tailor Resume with AI"** button on the Intelligence Report page next to the ATS score card.

**Step 2: Connect trigger state in `app/optimize/page.tsx`**
- Handle click event, fetch `/api/tailor`, display loading state, and open `TailorDrawer`.
