# Quy Định và Hướng Dẫn Lập Trình (Coding Guidelines & Conventions)

Tài liệu này định nghĩa các quy chuẩn coding, cấu trúc dự án và quy trình làm việc dành cho các lập trình viên tham gia phát triển dự án **CNPMBank**. Việc tuân thủ tài liệu này giúp mã nguồn đồng nhất, dễ đọc, dễ bảo trì và giảm thiểu lỗi trong quá trình tích hợp.

---

## 📌 1. Quy Tắc Đặt Tên (Naming Conventions)

### 📂 Thư mục và File
*   **Routes (Trang/Định tuyến)**: Sử dụng kiểu **kebab-case** và trùng tên với URL định tuyến (ví dụ: `mo-so.tsx`, `bao-cao-ngay.tsx`).
*   **React Components**: Sử dụng kiểu **PascalCase** cho tên file và tên component (ví dụ: `AppHeader.tsx`, `LandingImageHolder.tsx`).
*   **Hàm tiện ích & File Logic**: Sử dụng kiểu **camelCase** (ví dụ: `auth.ts`, `api.ts`, `utils.ts`).

### 💻 Biến, Hàm và Hằng số
*   **Biến & Hàm**: Sử dụng kiểu **camelCase** (ví dụ: `showPassword`, `handleSubmit()`, `isLoading`).
*   **Hằng số (Constants)**: Sử dụng kiểu **UPPER_SNAKE_CASE** (ví dụ: `API_BASE_URL`, `ACCESS_TOKEN_KEY`).
*   **Component & Type/Interface**: Sử dụng kiểu **PascalCase** (ví dụ: `AuthContext`, `SavingsAccount`, `UserProfile`).

### 🔌 Tương thích API (API Mappings)
Do cơ sở dữ liệu và API backend có thể sử dụng định dạng **PascalCase** (ví dụ: `MaSTK`, `HoTen`, `LaiSuat`), khi làm việc với API:
*   Giữ nguyên định dạng gốc từ API đối với các API Request Payload và API Response (được khai báo rõ ràng trong Types ở `src/lib/api.ts`).
*   Khuyến khích chuyển đổi sang **camelCase** đối với các biến local trong component nếu cần thiết để đảm bảo tính đồng nhất của Javascript.

---

## ⚛️ 2. Quy Chuẩn React & TypeScript

### 🛡️ TypeScript an toàn (Type Safety)
*   **Không sử dụng `any`**: Sử dụng kiểu dữ liệu rõ ràng. Nếu dữ liệu chưa xác định, dùng `unknown` thay vì `any`.
*   Định nghĩa đầy đủ `interface` hoặc `type` cho props của React Component.
*   Tận dụng tính năng type-safe routing của **TanStack Router** thông qua component `<Link>` và hook `useNavigate` thay vì dùng thẻ `<a>` thông thường.

### 🧩 Thiết kế Component
*   **Chia nhỏ component**: Tách các thành phần UI phức tạp thành các component con nhỏ hơn và độc lập để tái sử dụng.
*   **Không code cứng (No hardcoding)**: Đưa các chuỗi ký tự cố định (như phân quyền, nhãn điều hướng) vào hằng số như `NAV_NHANVIEN`, `NAV_GIAMDOC` để dễ quản lý.
*   **Giao diện UI nguyên tử (Atomic UI)**: Khi thêm mới các control (Button, Input, Select, Dialog...), hãy sử dụng/mở rộng các component đã có sẵn trong `src/components/ui/` (được xây dựng trên nền Radix UI & shadcn).

---

## 🎨 3. Quy Chuẩn Styling (Tailwind CSS v4)

*   **Sử dụng Utility Classes**: Áp dụng trực tiếp các class của Tailwind CSS thay vì viết CSS tùy biến (custom CSS) trong file riêng.
*   **Tận dụng biến CSS của Tailwind v4**: Tailwind CSS v4 sử dụng biến CSS nội bộ (ví dụ: `var(--color-primary)`). Sử dụng các màu sắc hệ thống như `bg-primary`, `text-primary-foreground`, `bg-card`, `border-border` để hỗ trợ đồng bộ giao diện.
*   **Ghép class có điều kiện**: Sử dụng hàm tiện ích `cn` (import từ `src/lib/utils.ts`) khi cần kết hợp các class Tailwind dựa trên điều kiện:
    ```tsx
    import { cn } from "@/lib/utils";

    function Badge({ active }: { active: boolean }) {
      return (
        <span className={cn(
          "px-2 py-1 rounded text-xs font-semibold",
          active ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-800"
        )}>
          Trạng thái
        </span>
      );
    }
    ```

---

## 🔄 4. Quản Lý Trạng Thái và Gọi API (State & API Management)

*   **Gọi API**: Mọi logic gọi API phải được định nghĩa trong `src/lib/api.ts` (không viết lệnh `fetch` trực tiếp trong component).
*   **Tương tác bất đồng bộ**: Sử dụng **TanStack Query** (React Query) để quản lý state bất đồng bộ, cache dữ liệu và thực hiện các mutation (thêm, sửa, xóa).
    *   Sử dụng `useQuery` cho việc lấy dữ liệu (GET).
    *   Sử dụng `useMutation` cho việc thay đổi dữ liệu (POST, PUT, DELETE) kèm theo callback `onSuccess` để invalidate query (làm tươi dữ liệu tự động).
*   **Quản lý Form**: Sử dụng `react-hook-form` phối hợp với `zod` để thực hiện validation ở client trước khi gửi dữ liệu lên server. Luôn hiển thị thông điệp lỗi rõ ràng cho người dùng.
*   **Thông báo (Notifications)**: Sử dụng thư viện `sonner` (`toast.success()`, `toast.error()`) để thông báo kết quả giao dịch/thao tác cho người dùng.

---

## 🌿 5. Quy Trình Git & Commit Messages

Để lịch sử Git sạch và dễ tra cứu, dự án áp dụng chuẩn **Conventional Commits**:

### Cú pháp
```text
<type>(<scope>): <description>
```

### Các phân loại `type` chính:
*   `feat`: Thêm tính năng mới (ví dụ: `feat(mo-so): tích hợp API mở sổ tiết kiệm`).
*   `fix`: Sửa lỗi/bug (ví dụ: `fix(auth): sửa lỗi không lưu token sau khi refresh trang`).
*   `docs`: Cập nhật tài liệu (ví dụ: `docs: bổ sung coding guideline cho dự án`).
*   `style`: Các thay đổi không ảnh hưởng đến logic code (CSS, format code bằng Prettier, v.v...).
*   `refactor`: Tái cấu trúc mã nguồn nhưng không thay đổi tính năng.
*   `chore`: Cập nhật công cụ build, cấu hình package, dependencies (ví dụ: `chore: nâng cấp thư viện sonner`).

---

## 🔍 6. Quy Trình Kiểm Tra Code (Linting & Formatting)

*   Trước khi tạo Pull Request, lập trình viên bắt buộc phải chạy trình kiểm tra lỗi tĩnh để đảm bảo code sạch và không vi phạm quy tắc:
    ```bash
    npm run lint
    # hoặc
    bun run lint
    ```
*   Tự động sửa các lỗi format bằng cách cài đặt extension **Prettier** trên code editor (như VS Code) và cấu hình "Format on Save".
