# CareerOps | AI-Powered Career Strategist

**CareerOps** is a modern, AI-enhanced platform designed to streamline your job search and resume building process. It combines advanced resume analysis with a beautiful, intuitive builder to help you land your dream job.

![CareerOps Preview](./public/icon.png)

## 🚀 Key Features

### 1. AI Resume Optimizer
*   **Split-Screen Analysis**: Compare your resume against a job description side-by-side.
*   **Gap Analysis**: Automatically identify missing keywords and skills.
*   **ATS Score**: Get a real-time compatibility score.
*   **Smart Suggestions**: Receive actionable advice to improve your resume.

### 2. Next-Gen Resume Builder
*   **Interactive Form**: Easy-to-use inputs for Experience, Education, Projects, and Certifications.
*   **Best-Practice Hierarchy**: Sections organized for maximum readability and ATS compatibility.
*   **Personal Profile**: Granular extraction of Father's Name, Nationality, and other vital details.
*   **Live Preview**: Real-time PDF generation as you type.
*   **Smart Import**: Extract data effortlessly from existing PDF resumes using custom NLP heuristics.
*   **ATS Mode**: Toggle between a beautiful modern layout and a raw text view optimized for Applicant Tracking Systems.

### 3. Modern Tech Stack
Built with the latest web technologies for speed, performance, and scalability.
*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: Custom components with [Lucide Icons](https://lucide.dev/).
*   **NLP**: [Compromise](https://compromise.cool/) (Rule-based NLP for robust keyword extraction)
*   **PDF Parsing**: [pdf2json](https://github.com/modesty/pdf2json) with custom coordinate-aware text reconstruction.
*   **PDF Generation**: [@react-pdf/renderer](https://react-pdf.org/).
*   **Debloated**: Zero external animation libraries (Native Tailwind CSS/Radix animations).

## 🛠️ Getting Started

### Prerequisites
*   Node.js 18+
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/AlfazMahmudRizve/CareerOps.git
    cd CareerOps
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit [http://localhost:3000](http://localhost:3000) to see the app in action.

## 👤 Author

**Alfaz Mahmud**
*   **Portfolio**: [whoisalfaz.me](https://whoisalfaz.me)
*   **LinkedIn**: [linkedin.com/in/alfaz-mahmud](https://linkedin.com/in/alfaz-mahmud)

## 📄 License

This project is licensed under the MIT License.

## NVIDIA NIM Setup (Optional, Recommended)

CareerOps can optionally use NVIDIA NIM to power the resume analyzer with semantic matching and real LLM-generated rewrite suggestions, instead of pure rule-based scoring. This produces noticeably better keyword coverage, contextual rewrites, and tone improvements for your resume bullets.

**Environment variables**

- `NVIDIA_NIM_BASE_URL` — defaults to `https://integrate.api.nvidia.com/v1`.
- `NVIDIA_NIM_API_KEY` — your NVIDIA NIM API key (required for NIM mode).
- `NVIDIA_NIM_MODEL` — model identifier (e.g. `meta/llama-3.1-70b-instruct`).
- `ANALYZER_BACKEND` — `legacy` (rule-based, default) or `nim` (NVIDIA NIM).

**Steps**

1. Grab a free API key from [build.nvidia.com](https://build.nvidia.com).
2. Copy `.env.example` to `.env.local` and paste your key into `NVIDIA_NIM_API_KEY`.
3. Set `ANALYZER_BACKEND=nim` in `.env.local`.
4. Restart the dev server (`npm run dev`).

Legacy mode works out of the box without any API key — set `ANALYZER_BACKEND=legacy` (or leave it unset). If a NIM request fails, the analyzer automatically falls back to legacy mode. Note the rate limit of **30 requests / minute / IP** on the free tier.
