import { Message } from 'ai';

// Allow streaming responses up to 30 seconds
export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Extract the messages from the body of the request
    const { messages } = await req.json();

    // Make sure we have an API key
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('Missing Perplexity API key');
    }

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar-medium-online',
        messages: messages.map((m: Message) => ({
          role: m.role,
          content: m.content
        })),
        stream: true
      })
    });

    // Check for errors
    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred during your request.' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}