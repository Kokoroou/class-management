import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import * as XLSX from 'xlsx';
import {
  Columns3,
  FileSpreadsheet,
  Image as ImageIcon,
  LayoutGrid,
  Rows3,
  UserPlus,
  X,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useResetTool } from '../hooks/useResetTool';
import StartingPointPicker from '../components/StartingPointPicker';
import ResetButton from '../components/ResetButton';
import ToolPageToolbar from '../components/ToolPageToolbar';

const STORAGE_KEY = 'class-management:seating';
const DEFAULT_ROWS = 4;
const DEFAULT_COLS = 6;
const MAX_GRID_SIZE = 12;

interface Student {
  index: number;
  name: string;
}

interface SeatingData {
  students: Student[];
  rows: number;
  cols: number;
  /** key dạng "hàng-cột" (0-based) -> index học sinh đang ngồi */
  seatAssignments: Record<string, number>;
}

const clampGridSize = (n: number) => Math.min(MAX_GRID_SIZE, Math.max(1, n));

const computeGridSize = (studentCount: number) => {
  if (studentCount === 0) return { rows: DEFAULT_ROWS, cols: DEFAULT_COLS };
  const cols = Math.min(8, Math.ceil(Math.sqrt(studentCount * 1.5)));
  const rows = Math.max(1, Math.ceil(studentCount / cols));
  return { rows, cols };
};

const getSampleStudents = (): Student[] =>
  [...Array(24)].map((_, i) => ({ index: i + 1, name: `Học sinh ${i + 1}` }));

const parseStudentsFromSheet = (file: File): Promise<Student[]> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        if (data.length === 0) return resolve([]);

        let sttCol = -1;
        let nameCol = -1;
        const headerRow = data[0];
        if (headerRow) {
          headerRow.forEach((cell: any, idx: number) => {
            const str = String(cell).toLowerCase().trim();
            if (str === 'stt' || str === 'id' || str === 'số thứ tự') sttCol = idx;
            else if (str.includes('tên') || str.includes('name') || str.includes('họ và')) nameCol = idx;
          });
        }
        if (sttCol === -1) sttCol = 0;
        if (nameCol === -1) nameCol = 1;

        const startIndex =
          String(data[0]?.[sttCol]).toLowerCase().includes('stt') ||
          String(data[0]?.[nameCol]).toLowerCase().includes('tên')
            ? 1
            : 0;

        const students: Student[] = [];
        for (let i = startIndex; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;
          const name = row[nameCol];
          if (!name) continue;
          let index = parseInt(row[sttCol], 10);
          if (isNaN(index)) index = students.length + 1;
          students.push({ index, name: String(name) });
        }
        resolve(students);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });

export default function SeatingPage() {
  useDocumentTitle('Sơ đồ chỗ ngồi');

  const [data, setData] = useLocalStorage<SeatingData | null>(STORAGE_KEY, null);
  const [newStudentName, setNewStudentName] = useState('');
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const resetTool = useResetTool(STORAGE_KEY, () => setData(null));

  const handleStartBlank = () => {
    setData({ students: [], rows: DEFAULT_ROWS, cols: DEFAULT_COLS, seatAssignments: {} });
  };

  const handleStartTemplate = () => {
    const students = getSampleStudents();
    const { rows, cols } = computeGridSize(students.length);
    setData({ students, rows, cols, seatAssignments: {} });
  };

  const handleStartExcel = async (file: File) => {
    try {
      const students = await parseStudentsFromSheet(file);
      const { rows, cols } = computeGridSize(students.length);
      setData({ students, rows, cols, seatAssignments: {} });
    } catch (err) {
      console.error(err);
      alert('Lỗi khi đọc file. Vui lòng kiểm tra lại định dạng Excel.');
    }
  };

  const handleAddStudent = () => {
    const name = newStudentName.trim();
    if (!name) return;
    setData((prev) => {
      if (!prev) return prev;
      const nextIndex = prev.students.reduce((max, s) => Math.max(max, s.index), 0) + 1;
      return { ...prev, students: [...prev.students, { index: nextIndex, name }] };
    });
    setNewStudentName('');
  };

  const handleRemoveStudent = (studentIndex: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const seatAssignments = { ...prev.seatAssignments };
      const seatKey = Object.keys(seatAssignments).find((k) => seatAssignments[k] === studentIndex);
      if (seatKey) delete seatAssignments[seatKey];
      return { ...prev, students: prev.students.filter((s) => s.index !== studentIndex), seatAssignments };
    });
  };

  const handleUnassign = (studentIndex: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const seatAssignments = { ...prev.seatAssignments };
      const seatKey = Object.keys(seatAssignments).find((k) => seatAssignments[k] === studentIndex);
      if (!seatKey) return prev;
      delete seatAssignments[seatKey];
      return { ...prev, seatAssignments };
    });
  };

  const handleDragStart = (e: DragEvent, studentIndex: number) => {
    e.dataTransfer.setData('text/plain', String(studentIndex));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnSeat = (targetKey: string) => (e: DragEvent) => {
    e.preventDefault();
    setDragOverKey(null);
    const studentIndex = Number(e.dataTransfer.getData('text/plain'));
    if (!studentIndex) return;
    setData((prev) => {
      if (!prev) return prev;
      const seatAssignments = { ...prev.seatAssignments };
      const sourceKey = Object.keys(seatAssignments).find((k) => seatAssignments[k] === studentIndex);
      const displaced = seatAssignments[targetKey];
      if (sourceKey && sourceKey !== targetKey) {
        if (displaced !== undefined) seatAssignments[sourceKey] = displaced;
        else delete seatAssignments[sourceKey];
      }
      seatAssignments[targetKey] = studentIndex;
      return { ...prev, seatAssignments };
    });
  };

  const handleDropOnPool = (e: DragEvent) => {
    e.preventDefault();
    const studentIndex = Number(e.dataTransfer.getData('text/plain'));
    if (studentIndex) handleUnassign(studentIndex);
  };

  const handleSetRows = (value: number) => {
    const rows = clampGridSize(Number.isNaN(value) ? 1 : value);
    setData((prev) => {
      if (!prev) return prev;
      const seatAssignments = Object.fromEntries(
        Object.entries(prev.seatAssignments).filter(([key]) => Number(key.split('-')[0]) < rows)
      );
      return { ...prev, rows, seatAssignments };
    });
  };

  const handleSetCols = (value: number) => {
    const cols = clampGridSize(Number.isNaN(value) ? 1 : value);
    setData((prev) => {
      if (!prev) return prev;
      const seatAssignments = Object.fromEntries(
        Object.entries(prev.seatAssignments).filter(([key]) => Number(key.split('-')[1]) < cols)
      );
      return { ...prev, cols, seatAssignments };
    });
  };

  const handleDownloadPNG = () => {
    if (!captureRef.current) return;
    toPng(captureRef.current, { backgroundColor: '#f8fafc' }).then((dataUrl) => {
      const a = document.createElement('a');
      a.setAttribute('download', 'so-do-cho-ngoi.png');
      a.setAttribute('href', dataUrl);
      a.click();
    });
  };

  const handleDownloadExcel = () => {
    if (!data) return;
    const studentByIndex = new Map(data.students.map((s) => [s.index, s.name]));
    const rows = Object.entries(data.seatAssignments).map(([key, studentIndex]) => {
      const [r, c] = key.split('-').map(Number);
      return { Hàng: r + 1, Cột: c + 1, 'Tên học sinh': studentByIndex.get(studentIndex) ?? '' };
    });
    rows.sort((a, b) => a.Hàng - b.Hàng || a.Cột - b.Cột);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chỗ ngồi');
    XLSX.writeFile(wb, 'danh-sach-cho-ngoi.xlsx');
  };

  if (!data) {
    return (
      <StartingPointPicker
        icon={<LayoutGrid size={32} />}
        title="Bắt đầu sơ đồ chỗ ngồi"
        description="Tạo sơ đồ mới và tự nhập danh sách học sinh, bắt đầu từ mẫu có sẵn, hoặc tải lên file Excel (cột STT, Tên học sinh) để tự động import."
        onBlank={handleStartBlank}
        blankLabel="Tạo sơ đồ mới"
        onTemplate={handleStartTemplate}
        templateLabel="Bắt đầu từ mẫu"
        onExcelFile={handleStartExcel}
        excelLabel="Tải lên file Excel"
      />
    );
  }

  const studentByIndex = new Map(data.students.map((s) => [s.index, s.name]));
  const seatedIndexes = new Set(Object.values(data.seatAssignments));
  const unassignedStudents = data.students.filter((s) => !seatedIndexes.has(s.index));

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-3 flex-wrap relative">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Rows3 size={16} />
          <span>Hàng</span>
          <input
            type="number"
            min={1}
            max={MAX_GRID_SIZE}
            value={data.rows}
            onChange={(e) => handleSetRows(Number(e.target.value))}
            className="w-14 px-1.5 py-1 border border-slate-200 rounded-md text-sm outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Columns3 size={16} />
          <span>Cột</span>
          <input
            type="number"
            min={1}
            max={MAX_GRID_SIZE}
            value={data.cols}
            onChange={(e) => handleSetCols(Number(e.target.value))}
            className="w-14 px-1.5 py-1 border border-slate-200 rounded-md text-sm outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex-1" />
        <ToolPageToolbar
          className="absolute left-1/2 -translate-x-1/2"
          groups={[
            [
              { key: 'export-png', icon: <ImageIcon size={20} />, title: 'Lưu sơ đồ (PNG)', onClick: handleDownloadPNG },
              { key: 'export-excel', icon: <FileSpreadsheet size={20} />, title: 'Lưu danh sách chỗ ngồi (Excel)', onClick: handleDownloadExcel },
            ],
          ]}
        />
        <ResetButton onClick={resetTool} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside
          className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnPool}
        >
          <div className="p-3 border-b border-slate-200 flex gap-1.5">
            <input
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddStudent();
              }}
              placeholder="Tên học sinh mới"
              className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-400"
            />
            <button
              onClick={handleAddStudent}
              className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 shrink-0"
              title="Thêm học sinh"
            >
              <UserPlus size={16} />
            </button>
          </div>
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Chưa xếp chỗ ({unassignedStudents.length})
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1.5">
            {unassignedStudents.length === 0 && (
              <p className="text-xs text-slate-400 italic">Không còn học sinh nào chưa xếp chỗ.</p>
            )}
            {unassignedStudents.map((s) => (
              <div
                key={s.index}
                draggable
                onDragStart={(e) => handleDragStart(e, s.index)}
                className="group flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 cursor-grab select-none hover:border-blue-300"
              >
                <span className="truncate">{s.name}</span>
                <button
                  onClick={() => handleRemoveStudent(s.index)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity shrink-0"
                  title="Xóa học sinh"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 overflow-auto p-8 flex justify-center">
          <div ref={captureRef} className="inline-flex flex-col items-center gap-4 bg-slate-50 p-6 rounded-xl h-fit">
            <div className="px-8 py-2 bg-slate-800 text-white text-xs font-semibold tracking-widest rounded-md">
              BẢNG
            </div>
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${data.cols}, minmax(76px, 1fr))` }}
            >
              {[...Array(data.rows)].map((_, r) =>
                [...Array(data.cols)].map((_, c) => {
                  const key = `${r}-${c}`;
                  const studentIndex = data.seatAssignments[key];
                  const studentName = studentIndex !== undefined ? studentByIndex.get(studentIndex) : undefined;
                  const isOver = dragOverKey === key;
                  return (
                    <div
                      key={key}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverKey(key);
                      }}
                      onDragLeave={() => setDragOverKey((k) => (k === key ? null : k))}
                      onDrop={handleDropOnSeat(key)}
                      className={`relative h-20 w-20 flex flex-col items-center justify-center rounded-lg border px-1 transition-colors ${
                        studentName ? 'bg-white border-slate-300 shadow-sm' : 'bg-white/60 border-dashed border-slate-300'
                      } ${isOver ? '!border-blue-500 bg-blue-50' : ''}`}
                    >
                      {studentName ? (
                        <>
                          <span
                            draggable
                            onDragStart={(e) => handleDragStart(e, studentIndex!)}
                            className="text-xs font-medium text-slate-800 truncate w-full text-center cursor-grab select-none"
                            title={studentName}
                          >
                            {studentName}
                          </span>
                          <button
                            onClick={() => handleUnassign(studentIndex!)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center bg-white border border-slate-300 rounded-full text-slate-400 hover:text-red-500 hover:border-red-300"
                            title="Bỏ ra khỏi chỗ ngồi"
                          >
                            <X size={10} />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-300">Trống</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
