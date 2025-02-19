import { DashboardMenu } from '@/components/dashboard/dashboard-menu';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Welcome to <span className="text-[#36C58C]">TradesXBT</span> Dashboard
      </h1>
      <DashboardMenu />
    </div>
  );
}