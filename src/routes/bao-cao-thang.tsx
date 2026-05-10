import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Search, CalendarDays, Loader2, AlertCircle } from "lucide-react";
import { getMonthlyOpenCloseApi, type MonthlyOpenCloseReport } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/bao-cao-thang")({
  component: BaoCaoThangPage,
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

const MONTHS = [
  { value: "1", label: "Tháng 1" },
  { value: "2", label: "Tháng 2" },
  { value: "3", label: "Tháng 3" },
  { value: "4", label: "Tháng 4" },
  { value: "5", label: "Tháng 5" },
  { value: "6", label: "Tháng 6" },
  { value: "7", label: "Tháng 7" },
  { value: "8", label: "Tháng 8" },
  { value: "9", label: "Tháng 9" },
  { value: "10", label: "Tháng 10" },
  { value: "11", label: "Tháng 11" },
  { value: "12", label: "Tháng 12" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => ({
  value: String(y),
  label: String(y),
}));

function formatDateVN(dateStr: string): string {
  if (!dateStr) return "";
  const dateObj = new Date(dateStr);
  const d = String(dateObj.getDate()).padStart(2, "0");
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const y = dateObj.getFullYear();
  return `${d}/${m}/${y}`;
}

function BaoCaoThangPage() {
  const { user } = useAuth();

  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  const [data, setData] = useState<MonthlyOpenCloseReport[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportTitle, setReportTitle] = useState("");

  const roleBadge = (
    <span className="text-base font-semibold px-4 py-1.5 rounded bg-primary text-primary-foreground">
      NHÂN VIÊN
    </span>
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

  const handleLapBaoCao = async () => {
    setIsLoading(true);
    setError("");
    setData(null);
    setReportTitle(`Tháng ${month} năm ${year}`);

    try {
      const result = await getMonthlyOpenCloseApi(Number(month), Number(year));
      setData(result);
    } catch (err: any) {
      setError(err.message || "Lỗi khi lấy dữ liệu báo cáo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Nhóm data theo Loại Tiết Kiệm (MaLTK)
  const groupedData = useMemo(() => {
    if (!data) return {};
    return data.reduce((acc, curr) => {
      if (!acc[curr.MaLTK]) {
        acc[curr.MaLTK] = [];
      }
      acc[curr.MaLTK].push(curr);
      return acc;
    }, {} as Record<number, MonthlyOpenCloseReport[]>);
  }, [data]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader navItems={NAV_NHANVIEN} roleBadge={roleBadge} />

      <div className="flex flex-col mx-auto w-full max-w-4xl px-4 sm:px-8 py-6 gap-6">
        {/* Header card */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Báo cáo đóng/mở sổ tháng</h1>
            <p className="text-sm text-muted-foreground">Chọn tháng và năm để xem báo cáo</p>
          </div>
        </div>

        {/* Picker row */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="space-y-2 min-w-[140px]">
              <Label htmlFor="month-select">Tháng</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger id="month-select" className="w-[140px]">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 min-w-[120px]">
              <Label htmlFor="year-select">Năm</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id="year-select" className="w-[120px]">
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y.value} value={y.value}>
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleLapBaoCao} disabled={isLoading} className="gap-2 h-10">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Lập báo cáo
            </Button>
          </div>
        </div>

        {/* Data Area */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden w-full">
          {reportTitle && (
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Báo cáo đóng/mở sổ — {reportTitle}
              </span>
            </div>
          )}

          <div className="p-0">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p>Đang tải dữ liệu...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-destructive">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <p className="text-base font-medium">{error}</p>
              </div>
            )}

            {!isLoading && data && Object.keys(groupedData).length > 0 && (
              <div className="flex flex-col">
                {Object.entries(groupedData).map(([maLTK, records]) => (
                  <div key={maLTK} className="border-b border-border last:border-0 py-8 mb-2 last:mb-0">
                    <div className="w-fit mx-auto">
                      <div className="pb-3 px-1">
                        <h3 className="text-lg font-semibold text-primary">
                          Loại tiết kiệm: {records[0].TenLTK}
                        </h3>
                      </div>
                      <div className="overflow-x-auto pb-2">
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden w-fit">
                          <Table className="w-auto min-w-[700px] bg-background">
                            <TableHeader className="bg-muted">
                              <TableRow>
                                <TableHead className="w-[60px] text-center font-bold text-foreground">STT</TableHead>
                                <TableHead className="font-bold text-foreground">Ngày</TableHead>
                                <TableHead className="w-[140px] text-right font-bold text-foreground">Sổ mở</TableHead>
                                <TableHead className="w-[140px] text-right font-bold text-foreground">Sổ đóng</TableHead>
                                <TableHead className="w-[140px] text-right font-bold text-foreground">Chênh lệch</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {records.map((row, idx) => (
                                <TableRow key={idx} className="hover:bg-muted/50 border-b border-border last:border-0">
                                  <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                                  <TableCell className="font-medium whitespace-nowrap pr-8">{formatDateVN(row.Ngay)}</TableCell>
                                  <TableCell className="text-right text-green-600 font-semibold whitespace-nowrap">
                                    {row.SoSoMo}
                                  </TableCell>
                                  <TableCell className="text-right text-red-600 font-semibold whitespace-nowrap">
                                    {row.SoSoDong}
                                  </TableCell>
                                  <TableCell className="text-right font-bold text-primary whitespace-nowrap">
                                    {row.ChenhLech}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !data && !error && !reportTitle && (
              <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground py-24">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                  <FileText className="w-8 h-8 opacity-40" />
                </div>
                <p className="text-base font-medium">Chưa có báo cáo</p>
                <p className="text-sm">Chọn tháng, năm rồi nhấn <strong>Lập báo cáo</strong> để xem</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
