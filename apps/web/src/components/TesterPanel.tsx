import { useState } from "react";
import { submitAnswer, type AnswerResponse } from "../api";
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

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setResult(null);
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
      setResult(data);
    } catch {
      setResult({
        code: 0,
        question: title,
        answer: "",
        message: "网络错误：无法连接到后端服务",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFillExample = () => {
    setTitle("下列哪个方法可以向 JavaScript 数组的末尾添加一个或多个元素？");
    setType("single");
    setOptions("A. pop()\nB. push()\nC. shift()\nD. unshift()");
  };

  return (
    <Card className="border bg-card">
      <CardHeader className="border-b border-border bg-muted/20 p-6">
        <CardTitle className="font-semibold text-xl tracking-tight border-b border-border pb-4 flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-primary" />
          大模型请求测试
        </CardTitle>
        <CardDescription className="font-mono text-xs uppercase tracking-widest mt-2">
          直接调用 AI 引擎，验证提示词与参数配置是否正确
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="space-y-3">
          <Label className="text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
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
            <Label className="text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              题目类型
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-10 bg-background px-4">
                <SelectValue placeholder="选择题目类型" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border rounded-md shadow-[4px_4px_0_0_hsl(var(--primary))] uppercase font-mono tracking-widest">
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
            <Label className="text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
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

        {result && (
          <div className={`mt-8 border-4 animate-in slide-in-from-top-4 duration-500 ${
            result.code === 1 
              ? "bg-secondary/10 border-secondary shadow-[8px_8px_0_0_hsl(var(--secondary))]" 
              : "bg-destructive/10 border-destructive shadow-[8px_8px_0_0_hsl(var(--destructive))]"
          }`}>
            <div className={`p-4 border-b-4 font-mono font-bold uppercase tracking-widest text-sm flex items-center gap-2 ${
              result.code === 1 ? "bg-secondary text-secondary-foreground border-secondary" : "bg-destructive text-destructive-foreground border-destructive"
            }`}>
              {result.code === 1 ? <CheckSquare className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              {result.code === 1 ? "系统响应：测试成功" : "系统响应：测试失败"}
            </div>

            <div className="p-8">
              {result.code === 1 ? (
                <div className="space-y-6">
                  <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground font-mono">
                    AI 计算结果
                  </div>
                  <div className="text-5xl md:text-7xl font-black text-foreground font-semibold tracking-tight uppercase bg-background border border-border p-6 shadow-inner">
                    {result.answer}
                  </div>
                  {result.confidence != null && (
                    <div className="space-y-2 pt-4">
                      <div className="flex justify-between text-xs font-mono font-bold tracking-widest uppercase">
                        <span>置信度评分</span>
                        <span>{Math.round(result.confidence * 100)}%</span>
                      </div>
                      <div className="h-4 w-full border border-border bg-background p-0.5">
                        <div 
                          className="h-full bg-secondary transition-all duration-1000 ease-out" 
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {result.reason && (
                    <div className="pt-8 mt-4 border-t border-border border-dashed">
                      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary mb-4 font-mono">
                        <Info className="h-4 w-4" />
                        执行追踪日志
                      </div>
                      <p className="text-foreground leading-relaxed font-mono text-sm bg-background border border-border p-4 shadow-inner">
                        {result.reason}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-bold uppercase tracking-widest text-destructive font-mono text-center p-8">
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