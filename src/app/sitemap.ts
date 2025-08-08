import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const heads = headers();
  const proto = heads.get('x-forwarded-proto');
  const host = heads.get('host');
  const url = `${proto}://${host}`;

  return [
    {
      url: url,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
  ];
}
