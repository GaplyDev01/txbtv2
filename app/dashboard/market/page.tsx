'use client';

import { useEffect, useState } from 'react';
import { usePriceFeed } from '@/hooks/use-price-feed';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Settings2, ArrowUp, ArrowDown, TrendingUp, BarChart2, LineChart, PanelLeftClose, PanelRightClose, Send } from 'lucide-react';
import { Message } from 'ai';

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
  const { price, error: priceError } = usePriceFeed('ory_at_jK3k--5XuJiBOvsUNAdefykX6EuVVfKFlq1mLa2jicI.7DzbHVNRCXFLzj4zO0DHquTeGt9UNWtAD6tywCdyBHs');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [marketData, setMarketData] = useState<MarketData>({
    signal: 'Neutral',
    confidence: 13,
    price: price || 0,
    change: -2.34,
    volume: '1.2B',
    marketCap: '44.5B',
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, [router]);

  useEffect(() => {
    if (price) {
      setMarketData(prev => ({
        ...prev,
        price
      }));
    }
  }, [price]);

  if (priceError) {
    console.error('Price feed error:', priceError);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#181719] text-white flex">
      {/* Left Panel - Market Overview */}
      <div className={`w-[400px] bg-[#1C2620]/40 border-r border-[#36C58C]/20 transition-all duration-300 ${
        showLeftPanel ? 'translate-x-0' : '-translate-x-[360px]'
      }`}>
        <div className="p-4 h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Market Overview</h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className="text-[#36C58C] hover:bg-[#36C58C]/10"
            >
              <PanelLeftClose className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <Card className="bg-[#243830] border-[#36C58C]/20 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold mb-1">Solana (SOL)</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">${marketData.price}</span>
                    <span className={`flex items-center ${marketData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {marketData.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      {Math.abs(marketData.change)}%
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-[#36C58C] text-[#36C58C] hover:bg-[#36C58C]/10">
                  <TrendingUp className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#243830] border-[#36C58C]/20 p-4">
                <p className="text-gray-400 text-sm mb-1">24h Volume</p>
                <p className="text-lg font-bold">{marketData.volume}</p>
              </Card>
              <Card className="bg-[#243830] border-[#36C58C]/20 p-4">
                <p className="text-gray-400 text-sm mb-1">Market Cap</p>
                <p className="text-lg font-bold">{marketData.marketCap}</p>
              </Card>
            </div>

            <Card className="bg-[#243830] border-[#36C58C]/20 p-4">
              <div className="h-[200px] flex items-center justify-center">
                <LineChart className="w-6 h-6 text-[#36C58C] opacity-50" />
                <span className="ml-2 text-sm text-gray-400">Price Chart</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-[#36C58C]/20 flex items-center justify-between px-6">
          <h1 className="text-xl font-bold">Market Analysis</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px] bg-[#1C2620]/60 border-[#36C58C]/50 text-white placeholder:text-gray-500"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            </div>
            <Button variant="outline" className="border-[#36C58C] text-[#36C58C] hover:bg-[#36C58C]/10">
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-[#1C2620]/40 border-[#36C58C]/20 p-6 mb-4">
              <p className="text-gray-400">
                Welcome to the Market Analysis AI Assistant. Ask me anything about market conditions,
                technical analysis, or trading strategies.
              </p>
            </Card>
            {messages.map((msg, index) => (
              <Card
                key={index}
                className={`p-4 mb-4 ${msg.role === 'assistant' ? 'bg-[#1C2620]/40' : 'bg-[#243830]/40'} border-[#36C58C]/20`}
              >
                <p className={msg.role === 'assistant' ? 'text-[#36C58C]' : 'text-white'}>
                  {msg.content}
                </p>
              </Card>
            ))
            }
            {isLoading && (
              <Card className="bg-[#1C2620]/40 border-[#36C58C]/20 p-4 mb-4">
                <p className="text-[#36C58C]">Thinking...</p>
              </Card>
            )}
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t border-[#36C58C]/20 p-6">
          <div className="max-w-3xl mx-auto flex gap-4">
            <Input
              type="text"
              placeholder="Ask about market analysis..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-[#1C2620]/60 border-[#36C58C]/50 text-white placeholder:text-gray-500"
            />
            <Button 
              className="bg-[#36C58C] hover:bg-[#36C58C]/90 text-black"
              onClick={async () => {
                if (!message.trim()) return;
                
                const userMessage = { role: 'user', content: message };
                setMessages(prev => [...prev, userMessage]);
                setMessage('');
                setIsLoading(true);
                
                setError(null);
                try {
                  const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      messages: [...messages, userMessage]
                    })
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details || 'Failed to send message');
                  }
                  
                  const reader = response.body?.getReader();
                  if (!reader) throw new Error('No response stream available');
                  
                  const decoder = new TextDecoder();
                  let assistantMessage = { role: 'assistant', content: '' };
                  
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    assistantMessage.content += chunk;
                    
                    setMessages(prev => {
                      const newMessages = [...prev];
                      if (newMessages[newMessages.length - 1]?.role === 'assistant') {
                        newMessages[newMessages.length - 1] = { ...assistantMessage };
                      } else {
                        newMessages.push({ ...assistantMessage });
                      }
                      return newMessages;
                    });
                  }
                } catch (error) {
                  console.error('Chat error:', error);
                  setError(error instanceof Error ? error.message : 'An unexpected error occurred');
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading || !message.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Technical Analysis */}
      <div className={`w-[400px] bg-[#1C2620]/40 border-l border-[#36C58C]/20 transition-all duration-300 ${
        showRightPanel ? 'translate-x-0' : 'translate-x-[360px]'
      }`}>
        <div className="p-4 h-full">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowRightPanel(!showRightPanel)}
              className="text-[#36C58C] hover:bg-[#36C58C]/10"
            >
              <PanelRightClose className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-bold">Technical Analysis</h2>
          </div>

          <div className="space-y-4">
            <Card className="bg-[#243830] border-[#36C58C]/20 p-4">
              <p className="text-gray-400 mb-2">Signal Strength</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">{marketData.signal}</span>
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#36C58C]" 
                    style={{ width: `${marketData.confidence}%` }}
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-[#243830] border-[#36C58C]/20 p-4">
              <p className="text-gray-400 mb-3">Indicators</p>
              <div className="space-y-3">
                {['RSI', 'MACD', 'Moving Averages'].map((indicator) => (
                  <div key={indicator} className="flex justify-between items-center">
                    <span>{indicator}</span>
                    <span className="text-[#36C58C]">Coming Soon</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-[#243830] border-[#36C58C]/20 p-4">
              <p className="text-gray-400 mb-3">Social Sentiment</p>
              <div className="space-y-3">
                {['Twitter', 'Reddit', 'News'].map((source) => (
                  <div key={source} className="flex justify-between items-center">
                    <span>{source}</span>
                    <span className="text-[#36C58C]">Coming Soon</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}