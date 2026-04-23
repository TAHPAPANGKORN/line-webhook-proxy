const axios = require('axios');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const targetUrl = 'http://playground.informatics.buu.ac.th:10072/line/webhook';
    const signature = req.headers['x-line-signature'];

    // 1. เพิ่มการ Log เพื่อดูข้อมูลที่ Vercel ได้รับจาก LINE
    console.log('--- Received Body:', JSON.stringify(req.body));
    
    try {
      // 2. ปรับการส่งต่อให้ชัวร์ขึ้น (เพิ่ม || {} เผื่อกรณี body ว่าง)
      const response = await axios.post(targetUrl, req.body || {}, {
        headers: {
          'Content-Type': 'application/json',
          'x-line-signature': signature || '' // ป้องกันค่าว่าง
        },
        timeout: 15000 // เพิ่มเวลาเป็น 15 วินาที เปลื่อมหาลัยช้า
      });

      console.log('--- Successfully forwarded to Uni Server ---');
      return res.status(200).send(response.data);
      
    } catch (error) {
      console.error('--- Forwarding Error:', error.message);
      
      // ส่งสถานะ 200 กลับหา LINE เพื่อให้ระบบไม่ล่ม
      // แต่แนบข้อมูล Error ไปด้วยเพื่อการตรวจสอบ
      return res.status(200).json({ 
        proxy_status: 'error_occurred',
        error_message: error.message,
        target: targetUrl
      });
    }
  } else {
    return res.status(200).send('Line Webhook Proxy is active.');
  }
}
