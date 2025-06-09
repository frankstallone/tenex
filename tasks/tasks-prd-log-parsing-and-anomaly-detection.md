## Relevant Files

- `lib/types.ts` - Defines shared TypeScript types like `LogEntry` and `Anomaly`.
- `lib/log-parser.ts` - Contains the function for parsing the raw log string into structured `LogEntry` objects.
- `lib/log-parser.test.ts` - Unit tests for the log parser.
- `lib/rule-detectors.ts` - Contains individual functions for each rule-based anomaly check (e.g., large download, blocked request).
- `lib/rule-detectors.test.ts` - Unit tests for the rule-based detectors.
- `lib/statistical-detectors.ts` - Contains the function for the statistical "High Traffic User" check.
- `lib/statistical-detectors.test.ts` - Unit tests for the statistical detector.
- `lib/log-analyzer.ts` - The main orchestrator function that imports the parser and detectors to produce the final output.
- `lib/log-analyzer.test.ts` - Integration tests for the main `analyzeLogs` function.

### Notes

- Unit tests should be placed alongside the code files they are testing.
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 **Create a robust parser for Zscaler log files**

  - [ ] 1.1 In `lib/types.ts`, define a `LogEntry` type with fields required for analysis (e.g., `destBytes`, `action`, `category`, `userId`, `url`).
  - [ ] 1.2 In `lib/log-parser.ts`, create a function `parseLogEntries(logContent: string)` that returns an object `{ parsedEntries: LogEntry[], malformedCount: number }`.
  - [ ] 1.3 Inside the function, split the input string into lines and then split each line by tabs (TSV format).
  - [ ] 1.4 Map valid lines to `LogEntry` objects. Use a validation block to catch lines with incorrect column counts and increment `malformedCount`.

- [ ] 2.0 **Implement rule-based anomaly detection**

  - [ ] 2.1 In `lib/types.ts`, define an `Anomaly` type with fields: `type: string`, `description: string`, and `confidence: number`.
  - [ ] 2.2 In `lib/rule-detectors.ts`, create `detectLargeDownload(entry: LogEntry)` to flag downloads > 10MB, calculating confidence as specified.
  - [ ] 2.3 Create `detectBlockedRequest(entry: LogEntry)` to flag entries where `action` is "BLOCK".
  - [ ] 2.4 Create `detectHighRiskCategory(entry: LogEntry)` to flag entries with a category from the predefined high-risk list.
  - [ ] 2.5 Create a primary function `runRuleBasedDetection(entries: LogEntry[]): Anomaly[]` that executes all the individual rule-checkers for each log entry.

- [ ] 3.0 **Implement statistical anomaly detection for user traffic**

  - [ ] 3.1 In `lib/statistical-detectors.ts`, create `detectHighTrafficUsers(entries: LogEntry[]): Anomaly[]`.
  - [ ] 3.2 Inside the function, aggregate the total number of requests for each unique user.
  - [ ] 3.3 If there are 2 or more users, calculate the mean and standard deviation of the request counts.
  - [ ] 3.4 Identify any user with a request count more than 3 standard deviations above the mean and generate an `Anomaly` object for them.

- [ ] 4.0 **Consolidate parsing and detection results into a structured JSON output**

  - [ ] 4.1 In `lib/log-analyzer.ts`, create a main orchestrator function `analyzeLogs(logContent: string)`.
  - [ ] 4.2 Call the `parseLogEntries` function to get the initial data and malformed line count.
  - [ ] 4.3 Pass the parsed entries to `runRuleBasedDetection` and `detectHighTrafficUsers` to collect all anomalies.
  - [ ] 4.4 Assemble and return the final JSON object: `{ totalRecords, malformedCount, anomalies }`.

- [ ] 5.0 **Create unit tests for all parsers and detectors**
  - [ ] 5.1 In `lib/log-parser.test.ts`, write tests for parsing valid data, handling malformed lines, and processing empty input.
  - [ ] 5.2 In `lib/rule-detectors.test.ts`, create tests for each rule, covering both cases where anomalies are found and not found.
  - [ ] 5.3 In `lib/statistical-detectors.test.ts`, write tests for the high-traffic user detection, including edge cases like fewer than two users or zero standard deviation.
  - [ ] 5.4 In `lib/log-analyzer.test.ts`, write an integration test using a sample log file string to verify the final, consolidated output is correct.
