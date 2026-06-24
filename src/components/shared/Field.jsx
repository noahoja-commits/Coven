// Shared input/textarea — consistent dark field with a gold focus hairline.
export function Field({ as = 'input', className = '', ...props }) {
  const Tag = as;
  return <Tag className={`field ${className}`} {...props} />;
}
