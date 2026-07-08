# Pranavam Academy Website Package

This package is revised from the working package and includes all discussed features.

## Included Features

- Backend-controlled header menu using the `Menu` sheet
- All online programs under Online Programs menu
  - Online Group Yoga
  - Corporate Chair Yoga
  - Therapeutic Yoga
  - Online Karate
  - Online Dance
  - Online Music
  - Online Drawing
- Offline program submenu links pointing to the correct page sections
- Shopping menu linking to Freshly Mart wellness products
- WhatsApp button on the top strip
- Install App option for PWA
- Backend-controlled homepage sliding banners using `SliderBanners`
- Backend-controlled site images using `SiteImages`
- Backend-controlled class packages using `Packages`
- Student registration form
- Corporate chair yoga enquiry and registration forms
- Teach With Us form
- Admin dashboard at `admin.html`
- Create reports, print sheets, backup main data and safe clear generated reports
- Service worker cache version updated

## Setup

1. Upload all files to your GitHub Pages repository.
2. Open Google Sheets.
3. Open Extensions → Apps Script.
4. Paste the full code from `google-apps-script.gs`.
5. Save and run `setupPranavamAcademySheets` once.
6. Deploy as Web App:
   - Execute as: Me
   - Who has access: Anyone
7. Copy the Web App URL.
8. Open `assets/config.js` and paste the URL in `APPS_SCRIPT_URL`.

## Backend Sheets

The Apps Script setup creates or repairs these sheets:

- Menu
- Settings
- SliderBanners
- SiteImages
- Packages
- Registrations
- CorporateLeads
- CorporateRegistrations
- TeacherApplications
- Referrals
- Payments
- Attendance
- TeacherAttendance
- ClassSchedule

## Admin Dashboard

Open:

`admin.html`

Default password:

`12345`

Change it in the Google Sheet:

`Settings` sheet → `AdminPassword`

## Important Admin Actions

The admin dashboard can:

- View student enquiries
- View corporate chair yoga leads
- View teacher applications
- View packages
- View banners
- View backend menu
- View site images
- Create reports
- Backup main data
- Clear generated reports only
- Print follow-up sheets

The clear option does not delete main registration, corporate or teacher data. It only clears generated report sheets.

## Shopping Menu

The Shopping menu uses this config value:

`SHOPPING_URL: "https://www.freshly-online.com/freshlymart/#wellness"`

You can change it in:

`assets/config.js`

The backend Menu sheet can use `shopping` as the PageLink value for the Shopping menu.

## WhatsApp Number

Change the WhatsApp number in:

`assets/config.js`

Example:

`WHATSAPP_NUMBER: "918921696649"`

## Backend-Controlled Images

Update images in the `SiteImages` sheet. Use local paths such as:

`assets/images/online-yoga.jpg`

Or use a full hosted image URL.

## Backend-Controlled Banners

Update banners in the `SliderBanners` sheet.

Important columns:

- Page
- SortOrder
- Badge
- Title
- Subtitle
- ImageURL
- ButtonText
- ButtonLink
- SecondaryButtonText
- SecondaryButtonLink
- Status

Only rows with `Status = Active` will show.

## Backend-Controlled Packages

Update packages in the `Packages` sheet.

Only rows with `Status = Active` will show on the Packages page and in package dropdowns.


## Important upload note
Upload the complete package including the `assets` folder. If the website appears as plain text with broken images, `assets/style.css` and image files were not uploaded or the old cache is loading. After upload, hard refresh or unregister the old service worker.
