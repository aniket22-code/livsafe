import { Link } from 'wouter';

export function Logo() {
  return (
    <Link href="/">
      <a className="flex items-center space-x-2">
        <span className="text-pink-400 text-2xl font-bold">TR</span>
        <span className="text-white font-bold">Team Rocket</span>
      </a>
    </Link>
  );
}
