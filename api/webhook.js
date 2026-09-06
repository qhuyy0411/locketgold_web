let paidCodesStore = global.paidCodesStore || new Set();
global.paidCodesStore = paidCodesStore;

export default async function handler(req, res) {
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

  // 1. NHẬN DỮ LIỆU TỪ MACRODROID
  const rawInput = req.method === 'POST' ? JSON.stringify(req.body || {}) : (req.query.orderCode || '');
  const decodedInput = decodeURIComponent(rawInput);

  // Tìm và lọc mọi mã dạng LK theo sau là số (không phân biệt hoa thường)
  const matches = decodedInput.match(/LK\d+/gi);
  if (matches && matches.length > 0) {
    matches.forEach(code => {
      paidCodesStore.add(code.toUpperCase().trim());
    });
  }

  // 2. TRANG WEB GỌI LÊN KIỂM TRA TRẠNG THÁI
  const queryCode = req.query.orderCode ? req.query.orderCode.toUpperCase().trim() : '';

  // Nếu request chỉ để kiểm tra đơn hàng cụ thể
  if (queryCode && !queryCode.includes(' ') && queryCode.startsWith('LK')) {
    if (paidCodesStore.has(queryCode)) {
      return res.status(200).json({ status: 'SUCCESS', success: true, matched: queryCode });
    } else {
      return res.status(200).json({ 
        status: 'PENDING', 
        success: false, 
        checking: queryCode, 
        storedCodes: Array.from(paidCodesStore) 
      });
    }
  }

  // Trả về trạng thái tổng quan nếu truy cập trực tiếp webhook
  return res.status(200).json({ 
    success: true, 
    message: "Webhook is active", 
    storedCodes: Array.from(paidCodesStore),
    lastReceived: decodedInput 
  });
}
