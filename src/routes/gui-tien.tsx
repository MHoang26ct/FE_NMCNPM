import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SubmitSpinner } from "@/components/SubmitSpinner";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import {
  findAccountById,
  findAccountByCmnd,
  deposit,
  formatCurrency,
  SAVINGS_TYPE_LABELS,
  type SavingsAccount,
} from "@/lib/savings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, CheckCircle2 } from "lucide-react";
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
  const [searchResults, setSearchResults] = useState<SavingsAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | null>(null);
  const [searchError, setSearchError] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    setSearchResults([]);
    setSelectedAccount(null);
    setDepositAmount("");

    // Try exact ID first
    const byId = findAccountById(q.toUpperCase());
    if (byId) {
      setSelectedAccount(byId);
      return;
    }

    // Try by CMND — show full list
    const byCmnd = findAccountByCmnd(q);
    if (byCmnd.length === 1) {
      setSelectedAccount(byCmnd[0]);
      return;
    }
    if (byCmnd.length > 1) {
      setSearchResults(byCmnd);
      return;
    }

    setSearchError("Không tìm thấy sổ tiết kiệm với thông tin đã nhập.");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSelectAccount = (account: SavingsAccount) => {
    setSelectedAccount(account);
    setSearchResults([]);
    setDepositAmount("");
  };

  const isDepositValid = selectedAccount && Number(depositAmount) > 0;

  const handleDeposit = () => {
    if (!isDepositValid) return;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    setSubmitting(true);
  };

  const handleSpinnerDone = () => {
    if (!selectedAccount) return;
    setSubmitting(false);
    const updated = deposit(selectedAccount.id, Number(depositAmount));
    if (updated) {
      toast.success(`Gửi tiền thành công! Số dư mới: ${formatCurrency(updated.balance)}`);
      setSelectedAccount(updated);
      setDepositAmount("");
    } else {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
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
          <div className="space-y-2 mb-4">
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

          {/* Multiple results list */}
          {searchResults.length > 1 && (
            <div className="mb-6 rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground">
                Tìm thấy {searchResults.length} sổ — chọn một sổ để tiếp tục
              </div>
              <div className="divide-y divide-border">
                {searchResults.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-mono text-sm font-semibold text-foreground">{acc.id}</p>
                        <p className="text-xs text-muted-foreground">{SAVINGS_TYPE_LABELS[acc.savingsType]}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground">{acc.customerName}</p>
                        <p className="text-xs text-muted-foreground">Số dư: {formatCurrency(acc.balance)}</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected account — compact card */}
          {selectedAccount && (
            <div className="space-y-5">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-mono text-base font-bold text-foreground">{selectedAccount.id}</p>
                    <p className="text-sm text-muted-foreground">{selectedAccount.customerName} · {selectedAccount.cmnd}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {SAVINGS_TYPE_LABELS[selectedAccount.savingsType]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground">Số dư hiện tại</span>
                  <span className="font-semibold text-foreground text-base">{formatCurrency(selectedAccount.balance)}</span>
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
                <p><strong>Mã sổ:</strong> {selectedAccount?.id}</p>
                <p><strong>Khách hàng:</strong> {selectedAccount?.customerName}</p>
                <p><strong>Loại tiết kiệm:</strong> {selectedAccount ? SAVINGS_TYPE_LABELS[selectedAccount.savingsType] : ""}</p>
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

      <SubmitSpinner open={submitting} onDone={handleSpinnerDone} />
    </div>
  );
}
