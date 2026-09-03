import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import * as XLSX from 'xlsx';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FileSpreadsheet,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useResetTool } from '../hooks/useResetTool';
import { useSelection } from '../hooks/useSelection';
import StartingPointPicker from '../components/StartingPointPicker';
import ResetButton from '../components/ResetButton';
import ToolPageToolbar from '../components/ToolPageToolbar';
import NumerologyDetailSidebar from '../components/NumerologyDetailSidebar';
import TruncatedName from '../components/TruncatedName';
import {
  NUMBER_MEANINGS,
  calcLifePathNumber,
  calcNameNumber,
  formatBirthDate,
  parseBirthDate,
} from '../utils/numerology';

const STORAGE_KEY = 'class-management:numerology';

interface Student {
  id: string;
  name: string;
  birthDate: string;
}

type SortKey = 'order' | 'name' | 'lifePath' | 'nameNumber';
type SortDir = 'asc' | 'desc';

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const SAMPLE_NAMES = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
  'Vũ Thị Giang', 'Đặng Văn Hùng', 'Bùi Thị Hoa', 'Đỗ Văn Khang', 'Ngô Thị Lan',
  'Dương Văn Minh', 'Lý Thị Ngọc', 'Trịnh Văn Phúc', 'Đinh Thị Quyên', 'Phan Văn Sơn',
];

const getSampleStudents = (): Student[] =>
  SAMPLE_NAMES.map((name, i) => {
    const day = ((i * 7) % 28) + 1;
    const month = ((i * 3) % 12) + 1;
    const year = 2010 + (i % 3);
    return { id: makeId(), name, birthDate: formatBirthDate({ day, month, year }) };
  });

const parseStudentsFromSheet = (file: File): Promise<Student[]> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: false, dateNF: 'dd/mm/yyyy' });
        if (data.length === 0) return resolve([]);

        let nameCol = -1;
        let birthCol = -1;
        const headerRow = data[0];
        if (headerRow) {
          headerRow.forEach((cell: any, idx: number) => {
            const str = String(cell).toLowerCase().trim();
            if (str.includes('tên') || str.includes('name') || str.includes('họ và')) nameCol = idx;
            else if (
              str.includes('ngày sinh') ||
              str.includes('sinh nhật') ||
              str.includes('birth') ||
              str.includes('dob') ||
              str.includes('sinh')
            )
              birthCol = idx;
          });
        }

        if (nameCol === -1) nameCol = 1;
        if (birthCol === -1) birthCol = 2;

        const looksLikeHeader =
          headerRow &&
          (String(headerRow[nameCol] ?? '').toLowerCase().includes('tên') ||
            String(headerRow[0] ?? '').toLowerCase().includes('stt'));
        const startIndex = looksLikeHeader ? 1 : 0;

        const students: Student[] = [];
        for (let i = startIndex; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          const name = row[nameCol];
          if (!name) continue;

          const parsedDate = parseBirthDate(row[birthCol]);
          students.push({
            id: makeId(),
            name: String(name),
            birthDate: parsedDate ? formatBirthDate(parsedDate) : '',
          });
        }

        resolve(students);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsBinaryString(file);
  });

function NumberBadge({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-xs text-slate-400 italic">Chưa xác định</span>;
  }
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-sm font-bold ${
          value >= 11 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
        }`}
      >
        {value}
      </span>
      <span className="text-xs text-slate-500 max-w-[220px]">{NUMBER_MEANINGS[value]}</span>
    </div>
  );
}

function MainTable() {
  const [students, setStudents] = useLocalStorage<Student[]>(STORAGE_KEY, []);
  const [sortKey, setSortKey] = useState<SortKey>('order');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filterLifePath, setFilterLifePath] = useState<number | 'all'>('all');
  const rowSelection = useSelection<string>();
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'name' | 'birthDate' } | null>(null);
  const editingOriginalRef = useRef('');
  const captureRef = useRef<HTMLDivElement>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailSidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!detailId) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (detailSidebarRef.current && !detailSidebarRef.current.contains(e.target as Node)) {
        setDetailId(null);
      }
    };
    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [detailId]);

  const rows = useMemo(
    () =>
      students.map((s) => ({
        ...s,
        lifePath: calcLifePathNumber(s.birthDate),
        nameNumber: calcNameNumber(s.name),
      })),
    [students]
  );

  const lifePathOptions = useMemo(() => {
    const set = new Set<number>();
    rows.forEach((r) => {
      if (r.lifePath !== null) set.add(r.lifePath);
    });
    return [...set].sort((a, b) => a - b);
  }, [rows]);

  const filteredRows = useMemo(
    () => (filterLifePath === 'all' ? rows : rows.filter((r) => r.lifePath === filterLifePath)),
    [rows, filterLifePath]
  );

  const displayRows = useMemo(() => {
    if (sortKey === 'order') {
      return sortDir === 'asc' ? filteredRows : [...filteredRows].reverse();
    }
    const sorted = [...filteredRows].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name, 'vi');
      const av = sortKey === 'lifePath' ? a.lifePath : a.nameNumber;
      const bv = sortKey === 'lifePath' ? b.lifePath : b.nameNumber;
      return (av ?? -1) - (bv ?? -1);
    });
    return sortDir === 'asc' ? sorted : sorted.reverse();
  }, [filteredRows, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown size={13} className="text-slate-300" />;
    return sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  };

  const updateStudent = (id: string, patch: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const startEditingCell = (id: string, field: 'name' | 'birthDate', currentValue: string) => {
    editingOriginalRef.current = currentValue;
    setEditingCell({ id, field });
  };

  const commitEditingCell = () => setEditingCell(null);

  const cancelEditingCell = () => {
    if (editingCell) updateStudent(editingCell.id, { [editingCell.field]: editingOriginalRef.current });
    setEditingCell(null);
  };

  const handleCellEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitEditingCell();
    else if (e.key === 'Escape') cancelEditingCell();
  };

  const addStudent = () => {
    setStudents((prev) => [...prev, { id: makeId(), name: '', birthDate: '' }]);
  };

  const handleDeleteSelected = () => {
    setStudents((prev) => prev.filter((s) => !rowSelection.selectedIds.has(s.id)));
    if (detailId && rowSelection.selectedIds.has(detailId)) setDetailId(null);
    rowSelection.clear();
  };

  const handleDownloadPNG = () => {
    if (!captureRef.current) return;
    toPng(captureRef.current, { backgroundColor: '#ffffff' }).then((dataUrl) => {
      const a = document.createElement('a');
      a.setAttribute('download', 'than-so-hoc.png');
      a.setAttribute('href', dataUrl);
      a.click();
    });
  };

  const handleDownloadExcel = () => {
    const data = displayRows.map((r, i) => ({
      STT: i + 1,
      'Tên học sinh': r.name,
      'Ngày sinh': r.birthDate,
      'Số chủ đạo': r.lifePath ?? '',
      'Số tên': r.nameNumber ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Thần số học');
    XLSX.writeFile(wb, 'than-so-hoc.xlsx');
  };

  const startNewList = () => setStudents([{ id: makeId(), name: '', birthDate: '' }]);
  const startFromTemplate = () => setStudents(getSampleStudents());
  const importExcel = async (file: File) => {
    try {
      const parsed = await parseStudentsFromSheet(file);
      setStudents(parsed.length > 0 ? parsed : [{ id: makeId(), name: '', birthDate: '' }]);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi đọc file. Vui lòng kiểm tra lại định dạng Excel.');
    }
  };

  const resetTool = useResetTool(STORAGE_KEY, () => setStudents([]));
  const canDelete = rowSelection.selectedIds.size > 0;
  const detailStudent = detailId ? students.find((s) => s.id === detailId) ?? null : null;

  if (students.length === 0) {
    return (
      <StartingPointPicker
        icon={<Sparkles size={32} />}
        title="Bắt đầu bảng thần số học"
        description="Tạo danh sách mới, bắt đầu từ mẫu có sẵn, hoặc tải lên file Excel (cột STT, Tên học sinh, Ngày sinh dd/mm/yyyy) để tự động tính chỉ số."
        onBlank={startNewList}
        blankLabel="Tạo mới"
        onTemplate={startFromTemplate}
        templateLabel="Bắt đầu từ mẫu"
        onExcelFile={importExcel}
        excelLabel="Tải lên file Excel"
      />
    );
  }

  return (
    <div
      className="w-full h-full overflow-y-auto px-4 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) rowSelection.clear();
      }}
    >
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap relative">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Lọc theo Số chủ đạo:</label>
            <select
              value={filterLifePath}
              onChange={(e) => setFilterLifePath(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
            >
              <option value="all">Tất cả</option>
              {lifePathOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ToolPageToolbar
              className="absolute left-1/2 -translate-x-1/2"
              groups={[
                // Nhóm 1: thao tác với đơn/nhóm phần tử đang chọn
                [
                  { key: 'add-student', icon: <Plus size={20} />, title: 'Thêm học sinh', onClick: addStudent },
                  {
                    key: 'delete-selected',
                    icon: <Trash2 size={20} />,
                    title: canDelete ? 'Xóa mục đã chọn' : 'Chọn học sinh để xóa',
                    disabled: !canDelete,
                    danger: true,
                    onClick: handleDeleteSelected,
                  },
                ],
                // Nhóm 3: tải xuống (không có thao tác nào áp dụng cho toàn bộ danh sách trên trang này)
                [
                  { key: 'export-png', icon: <ImageIcon size={20} />, title: 'Trích xuất PNG', onClick: handleDownloadPNG },
                  {
                    key: 'export-excel',
                    icon: <FileSpreadsheet size={20} />,
                    title: 'Trích xuất Excel',
                    onClick: handleDownloadExcel,
                  },
                ],
                // Nhóm 4: tải lên
                [
                  {
                    key: 'upload-excel',
                    icon: <Upload size={20} />,
                    title: 'Tải lên Excel (thay thế toàn bộ danh sách hiện tại)',
                    variant: 'upload',
                    accept: '.xlsx, .xls, .csv',
                    danger: true,
                    onFileSelect: importExcel,
                  },
                ],
              ]}
            />
            <ResetButton onClick={resetTool} />
          </div>
        </div>

        <div ref={captureRef} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left text-slate-500">
                <th className="px-4 py-2.5 font-medium w-14">
                  <button onClick={() => toggleSort('order')} className="flex items-center gap-1 hover:text-slate-900">
                    STT {sortIcon('order')}
                  </button>
                </th>
                <th className="px-4 py-2.5 font-medium">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-slate-900">
                    Tên học sinh {sortIcon('name')}
                  </button>
                </th>
                <th className="px-4 py-2.5 font-medium w-36">Ngày sinh</th>
                <th className="px-4 py-2.5 font-medium w-56">
                  <button onClick={() => toggleSort('lifePath')} className="flex items-center gap-1 hover:text-slate-900">
                    Số chủ đạo {sortIcon('lifePath')}
                  </button>
                </th>
                <th className="px-4 py-2.5 font-medium w-56">
                  <button onClick={() => toggleSort('nameNumber')} className="flex items-center gap-1 hover:text-slate-900">
                    Số tên {sortIcon('nameNumber')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, i) => {
                const isRowSelected = rowSelection.isSelected(row.id);
                const isEditingName = editingCell?.id === row.id && editingCell.field === 'name';
                const isEditingBirthDate = editingCell?.id === row.id && editingCell.field === 'birthDate';
                return (
                  <tr
                    key={row.id}
                    onClick={(e) => rowSelection.handleItemClick(row.id, e, displayRows.map((r) => r.id))}
                    onDoubleClick={() => setDetailId(row.id)}
                    className={`border-b border-slate-100 last:border-0 cursor-default transition-colors ${
                      isRowSelected ? 'bg-blue-50 hover:bg-blue-50' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="px-4 py-2 text-slate-500 align-top">{i + 1}</td>
                    <td
                      className="px-4 py-2 align-top"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startEditingCell(row.id, 'name', row.name);
                      }}
                    >
                      {isEditingName ? (
                        <input
                          autoFocus
                          value={row.name}
                          onChange={(e) => updateStudent(row.id, { name: e.target.value })}
                          onBlur={commitEditingCell}
                          onKeyDown={handleCellEditKeyDown}
                          placeholder="Họ và tên"
                          className="w-full outline-none bg-white border border-blue-300 rounded px-1 font-medium text-slate-900"
                        />
                      ) : row.name ? (
                        <TruncatedName name={row.name} maxLength={28} className="block w-full font-medium text-slate-900" />
                      ) : (
                        <span className="block w-full font-medium text-slate-900">Họ và tên</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-2 align-top"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startEditingCell(row.id, 'birthDate', row.birthDate);
                      }}
                    >
                      {isEditingBirthDate ? (
                        <input
                          autoFocus
                          value={row.birthDate}
                          onChange={(e) => updateStudent(row.id, { birthDate: e.target.value })}
                          onBlur={commitEditingCell}
                          onKeyDown={handleCellEditKeyDown}
                          placeholder="dd/mm/yyyy"
                          className="w-full outline-none bg-white border border-blue-300 rounded px-1 text-slate-600"
                        />
                      ) : (
                        <span className="block w-full text-slate-600">{row.birthDate || 'dd/mm/yyyy'}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top">
                      <NumberBadge value={row.lifePath} />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <NumberBadge value={row.nameNumber} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detailStudent && (
        <NumerologyDetailSidebar ref={detailSidebarRef} student={detailStudent} onClose={() => setDetailId(null)} />
      )}
    </div>
  );
}

export default function NumerologyPage() {
  useDocumentTitle('Thần số học');
  return <MainTable />;
}
