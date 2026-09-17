import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Restaurant Settings Table
export const restaurantSettings = pgTable('restaurant_settings', {
  id: serial('id').primaryKey(),
  restaurantName: text('restaurant_name').notNull().default('MASALA'),
  address: text('address').notNull().default('Santoshi Nagar, Kota, Rajasthan, India'),
  phone: text('phone').notNull().default('9171863765'),
  instagramUsername: text('instagram_username').notNull().default('kunal_x999'),
  instagramUrl: text('instagram_url').notNull().default('https://www.instagram.com/kunal_x999/'),
  deliveryFee: integer('delivery_fee').notNull().default(40),
  minOrder: integer('min_order').notNull().default(150),
  isOpen: boolean('is_open').notNull().default(true),
  description: text('description').default('Authentic North Indian & Rajasthani Flavors in Kota'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. Food Categories Table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Food Products Table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  price: integer('price').notNull(), // in INR (₹)
  imageUrl: text('image_url').notNull(),
  vegOrNonveg: text('veg_or_nonveg').notNull().default('veg'), // 'veg' | 'non-veg'
  available: boolean('available').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 4. Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase UID or local identifier
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  address: text('address'),
  role: text('role').notNull().default('customer'), // 'customer' | 'admin'
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Orders Table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  userUid: text('user_uid'),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  subtotal: integer('subtotal').notNull(),
  deliveryCharge: integer('delivery_charge').notNull(),
  totalAmount: integer('total_amount').notNull(),
  paymentMethod: text('payment_method').notNull().default('upi'), // 'upi' | 'card' | 'netbanking' | 'cod'
  paymentStatus: text('payment_status').notNull().default('pending'), // 'pending' | 'completed' | 'failed'
  orderStatus: text('order_status').notNull().default('received'), // 'received' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  notes: text('notes'),
  razorpayOrderId: text('razorpay_order_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 6. Order Items Table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id),
  productName: text('product_name').notNull(),
  productPrice: integer('product_price').notNull(),
  quantity: integer('quantity').notNull(),
  itemTotal: integer('item_total').notNull(),
});

// 7. Payments Table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  orderNumber: text('order_number').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('INR'),
  paymentMethod: text('payment_method').notNull(),
  razorpayOrderId: text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  razorpaySignature: text('razorpay_signature'),
  status: text('status').notNull().default('created'), // 'created' | 'success' | 'failed'
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));
