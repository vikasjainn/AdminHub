interface AvatarProps {
  src: string;
  /** Empty for decorative avatars that sit next to the person's name. */
  alt?: string;
  name?: string;
  className: string;
}

export default function Avatar({ src, alt = '', name = '', className }: AvatarProps) {
  if (!src) {
    const initials = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return (
      <span
        role="img"
        aria-label={alt || name}
        className={`grid shrink-0 place-items-center bg-indigo-50 text-[11px] font-semibold text-indigo-700 ${className}`}
      >
        {initials}
      </span>
    );
  }
  // Plain <img>: small remote avatars that do not benefit from next/image optimisation.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}
