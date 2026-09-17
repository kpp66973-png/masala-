import { db } from './index.ts';
import {
  restaurantSettings,
  categories,
  products,
  users,
  orders,
  orderItems,
  payments,
} from './schema.ts';
import { eq, desc, asc, inArray } from 'drizzle-orm';

// 1. Restaurant Settings
export async function getRestaurantSettings() {
  try {
    const rows = await db.select().from(restaurantSettings).limit(1);
    if (rows.length === 0) {
      // Create default if missing
      const [newRow] = await db
        .insert(restaurantSettings)
        .values({
          restaurantName: 'MASALA',
          address: 'Santoshi Nagar, Kota, Rajasthan, India',
          phone: '9171863765',
          instagramUsername: 'kunal_x999',
          instagramUrl: 'https://www.instagram.com/kunal_x999/',
          deliveryFee: 40,
          minOrder: 150,
          isOpen: true,
        })
        .returning();
      return newRow;
    }
    return rows[0];
  } catch (error) {
    console.error('Failed to get restaurant settings:', error);
    throw new Error('Database query failed while fetching restaurant settings', { cause: error });
  }
}

export async function updateRestaurantSettings(data: Partial<typeof restaurantSettings.$inferInsert>) {
  try {
    const current = await getRestaurantSettings();
    const [updated] = await db
      .update(restaurantSettings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(restaurantSettings.id, current.id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Failed to update restaurant settings:', error);
    throw new Error('Database query failed while updating restaurant settings', { cause: error });
  }
}

// 2. Categories
export async function getCategories() {
  try {
    return await db.select().from(categories).orderBy(asc(categories.displayOrder), asc(categories.name));
  } catch (error) {
    console.error('Failed to get categories:', error);
    throw new Error('Database query failed while fetching categories', { cause: error });
  }
}

export async function createCategory(data: { name: string; slug: string; description?: string; displayOrder?: number }) {
  try {
    const [created] = await db.insert(categories).values(data).returning();
    return created;
  } catch (error) {
    console.error('Failed to create category:', error);
    throw new Error('Database query failed while creating category', { cause: error });
  }
}

export async function updateCategory(id: number, data: Partial<typeof categories.$inferInsert>) {
  try {
    const [updated] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return updated;
  } catch (error) {
    console.error('Failed to update category:', error);
    throw new Error('Database query failed while updating category', { cause: error });
  }
}

export async function deleteCategory(id: number) {
  try {
    const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning();
    return deleted;
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw new Error('Database query failed while deleting category', { cause: error });
  }
}

// 3. Products
export async function getProducts(onlyAvailable = false) {
  try {
    if (onlyAvailable) {
      return await db.select().from(products).where(eq(products.available, true)).orderBy(asc(products.category), asc(products.name));
    }
    return await db.select().from(products).orderBy(asc(products.category), asc(products.name));
  } catch (error) {
    console.error('Failed to get products:', error);
    throw new Error('Database query failed while fetching products', { cause: error });
  }
}

export async function getProductById(id: number) {
  try {
    const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to get product by id:', error);
    throw new Error('Database query failed while fetching product', { cause: error });
  }
}

export async function createProduct(data: typeof products.$inferInsert) {
  try {
    const [created] = await db.insert(products).values(data).returning();
    return created;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw new Error('Database query failed while creating product', { cause: error });
  }
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  try {
    const [updated] = await db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Failed to update product:', error);
    throw new Error('Database query failed while updating product', { cause: error });
  }
}

export async function deleteProduct(id: number) {
  try {
    const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();
    return deleted;
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw new Error('Database query failed while deleting product', { cause: error });
  }
}

// 4. Users
export async function syncUser(data: { uid: string; email: string; name?: string; phone?: string; address?: string; role?: string }) {
  try {
    const [user] = await db
      .insert(users)
      .values({
        uid: data.uid,
        email: data.email,
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || '',
        role: data.role || 'customer',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: data.email,
          name: data.name || undefined,
          phone: data.phone || undefined,
          address: data.address || undefined,
        },
      })
      .returning();
    return user;
  } catch (error) {
    console.error('Failed to sync user:', error);
    throw new Error('Database query failed while syncing user', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to get user by uid:', error);
    throw new Error('Database query failed while fetching user', { cause: error });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error('Failed to get users:', error);
    throw new Error('Database query failed while fetching users', { cause: error });
  }
}

// 5. Orders & Server-Side Price Verification
export async function createVerifiedOrder(params: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  userUid?: string;
  paymentMethod: string;
  notes?: string;
  items: Array<{ productId: number; quantity: number }>;
}) {
  try {
    if (!params.items || params.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // 1. Fetch settings for delivery fee
    const settings = await getRestaurantSettings();
    const deliveryFee = settings.deliveryFee ?? 40;

    // 2. Fetch actual products from database
    const productIds = params.items.map((i) => i.productId);
    const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    const verifiedItems: Array<{
      productId: number;
      productName: string;
      productPrice: number;
      quantity: number;
      itemTotal: number;
    }> = [];

    for (const item of params.items) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        throw new Error(`Product with ID ${item.productId} not found in database`);
      }
      if (!prod.available) {
        throw new Error(`Product "${prod.name}" is currently unavailable`);
      }
      const qty = Math.max(1, Math.floor(item.quantity));
      const price = prod.price;
      const itemTotal = price * qty;
      calculatedSubtotal += itemTotal;

      verifiedItems.push({
        productId: prod.id,
        productName: prod.name,
        productPrice: price,
        quantity: qty,
        itemTotal,
      });
    }

    const totalAmount = calculatedSubtotal + deliveryFee;

    // Check minimum order
    if (settings.minOrder && calculatedSubtotal < settings.minOrder) {
      throw new Error(`Minimum order amount is ₹${settings.minOrder}. Current subtotal is ₹${calculatedSubtotal}`);
    }

    // 3. Associate with user if uid provided
    let userId: number | null = null;
    if (params.userUid) {
      const user = await getUserByUid(params.userUid);
      if (user) {
        userId = user.id;
      }
    }

    // 4. Generate unique order ID
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `MSL-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    // 5. Insert order
    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId,
        userUid: params.userUid || null,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        customerPhone: params.customerPhone,
        deliveryAddress: params.deliveryAddress,
        subtotal: calculatedSubtotal,
        deliveryCharge: deliveryFee,
        totalAmount,
        paymentMethod: params.paymentMethod,
        paymentStatus: params.paymentMethod === 'cod' ? 'pending' : 'pending',
        orderStatus: 'received',
        notes: params.notes || null,
      })
      .returning();

    // 6. Insert order items
    for (const item of verifiedItems) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId,
        productName: item.productName,
        productPrice: item.productPrice,
        quantity: item.quantity,
        itemTotal: item.itemTotal,
      });
    }

    return {
      order: newOrder,
      items: verifiedItems,
    };
  } catch (error) {
    console.error('Failed to create verified order:', error);
    throw new Error((error as any).message || 'Failed to place order', { cause: error });
  }
}

export async function getOrderWithItems(orderNumber: string) {
  try {
    const orderRows = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (orderRows.length === 0) return null;
    const order = orderRows[0];
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    return { ...order, items };
  } catch (error) {
    console.error('Failed to get order with items:', error);
    throw new Error('Database query failed while fetching order', { cause: error });
  }
}

export async function getUserOrders(userUid: string) {
  try {
    const userOrderList = await db.select().from(orders).where(eq(orders.userUid, userUid)).orderBy(desc(orders.createdAt));
    const result = [];
    for (const order of userOrderList) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      result.push({ ...order, items });
    }
    return result;
  } catch (error) {
    console.error('Failed to get user orders:', error);
    throw new Error('Database query failed while fetching user orders', { cause: error });
  }
}

export async function getAllOrders() {
  try {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const result = [];
    for (const order of allOrders) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      result.push({ ...order, items });
    }
    return result;
  } catch (error) {
    console.error('Failed to get all orders:', error);
    throw new Error('Database query failed while fetching all orders', { cause: error });
  }
}

export async function updateOrderStatus(id: number, status: string) {
  try {
    const [updated] = await db
      .update(orders)
      .set({
        orderStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw new Error('Database query failed while updating order status', { cause: error });
  }
}

export async function updateOrderPaymentStatus(orderNumber: string, status: string, razorpayPaymentId?: string) {
  try {
    const [updated] = await db
      .update(orders)
      .set({
        paymentStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(orders.orderNumber, orderNumber))
      .returning();

    if (updated) {
      await db.insert(payments).values({
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        amount: updated.totalAmount,
        currency: 'INR',
        paymentMethod: updated.paymentMethod,
        razorpayPaymentId: razorpayPaymentId || null,
        status: status === 'completed' ? 'success' : 'failed',
      });
    }

    return updated;
  } catch (error) {
    console.error('Failed to update order payment status:', error);
    throw new Error('Database query failed while updating payment status', { cause: error });
  }
}
