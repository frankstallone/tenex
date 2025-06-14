## Relevant Files

- `components/results-dashboard.tsx` - New component to display the entire results dashboard, including cards, charts, and the data table.
- `components/results-dashboard.test.tsx` - Unit and component tests for `results-dashboard.tsx`.
- `components/log-uploader.tsx` - Existing component to be modified to conditionally render the `results-dashboard.tsx` when results are available.
- `lib/analysis-helpers.ts` - New utility file for helper functions like calculating severity, preparing data for charts, etc.
- `lib/analysis-helpers.test.ts` - Unit tests for the helper functions in `analysis-helpers.ts`.
- `lib/parsers/zscaler.ts` - May need modification to add a `severity` field to the `Anomaly` type within `LogAnalysisResult`.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 **Setup Project Dependencies and Initial Components**

  - [x] 1.1 Install `recharts` and `shadcn/ui` chart components by running `npx shadcn-ui@latest add charts`.
  - [x] 1.2 Create the basic file structure for the new components: `components/results-dashboard.tsx` and its test file.
  - [x] 1.3 Create the utility file `lib/analysis-helpers.ts` and its corresponding test file.
  - [x] 1.4 Update the `Anomaly` type in `lib/parsers/zscaler.ts` to include an optional `severity: 'High' | 'Medium' | 'Low'` field.
  - [x] 1.5 Modify `components/log-uploader.tsx` to pass the `analysisResult` to the new `ResultsDashboard` component.

- [x] 2.0 **Develop Summary Metrics Cards**

  - [x] 2.1 In `results-dashboard.tsx`, create a grid layout for the summary cards.
  - [x] 2.2 Implement a function in `lib/analysis-helpers.ts` to calculate summary metrics (total anomalies, breakdown by severity) from the `analysisResult`.
  - [x] 2.3 Create a `SummaryCard` component that accepts a title, value, and an optional icon.
  - [x] 2.4 Display cards for "Total Records", "Total Anomalies", "High Severity", "Medium Severity", and "Low Severity" using the `SummaryCard` component.

- [x] 3.0 **Implement Interactive Anomaly Data Table**

  - [x] 3.1 Use `shadcn/ui`'s `Table` components to build the structure of the anomalies table in `results-dashboard.tsx`.
  - [x] 3.2 Define the table columns as specified in the PRD: Severity, Type, Details, Line, Timestamp.
  - [x] 3.3 Implement sorting functionality for each column in the data table.
  - [x] 3.4 Implement filtering controls (e.g., `Select` or `Checkboxes`) for severity and anomaly type.
  - [x] 3.5 Create state management for the filters and ensure the table updates when filters are applied.
  - [x] 3.6 Add color-coded severity indicators to the "Severity" column based on the PRD's color guidelines.
  - [x] 3.7 Add pagination to the table if the number of anomalies exceeds a certain threshold (e.g., 20).

- [x] 4.0 **Integrate and Display Anomaly Charts**

  - [x] 4.1 In `results-dashboard.tsx`, add a section for charts next to or below the data table.
  - [x] 4.2 Create a function in `lib/analysis-helpers.ts` to transform the anomaly data into a format suitable for `recharts`.
  - [x] 4.3 Implement a `Bar` chart using `shadcn/ui` Charts to show the distribution of anomalies by severity.
  - [x] 4.4 Apply the correct severity colors (red/yellow/green) to the chart sections.
  - [x] 4.5 If timestamp data is reliable, implement an `Area` chart to show anomaly trends over time.

- [ ] 5.0 **Refine Layout, Handle Final States, and Add Documentation**
  - [x] 5.1 Implement an empty state for the dashboard to be displayed when no anomalies are found, using the `shadcn/ui`
        `Alert` component.
  - [x] 5.2 Handle the loading state gracefully while the dashboard is processing results.
  - [x] 5.3 Write unit tests for the data transformation logic in `lib/analysis-helpers.ts`.
  - [x] 5.4 Write component tests for `results-dashboard.tsx` to verify that data is displayed correctly and interactions work
        as expected.
  - [x] 5.5 Add JSDoc comments to new components and functions explaining their purpose, props, and usage.
