import React, { useState, useEffect, useRef } from 'react';
import { Presentation as PresentationIcon, ChevronRight, ChevronLeft, Play, Award, Zap, GitMerge, Terminal, StopCircle, Loader2, Sparkles } from 'lucide-react';
import { generateSpeech, playBase64Pcm } from '../services/tts';

const slides = [
  {
    id: 1,
    title: "The Problem: Broken Main Branches",
    icon: <GitMerge className="w-12 h-12 text-red-400" />,
    speechText: "Welcome to our pitch for A I GitFlow. The problem we are solving is broken main branches. In fast-moving engineering teams, the merge queue bottleneck is real. Developers push code that passes locally but breaks when merged. Manual code reviews take hours or days, and resolving complex rebase conflicts wastes valuable engineering time. The result is slower velocity, frustrated developers, and broken builds.",
    content: (
      <div className="space-y-6 text-xl text-zinc-300">
        <p>In fast-moving engineering teams, the <strong>merge queue bottleneck</strong> is real.</p>
        <ul className="list-disc pl-8 space-y-4">
          <li>Developers push code that passes locally but breaks when merged.</li>
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
    speechText: "Here are our key features and demo highlights. First, git-ai commit analyzes staged files locally and catches bugs before the commit is created. Second, git-ai push pushes code and automatically registers it with the global A I Merge Queue. Third, git-ai rebase monitors the rebase process and suggests resolutions for conflicts. Finally, we are fully integrated with the GitLab Browser S D K to track C L I commands and dashboard usage.",
    content: (
      <div className="space-y-6 text-xl text-zinc-300">
        <ul className="space-y-6">
          <li className="flex items-start gap-4">
            <div className="bg-indigo-500/20 p-2 rounded-lg mt-1"><code className="text-indigo-400 text-sm">git-ai commit</code></div>
            <div>Analyzes staged files locally. Catches bugs before the commit is created.</div>
          </li>
          <li className="flex items-start gap-4">
            <div className="bg-indigo-500/20 p-2 rounded-lg mt-1"><code className="text-indigo-400 text-sm">git-ai push</code></div>
            <div>Pushes code and automatically registers it with the global AI Merge Queue.</div>
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
    title: "Why This Wins",
    icon: <PresentationIcon className="w-12 h-12 text-indigo-400" />,
    speechText: "Why does this win? Because we didn't just build a dashboard; we built a workflow integration. There is zero friction: developers don't need to learn a new U I, they just type git-ai instead of git. We have real-time sync using Firebase Firestore to ensure the C L I and Web Dashboard are always perfectly in sync. And we are data-driven, with GitLab Analytics S D K integration proving we are thinking about enterprise adoption from day one. Thank you, Judges!",
    content: (
      <div className="space-y-6 text-xl text-zinc-300">
        <p>We didn't just build a dashboard; we built a <strong>workflow integration</strong>.</p>
        <ul className="list-disc pl-8 space-y-4">
          <li><strong>Zero Friction:</strong> Developers don't need to learn a new UI. They just type <code className="text-indigo-300">git-ai</code> instead of <code className="text-indigo-300">git</code>.</li>
          <li><strong>Real-time Sync:</strong> Firebase Firestore ensures the CLI and the Web Dashboard are always perfectly in sync.</li>
          <li><strong>Data-Driven:</strong> GitLab Analytics SDK integration proves we are thinking about enterprise adoption and metrics from day one.</li>
        </ul>
        <p className="text-emerald-400 font-semibold mt-8 text-2xl text-center">Thank you, Judges!</p>
      </div>
    )
  }
];

// Need to import LayoutDashboard for the icon in slide 2
import { LayoutDashboard } from 'lucide-react';

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlayingAI, setIsPlayingAI] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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
      }
    }
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
