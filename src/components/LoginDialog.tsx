import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = login(username, password);
    if (ok) {
      onOpenChange(false);
      setUsername("");
      setPassword("");
      setShowPassword(false);
    } else {
      setError("Tên đăng nhập hoặc mật khẩu không đúng");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-8 gap-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary">CNPMBank</h2>
          <p className="text-sm text-muted-foreground">
            Ngân hàng chuyển đổi số bậc nhất Việt Nam
          </p>
          <p className="mt-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Cổng quản lý sổ tiết kiệm
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <Checkbox />
              <span>Nhớ mật khẩu</span>
            </label>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Đăng nhập
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
