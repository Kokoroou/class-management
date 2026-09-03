import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  calcBirthDigitFrequency,
  calcFiveElements,
  calcGridLines,
  FIVE_ELEMENT_LABELS,
} from '../utils/numerology';
import type { FiveElement } from '../utils/numerology';

// ---------------------------------------------------------------------------
// Biểu đồ radar "Bánh xe cuộc đời" — mỗi trục là một chỉ số thần số học chính.
// ---------------------------------------------------------------------------

export interface RadarMetricPoint {
  label: string;
  value: number;
  raw: number | null;
}

function RadarTooltip({ active, payload }: { active?: boolean; payload?: { payload: RadarMetricPoint }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-md">
      <span className="font-semibold text-slate-900">{point.label}</span>
      <span className="ml-1.5 text-slate-500">{point.raw ?? '—'}</span>
    </div>
  );
}

export function LifeWheelRadarChart({ data }: { data: RadarMetricPoint[] }) {
  const hasMissing = data.some((d) => d.raw === null);

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Bánh xe cuộc đời</h3>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
          <PolarRadiusAxis angle={90} tick={false} axisLine={false} domain={[0, 'dataMax']} />
          <Radar
            dataKey="value"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.25}
            strokeWidth={2}
            dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
          />
          <Tooltip content={<RadarTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      {hasMissing && (
        <p className="text-[11px] text-slate-400 italic -mt-1">
          * Một vài trục hiển thị 0 do chưa đủ dữ liệu (họ và tên hoặc ngày sinh).
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Biểu đồ tỷ lệ Ngũ hành — thanh ngang, tô màu theo quy ước phổ biến.
// ---------------------------------------------------------------------------

// Thứ tự cố định theo chu kỳ Tương sinh (Mộc → Hỏa → Thổ → Kim → Thủy), giữ nguyên
// mỗi khi hiển thị để màu luôn gắn với đúng hành, không đổi theo tỷ lệ.
const FIVE_ELEMENT_ORDER: FiveElement[] = ['moc', 'hoa', 'tho', 'kim', 'thuy'];

const FIVE_ELEMENT_COLORS: Record<FiveElement, string> = {
  kim: '#5b6b82', // Kim — xám ánh kim
  moc: '#16a34a', // Mộc — xanh lá
  thuy: '#2563eb', // Thủy — xanh dương
  hoa: '#dc2626', // Hỏa — đỏ
  tho: '#ca8a04', // Thổ — vàng/nâu
};

export function FiveElementsChart({ birthDate }: { birthDate: string }) {
  const distribution = calcFiveElements(birthDate);

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900 mb-2">Tỷ lệ Ngũ hành</h3>
      {distribution ? (
        <div className="space-y-1.5">
          {FIVE_ELEMENT_ORDER.map((el) => {
            const pct = distribution[el];
            return (
              <div key={el} className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-xs text-slate-600">{FIVE_ELEMENT_LABELS[el]}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: FIVE_ELEMENT_COLORS[el] }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-xs font-medium text-slate-700 tabular-nums">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic">Cần có ngày sinh hợp lệ để tính tỷ lệ Ngũ hành.</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lưới Pythagoras thu nhỏ — tần suất chữ số 1-9 trong ngày sinh, sắp xếp 3x3.
// ---------------------------------------------------------------------------

// Bố cục chuẩn của lưới Pythagoras (3 hàng x 3 cột), đọc theo hàng từ trên xuống.
const GRID_LAYOUT = [
  [3, 6, 9],
  [2, 5, 8],
  [1, 4, 7],
];

export function PythagoreanGridMini({ birthDate }: { birthDate: string }) {
  const frequency = calcBirthDigitFrequency(birthDate);
  const lines = frequency ? calcGridLines(frequency.counts) : [];
  const strongLines = lines.filter((l) => l.state === 'strength');

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900 mb-2">Lưới Pythagoras</h3>
      {frequency ? (
        <>
          <div className="grid grid-cols-3 gap-1.5 max-w-[200px]">
            {GRID_LAYOUT.flat().map((digit) => {
              const count = frequency.counts[digit] ?? 0;
              const present = count > 0;
              return (
                <div
                  key={digit}
                  className={`aspect-square rounded-lg border flex flex-col items-center justify-center ${
                    present ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-300'
                  }`}
                >
                  <span className="text-base font-bold leading-none">{digit}</span>
                  <span className="text-[10px] mt-0.5 leading-none">{present ? `×${count}` : '—'}</span>
                </div>
              );
            })}
          </div>
          {strongLines.length > 0 && (
            <p className="text-[11px] text-slate-400 mt-2">
              Đường mạnh: {strongLines.map((l) => l.digits.join('-')).join(' · ')}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-400 italic">Cần có ngày sinh hợp lệ để tính lưới Pythagoras.</p>
      )}
    </div>
  );
}
