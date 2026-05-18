import { useState, useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'
import { StickySection } from './StickySection'

interface TimelineEntry {
  hash: string
  dateRange: string
  institution: string
  role: string
  bullets: string[]
}

const timelineEntries: TimelineEntry[] = [
  {
    hash: 'd4e8f2c',
    dateRange: 'AUG 2024 – PRESENT',
    institution: 'NETAPP INC.',
    role: 'SOFTWARE_ENGINEER_IN_TEST',
    bullets: [
      'Built automated analysis pipeline processing storage telemetry across distributed RAID systems (FC, SAS, NVMe/RoCE), handling terabytes of performance data.',
      'Designed Python automation framework reducing manual configuration tasks by 30% across Linux, Windows, and VMware infrastructure.',
      'Implemented Ansible-based deployment orchestration for 300+ system configurations, streamlining infrastructure provisioning workflows.',
      'Developed interactive visualization dashboard for system performance metrics using Python, analyzing 1M+ database entries for engineering insights.',
    ],
  },
  {
    hash: 'a3f9d2b',
    dateRange: 'JAN 2026 – DEC 2027 (EXPECTED)',
    institution: 'WICHITA STATE UNIVERSITY',
    role: 'ACCELERATED_M.S._COMPUTER_SCIENCE',
    bullets: [],
  },
  {
    hash: 'b7c3e1a',
    dateRange: 'JAN 2022 – DEC 2025',
    institution: 'WICHITA STATE UNIVERSITY',
    role: 'B.S._COMPUTER_SCIENCE',
    bullets: [
      "Dean's List: Spring 2022 – Fall 2025",
      "Relevant Coursework: Machine Learning, Artificial Intelligence, Fundamentals of AI Agents, Data Science",
    ],
  },
]

function CommitEntry({ entry }: { entry: TimelineEntry }) {
  const [commitText, setCommitText] = useState('')
  const [authorText, setAuthorText] = useState('')
  const [dateText, setDateText] = useState('')
  const [institutionText, setInstitutionText] = useState('')
  const [roleText, setRoleText] = useState('')
  const [bulletTexts, setBulletTexts] = useState<string[]>([])

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const hasStarted = useRef(false)
  const timersRef = useRef<(ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>)[]>([])

  useEffect(() => {
    if (isInView && !hasStarted.current) {
      hasStarted.current = true
      const texts = [
        { text: `commit ${entry.hash}`, setter: setCommitText, delay: 0 },
        { text: 'Author: Farhan Mohammed', setter: setAuthorText, delay: 200 },
        { text: `Date:   ${entry.dateRange}`, setter: setDateText, delay: 400 },
        { text: entry.institution, setter: setInstitutionText, delay: 600 },
        { text: entry.role, setter: setRoleText, delay: 800 },
      ]

      texts.forEach(({ text, setter, delay: d }) => {
        const timeoutId = setTimeout(() => {
          let i = 0
          const interval = setInterval(() => {
            if (i <= text.length) {
              setter(text.slice(0, i))
              i++
            } else {
              clearInterval(interval)
            }
          }, 30)
          timersRef.current.push(interval)
        }, d)
        timersRef.current.push(timeoutId)
      })

      const bulletDelayStart = 1000
      entry.bullets.forEach((bullet, index) => {
        const timeoutId = setTimeout(() => {
          setBulletTexts(prev => {
            const newBullets = [...prev]
            newBullets[index] = ''
            return newBullets
          })

          let i = 0
          const interval = setInterval(() => {
            if (i <= bullet.length) {
              setBulletTexts(prev => {
                const newBullets = [...prev]
                newBullets[index] = bullet.slice(0, i)
                return newBullets
              })
              i++
            } else {
              clearInterval(interval)
            }
          }, 30)
          timersRef.current.push(interval)
        }, bulletDelayStart + index * 200)
        timersRef.current.push(timeoutId)
      })
    }

    return () => {
      timersRef.current.forEach(timer => {
        clearTimeout(timer)
        clearInterval(timer as ReturnType<typeof setInterval>)
      })
      timersRef.current = []
    }
  }, [isInView, entry])

  return (
    <div ref={ref} className="min-h-screen py-6 font-mono" data-testid="commit-entry">
      <p className="text-atomic-tangerine text-xs" data-testid="commit-hash">
        {commitText}
      </p>
      <p className="text-periwinkle text-xs mt-1" data-testid="commit-author">
        {authorText}
      </p>
      <p className="text-periwinkle text-xs" data-testid="commit-date">
        {dateText}
      </p>
      <div className="mt-2 ml-4">
        <p className="text-platinum text-xs" data-testid="commit-institution">{institutionText}</p>
        <p className="text-platinum text-xs mt-1" data-testid="commit-role">{roleText}</p>
        {entry.bullets.length > 0 && (
          <ul className="text-periwinkle text-xs mt-2 list-disc list-inside">
            {entry.bullets.map((_, index) => (
              <li key={index} data-testid="commit-description">{bulletTexts[index] || ''}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function EntryList({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div>
      {entries.map((entry, index) => (
        <div key={entry.hash}>
          <CommitEntry entry={entry} />
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
    <StickySection id="timeline" className="flex flex-col justify-center py-14 px-8 bg-graphite-light">
      <div className="w-full">
        <div className="flex items-center gap-3 mb-12">
          <span className="font-body text-sm text-atomic-tangerine tracking-widest whitespace-nowrap">// 03</span>
          <span className="font-body text-sm text-periwinkle tracking-widest whitespace-nowrap">TIMELINE</span>
          <hr className="flex-1 border-periwinkle/20" />
        </div>

        <EntryList entries={timelineEntries} />
      </div>
    </StickySection>
  )
}

export default TimelineSection
