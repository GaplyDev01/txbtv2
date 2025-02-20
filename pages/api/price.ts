import type { NextApiRequest, NextApiResponse } from 'next';

type PriceResponse = {
  price?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PriceResponse>
) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.BITQUERY_TOKEN) {
    console.error('Bitquery authentication not configured');
    return res.status(500).json({ error: 'Service configuration error' });
  }

  try {
    console.log('Fetching price data from Bitquery...');
    const token = process.env.BITQUERY_TOKEN;
    console.log('Request details:', {
      url: 'https://streaming.bitquery.io/graphql',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const response = await fetch('https://streaming.bitquery.io/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: `
          {
            EVM(network: eth) {
              DEXTrades(
                limit: {count: 1}
                where: {Trade: {Buy: {Currency: {SmartContract: {is: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"}}}}}
              ) {
                Block {
                  Time
                }
                Trade {
                  Buy {
                    AmountInUSD
                  }
                }
              }
            }
          }
        `
      }),
    });

    console.log('Response details:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Full error response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received data from Bitquery:', JSON.stringify(data, null, 2));
    
    if (!data.data?.EVM?.DEXTrades?.[0]?.Trade?.Buy?.AmountInUSD) {
      console.error('Invalid data structure:', data);
      throw new Error('No price data found in response');
    }

    const price = Number(data.data.EVM.DEXTrades[0].Trade.Buy.AmountInUSD);
    console.log('Extracted price:', price);

    if (isNaN(price) || price <= 0) {
      throw new Error('Invalid price value');
    }

    return res.status(200).json({ price });
  } catch (error) {
    console.error('Error in price API:', error);
    return res.status(500).json({ error: 'Failed to fetch price data' });
  }
}
