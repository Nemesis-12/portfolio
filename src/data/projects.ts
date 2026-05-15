export interface Project {
  id: string
  title: string
  description: string
  tags: string[]
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'LEVIATHAN',
    description: '20M-parameter searchless transformer chess engine with custom attention. Reduced KV-cache memory by 8× via Multi-Head Latent Attention. Custom 4,247-token tokenizer for single-token move prediction. Trained on 3M+ positions with gradient checkpointing and FP16 — 19ms per-move latency on edge hardware.',
    tags: ['PyTorch', 'FastAPI', 'Next.js']
  },
  {
    id: '2',
    title: 'MLA_IMPL',
    description: 'Research implementation of Multi-Head Latent Attention from DeepSeek-V2. Modular PyTorch library with clean abstractions for KV compression and low-rank projection components. Published as a production-ready PyPI package with type hints, documentation, and integration examples.',
    tags: ['PyTorch', 'Python', 'PyPI']
  }
]
