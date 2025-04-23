import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { UserMenu } from '@/components/UserMenu';
import { StatCard } from '@/components/StatCard';
import { DoctorList, Doctor } from '@/components/DoctorList';
import { ChartDistribution } from '@/components/ChartDistribution';
import { Users, ChartLine, CalendarDays } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function OrganizationDashboard() {
  const { toast } = useToast();

  // Fetch organization dashboard data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/organization/dashboard'],
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
      totalDoctors: 15,
      doctorsChange: '+2 from last month',
      totalRecordsToday: 42,
      recordsTodayChange: '+8 from yesterday',
      totalRecordsMonth: 1247,
      recordsMonthChange: '+213 from last month',
    },
    doctors: [
      {
        id: 'DOC-001',
        name: 'Dr. John Smith',
        email: 'john.smith@hospital.com',
        specialization: 'Radiology',
        recordCount: 245,
      },
      {
        id: 'DOC-002',
        name: 'Dr. Emily Wong',
        email: 'emily.wong@hospital.com',
        specialization: 'Hepatology',
        recordCount: 189,
      },
      {
        id: 'DOC-003',
        name: 'Dr. Michael Johnson',
        email: 'michael.johnson@hospital.com',
        specialization: 'Gastroenterology',
        recordCount: 312,
      },
      {
        id: 'DOC-004',
        name: 'Dr. Sarah Palmer',
        email: 'sarah.palmer@hospital.com',
        specialization: 'Internal Medicine',
        recordCount: 178,
      },
    ] as Doctor[],
    gradeDistribution: [
      { name: 'F0', value: 221, color: '#3b82f6' },
      { name: 'F1', value: 389, color: '#22c55e' },
      { name: 'F2', value: 427, color: '#eab308' },
      { name: 'F3', value: 189, color: '#f97316' },
      { name: 'F4', value: 21, color: '#ef4444' },
    ],
  };

  const handleRemoveDoctor = async (doctorId: string) => {
    try {
      await apiRequest('DELETE', `/api/organization/doctors/${doctorId}`, {});
      toast({
        title: 'Doctor removed',
        description: 'Doctor has been removed from your organization',
      });
      // Refetch data
      // queryClient.invalidateQueries({ queryKey: ['/api/organization/dashboard'] });
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
      await apiRequest('POST', '/api/organization/doctors', doctorData);
      toast({
        title: 'Doctor added',
        description: 'New doctor has been added to your organization',
      });
      // Refetch data
      // queryClient.invalidateQueries({ queryKey: ['/api/organization/dashboard'] });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to add doctor',
        description: 'An error occurred while adding the new doctor',
      });
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar userType="organization" showAuthButtons={false} />
      
      <section className="py-12 bg-primary-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Organization Dashboard</h1>
            <UserMenu initials="OH" />
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
          
          {/* Distribution Chart */}
          <div className="mb-8">
            <ChartDistribution data={dashboardData.gradeDistribution} />
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
