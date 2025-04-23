import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  recordCount: number;
}

interface DoctorListProps {
  doctors: Doctor[];
  onRemoveDoctor: (doctorId: string) => void;
  onAddDoctor: (doctorData: any) => void;
}

const addDoctorSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  specialization: z.string().min(2, "Specialization is required"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

export function DoctorList({ doctors, onRemoveDoctor, onAddDoctor }: DoctorListProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof addDoctorSchema>>({
    resolver: zodResolver(addDoctorSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      specialization: '',
      password: ''
    }
  });

  const onSubmit = (data: z.infer<typeof addDoctorSchema>) => {
    onAddDoctor(data);
    form.reset();
    setAddDialogOpen(false);
  };

  return (
    <div className="bg-primary-700 rounded-xl border border-primary-600">
      <div className="p-6 border-b border-primary-600 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Doctors</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-white">
              <UserPlus className="mr-2 h-4 w-4" /> Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-primary-800 border-primary-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Doctor</DialogTitle>
              <DialogDescription className="text-primary-300">
                Fill in the details to add a new doctor to your organization.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary-100">First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
                            className="bg-primary-900 border-primary-600 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary-100">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            className="bg-primary-900 border-primary-600 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary-100">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="doctor@hospital.com"
                          className="bg-primary-900 border-primary-600 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary-100">Specialization</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Radiology"
                          className="bg-primary-900 border-primary-600 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary-100">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-primary-900 border-primary-600 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddDialogOpen(false)}
                    className="border-primary-600 text-primary-100"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-accent hover:bg-accent/90">
                    Add Doctor
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-primary-600">
          <thead className="bg-primary-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Specialization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Records</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-primary-700 divide-y divide-primary-600">
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-primary-600">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{doctor.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{doctor.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-200">{doctor.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-200">{doctor.specialization}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-200">{doctor.recordCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-primary-800 border-primary-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Remove Doctor</AlertDialogTitle>
                          <AlertDialogDescription className="text-primary-300">
                            Are you sure you want to remove {doctor.name} from your organization? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-primary-700 border-primary-600 text-primary-100">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => onRemoveDoctor(doctor.id)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-primary-300">
                  No doctors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
