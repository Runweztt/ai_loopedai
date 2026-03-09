import React, { useCallback, useEffect, useRef, useState } from 'react';
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

const POLL_INTERVAL_MS = 3000;

// ── Sub-components ────────────────────────────────────────────────────

const ModalShell = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
    <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
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
  </div>
);

const ModalHeader = ({ title, subtitle }) => (
  <div className="px-6 pt-6 pb-4 border-b border-white/5">
    <div className="flex items-center gap-3 mb-1">
      <div className="w-8 h-8 bg-premium-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-premium-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
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

  // Step 5: progress
  const [reviewId, setReviewId] = useState(null);
  const [progress, setProgress] = useState({ percent: 0, step: 'Starting...' });
  const [reviewError, setReviewError] = useState('');
  const pollRef = useRef(null);

  // Step 6: report
  const [report, setReport] = useState(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
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
    const valid = arr.filter((f) => {
      const ok = /\.(pdf|docx|jpg|jpeg|png)$/i.test(f.name);
      return ok;
    });
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !names.has(f.name))];
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

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to start review');
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
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/visa-review/${id}/status`, {
          headers: userData?.access_token ? { Authorization: `Bearer ${userData.access_token}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json();

        setProgress({ percent: data.progress_percent, step: data.current_step });

        if (data.status === 'complete' && data.report) {
          clearInterval(pollRef.current);
          setReport(data.report);
          setStep('report');
          if (onReportReady) onReportReady(data.report, country, visaType);
        } else if (data.status === 'failed') {
          clearInterval(pollRef.current);
          setReviewError(data.error || 'Review failed. Please try again.');
          setStep('upload');
        }
      } catch {
        // Silently ignore transient network errors during polling
      }
    }, POLL_INTERVAL_MS);
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
            We are an AI research assistant. We do not issue visas or provide legal advice.
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
            subtitle="PDF, DOCX, JPG, PNG accepted. Max 10MB per file."
          />
          <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
            <p className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
              Your documents are processed in memory only and permanently deleted after your report is generated. We never store your files.
            </p>

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
              Start AI Review ({files.length} file{files.length !== 1 ? 's' : ''})
            </button>
          </div>
        </>
      )}

      {/* ── STEP: progress ── */}
      {step === 'progress' && (
        <>
          <ModalHeader
            title="Reviewing Your Documents..."
            subtitle="Our AI agents are analyzing your application. This takes 1-2 minutes."
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
          <ModalHeader
            title="Review Complete"
            subtitle={`${visaType} — ${country}`}
          />
          <div className="px-4 py-4 overflow-y-auto flex-1">
            <ReviewReportCard report={report} country={country} visaType={visaType} />
          </div>
          <div className="px-6 pb-5 pt-2 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-premium-gold hover:bg-yellow-500 text-premium-dark font-bold py-3 rounded-xl transition-all text-sm"
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
