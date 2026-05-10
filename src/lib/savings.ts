import {
  createRegulationApi,
  createSavingsApi,
  deleteRegulationApi,
  depositApi,
  getRegulationsApi,
  searchSavingsApi,
  updateRegulationApi,
  withdrawApi,
  type SavingsAccount as ApiSavingsAccount,
  type SavingsRegulation,
} from "@/lib/api";

export type SavingsAccount = ApiSavingsAccount;
export type { SavingsRegulation };

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export function formatRegulationName(regulation: { loai: string; KyHan: number; TenLTK: string }) {
  if (regulation.loai === "khong_ky_han" || regulation.KyHan === 0) {
    return "Không kỳ hạn";
  }
  return `${regulation.KyHan} tháng`;
}

export function formatInterestPercent(rate: number): string {
  const percent = rate * 100;
  return `${percent.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}%`;
}

export async function getRegulations() {
  return getRegulationsApi();
}

export async function createRegulation(input: {
  loai: "co_ky_han" | "khong_ky_han";
  KyHan: number;
  TenLTK: string;
  LaiSuat: number;
  SoTienGuiToiThieu: number;
  ThoiGianGuiToiThieu: number;
}) {
  return createRegulationApi(input);
}

export async function updateRegulation(
  id: number,
  input: {
    loai: "co_ky_han" | "khong_ky_han";
    KyHan: number;
    TenLTK: string;
    LaiSuat: number;
    SoTienGuiToiThieu: number;
    ThoiGianGuiToiThieu: number;
  }
) {
  return updateRegulationApi(id, input);
}

export async function deleteRegulation(id: number) {
  await deleteRegulationApi(id);
}

export async function searchAccounts(query: { customerName?: string; cmnd?: string; maSTK?: number }) {
  return searchSavingsApi({
    tenKhachHang: query.customerName,
    cmnd: query.cmnd,
    maSTK: query.maSTK,
  });
}

export async function findAccountById(id: number) {
  const items = await searchSavingsApi({ maSTK: id });
  return items[0] ?? null;
}

export async function findAccountByCmnd(cmnd: string) {
  return searchSavingsApi({ cmnd });
}

export async function createAccount(data: {
  customerName: string;
  address: string;
  cmnd: string;
  maLTK: number;
  balance: number;
}) {
  return createSavingsApi({
    HoTen: data.customerName,
    DiaChi: data.address,
    CMND: data.cmnd,
    MaLTK: data.maLTK,
    SoTienGui: data.balance,
  });
}

async function getAccountByMaSTK(maSTK: number) {
  const found = await searchSavingsApi({ maSTK });
  return found[0] ?? null;
}

export async function deposit(maSTK: number, amount: number) {
  await depositApi(maSTK, amount);
  return getAccountByMaSTK(maSTK);
}

export async function withdraw(maSTK: number, amount: number) {
  await withdrawApi(maSTK, amount);
  return getAccountByMaSTK(maSTK);
}
