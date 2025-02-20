import { Provider } from './types';

export class MarketAnalysisProvider implements Provider {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 60 * 1000; // 1 minute

  async get(runtime: any, message: any, state?: any): Promise<string> {
    const cacheKey = 'market_analysis';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return JSON.stringify(cached.data);
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: 'sonar-medium-online',
          messages: [{
            role: 'user',
            content: `Analyze the following market data for SOL/USD:
              Price: ${state?.marketData?.price}
              24h Change: ${state?.marketData?.change}%
              Volume: ${state?.marketData?.volume}
              Market Cap: ${state?.marketData?.marketCap}
              
              Provide a brief market analysis focusing on:
              1. Current market sentiment
              2. Key price levels
              3. Trading recommendation
              
              Format the response in a clear, concise way.`
          }],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get market analysis');
      }

      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: data.choices[0].message.content,
        timestamp: Date.now()
      });

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Market analysis error:', error);
      return 'Unable to generate market analysis at this time.';
    }
  }
}
