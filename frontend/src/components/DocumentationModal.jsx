import React, { useState } from 'react';
import { X, Download, Printer, FileText, CheckCircle, Database, Cpu, Sparkles, Layers, ShieldCheck, HelpCircle } from 'lucide-react';

export function DocumentationModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    // Generate and download document as printable PDF view
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#F7F5F0] border border-[#2D7D7D]/20 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#192A2A]">
        
        {/* Top Header Controls Bar */}
        <div className="bg-[#2D7D7D] text-white px-6 py-4 flex items-center justify-between shadow-md border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-2xs">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm tracking-tight text-white">CompareX System & Architecture Documentation</h3>
                <span className="bg-[#E8935C] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  PDF Specification
                </span>
              </div>
              <p className="text-[11px] text-white/80 font-medium">Official Technical Reference & User Guide v1.0.0</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer shadow-2xs"
              title="Download or Print PDF Document"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer"
              title="Print Document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button 
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Documentation Navigation Bar */}
        <div className="bg-white border-b border-[#2D7D7D]/15 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 shadow-2xs">
          {[
            { id: 'overview', label: '1. Overview', icon: FileText },
            { id: 'architecture', label: '2. System Architecture', icon: Cpu },
            { id: 'algorithms', label: '3. ML & Recommendation', icon: Database },
            { id: 'ai-assistant', label: '4. AI Comparative Synthesis', icon: Sparkles },
            { id: 'guide', label: '5. User Manual & Workflow', icon: Layers },
            { id: 'api', label: '6. API Specification', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  active 
                    ? 'bg-[#2D7D7D] text-white shadow-xs' 
                    : 'text-[#586666] hover:bg-[#F7F5F0] hover:text-[#192A2A]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* PDF Document Page Body Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-[#FAF9F5]">
          
          {/* Printable Document Container */}
          <div className="bg-white border border-[#2D7D7D]/15 rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(45,125,125,0.06)] max-w-4xl mx-auto printable-document">
            
            {/* Document Header Banner */}
            <div className="border-b-2 border-[#2D7D7D] pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#2D7D7D] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Technical Whitepaper & Manual
                  </span>
                  <span className="text-xs text-[#8A8680] font-mono">Ref: CPX-DOC-2026</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#192A2A] tracking-tight">
                  CompareX: Cross-Domain Recommendation & Analytics Intelligence Platform
                </h1>
                <p className="text-xs sm:text-sm text-[#586666] mt-1 font-medium">
                  Architecture, Machine Learning Algorithms, Collaborative Synthesis & Operational Guide
                </p>
              </div>

              <div className="text-right shrink-0 bg-[#E7F2F2] p-3 rounded-2xl border border-[#2D7D7D]/20">
                <div className="text-[10px] font-bold text-[#8A8680] uppercase tracking-wider">Version</div>
                <div className="text-sm font-extrabold text-[#2D7D7D]">v1.0.0 Enterprise</div>
                <div className="text-[10px] text-[#586666] mt-0.5">Updated: Sept 2026</div>
              </div>
            </div>

            {/* TAB CONTENT: SECTION 1 OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-black text-[#192A2A] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-[#2D7D7D] text-white text-xs flex items-center justify-center font-bold">1</span>
                  Executive Summary & Core Objectives
                </h2>

                <p className="text-xs sm:text-sm text-[#192A2A] leading-relaxed font-medium">
                  <strong>CompareX</strong> is an advanced, high-performance recommendation and analytical synthesis platform designed specifically for highly sparse, heterogeneous datasets. Modern web platforms frequently suffer from dataset sparsity where users interact with only a tiny fraction of available inventory, making conventional recommendation engines inaccurate or computationally inefficient.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                  <div className="bg-[#F7F5F0] border border-[#2D7D7D]/15 rounded-2xl p-4">
                    <h4 className="font-extrabold text-xs text-[#2D7D7D] mb-1.5 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[#2D7D7D]" />
                      Multi-Domain Normalization
                    </h4>
                    <p className="text-xs text-[#586666] leading-normal font-medium">
                      Seamlessly bridges explicit 1-10 rating scales (BookCrossing), implicit playtime hours (Steam Games), and media series vectors (Anime).
                    </p>
                  </div>

                  <div className="bg-[#F7F5F0] border border-[#2D7D7D]/15 rounded-2xl p-4">
                    <h4 className="font-extrabold text-xs text-[#2D7D7D] mb-1.5 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[#2D7D7D]" />
                      Data Honesty Engine
                    </h4>
                    <p className="text-xs text-[#586666] leading-normal font-medium">
                      Eliminates hallucinated fallback values. Missing categories, genres, or release years are explicitly flagged rather than masked.
                    </p>
                  </div>
                </div>

                <div className="bg-[#E7F2F2] border border-[#2D7D7D]/20 rounded-2xl p-5">
                  <h3 className="text-xs font-extrabold text-[#2D7D7D] uppercase tracking-wider mb-2">Key Operational Capabilities</h3>
                  <ul className="text-xs text-[#192A2A] space-y-2 font-medium list-disc list-inside">
                    <li><strong>Cold-Start Preference Profiling:</strong> Onboards new users through interactive genre & rating selection to mitigate new-user matrix sparsity.</li>
                    <li><strong>Semantic Constraint Extraction:</strong> Natural language user prompts are automatically parsed into precise filtering metadata (author, publication era, playtime bounds, anime type).</li>
                    <li><strong>Side-by-Side Analytical Matrix:</strong> Direct multi-attribute comparison with dynamic score scaling and AI-grounded trade-off summaries.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SECTION 2 ARCHITECTURE */}
            {activeTab === 'architecture' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-black text-[#192A2A] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-[#2D7D7D] text-white text-xs flex items-center justify-center font-bold">2</span>
                  System Architecture & Data Flow
                </h2>

                <p className="text-xs sm:text-sm text-[#192A2A] leading-relaxed font-medium">
                  The CompareX infrastructure is built on a modular, decoupled microservice pattern separating high-throughput API gateway routing from specialized machine learning pipelines.
                </p>

                {/* System Architecture Diagram Card */}
                <div className="bg-[#192A2A] text-white p-6 rounded-2xl font-mono text-xs shadow-md space-y-4">
                  <div className="text-[#E8935C] font-bold border-b border-white/10 pb-2 flex justify-between items-center">
                    <span>SYSTEM TOPOLOGY & DATA PIPELINE</span>
                    <span className="text-[10px] text-white/50">Production Architecture</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 p-3 rounded-xl border border-white/15">
                      <div className="font-bold text-[#E7F2F2] mb-1">React Frontend</div>
                      <div className="text-[10px] text-white/70">Vite + Tailwind CSS + Lucide Icons</div>
                    </div>

                    <div className="bg-white/10 p-3 rounded-xl border border-white/15">
                      <div className="font-bold text-[#E8935C] mb-1">Express API Gateway</div>
                      <div className="text-[10px] text-white/70">Auth JWT, Cookies, CORS, Service Proxy</div>
                    </div>

                    <div className="bg-white/10 p-3 rounded-xl border border-white/15">
                      <div className="font-bold text-amber-200 mb-1">FastAPI ML Service</div>
                      <div className="text-[10px] text-white/70">Surprise SVD, Gemini 2.5/3.1 + Groq LLM</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-white/80 leading-relaxed pt-2 border-t border-white/10 text-center font-sans">
                    MongoDB Atlas indexed storage (User Profiles, BookCrossing, Steam & Anime Datasets) with async connection pooling.
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-[#192A2A] uppercase tracking-wider">Database & Indexing Optimization</h4>
                  <p className="text-xs text-[#586666] leading-relaxed font-medium">
                    To eliminate catalog query latency, MongoDB indexing is enforced on `domain_item_id` and string metadata fields. Queries perform covered index scans rather than collection scans, reducing lookup overhead from over 3,500ms down to sub-15ms.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SECTION 3 ALGORITHMS */}
            {activeTab === 'algorithms' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-black text-[#192A2A] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-[#2D7D7D] text-white text-xs flex items-center justify-center font-bold">3</span>
                  Machine Learning & Recommendation Pipelines
                </h2>

                <p className="text-xs sm:text-sm text-[#192A2A] leading-relaxed font-medium">
                  CompareX employs domain-isolated collaborative filtering models combined with hybrid semantic matching algorithms.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#F7F5F0] border border-[#2D7D7D]/15 rounded-2xl p-5 space-y-2">
                    <h3 className="font-extrabold text-xs text-[#2D7D7D] uppercase tracking-wider">BookCrossing Model (Explicit)</h3>
                    <p className="text-xs text-[#586666] leading-relaxed font-medium">
                      Utilizes SVD matrix factorization trained on explicit ratings (1–10). Predicts user preference based on latent user-item interaction vectors.
                    </p>
                  </div>

                  <div className="bg-[#F7F5F0] border border-[#2D7D7D]/15 rounded-2xl p-5 space-y-2">
                    <h3 className="font-extrabold text-xs text-[#2D7D7D] uppercase tracking-wider">Steam Games Model (Implicit)</h3>
                    <p className="text-xs text-[#586666] leading-relaxed font-medium">
                      Transforms raw playtime hours into log-scaled implicit feedback scores, handling heavy-tail engagement distributions cleanly.
                    </p>
                  </div>

                  <div className="bg-[#F7F5F0] border border-[#2D7D7D]/15 rounded-2xl p-5 space-y-2">
                    <h3 className="font-extrabold text-xs text-[#2D7D7D] uppercase tracking-wider">Anime Model (Series SVD)</h3>
                    <p className="text-xs text-[#586666] leading-relaxed font-medium">
                      Predicts user rating affinities across TV series, movies, and OVAs using dense collaborative factorization vectors.
                    </p>
                  </div>
                </div>

                <div className="bg-[#E7F2F2] border border-[#2D7D7D]/20 rounded-2xl p-5">
                  <h4 className="font-extrabold text-xs text-[#2D7D7D] mb-2 uppercase tracking-wide">Parallel LLM Constraint Extraction</h4>
                  <p className="text-xs text-[#192A2A] leading-relaxed font-medium">
                    When a user sends a prompt, intent classification and constraint extraction run concurrently in a `ThreadPoolExecutor`. The system extracts explicit parameters (genres, release dates, author preferences) while generating grounded similarity tags.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SECTION 4 AI ASSISTANT */}
            {activeTab === 'ai-assistant' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-black text-[#192A2A] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-[#2D7D7D] text-white text-xs flex items-center justify-center font-bold">4</span>
                  AI Comparative Synthesis & Fallback Strategy
                </h2>

                <p className="text-xs sm:text-sm text-[#192A2A] leading-relaxed font-medium">
                  The AI Assistant provides intelligent interactive summaries, item explanations, and deep multi-item trade-off comparisons.
                </p>

                <div className="bg-white border border-[#2D7D7D]/20 rounded-2xl p-5 shadow-2xs space-y-3">
                  <h3 className="font-extrabold text-xs text-[#192A2A] uppercase tracking-wider">Hybrid LLM Orchestration Architecture</h3>
                  <p className="text-xs text-[#586666] leading-relaxed font-medium">
                    CompareX leverages a multi-tiered hybrid client ensuring 99.9% uptime even under heavy API quota throttling:
                  </p>
                  <ol className="text-xs text-[#192A2A] space-y-2 font-medium list-decimal list-inside pl-2">
                    <li><strong>Primary Provider:</strong> Gemini 2.5/3.1 Flash for rapid constraint parsing & recommendation explanations.</li>
                    <li><strong>Secondary Failover:</strong> Groq LLaMA 3.3 70B for zero-latency fallback when Gemini rate limits occur.</li>
                    <li><strong>Tertiary Provider:</strong> Claude Anthropic client for high-context analytical synthesis.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SECTION 5 USER MANUAL */}
            {activeTab === 'guide' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-black text-[#192A2A] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-[#2D7D7D] text-white text-xs flex items-center justify-center font-bold">5</span>
                  User Manual & Step-by-Step Workflow Guide
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      step: 'Step 1: Domain Selection & Catalog Exploration',
                      desc: 'Select your active domain (BookCrossing Books, Steam Video Games, or Anime Series) using the domain switcher at the top of the Browse interface.'
                    },
                    {
                      step: 'Step 2: AI Prompting & Constraint Filtering',
                      desc: 'Use the Floating AI Assistant chat bubble to type natural queries (e.g. "Recommend action anime series with high ratings"). The assistant extracts constraints and filters candidates.'
                    },
                    {
                      step: 'Step 3: Compare Basket Selection',
                      desc: 'Click "Add to Compare" on candidate item cards. Selected items populate the floating Compare Basket centered at the bottom of the screen.'
                    },
                    {
                      step: 'Step 4: Multi-Item Comparison Matrix',
                      desc: 'Click "Compare Now" to enter the Comparison Studio. View side-by-side metric tables, popularity match percentages, and automated AI trade-off analysis.'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-[#F7F5F0] border border-[#2D7D7D]/15 rounded-2xl p-4 flex gap-4 items-start">
                      <div className="w-7 h-7 rounded-xl bg-[#2D7D7D] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-[#192A2A]">{item.step}</h4>
                        <p className="text-xs text-[#586666] mt-1 leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: SECTION 6 API SPECIFICATION */}
            {activeTab === 'api' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-black text-[#192A2A] flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-[#2D7D7D] text-white text-xs flex items-center justify-center font-bold">6</span>
                  API Specification Reference
                </h2>

                <div className="space-y-3 font-mono text-xs">
                  {[
                    { method: 'POST', endpoint: '/api/recommend/bookcrossing', desc: 'Fetches SVD recommendations and constraint matches for books.' },
                    { method: 'POST', endpoint: '/api/recommend/steam', desc: 'Fetches implicit playtime recommendation vectors for games.' },
                    { method: 'POST', endpoint: '/api/recommend/anime', desc: 'Fetches SVD rating matrix factorization recommendations for anime.' },
                    { method: 'POST', endpoint: '/api/compare/:domain', desc: 'Generates multi-item attribute comparison payload.' },
                    { method: 'POST', endpoint: '/api/assistant/chat', desc: 'Executes parallel intent parsing & recommendation explanation.' },
                    { method: 'POST', endpoint: '/api/assistant/compare_chat', desc: 'Synthesizes AI comparative trade-offs for selected items.' },
                  ].map((api, idx) => (
                    <div key={idx} className="bg-[#192A2A] text-white p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#E8935C] text-white text-[10px] font-bold">{api.method}</span>
                        <span className="font-bold text-[#E7F2F2]">{api.endpoint}</span>
                      </div>
                      <span className="text-[11px] text-white/70 font-sans">{api.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Footer */}
            <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#8A8680] font-medium gap-2">
              <div>© 2026 CompareX Analytics Inc. All Rights Reserved.</div>
              <div>Confidential Technical Documentation • Page {activeTab === 'overview' ? '1' : activeTab === 'architecture' ? '2' : activeTab === 'algorithms' ? '3' : activeTab === 'ai-assistant' ? '4' : activeTab === 'guide' ? '5' : '6'} of 6</div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="bg-white border-t border-[#2D7D7D]/15 px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#586666] font-semibold">
            <HelpCircle className="w-4 h-4 text-[#2D7D7D]" />
            <span>Need further help? Access the interactive AI Assistant anytime in the app.</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-[#2D7D7D] hover:bg-[#1E5C5C] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#2D7D7D]/20 cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-[#F7F5F0] hover:bg-[#EAE8E4] text-[#192A2A] rounded-xl text-xs font-bold transition-all border border-[#2D7D7D]/15 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
