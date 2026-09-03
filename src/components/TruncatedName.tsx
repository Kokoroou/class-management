import { truncateMiddle } from '../utils/text';

interface TruncatedNameProps {
  name: string;
  maxLength?: number;
  className?: string;
  onDoubleClick?: () => void;
}

/** Hiển thị tên đã rút gọn ở giữa khi quá dài, kèm tooltip tên đầy đủ khi hover. */
export default function TruncatedName({ name, maxLength = 20, className = '', onDoubleClick }: TruncatedNameProps) {
  return (
    <span className={`truncate ${className}`.trim()} title={name} onDoubleClick={onDoubleClick}>
      {truncateMiddle(name, maxLength)}
    </span>
  );
}
