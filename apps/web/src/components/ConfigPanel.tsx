import { useState, useEffect } from "react";
import { updateConfig, type AppConfig } from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings2, Key, Cpu, Timer, Thermometer, Hash, Bug, ScrollText, Lock, Save } from "lucide-react";

interface Props {
  config: AppConfig | null;
  onSaved: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function ConfigPanel({ config, onSaved, showToast }: Props) {
  const [form, setForm] = useState({
    aiBaseUrl: "",
    aiApiKey: "",
    aiModel: "",
    aiTimeoutMs: "30000",
    aiTemperature: "0.2",
    aiMaxTokens: "512",
    aiDebugDefault: false,
    aiLogDebug: false,
    adminPassword: "",
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setForm({
        aiBaseUrl: config.aiBaseUrl,
        aiApiKey: "",
        aiModel: config.aiModel,
        aiTimeoutMs: String(config.aiTimeoutMs),
        aiTemperature: String(config.aiTemperature),
        aiMaxTokens: String(config.aiMaxTokens),
        aiDebugDefault: config.aiDebugDefault,
        aiLogDebug: config.aiLogDebug,
        adminPassword: "",
      });
    }
  }, [config]);

  const set = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {};
      if (form.aiBaseUrl) updates.aiBaseUrl = form.aiBaseUrl;
      if (form.aiApiKey) updates.aiApiKey = form.aiApiKey;
      if (form.aiModel) updates.aiModel = form.aiModel;
      updates.aiTimeoutMs = Number(form.aiTimeoutMs);
      updates.aiTemperature = Number(form.aiTemperature);
      updates.aiMaxTokens = Number(form.aiMaxTokens);
      updates.aiDebugDefault = form.aiDebugDefault;
      updates.aiLogDebug = form.aiLogDebug;
      if (form.adminPassword) updates.adminPassword = form.adminPassword;
      await updateConfig(updates);
      setDirty(false);
      onSaved();
    } catch {
      showToast("保存失败：无法更新系统配置", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border bg-card">
      <CardHeader className="border-b border-border bg-muted/20 p-6">
        <CardTitle className="font-semibold text-xl tracking-tight pb-4 flex items-center gap-3">
          <Settings2 className="h-8 w-8 text-primary" />
          引擎参数配置
        </CardTitle>
        <CardDescription className="font-mono text-xs uppercase tracking-widest mt-2">
          配置大模型接口与系统安全选项
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
            <ScrollText className="h-4 w-4 text-primary" /> API 接口地址
          </Label>
          <Input
            type="text"
            className=""
            placeholder="https://api.openai.com/v1"
            value={form.aiBaseUrl}
            onChange={(e) => set("aiBaseUrl", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              <Key className="h-4 w-4 text-primary" /> API 密钥
            </Label>
            <Input
              type="password"
              className=""
              placeholder={config?.aiApiKey ? "[已设置，输入新密钥以覆盖]" : "[请输入 API 密钥]"}
              value={form.aiApiKey}
              onChange={(e) => set("aiApiKey", e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              <Cpu className="h-4 w-4 text-primary" /> AI 模型名称
            </Label>
            <Input
              type="text"
              className=""
              placeholder="gpt-4o-mini"
              value={form.aiModel}
              onChange={(e) => set("aiModel", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              <Thermometer className="h-4 w-4 text-primary" /> 输出随机性 (Temperature)
            </Label>
            <Input
              type="number"
              className=""
              step="0.1"
              min="0"
              max="2"
              value={form.aiTemperature}
              onChange={(e) => set("aiTemperature", e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              <Hash className="h-4 w-4 text-primary" /> 最大输出长度 (Max Tokens)
            </Label>
            <Input
              type="number"
              className=""
              step="64"
              min="64"
              value={form.aiMaxTokens}
              onChange={(e) => set("aiMaxTokens", e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              <Timer className="h-4 w-4 text-primary" /> 请求超时时间 (毫秒)
            </Label>
            <Input
              type="number"
              className=""
              step="1000"
              min="5000"
              value={form.aiTimeoutMs}
              onChange={(e) => set("aiTimeoutMs", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6 pt-8 border-t border-border">
          <div className="flex items-center justify-between p-5 border border-border bg-background transition-colors hover:bg-muted/10 group">
            <div className="space-y-1">
              <Label className="text-sm font-mono font-bold uppercase tracking-widest group-hover:text-primary transition-colors">默认返回调试输出</Label>
              <p className="text-xs text-muted-foreground font-mono uppercase">在所有请求中直接返回 AI 的原始字符串输出，忽略结构化格式</p>
            </div>
            <Switch
              checked={form.aiDebugDefault}
              onCheckedChange={(v) => set("aiDebugDefault", v)}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="flex items-center justify-between p-5 border border-border bg-background transition-colors hover:bg-muted/10 group">
            <div className="space-y-1">
              <Label className="text-sm font-mono font-bold uppercase tracking-widest group-hover:text-primary transition-colors">启用系统详细日志</Label>
              <p className="text-xs text-muted-foreground font-mono uppercase">在服务器终端开启详细的调试日志打印</p>
            </div>
            <Switch
              checked={form.aiLogDebug}
              onCheckedChange={(v) => set("aiLogDebug", v)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        <div className="space-y-3 pt-8 border-t border-border bg-destructive/10 border border-destructive/20 rounded-md p-6 border-x-0 border-b-0 -mx-8 px-8">
          <Label className="flex items-center gap-2 text-destructive font-mono text-sm font-bold uppercase tracking-widest">
            <Lock className="h-4 w-4" /> 管理员系统密码
          </Label>
          <Input
            type="password"
            className="border-destructive focus-visible:ring-destructive"
            placeholder={config?.hasPassword ? "[已设置，输入新密码以覆盖]" : "[未设置密码]"}
            value={form.adminPassword}
            onChange={(e) => set("adminPassword", e.target.value)}
          />
          <p className="text-xs text-destructive/80 font-mono uppercase">
            警告：如果留空，任何人都可以访问此管理面板。
          </p>
        </div>

        <div className="pt-4">
          <Button
            className="w-full"
            disabled={!dirty || saving}
            onClick={handleSave}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Bug className="h-6 w-6 animate-spin" /> 正在保存...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-6 w-6 group-hover:scale-110 transition-transform" /> 保存配置
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}