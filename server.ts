import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { DBManager, hashPassword } from "./server/dbManager";
import { Order, AssistanceRequest, Feedback } from "./src/types";
import open from "open";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "khao_pio_aish_karo_mitro_super_secret_key_12345";

app.use(express.json());

// --- SSE Real-time Updates Setup ---
let sseClients: Array<{ id: number; res: any }> = [];

app.get("/api/updates", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: "ping", timestamp: new Date().toISOString() })}\n\n`);

  const client = { id: Date.now(), res };
  sseClients.push(client);

  req.on("close", () => {
    sseClients = sseClients.filter((c) => c.id !== client.id);
  });
});

function broadcastUpdate(type: string, data: any) {
  const payload = JSON.stringify({ type, data });
  sseClients.forEach((c) => {
    try {
      c.res.write(`data: ${payload}\n\n`);
    } catch (e) {
      console.error("Failed to push update to SSE client", e);
    }
  });
}

// --- JWT HELPER FUNCTIONS (Native crypto implementation) ---
function signToken(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payloadStr = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 86400 })).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payloadStr}`).digest("base64url");
  return `${header}.${payloadStr}.${signature}`;
}

function verifyToken(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
    if (signature !== expectedSignature) return null;
    
    const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) return null; // Expired
    return decodedPayload;
  } catch {
    return null;
  }
}

// --- MIDDLEWARES ---
function authenticateAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
  req.admin = decoded;
  next();
}

// --- API ROUTES ---

// 1. Auth APIs
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const admins = DBManager.getAdmins();
  const admin = admins.find((a) => a.username === username);
  if (!admin || admin.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken({ username: admin.username });
  res.json({ token, admin: { username: admin.username } });
});

app.get("/api/auth/me", authenticateAdmin, (req: any, res) => {
  res.json({ admin: { username: req.admin.username } });
});

app.post("/api/auth/change-password", authenticateAdmin, (req: any, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Old and new passwords are required" });
  }
  const success = DBManager.updateAdminPassword(req.admin.username, oldPassword, newPassword);
  if (!success) {
    return res.status(400).json({ error: "Incorrect old password" });
  }
  res.json({ message: "Password updated successfully" });
});

// 2. Settings APIs
app.get("/api/settings", (req, res) => {
  res.json(DBManager.getSettings());
});

app.put("/api/settings", authenticateAdmin, (req: any, res) => {
  const updated = DBManager.updateSettings(req.body, req.admin.username);
  broadcastUpdate("settings", updated);
  res.json(updated);
});

// 3. Category APIs
app.get("/api/categories", (req, res) => {
  res.json(DBManager.getCategories());
});

app.post("/api/categories", authenticateAdmin, (req: any, res) => {
  const { name, description, order } = req.body;
  const newCat = {
    id: `cat-${Date.now()}`,
    name,
    description: description || "",
    order: order || 99
  };
  const created = DBManager.addCategory(newCat, req.admin.username);
  broadcastUpdate("categories", DBManager.getCategories());
  res.status(201).json(created);
});

app.put("/api/categories/:id", authenticateAdmin, (req: any, res) => {
  const updated = DBManager.updateCategory(req.params.id, req.body, req.admin.username);
  broadcastUpdate("categories", DBManager.getCategories());
  res.json(updated);
});

app.delete("/api/categories/:id", authenticateAdmin, (req: any, res) => {
  const success = DBManager.deleteCategory(req.params.id, req.admin.username);
  if (!success) return res.status(404).json({ error: "Category not found" });
  broadcastUpdate("categories", DBManager.getCategories());
  res.json({ success: true });
});

// 4. Menu APIs
app.get("/api/menu", (req, res) => {
  res.json(DBManager.getMenuItems());
});

app.post("/api/menu", authenticateAdmin, (req: any, res) => {
  const { name, description, price, categoryId, image, isVeg, isAvailable, isChefSpecial, isPopular, variants, prepTime } = req.body;
  const newItem = {
    id: `item-${Date.now()}`,
    name,
    description,
    price: Number(price),
    categoryId,
    image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
    isVeg: !!isVeg,
    isAvailable: isAvailable !== undefined ? !!isAvailable : true,
    isChefSpecial: !!isChefSpecial,
    isPopular: !!isPopular,
    variants,
    prepTime: Number(prepTime || 15)
  };
  const created = DBManager.addMenuItem(newItem, req.admin.username);
  broadcastUpdate("menu", DBManager.getMenuItems());
  res.status(201).json(created);
});

app.put("/api/menu/:id", authenticateAdmin, (req: any, res) => {
  const updated = DBManager.updateMenuItem(req.params.id, req.body, req.admin.username);
  broadcastUpdate("menu", DBManager.getMenuItems());
  res.json(updated);
});

app.delete("/api/menu/:id", authenticateAdmin, (req: any, res) => {
  const success = DBManager.deleteMenuItem(req.params.id, req.admin.username);
  if (!success) return res.status(404).json({ error: "Menu item not found" });
  broadcastUpdate("menu", DBManager.getMenuItems());
  res.json({ success: true });
});

// 5. Table APIs
app.get("/api/tables", (req, res) => {
  res.json(DBManager.getTables());
});

app.post("/api/tables", authenticateAdmin, (req: any, res) => {
  const { number, status } = req.body;
  const tableNum = Number(number);
  const tables = DBManager.getTables();
  if (tables.some(t => t.number === tableNum)) {
    return res.status(400).json({ error: `Table #${tableNum} already exists.` });
  }

  const newTable = {
    id: `table-${Date.now()}`,
    number: tableNum,
    status: status || 'available',
    qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(process.env.APP_URL || 'https://restaurant.com' + '/table/' + tableNum)}`
  };
  const created = DBManager.addTable(newTable, req.admin.username);
  broadcastUpdate("tables", DBManager.getTables());
  res.status(201).json(created);
});

app.put("/api/tables/:id", authenticateAdmin, (req: any, res) => {
  const updated = DBManager.updateTable(req.params.id, req.body, req.admin.username);
  broadcastUpdate("tables", DBManager.getTables());
  res.json(updated);
});

app.delete("/api/tables/:id", authenticateAdmin, (req: any, res) => {
  const success = DBManager.deleteTable(req.params.id, req.admin.username);
  if (!success) return res.status(404).json({ error: "Table not found" });
  broadcastUpdate("tables", DBManager.getTables());
  res.json({ success: true });
});

// 6. Order APIs
app.get("/api/orders", (req, res) => {
  // Return all orders (can filter on client or server if requested, but serve all to admin)
  res.json(DBManager.getOrders());
});

app.get("/api/orders/track/:id", (req, res) => {
  const orders = DBManager.getOrders();
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  // Dynamically calculate kitchen workload/queue
  const activePreparingOrders = orders.filter((o) => o.status === "accepted" || o.status === "preparing" || o.status === "ready");
  const ordersAhead = activePreparingOrders.filter((o) => o.createdAt < order.createdAt).length;

  res.json({
    order,
    ordersAhead,
    estimatedWaitTime: Math.max(8, order.estimatedTime + (ordersAhead * 5))
  });
});

app.post("/api/orders", (req, res) => {
  const { tableNumber, items, paymentMethod, paymentDetails, instructions } = req.body;
  if (!tableNumber || !items || !items.length) {
    return res.status(400).json({ error: "Table number and order items are required" });
  }

  // Calculate dynamic Token Number based on orders today
  const orders = DBManager.getOrders();
  const todayPrefix = new Date().toISOString().split("T")[0];
  const todayOrdersCount = orders.filter((o) => o.createdAt.startsWith(todayPrefix)).length;
  const tokenNumber = todayOrdersCount + 101; // start tokens from 101 each day

  // Calculate prices
  const settings = DBManager.getSettings();
  let subtotal = 0;
  let maxPrepTime = 10; // minimum prep time

  items.forEach((item: any) => {
    let itemPrice = item.menuItem.price;
    if (item.selectedVariants?.extraCheese) itemPrice += 30; // base extra cheese charge
    if (item.selectedVariants?.extraButter) itemPrice += 20; // base extra butter charge
    subtotal += itemPrice * item.quantity;
    
    if (item.menuItem.prepTime > maxPrepTime) {
      maxPrepTime = item.menuItem.prepTime;
    }
  });

  const gst = Math.round((subtotal * settings.gstPercentage) / 100);
  const serviceCharge = Math.round((subtotal * settings.serviceChargePercentage) / 100);
  const total = subtotal + gst + serviceCharge;

  const newOrder: Order = {
    id: `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tokenNumber,
    tableNumber: Number(tableNumber),
    items,
    subtotal,
    gst,
    serviceCharge,
    total,
    status: paymentMethod === 'pay_now' ? 'accepted' : 'pending_payment',
    paymentStatus: paymentMethod === 'pay_now' ? 'paid' : 'unpaid',
    paymentMethod,
    paymentDetails,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedTime: maxPrepTime
  };

  const created = DBManager.createOrder(newOrder);
  
  // Real-time broadasts
  broadcastUpdate("new_order", created);
  broadcastUpdate("orders", DBManager.getOrders());
  broadcastUpdate("tables", DBManager.getTables());
  broadcastUpdate("notifications", DBManager.getNotifications());

  res.status(201).json(created);
});

app.put("/api/orders/:id/status", authenticateAdmin, (req: any, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required" });

  const updated = DBManager.updateOrderStatus(req.params.id, status, req.admin.username);
  
  // Real-time broadasts
  broadcastUpdate("order_status_updated", updated);
  broadcastUpdate("orders", DBManager.getOrders());
  broadcastUpdate("tables", DBManager.getTables());
  broadcastUpdate("notifications", DBManager.getNotifications());

  res.json(updated);
});

app.put("/api/orders/:id/payment", (req, res) => {
  const { paymentStatus, method } = req.body;
  if (!paymentStatus || !method) return res.status(400).json({ error: "Payment status and method are required" });

  const updated = DBManager.updateOrderPayment(req.params.id, paymentStatus, method, "Customer");
  
  // Real-time broadasts
  broadcastUpdate("order_payment_updated", updated);
  broadcastUpdate("orders", DBManager.getOrders());
  broadcastUpdate("notifications", DBManager.getNotifications());

  res.json(updated);
});

// 7. Assistance Requests
app.get("/api/assistance", (req, res) => {
  res.json(DBManager.getAssistanceRequests());
});

app.post("/api/assistance", (req, res) => {
  const { tableNumber, type } = req.body;
  if (!tableNumber || !type) {
    return res.status(400).json({ error: "Table number and type of assistance are required" });
  }

  const newReq: AssistanceRequest = {
    id: `req-${Date.now()}`,
    tableNumber: Number(tableNumber),
    type,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const created = DBManager.createAssistanceRequest(newReq);
  
  // Real-time broadasts
  broadcastUpdate("new_assistance", created);
  broadcastUpdate("assistance", DBManager.getAssistanceRequests());
  broadcastUpdate("notifications", DBManager.getNotifications());

  res.status(201).json(created);
});

app.put("/api/assistance/:id/resolve", authenticateAdmin, (req: any, res) => {
  const success = DBManager.resolveAssistanceRequest(req.params.id, req.admin.username);
  if (!success) return res.status(404).json({ error: "Request not found" });

  broadcastUpdate("assistance", DBManager.getAssistanceRequests());
  res.json({ success: true });
});

// 8. Feedbacks
app.get("/api/feedback", (req, res) => {
  res.json(DBManager.getFeedbacks());
});

app.post("/api/feedback", (req, res) => {
  const { rating, feedbackText, name, phone, email, tipAmount } = req.body;
  if (rating === undefined) {
    return res.status(400).json({ error: "Rating is required" });
  }

  const newFeedback: Feedback = {
    id: `feed-${Date.now()}`,
    rating: Number(rating),
    feedbackText: feedbackText || "",
    name: name || "Anonymous",
    phone,
    email,
    tipAmount: Number(tipAmount || 0),
    createdAt: new Date().toISOString()
  };

  const created = DBManager.addFeedback(newFeedback);
  broadcastUpdate("feedback", DBManager.getFeedbacks());
  res.status(201).json(created);
});

// 9. Coupon validation
app.get("/api/coupons", (req, res) => {
  res.json(DBManager.getCoupons());
});

app.post("/api/coupons/validate", (req, res) => {
  const { code, cartSubtotal } = req.body;
  if (!code) return res.status(400).json({ error: "Coupon code is required" });

  const coupons = DBManager.getCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
  
  if (!coupon) {
    return res.status(404).json({ error: "Invalid coupon code or expired" });
  }

  if (coupon.minOrderValue && cartSubtotal < coupon.minOrderValue) {
    return res.status(400).json({ error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.` });
  }

  res.json({ valid: true, coupon });
});

// 10. Notifications
app.get("/api/notifications", (req, res) => {
  res.json(DBManager.getNotifications());
});

app.put("/api/notifications/:id/read", authenticateAdmin, (req, res) => {
  DBManager.markNotificationRead(req.params.id);
  broadcastUpdate("notifications", DBManager.getNotifications());
  res.json({ success: true });
});

app.delete("/api/notifications", authenticateAdmin, (req, res) => {
  DBManager.clearAllNotifications();
  broadcastUpdate("notifications", DBManager.getNotifications());
  res.json({ success: true });
});

// 11. Audit Logs
app.get("/api/audit-logs", authenticateAdmin, (req, res) => {
  res.json(DBManager.getAuditLogs());
});

// 12. Analytics APIs
app.get("/api/analytics", authenticateAdmin, (req, res) => {
  const orders = DBManager.getOrders();
  const feedbacks = DBManager.getFeedbacks();
  const tables = DBManager.getTables();

  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = completedOrders.length ? Math.round(totalRevenue / completedOrders.length) : 0;

  // Calculate payment method split
  const onlinePayments = completedOrders.filter(o => o.paymentMethod === 'pay_now').reduce((sum, o) => sum + o.total, 0);
  const cashPayments = completedOrders.filter(o => o.paymentMethod === 'pay_later').reduce((sum, o) => sum + o.total, 0);

  // Popular items tally
  const itemPopularity: { [key: string]: { name: string; count: number; revenue: number } } = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      const id = item.menuItem.id;
      if (!itemPopularity[id]) {
        itemPopularity[id] = { name: item.menuItem.name, count: 0, revenue: 0 };
      }
      itemPopularity[id].count += item.quantity;
      itemPopularity[id].revenue += item.menuItem.price * item.quantity;
    });
  });

  const bestSellingItems = Object.values(itemPopularity)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const leastSellingItems = Object.values(itemPopularity)
    .sort((a, b) => a.count - b.count)
    .slice(0, 5);

  // Average feedback rating
  const avgRating = feedbacks.length ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : "5.0";

  res.json({
    todaySales: totalRevenue,
    todayOrders: orders.length,
    completedOrders: completedOrders.length,
    pendingOrders: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length,
    cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
    revenue: totalRevenue,
    averageOrderValue,
    liveCustomers: tables.filter(t => t.status === 'occupied').length * 3, // average 3 customers per table
    tablesOccupied: tables.filter(t => t.status === 'occupied').length,
    kitchenQueue: orders.filter(o => o.status === 'accepted' || o.status === 'preparing').length,
    onlinePayments,
    cashPayments,
    bestSellingItems,
    leastSellingItems,
    avgRating
  });
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Monitor APP_URL to dynamic re-generate tables QR
  if (process.env.APP_URL) {
    DBManager.updateAppUrlInTables(process.env.APP_URL);
  }



app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  await open(`http://localhost:${PORT}`);
});
}

startServer();
