# Lifetime-Free Website Form Integration Routes
**Project:** CBGIPL (Carter Brown Global Infra Pvt Ltd)  
**Document Purpose:** Research & Implementation Options for Lifetime-Free Contact Form Submissions on Static / Jamstack Websites (GitHub Pages / Hostinger / Custom Domain).

---

## 1. Executive Summary

Static websites hosted on GitHub Pages or static web servers do not have an active server-side runtime (PHP/Node/Python) running by default. To capture form submissions from visitors without incurring ongoing subscription fees, we can use third-party APIs, serverless webhooks, or native platform automations.

All options listed below have **permanent free tiers ($0/month for lifetime)** suitable for corporate B2B inquiry volumes.

---

## 2. Comparison Matrix

| # | Route | Destination | Lifetime Free Limit | Setup Time | Branding / Ads | Best For |
|---|---|---|---|---|---|---|
| **1** | **Google Sheets + Apps Script** | Google Sheet + Gmail Inbox | **Unlimited** (Google standard quotas) | ~5 mins | **Zero branding** | **Primary Recommendation** (Lead Database + Email) |
| **2** | **FormSubmit.co** | Direct to Email Inbox | **Unlimited** submissions | 1 min | None | Easiest zero-code setup |
| **3** | **Web3Forms** | Direct to Email Inbox | **250 submissions / month** | 2 mins | None | Clean REST API with custom UI |
| **4** | **Cloudflare Worker + Resend** | Email / Webhook / DB | **3,000 emails/mo** + 100k req/day | ~10 mins | None | Enterprise-grade custom domains |
| **5** | **Telegram Bot API** | Mobile & Desktop Push | **Unlimited** alerts | ~3 mins | None | Instant team notification on phone |
| **6** | **WhatsApp Click-to-Chat** | Sales WhatsApp Chat | **Unlimited** | 2 mins | None | Immediate conversion & chatting |

---

## 3. Deep Dive into the Top Routes

### Option 1: Google Sheets + Google Apps Script (Recommended)
- **How It Works:** When a user submits the form, JavaScript sends a `POST` request with JSON data to a free Google Apps Script Web App. The script automatically inserts a new row into your private Google Sheet and sends an email alert to your team via Gmail.
- **Where Data Goes:**
  1. **Google Sheet:** Records Date, Full Name, Email, Phone, Inquiry Type, Message. Acts as a free CRM.
  2. **Email Alert:** Sends an instant notification to `info@cbgipl.com` or any designated inbox.
- **Lifetime Limits:** 100% Free forever (Google Apps Script free tier allows up to 20,000 executions/day and 100 emails/day for free Gmail; 1,500 emails/day for Google Workspace).
- **Setup Effort:** Create a Google Sheet & paste 25 lines of Google Apps Script once.

### Option 2: FormSubmit.co (Zero-Code Drop-In)
- **How It Works:** Change the `<form>` `action` attribute directly to FormSubmit's endpoint:
  ```html
  <form action="https://formsubmit.co/your-email@cbgipl.com" method="POST">
  ```
- **Where Data Goes:** Formatted directly into your email inbox.
- **Lifetime Limits:** Unlimited free submissions.
- **Setup Effort:** 1 minute. First submission sends a one-time activation link to verify your email.

### Option 3: Web3Forms (Seamless AJAX / Fetch)
- **How It Works:** Register your email on web3forms.com to receive an Access Key. Then submit the form data using standard JavaScript `fetch()` without any page redirect.
- **Where Data Goes:** Directly to your inbox.
- **Lifetime Limits:** 250 submissions/month free for life.
- **Setup Effort:** 2 minutes.

### Option 4: Cloudflare Workers + Resend (Enterprise Architecture)
- **How It Works:** A lightweight serverless JavaScript worker runs on Cloudflare’s edge network, validates the inputs, and dispatches an email through Resend’s API.
- **Where Data Goes:** Delivered from a custom domain (e.g., `notifications@cbgipl.com`) to your executive team.
- **Lifetime Limits:** Cloudflare gives 100,000 requests/day free; Resend gives 3,000 emails/month free.
- **Setup Effort:** 10 minutes (requires domain DNS verification).

### Option 5: Telegram Bot API (Instant Mobile Notifications)
- **How It Works:** Create a free Telegram bot via `@BotFather` and add it to a private group with the CBGIPL leadership team. JavaScript pings the bot with the lead details on form submit.
- **Where Data Goes:** Instant sound notification and message on everyone’s phone/desktop in the Telegram app.
- **Lifetime Limits:** Unlimited and completely free.
- **Setup Effort:** 3 minutes.

### Option 6: Direct WhatsApp Dispatch
- **How It Works:** The form submit button generates a pre-filled WhatsApp link:
  ```text
  https://wa.me/91XXXXXXXXXX?text=New%20Inquiry%20From:%20...
  ```
- **Where Data Goes:** Opens WhatsApp directly with the client's inquiry pre-typed, ready for them to hit send.
- **Lifetime Limits:** Unlimited and completely free.
- **Setup Effort:** 2 minutes.

---

## 4. Best Recommended Implementation for CBGIPL

For a corporate infrastructure and international trading firm:
1. **Primary Backend:** **Google Sheets + Google Apps Script**  
   - Every inquiry is safely preserved in an organized spreadsheet accessible by management.  
   - An instant email notification is delivered to the business inbox.  
   - Zero recurring monthly fees, completely transparent, and no third-party branding.
2. **Complementary Channel:** A direct **WhatsApp Inquiry Button** alongside the contact details for clients requiring immediate real-time communication.

