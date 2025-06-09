## Relevant Files

- `app/api/logs/upload/route.ts` - API route handler for file uploads, parsing, and storing results.
- `app/api/logs/clear/route.ts` - API route handler for deleting a user's log data.
- `components/log-uploader.tsx` - The main client component for the file upload UI, progress bar, and results display.
- `lib/parsers/zscaler.ts` - Contains the core logic for parsing Zscaler log files.
- `lib/db/schema.ts` - Drizzle ORM schema for the tables storing parsed logs and anomalies.
- `lib/db/queries.ts` - Drizzle ORM queries for database interactions (insert, delete).
- `app/page.tsx` - Main page, will import and render the `log-uploader` component.

### Notes

- Unit tests should be created for the parser logic (`lib/parsers/zscaler.test.ts`).
- End-to-end tests with Playwright or Cypress should verify the entire upload and clear flow.
- Use `npx jest` to run unit tests and `npx playwright test` for end-to-end tests.

## Tasks

- [x] 1.0 Setup Backend API for File Upload and Processing
  - [x] 1.1 Create a new Next.js API Route Handler at `app/api/logs/upload/route.ts`.
  - [x] 1.2 Use `request.formData()` to handle the file payload.
  - [x] 1.3 Add server-side validation to reject files > 4 MB or not of type `text/plain`.
  - [x] 1.4 Protect the route using Clerk middleware and retrieve the `userId`.
  - [x] 1.5 Return structured JSON errors (e.g., `{ error: 'File too large' }`) on validation failure with a `400` status.
- [x] 2.0 Implement Frontend for File Upload with Progress
  - [x] 2.1 Create a client component `components/log-uploader.tsx`.
  - [x] 2.2 Add a styled drag-and-drop zone and a file input button.
  - [x] 2.3 Use the `shadcn/ui` `<Progress>` component to show file upload progress.
  - [x] 2.4 Use `shadcn/ui` Sonner to display success or error toasts from the API response.
  - [x] 2.5 Render the parsed log summary (`totalRecords`, `anomalies[]`) on success.
  - [x] 2.6 Use a `<details>` element to create a collapsible section for `malformedCount` and the list of malformed lines.
- [ ] 3.0 Implement Log Parsing and Anomaly Detection
  - [x] 3.1 Create `lib/parsers/zscaler.ts` to encapsulate parsing logic.
  - [x] 3.2 Implement a `parseZscalerLog` function that processes the file content.
  - [ ] 3.3 The function must correctly handle tab-separated values according to the Zscaler NSS-Web spec.
  - [ ] 3.4 Identify and collect lines with an incorrect number of columns (malformed lines).
  - [ ] 3.5 Integrate the existing anomaly detection rules (e.g., large downloads, blocked requests).
  - [x] 3.6 The `upload` API route will call this function and use its output for the JSON response and database insertion.
- [ ] 4.0 Set Up Database and Store Parsed Logs
  - [ ] 4.1 Define a Drizzle schema in `lib/db/schema.ts` for a `logs` table, including `userId`, `totalRecords`, and a JSONB column for `anomalies`.
  - [ ] 4.2 Configure Drizzle ORM to connect to the Neon PostgreSQL database.
  - [ ] 4.3 In the `upload` API route, after successful parsing, insert the results into the database, associating them with the authenticated `userId`.
- [ ] 5.0 Implement "Clear Logs" Functionality
  - [ ] 5.1 Create the API Route Handler `app/api/logs/clear/route.ts`.
  - [ ] 5.2 Protect the route with Clerk middleware to get the `userId`.
  - [ ] 5.3 Implement a Drizzle query in `lib/db/queries.ts` to delete all log records associated with the `userId`.
  - [ ] 5.4 Add a "Clear logs" `shadcn/ui` `<Button>` to the `log-uploader` component.
  - [ ] 5.5 On click, this button will call the `/api/logs/clear` endpoint and clear the displayed results from the UI upon success.
