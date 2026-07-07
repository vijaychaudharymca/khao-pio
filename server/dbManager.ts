import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  MenuItem, 
  Category, 
  Table, 
  Order, 
  AssistanceRequest, 
  Feedback, 
  SystemNotification, 
  RestaurantSettings,
  AuditLog,
  Coupon
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  categories: Category[];
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  assistanceRequests: AssistanceRequest[];
  feedbacks: Feedback[];
  notifications: SystemNotification[];
  settings: RestaurantSettings;
  auditLogs: AuditLog[];
  coupons: Coupon[];
  admins: { username: string; passwordHash: string }[];
}

// Simple SHA-256 password hashing helper
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const DEFAULT_SETTINGS: RestaurantSettings = {
  restaurantName: "Khao Pio Aish Karo Mitro",
  address: "456 Foodie Boulevard, Near Marine Drive, Mumbai, Maharashtra 400001",
  phone: "+91 98765 43210",
  openingHours: "11:00 AM - 11:30 PM",
  gstPercentage: 5,
  serviceChargePercentage: 5,
  currency: "₹",
  themeColor: "#E28743", // Deep orange/amber warm restaurant accent
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-appetizers", name: "APPETIZERS", description: "Shuruwat - Light starters to wake up your appetite", order: 1 },
  { id: "cat-mains", name: "MAINS", description: "Main Course - Rich, satisfying curries and standard dishes", order: 2 },
  { id: "cat-breads", name: "BREADS", description: "Tandoori Rotiyan - Fresh out of the clay oven", order: 3 },
  { id: "cat-rice", name: "RICE & BIRYANI", description: "Aromatic basmati rice cooked to perfection", order: 4 },
  { id: "cat-desserts", name: "DESSERTS", description: "Mithai - Sweet endings for a perfect meal", order: 5 }
];

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  // Appetizers
  {
    id: "app-samosa",
    name: "Vegetable Samosa (2 pcs)",
    description: "Crispy deep-fried pastry filled with spiced potatoes and peas.",
    price: 150,
    categoryId: "cat-appetizers",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
    isVeg: true,
    isAvailable: true,
    isChefSpecial: false,
    isPopular: true,
    prepTime: 10
  },
  {
    id: "app-paneer-tikka",
    name: "Paneer Tikka",
    description: "Cubes of fresh cottage cheese marinated in yogurt and spices, grilled in a tandoor.",
    price: 280,
    categoryId: "cat-appetizers",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60",
    isVeg: true,
    isAvailable: true,
    isChefSpecial: true,
    isPopular: false,
    prepTime: 12
  },
  {
    id: "app-chicken-65",
    name: "Chicken 65",
    description: "Spicy deep-fried boneless chicken tossed with curry leaves and red chilies.",
    price: 320,
    categoryId: "cat-appetizers",
    image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=500&auto=format&fit=crop&q=60",
    isVeg: false,
    isAvailable: true,
    isChefSpecial: false,
    isPopular: true,
    prepTime: 15
  },
  {
    id: "app-lamb-seekh",
    name: "Lamb Seekh Kebab",
    description: "Minced lamb mixed with aromatic spices, skewered and cooked in the clay oven.",
    price: 350,
    categoryId: "cat-appetizers",
    image: "https://images.unsplash.com/photo-1532636875304-0c8fe1197e1d?w=500&auto=format&fit=crop&q=60",
    isVeg: false,
    isAvailable: true,
    isChefSpecial: true,
    isPopular: false,
    prepTime: 18
  },
  // Mains
  {
    id: "main-butter-chicken",
    name: "Butter Chicken (Murgh Makhani)",
    description: "Tandoori chicken cooked in a rich creamy tomato butter gravy.",
    price: 380,
    categoryId: "cat-mains",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60",
    isVeg: false,
    isAvailable: true,
    isChefSpecial: true,
    isPopular: true,
    prepTime: 20
  },
  {
    id: "main-rogan-josh",
    name: "Rogan Josh",
    description: "Tender lamb cooked in Kashmiri style gravy.",
    price: 420,
    categoryId: "cat-mains",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
    isVeg: false,
    isAvailable: true,
    isChefSpecial: false,
    isPopular: false,
    prepTime: 22
  },
  {
    id: "main-dal-makhani",
    name: "Dal Makhani",
    description: "Slow-cooked black lentils and kidney beans topped with fresh cream.",
    price: 260,
    categoryId: "cat-mains",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60",
    isVeg: true,
    isAvailable: true,
    isChefSpecial: false,
    isPopular: true,
    prepTime: 15
  },
  {
    id: "main-paneer-butter",
    name: "Paneer Butter Masala",
    description: "Paneer cubes in buttery tomato gravy.",
    price: 290,
    categoryId: "cat-mains",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60",
    isVeg: true,
    isAvailable: true,
    isChefSpecial: false,
    isPopular: true,
    prepTime: 15
  },
  {
    id: "main-veg-korma",
    name: "Vegetable Korma",
    description: "Creamy mixed vegetable curry with cashews and coconut milk.",
    price: 240,
    categoryId: "cat-mains",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=60",
    isVeg: true,
    isAvailable: true,
    isChefSpecial: false,
    isPopular: false,
    prepTime: 14
  },
  // Breads
  {
    id: "bread-butter-naan",
    name: "Butter Naan",
    description: "Freshly baked tandoori flatbread with generous dollops of butter.",
    price: 60,
    categoryId: "cat-breads",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
    isVeg: true,
    isAvailable: true,
    prepTime: 8
  },
  {
    id: "bread-garlic-naan",
    name: "Garlic Naan",
    description: "Leavened flatbread brushed with garlic butter and fresh cilantro.",
    price: 80,
    categoryId: "cat-breads",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
    isVeg: true,
    isAvailable: true,
    isPopular: true,
    prepTime: 8
  },
  {
    id: "bread-roti",
    name: "Tandoori Roti",
    description: "Whole wheat round bread baked inside our traditional tandoor.",
    price: 40,
    categoryId: "cat-breads",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60",
    isVeg: true,
    isAvailable: true,
    prepTime: 6
  },
  {
    id: "bread-lachha",
    name: "Lachha Paratha",
    description: "Multi-layered flaky whole wheat bread cooked in tandoor.",
    price: 70,
    categoryId: "cat-breads",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60",
    isVeg: true,
    isAvailable: true,
    prepTime: 8
  },
  // Rice
  {
    id: "rice-steamed",
    name: "Steamed Basmati Rice",
    description: "Fragrant, long-grain steamed Basmati rice.",
    price: 120,
    categoryId: "cat-rice",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=60",
    isVeg: true,
    isAvailable: true,
    prepTime: 8
  },
  {
    id: "rice-veg-biryani",
    name: "Vegetable Biryani",
    description: "Aromatic basmati rice slow-cooked with fresh garden vegetables and exotic spices.",
    price: 260,
    categoryId: "cat-rice",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60",
    isVeg: true,
    isAvailable: true,
    prepTime: 18
  },
  {
    id: "rice-chicken-biryani",
    name: "Chicken Dum Biryani",
    description: "Rich, layered biryani with marinated chicken, saffron rice, and fried onions.",
    price: 320,
    categoryId: "cat-rice",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=60",
    isVeg: false,
    isAvailable: true,
    isChefSpecial: true,
    isPopular: true,
    prepTime: 20
  },
  // Desserts
  {
    id: "des-gulab-jamun",
    name: "Gulab Jamun (2 pcs)",
    description: "Warm golden milk-solid dumplings soaked in a sweet green cardamom sugar syrup.",
    price: 100,
    categoryId: "cat-desserts",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60",
    isVeg: true,
    isAvailable: true,
    isPopular: true,
    prepTime: 5
  },
  {
    id: "des-rasmalai",
    name: "Rasmalai (2 pcs)",
    description: "Spongy cottage cheese patties dunked in thickened saffron milk.",
    price: 120,
    categoryId: "cat-desserts",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60",
    isVeg: true,
    isAvailable: true,
    isChefSpecial: true,
    prepTime: 5
  }
];

const DEFAULT_COUPONS: Coupon[] = [
  { code: "KHAOPHILIGHT", discountType: "percentage", discountValue: 15, minOrderValue: 500, isActive: true },
  { code: "FESTIVE50", discountType: "fixed", discountValue: 50, minOrderValue: 300, isActive: true },
  { code: "AISHKARO", discountType: "percentage", discountValue: 20, minOrderValue: 800, isActive: true }
];

export class DBManager {
  private static initDB() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const defaultTables: Table[] = Array.from({ length: 10 }, (_, i) => ({
        id: `table-${i + 1}`,
        number: i + 1,
        status: 'available',
        qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://ais-dev-we5slgv4zicu6txyii74k7-695970549717.asia-southeast1.run.app/table/${i + 1}`
      }));

      const defaultAdmins = [
        {
          username: "admin",
          passwordHash: hashPassword("admin123") // Default secure hashed admin credential
        }
      ];

      const initialData: DatabaseSchema = {
        categories: DEFAULT_CATEGORIES,
        menuItems: DEFAULT_MENU_ITEMS,
        tables: defaultTables,
        orders: [],
        assistanceRequests: [],
        feedbacks: [],
        notifications: [
          {
            id: `notif-welcome`,
            title: "Welcome to Khao Pio Aish Karo Mitro!",
            message: "Database system initialized successfully. Your digital waiter dashboard is ready.",
            type: "assistance",
            timestamp: new Date().toISOString(),
            isRead: false
          }
        ],
        settings: DEFAULT_SETTINGS,
        auditLogs: [
          {
            id: `log-init`,
            action: "Database Initialized",
            user: "System",
            timestamp: new Date().toISOString(),
            details: "Default settings, menu categories, tables, and credentials created successfully."
          }
        ],
        coupons: DEFAULT_COUPONS,
        admins: defaultAdmins
      };

      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    }
  }

  private static readData(): DatabaseSchema {
    this.initDB();
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to read database, returning default structure", e);
      // fallback just in case
      return {
        categories: DEFAULT_CATEGORIES,
        menuItems: DEFAULT_MENU_ITEMS,
        tables: [],
        orders: [],
        assistanceRequests: [],
        feedbacks: [],
        notifications: [],
        settings: DEFAULT_SETTINGS,
        auditLogs: [],
        coupons: DEFAULT_COUPONS,
        admins: []
      };
    }
  }

  private static writeData(data: DatabaseSchema) {
    this.initDB();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- Dynamic App URLs update ---
  public static updateAppUrlInTables(appUrl: string) {
    const data = this.readData();
    let changed = false;
    data.tables = data.tables.map(table => {
      const targetQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(appUrl + '/table/' + table.number)}`;
      if (table.qrUrl !== targetQrUrl) {
        changed = true;
        return { ...table, qrUrl: targetQrUrl };
      }
      return table;
    });
    if (changed) {
      this.writeData(data);
    }
  }

  // --- GETTERS ---
  public static getCategories(): Category[] {
    return this.readData().categories;
  }

  public static getMenuItems(): MenuItem[] {
    return this.readData().menuItems;
  }

  public static getTables(): Table[] {
    return this.readData().tables;
  }

  public static getOrders(): Order[] {
    return this.readData().orders;
  }

  public static getAssistanceRequests(): AssistanceRequest[] {
    return this.readData().assistanceRequests;
  }

  public static getFeedbacks(): Feedback[] {
    return this.readData().feedbacks;
  }

  public static getNotifications(): SystemNotification[] {
    return this.readData().notifications;
  }

  public static getSettings(): RestaurantSettings {
    return this.readData().settings;
  }

  public static getAuditLogs(): AuditLog[] {
    return this.readData().auditLogs;
  }

  public static getCoupons(): Coupon[] {
    return this.readData().coupons;
  }

  public static getAdmins() {
    return this.readData().admins;
  }

  // --- SETTERS / CRUD ---

  // Settings
  public static updateSettings(settings: RestaurantSettings, user: string): RestaurantSettings {
    const data = this.readData();
    data.settings = { ...data.settings, ...settings };
    
    // Log audit
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "Settings Updated",
      user,
      timestamp: new Date().toISOString(),
      details: `Restaurant configuration modified.`
    });

    this.writeData(data);
    return data.settings;
  }

  // Menu Management
  public static addMenuItem(item: MenuItem, user: string): MenuItem {
    const data = this.readData();
    data.menuItems.push(item);
    
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "Menu Item Added",
      user,
      timestamp: new Date().toISOString(),
      details: `Added "${item.name}" (ID: ${item.id}) to category ${item.categoryId}.`
    });

    this.writeData(data);
    return item;
  }

  public static updateMenuItem(id: string, updated: Partial<MenuItem>, user: string): MenuItem {
    const data = this.readData();
    const index = data.menuItems.findIndex(item => item.id === id);
    if (index === -1) throw new Error("Menu item not found");
    
    data.menuItems[index] = { ...data.menuItems[index], ...updated } as MenuItem;
    
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "Menu Item Updated",
      user,
      timestamp: new Date().toISOString(),
      details: `Updated "${data.menuItems[index].name}" (ID: ${id}).`
    });

    this.writeData(data);
    return data.menuItems[index];
  }

  public static deleteMenuItem(id: string, user: string): boolean {
    const data = this.readData();
    const item = data.menuItems.find(i => i.id === id);
    if (!item) return false;

    data.menuItems = data.menuItems.filter(i => i.id !== id);
    
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "Menu Item Deleted",
      user,
      timestamp: new Date().toISOString(),
      details: `Deleted "${item.name}" (ID: ${id}).`
    });

    this.writeData(data);
    return true;
  }

  // Category Management
  public static addCategory(cat: Category, user: string): Category {
    const data = this.readData();
    data.categories.push(cat);
    
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "Category Added",
      user,
      timestamp: new Date().toISOString(),
      details: `Added Category "${cat.name}".`
    });

    this.writeData(data);
    return cat;
  }

  public static updateCategory(id: string, updated: Partial<Category>, user: string): Category {
    const data = this.readData();
    const index = data.categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Category not found");
    
    data.categories[index] = { ...data.categories[index], ...updated } as Category;
    
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "Category Updated",
      user,
      timestamp: new Date().toISOString(),
      details: `Updated Category "${data.categories[index].name}".`
    });

    this.writeData(data);
    return data.categories[index];
  }

  public static deleteCategory(id: string, user: string): boolean {
    const data = this.readData();
    const cat = data.categories.find(c => c.id === id);
    if (!cat) return false;

    data.categories = data.categories.filter(c => c.id !== id);
    // Also mark items in that category as uncategorized or delete them? We'll just leave them, or keep them.
    
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "Category Deleted",
      user,
      timestamp: new Date().toISOString(),
      details: `Deleted Category "${cat.name}".`
    });

    this.writeData(data);
    return true;
  }

  // Order Operations
  public static createOrder(order: Order): Order {
    const data = this.readData();
    data.orders.push(order);

    // Auto occupy the table
    const tableIndex = data.tables.findIndex(t => t.number === order.tableNumber);
    if (tableIndex !== -1) {
      data.tables[tableIndex].status = 'occupied';
    }

    // Add alert notification for admin
    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `🚨 New Order #${order.tokenNumber}`,
      message: `Table ${order.tableNumber} placed an order of ${order.items.length} items. Total: ${data.settings.currency}${order.total}`,
      type: 'new_order',
      timestamp: new Date().toISOString(),
      isRead: false,
      tableNumber: order.tableNumber
    });

    this.writeData(data);
    return order;
  }

  public static updateOrderStatus(id: string, status: Order['status'], user: string): Order {
    const data = this.readData();
    const orderIndex = data.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) throw new Error("Order not found");
    
    const oldStatus = data.orders[orderIndex].status;
    data.orders[orderIndex].status = status;
    data.orders[orderIndex].updatedAt = new Date().toISOString();

    // If order was served, completed, or cancelled, handle table status
    if (status === 'completed' || status === 'cancelled') {
      const tableNumber = data.orders[orderIndex].tableNumber;
      // check if there are other active orders for this table
      const activeOrders = data.orders.filter(o => o.tableNumber === tableNumber && o.status !== 'completed' && o.status !== 'cancelled');
      if (activeOrders.length === 0) {
        const tableIndex = data.tables.findIndex(t => t.number === tableNumber);
        if (tableIndex !== -1) {
          data.tables[tableIndex].status = 'available';
        }
      }
    }

    // Add notification if cancelled
    if (status === 'cancelled') {
      data.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `❌ Order #${data.orders[orderIndex].tokenNumber} Cancelled`,
        message: `Order for Table ${data.orders[orderIndex].tableNumber} has been cancelled.`,
        type: 'cancelled',
        timestamp: new Date().toISOString(),
        isRead: false,
        tableNumber: data.orders[orderIndex].tableNumber
      });
    }

    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "Order Status Updated",
      user,
      timestamp: new Date().toISOString(),
      details: `Order #${data.orders[orderIndex].tokenNumber} changed from ${oldStatus} to ${status}.`
    });

    this.writeData(data);
    return data.orders[orderIndex];
  }

  public static updateOrderPayment(id: string, paymentStatus: 'paid' | 'unpaid', method: 'upi' | 'card' | 'net_banking' | 'wallet', user: string): Order {
    const data = this.readData();
    const orderIndex = data.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) throw new Error("Order not found");
    
    data.orders[orderIndex].paymentStatus = paymentStatus;
    data.orders[orderIndex].paymentDetails = { method, transactionId: `txn_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}` };
    data.orders[orderIndex].updatedAt = new Date().toISOString();

    if (paymentStatus === 'paid') {
      data.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `💰 Payment Received`,
        message: `Table ${data.orders[orderIndex].tableNumber} paid ${data.settings.currency}${data.orders[orderIndex].total} via ${method.toUpperCase()}.`,
        type: 'payment_received',
        timestamp: new Date().toISOString(),
        isRead: false,
        tableNumber: data.orders[orderIndex].tableNumber
      });
    }

    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "Payment Updated",
      user,
      timestamp: new Date().toISOString(),
      details: `Order #${data.orders[orderIndex].tokenNumber} marked as ${paymentStatus} via ${method.toUpperCase()}.`
    });

    this.writeData(data);
    return data.orders[orderIndex];
  }

  // Tables
  public static addTable(table: Table, user: string): Table {
    const data = this.readData();
    data.tables.push(table);
    
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "Table Added",
      user,
      timestamp: new Date().toISOString(),
      details: `Added Table #${table.number}.`
    });

    this.writeData(data);
    return table;
  }

  public static updateTable(id: string, updated: Partial<Table>, user: string): Table {
    const data = this.readData();
    const index = data.tables.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Table not found");
    
    data.tables[index] = { ...data.tables[index], ...updated } as Table;
    
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "Table Updated",
      user,
      timestamp: new Date().toISOString(),
      details: `Updated Table #${data.tables[index].number} (Status: ${data.tables[index].status}).`
    });

    this.writeData(data);
    return data.tables[index];
  }

  public static deleteTable(id: string, user: string): boolean {
    const data = this.readData();
    const table = data.tables.find(t => t.id === id);
    if (!table) return false;

    data.tables = data.tables.filter(t => t.id !== id);
    
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "Table Deleted",
      user,
      timestamp: new Date().toISOString(),
      details: `Deleted Table #${table.number}.`
    });

    this.writeData(data);
    return true;
  }

  // Assistance Requests
  public static createAssistanceRequest(req: AssistanceRequest): AssistanceRequest {
    const data = this.readData();
    data.assistanceRequests.push(req);

    const labels = {
      water: "💦 Water Requested",
      bill: "🧾 Bill Requested",
      assistance: "🙋 Assistance Needed"
    };

    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: labels[req.type] || "Customer Service Requested",
      message: `Table ${req.tableNumber} is requesting ${req.type}.`,
      type: 'assistance',
      timestamp: new Date().toISOString(),
      isRead: false,
      tableNumber: req.tableNumber
    });

    this.writeData(data);
    return req;
  }

  public static resolveAssistanceRequest(id: string, user: string): boolean {
    const data = this.readData();
    const index = data.assistanceRequests.findIndex(r => r.id === id);
    if (index === -1) return false;

    data.assistanceRequests[index].status = 'resolved';

    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "Service Request Resolved",
      user,
      timestamp: new Date().toISOString(),
      details: `Resolved Table ${data.assistanceRequests[index].tableNumber}'s request for ${data.assistanceRequests[index].type}.`
    });

    this.writeData(data);
    return true;
  }

  // Feedback
  public static addFeedback(feedback: Feedback): Feedback {
    const data = this.readData();
    data.feedbacks.push(feedback);
    this.writeData(data);
    return feedback;
  }

  // Notifications
  public static markNotificationRead(id: string): boolean {
    const data = this.readData();
    const index = data.notifications.findIndex(n => n.id === id);
    if (index === -1) return false;
    data.notifications[index].isRead = true;
    this.writeData(data);
    return true;
  }

  public static clearAllNotifications(): void {
    const data = this.readData();
    data.notifications = [];
    this.writeData(data);
  }

  // Admin Credentials
  public static updateAdminPassword(username: string, oldPass: string, newPass: string): boolean {
    const data = this.readData();
    const adminIndex = data.admins.findIndex(a => a.username === username);
    if (adminIndex === -1) return false;

    if (data.admins[adminIndex].passwordHash !== hashPassword(oldPass)) {
      return false; // Old password doesn't match
    }

    data.admins[adminIndex].passwordHash = hashPassword(newPass);
    
    data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "Admin Password Changed",
      user: username,
      timestamp: new Date().toISOString(),
      details: `Security credentials updated for user ${username}.`
    });

    this.writeData(data);
    return true;
  }
}
