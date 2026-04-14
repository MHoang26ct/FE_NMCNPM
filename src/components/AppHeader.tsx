import { useState, type ReactNode } from "react";
import { User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { LoginDialog } from "@/components/LoginDialog";

interface NavItem {
  label: string;
  dropdown?: { label: string; href: string }[];
}

function NavLink({ item }: { item: NavItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="cursor-pointer px-4 py-2 text-sm font-medium text-foreground border-b-2 border-transparent hover:border-primary transition-colors">
        {item.label}
      </span>
      {item.dropdown && hovered && (
        <div className="absolute top-full left-0 mt-1 bg-card shadow-lg rounded border border-border min-w-[200px] z-50">
          {item.dropdown.map((sub) => (
            <a
              key={sub.label}
              href={sub.href}
              className="block px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
            >
              {sub.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppHeader({ navItems, roleBadge }: { navItems?: NavItem[]; roleBadge?: ReactNode }) {
  const { user, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold text-primary tracking-tight">CNPMBank</span>
          {navItems && (
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink key={item.label} item={item} />
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {roleBadge}
          {user ? (
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-accent transition-colors"
              title="Đăng xuất"
            >
              <User className="w-5 h-5 text-foreground" />
            </button>
          ) : (
            <button
              onClick={() => setLoginOpen(true)}
              className="p-2 rounded-full hover:bg-accent transition-colors"
              title="Đăng nhập"
            >
              <User className="w-5 h-5 text-foreground" />
            </button>
          )}
        </div>
      </header>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
