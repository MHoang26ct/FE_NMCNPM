import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, UserRound, KeyRound, ShieldAlert } from "lucide-react";
import { SubmitSpinner } from "@/components/SubmitSpinner";
import { mapFeRoleToMaVaiTro, registerApi } from "@/lib/api";

export const Route = createFileRoute("/tao-tai-khoan")({
  component: TaoTaiKhoanPage,
});

const NAV_ADMIN = [
  { label: "TẠO TÀI KHOẢN", href: "/tao-tai-khoan" },
];

function TaoTaiKhoanPage() {
  const { user } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"nhanvien" | "giamdoc">("nhanvien");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleBadge = (
    <span className="text-base font-semibold px-4 py-1.5 rounded bg-red-600 text-white">
      ADMIN
    </span>
  );

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  const isValid = username.trim() !== "" && password.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
  };

  const handleDone = async () => {
    try {
      await registerApi({
        username: username.trim(),
        password: password.trim(),
        MaVaiTro: mapFeRoleToMaVaiTro(role),
      });
      toast.success(`Tạo tài khoản ${role === "giamdoc" ? "Giám đốc" : "Nhân viên"} "${username}" thành công!`);
      setUsername("");
      setPassword("");
      setRole("nhanvien");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tạo tài khoản thất bại.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader navItems={NAV_ADMIN} roleBadge={roleBadge} />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg border-t-4 border-t-red-600">
          <div className="p-6 border-b border-border bg-muted/20 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Tạo tài khoản mới</h1>
              <p className="text-sm text-muted-foreground">Khai báo tài khoản truy cập vào hệ thống ngân hàng</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-7 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="tk-username" className="flex items-center gap-2 font-medium">
                <UserRound className="w-4 h-4 text-muted-foreground" />
                Tên đăng nhập
              </Label>
              <Input
                id="tk-username"
                autoComplete="off"
                placeholder="Nhập tên đăng nhập..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tk-password" className="flex items-center gap-2 font-medium">
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                Mật khẩu
              </Label>
              <Input
                id="tk-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tk-role" className="flex items-center gap-2 font-medium">
                <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                Chức vụ
              </Label>
              <Select value={role} onValueChange={(v: "nhanvien" | "giamdoc") => setRole(v)}>
                <SelectTrigger id="tk-role" className="h-11">
                  <SelectValue placeholder="Chọn chức vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nhanvien">Nhân viên</SelectItem>
                  <SelectItem value="giamdoc">Giám đốc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={!isValid} className="w-full mt-2 h-11 gap-2 bg-red-600 hover:bg-red-700 text-white font-medium text-base">
              <UserPlus className="w-5 h-5" />
              Tạo tài khoản
            </Button>
          </form>
        </div>
      </div>
      
      <SubmitSpinner open={isSubmitting} onDone={() => void handleDone()} />
    </div>
  );
}
