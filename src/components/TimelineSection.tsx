import { ScrollFadeSection } from './ScrollFadeSection'

interface TimelineEntry {
  dateRange: string
  institution: string
  role: string
  description: string
}

const education: TimelineEntry[] = [
  {
    dateRange: 'JAN 2026 – PRESENT',
    institution: 'WICHITA STATE UNIVERSITY',
    role: 'ACCELERATED_M.S._COMPUTER_SCIENCE',
    description: 'Accelerated graduate program. Focus on advanced machine learning, AI systems, and distributed computing.',
  },
  {
    dateRange: 'JAN 2022 – DEC 2025',
    institution: 'WICHITA STATE UNIVERSITY',
    role: 'B.S._COMPUTER_SCIENCE',
    description: 'GPA: 3.66 / 4.0 · Magna Cum Laude · Dean\'s List: Spring 2022 – Fall 2025 · Machine Learning, Artificial Intelligence, Fundamentals of AI Agents, Data Science',
  },
]

const experience: TimelineEntry[] = [
  {
    dateRange: 'AUG 2024 – PRESENT',
    institution: 'NETAPP INC.',
    role: 'SOFTWARE_ENGINEER_IN_TEST',
    description: 'Built automated analysis pipeline for distributed RAID systems (FC, SAS, NVMe/RoCE), handling terabytes of performance data. Designed Python automation framework reducing manual configuration by 30%. Implemented Ansible-based deployment for 300+ system configurations. Developed interactive performance metrics dashboard analysing 1M+ database entries.',
  },
]

function EntryList({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div>
      {entries.map((entry, index) => (
        <div key={index}>
          <div className="grid grid-cols-[30%_70%] gap-8 py-8">
            <div>
              <p className="font-body text-xs text-atomic-tangerine tracking-wider uppercase">
                {entry.dateRange}
              </p>
              <p className="font-body text-xs text-atomic-tangerine tracking-wider mt-1">
                {entry.institution}
              </p>
            </div>
            <div>
              <h3 className="font-display text-xs text-platinum mb-3 leading-relaxed">
                {entry.role}
              </h3>
              <p className="font-body text-sm text-periwinkle leading-relaxed">
                {entry.description}
              </p>
            </div>
          </div>
          {index < entries.length - 1 && (
            <hr className="border-periwinkle/20" />
          )}
        </div>
      ))}
    </div>
  )
}

const TimelineSection: React.FC = () => {
  return (
    <ScrollFadeSection id="timeline" className="min-h-screen flex flex-col justify-center py-14 px-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-3 mb-12">
          <span className="font-body text-xs text-atomic-tangerine tracking-widest whitespace-nowrap">// 03</span>
          <span className="font-body text-xs text-periwinkle tracking-widest whitespace-nowrap">TIMELINE</span>
          <hr className="flex-1 border-periwinkle/20" />
        </div>

        <div className="space-y-12">
          <div>
            <p className="font-body text-xs text-periwinkle/60 tracking-widest mb-2 uppercase">
              Education
            </p>
            <hr className="border-periwinkle/10 mb-0" />
            <EntryList entries={education} />
          </div>

          <div>
            <p className="font-body text-xs text-periwinkle/60 tracking-widest mb-2 uppercase">
              Experience
            </p>
            <hr className="border-periwinkle/10 mb-0" />
            <EntryList entries={experience} />
          </div>
        </div>
      </div>
    </ScrollFadeSection>
  )
}

export default TimelineSection
