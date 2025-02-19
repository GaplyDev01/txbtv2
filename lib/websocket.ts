// Browser-native WebSocket is used instead of 'ws' package

export class BitqueryWebSocket {
  private ws: WebSocket | null = null;
  private token: string;
  private onPriceUpdate: (price: number) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(token: string, onPriceUpdate: (price: number) => void) {
    this.token = token;
    this.onPriceUpdate = onPriceUpdate;
  }

  async connect() {
    try {
      await this.fetchInitialPrice();

      // Then establish WebSocket connection
      this.establishWebSocketConnection();
    } catch (error) {
      console.error('Failed to initialize price feed:', error);
      this.handleReconnect();
    }
  }

  private async fetchInitialPrice(): Promise<number> {
    const response = await fetch('https://graphql.bitquery.io', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        query: `
          {
            EVM(network: solana) {
              DEXTrades(
                options: {limit: 1, desc: "Block.Time"}
              ) {
                Block {
                  Time
                }
                Price
              }
            }
          }
        `
      }),
    });

    const data = await response.json();
    if (data.data?.EVM?.DEXTrades?.[0]?.Price) {
      const price = Number(data.data.EVM.DEXTrades[0].Price);
      this.onPriceUpdate(price);
      return price;
    }
    throw new Error('Failed to fetch initial price');
  }

  private establishWebSocketConnection() {
    if (typeof window === 'undefined') return;

    this.ws = new WebSocket('wss://streaming.bitquery.io/graphql', ['graphql-ws']);
    
    this.ws.onopen = this.handleOpen;
    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = this.handleClose;
    this.ws.onerror = this.handleError;
  }

  private handleOpen = () => {
    if (!this.ws) return;
    
    // Reset reconnect attempts on successful connection
    this.reconnectAttempts = 0;
    
    const initMessage = JSON.stringify({
      type: 'connection_init',
      payload: {
        token: this.token
      }
    });
    this.ws.send(initMessage);
  };

  private handleMessage = (event: MessageEvent) => {
    try {
      const response = JSON.parse(event.data);

      if (response.type === 'connection_ack') {
        this.sendSubscription();
      }

      if (response.type === 'data' && response.payload.data) {
        const trades = response.payload.data.EVM?.DEXTrades;
        if (trades?.[0]?.Price) {
          const price = Number(trades[0].Price);
          if (!isNaN(price)) {
            this.onPriceUpdate(price);
          }
        }
      }

      if (response.type === 'error') {
        console.error('Subscription error:', response.payload);
        this.handleReconnect();
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  private sendSubscription() {
    if (!this.ws) return;

    const subscriptionMessage = JSON.stringify({
      type: 'start',
      id: '1',
      payload: {
        query: `
          subscription {
            EVM(network: solana) {
              DEXTrades(
                options: {limit: 1, desc: "Block.Time"}
              ) {
                Block {
                  Time
                }
                Price
              }
            }
          }
        `
      }
    });

    this.ws.send(subscriptionMessage);
  }

  private handleClose = () => {
    console.log('WebSocket connection closed');
    this.handleReconnect();
  };

  private handleError = (error: Event) => {
    console.error('WebSocket error:', error);
    this.handleReconnect();
  };

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, 5000 * this.reconnectAttempts); // Exponential backoff
    }
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