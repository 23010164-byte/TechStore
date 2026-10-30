# UML and business model

## Class diagram (Mermaid)
```mermaid
classDiagram
  class User {
    +int id
    +string fullName
    +string email
    +string passwordHash
    +string role
  }
  class Product {
    +int id
    +string name
    +string description
    +string category
    +decimal price
    +int stock
  }
  class Order {
    +int id
    +int userId
    +string status
    +decimal total
    +string shippingAddress
    +datetime createdAt
  }
  class OrderItem {
    +int id
    +int orderId
    +int productId
    +string productName
    +decimal unitPrice
    +int quantity
  }
  User "1" --> "0..*" Order : places
  Order "1" *-- "1..*" OrderItem : contains
  Product "1" --> "0..*" OrderItem : referenced by
```

## Checkout activity / algorithm
```mermaid
flowchart TD
  A([Start checkout]) --> B{Logged in?}
  B -- No --> C[Ask user to sign in]
  B -- Yes --> D{Address and cart valid?}
  D -- No --> E[Show validation message]
  D -- Yes --> F[Begin database transaction]
  F --> G[Lock and load each product]
  G --> H{Enough stock?}
  H -- No --> I[Rollback and return error]
  H -- Yes --> J[Decrease stock and create order items]
  J --> K[Save order]
  K --> L[Commit transaction]
  L --> M[Clear cart and show success]
```

## Business rules
- Only users with role `admin` can mutate products or manage all orders.
- Product price and stock cannot be negative.
- An order must contain at least one line and a shipping address.
- The checkout process should be atomic: if a line fails validation, stock updates must roll back.
- Order item name and price are snapshots, so later product edits do not change the historic order.
