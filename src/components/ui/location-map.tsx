import { ExternalLink, MapPin, Navigation } from 'lucide-react'
import { siteInfo } from '@/data/site'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LocationMap({
  className,
  title = 'Pin location'
}: {
  className?: string
  title?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm sm:rounded-3xl',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-brand" />
            <h3 className="font-display text-xl tracking-[0.04em] text-ink">{title}</h3>
          </div>
          <p className="mt-1 text-sm text-ink/60">{siteInfo.address}</p>
        </div>
      </div>

      <div className="relative aspect-[16/10] w-full bg-muted">
        <iframe
          title={`Breadline location — ${siteInfo.address}`}
          src={siteInfo.mapsEmbedUrl}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:p-4">
        <Button asChild variant="outline" className="flex-1">
          <a href={siteInfo.mapsUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Open in Maps
          </a>
        </Button>
        <Button asChild className="flex-1">
          <a href={siteInfo.mapsDirectionsUrl} target="_blank" rel="noopener noreferrer">
            <Navigation className="h-4 w-4" />
            Get Directions
          </a>
        </Button>
      </div>
    </div>
  )
}
