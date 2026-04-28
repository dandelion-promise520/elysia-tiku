import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('错误边界捕获:', error, errorInfo);

    // 在生产环境中，这里可以发送错误报告到服务器
    if (process.env.NODE_ENV === 'production') {
      // 发送错误报告到后端日志系统
      // fetch('/api/logs/error', {
      //   method: 'POST',
      //   body: JSON.stringify({ error: error.message, stack: errorInfo.componentStack })
      // });
    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-3/20 border border-red-6/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-11 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-11">组件渲染出错</h3>
              <p className="text-sm text-red-10">
                {this.state.error?.message || '未知错误'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <details className="mt-3">
                  <summary className="text-xs text-red-9 cursor-pointer hover:text-red-11">
                    查看错误堆栈
                  </summary>
                  <pre className="mt-2 p-3 bg-red-2/50 rounded text-xs text-red-11 overflow-x-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="mt-3 px-3 py-1 bg-red-9 text-white rounded text-sm hover:bg-red-10 transition-colors"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;