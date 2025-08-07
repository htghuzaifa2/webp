import { Image as ImageIcon } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            WebpImage<span className="text-primary">Optim</span>
          </h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
