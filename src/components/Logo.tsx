import { GraduationCap } from 'lucide-react';

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="bg-blue-600 rounded flex items-center justify-center text-white shrink-0"
      style={{ width: size, height: size }}
    >
      <GraduationCap size={size * 0.6} />
    </div>
  );
}
