# CloudWise Frontend — Design and Engineering Rules

This document is the single source of truth for the CloudWise frontend design system, visual language, engineering constraints and integration rules.

## 1. Hard Rules

1. Edit only files inside `frontend/`. The `backend/` directory is read-only reference material.
2. Never edit backend code, `frontend/vite.config.ts`, or `frontend/src/services/authApi.ts`.
3. Preserve existing authentication behaviour:
   - Login.
   - Registration.
   - Current-user validation.
   - Session handling.
   - `sessionStorage` keys: `cloudwise_token` and `cloudwise_user_name`.
   - A 401 response clears the session and reloads, as implemented by the existing `authenticatedFetch`.
4. Never present invented data as real data.
   - Real operational data must come from the backend.
   - Empty API responses must produce honest empty states.
   - Illustrative data, if absolutely necessary on the public landing page, must be explicitly labelled as illustrative.
   - Never invent costs, savings, forecasts, resource counts, anomalies or customer statistics.
5. Light theme only. No dark mode and no dark surfaces.
6. Use USD formatting only when the actual API currency/unit is USD. Do not assume every Cost Explorer response is USD.
7. Use one consistent visual language throughout the application. Do not introduce arbitrary colours, fonts, radii, shadows or button styles outside this specification.
8. Remove the old dark and mint theme styles (`#0b1116`, `#a7f3c0` and related legacy theme classes). Preserve semantic status colours, including green for successful and connected states.
9. Do not remove or break working authentication or API functionality while rebuilding the UI.
10. Do not run `git commit` or `git push`.

## 2. Product Facts

CloudWise is an AI-powered cloud cost and resource optimization platform.

Provider availability:
- AWS: Available and implemented.
- Azure: Coming soon; UI only, disabled.
- Google Cloud: Coming soon; UI only, disabled.

Authentication:
- Email/password authentication is implemented.
- Google sign-in is planned, but its backend OAuth implementation does not exist yet.
- Display a Google sign-in button without a "Coming soon" badge or label.
- The Google button must not initiate a fake authentication flow or call a nonexistent endpoint. Keep it disabled until the backend OAuth implementation is available.

Currently implemented backend functionality:
- Authentication.
- AWS cross-account connection using IAM Role ARN and External ID.
- EC2 inventory.
- EBS inventory.
- CloudWatch CPU metrics.
- Cost Explorer service costs.
- AI explanation of supplied context.

Not implemented yet:
- Automated anomaly detection.
- Cost forecasting.
- Verified savings estimates.
- Full analytical engine.
- Server-side analysis history.
- Password reset.
- Google OAuth.
- Azure and Google Cloud connections.

These features must not be presented as operational. They may appear as clearly identified future capabilities.

## 3. Design Tokens

Define these tokens in `src/index.css` inside the Tailwind `@theme` configuration. Use the tokens consistently rather than scattering arbitrary values throughout components.

### Colours

| Token | Value | Purpose |
|---|---|---|
| ink | `#0B1F3A` | Headings |
| body | `#33455C` | Main body text |
| muted | `#5B6B82` | Secondary text |
| line | `#DCE6F2` | Borders and dividers |
| app | `#F4F8FD` | Application background |
| surface | `#FFFFFF` | Cards and panels |
| tint | `#EAF3FF` | Hover and selected backgrounds |
| brand-300 | `#5CC4FF` | Light brand accent |
| brand-400 | `#1AB0FF` | Brand accent |
| brand-500 | `#0A8BFF` | Primary brand colour |
| brand-600 | `#0068E8` | Strong brand colour |

Primary gradient:

`linear-gradient(135deg, #1AB0FF, #0A8BFF)`

Semantic colours:
- Success: `#16A34A` on `#E8F7EE`.
- Warning: `#B45309` on `#FEF3DC`.
- Danger: `#DC2626` on `#FDEBEC`.
- Neutral: `#5B6B82` on `#EEF2F7`.

Chart palette, in order:
1. `#0A8BFF`
2. `#22C3EE`
3. `#6C7BFF`
4. `#14B8A6`
5. `#94A3B8`
6. `#CBD5E1` for Other.

Glass:
- Background: `rgba(255,255,255,.62)`.
- Backdrop blur: `18px`.
- Border: `1px solid rgba(255,255,255,.7)`.

### Radius

- Inputs: `12px`.
- Cards: `20px`.
- Panels: `28px`.
- Buttons and badges: fully rounded.

### Shadows

Card:
`0 1px 2px rgba(11,31,58,.04), 0 14px 34px -14px rgba(11,31,58,.14)`

Glow:
`0 10px 28px -8px rgba(10,139,255,.55)`

Focus ring:
`0 0 0 3px rgba(10,139,255,.28)` plus a brand-500 border.

## 4. Typography

Display font:
- Source Serif 4.
- Weight 500.
- Letter spacing `-0.03em`.
- Line height `1.0`.
- Used only for landing headlines, landing section titles and authentication headlines.

UI font:
- Inter.
- Used for all application UI, including dashboard headings.

Typography scale:
- App page title: 28px / 600 / ink.
- Section title: 16px / 600.
- Body: 14px.
- Caption: 12px / muted.
- Eyebrow: 12px / 600 / uppercase / tracking `.14em`.

KPI numbers:
- Inter 600.
- 28–32px.
- Tabular numerals.

JetBrains Mono:
- Resource IDs.
- AWS ARNs.
- External IDs.
- JSON and technical identifiers.

Landing H1:
- `clamp(2.75rem, 6vw, 5.75rem)`.
- First line: ink.
- Second line: brand-500. A brand-400 to brand-500 gradient is permitted.

Copy style:
- Sentence case.
- No emoji.
- No exclamation marks.
- Clear, professional, trustworthy language.

## 5. Components

Build reusable components in `src/components/ui`. Do not recreate the same component independently on every page.

### Button
Variants:
- Primary: gradient background, white text, subtle glow.
- Secondary: glass-white background, ink text and line border.
- Ghost: brand-600 text and tint hover.
- Danger: white background, danger text and border.

Sizes:
- Medium: height 44px.
- Large: height 56px.

Interactions:
- Hover brightness 1.06 and translateY(-1px).
- Loading spinner.
- Disabled opacity `.55`.

### Input and Select
- Height 48px.
- Radius 12px.
- White background.
- Line border.
- Optional leading muted icon.
- Error state with danger border and 12px message below.
- Password visibility toggle.

### Badge
Variants:
- available
- connected
- pending
- coming-soon
- failed
- running
- stopped
- in-use
- unattached

### Other reusable components
- Card.
- StatCard.
- Table.
- Skeleton with shimmer.
- EmptyState.
- Alert: info, success, warning, error.
- CopyField.
- Stepper.
- Tabs with underline brand-500.
- Toast.
- Spinner.

Every data-driven view must support:
1. Loading skeleton.
2. Empty state.
3. Error state with Retry.
4. Success state with actual data.

## 6. Backgrounds and Blending

Expected image assets in `public/images/`:

- `hero-bg.webp`
- `auth-panel.webp`
- `app-haze.webp`
- `cta-band.webp`
- `hero-mobile.webp`

Use the actual supplied/generated assets if they exist. Do not generate unrelated replacement imagery.

If an asset is missing, use a fallback gradient:

`#BFE3FF → #EAF5FF → #F4F8FD`

Never display a broken image.

### Landing hero
- Minimum height: `100svh`.
- Background image: cover.
- Position: center bottom.
- Overlay 1: radial white veil behind the text block, starting at `rgba(255,255,255,.45)` and fading to transparent by 65%.
- Overlay 2: bottom 22% fades into the app background so the next section blends without a hard edge.
- No fixed attachment.
- Use `hero-mobile.webp` below 768px.

### Authentication
- Image panel on the left, 52% width on large screens.
- White form panel on the right with rounded left edge (28px), overlapping the image.
- On mobile, image becomes a 160px banner above the form.
- Keep the same CloudWise background world, palette and visual identity.

### App shell
- `app-haze.webp` behind the page header.
- Height: 260px.
- Mask using a linear gradient that fades to transparent at the bottom.
- Cards sit above the background.

### Landing sections
- Alternate app and white backgrounds.
- Use a 1px line between sections.
- Never place text over a busy image without an appropriate readability veil.

## 7. Motion

- Hover: 150ms.
- UI changes: 250ms.
- Entrances: 600ms.
- Easing: `cubic-bezier(.2,.7,.2,1)`.
- Entrance: fade-up by 12px.
- Stagger entrances by 80ms.
- Cards lift 2px on hover.
- CSS only; no animation libraries.
- Respect `prefers-reduced-motion`.

## 8. Responsive Design and Accessibility

Laptop screens are the first priority. The UI must look correct at:

- 1366×768.
- 1440×900.
- 1536×864.
- 1920×1080.

Then support:
- Tablet: 768px and up.
- Mobile: 360px and up.

Layout:
- Sidebar: 248px fixed at 1024px and above.
- Below 1024px: responsive drawer.
- Content maximum width: 1280px.
- Tables scroll horizontally on small screens.
- Touch targets at least 44px.

Accessibility:
- Every input has a visible label.
- Focus is always visible.
- Status updates use `aria-live`.
- Colour is never the only status indicator.
- Use semantic HTML.
- Keyboard navigation must work.
- Icon-only controls must have accessible names.

## 9. Routes and Structure

Routes:

- `/` — Landing.
- `/login`.
- `/register`.
- `/app` — Protected application shell.
- `/app/overview`.
- `/app/connect`.
- `/app/connect/aws`.
- `/app/accounts`.
- `/app/resources/ec2`.
- `/app/resources/ebs`.
- `/app/cost`.
- `/app/insights`.
- `/app/history`.
- `/app/settings`.

Suggested folders:

```text
src/
  context/
    AuthContext
    ConnectionsContext
  services/
    authApi.ts
    awsApi.ts
    aiApi.ts
  components/
    ui/
    layout/
    brand/
    charts/
  pages/
    landing/
    auth/
    app/
  config/
    site.ts
```

`authApi.ts` must remain unchanged. `awsApi.ts` may be updated to match the actual backend contracts. `aiApi.ts` is new.

## 10. Backend Contract

All paths are relative and proxied by Vite.

Send this header for authenticated endpoints:

`Authorization: Bearer <token>`

### Authentication

- `POST /api/auth/register`
  - Request: `{name, email, password}`.
  - Name maximum: 100 characters.
  - Password: 8–72 characters.
- `POST /api/auth/login`
  - Returns `{id, name, email, token, tokenType}`.
- `GET /api/auth/me`
  - Returns `{email}`.

JWT token lifetime: 1 hour.

Preserve the existing auth API implementation and session handling.

### AWS connection

`POST /api/aws/connections/initiate`

Request:

```json
{
  "roleArn": "arn:aws:iam::024899754500:role/CloudWiseCustomerRole"
}
```

Response:

```json
{
  "connectionId": 1,
  "roleArn": "arn:aws:iam::024899754500:role/CloudWiseCustomerRole",
  "externalId": "<generated-external-id>",
  "status": "PENDING"
}
```

The role ARN must follow this exact pattern:

`arn:aws:iam::<12-digit-account-id>:role/CloudWiseCustomerRole`

The user-facing wizard should ask for the 12-digit AWS Account ID first and construct the role ARN in the frontend.

`POST /api/aws/connections/{id}/verify`

Returns:

```json
{
  "accountId": "024899754500",
  "arn": "arn:aws:sts::024899754500:assumed-role/CloudWiseCustomerRole/CloudWiseConnection-1",
  "status": "CONNECTED"
}
```

Verification is only valid while the connection is PENDING.

### Resource discovery

`GET /api/aws/connections/{id}/instances`

Returns an array containing:

```json
{
  "instanceId": "i-0123456789abcdef0",
  "instanceType": "t3.micro",
  "state": "stopped",
  "name": "Example",
  "availabilityZone": "ap-south-1a",
  "publicIpAddress": null,
  "privateIpAddress": "172.31.0.10",
  "launchTime": "2026-11-01T10:00:00Z"
}
```

`GET /api/aws/connections/{id}/volumes`

Returns an array containing:

```json
{
  "volumeId": "vol-0123456789abcdef0",
  "sizeGiB": 8,
  "volumeType": "gp3",
  "state": "in-use",
  "availabilityZone": "ap-south-1a",
  "attachedInstanceIds": ["i-0123456789abcdef0"],
  "encrypted": true,
  "createTime": "2026-11-01T10:00:00Z"
}
```

These objects are schema examples. Do not hardcode their values.

### CloudWatch

`GET /api/aws/connections/{id}/cloudwatch/cpu?instanceId={id}&startTime={ISO_INSTANT}&endTime={ISO_INSTANT}`

Returns:

```json
[
  {
    "instanceId": "i-0123456789abcdef0",
    "metricName": "CPUUtilization",
    "unit": "Percent",
    "timestamp": "2026-11-01T16:35:00Z",
    "average": 0.14,
    "maximum": 0.24
  }
]
```

Data is returned at 5-minute resolution.

### Cost Explorer

`GET /api/aws/connections/{id}/costs/services?startDate={yyyy-MM-dd}&endDate={yyyy-MM-dd}`

Returns:

```json
[
  {
    "date": "2026-10-01",
    "service": "Amazon Elastic Compute Cloud - Compute",
    "amount": 0.12,
    "unit": "USD"
  }
]
```

The API returns the currency/unit in each record. Use that returned unit for formatting. Do not hardcode currency when displaying API data.

AWS Cost Explorer's end date is exclusive.

If the date picker presents an inclusive start and end date, convert the selected end date to the following calendar date when constructing the API request.

Example: to display October 1 through October 31 inclusive, send:

`startDate=2026-10-01&endDate=2026-11-01`

### Sync endpoints

These endpoints persist data server-side:

- `POST /api/aws/connections/{id}/sync/resources`
- `POST /api/aws/connections/{id}/sync/costs?startDate&endDate`
- `POST /api/aws/connections/{id}/sync/cloudwatch/cpu?instanceId&startTime&endTime`

They return counts and status. Use the actual response values in the UI.

### AI explanation

`POST /api/ai/explain`

Request:

```json
{
  "context": "string containing evidence and resource information"
}
```

Response:

```json
{
  "explanation": "Markdown explanation"
}
```

Do not assume an AI explanation is equivalent to a complete analytical engine.

### Missing backend endpoints

There is currently:

- No endpoint to list a user's AWS connections.
- No server-side history endpoint.
- No Google OAuth endpoint.
- No Azure connection endpoint.
- No Google Cloud connection endpoint.

Do not invent or call missing endpoints.

If additional backend functionality is required, record it in `frontend/BACKEND_GAPS.md` and leave the backend unchanged.

## 11. Data and Browser Storage Rules

The backend currently does not expose an endpoint to list a user's AWS connections.

To support the active browser workflow, store connection metadata locally, scoped by authenticated email:

- `cloudwise.connections.<email>`
- `cloudwise.activeConnection.<email>`

Connection metadata may include:

- connectionId
- label
- accountId
- roleArn
- status
- createdAt

External ID handling:
- Store External ID only while the connection is pending and the user needs it to configure the AWS trust relationship.
- Do not log or expose it to analytics.
- Clear it from browser storage after successful verification.
- Do not store AWS access keys or secret credentials.

Important connection-status rule:

A connection restored from localStorage is only browser-saved information. It is not proof that the backend currently considers the connection connected.

- Label locally restored information as "Saved in this browser".
- Never claim that a cached status has been freshly verified.
- Do not fabricate a server-side connection list.
- Do not attempt verification again on an already-connected connection if the backend only permits verification from PENDING.
- Record this limitation in `frontend/BACKEND_GAPS.md`.

History:

- Store at most 20 locally generated history items under `cloudwise.history.<email>`.
- Clearly label them as "Saved in this browser".
- Do not imply server-side persistence.
- Do not seed fake history records.

### Cost Explorer caching

Cost Explorer calls may incur AWS charges.

- Cache responses in memory for 10 minutes per `(connectionId, startDate, endDate)`.
- Do not call Cost Explorer on every render or route change.
- Refetch only on explicit Refresh or after cache expiry when the user requests fresh data.
- Do not create duplicate calls through unstable React effects.

### CloudWatch charting

CloudWatch returns 5-minute datapoints.

Downsample before rendering:
- 24 hours: 30-minute buckets.
- 7 days: 3-hour buckets.

Aggregate buckets correctly:
- Average series: calculate the average of available average values.
- Maximum series: retain the maximum value in the bucket.
- Do not simply discard points or invent values.

### Currency formatting

Use the actual currency returned by the API.

For USD records:

`Intl.NumberFormat("en-US", {style:"currency", currency:"USD"})`

Show two decimal places for amounts under $1,000.

Do not display a currency symbol for an empty response or assume that an empty response means zero spend.

### Date formatting

Use a consistent date format:

`Nov 20, 2026`

Use relative time for resource launch times where appropriate.

## 12. AWS Connection Wizard — User Experience

The wizard must follow this exact user-facing order:

### Step 1 — AWS Account ID

- Ask for the 12-digit AWS Account ID.
- Validate that it contains exactly 12 digits.
- Explain where the user can find it in AWS Console.
- Construct the role ARN:

`arn:aws:iam::<account-id>:role/CloudWiseCustomerRole`

- Call the existing initiation endpoint.

### Step 2 — External ID

- Display the actual External ID returned by the backend.
- Provide a Copy button.
- Explain how the user must update the AWS IAM role trust relationship.
- Never invent the CloudWise trusted principal.
- If the required principal is not available through a verified project configuration or approved setup guide, explain that this configuration detail must be supplied before the user can complete the trust policy.

### Step 3 — Verify

- User returns to CloudWise after saving the AWS trust relationship.
- User clicks Verify.
- Call the existing verification endpoint.
- Display the actual AWS account ID and assumed-role ARN on success.
- Only then show the connection as Connected.

After verification, offer a Discover Resources action.

Do not ask the user for permanent AWS access keys.
