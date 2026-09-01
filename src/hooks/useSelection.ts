import { useCallback, useRef, useState } from 'react';

/**
 * State chọn dùng chung cho các trang công cụ: click thường thay thế toàn bộ
 * selection (và đặt lại mốc/anchor), Ctrl+click thêm/bớt từng phần tử, kéo
 * khung chọn gọi selectMany. Shift+click chọn 1 khoảng liên tiếp từ mốc gần
 * nhất tới phần tử vừa click, dựa trên thứ tự hiển thị (orderedIds) do trang
 * gọi truyền vào - trang nào không cần range-select thì không truyền, hành vi
 * không đổi.
 */
export function useSelection<T extends string | number>() {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set());
  const anchorRef = useRef<T | null>(null);

  const isSelected = useCallback((id: T) => selectedIds.has(id), [selectedIds]);

  const selectOnly = useCallback((id: T) => {
    anchorRef.current = id;
    setSelectedIds(new Set([id]));
  }, []);

  const toggle = useCallback((id: T) => {
    anchorRef.current = id;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectRange = useCallback((orderedIds: T[], toId: T) => {
    const anchor = anchorRef.current ?? toId;
    const fromIdx = orderedIds.indexOf(anchor);
    const toIdx = orderedIds.indexOf(toId);
    if (fromIdx === -1 || toIdx === -1) {
      anchorRef.current = toId;
      setSelectedIds(new Set([toId]));
      return;
    }
    const [start, end] = fromIdx <= toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
    setSelectedIds(new Set(orderedIds.slice(start, end + 1)));
  }, []);

  const selectMany = useCallback((ids: T[], additive: boolean) => {
    setSelectedIds((prev) => {
      if (!additive) return new Set(ids);
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    anchorRef.current = null;
    setSelectedIds(new Set());
  }, []);

  const handleItemClick = useCallback(
    (id: T, e: { ctrlKey: boolean; metaKey: boolean; shiftKey?: boolean }, orderedIds?: T[]) => {
      if (e.shiftKey && orderedIds) selectRange(orderedIds, id);
      else if (e.ctrlKey || e.metaKey) toggle(id);
      else selectOnly(id);
    },
    [toggle, selectOnly, selectRange]
  );

  return { selectedIds, isSelected, selectOnly, toggle, selectRange, selectMany, clear, handleItemClick };
}
