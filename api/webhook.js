let paidOrders = [];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  if (req.method === 'POST') {
    const { orderCode } = req.body;
    if (orderCode) {
      if (!paidOrders.includes(orderCode)) {
        paidOrders.push(orderCode);
      }
      return res.status(200).json({ success: true, message: `Đã nhận mã ${orderCode}` });
    }
    return res.status(400).json({ error: 'Thiếu mã đơn hàng' });
  } 

  if (req.method === 'GET') {
    const { code } = req.query;
    const isPaid = paidOrders.includes(code);
    return res.status(200).json({ paid: isPaid });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
