import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { FileText, Search, CalendarDays } from "lucide-react";
import testPdf from "@/assets/test.pdf";

export const Route = createFileRoute("/bao-cao-thang")({
  component: BaoCaoThangPage,
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

function BaoCaoThangPage() {
  const { user } = useAuth();

  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [showPdf, setShowPdf] = useState(false);
  const [pdfKey, setPdfKey] = useState(0);

  const roleBadge = (
    <span className="text-base font-semibold px-4 py-1.5 rounded bg-neutral-900 text-amber-300 ring-1 ring-neutral-700">
      GIÁM ĐỐC
    </span>
  );

  if (!user || user.role !== "giamdoc") {
    return (
      <div className="h-screen bg-background flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  const handleLapBaoCao = () => {
    setPdfKey((k) => k + 1);
    setShowPdf(true);
  };

  const monthLabel = MONTHS.find((m) => m.value === month)?.label ?? "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader navItems={NAV_GIAMDOC} roleBadge={roleBadge} />

      <div className="flex flex-col px-8 py-6 gap-6">
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

            <Button onClick={handleLapBaoCao} className="gap-2 h-10">
              <Search className="w-4 h-4" />
              Lập báo cáo
            </Button>
          </div>
        </div>

        {/* PDF preview area */}
        {showPdf ? (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mx-auto w-full" style={{ maxWidth: 1150 }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Báo cáo đóng/mở sổ — {monthLabel} năm {year}
              </span>
            </div>
            <iframe
              key={pdfKey}
              src={`${testPdf}#toolbar=1&navpanes=0`}
              style={{ width: 1150, height: 1100, display: 'block', border: 'none' }}
              title="Báo cáo đóng/mở sổ tháng"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground py-24 bg-card border border-border rounded-xl shadow-sm">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <FileText className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-base font-medium">Chưa có báo cáo</p>
            <p className="text-sm">Chọn tháng, năm rồi nhấn <strong>Lập báo cáo</strong> để xem</p>
          </div>
        )}
      </div>
    </div>
  );
}
