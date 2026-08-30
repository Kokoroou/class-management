import { useEffect } from 'react';

const APP_NAME = 'Quản lý lớp học';

/**
 * Đặt document.title theo trang hiện tại. Dùng ở mỗi trang thay vì tiêu đề
 * tĩnh trong index.html, để tab đổi tên đúng khi chuyển route.
 */
export function useDocumentTitle(pageTitle?: string) {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${APP_NAME}` : APP_NAME;
  }, [pageTitle]);
}
