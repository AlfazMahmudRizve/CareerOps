# Top-Grade AI Resume Tailor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Upgrade CareerOps into a premier AI Resume Tailor with complete section extraction, STAR-formatted metric-driven bullet rewriting, strict anti-hallucination rules, and an interactive side-by-side diff workspace with bullet-level toggles.

**Architecture:** 
1. Create `TopGradeTailoredPayload` schema & multi-section parser in `lib/tailor/top-grade.ts`.
2. Expand `lib/tailor/nim.ts` to generate STAR bullet points with action verbs and quantifiable metrics.
3. Build `components/optimization/TailorWorkspaceModal.tsx` side-by-side diff UI with Accept/Reject bullet toggles.
4. Integrate into `/optimize` and update `scripts/run-qa-tests.ts`.

**Tech Stack:** Next.js 14 App Router, TypeScript, NVIDIA NIM (`meta/llama-3.1-8b-instruct`), Lucide React, Framer Motion, `@react-pdf/renderer`.

---

### Task 1: Multi-Section Parser & Payload Schema (`lib/tailor/top-grade.ts`)

**Files:**
- Create: `lib/tailor/top-grade.ts`
- Modify: `lib/tailor/legacy.ts`

**Step 1: Define `TopGradeTailoredPayload` interface**
- Include `personal`, `summary`, `experience` (with `bullets: string[]`), `education`, `projects`, `skills` (categorized into `technical`, `tools`, `soft`), and `keywordMapping`.

**Step 2: Implement comprehensive multi-section fallback parser (`tailorTopGradeLegacy`)**
- Parse contact info (name, email, phone, address).
- Extract work experience into structured companies with bullet lists.
- Extract education degrees, universities, and technical/language skills.

---

### Task 2: STAR Method LLM Prompt & Pipeline (`lib/tailor/nim.ts` & `lib/tailor/index.ts`)

**Files:**
- Modify: `lib/tailor/nim.ts`
- Modify: `lib/tailor/index.ts`

**Step 1: Enhance `tailorWithNim` system prompt**
- Prompt rules: STAR format (Action Verb + Task + Quantifiable Metric), inject target keywords, 0 fake companies/dates.
- Output JSON matching `TopGradeTailoredPayload` with `experience[].bullets`.

**Step 2: Update `tailor` dispatcher in `lib/tailor/index.ts`**
- Route request to NIM LLM when configured, falling back to `tailorTopGradeLegacy`.

---

### Task 3: Interactive Side-by-Side Review Workspace (`components/optimization/TailorWorkspaceModal.tsx`)

**Files:**
- Create: `components/optimization/TailorWorkspaceModal.tsx`

**Step 1: Build split-view diff UI**
- Left side: Original parsed resume text & bullets.
- Right side: Tailored STAR bullets with green keyword injection badges.
- Add interactive Accept/Reject toggle for each experience bullet.
- Add "1-Click Sync to Builder" and "Download ATS PDF".

---

### Task 4: Integration & Automated QA Verification

**Files:**
- Modify: `app/optimize/page.tsx`
- Modify: `components/optimization/ResultsDashboard.tsx`
- Modify: `scripts/run-qa-tests.ts`

**Step 1: Wire `TailorWorkspaceModal` into `/optimize`**
- Update button CTA to open `TailorWorkspaceModal`.

**Step 2: Run automated QA tests & build check**
- Run `npx tsx scripts/run-qa-tests.ts`.
- Run `npm run build`.
