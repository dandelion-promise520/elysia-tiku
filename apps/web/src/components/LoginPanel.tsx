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
        setError("身份验证失败：密码错误");
        localStorage.removeItem("admin_token");
      } else {
        setError("网络错误：无法连接到服务器");
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
        <CardTitle className="text-3xl font-semibold tracking-tight">系统身份验证</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-2">
          需要管理员权限才能访问系统
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="请输入管理员密码"
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
                验证中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                登录系统
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}