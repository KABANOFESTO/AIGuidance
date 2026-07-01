export default function handler(req, res) {
  // NextAuth debug logger endpoint. Return 200 to avoid client fetch errors in dev.
  res.status(200).json({ ok: true });
}

