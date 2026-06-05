const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    // Expose a helper to easily set/clear backend URL in console
    (window as any).__setBackendUrl = (url?: string) => {
      if (url) {
        localStorage.setItem("API_BASE_URL", url);
        console.log(`Đã cập nhật Base URL sang: ${url}. Đang tải lại trang...`);
      } else {
        localStorage.removeItem("API_BASE_URL");
        console.log("Đã xóa Base URL tùy chỉnh, quay lại mặc định. Đang tải lại trang...");
      }
      window.location.reload();
    };

    return localStorage.getItem("API_BASE_URL") ?? import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";
  }
  return import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";
};

export const API_BASE_URL = getApiBaseUrl();

const ACCESS_TOKEN_KEY = "cnpmbank_access_token";
const USER_KEY = "cnpmbank_user";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function readToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // noop
  }
}

export function saveStoredSession(accessToken: string, user: UserProfile) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (options.auth !== false) {
    const token = readToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), { ...init, headers });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message ?? "Có lỗi xảy ra")
        : "Có lỗi xảy ra";
    throw new ApiError(message, response.status);
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    const envelope = payload as ApiEnvelope<T>;
    if (!envelope.success) {
      throw new ApiError(envelope.message ?? "Yêu cầu thất bại", response.status);
    }
    return envelope.data;
  }

  return payload as T;
}

export type ApiRole = "ADMIN" | "CEO" | "STAFF";
export type FeRole = "admin" | "giamdoc" | "nhanvien";

export type ApiUser = {
  MaNguoiDung: number;
  TenDangNhap: string;
  MaVaiTro: number;
  TenVaiTro: ApiRole;
  MaKH: number | null;
};

export type UserProfile = {
  maNguoiDung: number;
  username: string;
  maVaiTro: number;
  tenVaiTro: ApiRole;
  maKH: number | null;
  role: FeRole;
};

export function mapApiRoleToFeRole(role: ApiRole): FeRole {
  if (role === "ADMIN") return "admin";
  if (role === "CEO") return "giamdoc";
  return "nhanvien";
}

export function mapFeRoleToMaVaiTro(role: Exclude<FeRole, "admin">): number {
  return role === "giamdoc" ? 2 : 3;
}

export function toUserProfile(apiUser: ApiUser): UserProfile {
  return {
    maNguoiDung: apiUser.MaNguoiDung,
    username: apiUser.TenDangNhap,
    maVaiTro: apiUser.MaVaiTro,
    tenVaiTro: apiUser.TenVaiTro,
    maKH: apiUser.MaKH,
    role: mapApiRoleToFeRole(apiUser.TenVaiTro),
  };
}

type LoginResponse = {
  accessToken: string;
  tokenType: string;
  user: ApiUser;
};

export async function loginApi(username: string, password: string) {
  return apiRequest<LoginResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    { auth: false }
  );
}

export async function logoutApi() {
  return apiRequest<{ message?: string }>("/auth/logout", { method: "POST" });
}

export async function meApi() {
  return apiRequest<ApiUser>("/auth/me");
}

export async function registerApi(input: {
  username: string;
  password: string;
  MaVaiTro: number;
}) {
  return apiRequest<{ MaNguoiDung: number }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export type SavingsRegulation = {
  MaLTK: number;
  loai: "co_ky_han" | "khong_ky_han";
  KyHan: number;
  TenLTK: string;
  LaiSuat: number;
  SoTienGuiToiThieu: number;
  ThoiGianGuiToiThieu: number;
  SoTienGuiThemToiThieu?: number;
};

type RegulationPayload = {
  loai: "co_ky_han" | "khong_ky_han";
  KyHan: number;
  TenLTK: string;
  LaiSuat: number;
  SoTienGuiToiThieu: number;
  ThoiGianGuiToiThieu: number;
  SoTienGuiThemToiThieu?: number;
};

export async function getRegulationsApi() {
  return apiRequest<SavingsRegulation[]>("/regulations");
}

export async function createRegulationApi(payload: RegulationPayload) {
  return apiRequest<SavingsRegulation>("/regulations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRegulationApi(id: number, payload: RegulationPayload) {
  return apiRequest<SavingsRegulation>(`/regulations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteRegulationApi(id: number) {
  return apiRequest<{ message?: string }>(`/regulations/${id}`, {
    method: "DELETE",
  });
}

export type SavingsAccount = {
  MaSTK: number;
  MaKH: number;
  MaLTK: number;
  HoTen: string;
  CMND: string;
  DiaChi?: string;
  TenLTK: string;
  loai: "co_ky_han" | "khong_ky_han";
  KyHan: number;
  LaiSuat: number;
  SoDu: number;
  NgayMoSo: string;
};

export async function searchSavingsApi(query: {
  maSTK?: number;
  tenKhachHang?: string;
  cmnd?: string;
}) {
  const params = new URLSearchParams();
  if (query.maSTK) params.set("maSTK", String(query.maSTK));
  if (query.tenKhachHang) params.set("tenKhachHang", query.tenKhachHang);
  if (query.cmnd) params.set("cmnd", query.cmnd);
  return apiRequest<SavingsAccount[]>(`/savings/search?${params.toString()}`);
}

export async function createSavingsApi(payload: {
  HoTen: string;
  DiaChi: string;
  CMND: string;
  MaLTK: number;
  SoTienGui: number;
}) {
  return apiRequest<SavingsAccount>("/savings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function depositApi(maSTK: number, SoTienGui: number) {
  return apiRequest<{ MaSTK: number; SoTienGui: number; SoDu: number }>(
    `/savings/${maSTK}/deposits`,
    {
      method: "POST",
      body: JSON.stringify({ SoTienGui }),
    }
  );
}

export async function withdrawApi(maSTK: number, SoTienRut: number) {
  return apiRequest<{ MaSTK: number; SoTienRut: number; SoDu: number }>(
    `/savings/${maSTK}/withdrawals`,
    {
      method: "POST",
      body: JSON.stringify({ SoTienRut }),
    }
  );
}

export type DailyRevenueReport = {
  MaLTK: number;
  TenLTK: string;
  TongThu: number;
  TongChi: number;
  ChenhLech: number;
};

export async function getDailyRevenueApi(date: string) {
  return apiRequest<DailyRevenueReport[]>(`/reports/daily-revenue?date=${date}`);
}

export type MonthlyOpenCloseReport = {
  MaLTK: number;
  TenLTK: string;
  Ngay: string;
  SoSoMo: number;
  SoSoDong: number;
  ChenhLech: number;
};

export async function getMonthlyOpenCloseApi(month: number, year: number) {
  return apiRequest<MonthlyOpenCloseReport[]>(`/reports/monthly-open-close?month=${month}&year=${year}`);
}
