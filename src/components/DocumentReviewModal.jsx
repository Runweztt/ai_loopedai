import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ReviewReportCard from './ReviewReportCard';
import { API_BASE } from '../constants';

/**
 * Full Visa Document Review modal flow:
 *   Step 1 — Country + visa type (pre-filled from chat context)
 *   Step 2 — Disclaimer + checklist display
 *   Step 3 — User confirms: Yes / Partial / No
 *   Step 4 — File upload area
 *   Step 5 — Progress tracker (polls backend)
 *   Step 6 — Final report (ReviewReportCard)
 */

const STEPS = ['details', 'checklist', 'upload', 'progress', 'report'];

const ACCEPTED_TYPES = '.pdf,.docx,.jpg,.jpeg,.png';
const MAX_FILES = 10;

const POLL_INITIAL_MS = 3000;   // first poll after 3 s
const POLL_MAX_MS     = 30000;  // cap at 30 s between polls
const POLL_BACKOFF    = 1.6;    // multiply interval each cycle

// ── Sub-components ────────────────────────────────────────────────────

// Rendered via portal directly onto document.body so that position:fixed
// always resolves to the viewport — immune to any ancestor transform/opacity
// animations (e.g. StepTransition fadeSlideUp) that would otherwise break
// fixed positioning per the CSS containing-block spec.
const ModalShell = ({ onClose, children }) => {
  // Prevent page scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-all z-10"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

const ModalHeader = ({ title, subtitle }) => (
  <div className="px-6 pt-6 pb-4 border-b border-white/5">
    <div className="flex items-center gap-3 mb-1">
      <div className="w-8 h-8 bg-premium-gold/20 rounded-xl flex items-center justify-center flex-shrink-0 p-1.5">
        <img src="/logo-ring.png" alt="logo" className="w-full h-full object-contain brightness-0 invert" />
      </div>
      <h2 className="text-base font-bold text-white">{title}</h2>
    </div>
    {subtitle && <p className="text-white/40 text-xs ml-11">{subtitle}</p>}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────

const DocumentReviewModal = ({ onClose, onReportReady, chatContext = {}, userData }) => {
  const [step, setStep] = useState('details');

  // Step 1: form state
  const [country, setCountry] = useState(chatContext.country || '');
  const [visaType, setVisaType] = useState(chatContext.visa_type || '');
  const [nationality, setNationality] = useState(chatContext.nationality || '');

  // Step 2: checklist
  const [checklist, setChecklist] = useState(null);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistError, setChecklistError] = useState('');

  // Step 3/4: file upload
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [checklistOpen, setChecklistOpen] = useState(false);

  // Step 5: progress
  const [reviewId, setReviewId] = useState(null);
  const [progress, setProgress] = useState({ percent: 0, step: 'Starting...' });
  const [reviewError, setReviewError] = useState('');
  const pollRef = useRef(null);

  // Step 6: report
  const [report, setReport] = useState(null);

  // Clean up polling timeout on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, []);

  // ── Step 1 → 2: Fetch checklist ──────────────────────────────────

  const handleFetchChecklist = async () => {
    if (!country.trim() || !visaType.trim()) return;
    setChecklistLoading(true);
    setChecklistError('');
    try {
      const res = await fetch(`${API_BASE}/api/visa-review/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, visa_type: visaType, chat_history: [] }),
      });
      if (!res.ok) throw new Error('Failed to load checklist');
      const data = await res.json();
      setChecklist(data);
      setStep('checklist');
    } catch (e) {
      setChecklistError('Could not load checklist. You can still proceed to upload your documents.');
      setChecklist({ required: [], conditional: [], optional: [], source_label: '', cache_warning: '' });
      setStep('checklist');
    } finally {
      setChecklistLoading(false);
    }
  };

  // ── Step 4: File handling ─────────────────────────────────────────

  const handleFilesSelected = useCallback((selectedFiles) => {
    const arr = Array.from(selectedFiles);
    const valid = arr.filter((f) => /\.(pdf|docx|jpg|jpeg|png)$/i.test(f.name));
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      const merged = [...prev, ...valid.filter((f) => !names.has(f.name))];
      if (merged.length > MAX_FILES) {
        setReviewError(`Maximum ${MAX_FILES} files per review. Extra files were not added.`);
        return merged.slice(0, MAX_FILES);
      }
      setReviewError('');
      return merged;
    });
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    handleFilesSelected(e.dataTransfer.files);
  }, [handleFilesSelected]);

  const removeFile = (name) => setFiles((prev) => prev.filter((f) => f.name !== name));

  // ── Step 4 → 5: Start review ──────────────────────────────────────

  const handleStartReview = async () => {
    if (!files.length) return;
    setStep('progress');
    setProgress({ percent: 5, step: 'Uploading documents...' });
    setReviewError('');

    try {
      const formData = new FormData();
      formData.append('session_id', userData?.id || 'anonymous');
      formData.append('country', country);
      formData.append('visa_type', visaType);
      formData.append('nationality', nationality || 'Not provided');
      formData.append('chat_history', '[]');
      files.forEach((f) => formData.append('files', f));

      const res = await fetch(`${API_BASE}/api/visa-review/start`, {
        method: 'POST',
        headers: userData?.access_token ? { Authorization: `Bearer ${userData.access_token}` } : {},
        body: formData,
      });

      if (res.status === 402) {
        throw new Error('Premium subscription required to use document review. Contact info@loopedai.io to upgrade.');
      }
      if (res.status === 503) {
        throw new Error('Document review is temporarily unavailable. Please try again later or contact support at info@loopedai.io.');
      }
      if (!res.ok) {
        // Never display raw server error details — map to a safe message
        throw new Error('Something went wrong starting your review. Please try again or contact support at info@loopedai.io.');
      }

      const data = await res.json();
      setReviewId(data.review_id);
      startPolling(data.review_id);
    } catch (e) {
      setReviewError(e.message || 'Something went wrong. Please try again.');
      setStep('upload');
    }
  };

  const startPolling = (id) => {
    let interval = POLL_INITIAL_MS;

    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/visa-review/${id}/status`, {
          headers: userData?.access_token ? { Authorization: `Bearer ${userData.access_token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          setProgress({ percent: data.progress_percent, step: data.current_step });

          if (data.status === 'complete' && data.report) {
            setReport(data.report);
            setStep('report');
            if (onReportReady) onReportReady(data.report, country, visaType);
            return; // stop — no next timeout
          }
          if (data.status === 'failed') {
            setReviewError('We could not complete the document review. Please try again or contact support at info@loopedai.io.');
            setStep('upload');
            return; // stop — no next timeout
          }
        }
      } catch {
        // Silently ignore transient network errors during polling
      }

      // Backoff: grow interval up to the cap, then schedule next poll
      interval = Math.min(interval * POLL_BACKOFF, POLL_MAX_MS);
      pollRef.current = setTimeout(poll, interval);
    };

    // Kick off the first poll after the initial delay
    pollRef.current = setTimeout(poll, interval);
  };

  // ── Render ────────────────────────────────────────────────────────

  return (
    <ModalShell onClose={onClose}>

      {/* ── STEP: details ── */}
      {step === 'details' && (
        <>
          <ModalHeader
            title="Visa Document Review"
            subtitle="We'll check your documents against official requirements."
          />
          {/* Disclaimer */}
          <div className="mx-6 mt-4 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 leading-relaxed">
            We are loopedai, an AI research assistant. We do not issue visas or provide legal advice.
            Our role is to help you understand requirements and improve your application.
            <strong className="block mt-1">Your documents are processed securely in memory and deleted after the report.</strong>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Destination Country *</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Canada, UK, USA, Australia"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-premium-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Visa Type *</label>
              <input
                type="text"
                value={visaType}
                onChange={(e) => setVisaType(e.target.value)}
                placeholder="e.g. Study Permit, Skilled Worker Visa, F-1"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-premium-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Your Nationality (optional)</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="e.g. Nigerian, Indian, Brazilian"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-premium-gold/50 transition-all"
              />
            </div>
            <button
              onClick={handleFetchChecklist}
              disabled={!country.trim() || !visaType.trim() || checklistLoading}
              className="w-full bg-premium-gold hover:bg-yellow-500 text-premium-dark font-bold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              {checklistLoading ? 'Loading checklist...' : 'Show Required Documents'}
            </button>
            {checklistError && <p className="text-red-400 text-xs text-center">{checklistError}</p>}
          </div>
        </>
      )}

      {/* ── STEP: checklist ── */}
      {step === 'checklist' && checklist && (
        <>
          <ModalHeader
            title={`Documents for ${visaType} — ${country}`}
            subtitle={checklist.source_label || 'Based on official requirements'}
          />
          <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
            {checklist.cache_warning && (
              <p className="text-xs text-yellow-400/70 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
                {checklist.cache_warning}
              </p>
            )}

            {/* Empty state — API failed or returned no items */}
            {!checklist.required?.length && !checklist.conditional?.length && !checklist.optional?.length && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-white/50">
                  Could not load requirements for <strong className="text-white/70">{visaType}</strong> to <strong className="text-white/70">{country}</strong>.
                </p>
                <p className="text-xs text-white/30">Our AI will research the official requirements during your document review.</p>
                <button
                  onClick={() => { setStep('details'); setChecklist(null); }}
                  className="text-xs text-premium-gold/70 hover:text-premium-gold underline transition-all"
                >
                  Try different country / visa type
                </button>
              </div>
            )}

            {checklist.required?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">Required</p>
                <ul className="space-y-1">
                  {checklist.required.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-white/80">
                      <span className="text-green-400 flex-shrink-0 mt-0.5">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {checklist.conditional?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-yellow-400/70 mb-2 uppercase tracking-wider">Conditional</p>
                <ul className="space-y-1">
                  {checklist.conditional.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-white/60">
                      <span className="text-yellow-400 flex-shrink-0 mt-0.5">&#9888;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {checklist.optional?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-white/30 mb-2 uppercase tracking-wider">Optional (strengthens application)</p>
                <ul className="space-y-1">
                  {checklist.optional.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-white/40">
                      <span className="text-white/30 flex-shrink-0 mt-0.5">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-white/40 pt-2">Do you have these documents ready?</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStep('upload')}
                className="flex-1 bg-green-500/20 border border-green-500/30 text-green-400 font-semibold py-2.5 rounded-xl text-sm hover:bg-green-500/30 transition-all"
              >
                Yes, I have them
              </button>
              <button
                onClick={() => setStep('upload')}
                className="flex-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-semibold py-2.5 rounded-xl text-sm hover:bg-yellow-400/20 transition-all"
              >
                I have some
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-white/5 border border-white/10 text-white/50 font-semibold py-2.5 rounded-xl text-sm hover:bg-white/10 transition-all"
              >
                Not yet
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── STEP: upload ── */}
      {step === 'upload' && (
        <>
          <ModalHeader
            title="Upload Your Documents"
            subtitle="PDF, DOCX, JPG, PNG accepted. Up to 10 files, max 10MB each."
          />
          <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
            <p className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
              Your documents are processed in memory only and permanently deleted after your report is generated. We never store your files.
            </p>

            {/* Collapsible checklist reference */}
            {checklist && (
              <div className="border border-white/10 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setChecklistOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-white/60 hover:text-white/80 hover:bg-white/5 transition-all"
                >
                  <span>Required documents for {visaType} — {country}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform duration-200 ${checklistOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {checklistOpen && (
                  <div className="px-4 pb-3 space-y-2 border-t border-white/5">
                    {checklist.required?.length > 0 && (
                      <ul className="space-y-1 pt-2">
                        {checklist.required.map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs text-white/70">
                            <span className="text-green-400 flex-shrink-0">&#10003;</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {checklist.conditional?.length > 0 && (
                      <ul className="space-y-1">
                        {checklist.conditional.map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs text-white/50">
                            <span className="text-yellow-400 flex-shrink-0">&#9888;</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/15 hover:border-premium-gold/40 rounded-2xl p-8 text-center cursor-pointer transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/20 group-hover:text-premium-gold/50 mx-auto mb-3 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-white/50 group-hover:text-white/70 transition-all">Drop files here or click to browse</p>
              <p className="text-xs text-white/25 mt-1">PDF, DOCX, JPG, PNG</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f) => (
                  <div key={f.name} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-premium-gold/70 text-xs uppercase font-bold flex-shrink-0">
                        {f.name.split('.').pop()}
                      </span>
                      <span className="text-sm text-white/70 truncate">{f.name}</span>
                      <span className="text-xs text-white/30 flex-shrink-0">{(f.size / 1024).toFixed(0)}KB</span>
                    </div>
                    <button onClick={() => removeFile(f.name)} className="text-white/20 hover:text-red-400 transition-all ml-2 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {reviewError && (
              <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{reviewError}</p>
            )}

            <button
              onClick={handleStartReview}
              disabled={!files.length}
              className="w-full bg-premium-gold hover:bg-yellow-500 text-premium-dark font-bold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Start loopedai Review ({files.length} file{files.length !== 1 ? 's' : ''})
            </button>
          </div>
        </>
      )}

      {/* ── STEP: progress ── */}
      {step === 'progress' && (
        <>
          <ModalHeader
            title="Reviewing Your Documents..."
            subtitle="Our AI agents are analyzing your application. This typically takes 2–4 minutes."
          />
          <div className="px-6 py-8 flex flex-col items-center gap-6">
            {/* Progress bar */}
            <div className="w-full">
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>{progress.step}</span>
                <span>{progress.percent}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-premium-gold rounded-full h-2 transition-all duration-700"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
            {progress.percent > 0 && progress.percent < 100 && (
              <p className="text-xs text-white/30 text-center">
                Please keep this window open — closing it will not cancel the review, but you will need to refresh to see results.
              </p>
            )}

            {/* Agent steps */}
            {[
              'Fetching official requirements...',
              'Building document checklist...',
              'Reviewing your documents...',
              'Generating improvement advice...',
              'Compiling final report...',
            ].map((label, i) => {
              const stepPct = (i + 1) * 20;
              const done = progress.percent >= stepPct;
              const active = progress.percent >= stepPct - 15 && progress.percent < stepPct;
              return (
                <div key={i} className={`flex items-center gap-3 w-full text-sm transition-all ${done ? 'text-green-400' : active ? 'text-white/80' : 'text-white/20'}`}>
                  <span className="flex-shrink-0">
                    {done ? '✓' : active ? (
                      <span className="inline-block w-3 h-3 border-2 border-premium-gold border-t-transparent rounded-full animate-spin" />
                    ) : '○'}
                  </span>
                  {label}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── STEP: report ── */}
      {step === 'report' && report && (
        <>
          <div className="p-4 overflow-y-auto flex-1">
            <ReviewReportCard report={report} country={country} visaType={visaType} />
          </div>
          <div className="px-4 pb-4 pt-2 flex gap-3">
            <button
              onClick={() => { setStep('upload'); setFiles([]); setReport(''); }}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 font-semibold py-2.5 rounded-xl transition-all text-sm border border-white/10"
            >
              New Review
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-premium-gold hover:bg-yellow-500 text-premium-dark font-bold py-2.5 rounded-xl transition-all text-sm"
            >
              Done
            </button>
          </div>
        </>
      )}

    </ModalShell>
  );
};

export default DocumentReviewModal;
