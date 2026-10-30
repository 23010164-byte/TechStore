# User Stories — TechStore

## Customer
1. As a visitor, I want to browse products so that I can discover available items.
2. As a visitor, I want to search by keyword so that I can find a product quickly.
3. As a visitor, I want to filter by category so that I can narrow the catalog.
4. As a visitor, I want to open product details so that I can understand an item's features. *(Extend UI with a dedicated detail route if required.)*
5. As a visitor, I want to register an account so that I can place orders.
6. As a registered customer, I want to log in securely so that I can access my account.
7. As a customer, I want my session to use a signed JWT so that protected endpoints can identify me.
8. As a customer, I want to add products to a cart so that I can purchase several items together.
9. As a customer, I want to change quantities so that the order reflects what I need.
10. As a customer, I want to remove items from the cart so that I can revise my selection.
11. As a customer, I want to submit a shipping address so that my order can be delivered.
12. As a customer, I want to see my order history so that I can review past purchases.
13. As a customer, I want to track order status so that I know the current progress.
14. As a customer, I want stock to be checked during checkout so that I cannot order unavailable quantities.
15. As a customer, I want my password stored as a salted hash so that plaintext passwords are not saved.
## Administrator
16. As an administrator, I want to create products so that the catalog can be maintained.
17. As an administrator, I want to update product details so that listings remain accurate. *(API available; UI extension recommended.)*
18. As an administrator, I want to delete products so that obsolete listings can be removed. *(API available; UI extension recommended.)*
19. As an administrator, I want to see all orders so that I can manage fulfillment.
20. As an administrator, I want to update order status so that customers can track fulfillment. *(API available; UI extension recommended.)*
21. As an administrator, I want role-protected endpoints so that customers cannot access admin operations.

## Acceptance criteria examples
- Search is case-insensitive under MySQL's usual collation and supports name/description.
- Checkout rejects empty address, invalid quantities, missing products and insufficient stock.
- Product mutations require a valid JWT and `admin` role.
- Login rejects invalid credentials with an unauthorized response.
- Orders are associated with the authenticated user; customers can only retrieve their own history.
