import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { LandingImageHolder } from "@/components/LandingImageHolder";

export const Route = createFileRoute("/")({
  component: Index,
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

const NAV_ADMIN = [
  { label: "TẠO TÀI KHOẢN", href: "/tao-tai-khoan" },
];

function RoleBadge({ label, variant }: { label: string; variant: "primary" | "destructive" | "dark" }) {
  const cls =
    variant === "destructive"
      ? "bg-red-600 text-white"
      : variant === "dark"
      ? "bg-neutral-900 text-amber-300 ring-1 ring-neutral-700"
      : "bg-primary text-primary-foreground";
  return (
    <span className={`text-base font-semibold px-4 py-1.5 rounded ${cls}`}>
      {label}
    </span>
  );
}

function Index() {
  const { user } = useAuth();

  let navItems;
  let roleBadge;

  if (user?.role === "nhanvien") {
    navItems = NAV_NHANVIEN;
    roleBadge = <RoleBadge label="NHÂN VIÊN" variant="primary" />;
  } else if (user?.role === "giamdoc") {
    navItems = NAV_GIAMDOC;
    roleBadge = <RoleBadge label="GIÁM ĐỐC" variant="dark" />;
  } else if (user?.role === "admin") {
    navItems = NAV_ADMIN;
    roleBadge = <RoleBadge label="ADMIN" variant="destructive" />;
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <AppHeader navItems={navItems} roleBadge={roleBadge} />
      <LandingImageHolder />
    </div>
  );
}
