import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { RecordsTable, Record } from '@/components/RecordsTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search as SearchIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function Search() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);

  // Fetch records from API
  const { data: records, isLoading, isError } = useQuery({
    queryKey: ['/api/records'],
    retry: 1,
  });

  if (isError) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to load records',
    });
  }

  // Sample records data (would come from the API in real implementation)
  const recordsData = records || [
    {
      id: 'LIV-2023042',
      patientName: 'Robert Williams',
      date: 'May 8, 2023',
      grade: 'F3',
      confidence: 89,
    },
    {
      id: 'LIV-2023035',
      patientName: 'Emily Parker',
      date: 'May 3, 2023',
      grade: 'F0',
      confidence: 95,
    },
    {
      id: 'LIV-2023051',
      patientName: 'Sarah Johnson',
      date: 'May 12, 2023',
      grade: 'F1',
      confidence: 92,
    },
    {
      id: 'LIV-2023047',
      patientName: 'Michael Chen',
      date: 'May 10, 2023',
      grade: 'F2',
      confidence: 87,
    },
    {
      id: 'LIV-2023060',
      patientName: 'David Thompson',
      date: 'May 15, 2023',
      grade: 'F4',
      confidence: 91,
    },
  ] as Record[];

  // Filter records based on search term and filters
  useEffect(() => {
    let filtered = [...recordsData];
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.id.toLowerCase().includes(searchLower) ||
          record.patientName.toLowerCase().includes(searchLower) ||
          record.date.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter((record) => record.grade === gradeFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.date).getTime();
        
        switch (dateFilter) {
          case 'today':
            return recordDate >= today;
          case 'week':
            const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
            return recordDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
            return recordDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime();
            return recordDate >= yearAgo;
          default:
            return true;
        }
      });
    }
    
    setFilteredRecords(filtered);
  }, [searchTerm, gradeFilter, dateFilter, records]);

  const handleViewRecord = (id: string) => {
    console.log(`View record ${id}`);
  };

  const handleEditRecord = (id: string) => {
    console.log(`Edit record ${id}`);
  };

  const handleDownloadRecord = (id: string) => {
    console.log(`Download record ${id}`);
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar userType="doctor" showAuthButtons={false} />
      
      <section className="py-12 bg-primary-800">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-white mb-8">Search Records</h1>
          
          <div className="mb-8">
            <div className="relative">
              <Input 
                type="text" 
                className="w-full px-5 py-4 pr-12 bg-primary-700 border border-primary-600 rounded-xl text-white" 
                placeholder="Search by Patient ID, Name, or Date"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <SearchIcon className="text-primary-400 h-5 w-5" />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center">
                <Label className="mr-2 text-primary-300 text-sm">Filter by:</Label>
                <Select onValueChange={setGradeFilter} defaultValue="all">
                  <SelectTrigger className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-1.5 text-white text-sm">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent className="bg-primary-900 border-primary-600 text-white">
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="F0">F0</SelectItem>
                    <SelectItem value="F1">F1</SelectItem>
                    <SelectItem value="F2">F2</SelectItem>
                    <SelectItem value="F3">F3</SelectItem>
                    <SelectItem value="F4">F4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center">
                <Label className="mr-2 text-primary-300 text-sm">Date:</Label>
                <Select onValueChange={setDateFilter} defaultValue="all">
                  <SelectTrigger className="bg-primary-700 border border-primary-600 rounded-lg px-3 py-1.5 text-white text-sm">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent className="bg-primary-900 border-primary-600 text-white">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Search Results */}
          <RecordsTable
            records={filteredRecords}
            showConfidence={true}
            title="Search Results"
            isSearchResult={true}
            onViewRecord={handleViewRecord}
            onEditRecord={handleEditRecord}
            onDownloadRecord={handleDownloadRecord}
          />
        </div>
      </section>
    </div>
  );
}
