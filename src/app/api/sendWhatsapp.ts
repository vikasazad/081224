export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { phoneNumber, variables } = req.body; // Get phone number & template variables from request

  try {
    const response = await fetch(
      "https://graph.facebook.com/v22.0/616505061545755/messages",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer EAAWQxktyBZBkBO2e9FlcQuaFKfi36Ltk8kzul4DKhti5PiBlsDCGx1izWoHjhqq78ARdlwPv8Mc1d1HUV2oXktcEb6VALHGhknZAkUGIe5XKw5ZAiCGeUpGIlt0kDK6pIE3vCSwrjXNxZBZAMM4uOEdWrYZBdSLRZAvCslZCrL1IlhE6mFcYazQL9kv57WjNEL0ZCmjYlMRQOpcHWY5ciZAsKY1bo1xfx33IFbjZAlQpGLBVRAZD`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneNumber,
          type: "template",
          template: {
            name: "booking",
            language: { code: "en_US" },
            components: [
              {
                type: "header",
                parameters: [{ type: "text", text: "Vikas Kumar" }],
              },
              {
                type: "body",
                parameters: variables
                  .slice(1)
                  .map((value: any) => ({ type: "text", text: value })),
              },
            ],
          },
        }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(400).json({ success: false, error: data });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
