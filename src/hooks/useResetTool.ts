import { useCallback } from 'react';

const DEFAULT_CONFIRM_MESSAGE =
  'Bạn có chắc chắn muốn tạo mới? Toàn bộ dữ liệu hiện tại sẽ bị xóa và không thể khôi phục.';

/**
 * Nút "Tạo mới" dùng chung cho các trang công cụ: xác nhận trước khi xóa
 * (hành động phá hủy dữ liệu), xóa đúng key localStorage của công cụ hiện
 * tại, rồi gọi onReset để trang tự đưa state về màn hình chọn điểm bắt đầu.
 */
export function useResetTool(storageKey: string, onReset: () => void, confirmMessage = DEFAULT_CONFIRM_MESSAGE) {
  return useCallback(() => {
    if (!window.confirm(confirmMessage)) return;

    try {
      window.localStorage.removeItem(storageKey);
    } catch (err) {
      console.error(`Lỗi khi xóa localStorage key "${storageKey}":`, err);
    }

    onReset();
  }, [storageKey, onReset, confirmMessage]);
}
