import type { ReactNode } from 'react';
import { Eraser } from 'lucide-react';

interface ResetButtonProps {
  onClick: () => void;
  label?: string;
  icon?: ReactNode;
  className?: string;
}

/**
 * Nút "Tạo mới" dùng chung, tông màu cảnh báo nhẹ để phân biệt với các
 * nút hành động thông thường (xuất Excel/PNG, v.v.) và tránh bấm nhầm.
 */
export default function ResetButton({ onClick, label = 'Tạo mới', icon, className = '' }: ResetButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 bg-white text-amber-700 border border-amber-200 rounded-lg shadow-sm hover:bg-amber-50 hover:border-amber-300 transition-colors text-sm font-semibold ${className}`}
      title={label}
      aria-label={label}
    >
      {icon ?? <Eraser size={16} />}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
