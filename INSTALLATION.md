# Installation Guide

## Prerequisites

- Python 3.8 or higher (`python3 --version`)
- A Readwise account with Reader access — token at readwise.io/access_token
- An Anthropic API key — at console.anthropic.com/settings/keys
- A Gmail account with an App Password (myaccount.google.com → Security → App passwords)
- A GitHub account
- The GitHub CLI (`gh`) — install at cli.github.com
- A Netlify account (free tier)

---

## Step 1: Fork, Authenticate, and Clone

### 1a. Fork the template

Go to [github.com/cam39porter/daily-digest-template](https://github.com/cam39porter/daily-digest-template) and click **Fork** in the top-right corner. This creates your own copy of the repository under your GitHub account — your personalized digest config and archive data will live there.

### 1b. Authenticate the GitHub CLI

The digest script pushes your updated archive to GitHub every time it runs. The `gh` CLI handles authentication so that `git push` works without prompts.

```bash
gh auth login
```

Follow the prompts:
1. Select **GitHub.com**
2. Select **HTTPS**
3. Select **Login with a web browser** (or paste a token)
4. Copy the one-time code shown, press Enter to open the browser, paste the code, and authorize

Verify it worked:
```bash
gh auth status
```

You should see `✓ Logged in to github.com`.

### 1c. Clone your fork and install dependencies

```bash
git clone https://github.com/YOUR_GITHUB/daily-digest-template.git
cd daily-digest-template
pip install -r requirements.txt
```

Replace `YOUR_GITHUB` with your GitHub username.

---

## Step 2: Run Setup

```bash
python3 setup.py
```

The wizard will prompt for:
- Readwise API token
- Anthropic API key
- SMTP server and credentials
- Recipient email address

Configuration is saved to `~/.daily_digest/config.json` with permissions set to 0600 (owner-only).

---

## Step 3: Personalize

**Writing style** — `config/writing_guide.md`
Define who you're writing for, the style reference, output format, and tone rules. This file is passed directly to Claude as part of the prompt.

**Interests filter** — `config/filter_config.json`
Add your portfolio companies, geographies, sectors, themes, and people. The digest will surface direct connections to these entities in every issue.

---

## Step 4: Test

```bash
python3 digest.py
```

Expected output:
```
============================================================
Daily Digest — My Daily Digest
Running at 2026-03-03 07:00:00
============================================================
Fetching recent documents from Readwise Reader...
  Fetching from 'feed'...
  Found 23 documents in 'feed'
  Fetching from 'later'...
  Found 4 documents in 'later'
Total: 27 unique documents from last 24 hours
Generating digest with Claude...
Archived to ~/.daily_digest/archive/synopsis_20260303.json
Updating site data...
Sending email...
Email sent to you@example.com
============================================================
Digest completed successfully
============================================================
```

---

## Step 5: Deploy the Web Archive

### 5a. Confirm your fork is connected

Because you cloned from your fork in Step 1, git is already configured. Verify:

```bash
git remote -v
```

You should see your fork URL listed as `origin`. If so, no further setup is needed — `digest.py` will push automatically on every run.

### 5b. Connect to Netlify

1. Go to app.netlify.com → "Add new site" → "Import an existing project"
2. Connect GitHub and select your repository
3. Build settings:
   - **Build command:** `python3 build_site.py`
   - **Publish directory:** `site`
4. Click "Deploy site"

### 5c. Enable Netlify Forms

In your Netlify dashboard:
1. Go to Site → Forms
2. The subscribe form will appear after the first deploy
3. Set up email notifications: Site → Forms → "subscribe" form → Settings → Email notifications

### 5d. Auto-deploy on new digests

Every time `digest.py` runs, it:
1. Rebuilds `site/data/digests.json` from the local archive
2. Commits the updated file
3. Pushes to GitHub
4. Netlify detects the push and auto-deploys

This means your web archive updates automatically every day.

---

## Step 6: Schedule Daily Runs

### Option A — GitHub Actions (recommended)

GitHub runs `digest.py` on its servers every morning. Your laptop can be off.

#### 6a. Add your secrets to GitHub

In your forked repository, go to **Settings → Secrets and variables → Actions → New repository secret** and add each of the following:

| Secret name | Value |
|---|---|
| `READWISE_TOKEN` | Your Readwise API token |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `SMTP_SENDER_EMAIL` | Your Gmail address |
| `SMTP_SENDER_PASSWORD` | Your Gmail App Password |
| `SMTP_RECIPIENT_EMAIL` | Email address that receives the digest |

#### 6b. The workflow is already included

`.github/workflows/daily-digest.yml` is already in this repository. Once your secrets are added, GitHub Actions will run the digest automatically every day.

#### 6c. Adjust the timezone (optional)

The default schedule runs at noon UTC, which is **7 AM EST / 8 AM EDT**. To change it, edit `.github/workflows/daily-digest.yml` and update the cron line. Use [crontab.guru](https://crontab.guru) to find the right UTC time for your timezone.

```yaml
- cron: '0 12 * * *'  # noon UTC = 7 AM EST
```

#### 6d. Test it manually

Trigger a digest run at any time from the terminal:

```bash
gh workflow run daily-digest.yml
```

Or go to your repository on GitHub → **Actions** → **Daily Digest** → **Run workflow**.

---

### Option B — macOS launchd (local machine)

Use this if you prefer the digest to run locally rather than on GitHub's servers.

Create the plist file:

```bash
cat > ~/Library/LaunchAgents/com.yourname.dailydigest.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.yourname.dailydigest</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/FULL/PATH/TO/daily-digest/digest.py</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>7</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/Users/YOUR_USERNAME/.daily_digest/digest.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/YOUR_USERNAME/.daily_digest/digest.log</string>
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>
EOF
```

Replace `/FULL/PATH/TO/daily-digest/digest.py` and `YOUR_USERNAME` with your actual values.

```bash
launchctl load ~/Library/LaunchAgents/com.yourname.dailydigest.plist
launchctl list | grep dailydigest  # verify it loaded
```

### Option C — cron (Linux / VPS)

```bash
crontab -e
# Add this line (runs at 7:00 AM daily):
0 7 * * * /usr/bin/env python3 /path/to/daily-digest/digest.py >> ~/.daily_digest/digest.log 2>&1
```

---

## Viewing Logs

```bash
tail -f ~/.daily_digest/digest.log
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Configuration file not found` | Run `python3 setup.py` |
| `401 Unauthorized (Readwise)` | Re-enter Readwise token in `python3 setup.py` |
| `Rate limited` | Script auto-retries; check Readwise API status |
| `Email authentication failed` | Use Gmail App Password, not account password |
| `ModuleNotFoundError: dateutil` | Run `pip install -r requirements.txt` |
| `git push` asks for a password | Run `gh auth login` and complete the browser flow |
| `Netlify not deploying` | Check that `site/data/digests.json` is committed and pushed |

---

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| Credentials | `~/.daily_digest/config.json` | API keys and email config (not in git) |
| Daily archives | `~/.daily_digest/archive/synopsis_YYYYMMDD.json` | Raw digest data |
| Logs | `~/.daily_digest/digest.log` | Execution history |
| Writing guide | `config/writing_guide.md` | Style instructions (in git) |
| Filter config | `config/filter_config.json` | Interests profile (in git) |
| Site data | `site/data/digests.json` | Built by build_site.py (in git) |
