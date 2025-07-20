import { Link } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="order-2 md:order-1">
              <div className="inline-block px-4 py-1.5 bg-primary-100 bg-opacity-20 rounded-full text-primary-100 font-medium text-sm mb-6">
                #SaveLivers
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white">TR - LivSafe</h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg">
                Powerful ultrasound grading assistant supported by a medical LLM.
              </p>
              
              <div className="flex gap-4">
                <Link href="/login">
                  <Button className="bg-white text-black hover:bg-gray-100">
                    Login
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-2 h-4 w-4"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" className="border-white text-black bg-white hover:bg-gray-100">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="order-1 md:order-2 relative">
              <div className="bg-gradient-to-br from-primary rounded-3xl overflow-hidden">
                <div className="clip-path-hero">
                  <img 
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                    alt="Medical Professional" 
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
