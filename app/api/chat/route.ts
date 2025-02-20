import { Message } from 'ai';
import { StreamingTextResponse } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is not configured');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: messages.map((m: Message) => ({
          role: m.role,
          content: m.content
        })),
        max_tokens: 2048,
        temperature: 0.2,
        top_p: 0.9,
        top_k: 0,
        stream: true,
        presence_penalty: 0,
        frequency_penalty: 1
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity API request failed: ${error}`);
    }

    // Ensure the response body is valid before streaming
    if (!response.body) {
      throw new Error('No response body received from Perplexity API');
    }

    // Return streaming response
    return new StreamingTextResponse(response.body);
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}