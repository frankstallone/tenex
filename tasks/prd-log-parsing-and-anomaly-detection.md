---
description: 'Defines requirements for a backend function to parse log files and detect rule-based and statistical anomalies.'
globs: []
alwaysApply: false
---

# PRD: Log Parsing & Anomaly Detection

## 1. Introduction / Overview

This document outlines the requirements for a backend feature that processes log files to identify security-relevant anomalies. The feature will parse raw log content, analyze it against a set of predefined rules and statistical models, and generate a structured output of the findings. This functionality is critical for Security Operations Center (SOC) analysts to efficiently triage alerts and detect potential threats, such as data exfiltration, policy violations, and compromised user accounts, by programmatically surfacing suspicious activities.

## 2. Goals

1.  **Parse Log Data**: Accurately parse structured log entries (assuming Zscaler TSV format as per `prd-log.md`) into a usable data structure.
2.  **Rule-Based Detection**: Implement a set of explicit rules to flag known indicators of compromise or policy violations.
3.  **Statistical Detection**: Apply statistical methods to identify outlier behaviors that may indicate unknown or emerging threats.
4.  **Structured Output**: Produce a clean, well-defined JSON object containing the parsed data summary and a list of all detected anomalies with relevant context and confidence scores.
5.  **Extensibility**: The core logic should be modular, allowing for the future addition of new detection rules with minimal code changes.
6.  **Graceful Handling**: Ensure the system handles malformed log lines or unexpected data without crashing, flagging such lines for review.

## 3. User Stories

| ID  | As a...     | I want to…                                                    | So that…                                                             |
| :-- | :---------- | :------------------------------------------------------------ | :------------------------------------------------------------------- |
| U1  | SOC analyst | have logs automatically checked for unusually large downloads | I can detect potential data exfiltration incidents.                  |
| U2  | SOC analyst | get an alert when a user attempts to access a blocked site    | I can investigate policy violations or malicious intent.             |
| U3  | SOC analyst | identify users whose activity is a statistical outlier        | I can spot potentially compromised accounts or insider threats.      |
| U4  | SOC analyst | know if a user accessed a high-risk web category              | I can proactively investigate exposure to malware or phishing sites. |

## 4. Functional Requirements

### Parsing

1.  **FR-1** The system **must** accept a string or buffer of log file content as input.
2.  **FR-2** The system **must** parse the content, assuming a tab-separated value (TSV) format consistent with the Zscaler NSS-Web specification.
3.  **FR-3** Each line **must** be split into fields, and an array of structured log entry objects must be created.
4.  **FR-4** The system **must** count any lines that do not conform to the expected column count and include this in the output (`malformedCount`).

### Rule-Based Anomaly Detection

5.  **FR-5: Large Download** An anomaly **must** be flagged if a log entry's `destBytes` field is greater than **10,000,000** (10 MB).
    - _Description_: Must include the user, destination bytes, and destination URL.
    - _Confidence_: Scaled proportionally to the amount over the threshold (e.g., `min(1.0, (destBytes / 10MB) - 1 * 0.2)`), capped at 1.0.
6.  **FR-6: Blocked Request** An anomaly **must** be flagged if a log entry's `action` field is `"BLOCK"`.
    - _Description_: Must include the blocked URL and the site category, if available.
    - _Confidence_: Fixed at **0.9**.
7.  **FR-7: High-Risk Category** An anomaly **must** be flagged if a log entry's `category` field matches one of the following predefined high-risk strings:
    - `'Spyware/Adware'`
    - `'Phishing'`
    - `'Malicious Sites'`
    - `'Botnets'`
    - `'Suspicious Destinations'`
    - _Description_: Must include the category and the accessed URL.
    - _Confidence_: Fixed at **0.7**.

### Statistical Anomaly Detection

8.  **FR-8: High Traffic User** An anomaly **must** be flagged for any user whose total request count is greater than **3 standard deviations** above the mean request count for all users in the log file.
    - This check **must** only run if there are 2 or more unique users in the log data.
    - _Description_: Must include the user's ID and their request count.
    - _Confidence_: Fixed at **0.8**.

### Output

9.  **FR-9** The function **must** return a single JSON object containing:
    - `totalRecords` (integer)
    - `malformedCount` (integer)
    - `anomalies` (an array of anomaly objects, each with `type`, `description`, and `confidence`).

## 5. Non-Goals (Out of Scope)

- Displaying results in a UI (to be handled in a separate feature).
- Real-time or streaming analysis of logs.
- Advanced Machine Learning (ML) based detection.
- User-configurable rules or thresholds via a UI or API.
- Storing or persisting the results in a database (the function is purely computational).

## 6. Technical Considerations

| Area               | Notes                                                                                                                                                |
| :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Modularity**     | The anomaly detection logic should be decoupled from the parser. Each rule should be implemented as a separate, testable function.                   |
| **Performance**    | The entire process (parsing + analysis) should be memory-efficient and complete in a reasonable time, even for multi-megabyte log files.             |
| **Dependencies**   | Keep external dependencies to a minimum. A simple library for standard deviation calculation is acceptable if not using a full-blown stats package.  |
| **Input**          | The function should be agnostic to the source of the log data (e.g., file upload, database record), accepting a raw string or buffer.                |
| **Error Handling** | The function should not crash on empty input or files with only malformed lines; it should return a valid result object with zero records/anomalies. |

## 7. Success Metrics

1.  **Detection Accuracy**: ≥ 99% accuracy in identifying all defined anomalies in a suite of test log files containing known true positives.
2.  **False Positive Rate**: 0% false positives for all defined rule-based checks.
3.  **Performance**: p95 processing time under 5 seconds for a 4MB log file on standard hardware.
4.  **Code Coverage**: Unit test coverage for each individual anomaly rule must be > 95%.

## 8. Open Questions

1.  Should the rule thresholds (e.g., 10 MB for download) and the high-risk category list be stored in a separate configuration file instead of being hard-coded?
2.  For the "High Traffic User" check, what is the desired behavior if the standard deviation is zero (i.e., all users have the exact same number of requests)?
3.  How should we version the detection logic? If we change a rule, how do we handle analysis of old logs?
