import { useState } from "react";
import { fetchConfig } from "../api";

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
    
    // Temporarily set token to test
    localStorage.setItem("admin_token", password);
    
    try {
      await fetchConfig();
      // If no AuthError is thrown, login is successful
      onLoginSuccess();
    } catch (err: any) {
      if (err.name === "AuthError") {
        setError("密码错误");
        localStorage.removeItem("admin_token");
      } else {
        setError("连接服务失败");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: "400px", margin: "4rem auto", textAlign: "center" }}>
      <div className="card-title" style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
        <span className="icon">🔒</span> 管理员登录
      </div>
      
      <p style={{ color: "var(--text-light)", marginBottom: "2rem", fontSize: "0.875rem" }}>
        该系统已设置管理密码，请输入密码以继续
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="password"
            placeholder="请输入管理员密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ textAlign: "center" }}
            autoFocus
          />
        </div>
        
        {error && <div style={{ color: "var(--danger)", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</div>}

        <button 
          type="submit" 
          className="btn btn-primary btn-block" 
          disabled={!password || loading}
        >
          {loading ? <span className="spinner" /> : "登 录"}
        </button>
      </form>
    </div>
  );
}
