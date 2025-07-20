import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { UserMenu } from '@/components/UserMenu';
import { StatCard } from '@/components/StatCard';
import { DoctorList, Doctor } from '@/components/DoctorList';
import { ChartDistribution } from '@/components/ChartDistribution';
import { Users, ChartLine, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizationAPI } from '@/lib/api';

export default function OrganizationDashboard() {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await organizationAPI.getDashboard();
        setDashboardData(data);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error loading dashboard',
          description: error.message || 'Failed to load dashboard data',
        });
        
        // Fallback to mock data if API fails
        setDashboardData({
          stats: {
            totalDoctors: 0,
            doctorsChange: '+0 from last month',
            totalRecordsToday: 0,
            recordsTodayChange: '+0 from yesterday',
            totalRecordsMonth: 0,
            recordsMonthChange: '+0 from last month',
          },
          doctors: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const handleRemoveDoctor = async (doctorId: string) => {
    try {
      organizationAPI.removeDoctor(doctorId);
      toast({
        title: 'Doctor removed',
        description: 'Doctor has been removed from your organization',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to remove doctor',
        description: 'An error occurred while removing the doctor',
      });
    }
  };

  const handleAddDoctor = async (doctorData: any) => {
    try {
      organizationAPI.addDoctor(doctorData);
      toast({
        title: 'Doctor added',
        description: 'New doctor has been added to your organization',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to add doctor',
        description: 'An error occurred while adding the new doctor',
      });
    }
  };

  // Show loading state
  if (loading || !dashboardData) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar userType="organization" showAuthButtons={false} />
        <section className="py-12 bg-primary-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white">Organization Dashboard</h1>
              <UserMenu />
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="text-white text-xl">Loading dashboard...</div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar userType="organization" showAuthButtons={false} />
      
      <section className="py-12 bg-primary-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Organization Dashboard</h1>
            <UserMenu />
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Doctors"
              value={dashboardData.stats.totalDoctors}
              change={dashboardData.stats.doctorsChange}
              icon={<Users className="h-5 w-5" />}
              iconColor="text-secondary-500"
              iconBgColor="bg-secondary-500 bg-opacity-20"
            />
            <StatCard
              title="Records Today"
              value={dashboardData.stats.totalRecordsToday}
              change={dashboardData.stats.recordsTodayChange}
              icon={<CalendarDays className="h-5 w-5" />}
              iconColor="text-accent"
              iconBgColor="bg-accent bg-opacity-20"
            />
            <StatCard
              title="Records This Month"
              value={dashboardData.stats.totalRecordsMonth}
              change={dashboardData.stats.recordsMonthChange}
              icon={<ChartLine className="h-5 w-5" />}
              iconColor="text-green-500"
              iconBgColor="bg-green-500 bg-opacity-20"
            />
          </div>
          
          {/* Doctors List */}
          <DoctorList
            doctors={dashboardData.doctors}
            onRemoveDoctor={handleRemoveDoctor}
            onAddDoctor={handleAddDoctor}
          />
        </div>
      </section>
    </div>
  );
}
