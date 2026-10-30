WalletPay 💳

Understanding how money moves through a system.

WalletPay is an educational digital wallet project built to explore the fundamentals of financial transaction systems and reliable backend engineering.

The project focuses on concepts such as idempotency, double-entry bookkeeping, transaction integrity, and audit logging to understand how wallet-to-wallet transfers can be implemented safely and consistently.

✨ Overview

WalletPay models wallet-to-wallet transfers and the financial records required to track them.

Rather than treating a transfer as a simple balance update, the system explores how financial operations can be represented through transfer records, ledger transactions, and individual ledger entries.

The primary goal is to understand the backend architecture and database design decisions that make financial applications consistent, traceable, and reliable.

🚀 Core Concepts

1. Idempotency

Requests can be retried without accidentally creating duplicate transfers.

Every request is identified using a unique idempotency key.
Keys are scoped to a user and operation.
Request hashes help identify conflicting requests.
Previous responses can be associated with their original requests. 2. Double-Entry Bookkeeping

Every transfer produces corresponding debit and credit entries.

Money is debited from the sender's wallet.
The same amount is credited to the receiver's wallet.
Both entries belong to one ledger transaction.
Every movement of money is traceable. 3. Transaction Integrity

Related database operations are designed to execute atomically.

Prevents partially completed transfers.
Maintains consistent financial records.
Keeps related database changes within transaction boundaries. 4. Audit Logging

Important actions are recorded to maintain an audit trail.

Audit records can include:

Actor information
Resource information
Timestamps
Metadata
Previous values
Updated values
💸 Double-Entry Ledger Example

Suppose Raghav transfers $25.00 to Sandip.

The system records two corresponding entries:

Account Entry Type Amount
Raghav's Wallet Debit -$25.00
Sandip's Wallet Credit +$25.00

Transaction summary:

Description Amount
Total Debits $25.00
Total Credits $25.00
Difference $0.00

Both sides balance, representing one financial transaction.

🏗️ Database Architecture

WalletPay separates financial transactions, ledger records, idempotency tracking, and audit history into dedicated tables.

Table Responsibility
ledger_transactions Groups ledger entries and references a transfer.
ledger_entries Stores wallet debit and credit records.
idempotency_keys Stores request keys, hashes, and responses.
audit_logs Tracks actions and resource changes.

This separation helps maintain a clear distinction between the transfer itself, its financial impact, and its audit history.

🛠️ Technology Stack

WalletPay is built using the following technologies:

Technology Purpose
Node.js JavaScript runtime
TypeScript Type safety
PostgreSQL Relational database
Drizzle ORM Database ORM
NestJS Backend framework
Next.js Frontend framework
Better Auth Authentication
📂 Project Focus

The project explores:

Wallet-to-wallet money transfers
Idempotent financial operations
Double-entry ledger architecture
Atomic database transactions
Financial record consistency
Audit logging
Backend application architecture
👨‍💻 Developer

dev-sandip

Developer & Creator of WalletPay

GitHub: @dev-sandip
Repository: wallet-pay
🎯 Project Purpose

WalletPay is an independent learning project developed to understand the fundamentals of backend engineering, financial transactions, and reliable wallet systems.

It serves as a practical exploration of how financial applications can be designed with consistency, traceability, and data integrity in mind.

📄 License

This project is intended for educational purposes. See the repository's license file for usage and distribution terms.
