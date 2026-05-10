# Bao cao doi chieu API va Frontend

## 1. Tong quan

Tai lieu nay doi chieu cac man hinh hien co trong frontend
`FE_NMCNPM` voi dac ta API tai:

`/Users/mhoang26ct/My Project/QLSTK/API.md`

Ket luan chung: bo API hien tai gan du de thuc hien cac nghiep vu
chinh cua frontend, gom dang nhap, tao tai khoan, mo so, gui tien, rut
tien, tra cuu, bao cao va thay doi quy dinh. Tuy nhien van co mot so
diem can lam ro truoc khi tich hop that: lech phan quyen, lech truong du
lieu, va mot vai API chua duoc frontend hien tai su dung truc tiep.

Luu y hien trang frontend: ung dung dang dung mock authentication trong
`src/lib/auth.ts`, du lieu so tiet kiem in-memory trong `src/lib/savings.ts`,
va file PDF mau cho cac man hinh bao cao.

## 2. Bang doi chieu chuc nang

| Chuc nang frontend | Man hinh | API tuong ung | Trang thai | Ghi chu |
| --- | --- | --- | --- | --- |
| Dang nhap | `/` va `LoginDialog` | `POST /api/auth/login` | Du | API tra token va thong tin user. Frontend hien dang login bang mock user, chua luu `accessToken`. |
| Tao tai khoan | `/tao-tai-khoan` | `POST /api/auth/register` | Lech nhe | Frontend chi nhap username, password va chon `nhanvien`/`giamdoc`; API yeu cau `MaVaiTro` va co truong `MaKH`. Can mapping role frontend sang `MaVaiTro`. |
| Mo so tiet kiem | `/mo-so` | `POST /api/savings`, `GET /api/regulations` | Du nhung can tich hop | API ho tro tao khach hang neu CMND chua ton tai va mo so. Frontend hien dung danh sach loai tiet kiem hard-code, nen can lay loai tiet kiem tu `GET /api/regulations`. |
| Lap phieu gui tien | `/gui-tien` | `GET /api/savings/search`, `POST /api/savings/:maSTK/deposits` | Du | API phu hop luong tim so theo ma so/CMND va gui tien. Frontend hien cap nhat so du in-memory. |
| Lap phieu rut tien | `/rut-tien` | `GET /api/savings/search`, `POST /api/savings/:maSTK/withdrawals` | Du | API phu hop luong tim so va rut tien. Quy tac rut toan bo voi so co ky han hien dang xu ly o frontend; can xac nhan backend cung validate. |
| Tra cuu so tiet kiem | `/tra-cuu` | `GET /api/savings/search` | Du | API ho tro `maSTK`, `tenKhachHang`, `cmnd`. Frontend hien tra cuu theo ten va CMND trong in-memory store. |
| Bao cao doanh so ngay | `/bao-cao-ngay` | `GET /api/reports/daily-revenue` | Lech quyen va output | Frontend dat chuc nang cho `giamdoc`, nhung API ghi Auth la `STAFF`. Frontend hien hien PDF mau, trong khi API tra JSON. |
| Bao cao dong/mo so thang | `/bao-cao-thang` | `GET /api/reports/monthly-open-close` | Thieu tham so tren UI va lech quyen/output | API yeu cau `maLTK`, `month`, `year`; frontend hien chi chon thang/nam. API ghi Auth la `STAFF`, frontend dat cho `giamdoc`. Frontend hien PDF mau, API tra JSON. |
| Thay doi quy dinh | `/thay-doi-quy-dinh` | `GET /api/regulations`, `POST /api/regulations`, `PUT /api/regulations/:id`, `DELETE /api/regulations/:id` | Lech truong va lech quyen doc | API CRUD phu hop muc tieu quan ly quy dinh, nhung model frontend co them `loai`, `soTienGuiBanDauToiThieu`, `thoiGianGuiToiThieu`. API `GET /api/regulations` ghi Auth `CEO` hoac `STAFF`, phu hop CEO/giamdoc nhung can thong nhat ten role. |

## 3. API du cho nghiep vu chinh

Nhung API sau co the bao phu cac chuc nang chinh cua frontend:

| Nhom nghiep vu | API |
| --- | --- |
| Xac thuc | `POST /api/auth/login`, `POST /api/auth/register` |
| Loai tiet kiem/quy dinh | `GET /api/regulations`, `POST /api/regulations`, `PUT /api/regulations/:id`, `DELETE /api/regulations/:id` |
| So tiet kiem | `GET /api/savings/search`, `POST /api/savings` |
| Lap phieu | `POST /api/savings/:maSTK/deposits`, `POST /api/savings/:maSTK/withdrawals` |
| Bao cao | `GET /api/reports/daily-revenue`, `GET /api/reports/monthly-open-close` |

Ve tong the, backend da co du endpoint cho vong lap nghiep vu can thiet.
Phan con lai chu yeu la chuan hoa hop dong du lieu va phan quyen de
frontend co the tich hop ma khong can workaround.

## 4. API thieu hoac lech so voi frontend

### 4.1. Lech phan quyen giua frontend va API

- Frontend gan cac man hinh bao cao cho vai tro `giamdoc`.
- API `GET /api/reports/daily-revenue` va
  `GET /api/reports/monthly-open-close` dang ghi Auth la `STAFF`.
- Frontend gan man hinh thay doi quy dinh cho `giamdoc`.
- API dung role `CEO`, trong khi frontend dung ten role `giamdoc`.

De tich hop on dinh, can thong nhat mapping:

| Frontend role | API role de xuat |
| --- | --- |
| `admin` | `ADMIN` |
| `giamdoc` | `CEO` |
| `nhanvien` | `STAFF` |

Neu bao cao la chuc nang cua giam doc, nen cap nhat dac ta API bao cao
thanh Auth `CEO` hoac `CEO/STAFF` tuy dung nghiep vu.

### 4.2. Lech model quy dinh

Frontend dang quan ly cac truong:

- `loai`: co ky han / khong ky han
- `kyHanThang`
- `tenKyHan`
- `soTienGuiToiThieu`
- `soTienGuiBanDauToiThieu`
- `thoiGianGuiToiThieu`
- `laiSuat`

API `regulations` hien co:

- `KyHan`
- `TenLTK`
- `LaiSuat`
- `SoTienGuiToiThieu`
- `SoTienGuiThemToiThieu`

Khoang lech can xu ly:

- Chua thay truong API tuong ung ro cho `loai`.
- Chua thay truong API tuong ung ro cho `soTienGuiBanDauToiThieu`.
- Chua thay truong API tuong ung ro cho `thoiGianGuiToiThieu`.
- `SoTienGuiThemToiThieu` trong API co the gan voi tien gui them/toi
  thieu, nhung khong trung ten voi UI hien tai.

Can quyet dinh hoac sua frontend theo API, hoac bo sung truong trong API
neu cac truong tren la bat buoc theo nghiep vu.

### 4.3. Tao tai khoan can mapping role

Frontend chi cho chon:

- `nhanvien`
- `giamdoc`

API `POST /api/auth/register` yeu cau:

- `username`
- `password`
- `MaVaiTro`
- `MaKH`

Can bo sung logic mapping trong frontend khi tich hop:

| Lua chon UI | `MaVaiTro` du kien |
| --- | --- |
| `giamdoc` | `2` |
| `nhanvien` | `3` |

Truong `MaKH` can lam ro: neu chi tao tai khoan nhan vien/giam doc thi
co the khong can, nhung API doc hien dang co trong body mau.

### 4.4. Bao cao thang thieu `maLTK` tren UI

API `GET /api/reports/monthly-open-close` yeu cau:

- `maLTK`
- `month`
- `year`

Frontend hien chi co:

- `month`
- `year`

Can them dropdown chon loai tiet kiem lay tu `GET /api/regulations`, hoac
backend can cho phep bao cao tat ca loai tiet kiem khi khong truyen
`maLTK`.

### 4.5. Bao cao hien PDF mau nhung API tra JSON

Hai man hinh bao cao hien dang nhung `src/assets/test.pdf`.

API bao cao tra JSON:

- Bao cao ngay: danh sach `TenLTK`, `TongThu`, `TongChi`, `ChenhLech`.
- Bao cao thang: danh sach `Ngay`, `SoSoMo`, `SoSoDong`, `ChenhLech`.

Can chon mot trong hai huong:

- Frontend render bang/khung bao cao tu JSON.
- Backend bo sung endpoint xuat PDF neu frontend bat buoc hien PDF.

## 5. API chua duoc frontend hien tai dung truc tiep

Nhung API sau khong phai la sai hoac nen xoa ngay. Chung chi chua duoc
frontend hien tai su dung truc tiep theo cac man hinh dang co.

| API | Nhan xet |
| --- | --- |
| `GET /api/health` | Huu ich cho kiem tra trang thai backend, nhung chua co UI health check. |
| `POST /api/auth/logout` | Frontend hien logout bang cach xoa local state/localStorage, chua goi backend. |
| `GET /api/auth/me` | Huu ich de khoi phuc session tu token, frontend hien khoi phuc user mock tu localStorage. |
| `GET /api/roles` | Co the dung cho man hinh tao tai khoan, nhung frontend hien hard-code role. |
| `GET /api/savings/customers/:maKH` | Chua co man hinh xem danh sach so theo ma khach hang. |

## 6. De xuat uu tien truoc khi tich hop

1. Thong nhat role: `admin`/`giamdoc`/`nhanvien` o frontend voi
   `ADMIN`/`CEO`/`STAFF` o API.
2. Sua quyen bao cao trong API doc neu bao cao thuoc ve giam doc.
3. Chot model quy dinh: giu theo API hien tai hay bo sung cac truong
   frontend dang co.
4. Them chon `maLTK` cho bao cao thang hoac cho phep API bao cao tat ca
   loai tiet kiem.
5. Quyet dinh output bao cao: render JSON tren frontend hay backend xuat
   PDF.
6. Khi tich hop auth that, frontend can luu `accessToken`, gui
   `Authorization: Bearer <accessToken>`, va goi `GET /api/auth/me` de
   khoi phuc phien dang nhap.

## 7. Ket luan

API hien tai khong thieu nghiem trong cho cac chuc nang frontend dang co.
Nhung de tich hop that truot hon, can xu ly cac diem lech ve phan quyen,
mapping role, model quy dinh, tham so bao cao thang va dinh dang output
bao cao.

Neu cac diem tren duoc chot, frontend co the thay mock data bang API that
ma khong can thiet ke lai luong nghiep vu lon.
