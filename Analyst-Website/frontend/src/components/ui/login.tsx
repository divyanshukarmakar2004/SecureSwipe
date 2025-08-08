import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Static login credentials
    if (username === "analyst" && password === "admin123") {
      setTimeout(() => {
        setIsLoading(false);
        onLogin();
      }, 1000);
    } else {
      setTimeout(() => {
        setError("Invalid credentials. Use analyst/admin123");
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dashboard-bg p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-primary">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Secure-Swipe
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-Powered Security Analytics
            </p>
          </div>
        </div>

        <Card className="dashboard-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the analyst dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="analyst"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full bg-gradient-primary hover:opacity-90 transition-opacity",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 p-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground">
                Demo credentials: <strong>analyst</strong> / <strong>admin123</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}