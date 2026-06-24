// Shared button — one consistent style across the app. variant: primary | ghost | quiet.
export function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>{children}</button>
  );
}
