<div align="center">

# Quản lý Lớp học

Bộ công cụ giúp giáo viên trực quan hóa và quản lý lớp học: sơ đồ hỗ trợ học tập, sơ đồ chỗ ngồi, và bảng thần số học — tất cả đều chạy hoàn toàn trên trình duyệt, không cần backend.

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

**[Xem demo trực tuyến](https://kokoroou.github.io/class-management/)**

</div>

---

## Giới thiệu

**Quản lý Lớp học** là một ứng dụng web tập hợp nhiều công cụ nhỏ phục vụ công việc thường ngày của giáo viên chủ nhiệm, dựa trên danh sách học sinh nhập từ file Excel hoặc nhập tay trực tiếp. Mỗi công cụ đều hỗ trợ: khởi tạo từ file mẫu có sẵn, chỉnh sửa trực quan trên giao diện (chọn, kéo-thả, sửa nhanh), lưu tự động vào trình duyệt (localStorage), và xuất kết quả ra ảnh PNG hoặc file Excel.

## Các trang / route

| Route | Công cụ |
| --- | --- |
| `/` | Trang chủ — danh sách các công cụ |
| `/support-tree` | Sơ đồ hỗ trợ học tập |
| `/seating` | Sơ đồ chỗ ngồi |
| `/numerology` | Thần số học |

## Tính năng chung giữa các công cụ

- **3 điểm khởi đầu**: tạo mới trống, bắt đầu từ dữ liệu mẫu có sẵn, hoặc tải lên file Excel/CSV.
- **Chọn & sửa nhanh**: click để chọn một hoặc nhiều mục (kéo chuột để chọn theo vùng — marquee selection, giữ Ctrl/Shift để chọn thêm), double-click để đổi tên/sửa nội dung ngay tại chỗ.
- **Lưu tự động**: dữ liệu đang làm việc được lưu vào `localStorage` của trình duyệt, không mất khi tải lại trang.
- **Nút Reset**: xóa dữ liệu hiện tại để quay về màn hình chọn điểm khởi đầu.
- **Xuất kết quả**: hầu hết công cụ đều cho phép xuất ảnh PNG và/hoặc file Excel.

## Chi tiết từng công cụ

### 1. Sơ đồ hỗ trợ học tập (`/support-tree`)

Dựng sơ đồ mạng lưới "đôi bạn cùng tiến" / nhóm hỗ trợ trong lớp dưới dạng cây phân cấp.

- Nhập từ Excel (cột STT, Tên học sinh, STT Quản lý) hoặc tạo mẫu 30 học sinh sẵn có.
- Tự động sắp xếp bố cục cây bằng Dagre; sắp xếp lại bất cứ lúc nào bằng nút **Tự động sắp xếp**.
- Thêm/xóa node, nối/xóa quan hệ (cạnh) trực tiếp trên canvas; thêm node mới tự nối vào node đang chọn.
- Xuất sơ đồ ra ảnh PNG hoặc xuất lại danh sách quan hệ ra file Excel.

### 2. Sơ đồ chỗ ngồi (`/seating`)

Xếp chỗ ngồi học sinh bằng kéo-thả vào sơ đồ bàn ghế tùy chỉnh.

- Tùy chỉnh số hàng/cột của lớp, và loại bàn (1–4 chỗ ngồi mỗi bàn).
- Kéo-thả học sinh giữa hàng chờ và các bàn, hoặc hoán đổi vị trí giữa hai học sinh.
- Chọn nhiều bàn/học sinh để **nhóm** thành một bàn lớn hơn, hoặc **tách** một bàn thành các bàn đơn.
- Mẫu sẵn có: 30 học sinh xếp vào các bàn đôi (3 bàn/hàng x 5 hàng).
- Xuất sơ đồ ra ảnh PNG hoặc file Excel (kèm sheet cấu hình); khi import lại đúng file đã xuất, sơ đồ chỗ ngồi được khôi phục nguyên trạng (không chỉ danh sách học sinh).

### 3. Thần số học (`/numerology`)

Nhập ngày sinh và họ tên học sinh để tự động tính các chỉ số thần số học, phục vụ việc chia nhóm/xếp lớp.

- Tính tự động **Số chủ đạo** (từ ngày sinh) và **Số tên** (từ họ tên) cho từng học sinh, kèm ý nghĩa mỗi con số.
- Nhập từ Excel (cột Tên học sinh, Ngày sinh dd/mm/yyyy) hoặc bắt đầu từ mẫu 15 học sinh có sẵn.
- Sắp xếp theo STT/tên/Số chủ đạo/Số tên, và lọc danh sách theo Số chủ đạo để nhóm học sinh tương đồng.
- Thêm/xóa học sinh, sửa tên và ngày sinh trực tiếp trên bảng.
- Xuất bảng ra ảnh PNG hoặc file Excel.

## Công nghệ sử dụng

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool
- [React Router](https://reactrouter.com/) — điều hướng giữa các công cụ
- [@xyflow/react](https://reactflow.dev/) — vẽ sơ đồ dạng node/edge (Sơ đồ hỗ trợ học tập)
- [Dagre](https://github.com/dagrejs/dagre) — tự động bố cục cây
- [SheetJS (xlsx)](https://sheetjs.com/) — đọc/ghi file Excel
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [html-to-image](https://github.com/bubkoo/html-to-image) — xuất sơ đồ/bảng ra PNG
- [lucide-react](https://lucide.dev/) — icon

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

Mỗi công cụ chấp nhận một định dạng cột hơi khác nhau (tên cột linh hoạt, không phân biệt vị trí):

| Công cụ | Các cột cần có | Ví dụ |
| --- | --- | --- |
| Sơ đồ hỗ trợ học tập | STT, Tên học sinh, STT Quản lý | `1`, `Nguyễn Văn A`, `1` |
| Sơ đồ chỗ ngồi | STT, Tên học sinh | `1`, `Nguyễn Văn A` |
| Thần số học | Tên học sinh, Ngày sinh (dd/mm/yyyy) | `Nguyễn Văn A`, `01/02/2010` |

Có thể bắt đầu từ dữ liệu mẫu ngay trong mỗi công cụ (nút **Bắt đầu từ mẫu** ở màn hình khởi đầu) để tham khảo định dạng chuẩn.

## Cấu trúc thư mục

```
class-management/
├── src/
│   ├── components/     # Layout, ResetButton, ToolPageToolbar, StartingPointPicker...
│   ├── hooks/           # useLocalStorage, useSelection, useMarqueeSelection, useResetTool...
│   ├── pages/            # HomePage, SupportTreePage, SeatingPage, NumerologyPage
│   ├── utils/            # numerology.ts — tính Số chủ đạo/Số tên
│   ├── App.tsx           # Khai báo route
│   ├── main.tsx          # Điểm khởi chạy ứng dụng React
│   └── index.css         # Tailwind CSS entry
├── index.html
├── vite.config.ts
└── package.json
```

## Triển khai (Deployment)

Dự án được cấu hình để tự động triển khai lên **GitHub Pages** thông qua GitHub Actions mỗi khi có thay đổi được đẩy lên nhánh `main`. Xem chi tiết workflow tại [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Trang sau khi triển khai có thể truy cập tại: https://kokoroou.github.io/class-management/

## License

Dự án được phát hành theo giấy phép [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/deed.vi) — được tự do sử dụng, sao chép và chỉnh sửa cho mục đích **phi thương mại**, kèm ghi công nguồn gốc. Xem chi tiết tại file [`LICENSE`](LICENSE).
