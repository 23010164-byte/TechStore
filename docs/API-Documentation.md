# API documentation

Base URL: `http://localhost:3000/api`

## Authentication
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register customer |
| POST | `/auth/login` | Public | Login and receive JWT |

Register body:
```json
{"fullName":"Nguyen Van A","email":"a@example.com","password":"minimum8chars"}
```
Login body:
```json
{"email":"a@example.com","password":"minimum8chars"}
```
Protected requests use `Authorization: Bearer <accessToken>`.

## Products
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/products?q=mouse&category=Accessories` | Public | Search/filter catalog |
| GET | `/products/:id` | Public | Product detail |
| POST | `/products` | Admin | Create product |
| PATCH | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |

Product body example:
```json
{"name":"USB-C Cable","description":"1m cable","category":"Accessories","price":150000,"stock":20,"imageUrl":"https://example.com/cable.jpg"}
```

## Orders
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/orders` | Customer/Admin | Checkout |
| GET | `/orders/mine` | Customer/Admin | Current user's order history |
| GET | `/orders` | Admin | All orders |
| PATCH | `/orders/:id/status` | Admin | Update status |

Checkout body:
```json
{"shippingAddress":"12 Example Street, Da Nang","items":[{"productId":1,"quantity":2}]}
```
Valid statuses: `pending`, `confirmed`, `shipping`, `completed`, `cancelled`.

Typical error codes: `400` validation/business rule error, `401` missing/invalid credentials, `403` forbidden role, `404` resource not found, `409` duplicate email.
