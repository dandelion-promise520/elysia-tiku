import * as React from 'react';

// 性能监控工具
interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private static instance: PerformanceMonitor;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 记录性能标记
  mark(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  }

  // 测量性能间隔
  measure(name: string, startMark: string, endMark: string): number | null {
    if (typeof performance !== 'undefined') {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name).pop();
        const duration = measure?.duration || 0;

        // 记录指标
        this.metrics.push({
          name,
          duration,
          timestamp: Date.now()
        });

        // 开发环境下输出到控制台
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
        }

        // 如果操作耗时过长，发出警告
        if (duration > 1000) {
          console.warn(`[Performance Warning] ${name} 耗时过长: ${duration.toFixed(2)}ms`);
        }

        return duration;
      } catch (error) {
        console.error('性能测量失败:', error);
        return null;
      }
    }
    return null;
  }

  // 获取性能指标
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // 清除指标
  clearMetrics(): void {
    this.metrics = [];
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  // 获取内存使用情况（如果浏览器支持）
  getMemoryUsage(): { used: number; total: number; limit: number } | null {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  // 监控内存泄漏
  monitorMemoryLeaks(threshold: number = 50): void {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const memory = this.getMemoryUsage();
        if (memory && memory.used > threshold) {
          console.warn(`[Memory Warning] 内存使用过高: ${memory.used}MB`);
        }
      }, 10000);

      // 清理定时器
      setTimeout(() => clearInterval(interval), 300000); // 5分钟后停止监控
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// React Hook 用于组件性能监控
export function usePerformanceMonitoring(componentName: string) {
  React.useEffect(() => {
    performanceMonitor.mark(`${componentName}-mount-start`);

    return () => {
      performanceMonitor.mark(`${componentName}-mount-end`);
      performanceMonitor.measure(
        `${componentName}-mount-duration`,
        `${componentName}-mount-start`,
        `${componentName}-mount-end`
      );
    };
  }, [componentName]);
}

// 高阶组件用于包装性能监控
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    usePerformanceMonitoring(componentName);
    return React.createElement(Component, props);
  };
}