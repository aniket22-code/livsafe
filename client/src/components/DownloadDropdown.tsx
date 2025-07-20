import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DownloadDropdownProps {
  onDownloadPDF: () => void;
  onDownloadCSV: () => void;
}

export function DownloadDropdown({ onDownloadPDF, onDownloadCSV }: DownloadDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-primary-600 text-white hover:bg-primary-700">
          <Download className="mr-2 h-4 w-4" />
          Download
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-primary-700 border-primary-600">
        <DropdownMenuItem 
          onClick={onDownloadPDF}
          className="text-white hover:bg-primary-600 cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onDownloadCSV}
          className="text-white hover:bg-primary-600 cursor-pointer"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Download as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
