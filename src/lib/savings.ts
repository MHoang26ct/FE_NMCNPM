export type SavingsType = "3thang" | "6thang" | "khongkyhan";

export const SAVINGS_TYPE_LABELS: Record<SavingsType, string> = {
  "3thang": "3 tháng",
  "6thang": "6 tháng",
  "khongkyhan": "Không kỳ hạn",
};

export interface SavingsAccount {
  id: string;
  customerName: string;
  address: string;
  cmnd: string;
  savingsType: SavingsType;
  balance: number;
  openDate: string;
}

let nextId = 10;

function generateId(): string {
  return `STK${String(nextId++).padStart(5, "0")}`;
}

// 9 sample records: 3 customers × 3 savings types
const initialAccounts: SavingsAccount[] = [
  {
    id: "STK00001",
    customerName: "Nguyễn Văn An",
    address: "123 Lê Lợi, Q.1, TP.HCM",
    cmnd: "079200001234",
    savingsType: "3thang",
    balance: 50_000_000,
    openDate: "2025-01-15",
  },
  {
    id: "STK00002",
    customerName: "Nguyễn Văn An",
    address: "123 Lê Lợi, Q.1, TP.HCM",
    cmnd: "079200001234",
    savingsType: "6thang",
    balance: 100_000_000,
    openDate: "2025-02-10",
  },
  {
    id: "STK00003",
    customerName: "Nguyễn Văn An",
    address: "123 Lê Lợi, Q.1, TP.HCM",
    cmnd: "079200001234",
    savingsType: "khongkyhan",
    balance: 20_000_000,
    openDate: "2025-03-05",
  },
  {
    id: "STK00004",
    customerName: "Trần Thị Bình",
    address: "456 Nguyễn Huệ, Q.3, TP.HCM",
    cmnd: "079200005678",
    savingsType: "3thang",
    balance: 80_000_000,
    openDate: "2025-01-20",
  },
  {
    id: "STK00005",
    customerName: "Trần Thị Bình",
    address: "456 Nguyễn Huệ, Q.3, TP.HCM",
    cmnd: "079200005678",
    savingsType: "6thang",
    balance: 200_000_000,
    openDate: "2025-04-01",
  },
  {
    id: "STK00006",
    customerName: "Trần Thị Bình",
    address: "456 Nguyễn Huệ, Q.3, TP.HCM",
    cmnd: "079200005678",
    savingsType: "khongkyhan",
    balance: 35_000_000,
    openDate: "2025-03-15",
  },
  {
    id: "STK00007",
    customerName: "Lê Hoàng Cường",
    address: "789 Võ Văn Tần, Q.10, TP.HCM",
    cmnd: "079200009012",
    savingsType: "3thang",
    balance: 150_000_000,
    openDate: "2025-02-28",
  },
  {
    id: "STK00008",
    customerName: "Lê Hoàng Cường",
    address: "789 Võ Văn Tần, Q.10, TP.HCM",
    cmnd: "079200009012",
    savingsType: "6thang",
    balance: 300_000_000,
    openDate: "2025-01-05",
  },
  {
    id: "STK00009",
    customerName: "Lê Hoàng Cường",
    address: "789 Võ Văn Tần, Q.10, TP.HCM",
    cmnd: "079200009012",
    savingsType: "khongkyhan",
    balance: 45_000_000,
    openDate: "2025-04-10",
  },
];

// In-memory store
let accounts: SavingsAccount[] = [...initialAccounts];

export function getAllAccounts(): SavingsAccount[] {
  return [...accounts];
}

export function findAccountById(id: string): SavingsAccount | undefined {
  return accounts.find((a) => a.id === id);
}

export function findAccountByCmnd(cmnd: string): SavingsAccount[] {
  return accounts.filter((a) => a.cmnd === cmnd);
}

export function searchAccounts(query: { customerName?: string; cmnd?: string }): SavingsAccount[] {
  return accounts.filter((a) => {
    const matchName = !query.customerName || a.customerName.toLowerCase().includes(query.customerName.toLowerCase());
    const matchCmnd = !query.cmnd || a.cmnd.includes(query.cmnd);
    return matchName && matchCmnd;
  });
}

export function createAccount(data: Omit<SavingsAccount, "id" | "openDate">): SavingsAccount {
  const account: SavingsAccount = {
    ...data,
    id: generateId(),
    openDate: new Date().toISOString().split("T")[0],
  };
  accounts = [...accounts, account];
  return account;
}

export function deposit(accountId: string, amount: number): SavingsAccount | null {
  const idx = accounts.findIndex((a) => a.id === accountId);
  if (idx === -1) return null;
  accounts[idx] = { ...accounts[idx], balance: accounts[idx].balance + amount };
  return accounts[idx];
}

export function withdraw(accountId: string, amount: number): SavingsAccount | null {
  const idx = accounts.findIndex((a) => a.id === accountId);
  if (idx === -1 || accounts[idx].balance < amount) return null;
  accounts[idx] = { ...accounts[idx], balance: accounts[idx].balance - amount };
  return accounts[idx];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}
