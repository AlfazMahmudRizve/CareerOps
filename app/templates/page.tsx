import Link from 'next/link';
import { ChevronRight, FileText, Briefcase, Code, BarChart, PenTool } from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Software & Engineering',
    icon: Code,
    templates: [
      { role: 'Software Engineer', slug: 'software-engineer' },
      { role: 'Frontend Developer', slug: 'frontend-developer' },
      { role: 'Backend Developer', slug: 'backend-developer' },
      { role: 'Full Stack Developer', slug: 'full-stack-developer' },
      { role: 'DevOps Engineer', slug: 'devops-engineer' },
    ]
  },
  {
    name: 'Business & Management',
    icon: Briefcase,
    templates: [
      { role: 'Product Manager', slug: 'product-manager' },
      { role: 'Project Manager', slug: 'project-manager' },
      { role: 'Business Analyst', slug: 'business-analyst' },
      { role: 'Operations Manager', slug: 'operations-manager' },
    ]
  },
  {
    name: 'Data & Analytics',
    icon: BarChart,
    templates: [
      { role: 'Data Scientist', slug: 'data-scientist' },
      { role: 'Data Analyst', slug: 'data-analyst' },
      { role: 'Machine Learning Engineer', slug: 'machine-learning-engineer' },
    ]
  },
  {
    name: 'Design & Creative',
    icon: PenTool,
    templates: [
      { role: 'UX/UI Designer', slug: 'ux-ui-designer' },
      { role: 'Product Designer', slug: 'product-designer' },
      { role: 'Graphic Designer', slug: 'graphic-designer' },
    ]
  }
];

export const metadata = {
  title: 'ATS Resume Templates by Industry | CareerOps',
  description: 'Free, ATS-optimized resume templates for Software Engineering, Product Management, Data Science, and Design. Build a resume that passes the scan.',
};

export default function TemplatesPage() {
  return (
    <div className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center space-y-4">
          <h2 className="text-base font-semibold leading-7 text-primary select-none mt-10">Programmatic Optimization</h2>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
            ATS-Optimized Resume Templates
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Don't start from scratch. Choose a high-performing base template tailored to your specific industry and let our stateless engine format it perfectly.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            {CATEGORIES.map((category) => (
              <div key={category.name} className="flex flex-col border border-border/50 rounded-2xl p-8 bg-card shadow-sm hover:shadow-md transition-shadow">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground mb-4">
                  <category.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  {category.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <ul className="space-y-3">
                    {category.templates.map((template) => (
                      <li key={template.slug} className="group">
                        <Link 
                          href={`/templates/${template.slug}-resume`}
                          className="flex items-center justify-between hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground/50" />
                            <span className="group-hover:text-primary transition-colors">{template.role} Resume</span>
                          </span>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
