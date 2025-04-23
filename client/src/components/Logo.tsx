import { Link } from 'wouter';

export function Logo() {
  return (
    <Link href="/">
      <div className="flex items-center space-x-2 cursor-pointer">
        <span className="text-pink-400 text-2xl font-bold">TR</span>
        <span className="text-white font-bold">LivSafe</span>
      </div>
    </Link>
  );
}
