import { useCallback, useEffect, useState } from "react";
import { clearLogs, deleteLogs, fetchLogs, type LogEntry } from "../api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Box, Clock, History, RefreshCw, Terminal, Trash2 } from "lucide-react";

export default function LogsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchLogs();
      setLogs(data);
      setSelectedIds((current) =>
        current.filter((id) => data.some((log) => log.id === id)),
      );
      if (data.length === 0) {
        setIsConfirmingClear(false);
      }
      setError(null);
    } catch {
      setError("网络错误：无法获取系统日志");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const allSelected = logs.length > 0 && selectedIds.length === logs.length;
  const hasSelection = selectedIds.length > 0;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : logs.map((log) => log.id));
  };

  const toggleLog = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const handleDeleteSelected = async () => {
    if (!hasSelection) return;

    try {
      setIsDeletingSelected(true);
      await deleteLogs(selectedIds);
      toast("已删除选中的日志");
      setSelectedIds([]);
      await loadLogs();
    } catch {
      toast("删除选中日志失败");
    } finally {
      setIsDeletingSelected(false);
    }
  };

  const handleClearAll = async () => {
    if (logs.length === 0) return;
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      return;
    }

    try {
      setIsClearingAll(true);
      await clearLogs();
      toast("已清空全部日志");
      setSelectedIds([]);
      setIsConfirmingClear(false);
      await loadLogs();
    } catch {
      toast("清空日志失败");
    } finally {
      setIsClearingAll(false);
    }
  };

  return (
    <Card className="">
      <CardHeader className="flex flex-col items-start justify-between space-y-4 rounded-t-lg bg-[hsl(var(--slate-2))] p-6 shadow-[inset_0_-1px_0_hsl(var(--slate-6))] sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <CardTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            <History className="h-8 w-8 text-primary" />
            系统运行日志
          </CardTitle>
          <CardDescription className="mt-2 font-mono text-xs">
            查看系统操作历史、错误信息及请求事务日志
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-md bg-background px-4 hover:bg-primary hover:text-primary-foreground"
            onClick={loadLogs}
            disabled={loading || isDeletingSelected || isClearingAll}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="font-mono uppercase tracking-widest">刷新日志</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-md px-4"
            onClick={handleDeleteSelected}
            disabled={!hasSelection || loading || isDeletingSelected || isClearingAll}
          >
            <Trash2 className="h-4 w-4" />
            <span className="font-mono uppercase tracking-widest">删除选中</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-10 rounded-md px-4"
            onClick={handleClearAll}
            disabled={logs.length === 0 || loading || isDeletingSelected || isClearingAll}
          >
            <Trash2 className="h-4 w-4" />
            <span className="font-mono uppercase tracking-widest">
              {isConfirmingClear ? "确认清空" : "清空日志"}
            </span>
          </Button>
          {isConfirmingClear && (
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-md px-4"
              onClick={() => setIsConfirmingClear(false)}
              disabled={isClearingAll}
            >
              <span className="font-mono uppercase tracking-widest">取消</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {error && (
          <div className="m-6 flex items-center gap-2 border border-destructive bg-destructive/10 p-4 font-mono text-sm font-bold uppercase tracking-widest text-destructive shadow-[4px_4px_0_0_hsl(var(--destructive))]">
            <Box className="h-5 w-5" />
            {error}
          </div>
        )}

        <div className="bg-background p-6">
          <ScrollArea className="h-[600px] pr-4 custom-scrollbar">
            <div className="space-y-4">
              {logs.length > 0 && (
                <label className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/20 px-4 py-3 font-mono text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  <span>
                    {allSelected ? "取消全选" : "全选日志"}
                    {hasSelection ? ` (${selectedIds.length})` : ""}
                  </span>
                </label>
              )}

              {logs.length === 0 && !loading && (
                <div className="flex h-full flex-col items-center justify-center gap-4 py-20 font-mono text-muted-foreground">
                  <Terminal className="h-16 w-16 text-border" />
                  <p>暂无日志记录</p>
                </div>
              )}

              {logs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "group bg-background p-0 shadow-sm transition-colors glass-panel hover:shadow-[4px_4px_0_0_hsl(var(--primary))]",
                    selectedIds.includes(log.id)
                      ? "border-primary shadow-[4px_4px_0_0_hsl(var(--primary))]"
                      : "hover:border-primary",
                  )}
                >
                  <div className="flex items-start justify-between bg-muted/10 p-4 shadow-[inset_0_-1px_0_hsl(var(--slate-6))] transition-colors group-hover:bg-primary/5">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(log.id)}
                        onChange={() => toggleLog(log.id)}
                        className="h-4 w-4 accent-[hsl(var(--primary))]"
                      />
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(var(--blue-3))] text-primary shadow-[inset_0_0_0_1px_hsl(var(--blue-6))]">
                        <Terminal className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-sm font-bold text-foreground">
                        {log.message}
                      </span>
                    </div>
                    <div className="glass-panel flex items-center gap-2 bg-background px-2 py-1 font-mono text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 text-primary" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>

                  {log.payload && (
                    <div className="bg-black/50 p-4">
                      <div className="mb-2 flex items-center gap-2 border-b border-border/30 pb-2">
                        <div className="h-3 w-3 bg-destructive glass-panel" />
                        <div className="h-3 w-3 bg-secondary glass-panel" />
                        <div className="h-3 w-3 bg-primary glass-panel" />
                        <span className="ml-2 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          请求载荷数据
                        </span>
                      </div>
                      <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed text-white">
                        <code>{JSON.stringify(log.payload, null, 2)}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
