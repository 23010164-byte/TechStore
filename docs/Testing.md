# Testing plan and evidence log

## Status
No tests are claimed to have passed merely because this repository was generated. Run the commands and record actual results here.

## Manual test matrix
| ID | Scenario | Expected result | Actual result |
|---|---|---|---|
| T01 | Register with valid new email | User created; JWT returned | Pending |
| T02 | Register duplicate email | HTTP 409 | Pending |
| T03 | Login with wrong password | HTTP 401 | Pending |
| T04 | Search products by keyword | Matching products only | Pending |
| T05 | Filter by category | Matching category only | Pending |
| T06 | Customer tries POST `/products` | Denied (403) | Pending |
| T07 | Admin creates product | Product saved | Pending |
| T08 | Checkout with empty cart | HTTP 400 | Pending |
| T09 | Checkout with insufficient stock | HTTP 400; stock unchanged | Pending |
| T10 | Checkout with valid items | Order saved; stock decremented | Pending |
| T11 | Customer requests `/orders/mine` | Only own orders returned | Pending |
| T12 | Admin updates order status | Status updated | Pending |

## Commands to run
```bash
cd backend && npm install && npm run build && npm test
cd frontend && npm install && npm run build
```

Attach screenshots of successful builds, API tests (Postman/Insomnia), UI flows and the demo. Replace `Pending` only after executing each test. Recommended additions: Jest unit tests for service logic and integration tests against a disposable test database.
