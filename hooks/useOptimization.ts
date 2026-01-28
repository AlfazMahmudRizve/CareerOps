import { useState } from 'react';

export type OptimizationResult = {
    score: number;
    missingKeywords: string[];
    feedback: string;
};

export function useOptimization() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<OptimizationResult | null>(null);

    const runOptimization = async (resumeText: string, jdText: string) => {
        setIsLoading(true);
        setResult(null);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock response
        setResult({
            score: 72,
            missingKeywords: ['Docker', 'GraphQL', 'System Design'],
            feedback:
                'Your resume is strong on Frontend but lacks the Backend infrastructure keywords requested in the JD.',
        });
        setIsLoading(false);
    };

    return {
        isLoading,
        result,
        runOptimization,
    };
}
