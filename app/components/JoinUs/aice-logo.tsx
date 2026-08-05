import Image from 'next/image'

export function AiceLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/logos/aice_logo.png"
      alt="AICE Logo"
      width={36}
      height={36}
      style={{ height: 'auto' }}
      className={className}
    />
  )
}
