import { useState } from "react";
import { submitAnswer, type AnswerResponse } from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Send, ListPlus, CheckSquare, AlertTriangle, Info } from "lucide-react";

const TYPES = [
  { value: "single", label: "SINGLE_CHOICE" },
  { value: "multiple", label: "MULTIPLE_CHOICE" },
  { value: "judgement", label: "JUDGEMENT" },
  { value: "completion", label: "COMPLETION" },
];

export default function TesterPanel() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("single");
  const [options, setOptions] = useState("A. OPTION 1\nB. OPTION 2\nC. OPTION 3\nD. OPTION 4");
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
        message: "ERR_NET: BACKEND_UNREACHABLE",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFillExample = () => {
    setTitle("Which of the following methods can be used to add one or more elements to the end of a JavaScript array?");
    setType("single");
    setOptions("A. pop()\nB. push()\nC. shift()\nD. unshift()");
  };

  return (
    <Card className="border bg-card">
      <CardHeader className="border-b border-border bg-muted/20 p-6">
        <CardTitle className="flex items-center gap-3 text-3xl font-semibold tracking-tight">
          <FlaskConical className="h-8 w-8 text-primary" />
          DEBUG.TEST
        </CardTitle>
        <CardDescription className="font-mono text-xs uppercase tracking-widest mt-2">
          Execute prompt validation against AI engine
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="space-y-3">
          <Label className="text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
            PAYLOAD_TITLE
          </Label>
          <Textarea
            placeholder="[INPUT_QUESTION_TEXT_HERE]"
            className=" p-4 min-h-[120px] text-base resize-y"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              DATA_TYPE
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-10 bg-background px-4">
                <SelectValue placeholder="SELECT_TYPE" />
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
              OPTIONS_ARRAY (LINE_SEPARATED)
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
            INJECT_DUMMY_DATA
          </Button>
          <Button
            className="flex-[2]"
            disabled={loading || !title.trim()}
            onClick={handleSubmit}
          >
            {loading ? (
              <span className="flex items-center gap-2 font-mono tracking-widest text-lg">
                <Send className="h-5 w-5 animate-bounce" /> PROCESSING...
              </span>
            ) : (
              <span className="flex items-center gap-2 font-mono tracking-widest text-lg">
                <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> EXECUTE_CALL
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
              {result.code === 1 ? "SYS.RESPONSE: SUCCESS" : "SYS.RESPONSE: FAILED"}
            </div>

            <div className="p-8">
              {result.code === 1 ? (
                <div className="space-y-6">
                  <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground font-mono">
                    COMPUTED_OUTPUT
                  </div>
                  <div className="text-5xl md:text-7xl font-black text-foreground font-heading tracking-tighter uppercase bg-background border border-border p-6 shadow-inner">
                    {result.answer}
                  </div>
                  {result.confidence != null && (
                    <div className="space-y-2 pt-4">
                      <div className="flex justify-between text-xs font-mono font-bold tracking-widest uppercase">
                        <span>CONFIDENCE_SCORE</span>
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
                        TRACE_LOG
                      </div>
                      <p className="text-foreground leading-relaxed font-mono text-sm bg-background border border-border p-4 shadow-inner">
                        {result.reason}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-bold uppercase tracking-widest text-destructive font-mono text-center p-8">
                  {result.message || "UNKNOWN_ERROR_OCCURRED"}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
