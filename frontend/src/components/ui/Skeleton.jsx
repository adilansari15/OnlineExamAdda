export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-2 ${className}`}
      {...props}
    />
  );
}

export default Skeleton;

