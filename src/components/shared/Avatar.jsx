// Renders a user's uploaded photo when present, else their emoji glyph.
// Drop-in for the many round avatar chips across the app.
export function Avatar({ url, glyph = '✦', size = 40, className = '' }) {
  const px = typeof size === 'number' ? `${size}px` : size;
  return (
    <div
      className={`rounded-full overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0 ${className}`}
      style={{ width: px, height: px }}>
      {url
        ? <img src={url} alt="" loading="lazy" className="w-full h-full object-cover" />
        : <span style={{ fontSize: `calc(${px} * 0.52)`, lineHeight: 1 }}>{glyph}</span>}
    </div>
  );
}
