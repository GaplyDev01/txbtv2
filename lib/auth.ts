// This is a simple mock auth system for demonstration
// In production, you would want to use a proper auth solution

interface User {
  id: string;
  email: string;
  accessLevels: string[];
}

const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    accessLevels: ['sentiment', 'trading', 'market', 'pnl'],
  },
  {
    id: '2',
    email: 'basic@example.com',
    accessLevels: ['sentiment', 'market'],
  },
];

export async function signIn(email: string, password: string): Promise<{ user: User | null; error?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return { user: null, error: 'Invalid credentials' };
  }

  // In a real app, you would verify the password here
  if (password.length < 6) {
    return { user: null, error: 'Invalid credentials' };
  }

  return { user };
}

export async function signUp(email: string, password: string): Promise<{ user: User | null; error?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (mockUsers.some(u => u.email === email)) {
    return { user: null, error: 'Email already in use' };
  }

  if (password.length < 6) {
    return { user: null, error: 'Password must be at least 6 characters' };
  }

  // In a real app, you would create a new user in the database
  const newUser: User = {
    id: String(mockUsers.length + 1),
    email,
    accessLevels: ['sentiment', 'market'], // Default access levels for new users
  };

  mockUsers.push(newUser);
  return { user: newUser };
}

export function getUserAccessLevels(userId: string): string[] {
  const user = mockUsers.find(u => u.id === userId);
  return user?.accessLevels || [];
}

export const accessLevelInfo = {
  sentiment: {
    name: 'Sentiment Analysis Engine',
    description: 'Advanced market sentiment analysis and predictive modeling',
    icon: 'LineChart',
    color: 'text-blue-500',
  },
  trading: {
    name: 'Trading Pad',
    description: 'Professional-grade trading interface and execution',
    icon: 'TrendingUp',
    color: 'text-green-500',
  },
  pnl: {
    name: 'PnL Tracking',
    description: 'Real-time performance analytics and risk metrics',
    icon: 'ChartBarIcon',
    color: 'text-purple-500',
  },
  market: {
    name: 'Market Overview',
    description: 'Comprehensive market analysis and data visualization',
    icon: 'LineChart',
    color: 'text-yellow-500',
  },
};