import { Loader2 } from "lucide-react";
import { Card, CardContent } from "./card";

interface LoadingProps {
  message?: string;
  className?: string;
}

export function Loading({ message = "Loading...", className = "" }: LoadingProps) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function LoadingCard({ message = "Loading data..." }: { message?: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <Loading message={message} />
      </CardContent>
    </Card>
  );
}

export function LoadingTable() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

