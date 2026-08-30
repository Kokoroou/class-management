import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid, Network } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface ToolCard {
  title: string;
  description: string;
  path: string;
  icon: ReactNode;
}

const TOOLS: ToolCard[] = [
  {
    title: 'Sơ đồ Hỗ trợ học tập',
    description:
      'Dựng sơ đồ mạng lưới hỗ trợ trong lớp từ file Excel danh sách học sinh, chỉnh sửa trực quan và xuất lại kết quả.',
    path: '/support-tree',
    icon: <Network size={24} />,
  },
  {
    title: 'Sơ đồ chỗ ngồi',
    description:
      'Xếp chỗ ngồi bằng cách kéo-thả học sinh vào sơ đồ bàn ghế tùy chỉnh, rồi xuất ra ảnh PNG hoặc file Excel.',
    path: '/seating',
    icon: <LayoutGrid size={24} />,
  },
];

export default function HomePage() {
  useDocumentTitle();

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
          Chào mừng đến với Quản lý lớp học
        </h1>
        <p className="text-slate-500 max-w-xl mb-12">
          Bộ công cụ hỗ trợ giáo viên quản lý và trực quan hóa lớp học. Chọn một công cụ bên dưới để bắt đầu.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {TOOLS.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="group flex flex-col text-left p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                {tool.icon}
              </div>
              <h2 className="font-semibold text-slate-900 mb-1">{tool.title}</h2>
              <p className="text-sm text-slate-500 mb-4 flex-1">{tool.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                Mở công cụ
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
