import { useState } from "react";
import { submitAnswer, type AnswerResponse } from "../api";

const TYPES = [
  { value: "single", label: "单选题" },
  { value: "multiple", label: "多选题" },
  { value: "judgement", label: "判断题" },
  { value: "completion", label: "填空题" },
];

export default function TesterPanel() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("single");
  const [options, setOptions] = useState("A.选项1\nB.选项2\nC.选项3\nD.选项4");
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
        message: "请求失败，请确保后端服务正在运行",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" id="tester-panel">
      <div className="card-title">
        <span className="icon">🧪</span>
        答题测试
      </div>

      <div className="form-group">
        <label htmlFor="test-title">题目内容</label>
        <textarea
          id="test-title"
          placeholder="输入题目，例如：以下哪个是 JavaScript 的基本数据类型？"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="test-type">题型</label>
          <select
            id="test-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              appearance: "none",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%239ca3af' viewBox='0 0 16 16'%3E%3Cpath d='M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
              paddingRight: 40,
            }}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {type !== "completion" && (
        <div className="form-group">
          <label htmlFor="test-options">选项（每行一个）</label>
          <textarea
            id="test-options"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            style={{ minHeight: 80 }}
          />
        </div>
      )}

      <button
        className="btn btn-primary btn-block"
        id="btn-test-answer"
        disabled={loading || !title.trim()}
        onClick={handleSubmit}
      >
        {loading ? <span className="spinner" /> : "🚀 发送测试"}
      </button>

      {result && (
        <div
          className={`result-box ${result.code === 1 ? "success" : "error"}`}
          id="test-result"
        >
          {result.code === 1 ? (
            <>
              <div className="result-label">答案</div>
              <div className="result-answer">{result.answer}</div>
              {result.confidence != null && (
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4 }}>
                  置信度: {Math.round(result.confidence * 100)}%
                </div>
              )}
              {result.reason && (
                <div className="result-reason">💬 {result.reason}</div>
              )}
            </>
          ) : (
            <div className="result-error-msg">
              ⚠️ {result.message || "未知错误"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
