'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { usePriceFeed } from '@/hooks/use-price-feed';
import { useChat } from 'ai/react';

interface Message {
  role: string;
  content: string;
}

interface MarketData {
  signal: string;
  confidence: number;
  price: number;
  change: number;
  volume: string;
  marketCap: string;
}

export default function MarketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { price, change24h, isLoading, error } = usePriceFeed();
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [marketData, setMarketData] = useState<MarketData>({
    signal: 'Neutral',
    confidence: 13,
    price: 0,
    change: change24h || -2.34,
    volume: '1.2B',
    marketCap: '44.5B',
  });

  const { messages, input, handleInputChange, handleSubmit, isLoading: isLoadingMessage } = useChat({
    api: '/api/chat',
    body: {
      marketData,
    },
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (price) {
      setMarketData(prev => ({
        ...prev,
        price: price
      }));
    }
  }, [price]);

  useEffect(() => {
    if (change24h) {
      setMarketData(prev => ({
        ...prev,
        change: change24h
      }));
    }
  }, [change24h]);

  if (error) {
    console.error('Price feed error:', error);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#36C58C]"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left Panel */}
      {showLeftPanel && (
        <div className="w-1/4 p-4 border-r border-gray-800">
          <h2 className="text-xl font-bold mb-4">Market Overview</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400">Signal</p>
              <p className="text-lg font-semibold">{marketData.signal}</p>
            </div>
            <div>
              <p className="text-gray-400">Confidence</p>
              <p className="text-lg font-semibold">{marketData.confidence}%</p>
            </div>
            <div>
              <p className="text-gray-400">Price</p>
              <p className="text-lg font-semibold">${marketData.price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400">24h Change</p>
              <p className={`text-lg font-semibold ${marketData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {marketData.change >= 0 ? '+' : ''}{marketData.change.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-gray-400">Volume</p>
              <p className="text-lg font-semibold">${marketData.volume}</p>
            </div>
            <div>
              <p className="text-gray-400">Market Cap</p>
              <p className="text-lg font-semibold">${marketData.marketCap}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <Card 
              key={index} 
              className={`p-4 mb-4 ${
                msg.role === 'user' 
                  ? 'bg-[#1C2620]/40 border-[#36C58C]/20' 
                  : 'bg-[#1C1E20] border-gray-800'
              }`}
            >
              <p className={msg.role === 'user' ? 'text-[#36C58C]' : 'text-white'}>
                {msg.content}
              </p>
            </Card>
          ))}
          {isLoadingMessage && (
            <Card className="bg-[#1C2620]/40 border-[#36C58C]/20 p-4 mb-4">
              <p className="text-[#36C58C]">Thinking...</p>
            </Card>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about market conditions..."
              className="flex-1 bg-[#1C1E20] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#36C58C]"
            />
            <Button
              type="submit"
              className="bg-[#36C58C] hover:bg-[#36C58C]/80 text-black"
              disabled={isLoadingMessage || !input.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoadingMessage ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </form>
      </div>

      {/* Right Panel */}
      {showRightPanel && (
        <div className="w-1/4 p-4 border-l border-gray-800">
          <h2 className="text-xl font-bold mb-4">Technical Analysis</h2>
          {/* Add technical analysis content here */}
        </div>
      )}
    </div>
  );
}