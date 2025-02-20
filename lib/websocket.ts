// Browser-native WebSocket is used instead of 'ws' package

export class BitqueryWebSocket {
  private ws: WebSocket | null = null;
  private token: string;
  private onPriceUpdate: (price: number, timestamp: number) => void;
  private baseUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectDelay = 1000;

  constructor(
    token: string,
    onPriceUpdate: (price: number, timestamp: number) => void,
    baseUrl: string = typeof window !== 'undefined' ? 
      window.location.origin : 
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
  ) {
    this.token = token;
    this.onPriceUpdate = onPriceUpdate;
    this.baseUrl = baseUrl;
  }

  async connect() {
    try {
      await this.fetchInitialPrice();
      await this.establishWebSocketConnection();
    } catch (error) {
      console.error('Failed to initialize price feed:', error);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.handleReconnect();
      }
    }
  }

  private async fetchInitialPrice(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/price`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch price data: ${errorData}`);
      }

      const data = await response.json();
      if (!data.price) {
        throw new Error('Invalid price data received from API');
      }

      this.onPriceUpdate(data.price, Date.now());
    } catch (error) {
      console.error('Price fetch error:', error);
      throw new Error(`Failed to fetch initial price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async establishWebSocketConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Establishing WebSocket connection...');
      
      const wsUrl = `wss://streaming.bitquery.io/graphql`;
      console.log('WebSocket URL:', wsUrl);
      
      this.ws = new WebSocket(wsUrl, ['graphql-ws']);

      // Set up connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          console.error('WebSocket connection timeout');
          this.ws?.close();
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);

      this.ws.onopen = () => {
        console.log('Successfully connected');
        clearTimeout(connectionTimeout);

        // Send connection init message with token
        this.ws?.send(JSON.stringify({
          type: 'connection_init',
          payload: {
            headers: {
              'X-API-KEY': this.token
            }
          }
        }));

        // Subscribe to price updates
        setTimeout(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
              id: '1',
              type: 'start',
              payload: {
                variables: {},
                extensions: {},
                operationName: 'BitcoinPrice',
                query: `subscription BitcoinPrice {
                  Bitcoin_USD: Trade(orderBy: {Block: {Time: DESC}}, limit: 1) {
                    Block {
                      Time
                    }
                    Buy {
                      AmountInUSD
                    }
                  }
                }`
              }
            }));
          }
        }, 1000);

        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'data' && data.payload?.data?.Bitcoin_USD?.[0]) {
            const price = data.payload.data.Bitcoin_USD[0].Buy.AmountInUSD;
            const timestamp = new Date(data.payload.data.Bitcoin_USD[0].Block.Time).getTime();
            this.onPriceUpdate(price, timestamp);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        clearTimeout(connectionTimeout);
        reject(error);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code);
        clearTimeout(connectionTimeout);
        this.handleReconnect();
      };
    });
  }

  private handleReconnect() {
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Scheduling reconnect attempt in ${delay}ms`);

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(async () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Retry attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        try {
          await this.connect();
          console.log('Successfully reconnected');
          this.reconnectAttempts = 0;
        } catch (error) {
          console.log(`Retry attempt ${this.reconnectAttempts} failed:`, error);
        }
      } else {
        console.error('Max retries exceeded, please check your API token and network connection');
      }
    }, delay);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}