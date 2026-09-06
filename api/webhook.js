// Lưu tạm danh sách các đơn đã thanh toán thành công
global.paidOrders = global.paidOrders || new Set();

export default async function handler(req, res) {
  // Cho phép gọi API từ mọi nguồn (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. WEB HỎI TRẠNG THÁI (GET)
  if (req.method === 'GET') {
    const { orderCode } = req.query;
    if (orderCode && global.paidOrders.has(orderCode)) {
      return res.status(200).json({ status: 'SUCCESS', success: true });
    }
    return res.status(200).json({ status: 'PENDING', success: false });
  }

  // 2. MACRODROID BẮN DỮ LIỆU LÊN (POST)
  if (req.method === 'POST') {
    const { orderCode } = req.body;

    if (orderCode) {
      // Dùng Regex trích xuất tất cả chuỗi dạng LKxxxx (Ví dụ: LK7074)
      const matches = orderCode.match(/LK\d+/g);

      if (matches && matches.length > 0) {
        matches.forEach(code => global.paidOrders.add(code));
        return res.status(200).json({ 
          success: true, 
          message: 'Saved order codes successfully', 
          matchedCodes: matches 
        });
      }
    }

    return res.status(200).json({ success: false, message: 'No valid LK order code found' });
  }

  return res.status(405).end();
}
