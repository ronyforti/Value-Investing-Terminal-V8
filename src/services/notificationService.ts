import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { NotificationConfig, NotificationPayload } from "../types.js";
import { convertMarkdownToHtml } from "../utils/googleDocs.js";

interface DossierDocuments {
  mdBuffer?: Buffer;
  mdFileName: string;
  htmlBuffer?: Buffer;
  htmlFileName: string;
}

/**
 * Resolves or compiles both Markdown and standalone HTML dossiers from a payload.
 */
function resolveDossierDocuments(payload: NotificationPayload): DossierDocuments {
  const ticker = payload.ticker || "Valuation";
  const period = payload.period ? `_${payload.period}` : "";
  let mdFileName = payload.dossierMdFileName || `${ticker}${period}_Report.md`;
  let htmlFileName = payload.dossierHtmlFileName || `${ticker}${period}_Valuation_Dossier.html`;
  let mdBuffer: Buffer | undefined;
  let htmlBuffer: Buffer | undefined;

  let markdownText = "";

  // 1. Resolve Markdown
  if (payload.dossierPath && fs.existsSync(payload.dossierPath)) {
    try {
      mdBuffer = fs.readFileSync(payload.dossierPath);
      mdFileName = payload.dossierMdFileName || path.basename(payload.dossierPath);
      markdownText = mdBuffer.toString("utf-8");
    } catch (e) {
      console.warn("[Notification] Could not read dossierPath:", e);
    }
  } else if (payload.dossierContent) {
    markdownText = payload.dossierContent;
    mdBuffer = Buffer.from(markdownText, "utf-8");
  }

  // 2. Resolve HTML
  if (payload.dossierHtmlPath && fs.existsSync(payload.dossierHtmlPath)) {
    try {
      htmlBuffer = fs.readFileSync(payload.dossierHtmlPath);
      htmlFileName = payload.dossierHtmlFileName || path.basename(payload.dossierHtmlPath);
    } catch (e) {
      console.warn("[Notification] Could not read dossierHtmlPath:", e);
    }
  } else if (payload.dossierHtmlContent) {
    htmlBuffer = Buffer.from(payload.dossierHtmlContent, "utf-8");
  } else if (markdownText) {
    // Generate standalone HTML with embedded flywheel & interactive elements on the fly
    try {
      const docTitle = `${ticker} ${payload.period || ""} Deep Valuation Dossier`.trim();
      const htmlString = convertMarkdownToHtml(markdownText, docTitle, payload.ticker);
      htmlBuffer = Buffer.from(htmlString, "utf-8");
    } catch (htmlGenErr) {
      console.warn("[Notification] Error generating HTML from markdown:", htmlGenErr);
    }
  }

  return { mdBuffer, mdFileName, htmlBuffer, htmlFileName };
}

/**
 * Dispatches a push notification to an ntfy.sh topic.
 */
export async function sendNtfyNotification(
  config: NotificationConfig,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  const topic = config.ntfy?.topic?.trim();
  if (!topic) {
    return { success: false, error: "Missing ntfy topic name." };
  }

  const serverUrl = (config.ntfy.serverUrl?.trim() || "https://ntfy.sh").replace(/\/+$/, "");
  const targetUrl = `${serverUrl}/${encodeURIComponent(topic)}`;

  const isBatch = payload.event === "batch_complete";
  const isBlocked = payload.event === "blocked_alert";
  const isCooldown = payload.event === "cooldown_alert";
  const isRecovered = payload.event === "cooldown_recovered";

  const tags = isBlocked
    ? "warning,octagonal_sign"
    : isBatch
    ? "white_check_mark,chart_with_upwards_trend"
    : "chart_with_upwards_trend,moneybag";

  const cleanTitle = payload.title.replace(/[^\x00-\x7F]/g, "").trim() || "Value Investing Terminal Alert";
  const priority = isBlocked ? "high" : "default";

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Title": cleanTitle,
        "Priority": priority,
        "Tags": tags,
        "Markdown": "yes"
      },
      body: payload.message
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `ntfy server returned HTTP ${res.status}: ${errText}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Escapes HTML characters for Telegram parse_mode: 'HTML'.
 */
function escapeTelegramHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Builds HTML text message for Telegram.
 */
function buildTelegramMessage(payload: NotificationPayload): string {
  const isStart = payload.event === "session_start";
  const isBatch = payload.event === "batch_complete";
  const isBlocked = payload.event === "blocked_alert";
  const isCooldown = payload.event === "cooldown_alert";
  const isRecovered = payload.event === "cooldown_recovered";
  const isModelRequired = payload.event === "model_selection_required";

  const emoji = isStart ? "🚀" : isRecovered ? "✅" : isModelRequired ? "🤖" : isCooldown ? "⏳" : isBlocked ? "🚨" : isBatch ? "🏁" : "📈";
  let text = `${emoji} <b>${escapeTelegramHtml(payload.title)}</b>\n\n`;

  if (payload.message) {
    text += `${escapeTelegramHtml(payload.message)}\n\n`;
  }

  if (isBatch && payload.batchStats) {
    text += `📊 <b>Batch Execution Summary:</b>\n`;
    text += `• Total: <code>${payload.batchStats.total}</code>\n`;
    text += `• Completed: <code>${payload.batchStats.completed}</code>\n`;
    text += `• Failed / Blocked: <code>${payload.batchStats.failed + payload.batchStats.blocked}</code>\n`;
    if (payload.batchStats.tickers && payload.batchStats.tickers.length > 0) {
      text += `• Tickers: <code>${escapeTelegramHtml(payload.batchStats.tickers.join(", "))}</code>\n`;
    }
  } else if (payload.ticker) {
    if (payload.sessionMode) {
      const modeLabel = payload.sessionMode === 'slingshot' ? 'Mode 1: Slingshot Triage' : payload.sessionMode === 'sentinel' ? 'Mode 3: Quarterly Sentinel' : 'Mode 2: Full Institutional Dossier';
      text += `🎯 <b>Mode:</b> <code>${modeLabel}</code>\n`;
    }
    text += `🏢 <b>Company:</b> <code>${escapeTelegramHtml(payload.ticker)}</code> ${payload.companyName ? `(${escapeTelegramHtml(payload.companyName)})` : ""}\n`;
    if (payload.period) text += `📅 <b>Period:</b> ${escapeTelegramHtml(payload.period)}\n`;
    if (payload.price) text += `💵 <b>Market Price:</b> $${escapeTelegramHtml(payload.price)}\n`;
    if (payload.intrinsicValue) text += `🎯 <b>Intrinsic Value:</b> <b>${escapeTelegramHtml(payload.intrinsicValue)}</b>\n`;
    if (payload.marginOfSafety) text += `🛡️ <b>Margin of Safety:</b> <b>${escapeTelegramHtml(payload.marginOfSafety)}</b>\n`;
    if (payload.bolsaMultiple) text += `💰 <b>Bolsa 6.0 10-Yr Multiple:</b> <code>${escapeTelegramHtml(payload.bolsaMultiple)}</code>\n`;
    if (payload.divergenceStatus) text += `⚖️ <b>Dual-Engine Parity:</b> ${escapeTelegramHtml(payload.divergenceStatus)}\n`;
    if (payload.verdict) text += `🏛️ <b>Suggested Action:</b> <b>${escapeTelegramHtml(payload.verdict)}</b>\n`;
  }

  text += `\n<i>Value Investing Terminal V8</i>`;
  return text;
}

/**
 * Dispatches notification to a Telegram Chat / Group via Telegram Bot API.
 */
export async function sendTelegramNotification(
  config: NotificationConfig,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  const botToken = config.telegram?.botToken?.trim() || process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = config.telegram?.chatId?.trim() || process.env.TELEGRAM_CHAT_ID?.trim();

  if (!botToken || !chatId) {
    return { success: false, error: "Missing Telegram botToken or chatId." };
  }

  const messageText = buildTelegramMessage(payload);

  try {
    // 1. Send formatted text message
    const sendRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML"
      })
    });

    const sendData = await sendRes.json();
    if (!sendData.ok) {
      return { success: false, error: sendData.description || `Telegram API HTTP ${sendRes.status}` };
    }

    // 2. If sendDossierDoc is true, send the requested document format(s)
    if (config.telegram?.sendDossierDoc !== false && (payload.dossierPath || payload.dossierContent || payload.dossierHtmlPath || payload.dossierHtmlContent)) {
      const docs = resolveDossierDocuments(payload);
      const format = config.telegram?.docFormat || "both";

      const filesToSend: Array<{ buffer: Buffer; filename: string; caption: string }> = [];

      // Send HTML dossier if requested
      if ((format === "html" || format === "both") && docs.htmlBuffer) {
        filesToSend.push({
          buffer: docs.htmlBuffer,
          filename: docs.htmlFileName,
          caption: `📄 Standalone Valuation Dossier (HTML): ${payload.ticker || "Report"}`
        });
      }

      // Send Markdown dossier if requested
      if ((format === "md" || format === "both") && docs.mdBuffer) {
        filesToSend.push({
          buffer: docs.mdBuffer,
          filename: docs.mdFileName,
          caption: `📄 Valuation Report (Markdown): ${payload.ticker || "Report"}`
        });
      }

      for (const item of filesToSend) {
        try {
          const formData = new FormData();
          formData.append("chat_id", chatId);
          formData.append("caption", item.caption);
          formData.append("document", new Blob([item.buffer]), item.filename);

          const docRes = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
            method: "POST",
            body: formData
          });
          const docData = await docRes.json();
          if (!docData.ok) {
            console.warn(`[Telegram Warning] sendDocument failed for ${item.filename}:`, docData.description);
          }
        } catch (docErr) {
          console.warn(`[Telegram Warning] Error attaching dossier document ${item.filename}:`, docErr);
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Auto-detects the chat ID from the most recent incoming message to the Telegram bot.
 */
export async function detectTelegramChatId(botToken: string): Promise<{
  success: boolean;
  chatId?: string;
  username?: string;
  firstName?: string;
  error?: string;
}> {
  const token = botToken.trim();
  if (!token) {
    return { success: false, error: "Please enter your Telegram Bot Token first." };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {
      method: "GET"
    });
    const data = await res.json();
    if (!data.ok) {
      return { success: false, error: data.description || "Invalid bot token or failed to get updates from Telegram." };
    }

    const updates = data.result || [];
    if (updates.length === 0) {
      return {
        success: false,
        error: "No messages found for this bot yet. Please open your bot in Telegram and send it a message (e.g. /start or 'hi'), then click Auto-Detect again!"
      };
    }

    for (let i = updates.length - 1; i >= 0; i--) {
      const u = updates[i];
      const msg = u.message || u.channel_post || u.edited_message;
      if (msg && msg.chat && msg.chat.id) {
        return {
          success: true,
          chatId: String(msg.chat.id),
          username: msg.chat.username || msg.from?.username,
          firstName: msg.chat.first_name || msg.from?.first_name || msg.chat.title
        };
      }
    }

    return { success: false, error: "Could not find a valid chat in recent bot updates." };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Builds clean HTML email layout for valuation dossiers and batch completion.
 */
function buildHtmlEmail(payload: NotificationPayload): string {
  const isBatch = payload.event === "batch_complete";
  const isBlocked = payload.event === "blocked_alert";

  const headerColor = isBlocked ? "#ef4444" : "#10B981";
  const badgeBg = isBlocked ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)";

  let statsHtml = "";
  if (isBatch && payload.batchStats) {
    statsHtml = `
      <div style="display: flex; gap: 12px; margin: 16px 0; padding: 14px; background-color: #131722; border: 1px solid #1e2536; border-radius: 8px;">
        <div style="flex: 1; text-align: center;">
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">TOTAL QUEUED</div>
          <div style="font-size: 18px; font-weight: bold; color: #f8fafc; font-family: monospace;">${payload.batchStats.total}</div>
        </div>
        <div style="flex: 1; text-align: center;">
          <div style="font-size: 11px; color: #10B981; font-family: monospace;">COMPLETED</div>
          <div style="font-size: 18px; font-weight: bold; color: #10B981; font-family: monospace;">${payload.batchStats.completed}</div>
        </div>
        <div style="flex: 1; text-align: center;">
          <div style="font-size: 11px; color: #f43f5e; font-family: monospace;">FAILED / BLOCKED</div>
          <div style="font-size: 18px; font-weight: bold; color: #f43f5e; font-family: monospace;">${payload.batchStats.failed + payload.batchStats.blocked}</div>
        </div>
      </div>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">
        <strong>Processed Companies:</strong> <span style="font-family: monospace; color: #e2e8f0;">${payload.batchStats.tickers.join(", ") || "None"}</span>
      </div>
    `;
  } else if (payload.ticker) {
    statsHtml = `
      <div style="display: flex; gap: 12px; margin: 16px 0; padding: 14px; background-color: #131722; border: 1px solid #1e2536; border-radius: 8px;">
        <div style="flex: 1; text-align: center;">
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">COMPANY</div>
          <div style="font-size: 18px; font-weight: bold; color: #38bdf8; font-family: monospace;">${payload.ticker}</div>
        </div>
        <div style="flex: 1; text-align: center;">
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">PERIOD</div>
          <div style="font-size: 18px; font-weight: bold; color: #f8fafc; font-family: monospace;">${payload.period || "Latest"}</div>
        </div>
        <div style="flex: 1; text-align: center;">
          <div style="font-size: 11px; color: #10B981; font-family: monospace;">MARKET PRICE</div>
          <div style="font-size: 18px; font-weight: bold; color: #10B981; font-family: monospace;">$${payload.price || "N/A"}</div>
        </div>
      </div>
    `;
  }

  const formattedMsg = payload.message.replace(/\n/g, "<br/>");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${payload.title}</title>
  </head>
  <body style="margin: 0; padding: 24px; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #0e1422; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);">
      <!-- Header Bar -->
      <div style="background-color: #131825; padding: 20px 24px; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">VALUE INVESTING TERMINAL</div>
          <h2 style="margin: 4px 0 0 0; font-size: 18px; color: #f8fafc;">${payload.title}</h2>
        </div>
      </div>

      <!-- Content Area -->
      <div style="padding: 24px;">
        <div style="display: inline-block; padding: 4px 10px; background-color: ${badgeBg}; color: ${headerColor}; border: 1px solid ${headerColor}; border-radius: 9999px; font-size: 11px; font-weight: 600; font-family: monospace; text-transform: uppercase; margin-bottom: 12px;">
          ${payload.event.replace("_", " ")}
        </div>

        ${statsHtml}

        <div style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-top: 16px; padding: 16px; background-color: #111625; border-radius: 8px; border: 1px solid #1e2536;">
          ${formattedMsg}
        </div>

        ${(payload.dossierPath || payload.dossierContent || payload.dossierHtmlPath || payload.dossierHtmlContent) ? `
          <div style="margin-top: 16px; font-size: 12px; color: #38bdf8; font-family: monospace;">
            📎 Full Valuation Dossiers attached: Standalone HTML (with interactive charts &amp; flywheel graphics) &amp; Markdown (.md).
          </div>
        ` : ""}
      </div>

      <!-- Footer -->
      <div style="padding: 14px 24px; background-color: #090d16; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; text-align: center; font-family: monospace;">
        Automated Valuation Notification • Value Investing Terminal
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Dispatches an email via Resend API or Nodemailer SMTP with both HTML and Markdown dossiers attached.
 */
export async function sendEmailNotification(
  config: NotificationConfig,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  const toEmail = config.email?.to?.trim() || process.env.NOTIFICATION_EMAIL_TO?.trim();
  if (!toEmail) {
    return { success: false, error: "Missing recipient email address." };
  }

  const html = buildHtmlEmail(payload);
  const docs = resolveDossierDocuments(payload);
  const attachments: Array<{ filename: string; buffer: Buffer }> = [];

  // 1. Attach standalone HTML dossier (with embedded flywheel & interactive elements)
  if (docs.htmlBuffer) {
    attachments.push({
      filename: docs.htmlFileName,
      buffer: docs.htmlBuffer
    });
  }

  // 2. Attach Markdown report
  if (docs.mdBuffer) {
    attachments.push({
      filename: docs.mdFileName,
      buffer: docs.mdBuffer
    });
  }

  // --- Provider: Resend API ---
  if (config.email.provider === "resend") {
    const apiKey = config.email.resendApiKey?.trim() || process.env.RESEND_API_KEY;
    if (!apiKey) {
      return { success: false, error: "Missing Resend API Key. Enter it in Notification Settings or set RESEND_API_KEY." };
    }

    const fromAddress = config.email.from?.trim() || "Value Investing Terminal <onboarding@resend.dev>";

    const resendAttachments = attachments.map(att => ({
      filename: att.filename,
      content: att.buffer.toString("base64")
    }));

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toEmail],
          subject: payload.title,
          html,
          attachments: resendAttachments.length > 0 ? resendAttachments : undefined
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, error: `Resend error (${res.status}): ${errJson.message || res.statusText}` };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || String(err) };
    }
  }

  // --- Provider: Nodemailer SMTP ---
  if (config.email.provider === "smtp") {
    const host = config.email.smtpHost?.trim() || process.env.SMTP_HOST;
    const port = Number(config.email.smtpPort || process.env.SMTP_PORT || 587);
    const user = config.email.smtpUser?.trim() || process.env.SMTP_USER;
    const pass = config.email.smtpPass?.trim() || process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      return { success: false, error: "Incomplete SMTP settings (Host, Username, or Password missing)." };
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });

      await transporter.sendMail({
        from: config.email.from?.trim() || user,
        to: toEmail,
        subject: payload.title,
        html,
        attachments: attachments.map(a => ({
          filename: a.filename,
          content: a.buffer
        }))
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || String(err) };
    }
  }

  return { success: false, error: "Unsupported email provider selected." };
}

/**
 * Main dispatcher: Sends to all enabled notification channels.
 */
export async function dispatchNotification(
  config: NotificationConfig | null | undefined,
  payload: NotificationPayload
): Promise<{
  ntfy?: { success: boolean; error?: string };
  telegram?: { success: boolean; error?: string };
  email?: { success: boolean; error?: string };
}> {
  if (!config || !config.enabled) {
    return {};
  }

  // Check event trigger filtering
  if (payload.event === "single_complete" && !config.events?.singleCompany) {
    return {};
  }
  if (payload.event === "batch_complete" && !config.events?.batchComplete) {
    return {};
  }
  if (payload.event === "batch_company" && !config.events?.batchCompany) {
    return {};
  }
  if ((payload.event === "blocked_alert" || payload.event === "cooldown_alert" || payload.event === "cooldown_recovered") && !config.events?.blockedAlert) {
    return {};
  }
  if ((payload.event === "flex_gatekeeper_engaged" || payload.event === "flex_gatekeeper_launched") && !config.events?.blockedAlert && !config.events?.singleCompany) {
    return {};
  }

  const results: {
    ntfy?: { success: boolean; error?: string };
    telegram?: { success: boolean; error?: string };
    email?: { success: boolean; error?: string };
  } = {};

  // 1. Telegram Bot Notification
  if (config.channels?.telegram) {
    console.log(`[Notification Dispatcher] Sending Telegram notification: "${payload.title}"`);
    results.telegram = await sendTelegramNotification(config, payload);
    if (!results.telegram.success) {
      console.warn(`[Notification Warning] Telegram failed:`, results.telegram.error);
    }
  }

  // 2. ntfy.sh Mobile Push
  if (config.channels?.ntfy) {
    console.log(`[Notification Dispatcher] Sending ntfy.sh push: "${payload.title}"`);
    results.ntfy = await sendNtfyNotification(config, payload);
    if (!results.ntfy.success) {
      console.warn(`[Notification Warning] ntfy push failed:`, results.ntfy.error);
    }
  }

  // 3. Email Delivery
  if (config.channels?.email) {
    console.log(`[Notification Dispatcher] Sending email notification: "${payload.title}" to ${config.email?.to}`);
    results.email = await sendEmailNotification(config, payload);
    if (!results.email.success) {
      console.warn(`[Notification Warning] Email failed:`, results.email.error);
    }
  }

  return results;
}
