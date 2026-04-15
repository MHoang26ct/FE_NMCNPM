import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Search, BarChart2 } from "lucide-react";
import testPdf from "@/assets/test.pdf";

export const Route = createFileRoute("/bao-cao-ngay")({
  component: BaoCaoNgayPage,
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

function formatDateVN(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function BaoCaoNgayPage() {
  const { user } = useAuth();

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfKey, setPdfKey] = useState(0);
  const [reportDate, setReportDate] = useState("");

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
    if (!date) return;
    setReportDate(date);
    setPdfKey((k) => k + 1);
    setShowPdf(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader navItems={NAV_GIAMDOC} roleBadge={roleBadge} />

      <div className="flex flex-col px-8 py-6 gap-6">
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

            <Button onClick={handleLapBaoCao} disabled={!date} className="gap-2 h-10">
              <Search className="w-4 h-4" />
              Lập báo cáo
            </Button>
          </div>
        </div>

        {/* PDF preview */}
        {showPdf ? (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mx-auto w-full" style={{ maxWidth: 1150 }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Báo cáo doanh số hoạt động ngày — {formatDateVN(reportDate)}
              </span>
            </div>
            <iframe
              key={pdfKey}
              src={`${testPdf}#toolbar=1&navpanes=0`}
              style={{ width: 1150, height: 1100, display: 'block', border: 'none' }}
              title="Báo cáo doanh số hoạt động ngày"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground py-24 bg-card border border-border rounded-xl shadow-sm">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <FileText className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-base font-medium">Chưa có báo cáo</p>
            <p className="text-sm">Chọn ngày rồi nhấn <strong>Lập báo cáo</strong> để xem</p>
          </div>
        )}
      </div>
    </div>
  );
}
