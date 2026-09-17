# MASALA Restaurant – Real Live Dynamic Web Application

A full-stack, database-driven web application for **MASALA** restaurant in Kota, Rajasthan. Built with React, TypeScript, Tailwind CSS, Express REST API, PostgreSQL (Cloud SQL / Supabase), Firebase Authentication, and Razorpay payment gateway architecture.

---

## Restaurant Details
* **Name:** MASALA
* **Address:** Santoshi Nagar, Kota, Rajasthan, India
* **Phone:** 9171863765 (+91 9171863765)
* **Instagram Username:** `kunal_x999`
* **Instagram URL:** [https://www.instagram.com/kunal_x999/](https://www.instagram.com/kunal_x999/)

---

## 1. Environment Variables

Create a `.env` file at the root or configure your hosting platform's environment settings:

```env
# Frontend API URL (leave blank if backend and frontend are hosted together; specify URL if hosted on separate services like Vercel)
VITE_API_URL=

# PostgreSQL Database Connection URL (for Supabase / Neon / Railway / Cloud SQL)
# In Google AI Studio, Cloud SQL platform environment variables SQL_HOST, SQL_USER, SQL_PASSWORD, SQL_DB_NAME are injected automatically.
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DB_NAME

# Razorpay Payment Gateway Keys (from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Admin Control Passcode
ADMIN_SECRET=masala_admin_2026
ADMIN_EMAIL=kpp66973@gmail.com
```

---

## 2. Database Schema

The application uses PostgreSQL managed with Drizzle ORM. The relational tables are defined in `src/db/schema.ts`:

1. **`restaurant_settings`**:
   - `id` (Serial primary key)
   - `restaurant_name` (Text)
   - `address` (Text)
   - `phone` (Text)
   - `instagram_username` (Text)
   - `instagram_url` (Text)
   - `delivery_fee` (Integer)
   - `min_order` (Integer)
   - `is_open` (Boolean)
   - `updated_at` (Timestamp)

2. **`categories`**:
   - `id` (Serial primary key)
   - `name` (Text)
   - `slug` (Text unique)
   - `description` (Text)
   - `display_order` (Integer)

3. **`products`**:
   - `id` (Serial primary key)
   - `name` (Text)
   - `description` (Text)
   - `category` (Text)
   - `price` (Integer in ₹)
   - `image_url` (Text)
   - `veg_or_nonveg` (Text: `'veg'` or `'non-veg'`)
   - `available` (Boolean)
   - `created_at` & `updated_at` (Timestamp)

4. **`users`**:
   - `id` (Serial primary key)
   - `uid` (Text unique, Firebase Auth UID)
   - `email` (Text)
   - `name` (Text)
   - `phone` (Text)
   - `address` (Text)
   - `role` (Text: `'customer'` or `'admin'`)

5. **`orders`**:
   - `id` (Serial primary key)
   - `order_number` (Text unique, e.g. `MSL-172654-9182`)
   - `user_id` (Integer foreign key)
   - `user_uid` (Text)
   - `customer_name` (Text)
   - `customer_email` (Text)
   - `customer_phone` (Text)
   - `delivery_address` (Text)
   - `subtotal` (Integer calculated on server)
   - `delivery_charge` (Integer)
   - `total_amount` (Integer verified on server)
   - `payment_method` (`upi`, `card`, `netbanking`, `cod`)
   - `payment_status` (`pending`, `completed`, `failed`)
   - `order_status` (`received`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`, `cancelled`)
   - `razorpay_order_id` (Text)
   - `created_at` & `updated_at` (Timestamp)

6. **`order_items`**:
   - `id` (Serial primary key)
   - `order_id` (Integer foreign key)
   - `product_id` (Integer foreign key)
   - `product_name` (Text)
   - `product_price` (Integer)
   - `quantity` (Integer)
   - `item_total` (Integer)

7. **`payments`**:
   - `id` (Serial primary key)
   - `order_id` (Integer foreign key)
   - `razorpay_payment_id` (Text)
   - `razorpay_order_id` (Text)
   - `razorpay_signature` (Text)
   - `amount` (Integer)
   - `currency` (Text: `'INR'`)
   - `status` (Text)

---

## 3. Database Setup Guide (Cloud SQL / Supabase / PostgreSQL)

### Connecting to Supabase or External PostgreSQL
1. Create a project at [supabase.com](https://supabase.com) or [neon.tech](https://neon.tech).
2. Copy the Connection Pooling URL from Database Settings:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
3. Set `DATABASE_URL` in your environment.
4. Run Drizzle migration / push:
   ```bash
   npx drizzle-kit push
   ```
5. All tables will automatically be created in the database.

---

## 4. Razorpay Setup Guide

1. Create or log in to your account at [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings > API Keys**.
3. Generate **Key ID** and **Key Secret**.
4. In your `.env` or production deployment, add:
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
   ```
5. The backend initiates orders with `POST /api/payment/create` directly using Razorpay's API and verifies signatures on `POST /api/payment/verify` using HMAC-SHA256.
6. When keys are not yet present, the system defaults to Sandbox Simulator mode, allowing full end-to-end checkout verification without breaking.

---

## 5. Image Upload & Storage Guide

Food image URLs are stored as strings in the `products.image_url` column in PostgreSQL.
For adding new images:
* **Option A: Supabase Storage / Cloud Storage**: Create a public bucket (e.g. `masala-menu`) in Supabase Storage, upload images, and paste the generated public URL into the Admin Dashboard product form.
* **Option B: Unsplash / Cloudinary**: Upload high-definition photos of Kota dishes to Cloudinary or AWS S3 and enter the CDN URL.

---

## 6. Admin Access Instructions

1. Click on **Admin Panel** in the top bar or footer.
2. Enter the admin passcode:
   ```
   masala_admin_2026
   ```
   *(Or sign in with the authorized admin Google account `kpp66973@gmail.com`)*
3. Once authenticated:
   - **Restaurant Info:** Change phone number, address, Instagram handle, delivery fee, or toggle kitchen open/closed.
   - **Menu Products:** Add food items, edit titles, update prices, change picture links, and toggle item availability (Available vs. Sold Out).
   - **Categories:** Create or remove menu categories.
   - **Orders:** View real customer orders and change order statuses in real time.
   - **Customers:** View registered user accounts and saved addresses.

---

## 7. Deployment Steps

### Option A: Unified Container (Cloud Run / Render / Railway)
The project includes a unified Express + Vite production setup:
1. Set the build command:
   ```bash
   npm run build
   ```
2. Set the start command:
   ```bash
   npm run start
   ```
3. Provide environment variables: `DATABASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `ADMIN_SECRET`.

### Option B: Split Architecture (Vercel Frontend + Render/Railway Backend)
1. **Backend (Render / Railway):**
   - Deploy `server.ts` as an Express web service.
   - Set environment variables (`DATABASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
   - Copy the deployed backend URL (e.g., `https://masala-api.onrender.com`).
2. **Frontend (Vercel):**
   - Import repository on Vercel.
   - Set `VITE_API_URL=https://masala-api.onrender.com`.
   - Deploy.

---

## 8. Production Checklist

- [x] Database tables migrated to online PostgreSQL (not stored in localStorage)
- [x] Server-side price calculation enforced (client amounts never trusted)
- [x] Admin routes protected with admin credentials and Bearer tokens
- [x] CORS configured for production domain requests
- [x] Razorpay secret key kept strictly server-side
- [x] Dynamic restaurant information loaded from database
- [x] Veg and Non-veg indicators and availability toggles active

---

## 9. Security Best Practices Implemented

1. **Zero Client Trust on Pricing:** When an order is placed, the frontend only sends product IDs and quantities. The Express backend queries the actual prices from PostgreSQL, calculates subtotal, delivery charges, and final amounts.
2. **HMAC-SHA256 Signature Verification:** Razorpay webhook/redirect signatures are verified using the server-side secret key before marking payments as completed.
3. **Admin Route Protection:** All admin endpoints (`/api/admin/*`) require either a validated Firebase Admin ID token with admin privileges or a verified `x-admin-key` header.
4. **Injection Protection:** Drizzle ORM provides parameter binding for all SQL queries, preventing SQL injection vulnerabilities.

---

## 10. How to Change Restaurant Info, Menu Items & Prices

1. Open the website and click **Admin Panel** in the top navigation bar.
2. Enter the admin passcode (`masala_admin_2026`).
3. To update Phone or Address: Select **Restaurant Info**, change the text fields, and click **Save Restaurant Info to Database**.
4. To update a Dish Price or Photo: Go to **Menu Products**, click the **Edit** icon on the dish, update the price or image URL, and click **Save to Database**.
5. The live customer-facing website will immediately reflect all updates upon refresh or navigation.

---

## 11. How to Test Real Orders

1. Browse the menu on the homepage.
2. Click **Add To Order** on any available dish (e.g., Dal Baati Churma, Paneer Tikka Masala).
3. Click the **Cart** button in the header or bottom floating bar.
4. Click **Proceed To Checkout**.
5. Fill in customer details: Name, Phone (e.g., 9171863765), Email, and Delivery Address in Kota.
6. Select a payment method (UPI, Card, Net Banking, or Cash on Delivery).
7. Click **Confirm & Place Order**.
8. View the instant confirmation screen with your unique Order ID.
9. Verify the order in the **Admin Panel > Orders** tab or customer's **My Orders** screen.

---

## 12. How to Test Live Payment

1. Ensure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are added to your environment variables.
2. In the checkout modal, choose **UPI Instant** or **Card**.
3. Click **Confirm & Place Order**.
4. The Razorpay checkout dialog will open.
5. In Test Mode, use Razorpay test UPI ID `success@razorpay` or test card numbers.
6. Upon successful transaction, Razorpay calls the server verification endpoint (`POST /api/payment/verify`), marking the order as `confirmed` and payment as `completed` in PostgreSQL.
