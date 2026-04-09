import React, { useMemo, useState } from 'react';

/**
 * Visa document review report — fully structured rendering.
 *
 * Layout:
 *   1. Score gauge (SVG arc) + quick-stats strip (passed / partial / issues)
 *   2. Collapsible sections per ## heading — tables, bullets, numbered lists
 *   3. Status pills (PASS / PARTIAL / FAIL / MISSING / CRITICAL / RECOMMENDED)
 *   4. Download-as-text button
 *   5. Disclaimer footer
 */

// ── Score config ──────────────────────────────────────────────────────

const scoreCfg = (s) => {
  if (s >= 80) return { label: 'READY',     hex: '#4ade80', tw: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/25' };
  if (s >= 50) return { label: 'NEEDS WORK',hex: '#facc15', tw: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/25' };
  return         { label: 'NOT READY',      hex: '#f87171', tw: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/25'   };
};

// ── Status pill map ───────────────────────────────────────────────────

const STATUS = {
  PASS:        { cls: 'bg-green-500/20  text-green-400  border-green-500/30',  icon: '✓' },
  PARTIAL:     { cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '△' },
  FAIL:        { cls: 'bg-red-500/20    text-red-400    border-red-500/30',    icon: '✕' },
  MISSING:     { cls: 'bg-red-500/20    text-red-400    border-red-500/30',    icon: '!' },
  CRITICAL:    { cls: 'bg-red-500/20    text-red-400    border-red-500/30',    icon: '‼' },
  RECOMMENDED: { cls: 'bg-blue-500/20   text-blue-400   border-blue-500/30',   icon: '→' },
  HIGH:        { cls: 'bg-red-500/20    text-red-400    border-red-500/30',    icon: '' },
  MEDIUM:      { cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '' },
  LOW:         { cls: 'bg-green-500/20  text-green-400  border-green-500/30',  icon: '' },
};

const matchStatus = (cell) => {
  const u = cell.trim().toUpperCase();
  // Exact match
  if (STATUS[u]) return { key: u, ...STATUS[u] };
  // Starts with a keyword (e.g. "PASS ✓" or "FAIL — expired")
  for (const key of Object.keys(STATUS)) {
    if (u.startsWith(key + ' ') || u.startsWith(key + '\t') || u.startsWith(key + '—') || u.startsWith(key + '-')) {
      return { key, ...STATUS[key] };
    }
  }
  // Short cell (< 20 chars) containing a keyword — handles "✓ PASS", "△ PARTIAL"
  if (u.length < 20) {
    for (const key of Object.keys(STATUS)) {
      if (new RegExp(`\\b${key}\\b`).test(u)) return { key, ...STATUS[key] };
    }
  }
  return null;
};

// ── Helpers ───────────────────────────────────────────────────────────

const extractScore = (text) => {
  const m = text.match(/readiness score[^:\d]*[:\s*]*(\d{1,3})/i);
  return m ? Math.min(100, Math.max(0, parseInt(m[1], 10))) : null;
};

const countStatuses = (lines) => {
  const text = lines.join('\n');

  // Priority 1 — extract from prose summaries the LLM writes, e.g.:
  //   "0 fully passed, 1 partial, 2 failed. 5 mandatory documents are entirely missing."
  const passedM  = text.match(/(\d+)\s+(?:fully\s+)?pass(?:ed)?/i);
  const partialM = text.match(/(\d+)\s+partial/i);
  const failedM  = text.match(/(\d+)\s+fail(?:ed)?/i);
  const missingM = text.match(/(\d+)\s+(?:\w+\s+){0,5}missing/i);

  if (passedM || partialM || failedM || missingM) {
    return {
      passed:  passedM  ? parseInt(passedM[1],  10) : 0,
      partial: partialM ? parseInt(partialM[1], 10) : 0,
      issues:  (failedM  ? parseInt(failedM[1],  10) : 0)
             + (missingM ? parseInt(missingM[1], 10) : 0),
    };
  }

  // Priority 2 — scan table cells for exact status keywords
  let passed = 0, partial = 0, issues = 0;
  lines.filter((l) => l.startsWith('|')).forEach((line) => {
    line.split('|').forEach((cell) => {
      const u = cell.trim().toUpperCase();
      if (/\bPASS\b/.test(u) && !/\bPARTIAL\b/.test(u)) passed++;
      else if (/\bPARTIAL\b/.test(u))                    partial++;
      else if (/\b(FAIL|MISSING)\b/.test(u))              issues++;
    });
  });
  return { passed, partial, issues };
};

/** Group consecutive table lines into table blocks, other lines stay as-is. */
const toBlocks = (lines) => {
  const blocks = [];
  let buf = [];
  for (const line of lines) {
    if (line.startsWith('|')) {
      buf.push(line);
    } else {
      if (buf.length) { blocks.push({ type: 'table', lines: buf }); buf = []; }
      blocks.push({ type: 'line', content: line });
    }
  }
  if (buf.length) blocks.push({ type: 'table', lines: buf });
  return blocks;
};

const parseTable = (tableLines) => {
  const isSep = (row) => row.every((c) => /^[-: ]+$/.test(c));
  const toRow = (line) =>
    line.split('|').slice(1, -1).map((c) => c.trim());

  const rows = tableLines.map(toRow);
  let header = null;
  const body = [];
  let seenSep = false;

  for (const row of rows) {
    if (isSep(row)) { seenSep = true; continue; }
    if (!seenSep && header === null) header = row;
    else body.push(row);
  }
  // If no separator was found, treat first row as header anyway
  if (!seenSep && header && body.length === 0 && rows.length > 1) {
    body.push(...rows.slice(1));
  }
  return { header, body };
};

/** Inline markdown: bold, italic, inline-code, URLs. */
const renderInline = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|https?:\/\/[^\s)]+)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') || p.startsWith('__'))
      return <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>;
    if (p.startsWith('`'))
      return <code key={i} className="bg-white/10 text-premium-gold px-1 rounded text-[0.85em] font-mono">{p.slice(1, -1)}</code>;
    if (p.startsWith('*'))
      return <em key={i} className="text-white/80 italic">{p.slice(1, -1)}</em>;
    if (p.startsWith('http'))
      return <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 break-all text-xs">{p}</a>;
    return p;
  });
};

// ── Sub-components ────────────────────────────────────────────────────

const StatusPill = ({ status }) => {
  const cfg = STATUS[status.toUpperCase()];
  if (!cfg) return <span className="text-white/70 text-xs">{status}</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${cfg.cls}`}>
      {cfg.icon && <span>{cfg.icon}</span>}
      {status.toUpperCase()}
    </span>
  );
};

const ScoreGauge = ({ score, cfg }) => {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const fill = (circ * score) / 100;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 108 108">
          <circle cx="54" cy="54" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
          <circle
            cx="54" cy="54" r={r} fill="none"
            stroke={cfg.hex} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={`${fill} ${circ - fill}`}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white leading-none">{score}</span>
          <span className="text-[9px] text-white/35 font-medium">/ 100</span>
        </div>
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.tw}`}>
        {cfg.label}
      </span>
    </div>
  );
};

const StatBox = ({ count, label, color, bg, border }) => (
  <div className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 px-2 rounded-xl border ${bg} ${border}`}>
    <span className={`text-xl font-black leading-none ${color}`}>{count}</span>
    <span className="text-[9px] text-white/40 uppercase tracking-wide font-semibold">{label}</span>
  </div>
);

const TableBlock = ({ lines }) => {
  const { header, body } = parseTable(lines);
  if (!header && !body.length) return null;

  const renderCell = (cell, isHeader) => {
    const st = matchStatus(cell);
    if (st) return <StatusPill status={st.key} />;
    return isHeader
      ? <span className="text-white/60 font-semibold text-[10px] uppercase tracking-wider">{renderInline(cell)}</span>
      : <span className="text-white/75 text-xs leading-snug">{renderInline(cell)}</span>;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-white/8 my-3">
      <table className="w-full text-left border-collapse min-w-full">
        {header && (
          <thead>
            <tr className="border-b border-white/10 bg-white/4">
              {header.map((h, i) => (
                <th key={i} className="px-3 py-2.5 whitespace-nowrap">{renderCell(h, true)}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2.5 align-top">{renderCell(cell, false)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const LineBlock = ({ line }) => {
  if (!line.trim()) return <div className="h-2" />;
  if (line.trim() === '---') return <hr className="border-white/8 my-3" />;

  if (line.startsWith('### '))
    return <h3 className="text-sm font-semibold text-white/90 mt-3 mb-1">{renderInline(line.slice(4))}</h3>;

  if (line.startsWith('- ') || line.startsWith('* ')) {
    const text = line.slice(2);
    const st = matchStatus(text.trim());
    return (
      <div className="flex gap-2.5 py-0.5 ml-1">
        <span className="text-premium-gold/60 mt-1 flex-shrink-0 text-xs">•</span>
        <span className="flex-1 text-white/75 text-xs leading-relaxed">
          {st ? <StatusPill status={st.key} /> : renderInline(text)}
        </span>
      </div>
    );
  }

  if (/^\d+\.\s/.test(line)) {
    const num = line.match(/^(\d+)\./)[1];
    const rest = line.replace(/^\d+\.\s/, '');
    const isCritical = /critical/i.test(rest);
    const isRecommended = /recommended/i.test(rest);
    return (
      <div className="flex gap-2.5 py-0.5 ml-1 items-start">
        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5 ${isCritical ? 'bg-red-500/20 text-red-400' : isRecommended ? 'bg-blue-500/20 text-blue-400' : 'bg-white/8 text-white/50'}`}>
          {num}
        </span>
        <span className="flex-1 text-white/75 text-xs leading-relaxed">{renderInline(rest)}</span>
      </div>
    );
  }

  return <p className="text-white/70 text-xs leading-relaxed py-0.5">{renderInline(line)}</p>;
};

const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const isDisclaimer = /disclaimer|disclaimer/i.test(title);

  if (isDisclaimer) {
    return (
      <div className="px-4 py-3 rounded-xl bg-white/3 border border-white/8">
        <p className="text-[10px] text-white/25 text-center leading-relaxed">{children}</p>
      </div>
    );
  }

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/3 hover:bg-white/5 transition-all text-left gap-3"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-premium-gold/70 text-sm flex-shrink-0">{icon}</span>
          <span className="text-sm font-semibold text-white/90 truncate">{title}</span>
        </div>
        <svg className={`w-4 h-4 text-white/25 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 py-4 space-y-0.5">{children}</div>}
    </div>
  );
};

// ── Section icon map ──────────────────────────────────────────────────

const sectionIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes('score') || t.includes('readiness'))    return '◎';
  if (t.includes('pass') || t.includes('compli'))        return '✓';
  if (t.includes('improv') || t.includes('need') || t.includes('fail')) return '△';
  if (t.includes('miss'))                                return '!';
  if (t.includes('plan') || t.includes('priority'))      return '→';
  if (t.includes('lawyer') || t.includes('legal'))       return '⚖';
  if (t.includes('source') || t.includes('ref'))         return '⊕';
  if (t.includes('disclaimer'))                          return '※';
  return '▸';
};

// ── Main component ────────────────────────────────────────────────────

const ReviewReportCard = ({ report, country, visaType }) => {
  if (!report) return null;

  const score = extractScore(report);
  const cfg = score !== null ? scoreCfg(score) : null;
  const lines = useMemo(() => report.split('\n'), [report]);
  const stats = useMemo(() => countStatuses(lines), [lines]);

  // Group lines into sections by ## headings
  const sections = useMemo(() => {
    const result = [];
    let current = null;
    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (current) result.push(current);
        current = { title: line.slice(3).trim(), lines: [] };
      } else if (line.startsWith('# ')) {
        // top-level title — skip
      } else if (current) {
        current.lines.push(line);
      }
    }
    if (current) result.push(current);
    return result;
  }, [lines]);

  const handleDownload = () => {
    // Convert the markdown report to clean print-ready HTML, then trigger
    // the browser's print-to-PDF flow. No external packages required.
    const slug = (country || 'report').toLowerCase().replace(/\s+/g, '-');
    const title = `Visa Review — ${country || ''} ${visaType || ''}`.trim();

    // ── Minimal markdown → HTML converter for the report structure ──
    const mdToHtml = (md) => {
      const lines = md.split('\n');
      const out = [];
      let inTable = false;
      let tableHeader = null;

      const escape = (s) => s
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const inlineHtml = (s) => escape(s)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');

      const flushTable = () => { if (inTable) { out.push('</tbody></table>'); inTable = false; tableHeader = null; } };

      for (const raw of lines) {
        const line = raw.trimEnd();

        // Table rows
        if (line.startsWith('|')) {
          const cells = line.split('|').slice(1, -1).map((c) => c.trim());
          const isSep = cells.every((c) => /^[-: ]+$/.test(c));
          if (isSep) continue;
          if (!inTable) {
            // First row = header
            inTable = true;
            tableHeader = cells;
            out.push('<table><thead><tr>' + cells.map((c) => `<th>${inlineHtml(c)}</th>`).join('') + '</tr></thead><tbody>');
          } else {
            out.push('<tr>' + cells.map((c) => `<td>${inlineHtml(c)}</td>`).join('') + '</tr>');
          }
          continue;
        }

        flushTable();

        if (!line.trim()) { out.push('<br>'); continue; }
        if (line === '---') { out.push('<hr>'); continue; }
        if (line.startsWith('# '))   { out.push(`<h1>${inlineHtml(line.slice(2))}</h1>`); continue; }
        if (line.startsWith('## '))  { out.push(`<h2>${inlineHtml(line.slice(3))}</h2>`); continue; }
        if (line.startsWith('### ')) { out.push(`<h3>${inlineHtml(line.slice(4))}</h3>`); continue; }
        if (line.match(/^\d+\.\s/)) {
          const rest = line.replace(/^\d+\.\s/, '');
          out.push(`<p class="numbered"><span class="num">${line.match(/^(\d+)\./)[1]}</span>${inlineHtml(rest)}</p>`);
          continue;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          out.push(`<p class="bullet">• ${inlineHtml(line.slice(2))}</p>`);
          continue;
        }
        out.push(`<p>${inlineHtml(line)}</p>`);
      }
      flushTable();
      return out.join('\n');
    };

    const bodyHtml = mdToHtml(report);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Georgia', serif;
      font-size: 11pt;
      color: #1a1a1a;
      background: #fff;
      padding: 28mm 22mm 24mm 22mm;
      max-width: 210mm;
      margin: 0 auto;
      line-height: 1.55;
    }
    h1 {
      font-size: 17pt;
      font-weight: 700;
      color: #111;
      border-bottom: 2px solid #111;
      padding-bottom: 6pt;
      margin-bottom: 14pt;
      page-break-after: avoid;
    }
    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #1a1a1a;
      border-left: 4px solid #b8860b;
      padding-left: 8pt;
      margin: 18pt 0 7pt;
      page-break-after: avoid;
    }
    h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #333;
      margin: 12pt 0 4pt;
      page-break-after: avoid;
    }
    p { margin: 3pt 0; color: #2a2a2a; }
    p.bullet { padding-left: 14pt; }
    p.numbered { padding-left: 28pt; position: relative; }
    p.numbered .num {
      position: absolute; left: 0; top: 0;
      background: #f0e8d0; color: #7a5f00;
      border-radius: 50%; width: 18pt; height: 18pt;
      display: flex; align-items: center; justify-content: center;
      font-size: 8pt; font-weight: 700; text-align: center;
      line-height: 18pt;
    }
    table {
      width: 100%; border-collapse: collapse;
      margin: 8pt 0 12pt; font-size: 9.5pt;
      page-break-inside: avoid;
    }
    th {
      background: #f5f0e8; color: #333;
      font-weight: 700; font-size: 8.5pt;
      text-transform: uppercase; letter-spacing: 0.4pt;
      padding: 6pt 8pt; border: 1px solid #ddd;
      text-align: left;
    }
    td {
      padding: 5pt 8pt; border: 1px solid #e0e0e0;
      vertical-align: top; color: #2a2a2a;
    }
    tr:nth-child(even) td { background: #fafaf8; }
    hr { border: none; border-top: 1px solid #ddd; margin: 14pt 0; }
    code { font-family: 'Courier New', monospace; font-size: 9pt; background: #f5f5f5; padding: 1pt 3pt; border-radius: 2pt; }
    strong { font-weight: 700; color: #111; }
    em { font-style: italic; color: #444; }
    a { color: #1a56db; text-decoration: underline; word-break: break-all; }
    br { display: block; height: 4pt; content: ""; }
    .footer {
      margin-top: 24pt; padding-top: 10pt;
      border-top: 1px solid #ccc;
      font-size: 8.5pt; color: #888;
      text-align: center; line-height: 1.5;
    }
    @media print {
      body { padding: 0; }
      h2 { page-break-before: auto; }
      table { page-break-inside: avoid; }
      @page {
        size: A4;
        margin: 20mm 18mm 20mm 18mm;
      }
    }
  </style>
</head>
<body>
  ${bodyHtml}
  <div class="footer">
    Generated by LoopedAI &bull; loopedai.io &bull; ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
    This document is for informational purposes only and does not constitute legal advice.
  </div>
  <script>
    window.onload = function() {
      document.title = ${JSON.stringify(slug + '.pdf')};
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) {
      // Popup blocked — fall back to blob download of the HTML
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visa-review-${slug}.html`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    win.document.write(html);
    win.document.close();
  };

  const renderSectionContent = (sectionLines) => {
    const blocks = toBlocks(sectionLines);
    return blocks.map((block, i) =>
      block.type === 'table'
        ? <TableBlock key={i} lines={block.lines} />
        : <LineBlock key={i} line={block.content} />
    );
  };

  // Separate disclaimer section from main sections
  const mainSections = sections.filter((s) => !/disclaimer/i.test(s.title));
  const disclaimerSection = sections.find((s) => /disclaimer/i.test(s.title));

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden shadow-2xl">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white/4 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-premium-gold text-xs font-bold uppercase tracking-wider">Visa Document Review</span>
          </div>
          <p className="text-white/35 text-[10px] uppercase tracking-widest font-medium">
            {country} &bull; {visaType}
          </p>
        </div>
        <button
          onClick={handleDownload}
          title="Save as PDF"
          className="flex items-center gap-1.5 text-white/30 hover:text-white/70 text-[10px] font-semibold uppercase tracking-wide transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Save PDF
        </button>
      </div>

      {/* ── Score + stats ── */}
      {score !== null && cfg && (
        <div className={`flex flex-col sm:flex-row items-center gap-6 px-6 py-6 border-b border-white/8 ${cfg.bg}`}>
          <ScoreGauge score={score} cfg={cfg} />
          <div className="flex sm:flex-col gap-3 flex-1 w-full">
            <p className="hidden sm:block text-xs text-white/40 font-medium mb-1">Document summary</p>
            <div className="flex gap-2 w-full">
              <StatBox count={stats.passed}  label="Passed"  color="text-green-400"  bg="bg-green-500/10"  border="border-green-500/20" />
              <StatBox count={stats.partial} label="Partial" color="text-yellow-400" bg="bg-yellow-500/10" border="border-yellow-500/20" />
              <StatBox count={stats.issues}  label="Issues"  color="text-red-400"    bg="bg-red-500/10"    border="border-red-500/20" />
            </div>
          </div>
        </div>
      )}

      {/* ── Sections ── */}
      <div className="p-4 space-y-2.5 overflow-y-auto max-h-[55vh] scrollbar-thin">
        {mainSections.map((section, i) => (
          <Section
            key={i}
            title={section.title}
            icon={sectionIcon(section.title)}
            defaultOpen={i < 3}
          >
            {renderSectionContent(section.lines)}
          </Section>
        ))}
      </div>

      {/* ── Disclaimer footer ── */}
      <div className="px-5 py-3.5 bg-white/3 border-t border-white/8">
        {disclaimerSection ? (
          <p className="text-[10px] text-white/20 text-center leading-relaxed">
            {disclaimerSection.lines.filter((l) => l.trim()).join(' ')}
          </p>
        ) : (
          <p className="text-[10px] text-white/20 text-center leading-relaxed">
            This review is for informational purposes only. We do not guarantee visa approval or provide legal advice.
          </p>
        )}
      </div>

    </div>
  );
};

export default ReviewReportCard;
