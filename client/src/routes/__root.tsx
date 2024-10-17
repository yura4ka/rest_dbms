import { ModeToggle } from "@/components/mode-toggle";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="relative min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center gap-4">
          <nav className="flex flex-1 items-center gap-6">
            <Link to="/" className="font-bold">
              DBMS
            </Link>
            <Link
              to="/"
              className="text-sm text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Home
            </Link>
          </nav>
          <div>
            <ModeToggle />
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  ),
});
