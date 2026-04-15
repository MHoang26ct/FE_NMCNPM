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

export const Route = createFileRoute("/thay-doi-quy-dinh")({
  component: ThayDoiQuyDinhPage,
});

const NAV_GIAMDOC = [
  {
    label: "LẬP BÁO CÁO",
    dropdown: [
      { label: "Báo cáo đóng/mở sổ tháng", href: "/bao-cao-thang" },
      { label: "Báo cáo doanh số hoạt động ngày", href: "/bao-cao-ngay" },
    ],
  },
  { label: "THAY ĐỔI QUY ĐỊNH", href: "/thay-doi-quy-dinh" },
];

export interface KyHan {
  id: string;
  loai: "co_ky_han" | "khong_ky_han"; 
  kyHanThang: number | null; 
  tenKyHan: string;           
  soTienGuiToiThieu: number;  
  soTienGuiBanDauToiThieu: number; 
  thoiGianGuiToiThieu: number; 
  laiSuat: number;             
}

let nextKyHanId = 4;
function genKyHanId() {
  return `KH${String(nextKyHanId++).padStart(3, "0")}`;
}

const initialKyHans: KyHan[] = [
  {
    id: "KH001",
    loai: "khong_ky_han",
    kyHanThang: null,
    tenKyHan: "Không kỳ hạn",
    soTienGuiToiThieu: 100_000,
    soTienGuiBanDauToiThieu: 500_000,
    thoiGianGuiToiThieu: 0,
    laiSuat: 0.5,
  },
  {
    id: "KH002",
    loai: "co_ky_han",
    kyHanThang: 3,
    tenKyHan: "3 tháng",
    soTienGuiToiThieu: 1_000_000,
    soTienGuiBanDauToiThieu: 5_000_000,
    thoiGianGuiToiThieu: 90,
    laiSuat: 5.0,
  },
  {
    id: "KH003",
    loai: "co_ky_han",
    kyHanThang: 6,
    tenKyHan: "6 tháng",
    soTienGuiToiThieu: 1_000_000,
    soTienGuiBanDauToiThieu: 5_000_000,
    thoiGianGuiToiThieu: 180,
    laiSuat: 5.5,
  },
];

function formatCurrencyShort(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

// ── Form State ───────────────────────────────────────────────────────────────────
interface FormState {
  loai: "co_ky_han" | "khong_ky_han";
  kyHanThang: string;
  tenKyHan: string;
  soTienGuiToiThieu: string;
  soTienGuiBanDauToiThieu: string;
  thoiGianGuiToiThieu: string;
  laiSuat: string;
}

const emptyForm: FormState = {
  loai: "co_ky_han",
  kyHanThang: "",
  tenKyHan: "",
  soTienGuiToiThieu: "",
  soTienGuiBanDauToiThieu: "",
  thoiGianGuiToiThieu: "",
  laiSuat: "",
};

function kyHanToFormState(k: KyHan): FormState {
  return {
    loai: k.loai,
    kyHanThang: k.loai === "co_ky_han" ? String(k.kyHanThang) : "",
    tenKyHan: k.tenKyHan,
    soTienGuiToiThieu: String(k.soTienGuiToiThieu),
    soTienGuiBanDauToiThieu: String(k.soTienGuiBanDauToiThieu),
    thoiGianGuiToiThieu: String(k.thoiGianGuiToiThieu),
    laiSuat: String(k.laiSuat),
  };
}

// Validate
function isFormValid(f: FormState): boolean {
  if (!f.tenKyHan.trim()) return false;
  if (Number(f.soTienGuiToiThieu) <= 0) return false;
  if (Number(f.soTienGuiBanDauToiThieu) <= 0) return false;
  if (Number(f.laiSuat) < 0 || f.laiSuat === "") return false;

  if (f.loai === "co_ky_han") {
    if (f.kyHanThang === "" || Number(f.kyHanThang) <= 0) return false;
  } else {
    if (f.thoiGianGuiToiThieu === "" || Number(f.thoiGianGuiToiThieu) < 0) return false;
  }
  return true;
}

// Table headers
const COLS = [
  { key: "tenKyHan", label: "Tên loại kỳ hạn", width: "15%" },
  { key: "loai", label: "Loại kỳ hạn", width: "13%" },
  { key: "kyHanThang", label: "Kỳ hạn\n(tháng)", width: "8%" },
  { key: "soTienGuiBanDauToiThieu", label: "Tiền gửi ban đầu tối thiểu", width: "16%" },
  { key: "soTienGuiToiThieu", label: "Tiền gửi tối thiểu", width: "14%" },
  { key: "thoiGianGuiToiThieu", label: "Thời gian gửi tối thiểu (ngày)", width: "12%" },
  { key: "laiSuat", label: "Lãi suất", width: "10%" },
];

export default function ThayDoiQuyDinhPage() {
  const { user } = useAuth();
  const [kyHans, setKyHans] = useState<KyHan[]>(initialKyHans);

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(emptyForm);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<KyHan | null>(null);

  // Edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState | null>(null);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);

  // Spinner
  const [spinnerAction, setSpinnerAction] = useState<"add" | "delete" | "edit" | null>(null);

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

  // ── Add ──
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid(addForm)) return;
    setSpinnerAction("add");
  };

  const handleAddSpinnerDone = () => {
    const newItem: KyHan = {
      id: genKyHanId(),
      loai: addForm.loai,
      kyHanThang: addForm.loai === "co_ky_han" ? Number(addForm.kyHanThang) : null,
      tenKyHan: addForm.tenKyHan.trim(),
      soTienGuiToiThieu: Number(addForm.soTienGuiToiThieu),
      soTienGuiBanDauToiThieu: Number(addForm.soTienGuiBanDauToiThieu),
      thoiGianGuiToiThieu: addForm.loai === "co_ky_han" ? Number(addForm.kyHanThang) * 30 : Number(addForm.thoiGianGuiToiThieu),
      laiSuat: Number(addForm.laiSuat),
    };
    setKyHans((prev) => [...prev, newItem]);
    setAddForm(emptyForm);
    setShowAdd(false);
    setSpinnerAction(null);
    toast.success(`Đã thêm kỳ hạn "${newItem.tenKyHan}" thành công!`);
  };

  // ── Delete ──
  const handleDeleteConfirm = () => {
    setDeleteTarget(null);
    setSpinnerAction("delete");
  };

  const handleDeleteSpinnerDone = () => {
    setKyHans((prev) => prev.filter((k) => k.id !== deleteTarget?.id));
    const name = deleteTarget?.tenKyHan ?? "";
    setDeleteTarget(null);
    setSpinnerAction(null);
    toast.success(`Đã xóa kỳ hạn "${name}" thành công!`);
  };

  // ── Edit ──
  const handleStartEdit = (k: KyHan) => {
    if (editId === k.id) {
      setEditId(null);
      setEditForm(null);
    } else {
      setEditId(k.id);
      setEditForm(kyHanToFormState(k));
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditForm(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !isFormValid(editForm)) return;
    setEditConfirmOpen(true);
  };

  const handleEditConfirm = () => {
    setEditConfirmOpen(false);
    setSpinnerAction("edit");
  };

  const handleEditSpinnerDone = () => {
    if (!editId || !editForm) { setSpinnerAction(null); return; }
    setKyHans((prev) =>
      prev.map((k) =>
        k.id === editId
          ? {
            ...k,
            loai: editForm.loai,
            kyHanThang: editForm.loai === "co_ky_han" ? Number(editForm.kyHanThang) : null,
            tenKyHan: editForm.tenKyHan.trim(),
            soTienGuiToiThieu: Number(editForm.soTienGuiToiThieu),
            soTienGuiBanDauToiThieu: Number(editForm.soTienGuiBanDauToiThieu),
            thoiGianGuiToiThieu: editForm.loai === "co_ky_han" ? Number(editForm.kyHanThang) * 30 : Number(editForm.thoiGianGuiToiThieu),
            laiSuat: Number(editForm.laiSuat),
          }
          : k
      )
    );
    toast.success(`Đã cập nhật kỳ hạn "${editForm.tenKyHan.trim()}" thành công!`);
    setEditId(null);
    setEditForm(null);
    setSpinnerAction(null);
  };

  // Spinner done dispatcher
  const handleSpinnerDone = () => {
    if (spinnerAction === "add") handleAddSpinnerDone();
    else if (spinnerAction === "delete") handleDeleteSpinnerDone();
    else if (spinnerAction === "edit") handleEditSpinnerDone();
  };

  // Helper for forms
  const renderFormFields = (
    form: FormState,
    setForm: React.Dispatch<React.SetStateAction<FormState>>,
    prefixId: string
  ) => {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${prefixId}-loai`}>Loại kỳ hạn</Label>
          <Select
            value={form.loai}
            onValueChange={(val) =>
              setForm((f) => ({ ...f, loai: val as "co_ky_han" | "khong_ky_han" }))
            }
          >
            <SelectTrigger id={`${prefixId}-loai`} className="bg-white">
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="co_ky_han">Có kỳ hạn</SelectItem>
              <SelectItem value="khong_ky_han">Không kỳ hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${prefixId}-ten`}>Tên loại kỳ hạn</Label>
          <Input
            id={`${prefixId}-ten`}
            placeholder="VD: Tiết kiệm 3 tháng..."
            value={form.tenKyHan}
            onChange={(e) => setForm((f) => ({ ...f, tenKyHan: e.target.value }))}
            autoComplete="off"
            className="bg-white"
          />
        </div>
        {form.loai === "co_ky_han" ? (
          <div className="space-y-1.5">
            <Label htmlFor={`${prefixId}-thang`}>Kỳ hạn (số tháng)</Label>
            <Input
              id={`${prefixId}-thang`}
              type="number"
              min="1"
              placeholder="VD: 3"
              value={form.kyHanThang}
              onChange={(e) => setForm((f) => ({ ...f, kyHanThang: e.target.value }))}
              className="bg-white"
            />
          </div>
        ) : (
          <div className="space-y-1.5 opacity-50 pointer-events-none">
            <Label>Kỳ hạn (số tháng)</Label>
            <Input placeholder="Không giới hạn" disabled className="bg-white" />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor={`${prefixId}-bdtt`}>Tiền gửi ban đầu tối thiểu</Label>
          <Input
            id={`${prefixId}-bdtt`}
            type="number"
            min="0"
            value={form.soTienGuiBanDauToiThieu}
            onChange={(e) => setForm((f) => ({ ...f, soTienGuiBanDauToiThieu: e.target.value }))}
            className="bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${prefixId}-tt`}>Tiền gửi tối thiểu</Label>
          <Input
            id={`${prefixId}-tt`}
            type="number"
            min="0"
            value={form.soTienGuiToiThieu}
            onChange={(e) => setForm((f) => ({ ...f, soTienGuiToiThieu: e.target.value }))}
            className="bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${prefixId}-tgt`}>Thời gian gửi tối thiểu (ngày)</Label>
          <Input
            id={`${prefixId}-tgt`}
            type={form.loai === "co_ky_han" ? "text" : "number"}
            min="0"
            value={
              form.loai === "co_ky_han"
                ? form.kyHanThang
                  ? Number(form.kyHanThang) * 30
                  : 0
                : form.thoiGianGuiToiThieu
            }
            onChange={(e) => setForm((f) => ({ ...f, thoiGianGuiToiThieu: e.target.value }))}
            disabled={form.loai === "co_ky_han"}
            className="bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${prefixId}-ls`}>Lãi suất (%/tháng)</Label>
          <Input
            id={`${prefixId}-ls`}
            type="number"
            min="0"
            step="0.01"
            value={form.laiSuat}
            onChange={(e) => setForm((f) => ({ ...f, laiSuat: e.target.value }))}
            className="bg-white"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader navItems={NAV_GIAMDOC} roleBadge={roleBadge} />

      <div className="flex flex-col px-8 py-6 gap-6">
        {/* Page header */}
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
            onClick={() => { setShowAdd((s) => !s); setAddForm(emptyForm); }}
            variant={showAdd ? "outline" : "default"}
            className="gap-2"
          >
            {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAdd ? "Đóng" : "Thêm kỳ hạn"}
          </Button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="bg-card border border-primary/30 rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Thêm kỳ hạn mới
            </h2>
            <form onSubmit={handleAddSubmit}>
              {renderFormFields(addForm, setAddForm, "add")}
              <div className="flex justify-end">
                <Button type="submit" disabled={!isFormValid(addForm)} className="gap-2 w-full lg:w-auto px-8">
                  <Plus className="w-4 h-4" />
                  Thêm kỳ hạn
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-auto">
          <table className="w-full text-sm border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 align-middle">
                {COLS.map((c) => (
                  <th
                    key={c.key}
                    className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-r border-border"
                    style={{ width: c.width, whiteSpace: "pre-wrap" }}
                  >
                    {c.label}
                  </th>
                ))}
                <th
                  className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center"
                  style={{ width: "12%" }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {kyHans.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    Chưa có kỳ hạn nào. Nhấn <strong>Thêm kỳ hạn</strong> để bắt đầu.
                  </td>
                </tr>
              )}
              {kyHans.map((k) => {
                const isEditing = editId === k.id;
                return (
                  <div key={k.id} className="contents">
                    <tr
                      className={`border-b border-border transition-colors ${isEditing ? "bg-primary/5" : "hover:bg-muted/30"
                        }`}
                    >
                      <td className="px-4 py-3 font-medium text-foreground border-r border-border text-center">{k.tenKyHan}</td>
                      <td className="px-4 py-3 text-foreground border-r border-border text-center">
                        {k.loai === "co_ky_han" ? "Có kỳ hạn" : "Không kỳ hạn"}
                      </td>
                      <td className="px-4 py-3 text-foreground border-r border-border text-center">
                        {k.loai === "co_ky_han" ? k.kyHanThang : "-"}
                      </td>
                      <td className="px-4 py-3 text-foreground border-r border-border text-right">{formatCurrencyShort(k.soTienGuiBanDauToiThieu)}</td>
                      <td className="px-4 py-3 text-foreground border-r border-border text-right">{formatCurrencyShort(k.soTienGuiToiThieu)}</td>
                      <td className="px-4 py-3 text-foreground border-r border-border text-center">{k.thoiGianGuiToiThieu} ngày</td>
                      <td className="px-4 py-3 text-foreground border-r border-border text-center">{k.laiSuat}%</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant={isEditing ? "default" : "outline"}
                            className="gap-1.5 h-8 text-xs"
                            onClick={() => handleStartEdit(k)}
                          >
                            <PenLine className="w-3.5 h-3.5" />
                            {isEditing ? "Hủy" : "Sửa"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                            onClick={() => setDeleteTarget(k)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline edit form */}
                    {isEditing && editForm && (
                      <tr className="bg-primary/5 border-b border-primary/20">
                        <td colSpan={8} className="px-4 py-4">
                          <form onSubmit={handleEditSubmit}>
                            <p className="text-xs font-semibold text-primary mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                              <PenLine className="w-3.5 h-3.5" />
                              Chỉnh sửa — {k.tenKyHan}
                            </p>
                            {renderFormFields(editForm, setEditForm as any, `edit-${k.id}`)}
                            <div className="flex gap-2">
                              <Button
                                type="submit"
                                disabled={!isFormValid(editForm)}
                                className="gap-2"
                              >
                                <Send className="w-4 h-4" />
                                Gửi yêu cầu sửa
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="gap-2"
                              >
                                <X className="w-4 h-4" />
                                Hủy sửa
                              </Button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </div>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa kỳ hạn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa kỳ hạn{" "}
              <strong>"{deleteTarget?.tenKyHan}"</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit confirm */}
      <AlertDialog open={editConfirmOpen} onOpenChange={setEditConfirmOpen}>
        <AlertDialogContent className="w-full max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận yêu cầu sửa</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 mt-4 text-sm text-foreground bg-muted p-4 rounded-lg">
                {editForm && (
                  <>
                    <p><strong>Loại:</strong> {editForm.loai === "co_ky_han" ? "Có kỳ hạn" : "Không kỳ hạn"}</p>
                    <p><strong>Tên loại kỳ hạn:</strong> {editForm.tenKyHan}</p>
                    {editForm.loai === "co_ky_han" && <p><strong>Kỳ hạn:</strong> {editForm.kyHanThang} tháng</p>}
                    <p><strong>Tiền gửi ban đầu tối thiểu:</strong> {Number(editForm.soTienGuiBanDauToiThieu).toLocaleString("vi-VN")} VNĐ</p>
                    <p><strong>Tiền gửi tối thiểu:</strong> {Number(editForm.soTienGuiToiThieu).toLocaleString("vi-VN")} VNĐ</p>
                    <p><strong>Thời gian gửi tối thiểu:</strong> {editForm.loai === "co_ky_han" ? Number(editForm.kyHanThang) * 30 : editForm.thoiGianGuiToiThieu} ngày</p>
                    <p><strong>Lãi suất:</strong> {editForm.laiSuat}%/tháng</p>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditConfirm}>Xác nhận gửi yêu cầu</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SubmitSpinner open={spinnerAction !== null} onDone={handleSpinnerDone} />
    </div>
  );
}
