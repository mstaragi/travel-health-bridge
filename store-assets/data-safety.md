# Data Safety & Privacy Policy Summary

**Travel Health Bridge** is committed to protecting traveler health data. This document outlines our data collection, usage, and security practices as required by Google Play, Apple App Store, and the Indian DPDP Act.

## Data Collection & Purpose

| Data Category | Data Element | Purpose | Required/Optional |
| :--- | :--- | :--- | :--- |
| **Personal Info** | Phone Number | Account authentication via OTP, referral tracking. | Required for Vault |
| **Personal Info** | Name (Optional) | Personalizing the Help & Emergency experience. | Optional |
| **Health Info** | Blood Group, Allergies, Medications | Emergency medical assistance, sharing with doctors. | Optional (Vault only) |
| **Location** | Precise Location (GPS) | Finding the nearest verified medical provider. | Optional |
| **Device IDs** | PostHog Distinct ID | Analytics to improve app performance and triage flow. | Always Collected |
| **App Usage** | Interaction Events | Monitoring triage abandonment and provider conversion. | Always Collected |

## Data Usage Details

- **Referral Tracking**: When you call a provider through the app, we track the initiation of the call to verify service delivery.
- **Analytics**: We use PostHog for anonymized event tracking. We do NOT sell this data to third parties.
- **Audit Trails**: Non-identifying session data is retained to audit provider pricing commitments and investigate overcharge reports.

## Security Practices

1. **On-Device Encryption**: Medical Vault data (allergies, medications, etc.) is encrypted using `Expo SecureStore` before being saved to the local database.
2. **Data in Transit**: All data sent to our servers (Supabase) is transmitted over secure HTTPS (TLS 1.3) connections.
3. **Data Deletion**: Users have the right to be forgotten. Deleting your account from the Settings menu immediately wipes all personal and health data from our active databases and local storage.

## Data Sharing

- **With Medical Providers**: We only share your data with providers when you choose to "Share with Doctor" or trigger an SOS.
- **Third Parties**: We do NOT share personal or health data with advertisers or third-party marketing platforms.

## Contact Information

For any data access or erasure requests, contact our Data Protection Officer at:
**privacy@travelhealthbridge.com**
