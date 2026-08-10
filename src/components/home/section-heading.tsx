export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  align = 'left'
}: {
  title: string
  subtitle?: string
  eyebrow?: string
  align?: 'left' | 'center'
}) {
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      {eyebrow && (
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.28em] text-brand">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[0.95] tracking-[0.03em] text-ink">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 max-w-xl text-base text-ink/60 ${align === 'center' ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
