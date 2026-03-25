import React from 'react';
import { User, Briefcase, GraduationCap, Code2, Cpu, Database, Globe, Mail, Phone, MapPin, Linkedin, Github, Rocket, ExternalLink } from 'lucide-react';

const experiences = [
  {
    company: "Pure Storage",
    role: "Member of Technical Staff Engineer",
    period: "Feb 23 - Present",
    location: "Santa Clara, CA",
    description: "Leading technical initiatives in distributed storage systems."
  },
  {
    company: "Meta",
    role: "Senior Software Engineer",
    period: "Jan 2025 - Dec 2025",
    location: "Burlingame, CA",
    description: "Designed memory management for Connectivity Framework; developed Stream file transfer for AR/VR devices; implemented Constellation Profile Arbitration."
  },
  {
    company: "TikTok",
    role: "Senior Software Engineer",
    period: "May 2022 - Dec 2024",
    location: "San Jose, CA",
    description: "Led DDL query execution in MySQL cluster; implemented distributed query processing PoC; designed adaptive autoscaling for buffer pool memory."
  },
  {
    company: "Microsoft",
    role: "Senior Software Engineer",
    period: "Jan 2020 - Mar 2022",
    location: "Mountain View, CA",
    description: "Implemented asynchronous DDL physical replication for MySQL8; provided on-call support for Azure databases (MySQL/PostgreSQL)."
  },
  {
    company: "Amazon (Aurora)",
    role: "Software Engineer",
    period: "Dec 2016 - Jan 2020",
    location: "East Palo Alto, CA",
    description: "Contributed to Aurora Fast DDL, Parallel-Query, and multi-master DDL features; trained engineers on DDL Recovery and Metadata Lock issues."
  },
  {
    company: "SJSU",
    role: "Lecturer",
    period: "Dec 2016 - Aug 2018",
    location: "San Jose, CA",
    description: "Taught CMPE 200 Computer Architecture for 3 semesters."
  },
  {
    company: "Google",
    role: "Senior Software Engineer",
    period: "Mar 2014 - Jun 2016",
    location: "Mountain View, CA",
    description: "Designed battery firmware OTA for Chromebook; served on Hire Committee (200+ interviews); taught interviewer and firmware training classes."
  }
];

const skills = [
  { category: "Languages", items: ["C", "C++", "SystemC", "Python", "SQL"] },
  { category: "Systems", items: ["Architectural Modeling", "Embedded Systems", "DDR/SSD Storage", "Database Internals"] },
  { category: "Cloud", items: ["Kubernetes (K8s)", "Compute-Storage Separation", "Serverless Architecture", "Distributed Systems"] }
];

export default function Architect() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header / Hero */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Cpu className="w-64 h-64 text-indigo-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <User className="w-16 h-16 text-white" />
          </div>
          
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Sheng-Liang Song</h1>
              <p className="text-xl text-indigo-400 font-medium mt-1">Chief Architect & Technical Leader</p>
            </div>
            
            <p className="text-zinc-300 text-lg leading-relaxed max-w-3xl">
              Highly experienced technical leader with over 20+ years of C++ expertise. Specialist in computer architecture, distributed storage, and cloud-native database systems. Architect of the GitFlow AI Semantic Orchestration Layer.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="mailto:shengliang.song@gmail.com" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> shengliang.song@gmail.com
              </a>
              <span className="flex items-center gap-2 text-sm text-zinc-400">
                <MapPin className="w-4 h-4" /> Fremont, CA
              </span>
              <a href="https://www.linkedin.com/in/shenglia/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Skills & Education */}
        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
              Technical Arsenal
            </h2>
            <div className="space-y-6">
              {skills.map((skill, idx) => (
                <div key={idx}>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">{skill.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skill.items.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              Education
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold">Master of Computer Science</h3>
                <p className="text-sm text-zinc-400">San Jose State University</p>
                <p className="text-xs text-zinc-500 mt-1">2005 - 2008 (While working full-time)</p>
              </div>
              <div>
                <h3 className="text-white font-semibold">BS Electrical Engineering & CS</h3>
                <p className="text-sm text-zinc-400">UC Berkeley</p>
                <p className="text-xs text-zinc-500 mt-1">1998 - 2000</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-indigo-400" />
              Recent Hackathons
            </h2>
            <div className="space-y-4">
              <a href="https://www.aivoicecast.com/" target="_blank" rel="noopener noreferrer" className="block p-4 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-indigo-500 transition-all group">
                <h3 className="text-white font-semibold group-hover:text-indigo-400 transition-colors">AIVoiceCast</h3>
                <p className="text-xs text-zinc-500 mt-1">AI-powered voice broadcasting platform.</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-400 font-mono uppercase tracking-wider">
                  <span>Visit Project</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
              <a href="https://www.signetai.io/" target="_blank" rel="noopener noreferrer" className="block p-4 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-indigo-500 transition-all group">
                <h3 className="text-white font-semibold group-hover:text-indigo-400 transition-colors">SignetAI</h3>
                <p className="text-xs text-zinc-500 mt-1">Next-gen AI signature and identity verification.</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-400 font-mono uppercase tracking-wider">
                  <span>Visit Project</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                <h3 className="text-indigo-400 font-semibold">GitFlow AI</h3>
                <p className="text-xs text-zinc-500 mt-1">Current Project: Semantic GitOps Orchestration.</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-400 font-mono uppercase tracking-wider">
                  <span>Active Build</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Experience Timeline */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-indigo-400" />
              Professional Journey
            </h2>
            
            <div className="space-y-12 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-zinc-800">
              {experiences.map((exp, idx) => (
                <div key={idx} className="relative pl-10 group">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-zinc-950 border-2 border-zinc-800 group-hover:border-indigo-500 transition-colors z-10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-zinc-700 group-hover:bg-indigo-500 transition-colors" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{exp.company}</h3>
                      <span className="text-sm font-mono text-zinc-500">{exp.period}</span>
                    </div>
                    <p className="text-indigo-400/80 font-medium text-sm">{exp.role}</p>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 pt-8 border-t border-zinc-800">
              <p className="text-zinc-500 text-sm italic">
                * Additional experience at Broadcom, LinkAMedia, Bay Microsystems, and Cisco Systems (2000-2013).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
