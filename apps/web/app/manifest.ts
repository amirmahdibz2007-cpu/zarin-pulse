import { copy } from '@zarinpulse/contracts';
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: copy.product.name,
    short_name: copy.product.name,
    description: copy.product.tagline,
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    dir: 'rtl',
    lang: 'fa',
    background_color: '#161418',
    theme_color: '#161418',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
