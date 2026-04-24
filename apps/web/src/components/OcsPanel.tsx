import { useState, useMemo } from "react";
import { generateOcsConfig, ocsConfigToJson } from "../ocs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ClipboardList, Link2, Copy, Check, BookOpen, Info } from "lucide-react";

interface Props {
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function OcsPanel({ showToast }: Props) {
  const [serverUrl, setServerUrl] = useState(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return origin.replace(/:\d+$/, ":3000");
      }
      return origin;
    }
    return "http://localhost:3000";
  });
  const [copied, setCopied] = useState(false);

  const config = useMemo(() => generateOcsConfig(serverUrl), [serverUrl]);
  const json = useMemo(() => ocsConfigToJson(config), [config]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      showToast("SYS.MSG: JSON Copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("ERR_COPY: CLIPBOARD_DENIED", "error");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <Card className="border bg-card overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 p-6">
          <CardTitle className="flex items-center gap-3 text-3xl font-semibold tracking-tight">
            <ClipboardList className="h-8 w-8 text-primary" />
            OCS_GEN
          </CardTitle>
          <CardDescription className="font-mono text-xs uppercase tracking-widest mt-2">
            Generate JSON config for OCS Extension
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              <Link2 className="h-4 w-4 text-primary" /> TARGET_SERVER_URL
            </Label>
            <Input
              type="text"
              className=" h-12 px-4 bg-background"
              placeholder="http://your-server:3000"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground font-mono uppercase">
              URL of the Elysia Tiku backend service
            </p>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              GENERATED_PAYLOAD
            </Label>
            <div className="relative group">
              <div className="absolute top-4 right-4 z-10">
                <Button
                  size="sm"
                  className={` rounded-md h-10 gap-2 font-mono uppercase tracking-widest ${copied ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-muted"}`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" /> COPIED
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> COPY_JSON
                    </>
                  )}
                </Button>
              </div>
              <pre className="p-6 bg-background border border-border font-mono text-sm text-foreground overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar shadow-inner">
                {json}
              </pre>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleCopy}
          >
            <span className="flex items-center gap-2">
              <Copy className="h-6 w-6 group-hover:scale-110 transition-transform" /> EXEC.COPY_CONFIG
            </span>
          </Button>
        </CardContent>
      </Card>

      <Card className="border bg-card bg-muted/30 border-muted">
        <CardHeader className="p-6 border-b border-primary bg-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
            <BookOpen className="h-6 w-6" />
            QUICK_START.MANUAL
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {[
            { step: "01", text: "Ensure backend service is running and accessible (use localhost:3000 for local dev)." },
            { step: "02", text: "Input server URL above, JSON payload updates automatically." },
            { step: "03", text: "Execute COPY and paste into OCS Extension settings." },
          ].map((item) => (
            <div key={item.step} className="flex gap-6 items-start group">
              <span className="text-3xl font-black text-muted-foreground group-hover:text-primary transition-colors font-mono">
                {item.step}
              </span>
              <p className="text-sm font-mono uppercase tracking-widest pt-2 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
          <div className="mt-8 p-5 border border-primary bg-primary/10 flex gap-4 items-start">
            <Info className="h-6 w-6 text-primary shrink-0" />
            <div className="space-y-1">
              <div className="text-sm font-bold text-primary uppercase font-mono tracking-widest">
                HTTPS_WARNING
              </div>
              <p className="text-xs text-muted-foreground font-mono uppercase leading-relaxed">
                Mixed content blocked if OCS domain is HTTPS but backend is HTTP without reverse proxy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
