# Design Document: AI Resume Tailor & Auto-Optimizer

**Date**: 2026-07-24  
**Author**: Antigravity Pair Programmer & Alfaz Mahmud  
**Status**: Validated Design

---

## Executive Summary

The **AI Resume Tailor** feature allows job seekers on CareerOps to generate an ATS-optimized, job-aligned version of their CV directly from their uploaded PDF resume and target Job Description. 

It strictly preserves the candidate's real facts, dates, companies, and achievements without fabricating fake claims or hallucinating experiences.

---

## 1. User Experience & Architecture

### User Flow
1. **Analyze**: User uploads a PDF resume and pastes a Job Description on `/optimize`, clicking **Run Gap Analysis**.
2. **Review & Trigger**: The Intelligence Report displays ATS match score, gaps, and a prominent CTA: **"✨ Tailor Resume with AI"**.
3. **Generation**: Triggers a step-by-step progress loader (*"Re-aligning bullet vectors...", "Injecting ATS keywords without altering career facts..."*).
4. **Tailored Output Drawer (`TailorDrawer.tsx`)**: Displays:
   - **Projected ATS Match Score** (e.g., 92% vs 45% original).
   - **Integrated Keywords Badge Summary**.
   - **Primary Action 1**: **"Open & Edit in Builder"** (hydrates tailored JSON into `localStorage` and navigates to `/build`).
   - **Primary Action 2**: **"Download Tailored PDF"** (renders `@react-pdf/renderer` Executive template on the fly).

---

## 2. API Contract & Anti-Hallucination Guardrails

### API Route: `POST /api/tailor`
- `maxDuration`: `60` seconds.
- `dynamic`: `'force-dynamic'`.
- `Rate Limiting`: 30 requests / 60 seconds per IP.

### Request Payload
```json
{
  "resumeText": "string",
  "jdText": "string",
  "missingKeywords": ["string"]
}
```

### Response Payload (`TailoredResumePayload`)
```typescript
export type TailoredResumePayload = {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  experience: { company: string; role: string; startDate: string; endDate: string; description: string }[];
  education: { school: string; degree: string; startDate: string; endDate: string; description: string }[];
  projects: { title: string; techStack: string; link: string; description: string }[];
  skills: string;
  projectedScore: number;
  integratedKeywords: string[];
};
```

### Prompt Rules (Anti-Hallucination)
1. **Fact Preservation**: ONLY use facts, dates, roles, tools, and achievements explicitly in the original resume.
2. **Zero Inventions**: NEVER invent job roles, degrees, metrics, or un-possessed skills.
3. **Keyword Re-phrasing**: Adapt existing bullet phrasing to naturally incorporate matching terminology from the target JD.
4. **Action Verbs**: Re-structure experience bullets with strong action-oriented verbs.

---

## 3. Edge Cases & Resilience Safeguards

| Edge Case | Risk | Mitigation |
| :--- | :--- | :--- |
| **Extreme Skill Mismatch** | LLM invents fake skills to force match | System prompt strictly forbids adding unmentioned tools. Tailors soft skills, leaves un-injectable tech in `missingKeywords`. |
| **JSON Truncation** | Large 5+ page resumes break JSON parsing | Input truncated to top 4 recent roles & top 3 projects; `maxTokens` set to `3072`. |
| **Missing Sections** | Original PDF lacks Education/Projects | Strict empty defaults (`[]` / `""`) applied at API boundary. |
| **NIM API Failure / Rate Limit** | External LLM outage | Automatic graceful fallback to `tailorLegacy()` rule-based engine. |

---

## 4. Component Breakdown

- `lib/tailor/index.ts`: Dispatcher with automatic fallback to legacy engine.
- `lib/tailor/nim.ts`: NVIDIA NIM prompt caller & schema validator.
- `lib/tailor/legacy.ts`: Rule-based NLP keyword integration.
- `app/api/tailor/route.ts`: Serverless API route handler.
- `components/optimization/TailorDrawer.tsx`: UI drawer & action controls.
- `scripts/run-qa-tests.ts`: Automated QA test coverage for tailor logic.
