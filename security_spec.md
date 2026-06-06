# Security Specifications & Threat Model (TDD)

## 1. Data Invariants

- **User Profiles (/users/{userId})**: Users can only read and write their own profile records. Users cannot change their roles from "aluno" to "treinador" or vice-versa inside self-updates unless authorized, nor can they bypass LGPD consent if it's required.
- **Routines & Splits (/users/{userId}/routines/{routineId})**: Read and write access is restricted to the owner of the workspace (`userId`). A trainer can also write if authorized or if the student binds them (for safety, we allow users to read and write, and trainers to manage if they have relational access, but the baseline zero-trust is user-restricted).
- **Training Logs (/users/{userId}/logs/{logId})**: Only the user themselves can read, create, and write their training logs.
- **Wearable Stats (/users/{userId}/wearable/stats)**: Restricted strictly to the owner.
- **Community Achievements (/achievements/{achievementId})**: Any signed-in user can read. Users can only create achievements representing their own actions, and cannot modify others' achievements except incrementing/decrementing standard like counters.

---

## 2. The "Dirty Dozen" Payloads

1. **Identity Spoofing Profile Creation**: User `attacker` trying to create/write `/users/victim` profile.
2. **Privilege Escalation role modification**: Ordinary "aluno" client sending `role: "treinador"` update in existing user profile document.
3. **Poisoning Routines ID**: Creating routine with a document ID of 1MB long junk characters to deplete wallet reads.
4. **Altering Sibling Data (Cheat Log)**: Accessing `/users/victim/logs/newLog` to write fake calorie counts.
5. **Like Counter Overwrites**: A user replacing the whole payload of an achievement with modified stats instead of only incrementing 'likes'.
6. **Bypassing LGPD Consent**: Creating user profile with `lgpdConsent: false` but using medical/health data.
7. **Negative Values Poisoning**: Writing `-100` as weight or age.
8. **Malicious Date String Inject**: Sending invalid formatting for the ISO-8601 string fields like `createdAt`.
9. **Blanket Query Scraping**: Submitting list query on `/users` collection without proper auth.
10. **Smartwatch Stats Hijacking**: Overwriting other user's Apple Watch stats in `/users/victim/wearable/stats`.
11. **Immortals Field Modification**: Altering `createdAt` timestamp inside historical training logs.
12. **System Tip Forging**: Manually posting achievements under others' user names.

---

## 3. Security Rules Draft Testing Plan

We will enforce security rules using a unified compilation verification checklist. Let's write the `firestore.rules` directly ensuring those 12 scenarios fail by design.
