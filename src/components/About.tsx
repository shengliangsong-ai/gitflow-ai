import React from 'react';
import { Rocket, Shield, Zap, Heart, Globe, Target, Users, GitMerge, Cpu, Database, Mail } from 'lucide-react';

const values = [
  {
    icon: <Zap className="w-6 h-6 text-amber-400" />,
    title: "Velocity First",
    description: "We believe that developer productivity is the heartbeat of innovation. Our mission is to eliminate the 'Merge Hell' that slows down teams."
  },
  {
    icon: <Shield className="w-6 h-6 text-emerald-400" />,
    title: "Semantic Safety",
    description: "Beyond simple text diffs, we understand the intent of your code. We ensure that every merge is semantically sound and architecturally safe."
  },
  {
    icon: <Target className="w-6 h-6 text-indigo-400" />,
    title: "Precision Engineering",
    description: "Built by systems engineers for systems engineers. We bring the rigor of computer architecture to the software development lifecycle."
  },
  {
    icon: <Users className="w-6 h-6 text-purple-400" />,
    title: "Team Harmony",
    description: "Collaboration shouldn't be a conflict. We orchestrate complex team workflows so engineers can focus on building, not rebasing."
  }
];

const stats = [
  { label: "AI-Resolved Conflicts", value: "99.4%" },
  { label: "Token Efficiency", value: "85%" },
  { label: "Developer Time Saved", value: "12h/week" },
  { label: "System Uptime", value: "99.99%" }
];

export default function About() {
  return (
    <div className="max-w-5xl mx-auto space-y-20 pb-20">
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium mb-4">
          <Rocket className="w-4 h-4" />
          The Future of GitOps
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
          Orchestrating the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Semantic SDLC</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          GitFlow AI is a next-generation orchestration layer designed to eliminate manual merge toil through semantic intent analysis and advanced merge topologies.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center shadow-xl">
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Mission Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Our Mission</h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            In the modern era of microservices and rapid deployment, the bottleneck has shifted from writing code to integrating it. Traditional Git workflows are reactive, leading to "Merge Hell" and broken builds.
          </p>
          <p className="text-zinc-400 text-lg leading-relaxed">
            GitFlow AI is the 3rd in a series of high-impact AI projects launched by our founder this quarter, following the success of <a href="https://www.aivoicecast.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">AIVoiceCast</a> and <a href="https://www.signetai.io/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">SignetAI</a>.
          </p>
          <p className="text-zinc-400 text-lg leading-relaxed">
            We are moving from text-based merging to <strong>Semantic Orchestration</strong>. We use advanced AI models to understand the *intent* of your changes, allowing for automated, safe, and intelligent integration at scale.
          </p>
          <div className="flex gap-4 pt-4">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <GitMerge className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <Cpu className="w-6 h-6 text-purple-400" />
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <Database className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-zinc-800 rounded-3xl p-8 aspect-square flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <Target className="w-48 h-48 text-indigo-500/40 animate-pulse" />
        </div>
      </div>

      {/* Values Grid */}
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Core Values</h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">The principles that guide every line of code we write and every feature we build.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-indigo-500/50 transition-all group shadow-xl">
              <div className="mb-6 p-3 bg-zinc-950 border border-zinc-800 rounded-xl w-fit group-hover:scale-110 transition-transform">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Get in Touch</h2>
            <p className="text-zinc-400 leading-relaxed">
              Have questions about GitFlow AI? Want to see a custom demo for your enterprise? Our team is ready to help you orchestrate your future.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-zinc-300">
                <div className="p-2 bg-zinc-800 rounded-lg">
                  <Mail className="w-5 h-5 text-indigo-400" />
                </div>
                <span>contact@gitflow.ai</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-300">
                <div className="p-2 bg-zinc-800 rounded-lg">
                  <Globe className="w-5 h-5 text-indigo-400" />
                </div>
                <span>Fremont, CA, USA</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" />
              <input type="text" placeholder="Last Name" className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" />
            </div>
            <input type="email" placeholder="Email Address" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" />
            <textarea placeholder="How can we help?" rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors resize-none"></textarea>
            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20">
              Send Message
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 rounded-3xl p-12 text-center space-y-8 shadow-2xl shadow-indigo-500/20">
        <h2 className="text-4xl font-bold text-white">Ready to automate your workflow?</h2>
        <p className="text-indigo-100 text-xl max-w-2xl mx-auto">
          Join the elite teams using GitFlow AI to ship faster, safer, and with zero merge toil.
        </p>
        <button className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg">
          Get Started Today
        </button>
      </div>
    </div>
  );
}
