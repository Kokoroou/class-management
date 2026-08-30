import { useCallback, useEffect, useState } from 'react';

type SetValue<T> = T | ((prev: T) => T);

/**
 * Lưu và tải dữ liệu của một trang vào localStorage theo key.
 * Dùng chung cho mọi trang tính năng thay vì tự viết logic đọc/ghi riêng.
 */
export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) return JSON.parse(item) as T;
    } catch (err) {
      console.error(`Lỗi khi đọc localStorage key "${key}":`, err);
    }
    return initialValue instanceof Function ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Lỗi khi ghi localStorage key "${key}":`, err);
    }
  }, [key, value]);

  const setStoredValue = useCallback((next: SetValue<T>) => {
    setValue((prev) => (next instanceof Function ? next(prev) : next));
  }, []);

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.error(`Lỗi khi xóa localStorage key "${key}":`, err);
    }
    setValue(initialValue instanceof Function ? initialValue() : initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setStoredValue, remove] as const;
}
