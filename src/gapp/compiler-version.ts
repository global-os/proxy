import { getBuildVersion } from '../build-version.js'

// Bump COMPILER_VERSION when compile-gapp.ts produces different output from the
// same source during local development (before committing). On any real deploy
// the git SHA changes automatically, so this only matters mid-dev.
const COMPILER_VERSION = '2'

export const COMPILER_CACHE_KEY = `${COMPILER_VERSION}:${getBuildVersion().sha}`
