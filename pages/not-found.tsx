import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-6xl font-bold text-primary/30">404</p>
        <p className="text-xl font-semibold text-white">Page not found</p>
        <Link href="/">
          <a className="text-primary hover:text-primary/80 text-sm underline">Back to gallery</a>
        </Link>
      </div>
    </div>
  );
}
