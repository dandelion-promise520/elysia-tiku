import { useState, useEffect, useCallback } from "react";
import { fetchLogs, type LogEntry } from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RefreshCw, Terminal, Clock, Box } from "lucide-react";

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
      setError("ERR_NET: UNABLE_TO_FETCH_LOGS");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <Card className="border bg-card">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 border-b border-border bg-muted/20 p-6">
        <div>
          <CardTitle className="flex items-center gap-3 text-3xl font-semibold tracking-tight">
            <History className="h-8 w-8 text-primary" />
            SYS.LOGS
          </CardTitle>
          <CardDescription className="font-mono text-xs uppercase tracking-widest mt-2">
            System operation history and transaction logs
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className=" h-10 px-4 bg-background rounded-md hover:bg-primary hover:text-primary-foreground group" 
          onClick={loadLogs} 
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform" />
          )}
          <span className="font-mono tracking-widest uppercase">SYNC</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {error && (
          <div className="m-6 p-4 border border-destructive bg-destructive/10 text-destructive text-sm font-bold font-mono tracking-widest uppercase flex items-center gap-2 shadow-[4px_4px_0_0_hsl(var(--destructive))]">
             <Box className="h-5 w-5" />
             {error}
          </div>
        )}

        <div className="bg-background border-t-0 p-6">
          <ScrollArea className="h-[600px] pr-4 custom-scrollbar">
            <div className="space-y-4">
            {logs.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 py-20 font-mono uppercase tracking-widest">
                <Terminal className="h-16 w-16 text-border" />
                <p>NO_LOG_ENTRIES_FOUND</p>
              </div>
            )}

            {logs.map((log, i) => (
              <div key={i} className="group p-0 bg-background border border-border hover:border-primary transition-colors shadow-sm hover:shadow-[4px_4px_0_0_hsl(var(--primary))]">
                <div className="flex items-start justify-between p-4 border-b border-border bg-muted/10 group-hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center border border-primary bg-primary/10 text-primary">
                      <Terminal className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-foreground font-mono uppercase tracking-wide text-sm">{log.message}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-background border border-border px-2 py-1">
                    <Clock className="h-3 w-3 text-primary" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
                
                {log.payload && (
                  <div className="p-4 bg-black/50">
                    <div className="mb-2 flex items-center gap-2 border-b border-border pb-2">
                      <div className="w-3 h-3 bg-destructive border border-border" />
                      <div className="w-3 h-3 bg-secondary border border-border" />
                      <div className="w-3 h-3 bg-primary border border-border" />
                      <span className="text-xs font-bold font-mono text-muted-foreground tracking-widest ml-2 uppercase">DATA_PAYLOAD</span>
                    </div>
                    <pre className="text-xs font-mono text-secondary overflow-x-auto whitespace-pre-wrap leading-relaxed">
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
