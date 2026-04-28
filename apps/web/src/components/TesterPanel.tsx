import { useState, useCallback } from "react";
import { submitAnswer, type AnswerResponse } from "../api";
import { performanceMonitor } from "../utils/performance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Send, ListPlus, CheckSquare, AlertTriangle, Info } from "lucide-react";

const TYPES = [
  { value: "single", label: "单选题" },
  { value: "multiple", label: "多选题" },
  { value: "judgement", label: "判断题" },
  { value: "completion", label: "填空题" },
];

export default function TesterPanel() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("single");
  const [options, setOptions] = useState("A. 选项 1\nB. 选项 2\nC. 选项 3\nD. 选项 4");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnswerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // 性能监控
    performanceMonitor.mark('test-request-start');

    try {
      const optionList =
        type === "completion"
          ? undefined
          : options
              .split("\n")
              .map((o) => o.trim())
              .filter(Boolean);

      const data = await submitAnswer({
        title: title.trim(),
        type,
        options: optionList,
        debug: true,
      });

      performanceMonitor.mark('test-request-end');
      performanceMonitor.measure(
        'test-request-duration',
        'test-request-start',
        'test-request-end'
      );

      setResult(data);
    } catch (error) {
      console.error('测试请求失败:', error);
      setError(error instanceof Error ? error.message : '未知错误');
      setResult({
        code: 0,
        question: title,
        answer: "",
        message: "网络错误：无法连接到后端服务",
      });
    } finally {
      setLoading(false);
    }
  }, [title, type, options]);

  const handleFillExample = useCallback(() => {
    setTitle("下列哪个方法可以向 JavaScript 数组的末尾添加一个或多个元素？");
    setType("single");
    setOptions("A. pop()\nB. push()\nC. shift()\nD. unshift()");
  }, []);

  return (
    <Card className="">
      <CardHeader className="shadow-[inset_0_-1px_0_hsl(var(--slate-6))] bg-[hsl(var(--slate-2))] rounded-t-lg p-6">
        <CardTitle className="font-semibold text-xl tracking-tight shadow-[inset_0_-1px_0_hsl(var(--slate-6))] pb-4 flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-primary" />
          大模型请求测试
        </CardTitle>
        <CardDescription className="font-mono text-xs  mt-2">
          直接调用 AI 引擎，验证提示词与参数配置是否正确
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="space-y-3">
          <Label className="text-muted-foreground font-mono text-sm font-medium">
            测试题目内容
          </Label>
          <Textarea
            placeholder="[在此输入测试题目文本]"
            className=" p-4 min-h-[120px] text-base resize-y"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-muted-foreground font-mono text-sm font-medium">
              题目类型
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-10 bg-background px-4">
                <SelectValue placeholder="选择题目类型" />
              </SelectTrigger>
              <SelectContent className="bg-background glass-panel rounded-md shadow-[4px_4px_0_0_hsl(var(--primary))] uppercase font-mono tracking-widest">
                {TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="focus:bg-primary focus:text-primary-foreground rounded-md">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {type !== "completion" && (
          <div className="space-y-3">
            <Label className="text-muted-foreground font-mono text-sm font-medium">
              候选项列表 (每行填写一个选项)
            </Label>
            <Textarea
              className=" p-4 min-h-[160px] font-mono text-sm uppercase resize-y"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleFillExample}
          >
            <ListPlus className="mr-2 h-4 w-4" />
            填入测试用例
          </Button>
          <Button
            className="flex-[2]"
            disabled={loading || !title.trim()}
            onClick={handleSubmit}
          >
            {loading ? (
              <span className="flex items-center gap-2 font-mono tracking-widest text-lg">
                <Send className="h-5 w-5 animate-bounce" /> 请求处理中...
              </span>
            ) : (
              <span className="flex items-center gap-2 font-mono tracking-widest text-lg">
                <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 发送验证请求
              </span>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-8 bg-red-3/20 border border-red-6/30 rounded-md p-4 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 text-red-11 font-medium">
              <AlertTriangle className="h-5 w-5" />
              请求失败: {error}
            </div>
          </div>
        )}

        {result && (
          <div className={`mt-8  animate-in slide-in-from-top-4 duration-500 ${
            result.code === 1 
              ? "bg-[hsl(var(--green-3))] shadow-[inset_0_0_0_1px_hsl(var(--green-6))] rounded-md" 
              : "bg-[hsl(var(--red-3))] shadow-[inset_0_0_0_1px_hsl(var(--red-6))] rounded-md"
          }`}>
            <div className={`p-4  font-mono font-medium text-sm flex items-center gap-2 ${
              result.code === 1 ? "text-[hsl(var(--green-11))] border-b border-[hsl(var(--green-6))] bg-[hsl(var(--green-4))]" : "text-[hsl(var(--red-11))] border-b border-[hsl(var(--red-6))] bg-[hsl(var(--red-4))]"
            }`}>
              {result.code === 1 ? <CheckSquare className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              {result.code === 1 ? "系统响应：测试成功" : "系统响应：测试失败"}
            </div>

            <div className="p-8">
              {result.code === 1 ? (
                <div className="space-y-6">
                  <div className="text-sm font-medium text-muted-foreground font-mono">
                    AI 计算结果
                  </div>
                  <div className="text-5xl md:text-7xl font-black text-foreground font-semibold tracking-tight uppercase bg-background glass-panel p-6 shadow-inner">
                    {result.answer}
                  </div>
                  {result.confidence != null && (
                    <div className="space-y-2 pt-4">
                      <div className="flex justify-between text-xs font-mono font-bold tracking-widest uppercase">
                        <span>置信度评分</span>
                        <span>{Math.round(result.confidence * 100)}%</span>
                      </div>
                      <div className="h-4 w-full glass-panel bg-background p-0.5">
                        <div 
                          className="h-full bg-secondary transition-all duration-1000 ease-out" 
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {result.reason && (
                    <div className="pt-8 mt-4 border-t border-border border-dashed">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4 font-mono">
                        <Info className="h-4 w-4" />
                        执行追踪日志
                      </div>
                      <p className="text-foreground leading-relaxed font-mono text-sm bg-background glass-panel p-4 shadow-inner">
                        {result.reason}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-medium text-destructive font-mono text-center p-8">
                  {result.message || "发生未知错误"}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}