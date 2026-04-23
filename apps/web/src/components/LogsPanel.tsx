import { useState, useEffect, useCallback } from "react";
import { fetchLogs, type LogEntry } from "../api";

export default function LogsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchLogs();
      setLogs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div className="card" id="logs-panel">
      <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>
          <span className="icon">📄</span>系统日志
        </span>
        <button className="btn btn-secondary" onClick={loadLogs} disabled={loading} style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}>
          {loading ? "刷新中..." : "🔄 刷新"}
        </button>
      </div>

      {error && <div className="error-message" style={{ color: "var(--danger)", marginBottom: "1rem" }}>{error}</div>}

      <div className="logs-container" style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "60vh", overflowY: "auto", paddingRight: "0.5rem" }}>
        {logs.length === 0 && !loading && (
          <div style={{ textAlign: "center", color: "var(--text-light)", padding: "2rem" }}>
            暂无日志
          </div>
        )}

        {logs.map((log, i) => (
          <div key={i} style={{ padding: "1rem", backgroundColor: "var(--surface-color)", borderRadius: "var(--radius)", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--text-light)" }}>
              <strong>{log.message}</strong>
              <span>{new Date(log.timestamp).toLocaleString()}</span>
            </div>
            
            {log.payload && (
              <pre style={{ margin: 0, padding: "0.75rem", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "var(--radius)", fontSize: "0.875rem", overflowX: "auto", color: "var(--text-color)" }}>
                <code>{JSON.stringify(log.payload, null, 2)}</code>
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
