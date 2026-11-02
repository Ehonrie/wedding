export default function Divider() {
  return (
    <svg className="divider" viewBox="0 0 220 20" aria-hidden="true">
      <defs>
        <linearGradient id="div-g" x1="0" x2="1">
          <stop offset="0" stopColor="#c9a24a" stopOpacity="0" />
          <stop offset="0.5" stopColor="#c9a24a" />
          <stop offset="1" stopColor="#c9a24a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1="10" x2="220" y2="10" stroke="url(#div-g)" strokeWidth="1" />
      <path d="M110,3 L117,10 L110,17 L103,10Z" fill="#c9a24a" />
      <circle cx="90" cy="10" r="1.8" fill="#c9a24a" />
      <circle cx="130" cy="10" r="1.8" fill="#c9a24a" />
    </svg>
  )
}
