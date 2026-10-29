# Implementation Plan

### Overview
Cập nhật cổng **Nạp Game Gati** hiện tại với tính năng **mua nhiều đơn vị của cùng một gói nạp trong một giao dịch**. Bản cập nhật giữ nguyên toàn bộ bố cục 2 cột, bảng màu tối chủ đạo (`#0f0f12` / `#18181b` / `#fb5503`), danh sách gói nạp, danh sách phương thức thanh toán và luồng khóa Máy chủ + Nhân vật hiện có, đồng thời bổ sung bộ chọn số lượng `[ − ]  1  [ + ]` tại cột thanh toán bên phải cùng logic tính giá, kiểm tra hạn mức thanh toán, xác nhận đơn hàng và hiển thị kết quả giao dịch.

### Aesthetics & Design
- **Domain**: Digital Game Top-Up & E-Commerce Checkout Storefront
- **Aesthetic Persona**: Dark Tactical Gaming Commerce (đồng bộ tuyệt đối với giao diện Gati Games hiện tại)
- **Brand Inspirations**: Gati Games Recharge Portal, Riot Games Store, Razer Gold
- **Color Palette**:
  - Background Primary: `#0f0f12` (nền trang chính)
  - Background Secondary: `#18181b` / `#121214` (khối gói nạp, khung tóm tắt thanh toán và điều khiển số lượng)
  - Text Primary: `#ffffff` / `#f4f4f5` (tên gói, số lượng, tổng tiền)
  - Text Secondary: `#a1a1aa` / `#71717a` (nhãn phụ, giá gốc gạch ngang, hạn mức tối đa)
  - Accent Primary: `#fb5503` (màu cam Gati cho nút `[ + ]` / `[ − ]` khả dụng, viền gói đang chọn, tổng thanh toán và nút CTA)
  - Accent Secondary: `#f59e0b` (nhãn thông báo giới hạn tối đa, badge bonus)
  - Semantic Status: `#10b981` (tiết kiệm / thành công), `#ef4444` (cảnh báo vượt hạn mức kênh thanh toán hoặc thay đổi giới hạn CMS)
- **Typography**:
  - Heading & UI Controls: `Inter` / Sans-serif hiện tại với `font-bold` đến `font-black` cho tên gói và nút điều khiển
  - Monospace / Numerals: `JetBrains Mono` kết hợp `tabular-nums` cho toàn bộ đơn giá, số lượng, số tiền giảm giá và tổng thanh toán để không bị nhảy bố cục khi tăng/giảm số lượng
- **Layout Structure**:
  - Giữ nguyên bố cục 2 cột trên màn hình nạp gói (`lg:col-span-8` bên trái cho danh sách gói nạp, `lg:col-span-4` bên phải cho Phương thức thanh toán và Tóm tắt đơn hàng).
  - Trong cột bên phải, ngay bên dưới dòng **Gói đang chọn**, bổ sung khu vực **Số lượng** với bộ điều khiển `[ − ]  1  [ + ]` căn chỉnh gọn gàng, nút bấm kích thước chuẩn (`36x36px`), nền tối `#121214`, viền rõ ràng và sắc cam `#fb5503` cho trạng thái thao tác được.
  - Ngay dưới bộ chọn số lượng hiển thị dòng trạng thái giới hạn rõ ràng (không cần hover): *"Tối đa X gói / giao dịch"*, *"Gói này chỉ được mua 1 lần trong mỗi giao dịch."*, hoặc *"Bạn đã chọn số lượng tối đa cho gói này."*

### Features & Functionality

#### 1. Cấu hình dữ liệu giới hạn số lượng từng gói (Mock Data dễ chỉnh sửa)
- Mỗi gói nạp được bổ sung cấu hình `maxQuantity` và số lượng Kim Phiếu cơ sở để nhân theo số lượng:
  - **Gói 6 Kim Phiếu** (`20.000đ`): Tối đa `10` gói / giao dịch
  - **Gói 30 Kim Phiếu** (`100.000đ`): Tối đa `5` gói / giao dịch
  - **Gói 98 Kim Phiếu** (Giá gốc `300.000đ`, Giá sale `270.000đ`): Tối đa `5` gói / giao dịch
  - **Gói 198 Kim Phiếu** (Giá gốc `600.000đ`, Giá sale `510.000đ`): Tối đa `5` gói / giao dịch
  - **Gói 648 Kim Phiếu** (`2.000.000đ`): Tối đa `3` gói / giao dịch
  - **Gói 1648 Kim Phiếu** (Giá gốc `5.000.000đ`, Giá sale `4.250.000đ`): Tối đa `2` gói / giao dịch
  - **Gói 3298 Kim Phiếu** (`10.000.000đ`): Tối đa `2` gói / giao dịch
  - **Thẻ Tháng** (Giá gốc `150.000đ`, Giá sale `120.000đ`): Tối đa `1` gói / giao dịch
  - **Thẻ Tuần** (`50.000đ`): Tối đa `1` gói / giao dịch

#### 2. Bộ điều khiển Số lượng và Quy tắc chuyển gói
- Chỉ hiển thị và điều chỉnh số lượng tại **cột thanh toán bên phải** (giữ nguyên Popup Chi tiết gói chỉ để xem thông tin gói đơn lẻ).
- Giá trị mặc định và tối thiểu luôn là `1`. Khi số lượng bằng `1`, nút `[ − ]` bị vô hiệu hóa.
- Khi gói có `maxQuantity === 1` (như *Thẻ Tháng*, *Thẻ Tuần*):
  - Vẫn hiển thị bộ chọn số lượng ở mức `1`, nút `[ − ]` và `[ + ]` đều ở trạng thái không khả dụng.
  - Hiển thị cố định thông báo: *"Gói này chỉ được mua 1 lần trong mỗi giao dịch."*
- Khi gói có `maxQuantity > 1`:
  - Hiển thị *"Tối đa [X] gói / giao dịch"*.
  - Khi người dùng bấm `+` chạm mốc tối đa, khóa nút `[ + ]` và hiển thị thông báo: *"Bạn đã chọn số lượng tối đa cho gói này."*
- Khi người dùng chọn sang một gói khác ở cột bên trái:
  - Bỏ chọn gói cũ, chọn gói mới và **reset số lượng về `1`**.
  - Giữ nguyên Máy chủ và Nhân vật đã khóa.
  - Kiểm tra lại phương thức thanh toán đang chọn với giá trị của gói mới; nếu không còn hợp lệ thì yêu cầu chọn lại.

#### 3. Tính giá, Khuyến mãi (Sale) và Kiểm tra Hạn mức Thanh toán
- **Gói thường (không giảm giá)**:
  - Tổng thanh toán = `Đơn giá × Số lượng`.
- **Gói đang Sale**:
  - Áp dụng đơn giá đã giảm cho toàn bộ các đơn vị gói trong giao dịch.
  - Hiển thị đầy đủ bảng tính tại khu vực tóm tắt cột phải:
    - **Đơn giá**: Giá sale (kèm giá gốc gạch ngang)
    - **Số lượng**: `× N`
    - **Tổng giá gốc**: `Giá gốc × Số lượng`
    - **Giảm giá / Tiết kiệm**: `-(Chênh lệch mỗi gói × Số lượng)`
    - **Tổng thanh toán**: `Giá sale × Số lượng`
    - **Tổng vật phẩm nhận được**: Tự động nhân số Kim Phiếu chính và vật phẩm Bonus theo số lượng (ví dụ: `90 Kim Phiếu + Bonus x3`).
- **Tương tác với Phương thức thanh toán**:
  - Kiểm tra hạn mức `minAmount` / `maxAmount` của từng kênh thanh toán dựa trên **Tổng thanh toán** (`Đơn giá × Số lượng`), thay vì chỉ dựa trên giá 1 gói.
  - Nếu việc tăng số lượng làm Tổng thanh toán vượt quá hạn mức tối đa của ví điện tử đang chọn (ví dụ vượt `5.000.000đ` đối với MoMo/ZaloPay): làm mờ phương thức đó, hiển thị rõ lý do *"Vượt hạn mức 5.000.000đ cho tổng đơn"* và yêu cầu người dùng chọn kênh thanh toán phù hợp hoặc giảm số lượng trước khi bấm thanh toán.

#### 4. Xác nhận trước khi thanh toán & Giả lập thay đổi giới hạn từ Demo Toolbar
- **Giả lập thay đổi giới hạn số lượng (CMS Limit Change Edge Case)**:
  - Bổ sung tùy chọn kịch bản **"Giảm giới hạn SL gói"** trên thanh công cụ Demo ở cuối màn hình.
  - Khi kịch bản này được bật và người dùng bấm **"Thanh toán ngay"** với số lượng lớn hơn giới hạn mới (hoặc hệ thống hạ giới hạn động xuống thấp hơn mức đang chọn):
    - Chặn chuyển sang bước thanh toán, **không tự ý sửa số lượng** người dùng đã chọn.
    - Hiển thị thông báo cảnh báo nổi bật: *"Số lượng tối đa của gói đã thay đổi. Vui lòng điều chỉnh xuống tối đa [X] gói để tiếp tục."* và cập nhật mức tối đa mới để người dùng chủ động bấm `[ − ]`.
- **Popup Xác nhận chi tiết đơn hàng**:
  - Khi bấm **"Thanh toán ngay"** và dữ liệu hợp lệ, mở Popup Xác nhận đơn hàng hiển thị đầy đủ: Tên game, Máy chủ, Nhân vật, Tên gói, Đơn giá, Số lượng, Tổng giá gốc & mức giảm (nếu là gói Sale), Tổng tiền thanh toán cuối cùng và Phương thức thanh toán.
  - Sau khi xác nhận trong Popup mới chuyển sang màn hình Quét mã QR / Đang xử lý giao dịch.

#### 5. Đồng bộ Màn hình QR, Kết quả giao dịch và Lịch sử giao dịch
- **Màn hình Đang xử lý / Quét QR**: Hiển thị Tên gói kèm số lượng (`× N`), đơn giá và Tổng thanh toán đã nhân số lượng.
- **Màn hình Kết quả giao dịch (Thành công / Đang xử lý / Thất bại)**: Hiển thị rõ tên gói, số lượng gói đã mua, đơn giá, tổng tiền thanh toán và tổng vật phẩm cộng vào nhân vật.
- **Lịch sử giao dịch**: Lưu và hiển thị thông tin số lượng (`× N`), đơn giá và tổng thanh toán trên từng bản ghi giao dịch.

### Technical Architecture

```
+-----------------------------------------------------------------------+
|                        Application State (App)                        |
|  - selectedPackage, selectedQuantity (default: 1)                     |
|  - demoEdgeCase ('normal' | 'maintenance' | 'limit_changed' | ...)    |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                      Recharge Workspace (2-Column)                    |
|                                                                       |
|  [Left Column: Package Grid]        [Right Column: Payment & Summary] |
|  - Single package selection         - Selected Package info           |
|  - Select new pkg -> reset qty=1    - Quantity Stepper: [ - ] N [ + ] |
|  - Sale badge & strikethrough       - Limit status message            |
|                                     - Dynamic Payment Method check    |
|                                       against (pkg.price * quantity)  |
|                                     - Price Breakdown (Unit, Qty,     |
|                                       Original, Discount, Final)      |
+-----------------------------------+-----------------------------------+
                                    |
                   Click "Thanh toán ngay" (Pre-check)
                                    |
         +--------------------------+--------------------------+
         |                                                     |
         v (If Demo Case = Limit Changed)                      v (If Valid)
+-----------------------------------+   +-----------------------------------+
|   Inline / Modal Limit Warning    |   |     Final Confirmation Modal      |
| - Blocks checkout                 |   | - Game, Server, Character         |
| - Keeps user's current quantity   |   | - Package, Unit Price, Quantity   |
| - Prompts user to lower to <= X   |   | - Discount & Final Total, Method  |
+-----------------------------------+   +-----------------+-----------------+
                                                          |
                                                          v
                                        +-----------------------------------+
                                        |  QR Processing & Result / History |
                                        | - Displays Package x Quantity     |
                                        | - Total Paid & Multiplied Rewards |
                                        +-----------------------------------+
```
