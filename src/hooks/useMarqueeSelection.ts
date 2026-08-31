import { useCallback, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, RefObject } from 'react';

interface MarqueeRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface UseMarqueeSelectionOptions {
  containerRef: RefObject<HTMLElement | null>;
  onSelect: (ids: string[], additive: boolean) => void;
  onBackgroundClick?: () => void;
  /** Thuộc tính đánh dấu phần tử có thể được kéo khung chọn tới. */
  itemAttribute?: string;
}

const DRAG_THRESHOLD = 4;

/**
 * Kéo khung chọn (rubber-band) cho các trang không dùng @xyflow/react.
 * Chỉ bắt đầu kéo khung khi mousedown rơi vào nền trống của container (không
 * phải lên phần tử có `itemAttribute` hay một control tương tác), để không
 * đụng độ với kéo-thả (drag-and-drop) đổi vị trí đang có trên các phần tử đó.
 */
export function useMarqueeSelection({
  containerRef,
  onSelect,
  onBackgroundClick,
  itemAttribute = 'data-marquee-id',
}: UseMarqueeSelectionOptions) {
  const [marqueeRect, setMarqueeRect] = useState<MarqueeRect | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    additive: boolean;
    moved: boolean;
  } | null>(null);

  const onMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      if (e.button !== 0) return;
      const container = containerRef.current;
      if (!container) return;

      const target = e.target as HTMLElement;
      if (target.closest(`[${itemAttribute}]`)) return;
      if (target.closest('button, input, textarea, select, a')) return;

      e.preventDefault();
      const additive = e.ctrlKey || e.metaKey;
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        additive,
        moved: false,
      };

      const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        drag.lastX = moveEvent.clientX;
        drag.lastY = moveEvent.clientY;
        if (Math.abs(drag.lastX - drag.startX) > DRAG_THRESHOLD || Math.abs(drag.lastY - drag.startY) > DRAG_THRESHOLD) {
          drag.moved = true;
        }

        const containerRect = container.getBoundingClientRect();
        const x1 = Math.min(drag.startX, drag.lastX);
        const y1 = Math.min(drag.startY, drag.lastY);
        const x2 = Math.max(drag.startX, drag.lastX);
        const y2 = Math.max(drag.startY, drag.lastY);
        setMarqueeRect({
          left: x1 - containerRect.left,
          top: y1 - containerRect.top,
          width: x2 - x1,
          height: y2 - y1,
        });
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        const drag = dragRef.current;
        dragRef.current = null;
        setMarqueeRect(null);
        if (!drag) return;

        if (!drag.moved) {
          onBackgroundClick?.();
          return;
        }

        const x1 = Math.min(drag.startX, drag.lastX);
        const y1 = Math.min(drag.startY, drag.lastY);
        const x2 = Math.max(drag.startX, drag.lastX);
        const y2 = Math.max(drag.startY, drag.lastY);

        const items = container.querySelectorAll<HTMLElement>(`[${itemAttribute}]`);
        const hitIds: string[] = [];
        items.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const intersects = rect.left < x2 && rect.right > x1 && rect.top < y2 && rect.bottom > y1;
          if (intersects) {
            const id = el.getAttribute(itemAttribute);
            if (id) hitIds.push(id);
          }
        });

        if (hitIds.length > 0) onSelect(hitIds, drag.additive);
        else if (!drag.additive) onBackgroundClick?.();
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [containerRef, itemAttribute, onSelect, onBackgroundClick]
  );

  return { marqueeRect, onMouseDown };
}
