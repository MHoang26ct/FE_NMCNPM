import { useState, useRef, useEffect, type ReactNode } from "react";
import { User, LogOut, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { LoginDialog } from "@/components/LoginDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NavItem {
  label: string;
  dropdown?: { label: string; href: string }[];
}

function NavLink({ item }: { item: NavItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="cursor-pointer px-4 py-3 text-sm font-medium text-foreground transition-colors">
        {item.label}
      </span>
      {/* Underline pinned to the very bottom of the header */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[3px] bg-primary transition-opacity ${hovered ? "opacity-100" : "opacity-0"}`}
      />
      {/* Dropdown below the nav bar */}
      {item.dropdown && hovered && (
        <div className="absolute top-full left-0 pt-[3px] z-50">
          <div className="bg-card shadow-lg rounded border border-border min-w-[200px]">
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
        </div>
      )}
    </div>
  );
}

export function AppHeader({
  navItems,
  roleBadge,
}: {
  navItems?: NavItem[];
  roleBadge?: ReactNode;
}) {
  const { user, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleLogoutClick = () => {
    setPopoverOpen(false);
    setLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setLogoutConfirmOpen(false);
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 bg-card border-b border-border">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold text-primary tracking-tight py-3">
            CNPMBank
          </span>
          {navItems && (
            <nav className="flex items-end">
              {navItems.map((item) => (
                <NavLink key={item.label} item={item} />
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {roleBadge}
          {user ? (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className="p-2 rounded-full hover:bg-accent transition-colors"
                  title={user.username}
                >
                  <User className="w-5 h-5 text-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="px-2 py-1.5 text-sm font-medium text-foreground border-b border-border mb-1">
                  {user.username}
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center gap-2 w-full px-2 py-2 text-sm text-destructive hover:bg-accent rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </PopoverContent>
            </Popover>
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

      <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout}>
              Đăng xuất
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
