# Phone number migration

This migration standardizes phone numbers in the `orders` and `ws_orders` collections to Myanmar local mobile format:

```text
09xxxxxxxxx
```

It accepts common variants such as `+959...`, `959...`, `09 123 456 789`, hyphens, parentheses, and Myanmar digits. Values that cannot be recognized confidently are never changed and are listed in the migration report.

## Authentication

Run with Firebase Admin application-default credentials. Set `GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON file that has Firestore update access. Do not add that JSON file to this repository.

## Dry run

From the repository root:

```powershell
npm run migrate:phones
```

The default mode performs no writes. Review `changedDocuments`, `changedFields`, and `invalidSamples` in the JSON output.

## Apply

After reviewing the dry-run report:

```powershell
npm run migrate:phones -- --apply
```

Updates are committed in batches of 400. Changed documents receive a `phoneNormalizedAt` server timestamp. Re-running the migration is safe: already normalized values are skipped.
