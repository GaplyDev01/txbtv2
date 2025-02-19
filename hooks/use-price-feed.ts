import { useState, useEffect, useCallback } from 'react';
import { BitqueryWebSocket } from '@/lib/websocket';

export function usePriceFeed(token: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handlePriceUpdate = useCallback((newPrice: number) => {
    setPrice(newPrice);
    setError(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setError('Bitquery token is required');
      return;
    }

    if (isConnecting) return;

    setIsConnecting(true);
    const ws = new BitqueryWebSocket(token, handlePriceUpdate);

    try {
      ws.connect();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to price feed';
      console.error('Price feed error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }

    return () => {
      ws.disconnect();
    };
  }, [token, handlePriceUpdate, isConnecting]);

  return { price, error, isConnecting };
}