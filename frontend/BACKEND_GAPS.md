# CloudWise — Backend Gaps and Technical Debt Specification

This document details confirmed backend gaps, missing endpoints, and processing limitations identified during the frontend audit against `frontend/DESIGN.md`.

---

## 1. List User Connections

- **Classification**: API Endpoint (`GET /api/aws/connections`)
- **Status**: Confirmed Missing
- **Current Limitation**:
  - The backend only exposes `POST /api/aws/connections/initiate` and `POST /api/aws/connections/{connectionId}/verify` in `CustomerAwsConnectionController.java`.
  - There is no endpoint for an authenticated user to list their existing or verified AWS connections.
  - As a result, the frontend is forced to track connection IDs, account labels, and metadata inside browser `localStorage` under `cloudwise.connections.<email>`.
- **Frontend Need**:
  - The frontend requires a secure `GET` endpoint returning `List<CustomerAwsConnectionSummary>` for the authenticated user so accounts can be restored seamlessly across multiple devices, browsers, and private browsing sessions without relying on fragile browser storage.

---

## 2. Persistent Analysis History

- **Classification**: API Endpoint and Database Storage (`GET /api/ai/history`, `POST /api/ai/history`)
- **Status**: Confirmed Missing
- **Current Limitation**:
  - The backend only provides `POST /api/ai/explain` via `GeminiController.java`, returning an ephemeral explanation string.
  - No server-side entity or table exists to persist completed audit scans, findings, resource tallies, or AI summaries.
  - The frontend currently stores up to 20 past analysis runs in the browser under `cloudwise.history.<email>`, labelling them honestly as "Saved in this browser".
- **Frontend Need**:
  - Team collaboration, multi-device continuity, and historical cost-optimization tracking require server-side persistence of audit scans linked to the user and connection IDs.

---

## 3. Automated Anomaly Detection

- **Classification**: Backend Processing & Analytical Capability
- **Status**: Confirmed Missing
- **Current Limitation**:
  - Neither statistical anomaly detection (e.g. z-score, rolling median MAD) nor ML-based cost anomaly detection exists in the backend service layer.
  - The backend currently provides raw daily Cost Explorer records and 5-minute CloudWatch CPU datapoints without automated anomaly scoring.
- **Frontend Need**:
  - Real-time alerting and dashboard anomaly callouts to flag sudden compute or billing spikes before monthly invoice generation.

---

## 4. Cost and Resource Forecasting

- **Classification**: Backend Analytical & Predictive Engine
- **Status**: Confirmed Missing
- **Current Limitation**:
  - The backend lacks time-series projection models (e.g. Prophet, ARIMA, or linear trend regression) for projecting upcoming month-end cloud spend or storage growth.
  - Cost Explorer queries are restricted to historical date intervals (`startDate` to `endDate`).
- **Frontend Need**:
  - The Overview and Cost pages need reliable month-end spend projections and projected utilization curves based on historical run rates.

---

## 5. Verified Savings Estimates & Financial Modeling

- **Classification**: Backend Analytical Engine & Pricing Integration
- **Status**: Confirmed Missing
- **Current Limitation**:
  - The backend returns resource configurations (e.g. EC2 instance types, EBS GiB and volume types), but has no AWS Pricing API integration or verified cost-reduction calculation model.
  - Per `DESIGN.md` hard rules, the frontend strictly reports `"Savings not estimated"` for all unattached volumes and under-utilized instances to prevent fabricating financial numbers.
- **Frontend Need**:
  - A backend pricing engine that calculates verified monthly dollar savings for rightsizing instances, deleting unattached EBS volumes, and migrating gp2 to gp3 storage, including confidence scores and baseline assumptions.

---

## 6. Password Reset Flow

- **Classification**: Authentication & Security Flow (`POST /api/auth/forgot-password`, `POST /api/auth/reset-password`)
- **Status**: Confirmed Missing
- **Current Limitation**:
  - `AuthController.java` and `AuthService.java` only implement registration (`/api/auth/register`), login (`/api/auth/login`), and session verification (`/api/auth/me`).
  - No email verification, reset token generation, or password reset endpoints exist.
- **Frontend Need**:
  - Self-service password recovery flow on the login screen to allow locked-out users to regain account access securely.

---

## 7. Google OAuth Sign-In

- **Classification**: Authentication Integration (`POST /api/auth/oauth/google`)
- **Status**: Confirmed Missing
- **Current Limitation**:
  - `SecurityConfig.java` exclusively configures JWT stateless authentication for email/password credentials.
  - There is no OAuth2 client configuration, Google token verification endpoint, or linked federated user profile handling.
  - The frontend displays a standard Google sign-in button that is disabled per `DESIGN.md` to prevent invoking nonexistent endpoints.
- **Frontend Need**:
  - Full Google OAuth 2.0 authorization code exchange or OpenID Connect ID token verification endpoint to allow single-click sign-in.

---

## 8. CloudWise Trusted Principal Configuration Exposure

- **Classification**: Configuration Exposure Endpoint (`GET /api/aws/config/trust-principal`)
- **Status**: Confirmed Missing
- **Current Limitation**:
  - When users configure an AWS IAM Role trust relationship in the AWS Console, they require CloudWise's backend AWS Account ID or IAM Role ARN as the trusted entity (along with the returned External ID).
  - The backend currently generates and validates the External ID, but does not provide an endpoint or public configuration value exposing the CloudWise AWS account ARN to insert into the trust policy.
- **Frontend Need**:
  - A configuration endpoint or verified contract returning the official CloudWise IAM ARN so the connection wizard can display the exact IAM trust policy JSON for the user to copy directly into AWS.
