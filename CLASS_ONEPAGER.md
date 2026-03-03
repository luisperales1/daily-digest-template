# Build Your Own Intelligence System
### A One-Hour Workshop

---

## The Premise

Most knowledge workers read the same publications. They consume information reactively — whatever hits their inbox. The result is that everyone's mental model of their industry is basically the same, shaped by the same distribution channels.

What if you could design your own information diet? Not just decide *what* to subscribe to, but build a system that reads everything for you, filters it to what's actually relevant to your world, and delivers it in a format that respects your intelligence?

That's what we're building today. A personal intelligence system — your daily digest.

---

## Three Principles for Building With AI

Before we write a line of code, let's talk about what kinds of tools are worth building. Most AI projects fail not because the technology doesn't work, but because the problem was wrong. Here are three principles for finding the right problems.

### 1. Software is communication — don't automate what's already standardized

Software is language that runs. It encodes how people interact, what they expect from systems, how institutions operate. When you build software that replaces a standardized communication process — the way contracts are filed, how invoices are submitted, how compliance is reported — you're competing with institutional inertia, regulatory capture, and the switching costs of hundreds of other parties. That's a hard fight.

Build tools for *yourself first*. Solve the problems that are obvious to you because of your specific role, your specific relationships, your specific workflow. The best tools start as tools one person needed badly enough to build.

### 2. Build what's obvious and legible to you from your experience

Every industry has well-known problems. Everyone knows that healthcare billing is broken, that compliance documentation is redundant, that supply chain visibility is poor. Those problems are well-known because dozens of well-funded companies are already trying to solve them.

The interesting problems are the ones that are obvious to you but illegible to outsiders. The workflow friction that exists because of how your specific domain works. The information gap that only someone in your position would even notice. The question you ask ten times a week that no existing tool answers.

Your competitive advantage as a builder is your domain knowledge. The AI handles the code. You bring the understanding of what problem is worth solving.

### 3. Build tools that capture proprietary data flows

Information that's obvious to you isn't obvious to everyone. The articles you save, the newsletters you subscribe to, the signals you've trained yourself to notice — that's a proprietary data asset. You've built a filter over years of domain experience, and that filter is valuable.

AI tools get dramatically better when you feed them context that's specific to your situation. The digest we're building today is a perfect example: by telling the system about your portfolio companies, your sectors, your geography of interest, you're turning a generic summarizer into something that gives you answers no one else is getting.

The data that lives in your head — your network, your experience, your sense of what matters — can now be encoded and leveraged systematically. That's new. That's what we're doing today.

---

## What We're Building

A personalized daily digest that:
1. Pulls everything new from your Readwise Reader feed (newsletters, saved articles, RSS)
2. Filters it against a profile you define — companies, sectors, geographies, people you care about
3. Sends it to Claude with your personal writing style guide
4. Delivers a structured email digest every morning
5. Publishes to a searchable web archive anyone can subscribe to

**The output isn't a summary. It's an analysis — written in the voice you configure, organized around what you care about.**

---

## Workshop Schedule (60 minutes)

| Time | Activity |
|------|----------|
| 0:00 | Preamble — the three principles, what we're building |
| 0:10 | Account setup check — Readwise, Anthropic, GitHub, Netlify |
| 0:15 | Clone the template repository, run setup.py |
| 0:25 | Fill in your writing_guide.md — who are you writing for, what's your style |
| 0:35 | Fill in your filter_config.json — your companies, sectors, geographies |
| 0:45 | Run the digest for the first time, review the output |
| 0:50 | Deploy the web archive to Netlify, enable subscribe form |
| 0:55 | Set up GitHub Actions — add repository secrets, test manual trigger |
| 0:58 | Q&A and what to build next |

---

## Accounts to Set Up Before the Workshop

Each participant needs these accounts. Each takes 5–10 minutes.

1. **Claude Code** — [claude.ai/claude-code](https://claude.ai/claude-code)
   - *An AI assistant you talk to in plain English that writes, edits, and runs code on your computer — think of it as a software engineer you can direct through conversation.*
   - Download and install the CLI
   - Authenticate with your Anthropic account

2. **Anthropic Console** — [console.anthropic.com](https://console.anthropic.com)
   - *The control panel for Anthropic's AI — where you create the "API key" (a password) that lets your digest script call Claude on your behalf.*
   - Create an account
   - Go to Settings → API Keys → Create new key
   - Keep the key — you'll enter it in setup.py

3. **Readwise Reader** — [readwise.io](https://readwise.io)
   - *A reading app that collects everything you want to read — newsletters, articles, RSS feeds — into one place; it's the inbox your digest pulls from every morning.*
   - Create an account ($7.99/month, free trial available)
   - Go to readwise.io/access_token and copy your token
   - **Before the workshop: subscribe to at least 5 newsletters or save 5 articles** so the feed has content to work with

4. **GitHub** — [github.com](https://github.com)
   - *A website where developers store and share code — think of it as Google Drive for code, where your digest configuration and web archive live so Netlify can publish them automatically.*
   - Create an account
   - Fork the template repository: [github.com/cam39porter/daily-digest-template](https://github.com/cam39porter/daily-digest-template)

5. **Netlify** — [netlify.com](https://netlify.com)
   - *A free hosting service that turns your GitHub repository into a live website — it watches for updates and automatically republishes your web archive every time a new digest runs.*
   - Create an account (free tier is sufficient)
   - You'll connect it to GitHub during the workshop

6. **Gmail App Password** (for email delivery)
   - Go to myaccount.google.com → Security → 2-Step Verification → App passwords
   - Create an app password for "Mail"
   - Write it down — you'll need it in setup.py

---

## Key Commands Reference

```bash
# Install dependencies
pip install -r requirements.txt

# Run the one-time setup wizard
python3 setup.py

# Test your digest locally
python3 digest.py

# Trigger a digest run via GitHub Actions (from anywhere, any time)
gh workflow run daily-digest.yml

# Rebuild the site archive
python3 build_site.py
```

---

## What to Build After This

Today's workshop builds the foundation. Here are natural next steps for each use case:

**Investors / Fund managers**
- Add all portfolio companies to filter_config.json with detailed keywords
- Add a "Competitive Landscape" section to writing_guide.md
- Connect the subscribe form to a Beehiiv or Substack to grow a readership

**Operators / Executives**
- Track your industry's top publications and competitive signals
- Add a "Customer Signal" section that surfaces news about your key accounts
- Build a Slack integration to deliver the digest to your team channel

**Researchers / Analysts**
- Add academic preprint servers (arXiv, SSRN) as Readwise RSS sources
- Add a "Methodology Notes" section for research-specific analysis
- Export the archive data to build a searchable knowledge base

**Founders**
- Track your market, your investors, and your target customers
- Add a "Founder Signal" section for fundraising and hiring news
- Share the digest publicly as a thought leadership channel

---

## The Broader Point

What we built today takes about an hour to set up and costs roughly $10/month to run. It replaces something that would otherwise take 30–60 minutes of manual reading and synthesis every day — or just wouldn't happen at all.

The value isn't in the code. The code is simple. The value is in the configuration: your writing guide, your filter document, your list of what matters. That configuration is the encoded expertise that makes the output yours and not anyone else's.

This is the right way to think about AI tools: not as replacements for expertise, but as amplifiers of it. The AI handles the mechanical work of reading, filtering, and writing to a specification. You supply the specification. Your knowledge — your sense of what's signal and what's noise, what's relevant and what's not — is the irreplaceable ingredient.

Build tools that make your expertise more leverageable. That's the principle. Today was one example.

---

*Template repository: [github.com/cam39porter/daily-digest-template](https://github.com/cam39porter/daily-digest-template)*
*Built with Claude Code + Readwise Reader + Anthropic API + Netlify*
