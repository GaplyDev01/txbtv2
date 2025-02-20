export class BitqueryWebSocket {
  private ws: WebSocket | null = null;
  private baseUrl: string;
  private onPriceUpdate: (price: number, timestamp: number) => void;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private lastPrice: number | null = null;
  private lastTimestamp: number | null = null;

  constructor(
    private token: string,
    onPriceUpdate: (price: number, timestamp: number) => void
  ) {
    this.onPriceUpdate = onPriceUpdate;
    this.baseUrl = typeof window !== 'undefined' 
      ? window.location.origin
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';
  }

  public async connect(): Promise<void> {
    try {
      console.log('Connecting to WebSocket...');
      await this.fetchInitialPrice();
      await this.establishWebSocketConnection();
    } catch (error) {
      console.error('Connection error:', error);
      this.handleReconnect();
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private async fetchInitialPrice(): Promise<void> {
    console.log('Fetching initial price...');
    try {
      const response = await fetch(`${this.baseUrl}/api/price`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Price fetch error response:', errorData);
        throw new Error(`Failed to fetch price data: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('Initial price data:', data);

      if (!data.price || !data.timestamp) {
        console.error('Invalid price data:', data);
        throw new Error('Invalid price data format');
      }

      this.lastPrice = data.price;
      this.lastTimestamp = data.timestamp;
      console.log('Updated initial price:', this.lastPrice, 'timestamp:', this.lastTimestamp);
      
      if (typeof this.lastPrice === 'number' && typeof this.lastTimestamp === 'number') {
        this.onPriceUpdate(this.lastPrice, this.lastTimestamp);
      }
    } catch (error) {
      console.error('Failed to fetch initial price:', error);
      throw new Error(`Failed to fetch initial price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async establishWebSocketConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Establishing WebSocket connection...');
      
      const wsUrl = `wss://streaming.bitquery.io/graphql?token=${this.token}`;
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

        // Send connection init message
        this.ws?.send(JSON.stringify({
          type: 'connection_init'
        }));

        this.ws?.addEventListener('message', (event) => {
          try {
            const response = JSON.parse(event.data.toString());
            
            if (response.type === 'connection_ack') {
              console.log('Connection acknowledged by server');
              
              // Start subscription
              this.ws?.send(JSON.stringify({
                id: '1',
                type: 'start',
                payload: {
                  query: `
                    subscription {
                      EVM(network: ethereum) {
                        Blocks {
                          Block {
                            Time
                          }
                          Price(calculate: maximum, in: USD) {
                            Amount
                            Currency {
                              Symbol
                            }
                          }
                        }
                      }
                    }
                  `
                }
              }));
            }
            
            if (response.type === 'data' && response.payload.data) {
              const block = response.payload.data.EVM.Blocks[0];
              const price = block.Price.Amount;
              const timestamp = new Date(block.Block.Time).getTime();
              
              console.log('Received price update:', price, 'timestamp:', timestamp);
              this.onPriceUpdate(price, timestamp);
            }

            if (response.type === 'ka') {
              console.log('Keep-alive message received');
            }

            if (response.type === 'error') {
              console.error('WebSocket error:', response.payload);
              this.handleReconnect();
            }

          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        });

        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        clearTimeout(connectionTimeout);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.handleReconnect();
      };
    });
  }

  private handleReconnect(): void {
    if (this.maxReconnectAttempts > 0) {
      console.log(`Attempting to reconnect in ${this.reconnectDelay}ms...`);
      this.reconnectTimeout = setTimeout(() => {
        this.maxReconnectAttempts--;
        this.connect();
      }, this.reconnectDelay);
      this.reconnectDelay *= 2; // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached');
    }
  }
}