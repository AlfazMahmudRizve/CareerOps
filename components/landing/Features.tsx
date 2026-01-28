import { Eye, Shield, Bot } from 'lucide-react';

const features = [
    {
        icon: Eye,
        title: 'Blind-Spot Analysis',
        description: 'Find exactly what your resume is missing against the JD.',
    },
    {
        icon: Shield,
        title: 'Privacy First',
        description: 'Upload. Optimize. Vanish. We never save your file.',
    },
    {
        icon: Bot,
        title: 'ATS Simulator',
        description: 'See your resume how the robots see it.',
    },
];

export function Features() {
    return (
        <section className="container py-12 md:py-24 lg:py-32 px-4 md:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                    <div
                        key={feature.title}
                        className="group relative overflow-hidden rounded-lg border bg-background p-8 hover:shadow-md transition-shadow"
                    >
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
