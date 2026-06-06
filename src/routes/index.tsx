import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

import { LandingImageHolder } from "@/components/LandingImageHolder";
import { SettingsDialog } from "@/components/SettingsDialog";

export const Route = createFileRoute("/")({
  component: Index,
});

const NAV_NHANVIEN = [
  {
    label: "LẬP BÁO CÁO",
    dropdown: [
      { label: "Báo cáo đóng/mở sổ tháng", href: "/bao-cao-thang" },
      { label: "Báo cáo doanh số hoạt động ngày", href: "/bao-cao-ngay" },
    ],
  },
  { label: "MỞ SỔ", href: "/mo-so" },
  {
    label: "LẬP PHIẾU",
    dropdown: [
      { label: "Phiếu gửi tiền", href: "/gui-tien" },
      { label: "Phiếu rút tiền", href: "/rut-tien" },
    ],
  },
  { label: "TRA CỨU", href: "/tra-cuu" },
];

const NAV_GIAMDOC = [
  { label: "THAY ĐỔI QUY ĐỊNH", href: "/thay-doi-quy-dinh" },
];

const NAV_ADMIN = [
  { label: "TẠO TÀI KHOẢN", href: "/tao-tai-khoan" },
];

function RoleBadge({ label, variant }: { label: string; variant: "primary" | "destructive" | "dark" }) {
  const cls =
    variant === "destructive"
      ? "bg-red-600 text-white"
      : variant === "dark"
      ? "bg-neutral-900 text-amber-300 ring-1 ring-neutral-700"
      : "bg-primary text-primary-foreground";
  return (
    <span className={`text-base font-semibold px-4 py-1.5 rounded ${cls}`}>
      {label}
    </span>
  );
}

function Index() {
  const { user, login } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = await login(username, password);
    if (!ok) {
      setError("Tên đăng nhập hoặc mật khẩu không đúng");
    }
  };

  let navItems;
  let roleBadge;

  if (user?.role === "nhanvien") {
    navItems = NAV_NHANVIEN;
    roleBadge = <RoleBadge label="NHÂN VIÊN" variant="primary" />;
  } else if (user?.role === "giamdoc") {
    navItems = NAV_GIAMDOC;
    roleBadge = <RoleBadge label="GIÁM ĐỐC" variant="dark" />;
  } else if (user?.role === "admin") {
    navItems = NAV_ADMIN;
    roleBadge = <RoleBadge label="ADMIN" variant="destructive" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader navItems={navItems} roleBadge={roleBadge} hideLoginButton={!user} />
      
      {user ? (
        <LandingImageHolder />
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] bg-card border border-border shadow-lg rounded-xl overflow-hidden mt-[-10vh]">
            <div className="py-8 px-6 text-center border-b border-border bg-muted/20">
              <h2 className="text-3xl font-bold text-primary tracking-tight">CNPMBank</h2>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Ngân hàng chuyển đổi số bậc nhất VN</p>
              <div className="mt-4 inline-block bg-primary/10 text-primary px-3 py-1 text-xs font-bold tracking-wider uppercase rounded">Đăng nhập cổng quản lý</div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-4">
                <Input
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 bg-background"
                />
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 h-12 bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-destructive font-medium">{error}</p>}

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer group">
                  <Checkbox className="group-hover:border-primary transition-colors" />
                  <span className="group-hover:text-foreground transition-colors select-none">Nhớ mật khẩu</span>
                </label>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-7 py-2.5 rounded font-medium hover:opacity-90 transition-opacity"
                >
                  Đăng nhập
                </button>
              </div>
            </form>

            <div className="px-8 pb-6 text-center border-t border-border/50 pt-4 bg-muted/5">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors underline cursor-pointer"
              >
                Cấu hình API URL (ngrok) để demo
              </button>
            </div>
          </div>
        </div>
      )}

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
