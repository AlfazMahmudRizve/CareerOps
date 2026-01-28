import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resumeText } = body;

        if (!resumeText) {
            return NextResponse.json({ error: 'Missing resumeText' }, { status: 400 });
        }

        // const n8nUrl = process.env.N8N_STRUCTURE_URL;
        const n8nUrl = "https://v3-n8n.veemi.site/webhook-test/careerops";

        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ resumeText }),
        });

        if (!response.ok) {
            throw new Error(`n8n responded with ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Structure Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to structure resume' }, { status: 500 });
    }
}
