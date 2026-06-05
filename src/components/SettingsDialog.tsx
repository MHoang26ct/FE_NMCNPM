import { useState, useEffect, type FormEvent } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [url, setUrl] = useState("");
  const [defaultUrl, setDefaultUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("API_BASE_URL") ?? "";
      setUrl(stored);
      setDefaultUrl(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api");
    }
  }, [open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const trimmedUrl = url.trim();
      if (trimmedUrl) {
        localStorage.setItem("API_BASE_URL", trimmedUrl);
      } else {
        localStorage.removeItem("API_BASE_URL");
      }
      window.location.reload();
    }
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("API_BASE_URL");
      window.location.reload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-8 gap-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary">Cấu hình API Backend</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Nhập địa chỉ API/Ngrok tạm thời để demo đồ án. Trình duyệt sẽ lưu cấu hình này.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              URL Backend Tùy Chọn
            </label>
            <Input
              type="url"
              placeholder={`Mặc định: ${defaultUrl}`}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="bg-muted/30 p-3 rounded text-xs text-muted-foreground border border-border">
            <span className="font-semibold text-foreground">💡 Mẹo nhanh:</span> Bạn cũng có thể mở tab Console của trình duyệt và gõ lệnh sau để thay đổi nhanh:
            <code className="block mt-1 bg-muted p-1 rounded font-mono text-[11px] text-primary">
              window.__setBackendUrl("https://your-ngrok.ngrok-free.app/api")
            </code>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="text-xs"
            >
              Khôi phục mặc định
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Lưu & Tải lại trang
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
