// Feature flags driven by Vite environment variables.
// Set the corresponding variable to "true" in your .env file to enable a beta feature.

export const ENABLE_3D_BETA: boolean =
  import.meta.env.VITE_ENABLE_3D_BETA === 'true'

export const ENABLE_VOICE_BETA: boolean =
  import.meta.env.VITE_ENABLE_VOICE_BETA === 'true'

export const ENABLE_WHEEL_BETA: boolean =
  import.meta.env.VITE_ENABLE_WHEEL_BETA === 'true'
