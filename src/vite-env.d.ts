/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_3D_BETA: string
  readonly VITE_ENABLE_VOICE_BETA: string
  readonly VITE_ENABLE_WHEEL_BETA: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
