import { Link } from 'wouter';
import { Eye, Edit, Download } from 'lucide-react';

export interface Record {
  id: string;
  patientName: string;
  date: string;
  grade: 'F0' | 'F1' | 'F2' | 'F3' | 'F4';
  confidence?: number;
}

interface RecordsTableProps {
  records: Record[];
  showConfidence?: boolean;
  title?: string;
  isSearchResult?: boolean;
  onViewRecord?: (id: string) => void;
  onEditRecord?: (id: string) => void;
  onDownloadRecord?: (id: string) => void;
}

export function RecordsTable({
  records,
  showConfidence = false,
  title = 'Recent Records',
  isSearchResult = false,
  onViewRecord,
  onEditRecord,
  onDownloadRecord
}: RecordsTableProps) {
  return (
    <div className="bg-primary-700 rounded-xl border border-primary-600 overflow-hidden">
      <div className="p-6 border-b border-primary-600 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {isSearchResult && (
          <span className="text-primary-300 text-sm">{records.length} records found</span>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-primary-600">
          <thead className="bg-primary-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Patient ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Grade</th>
              {showConfidence && (
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Confidence</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-primary-700 divide-y divide-primary-600">
            {records.length > 0 ? (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-primary-600">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{record.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{record.patientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-200">{record.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full grade-${record.grade.toLowerCase()}`}>
                      {record.grade}
                    </span>
                  </td>
                  {showConfidence && record.confidence && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary-200">{record.confidence}%</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-3">
                      <button 
                        className="text-primary-300 hover:text-primary-100"
                        onClick={() => onViewRecord && onViewRecord(record.id)}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        className="text-primary-300 hover:text-primary-100"
                        onClick={() => onEditRecord && onEditRecord(record.id)}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      {isSearchResult && onDownloadRecord && (
                        <button 
                          className="text-primary-300 hover:text-primary-100"
                          onClick={() => onDownloadRecord(record.id)}
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showConfidence ? 6 : 5} className="px-6 py-4 text-center text-primary-300">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {records.length > 0 && (
        <div className="bg-primary-700 px-6 py-3 border-t border-primary-600 flex items-center justify-between">
          <button className="text-sm font-medium text-primary-300 hover:text-white transition">
            Previous
          </button>
          <span className="text-sm text-primary-200">Page 1 of 1</span>
          <button className="text-sm font-medium text-primary-300 hover:text-white transition">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
