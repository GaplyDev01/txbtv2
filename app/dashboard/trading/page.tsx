'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TradingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would check the auth state here
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#181719] text-white">
      <div className="max-w-7xl mx-auto py-12">
        <h1 className="text-4xl font-bold mb-8">
          Trading Pad
        </h1>
        <div className="bg-[#1C2620]/40 backdrop-blur-md border border-[#36C58C] rounded-xl p-8">
          <p className="text-gray-400">
            Professional-grade trading interface and execution platform coming soon. This is the Chat Terminal with the Gooey Menu for the tool calls and functions.
          </p>
        </div>
      </div>
    </div>
  );
}