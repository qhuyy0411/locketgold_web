// Lưu trữ tạm các mã đơn hàng đã thanh toán thành công (dạng tập hợp để tránh trùng lặp)
let storedCodes = new Set();
let lastReceivedMessage = "";

export default function handler(req, res) {
  // Cho phép CORS để Frontend gọi thoải mái không bị chặn
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { orderCode } = req.query;

  // Nếu MacroDroid có truyền nội dung lên
  if (orderCode) {
    lastReceivedMessage = orderCode;

    // Dùng Regex tìm tất cả các chuỗi dạng LK theo sau bởi chữ số (ví dụ: LK1234, lk5678)
    const matches = orderCode.match(/LK\d+/gi);
    if (matches) {
      matches.forEach(code => {
        storedCodes.add(code.toUpperCase()); // Lưu chuẩn dạng viết hoa
      });
    }
  }

  // Trả về danh sách mã đã nhận diện được và tin nhắn gần nhất để debug
  return res.status(200).json({
    status: "success",
    lastReceived: lastReceivedMessage,
    storedCodes: Array.from(storedCodes)
  });
}
