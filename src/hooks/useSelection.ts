import { useCallback, useState } from 'react';

/**
 * State chọn dùng chung cho các trang công cụ: click thường thay thế toàn bộ
 * selection, Ctrl+click thêm/bớt từng phần tử, kéo khung chọn gọi selectMany.
 * Trang bảng (Thần số học) chỉ dùng selectOnly/clear để tự nhiên thành single-select.
 */
export function useSelection<T extends string | number>() {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set());

  const isSelected = useCallback((id: T) => selectedIds.has(id), [selectedIds]);

  const selectOnly = useCallback((id: T) => setSelectedIds(new Set([id])), []);

  const toggle = useCallback((id: T) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectMany = useCallback((ids: T[], additive: boolean) => {
    setSelectedIds((prev) => {
      if (!additive) return new Set(ids);
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  const handleItemClick = useCallback(
    (id: T, e: { ctrlKey: boolean; metaKey: boolean }) => {
      if (e.ctrlKey || e.metaKey) toggle(id);
      else selectOnly(id);
    },
    [toggle, selectOnly]
  );

  return { selectedIds, isSelected, selectOnly, toggle, selectMany, clear, handleItemClick };
}
