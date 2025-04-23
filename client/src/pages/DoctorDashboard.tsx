import { useState } from 'react';
import { Link } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { UserMenu } from '@/components/UserMenu';
import { StatCard } from '@/components/StatCard';
import { RecordsTable, Record } from '@/components/RecordsTable';
import { ChartDistribution } from '@/components/ChartDistribution';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { FolderOpen, ChartLine, CheckCircle2, Plus, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function DoctorDashboard() {
  const { toast } = useToast();
  const [showChart, setShowChart] = useState(false);

  // Fetch doctor dashboard data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/doctor/dashboard'],
    retry: 1,
  });

  if (isError) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to load dashboard data',
    });
  }

  // Sample data for the dashboard (would come from the API in real implementation)
  const dashboardData = data || {
    stats: {
      totalRecords: 147,
      totalChange: '+12 from last month',
      monthlyRecords: 23,
      monthlyChange: '+5 from previous month',
      accuracy: 94.2,
      accuracyChange: '+1.3% from last month',
    },
    recentRecords: [
      {
        id: 'LIV-2023051',
        patientName: 'Sarah Johnson',
        date: 'May 12, 2023',
        grade: 'F1',
      },
      {
        id: 'LIV-2023047',
        patientName: 'Michael Chen',
        date: 'May 10, 2023',
        grade: 'F2',
      },
      {
        id: 'LIV-2023042',
        patientName: 'Robert Williams',
        date: 'May 8, 2023',
        grade: 'F3',
      },
    ] as Record[],
    gradeDistribution: [
      { name: 'F0', value: 15, color: '#3b82f6' },
      { name: 'F1', value: 42, color: '#22c55e' },
      { name: 'F2', value: 58, color: '#eab308' },
      { name: 'F3', value: 27, color: '#f97316' },
      { name: 'F4', value: 5, color: '#ef4444' },
    ],
  };

  const handleViewRecord = (id: string) => {
    console.log(`View record ${id}`);
  };

  const handleEditRecord = (id: string) => {
    console.log(`Edit record ${id}`);
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar userType="doctor" showAuthButtons={false} />
      
      <section className="py-12 bg-primary-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Doctor Dashboard</h1>
            <UserMenu initials="JD" />
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Records"
              value={dashboardData.stats.totalRecords}
              change={dashboardData.stats.totalChange}
              icon={<FolderOpen className="h-5 w-5" />}
              iconColor="text-secondary-500"
              iconBgColor="bg-secondary-500 bg-opacity-20"
            />
            <StatCard
              title="Monthly Records"
              value={dashboardData.stats.monthlyRecords}
              change={dashboardData.stats.monthlyChange}
              icon={<ChartLine className="h-5 w-5" />}
              iconColor="text-accent"
              iconBgColor="bg-accent bg-opacity-20"
            />
            <StatCard
              title="Grading Accuracy"
              value={`${dashboardData.stats.accuracy}%`}
              change={dashboardData.stats.accuracyChange}
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconColor="text-green-500"
              iconBgColor="bg-green-500 bg-opacity-20"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link href="/doctor/grade">
              <Button className="bg-accent hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" /> Create New Record
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="border-primary-600"
              onClick={() => setShowChart(true)}
            >
              <PieChart className="mr-2 h-4 w-4" /> View Distribution
            </Button>
          </div>
          
          {/* Recent Records */}
          <RecordsTable
            records={dashboardData.recentRecords}
            onViewRecord={handleViewRecord}
            onEditRecord={handleEditRecord}
          />
        </div>
      </section>

      {/* Distribution Chart Dialog */}
      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="bg-primary-800 border-primary-700 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">Fibrosis Grade Distribution</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ChartDistribution data={dashboardData.gradeDistribution} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
