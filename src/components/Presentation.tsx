import React, { useState, useEffect, useRef } from 'react';
import { Presentation as PresentationIcon, ChevronRight, ChevronLeft, Play, Award, Zap, GitMerge, Terminal, StopCircle, Loader2, Sparkles, Clock, CheckCircle2, Network, Database } from 'lucide-react';
import { generateSpeech, playBase64Pcm } from '../services/tts';
import { SvgDiagram } from './Architecture';

const slides = [
  {
    id: 1,
    title: "The Problem: Broken Main Branches",
    icon: <GitMerge className="w-12 h-12 text-red-400" />,
    speechText: "Welcome to our pitch for A I GitFlow. The problem we are solving is broken main branches. In fast-moving engineering teams, the sync queue bottleneck is real. Developers push code that passes locally but breaks when integrated. Manual code reviews take hours or days, and resolving complex rebase conflicts wastes valuable engineering time. The result is slower velocity, frustrated developers, and broken builds.",
    content: (
      <div className="space-y-6 text-xl text-zinc-300">
        <p>In fast-moving engineering teams, the <strong>sync queue bottleneck</strong> is real.</p>
        <ul className="list-disc pl-8 space-y-4">
          <li>Developers push code that passes locally but breaks when integrated.</li>
          <li>Manual code reviews take hours or days.</li>
          <li>Resolving complex rebase conflicts wastes valuable engineering time.</li>
        </ul>
        <p className="text-red-400 font-semibold mt-8">Result: Slower velocity, frustrated developers, and broken builds.</p>
      </div>
    )
  },
  {
    id: 2,
    title: "The Solution: AI GitFlow",
    icon: <Zap className="w-12 h-12 text-amber-400" />,
    speechText: "The solution is A I GitFlow. It is a hybrid local-cloud tool that injects A I directly into the developer's daily workflow. It consists of two main parts: a Local C L I that intercepts standard git commands to provide instant A I feedback before code ever leaves the machine, and a Cloud Queue, which is a global, intelligent merge queue that automatically tests combinations of pull requests before merging.",
    content: (
      <div className="space-y-6 text-xl text-zinc-300">
        <p><strong>AI GitFlow</strong> is a hybrid local-cloud tool that injects AI directly into the developer's daily workflow.</p>
        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2"><Terminal className="w-5 h-5"/> Local CLI</h3>
            <p className="text-base">Intercepts standard git commands to provide instant AI feedback before code ever leaves the machine.</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><LayoutDashboard className="w-5 h-5"/> Cloud Queue</h3>
            <p className="text-base">A global, intelligent merge queue that automatically tests combinations of PRs before merging.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Key Features & Demo Highlights",
    icon: <Award className="w-12 h-12 text-emerald-400" />,
    speechText: "Here are our key features and demo highlights. First, git-ai commit analyzes staged files locally and catches bugs before the commit is created. Second, git-ai push pushes code and automatically registers it with the global GitFlow A I Queue. Third, git-ai rebase monitors the rebase process and suggests resolutions for conflicts. Finally, we are fully integrated with the GitLab Browser S D K to track C L I commands and dashboard usage.",
    content: (
      <div className="space-y-6 text-xl text-zinc-300">
        <ul className="space-y-6">
          <li className="flex items-start gap-4">
            <div className="bg-indigo-500/20 p-2 rounded-lg mt-1"><code className="text-indigo-400 text-sm">git-ai commit</code></div>
            <div>Analyzes staged files locally. Catches bugs before the commit is created.</div>
          </li>
          <li className="flex items-start gap-4">
            <div className="bg-indigo-500/20 p-2 rounded-lg mt-1"><code className="text-indigo-400 text-sm">git-ai push</code></div>
            <div>Pushes code and automatically registers it with the global GitFlow AI Queue.</div>
          </li>
          <li className="flex items-start gap-4">
            <div className="bg-indigo-500/20 p-2 rounded-lg mt-1"><code className="text-indigo-400 text-sm">git-ai rebase</code></div>
            <div>AI monitors the rebase process and suggests resolutions for conflicts.</div>
          </li>
          <li className="flex items-start gap-4">
            <div className="bg-indigo-500/20 p-2 rounded-lg mt-1"><span className="text-indigo-400 text-sm font-mono">GitLab SDK</span></div>
            <div>Fully integrated with GitLab Browser SDK to track CLI commands and dashboard usage.</div>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 4,
    title: "Dual-Model Semantic Orchestration",
    icon: <Sparkles className="w-12 h-12 text-purple-400" />,
    speechText: "We use a powerful Dual-Model architecture. The first model acts as the developer, intelligently auto-resolving conflicts during the cherry-pick phase. The second model acts as the auditor. It independently verifies the final commit, ensures the conflict was correctly resolved, and generates an audit score. All artifacts are then saved to the gitflow audit repository. If the score is high, we merge. If it's low, we pause for human review.",
    content: (
      <div className="space-y-6 text-xl text-zinc-300">
        <p>Moving beyond basic CI/CD with a <strong>Dual-Model Architecture</strong>.</p>
        <ul className="space-y-6">
          <li className="flex items-start gap-4">
            <div className="bg-purple-500/20 p-2 rounded-lg mt-1"><Terminal className="w-5 h-5 text-purple-400" /></div>
            <div><strong>Model 1 (Resolution):</strong> Auto-resolves conflicts during the cherry-pick phase based on semantic intent.</div>
          </li>
          <li className="flex items-start gap-4">
            <div className="bg-purple-500/20 p-2 rounded-lg mt-1"><CheckCircle2 className="w-5 h-5 text-purple-400" /></div>
            <div><strong>Model 2 (Audit & Verify):</strong> Independently audits the final file, verifies the fix, and generates a Confidence Score.</div>
          </li>
          <li className="flex items-start gap-4">
            <div className="bg-purple-500/20 p-2 rounded-lg mt-1"><Database className="w-5 h-5 text-purple-400" /></div>
            <div><strong>gitflow-audit Repo:</strong> Stores File A, File B, the merged result, and the audit score for perfect traceability.</div>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 4.5,
    title: "100% GitOps Architecture",
    icon: <Network className="w-12 h-12 text-blue-400" />,
    speechText: "Our architecture is 100% GitOps native. We don't use a central database. The merge queue state is stored in a hidden gitflow A I state branch. All A I operations, conflict artifacts, and conversation context are synced to a dedicated gitflow audit repository. This provides an enterprise-grade, immutable audit log while keeping the C L I lightning fast.",
    content: (
      <div className="w-full h-full -mt-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <SvgDiagram />
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: "Verifiable Trust: Built-in Benchmarks",
    icon: <Terminal className="w-12 h-12 text-emerald-400" />,
    speechText: "How do you know this works? We believe in verifiable trust. Anyone can clone our repo and run our automated benchmark. It simulates complex, real-world merge conflicts and proves our A I's accuracy right on your machine. You don't have to take our word for it; you can prove it yourself.",
    content: (
      <div className="space-y-6 text-xl text-zinc-300">
        <p>Don't just take our word for it. Prove it yourself with <strong>Built-in Benchmarks</strong>.</p>
        <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 font-mono text-emerald-400 text-lg my-6">
          $ git-ai benchmark
        </div>
        <ul className="space-y-4">
          <li className="flex items-start gap-4">
            <div className="bg-emerald-500/20 p-2 rounded-lg mt-1"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
            <div><strong>Automated Self-Tests:</strong> Simulates complex, real-world merge conflicts locally.</div>
          </li>
          <li className="flex items-start gap-4">
            <div className="bg-emerald-500/20 p-2 rounded-lg mt-1"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
            <div><strong>Semantic Verification:</strong> Tests everything from line collisions to deep refactoring.</div>
          </li>
          <li className="flex items-start gap-4">
            <div className="bg-emerald-500/20 p-2 rounded-lg mt-1"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
            <div><strong>Open Source:</strong> Clone the repo and verify our AI accuracy on your own machine.</div>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 6,
    title: "Live Demo: Real-Time & Real APIs",
    icon: <Terminal className="w-12 h-12 text-cyan-400" />,
    speechText: "Let's see it in action. This is our live benchmark demo. Importantly, our project source itself is the real-time live demo. When you click 'Sync Github', it automatically syncs the source code from GitHub to GitLab using real GitHub tokens and APIs—this is not a simulation or a mock. The Git Tree View dashboard allows judges to see the source code directly in real-time.",
    content: (
      <div className="w-full h-full -mt-4 space-y-4">
        <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg mb-4">
          <p className="text-cyan-300 font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Our project source itself is the real-time live demo!
          </p>
          <p className="text-zinc-300 text-sm mt-2">
            "Sync Github" uses <strong>real GitHub tokens and APIs</strong> (not a simulation nor mock) to sync source code to GitLab. The Git Tree View dashboard lets you see the source code live.
          </p>
        </div>
        <TerminalComponent className="h-[400px]" />
      </div>
    )
  },
  {
    id: 7,
    title: "Why This Wins",
    icon: <PresentationIcon className="w-12 h-12 text-indigo-400" />,
    speechText: "Why does this win? Because we built a seamless workflow integration, not just another dashboard. Developers keep their existing habits with zero friction. Everything syncs in real-time, and we're enterprise-ready from day one. Thank you, Judges!",
    content: (
      <div className="space-y-6 text-xl text-zinc-300">
        <p>We built a <strong>seamless workflow integration</strong>, not just a dashboard.</p>
        <ul className="list-disc pl-8 space-y-4">
          <li><strong>Zero Friction:</strong> Developers keep their existing habits. Just type <code className="text-indigo-300">git-ai</code> instead of <code className="text-indigo-300">git</code>.</li>
          <li><strong>Real-time Sync:</strong> CLI and Web Dashboard are always perfectly in sync.</li>
          <li><strong>Enterprise-Ready:</strong> Built-in analytics and data-driven from day one.</li>
        </ul>
        <p className="text-emerald-400 font-semibold mt-8 text-2xl text-center">Thank you, Judges!</p>
      </div>
    )
  }
];

// Need to import LayoutDashboard for the icon in slide 2
import { LayoutDashboard } from 'lucide-react';
import TerminalComponent from './Terminal';

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlayingAI, setIsPlayingAI] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const playRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let isMounted = true;

    const playCurrentSlide = async () => {
      if (!playRef.current) return;
      
      setIsGenerating(true);
      const text = slides[currentSlide].speechText;
      const audioData = await generateSpeech(text);
      
      if (!isMounted || !playRef.current) {
        setIsGenerating(false);
        return;
      }
      
      setIsGenerating(false);
      
      if (audioData) {
        try {
          abortControllerRef.current = new AbortController();
          await playBase64Pcm(audioData, 24000, abortControllerRef.current.signal);
        } catch (e) {
          console.error("Playback failed", e);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } else {
        // Fallback if TTS fails: just wait a few seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      if (!isMounted || !playRef.current) return;
      
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(prev => prev + 1);
      } else {
        setIsPlayingAI(false);
        playRef.current = false;
      }
    };

    if (isPlayingAI) {
      playCurrentSlide();
    }

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentSlide, isPlayingAI]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAI) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingAI]);

  useEffect(() => {
    let isMounted = true;
    
    // Preload audio sequentially in the background
    const preloadAudio = async () => {
      for (const slide of slides) {
        if (!isMounted) break;
        // This will fetch and cache in IndexedDB if not already cached
        await generateSpeech(slide.speechText);
      }
    };
    
    preloadAudio();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleAIPresentation = () => {
    if (isPlayingAI) {
      setIsPlayingAI(false);
      playRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    } else {
      setIsPlayingAI(true);
      playRef.current = true;
      if (currentSlide === slides.length - 1) {
        setCurrentSlide(0);
        setElapsedSeconds(0);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const nextSlide = () => {
    setIsPlayingAI(false);
    playRef.current = false;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  };
  
  const prevSlide = () => {
    setIsPlayingAI(false);
    playRef.current = false;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Play className="w-8 h-8 text-indigo-400" />
            Judge Hackathon Pitch
          </h1>
          <p className="text-zinc-400 text-lg mt-2">
            3-Minute Presentation Deck
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleAIPresentation}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shadow-lg ${
              isPlayingAI 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
            }`}
          >
            {isPlayingAI ? (
              <>
                <StopCircle className="w-5 h-5" />
                Stop AI Pitch
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Play AI Pitch
              </>
            )}
          </button>
          <span className="text-zinc-500 font-mono">
            Slide {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col relative">
        {/* Progress Bar */}
        <div className="h-1 w-full bg-zinc-800 absolute top-0 left-0">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>

        <div className="flex-1 p-12 flex flex-col">
          <div className="flex items-center gap-6 mb-12 border-b border-zinc-800 pb-8 relative">
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-inner">
              {slides[currentSlide].icon}
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight">
              {slides[currentSlide].title}
            </h2>
            {isGenerating && (
              <div className="absolute right-0 flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">AI is speaking...</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {slides[currentSlide].content}
          </div>
        </div>

        {(isPlayingAI || elapsedSeconds > 0) && (
          <div className="fixed bottom-8 right-8 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 text-white px-6 py-4 rounded-2xl font-mono text-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center gap-4 z-50 transition-all duration-300">
            <Clock className={`w-8 h-8 ${isPlayingAI ? 'animate-pulse' : ''} ${elapsedSeconds >= 180 ? 'text-red-400' : 'text-indigo-400'}`} />
            <span className={elapsedSeconds >= 180 ? 'text-red-400 font-bold' : 'font-semibold'}>
              {formatTime(elapsedSeconds)}
            </span>
            {!isPlayingAI && (
              <button 
                onClick={() => setElapsedSeconds(0)}
                className="ml-2 text-sm font-sans text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        )}

        <div className="bg-zinc-950 border-t border-zinc-800 p-6 flex justify-between items-center">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsPlayingAI(false);
                  playRef.current = false;
                  if (abortControllerRef.current) abortControllerRef.current.abort();
                  setCurrentSlide(idx);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-indigo-500 w-8' : 'bg-zinc-700 hover:bg-zinc-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
