import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const [_, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        toast({
          title: 'Login successful',
          description: 'Redirecting to dashboard...',
        });
        // Redirect based on user type
        setLocation('/doctor/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: 'Invalid email or password',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'An error occurred during login',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      <section className="py-12 bg-primary-800 rounded-t-3xl mt-8">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-primary-700 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Login to Your Account</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary-100">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="doctor@example.com"
                          type="email"
                          className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-xl text-white focus:ring-2 focus:ring-secondary-500 focus:outline-none"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
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
                          {...field}
                          placeholder="••••••••••"
                          type="password"
                          className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-xl text-white focus:ring-2 focus:ring-secondary-500 focus:outline-none"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                      <div className="flex justify-end mt-2">
                        <a href="#" className="text-sm text-primary-300 hover:text-primary-200">
                          Forgot password?
                        </a>
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-accent to-accent text-white font-medium py-6 mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
                
                <div className="mt-6 text-center text-sm text-primary-300">
                  Don't have an account?{' '}
                  <Link href="/signup">
                    <a className="text-primary-100 font-medium hover:text-white">Sign up</a>
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}
