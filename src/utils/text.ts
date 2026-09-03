/**
 * Rút gọn họ tên ở giữa khi vượt quá độ dài cho phép, giữ nguyên trọn vẹn họ
 * (từ đầu tiên) và tên (từ cuối cùng), chỉ cắt phần tên đệm ở giữa.
 * Ví dụ: truncateMiddle('Nguyễn Văn Đức Anh Minh', 15) -> 'Nguyễn ... Minh'.
 */
export const truncateMiddle = (fullName: string, maxLength = 20): string => {
  const trimmed = fullName.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= maxLength) return trimmed;

  const words = trimmed.split(' ');
  if (words.length <= 2) return trimmed;

  const first = words[0];
  const last = words[words.length - 1];
  return `${first} ... ${last}`;
};
