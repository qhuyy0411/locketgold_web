global.paidOrders = global.paidOrders || new Set();

export default async function handler(req, res) {
  // Cho phép mọi nguồn truy cập để tránh lỗi 401
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Web gọi để kiểm tra trạng thái thanh toán (GET)
  if (req.method === 'GET') {
    const { orderCode } = req.query;
    if (orderCode && global.paidOrders.has(orderCode)) {
      return res.status(200).json({ status: 'SUCCESS', success: true });
    }
    return res.status(200).json({ status: 'PENDING', success: false });
  }

  // 2. MacroDroid gửi dữ liệu thông báo lên (POST)
  if (req.method === 'POST') {
    const { orderCode } = req.body;

    if (orderCode) {
      const matches = orderCode.match(/LK\d+/g);
      if (matches && matches.length > 0) {
        matches.forEach(code => global.paidOrders.add(code));
        return res.status(200).json({ success: true, matchedCodes: matches });
      }
    }

    return res.status(200).json({ success: false, message: 'No valid order code found' });
  }

  return res.status(405).end();
}
