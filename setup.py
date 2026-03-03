#!/usr/bin/env python3
"""
Setup wizard for Daily Digest Automation.

Run once to configure your API keys and email settings.
After setup, edit config/writing_guide.md and config/filter_config.json
to personalize your digest.
"""

import json
import os
import sys
from pathlib import Path

CONFIG_DIR = Path.home() / ".daily_digest"
CONFIG_FILE = CONFIG_DIR / "config.json"


def prompt(text: str, default: str = "", password: bool = False) -> str:
    if default:
        display = f"{text} [{default}]: "
    else:
        display = f"{text}: "

    if password:
        import getpass
        value = getpass.getpass(display)
    else:
        value = input(display).strip()

    return value if value else default


def main():
    print()
    print("=" * 60)
    print("  Daily Digest — Setup Wizard")
    print("=" * 60)
    print()
    print("This wizard configures your API keys and email settings.")
    print("After setup, personalize your digest by editing:")
    print("  config/writing_guide.md   — writing style")
    print("  config/filter_config.json — companies, sectors, geographies")
    print()

    CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    # Load existing config if it exists
    existing = {}
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            existing = json.load(f)
        print("Found existing config. Press Enter to keep current values.")
        print()

    # ----------------------------------------------------------------
    # Readwise token
    # ----------------------------------------------------------------
    print("1. READWISE API TOKEN")
    print("   Get yours at: https://readwise.io/access_token")
    readwise_token = prompt("   Readwise token", existing.get("readwise_token", ""), password=True)
    print()

    # ----------------------------------------------------------------
    # Anthropic API key
    # ----------------------------------------------------------------
    print("2. ANTHROPIC API KEY (for Claude)")
    print("   Get yours at: https://console.anthropic.com/settings/keys")
    anthropic_key = prompt("   Anthropic API key", existing.get("anthropic_api_key", ""), password=True)
    print()

    # ----------------------------------------------------------------
    # Email configuration
    # ----------------------------------------------------------------
    print("3. EMAIL CONFIGURATION")
    print("   Gmail recommended. Use an App Password, not your account password.")
    print("   How to create a Gmail App Password:")
    print("     myaccount.google.com → Security → 2-Step Verification → App passwords")
    print()

    existing_email = existing.get("email", {})
    smtp_server = prompt("   SMTP server", existing_email.get("smtp_server", "smtp.gmail.com"))
    smtp_port = int(prompt("   SMTP port", str(existing_email.get("smtp_port", 587))))
    sender_email = prompt("   Sender email address", existing_email.get("sender_email", ""))
    sender_password = prompt("   Sender email password/app password", existing_email.get("sender_password", ""), password=True)
    recipient_email = prompt("   Recipient email (who receives the digest)", existing_email.get("recipient_email", sender_email))
    print()

    # ----------------------------------------------------------------
    # Build config
    # ----------------------------------------------------------------
    config = {
        "readwise_token": readwise_token,
        "anthropic_api_key": anthropic_key,
        "email": {
            "smtp_server": smtp_server,
            "smtp_port": smtp_port,
            "sender_email": sender_email,
            "sender_password": sender_password,
            "recipient_email": recipient_email,
        },
    }

    # Restrict file permissions before writing sensitive data
    CONFIG_FILE.touch(mode=0o600, exist_ok=True)
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)
    CONFIG_FILE.chmod(0o600)

    print(f"Config saved to: {CONFIG_FILE}")
    print()

    # ----------------------------------------------------------------
    # Scheduling instructions
    # ----------------------------------------------------------------
    print("4. SCHEDULE YOUR DIGEST")
    print()
    print("   Option A — macOS launchd (runs even if crontab is disabled):")
    print(f"   See INSTALLATION.md for launchd instructions.")
    print()
    print("   Option B — cron job:")
    print("   Run: crontab -e")
    print("   Add: 0 7 * * * /usr/bin/env python3", str(Path(__file__).parent / "digest.py"), ">> ~/.daily_digest/digest.log 2>&1")
    print()

    # ----------------------------------------------------------------
    # Next steps
    # ----------------------------------------------------------------
    print("=" * 60)
    print("NEXT STEPS")
    print("=" * 60)
    print()
    print("1. Personalize your writing style:")
    print("   nano config/writing_guide.md")
    print()
    print("2. Add your portfolio companies, sectors, and geographies:")
    print("   nano config/filter_config.json")
    print()
    print("3. Test your setup:")
    print("   python3 digest.py")
    print()
    print("4. Deploy your archive site to Netlify:")
    print("   See INSTALLATION.md → 'Netlify Deployment'")
    print()
    print("Setup complete.")
    print()


if __name__ == "__main__":
    main()
