# Backend API Test Summary

Ngay test: 2026-05-11

Backend local duoc test tai:

```text
http://127.0.0.1:3000/api
```

Frontend repo:

```text
/Users/mhoang26ct/My Project/FE_NMCNPM
```

## Muc tieu

Kiem tra backend local da san sang cho frontend da tich hop API that hay
chua. Frontend hien dang ky vong API contract moi:

- Auth tra role `ADMIN`, `CEO`, `STAFF`.
- FE mapping role:
  - `ADMIN -> admin`
  - `CEO -> giamdoc`
  - `STAFF -> nhanvien`
- `GET /regulations` tra du `loai`, `KyHan`, `LaiSuat` decimal,
  `SoTienGuiToiThieu`, `ThoiGianGuiToiThieu`.
- `GET /savings/search` tra du field account cho FE:
  `MaSTK`, `MaKH`, `MaLTK`, `HoTen`, `CMND`, `DiaChi`, `TenLTK`,
  `loai`, `KyHan`, `LaiSuat`, `SoDu`, `NgayMoSo`.
- `POST /savings` khong bat FE gui `MaKH`; backend tu tao hoac dung
  khach hang theo `CMND`.
- Giao dich gui/rut tra `SoDu` moi.
- Bao cao tam thoi bo qua.

## Du lieu seed duoc nguoi dung cung cap

Seed co 3 tai khoan:

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `123456` | `ADMIN` |
| `ceo` | `123456` | `CEO` |
| `staff` | `123456` | `STAFF` |

Seed co 2 khach hang:

| HoTen | CMND | DiaChi |
| --- | --- | --- |
| Nguyen Van A | `123456789` | TP.HCM |
| Tran Thi B | `987654321` | Ha Noi |

Seed co 3 loai tiet kiem:

| KyHan | TenLTK | LaiSuat | SoTienGuiToiThieu |
| --- | --- | --- | --- |
| `0` | Khong ky han | `0.5` | `1000000` |
| `3` | Ky han 3 thang | `5.0` | `1000000` |
| `6` | Ky han 6 thang | `5.5` | `1000000` |

Seed co 5 so tiet kiem:

| Ma so seed | Khach hang | KyHan | SoDu | Trang thai y nghia |
| --- | --- | --- | --- | --- |
| STK 1 | Nguyen Van A | 0 | 1000000+ | Khong ky han |
| STK 2 | Nguyen Van A | 3 | 5000000+ | 3 thang da dao han |
| STK 3 | Tran Thi B | 3 | 2000000 | 3 thang chua dao han |
| STK 4 | Nguyen Van A | 6 | 10000000 | 6 thang da dao han |
| STK 5 | Tran Thi B | 6 | 8000000 | 6 thang chua dao han |

Nhan xet: seed data du ve mat kich ban de test FE end-to-end, gom role,
regulations, search theo CMND, so khong ky han, so co ky han da/chua dao
han.

## Cac lenh smoke test da chay

### Health

```bash
curl -sS http://127.0.0.1:3000/api/health
```

Ket qua: pass.

Response:

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-05-10T17:08:20.051Z"
}
```

### Login 3 role

```bash
curl -sS -X POST http://127.0.0.1:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"123456"}'
```

```bash
curl -sS -X POST http://127.0.0.1:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"ceo","password":"123456"}'
```

```bash
curl -sS -X POST http://127.0.0.1:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"staff","password":"123456"}'
```

Ket qua: pass.

Backend tra token va user dung role:

- `admin -> ADMIN`
- `ceo -> CEO`
- `staff -> STAFF`

### Auth me

```bash
curl -sS http://127.0.0.1:3000/api/auth/me \
  -H 'Authorization: Bearer <staff_token>'
```

Ket qua: pass.

Response mau:

```json
{
  "success": true,
  "data": {
    "MaNguoiDung": 5,
    "TenDangNhap": "staff",
    "MaVaiTro": 3,
    "MaKH": null,
    "TenVaiTro": "STAFF"
  }
}
```

### Roles

```bash
curl -sS http://127.0.0.1:3000/api/roles \
  -H 'Authorization: Bearer <staff_token>'
```

Ket qua: fail.

Response:

```html
Cannot GET /api/roles
```

Nhan xet: endpoint `/api/roles` chua ton tai, trong khi spec co khai bao.
FE v1 chua bat buoc dung endpoint nay, nhung backend nen bo sung de khop
contract.

### Regulations read

```bash
curl -sS http://127.0.0.1:3000/api/regulations \
  -H 'Authorization: Bearer <staff_token>'
```

Ket qua: partial pass.

Backend tra duoc danh sach regulations, nhung response van la schema cu:

```json
{
  "MaLTK": 1,
  "KyHan": 0,
  "TenLTK": "Không kỳ hạn",
  "LaiSuat": 0.5,
  "SoTienGuiToiThieu": 1000000,
  "SoTienGuiThemToiThieu": 100000
}
```

Thieu so voi FE contract:

- `loai`
- `ThoiGianGuiToiThieu`

Lech so voi FE contract:

- `LaiSuat` dang tra dang percent (`0.5`, `5`, `5.5`), trong khi FE da
  tich hop theo decimal (`0.005`, `0.05`, `0.055`).

### Regulations create as CEO

```bash
curl -sS -X POST http://127.0.0.1:3000/api/regulations \
  -H 'Authorization: Bearer <ceo_token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "loai":"co_ky_han",
    "KyHan":9,
    "TenLTK":"Kỳ hạn 9 tháng test",
    "LaiSuat":0.07,
    "SoTienGuiToiThieu":1000000,
    "ThoiGianGuiToiThieu":270
  }'
```

Ket qua: fail.

Response:

```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập chức năng này"
}
```

Nhan xet: quyen write regulations dang lech. Spec/FE can `CEO` co quyen
`POST/PUT/DELETE /api/regulations`.

### Regulations create/delete as ADMIN

Da test thu `POST /api/regulations` bang `admin` voi payload cu:

```json
{
  "KyHan": 9,
  "TenLTK": "Kỳ hạn 9 tháng test",
  "LaiSuat": 7,
  "SoTienGuiToiThieu": 1000000,
  "SoTienGuiThemToiThieu": 100000
}
```

Ket qua: pass, tao `MaLTK=4`.

Sau do da xoa lai:

```bash
curl -sS -X DELETE http://127.0.0.1:3000/api/regulations/4 \
  -H 'Authorization: Bearer <admin_token>'
```

Ket qua: pass.

Nhan xet: backend hien cho `ADMIN` write regulations, trong khi spec moi
yeu cau `CEO`.

### Savings search by CMND

```bash
curl -sS 'http://127.0.0.1:3000/api/savings/search?cmnd=123456789' \
  -H 'Authorization: Bearer <staff_token>'
```

Ket qua: partial pass.

Response co danh sach so, nhung schema thieu field FE can:

```json
{
  "MaSTK": 1,
  "HoTen": "Nguyễn Văn A",
  "CMND": "123456789",
  "TenLTK": "Không kỳ hạn",
  "SoDu": 1500000,
  "NgayMoSo": "2026-04-20T09:51:38.697Z"
}
```

Thieu so voi FE contract:

- `MaKH`
- `MaLTK`
- `DiaChi`
- `loai`
- `KyHan`
- `LaiSuat`

### Create savings without MaKH

```bash
curl -sS -X POST http://127.0.0.1:3000/api/savings \
  -H 'Authorization: Bearer <staff_token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "HoTen":"Tester FE",
    "DiaChi":"TP.HCM",
    "CMND":"111222xx",
    "MaLTK":1,
    "SoTienGui":1200000
  }'
```

Ket qua: fail.

Response:

```json
{
  "success": false,
  "message": "Vui lòng cung cấp MaKH, MaLTK và SoTienGui"
}
```

Nhan xet: backend van yeu cau `MaKH`. Spec moi yeu cau backend tu tao
khach hang neu `CMND` chua ton tai, hoac dung khach hang cu neu `CMND` da
ton tai.

### Deposit

```bash
curl -sS -X POST http://127.0.0.1:3000/api/savings/1/deposits \
  -H 'Authorization: Bearer <staff_token>' \
  -H 'Content-Type: application/json' \
  -d '{"SoTienGui":100000}'
```

Ket qua: fail.

Response:

```json
{
  "success": false,
  "message": "Lỗi: Sổ tiết kiệm không tồn tại hoặc không khớp với mã khách hàng!"
}
```

Nhan xet: staff token co `MaKH = null`; backend khong nen validate theo
MaKH cua user staff. FE chi truyen `maSTK` va `SoTienGui`.

### Withdraw

```bash
curl -sS -X POST http://127.0.0.1:3000/api/savings/2/withdrawals \
  -H 'Authorization: Bearer <staff_token>' \
  -H 'Content-Type: application/json' \
  -d '{"SoTienRut":100000}'
```

Ket qua: fail.

Response:

```json
{
  "success": false,
  "message": "Procedure or function sp_ThucHienRutTien has too many arguments specified."
}
```

Nhan xet: stored procedure rut tien dang bi goi sai so tham so hoac
signature procedure chua khop voi code backend.

### Savings customers endpoint

```bash
curl -sS http://127.0.0.1:3000/api/savings/customers/1 \
  -H 'Authorization: Bearer <staff_token>'
```

Ket qua: fail.

Response:

```html
Cannot GET /api/savings/customers/1
```

Nhan xet: endpoint nay dang co trong spec cu, nhung chua ton tai. FE v1
khong bat buoc dung endpoint nay.

## Side effects trong qua trinh test

Da tao user test:

```text
staff_tmp_api_test
```

User nay login thanh cong voi password `123456`.

Da tao thu regulation `MaLTK=4`, sau do da xoa lai thanh cong.

## Lan test lai 2026-05-11 00:18 +07

Backend local van duoc test tai:

```text
http://127.0.0.1:3000/api
```

Luu y moi truong: trong sandbox, request den backend local bi chan voi
`Operation not permitted`; chay lai voi quyen network local thi backend
phan hoi binh thuong.

### Ket qua da pass sau khi backend duoc sua

#### Health

```bash
curl -sS http://127.0.0.1:3000/api/health
```

Ket qua: pass.

Response:

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-05-10T17:16:47.312Z"
}
```

#### Login 3 role va auth me

Ket qua: pass.

- `admin / 123456 -> ADMIN`
- `ceo / 123456 -> CEO`
- `staff / 123456 -> STAFF`
- `GET /api/auth/me` bang staff token tra dung user `staff`, role
  `STAFF`, `MaKH: null`.

#### Roles

```bash
curl -sS http://127.0.0.1:3000/api/roles \
  -H 'Authorization: Bearer <staff_token>'
```

Ket qua: pass.

Response:

```json
{
  "success": true,
  "data": [
    { "MaVaiTro": 1, "TenVaiTro": "ADMIN" },
    { "MaVaiTro": 2, "TenVaiTro": "CEO" },
    { "MaVaiTro": 3, "TenVaiTro": "STAFF" }
  ]
}
```

#### Regulations read

```bash
curl -sS http://127.0.0.1:3000/api/regulations \
  -H 'Authorization: Bearer <staff_token>'
```

Ket qua: pass.

Backend da tra dung schema moi, co `loai`, `ThoiGianGuiToiThieu`, va
`LaiSuat` dang decimal:

```json
[
  {
    "MaLTK": 1,
    "loai": "khong_ky_han",
    "KyHan": 0,
    "TenLTK": "Không kỳ hạn",
    "LaiSuat": 0.005,
    "SoTienGuiToiThieu": 1000000,
    "ThoiGianGuiToiThieu": 0
  },
  {
    "MaLTK": 2,
    "loai": "co_ky_han",
    "KyHan": 3,
    "TenLTK": "Kỳ hạn 3 tháng",
    "LaiSuat": 0.05,
    "SoTienGuiToiThieu": 1000000,
    "ThoiGianGuiToiThieu": 90
  },
  {
    "MaLTK": 3,
    "loai": "co_ky_han",
    "KyHan": 6,
    "TenLTK": "Kỳ hạn 6 tháng",
    "LaiSuat": 0.055,
    "SoTienGuiToiThieu": 1000000,
    "ThoiGianGuiToiThieu": 180
  }
]
```

#### Regulations write as CEO

Da test `POST /api/regulations` bang `ceo` voi payload FE moi:

```json
{
  "loai": "co_ky_han",
  "KyHan": 9,
  "TenLTK": "Kỳ hạn 9 tháng test",
  "LaiSuat": 0.07,
  "SoTienGuiToiThieu": 1000000,
  "ThoiGianGuiToiThieu": 270
}
```

Ket qua: pass, tao `MaLTK=6`.

Da test `PUT /api/regulations/6` bang `ceo`.

Ket qua: pass, response tra object da update:

```json
{
  "MaLTK": 6,
  "loai": "co_ky_han",
  "KyHan": 9,
  "TenLTK": "Kỳ hạn 9 tháng test update",
  "LaiSuat": 0.071,
  "SoTienGuiToiThieu": 1100000,
  "ThoiGianGuiToiThieu": 270
}
```

Da test `DELETE /api/regulations/6` bang `ceo`.

Ket qua: pass, da xoa regulation test.

Da test `POST /api/regulations` bang `admin`.

Ket qua: pass theo nghia quyen moi da dung, backend chan `ADMIN` write:

```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập chức năng này"
}
```

#### Savings search by CMND

```bash
curl -sS 'http://127.0.0.1:3000/api/savings/search?cmnd=123456789' \
  -H 'Authorization: Bearer <staff_token>'
```

Ket qua: pass.

Response da tra du field FE can, vi du:

```json
{
  "MaSTK": 1,
  "MaKH": 1,
  "MaLTK": 1,
  "HoTen": "Nguyễn Văn A",
  "CMND": "123456789",
  "DiaChi": "TP.HCM",
  "TenLTK": "Không kỳ hạn",
  "loai": "khong_ky_han",
  "KyHan": 0,
  "LaiSuat": 0.005,
  "SoDu": 1500000,
  "NgayMoSo": "2026-04-20T09:51:38.697Z"
}
```

#### Create savings without MaKH

```bash
curl -sS -X POST http://127.0.0.1:3000/api/savings \
  -H 'Authorization: Bearer <staff_token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "HoTen":"Tester FE 20260511",
    "DiaChi":"TP.HCM",
    "CMND":"555666777",
    "MaLTK":1,
    "SoTienGui":1200000
  }'
```

Ket qua: pass.

Response:

```json
{
  "success": true,
  "message": "Sổ tiết kiệm đã được tạo thành công",
  "data": {
    "MaSTK": 7,
    "MaKH": 4,
    "MaLTK": 1,
    "TenLTK": "Không kỳ hạn",
    "loai": "khong_ky_han",
    "KyHan": 0,
    "LaiSuat": 0.005,
    "SoDu": 1200000
  }
}
```

Search lai theo `CMND=555666777` cung pass va tra du account fields.

### Ket qua con fail

#### Deposit

```bash
curl -sS -X POST http://127.0.0.1:3000/api/savings/7/deposits \
  -H 'Authorization: Bearer <staff_token>' \
  -H 'Content-Type: application/json' \
  -d '{"SoTienGui":100000}'
```

Ket qua: fail.

Response:

```json
{
  "success": false,
  "message": "Procedure or function 'sp_ThucHienGuiTien' expects parameter '@MaKH', which was not supplied."
}
```

Nhan xet moi: loi da doi so voi lan truoc. Backend khong con bao khong
khop `MaKH`, nhung code goi stored procedure gui tien van thieu tham so
`@MaKH` hoac procedure chua duoc sua de khong can tham so nay.

#### Withdraw

Da test:

- `POST /api/savings/7/withdrawals` rut mot phan so khong ky han moi tao.
- `POST /api/savings/3/withdrawals` rut mot phan so co ky han chua dao han.
- `POST /api/savings/2/withdrawals` rut mot phan so co ky han da dao han.

Tat ca deu fail cung response:

```json
{
  "success": false,
  "message": "Invalid object name 'SO_TIET_KIEM'."
}
```

Nhan xet moi: loi stored procedure `sp_ThucHienRutTien` too many arguments
da duoc thay bang loi DB object/table name. Can kiem tra SQL trong flow rut
tien dang reference `SO_TIET_KIEM` trong khi schema thuc te co the dung ten
bang khac hoac case/schema khac.

### Side effects moi

Da tao khach hang/so test:

```text
CMND: 555666777
MaKH: 4
MaSTK: 7
SoDu ban dau: 1200000
```

Chua cleanup duoc tu frontend API vi chua thay endpoint delete savings trong
contract hien tai.

### Frontend build

Da chay:

```bash
npm run build
```

Ket qua: pass. Build client va SSR thanh cong. Con warning kich thuoc chunk
`index`/`router`/`worker-entry` lon hon 500 kB, khong chan build.

## Lan test lai 2026-05-11 00:38 +07

Muc tieu: test lai 2 endpoint con fail sau khi backend duoc fix:

- `POST /api/savings/:maSTK/deposits`
- `POST /api/savings/:maSTK/withdrawals`

Backend health va login staff deu pass truoc khi test.

### Deposit

Test truoc khi gui tien:

```bash
curl -sS 'http://127.0.0.1:3000/api/savings/search?cmnd=555666777' \
  -H 'Authorization: Bearer <staff_token>'
```

Ket qua truoc khi gui:

```json
{
  "MaSTK": 7,
  "SoDu": 1200000
}
```

Test gui tien:

```bash
curl -sS -X POST http://127.0.0.1:3000/api/savings/7/deposits \
  -H 'Authorization: Bearer <staff_token>' \
  -H 'Content-Type: application/json' \
  -d '{"SoTienGui":100000}'
```

Ket qua: pass.

Response:

```json
{
  "success": true,
  "message": "Phiếu gửi tiền đã được tạo thành công",
  "data": {
    "MaSTK": 7,
    "SoTienGui": 100000,
    "SoDu": 1300000
  }
}
```

Search lai theo `maSTK=7` tra `SoDu=1300000`, khop response.

### Withdraw

#### So khong ky han moi tao, chua du 15 ngay

```bash
curl -sS -X POST http://127.0.0.1:3000/api/savings/7/withdrawals \
  -H 'Authorization: Bearer <staff_token>' \
  -H 'Content-Type: application/json' \
  -d '{"SoTienRut":100000}'
```

Ket qua: pass theo rule nghiep vu, backend chan dung ly do:

```json
{
  "success": false,
  "message": "Lỗi: Loại không kỳ hạn phải gửi trên 15 ngày mới được rút!"
}
```

#### So co ky han chua dao han

```bash
curl -sS -X POST http://127.0.0.1:3000/api/savings/3/withdrawals \
  -H 'Authorization: Bearer <staff_token>' \
  -H 'Content-Type: application/json' \
  -d '{"SoTienRut":100000}'
```

Ket qua: pass theo rule nghiep vu, backend chan dung ly do:

```json
{
  "success": false,
  "message": "Lỗi: Sổ có kỳ hạn chưa đến ngày đáo hạn, không được phép rút!"
}
```

#### So co ky han da dao han nhung rut mot phan

```bash
curl -sS -X POST http://127.0.0.1:3000/api/savings/2/withdrawals \
  -H 'Authorization: Bearer <staff_token>' \
  -H 'Content-Type: application/json' \
  -d '{"SoTienRut":100000}'
```

Ket qua: pass theo rule nghiep vu, backend chan rut mot phan:

```json
{
  "success": false,
  "message": "Lỗi: Sổ có kỳ hạn bắt buộc phải rút toàn bộ (tất toán)!"
}
```

#### So khong ky han seed da du ngay

```bash
curl -sS -X POST http://127.0.0.1:3000/api/savings/1/withdrawals \
  -H 'Authorization: Bearer <staff_token>' \
  -H 'Content-Type: application/json' \
  -d '{"SoTienRut":100000}'
```

Ket qua: pass.

Response:

```json
{
  "success": true,
  "message": "Phiếu rút tiền đã được tạo thành công",
  "data": {
    "MaSTK": 1,
    "SoTienRut": 100000,
    "SoDu": 1400000
  }
}
```

Search lai theo `maSTK=1` va `cmnd=123456789` deu tra `SoDu=1400000`,
khop response.

### Ket luan test lai

Hai loi P0 cu da duoc fix:

- Deposit khong con loi thieu `@MaKH`.
- Withdraw khong con loi `Invalid object name 'SO_TIET_KIEM'`.

Luu y side effect moi:

- `MaSTK=7`: da gui them `100000`, `SoDu` tu `1200000` len `1300000`.
- `MaSTK=1`: da rut `100000`, `SoDu` tu `1500000` xuong `1400000`.

## Ket luan hien tai

Seed data du de test. Backend implementation hien da khop cac contract FE
chinh cho luong auth, regulations, tra cuu, mo so, gui tien va rut tien.

Nhung endpoint pass:

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/register`
- `GET /api/roles`
- `GET /api/regulations`
- `POST/PUT/DELETE /api/regulations` bang `CEO`
- `GET /api/savings/search`
- `POST /api/savings` khong can `MaKH`
- `POST /api/savings/:maSTK/deposits`
- `POST /api/savings/:maSTK/withdrawals`

## Checklist backend can tiep tuc

Cap nhat sau lan test lai 2026-05-11 00:18 +07:

### Da pass

1. `GET /api/roles`.
2. `GET /api/regulations` tra dung schema moi:

```json
{
  "MaLTK": 1,
  "loai": "khong_ky_han",
  "KyHan": 0,
  "TenLTK": "Không kỳ hạn",
  "LaiSuat": 0.005,
  "SoTienGuiToiThieu": 1000000,
  "ThoiGianGuiToiThieu": 0
}
```

3. Quyen regulations:
   - `GET`: staff test pass.
   - `POST/PUT/DELETE`: CEO test pass.
   - `ADMIN` write bi chan dung contract moi.
4. `POST/PUT /api/regulations` nhan payload FE moi.
5. `GET /api/savings/search` tra du account fields FE can.
6. `POST /api/savings` khong bat `MaKH`; backend tu resolve theo `CMND`
   va tao khach hang moi khi can.
7. `POST /api/savings/:maSTK/deposits` pass, response tra `SoDu` moi.
8. `POST /api/savings/:maSTK/withdrawals` pass:
   - So khong ky han du ngay rut thanh cong.
   - So khong ky han chua du 15 ngay bi chan dung rule.
   - So co ky han chua dao han bi chan dung rule.
   - So co ky han da dao han nhung rut mot phan bi chan dung rule.

### P0

Khong con P0 dang fail trong checklist API FE chinh sau lan test
2026-05-11 00:38 +07.

### P1

1. Neu giu `GET /api/savings/customers/:maKH` trong spec thi can them
   endpoint nay.
2. Cleanup user test `staff_tmp_api_test` neu khong can.
3. Cleanup khach hang/so test moi neu khong can:
   - `CMND=555666777`
   - `MaKH=4`
   - `MaSTK=7`
4. Lam seed idempotent cho khach hang, loai tiet kiem, so tiet kiem de
   chay lai seed khong bi duplicate.

## Test lai sau khi sua backend

Chay lai cac nhom test:

1. Login 3 role va `GET /auth/me`.
2. `GET /roles`.
3. `GET /regulations` bang `staff`.
4. `POST/PUT/DELETE /regulations` bang `ceo`.
5. `GET /savings/search?cmnd=123456789`.
6. `POST /savings` voi CMND moi, khong co `MaKH`.
7. `POST /savings/:maSTK/deposits`.
8. `POST /savings/:maSTK/withdrawals`:
   - khong ky han rut mot phan OK.
   - khong ky han chua du 15 ngay bi chan.
   - co ky han rut mot phan bi chan.
   - co ky han rut toan bo OK neu backend cho phep theo quy tac.

## Ghi chu frontend

Frontend da tich hop theo contract moi trong cac file chinh:

- `src/lib/api.ts`
- `src/lib/savings.ts`
- `src/components/AuthProvider.tsx`
- `src/routes/mo-so.tsx`
- `src/routes/gui-tien.tsx`
- `src/routes/rut-tien.tsx`
- `src/routes/tra-cuu.tsx`
- `src/routes/thay-doi-quy-dinh.tsx`
- `src/routes/tao-tai-khoan.tsx`

Build FE truoc do da pass, lint chi co warning cu cua shadcn/ui va router.
