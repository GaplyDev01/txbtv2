import { NextApiRequest, NextApiResponse } from 'next';

// Bitquery GraphQL endpoint
const BITQUERY_ENDPOINT = 'https://graphql.bitquery.io';

// Handle CORS preflight requests
export const corsMiddleware = (req: NextApiRequest, res: NextApiResponse) => {
  // Allow requests from Vercel deployment and localhost
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://txbt2-r8bmaemsj-deep-seam-ai.vercel.app',
    'http://localhost:3000'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-KEY');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (corsMiddleware(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = process.env.BITQUERY_TOKEN;
    if (!token) {
      console.error('BITQUERY_TOKEN is not set');
      throw new Error('BITQUERY_TOKEN environment variable is not set');
    }

    const query = `
      query {
        Bitcoin_USD: Trade(orderBy: {Block: {Time: DESC}}, limit: 1) {
          Block {
            Time
          }
          Buy {
            AmountInUSD
          }
        }
      }
    `;

    console.log('Fetching price data from Bitquery...');
    const response = await fetch(BITQUERY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': token,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bitquery API error:', errorText);
      throw new Error(`Bitquery API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received data:', JSON.stringify(data, null, 2));
    
    if (!data.data?.Bitcoin_USD?.[0]) {
      console.error('No price data in response:', data);
      throw new Error('No price data available');
    }

    const price = data.data.Bitcoin_USD[0].Buy.AmountInUSD;
    const timestamp = new Date(data.data.Bitcoin_USD[0].Block.Time).getTime();

    console.log('Sending price response:', { price, timestamp });
    res.status(200).json({ price, timestamp });
  } catch (error) {
    console.error('Price API error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
