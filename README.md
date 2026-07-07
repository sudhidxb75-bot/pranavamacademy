# Pranavam Academy Website Package

This package includes the Pranavam Academy website with:

- Homepage backend-controlled slider banner
- Reduced banner height
- Backend-controlled website images
- Backend-controlled packages
- Registration, teacher, referral, corporate and payment form submission
- PWA install app option
- Google Sheets admin menu for reports, print/export and clear/reset tools

## Very Simple Frontend Setup

You only need to paste the Google Apps Script Web App URL in one file:

`assets/config.js`

Open `assets/config.js` and replace:

```js
APPS_SCRIPT_URL: "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"
```

with your deployed Apps Script Web App URL.

Example:

```js
APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxx/exec"
```

Do not paste separate CSV URLs for Packages, SiteImages or SliderBanners. The website now loads everything from the same Web App URL using:

- `?action=packages`
- `?action=siteImages`
- `?action=sliderBanners`

## Google Sheets Backend Setup

1. Open your Pranavam Academy Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Delete the old script.
4. Paste the full code from `google-apps-script.gs`.
5. Save the project.
6. Run `setupPranavamAcademySheets` once.
7. Accept permissions.
8. Reload the Google Sheet.
9. You should see the menu: **Pranavam Backend**.
10. Deploy the script as a Web App.

Deployment settings:

- Execute as: **Me**
- Who has access: **Anyone**

Copy the Web App URL and paste it only in `assets/config.js`.

## Test Backend Links

Open your Web App URL directly. It should show backend reachable status.

Then test these links by adding the action to the same URL:

```text
YOUR_WEB_APP_URL?action=packages
YOUR_WEB_APP_URL?action=siteImages
YOUR_WEB_APP_URL?action=sliderBanners
```

## Backend Sheets Created

Running `setupPranavamAcademySheets` creates or repairs these tabs:

- `Registrations`
- `TeacherApplications`
- `CorporateLeads`
- `Referrals`
- `Payments`
- `Attendance`
- `TeacherAttendance`
- `ClassSchedule`
- `Packages`
- `SiteImages`
- `SliderBanners`
- `Settings`

## Slider Banner Control

Use the `SliderBanners` sheet.

Columns:

`BannerID, Page, SortOrder, Badge, Title, Subtitle, ImageURL, AltText, ButtonText, ButtonLink, SecondaryButtonText, SecondaryButtonLink, Status, Notes`

Important fields:

- `Page`: use `home` for homepage banners.
- `SortOrder`: controls banner order.
- `ImageURL`: local path like `assets/images/hero-academy.jpg` or a public HTTPS image URL.
- `Status`: `Active` shows the banner. `Inactive` hides it.

## Website Image Control

Use the `SiteImages` sheet.

Columns:

`ImageKey, SectionName, ImageURL, AltText, Status, Notes`

Keep the `ImageKey` unchanged and update only the `ImageURL`, `AltText`, and `Status`.

Recommended image keys:

- `homeHero`
- `onlineYoga`
- `karate`
- `dance`
- `music`
- `drawing`
- `teachWithUs`
- `yogaAccessible`
- `referFriend`
- `yogaHero`
- `groupYoga`
- `corporateYoga`
- `therapeuticYoga`
- `yogaWorldPeace`
- `offlineHero`
- `packagesHero`
- `registerHero`
- `teacherHero`

## Packages Control

Use the `Packages` sheet.

Recommended columns:

`PackageID, Mode, Category, PackageName, Price, Duration, Frequency, Sessions, ClassTime, Location, Features, Description, ReferralDiscount, TrialAvailable, Status`

Keep `Status` as `Active` to show a package on the website.

Use `|` to separate features, for example:

```text
Live online sessions|Asana practice|Pranayama|Relaxation
```

## Forms

Website forms submit to the same Web App URL in `assets/config.js`.

Do not run `doPost` directly from Apps Script editor. Test forms from the website only.

## Reports, Print and Clear Options

The private Google Sheets admin tools are available under:

`Pranavam Backend`

### Reports & Sheets

- Create All Reports
- Create Dashboard Report
- Create Registration Report
- Create Teacher Applications Report
- Create Referral Report
- Create Payment Report
- Create Daily Class Sheet
- Create Monthly Summary

### Print / Export

- Export All Reports as PDF
- Export Active Sheet as PDF
- Open Print Instructions

### Clear / Reset

- Clear Report Sheets Only
- Clear Daily Class Sheets Only
- Clear All Generated Reports & Sheets
- Clear Form Data - Danger

Generated report sheets usually use the prefix `Report_`.

## PWA / Install App

This package includes:

- `manifest.webmanifest`
- `service-worker.js`
- `assets/icons/icon-192.png`
- `assets/icons/icon-512.png`
- `assets/icons/apple-touch-icon.png`

The header has an **Install App** button.

PWA install works only on HTTPS domains or localhost. GitHub Pages and your live domain should work after deployment.

## Uploading to GitHub Pages

Upload all files and folders to the repository, including:

- All `.html` files
- `assets/`
- `manifest.webmanifest`
- `service-worker.js`
- `google-apps-script.gs` for reference only
- template CSV files for reference only

After uploading, hard refresh the website once. If the old version is cached, change the cache version in `service-worker.js` and upload again.

## Important Note

All public website backend data now comes from the single Web App URL in `assets/config.js`. This is simpler and avoids managing separate published CSV URLs.
