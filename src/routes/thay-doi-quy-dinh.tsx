import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { Plus, Trash2, PenLine, Send, X, Settings2 } from "lucide-react";
import { SubmitSpinner } from "@/components/SubmitSpinner";
import {
  createRegulation,
  deleteRegulation,
  formatCurrency,
  formatInterestPercent,
  formatRegulationName,
  getRegulations,
  updateRegulation,
  type SavingsRegulation,
} from "@/lib/savings";

export const Route = createFileRoute("/thay-doi-quy-dinh")({
  component: ThayDoiQuyDinhPage,
});

const NAV_GIAMDOC = [
  { label: "THAY ĐỔI QUY ĐỊNH", href: "/thay-doi-quy-dinh" },
];

type FormState = {
  loai: "co_ky_han" | "khong_ky_han";
  kyHanThang: string;
  tenKyHan: string;
  soTienGuiToiThieu: string;
  thoiGianGuiToiThieu: string;
  laiSuatPercent: string;
};

const emptyForm: FormState = {
  loai: "co_ky_han",
  kyHanThang: "",
  tenKyHan: "",
  soTienGuiToiThieu: "",
  thoiGianGuiToiThieu: "",
  laiSuatPercent: "",
};

function regulationToForm(reg: SavingsRegulation): FormState {
  return {
    loai: reg.loai,
    kyHanThang: reg.loai === "co_ky_han" ? String(reg.KyHan) : "",
    tenKyHan: reg.TenLTK,
    soTienGuiToiThieu: String(reg.SoTienGuiToiThieu),
    thoiGianGuiToiThieu: String(reg.ThoiGianGuiToiThieu),
    laiSuatPercent: String(reg.LaiSuat * 100),
  };
}

function isFormValid(form: FormState): boolean {
  if (!form.tenKyHan.trim()) return false;
  if (Number(form.soTienGuiToiThieu) <= 0) return false;
  if (form.laiSuatPercent === "" || Number(form.laiSuatPercent) < 0) return false;
  if (form.loai === "co_ky_han") {
    return Number(form.kyHanThang) > 0;
  }
  return Number(form.thoiGianGuiToiThieu) >= 0;
}

function toPayload(form: FormState) {
  const isTerm = form.loai === "co_ky_han";
  const kyHan = isTerm ? Number(form.kyHanThang) : 0;
  return {
    loai: form.loai,
    KyHan: kyHan,
    TenLTK: form.tenKyHan.trim(),
    LaiSuat: Number(form.laiSuatPercent) / 100,
    SoTienGuiToiThieu: Number(form.soTienGuiToiThieu),
    ThoiGianGuiToiThieu: isTerm ? kyHan * 30 : Number(form.thoiGianGuiToiThieu || "0"),
  };
}

export default function ThayDoiQuyDinhPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<SavingsRegulation[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(emptyForm);

  const [editTarget, setEditTarget] = useState<SavingsRegulation | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState<SavingsRegulation | null>(null);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [spinnerAction, setSpinnerAction] = useState<"add" | "edit" | "delete" | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getRegulations();
        setItems(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Không tải được danh sách kỳ hạn.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.KyHan - b.KyHan || a.MaLTK - b.MaLTK),
    [items]
  );

  const roleBadge = (
    <span className="text-base font-semibold px-4 py-1.5 rounded bg-neutral-900 text-amber-300 ring-1 ring-neutral-700">
      GIÁM ĐỐC
    </span>
  );

  if (!user || user.role !== "giamdoc") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    if (!isFormValid(addForm)) return;
    setSpinnerAction("add");
  };

  const handleUpdate = () => {
    if (!editTarget || !isFormValid(editForm)) return;
    setEditConfirmOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setSpinnerAction("delete");
  };

  const handleSpinnerDone = async () => {
    try {
      if (spinnerAction === "add") {
        const created = await createRegulation(toPayload(addForm));
        setItems((prev) => [...prev, created]);
        setAddForm(emptyForm);
        setShowAdd(false);
        toast.success(`Đã thêm kỳ hạn "${created.TenLTK}" thành công!`);
      }

      if (spinnerAction === "edit" && editTarget) {
        const updated = await updateRegulation(editTarget.MaLTK, toPayload(editForm));
        setItems((prev) => prev.map((item) => (item.MaLTK === updated.MaLTK ? updated : item)));
        setEditTarget(null);
        setEditForm(emptyForm);
        toast.success(`Đã cập nhật kỳ hạn "${updated.TenLTK}" thành công!`);
      }

      if (spinnerAction === "delete" && deleteTarget) {
        await deleteRegulation(deleteTarget.MaLTK);
        setItems((prev) => prev.filter((item) => item.MaLTK !== deleteTarget.MaLTK));
        toast.success(`Đã xóa kỳ hạn "${deleteTarget.TenLTK}" thành công!`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Thao tác thất bại.";
      toast.error(message);
    } finally {
      setDeleteTarget(null);
      setSpinnerAction(null);
    }
  };

  const renderForm = (form: FormState, setForm: React.Dispatch<React.SetStateAction<FormState>>) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="space-y-1.5">
        <Label>Loại kỳ hạn</Label>
        <Select
          value={form.loai}
          onValueChange={(value) =>
            setForm((prev) => ({ ...prev, loai: value as "co_ky_han" | "khong_ky_han" }))
          }
        >
          <SelectTrigger className="bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="co_ky_han">Có kỳ hạn</SelectItem>
            <SelectItem value="khong_ky_han">Không kỳ hạn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Tên loại kỳ hạn</Label>
        <Input
          value={form.tenKyHan}
          onChange={(e) => setForm((prev) => ({ ...prev, tenKyHan: e.target.value }))}
          placeholder="VD: Tiết kiệm 3 tháng"
          className="bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Kỳ hạn (tháng)</Label>
        <Input
          type="number"
          min="0"
          value={form.loai === "co_ky_han" ? form.kyHanThang : "0"}
          onChange={(e) => setForm((prev) => ({ ...prev, kyHanThang: e.target.value }))}
          disabled={form.loai !== "co_ky_han"}
          className="bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Tiền gửi tối thiểu</Label>
        <Input
          type="number"
          min="0"
          value={form.soTienGuiToiThieu}
          onChange={(e) => setForm((prev) => ({ ...prev, soTienGuiToiThieu: e.target.value }))}
          className="bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Thời gian gửi tối thiểu (ngày)</Label>
        <Input
          type={form.loai === "co_ky_han" ? "text" : "number"}
          min="0"
          value={
            form.loai === "co_ky_han"
              ? (Number(form.kyHanThang || "0") * 30).toString()
              : form.thoiGianGuiToiThieu
          }
          onChange={(e) => setForm((prev) => ({ ...prev, thoiGianGuiToiThieu: e.target.value }))}
          disabled={form.loai === "co_ky_han"}
          className="bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Lãi suất (%/tháng)</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={form.laiSuatPercent}
          onChange={(e) => setForm((prev) => ({ ...prev, laiSuatPercent: e.target.value }))}
          className="bg-white"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader navItems={NAV_GIAMDOC} roleBadge={roleBadge} />

      <div className="flex flex-col px-8 py-6 gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Thay đổi quy định</h1>
              <p className="text-sm text-muted-foreground">Quản lý các loại kỳ hạn tiết kiệm</p>
            </div>
          </div>

          <Button
            onClick={() => {
              setShowAdd((value) => !value);
              setAddForm(emptyForm);
            }}
            variant={showAdd ? "outline" : "default"}
            className="gap-2"
          >
            {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAdd ? "Đóng" : "Thêm kỳ hạn"}
          </Button>
        </div>

        {showAdd && (
          <div className="bg-card border border-primary/30 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Thêm kỳ hạn mới
            </h2>
            {renderForm(addForm, setAddForm)}
            <div className="flex justify-end">
              <Button onClick={handleAdd} disabled={!isFormValid(addForm)} className="gap-2 w-full lg:w-auto px-8">
                <Plus className="w-4 h-4" />
                Thêm kỳ hạn
              </Button>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-auto">
          <table className="w-full text-sm border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-center">Tên loại kỳ hạn</th>
                <th className="px-4 py-3 text-center">Loại kỳ hạn</th>
                <th className="px-4 py-3 text-center">Kỳ hạn (tháng)</th>
                <th className="px-4 py-3 text-center">Tiền gửi tối thiểu</th>
                <th className="px-4 py-3 text-center">Thời gian gửi tối thiểu</th>
                <th className="px-4 py-3 text-center">Lãi suất</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">Đang tải dữ liệu...</td>
                </tr>
              )}
              {!loading && sortedItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">Chưa có kỳ hạn nào.</td>
                </tr>
              )}
              {!loading && sortedItems.map((item) => (
                <tr key={item.MaLTK} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-center">{item.TenLTK}</td>
                  <td className="px-4 py-3 text-center">{item.loai === "co_ky_han" ? "Có kỳ hạn" : "Không kỳ hạn"}</td>
                  <td className="px-4 py-3 text-center">{item.KyHan}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.SoTienGuiToiThieu)}</td>
                  <td className="px-4 py-3 text-center">{item.ThoiGianGuiToiThieu} ngày</td>
                  <td className="px-4 py-3 text-center">{formatInterestPercent(item.LaiSuat)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs"
                        onClick={() => {
                          setEditTarget(item);
                          setEditForm(regulationToForm(item));
                        }}
                      >
                        <PenLine className="w-3.5 h-3.5" />
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Chỉnh sửa kỳ hạn</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {renderForm(editForm, setEditForm)}
                <p className="text-xs text-muted-foreground">
                  Xem nhanh: {formatRegulationName({
                    loai: editForm.loai,
                    KyHan: editForm.loai === "co_ky_han" ? Number(editForm.kyHanThang || "0") : 0,
                    TenLTK: editForm.tenKyHan,
                  })}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditTarget(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdate}
              disabled={!isFormValid(editForm)}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Lưu thay đổi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={editConfirmOpen} onOpenChange={setEditConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận cập nhật kỳ hạn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn cập nhật kỳ hạn này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setEditConfirmOpen(false);
                setSpinnerAction("edit");
              }}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa kỳ hạn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa kỳ hạn{" "}
              <strong>{deleteTarget?.TenLTK}</strong> không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SubmitSpinner open={spinnerAction !== null} onDone={() => void handleSpinnerDone()} />
    </div>
  );
}
