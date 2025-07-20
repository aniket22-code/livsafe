import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authAPI } from '@/lib/api';

const doctorFormSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  specialization: z.string().min(1, 'Specialization is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const organizationFormSchema = z.object({
  orgName: z.string().min(2, 'Organization name is required'),
  orgEmail: z.string().email('Invalid email address'),
  orgType: z.string().min(1, 'Organization type is required'),
  orgPassword: z.string().min(6, 'Password must be at least 6 characters'),
  orgConfirmPassword: z.string(),
}).refine((data) => data.orgPassword === data.orgConfirmPassword, {
  message: 'Passwords do not match',
  path: ['orgConfirmPassword'],
});

export default function Signup() {
  const [accountType, setAccountType] = useState<'doctor' | 'organization'>('doctor');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const doctorForm = useForm<z.infer<typeof doctorFormSchema>>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      specialization: '',
      password: '',
      confirmPassword: '',
    },
  });

  const organizationForm = useForm<z.infer<typeof organizationFormSchema>>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      orgName: '',
      orgEmail: '',
      orgType: '',
      orgPassword: '',
      orgConfirmPassword: '',
    },
  });

  async function onDoctorSubmit(values: z.infer<typeof doctorFormSchema>) {
    setIsLoading(true);
    try {
      const result = await authAPI.signupDoctor({
        fullName: `${values.firstName} ${values.lastName}`,
        email: values.email,
        specialty: values.specialization,
        password: values.password,
      });

      toast({
        title: 'Account created',
        description: 'Your doctor account has been created successfully!',
      });
      setLocation('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: error.message || 'An error occurred during signup',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onOrganizationSubmit(values: z.infer<typeof organizationFormSchema>) {
    setIsLoading(true);
    try {
      const result = await authAPI.signupOrganization({
        name: values.orgName,
        email: values.orgEmail,
      });

      toast({
        title: 'Account created',
        description: 'Your organization account has been created successfully!',
      });
      setLocation('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: error.message || 'An error occurred during signup',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      <section id="signup" className="py-12 bg-primary-700">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-primary-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Create Your Account</h2>
            
            <div className="flex items-center justify-center mb-8">
              <div className="flex p-1 bg-primary-900 rounded-lg">
                <button 
                  onClick={() => setAccountType('doctor')}
                  className={`px-6 py-2.5 rounded-lg font-medium ${
                    accountType === 'doctor'
                      ? 'bg-accent text-white'
                      : 'text-primary-200 hover:bg-primary-700'
                  }`}
                >
                  Doctor
                </button>
                <button 
                  onClick={() => setAccountType('organization')}
                  className={`px-6 py-2.5 rounded-lg font-medium ${
                    accountType === 'organization'
                      ? 'bg-accent text-white'
                      : 'text-primary-200 hover:bg-primary-700'
                  }`}
                >
                  Organization
                </button>
              </div>
            </div>
            
            {accountType === 'doctor' ? (
              <Form {...doctorForm}>
                <form onSubmit={doctorForm.handleSubmit(onDoctorSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField
                      control={doctorForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary-100">First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              className="bg-primary-900 border border-primary-600 rounded-xl text-black"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={doctorForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary-100">Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              className="bg-primary-900 border border-primary-600 rounded-xl text-black"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={doctorForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary-100">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="doctor@hospital.com"
                            className="bg-primary-900 border border-primary-600 rounded-xl text-black"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={doctorForm.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary-100">Specialization</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-primary-900 border border-primary-600 rounded-xl text-white">
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-black border border-primary-600 text-white">
                            <SelectItem value="radiology">Radiology</SelectItem>
                            <SelectItem value="hepatology">Hepatology</SelectItem>
                            <SelectItem value="gastroenterology">Gastroenterology</SelectItem>
                            <SelectItem value="internal">Internal Medicine</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField
                      control={doctorForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary-100">Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••••"
                              className="bg-primary-900 border border-primary-600 rounded-xl text-black"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={doctorForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary-100">Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••••"
                              className="bg-primary-900 border border-primary-600 rounded-xl text-black"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-accent to-accent text-white font-medium py-6 mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...organizationForm}>
                <form onSubmit={organizationForm.handleSubmit(onOrganizationSubmit)} className="space-y-4">
                  <FormField
                    control={organizationForm.control}
                    name="orgName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary-100">Organization Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=" Hospital"
                            className="bg-primary-900 border border-primary-600 rounded-xl text-black"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={organizationForm.control}
                    name="orgEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary-100">Organization Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="admin@hospital.com"
                            className="bg-primary-900 border border-primary-600 rounded-xl text-black"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={organizationForm.control}
                    name="orgType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary-100">Organization Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-primary-900 border border-primary-600 rounded-xl text-white">
                              <SelectValue placeholder="Select organization type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-black border border-primary-600 text-white">
                            <SelectItem value="hospital">Hospital</SelectItem>
                            <SelectItem value="clinic">Clinic</SelectItem>
                            <SelectItem value="research">Research Institution</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField
                      control={organizationForm.control}
                      name="orgPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary-100">Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••••"
                              className="bg-primary-900 border border-primary-600 rounded-xl text-black"
                              
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={organizationForm.control}
                      name="orgConfirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary-100">Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••••"
                              className="bg-primary-900 border border-primary-600 rounded-xl text-white"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-accent to-accent text-white font-medium py-6 mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>
            )}
            
            <div className="mt-6 text-center text-sm text-primary-300">
              Already have an account?{' '}
              <Link href="/login">
                <a className="text-primary-100 font-medium hover:text-white">Login</a>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
