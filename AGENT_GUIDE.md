# Agent Guide — Building a Daily Digest with Claude Code

This guide is for use with Claude Code (or any AI coding assistant). It contains the prompts and step-by-step sequences for building this system from scratch during a tutorial or solo session.

---

## What You're Building

A personal daily digest that:
- Pulls articles from Readwise Reader every 24 hours
- Filters them based on your interests (companies, sectors, geographies)
- Generates an analysis in your writing style using Claude
- Delivers by email and publishes to a searchable web archive on Netlify

---

## Prerequisites to Verify First

Before starting any prompts, confirm the student has:
- [ ] A Readwise account with Reader enabled — get token at readwise.io/access_token
- [ ] An Anthropic API key — get at console.anthropic.com/settings/keys
- [ ] A Gmail account with an App Password configured (myaccount.google.com → Security → App passwords)
- [ ] A GitHub account
- [ ] A Netlify account (free tier)
- [ ] Python 3.8+ installed (`python3 --version`)
- [ ] Claude Code installed (`claude --version`)

---

## Part 1: Initial Setup Prompt

Paste this into Claude Code at the start of a session after cloning the repository:

```
I'm setting up the daily-digest-template. Please help me:

1. Install the Python dependencies: pip install -r requirements.txt
2. Run the setup wizard: python3 setup.py
3. Walk me through filling in config/writing_guide.md with my personal style
4. Walk me through filling in config/filter_config.json with my interests

After setup, run python3 digest.py to test the system end to end.
```

---

## Part 2: Personalizing the Writing Guide

Use this prompt to help a student fill in their writing guide:

```
I need to fill in config/writing_guide.md to define my personal digest style.

Here's who I am: [STUDENT DESCRIBES THEIR ROLE AND FOCUS]

I want my digest to sound like: [WRITER OR STYLE REFERENCE]

Key things I want to emphasize: [2-3 ANALYTICAL PRIORITIES]

Please read config/writing_guide.md and update it with my information.
Keep all the structural sections but replace the placeholder text with
my actual preferences. The file should be ready to use as a Claude prompt.
```

---

## Part 3: Configuring the Filter Document

Use this prompt to populate their filter config:

```
I need to fill in config/filter_config.json with my specific interests.

Here is what I want to track:

Portfolio companies / key entities I care about:
[LIST EACH WITH: name, what they do, their keywords]

Geographies I care about:
[LIST EACH WITH: region name, why it matters to me]

Industries / sectors I focus on:
[LIST EACH WITH: industry name, key keywords]

Macro themes I track:
[LIST EACH WITH: theme name, keywords]

People I track:
[LIST EACH WITH: name, their role, why they matter]

Please read config/filter_config.json and update it with this information.
Remove any example entries. Add as many portfolio companies as I listed.
Make sure keywords are specific enough to reliably surface relevant articles.
```

---

## Part 4: Testing and Debugging

```
Run python3 digest.py and tell me:
1. How many documents were fetched from Readwise
2. How many were marked as priority
3. Whether the Claude API call succeeded
4. Whether the email was sent
5. Whether the site data was updated

If any step failed, show me the error and suggest a fix.
```

---

## Part 5: Deploying the Web Archive

### Step 1 — Initialize git

```
Help me set up this repository for GitHub and Netlify deployment:

1. Initialize git if not already done
2. Create a .gitignore that excludes:
   - ~/.daily_digest/ (credentials and archive — these are local only)
   - __pycache__/
   - *.pyc
   - .env
   - site/data/digests.json (this gets generated, not committed)
3. Create an initial commit with all the template files
4. Push to a new GitHub repository named "daily-digest"
5. Tell me the GitHub URL so I can connect it to Netlify
```

### Step 2 — Connect to Netlify

```
I've pushed my repository to GitHub. Help me deploy the web archive to Netlify:

1. The GitHub repo URL is: [PASTE URL]
2. Walk me through connecting it in the Netlify dashboard
3. The build command is: python3 build_site.py
4. The publish directory is: site
5. Explain how the auto-deploy works when I push new digest data
```

### Step 3 — Enable the subscribe form

```
The site has a subscribe form using Netlify Forms. Help me:
1. Enable Netlify Forms in my Netlify dashboard
2. Test the subscribe form
3. Set up a notification so I get an email when someone subscribes
4. (Optional) Export subscriber emails to add to my email sends
```

---

## Part 6: Scheduling the Daily Run

### macOS

```
Help me schedule digest.py to run automatically at 7 AM every day on my Mac.
Use launchd (not cron) because it's more reliable on macOS.

The script is at: [PASTE FULL PATH to digest.py]
I want logs saved to: ~/.daily_digest/digest.log

Create the launchd plist file and install it.
```

### Linux / Server

```
Help me add a cron job to run digest.py daily at 7 AM.
The script is at: [PASTE FULL PATH to digest.py]
I want logs saved to: ~/.daily_digest/digest.log

Show me the exact crontab entry and how to verify it's running.
```

---

## Part 7: Extending the System

Use these prompts for common extensions:

### Add a new section to the digest

```
I want to add a new section to my daily digest called "[SECTION NAME]".
It should cover: [DESCRIPTION]
It should appear after [EXISTING SECTION] in the output.

Please update config/writing_guide.md to include instructions for this section,
and update the section template in digest.py to include it in the Claude prompt.
```

### Add more portfolio companies or interests

```
I want to add new entries to my filter_config.json:

New portfolio company:
- Name: [NAME]
- Description: [WHAT THEY DO]
- Keywords: [LIST]
- Website: [SITE]

Please read config/filter_config.json and add this entry.
```

### Change the writing style

```
I want to change my digest writing style. Currently it mimics [CURRENT STYLE].
I want it to sound more like [NEW STYLE REFERENCE] — specifically:
[2-3 CHARACTERISTICS OF THE NEW STYLE]

Please read config/writing_guide.md and update the Style Reference and
Style Characteristics sections.
```

### Add Slack delivery

```
In addition to email, I want the digest sent to a Slack channel.
The Slack webhook URL is: [PASTE URL]

Please add a send_slack() method to digest.py that posts the digest
as a formatted Slack message. Call it from the run() method after send_email().
```

---

## Master Tutorial Prompt

If you want to run the entire setup in one session, paste this as the opening prompt:

```
I'm building a personalized daily digest system using the daily-digest-template.
The system should:
1. Pull articles from my Readwise Reader feed daily
2. Filter them based on my specific interests (I'll describe them)
3. Generate an analysis in my writing style using Claude
4. Send it to my email and publish to a web archive

Please guide me through the full setup:
- Run setup.py to configure my API keys
- Help me fill in writing_guide.md and filter_config.json with my real information
- Test the system end to end with python3 digest.py
- Deploy the web archive to Netlify
- Set up a daily cron/launchd job

Start by asking me about my role, what I care about, and who my writing influences are.
Then proceed with the setup steps one at a time, waiting for my confirmation before moving to the next step.
```

---

## Common Issues

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| `No documents found` | Readwise feed is empty or token is wrong | Check readwise.io/access_token; confirm you have articles in your Reader feed |
| `401 Unauthorized` | Readwise token is invalid | Re-run `python3 setup.py` and re-enter the token |
| `Anthropic API error` | API key wrong or quota exceeded | Check console.anthropic.com/settings/keys |
| Email not sending | Gmail App Password not set up | See myaccount.google.com → Security → App passwords |
| Netlify not deploying | `digests.json` not being committed | Ensure `site/data/digests.json` is NOT in .gitignore; the auto-deploy depends on this file being pushed |
| `ModuleNotFoundError: dateutil` | Dependencies not installed | Run `pip install -r requirements.txt` |
