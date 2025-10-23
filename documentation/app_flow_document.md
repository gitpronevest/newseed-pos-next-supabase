# App Flow Document

## Onboarding and Sign-In/Sign-Up

When a brand-new user first visits the application, they arrive at the landing page hosted at the root domain. This page presents a welcome message and a prominent link to the sign-in page. If no admin account exists, the user is invited to create one by clicking a link labeled “Sign Up.” On the sign-up page, the user enters their email address, chooses a secure password, and submits the form. The system uses Supabase Auth under the hood to register the user and send a confirmation email. Once the user confirms their email and completes the registration, they are redirected to the sign-in page.

To sign in, the admin enters their registered email and password on the sign-in page. Upon successful authentication, the admin is brought into the protected dashboard area. A “Forgot Password” link on the sign-in page allows the admin to recover a lost password. Clicking that link prompts the user for their email, sends a reset link via Supabase Auth, and then lets the admin choose a new password on a secure reset page. Signing out is handled via a “Sign Out” option in the profile menu, which terminates the session and redirects the user back to the sign-in page.

## Main Dashboard or Home Page

After signing in, the admin lands on the main dashboard at `/dashboard`. The interface presents a persistent sidebar on the left with navigation links for Shift Management, POS, Products, Categories, Options, Reports, and Transactions. At the top, a header displays the application title, a toggle for dark or light theme, and a profile menu. The central area of the dashboard initially shows the Shift Management view. If no shift is active, an “Open Shop” button appears. If a shift is already open, real-time statistics for total sales and transaction count are displayed alongside a “Close Shop” button.

The sidebar links allow the admin to move seamlessly to other modules. Hovering over a link highlights it, and clicking it loads the new page in the main content area without reloading the entire layout. The header and sidebar remain present at all times, providing a consistent frame for navigation.

## Detailed Feature Flows and Page Transitions

### Shift Management Flow

On the Shift Management view, the admin clicks “Open Shop” to start a new shift. A confirmation dialog appears to prevent accidental opens. Confirming sends a request to the backend via a Next.js API route. The server creates a new `shift` record in the database and returns shift details. The dashboard then updates to show live statistics and switches the button label to “Close Shop.” When the admin is ready to end their shift, they click “Close Shop,” confirm in a dialog, and the system updates the existing shift record with an end timestamp. The dashboard refreshes and reverts to the pre-shift view.

### POS Interface Flow

Selecting POS in the sidebar navigates to `/dashboard/pos`. The page uses a three-column layout on desktop: a category tab list on the left, a product grid in the center, and a shopping cart pane on the right. On mobile, the cart appears as a slide-up sheet. The admin taps a category name to filter the product grid. Products display name, price, and a button to add them to the cart. Tapping a product adds it to the cart state, which updates the cart pane with item quantities and totals.

Inside the cart pane, the admin can adjust quantities or remove items. When ready to complete the sale, they tap “Pay,” which opens a payment dialog. The dialog collects payment type and confirms the total amount. On confirmation, the frontend posts the transaction data to an API route. The server creates a `transaction` record, links it to the active shift, and updates stock levels in the `products` table. After a successful response, the frontend opens a receipt dialog showing the sale summary and offering “Print” or “Email Receipt” actions. The cart then resets to empty.

### Product Management Flow

Clicking Products in the sidebar takes the admin to `/dashboard/products`. The page displays a data table listing each product’s name, category, price, and stock level. An “Add Product” button opens a dialog containing a form for name, category selection, price, stock quantity, and optional option groups. Submitting the form sends a POST request to `/api/products`, and upon success the table reloads to show the new product. Editing a product is done by clicking an action on a row, which opens the same dialog pre-filled with the product’s details. After saving, the updated product appears in the table. Deleting a product triggers a confirmation dialog and, once confirmed, sends a DELETE request to the API before removing the product from the list.

### Category Management Flow

The Categories page at `/dashboard/categories` shows a table of product category names. An “Add Category” dialog collects the category name and color (if applicable). Saving calls the categories API, and the new category appears in the table. Editing and deleting follow the same pattern of dialogs, confirmations, and API calls.

### Option Group Management Flow

On the Options page at `/dashboard/options`, the admin manages option groups such as sizes or add-ons. A data table lists each group and its options. An “Add Option Group” dialog allows entry of the group name and its options. Editing and deleting option groups use corresponding dialogs and API calls, and changes immediately refresh the table.

### Reports Flow

Visiting `/dashboard/reports` displays historical shift data in a table. The admin can select a date range to filter the list of past shifts. Clicking a shift row navigates to a shift detail view, which breaks down that shift’s transactions and totals using charts and tables.

### Transaction History Flow

The Transactions page at `/dashboard/transactions` lists every transaction across all shifts. Each row shows the transaction ID, timestamp, amount, and linked shift. A search field and date filter help find specific transactions. Selecting a transaction opens a detail view with the full receipt, item breakdown, and options to reprint or email the receipt again.

## Settings and Account Management

The profile menu in the header grants access to the Settings page at `/dashboard/settings`. Here the admin can update personal information such as email and display name. A change password section prompts for the current password and new password, submitting to the Supabase Auth API. A notification section lets the admin toggle alerts for low-stock warnings. The theme switch in the header persists the admin’s choice of dark or light mode. Saving settings returns the admin to the last visited dashboard module.

## Error States and Alternate Paths

If the admin enters incorrect credentials on sign-in, an error message appears above the form explaining that the email or password is invalid. On the password reset page, entering an unrecognized email triggers a message stating that no account matches that address. Form-level validation in any dialog highlights missing or invalid fields in red, with inline text explaining the correction needed. When the network is unavailable, a persistent banner alerts the admin and prevents data modifications. During offline operation in the POS interface, attempted transactions are queued locally in IndexedDB and a retry process runs once connectivity is restored. If an API call fails due to a server error, a modal dialog informs the admin of the failure and suggests retrying or contacting support. Actions that would violate data integrity such as deleting a category still used by products are blocked with a clear warning about the existing dependency.

## Conclusion and Overall App Journey

From the moment the admin lands on the app and registers their account, the flow leads them into a cohesive dashboard where every core action is accessible from the sidebar. They manage shifts in real time, ring up sales through a responsive POS interface, handle products, categories, and options with intuitive dialogs, and review historical performance in reports and transaction history. Account settings and theme preferences are always just one click away in the header. Robust error handling and offline support ensure the application remains reliable under all conditions. This end-to-end journey equips the admin to open shop, process sales, and close shifts with confidence and clarity every day.