import { useState } from "react";
import { fetchConfig } from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  onLoginSuccess: () => void;
}

export default function LoginPanel({ onLoginSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    setError(null);
    
    localStorage.setItem("admin_token", password);
    
    try {
      await fetchConfig();
      onLoginSuccess();
    } catch (err: any) {
      if (err.name === "AuthError") {
        setError("ERR_AUTH: INVALID_PASSWORD");
        localStorage.removeItem("admin_token");
      } else {
        setError("ERR_NET: UNABLE_TO_CONNECT");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md border bg-card">
      <CardHeader className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border bg-muted text-foreground rounded-full">
          <Lock className="h-8 w-8" />
        </div>
        <CardTitle className="text-3xl font-semibold tracking-tight">AUTH.SYS</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-2">
          Administrator access required
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="ENTER_PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-center"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="flex items-center justify-center gap-2 bg-destructive/10 text-destructive p-3 rounded-md text-sm font-medium border border-destructive/20">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!password || loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                VERIFYING...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                INITIATE.LOGIN
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
