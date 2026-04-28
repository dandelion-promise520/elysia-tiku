import { DEFAULT_SERVER_PORT } from "@elysia-tiku/constants";
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
        return origin.replace(/:\d+$/, `:${DEFAULT_SERVER_PORT}`);
      }
      return origin;
    }
    return `http://localhost:${DEFAULT_SERVER_PORT}`;
  });
  const [copied, setCopied] = useState(false);

  const config = useMemo(() => generateOcsConfig(serverUrl), [serverUrl]);
  const json = useMemo(() => ocsConfigToJson(config), [config]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(json);
      } else {
        const ta = document.createElement("textarea");
        ta.value = json;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      showToast("系统消息：JSON 配置已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("复制失败：剪贴板权限被拒绝", "error");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <Card className="overflow-hidden">
        <CardHeader className="shadow-[inset_0_-1px_0_hsl(var(--slate-6))] bg-[hsl(var(--slate-2))] p-6">
          <CardTitle className="font-semibold text-xl tracking-tight shadow-[inset_0_-1px_0_hsl(var(--slate-6))] pb-4 flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            OCS 题库配置生成器
          </CardTitle>
          <CardDescription className="font-mono text-xs  mt-2">
            生成用于 OCS 浏览器扩展的 JSON 配置文件
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-medium text-[hsl(var(--slate-11))]">
              <Link2 className="h-4 w-4 text-primary" /> 目标服务器地址
            </Label>
            <Input
              type="text"
              className=" px-4 bg-background"
              placeholder={`http://your-server:${DEFAULT_SERVER_PORT}`}
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground font-mono uppercase">
              Elysia Tiku 后端服务的访问地址
            </p>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-medium text-[hsl(var(--slate-11))]">
              生成的 JSON 配置代码
            </Label>
            <div className="relative group">
              <div className="absolute top-4 right-4 z-10">
                <Button
                  size="sm"
                  className={` rounded-md h-10 gap-2 font-mono  ${copied ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-muted"}`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" /> 已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> 复制 JSON
                    </>
                  )}
                </Button>
              </div>
              <pre className="p-6 bg-background glass-panel font-mono text-sm text-foreground overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar shadow-inner">
                {json}
              </pre>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleCopy}
          >
            <span className="flex items-center gap-2">
              <Copy className="h-6 w-6 group-hover:scale-110 transition-transform" /> 复制完整配置代码
            </span>
          </Button>
        </CardContent>
      </Card>

      <Card className="border bg-card bg-[hsl(var(--slate-2))] glass-panel">
        <CardHeader className="p-6 bg-[hsl(var(--blue-3))] shadow-[inset_0_-1px_0_hsl(var(--blue-6))] text-[hsl(var(--blue-11))]">
          <CardTitle className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
            <BookOpen className="h-6 w-6" />
            快速使用指南
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {[
            { step: "01", text: `请确保后端服务正在运行且可访问（本地开发请使用 localhost:${DEFAULT_SERVER_PORT}）。` },
            { step: "02", text: "在上方输入服务器地址，下方的 JSON 配置代码会自动更新。" },
            { step: "03", text: "点击复制按钮，并将代码粘贴到 OCS 扩展的自定义题库设置中。" },
          ].map((item) => (
            <div key={item.step} className="flex gap-6 items-start group">
              <span className="text-3xl font-black text-muted-foreground group-hover:text-primary transition-colors font-mono">
                {item.step}
              </span>
              <p className="text-sm font-mono  pt-2 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
          <div className="mt-8 p-5 shadow-[inset_0_0_0_1px_hsl(var(--blue-6))] bg-[hsl(var(--blue-3))] flex gap-4 items-start">
            <Info className="h-6 w-6 text-primary shrink-0" />
            <div className="space-y-1">
              <div className="text-sm font-bold text-primary uppercase font-mono tracking-widest">
                HTTPS 混合内容警告
              </div>
              <p className="text-xs text-muted-foreground font-mono uppercase leading-relaxed">
                如果 OCS 答题页面是 HTTPS 协议，而后端服务是 HTTP 协议且没有反向代理，浏览器会拦截请求。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}