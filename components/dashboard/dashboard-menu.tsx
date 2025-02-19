'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartBarIcon, LineChart, TrendingUp, BarChart3 } from 'lucide-react';
import { accessLevelInfo, getUserAccessLevels } from '@/lib/auth';

export function DashboardMenu() {
  const router = useRouter();
  const [accessLevels, setAccessLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = '1'; // Demo user
    const levels = getUserAccessLevels(userId);
    setAccessLevels(levels);
    setLoading(false);
  }, []);

  const handleJump = (menuId: string) => {
    const hasAccess = accessLevels.includes(menuId);
    if (!hasAccess) {
      alert('You do not have access to this section');
      return;
    }
    router.push(`/dashboard/${menuId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {Object.entries(accessLevelInfo).map(([id, item]) => {
        const hasAccess = accessLevels.includes(id);
        const Icon = item.icon === 'ChartBarIcon' ? ChartBarIcon :
                    item.icon === 'BarChart3' ? BarChart3 :
                    item.icon === 'LineChart' ? LineChart :
                    item.icon === 'TrendingUp' ? TrendingUp :
                    LineChart;

        return (
          <Card
            key={id}
            className={`relative overflow-hidden transition-all duration-300 ${
              hasAccess 
                ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => handleJump(id)}
          >
            <CardHeader>
              <Icon className={`w-8 h-8 ${item.color}`} />
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant={hasAccess ? "default" : "secondary"}
                className="w-full"
                disabled={!hasAccess}
              >
                {hasAccess ? 'Jump' : 'No Access'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}