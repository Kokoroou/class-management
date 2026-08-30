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
