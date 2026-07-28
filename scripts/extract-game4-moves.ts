/**
 * One-shot conversion script: reads the committed Game 4 SGF and writes
 * `src/data/game4Moves.ts`.
 *
 * This is NOT part of the build, lint, test, or CI pipeline — it is run
 * manually, once, whenever the source SGF changes:
 *
 *   npx tsx scripts/extract-game4-moves.ts
 *
 * The source is a Fan Hui commentary record of AlphaGo vs. Lee Sedol,
 * Game 4 (2016-03-13), which embeds analysis variations as SGF branches.
 * Main-line extraction takes the first child at every branch point,
 * discarding commentary variations, to recover the 180 moves actually
 * played.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SOURCE_SGF = fileURLToPath(
  new URL('../data/sgf/2016.03.13-Lee_Sedol-Alphago.sgf', import.meta.url),
)
const OUTPUT_MODULE = fileURLToPath(new URL('../src/data/game4Moves.ts', import.meta.url))

type Color = 'B' | 'W'

interface SgfNode {
  readonly props: Readonly<Record<string, string[]>>
}

interface SgfTree {
  readonly nodes: readonly SgfNode[]
  readonly children: readonly SgfTree[]
}

interface ExtractedMove {
  readonly moveNumber: number
  readonly color: Color
  readonly sgf: string
  readonly row: number
  readonly col: number
}

/** Minimal recursive-descent SGF parser, sufficient for this one file. */
function parseSgf(text: string): SgfTree {
  let i = 0
  const n = text.length

  function skipWhitespace(): void {
    while (i < n && /\s/.test(text[i])) i++
  }

  function parseValue(): string {
    i++ // consume '['
    let value = ''
    while (i < n && text[i] !== ']') {
      if (text[i] === '\\') {
        value += text[i + 1]
        i += 2
        continue
      }
      value += text[i]
      i++
    }
    i++ // consume ']'
    return value
  }

  function parseNode(): SgfNode {
    i++ // consume ';'
    skipWhitespace()
    const props: Record<string, string[]> = {}
    while (i < n && /[A-Za-z]/.test(text[i])) {
      let ident = ''
      while (i < n && /[A-Za-z]/.test(text[i])) {
        ident += text[i]
        i++
      }
      const values: string[] = []
      while (i < n && text[i] === '[') {
        values.push(parseValue())
        skipWhitespace()
      }
      props[ident] = values
      skipWhitespace()
    }
    return { props }
  }

  function parseTree(): SgfTree {
    i++ // consume '('
    skipWhitespace()
    const nodes: SgfNode[] = []
    while (i < n && text[i] === ';') {
      nodes.push(parseNode())
      skipWhitespace()
    }
    const children: SgfTree[] = []
    while (i < n && text[i] === '(') {
      children.push(parseTree())
      skipWhitespace()
    }
    if (text[i] !== ')') {
      throw new Error(`Malformed SGF: expected ')' at offset ${i}`)
    }
    i++ // consume ')'
    skipWhitespace()
    return { nodes, children }
  }

  skipWhitespace()
  return parseTree()
}

/** Main-line extraction: first child at every branch point. */
function extractMainLineMoves(root: SgfTree): ExtractedMove[] {
  const moves: ExtractedMove[] = []
  let tree: SgfTree = root
  let nodeIndex = 1 // node 0 of the root tree is the game-info setup node, not a move

  for (;;) {
    for (; nodeIndex < tree.nodes.length; nodeIndex++) {
      const { props } = tree.nodes[nodeIndex]
      const color: Color | null = props.B ? 'B' : props.W ? 'W' : null
      if (color === null) continue

      const sgf = (props.B ?? props.W)[0]
      moves.push({
        moveNumber: moves.length + 1,
        color,
        sgf,
        col: sgf.charCodeAt(0) - 'a'.charCodeAt(0),
        row: sgf.charCodeAt(1) - 'a'.charCodeAt(0),
      })
    }
    if (tree.children.length === 0) break
    tree = tree.children[0]
    nodeIndex = 0
  }

  return moves
}

function assertHeaders(root: SgfTree): void {
  const info = root.nodes[0].props
  const expect = (key: string, value: string): void => {
    const actual = info[key]?.[0]
    if (actual !== value) {
      throw new Error(`Header mismatch: ${key} expected [${value}], got [${actual}]`)
    }
  }
  expect('DT', '2016-03-13')
  expect('PW', 'Lee Sedol')
  expect('PB', 'AlphaGo')
  expect('RE', 'W+Resign')
  expect('SZ', '19')
}

function assertInvariants(moves: readonly ExtractedMove[]): void {
  if (moves.length !== 180) {
    throw new Error(`Expected exactly 180 moves, got ${moves.length}`)
  }
  for (let k = 1; k < moves.length; k++) {
    if (moves[k].color === moves[k - 1].color) {
      throw new Error(`Colours do not alternate at move ${k + 1}`)
    }
  }
  for (const move of moves) {
    if (move.row < 0 || move.row > 18 || move.col < 0 || move.col > 18) {
      throw new Error(`Move ${move.moveNumber} (${move.sgf}) is outside the 19x19 board`)
    }
  }
  if (moves[0].color !== 'B' || moves[0].sgf !== 'pd') {
    throw new Error(`Expected move 1 to be B[pd], got ${moves[0].color}[${moves[0].sgf}]`)
  }
  if (moves[77].color !== 'W' || moves[77].sgf !== 'ki') {
    throw new Error(`Expected move 78 to be W[ki], got ${moves[77].color}[${moves[77].sgf}]`)
  }
}

function renderModule(moves: readonly ExtractedMove[]): string {
  const entries = moves
    .map(
      (m) =>
        `  { moveNumber: ${m.moveNumber}, color: '${m.color}', sgf: '${m.sgf}', position: { row: ${m.row}, col: ${m.col} } },`,
    )
    .join('\n')

  return `/**
 * Real move data for AlphaGo vs. Lee Sedol, Game 4 (2016-03-13, Fan Hui
 * commentary record). AlphaGo played Black, Lee Sedol White; White won by
 * resignation. Move 78, W[ki], is Lee's wedge at L11 — the move the game
 * turns on.
 *
 * GENERATED by \`scripts/extract-game4-moves.ts\` from the committed SGF at
 * \`data/sgf/2016.03.13-Lee_Sedol-Alphago.sgf\` via main-line extraction
 * (first child taken at every branch point, since the source embeds
 * analysis variations). Do not hand-edit — regenerate from the script if
 * the source SGF ever changes.
 */
import type { Color, Position } from '@/lib/go/board'

export interface Game4Move {
  readonly moveNumber: number
  readonly color: Color
  /** Original two-character SGF coordinate, e.g. "pd". */
  readonly sgf: string
  readonly position: Position
}

export const GAME4_MOVES: readonly Game4Move[] = [
${entries}
]
`
}

function main(): void {
  const text = readFileSync(SOURCE_SGF, 'utf-8')
  const root = parseSgf(text)
  assertHeaders(root)
  const moves = extractMainLineMoves(root)
  assertInvariants(moves)
  writeFileSync(OUTPUT_MODULE, renderModule(moves))
  console.log(`Wrote ${moves.length} moves to ${OUTPUT_MODULE}`)
}

main()
