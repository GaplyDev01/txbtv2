import { useEffect, useState } from 'react';
import { BitqueryWebSocket } from '../lib/websocket';

export const usePriceFeed = (token: string) => {
  const [price, setPrice] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePriceUpdate = (newPrice: number, newTimestamp: number) => {
    setPrice(newPrice);
    setTimestamp(newTimestamp);
  };

  useEffect(() => {
    let ws: BitqueryWebSocket | null = null;

    const connect = async () => {
      setError(null);
      setIsConnecting(true);
      ws = new BitqueryWebSocket(token, handlePriceUpdate);

      try {
        ws.connect()
          .then(() => {
            setIsConnecting(false);
          })
          .catch((error) => {
            setError(error.message);
            setIsConnecting(false);
          });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to connect');
        setIsConnecting(false);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.disconnect();
      }
    };
  }, [token]);

  return { price, timestamp, isConnecting, error };
};