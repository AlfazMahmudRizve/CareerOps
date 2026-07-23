# Design Document: Top-Grade AI Resume Tailor & Interactive STAR Workspace

**Date**: 2026-07-24  
**Author**: Antigravity Pair Programmer & Alfaz Mahmud  
**Status**: Validated Design

---

## Executive Summary

This specification outlines the architecture to transform CareerOps into a premier, top-grade AI Resume Tailor competing directly with tools like Teal, Jobscan, and Rezi.

It provides **100% candidate fact preservation**, **STAR method bullet rewriting** (Situation, Task, Action, Result) with quantifiable impact metrics, **complete multi-section coverage**, and an **interactive side-by-side review workspace** with bullet-level Accept/Reject toggles.

---

## 1. High-Level Architecture & Data Flow

```
[ Upload PDF Resume & Job Description ]
                 │
                 ▼
     [ 1. Complete PDF Parser ]
  • Extracts 100% of sections (Contact, Summary, Experience,
    Education, Skills, Projects, Personal Details)
                 │
                 ▼
   [ 2. Deep LLM Tailor Engine (/api/tailor) ]
  • Enforces STAR format (Action Verb + Task + Quantifiable Impact)
  • Injects missing JD keywords into actual candidate bullets
  • Zero Hallucinations: preserves original companies, dates, degrees
                 │
                 ▼
[ 3. Interactive Side-by-Side Review Workspace ]
  • Highlights original vs tailored text diffs
  • Accept/Reject toggles per bullet point
  • 1-Click Sync to Builder & ATS PDF Exporter
```

---

## 2. Deep LLM Tailor Engine & Data Schema

### Schema Payload (`TopGradeTailoredPayload`)
```typescript
export type TopGradeTailoredPayload = {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
    presentAddress?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  summary: string;
  experience: {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  education: {
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
    details?: string;
  }[];
  projects: {
    title: string;
    techStack: string;
    link: string;
    bullets: string[];
  }[];
  skills: {
    technical: string[];
    tools: string[];
    soft: string[];
  };
  languages?: string[];
  projectedScore: number;
  keywordMapping: { keyword: string; location: string }[];
};
```

---

## 3. Interactive Review Workspace & Export Engine

1. **Side-by-Side Bullet Diff UI (`TailorWorkspace.tsx`)**:
   - Compare original vs tailored bullets.
   - Green keyword badges showing exact injected terms.
   - Bullet-level Accept/Reject toggles.

2. **Builder Sync & ATS PDF Export**:
   - 1-Click sync to `/build` with `localStorage` reset.
   - Executive PDF download via `@react-pdf/renderer`.
