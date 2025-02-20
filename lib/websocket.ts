// Browser-native WebSocket is used instead of 'ws' package

export class BitqueryWebSocket {
  private ws: WebSocket | null = null;
  private token: string;
  private onPriceUpdate: (price: number, timestamp: number) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(token: string, onPriceUpdate: (price: number, timestamp: number) => void) {
    this.token = token;
    this.onPriceUpdate = onPriceUpdate;
  }

  async connect() {
    try {
      // Reset reconnect attempts on new connection
      this.reconnectAttempts = 0;
      await this.fetchInitialPrice();
      this.establishWebSocketConnection();
    } catch (error) {
      console.error('Failed to initialize price feed:', error);
      await this.retryConnection();
    }
  }

  private async retryConnection(delay = 1000) {
    while (this.reconnectAttempts < this.maxReconnectAttempts) {
      try {
        this.reconnectAttempts++;
        console.warn(`Retry attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        await new Promise(resolve => setTimeout(resolve, delay * this.reconnectAttempts)); // Exponential backoff
        await this.fetchInitialPrice();
        this.establishWebSocketConnection();
        console.log('Successfully reconnected');
        return;
      } catch (error) {
        console.warn(`Retry attempt ${this.reconnectAttempts} failed:`, error);
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max retries exceeded, please check your API token and network connection');
          this.onPriceUpdate(0, 0); // Signal error to UI
          return;
        }
      }
    }
  }

  private async fetchInitialPrice(): Promise<number> {
    try {
      const response = await fetch('http://localhost:3002/api/price', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.price || isNaN(data.price) || data.price <= 0) {
        throw new Error('Invalid price data received from API');
      }

      return data.price;
    } catch (error) {
      console.error('Price fetch error:', error);
      throw new Error(`Failed to fetch initial price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private establishWebSocketConnection() {
    try {
      console.log('Establishing WebSocket connection...');
      const wsUrl = `wss://streaming.bitquery.io/graphql`;
      console.log('WebSocket URL:', wsUrl);
      
      // Create WebSocket with required protocol header
      this.ws = new WebSocket(wsUrl, ['graphql-ws']);
      
      // Set required handlers
      if (this.ws) {
        // Set a timeout for the initial connection
        const connectionTimeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            console.error('WebSocket connection timeout');
            this.handleReconnect();
          }
        }, 10000); // 10 second timeout

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('WebSocket connection opened');
          // Send connection initialization message
          const initMessage = JSON.stringify({
            type: 'connection_init',
            payload: {
              authorization: `Bearer ${this.token}`
            }
          });
          console.log('Sending init message:', initMessage);
          if (this.ws) {
            this.ws.send(initMessage);
          }
        };
        this.ws.onmessage = (event) => {
          console.log('WebSocket message received:', event.data);
          try {
            const data = JSON.parse(event.data);
            console.log('Received message type:', data.type);

            switch (data.type) {
              case 'connection_ack':
                console.log('Connection acknowledged, sending subscription');
                this.sendSubscription();
                break;

              case 'ka':
                // Keep-alive message, no action needed
                console.log('Keep-alive message received');
                break;

              case 'data':
                if (data.payload?.data) {
                  const trades = data.payload.data.ethereum?.dexTrades;
                  if (trades?.[0]) {
                    const trade = trades[0];
                    const price = Number(trade.Trade.Buy.AmountInUSD);
                    const timestamp = new Date(trade.Block.Time).getTime();
                    
                    if (!isNaN(price) && price > 0) {
                      console.log('Received price update:', price, timestamp);
                      this.onPriceUpdate(price, timestamp);
                    } else {
                      console.error('Invalid price value:', price);
                    }
                  }
                }
                break;

              case 'error':
                console.error('Subscription error:', data.payload);
                this.handleReconnect();
                break;

              case 'complete':
                console.log('Subscription completed');
                break;
            }
          } catch (error) {
            console.error('Error processing message:', error);
          }
        };
        this.ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.handleReconnect();
        };
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.handleReconnect();
        };
      }
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Only attempt to reconnect if we haven't exceeded the max attempts
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000); // Exponential backoff with 10s max
      console.log(`Scheduling reconnect attempt in ${delay}ms`);
      this.reconnectTimeout = setTimeout(() => this.connect(), delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.onPriceUpdate(0, 0); // Signal error to UI
    }
  }

  private sendSubscription() {
    if (this.ws) {
      const subscriptionMessage = JSON.stringify({
        id: '1',
        type: 'start',
        payload: {
          query: `
            subscription {
              EVM(network: eth) {
                DEXTrades(
                  where: {Trade: {Buy: {Currency: {SmartContract: {is: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"}}}}}
                ) {
                  Block {
                    Time
                  }
                  Trade {
                    Buy {
                      AmountInUSD
                    }
                  }
                }
              }
            }
          `
        }
      });
      console.log('Sending subscription:', subscriptionMessage);
      this.ws.send(subscriptionMessage);
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.ws) {
      // Send stop message before closing
      const stopMessage = JSON.stringify({
        id: '1',
        type: 'stop'
      });
      
      try {
        this.ws.send(stopMessage);
      } catch (error) {
        console.error('Error sending stop message:', error);
      }
      
      this.ws.close();
      this.ws = null;
    }
  }
}