import QRCode from "qrcode";

// Config merchant
const MERCHANT_NAME = "LEVI STORE";
const NMID = "ID1025374771794"; // ganti dengan NMID kamu

// Generator payload QRIS sederhana
function generateQrisPayload(nmid, amount, orderId, desc) {
  let base = `00020101021126690015ID.CO.QRIS.WWW0118936009${nmid}520400005303360540${amount}5802ID5909${MERCHANT_NAME}6007Jakarta6207${orderId}6304`;
  if (desc) base += desc;
  return base;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { amount, order_id, description } = req.body;

    if (!order_id) {
      return res.status(400).json({ success: false, message: "order_id wajib" });
    }
    if (amount < 0) {
      return res.status(400).json({ success: false, message: "amount tidak valid" });
    }

    const qrisPayload = generateQrisPayload(NMID, amount, order_id, description);

    // QR code base64
    const qrBase64 = await QRCode.toDataURL(qrisPayload, {
      width: 600,
      margin: 2,
    });

    return res.status(200).json({
      success: true,
      merchant_name: MERCHANT_NAME,
      nmid: NMID,
      order_id,
      amount,
      description,
      qris_payload: qrisPayload,
      qris_base64_png: qrBase64,
      expiry_iso: new Date(Date.now() + 30 * 60000).toISOString(), // default 30 menit
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "internal error" });
  }
}