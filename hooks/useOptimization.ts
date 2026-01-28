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

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ resumeText, jdText }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze resume');
            }

            const data = await response.json();
            // Ensure defaults if API returns partial data
            setResult({
                score: data.score || 0,
                missingKeywords: data.missingKeywords || [],
                feedback: data.feedback || 'Analysis complete.',
                ...data
            });
        } catch (error) {
            console.error('Optimization Error:', error);
            // Optional: Set an error state or default error result
            setResult({
                score: 0,
                missingKeywords: [],
                feedback: 'Failed to analyze resume. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        result,
        runOptimization,
    };
}
