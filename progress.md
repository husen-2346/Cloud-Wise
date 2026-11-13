# CloudWise: Development Progress

> **AI-Powered Multi-Cloud Cost Optimization Platform**

| | |
|---|---|
| **Repository** | [husen-2346/Cloud-Wise](https://github.com/husen-2346/Cloud-Wise) |
| **Current stage** | Initial application completed; advanced development pending |
| **Last updated** | 8 November 2026 |

**Contents**

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Completed Development](#3-completed-development)
4. [Research and Algorithm Decisions](#4-research-and-algorithm-decisions)
5. [Pending Development](#5-pending-development)
6. [Current Limitations](#6-current-limitations)
7. [Development Roadmap](#7-development-roadmap)
8. [Progress Tracking Rules](#8-progress-tracking-rules)

---

## 1. Project Overview

CloudWise is a unified platform for monitoring, analyzing, forecasting and optimizing cloud expenditure across **AWS** and **Microsoft Azure**.

**Goals**

- Connect users' cloud accounts securely
- Collect billing, resource inventory and utilization data
- Normalize data from multiple cloud providers
- Detect unusual cloud expenditure
- Forecast future cloud costs
- Identify resource optimization opportunities
- Estimate potential savings using evidence-based calculations
- Generate AI-assisted explanations and recommendations
- Present results through a unified dashboard

---

## 2. Technology Stack

| Component | Technology | Status |
|---|---|---|
| Frontend | React, TypeScript, Vite | Implemented |
| Styling | Tailwind CSS | Implemented |
| Backend | Java, Spring Boot | Implemented |
| Authentication | Spring Security, JWT | Implemented |
| Database | PostgreSQL, Spring Data JPA | Initial integration |
| Cloud integration | AWS SDK for Java 2.x | Initial integration |
| AI integration | OpenRouter API | Implemented in source |
| Build tool | Maven | Configured |
| Azure integration | Azure SDK / APIs | Planned |
| Analytics engine | Java or Python | Architecture not finalized |

---

## 3. Completed Development

| # | Module | Status |
|---|---|---|
| 1 | Frontend Foundation | Implemented in source |
| 2 | Backend Foundation | Implemented in source |
| 3 | User Authentication | Implemented; runtime verification pending |
| 4 | Initial AWS Integration | Implemented; live verification pending |
| 5 | AI Explanation Integration | Implemented; live API verification pending |
| 6 | Initial Analysis Dashboard | Implemented in source |

### Module 1: Frontend Foundation

- React app created with Vite and TypeScript
- Login and registration pages
- Main dashboard
- AWS connection and analysis interface
- Analysis history and report presentation
- Settings interface
- Frontend API service layer

### Module 2: Backend Foundation

- Spring Boot backend established
- Maven project configuration
- Packages organized into authentication, AWS and AI
- REST API architecture

### Module 3: User Authentication

- Registration and login endpoints
- BCrypt password hashing
- JWT generation and validation
- Protected API configuration
- Current-user endpoint
- PostgreSQL user persistence

### Module 4: Initial AWS Integration

- AWS SDK for Java 2.x integrated
- Local AWS profile configured
- STS identity verification
- EC2 instance discovery
- EBS volume discovery
- Inventory exposed through backend REST endpoints

> **Limitation:** Uses a local AWS profile. Customer-specific IAM role assumption (STS AssumeRole) is not yet implemented.

### Module 5: AI Explanation Integration

- OpenRouter API integration
- AI explanation endpoint
- Cloud resource findings passed to the AI service
- Prompt restrictions to prevent fabricated costs, utilization metrics and savings

> **Limitation:** The AI explains supplied findings. It is not the numerical analytics or optimization engine.

### Module 6: Initial Analysis Dashboard

- AWS resource inventory displayed
- Potential unattached EBS volumes identified
- Analysis results shown on the dashboard
- AI explanation integrated into the analysis workflow
- Sample reports and live analysis distinguished in the UI

---

## 4. Research and Algorithm Decisions

| Algorithm | Purpose | Decision | Status |
|---|---|---|---|
| Rolling Median + MAD | Anomaly detection | Must keep | Not implemented |
| Seasonal Naive | Baseline forecasting | Must keep | Not implemented |
| Holt-Winters | Time-series forecasting | Must keep | Not implemented |
| Rule-Based Optimization | Evidence-based recommendations | Must keep | Not implemented |

### Intended pipeline

1. Collect and normalize cloud cost and utilization data
2. Detect anomalies with Rolling Median + MAD
3. Forecast baseline with Seasonal Naive
4. Forecast trend and seasonality with Holt-Winters
5. Generate recommendations with rule-based optimization
6. Explain findings with the LLM, using supplied evidence only

### Evaluation plan

| Area | Approach |
|---|---|
| Forecasting | Seasonal Naive is the baseline for Holt-Winters; measured with MAE and RMSE |
| Anomaly detection | Precision, recall, F1-score, false-positive rate |
| Savings | Must be supported by pricing and resource evidence |
| LLM output | Must not invent numerical results |

---

## 5. Pending Development

| Module | Required Work | Status |
|---|---|---|
| Technical audit | Document actual architecture and implementation | Pending |
| AWS authentication | Customer IAM role connection via STS AssumeRole | Pending |
| AWS billing | Billing/cost retrieval | Pending |
| AWS utilization | CloudWatch metrics | Pending |
| Azure integration | Authentication and data retrieval | Pending |
| Data normalization | Common multi-cloud data model | Pending |
| Database expansion | Cloud connections, cost data, analyses, recommendations | Pending |
| Anomaly detection | Rolling Median + MAD | Pending |
| Forecasting | Seasonal Naive | Pending |
| Advanced forecasting | Holt-Winters | Pending |
| Optimization engine | Evidence-based rules | Pending |
| AI explanation | Integrate with computed analytics results | Pending |
| Analysis persistence | Store history in PostgreSQL | Pending |
| Dashboard expansion | Unified multi-cloud analytics | Pending |
| Testing and evaluation | Unit, integration and algorithm tests | Pending |
| Documentation | Final report, diagrams, README | Pending |

---

## 6. Current Limitations

1. AWS integration retrieves resource inventory, not complete billing data.
2. CloudWatch utilization integration is not implemented.
3. Azure integration is not implemented.
4. Customer-specific AWS role assumption is not implemented.
5. The four selected analytics algorithms are not implemented.
6. No complete evidence-based optimization engine exists yet.
7. Persistent analysis history is not established.
8. The final analytics architecture (including the Java/Python boundary) is undecided.

---

## 7. Development Roadmap

1. Complete technical audit of existing source code
2. Finalize architecture and database design
3. Implement secure AWS customer-account connections
4. Integrate AWS billing and utilization data
5. Implement Azure integration
6. Build common data normalization and preprocessing
7. Implement and evaluate the four selected algorithms
8. Develop the optimization and savings calculation engine
9. Integrate AI explanations
10. Complete dashboard, reports and persistent history
11. Perform comprehensive testing and evaluation
12. Complete final MCA documentation and presentation

---

## 8. Progress Tracking Rules

- Mark a module **Implemented** only when its code is present.
- Mark a module **Verified** only after tests or execution confirm it works.
- Record important files created or modified.
- Record unresolved bugs and limitations.
- Update this document after every meaningful completed development step.
- Do not claim measured accuracy, savings or performance without experimental evidence.

---

**Current milestone:** Initial application foundation completed; full multi-cloud analytics development pending.

### AWS Account Connection — Verified

- Implemented AWS SDK client configuration using the `cloudwise-readonly` profile.
- Configured STS, EC2, CloudWatch, and Cost Explorer clients.
- Implemented AWS identity service using STS GetCallerIdentity.
- Added authenticated GET `/api/aws/identity` endpoint.
- Verified successful connection to AWS account `748076390893`.
- Confirmed successful assumption of `CloudWiseReadOnlyRole` through the Java AWS SDK.

Status: Implemented and runtime verified.

