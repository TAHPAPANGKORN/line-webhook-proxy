const axios = require('axios');

export default async function handler(req, res) {
  // รับเฉพาะ Method POST จาก LINE
  if (req.method === 'POST') {
    const targetUrl = 'http://playground.informatics.buu.ac.th:10072/line/webhook';
    const signature = req.headers['x-line-signature'];

    console.log('--- Received Webhook from LINE ---');
    
    try {
      // ส่งต่อ (Forward) ข้อมูลทอดไปยัง Server มหาวิทยาลัย
      const response = await axios.post(targetUrl, req.body, {
        headers: {
          'Content-Type': 'application/json',
          'x-line-signature': signature
        },
        timeout: 10000 // กำหนด timeout 10 วินาที
      });

      console.log('--- Successfully forwarded to Uni Server ---');
      return res.status(200).send(response.data);
      
    } catch (error) {
      console.error('--- Forwarding Error ---');
      console.error(error.message);
      
      // ส่งสถานะ 200 กลับไปหา LINE เสมอเพื่อไม่ให้ LINE ส่งซ้ำบ่อยๆ ในช่วงทดสอบ
      // แม้ว่าเครื่องมหาลัยจะดับอยู่ก็ตาม
      return res.status(200).json({ 
        error: 'Proxy could not reach Uni Server',
        details: error.message 
      });
    }
  } else {
    // แสดงหน้าข้อความปกติหากเปิดผ่าน Browser
    return res.status(200).send('Line Webhook Proxy is active. Use POST for webhooks.');
  }
}
