import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Megvax - Meta Ads Management',
    short_name: 'Megvax',
    description: 'Manage your Meta ad campaigns from one place. AI-powered optimizations and automations for better ROAS.',
    start_url: '/app/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563EB',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
  };
}
