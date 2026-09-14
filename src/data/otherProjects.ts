export interface OtherProject {
  readonly id: string
  readonly title: string
  readonly badge: {
    readonly label: string
    readonly year: number
  }
  readonly tagline: string
  readonly description: string
  readonly installCommand: string
  readonly extraLink?: {
    readonly label: string
    readonly href: string
  }
}

export const MLA_PROJECT: OtherProject = {
  id: 'mla',
  title: 'Multi-Head Latent Attention',
  badge: { label: 'PUBLISHED', year: 2025 },
  tagline: 'Read the paper. Wrote the library.',
  description:
    'Multi-Head Latent Attention from DeepSeek-V2, translated into a modular PyTorch implementation with clean abstractions for KV compression and low-rank projection — packaged as a production-ready PyPI library with type hints, documentation, and integration examples.',
  installCommand: 'pip install multihead-latent-attention',
  extraLink: { label: 'package', href: 'https://pypi.org/project/multihead-latent-attention' },
}
