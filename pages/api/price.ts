import { NextApiRequest, NextApiResponse } from 'next';

// Bitquery GraphQL endpoint
const BITQUERY_ENDPOINT = 'https://streaming.bitquery.io/graphql';

// Handle CORS preflight requests
export const corsMiddleware = (req: NextApiRequest, res: NextApiResponse) => {
  // Allow requests from Vercel deployment and localhost
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://txbt2-g2kb757xg-deep-seam-ai.vercel.app',
    'http://localhost:3000'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
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
    console.log('Using Bitquery token:', token ? 'Token exists' : 'Token is missing');

    if (!token) {
      throw new Error('BITQUERY_TOKEN environment variable is not set');
    }

    const query = `
      query {
        EVM(dataset: combined, network: ethereum) {
          Blocks(limit: 1, orderBy: {Time: DESC}) {
            Block {
              Time
            }
            Price(calculate: maximum, in: USD) {
              Amount
              Currency {
                Symbol
              }
            }
          }
        }
      }
    `;

    console.log('Making request to Bitquery API...');
    const response = await fetch(`${BITQUERY_ENDPOINT}?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Sec-WebSocket-Protocol': 'graphql-ws'
      },
      body: JSON.stringify({ query }),
    });

    console.log('Bitquery API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bitquery API error response:', errorText);
      throw new Error(`Bitquery API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Bitquery API response data:', JSON.stringify(data, null, 2));
    
    if (!data.data?.EVM?.Blocks?.[0]) {
      console.error('Invalid data structure received:', data);
      throw new Error('No price data available');
    }

    const price = data.data.EVM.Blocks[0].Price.Amount;
    const timestamp = new Date(data.data.EVM.Blocks[0].Block.Time).getTime();

    console.log('Sending successful response:', { price, timestamp });
    res.status(200).json({ price, timestamp });
  } catch (error) {
    console.error('Price API error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
