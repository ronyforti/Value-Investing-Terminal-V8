import os
import sys
import argparse
import urllib.request
import json

def get_env_credentials():
    env_path = r"c:\Users\Ronald\antigravity\Value-Investing-Terminal\.env"
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")

    if (not bot_token or not chat_id) and os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("TELEGRAM_BOT_TOKEN="):
                    bot_token = line.split("=", 1)[1].strip("\"' ")
                elif line.startswith("TELEGRAM_CHAT_ID="):
                    chat_id = line.split("=", 1)[1].strip("\"' ")

    return bot_token, chat_id

def send_telegram_alert(title: str, message: str) -> bool:
    bot_token, chat_id = get_env_credentials()
    if not bot_token or not chat_id:
        print("[Telegram Alert Error] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID", file=sys.stderr)
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    formatted_text = f"🤖 <b>Value Investing Terminal</b>\n\n📌 <b>{title}</b>\n\n{message}\n\n👉 <i>Reply in Antigravity chat with your selection.</i>"

    payload = {
        "chat_id": chat_id,
        "text": formatted_text,
        "parse_mode": "HTML"
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("ok"):
                print("[Telegram Alert Success] Message delivered.")
                return True
            else:
                print(f"[Telegram Alert Error] API returned: {data}", file=sys.stderr)
                return False
    except Exception as e:
        print(f"[Telegram Alert Error] Failed to send: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send instant Telegram alert to user")
    parser.add_argument("--title", required=True, help="Alert title")
    parser.add_argument("--message", required=True, help="Alert message body")
    args = parser.parse_args()

    success = send_telegram_alert(args.title, args.message)
    sys.exit(0 if success else 1)
