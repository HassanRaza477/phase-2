"use client";

import { motion } from 'framer-motion';
import {
  PlusCircle, Trash2, Edit, List, CheckCircle,
  Tag, Search, ArrowUpDown,
  Repeat, Bell, Sparkles, Star
} from 'lucide-react';
import React from 'react';

// Animation variants (unchanged)
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -4,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

// Feature card (unchanged)
const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <motion.div
    variants={cardHover}
    initial="rest"
    whileHover="hover"
    className="group relative bg-white rounded-xl p-5 shadow-sm hover:shadow-xl border border-[#DBD0BD]/30 transition-all"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[#0C5446]/0 via-[#FF6700]/0 to-[#DBD0BD]/0 group-hover:from-[#0C5446]/5 group-hover:to-[#FF6700]/5 rounded-xl transition-all duration-300" />
    
    <div className="relative flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#FF6700]/10 to-[#0C5446]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 text-[#FF6700]" />
      </div>
      <div>
        <h4 className="font-semibold text-[#0C5446] text-base mb-1 group-hover:text-[#0C5446]/90">
          {title}
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

interface CategoryHeaderProps {
  title: string;
  color: 'green' | 'orange' | 'amber';
  count: number;
}

// Category header (unchanged)
const CategoryHeader = ({ title, color, count }: CategoryHeaderProps) => {
  const colorClasses = {
    green: 'bg-[#0C5446]/10 text-[#0C5446]',
    orange: 'bg-[#FF6700]/10 text-[#FF6700]',
    amber: 'bg-[#DBD0BD] text-[#0C5446]'
  };

  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-xl font-bold text-[#0C5446]">{title}</h3>
      <span className={`text-xs font-medium px-3 py-1 rounded-full ${colorClasses[color]}`}>
        {count} features
      </span>
    </div>
  );
};

export default function FeaturesProgression() {
  return (
    // Full‑width section with background color
    <section className="relative w-full bg-[#FCFAEF] py-20 md:py-28 overflow-hidden">
      {/* Decorative elements – now relative to the full‑width section */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#0C5446]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#FF6700]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full max-h-3xl bg-[#DBD0BD]/20 rounded-full blur-3xl" />
      </div>

      {/* Floating icons */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 right-20 text-[#0C5446]/10 hidden lg:block"
      >
        <Star size={48} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-40 left-20 text-[#FF6700]/10 hidden lg:block"
      >
        <Sparkles size={56} />
      </motion.div>

      {/* Centered content container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#0C5446] mb-4">
            Complete Feature Set
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From essential tools to intelligent automation — everything you need to master your tasks.
          </p>
          
          {/* Feature level badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="px-4 py-2 bg-[#0C5446]/10 text-[#0C5446] rounded-full text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-[#0C5446] rounded-full" />
              Basic (5)
            </div>
            <div className="px-4 py-2 bg-[#FF6700]/10 text-[#FF6700] rounded-full text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FF6700] rounded-full" />
              Intermediate (3)
            </div>
            <div className="px-4 py-2 bg-[#DBD0BD] text-[#0C5446] rounded-full text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-[#0C5446] rounded-full" />
              Advanced (2)
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid md:grid-cols-3 gap-8 lg:gap-12"
        >
          {/* Basic Level */}
          <motion.div variants={fadeInUp} className="space-y-5">
            <CategoryHeader title="Basic Essentials" color="green" count={5} />
            <div className="space-y-4">
              <FeatureCard
                icon={PlusCircle}
                title="Add Task"
                description="Quickly create new todo items with just a few clicks."
              />
              <FeatureCard
                icon={Trash2}
                title="Delete Task"
                description="Remove tasks you no longer need — clean up with ease."
              />
              <FeatureCard
                icon={Edit}
                title="Update Task"
                description="Modify task details anytime: title, description, or due date."
              />
              <FeatureCard
                icon={List}
                title="View Task List"
                description="See all your tasks in a clean, organized list view."
              />
              <FeatureCard
                icon={CheckCircle}
                title="Mark as Complete"
                description="Toggle completion status with a single tap."
              />
            </div>
          </motion.div>

          {/* Intermediate Level */}
          <motion.div variants={fadeInUp} className="space-y-5">
            <CategoryHeader title="Organization & Usability" color="orange" count={3} />
            <div className="space-y-4">
              <FeatureCard
                icon={Tag}
                title="Priorities & Tags"
                description="Assign priority levels (High/Medium/Low) and add custom labels like Work or Personal."
              />
              <FeatureCard
                icon={Search}
                title="Search & Filter"
                description="Find tasks by keyword, or filter by status, priority, or due date."
              />
              <FeatureCard
                icon={ArrowUpDown}
                title="Sort Tasks"
                description="Reorder your list by due date, priority, or alphabetically."
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-[#FF6700] mt-2">
              <Sparkles className="w-3 h-3" />
              <span>Perfect for power users</span>
            </div>
          </motion.div>

          {/* Advanced Level */}
          <motion.div variants={fadeInUp} className="space-y-5">
            <CategoryHeader title="Intelligent Features" color="amber" count={2} />
            <div className="space-y-4">
              <FeatureCard
                icon={Repeat}
                title="Recurring Tasks"
                description="Set repeating tasks (daily, weekly, monthly) — we'll auto-reschedule them."
              />
              <FeatureCard
                icon={Bell}
                title="Due Dates & Reminders"
                description="Attach deadlines with a date picker and get browser notifications."
              />
            </div>
            
            {/* Coming soon card */}
            <motion.div
              animate={{ 
                scale: [1, 1.02, 1],
                borderColor: ['#DBD0BD', '#FF6700', '#DBD0BD']
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="mt-6 p-5 bg-gradient-to-br from-[#FF6700]/5 to-[#0C5446]/5 rounded-xl border-2 border-[#DBD0BD]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-[#FF6700]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0C5446]">More coming soon</p>
                  <p className="text-xs text-gray-500">AI suggestions • Analytics • Team workflows</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom note */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm border border-[#DBD0BD]/50">
            <span className="text-[#0C5446] font-medium">✨</span>
            <span className="text-gray-600 text-sm">All features included in every plan — no hidden limits</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}