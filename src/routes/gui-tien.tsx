import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { findAccountById, findAccountByCmnd, deposit, formatCurrency, SAVINGS_TYPE_LABELS, type SavingsAccount } from "@/lib/savings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
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
import { toast } from "sonner";

export const Route = createFileRoute("/gui-tien")({
  component: GuiTienPage,
});

const NAV_NHANVIEN = [
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

function GuiTienPage() {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [foundAccount, setFoundAccount] = useState<SavingsAccount | null>(null);
  const [searchError, setSearchError] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!user || user.role !== "nhanvien") {
    return (
      <div className="h-screen bg-background flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearchError("");
    setFoundAccount(null);
    setDepositAmount("");

    // Try by ID first
    const byId = findAccountById(q.toUpperCase());
    if (byId) {
      setFoundAccount(byId);
      return;
    }

    // Try by CMND — return first match, user picks from deposit page
    const byCmnd = findAccountByCmnd(q);
    if (byCmnd.length === 1) {
      setFoundAccount(byCmnd[0]);
      return;
    }
    if (byCmnd.length > 1) {
      // Show multiple results — for simplicity pick first, but ideally show list
      setFoundAccount(byCmnd[0]);
      return;
    }

    setSearchError("Không tìm thấy sổ tiết kiệm với thông tin đã nhập.");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const isDepositValid = foundAccount && Number(depositAmount) > 0;

  const handleDeposit = () => {
    if (!isDepositValid) return;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!foundAccount) return;
    const updated = deposit(foundAccount.id, Number(depositAmount));
    if (updated) {
      toast.success(`Gửi tiền thành công! Số dư mới: ${formatCurrency(updated.balance)}`);
      setFoundAccount(updated);
      setDepositAmount("");
    } else {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
    setConfirmOpen(false);
  };

  const roleBadge = (
    <span className="text-base font-semibold px-4 py-1.5 rounded bg-primary text-primary-foreground">
      NHÂN VIÊN
    </span>
  );

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <AppHeader navItems={NAV_NHANVIEN} roleBadge={roleBadge} />
      <div className="flex-1 flex items-start justify-center py-10 px-4 overflow-auto">
        <div className="w-full max-w-xl">
          <h1 className="text-2xl font-bold text-foreground mb-8">Lập phiếu gửi tiền</h1>

          {/* Search */}
          <div className="space-y-2 mb-6">
            <Label>Tìm sổ tiết kiệm (Mã sổ / CMND)</Label>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập mã sổ tiết kiệm hoặc CMND"
                autoComplete="off"
                list=""
              />
              <Button type="button" variant="outline" onClick={handleSearch} className="shrink-0">
                <Search className="w-4 h-4 mr-2" />
                Tìm
              </Button>
            </div>
            {searchError && <p className="text-sm text-destructive">{searchError}</p>}
          </div>

          {/* Account info */}
          {foundAccount && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                <h2 className="text-lg font-semibold text-foreground mb-2">Thông tin sổ tiết kiệm</h2>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <span className="text-muted-foreground">Mã sổ:</span>
                  <span className="font-medium text-foreground">{foundAccount.id}</span>
                  <span className="text-muted-foreground">Loại tiết kiệm:</span>
                  <span className="font-medium text-foreground">{SAVINGS_TYPE_LABELS[foundAccount.savingsType]}</span>
                  <span className="text-muted-foreground">Khách hàng:</span>
                  <span className="font-medium text-foreground">{foundAccount.customerName}</span>
                  <span className="text-muted-foreground">Số dư hiện tại:</span>
                  <span className="font-medium text-foreground">{formatCurrency(foundAccount.balance)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositAmount">Số tiền gửi (VNĐ)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Nhập số tiền muốn gửi"
                  autoComplete="off"
                />
              </div>

              <Button onClick={handleDeposit} disabled={!isDepositValid} className="w-full">
                Xác nhận gửi tiền
              </Button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận gửi tiền</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Mã sổ:</strong> {foundAccount?.id}</p>
                <p><strong>Khách hàng:</strong> {foundAccount?.customerName}</p>
                <p><strong>Loại tiết kiệm:</strong> {foundAccount ? SAVINGS_TYPE_LABELS[foundAccount.savingsType] : ""}</p>
                <p><strong>Số tiền gửi:</strong> {formatCurrency(Number(depositAmount) || 0)}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
