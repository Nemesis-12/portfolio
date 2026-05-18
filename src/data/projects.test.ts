import { describe, expect, it } from 'vitest'
import { projects } from './projects'

describe('projects data', () => {
  it('includes the full Leviathan tag list and resume bullets', () => {
    const leviathan = projects.find((project) => project.title === 'LEVIATHAN')

    expect(leviathan).toBeDefined()
    expect(leviathan?.tags).toEqual([
      'PyTorch',
      'FastAPI',
      'Next.js',
      'TypeScript',
      'Tailwind CSS'
    ])
    expect(leviathan?.description).toBe('20M-parameter searchless transformer chess engine with custom attention. Reduced KV-cache memory by 8× via Multi-Head Latent Attention. Custom 4,247-token tokenizer for single-token move prediction. Trained on 3M+ positions with gradient checkpointing and FP16 — 19ms per-move latency on edge hardware.')
    expect(leviathan?.bullets).toEqual([
      'Designed and trained 20M-parameter transformer with custom attention for real-time inference on edge hardware (RTX 4060, 8GB VRAM), optimizing architecture and training for resource-constrained deployment.',
      'Reduced KV-cache memory footprint by 8× through Multi-Head Latent Attention implementation, enabling batch inference and 19ms per-move latency in real-time inference settings.',
      'Designed custom tokenizer encoding board states and UCI notation into 4,247-token vocabulary for single-token move prediction.',
      'Trained on 3M+ chess positions using gradient checkpointing and mixed-precision (FP16) to maximize data throughput under memory constraints.'
    ])
  })

  it('includes MLA_IMPL resume bullets without changing the card description', () => {
    const mlaImpl = projects.find((project) => project.title === 'MLA_IMPL')

    expect(mlaImpl).toBeDefined()
    expect(mlaImpl?.description).toBe('Research implementation of Multi-Head Latent Attention from DeepSeek-V2. Modular PyTorch library with clean abstractions for KV compression and low-rank projection components. Published as a production-ready PyPI package with type hints, documentation, and integration examples.')
    expect(mlaImpl?.bullets).toEqual([
      'Translated Multi-Head Latent Attention from DeepSeek-V2 research into modular PyTorch implementation, designing clean abstractions for KV compression and low-rank projection components.',
      'Packaged implementation as production-ready PyPI library with type hints, documentation, and integration examples.'
    ])
  })
})
