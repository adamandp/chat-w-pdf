import { Button } from "@/components/ui/button";
export interface StatusProps {
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  onRetry?: () => void;
  children?: React.ReactNode;
}
export function Status({
  loading,
  error,
  empty,
  onRetry,
  children,
}: StatusProps) {
  if (loading)
    return (
      <div className="state" role="status">
        Loading your workspace…
      </div>
    );
  if (error)
    return (
      <div className="state" role="alert">
        Something went wrong. <Button onClick={onRetry}>Try again</Button>
      </div>
    );
  if (empty)
    return <div className="state">{children ?? "Nothing here yet."}</div>;
  return null;
}
