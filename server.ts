import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  getRestaurantSettings,
  updateRestaurantSettings,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  syncUser,
  getUserByUid,
  getAllUsers,
  createVerifiedOrder,
  getOrderWithItems,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
} from './src/db/queries.ts';
import { requireAuth, requireAdmin, optionalAuth, AuthRequest } from './src/middleware/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
  }));
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', restaurant: 'MASALA', timestamp: new Date().toISOString() });
  });

  // -------------------------------------------------------------
  // RESTAURANT SETTINGS APIS
  // -------------------------------------------------------------
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await getRestaurantSettings();
      res.json(settings);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch restaurant settings' });
    }
  });

  app.put('/api/admin/settings', requireAdmin, async (req, res) => {
    try {
      const updated = await updateRestaurantSettings(req.body);
      res.json({ success: true, settings: updated });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: error.message || 'Failed to update restaurant settings' });
    }
  });

  // -------------------------------------------------------------
  // CATEGORIES APIS
  // -------------------------------------------------------------
  app.get('/api/categories', async (req, res) => {
    try {
      const cats = await getCategories();
      res.json(cats);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch categories' });
    }
  });

  app.post('/api/admin/categories', requireAdmin, async (req, res) => {
    try {
      const { name, slug, description, displayOrder } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ error: 'Name and slug are required' });
      }
      const created = await createCategory({
        name,
        slug,
        description: description || '',
        displayOrder: Number(displayOrder) || 0,
      });
      res.status(201).json(created);
    } catch (error: any) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: error.message || 'Failed to create category' });
    }
  });

  app.put('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await updateCategory(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: error.message || 'Failed to update category' });
    }
  });

  app.delete('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await deleteCategory(id);
      res.json({ success: true, deleted });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: error.message || 'Failed to delete category' });
    }
  });

  // -------------------------------------------------------------
  // PRODUCTS / MENU APIS
  // -------------------------------------------------------------
  app.get('/api/products', async (req, res) => {
    try {
      const onlyAvailable = req.query.available === 'true';
      const prods = await getProducts(onlyAvailable);
      res.json(prods);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch products from database' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const prod = await getProductById(id);
      if (!prod) return res.status(404).json({ error: 'Product not found' });
      res.json(prod);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch product' });
    }
  });

  app.post('/api/admin/products', requireAdmin, async (req, res) => {
    try {
      const { name, description, category, price, imageUrl, vegOrNonveg, available } = req.body;
      if (!name || !description || !category || price === undefined || !imageUrl) {
        return res.status(400).json({ error: 'Missing required product fields' });
      }
      const created = await createProduct({
        name,
        description,
        category,
        price: parseInt(price, 10),
        imageUrl,
        vegOrNonveg: vegOrNonveg || 'veg',
        available: available !== undefined ? Boolean(available) : true,
      });
      res.status(201).json(created);
    } catch (error: any) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: error.message || 'Failed to create product' });
    }
  });

  app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const data = { ...req.body };
      if (data.price !== undefined) data.price = parseInt(data.price, 10);
      if (data.available !== undefined) data.available = Boolean(data.available);

      const updated = await updateProduct(id, data);
      res.json(updated);
    } catch (error: any) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: error.message || 'Failed to update product' });
    }
  });

  app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await deleteProduct(id);
      res.json({ success: true, deleted });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: error.message || 'Failed to delete product' });
    }
  });

  // -------------------------------------------------------------
  // USER / CUSTOMER PROFILE APIS
  // -------------------------------------------------------------
  app.post('/api/users/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || req.body.email;
      if (!uid || !email) {
        return res.status(400).json({ error: 'User UID and email required' });
      }
      const synced = await syncUser({
        uid,
        email,
        name: req.body.name || req.user?.name,
        phone: req.body.phone,
        address: req.body.address,
      });
      res.json(synced);
    } catch (error: any) {
      console.error('Error syncing user:', error);
      res.status(500).json({ error: error.message || 'Failed to sync user' });
    }
  });

  app.get('/api/users/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Unauthorized' });
      const user = await getUserByUid(uid);
      res.json(user || { uid, email: req.user?.email });
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch profile' });
    }
  });

  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const allUsers = await getAllUsers();
      res.json(allUsers);
    } catch (error: any) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch customer list' });
    }
  });

  // -------------------------------------------------------------
  // ORDERS APIS
  // -------------------------------------------------------------
  app.post('/api/orders', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        items,
        paymentMethod,
        notes,
      } = req.body;

      if (!customerName || !customerEmail || !customerPhone || !deliveryAddress) {
        return res.status(400).json({ error: 'Please provide all delivery and contact details' });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
      }

      const userUid = req.user?.uid || req.body.userUid;

      const created = await createVerifiedOrder({
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        userUid,
        paymentMethod: paymentMethod || 'upi',
        notes,
        items,
      });

      res.status(201).json(created);
    } catch (error: any) {
      console.error('Error placing order:', error);
      res.status(400).json({ error: error.message || 'Failed to create order' });
    }
  });

  app.get('/api/orders/:orderNumber', async (req, res) => {
    try {
      const order = await getOrderWithItems(req.params.orderNumber);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json(order);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch order' });
    }
  });

  app.get('/api/orders/user/:uid', requireAuth, async (req: AuthRequest, res) => {
    try {
      // Must match logged in user unless admin
      if (req.user?.uid !== req.params.uid && !req.isAdmin) {
        return res.status(403).json({ error: 'Unauthorized to view these orders' });
      }
      const userOrders = await getUserOrders(req.params.uid);
      res.json(userOrders);
    } catch (error: any) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch orders' });
    }
  });

  app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
      const allOrders = await getAllOrders();
      res.json(allOrders);
    } catch (error: any) {
      console.error('Error fetching all orders:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch orders' });
    }
  });

  app.patch('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'Status is required' });
      const updated = await updateOrderStatus(id, status);
      res.json(updated);
    } catch (error: any) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: error.message || 'Failed to update order status' });
    }
  });

  // -------------------------------------------------------------
  // RAZORPAY PAYMENT APIS
  // -------------------------------------------------------------
  app.post('/api/payment/create', async (req, res) => {
    try {
      const { orderNumber } = req.body;
      if (!orderNumber) {
        return res.status(400).json({ error: 'orderNumber is required' });
      }

      // 1. Fetch the exact order from database (NEVER trust client amounts)
      const order = await getOrderWithItems(orderNumber);
      if (!order) {
        return res.status(404).json({ error: 'Order not found in database' });
      }

      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      const amountInPaise = order.totalAmount * 100;

      // 2. If Razorpay credentials are provided, call official Razorpay Orders API
      if (keyId && keySecret) {
        const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt: order.orderNumber,
            notes: {
              restaurant: 'MASALA Kota',
              customer: order.customerName,
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error('Razorpay API error response:', errText);
          throw new Error('Failed to generate Razorpay order from gateway');
        }

        const razorpayOrder = await response.json();

        return res.json({
          gateway: 'razorpay',
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
        });
      }

      // 3. If RAZORPAY keys are not yet configured in .env, provide simulation/ready mode
      return res.json({
        gateway: 'simulation',
        razorpayOrderId: `sim_order_${Date.now()}`,
        amount: amountInPaise,
        currency: 'INR',
        keyId: 'rzp_test_MASALA_KOTA',
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        message: 'Live Razorpay gateway architecture is active. Test mode enabled until production RAZORPAY_KEY_ID is added in .env',
      });
    } catch (error: any) {
      console.error('Error creating payment:', error);
      res.status(500).json({ error: error.message || 'Payment initialization failed' });
    }
  });

  app.post('/api/payment/verify', async (req, res) => {
    try {
      const {
        orderNumber,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        simulationSuccess,
      } = req.body;

      if (!orderNumber) {
        return res.status(400).json({ error: 'Order number is required' });
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      // Handle real Razorpay signature verification
      if (keySecret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
        const generatedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

        if (generatedSignature !== razorpay_signature) {
          await updateOrderPaymentStatus(orderNumber, 'failed');
          return res.status(400).json({ success: false, error: 'Invalid payment signature' });
        }
      } else if (!keySecret && !simulationSuccess) {
        return res.status(400).json({ error: 'Payment verification failed' });
      }

      // Update order and payment record in database
      const updatedOrder = await updateOrderPaymentStatus(
        orderNumber,
        'completed',
        razorpay_payment_id || `pay_${Date.now()}`
      );

      // Auto-confirm order once payment is verified
      await updateOrderStatus(updatedOrder.id, 'confirmed');

      res.json({
        success: true,
        orderNumber: updatedOrder.orderNumber,
        paymentStatus: 'completed',
        orderStatus: 'confirmed',
      });
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ error: error.message || 'Payment verification failed' });
    }
  });

  // -------------------------------------------------------------
  // ADMIN AUTHENTICATION
  // -------------------------------------------------------------
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const adminSecret = process.env.ADMIN_SECRET || 'masala_admin_2026';

    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    if (password === adminSecret) {
      return res.json({
        success: true,
        adminKey: adminSecret,
        role: 'admin',
        message: 'Admin authenticated successfully',
      });
    }

    return res.status(401).json({ error: 'Invalid admin credentials' });
  });

  // -------------------------------------------------------------
  // VITE MIDDLEWARE (Development) OR STATIC FILES (Production)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MASALA Restaurant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
