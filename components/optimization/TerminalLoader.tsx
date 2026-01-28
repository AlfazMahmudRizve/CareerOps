'use client';

import { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

const steps = [
    'Initializing CareerOps agent...',
    'Scanning PDF for skills...',
    'Cross-referencing JD requirements...',
    'Generating gap analysis...',
];

export function TerminalLoader() {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 800); // Change step every 800ms

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-start justify-center space-y-4 rounded-xl border bg-black p-8 font-mono text-sm text-green-400 shadow-lg min-h-[400px]">
            <div className="flex items-center gap-2 border-b border-green-400/30 pb-4 w-full mb-2">
                <Terminal className="h-5 w-5" />
                <span className="opacity-70">terminal_output</span>
            </div>

            <div className="flex flex-col gap-3 w-full">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`transition-opacity duration-300 ${index <= currentStepIndex ? 'opacity-100' : 'opacity-0 h-0 hidden'
                            }`}
                    >
                        <span className="mr-2 opacity-50">&gt;</span>
                        {step}
                        {index === currentStepIndex && (
                            <span className="ml-2 inline-block h-4 w-2 animate-pulse bg-green-400 align-middle" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
