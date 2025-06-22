/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SANITY_PROJECT_ID: string
  readonly VITE_SANITY_DATASET: string
  readonly VITE_SANITY_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}