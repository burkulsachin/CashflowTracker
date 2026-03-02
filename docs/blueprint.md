# **App Name**: CashFlow Tracker

## Core Features:

- Local User Authentication: Secure local-only sign-up and login with hashed credentials and persistent session management, suitable for offline-first use.
- Transaction Management: Add, edit, and delete income/expense transactions with details like category, date, amount (in minor units), note, and optional merchant. Includes a fast 'Quick Add' flow from the dashboard.
- Intelligent Transaction Categorization: Automatically suggest transaction categories during CSV import or manual entry based on past behavior and transaction details, leveraging a machine learning tool.
- Budgeting & Tracking: Set and manage monthly budgets per category, view progress (budget vs. spent), and identify spending patterns.
- Data Import (CSV): Upload and map bank statement CSV files to transaction fields, with smart duplicate detection based on date, amount, and description.
- Data Export & Backup: Export transactions to CSV and create full application data backups to JSON, with a corresponding restore functionality for all user data.
- Offline Persistence: Utilize SQLite on-device for robust and reliable offline storage, built with an abstraction layer for future cloud synchronization.

## Style Guidelines:

- Primary Color: A reliable and calming professional blue (#3366CC). This hue, reminiscent of stability, promotes clarity and trustworthiness for financial management.
- Background Color: A soft, almost off-white hue with a subtle blue undertone (#EFF3F8). Heavily desaturated from the primary blue, it provides a clean, open canvas that aids readability in a light scheme.
- Accent Color: A clear and refreshing cyan (#2EC2DB). Analogous to the primary, it provides visual differentiation for interactive elements and key information without disrupting the overall sense of calm and precision.
- Headline and Body Font: 'Inter' (sans-serif). A modern, objective, and highly legible font chosen for its clarity across various data points and text lengths, supporting a professional and functional user experience.
- Utilize clean, vector-based icons that clearly represent financial concepts (e.g., categories, transactions, reports). Icons should be easily discernible with sufficient contrast against the chosen color palette.
- Prioritize a spacious and organized layout that emphasizes accessibility. Key financial data should be presented with clear hierarchy and generous negative space to reduce cognitive load. Ensure large touch targets and logical focus order for navigation.
- Incorporate subtle, functional animations for feedback on user actions (e.g., successful transaction saves, budget updates) and smooth transitions between screens. Animations should enhance user understanding without causing delays or distraction.