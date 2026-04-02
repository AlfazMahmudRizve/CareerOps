export type RoleInfo = {
  title: string;
  summary: string;
  skills: string;
  atsTips: string[];
  keywords: string[];
};

export const ROLE_DATA: Record<string, RoleInfo> = {
  'software-engineer': {
    title: 'Software Engineer',
    summary: 'High-performance Software Engineer with expertise in building scalable web applications and distributed systems. Proven track record of optimizing code for performance and security in high-velocity environments.',
    skills: 'React, Node.js, TypeScript, PostgreSQL, AWS, Docker, Kubernetes, GraphQL, System Design, Unit Testing, CI/CD Pipelines.',
    atsTips: [
      'Ensure clear headings for technical skills vs soft skills.',
      'Quantify results (e.g., "Reduced latency by 40%").',
      'Use standard fonts and avoid multi-column layouts.',
    ],
    keywords: ['Scalability', 'Microservices', 'Distributed Systems', 'Agile', 'Performance Optimization'],
  },
  'product-manager': {
    title: 'Product Manager',
    summary: 'Strategic Product Manager focused on delivering user-centric products through data-driven decision making and cross-functional leadership. Expert in lifecycle management and market positioning.',
    skills: 'Strategy, Roadmap Planning, Market Research, User Stories, A/B Testing, SQL, Jira, Product Analytics, Stakeholder Management.',
    atsTips: [
      'Focus on impact rather than responsibilities.',
      'Include industry-specific certifications (e.g., PMP, CSM).',
      'Mention collaboration with engineering and design teams.',
    ],
    keywords: ['KPIs', 'Lifecycle Management', 'User Growth', 'Market Fit', 'Roadmap'],
  },
  'data-scientist': {
    title: 'Data Scientist',
    summary: 'Analytical Data Scientist with a passion for deriving actionable insights from complex datasets. Specialist in machine learning, statistical modeling, and predictive analytics.',
    skills: 'Python, R, SQL, TensorFlow, Scikit-learn, Tableau, Big Data, Statistical Modeling, Machine Learning, Data Visualization.',
    atsTips: [
      'List specific algorithms and frameworks used.',
      'Mention cloud platforms (AWS, GCP, Azure).',
      'Focus on how your models solved specific business problems.',
    ],
    keywords: ['Predictive Modeling', 'Machine Learning', 'Big Data', 'Algorithm Design', 'Data Mining'],
  },
  'devops-engineer': {
    title: 'DevOps Engineer',
    summary: 'Cloud Infrastructure Engineer specializing in automation, reliability, and security of large-scale distributed systems. Expert in Infrastructure as Code and continuous delivery.',
    skills: 'Terraform, Ansible, Jenkins, AWS, Azure, Docker, Kubernetes, Linux/Unix, Python, Monitoring (Prometheus/Grafana), Networking.',
    atsTips: [
      'Highlight automation of manual processes.',
      'Focus on 99.9% uptime and reliability metrics.',
      'Include security-first infrastructure practices.',
    ],
    keywords: ['IaC', 'Automation', 'Site Reliability', 'Cloud Native', 'CI/CD'],
  },
};
