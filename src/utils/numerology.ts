/**
 * Bảng chữ-số Pythagoras dùng để tính Số tên (Expression Number).
 */
const LETTER_VALUES: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const MASTER_NUMBERS = [11, 22, 33];

/** Diễn giải ngắn gọn đặc điểm ứng với mỗi con số thần số học. */
export const NUMBER_MEANINGS: Record<number, string> = {
  1: 'Độc lập, quyết đoán, thích dẫn đầu và tự lực.',
  2: 'Nhạy cảm, hòa hợp, giỏi hợp tác và lắng nghe.',
  3: 'Sáng tạo, hoạt bát, thích giao tiếp và thể hiện.',
  4: 'Kỷ luật, cẩn thận, làm việc có hệ thống và bền bỉ.',
  5: 'Năng động, thích khám phá, dễ thích nghi với thay đổi.',
  6: 'Chu đáo, trách nhiệm, quan tâm đến tập thể và gia đình.',
  7: 'Trầm tĩnh, ham hiểu biết, thích phân tích và suy ngẫm.',
  8: 'Quyết tâm, có tổ chức, hướng đến thành tích và hiệu quả.',
  9: 'Bao dung, giàu lòng nhân ái, quan tâm đến người khác.',
  11: 'Trực giác nhạy bén, giàu cảm xúc, tiềm năng truyền cảm hứng (số chủ).',
  22: 'Tầm nhìn lớn, khả năng hiện thực hóa ý tưởng quy mô (số chủ).',
  33: 'Vị tha, giàu tình thương, hướng đến việc giúp đỡ người khác (số chủ).',
};

/** Cộng dồn các chữ số của một số nguyên. */
const digitSum = (n: number): number =>
  String(Math.abs(n))
    .split('')
    .reduce((sum, ch) => sum + Number(ch), 0);

/** Rút gọn về 1-9, giữ lại số chủ 11/22/33. */
export const reduceNumber = (n: number): number => {
  let result = n;
  while (result > 9 && !MASTER_NUMBERS.includes(result)) {
    result = digitSum(result);
  }
  return result;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

// Dải Unicode combining diacritical marks (U+0300–U+036F) tạo ra khi normalize('NFD').
const COMBINING_MARKS_RE = /[̀-ͯ]/g;

/** Bỏ dấu tiếng Việt, chuyển đ/Đ -> d/D. */
const stripDiacritics = (str: string): string =>
  str
    .normalize('NFD')
    .replace(COMBINING_MARKS_RE, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

export interface ParsedBirthDate {
  day: number;
  month: number;
  year: number;
}

/**
 * Nhận diện ngày sinh từ nhiều định dạng phổ biến: dd/mm/yyyy, d-m-yyyy,
 * dd.mm.yyyy, hoặc yyyy-mm-dd (ISO, thường gặp khi đọc từ Excel).
 */
export const parseBirthDate = (raw: unknown): ParsedBirthDate | null => {
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return { day: raw.getDate(), month: raw.getMonth() + 1, year: raw.getFullYear() };
  }

  const str = String(raw ?? '').trim();
  if (!str) return null;

  const dmy = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return { day, month, year };
  }

  const ymd = str.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]);
    const day = Number(ymd[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return { day, month, year };
  }

  return null;
};

/** Định dạng lại thành chuỗi dd/mm/yyyy chuẩn để lưu trữ và hiển thị. */
export const formatBirthDate = ({ day, month, year }: ParsedBirthDate): string =>
  `${pad2(day)}/${pad2(month)}/${year}`;

/** Số chủ đạo (Life Path Number): tổng các chữ số trong ngày sinh, rút gọn giữ số chủ. */
export const calcLifePathNumber = (birthDate: string): number | null => {
  const parsed = parseBirthDate(birthDate);
  if (!parsed) return null;
  const digits = `${pad2(parsed.day)}${pad2(parsed.month)}${parsed.year}`;
  const sum = digits.split('').reduce((acc, ch) => acc + Number(ch), 0);
  return reduceNumber(sum);
};

/** Số tên (Expression Number): tổng giá trị các chữ cái trong họ tên, rút gọn giữ số chủ. */
export const calcNameNumber = (name: string): number | null => {
  const normalized = stripDiacritics(name).toLowerCase().replace(/[^a-z]/g, '');
  if (!normalized) return null;
  const sum = normalized.split('').reduce((acc, ch) => acc + (LETTER_VALUES[ch] ?? 0), 0);
  if (sum === 0) return null;
  return reduceNumber(sum);
};

/** Số sứ mệnh (Expression/Destiny Number): cùng công thức với Số tên, tính trên toàn bộ họ tên. */
export const calcExpressionNumber = calcNameNumber;

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

const sumLetterValues = (letters: string): number =>
  letters.split('').reduce((acc, ch) => acc + (LETTER_VALUES[ch] ?? 0), 0);

/** Số linh hồn (Soul Urge Number): tổng giá trị các nguyên âm trong họ tên, rút gọn giữ số chủ. */
export const calcSoulUrgeNumber = (name: string): number | null => {
  const normalized = stripDiacritics(name).toLowerCase().replace(/[^a-z]/g, '');
  const vowels = normalized.split('').filter((ch) => VOWELS.has(ch)).join('');
  if (!vowels) return null;
  return reduceNumber(sumLetterValues(vowels));
};

/** Số nhân cách (Personality Number): tổng giá trị các phụ âm trong họ tên, rút gọn giữ số chủ. */
export const calcPersonalityNumber = (name: string): number | null => {
  const normalized = stripDiacritics(name).toLowerCase().replace(/[^a-z]/g, '');
  const consonants = normalized.split('').filter((ch) => !VOWELS.has(ch)).join('');
  if (!consonants) return null;
  return reduceNumber(sumLetterValues(consonants));
};

/** Số ngày sinh (Birth Day Number): rút gọn riêng ngày sinh trong tháng, giữ số chủ 11/22. */
export const calcBirthDayNumber = (birthDate: string): number | null => {
  const parsed = parseBirthDate(birthDate);
  if (!parsed) return null;
  return reduceNumber(parsed.day);
};

// ---------------------------------------------------------------------------
// Lưới Pythagoras (Pythagorean grid) — tần suất chữ số 1-9 trong ngày sinh.
// ---------------------------------------------------------------------------

export interface BirthDigitFrequency {
  /** Số lần xuất hiện của mỗi chữ số 1-9 trong toàn bộ ngày sinh (dd/mm/yyyy). */
  counts: Record<number, number>;
  /** Tổng số chữ số 1-9 đếm được (không tính số 0). */
  total: number;
}

/** Đếm tần suất các chữ số 1-9 xuất hiện trong ngày sinh đầy đủ, dùng làm dữ liệu cho lưới Pythagoras. */
export const calcBirthDigitFrequency = (birthDate: string): BirthDigitFrequency | null => {
  const parsed = parseBirthDate(birthDate);
  if (!parsed) return null;
  const digits = `${pad2(parsed.day)}${pad2(parsed.month)}${parsed.year}`.split('').map(Number);

  const counts: Record<number, number> = {};
  for (let d = 1; d <= 9; d++) counts[d] = 0;
  let total = 0;
  digits.forEach((d) => {
    if (d >= 1 && d <= 9) {
      counts[d] += 1;
      total += 1;
    }
  });

  return { counts, total };
};

export type GridLineKey =
  | 'row-mind'
  | 'row-emotion'
  | 'row-action'
  | 'col-will'
  | 'col-balance'
  | 'col-activity'
  | 'diag-determination'
  | 'diag-compassion';

export interface GridLineDef {
  key: GridLineKey;
  digits: [number, number, number];
}

/**
 * 8 đường của lưới Pythagoras (3 hàng, 3 cột, 2 đường chéo), theo cách sắp xếp lưới chuẩn:
 * ```
 * 3 6 9
 * 2 5 8
 * 1 4 7
 * ```
 */
export const GRID_LINES: GridLineDef[] = [
  { key: 'row-mind', digits: [3, 6, 9] },
  { key: 'row-emotion', digits: [2, 5, 8] },
  { key: 'row-action', digits: [1, 4, 7] },
  { key: 'col-will', digits: [1, 2, 3] },
  { key: 'col-balance', digits: [4, 5, 6] },
  { key: 'col-activity', digits: [7, 8, 9] },
  { key: 'diag-determination', digits: [1, 5, 9] },
  { key: 'diag-compassion', digits: [3, 5, 7] },
];

export type GridLineState = 'strength' | 'weakness' | 'neutral';

export interface GridLineResult {
  key: GridLineKey;
  digits: [number, number, number];
  /** 'strength' nếu đủ cả 3 chữ số, 'weakness' nếu thiếu cả 3, 'neutral' nếu chỉ có một phần. */
  state: GridLineState;
}

/** Xác định trạng thái từng đường trong lưới Pythagoras dựa trên tần suất chữ số đã đếm được. */
export const calcGridLines = (counts: Record<number, number>): GridLineResult[] =>
  GRID_LINES.map((line) => {
    const present = line.digits.map((d) => counts[d] ?? 0);
    const state: GridLineState = present.every((c) => c > 0)
      ? 'strength'
      : present.every((c) => c === 0)
        ? 'weakness'
        : 'neutral';
    return { ...line, state };
  });

// ---------------------------------------------------------------------------
// Chỉ số theo từng phần họ tên (Họ – Tên đệm – Tên).
// ---------------------------------------------------------------------------

export interface SplitVietnameseName {
  /** Họ — từ đầu tiên trong họ tên đầy đủ. */
  familyName: string;
  /** Tên đệm — các từ ở giữa, có thể rỗng nếu họ tên chỉ có 2 từ. */
  middleName: string;
  /** Tên — từ cuối cùng trong họ tên đầy đủ. */
  givenName: string;
}

/**
 * Tách họ tên đầy đủ theo đúng cấu trúc tiếng Việt (Họ – Tên đệm – Tên), khác thứ tự
 * First Name – Last Name của tiếng Anh: từ đầu tiên luôn là Họ, từ cuối cùng luôn là Tên,
 * phần còn lại ở giữa là Tên đệm.
 */
export const splitVietnameseName = (fullName: string): SplitVietnameseName | null => {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  if (words.length === 1) return { familyName: '', middleName: '', givenName: words[0] };
  return {
    familyName: words[0],
    middleName: words.slice(1, -1).join(' '),
    givenName: words[words.length - 1],
  };
};

const nameNumberFromPart = (part: string): number | null => {
  const normalized = stripDiacritics(part).toLowerCase().replace(/[^a-z]/g, '');
  if (!normalized) return null;
  return reduceNumber(sumLetterValues(normalized));
};

/** Số Họ: tính riêng từ phần Họ trong họ tên đầy đủ. */
export const calcFamilyNameNumber = (fullName: string): number | null => {
  const parts = splitVietnameseName(fullName);
  return parts ? nameNumberFromPart(parts.familyName) : null;
};

/** Số Tên đệm: tính riêng từ phần Tên đệm trong họ tên đầy đủ. */
export const calcMiddleNameNumber = (fullName: string): number | null => {
  const parts = splitVietnameseName(fullName);
  return parts ? nameNumberFromPart(parts.middleName) : null;
};

/** Số Tên: tính riêng từ phần Tên (từ cuối cùng) trong họ tên đầy đủ. */
export const calcGivenNameNumber = (fullName: string): number | null => {
  const parts = splitVietnameseName(fullName);
  return parts ? nameNumberFromPart(parts.givenName) : null;
};

// ---------------------------------------------------------------------------
// Ngũ hành (Kim / Mộc / Thủy / Hỏa / Thổ) — quy đổi từ ngày sinh.
// ---------------------------------------------------------------------------

export type FiveElement = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';

export const FIVE_ELEMENT_LABELS: Record<FiveElement, string> = {
  kim: 'Kim',
  moc: 'Mộc',
  thuy: 'Thủy',
  hoa: 'Hỏa',
  tho: 'Thổ',
};

/**
 * Quy đổi mỗi chữ số 0-9 sang một hành, theo cặp Sinh số – Thành số của Hà Đồ:
 * 1 & 6 → Thủy, 2 & 7 → Hỏa, 3 & 8 → Mộc, 4 & 9 → Kim, 5 & 0 → Thổ.
 */
const ELEMENT_BY_DIGIT: Record<number, FiveElement> = {
  1: 'thuy', 6: 'thuy',
  2: 'hoa', 7: 'hoa',
  3: 'moc', 8: 'moc',
  4: 'kim', 9: 'kim',
  5: 'tho', 0: 'tho',
};

export type FiveElementDistribution = Record<FiveElement, number>;

/**
 * Tính tỷ lệ % mỗi hành trong Ngũ hành dựa trên toàn bộ 8 chữ số của ngày sinh (dd/mm/yyyy).
 * Kết quả luôn làm tròn về số nguyên và có tổng đúng bằng 100.
 */
export const calcFiveElements = (birthDate: string): FiveElementDistribution | null => {
  const parsed = parseBirthDate(birthDate);
  if (!parsed) return null;
  const digits = `${pad2(parsed.day)}${pad2(parsed.month)}${parsed.year}`.split('').map(Number);

  const counts: Record<FiveElement, number> = { kim: 0, moc: 0, thuy: 0, hoa: 0, tho: 0 };
  digits.forEach((d) => {
    counts[ELEMENT_BY_DIGIT[d]] += 1;
  });

  const total = digits.length;
  const shares = (Object.keys(counts) as FiveElement[]).map((el) => {
    const exact = (counts[el] / total) * 100;
    return { el, floor: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });

  const result: FiveElementDistribution = { kim: 0, moc: 0, thuy: 0, hoa: 0, tho: 0 };
  shares.forEach((s) => {
    result[s.el] = s.floor;
  });

  // Làm tròn xuống có thể hụt vài điểm % — bù phần dư vào các hành có phần thập phân lớn nhất
  // để tổng luôn đúng 100.
  let remaining = 100 - shares.reduce((sum, s) => sum + s.floor, 0);
  const byRemainderDesc = [...shares].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < byRemainderDesc.length && remaining > 0; i++, remaining--) {
    result[byRemainderDesc[i].el] += 1;
  }

  return result;
};
