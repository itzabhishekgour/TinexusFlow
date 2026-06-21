import React from 'react';
import { Link } from 'react-router-dom';
import packageJson from '../../../package.json';
import { 
  GitBranch, 
  MessageSquareOff, 
  Map, 
  Terminal, 
  ArrowRight,
  GitCommit,
  Layers,
  Code
} from 'lucide-react';
import WaitlistForm from './WaitlistForm';
import LogoSVG from '../../concept-7-t-n-fusion.svg';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-x-hidden selection:bg-[var(--accent-subtle)] selection:text-[var(--accent-primary)]">
      
      {/* ── Navbar ────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-light)] transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={LogoSVG} alt="TinexusFlow Logo" className="w-7 h-7" />
            <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">
              TinexusFlow<span className="text-[var(--text-tertiary)] font-normal ml-0.5">Engine</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/app" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block">
              Open App Demo
            </Link>
            <a href="#waitlist" className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-lg transition-all shadow-sm">
              Join Waitlist
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 sm:pt-40 sm:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-medium)] text-[var(--text-secondary)] text-sm font-medium mb-8">
            <GitBranch size={14} className="text-[var(--accent-primary)]" />
            <span>Built for deep thinkers, developers, and researchers</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] mb-6 leading-[1.15]">
            When one question leads to five, don't lose the thread.
          </h1>
          
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Whether you're debugging, researching, or studying—TinexusFlow turns conversations into a navigable graph. Branch into any tangent without losing your original context.
          </p>
          
          <div id="waitlist" className="mb-12">
            <WaitlistForm />
          </div>
          
          <a href="#how-it-works" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            See how the engine works
            <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* ── Problem Section ───────────────────────────────────── */}
      <section className="py-24 bg-[var(--bg-secondary)] border-y border-[var(--border-light)] px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
              The Problem with Linear Chat
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
              Standard chat interfaces break down the moment your thinking isn't linear.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--bg-elevated)] p-8 rounded-2xl border border-[var(--border-light)] shadow-sm">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mb-6">
                <MessageSquareOff size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Context Pollution</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Asking a tangential debugging question or exploring a new literature thread clutters your main chat. The AI's context window fills with irrelevant details, degrading its ability to solve the original problem.
              </p>
            </div>
            
            <div className="bg-[var(--bg-elevated)] p-8 rounded-2xl border border-[var(--border-light)] shadow-sm">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-6">
                <GitCommit size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">Lost Threads</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                When you scroll 50 messages up to review a previous bug fix or study note, you lose track of where you currently are. There is no concept of "returning" to a previous state safely.
              </p>
            </div>
            
            <div className="bg-[var(--bg-elevated)] p-8 rounded-2xl border border-[var(--border-light)] shadow-sm">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center mb-6">
                <Map size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">No Structured Exploration</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                If an AI suggests 3 possible causes for a bug or 3 alternate research hypotheses, you can't cleanly branch into each one separately without confusing the model.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who it's for ──────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-[var(--border-light)] bg-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
              Built for thinking that branches.
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              Linear chat breaks down when your workflow requires deep, structured exploration.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-light)] hover:border-[var(--accent-primary)]/50 transition-colors">
              <Terminal className="text-[var(--accent-primary)] mb-4" size={24} />
              <h4 className="font-bold text-[var(--text-primary)] text-lg mb-2">Developers</h4>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Branch into each possible bug cause, compare results, and return to your original stack trace with full context.
              </p>
            </div>
            
            <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-light)] hover:border-[var(--accent-primary)]/50 transition-colors">
              <Layers className="text-[var(--accent-primary)] mb-4" size={24} />
              <h4 className="font-bold text-[var(--text-primary)] text-lg mb-2">Researchers</h4>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Follow a tangent in your literature review or test a hypothesis branch—without rewriting your research question every time.
              </p>
            </div>
            
            <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-light)] hover:border-[var(--accent-primary)]/50 transition-colors">
              <Map className="text-[var(--accent-primary)] mb-4" size={24} />
              <h4 className="font-bold text-[var(--text-primary)] text-lg mb-2">Students</h4>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Get a confusing sub-concept explained in depth, then jump straight back to your main study thread.
              </p>
            </div>
            
            <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-light)] hover:border-[var(--accent-primary)]/50 transition-colors">
              <GitBranch className="text-[var(--accent-primary)] mb-4" size={24} />
              <h4 className="font-bold text-[var(--text-primary)] text-lg mb-2">Writers & Strategists</h4>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Explore alternate angles or outlines before committing, without losing your original draft direction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Solution Section ──────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent-subtle)] rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
              Think in branches, not lines.
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              TinexusFlow treats conversations like a Git repository for your thoughts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Visual Side */}
            <div className="bg-[var(--bg-elevated)] rounded-3xl p-6 border border-[var(--border-medium)] shadow-xl relative aspect-square max-h-[500px] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#d4d2c7_1px,transparent_1px)] [background-size:16px_16px] opacity-30 dark:opacity-10"></div>
              
              {/* Static SVG representation of Branch Nodes */}
              <div className="relative w-full h-full flex flex-col items-center justify-center space-y-6">
                {/* Root Node */}
                <div className="w-64 bg-[var(--bg-primary)] border border-[var(--border-medium)] rounded-xl p-4 shadow-sm z-10 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">Root Concept</span>
                  </div>
                  <div className="h-2 w-3/4 bg-[var(--border-medium)] rounded-full mb-2"></div>
                  <div className="h-2 w-1/2 bg-[var(--border-medium)] rounded-full"></div>
                </div>
                
                {/* Branch connector */}
                <div className="w-px h-8 bg-[var(--border-medium)] relative">
                  <div className="absolute top-1/2 left-0 w-32 h-px bg-[var(--border-medium)]"></div>
                </div>

                <div className="flex gap-8 w-full justify-center relative">
                  {/* Active Branch */}
                  <div className="w-56 bg-[var(--bg-primary)] border-2 border-[var(--accent-primary)] rounded-xl p-4 shadow-md z-10 translate-x-4">
                    <div className="absolute -top-3 -right-3 bg-[var(--accent-primary)] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Active</div>
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch size={14} className="text-[var(--accent-primary)]" />
                      <span className="text-xs font-semibold text-[var(--text-primary)]">Deep Dive: Cache</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--accent-subtle)] rounded-full mb-2"></div>
                    <div className="h-2 w-2/3 bg-[var(--accent-subtle)] rounded-full"></div>
                  </div>

                  {/* Parallel Branch */}
                  <div className="w-56 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-xl p-4 shadow-sm z-10 opacity-70 scale-95 translate-y-4 -translate-x-4">
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch size={14} className="text-[var(--text-tertiary)]" />
                      <span className="text-xs font-semibold text-[var(--text-tertiary)]">Deep Dive: DB</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--border-light)] rounded-full mb-2"></div>
                    <div className="h-2 w-2/3 bg-[var(--border-light)] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps Side */}
            <div className="space-y-12">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center font-bold text-lg border border-[var(--accent-primary)]/20">1</div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Ask a foundational question</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">Every conversation starts at a Root Node. Establish your main premise, architecture, or core problem.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center font-bold text-lg border border-[var(--accent-primary)]/20">2</div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Branch into specific tangents</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">When the AI mentions a term you want to explore, create a Branch. This isolates the context. The AI remembers the parent context, but new messages in this branch won't affect the parent.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center font-bold text-lg border border-[var(--accent-primary)]/20">3</div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Return to exactly where you left off</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">Finished exploring the tangent? Use the <strong>Return Engine</strong> to instantly jump back to the parent node. The context is perfectly restored, as if the tangent never happened.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Technical Credibility ─────────────────────────────── */}
      <section className="py-24 bg-[var(--bg-elevated)] border-y border-[var(--border-light)] px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
              Built for serious workflows.
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              Solid state management for conversational AI, designed to handle complex context isolation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
            <div className="flex gap-4">
              <Layers className="text-[var(--accent-primary)] shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-[var(--text-primary)] text-lg mb-2">Deterministic Context Resolution</h4>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  Every branch dynamically resolves its context by walking up the ancestral tree. It knows exactly what it inherited and what it generated locally.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <GitBranch className="text-[var(--accent-primary)] shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-[var(--text-primary)] text-lg mb-2">Zero Context Bleed</h4>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  Sibling branches share a parent but have zero awareness of each other. You can test completely contradictory "What if" scenarios safely.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Code className="text-[var(--accent-primary)] shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-[var(--text-primary)] text-lg mb-2">Proactive Ambiguity Resolution</h4>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  Instead of hallucinating when a prompt is vague, the Intelligence layer pauses execution and asks you to clarify the branch direction before proceeding.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Terminal className="text-[var(--accent-primary)] shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-[var(--text-primary)] text-lg mb-2">Headless Architecture</h4>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  The TinexusFlow Engine is completely decoupled from the UI. The core graph logic runs independently and supports hot-swappable LLM providers (OpenAI, Claude, Local).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-6">
            Ready to structure your AI workflows?
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-10">
            Join people who think in branches—researchers, developers, and deep thinkers—to get early access to the TinexusFlow engine.
          </p>
          <div className="flex justify-center mb-6">
            <WaitlistForm />
          </div>
          <p className="text-sm text-[var(--text-tertiary)]">
            We will only email you when early access opens. No spam.
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-light)] py-10 px-6 bg-[var(--bg-secondary)] text-center sm:text-left">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
              <img src={LogoSVG} alt="TinexusFlow" className="w-6 h-6 grayscale" />
              <span className="font-bold text-[var(--text-primary)] tracking-tight">TinexusFlow</span>
            </div>
            <span className="text-[12px] text-[var(--text-tertiary)] font-medium sm:pl-8">v{packageJson.version}</span>
          </div>
          <div className="text-sm text-[var(--text-tertiary)] text-center sm:text-left">
            &copy; {new Date().getFullYear()} Tinexus — A Tinu's Technology. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium text-[var(--text-secondary)]">
            <a href="https://github.com/itzabhishekgour" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">GitHub</a>
            <a href="https://www.linkedin.com/in/abhishek-gour-326a9527b/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">LinkedIn</a>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=mrasgour1004@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">Email</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
