// Dùng đối tượng toàn cục đơn giản để lưu trữ mã đã thanh toán
let paidCodesStore = global.paidCodesStore || new Set();
global.paidCodesStore = paidCodesStore;

export default async function handler(req, res) {
  // Bật CORS tối đa
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

  // 1. NHẬN DỮ LIỆU TỪ MACRODROID (Gửi qua GET hoặc POST)
  // Hỗ trợ hứng cả ?orderCode=... hoặc truyền toàn bộ nội dung thông báo qua ?orderCode=[not_text] hoặc body
  const inputData = req.method === 'POST' ? (req.body || {}) : req.query;
  const rawString = JSON.stringify(inputData);

  // Tìm tất cả các mã có dạng LK theo sau là số (ví dụ: LK1234)
  const matches = rawString.match(/LK\d+/g);
  if (matches && matches.length > 0) {
    matches.forEach(code => {
      paidCodesStore.add(code.toUpperCase());
    });
  }

  // 2. TRANG WEB GỌI LÊN ĐỂ KIỂM TRA TRẠNG THÁI
  const queryCode = req.query.orderCode ? req.query.orderCode.toUpperCase().trim() : '';
  
  if (queryCode) {
    if (paidCodesStore.has(queryCode)) {
      return res.status(200).json({ status: 'SUCCESS', success: true, matched: queryCode });
    } else {
      return res.status(200).json({ status: 'PENDING', success: false, checking: queryCode, storeSize: paidCodesStore.size });
    }
  }

  // Phản hồi mặc định nếu gọi trống
  return res.status(200).json({ 
    success: true, 
    message: "Webhook is running!", 
    totalPaidStored: paidCodesStore.size,
    recentMatched: matches || [] 
  });
}
