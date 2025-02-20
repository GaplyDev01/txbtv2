import { useEffect, useState } from 'react';

export const usePriceFeed = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    try {
      const response = await fetch('/api/price');
      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }
      const data = await response.json();
      setPrice(data.price);
      setChange24h(data.change24h);
      setTimestamp(data.timestamp);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch price');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const updatePrice = () => {
      setIsLoading(true);
      fetchPrice();
    };

    // Initial fetch
    updatePrice();

    // Set up polling every 10 seconds
    const interval = setInterval(updatePrice, 10000);

    return () => clearInterval(interval);
  }, []);

  return { price, change24h, timestamp, isLoading, error };
};