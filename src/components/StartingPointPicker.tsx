import type { ChangeEvent, ReactNode } from 'react';
import { FileDown, FolderPlus, Sparkles, Upload } from 'lucide-react';

interface StartingPointPickerProps {
  icon: ReactNode;
  title: string;
  description: string;
  /** Bắt đầu với dữ liệu trống. */
  onBlank: () => void;
  blankLabel?: string;
  /** Bắt đầu từ dữ liệu mẫu có sẵn. Bỏ qua nếu trang không có mẫu. */
  onTemplate?: () => void;
  templateLabel?: string;
  /** Bắt đầu từ file Excel do người dùng tải lên. */
  onExcelFile: (file: File) => void;
  excelLabel?: string;
  excelAccept?: string;
  /** Hành động phụ, ví dụ tải file Excel mẫu để tham khảo định dạng. */
  helperLabel?: string;
  onHelperClick?: () => void;
}

export default function StartingPointPicker({
  icon,
  title,
  description,
  onBlank,
  blankLabel = 'Tạo mới',
  onTemplate,
  templateLabel = 'Bắt đầu từ mẫu',
  onExcelFile,
  excelLabel = 'Tải lên file Excel',
  excelAccept = '.xlsx, .xls, .csv',
  helperLabel,
  onHelperClick,
}: StartingPointPickerProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onExcelFile(file);
    e.target.value = '';
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-20">
      <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center max-w-lg mx-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 mb-8 max-w-sm">{description}</p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onBlank}
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)]"
          >
            <FolderPlus size={18} />
            {blankLabel}
          </button>

          {onTemplate && (
            <button
              onClick={onTemplate}
              className="flex items-center justify-center gap-2 w-full py-3 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold"
            >
              <Sparkles size={18} />
              {templateLabel}
            </button>
          )}

          <label className="flex items-center justify-center gap-2 w-full py-3 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm font-semibold">
            <Upload size={18} />
            {excelLabel}
            <input type="file" accept={excelAccept} className="hidden" onChange={handleFileChange} />
          </label>

          {helperLabel && onHelperClick && (
            <button
              onClick={onHelperClick}
              className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm font-semibold mt-2"
            >
              <FileDown size={18} />
              {helperLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
