const ITEMS = [
  'Canada Study Permit',
  'UK Skilled Worker Visa',
  'US F-1 Student Visa',
  'Schengen Business',
  'Australia Skilled Independent',
  'UAE Golden Visa',
  'Germany Job Seeker',
  'New Zealand Work Visa',
  'Singapore Employment Pass',
  'Japan Student Visa',
  'Portugal D7 Visa',
  'Netherlands Startup Visa',
]

export default function Ticker() {
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div className="border-y border-gray-100 bg-gray-50 overflow-hidden py-4">
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-6">
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-gray-400">{item}</span>
            <span className="w-1 h-1 rounded-full bg-gold/50 flex-shrink-0" />
          </span>
        ))}
      </div>
    </div>
  )
}
