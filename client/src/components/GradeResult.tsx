import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FileText, Mail, Printer, Save } from 'lucide-react';

interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: string;
  date: string;
}

interface GradeResultProps {
  patientInfo: PatientInfo;
  fibrosis: {
    grade: 'F0' | 'F1' | 'F2' | 'F3' | 'F4';
    confidence: number;
  };
  analysis: string[];
}

export function GradeResult({ patientInfo, fibrosis, analysis }: GradeResultProps) {
  const { toast } = useToast();
  
  // Map fibrosis grades to progress percentage
  const gradeToPercentage = {
    'F0': 0,
    'F1': 25,
    'F2': 50,
    'F3': 75,
    'F4': 100
  };

  // Map fibrosis grades to color classes
  const gradeToColorClass = {
    'F0': 'text-blue-500',
    'F1': 'text-green-500',
    'F2': 'text-yellow-500',
    'F3': 'text-orange-500',
    'F4': 'text-red-500'
  };

  const gradeToProgressColor = {
    'F0': 'bg-blue-500',
    'F1': 'bg-green-500',
    'F2': 'bg-yellow-500',
    'F3': 'bg-orange-500',
    'F4': 'bg-red-500'
  };

  const handleDownloadPDF = async () => {
    try {
      // Create comprehensive PDF content
      const pdfContent = `
MEDICAL IMAGING REPORT
======================

Patient Information:
-------------------
ID: ${patientInfo.id}
Name: ${patientInfo.name}
Age: ${patientInfo.age}
Gender: ${patientInfo.gender}
Date: ${patientInfo.date}

Fibrosis Assessment:
------------------
Grade: ${fibrosis.grade}
Confidence: ${fibrosis.confidence}%
Severity: ${getFibrosisDescription(fibrosis.grade)}

AI Analysis:
-----------
${analysis.join('\n')}

Report Generated: ${new Date().toLocaleString()}
System: TR-LivSafe Medical Assistant
      `;
      
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical-report-${patientInfo.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'PDF Downloaded',
        description: `Medical report for ${patientInfo.name} has been downloaded`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not generate PDF report',
      });
    }
  };

  const handleEmailReport = () => {
    try {
      // Create email content
      const subject = `Medical Report - ${patientInfo.name} (${patientInfo.id})`;
      const body = `Dear Colleague,\n\nPlease find the medical imaging report for:\n\nPatient: ${patientInfo.name}\nID: ${patientInfo.id}\nDate: ${patientInfo.date}\nFibrosis Grade: ${fibrosis.grade}\nConfidence: ${fibrosis.confidence}%\n\nBest regards,\nTR-LivSafe Medical System`;
      
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl, '_blank');
      
      toast({
        title: 'Email Client Opened',
        description: 'Medical report email has been prepared',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Email Failed',
        description: 'Could not open email client',
      });
    }
  };

  const handlePrintReport = () => {
    try {
      // Create printable content
      const printContent = `
        <html>
          <head><title>Medical Report - ${patientInfo.name}</title></head>
          <body style="font-family: Arial, sans-serif; margin: 20px;">
            <h1>Medical Imaging Report</h1>
            <hr>
            <h2>Patient Information</h2>
            <p><strong>ID:</strong> ${patientInfo.id}</p>
            <p><strong>Name:</strong> ${patientInfo.name}</p>
            <p><strong>Age:</strong> ${patientInfo.age}</p>
            <p><strong>Gender:</strong> ${patientInfo.gender}</p>
            <p><strong>Date:</strong> ${patientInfo.date}</p>
            
            <h2>Assessment Results</h2>
            <p><strong>Fibrosis Grade:</strong> ${fibrosis.grade}</p>
            <p><strong>Confidence:</strong> ${fibrosis.confidence}%</p>
            
            <h2>Analysis</h2>
            ${analysis.map(item => `<p>${item}</p>`).join('')}
            
            <hr>
            <p><em>Generated: ${new Date().toLocaleString()}</em></p>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
      
      toast({
        title: 'Print Dialog Opened',
        description: 'Medical report is ready for printing',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Print Failed',
        description: 'Could not open print dialog',
      });
    }
  };

  const handleSaveReport = async () => {
    try {
      // Save to localStorage as well as download
      const reportData = {
        patient: patientInfo,
        assessment: fibrosis,
        analysis: analysis,
        timestamp: new Date().toISOString()
      };
      
      // Save to localStorage
      const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
      savedReports.push(reportData);
      localStorage.setItem('savedReports', JSON.stringify(savedReports));
      
      // Also create downloadable copy
      const jsonContent = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `saved-report-${patientInfo.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Report Saved',
        description: `Medical report for ${patientInfo.name} has been saved and downloaded`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save report',
      });
    }
  };

  const getFibrosisDescription = (grade: string): string => {
    const descriptions = {
      'F0': 'no fibrosis',
      'F1': 'mild fibrosis without septa',
      'F2': 'moderate fibrosis with few septa', 
      'F3': 'severe fibrosis with many septa',
      'F4': 'cirrhosis'
    };
    return descriptions[grade as keyof typeof descriptions] || 'fibrosis assessment';
  };

  return (
    <div className="mt-8 bg-primary-700 rounded-xl border border-primary-600 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Grading Result</h2>
        <span className="text-sm text-primary-300">ID: {patientInfo.id}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-primary-800 rounded-xl p-6 mb-4">
            <h3 className="text-lg font-medium text-primary-100 mb-4">Patient Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-primary-300">Name:</span>
                <span className="text-white font-medium">{patientInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-300">Age:</span>
                <span className="text-white font-medium">{patientInfo.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-300">Gender:</span>
                <span className="text-white font-medium">{patientInfo.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-300">Date:</span>
                <span className="text-white font-medium">{patientInfo.date}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-primary-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-primary-100 mb-4">Assessment</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-primary-300">Fibrosis Grade:</span>
                  <span className={`font-bold ${gradeToColorClass[fibrosis.grade]}`}>
                    {fibrosis.grade}
                  </span>
                </div>
                <Progress 
                  value={gradeToPercentage[fibrosis.grade]} 
                  className="h-2 bg-primary-600" 
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-primary-300">Confidence:</span>
                  <span className="font-medium text-white">{fibrosis.confidence}%</span>
                </div>
                <Progress 
                  value={fibrosis.confidence} 
                  className="h-2 bg-primary-600"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-primary-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-primary-100 mb-4">LLM Analysis</h3>
          <div className="text-primary-200 space-y-4">
            <p>{analysis[0]}</p>
            <ul className="list-disc pl-5 space-y-2">
              {analysis.slice(1, -1).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p>{analysis[analysis.length - 1]}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-wrap gap-4">
        <button 
          onClick={handleSaveReport}
          className="flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent/90 transition"
        >
          <Save className="h-5 w-5" />
          Save Report
        </button>
        <button 
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-primary-800 text-white px-6 py-2.5 rounded-lg font-medium border border-primary-600 hover:bg-primary-600 transition"
        >
          <FileText className="h-5 w-5" />
          Download PDF
        </button>
        <button 
          onClick={handlePrintReport}
          className="flex items-center gap-2 bg-primary-800 text-white px-6 py-2.5 rounded-lg font-medium border border-primary-600 hover:bg-primary-600 transition"
        >
          <Printer className="h-5 w-5" />
          Print
        </button>
        <button 
          onClick={handleEmailReport}
          className="flex items-center gap-2 bg-primary-800 text-white px-6 py-2.5 rounded-lg font-medium border border-primary-600 hover:bg-primary-600 transition"
        >
          <Mail className="h-5 w-5" />
          Email
        </button>
      </div>
    </div>
  );
}
