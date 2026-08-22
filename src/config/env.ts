export interface AppConfig {
  mapbox: {
    accessToken: string;
    styleUrl: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  stripe: {
    publishableKey: string;
  };
  crimeApi: {
    endpoint: string;
    appToken: string;
  };
  push: {
    vapidKey: string;
  };
  isProduction: boolean;
}

export const APP_CONFIG: AppConfig = {
  mapbox: {
    accessToken: (import.meta as any).env?.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoic2FmZXBhcmsiLCJhIjoiY2x6c2FmZXBhcmswMDExeTN0eGkwaWV6ZzgifQ.mock_or_live_token',
    styleUrl: 'mapbox://styles/mapbox/dark-v11',
  },
  supabase: {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || 'https://safepark-prod-db.supabase.co',
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon_mock',
  },
  stripe: {
    publishableKey: (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SafeparkDevKey99xYzQ',
  },
  crimeApi: {
    endpoint: (import.meta as any).env?.VITE_CRIME_API_ENDPOINT || 'https://data.sfgov.org/resource/wg3w-h783.json',
    appToken: (import.meta as any).env?.VITE_SOCRATA_DATA_SF_APP_TOKEN || '',
  },
  push: {
    vapidKey: (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY || '',
  },
  isProduction: (import.meta as any).env?.PROD || false,
};
