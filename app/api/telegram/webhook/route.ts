import { NextRequest, NextResponse } from "next/server";
import { handleUpdate, TelegramUpdate } from "@/lib/telegram";

// Verify webhook secret (optional security)
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    // Optional: Verify webhook secret from header
    if (WEBHOOK_SECRET) {
      const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
      if (secret !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const update: TelegramUpdate = await request.json();

    // Process update asynchronously
    handleUpdate(update).catch((error) => {
      console.error("Error processing Telegram update:", error);
    });

    // Always return 200 OK quickly to Telegram
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true }); // Still return 200 to prevent retries
  }
}

// For setting up webhook
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
  }

  if (action === "set") {
    // Set webhook - use WEBHOOK_URL if set, otherwise use VERCEL_URL
    const webhookUrl = process.env.WEBHOOK_URL || `https://${process.env.VERCEL_URL}/api/telegram/webhook`;
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message"],
          secret_token: WEBHOOK_SECRET || undefined,
        }),
      }
    );
    const result = await response.json();
    return NextResponse.json({ action: "setWebhook", webhookUrl, result });
  }

  if (action === "delete") {
    // Delete webhook
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`
    );
    const result = await response.json();
    return NextResponse.json({ action: "deleteWebhook", result });
  }

  if (action === "info") {
    // Get webhook info
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );
    const result = await response.json();
    return NextResponse.json({ action: "getWebhookInfo", result });
  }

  return NextResponse.json({
    message: "Telegram Webhook Endpoint",
    actions: {
      set: "?action=set - Set webhook URL",
      delete: "?action=delete - Delete webhook",
      info: "?action=info - Get webhook info",
    },
  });
}
