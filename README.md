# TENEX.AI Demo App

This is a [Next.js](https://nextjs.org) project that demonstrates a log analysis application for detecting security anomalies.

## Demo

The easiest way to see the demo:

1. [TENEX.AI Demo App](https://tenex-eight.vercel.app/)
2. Use GitHub or Google to sign in.
3. Grab a sample log file to test with. Click on one of the links below, then right-click the "Raw" button and select "Save Link As..." to download the file.
   - [Small log file](./samples/data-small.log)
   - [Medium log file](./samples/data-medium.log)
4. Upload and Parse the log file.
5. Wait for the analysis to complete.
6. View the results.
7. Upload a different log file using the Upload Another File button at the bottom of the operations dashboard.

## Prerequisites

Before you begin, you will need to create accounts with the following services:

- **[Clerk](https://clerk.com/):** For user authentication.
- **[Neon](https://neon.tech/):** For the serverless Postgres database.

## Local Development Setup

To get started with the project, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-repo/tenex.git
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following environment variables. You can get these from your Clerk and Neon accounts.

    ```
    # Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=

    # Neon Database
    DATABASE_URL=
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Anomaly Detection Approach

The application uses a two-pronged approach to detect anomalies in log files:

### 1. Rule-Based Detection

This method uses a predefined set of rules to identify known patterns of suspicious activity. The current rules include:

- **Large Downloads:** Flags log entries where the downloaded bytes exceed a certain threshold (e.g., >10MB).
- **Blocked Requests:** Identifies any requests that were blocked by a security policy.
- **High-Risk Categories:** Flags access to web categories that are known to be high-risk (e.g., Phishing, Malware).

### 2. Statistical Detection

This method identifies outliers based on statistical analysis of the data.

- **High Traffic Users:** Detects users whose number of requests is significantly higher than the average, indicating potentially anomalous behavior.

These detectors are orchestrated by a central log analyzer that processes the log files and returns a list of all detected anomalies.

## Learn More about Next.js

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
