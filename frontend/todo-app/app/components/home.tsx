import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  CheckCircle,
  Zap,
  Users,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Github,
  PenTool,
  Layers,
  Target,
  ChevronUp,
  Mail,
  Calendar,
  Circle,
  Star
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

export default function LandingPage() {
  // Scroll progress for progress bar
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // Back-to-top visibility
  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll function
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Animation variants

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };


  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAEF] overflow-x-hidden relative">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6700] to-[#0C5446] z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Subtle background pattern (dots) */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#0C5446 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px',
        opacity: 0.03
      }} />

      {/* Sticky Navbar with backdrop blur */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FCFAEF]/80 border-b border-[#DBD0BD]">

      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-28 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#0C5446]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#FF6700]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl max-h-3xl bg-[#DBD0BD]/20 rounded-full blur-3xl" />
        </div>

        {/* Floating icons animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1, rotate: 10 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute top-10 right-10 text-[#0C5446] hidden lg:block"
        >
          <CheckCircle size={32} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1, rotate: -10 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 0.5 }}
          className="absolute bottom-10 left-10 text-[#FF6700] hidden lg:block"
        >
          <Calendar size={40} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.15, y: -20 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute top-1/3 left-5 text-[#0C5446] hidden lg:block"
        >
          <Star size={24} />
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex-1 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block px-4 py-2 bg-[#0C5446]/10 text-[#0C5446] rounded-full text-sm font-medium mb-6"
            >
              ✨ New: TaskFlow 2.0 is here
            </motion.span>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#0C5446] to-[#FF6700] bg-clip-text text-transparent">
                TaskFlow
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
              Beautiful, simple task management for productive people.
              <span className="block mt-2 text-[#0C5446]/70">Stay organized, achieve more, and feel great about your progress.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-stretch sm:items-center">
              <RippleButton className="flex-1 sm:flex-none">
                <Link
                  href="/signup"
                  className="group w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 bg-gradient-to-r from-[#FF6700] to-[#e55c00] text-white rounded-lg font-medium hover:shadow-xl hover:shadow-[#FF6700]/20 transition-all"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
              </RippleButton>
              <RippleButton className="flex-1 sm:flex-none">
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 border-2 border-[#DBD0BD] text-[#0C5446] rounded-lg font-medium hover:bg-[#DBD0BD] hover:border-[#DBD0BD] hover:shadow-md transition-all"
                >
                  Login
                </Link>
              </RippleButton>
            </div>

            {/* Trusted by small text */}
            <p className="mt-8 text-sm text-gray-500 flex items-center justify-center lg:justify-start gap-2">
              <span>Trusted by 10,000+ teams</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>Free forever</span>
            </p>
          </motion.div>

          {/* Right content - App mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex-1 w-full max-w-md lg:max-w-none"
          >
            <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/50">
              {/* Mockup header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <div className="text-sm font-medium text-[#0C5446]">Today</div>
                <div className="text-[#FF6700]">
                  <Calendar size={20} />
                </div>
              </div>

              {/* Task list mockup */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-[#0C5446]" size={20} />
                    <span className="text-gray-700">Design review</span>
                  </div>
                  <span className="text-xs text-gray-400">9:00 AM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <Circle className="text-gray-300" size={20} />
                    <span className="text-gray-700">Team meeting</span>
                  </div>
                  <span className="text-xs text-gray-400">11:30 AM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#0C5446]/5 to-transparent rounded-xl">
                  <div className="flex items-center gap-3">
                    <Circle className="text-gray-300" size={20} />
                    <span className="text-gray-700">Update docs</span>
                  </div>
                  <span className="text-xs text-[#FF6700] font-medium">Due today</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-[#0C5446]" size={20} />
                    <span className="text-gray-700 line-through">Morning workout</span>
                  </div>
                  <span className="text-xs text-gray-400">Done</span>
                </div>
              </div>

              {/* Add task button mockup */}
              <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                <button className="w-full py-3 text-left text-gray-400 hover:text-[#FF6700] transition-colors flex items-center gap-2">
                  <span className="text-xl">+</span>
                  <span>Add a new task...</span>
                </button>
              </div>

              {/* Floating card for visual interest */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-3 hidden sm:block"
              >
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-400 fill-yellow-400" size={16} />
                  <span className="text-xs font-medium">3 completed</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

















      {/* Features Section */}
      <section id="features" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-3xl font-bold text-center text-[#0C5446] mb-12"
        >
          Why Choose TaskFlow?
        </motion.h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
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
        </motion.div>
      </section>








      {/* How It Works Section */}
      <section id="how-it-works" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-3xl font-bold text-center text-[#0C5446] mb-12"
        >
          How It Works
        </motion.h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          <HowItWorksCard
            icon={<PenTool className="w-8 h-8 text-[#FF6700]" />}
            step="01"
            title="Create Tasks"
            description="Quickly add tasks with titles, descriptions, and due dates."
          />
          <HowItWorksCard
            icon={<Layers className="w-8 h-8 text-[#FF6700]" />}
            step="02"
            title="Organize"
            description="Group tasks into projects and set priorities effortlessly."
          />
          <HowItWorksCard
            icon={<Target className="w-8 h-8 text-[#FF6700]" />}
            step="03"
            title="Achieve Goals"
            description="Track progress and celebrate completions with your team."
          />
        </motion.div>
      </section>





      {/* Testimonials Section with Animated Counters */}
      <section id="testimonials" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#0C5446]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#FF6700]/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/60 shadow-xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center text-[#0C5446] mb-4">
            Loved by Teams
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed their productivity.
          </p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8 mb-12"
          >
            <TestimonialCard
              quote="TaskFlow transformed how our remote team collaborates. So intuitive and powerful!"
              author="Alex Rivera"
              role="Product Manager, Stackly"
              avatarInitial="AR"
              rating={5}
            />
            <TestimonialCard
              quote="The simplest task manager I've ever used. No clutter, just pure productivity."
              author="Jamie Chen"
              role="Freelance Designer"
              avatarInitial="JC"
              rating={5}
            />
            {/* Optionally add a third card that spans or adjust grid */}
          </motion.div>

          {/* Animated Counters with better layout */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-12 md:gap-16 mt-8 pt-8 border-t border-[#DBD0BD]/50"
          >
            <Counter value={15000} label="Happy Users" suffix="+" />
            <Counter value={800} label="Teams" suffix="+" />
            <Counter value={65} label="Countries" suffix="+" />
            <Counter value={4.9} label="App Store Rating" suffix="/5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-40 right-10 w-72 h-72 bg-[#0C5446]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-10 w-72 h-72 bg-[#FF6700]/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#0C5446] mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {/* Free Plan */}
          <PricingCard
            name="Free"
            price={0}
            description="Perfect for individuals getting started."
            features={[
              "Up to 5 projects",
              "Basic task management",
              "Mobile & desktop access",
              "Community support"
            ]}
            isPopular={false}
            ctaText="Get Started"
            ctaLink="/signup"
          />

          {/* Pro Plan (Popular) */}
          <PricingCard
            name="Pro"
            price={12}
            description="For professionals and small teams."
            features={[
              "Unlimited projects",
              "Advanced task features",
              "Team collaboration",
              "Priority support",
              "File attachments"
            ]}
            isPopular={true}
            ctaText="Start Free Trial"
            ctaLink="/signup?plan=pro"
          />

          {/* Enterprise Plan */}
          <PricingCard
            name="Enterprise"
            price={49}
            description="Custom solutions for large organizations."
            features={[
              "Everything in Pro",
              "Dedicated account manager",
              "SSO & advanced security",
              "Custom onboarding",
              "SLA guarantee"
            ]}
            isPopular={false}
            ctaText="Contact Sales"
            ctaLink="/contact"
          />
        </motion.div>

        {/* Additional trust element */}
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center text-gray-500 mt-12 text-sm"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </section>










      {/* CTA Section with Split Layout and Pulse Animation */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#0C5446]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#FF6700]/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="relative bg-gradient-to-br from-[#0C5446] to-[#0a463a] rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden border border-white/10"
        >
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.1\'/%3E%3C/svg%3E")' }} />

          {/* Floating orbs */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-10 -right-10 w-40 h-40 bg-[#FF6700]/20 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FCFAEF]/10 rounded-full blur-2xl"
          />

          <div className="relative grid md:grid-cols-2 gap-8 items-center z-10">
            {/* Left side text & button */}
            <div className="text-center md:text-left space-y-6">
              <motion.h2
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold text-[#FCFAEF] leading-tight"
              >
                Ready to get productive?
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-[#DBD0BD] font-light leading-relaxed max-w-lg mx-auto md:mx-0"
              >
                Join thousands of users who love TaskFlow. Start for free today – no credit card required.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="inline-block w-full sm:w-auto"
              >
                <RippleButton>
                  <Link
                    href="/signup"
                    className="group inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 bg-[#FF6700] text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl hover:bg-[#e55c00] transition-all duration-300 gap-2"
                  >
                    Sign Up Free – It's Free!
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </RippleButton>
              </motion.div>

              {/* Trust badge */}
              <motion.div
                variants={fadeInUp}
                className="flex items-center justify-center md:justify-start gap-2 text-[#DBD0BD] text-sm"
              >
                <span>✨ Free forever</span>
                <span className="w-1 h-1 bg-[#DBD0BD]/50 rounded-full" />
                <span>🚀 No credit card</span>
              </motion.div>
            </div>

            {/* Right side testimonial card */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/20 shadow-xl"
            >
              {/* Star rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#FF6700] text-[#FF6700]" />
                ))}
              </div>

              <p className="text-[#FCFAEF] text-lg italic mb-6 leading-relaxed">
                "The best task manager I've ever used. Increased my productivity by 3x!"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#FF6700] to-[#e55c00] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  JD
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">Jane Doe</p>
                  <p className="text-[#DBD0BD] text-sm">CEO, TechStart</p>
                  <p className="text-[#FCFAEF]/60 text-xs mt-1">Verified user</p>
                </div>
              </div>

              {/* Decorative quote mark */}
              <div className="absolute bottom-4 right-6 text-6xl text-white/10 font-serif">"</div>
            </motion.div>
          </div>
        </motion.div>
      </section>










      {/* Footer with Newsletter */}
      <footer className="relative pt-20 pb-10 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6700] to-transparent" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0C5446]/5 rounded-full blur-3xl" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FF6700]/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid md:grid-cols-4 gap-8 lg:gap-12 mb-12"
          >
            {/* Brand column */}
            <motion.div variants={fadeInUp} className="col-span-1 md:col-span-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#0C5446] to-[#FF6700] bg-clip-text text-transparent mb-4">
                TaskFlow
              </h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed max-w-xs">
                Beautiful, simple task management for productive people. Stay organized and achieve more.
              </p>
              <div className="flex items-center gap-4 mt-6">
                {[Facebook, Twitter, Instagram, Github].map((Icon, idx) => (
                  <motion.a
                    key={idx}
                    href="#"
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-gray-100 rounded-full text-[#0C5446] hover:bg-[#FF6700] hover:text-white transition-colors"
                    aria-label={`Social ${idx}`}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-[#0C5446] font-semibold mb-4 text-lg">Quick Links</h3>
              <ul className="space-y-3">
                {['Features', 'How It Works', 'Testimonials', 'Pricing'].map((item) => {
                  const id = item.toLowerCase().replace(' ', '-');
                  return (
                    <li key={item}>
                      <button
                        onClick={() => scrollToSection(id)}
                        className="text-gray-600 hover:text-[#FF6700] text-sm transition-colors flex items-center gap-1 group"
                      >
                        <span className="w-0 group-hover:w-2 h-0.5 bg-[#FF6700] transition-all" />
                        {item}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Resources / additional links */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-[#0C5446] font-semibold mb-4 text-lg">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-[#FF6700] text-sm transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-[#FF6700] text-sm transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-[#FF6700] text-sm transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-[#FF6700] text-sm transition-colors">Terms</a></li>
              </ul>
            </motion.div>

            {/* Newsletter */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-[#0C5446] font-semibold mb-4 text-lg">Stay Updated</h3>
              <p className="text-sm text-gray-600 mb-3 font-light">
                Get productivity tips and product updates.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col sm:flex-row gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-[#DBD0BD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6700] text-sm pr-10"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <RippleButton>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-3 bg-[#FF6700] text-white rounded-lg text-sm font-medium hover:bg-[#e55c00] transition-all hover:shadow-lg flex items-center justify-center gap-1 group"
                  >
                    Subscribe
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>
                </RippleButton>
              </form>
              <p className="text-xs text-gray-500 mt-3">
                No spam, unsubscribe anytime.
              </p>
            </motion.div>
          </motion.div>

          {/* Bottom bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-[#DBD0BD]/50"
          >
            <p className="text-sm text-gray-500 font-light order-2 md:order-1">
              © {new Date().getFullYear()} TaskFlow. All rights reserved.
            </p>

            <div className="flex items-center gap-6 order-1 md:order-2">
              <a href="#" className="text-xs text-gray-500 hover:text-[#FF6700] transition">Privacy</a>
              <a href="#" className="text-xs text-gray-500 hover:text-[#FF6700] transition">Terms</a>
              <a href="#" className="text-xs text-gray-500 hover:text-[#FF6700] transition">Cookies</a>
            </div>
          </motion.div>
        </div>
      </footer>

      {/* Back-to-Top Button */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 bg-[#0C5446] text-white rounded-full shadow-lg hover:bg-[#0a463a] transition z-50"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
}

// Ripple Button Component
function RippleButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {children}
    </div>
  );
}

// Feature Card
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      }}
      whileHover={{
        y: -8,
        borderColor: '#FF6700',
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      className="group p-6 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 hover:border-[#FF6700] transition-all h-full flex flex-col"
    >
      <motion.div
        className="mb-4"
        whileInView={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
          transition: { duration: 0.8, delay: 0.2 }
        }}
        viewport={{ once: true }}
      >
        <div className="p-3 bg-gradient-to-br from-[#FF6700]/10 to-[#0C5446]/10 rounded-lg w-fit">
          {icon}
        </div>
      </motion.div>
      <h3 className="text-xl font-semibold text-[#0C5446] mb-2">{title}</h3>
      <p className="text-[#0C5446]/70 flex-grow font-light leading-relaxed text-sm sm:text-base">{description}</p>
    </motion.div>
  );
}

// How It Works Card
function HowItWorksCard({ icon, step, title, description }: { icon: React.ReactNode; step: string; title: string; description: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      }}
      whileHover={{ y: -5, borderColor: '#FF6700' }}
      className="relative p-6 rounded-xl bg-white/40 backdrop-blur-sm border border-white/40 transition-all"
    >
      <span className="absolute top-4 right-4 text-4xl font-bold text-[#0C5446]/10">{step}</span>
      <div className="mb-4">
        <div className="p-3 bg-gradient-to-br from-[#FF6700]/10 to-[#0C5446]/10 rounded-lg w-fit">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-[#0C5446] mb-2">{title}</h3>
      <p className="text-[#0C5446]/70 font-light leading-relaxed text-sm sm:text-base">{description}</p>
    </motion.div>
  );
}

// Testimonial Card
function TestimonialCard({ quote, author, role, avatarInitial, rating }: { quote: string; author: string; role: string; avatarInitial?: string; rating?: number; }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, borderColor: '#FF6700' }}
      className="p-6 bg-white/50 backdrop-blur-sm rounded-lg border border-white/60 transition-all"
    >
      <p className="text-[#0C5446] italic mb-4 font-light leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-4">
        {avatarInitial && (
          <div className="w-10 h-10 bg-[#FF6700]/10 text-[#FF6700] rounded-full flex items-center justify-center font-bold">
            {avatarInitial}
          </div>
        )}
        <div>
          <p className="font-semibold text-[#0C5446]">{author}</p>
          <p className="text-sm text-[#0C5446]/60">{role}</p>
          {rating && (
            <div className="flex text-yellow-500 text-sm mt-1">
              {[...Array(rating)].map((_, i) => (
                <Star key={i} size={14} className="fill-current" />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Counter Component with animation
function Counter({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000; // 2 seconds
      const increment = value / (duration / 16); // 60fps
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl font-bold text-[#0C5446]">{count}{suffix}</div>
      <div className="text-sm text-[#0C5446]/60 font-light">{label}</div>
    </div>
  );
}

// Pricing Card
function PricingCard({ name, price, description, features, isPopular, ctaText, ctaLink }: {
  name: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
}) {
  return (
    <div className={`bg-white/30 backdrop-blur-md p-6 rounded-xl border ${isPopular ? 'border-[#FF6700] shadow-lg shadow-[#FF6700]/10' : 'border-white/40 hover:border-[#FF6700]'} transition-all relative flex flex-col`}>
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#FF6700] text-white text-xs font-bold rounded-full">
          Most Popular
        </span>
      )}
      <h3 className="text-2xl font-bold text-[#0C5446]">{name}</h3>
      <div className="mt-4 flex items-baseline text-[#0C5446]">
        <span className="text-4xl font-extrabold tracking-tight">${price}</span>
        <span className="ml-1 text-xl font-medium text-[#0C5446]/60">{price === 0 ? '' : '/mo'}</span>
      </div>
      <p className="text-[#0C5446]/60 mt-2 font-light">{description}</p>

      <div className="mt-6 space-y-3 flex-1">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start">
            <CheckCircle className="w-5 h-5 text-[#FF6700] mr-3 flex-shrink-0" />
            <span className="text-[#0C5446] text-sm">{feature}</span>
          </div>
        ))}
      </div>

      <RippleButton className="w-full mt-8">
        <Link
          href={ctaLink}
          className={`block w-full text-center px-4 py-3 rounded-lg font-medium transition ${isPopular
              ? 'bg-[#FF6700] text-white hover:bg-[#e55c00]'
              : 'bg-[#0C5446] text-white hover:bg-[#0a463a]'
            }`}
        >
          {ctaText}
        </Link>
      </RippleButton>
    </div>
  );
}