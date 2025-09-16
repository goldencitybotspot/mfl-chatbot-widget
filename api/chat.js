// /api/chat.js
export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Quick sanity check in the browser:
      return res.status(200).json({ ok: true, msg: "Hello from MFL bot" });
    }

    if (req.method === "POST") {
      // Example POST body: { "messages": [{ "role": "user", "content": "Hello" }] }
      const { messages } = req.body || {};
      return res.status(200).json({
        ok: true,
        echo: messages ?? "No messages provided",
      });
    }

    // Any other method
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
