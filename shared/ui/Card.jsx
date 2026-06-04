export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-lg border shadow ${className}`}>{children}</div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
