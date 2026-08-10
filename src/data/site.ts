const addressQuery = encodeURIComponent('Sector 9, North Karachi, Karachi, Pakistan')

export const siteInfo = {
  name: 'Breadline',
  tagline: 'Toast. Bite. Repeat.',
  siteUrl: 'https://breadline-syed-8387s-projects.vercel.app',
  address: 'Sector 9, North Karachi',
  phone: '+92 342 4511939',
  phoneHref: 'tel:+923424511939',
  email: 'contact@breadline.com',
  emailHref: 'mailto:contact@breadline.com',
  hours: 'Daily 4:00 PM – 4:00 AM',
  city: 'Karachi',
  area: 'North Karachi',
  country: 'PK',
  ogImage: '/images/og.png',
  logo: '/images/breadline-logo-badge.png',
  /** Approximate pin for Sector 9, North Karachi */
  lat: 24.9735,
  lng: 67.0662,
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${addressQuery}`,
  mapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${addressQuery}`,
  mapsEmbedUrl: `https://maps.google.com/maps?q=${addressQuery}&z=15&output=embed`
} as const
