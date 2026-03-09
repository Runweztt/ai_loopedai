import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check, ArrowRight } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import CTASection from '../components/sections/CTASection'

const CATEGORIES = [
  {
    id: 'visa-research', label: 'Visa Research',
    prompts: [
      {
        title: 'Full requirements for your situation',
        prompt: 'I am a [nationality] citizen wanting to move to [country] for [reason: work/study/family/retirement]. What are the exact visa options available to me, the requirements for each, and which is the best fit for my situation?',
        tip: 'Be specific about your nationality — requirements differ significantly by passport.',
      },
      {
        title: 'Compare visa types',
        prompt: 'What is the difference between a [Country] [Visa Type 1] and [Visa Type 2]? Which is better for someone who wants to [goal] and plans to stay for [duration]?',
        tip: 'Great for when you have multiple options and need clarity on which to pursue.',
      },
      {
        title: 'Processing time estimate',
        prompt: 'How long does it currently take to process a [visa type] application for [country] when applying from [your country]? What factors can speed up or delay my application?',
        tip: 'Processing times fluctuate — always ask for the latest estimate.',
      },
    ],
  },
  {
    id: 'documents', label: 'Documents',
    prompts: [
      {
        title: 'Full document checklist',
        prompt: 'Give me a complete document checklist for a [nationality] citizen applying for a [visa type] to [country]. Include what needs to be translated, certified, or notarized.',
        tip: 'Always include your nationality — document requirements vary by citizenship.',
      },
      {
        title: 'Document review',
        prompt: 'I have my [document name]. Here is what it says: [paste content or describe it]. Is this acceptable for a [visa type] application to [country]? What issues might an officer flag?',
        tip: 'Paste the document text directly — the more detail you give, the better the analysis.',
      },
      {
        title: 'Financial proof requirements',
        prompt: 'What financial proof do I need for a [visa type] application to [country]? What minimum amount, what format (bank statement, letter), and from what time period?',
        tip: 'Financial thresholds are one of the top rejection reasons — get this right.',
      },
    ],
  },
  {
    id: 'timeline', label: 'Timeline & Planning',
    prompts: [
      {
        title: 'Build your move timeline',
        prompt: 'I want to move to [country] by [target month/year]. I am a [nationality] citizen applying for [visa type]. Build me a backwards timeline of every step I need to take, starting today.',
        tip: 'Include your target arrival date for a realistic plan that accounts for processing time.',
      },
      {
        title: 'First steps when overwhelmed',
        prompt: 'I just decided I want to [move/study/work] in [country]. I have no idea where to start. What are the first 5 concrete things I should do right now, in order of priority?',
        tip: 'Perfect if you\'re starting from zero and feeling overwhelmed.',
      },
      {
        title: 'Post-approval checklist',
        prompt: 'I just received my [visa type] approval for [country]. What do I need to do between now and my arrival date? What should I sort out in the first 30 days after landing?',
        tip: 'Post-approval tasks are often overlooked — plan ahead to avoid surprises.',
      },
    ],
  },
  {
    id: 'comparison', label: 'Country Comparison',
    prompts: [
      {
        title: 'Best country for your goal',
        prompt: 'I am a [nationality] citizen working as a [profession] looking to [goal: get PR / work abroad / retire / study]. Which 3 countries offer the easiest or most accessible pathway for someone in my exact situation?',
        tip: 'Mentioning your profession unlocks more relevant pathways (skilled worker routes, etc.).',
      },
      {
        title: 'Side-by-side comparison',
        prompt: 'Compare immigration to [Country A] vs [Country B] for a [nationality] [profession]. Cover: ease of process, total costs, timeline to approval, and path to permanent residency.',
        tip: 'Two-country comparisons give much sharper, more actionable answers.',
      },
      {
        title: 'Fastest PR pathway',
        prompt: 'Which countries offer the fastest path to permanent residency or citizenship for a [nationality] citizen working in [field]? What are the minimum years of residence required for each?',
        tip: 'If long-term settlement is the goal, PR and citizenship timelines are the key metric.',
      },
    ],
  },
  {
    id: 'edge-cases', label: 'Edge Cases',
    prompts: [
      {
        title: 'Previous visa refusal',
        prompt: 'I was refused a visa to [country] in [year], reason: [reason if known]. How does this affect future applications? What should I do differently, and do I need to declare it on future applications to other countries?',
        tip: 'Be fully honest — LoopedAI can only help with accurate information.',
      },
      {
        title: 'Dual nationality',
        prompt: 'I hold passports from both [Country A] and [Country B]. For a visa to [destination], which passport should I use to apply? Are there advantages or restrictions with either?',
        tip: 'Dual nationals often have more options than they realize.',
      },
      {
        title: 'Visa overstay',
        prompt: 'I overstayed my visa in [country] by [duration]. What are the exact consequences, any bans in place, and how does this affect future applications to [same country] and other destinations?',
        tip: 'Consequences vary widely by country — get country-specific clarity before reapplying.',
      },
    ],
  },
]

function PromptCard({ prompt }) {
  const [copied, setCopied] = useState(false)
  const ref = useScrollReveal()

  const copy = () => {
    navigator.clipboard.writeText(prompt.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div ref={ref} className="bg-navy border border-white/6 rounded-xl p-6 hover:border-white/12 transition-colors group">
      <div className="flex justify-between items-start gap-3 mb-4">
        <h3 className="font-display font-bold text-white text-sm leading-snug">{prompt.title}</h3>
        <button
          onClick={copy}
          data-hover
          className="shrink-0 p-1.5 rounded-md border border-white/8 text-slate-dim hover:border-gold/40 hover:text-gold transition-colors"
          title="Copy prompt"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
        </button>
      </div>
      <div className="bg-[#070F1E] border border-white/6 rounded-lg p-4 mb-4 font-mono text-xs text-slate-text leading-relaxed">
        {prompt.prompt}
      </div>
      <p className="text-[11px] text-slate-dim">💡 {prompt.tip}</p>
    </div>
  )
}

export default function GuidePage() {
  const [active, setActive] = useState('visa-research')
  const heroRef = useScrollReveal()
  const current = CATEGORIES.find(c => c.id === active)

  return (
    <div className="pt-16 bg-void min-h-screen">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div ref={heroRef} className="max-w-2xl">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold mb-4">Prompt Guide</p>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-white leading-tight mb-5">
            Get better answers<br />
            <span className="font-serif italic text-slate-text">from LoopedAI</span>
          </h1>
          <p className="text-slate-text text-base leading-relaxed mb-8">
            The quality of your answer depends on the quality of your question. Use these templates as a starting point — replace the brackets and go.
          </p>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 bg-gold text-void font-body font-semibold text-sm px-6 py-3 rounded-md hover:bg-gold/90 transition-colors group"
          >
            Open Chat
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* How to use */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-navy border border-white/6 rounded-xl p-6 mb-12">
          {[
            ['Pick a template', 'Choose a prompt category below that matches your situation.'],
            ['Fill in the brackets', 'Replace [placeholders] with your actual details — nationality, country, visa type.'],
            ['Paste & send', 'Copy into the chat and send. No other setup needed.'],
            ['Ask follow-ups', 'Drill deeper with follow-up questions. The first answer is rarely the last.'],
          ].map(([title, desc], i) => (
            <div key={i} className="flex gap-3">
              <span className="font-mono text-xs text-gold/60 mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className="font-display font-bold text-white text-sm mb-1">{title}</p>
                <p className="text-xs text-slate-text leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              data-hover
              className={`text-xs font-body font-medium px-4 py-2 rounded-full border transition-all duration-200 ${
                active === cat.id
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-white/8 text-slate-text hover:border-white/20 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Prompt cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {current?.prompts.map((p, i) => <PromptCard key={i} prompt={p} />)}
        </div>

        {/* Pro tips */}
        <div className="bg-navy border border-white/6 rounded-xl p-8">
          <h2 className="font-display font-bold text-white text-lg mb-6">Pro tips for sharper answers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              ['Specify your nationality', 'Requirements differ dramatically by passport. Always include your citizenship.'],
              ['Include your profession', 'Many visa routes are profession-specific. Your job title unlocks relevant pathways.'],
              ['Give your timeline', 'Tell LoopedAI when you need to arrive. It will plan backwards from your deadline.'],
              ['Ask follow-up questions', 'Go deeper — ask "what if" and "but what about" to explore edge cases.'],
              ['State concerns explicitly', 'Past refusal? Gap years? Say so. LoopedAI handles complexity without judgment.'],
              ['Upload actual documents', 'Use document review to get pass/fail analysis on your real files before submitting.'],
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-3">
                <span className="text-gold mt-0.5 shrink-0 text-sm">◆</span>
                <div>
                  <p className="font-display font-bold text-white text-sm mb-1">{title}</p>
                  <p className="text-xs text-slate-text leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CTASection />
    </div>
  )
}
