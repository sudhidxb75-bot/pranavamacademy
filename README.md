# Pranavam Academy revised package

This package is based on the working Pranavam Academy package and includes the discussed features.

## Included

- Backend-controlled menu using the `Menu` sheet
- Shopping menu moved to the end and linked to Freshly Mart wellness products
- Admin and Install App removed from public menu
- WhatsApp text removed from header area
- Side WhatsApp button
- Install App button next to WhatsApp button
- PWA manifest and service worker
- Backend-controlled sliding banners using `SliderBanners` sheet
- Backend-controlled site images using `SiteImages` sheet
- Backend-controlled class packages using `Packages` sheet
- Online menu includes all online programs
- Admin dashboard: `admin.html`
- Reports, print sheets, backup and safe clear options in Apps Script
- Yoga-related pages use the provided Pranavam Yoga logo
- `.nojekyll` included for GitHub Pages asset loading

## Files to upload

Upload the full package contents to the repository root. Make sure the `assets` folder is uploaded completely.

Required root files include:

- `index.html`
- `admin.html`
- `google-apps-script.gs`
- `assets/style.css`
- `assets/app.js`
- `assets/config.js`
- `assets/academy-logo.png`
- `assets/yoga-logo.png`
- `assets/images/`
- `.nojekyll`

## Setup

1. Open your Google Sheet.
2. Open Apps Script.
3. Replace the script with `google-apps-script.gs`.
4. Set `SPREADSHEET_ID` if needed.
5. Run `setupPranavamAcademySheets` once.
6. Deploy as Web App.
7. Paste the Web App URL in `assets/config.js`:

```js
APPS_SCRIPT_URL: "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"
```

## Admin dashboard

Open:

`admin.html`

Default password:

`12345`

Change it in the `Settings` sheet under `AdminPassword`.

## Backend sheets added

- `Menu`
- `SliderBanners`
- `SiteImages`
- `Packages`
- `Settings`
- `Registrations`
- `CorporateLeads`
- `CorporateRegistrations`
- `TeacherApplications`
- `Payments`
- `Attendance`

## Safe clear

The dashboard safe clear option clears only generated reports and print sheets. It does not delete main registration data.

## Cache note

After upload, hard refresh the website with `Ctrl + Shift + R`. On mobile, open once in incognito if the old version still appears.
