import { useState, useEffect, useCallback } from "react";
import { updateConfig, type AppConfig } from "../api";
import { useDebounce } from "../hooks/useConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings2, Key, Cpu, Timer, Thermometer, Hash, Bug, ScrollText, Lock, Save, Shuffle, Eye, EyeOff, Copy, Check, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  config: AppConfig | null;
  onSaved: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

function generateRandomPassword(length = 16): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((b) => charset[b % charset.length])
    .join("");
}

export default function ConfigPanel({ config, onSaved, showToast }: Props) {
  const [form, setForm] = useState({
    aiBaseUrl: "",
    aiApiKey: "",
    aiModel: "",
    aiTimeoutMs: "30000",
    aiTemperature: "0.2",
    aiMaxTokens: "512",
    aiRetryCount: "1",
    aiSystemPrompt: "",
    aiDebugDefault: false,
    aiLogDebug: false,
    adminPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // 防抖处理表单数据，减少不必要的重新渲染
  const debouncedForm = useDebounce(form, 300);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (config) {
      setForm({
        aiBaseUrl: config.aiBaseUrl,
        aiApiKey: "",
        aiModel: config.aiModel,
        aiTimeoutMs: String(config.aiTimeoutMs),
        aiTemperature: String(config.aiTemperature),
        aiMaxTokens: String(config.aiMaxTokens),
        aiRetryCount: String(config.aiRetryCount),
        aiSystemPrompt: config.aiSystemPrompt,
        aiDebugDefault: config.aiDebugDefault,
        aiLogDebug: config.aiLogDebug,
        adminPassword: "",
      });
    }
  }, [config]);

  // 防抖触发 dirty 状态更新
  useEffect(() => {
    setDirty(true);
  }, [debouncedForm]);

  // 加载草稿数据
  useEffect(() => {
    const saved = localStorage.getItem('config_form_draft');
    if (saved && !config) {
      try {
        const draft = JSON.parse(saved);
        setForm(draft);
      } catch (e) {
        console.warn('无法恢复草稿数据:', e);
      }
    }
  }, [config]);

  // 自动保存草稿（使用防抖减少 I/O）
  useEffect(() => {
    if (dirty && Object.values(debouncedForm).some(value => value !== '' && value !== false)) {
      localStorage.setItem('config_form_draft', JSON.stringify(debouncedForm));
    }
  }, [debouncedForm, dirty]);

  const set = useCallback((key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      // 使用更高效的对象构建方式
      const updates = Object.fromEntries(
        Object.entries({
          ...(form.aiBaseUrl && { aiBaseUrl: form.aiBaseUrl }),
          ...(form.aiApiKey && { aiApiKey: form.aiApiKey }),
          ...(form.aiModel && { aiModel: form.aiModel }),
          aiTimeoutMs: Number(form.aiTimeoutMs),
          aiTemperature: Number(form.aiTemperature),
          aiMaxTokens: Number(form.aiMaxTokens),
          aiRetryCount: Number(form.aiRetryCount),
          aiSystemPrompt: form.aiSystemPrompt,
          aiDebugDefault: form.aiDebugDefault,
          aiLogDebug: form.aiLogDebug,
          ...(form.adminPassword && { adminPassword: form.adminPassword }),
        })
      );

      await updateConfig(updates);
      setDirty(false);
      onSaved();

      // 保存成功后清除本地草稿
      localStorage.removeItem('config_form_draft');
    } catch (error) {
      console.error('保存配置失败:', error);
      showToast("保存失败：无法更新系统配置", "error");
    } finally {
      setSaving(false);
    }
  }, [form, onSaved, showToast]);

  return (
    <Card className="">
      <CardHeader className="bg-gradient-to-r from-slate-2/50 to-slate-3/30 rounded-t-lg p-8 border-b border-border/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-8 to-blue-9 flex items-center justify-center shadow-lg">
            <Settings2 className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="font-bold text-2xl tracking-tight mb-2">
              引擎参数配置
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              配置大模型接口参数与系统安全选项，优化 AI 助手的性能和安全性
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-10 overflow-hidden">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 glass-panel bg-blue-3/30 rounded-lg border border-blue-6/20">
            <ScrollText className="h-5 w-5 text-blue-11 mt-0.5" />
            <div className="flex-1 space-y-3">
              <Label className="text-base font-semibold text-foreground" htmlFor="aiBaseUrl">API 接口地址</Label>
              <Input
                id="aiBaseUrl"
                name="aiBaseUrl"
                type="text"
                autoComplete="url"
                className="input-enhanced h-11"
                placeholder="https://api.openai.com/v1"
                value={form.aiBaseUrl}
                onChange={(e) => set("aiBaseUrl", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">设置 AI 服务的 API 端点地址</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 glass-panel bg-blue-3/30 rounded-lg border border-blue-6/20">
              <Key className="h-5 w-5 text-blue-11 mt-0.5" />
              <div className="flex-1 space-y-3">
                <Label className="text-base font-semibold text-foreground" htmlFor="aiApiKey">API 密钥</Label>
                <Input
                  id="aiApiKey"
                  name="aiApiKey"
                  type="password"
                  autoComplete="current-password"
                  className="input-enhanced h-11"
                  placeholder={config?.aiApiKey ? "[已设置，输入新密钥以覆盖]" : "[请输入 API 密钥]"}
                  value={form.aiApiKey}
                  onChange={(e) => set("aiApiKey", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">安全的 API 认证密钥</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 glass-panel bg-blue-3/30 rounded-lg border border-blue-6/20">
              <Cpu className="h-5 w-5 text-blue-11 mt-0.5" />
              <div className="flex-1 space-y-3">
                <Label className="text-base font-semibold text-foreground" htmlFor="aiModel">AI 模型名称</Label>
                <Input
                  id="aiModel"
                  name="aiModel"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  className="input-enhanced h-11"
                  placeholder="gpt-4o-mini"
                  value={form.aiModel}
                  onChange={(e) => set("aiModel", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">指定要使用的 AI 模型</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 glass-panel bg-orange-3/30 rounded-lg border border-orange-6/20">
              <Thermometer className="h-5 w-5 text-orange-11 mt-0.5" />
              <div className="flex-1 space-y-3">
                <Label className="text-base font-semibold text-foreground" htmlFor="aiTemperature">输出随机性</Label>
                <Input
                  id="aiTemperature"
                  name="aiTemperature"
                  type="number"
                  inputMode="decimal"
                  autoComplete="off"
                  className="input-enhanced h-11"
                  step="0.1"
                  min="0"
                  max="2"
                  value={form.aiTemperature}
                  onChange={(e) => set("aiTemperature", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Temperature (0.0-2.0)</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 glass-panel bg-green-3/30 rounded-lg border border-green-6/20">
              <Hash className="h-5 w-5 text-green-11 mt-0.5" />
              <div className="flex-1 space-y-3">
                <Label className="text-base font-semibold text-foreground" htmlFor="aiMaxTokens">最大输出长度</Label>
                <Input
                  id="aiMaxTokens"
                  name="aiMaxTokens"
                  type="number"
                  inputMode="numeric"
                  autoComplete="off"
                  className="input-enhanced h-11"
                  step="64"
                  min="64"
                  value={form.aiMaxTokens}
                  onChange={(e) => set("aiMaxTokens", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Max Tokens</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 glass-panel bg-purple-3/30 rounded-lg border border-purple-6/20">
              <Timer className="h-5 w-5 text-purple-11 mt-0.5" />
              <div className="flex-1 space-y-3">
                <Label className="text-base font-semibold text-foreground" htmlFor="aiTimeoutMs">请求超时时间</Label>
                <Input
                  id="aiTimeoutMs"
                  name="aiTimeoutMs"
                  type="number"
                  inputMode="numeric"
                  autoComplete="off"
                  className="input-enhanced h-11"
                  step="1000"
                  min="5000"
                  value={form.aiTimeoutMs}
                  onChange={(e) => set("aiTimeoutMs", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">毫秒 (ms)</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 glass-panel bg-indigo-3/30 rounded-lg border border-indigo-6/20">
              <Shuffle className="h-5 w-5 text-indigo-11 mt-0.5" />
              <div className="flex-1 space-y-3">
                <Label className="text-base font-semibold text-foreground" htmlFor="aiRetryCount">失败重试次数</Label>
                <Input
                  id="aiRetryCount"
                  name="aiRetryCount"
                  type="number"
                  inputMode="numeric"
                  autoComplete="off"
                  className="input-enhanced h-11"
                  min="0"
                  max="5"
                  value={form.aiRetryCount}
                  onChange={(e) => set("aiRetryCount", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">请求失败自动重试次数</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 glass-panel bg-slate-3/30 rounded-lg border border-slate-6/20">
            <ScrollText className="h-5 w-5 text-slate-11 mt-0.5" />
            <div className="flex-1 space-y-3">
              <Label className="text-base font-semibold text-foreground" htmlFor="aiSystemPrompt">AI 系统提示词 (System Prompt)</Label>
              <textarea
                id="aiSystemPrompt"
                name="aiSystemPrompt"
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 input-enhanced resize-y"
                placeholder="设置 AI 的行为指令…"
                value={form.aiSystemPrompt}
                onChange={(e) => set("aiSystemPrompt", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">自定义 AI 的核心指令，影响其回答风格和质量</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-10 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-6">高级调试选项</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="group p-5 glass-panel bg-background hover:bg-muted/5 transition-colors duration-200 rounded-lg border border-border/50 hover:border-blue-6/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-orange-11" />
                    <Label className="text-sm font-semibold text-foreground group-hover:text-blue-11 transition-colors">
                      默认返回调试输出
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    在所有请求中直接返回 AI 的原始字符串输出，忽略结构化格式解析，便于调试和查看原始响应。
                  </p>
                </div>
                <Switch
                  checked={form.aiDebugDefault}
                  onCheckedChange={(v) => set("aiDebugDefault", v)}
                  className="data-[state=checked]:bg-orange-9 data-[state=checked]:border-orange-8"
                />
              </div>
            </div>

            <div className="group p-5 glass-panel bg-background hover:bg-muted/5 transition-colors duration-200 rounded-lg border border-border/50 hover:border-green-6/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-green-11" />
                    <Label className="text-sm font-semibold text-foreground group-hover:text-green-11 transition-colors">
                      启用系统详细日志
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    在服务器终端开启详细的调试日志打印，包含请求参数、响应时间和错误堆栈信息。
                  </p>
                </div>
                <Switch
                  checked={form.aiLogDebug}
                  onCheckedChange={(v) => set("aiLogDebug", v)}
                  className="data-[state=checked]:bg-green-10 data-[state=checked]:border-green-8"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-10 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-6">安全设置</h3>

          <div className="glass-panel bg-red-3/20 border border-red-6/30 rounded-xl p-8 -mx-8 px-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-9/20 flex items-center justify-center">
                <Lock className="h-5 w-5 text-red-11" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-foreground mb-2">管理员系统密码</h4>
                <p className="text-sm text-muted-foreground">设置访问密码以保护管理面板的安全</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  id="adminPassword"
                  name="adminPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="input-enhanced h-12 border-red-6/50 focus:border-red-9 pr-12 text-base"
                  placeholder={config?.hasPassword ? "[已设置，输入新密码以覆盖]" : "[未设置密码]"}
                  value={form.adminPassword}
                  onChange={(e) => set("adminPassword", e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-11 hover:text-red-11/80 transition-colors p-1"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "隐藏密码" : "显示密码"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="border-red-6/50 text-red-11 hover:bg-red-4/20 hover:border-red-6"
                  onClick={() => { set("adminPassword", generateRandomPassword()); setShowPassword(true); }}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  生成随机密码
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="border-red-6/50 text-red-11 hover:bg-red-4/20 hover:border-red-6"
                  disabled={!form.adminPassword}
                  onClick={() => {
                    const text = form.adminPassword;
                    if (navigator.clipboard?.writeText) {
                      navigator.clipboard.writeText(text).catch(() => {
                        fallbackCopy(text);
                      });
                    } else {
                      fallbackCopy(text);
                    }
                    setCopied(true);
                    showToast("密码已复制到剪贴板", "success");
                    setTimeout(() => setCopied(false), 2000);

                    function fallbackCopy(str: string) {
                      const ta = document.createElement("textarea");
                      ta.value = str;
                      ta.style.position = "fixed";
                      ta.style.opacity = "0";
                      document.body.appendChild(ta);
                      ta.select();
                      document.execCommand("copy");
                      document.body.removeChild(ta);
                    }
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      复制密码
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-red-4/10 border border-red-6/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-11 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-11">安全警告</p>
                    <p className="text-xs text-red-11/80">
                      如果密码字段留空，任何人都可以访问此管理面板。强烈建议设置强密码以保护系统安全。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-border">
          <div className="bg-muted/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-9/20 flex items-center justify-center">
                  <Save className="h-4 w-4 text-blue-11" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">保存配置</h4>
                  <p className="text-sm text-muted-foreground">应用所有更改到系统设置</p>
                </div>
              </div>
              {!dirty && (
                <div className="flex items-center gap-2 text-green-11 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  已保存
                </div>
              )}
            </div>

            <Button
              className="w-full btn-interactive h-12 text-base font-medium"
              disabled={!dirty || saving}
              onClick={handleSave}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  正在保存配置…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3 group-hover:scale-105 transition-transform">
                  <Save className="h-5 w-5" />
                  {dirty ? "保存配置更改" : "配置已保存"}
                </span>
              )}
            </Button>

            {!dirty && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                所有配置更改已自动保存到系统
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}