import type { KeyFinding } from '../../types'
import { ExternalLink } from 'lucide-react'

interface Props {
  findings: KeyFinding[]
}

export default function KeyFindings({ findings }: Props) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Key Findings
        </h3>
        <span className="text-xs text-gray-600">{findings.length} insights</span>
      </div>

      <ol className="space-y-4">
        {findings.map((f, i) => (
          <li key={i} className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <div>
              <p className="text-sm text-gray-200 leading-relaxed">{f.finding}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-gray-500 bg-[#1a1a28] border border-[#2a2a3e] px-2 py-0.5 rounded-full">
                  {f.source_label}
                </span>
                {f.supporting_sources.slice(0, 2).map((url, j) => (
                  <a
                    key={j}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full transition-colors"
                  >
                    Source
                    <ExternalLink size={10} />
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
