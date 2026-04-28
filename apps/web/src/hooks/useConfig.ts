import { useCallback, useState, useEffect } from 'react';
import { fetchConfig as apiFetchConfig, updateConfig as apiUpdateConfig, AppConfig } from '../api';

interface UseConfigReturn {
  config: AppConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateConfig: (updates: Partial<AppConfig & { adminPassword?: string }>) => Promise<void>;
  isUpdating: boolean;
}

export function useConfig(): UseConfigReturn {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetchConfig();
      setConfig(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取配置失败';
      setError(errorMessage);
      console.error('获取配置失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfigData = useCallback(async (updates: Partial<AppConfig & { adminPassword?: string }>) => {
    try {
      setIsUpdating(true);
      setError(null);
      await apiUpdateConfig(updates);
      // 更新成功后重新获取配置
      await fetchConfig();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新配置失败';
      setError(errorMessage);
      console.error('更新配置失败:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [fetchConfig]);

  // 初始化时获取配置
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
    updateConfig: updateConfigData,
    isUpdating
  };
}

// 防抖 Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 本地存储 Hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`读取 localStorage 键 "${key}" 失败:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`设置 localStorage 键 "${key}" 失败:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}