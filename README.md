# 🎊 Judy & Steve Wedding Website

A beautiful, self-hosted wedding website with Chinese banquet theme, RSVP functionality, and honeymoon fund.

## 🚀 Quick Start

### Preview Locally
Simply open `index.html` in your web browser:
```
# Windows
start index.html

# Or right-click index.html > Open With > Chrome/Firefox/Edge
```

### Deploy to GitHub Pages

1. **Create a GitHub repository**
   - Go to [github.com/new](https://github.com/new)
   - Name it something like `wedding` or `judy-and-steve`
   - Make it **public** (required for free GitHub Pages)

2. **Push this code**
   ```bash
   cd wedding-website
   git init
   git add .
   git commit -m "Initial wedding website"
   git remote add origin https://github.com/YOUR_USERNAME/wedding.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repo → Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`, folder: `/ (root)`
   - Click Save

4. **Your site will be live at**: `https://YOUR_USERNAME.github.io/wedding/`

### Custom Domain (Optional)
1. Buy a domain (e.g., `judyandsteve.com`) from Namecheap, Google Domains, etc.
2. In your repo → Settings → Pages → Custom domain, enter your domain
3. Add DNS records at your registrar:
   - CNAME record: `www` → `YOUR_USERNAME.github.io`
   - A records pointing to GitHub's IPs (see [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site))

---

## ✏️ Customizing Content

### Update Your Details
Edit `index.html` and search/replace:
- **Names**: "Judy Lam" and "Steve Huang" → Your names
- **Date**: "October 10, 2026" → Your date
- **Venue**: Update ceremony/reception venue details
- **FAQ answers**: Customize to your wedding specifics

### Update the Countdown
In `js/main.js`, find the `WEDDING_DATE` constant and set your date:
```javascript
const WEDDING_DATE = '2026-10-10T17:00:00';
```

### Update Photos
Replace the images in the `images/` folder:
- `hero-bg.png` — Hero background (1920x1080+ recommended)
- `couple.png` — Main couple photo
- `venue.png` — Venue photo
- `gallery-1.png`, `gallery-2.png` — Gallery photos (add more as needed)
- `honeymoon.png` — Honeymoon destination image

### Change the Password
In `js/main.js`, find the `SITE_PASSWORD` constant:
```javascript
const SITE_PASSWORD = 'angrry!';
```

### Update PayPal Link
In `js/honeymoon.js`, find the `PAYPAL_LINK` constant:
```javascript
const PAYPAL_LINK = 'YOURPAYPALLINK';
```
Replace with your PayPal.me username (e.g., `JudyAndSteve`).

---

## 📬 Setting Up RSVP (Google Sheets Backend)

### Step 1: Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Add these column headers in Row 1:
   ```
   Timestamp | Name | Email | Attending | Guests | Meal | Dietary | Song | Message
   ```

### Step 2: Create a Google Apps Script
1. In your sheet, go to **Extensions → Apps Script**
2. Replace the code with:
   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data = JSON.parse(e.postData.contents);
     
     sheet.appendRow([
       new Date(),
       data.name,
       data.email,
       data.attending,
       data.guests || '',
       data.meal || '',
       data.dietary || '',
       data.song || '',
       data.message || ''
     ]);
     
     return ContentService
       .createTextOutput(JSON.stringify({ result: 'success' }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```
3. Click **Deploy → New deployment**
4. Type: **Web app**
5. Execute as: **Me**
6. Who has access: **Anyone**
7. Click **Deploy** and copy the URL

### Step 3: Update Your Website
In `js/rsvp.js`, find `GOOGLE_SCRIPT_URL` and paste your URL:
```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

---

## 🎨 Color Theme

The website uses a Chinese banquet color palette:
| Color | Hex | Usage |
|-------|-----|-------|
| Deep Red | `#5C0A0A` | Primary backgrounds |
| Gold | `#D4A853` | Headings, accents |
| Cream | `#FFF8F0` | Body text |

To change colors, edit the CSS custom properties at the top of `css/style.css`.

---

## 📁 Project Structure

```
wedding-website/
├── index.html          # Main page (all sections)
├── css/
│   └── style.css       # Design system & all styles
├── js/
│   ├── main.js         # Nav, password, scroll effects, countdown
│   ├── rsvp.js         # RSVP form & submission
│   └── honeymoon.js    # Honeymoon fund cards & PayPal
├── images/             # All photos and assets
└── README.md           # This file
```

---

## 💡 Tips

- **Test on mobile**: The site is fully responsive. Use Chrome DevTools (F12 → mobile icon) to preview.
- **Photos**: Use high-quality images (compress with [TinyPNG](https://tinypng.com/) for fast loading).
- **RSVP notifications**: Set up Google Sheets email notifications to get alerted when someone RSVPs.
- **Password**: The client-side password gate prevents casual access but isn't cryptographically secure. This is standard for wedding websites.

---

Made with ❤️ for Judy & Steve's wedding
