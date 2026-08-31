import { useEffect, useRef, useState } from 'react';
import type { DragEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import * as XLSX from 'xlsx';
import {
  Columns3,
  FileSpreadsheet,
  FileUp,
  Image as ImageIcon,
  LayoutGrid,
  Merge,
  Plus,
  Rows3,
  Split,
  Trash2,
  X,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useResetTool } from '../hooks/useResetTool';
import { useSelection } from '../hooks/useSelection';
import { useMarqueeSelection } from '../hooks/useMarqueeSelection';
import StartingPointPicker from '../components/StartingPointPicker';
import ResetButton from '../components/ResetButton';
import ToolPageToolbar from '../components/ToolPageToolbar';

const STORAGE_KEY = 'class-management:seating-v2';
const DEFAULT_ROWS = 4;
const DEFAULT_COLS = 6;
const MAX_GRID_SIZE = 12;
const TABLE_TYPES = [1, 2, 3, 4] as const;

type TableType = 1 | 2 | 3 | 4;

interface Student {
  index: number;
  name: string;
}

interface Table {
  /** sức chứa của bàn */
  type: TableType;
  /** học sinh đang ngồi, thứ tự trái->phải, luôn "đặc" (không có khoảng trống ở giữa) */
  studentIndexes: number[];
}

interface SeatingData {
  students: Student[];
  rows: number;
  /** số vị trí bàn mỗi hàng */
  cols: number;
  /** key dạng "hàng-cột" (0-based) -> bàn đang đặt tại đó; không có entry = ô trống */
  tables: Record<string, Table>;
  /** loại bàn áp dụng cho ô trống / khi thả học sinh vào ô trống */
  defaultTableType: TableType;
}

const clampGridSize = (n: number) => Math.min(MAX_GRID_SIZE, Math.max(1, n));

const computeGridSize = (studentCount: number) => {
  if (studentCount === 0) return { rows: DEFAULT_ROWS, cols: DEFAULT_COLS };
  const cols = Math.min(8, Math.ceil(Math.sqrt(studentCount * 1.5)));
  const rows = Math.max(1, Math.ceil(studentCount / cols));
  return { rows, cols };
};

const buildData = (students: Student[]): SeatingData => {
  const { rows, cols } = computeGridSize(students.length);
  return { students, rows, cols, tables: {}, defaultTableType: 1 };
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

const compareKeys = (a: string, b: string) => {
  const [ar, ac] = a.split('-').map(Number);
  const [br, bc] = b.split('-').map(Number);
  return ar - br || ac - bc;
};

const findFirstEmptyKey = (tables: Record<string, Table>, rows: number, cols: number): string | null => {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r}-${c}`;
      if (!tables[key]) return key;
    }
  }
  return null;
};

const findSeat = (tables: Record<string, Table>, studentIndex: number): { key: string; seatIdx: number } | null => {
  for (const key of Object.keys(tables)) {
    const idx = tables[key].studentIndexes.indexOf(studentIndex);
    if (idx !== -1) return { key, seatIdx: idx };
  }
  return null;
};

export default function SeatingPage() {
  useDocumentTitle('Sơ đồ chỗ ngồi');

  const [data, setData] = useLocalStorage<SeatingData | null>(STORAGE_KEY, null);
  const [newStudentName, setNewStudentName] = useState('');
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const editingOriginalNameRef = useRef('');
  const captureRef = useRef<HTMLDivElement>(null);
  const poolContainerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const addPopoverRef = useRef<HTMLDivElement>(null);

  const poolSelection = useSelection<number>();
  const gridSelection = useSelection<string>();

  const poolMarquee = useMarqueeSelection({
    containerRef: poolContainerRef,
    onSelect: (ids, additive) => poolSelection.selectMany(ids.map(Number), additive),
    onBackgroundClick: poolSelection.clear,
  });
  const gridMarquee = useMarqueeSelection({
    containerRef: gridContainerRef,
    onSelect: (ids, additive) => gridSelection.selectMany(ids, additive),
    onBackgroundClick: gridSelection.clear,
  });

  const resetTool = useResetTool(STORAGE_KEY, () => setData(null));

  useEffect(() => {
    if (!isAddPopoverOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (addPopoverRef.current && !addPopoverRef.current.contains(e.target as Node)) {
        setIsAddPopoverOpen(false);
      }
    };
    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isAddPopoverOpen]);

  const handleStartBlank = () => setData(buildData([]));
  const handleStartTemplate = () => setData(buildData(getSampleStudents()));

  const handleStartExcel = async (file: File) => {
    try {
      const students = await parseStudentsFromSheet(file);
      setData(buildData(students));
    } catch (err) {
      console.error(err);
      alert('Lỗi khi đọc file. Vui lòng kiểm tra lại định dạng Excel.');
    }
  };

  const handleReplaceExcel = async (file: File) => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn tải lên file Excel khác? Toàn bộ danh sách học sinh và sơ đồ chỗ ngồi hiện tại sẽ bị thay thế và không thể khôi phục.'
    );
    if (!confirmed) return;
    try {
      const students = await parseStudentsFromSheet(file);
      setData(buildData(students));
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
    addInputRef.current?.focus();
  };

  const handleRemoveStudent = (studentIndex: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const tables = { ...prev.tables };
      const loc = findSeat(tables, studentIndex);
      if (loc) {
        const table = tables[loc.key];
        const studentIndexes = table.studentIndexes.filter((_, i) => i !== loc.seatIdx);
        if (studentIndexes.length === 0) delete tables[loc.key];
        else tables[loc.key] = { ...table, studentIndexes };
      }
      return { ...prev, students: prev.students.filter((s) => s.index !== studentIndex), tables };
    });
  };

  const updateStudentName = (studentIndex: number, name: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, students: prev.students.map((s) => (s.index === studentIndex ? { ...s, name } : s)) };
    });
  };

  const startEditingStudent = (studentIndex: number, currentName: string) => {
    editingOriginalNameRef.current = currentName;
    setEditingStudentId(studentIndex);
  };

  const commitEditingStudent = () => setEditingStudentId(null);

  const cancelEditingStudent = (studentIndex: number) => {
    updateStudentName(studentIndex, editingOriginalNameRef.current);
    setEditingStudentId(null);
  };

  const handleNameEditKeyDown = (studentIndex: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitEditingStudent();
    else if (e.key === 'Escape') cancelEditingStudent(studentIndex);
  };

  const handleUnassign = (studentIndex: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const tables = { ...prev.tables };
      const loc = findSeat(tables, studentIndex);
      if (!loc) return prev;
      const table = tables[loc.key];
      const studentIndexes = table.studentIndexes.filter((_, i) => i !== loc.seatIdx);
      if (studentIndexes.length === 0) delete tables[loc.key];
      else tables[loc.key] = { ...table, studentIndexes };
      return { ...prev, tables };
    });
  };

  const handleDragStart = (e: DragEvent, studentIndex: number) => {
    e.dataTransfer.setData('text/plain', String(studentIndex));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnSeat = (targetKey: string, seatIndex: number) => (e: DragEvent) => {
    e.preventDefault();
    setDragOverTarget(null);
    const studentIndex = Number(e.dataTransfer.getData('text/plain'));
    if (!studentIndex) return;
    setData((prev) => {
      if (!prev) return prev;
      const tables = { ...prev.tables };
      const source = findSeat(tables, studentIndex);
      if (source && source.key === targetKey && source.seatIdx === seatIndex) return prev;

      const targetExisting = tables[targetKey];
      const targetType = targetExisting?.type ?? prev.defaultTableType;
      if (seatIndex >= targetType) return prev;

      const isOccupiedSeat = !!targetExisting && seatIndex < targetExisting.studentIndexes.length;

      if (isOccupiedSeat) {
        const targetOccupants = [...targetExisting!.studentIndexes];
        const displaced = targetOccupants[seatIndex];
        targetOccupants[seatIndex] = studentIndex;

        if (source) {
          if (source.key === targetKey) {
            targetOccupants[source.seatIdx] = displaced;
          } else {
            const srcTable = tables[source.key];
            const srcOccupants = [...srcTable.studentIndexes];
            srcOccupants[source.seatIdx] = displaced;
            tables[source.key] = { ...srcTable, studentIndexes: srcOccupants };
          }
        }
        tables[targetKey] = { type: targetType, studentIndexes: targetOccupants };
      } else {
        const targetOccupants = targetExisting ? [...targetExisting.studentIndexes] : [];
        if (targetOccupants.length >= targetType) return prev;

        if (source) {
          const srcTable = tables[source.key];
          const srcOccupants = srcTable.studentIndexes.filter((_, i) => i !== source.seatIdx);
          if (srcOccupants.length === 0) delete tables[source.key];
          else tables[source.key] = { ...srcTable, studentIndexes: srcOccupants };
        }
        targetOccupants.push(studentIndex);
        tables[targetKey] = { type: targetType, studentIndexes: targetOccupants };
      }

      return { ...prev, tables };
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
      const tables = Object.fromEntries(
        Object.entries(prev.tables).filter(([key]) => Number(key.split('-')[0]) < rows)
      );
      return { ...prev, rows, tables };
    });
  };

  const handleSetCols = (value: number) => {
    const cols = clampGridSize(Number.isNaN(value) ? 1 : value);
    setData((prev) => {
      if (!prev) return prev;
      const tables = Object.fromEntries(
        Object.entries(prev.tables).filter(([key]) => Number(key.split('-')[1]) < cols)
      );
      return { ...prev, cols, tables };
    });
  };

  const handleSetDefaultTableType = (type: TableType) => {
    setData((prev) => (prev ? { ...prev, defaultTableType: type } : prev));
  };

  const handleGroupSelected = () => {
    setData((prev) => {
      if (!prev) return prev;
      const gridKeys = [...gridSelection.selectedIds].sort(compareKeys);
      const poolIndexes = [...poolSelection.selectedIds];

      const tables = { ...prev.tables };
      const seen = new Set<number>();
      const total: number[] = [];
      gridKeys.forEach((key) => {
        const table = tables[key];
        if (!table) return;
        table.studentIndexes.forEach((idx) => {
          if (!seen.has(idx)) {
            seen.add(idx);
            total.push(idx);
          }
        });
      });
      poolIndexes.forEach((idx) => {
        if (!seen.has(idx)) {
          seen.add(idx);
          total.push(idx);
        }
      });

      if (total.length === 0) return prev;
      if (total.length > 4) {
        alert('Không có loại bàn phù hợp (tối đa 4 học sinh/bàn).');
        return prev;
      }

      let rows = prev.rows;
      let targetKey: string;
      if (gridKeys.length > 0) {
        targetKey = gridKeys[0];
      } else {
        const found = findFirstEmptyKey(tables, rows, prev.cols);
        if (found !== null) {
          targetKey = found;
        } else {
          targetKey = `${rows}-0`;
          rows += 1;
        }
      }

      gridKeys.forEach((key) => {
        if (key !== targetKey) delete tables[key];
      });
      tables[targetKey] = { type: total.length as TableType, studentIndexes: total };

      return { ...prev, rows, tables };
    });
    gridSelection.clear();
    poolSelection.clear();
  };

  const handleSplitSelected = () => {
    setData((prev) => {
      if (!prev) return prev;
      const gridKeys = [...gridSelection.selectedIds];
      if (gridKeys.length !== 1) {
        alert('Vui lòng chọn đúng 1 bàn để tách.');
        return prev;
      }
      const key = gridKeys[0];
      const table = prev.tables[key];
      if (!table || table.studentIndexes.length < 2) return prev;

      const tables = { ...prev.tables };
      let rows = prev.rows;
      const cols = prev.cols;
      const [startR, startC] = key.split('-').map(Number);

      tables[key] = { type: 1, studentIndexes: [table.studentIndexes[0]] };

      let r = startR;
      let c = startC + 1;
      table.studentIndexes.slice(1).forEach((studentIndex) => {
        while (true) {
          if (c >= cols) {
            c = 0;
            r += 1;
          }
          if (r >= rows) rows += 1;
          const candidateKey = `${r}-${c}`;
          if (!tables[candidateKey]) {
            tables[candidateKey] = { type: 1, studentIndexes: [studentIndex] };
            c += 1;
            break;
          }
          c += 1;
        }
      });

      return { ...prev, rows, tables };
    });
    gridSelection.clear();
  };

  const handleDeleteSelected = () => {
    setData((prev) => {
      if (!prev) return prev;
      const tables = { ...prev.tables };
      gridSelection.selectedIds.forEach((key) => {
        delete tables[key];
      });
      const poolSet = poolSelection.selectedIds;
      const students = poolSet.size > 0 ? prev.students.filter((s) => !poolSet.has(s.index)) : prev.students;
      return { ...prev, tables, students };
    });
    gridSelection.clear();
    poolSelection.clear();
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
    const studentByIndex = new Map<number, string>(data.students.map((s) => [s.index, s.name]));
    const rows: { Hàng: number; Cột: number; 'Vị trí trong bàn': number; 'Tên học sinh': string }[] = [];
    Object.entries(data.tables).forEach(([key, table]) => {
      const [r, c] = key.split('-').map(Number);
      table.studentIndexes.forEach((studentIndex, seatIdx) => {
        rows.push({
          Hàng: r + 1,
          Cột: c + 1,
          'Vị trí trong bàn': seatIdx + 1,
          'Tên học sinh': studentByIndex.get(studentIndex) ?? '',
        });
      });
    });
    rows.sort((a, b) => a.Hàng - b.Hàng || a.Cột - b.Cột || a['Vị trí trong bàn'] - b['Vị trí trong bàn']);
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

  const studentByIndex = new Map<number, string>(data.students.map((s) => [s.index, s.name]));
  const seatedIndexes = new Set(Object.values(data.tables).flatMap((t) => t.studentIndexes));
  const unassignedStudents = data.students.filter((s) => !seatedIndexes.has(s.index));

  const selectedGridTables = [...gridSelection.selectedIds].map((k) => data.tables[k]).filter(Boolean) as Table[];
  const totalSelectedForGroup = new Set([
    ...selectedGridTables.flatMap((t) => t.studentIndexes),
    ...poolSelection.selectedIds,
  ]).size;
  const canGroup = totalSelectedForGroup >= 2;
  const singleSelectedTable =
    gridSelection.selectedIds.size === 1 ? data.tables[[...gridSelection.selectedIds][0]] : undefined;
  const canSplit = !!singleSelectedTable && singleSelectedTable.studentIndexes.length >= 2;
  const canDelete = gridSelection.selectedIds.size > 0 || poolSelection.selectedIds.size > 0;

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
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <span>Loại bàn mặc định</span>
          <div className="flex border border-slate-200 rounded-md overflow-hidden">
            {TABLE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => handleSetDefaultTableType(t)}
                className={`px-2 py-1 text-xs font-semibold transition-colors ${
                  data.defaultTableType === t ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                } ${t > 1 ? 'border-l border-slate-200' : ''}`}
                title={`Bàn ${t} học sinh`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1" />
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <ToolPageToolbar
            groups={[
              [
                { key: 'export-png', icon: <ImageIcon size={20} />, title: 'Lưu sơ đồ (PNG)', onClick: handleDownloadPNG },
                {
                  key: 'export-excel',
                  icon: <FileSpreadsheet size={20} />,
                  title: 'Lưu danh sách chỗ ngồi (Excel)',
                  onClick: handleDownloadExcel,
                },
              ],
              [
                {
                  key: 'add-student',
                  icon: <Plus size={20} />,
                  title: 'Thêm học sinh mới',
                  onClick: () => setIsAddPopoverOpen(true),
                },
                {
                  key: 'group-tables',
                  icon: <Merge size={20} />,
                  title: canGroup ? 'Nhóm thành 1 bàn' : 'Chọn từ 2 học sinh/bàn trở lên để nhóm',
                  disabled: !canGroup,
                  onClick: handleGroupSelected,
                },
                {
                  key: 'split-table',
                  icon: <Split size={20} />,
                  title: canSplit ? 'Tách thành các bàn đơn' : 'Chọn 1 bàn có từ 2 học sinh trở lên để tách',
                  disabled: !canSplit,
                  onClick: handleSplitSelected,
                },
                {
                  key: 'delete-selected',
                  icon: <Trash2 size={20} />,
                  title: 'Xóa mục đã chọn',
                  disabled: !canDelete,
                  onClick: handleDeleteSelected,
                },
                {
                  key: 'upload-another',
                  icon: <FileUp size={20} />,
                  title: 'Tải file Excel khác lên',
                  variant: 'upload',
                  onFileSelect: handleReplaceExcel,
                },
              ],
            ]}
          />
          {isAddPopoverOpen && (
            <div
              ref={addPopoverRef}
              className="mt-2 bg-white border border-slate-200 shadow-lg rounded-lg p-2 flex items-center gap-1.5 z-30"
            >
              <input
                ref={addInputRef}
                autoFocus
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddStudent();
                  else if (e.key === 'Escape') setIsAddPopoverOpen(false);
                }}
                placeholder="Tên học sinh mới"
                className="w-48 px-2 py-1.5 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-400"
              />
              <button
                onClick={handleAddStudent}
                className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 shrink-0"
                title="Thêm học sinh"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
        <ResetButton onClick={resetTool} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside
          ref={poolContainerRef}
          className="relative w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnPool}
          onMouseDown={poolMarquee.onMouseDown}
        >
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-200">
            Chưa xếp chỗ ({unassignedStudents.length})
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1.5">
            {unassignedStudents.length === 0 && (
              <p className="text-xs text-slate-400 italic">Không còn học sinh nào chưa xếp chỗ.</p>
            )}
            {unassignedStudents.map((s) => {
              const isSelected = poolSelection.isSelected(s.index);
              const isEditing = editingStudentId === s.index;
              return (
                <div
                  key={s.index}
                  draggable={!isEditing}
                  onDragStart={(e) => handleDragStart(e, s.index)}
                  onClick={(e: ReactMouseEvent) => {
                    if (isEditing) return;
                    poolSelection.handleItemClick(s.index, e);
                  }}
                  onDoubleClick={() => startEditingStudent(s.index, s.name)}
                  data-marquee-id={String(s.index)}
                  className={`group flex items-center justify-between gap-2 px-2.5 py-1.5 border rounded-md text-sm cursor-grab select-none transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-200 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      value={s.name}
                      onChange={(e) => updateStudentName(s.index, e.target.value)}
                      onBlur={commitEditingStudent}
                      onKeyDown={handleNameEditKeyDown(s.index)}
                      className="flex-1 min-w-0 outline-none bg-white border border-blue-300 rounded px-1 text-sm"
                    />
                  ) : (
                    <span className="truncate">{s.name}</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveStudent(s.index);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity shrink-0"
                    title="Xóa học sinh"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
          {poolMarquee.marqueeRect && (
            <div
              className="absolute border border-blue-400 bg-blue-400/10 pointer-events-none"
              style={{
                left: poolMarquee.marqueeRect.left,
                top: poolMarquee.marqueeRect.top,
                width: poolMarquee.marqueeRect.width,
                height: poolMarquee.marqueeRect.height,
              }}
            />
          )}
        </aside>

        <div className="flex-1 overflow-auto p-8 flex justify-center">
          <div ref={captureRef} className="inline-flex flex-col items-center gap-4 bg-slate-50 p-6 rounded-xl h-fit">
            <div className="px-8 py-2 bg-slate-800 text-white text-xs font-semibold tracking-widest rounded-md">
              BẢNG
            </div>
            <div
              ref={gridContainerRef}
              className="relative flex flex-col gap-3"
              onMouseDown={gridMarquee.onMouseDown}
            >
              {[...Array(data.rows)].map((_, r) => (
                <div key={r} className="flex gap-3">
                  {[...Array(data.cols)].map((_, c) => {
                    const key = `${r}-${c}`;
                    const table = data.tables[key];
                    const type = table?.type ?? data.defaultTableType;
                    const occupants = table?.studentIndexes ?? [];
                    const isSelected = gridSelection.isSelected(key);
                    return (
                      <div
                        key={key}
                        data-marquee-id={key}
                        onClick={(e: ReactMouseEvent) => {
                          if (editingStudentId !== null && occupants.includes(editingStudentId)) return;
                          gridSelection.handleItemClick(key, e);
                        }}
                        className={`flex gap-1 p-1.5 rounded-lg border transition-colors ${
                          table ? 'bg-slate-100 border-slate-300' : 'bg-transparent border-dashed border-slate-200'
                        } ${isSelected ? '!border-blue-600 ring-2 ring-blue-200' : ''}`}
                      >
                        {[...Array(type)].map((_, seatIdx) => {
                          const studentIndex = occupants[seatIdx];
                          const studentName = studentIndex !== undefined ? studentByIndex.get(studentIndex) : undefined;
                          const targetId = `${key}:${seatIdx}`;
                          const isOver = dragOverTarget === targetId;
                          const isEditingSeat = studentIndex !== undefined && editingStudentId === studentIndex;
                          return (
                            <div
                              key={seatIdx}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setDragOverTarget(targetId);
                              }}
                              onDragLeave={() => setDragOverTarget((t) => (t === targetId ? null : t))}
                              onDrop={handleDropOnSeat(key, seatIdx)}
                              onDoubleClick={() => {
                                if (studentIndex !== undefined && studentName) startEditingStudent(studentIndex, studentName);
                              }}
                              className={`relative h-20 w-[72px] flex flex-col items-center justify-center rounded-md border px-1 transition-colors ${
                                studentName ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/60 border-dashed border-slate-200'
                              } ${isOver ? '!border-blue-500 bg-blue-50' : ''}`}
                            >
                              {studentName ? (
                                <>
                                  {isEditingSeat ? (
                                    <input
                                      autoFocus
                                      value={studentName}
                                      onChange={(e) => updateStudentName(studentIndex!, e.target.value)}
                                      onBlur={commitEditingStudent}
                                      onKeyDown={handleNameEditKeyDown(studentIndex!)}
                                      className="w-full text-xs text-center outline-none bg-white border border-blue-300 rounded px-0.5"
                                    />
                                  ) : (
                                    <span
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, studentIndex!)}
                                      className="text-xs font-medium text-slate-800 truncate w-full text-center cursor-grab select-none"
                                      title={studentName}
                                    >
                                      {studentName}
                                    </span>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUnassign(studentIndex!);
                                    }}
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
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
              {gridMarquee.marqueeRect && (
                <div
                  className="absolute border border-blue-400 bg-blue-400/10 pointer-events-none"
                  style={{
                    left: gridMarquee.marqueeRect.left,
                    top: gridMarquee.marqueeRect.top,
                    width: gridMarquee.marqueeRect.width,
                    height: gridMarquee.marqueeRect.height,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
