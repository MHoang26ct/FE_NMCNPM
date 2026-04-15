import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SubmitSpinner } from "@/components/SubmitSpinner";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { createAccount, formatCurrency, type SavingsType, SAVINGS_TYPE_LABELS } from "@/lib/savings";
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

export const Route = createFileRoute("/mo-so")({
  component: MoSoPage,
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

function MoSoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [cmnd, setCmnd] = useState("");
  const [savingsType, setSavingsType] = useState<SavingsType | "">("");
  const [balance, setBalance] = useState("");
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

  const isValid = customerName.trim() && address.trim() && cmnd.trim() && savingsType && Number(balance) > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    setSubmitting(true);
  };

  const handleSpinnerDone = () => {
    setSubmitting(false);
    const account = createAccount({
      customerName: customerName.trim(),
      address: address.trim(),
      cmnd: cmnd.trim(),
      savingsType: savingsType as SavingsType,
      balance: Number(balance),
    });
    toast.success(`Mở sổ thành công! Mã sổ: ${account.id}`);
    setCustomerName("");
    setAddress("");
    setCmnd("");
    setSavingsType("");
    setBalance("");
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
          <h1 className="text-2xl font-bold text-foreground mb-8">Mở sổ tiết kiệm</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="customerName">Tên khách hàng</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nhập tên khách hàng"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập địa chỉ"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cmnd">CMND</Label>
              <Input
                id="cmnd"
                value={cmnd}
                onChange={(e) => setCmnd(e.target.value)}
                placeholder="Nhập số CMND"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label>Loại tiết kiệm</Label>
              <Select value={savingsType} onValueChange={(v) => setSavingsType(v as SavingsType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại tiết kiệm" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SAVINGS_TYPE_LABELS) as SavingsType[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {SAVINGS_TYPE_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Số tiền gửi (VNĐ)</Label>
              <Input
                id="balance"
                type="number"
                min="1"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="Nhập số tiền gửi"
                autoComplete="off"
              />
            </div>
            <Button type="submit" disabled={!isValid} className="w-full mt-2">
              Mở sổ tiết kiệm
            </Button>
          </form>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận mở sổ tiết kiệm</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Khách hàng:</strong> {customerName}</p>
                <p><strong>Địa chỉ:</strong> {address}</p>
                <p><strong>CMND:</strong> {cmnd}</p>
                <p><strong>Loại tiết kiệm:</strong> {savingsType ? SAVINGS_TYPE_LABELS[savingsType as SavingsType] : ""}</p>
                <p><strong>Số tiền gửi:</strong> {formatCurrency(Number(balance) || 0)}</p>
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
