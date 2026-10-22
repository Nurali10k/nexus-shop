const callouts = [
  { label: 'DRIVER / 40 MM', className: 'left-[6%] top-[22%]', line: 'w-16 sm:w-24' },
  { label: 'ANC / ACTIVE', className: 'right-[5%] top-[42%] text-right', line: 'ml-auto w-12 sm:w-20' },
  { label: 'USB-C / 48 H', className: 'left-[9%] bottom-[18%]', line: 'w-20 sm:w-28' },
];

export default function SpecOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {callouts.map(({ label, className, line }) => (
        <div key={label} className={`spec-label hidden sm:block ${className}`}>
          <span>{label}</span>
          <span className={`spec-line ${line}`} />
        </div>
      ))}
      <span className="absolute left-3 top-3 h-3 w-3 border-l-2 border-t-2 border-primary-500" />
      <span className="absolute right-3 top-3 h-3 w-3 border-r-2 border-t-2 border-primary-500" />
      <span className="absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2 border-primary-500" />
      <span className="absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 border-primary-500" />
    </div>
  );
}
