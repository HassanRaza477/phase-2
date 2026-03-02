import Link from 'next/link';
import { CheckCircle, Zap, Users, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FCFAEF]">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-[#0C5446]">Task</span>
            <span className="text-[#FF6700]">Flow</span>
          </h1>
          <p className="text-xl text-[#0C5446]/80 mb-8 max-w-2xl mx-auto">
            Beautiful, simple task management for productive people.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/signup" 
              className="group px-6 py-3 bg-[#FF6700] text-white rounded-lg font-medium hover:bg-[#e55c00] transition flex items-center"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-3 border-2 border-[#DBD0BD] text-[#0C5446] rounded-lg font-medium hover:bg-[#DBD0BD] transition"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-[#0C5446] mb-12">
          Why Choose TaskFlow?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<CheckCircle className="w-8 h-8 text-[#FF6700]" />}
            title="Simple Tasks"
            description="Create, edit, and organize tasks in seconds with our intuitive interface."
          />
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-[#FF6700]" />}
            title="Fast & Responsive"
            description="Works seamlessly on all your devices - desktop, tablet, or mobile."
          />
          <FeatureCard 
            icon={<Users className="w-8 h-8 text-[#FF6700]" />}
            title="Team Ready"
            description="Collaborate with your team in real-time and boost productivity."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#0C5446] rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-[#FCFAEF] mb-4">
            Ready to get productive?
          </h2>
          <p className="text-lg mb-6 text-[#DBD0BD]">
            Join thousands of users who love TaskFlow.
          </p>
          <Link 
            href="/signup" 
            className="inline-block px-8 py-3 bg-[#FF6700] text-white rounded-lg font-medium hover:bg-[#e55c00] transition"
          >
            Sign Up Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DBD0BD] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#0C5446]/60">
          <p>© 2024 TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="p-6 bg-white rounded-xl border border-[#DBD0BD] hover:shadow-lg transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-[#0C5446] mb-2">{title}</h3>
      <p className="text-[#0C5446]/70">{description}</p>
    </div>
  );
}