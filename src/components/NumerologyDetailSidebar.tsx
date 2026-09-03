import { forwardRef } from 'react';
import { Users, X } from 'lucide-react';
import {
  calcBirthDayNumber,
  calcExpressionNumber,
  calcFamilyNameNumber,
  calcGivenNameNumber,
  calcLifePathNumber,
  calcMiddleNameNumber,
  calcPersonalityNumber,
  calcSoulUrgeNumber,
} from '../utils/numerology';
import { LIFE_PATH_COMPATIBILITY, NUMBER_INSIGHTS, NUMEROLOGY_METRICS } from '../data/numerologyInsights';
import type { NumerologyMetricKey } from '../data/numerologyInsights';

interface DetailStudent {
  name: string;
  birthDate: string;
}

const CALCULATORS: Record<NumerologyMetricKey, (student: DetailStudent) => number | null> = {
  lifePath: (s) => calcLifePathNumber(s.birthDate),
  expression: (s) => calcExpressionNumber(s.name),
  soulUrge: (s) => calcSoulUrgeNumber(s.name),
  personality: (s) => calcPersonalityNumber(s.name),
  birthDay: (s) => calcBirthDayNumber(s.birthDate),
  familyName: (s) => calcFamilyNameNumber(s.name),
  middleName: (s) => calcMiddleNameNumber(s.name),
  givenName: (s) => calcGivenNameNumber(s.name),
};

function MetricNumberBadge({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-xs text-slate-400 italic bg-slate-100">
        —
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-base font-bold shrink-0 ${
        value >= 11 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
      }`}
    >
      {value}
    </span>
  );
}

interface NumerologyDetailSidebarProps {
  student: DetailStudent;
  onClose: () => void;
}

const NumerologyDetailSidebar = forwardRef<HTMLDivElement, NumerologyDetailSidebarProps>(
  ({ student, onClose }, ref) => {
    const lifePath = calcLifePathNumber(student.birthDate);
    const compatibility = lifePath !== null ? LIFE_PATH_COMPATIBILITY[lifePath] : null;

    return (
      <div
        ref={ref}
        className="fixed top-16 right-0 bottom-0 w-full sm:w-[380px] bg-white border-l border-slate-200 shadow-xl z-30 flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 truncate">{student.name || 'Họ và tên'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{student.birthDate || 'Chưa có ngày sinh'}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {NUMEROLOGY_METRICS.map((metric) => {
            const value = CALCULATORS[metric.key](student);
            const insight = value !== null ? NUMBER_INSIGHTS[value] : null;
            return (
              <div key={metric.key} className="pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <MetricNumberBadge value={value} />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {metric.label}
                      {insight && <span className="font-normal text-slate-400"> · {insight.keyword}</span>}
                    </h3>
                    <p className="text-[11px] text-slate-400">{metric.subtitle}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 italic">{metric.description}</p>

                {insight ? (
                  <div className="mt-3 space-y-2.5 text-sm text-slate-600 leading-relaxed">
                    <div>
                      <span className="block text-xs font-medium text-slate-500 mb-0.5">Đặc điểm tính cách</span>
                      {insight.personality}
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-slate-500 mb-0.5">Gợi ý học tập</span>
                      {insight.studyTip}
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-slate-500 mb-0.5">Gợi ý giao tiếp</span>
                      {insight.communicationTip}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-400 italic">
                    Chưa xác định — cần điền đủ {metric.requiresFullName ? 'họ và tên' : 'ngày sinh'} hợp lệ để tính chỉ số này.
                  </p>
                )}
              </div>
            );
          })}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">Gợi ý hòa đồng / hợp tác với bạn cùng lớp</h3>
            </div>
            {compatibility ? (
              <div className="space-y-2.5 text-sm text-slate-600 leading-relaxed">
                <div>
                  <span className="block text-xs font-medium text-slate-500 mb-0.5">Hợp tốt với</span>
                  {compatibility.bestWith}
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 mb-0.5">Cần thêm thời gian làm quen</span>
                  {compatibility.considerWith}
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 mb-0.5">Gợi ý cho giáo viên</span>
                  {compatibility.tip}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">
                Cần có Số chủ đạo hợp lệ (ngày sinh đầy đủ) để gợi ý mức độ hòa hợp.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

NumerologyDetailSidebar.displayName = 'NumerologyDetailSidebar';

export default NumerologyDetailSidebar;
