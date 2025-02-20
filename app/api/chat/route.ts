import { Message } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    console.log('Received chat request');
    const { messages } = await req.json();
    console.log('Messages:', messages);

    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('PERPLEXITY_API_KEY not found in environment');
      throw new Error('PERPLEXITY_API_KEY is not configured');
    }

    // Ensure messages alternate between user and assistant
    const validatedMessages = messages.reduce((acc: Message[], curr: Message, i: number) => {
      // Allow system messages at the start
      if (curr.role === 'system' && i === 0) {
        return [...acc, curr];
      }
      
      // For non-system messages, ensure alternating pattern
      const prevMessage = acc[acc.length - 1];
      if (!prevMessage || 
          (prevMessage.role === 'user' && curr.role === 'assistant') ||
          (prevMessage.role === 'assistant' && curr.role === 'user') ||
          (prevMessage.role === 'system' && curr.role === 'user')) {
        return [...acc, curr];
      }
      
      return acc;
    }, []);

    console.log('Making request to Perplexity API');
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar-reasoning-pro',
        messages: validatedMessages.map((m: Message) => ({
          role: m.role,
          content: m.content
        })),
        temperature: 0.2,
        top_p: 0.9,
        top_k: 0,
        stream: true,
        frequency_penalty: 1
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Perplexity API error:', error);
      throw new Error(`Perplexity API request failed: ${error}`);
    }

    // Ensure the response body is valid before streaming
    if (!response.body) {
      console.error('No response body received');
      throw new Error('No response body received from Perplexity API');
    }

    console.log('Successfully received response from Perplexity');
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
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
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