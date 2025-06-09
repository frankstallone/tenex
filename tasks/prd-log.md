## Introduction / Overview

The **File Upload and Log Parsing** feature enables SOC analysts to securely upload Zscaler Web Proxy logs (TSV format) up to **4 MB** in size, view real-time parsing progress, and immediately receive a structured list of parsed entries and detected anomalies. Oversized or malformed uploads trigger user-friendly error notifications. Parsed results are stored in Neon PostgreSQL indefinitely, with an in-app **“Clear logs”** button to let analysts purge all stored data on demand.  
This feature is essential for accelerating incident triage by surfacing suspicious traffic patterns directly inside the app while keeping the UX lightweight—no charts, streaming, or advanced visualizations in the initial scope. :contentReference[oaicite:0]{index=0}

---

## Goals

1. **Seamless Upload** – SOC analysts can upload one `.log` or `.txt` file (≤ 4 MB) without page reloads.
2. **Transparent Progress** – Show a determinate progress bar during file transfer and parsing.
3. **Accurate Parsing** – Parse 100 % of well-formed Zscaler Web-Proxy lines; flag and surface malformed lines.
4. **Immediate Insight** – Return a JSON payload with total records, anomaly list, and malformed line count in ≤ 10 s for a 4 MB file.
5. **Persistent Storage** – Save each upload plus anomalies in Neon indefinitely; allow single-click deletion.
6. **Graceful Failure** – Oversized files or wrong formats must yield a clear toast message and never crash the parser/API.

---

## User Stories

| ID  | As a…       | I want to…                                          | So that…                                                       |
| --- | ----------- | --------------------------------------------------- | -------------------------------------------------------------- |
| U1  | SOC analyst | upload a Zscaler log file                           | I can investigate user web activity quickly.                   |
| U2  | SOC analyst | watch a progress bar during upload/parsing          | I know the task is proceeding and estimate remaining time.     |
| U3  | SOC analyst | receive a toast if the file is too large or not TSV | I understand immediately why the upload failed.                |
| U4  | SOC analyst | see which log lines were malformed                  | I can decide whether to re-export logs or ignore minor issues. |
| U5  | SOC analyst | click **Clear logs** to wipe stored data            | I can comply with data-retention policies or keep the DB tidy. |

---

## Functional Requirements

1. **FR-1** The system **must accept** a single file upload (`.log` or `.txt`) via drag-and-drop or file picker, capped at 4 MB.
2. **FR-2** The UI **must render** the _shadcn_ `<Progress>` component to show percentage complete while the file uploads and parser runs. :contentReference[oaicite:1]{index=1}
3. **FR-3** If file size > 4 MB or MIME/type ≠ `text/plain`, the system **must** display a _shadcn Sonner_ toast with an error message. :contentReference[oaicite:2]{index=2}
4. **FR-4** The backend **must** parse each line according to Zscaler NSS-Web spec (tab-separated, fixed fields). :contentReference[oaicite:3]{index=3}
5. **FR-5** Malformed lines (wrong column count) **must** be counted and returned in `malformedCount`; the UI **must** list them in a collapsible section.
6. **FR-6** After parsing, the API **must** respond with JSON: `{totalRecords, anomalies[], malformedCount}`.
7. **FR-7** Anomaly detection **must** apply the existing rule-based & three-sigma statistical logic (large downloads, blocked requests, etc.). :contentReference[oaicite:4]{index=4}
8. **FR-8** Parsed summary and anomalies **must** be stored in Neon Postgres using Drizzle ORM, referenced to Clerk `userId`. :contentReference[oaicite:5]{index=5}
9. **FR-9** The UI **must** show a **“Clear logs”** _shadcn Button_; pressing it calls `/api/logs/clear` to delete the user’s rows.
10. **FR-10** API routes **must** leverage Next.js Route Handlers (`app/api/**/route.ts`) and use `request.formData()` for uploads. :contentReference[oaicite:6]{index=6}

---

## Non-Goals (Out of Scope)

- Real-time streaming or chunked parsing.
- Graphical dashboards or chart visualizations.
- Log retention limits or auto-purge schedules.
- Support for non-Zscaler log formats (future enhancement).
- Multi-file batch uploads.

---

## Design Considerations

### UI/UX

- Re-use **Tailwind v4** utility classes for spacing/typography; rely on _shadcn/ui_ design tokens. :contentReference[oaicite:7]{index=7}
- Upload area should visually indicate drag-and-drop capability.
- Malformed line list collapsible with `<details>` for minimal clutter.
- Dark-mode inherits default shadcn theme (no extra work).

### Error & Toast Styling

- Sonner toast: red background for fatal errors; yellow for partial-success (e.g., some malformed lines).

---

## Technical Considerations

| Area               | Notes                                                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication** | API routes guarded by Clerk middleware; use `currentUser()` to fetch `user.id`. :contentReference[oaicite:8]{index=8}                                      |
| **Database**       | Neon free tier supports 5 GB egress/month—uploads are small, so acceptable. Logs stored indefinitely unless cleared. :contentReference[oaicite:9]{index=9} |
| **Parser Perf**    | Must complete < 10 s for a 4 MB file (≈ 50 k lines). Split by `\n`, process in memory (Node 18).                                                           |
| **Error Handling** | Wrap parsing in try/catch; on error return `400` with message consumed by Sonner toast.                                                                    |
| **Security**       | Validate content-type & size server-side; strip CRLF injection in filenames.                                                                               |
| **Extensibility**  | Future log sources can add new parsers by file-type switch; keep `parseZscalerLog()` isolated in `/lib`.                                                   |

---

## Success Metrics

1. **Upload Success Rate** ≥ 99 % for valid ≤ 4 MB logs (no 5xx).
2. **Parser Time** ≤ 10 s p95 for 4 MB file.
3. **Error Clarity** ≤ 5 % support tickets related to upload errors after release.
4. **Database Hygiene** ≥ 95 % of test users verify the **“Clear logs”** button deletes rows successfully in integration tests.

---

## Open Questions

1. Should “Clear logs” delete **all** user uploads or allow granular selection per file?
2. Is there a maximum retention period we must display in privacy policy even though technically indefinite?
3. Do we need rate-limiting on uploads to prevent abuse (e.g., 10 uploads per minute)?
4. Should malformed lines be downloadable as a `.txt` for offline inspection?

---
