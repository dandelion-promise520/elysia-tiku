import { useState, useCallback } from "react";
import { fetchConfig } from "../api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck, AlertTriangle } from "lucide-react";

interface Props {
  onLoginSuccess: () => void;
}

export default function LoginPanel({ onLoginSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError(null);

    localStorage.setItem("admin_token", password);

    try {
      await fetchConfig();
      setAttempts(0);
      onLoginSuccess();
    } catch (err: any) {
      setAttempts(prev => prev + 1);

      if (err.name === "AuthError") {
        setError("身份验证失败：密码错误");
        localStorage.removeItem("admin_token");
      } else {
        setError("网络错误：无法连接到服务器");
      }
    } finally {
      setLoading(false);
    }
  }, [password, onLoginSuccess]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-20 w-20 items-center justify-center bg-gradient-to-br from-blue-8 to-blue-9 text-white rounded-2xl shadow-xl">
          <Lock className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">系统身份验证</h2>
          <p className="text-muted-foreground">需要管理员权限才能访问系统</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="password"
              placeholder="请输入管理员密码"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null); // 清除错误状态当用户开始输入
              }}
              className="input-enhanced h-12 text-center text-base pr-12"
              autoFocus
            />
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-3/20 border border-red-6/30 text-red-11 p-4 rounded-xl">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">登录失败</p>
              <p className="text-sm opacity-90">{error}</p>
              {attempts > 2 && (
                <p className="text-xs opacity-70 mt-2">
                  连续失败 {attempts} 次，请检查网络连接或联系管理员
                </p>
              )}
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full btn-interactive h-12 text-base font-semibold"
          disabled={!password || loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              正在验证身份...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
              登录到管理面板
            </span>
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          忘记密码？请联系系统管理员重置访问权限
        </p>
      </div>
    </div>
  );
}