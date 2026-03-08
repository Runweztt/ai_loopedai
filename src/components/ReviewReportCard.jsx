import React from 'react';

/**
 * Renders the final visa document review report inline in the chat.
 * Parses the markdown report and displays it with styled sections.
 */

const SCORE_BADGE = (score) => {
  if (score >= 80) return { label: 'READY', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' };
  if (score >= 50) return { label: 'NEEDS WORK', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' };
  return { label: 'NOT READY', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' };
};

// Extract score from markdown text like "Overall Readiness Score**: 72/100"
const extractScore = (report) => {
  const match = report.match(/readiness score[^:]*[:\s]+(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

const ReviewReportCard = ({ report, country, visaType }) => {
  if (!report) return null;

  const score = extractScore(report);
  const badge = score !== null ? SCORE_BADGE(score) : null;

  // Split report into lines for basic rendering
  const lines = report.split('\n');

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/3 overflow-hidden mt-2">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 px-5 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-premium-gold text-sm font-bold">Visa Document Review</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-premium-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white/50 text-xs">
              {country} &bull; {visaType}
            </p>
          </div>
          {badge && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${badge.bg} ${badge.border}`}>
              <span className={`text-xs font-bold ${badge.color}`}>{badge.label}</span>
              {score !== null && (
                <span className={`text-lg font-bold ${badge.color}`}>{score}/100</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Report Body — rendered as formatted markdown-style text */}
      <div className="px-5 py-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
        <div className="text-sm text-white/80 leading-relaxed space-y-1">
          {lines.map((line, i) => {
            // H1
            if (line.startsWith('# ')) {
              return <h1 key={i} className="text-base font-bold text-white mt-4 mb-2">{line.slice(2)}</h1>;
            }
            // H2
            if (line.startsWith('## ')) {
              return <h2 key={i} className="text-sm font-bold text-premium-gold mt-3 mb-1">{line.slice(3)}</h2>;
            }
            // H3
            if (line.startsWith('### ')) {
              return <h3 key={i} className="text-sm font-semibold text-white/90 mt-2 mb-1">{line.slice(4)}</h3>;
            }
            // Horizontal rule
            if (line.trim() === '---') {
              return <hr key={i} className="border-white/10 my-3" />;
            }
            // Table header or row
            if (line.startsWith('|')) {
              const cells = line.split('|').filter((c) => c.trim() !== '').map((c) => c.trim());
              const isSeparator = cells.every((c) => /^[-:]+$/.test(c));
              if (isSeparator) return null;
              return (
                <div key={i} className="flex gap-2 text-xs border-b border-white/5 py-1">
                  {cells.map((cell, j) => (
                    <span key={j} className="flex-1 text-white/70">{renderInline(cell)}</span>
                  ))}
                </div>
              );
            }
            // Bullet
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return (
                <div key={i} className="flex gap-2 ml-2">
                  <span className="text-premium-gold mt-0.5 flex-shrink-0">&bull;</span>
                  <span>{renderInline(line.slice(2))}</span>
                </div>
              );
            }
            // Numbered list
            if (/^\d+\.\s/.test(line)) {
              return (
                <div key={i} className="flex gap-2 ml-2">
                  <span className="text-premium-gold/70 flex-shrink-0">{line.match(/^\d+/)[0]}.</span>
                  <span>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
                </div>
              );
            }
            // Empty line
            if (!line.trim()) return <div key={i} className="h-1" />;
            // Normal paragraph
            return <p key={i}>{renderInline(line)}</p>;
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/3 border-t border-white/5 px-5 py-3">
        <p className="text-[10px] text-white/30 text-center">
          This review is for informational purposes only. We do not guarantee visa approval or provide legal advice.
        </p>
      </div>
    </div>
  );
};

/**
 * Render inline markdown — bold and italic only.
 */
function renderInline(text) {
  if (!text) return '';
  // Bold **text** or __text__
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
  return parts.map((part, i) => {
    if (/^\*\*/.test(part)) return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    if (/^__/.test(part)) return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    return part;
  });
}

export default ReviewReportCard;
