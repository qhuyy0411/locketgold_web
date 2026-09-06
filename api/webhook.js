global.paidOrders = global.paidOrders || new Set();

export default async function handler(req, res) {
  // Bật CORS tối đa để không bao giờ bị chặn 401
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Xử lý kiểm tra trạng thái từ web (GET)
  if (req.method === 'GET') {
    const { orderCode } = req.query;
    if (orderCode && global.paidOrders.has(orderCode)) {
      return res.status(200).json({ status: 'SUCCESS', success: true });
    }
    return res.status(200).json({ status: 'PENDING', success: false });
  }

  // Xử lý nhận thông báo từ MacroDroid (POST)
  if (req.method === 'POST') {
    const rawData = req.body;
    let orderText = '';

    // Hứng dữ liệu dù MacroDroid gửi dưới dạng JSON hay Text thô
    if (typeof rawData === 'string') {
      orderText = rawData;
    } else if (rawData && rawData.orderCode) {
      orderText = rawData.orderCode;
    } else {
      orderText = JSON.stringify(rawData);
    }

    if (orderText) {
      const matches = orderText.match(/LK\d+/g);
      if (matches && matches.length > 0) {
        matches.forEach(code => global.paidOrders.add(code));
        return res.status(200).json({ success: true, matchedCodes: matches });
      }
    }

    return res.status(200).json({ success: false, message: 'Received but no LK code found', data: rawData });
  }

  return res.status(405).end();
}
