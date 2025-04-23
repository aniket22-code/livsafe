import { useState } from 'react';
import { Link } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { FileUpload } from '@/components/FileUpload';
import { GradeResult } from '@/components/GradeResult';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';

export default function GradeReport() {
  const { toast } = useToast();
  const [isGrading, setIsGrading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [gradeResult, setGradeResult] = useState<any>(null);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
  };

  const handleGradeImage = async () => {
    // Validate form
    if (!patientName || !patientAge || !patientGender || !uploadedFile) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please fill in all fields and upload an image',
      });
      return;
    }

    setIsGrading(true);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('image', uploadedFile);
      formData.append('patientName', patientName);
      formData.append('patientAge', patientAge);
      formData.append('patientGender', patientGender);

      // Send to backend
      const response = await fetch('/api/grade', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setGradeResult(data);
        toast({
          title: 'Grading complete',
          description: `Image graded as ${data.fibrosis.grade}`,
        });
      } else {
        throw new Error('Failed to grade image');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Grading failed',
        description: 'An error occurred while grading the image',
      });
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar userType="doctor" showAuthButtons={false} />
      
      <section className="py-12 bg-primary-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <Link href="/doctor/dashboard">
              <a className="inline-flex items-center text-primary-300 hover:text-white transition">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </a>
            </Link>
            <h1 className="text-3xl font-bold text-white mt-4">Create New Grade Report</h1>
          </div>
          
          <div className="bg-primary-700 rounded-xl border border-primary-600 p-6 md:p-8">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <Label htmlFor="patientName" className="text-primary-100">Patient Name</Label>
                  <Input 
                    id="patientName" 
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-xl text-white" 
                    placeholder="Patient name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientAge" className="text-primary-100">Age</Label>
                    <Input 
                      id="patientAge" 
                      type="number" 
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-xl text-white" 
                      placeholder="Age"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="patientGender" className="text-primary-100">Gender</Label>
                    <Select onValueChange={setPatientGender}>
                      <SelectTrigger className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-xl text-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-primary-900 border-primary-600 text-white">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <Label className="text-primary-100">Ultrasound Image</Label>
                <FileUpload onFileSelect={handleFileSelect} accept="image/*" />
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleGradeImage}
                  disabled={isGrading || !uploadedFile}
                  className="bg-gradient-to-r from-accent to-accent text-white font-medium py-6 px-8"
                >
                  {isGrading ? 'Processing...' : 'Grade Image'}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Grade Result */}
          {gradeResult && (
            <GradeResult
              patientInfo={{
                id: gradeResult.patientInfo.id,
                name: patientName,
                age: parseInt(patientAge),
                gender: patientGender,
                date: gradeResult.patientInfo.date,
              }}
              fibrosis={gradeResult.fibrosis}
              analysis={gradeResult.analysis}
            />
          )}
          
          {/* Floating Chat Button */}
          <div className="fixed bottom-6 right-6">
            <button className="w-14 h-14 bg-gradient-to-r from-secondary-500 to-accent rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition">
              <MessageCircle className="text-white h-6 w-6" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
