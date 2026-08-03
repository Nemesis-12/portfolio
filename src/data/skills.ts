/**
 * Skills graph content (issue #319): four colour-coded hubs (LANGUAGES,
 * ML & DATA, WEB, INFRA) and their member skills, laid out as a connected
 * graph instead of the skill-bar cliché ("Python 87%"). `SkillsGraph.tsx`
 * renders this as absolutely-positioned `<button>` nodes over an SVG edge
 * layer (`src/lib/skills/graph.ts` derives the edges and visual state from
 * the data below — no React or rendering logic lives in this file).
 *
 * Reproduced from `ideas/sample-decoded.html` lines 618-654 (`groups`,
 * `nodesData`, `hubLinks`) with one content correction:
 *
 *   - The reference's LANGUAGES member at `g:0, x:28, y:33` is "Bash".
 *     `public/resume.pdf` has no "Bash" anywhere — its Languages line is
 *     "Python, C++, C, SQL, JavaScript, TypeScript". That slot is
 *     JavaScript here instead, keeping the reference's exact coordinates
 *     (`x:28, y:33`) and group. Every other node, coordinate, group
 *     assignment, hub link, and note below is the reference's own,
 *     verbatim — each is independently traceable to `public/resume.pdf`'s
 *     Skills section or a project/experience bullet (noted per node
 *     below), so nothing else needed correcting.
 *
 * Member (non-hub) node count is 19 (6 LANGUAGES + 4 ML & DATA + 3 WEB +
 * 6 INFRA) — unchanged by the Bash→JavaScript swap, since it replaces one
 * member with another rather than adding or removing one. This is the
 * "N TOOLS" figure `getSkillReadout` (`src/lib/skills/graph.ts`) reports
 * in the graph's default readout state.
 */

/** One of the four skill clusters. `id` is the index other data below points at. */
export interface SkillGroup {
  readonly id: number
  /** Uppercase cluster name, shown on both the hub node and the readout strip. */
  readonly name: string
}

export interface SkillNode {
  /** Stable id for React keys and test hooks — not shown to the visitor. */
  readonly id: string
  /** Visible label, and (via the button's visible text) the node's accessible name. */
  readonly label: string
  /** `SkillGroup.id` this node belongs to. */
  readonly group: number
  /** Hub nodes are the four cluster centres; every other node is a member. */
  readonly hub: boolean
  /** Position as a percentage of the panel, 0-100 (sample's own `x`/`y`, unscaled). */
  readonly x: number
  readonly y: number
  /** One-line note on how this skill is actually used — revealed on hover, focus, or tap. */
  readonly note: string
}

/** A connection between two hubs (by `SkillGroup.id`), drawn in addition to every hub→member edge. */
export interface HubLink {
  readonly from: number
  readonly to: number
}

export const SKILL_GROUPS: readonly SkillGroup[] = [
  { id: 0, name: 'LANGUAGES' },
  { id: 1, name: 'ML & DATA' },
  { id: 2, name: 'WEB' },
  { id: 3, name: 'INFRA' },
]

export const SKILL_NODES: readonly SkillNode[] = [
  // --- LANGUAGES (resume: Skills > Languages — "Python, C++, C, SQL, JavaScript, TypeScript") ---
  {
    id: 'languages-hub',
    label: 'LANGUAGES',
    group: 0,
    hub: true,
    x: 15,
    y: 48,
    note: 'What I reach for first, depending on how fast it has to run.',
  },
  {
    id: 'python',
    label: 'Python',
    group: 0,
    hub: false,
    x: 5,
    y: 20,
    note: 'Training loops, tokenizers, automation frameworks. Six years of it.',
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    group: 0,
    hub: false,
    x: 26,
    y: 15,
    note: 'Product work at NetApp — typed end to end, no any.',
  },
  {
    id: 'cpp',
    label: 'C++',
    group: 0,
    hub: false,
    x: 4,
    y: 72,
    note: 'Where the inference loop goes when Python stops being fast enough.',
  },
  {
    id: 'c',
    label: 'C',
    group: 0,
    hub: false,
    x: 17,
    y: 86,
    note: 'Systems coursework, memory-level debugging, small tools.',
  },
  {
    id: 'sql',
    label: 'SQL',
    group: 0,
    hub: false,
    x: 31,
    y: 66,
    note: 'Analytics over million-row telemetry tables without a warehouse.',
  },
  /**
   * Bash→JavaScript substitution (see file header). Coordinates and group
   * are the reference's own for this slot (`g:0, x:28, y:33`); the note is
   * new, written in the same register as the reference's other notes, and
   * stays a modest, resume-traceable claim (Skills > Languages lists
   * JavaScript beside TypeScript, with no separate usage bullet to draw
   * from) rather than inventing a specific project.
   */
  {
    id: 'javascript',
    label: 'JavaScript',
    group: 0,
    hub: false,
    x: 28,
    y: 33,
    note: 'Same runtime as the TypeScript work, minus the compiler holding the guardrails up.',
  },

  // --- ML & DATA (resume: Skills > ML/DL and Data & Computation; Leviathan project bullets) ---
  {
    id: 'mldata-hub',
    label: 'ML & DATA',
    group: 1,
    hub: true,
    x: 46,
    y: 20,
    note: 'Model internals, training on one GPU, and the data around it.',
  },
  {
    id: 'pytorch',
    label: 'PyTorch',
    group: 1,
    hub: false,
    x: 34,
    y: 5,
    note: 'Custom attention, gradient checkpointing, FP16 training on an RTX 4060.',
  },
  {
    id: 'transformers',
    label: 'Transformers',
    group: 1,
    hub: false,
    x: 56,
    y: 4,
    note: 'Hugging Face stack for tokenizers, datasets and fine-tuning runs.',
  },
  {
    id: 'numpy-pandas',
    label: 'NumPy · Pandas',
    group: 1,
    hub: false,
    x: 70,
    y: 14,
    note: 'Feature pipelines and evaluation over millions of chess positions.',
  },
  {
    id: 'scikit-learn',
    label: 'scikit-learn',
    group: 1,
    hub: false,
    x: 40,
    y: 40,
    note: 'Baselines worth beating before any deep model gets funded.',
  },

  // --- WEB (resume: Leviathan project bullets — PyTorch, FastAPI, Next.js, TypeScript, Tailwind CSS) ---
  {
    id: 'web-hub',
    label: 'WEB',
    group: 2,
    hub: true,
    x: 46,
    y: 74,
    note: 'Interfaces that make the model visible to people who are not me.',
  },
  {
    id: 'nextjs',
    label: 'Next.js',
    group: 2,
    hub: false,
    x: 32,
    y: 92,
    note: 'Dashboards and demos — server components, streaming responses.',
  },
  {
    id: 'fastapi',
    label: 'FastAPI',
    group: 2,
    hub: false,
    x: 58,
    y: 92,
    note: 'Serving inference endpoints with batching and sane latency budgets.',
  },
  {
    id: 'tailwind',
    label: 'Tailwind CSS',
    group: 2,
    hub: false,
    x: 52,
    y: 58,
    note: 'Fast UI without a stylesheet archaeology dig later.',
  },

  // --- INFRA (resume: Skills > Tools & Systems; NetApp experience bullets) ---
  {
    id: 'infra-hub',
    label: 'INFRA',
    group: 3,
    hub: true,
    x: 82,
    y: 50,
    note: 'Two years in storage systems taught me to automate everything twice.',
  },
  {
    id: 'docker',
    label: 'Docker',
    group: 3,
    hub: false,
    x: 71,
    y: 30,
    note: 'Reproducible training and test environments across machines.',
  },
  {
    id: 'linux',
    label: 'Linux',
    group: 3,
    hub: false,
    x: 92,
    y: 28,
    note: 'Daily driver. Kernel-adjacent debugging of storage and network paths.',
  },
  {
    id: 'ansible',
    label: 'Ansible',
    group: 3,
    hub: false,
    x: 95,
    y: 62,
    note: 'Orchestrated 300+ system configurations at NetApp.',
  },
  {
    id: 'vmware',
    label: 'VMware',
    group: 3,
    hub: false,
    x: 72,
    y: 64,
    note: 'Virtual test beds for FC, SAS and NVMe/RoCE storage topologies.',
  },
  {
    id: 'git',
    label: 'Git',
    group: 3,
    hub: false,
    x: 84,
    y: 82,
    note: 'Enough PR reviews to have opinions about branch naming.',
  },
  {
    id: 'postgresql',
    label: 'PostgreSQL',
    group: 3,
    hub: false,
    x: 96,
    y: 82,
    note: 'Schema and query work behind the NetApp web platform.',
  },
]

/**
 * Ring connecting the four hubs (reference lines 654: `[[0,7],[7,16],[16,12],[12,0]]`,
 * raw `nodesData` array indices there). Expressed here by `SkillGroup.id`
 * instead of raw node-array indices, so this stays correct even if
 * `SKILL_NODES` above is ever reordered — `deriveSkillEdges`
 * (`src/lib/skills/graph.ts`) resolves each group id to its hub node at
 * render time. Same topology as the reference: LANGUAGES↔ML & DATA↔INFRA↔WEB↔LANGUAGES.
 */
export const HUB_LINKS: readonly HubLink[] = [
  { from: 0, to: 1 },
  { from: 1, to: 3 },
  { from: 3, to: 2 },
  { from: 2, to: 0 },
]
