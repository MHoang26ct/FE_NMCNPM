# CNPMBank - Hệ Thống Quản Lý Sổ Tiết Kiệm (Frontend)

Dự án này là mã nguồn Frontend của hệ thống **CNPMBank** — ứng dụng quản lý sổ tiết kiệm trực tuyến. Đây là đồ án thực hành môn **Nhập môn Công nghệ Phần mềm (NMCNPM)**, được xây dựng bằng những công nghệ web hiện đại nhất nhằm mang lại trải nghiệm mượt mà, giao diện tối giản, hiện đại và chuẩn hóa quy trình nghiệp vụ ngân hàng.

---

## 🌟 Tính Năng Chính Theo Phân Quyền (User Roles)

Hệ thống được thiết kế với các phân quyền người dùng rõ ràng, đáp ứng đầy đủ quy trình nghiệp vụ thực tế của một ngân hàng:

### 💼 1. Phân hệ Nhân viên (STAFF - `nhanvien`)
Giao diện dành riêng cho nhân viên thực hiện các nghiệp vụ giao dịch trực tiếp với khách hàng:
*   **Mở Sổ Tiết Kiệm (`/mo-so`)**: Hỗ trợ mở sổ tiết kiệm mới cho khách hàng với các trường thông tin: Họ tên, Chứng minh nhân dân (CMND), Địa chỉ, Loại tiết kiệm (Kỳ hạn/Không kỳ hạn) và Số tiền gửi ban đầu.
*   **Phiếu Gửi Tiền (`/gui-tien`)**: Thực hiện lập phiếu gửi thêm tiền vào sổ tiết kiệm đã có (chỉ áp dụng đối với sổ không kỳ hạn hoặc khi đến hạn).
*   **Phiếu Rút Tiền (`/rut-tien`)**: Thực hiện rút tiền từ sổ tiết kiệm (một phần hoặc toàn bộ số dư tùy thuộc vào loại kỳ hạn và quy định hiện hành).
*   **Tra Cứu Sổ Tiết Kiệm (`/tra-cuu`)**: Tìm kiếm danh sách sổ tiết kiệm nhanh chóng theo Mã sổ, Tên khách hàng hoặc số CMND.
*   **Báo Cáo Doanh Số Ngày (`/bao-cao-ngay`)**: Kết xuất báo cáo tổng doanh số giao dịch (Tổng thu, Tổng chi và chênh lệch) phân loại theo từng loại kỳ hạn trong ngày.
*   **Báo Cáo Đóng/Mở Tháng (`/bao-cao-thang`)**: Kết xuất báo cáo số lượng sổ tiết kiệm mở mới và đóng lại trong tháng.

### 👑 2. Phân hệ Giám đốc (CEO - `giamdoc`)
Giao diện dành cho ban giám đốc để cấu hình và vận hành hệ thống linh hoạt:
*   **Thay Đổi Quy Định (`/thay-doi-quy-dinh`)**: Cập nhật trực tiếp các tham số/quy định hệ thống như:
    *   Tạo/Sửa/Xóa các Loại tiết kiệm (Kỳ hạn, Lãi suất, Số tiền gửi tối thiểu).
    *   Cấu hình Số tiền gửi thêm tối thiểu.
    *   Cấu hình Thời gian gửi tối thiểu trước khi được rút.

### 🛠️ 3. Phân hệ Quản trị viên (ADMIN - `admin`)
Giao diện dành cho bộ phận kỹ thuật để quản lý vận hành:
*   **Tạo Tài Khoản (`/tao-tai-khoan`)**: Đăng ký tài khoản người dùng mới và phân quyền vai trò (Nhân viên, Giám đốc) để tham gia vận hành hệ thống.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

Dự án được xây dựng dựa trên những công nghệ frontend tiên tiến nhằm tối ưu hóa hiệu năng và trải nghiệm lập trình:

*   **Framework chính**: [React 19](https://react.dev/) & [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) (Framework full-stack mới của hệ sinh thái TanStack, tối ưu hóa Routing và Server Functions).
*   **Quản lý Routing**: [TanStack Router](https://tanstack.com/router) — Type-safe routing dành cho React.
*   **Data Fetching & Cache**: [TanStack Query (React Query) v5](https://tanstack.com/query) — Đồng bộ hóa dữ liệu trạng thái từ server.
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) — Bộ thư viện utility-first CSS tối tân với hiệu năng biên dịch cực nhanh.
*   **Giao Diện UI**: [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/) — Các thành phần UI không giao diện (headless) được tùy biến thẩm mỹ cao.
*   **Quản lý Form & Validation**: [React Hook Form](https://react-hook-form.com/) kết hợp với [Zod](https://zod.dev/) để xác thực dữ liệu chặt chẽ ở phía client.
*   **Build Tool & Dev Server**: [Vite](https://vite.dev/).
*   **Môi trường chạy / Deploy**: Cloudflare Pages / Workers thông qua [Wrangler](https://developers.cloudflare.com/workers/wrangler/).

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
FE_NMCNPM/
├── .tanstack/             # Thư mục cache và config của TanStack
├── public/                # Thư mục chứa các tài nguyên tĩnh công cộng
├── src/
│   ├── assets/            # Hình ảnh, icon tĩnh dùng trong ứng dụng
│   ├── components/        # Các Component dùng chung (UI, AuthProvider, Header...)
│   │   └── ui/            # Thành phần UI nguyên tử (button, input, dialog...) từ shadcn/ui
│   ├── hooks/             # Custom React Hooks sử dụng trong dự án
│   ├── lib/               # Cấu hình API client, hàm tiện ích, cấu hình xác thực (auth)
│   │   ├── api.ts         # Khai báo các API endpoints và kiểu dữ liệu (TypeScript Types)
│   │   ├── auth.ts        # Quản lý Context và State đăng nhập của người dùng
│   │   └── utils.ts       # Hàm bổ trợ chung
│   ├── routes/            # File-based routing (Định nghĩa các trang của ứng dụng)
│   │   ├── __root.tsx     # Layout chính toàn bộ ứng dụng (chứa Navbar và Toast notifications)
│   │   ├── index.tsx      # Trang đăng nhập & Trang chủ điều hướng vai trò
│   │   ├── mo-so.tsx      # Nghiệp vụ Mở Sổ Tiết Kiệm
│   │   ├── gui-tien.tsx   # Nghiệp vụ Lập Phiếu Gửi Tiền
│   │   ├── rut-tien.tsx   # Nghiệp vụ Lập Phiếu Rút Tiền
│   │   ├── tra-cuu.tsx    # Giao diện tra cứu thông tin sổ tiết kiệm
│   │   ├── bao-cao-ngay.tsx  # Báo cáo doanh số ngày
│   │   ├── bao-cao-thang.tsx # Báo cáo đóng/mở sổ tháng
│   │   └── thay-doi-quy-dinh.tsx # Thay đổi các loại kỳ hạn & quy định (Giám đốc)
│   ├── routeTree.gen.ts   # File tự động sinh bởi TanStack Router cho type-safety
│   ├── router.tsx         # Khởi tạo instance của TanStack Router
│   └── styles.css         # CSS gốc chứa cấu hình Tailwind CSS v4
├── wrangler.jsonc         # Cấu hình triển khai ứng dụng lên Cloudflare
├── tsconfig.json          # Cấu hình TypeScript
├── vite.config.ts         # Cấu hình Vite bundler
└── package.json           # Thông tin dependencies và scripts của dự án
```

---

## 🚀 Hướng Dẫn Cài Đặt và Chạy Local

Để chạy dự án ở môi trường local, hãy làm theo các bước sau:

### Yêu Cầu Hệ Thống
*   Đã cài đặt **Node.js** (Phiên bản v18 trở lên được khuyến nghị) hoặc **Bun** (phiên bản v1.0 trở lên).

### Bước 1: Sao chép dự án và cài đặt dependencies
Sử dụng một trong các lệnh dưới đây tùy thuộc vào trình quản lý gói của bạn:

```bash
# Nếu sử dụng npm
npm install

# Nếu sử dụng bun
bun install
```

### Bước 2: Thiết lập biến môi trường (Environment Variables)
Tạo file `.env.local` bằng cách sao chép từ file `.env.example`:

```bash
cp .env.example .env.local
```

Mở file `.env.local` vừa tạo và cập nhật đường dẫn URL của Backend API nếu cần thiết:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Bước 3: Chạy ứng dụng trong môi trường phát triển (Dev)
Khởi động Dev Server:

```bash
# Sử dụng npm
npm run dev

# Sử dụng bun
bun run dev
```

Sau khi khởi chạy thành công, mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000) (hoặc cổng hiển thị trên terminal).

### Bước 4: Kiểm tra lỗi cú pháp (Linting)
```bash
npm run lint
```

### Bước 5: Build và chạy thử bản Production tại local
Để build ứng dụng thành thư mục build sẵn tối ưu:
```bash
npm run build
```
Để chạy thử bản build vừa tạo:
```bash
npm run preview
```

---

## 🌐 Triển Khai (Deployment)

Dự án sử dụng Cloudflare Wrangler để triển khai nhanh lên **Cloudflare Pages/Workers**:

1.  Đăng nhập vào tài khoản Cloudflare của bạn qua terminal:
    ```bash
    npx wrangler login
    ```
2.  Tiến hành build dự án và đẩy trực tiếp lên Cloudflare:
    ```bash
    npx wrangler deploy
    ```
    *(Các thiết lập về runtime, compatibility date và entry point đã được cấu hình sẵn trong file [wrangler.jsonc](file:///Users/mhoang26ct/My%20Project/FE_NMCNPM/wrangler.jsonc)).*

---

## 👥 Thành Viên Thực Hiện
*   Đồ án thực hiện bởi nhóm sinh viên lớp Nhập môn Công nghệ Phần mềm.
*   **Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM (UIT)**.
