import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { UserMenu } from '@/components/UserMenu';
import { StatCard } from '@/components/StatCard';
import { RecordsTable, Record } from '@/components/RecordsTable';
import { ChartDistribution } from '@/components/ChartDistribution';
import { DownloadDropdown } from '@/components/DownloadDropdown';
import { useToast } from '@/hooks/use-toast';
import { doctorAPI, patientAPI } from '@/lib/api';
import { FolderOpen, ChartLine, CheckCircle2, Plus, PieChart, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function DoctorDashboard() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [showChart, setShowChart] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await doctorAPI.getDashboard();
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
            totalRecords: 0,
            totalChange: '+0 from last month',
            monthlyRecords: 0,
            monthlyChange: '+0 from previous month',
            accuracy: 0,
            accuracyChange: '+0% from last month',
          },
          recentRecords: [],
          gradeDistribution: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setRefreshing(true);
    try {
      const data = await doctorAPI.getDashboard();
      setDashboardData(data);
      toast({
        title: 'Dashboard Refreshed',
        description: 'Latest data has been loaded',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Refresh Failed',
        description: error.message || 'Failed to refresh dashboard',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewRecord = (id: string) => {
    setLocation(`/doctor/record/${id}`);
  };

  const handleEditRecord = (id: string) => {
    setLocation(`/doctor/record/${id}/edit`);
  };

  const handleDownloadPDF = async () => {
    try {
      // Create PDF content with dashboard data
      const pdfContent = `
Doctor Dashboard Report
======================

Stats:
- Total Records: ${dashboardData.stats.totalRecords}
- Monthly Records: ${dashboardData.stats.monthlyRecords}
- Accuracy: ${dashboardData.stats.accuracy}%

Recent Records:
${dashboardData.recentRecords.map((record: any, index: number) => 
  `${index + 1}. ${record.patientName} - ${record.grade} (${record.date})`
).join('\n')}

Generated: ${new Date().toLocaleDateString()}
      `;
      
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Dashboard report has been downloaded',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not generate PDF report',
      });
    }
  };

  const handleDownloadCSV = async () => {
    try {
      // Create CSV content
      const csvHeader = 'Record ID,Patient Name,Date,Grade,Confidence\n';
      const csvRows = dashboardData.recentRecords.map((record: any) => 
        `${record.id},"${record.patientName}",${record.date},${record.grade},${record.confidence || 'N/A'}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-records-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'CSV Downloaded',
        description: 'Dashboard data has been exported to CSV',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Could not export CSV file',
      });
    }
  };

  const handleDownloadRecord = async (id: string) => {
    try {
      // Find the specific record
      const record = dashboardData.recentRecords.find((r: any) => r.id === id);
      if (!record) {
        throw new Error('Record not found');
      }
      
      // Create individual record download
      const recordContent = `
Medical Record: ${record.id}
==============================

Patient: ${record.patientName}
Date: ${record.date}
Grade: ${record.grade}
Confidence: ${record.confidence || 'N/A'}%

Generated: ${new Date().toLocaleString()}
      `;
      
      const blob = new Blob([recordContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `record-${record.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Record Downloaded',
        description: `Record ${record.id} has been downloaded`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not download record',
      });
    }
  };

  // Show loading state
  if (loading || !dashboardData) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar userType="doctor" showAuthButtons={false} />
        <section className="py-12 bg-primary-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white">Doctor Dashboard</h1>
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
      <Navbar userType="doctor" showAuthButtons={false} />
      
      <section className="py-12 bg-primary-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Doctor Dashboard</h1>
            <UserMenu />
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
            <Button 
              variant="outline" 
              className="border-primary-600"
              onClick={refreshDashboard}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <DownloadDropdown 
              onDownloadPDF={handleDownloadPDF}
              onDownloadCSV={handleDownloadCSV}
            />
          </div>
          
          {/* Recent Records */}
          <RecordsTable
            records={dashboardData.recentRecords}
            onViewRecord={handleViewRecord}
            onEditRecord={handleEditRecord}
            onDownloadRecord={handleDownloadRecord}
            showConfidence={true}
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
