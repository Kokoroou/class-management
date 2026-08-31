import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  ReactFlow,
  Controls,
  Background,
  Node,
  Edge,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import {
  Upload,
  FileSpreadsheet,
  Image as ImageIcon,
  LayoutTemplate,
  Plus,
  Trash2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useResetTool } from '../hooks/useResetTool';
import StartingPointPicker from '../components/StartingPointPicker';
import ResetButton from '../components/ResetButton';
import ToolPageToolbar from '../components/ToolPageToolbar';

const STORAGE_KEY = 'class-management:support-tree';

interface SampleStudent {
  index: number;
  name: string;
  parentId: number | null;
}

const getSampleStudents = (): SampleStudent[] =>
  [...Array(30)].map((_, i) => {
    const idx = i + 1;
    const parentId =
      idx === 1
        ? null
        : idx === 2 || idx === 3 || idx === 4
        ? 1
        : idx === 5 || idx === 6
        ? 2
        : idx === 7 || idx === 8
        ? 3
        : idx === 9 || idx === 10
        ? 4
        : idx === 11 || idx === 12
        ? 5
        : idx === 13
        ? 6
        : idx === 14 || idx === 15
        ? 7
        : idx === 16
        ? 8
        : idx === 17 || idx === 18
        ? 9
        : idx === 19
        ? 10
        : idx === 20 || idx === 21
        ? 11
        : idx === 22
        ? 12
        : idx === 23
        ? 13
        : idx === 24 || idx === 25
        ? 14
        : idx === 26
        ? 15
        : idx === 27
        ? 16
        : idx === 28
        ? 17
        : idx === 29
        ? 18
        : idx === 30
        ? 19
        : null;
    return { index: idx, name: `Học sinh ${idx}`, parentId };
  });

const nodeWidth = 140;
const nodeHeight = 65;

const CustomNode = ({ data, id, selected }: any) => {
  const { updateNodeData } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const originalNameRef = useRef(data.name);

  const startEditing = () => {
    originalNameRef.current = data.name;
    setIsEditing(true);
  };

  const commitEditing = () => setIsEditing(false);

  const cancelEditing = () => {
    updateNodeData(id, { name: originalNameRef.current });
    setIsEditing(false);
  };

  return (
     <div className={`flex flex-col p-2.5 h-full w-[140px] bg-white border ${selected ? 'border-blue-600 shadow-[4px_4px_0px_rgba(37,99,235,0.2)]' : 'border-slate-900 shadow-[4px_4px_0px_rgba(15,23,42,0.1)]'} relative transition-colors`}>
       <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-slate-400 !border-none !rounded-none top-[-5px]" />
       {isEditing ? (
         <input
           autoFocus
           className="font-semibold text-[13px] text-slate-900 truncate w-full text-center mt-0.5 outline-none bg-transparent"
           value={data.name}
           onChange={(e) => updateNodeData(id, { name: e.target.value })}
           onBlur={commitEditing}
           onKeyDown={(e) => {
             e.stopPropagation();
             if (e.key === 'Enter') commitEditing();
             else if (e.key === 'Escape') cancelEditing();
           }}
           placeholder="Tên học sinh"
         />
       ) : (
         <span
           className="font-semibold text-[13px] text-slate-900 truncate w-full text-center mt-0.5 cursor-default"
           onDoubleClick={startEditing}
         >
           {data.name || 'Tên học sinh'}
         </span>
       )}
       <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-slate-400 !border-none !rounded-none bottom-[-5px]" />
     </div>
  );
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: 'top' as any,
      sourcePosition: 'bottom' as any,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

function MainCanvas() {
  const [savedDiagram, setSavedDiagram] = useLocalStorage<{ nodes: Node[]; edges: Edge[] } | null>(
    STORAGE_KEY,
    null
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(savedDiagram?.nodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(savedDiagram?.edges ?? []);
  const { fitView, screenToFlowPosition, getNodes, getEdges } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  useEffect(() => {
    setSavedDiagram(nodes.length === 0 ? null : { nodes, edges });
  }, [nodes, edges, setSavedDiagram]);

  const onConnect = useCallback((params: Connection) => {
      setEdges((eds) => addEdge({ ...params, type: 'straight', style: { stroke: '#cbd5e1', strokeWidth: 2 } }, eds));
  }, [setEdges]);

  const onLayout = useCallback(() => {
      const currentNodes = getNodes();
      const currentEdges = getEdges();
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(currentNodes, currentEdges);
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      setTimeout(() => {
          window.requestAnimationFrame(() => {
              fitView({ padding: 0.2, maxZoom: 1 });
          });
      }, 50);
  }, [getNodes, getEdges, setNodes, setEdges, fitView]);

  const onAddNode = useCallback(() => {
      const currentNodes = getNodes();
      const maxId = currentNodes.reduce((max, n) => Math.max(max, parseInt(n.id) || 0), 0);
      const newId = String(maxId + 1);
      const newNode: Node = {
          id: newId,
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { index: maxId + 1, name: `Học sinh ${maxId + 1}` }
      };

      const selectedNode = currentNodes.find(n => n.selected);
      if (selectedNode) {
          newNode.position = {
              x: selectedNode.position.x,
              y: selectedNode.position.y + 100
          };
          const newEdge: Edge = {
              id: `e${selectedNode.id}-${newId}`,
              source: selectedNode.id,
              target: newId,
              type: 'straight',
              style: { stroke: '#cbd5e1', strokeWidth: 2 }
          };
          setNodes(nds => [...nds.map(n => ({...n, selected: false})), newNode]);
          setEdges(eds => [...eds, newEdge]);
      } else {
          const center = screenToFlowPosition({
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
          });
          newNode.position = center;
          setNodes(nds => [...nds, newNode]);
      }
  }, [getNodes, setNodes, setEdges, screenToFlowPosition]);

  const deleteSelected = useCallback(() => {
      setNodes(nds => nds.filter(n => !n.selected));
      setEdges(eds => eds.filter(e => !e.selected));
  }, [setNodes, setEdges]);

  const parseExcelFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        if (data.length === 0) return;

        let sttCol = -1, nameCol = -1, parentCol = -1;
        const headerRow = data[0];
        if (headerRow) {
           headerRow.forEach((cell: any, idx: number) => {
              const str = String(cell).toLowerCase().trim();
              if (str === 'stt' || str === 'id' || str === 'số thứ tự') sttCol = idx;
              else if (str.includes('quản lý') || str.includes('parent') || str.includes('hỗ trợ') || str.includes('phụ trách') || str.includes('cấp trên')) parentCol = idx;
              else if (str.includes('tên') || str.includes('name') || str.includes('họ và')) nameCol = idx;
           });

           // Fallback nếu không khớp chính xác chữ 'stt'
           if (sttCol === -1) {
              headerRow.forEach((cell: any, idx: number) => {
                 const str = String(cell).toLowerCase().trim();
                 if (str.includes('stt') && !str.includes('quản lý') && !str.includes('hỗ trợ')) sttCol = idx;
              });
           }
        }

        if (sttCol === -1) sttCol = 0;
        if (nameCol === -1) nameCol = 1;

        const startIndex = (String(data[0][sttCol]).toLowerCase().includes('stt') || String(data[0][nameCol]).toLowerCase().includes('tên')) ? 1 : 0;

        const parsedStudents = [];
        for (let i = startIndex; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          let index = parseInt(row[sttCol], 10);
          if (isNaN(index)) index = i - startIndex + 1;
          let name = row[nameCol];
          if (!name) name = `Học sinh ${index}`;

          let parentId = null;
          if (parentCol !== -1 && row[parentCol]) {
              parentId = parseInt(row[parentCol], 10);
              if (isNaN(parentId)) parentId = null;
          } else if (index > 1) {
              parentId = Math.floor(index / 2); // default fallback
          }
          parsedStudents.push({ index, name: String(name), parentId });
        }

        const newNodes: Node[] = parsedStudents.map(s => ({
            id: String(s.index),
            type: 'custom',
            position: { x: 0, y: 0 },
            data: { index: s.index, name: s.name }
        }));

        const newEdges: Edge[] = [];
        parsedStudents.forEach(s => {
            if (s.parentId !== null && parsedStudents.some(ps => ps.index === s.parentId)) {
                newEdges.push({
                    id: `e${s.parentId}-${s.index}`,
                    source: String(s.parentId),
                    target: String(s.index),
                    type: 'straight',
                    style: { stroke: '#cbd5e1', strokeWidth: 2 }
                });
            }
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setTimeout(() => fitView({ padding: 0.2 }), 100);

      } catch (err) {
        console.error(err);
        alert('Lỗi khi đọc file. Vui lòng kiểm tra lại định dạng Excel.');
      }
    };
    reader.readAsBinaryString(file);
  }, [fitView, setNodes, setEdges]);

  const startFromTemplate = useCallback(() => {
    const students = getSampleStudents();
    const newNodes: Node[] = students.map(s => ({
      id: String(s.index),
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { index: s.index, name: s.name }
    }));

    const newEdges: Edge[] = [];
    students.forEach(s => {
      if (s.parentId !== null) {
        newEdges.push({
          id: `e${s.parentId}-${s.index}`,
          source: String(s.parentId),
          target: String(s.index),
          type: 'straight',
          style: { stroke: '#cbd5e1', strokeWidth: 2 }
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }, [setNodes, setEdges, fitView]);

  const handleDownloadExcel = () => {
     const currentNodes = getNodes();
     const currentEdges = getEdges();
     const wsData = currentNodes.map(node => {
         const parents = currentEdges.filter(e => e.target === node.id).map(e => e.source).join(', ');
         return {
             'STT': node.data.index,
             'Tên học sinh': node.data.name,
             'STT Quản lý': parents
         };
     });
     const ws = XLSX.utils.json_to_sheet(wsData);
     const wb = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, "Sơ đồ");
     XLSX.writeFile(wb, "sodo-hientai.xlsx");
  };

  const onDownloadPNG = useCallback(() => {
    if (!reactFlowWrapper.current) return;
    const nodesBounds = reactFlowWrapper.current.querySelector('.react-flow__viewport') as HTMLElement;
    if (!nodesBounds) return;
    toPng(reactFlowWrapper.current, {
      backgroundColor: '#f8fafc',
      filter: (node) => {
        if (node?.classList?.contains('react-flow__minimap') ||
            node?.classList?.contains('react-flow__controls') ||
            node?.classList?.contains('react-flow__panel')) {
          return false;
        }
        return true;
      },
    }).then((dataUrl) => {
      const a = document.createElement('a');
      a.setAttribute('download', `sodo-lophoc.png`);
      a.setAttribute('href', dataUrl);
      a.click();
    });
  }, []);

  const startNewDiagram = () => {
      const rootNode: Node = {
          id: '1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { index: 1, name: 'Học sinh 1' }
      };
      setNodes([rootNode]);
      setEdges([]);
      setTimeout(() => fitView(), 50);
  };

  const resetTool = useResetTool(STORAGE_KEY, () => {
      setNodes([]);
      setEdges([]);
  });

  if (nodes.length === 0) {
      return (
          <StartingPointPicker
              icon={<LayoutTemplate size={32} />}
              title="Bắt đầu sơ đồ hỗ trợ học tập"
              description="Tạo sơ đồ mới từ đầu, bắt đầu từ mẫu có sẵn, hoặc tải lên danh sách Excel (Cột STT, Tên học sinh, STT Quản lý) để tự động tạo."
              onBlank={startNewDiagram}
              blankLabel="Tạo sơ đồ mới"
              onTemplate={startFromTemplate}
              templateLabel="Bắt đầu từ mẫu"
              onExcelFile={parseExcelFile}
              excelLabel="Tải lên file Excel"
          />
      );
  }

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-50"
        deleteKeyCode={['Backspace', 'Delete']}
        panOnDrag={[1, 2]}
        selectionOnDrag
        multiSelectionKeyCode="Control"
      >
        <Background />
        <Controls />
        <Panel position="top-center" className="mt-4">
            <ToolPageToolbar
              groups={[
                [
                  { key: 'add-node', icon: <Plus size={20} />, title: 'Thêm Node (Tự nối nếu đang chọn một Node khác)', onClick: onAddNode },
                  { key: 'delete-selected', icon: <Trash2 size={20} />, title: 'Xóa Node hoặc Cạnh đang chọn (Phím Backspace)', onClick: deleteSelected },
                ],
                [
                  { key: 'layout', icon: <LayoutTemplate size={20} />, title: 'Tự động sắp xếp lại cây', onClick: onLayout },
                ],
                [
                  { key: 'export-png', icon: <ImageIcon size={20} />, title: 'Lưu sơ đồ (PNG)', onClick: onDownloadPNG },
                  { key: 'export-excel', icon: <FileSpreadsheet size={20} />, title: 'Lưu danh sách (Excel)', onClick: handleDownloadExcel },
                ],
                [
                  { key: 'upload-excel', icon: <Upload size={20} />, title: 'Tải lên file Excel khác', variant: 'upload', accept: '.xlsx, .xls, .csv', onFileSelect: parseExcelFile },
                ],
              ]}
            />
        </Panel>
        <Panel position="top-right" className="mt-4 mr-4">
            <ResetButton onClick={resetTool} />
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function SupportTreePage() {
  useDocumentTitle('Sơ đồ hỗ trợ học tập');

  return (
    <ReactFlowProvider>
      <MainCanvas />
    </ReactFlowProvider>
  );
}
