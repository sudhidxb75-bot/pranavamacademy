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

## Corporate Online Chair Yoga Form

This revision includes a separate corporate enquiry form on:

`corporate-chair-yoga.html#corporate-enquiry`

This form is connected to the backend sheet:

`CorporateLeads`

The form now uses the same standardized `Packages` backend sheet. The **Corporate Package / Trial** dropdown loads active packages where the package details match `corporate chair yoga`. This means the website package cards and the corporate lead form can use the same package names, fees, duration and frequency.

The corporate lead columns are created automatically by `setupPranavamAcademySheets`:

`Timestamp, CompanyName, ContactPerson, Phone, Email, CityCountry, CompanySize, Program, PackageID, PackageName, PackageFee, PackageDuration, PackageFrequency, PackageSessions, Mode, Category, PreferredSessionType, PreferredTime, Frequency, PreferredSchedule, Requirement, Message, Page, Status, Notes`

Use this form for companies, schools, offices, institutions and staff wellness enquiries. Normal individual students should use `register.html`.

A backend report option is also available:

`Pranavam Backend → Reports & Sheets → Create Corporate Leads Report`

Do not run `doPost` directly from Apps Script editor. Test forms from the website only.

## Reports, Print and Clear Options

The private Google Sheets admin tools are available under:

`Pranavam Backend`

### Reports & Sheets

- Create All Reports
- Create Dashboard Report
- Create Registration Report
- Create Teacher Applications Report
- Create Corporate Leads Report
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
- template CSV files for reference only, including `packages-template.csv`

After uploading, hard refresh the website once. If the old version is cached, change the cache version in `service-worker.js` and upload again.

## Important Note

All public website backend data now comes from the single Web App URL in `assets/config.js`. This is simpler and avoids managing separate published CSV URLs.


## Latest revision: specific package/detail links and corporate registration

This package now includes:

- Program package links such as `packages.html?category=Online%20Dance` and `packages.html?category=Offline%20Karate`.
- The Packages page automatically filters to the selected program when opened from a program page or detail button.
- Main program cards now point to the correct online/offline detail pages instead of a generic section only.
- Corporate Chair Yoga has two separate forms:
  - `corporate-chair-yoga.html#corporate-enquiry` for free trial / enquiry leads.
  - `corporate-chair-yoga.html#corporate-registration` for confirmed corporate package registrations.
- Corporate registrations are saved in a separate backend sheet named `CorporateRegistrations`.
- Google Sheets backend menu includes a Corporate Registrations report.

After updating Apps Script, run `setupPranavamAcademySheets` again so the new `CorporateRegistrations` sheet and report headers are created.


## Separate Online Yoga Pages Added

This package includes two new standalone yoga pages:

- `online-group-yoga.html` — donation-based Online Group Yoga page with benefits, free trial CTA, package link and registration link.
- `therapeutic-yoga.html` — Online Therapeutic Yoga page with benefits, suitability, important wellness disclaimer, package link and registration link.

The Online Programs menu now points directly to these pages:

- Online Group Yoga Class → `online-group-yoga.html`
- Online Corporate Chair Yoga Class → `corporate-chair-yoga.html`
- Online Therapeutic Yoga → `therapeutic-yoga.html`

Package buttons can now point to specific package groups using:

- `packages.html?program=Online%20Group%20Yoga`
- `packages.html?program=Online%20Therapeutic%20Yoga`

New backend image keys are also supported in the `SiteImages` sheet:

- `onlineGroupYogaHero`
- `onlineGroupYogaBenefits`
- `therapeuticYogaHero`
- `therapeuticYogaBenefits`


## Latest revision: Corporate Chair Yoga duration packages

Corporate Chair Yoga now includes duration-based package options:

- 1 Month
- 3 Months
- 6 Months
- 12 Months

The corporate enquiry and corporate registration form package dropdowns use the same `Packages` data, so update the `Packages` sheet to control package names, fees, duration, frequency and session details.

After replacing Apps Script, run `setupPranavamAcademySheets` once. You can also use `Pranavam Backend → Update Corporate Chair Yoga Packages` to add the new duration packages and automatically mark the previous Small/Medium/Large corporate rows as `Inactive`.
