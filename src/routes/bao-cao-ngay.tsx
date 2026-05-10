import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Search, BarChart2, Loader2, AlertCircle } from "lucide-react";
import { getDailyRevenueApi, type DailyRevenueReport } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/bao-cao-ngay")({
  component: BaoCaoNgayPage,
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

function formatDateVN(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

function BaoCaoNgayPage() {
  const { user } = useAuth();

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [reportDate, setReportDate] = useState("");

  const [data, setData] = useState<DailyRevenueReport[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
    if (!date) return;
    setReportDate(date);
    setIsLoading(true);
    setError("");
    setData(null);

    try {
      const result = await getDailyRevenueApi(date);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Lỗi khi lấy dữ liệu báo cáo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader navItems={NAV_NHANVIEN} roleBadge={roleBadge} />

      <div className="flex flex-col mx-auto w-full max-w-4xl px-4 sm:px-8 py-6 gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Báo cáo doanh số hoạt động ngày</h1>
            <p className="text-sm text-muted-foreground">Chọn ngày để xem báo cáo doanh số</p>
          </div>
        </div>

        {/* Picker row */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="space-y-2">
              <Label htmlFor="date-input">Ngày lập báo cáo</Label>
              <Input
                id="date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={todayStr}
                className="w-[200px]"
              />
            </div>

            <Button onClick={handleLapBaoCao} disabled={!date || isLoading} className="gap-2 h-10">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Lập báo cáo
            </Button>
          </div>
        </div>

        {/* Data Area */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden w-full">
          {/* Always show header if reportDate is set or empty state if not */}
          {reportDate ? (
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Báo cáo doanh số hoạt động ngày — {formatDateVN(reportDate)}
              </span>
            </div>
          ) : null}

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

            {!isLoading && data && data.length > 0 && (
              <div className="overflow-x-auto p-6 flex justify-center">
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden w-fit">
                  <Table className="w-auto min-w-[700px] bg-background">
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead className="w-[60px] text-center font-bold text-foreground">STT</TableHead>
                        <TableHead className="font-bold text-foreground">Loại tiết kiệm</TableHead>
                        <TableHead className="w-[140px] text-right font-bold text-foreground">Tổng thu</TableHead>
                        <TableHead className="w-[140px] text-right font-bold text-foreground">Tổng chi</TableHead>
                        <TableHead className="w-[140px] text-right font-bold text-foreground">Chênh lệch</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row, idx) => (
                        <TableRow key={row.MaLTK} className="hover:bg-muted/50 border-b border-border last:border-0">
                          <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                          <TableCell className="font-medium whitespace-nowrap pr-8">{row.TenLTK}</TableCell>
                          <TableCell className="text-right text-green-600 font-semibold whitespace-nowrap">
                            {formatCurrency(row.TongThu)}
                          </TableCell>
                          <TableCell className="text-right text-red-600 font-semibold whitespace-nowrap">
                            {formatCurrency(row.TongChi)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary whitespace-nowrap">
                            {formatCurrency(row.ChenhLech)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {!isLoading && !data && !error && !reportDate && (
              <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground py-24">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                  <FileText className="w-8 h-8 opacity-40" />
                </div>
                <p className="text-base font-medium">Chưa có báo cáo</p>
                <p className="text-sm">Chọn ngày rồi nhấn <strong>Lập báo cáo</strong> để xem</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
