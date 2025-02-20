import { NextApiRequest, NextApiResponse } from 'next';

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
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch price from CoinGecko');
    }

    const data = await response.json();
    
    if (!data.solana) {
      throw new Error('Invalid response from CoinGecko');
    }

    res.status(200).json({
      price: data.solana.usd,
      change24h: data.solana.usd_24h_change,
      timestamp: data.solana.last_updated_at * 1000, // Convert to milliseconds
    });
  } catch (error) {
    console.error('Price fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch price data' });
  }
}
