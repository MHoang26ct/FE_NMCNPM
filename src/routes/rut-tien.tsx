import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { findAccountById, findAccountByCmnd, withdraw, formatCurrency, SAVINGS_TYPE_LABELS, type SavingsAccount } from "@/lib/savings";
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

export const Route = createFileRoute("/rut-tien")({
  component: RutTienPage,
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

function RutTienPage() {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [foundAccount, setFoundAccount] = useState<SavingsAccount | null>(null);
  const [searchError, setSearchError] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
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

  const isFixedTerm = foundAccount && foundAccount.savingsType !== "khongkyhan";
  const actualWithdrawAmount = isFixedTerm ? foundAccount!.balance : Number(withdrawAmount);
  const isWithdrawValid = foundAccount && actualWithdrawAmount > 0 && actualWithdrawAmount <= foundAccount.balance;

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearchError("");
    setFoundAccount(null);
    setWithdrawAmount("");

    const byId = findAccountById(q.toUpperCase());
    if (byId) {
      setFoundAccount(byId);
      if (byId.savingsType !== "khongkyhan") {
        setWithdrawAmount(String(byId.balance));
      }
      return;
    }

    const byCmnd = findAccountByCmnd(q);
    if (byCmnd.length >= 1) {
      setFoundAccount(byCmnd[0]);
      if (byCmnd[0].savingsType !== "khongkyhan") {
        setWithdrawAmount(String(byCmnd[0].balance));
      }
      return;
    }

    setSearchError("Không tìm thấy sổ tiết kiệm với thông tin đã nhập.");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleWithdraw = () => {
    if (!isWithdrawValid) return;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!foundAccount) return;
    const updated = withdraw(foundAccount.id, actualWithdrawAmount);
    if (updated) {
      toast.success(`Rút tiền thành công! Số dư còn lại: ${formatCurrency(updated.balance)}`);
      setFoundAccount(updated);
      setWithdrawAmount("");
      if (isFixedTerm) {
        // After full withdrawal of fixed-term, reset search
        setFoundAccount(null);
        setSearchQuery("");
      }
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
          <h1 className="text-2xl font-bold text-foreground mb-8">Lập phiếu rút tiền</h1>

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
                <Label htmlFor="withdrawAmount">Số tiền rút (VNĐ)</Label>
                {isFixedTerm ? (
                  <div className="space-y-1">
                    <Input
                      id="withdrawAmount"
                      type="text"
                      value={formatCurrency(foundAccount.balance)}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Sổ tiết kiệm có kỳ hạn — bắt buộc rút toàn bộ số dư.
                    </p>
                  </div>
                ) : (
                  <Input
                    id="withdrawAmount"
                    type="number"
                    min="1"
                    max={foundAccount.balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Nhập số tiền muốn rút"
                    autoComplete="off"
                  />
                )}
              </div>

              <Button onClick={handleWithdraw} disabled={!isWithdrawValid} className="w-full">
                Xác nhận rút tiền
              </Button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận rút tiền</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Mã sổ:</strong> {foundAccount?.id}</p>
                <p><strong>Khách hàng:</strong> {foundAccount?.customerName}</p>
                <p><strong>Loại tiết kiệm:</strong> {foundAccount ? SAVINGS_TYPE_LABELS[foundAccount.savingsType] : ""}</p>
                <p><strong>Số tiền rút:</strong> {formatCurrency(actualWithdrawAmount || 0)}</p>
                {isFixedTerm && (
                  <p className="text-destructive font-medium mt-1">⚠ Rút toàn bộ số dư (kỳ hạn)</p>
                )}
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
