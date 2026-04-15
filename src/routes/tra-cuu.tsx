import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { searchAccounts, formatCurrency, SAVINGS_TYPE_LABELS, type SavingsAccount } from "@/lib/savings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/tra-cuu")({
  component: TraCuuPage,
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

function TraCuuPage() {
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState("");
  const [cmnd, setCmnd] = useState("");
  const [results, setResults] = useState<SavingsAccount[] | null>(null);

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
    const name = customerName.trim();
    const id = cmnd.trim();
    if (!name && !id) return;
    const found = searchAccounts({
      customerName: name || undefined,
      cmnd: id || undefined,
    });
    setResults(found);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const roleBadge = (
    <span className="text-base font-semibold px-4 py-1.5 rounded bg-primary text-primary-foreground">
      NHÂN VIÊN
    </span>
  );

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <AppHeader navItems={NAV_NHANVIEN} roleBadge={roleBadge} />
      <div className="flex-1 flex flex-col items-center py-10 px-4 overflow-auto">
        <div className="w-full max-w-3xl">
          <h1 className="text-2xl font-bold text-foreground mb-8">Tra cứu sổ tiết kiệm</h1>

          {/* Search filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="searchName">Tên khách hàng</Label>
              <Input
                id="searchName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tên khách hàng"
                autoComplete="off"
                list=""
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="searchCmnd">CMND</Label>
              <Input
                id="searchCmnd"
                value={cmnd}
                onChange={(e) => setCmnd(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập số CMND"
                autoComplete="off"
                list=""
              />
            </div>
          </div>

          <Button onClick={handleSearch} className="mb-6">
            <Search className="w-4 h-4 mr-2" />
            Tra cứu
          </Button>

          {/* Results */}
          {results !== null && (
            results.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Không tìm thấy kết quả phù hợp.</p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Mã sổ</TableHead>
                      <TableHead className="font-semibold">Loại tiết kiệm</TableHead>
                      <TableHead className="font-semibold">Khách hàng</TableHead>
                      <TableHead className="font-semibold text-right">Số dư</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-mono">{account.id}</TableCell>
                        <TableCell>{SAVINGS_TYPE_LABELS[account.savingsType]}</TableCell>
                        <TableCell>{account.customerName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
