import { Fragment, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Download } from 'lucide-react';

interface ToolbarButtonAction {
  key: string;
  icon: ReactNode;
  title: string;
  variant?: 'button';
  disabled?: boolean;
  /** Đánh dấu hành động phá hủy dữ liệu (xóa, thay thế toàn bộ, ...) để tô màu cảnh báo. */
  danger?: boolean;
  onClick: () => void;
}

interface ToolbarMenuItem {
  key: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

interface ToolbarMenuAction {
  key: string;
  title: string;
  variant: 'menu';
  disabled?: boolean;
  /** Các lựa chọn hiển thị khi mở menu (vd: tải xuống dưới dạng Ảnh PNG / Excel). */
  items: ToolbarMenuItem[];
}

export type ToolbarAction = ToolbarButtonAction | ToolbarMenuAction;

interface ToolPageToolbarProps {
  groups: ToolbarAction[][];
  className?: string;
}

/**
 * Nút mở menu lựa chọn dùng chung cho hành động tải xuống. Icon nút kích hoạt
 * dùng chung (Download) trên mọi trang để đảm bảo thống nhất; các lựa chọn
 * trong menu hiện đủ icon + nhãn ở màn hình máy tính, chỉ icon ở điện thoại.
 */
function ToolbarMenuButton({ action }: { action: ToolbarMenuAction }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={action.disabled}
        className={`p-2 rounded transition-colors ${
          action.disabled
            ? 'text-slate-300 cursor-not-allowed'
            : `text-slate-600 hover:text-blue-600 hover:bg-blue-50 ${open ? 'bg-blue-50 text-blue-600' : ''}`
        }`}
        title={action.title}
        aria-label={action.title}
      >
        <Download size={20} />
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-white border border-slate-200 shadow-lg rounded-lg py-1 z-30 whitespace-nowrap">
          {action.items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title={item.label}
              aria-label={item.label}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Thanh công cụ dùng chung cho các trang công cụ (Sơ đồ hỗ trợ học tập,
 * Chỗ ngồi, Thần số học, ...). Layout gốc lấy từ trang Sơ đồ hỗ trợ học tập.
 */
export default function ToolPageToolbar({ groups, className = '' }: ToolPageToolbarProps) {
  return (
    <div
      className={`bg-white border border-slate-200 shadow-sm rounded-lg p-1.5 flex items-center gap-1 ${className}`}
    >
      {groups.map((group, groupIndex) => (
        <Fragment key={groupIndex}>
          {groupIndex > 0 && <div className="w-px h-6 bg-slate-200 mx-1" />}
          {group.map((action) =>
            action.variant === 'menu' ? (
              <Fragment key={action.key}>
                <ToolbarMenuButton action={action} />
              </Fragment>
            ) : (
              <button
                key={action.key}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className={`p-2 rounded transition-colors ${
                  action.disabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : action.danger
                      ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={action.title}
                aria-label={action.title}
              >
                {action.icon}
              </button>
            )
          )}
        </Fragment>
      ))}
    </div>
  );
}
