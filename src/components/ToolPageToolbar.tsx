import { Fragment } from 'react';
import type { ReactNode } from 'react';

interface ToolbarButtonAction {
  key: string;
  icon: ReactNode;
  title: string;
  variant?: 'button';
  disabled?: boolean;
  onClick: () => void;
}

interface ToolbarUploadAction {
  key: string;
  icon: ReactNode;
  title: string;
  variant: 'upload';
  accept?: string;
  onFileSelect: (file: File) => void;
}

export type ToolbarAction = ToolbarButtonAction | ToolbarUploadAction;

interface ToolPageToolbarProps {
  groups: ToolbarAction[][];
  className?: string;
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
            action.variant === 'upload' ? (
              <label
                key={action.key}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                title={action.title}
              >
                {action.icon}
                <input
                  type="file"
                  accept={action.accept ?? '.xlsx, .xls, .csv'}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) action.onFileSelect(file);
                    e.target.value = '';
                  }}
                />
              </label>
            ) : (
              <button
                key={action.key}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`p-2 rounded transition-colors ${
                  action.disabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={action.title}
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
