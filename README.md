# Pranavam Academy Website

Upload all files to your GitHub repository.

## Main Menu Structure
- Online Programs
  - Online Yoga
    - Online Group Yoga Class
    - Online Corporate Chair Yoga Class
    - Online Therapeutic Yoga
  - Online Karate
  - Online Dance
  - Online Music
  - Online Drawing
- Offline Programs
  - Yoga
  - Karate
  - Dance
  - Music
  - Drawing
- Packages
- Register
- Teach With Us

## Google Sheets Setup
Create a Google Sheet with these tabs:

### Packages
Recommended headers for full package display:
PackageID, PackageName, Category, Mode, Program, ClassType, Duration, Frequency, Sessions, ClassTime, BatchDays, Level, AgeGroup, Instructor, Location, AdmissionFee, MonthlyFee, Price, Description, Features, Benefits, ReferralDiscount, TrialAvailable, Notes, Status

Example rows:
PKG001, Online Group Yoga Class, Online Yoga, Online, Yoga, Group, Monthly, 3 classes/week, 12 sessions/month, Morning/Evening, Mon-Wed-Fri, Beginner to Intermediate, All age groups, Pranavam Faculty, Online, None, Donation-Based, Donation-Based, Students can contribute any amount they wish, Live group sessions|Asana practice|Pranayama|Relaxation, Yoga accessible to all, Not Applicable, Yes, No minimum or suggested donation, Active
PKG002, Online Corporate Chair Yoga Class, Online Yoga, Online, Yoga, Corporate, Monthly, 15-minute staff sessions, Custom, Company schedule, Working days, All levels, Corporate teams, Pranavam Faculty, Online, None, Custom Package, Custom Package, Corporate wellness package, Chair yoga|Stress relief|Posture support|Employee wellness, Workplace wellbeing, 10%, Yes, Custom quote based on staff count, Active
PKG003, Offline Yoga Regular Batch, Offline Yoga, Offline, Yoga, Group, Monthly, Regular batch, 12 sessions/month, Morning/Evening, Mon-Wed-Fri, Beginner to Intermediate, All age groups, Pranavam Faculty, Academy, Contact, Contact for Fee, Contact for Fee, Studio yoga class, Asanas|Pranayama|Meditation|In-person guidance, Flexibility and wellbeing, 5%, Yes, Academy batch, Active

Publish this Packages sheet as CSV:
File > Share > Publish to web > Select Packages sheet > CSV.
Paste the CSV URL inside assets/app.js at PACKAGES_CSV_URL.

### Registrations
Recommended headers:
Timestamp, Name, Phone, Email, Program, Mode, PackageName, ReferralCode, Location, Message, Status, AssignedBatch, PaymentStatus, DiscountApplied, Notes

### TeacherApplications
Recommended headers:
Timestamp, Name, Phone, Email, Subject, TeachingMode, Experience, About, Status, Notes

### Referrals
Recommended headers:
Timestamp, ReferrerName, ReferrerPhone, ReferredName, ReferredPhone, PackageName, ReferralCode, DiscountPercent, Status, Notes

## Refer a Friend Program - Recommended Google Sheets Changes
1. Add ReferralCode to Registrations.
2. Add ReferredByPhone or ReferralCode to identify the referrer.
3. Add DiscountApplied and PaymentStatus columns.
4. Create a Referrals tab to track referral eligibility.
5. Give discount only after referred student joins and payment is confirmed.

## Apps Script
Use google-apps-script.gs in Apps Script and deploy as a Web App.
Paste the Web App URL inside assets/app.js at APPS_SCRIPT_URL.


## Updated Package Sheet Format

You can use this simple `Packages` sheet header row:

```text
Program	Mode	Duration	Price	Currency	Type	Active
```

Recommended new rows to add for free trials:

```text
Online Group Yoga Class	Online	1 Month Trial	Free		Trial	Yes
15 Minutes Online Corporate Chair Yoga	Online	1 Month Trial	Free		Trial	Yes
```

For donation-based Online Group Yoga after the free trial, use:

```text
Online Group Yoga Class	Online	After Trial	Donation Based		Donation	Yes
```

The website now understands your simple columns: Program, Mode, Duration, Price, Currency, Type and Active. It also automatically hides fixed amounts for rows marked as Type = Donation and displays them as Donation-Based.

To show only one package, link like this:

```text
packages.html?program=Online%20Group%20Yoga%20Class
packages.html?program=15%20Minutes%20Online%20Corporate%20Chair%20Yoga
```
