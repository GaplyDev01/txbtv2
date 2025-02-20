import { OpenAIStream, StreamingTextResponse } from 'ai';

// Allow streaming responses up to 30 seconds
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
        messages,
        stream: true
      })
    });

    // Check for errors
    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    // Create a stream from the response
    const stream = OpenAIStream(response);

    // Return a StreamingTextResponse, which can be consumed by the client
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred during your request.' }),
      { status: 500 }
    );
  }
}