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

const POLL_INITIAL_MS = 3000;
const POLL_MAX_MS     = 30000;
const POLL_BACKOFF    = 1.6;

// Ordered stages mapped to real backend progress_percent thresholds.
// A stage is COMPLETED when percent >= completedAt.
// A stage is ACTIVE   when percent >= prevCompletedAt && percent < completedAt.
const REVIEW_STAGES = [
  { key: 'uploading',   label: 'Uploading documents',              completedAt: 5  },
  { key: 'extracting',  label: 'Extracting document text',          completedAt: 9  },
  { key: 'researching', label: 'Researching official requirements',  completedAt: 11 },
  { key: 'checklist',   label: 'Building document checklist',        completedAt: 31 },
  { key: 'reviewing',   label: 'Reviewing your documents',           completedAt: 56 },
  { key: 'advice',      label: 'Generating improvement advice',      completedAt: 76 },
  { key: 'compiling',   label: 'Compiling final report',             completedAt: 91 },
];

const getStageStatus = (stageIndex, percent) => {
  const stage = REVIEW_STAGES[stageIndex];
  const prevAt = stageIndex === 0 ? 0 : REVIEW_STAGES[stageIndex - 1].completedAt;
  if (percent >= stage.completedAt) return 'completed';
  if (percent >= prevAt)            return 'active';
  return 'pending';
};

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
      <div className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-all z-10"
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
  <div className="px-6 pt-6 pb-4 border-b border-gray-100">
    <div className="flex items-center gap-3 mb-1">
      <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 p-1.5">
        <img src="/logo-ring.png" alt="logo" className="w-full h-full object-contain" style={{ filter: 'brightness(0) saturate(100%) invert(62%) sepia(58%) saturate(600%) hue-rotate(5deg) brightness(90%)' }} />
      </div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
    {subtitle && <p className="text-gray-400 text-xs ml-11">{subtitle}</p>}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────

const SESSION_KEY = 'loopedai_review_id';

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

  // On mount: resume an in-progress review if reviewId is in sessionStorage
  useEffect(() => {
    const savedId = sessionStorage.getItem(SESSION_KEY);
    if (savedId && userData?.access_token) {
      setReviewId(savedId);
      setStep('progress');
      setProgress({ percent: 0, step: 'Resuming review...' });
      startPolling(savedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      sessionStorage.setItem(SESSION_KEY, data.review_id);
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
            // Show 100% briefly so the user sees all stages complete before the report appears
            setProgress({ percent: 100, step: 'Review complete' });
            sessionStorage.removeItem(SESSION_KEY);
            pollRef.current = setTimeout(() => {
              setReport(data.report);
              setStep('report');
              if (onReportReady) onReportReady(data.report, country, visaType);
            }, 900);
            return; // stop polling — transition timeout scheduled above
          }
          if (data.status === 'failed') {
            sessionStorage.removeItem(SESSION_KEY);
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
          <div className="mx-6 mt-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 leading-relaxed">
            We are loopedai, an AI research assistant. We do not issue visas or provide legal advice.
            Our role is to help you understand requirements and improve your application.
            <strong className="block mt-1">Your documents are processed securely in memory and deleted after the report.</strong>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Destination Country *</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Canada, UK, USA, Australia"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Visa Type *</label>
              <input
                type="text"
                value={visaType}
                onChange={(e) => setVisaType(e.target.value)}
                placeholder="e.g. Study Permit, Skilled Worker Visa, F-1"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Your Nationality (optional)</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="e.g. Nigerian, Indian, Brazilian"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all"
              />
            </div>
            <button
              onClick={handleFetchChecklist}
              disabled={!country.trim() || !visaType.trim() || checklistLoading}
              className="w-full bg-gold hover:bg-gold-muted text-gray-900 font-bold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-btn"
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-black/55">
                  Could not load requirements for <strong className="text-black/70">{visaType}</strong> to <strong className="text-black/70">{country}</strong>.
                </p>
                <p className="text-xs text-black/35">Our AI will research the official requirements during your document review.</p>
                <button
                  onClick={() => { setStep('details'); setChecklist(null); }}
                  className="text-xs text-gold/70 hover:text-gold underline transition-all"
                >
                  Try different country / visa type
                </button>
              </div>
            )}

            {checklist.required?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Required</p>
                <ul className="space-y-1">
                  {checklist.required.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-green-400 flex-shrink-0 mt-0.5">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {checklist.conditional?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-amber-600 mb-2 uppercase tracking-wider">Conditional</p>
                <ul className="space-y-1">
                  {checklist.conditional.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600">
                      <span className="text-yellow-400 flex-shrink-0 mt-0.5">&#9888;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {checklist.optional?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Optional (strengthens application)</p>
                <ul className="space-y-1">
                  {checklist.optional.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-400">
                      <span className="text-gray-300 flex-shrink-0 mt-0.5">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-gray-400 pt-2">Do you have these documents ready?</p>
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
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-500 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-all"
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
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              Your documents are processed in memory only and permanently deleted after your report is generated. We never store your files.
            </p>

            {/* Collapsible checklist reference */}
            {checklist && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setChecklistOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
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
                  <div className="px-4 pb-3 space-y-2 border-t border-gray-100">
                    {checklist.required?.length > 0 && (
                      <ul className="space-y-1 pt-2">
                        {checklist.required.map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs text-gray-700">
                            <span className="text-emerald-500 flex-shrink-0">&#10003;</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {checklist.conditional?.length > 0 && (
                      <ul className="space-y-1">
                        {checklist.conditional.map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs text-gray-500">
                            <span className="text-amber-500 flex-shrink-0">&#9888;</span>
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
              className="border-2 border-dashed border-gray-200 hover:border-gold/40 hover:bg-amber-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300 group-hover:text-gold/60 mx-auto mb-3 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-all">Drop files here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOCX, JPG, PNG</p>
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
                  <div key={f.name} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-gold text-xs uppercase font-bold flex-shrink-0">
                        {f.name.split('.').pop()}
                      </span>
                      <span className="text-sm text-gray-700 truncate">{f.name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{(f.size / 1024).toFixed(0)}KB</span>
                    </div>
                    <button onClick={() => removeFile(f.name)} className="text-gray-300 hover:text-red-400 transition-all ml-2 flex-shrink-0">
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
              className="w-full bg-gold hover:bg-gold-muted text-gray-900 font-bold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-btn"
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
            title="Reviewing Your Documents"
            subtitle="Our AI agents are analyzing your application. This typically takes 2–4 minutes."
          />
          <div className="px-6 py-6 flex flex-col gap-5">

            {/* Progress bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-500">{progress.step}</span>
                <span className="text-xs font-semibold text-gold tabular-nums">{progress.percent}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-2.5 rounded-full transition-all duration-700 ease-in-out"
                  style={{
                    width: `${progress.percent}%`,
                    background: 'linear-gradient(90deg, #D4A017, #F5C842)',
                  }}
                />
              </div>
            </div>

            {/* Stage list */}
            <div className="flex flex-col gap-1.5">
              {REVIEW_STAGES.map((stage, i) => {
                const status = getStageStatus(i, progress.percent);
                return (
                  <div
                    key={stage.key}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 ${
                      status === 'active'    ? 'bg-amber-50 border border-gold/20'  :
                      status === 'completed' ? 'bg-emerald-50/60 border border-emerald-100' :
                                              'border border-transparent'
                    }`}
                  >
                    {/* Icon */}
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {status === 'completed' ? (
                        <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : status === 'active' ? (
                        <span className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin block" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border-2 border-gray-200 block" />
                      )}
                    </span>

                    {/* Label */}
                    <span className={`text-sm transition-colors duration-300 ${
                      status === 'active'    ? 'text-gray-900 font-semibold' :
                      status === 'completed' ? 'text-emerald-700 font-medium' :
                                              'text-gray-300'
                    }`}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-gray-400 text-center leading-relaxed pb-1">
              Closing this window won't cancel the review — you can reopen it to see results.
            </p>
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
              onClick={() => { sessionStorage.removeItem(SESSION_KEY); setStep('upload'); setFiles([]); setReport(''); }}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl transition-all text-sm border border-gray-200"
            >
              New Review
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gold hover:bg-gold-muted text-gray-900 font-bold py-2.5 rounded-xl transition-all text-sm shadow-btn"
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
