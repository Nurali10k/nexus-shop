export default function Input({ as: Element = 'input', className = '', ...props }) {
  return (
    <Element
      {...props}
      className={`w-full border-2 border-line bg-surface px-4 py-3 font-mono text-sm text-white placeholder:text-muted outline-none transition focus:border-primary-500 ${className}`}
    />
  )
}
