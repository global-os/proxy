export type SquintCompileSpec = {
  source: string
  output: string
  externals?: Record<string, string>
}

export type GappDependencySpec = {
  version: string
  source: 'bundled' | 'cdn' | 'platform'
  format: 'iife' | 'esm' | 'importmap'
  path?: string
  url?: string
  global?: string
  order?: number
}

export type GappManifest = {
  name?: string
  version?: string
  /** Icon basename (without .bmp) under Users/.local/icons/ */
  icon?: string
  entry?: string
  type?: 'classic' | 'module'
  compile?: {
    squint?: SquintCompileSpec
  }
  dependencies?: Record<string, GappDependencySpec>
}