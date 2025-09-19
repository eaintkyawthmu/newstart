/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SANITY_PROJECT_ID: string
  readonly VITE_SANITY_DATASET: string
  readonly VITE_SANITY_TOKEN: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STRIPE_PRICE_MONTHLY: string
  readonly VITE_STRIPE_PRICE_YEARLY: string
  readonly VITE_STRIPE_PRICE_LIFETIME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}