import { Action } from './types';

export class MarketAnalysisAction implements Action {
  name = 'MARKET_ANALYSIS';
  similes = ['analyze market', 'market analysis', 'analyze sol'];
  description = 'Analyzes current market conditions and provides trading insights';

  async validate(runtime: any, message: any): Promise<boolean> {
    return true; // Always valid as this is a core feature
  }

  async handler(runtime: any, message: any, state?: any): Promise<void> {
    try {
      // Get market analysis from provider
      const marketAnalysisProvider = runtime.getProvider('MarketAnalysisProvider');
      const analysis = await marketAnalysisProvider.get(runtime, message, state);

      // Update the state with the analysis
      if (state?.setMarketData) {
        state.setMarketData(prevData => ({
          ...prevData,
          signal: this.extractSignal(analysis),
          confidence: this.calculateConfidence(analysis)
        }));
      }

      // Return the analysis as a message
      return {
        role: 'assistant',
        content: analysis
      };
    } catch (error) {
      console.error('Market analysis action error:', error);
      return {
        role: 'assistant',
        content: 'I apologize, but I was unable to analyze the market at this time. Please try again later.'
      };
    }
  }

  private extractSignal(analysis: string): string {
    // Simple signal extraction based on sentiment keywords
    const lowerAnalysis = analysis.toLowerCase();
    if (lowerAnalysis.includes('bullish') || lowerAnalysis.includes('buy')) return 'Bullish';
    if (lowerAnalysis.includes('bearish') || lowerAnalysis.includes('sell')) return 'Bearish';
    return 'Neutral';
  }

  private calculateConfidence(analysis: string): number {
    // Simple confidence calculation based on certainty keywords
    const certaintyWords = ['definitely', 'certainly', 'clearly', 'strong', 'confident'];
    const uncertaintyWords = ['perhaps', 'maybe', 'might', 'could', 'uncertain'];
    
    const lowerAnalysis = analysis.toLowerCase();
    let confidence = 50; // Base confidence

    certaintyWords.forEach(word => {
      if (lowerAnalysis.includes(word)) confidence += 10;
    });

    uncertaintyWords.forEach(word => {
      if (lowerAnalysis.includes(word)) confidence -= 10;
    });

    return Math.min(Math.max(confidence, 0), 100);
  }
}
