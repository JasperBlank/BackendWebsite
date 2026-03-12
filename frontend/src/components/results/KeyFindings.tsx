import type { KeyFinding } from '../../types'
import { ExternalLink } from 'lucide-react'

interface Props {
  findings: KeyFinding[]
}

export default function KeyFindings({ findings }: Props) {
  return (
    <div className="bg-[#111114] border border-[#1C1C22] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-label">Key Findings</h3>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C8F04A] bg-[#C8F04A]/10 px-2 py-0.5 rounded-full">
          {findings.length} insights
        </span>
      </div>

      <ol className="space-y-4">
        {findings.map((f, i) => (
          <li key={i} className="flex gap-3 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[#1C1C22] p-3">
            <span className="shrink-0 w-6 h-6 rounded-md bg-[#C8F04A]/10 text-[#C8F04A] text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <div>
              <p className="text-sm text-[#9898A2] leading-relaxed">
                <strong className="text-[#F0EEE8] font-medium">{f.finding.split(' ').slice(0, 4).join(' ')}</strong>{' '}
                {f.finding.split(' ').slice(4).join(' ')}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[10px] text-[#C8F04A] bg-[#C8F04A]/10 px-2 py-0.5 rounded">
                  {f.source_label}
                </span>
                {f.supporting_sources.slice(0, 2).map((url, j) => (
                  <a
                    key={j}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-[#9898A2] hover:text-[#F0EEE8] bg-[rgba(255,255,255,0.04)] border border-[#1C1C22] px-2 py-0.5 rounded transition-colors"
                  >
                    Source
                    <ExternalLink size={9} />
                  </a>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
