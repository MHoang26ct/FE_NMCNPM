import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SubmitSpinner } from "@/components/SubmitSpinner";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import {
  createAccount,
  formatCurrency,
  formatRegulationName,
  getRegulations,
  type SavingsRegulation,
} from "@/lib/savings";
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

function MoSoPage() {
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [cmnd, setCmnd] = useState("");
  const [maLTK, setMaLTK] = useState("");
  const [balance, setBalance] = useState("");
  const [regulations, setRegulations] = useState<SavingsRegulation[]>([]);
  const [loadingRegulations, setLoadingRegulations] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingRegulations(true);
      try {
        const data = await getRegulations();
        setRegulations(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Không tải được danh sách kỳ hạn.";
        toast.error(message);
      } finally {
        setLoadingRegulations(false);
      }
    };
    void load();
  }, []);

  const selectedRegulation = useMemo(
    () => regulations.find((r) => String(r.MaLTK) === maLTK) ?? null,
    [regulations, maLTK]
  );

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

  const balanceNumber = Number(balance);
  const isValid =
    customerName.trim() &&
    address.trim() &&
    cmnd.trim() &&
    selectedRegulation &&
    balanceNumber >= selectedRegulation.SoTienGuiToiThieu;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    setSubmitting(true);
  };

  const handleSpinnerDone = async () => {
    if (!selectedRegulation) return;

    try {
      const account = await createAccount({
        customerName: customerName.trim(),
        address: address.trim(),
        cmnd: cmnd.trim(),
        maLTK: selectedRegulation.MaLTK,
        balance: balanceNumber,
      });

      toast.success(`Mở sổ thành công! Mã sổ: ${account.MaSTK}`);
      setCustomerName("");
      setAddress("");
      setCmnd("");
      setMaLTK("");
      setBalance("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setSubmitting(false);
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
              <Select value={maLTK} onValueChange={setMaLTK} disabled={loadingRegulations}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingRegulations ? "Đang tải kỳ hạn..." : "Chọn loại tiết kiệm"} />
                </SelectTrigger>
                <SelectContent>
                  {regulations.map((regulation) => (
                    <SelectItem key={regulation.MaLTK} value={String(regulation.MaLTK)}>
                      {formatRegulationName(regulation)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRegulation && (
                <p className="text-xs text-muted-foreground">
                  Tối thiểu: {formatCurrency(selectedRegulation.SoTienGuiToiThieu)}
                </p>
              )}
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
                <p><strong>Loại tiết kiệm:</strong> {selectedRegulation ? formatRegulationName(selectedRegulation) : ""}</p>
                <p><strong>Số tiền gửi:</strong> {formatCurrency(balanceNumber || 0)}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SubmitSpinner open={submitting} onDone={() => void handleSpinnerDone()} />
    </div>
  );
}
