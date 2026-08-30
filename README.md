<div align="center">

# Sơ đồ Hỗ trợ Lớp học

Công cụ trực quan hóa mạng lưới hỗ trợ trong lớp học dưới dạng sơ đồ cây phân cấp, tạo tự động từ file Excel danh sách học sinh.

**[Xem demo trực tuyến](https://kokoroou.github.io/class-management/)**

</div>

---

## Giới thiệu

**Sơ đồ Hỗ trợ Lớp học** giúp giáo viên nhanh chóng dựng sơ đồ mô hình "đôi bạn cùng tiến" / nhóm hỗ trợ học tập trong lớp, dựa trên danh sách học sinh và mối quan hệ quản lý (STT Quản lý) được nhập từ file Excel. Sơ đồ có thể chỉnh sửa trực tiếp trên giao diện kéo-thả và xuất lại thành ảnh PNG hoặc file Excel.

## Tính năng

- **Nhập từ Excel**: tải lên file `.xlsx`/`.xls`/`.csv` chứa cột STT, Tên học sinh, STT Quản lý để tự động dựng sơ đồ.
- **Tự động sắp xếp cây**: bố cục sơ đồ được sắp xếp tự động theo dạng cây phân cấp (sử dụng Dagre).
- **Chỉnh sửa trực quan**: thêm/xóa node, đổi tên học sinh, nối/xóa quan hệ ngay trên canvas.
- **Xuất kết quả**: lưu sơ đồ dưới dạng ảnh PNG hoặc xuất lại danh sách dưới dạng file Excel.
- **File mẫu**: tải file Excel mẫu để biết đúng định dạng dữ liệu cần chuẩn bị.

## Công nghệ sử dụng

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool
- [@xyflow/react](https://reactflow.dev/) — vẽ sơ đồ dạng node/edge
- [Dagre](https://github.com/dagrejs/dagre) — tự động bố cục cây
- [SheetJS (xlsx)](https://sheetjs.com/) — đọc/ghi file Excel
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [html-to-image](https://github.com/bubkoo/html-to-image) — xuất sơ đồ ra PNG

## Bắt đầu

### Yêu cầu

- [Node.js](https://nodejs.org/) 18 trở lên
- [Bun](https://bun.sh/) (khuyến nghị, dự án dùng `bun.lock`) hoặc npm/pnpm/yarn

### Cài đặt

```bash
bun install
# hoặc: npm install
```

### Chạy dự án ở môi trường phát triển

```bash
bun run dev
# hoặc: npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`.

### Build production

```bash
bun run build
# hoặc: npm run build
```

Kết quả build nằm trong thư mục `dist/`.

### Kiểm tra kiểu dữ liệu (TypeScript)

```bash
bun run lint
# hoặc: npm run lint
```

## Định dạng file Excel đầu vào

File Excel cần có tối thiểu các cột sau (không phân biệt vị trí, tên cột có thể linh hoạt):

| Cột | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| STT | Số thứ tự của học sinh | `1`, `2`, `3`... |
| Tên học sinh | Họ và tên học sinh | `Nguyễn Văn A` |
| STT Quản lý | STT của học sinh phụ trách/hỗ trợ | `1` |

Có thể tải file Excel mẫu ngay trong ứng dụng (nút **Tải file Excel mẫu**) để tham khảo định dạng chuẩn.

## Cấu trúc thư mục

```
class-management/
├── src/
│   ├── App.tsx        # Toàn bộ logic chính: đọc Excel, dựng sơ đồ, xuất file
│   ├── main.tsx        # Điểm khởi chạy ứng dụng React
│   └── index.css       # Tailwind CSS entry
├── index.html
├── vite.config.ts
└── package.json
```

## Triển khai (Deployment)

Dự án được cấu hình để tự động triển khai lên **GitHub Pages** thông qua GitHub Actions mỗi khi có thay đổi được đẩy lên nhánh `main`. Xem chi tiết workflow tại [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Trang sau khi triển khai có thể truy cập tại: https://kokoroou.github.io/class-management/

## License

Dự án chưa xác định giấy phép sử dụng cụ thể.
