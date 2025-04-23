import { Progress } from '@/components/ui/progress';

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
        <button className="flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent/90 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Save Report
        </button>
        <button className="flex items-center gap-2 bg-primary-800 text-white px-6 py-2.5 rounded-lg font-medium border border-primary-600 hover:bg-primary-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print
        </button>
        <button className="flex items-center gap-2 bg-primary-800 text-white px-6 py-2.5 rounded-lg font-medium border border-primary-600 hover:bg-primary-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          Email
        </button>
      </div>
    </div>
  );
}
