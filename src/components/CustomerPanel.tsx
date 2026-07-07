import React, { useState, useEffect, useRef } from "react";
import { 
  Search, ShoppingBag, Utensils, Plus, Minus, Trash2, Clock, Sparkles, 
  TrendingUp, Heart, Languages, Sun, Moon, BellRing, CheckCircle2, 
  AlertCircle, X, Star, Check, Loader2, GlassWater, Receipt, ShoppingCart, Info, ChevronRight
} from "lucide-react";
import { MenuItem, Category, Order, OrderItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CustomerPanelProps {
  tableNumber: number;
  onTableChange: (num: number) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const TRANSLATIONS = {
  en: {
    welcome: "Welcome to",
    orderingFrom: "You are ordering from",
    tableNo: "Table No.",
    categories: "Categories",
    searchPlaceholder: "Search delicious dishes...",
    vegOnly: "Veg Only",
    nonVegOnly: "Non-Veg",
    sortBy: "Sort By",
    defaultSort: "Default",
    lowToHigh: "Price: Low to High",
    highToLow: "Price: High to Low",
    popular: "Popular Dishes",
    chefSpecial: "Chef's Special",
    addToCart: "Add to Cart",
    unavailable: "Unavailable",
    cart: "Your Plate",
    subtotal: "Subtotal",
    gst: "GST",
    serviceCharge: "Service Charge",
    total: "Grand Total",
    instructions: "Special Instructions",
    checkout: "Checkout Now",
    payNow: "Pay Securely Online",
    payLater: "Pay Later at Counter",
    confirmTable: "Confirm Table Number",
    orderConfirmed: "Order Confirmed!",
    tokenNum: "Your Token Number",
    nowServing: "Current Serving Token",
    waitingTime: "Estimated Waiting Time",
    statusPreparing: "Order Accepted",
    statusCooking: "Cooking in Kitchen",
    statusReady: "Ready to Serve",
    statusServed: "Served",
    callWaiter: "Call Waiter",
    assistance: "Assistance",
    water: "Request Water",
    bill: "Request Bill",
    assistanceSent: "Waiter request sent!",
    feedback: "Give Feedback",
    rating: "Rate your Meal",
    submit: "Submit Feedback",
    tip: "Add Tip for Staff",
    instructionsPlaceholder: "e.g., Less spicy, no onion, extra butter...",
    discount: "Coupon Discount",
    promoCode: "Promo Code",
    apply: "Apply",
    couponSuccess: "Coupon applied successfully!",
    favorites: "Your Favorites",
    history: "Order History",
    reorder: "Reorder",
    emptyCart: "Your plate is empty. Add some delicious food!",
    paymentMethod: "Select Payment Method",
    simulatedPayment: "Simulated Payment Gateway",
    paymentSuccess: "Payment successful! Placing your order...",
    ordersAhead: "Orders Ahead in Queue"
  },
  hi: {
    welcome: "स्वागत है",
    orderingFrom: "आप आर्डर कर रहे हैं",
    tableNo: "टेबल नंबर",
    categories: "श्रेणियाँ",
    searchPlaceholder: "स्वादिष्ट व्यंजनों की खोज करें...",
    vegOnly: "केवल शाकाहारी",
    nonVegOnly: "केवल मांसाहारी",
    sortBy: "क्रमबद्ध करें",
    defaultSort: "डिफ़ॉल्ट",
    lowToHigh: "कीमत: कम से अधिक",
    highToLow: "कीमत: अधिक से कम",
    popular: "लोकप्रिय",
    chefSpecial: "शेफ की पसंद",
    addToCart: "थाली में जोड़ें",
    unavailable: "उपलब्ध नहीं है",
    cart: "आपकी थाली",
    subtotal: "कुल भोजन मूल्य",
    gst: "जीएसटी (GST)",
    serviceCharge: "सेवा शुल्क",
    total: "कुल देय राशि",
    instructions: "विशेष निर्देश",
    checkout: "ऑर्डर सबमिट करें",
    payNow: "अभी ऑनलाइन भुगतान करें",
    payLater: "काउंटर पर भुगतान करें",
    confirmTable: "टेबल नंबर की पुष्टि करें",
    orderConfirmed: "ऑर्डर पक्का हो गया!",
    tokenNum: "आपका टोकन नंबर",
    nowServing: "रसोई में वर्तमान टोकन",
    waitingTime: "अनुमानित प्रतीक्षा समय",
    statusPreparing: "ऑर्डर स्वीकार किया गया",
    statusCooking: "रसोई में पक रहा है",
    statusReady: "परोसने के लिए तैयार",
    statusServed: "परोसा गया",
    callWaiter: "बेटर को बुलाएं",
    assistance: "सहायता चाहिए",
    water: "पानी मंगवाएं",
    bill: "बिल मंगवाएं",
    assistanceSent: "सहायता अनुरोध भेज दिया गया है!",
    feedback: "प्रतिक्रिया दें",
    rating: "भोजन का मूल्यांकन करें",
    submit: "प्रतिक्रिया सबमिट करें",
    tip: "स्टाफ के लिए बख्शिश जोड़ें",
    instructionsPlaceholder: "जैसे: कम तीखा, बिना प्याज, अतिरिक्त मक्खन...",
    discount: "कूपन छूट",
    promoCode: "प्रोमो कोड",
    apply: "लागू करें",
    couponSuccess: "कूपन सफलतापूर्वक लागू किया गया!",
    favorites: "आपके पसंदीदा व्यंजन",
    history: "ऑर्डर का इतिहास",
    reorder: "फिर से आर्डर करें",
    emptyCart: "आपकी थाली खाली है। कुछ स्वादिष्ट खाना जोड़ें!",
    paymentMethod: "भुगतान का प्रकार चुनें",
    simulatedPayment: "ऑनलाइन भुगतान गेटवे",
    paymentSuccess: "भुगतान सफल! आपका ऑर्डर लिया जा रहा है...",
    ordersAhead: "रसोई में कतार में आगे ऑर्डर"
  }
};

export default function CustomerPanel({ tableNumber, onTableChange, darkMode, setDarkMode }: CustomerPanelProps) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = TRANSLATIONS[lang];

  // Menu and State
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'asc' | 'desc' | 'popular' | 'chef'>('default');

  // Interactive Options
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("khao_pio_favs");
    return saved ? JSON.parse(saved) : [];
  });
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  // Cart State
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; discountType: string; discountValue: number } | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // UI Flow Control
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'confirm_table' | 'payment_method' | 'online_processing' | 'success'>('confirm_table');
  
  // Custom Variants modal
  const [variantModalItem, setVariantModalItem] = useState<MenuItem | null>(null);
  const [selectedSpicy, setSelectedSpicy] = useState<string>("Medium");
  const [extraCheese, setExtraCheese] = useState(false);
  const [extraButter, setExtraButter] = useState(false);

  // Active tracking state
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [ordersAhead, setOrdersAhead] = useState<number>(0);
  const [nowServingToken, setNowServingToken] = useState<number>(101);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackName, setFeedbackName] = useState("");
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // API configuration and setup
  const [settings, setSettings] = useState({
    restaurantName: "Khao Pio Aish Karo Mitro",
    currency: "₹",
    gstPercentage: 5,
    serviceChargePercentage: 5,
    openingHours: "11:00 AM - 11:30 PM"
  });

  // Load Initial Menu & Settings
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((e) => console.error("Error fetching settings", e));

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((e) => console.error("Error fetching categories", e));

    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => setMenuItems(data))
      .catch((e) => console.error("Error fetching menu", e));
  }, []);

  // Sync Favorites
  const toggleFavorite = (itemId: string) => {
    let updated;
    if (favorites.includes(itemId)) {
      updated = favorites.filter(id => id !== itemId);
    } else {
      updated = [...favorites, itemId];
    }
    setFavorites(updated);
    localStorage.setItem("khao_pio_favs", JSON.stringify(updated));
  };

  // Real-time Status updates using Server-Sent Events
  useEffect(() => {
    const eventSource = new EventSource("/api/updates");
    
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "order_status_updated" || payload.type === "order_payment_updated") {
          const updatedOrder = payload.data as Order;
          if (updatedOrder.id === trackingOrderId) {
            setTrackedOrder(updatedOrder);
          }
          // Update now serving token dynamically (roughly completed orders + 100)
          if (updatedOrder.status === 'completed' || updatedOrder.status === 'served') {
            setNowServingToken(updatedOrder.tokenNumber);
          }
        }
        if (payload.type === "menu") {
          setMenuItems(payload.data);
        }
        if (payload.type === "categories") {
          setCategories(payload.data);
        }
        if (payload.type === "settings") {
          setSettings(payload.data);
        }
      } catch (e) {
        console.error("Error parsing SSE event", e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [trackingOrderId]);

  // Track dynamic ETA and Orders Ahead
  useEffect(() => {
    if (!trackingOrderId) return;

    const interval = setInterval(() => {
      fetch(`/api/orders/track/${trackingOrderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.order) {
            setTrackedOrder(data.order);
            setOrdersAhead(data.ordersAhead);
          }
        })
        .catch(e => console.error("Error polling order progress", e));
    }, 8000);

    return () => clearInterval(interval);
  }, [trackingOrderId]);

  // AI-Based Food Recommendations helper:
  // "Customers who ordered X also loved..."
  const getAIRecommendations = (): MenuItem[] => {
    if (cart.length === 0) {
      return menuItems.filter(i => i.isChefSpecial && i.isAvailable).slice(0, 3);
    }
    // Simple mock logic reflecting matching flavors
    const cartCategories = cart.map(i => i.menuItem.categoryId);
    return menuItems.filter(i => 
      !cart.some(c => c.menuItem.id === i.id) && 
      i.isAvailable &&
      (i.isPopular || !cartCategories.includes(i.categoryId))
    ).slice(0, 3);
  };

  // Cart operations
  const handleAddToCartClick = (item: MenuItem) => {
    // If has variants (or Mains/Rice usually have variants), open modal
    if (item.categoryId === 'cat-mains' || item.categoryId === 'cat-rice') {
      setVariantModalItem(item);
      setSelectedSpicy("Medium");
      setExtraCheese(false);
      setExtraButter(false);
    } else {
      // standard add to cart
      addExactToCart(item, {});
    }
  };

  const addExactToCart = (item: MenuItem, selectedVariants: any) => {
    const existingIndex = cart.findIndex(c => 
      c.menuItem.id === item.id && 
      JSON.stringify(c.selectedVariants) === JSON.stringify(selectedVariants)
    );

    if (existingIndex !== -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { menuItem: item, quantity: 1, selectedVariants }]);
    }
  };

  const updateCartQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    setCouponError("");
    setCouponSuccess("");
    try {
      const sub = getSubtotal();
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartSubtotal: sub })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setActiveCoupon(data.coupon);
        setCouponSuccess(t.couponSuccess);
      } else {
        setCouponError(data.error || "Invalid Coupon Code");
      }
    } catch {
      setCouponError("Failed to apply coupon. Try again.");
    }
  };

  // Call waiter API
  const handleCallWaiter = async (type: 'water' | 'bill' | 'assistance') => {
    try {
      const res = await fetch("/api/assistance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber, type })
      });
      if (res.ok) {
        setIsWaiterModalOpen(false);
        // Show local floating alert
        const alertDiv = document.createElement("div");
        alertDiv.className = "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 animate-bounce";
        alertDiv.innerHTML = `<span>🔔</span> ${t.assistanceSent}`;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Coupon calculations
  const getSubtotal = () => {
    return cart.reduce((sum, item) => {
      let price = item.menuItem.price;
      if (item.selectedVariants?.extraCheese) price += 30;
      if (item.selectedVariants?.extraButter) price += 20;
      return sum + (price * item.quantity);
    }, 0);
  };

  const getDiscountAmount = () => {
    if (!activeCoupon) return 0;
    const sub = getSubtotal();
    if (activeCoupon.discountType === 'percentage') {
      return Math.round((sub * activeCoupon.discountValue) / 100);
    } else {
      return activeCoupon.discountValue;
    }
  };

  const getGST = () => {
    const base = getSubtotal() - getDiscountAmount();
    return Math.round((base * settings.gstPercentage) / 100);
  };

  const getServiceCharge = () => {
    const base = getSubtotal() - getDiscountAmount();
    return Math.round((base * settings.serviceChargePercentage) / 100);
  };

  const getGrandTotal = () => {
    return getSubtotal() - getDiscountAmount() + getGST() + getServiceCharge();
  };

  // Submit checkout
  const handlePlaceOrder = async (method: 'pay_now' | 'pay_later', paymentDetails?: any) => {
    const payload = {
      tableNumber,
      items: cart,
      paymentMethod: method,
      paymentDetails,
      instructions: specialInstructions
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setTrackedOrder(data);
        setTrackingOrderId(data.id);
        
        // Save order history locally
        const updatedHistory = [data, ...orderHistory].slice(0, 10);
        setOrderHistory(updatedHistory);
        localStorage.setItem("khao_pio_history", JSON.stringify(updatedHistory));

        // Clear plate/cart
        setCart([]);
        setSpecialInstructions("");
        setActiveCoupon(null);
        setCouponCode("");

        setCheckoutStep('success');
      }
    } catch (e) {
      console.error("Order failed", e);
    }
  };

  // Reorder from history
  const handleReorder = (histOrder: Order) => {
    const newItems = histOrder.items.map(item => ({
      menuItem: item.menuItem,
      quantity: item.quantity,
      selectedVariants: item.selectedVariants
    }));
    setCart([...cart, ...newItems]);
    setIsHistoryOpen(false);
    setIsCartOpen(true);
  };

  // Feedback submit
  const handleFeedbackSubmit = async () => {
    const payload = {
      rating: feedbackRating,
      feedbackText,
      name: feedbackName || "Guest",
      tipAmount
    };

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setFeedbackSubmitted(true);
        setTimeout(() => {
          setShowFeedbackModal(false);
          setFeedbackSubmitted(false);
          setFeedbackText("");
          setFeedbackName("");
          setTipAmount(0);
        }, 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load History on Init
  useEffect(() => {
    const hist = localStorage.getItem("khao_pio_history");
    if (hist) {
      try {
        setOrderHistory(JSON.parse(hist));
      } catch {}
    }
  }, []);

  // Filter and Sort Logic
  const filteredMenuItems = menuItems.filter((item) => {
    // search text
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // category selection
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;

    // veg/nonveg filters
    const matchesVeg = vegFilter === 'all' || 
                       (vegFilter === 'veg' && item.isVeg) || 
                       (vegFilter === 'nonveg' && !item.isVeg);

    return matchesSearch && matchesCategory && matchesVeg;
  }).sort((a, b) => {
    if (sortBy === 'asc') return a.price - b.price;
    if (sortBy === 'desc') return b.price - a.price;
    if (sortBy === 'popular') return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    if (sortBy === 'chef') return (b.isChefSpecial ? 1 : 0) - (a.isChefSpecial ? 1 : 0);
    return 0; // default order
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? "bg-[#0A0A0B] text-slate-100" : "bg-[#fcf8f2] text-zinc-900"}`}>
      
      {/* HEADER SECTION */}
      <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors border-b ${darkMode ? "bg-[#0A0A0B]/80 border-white/5" : "bg-white/80 border-orange-100"}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-black p-2 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Utensils className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-serif italic text-amber-500 leading-tight">
                Khao Pio
              </h1>
              <p className="text-[9px] tracking-[0.15em] uppercase opacity-50 font-sans">Aish Karo Mitro</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Waiter request action */}
            <button 
              id="btn-waiter-assistance"
              onClick={() => setIsWaiterModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">{t.callWaiter}</span>
            </button>

            {/* Language Selection */}
            <button 
              id="btn-lang-switch"
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${darkMode ? "border-zinc-800 bg-zinc-900 text-zinc-300" : "border-orange-100 bg-orange-50 text-zinc-700"}`}
              title="Change Language"
            >
              <Languages className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] uppercase font-mono">{lang === 'en' ? 'हिं' : 'EN'}</span>
            </button>

            {/* Dark/Light mode toggle */}
            <button 
              id="btn-theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${darkMode ? "border-zinc-800 bg-zinc-900 text-amber-400" : "border-orange-100 bg-orange-50 text-amber-600"}`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Order history */}
            {orderHistory.length > 0 && (
              <button 
                id="btn-history-drawer"
                onClick={() => setIsHistoryOpen(true)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${darkMode ? "border-zinc-800 hover:bg-zinc-900" : "border-orange-100 hover:bg-orange-50"}`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.history}</span>
              </button>
            )}

            {/* Order Tracking alert if tracking ID is active */}
            {trackingOrderId && (
              <button 
                id="btn-active-tracker"
                onClick={() => {
                  setCheckoutStep('success');
                  setIsCheckoutOpen(true);
                }}
                className="bg-emerald-500 text-black px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 animate-pulse"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                Tracking
              </button>
            )}

            {/* Floating Cart Trigger */}
            <button 
              id="btn-cart-drawer"
              onClick={() => setIsCartOpen(true)}
              className="relative bg-amber-500 text-black px-3.5 py-1.5 rounded-lg font-extrabold text-xs flex items-center gap-1.5 hover:bg-amber-400 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{cart.length}</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 w-2.5 h-2.5 rounded-full ring-2 ring-amber-500"></span>
              )}
            </button>
          </div>
          
        </div>
      </header>

      {/* CORE HERO WRAPPER */}
      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* WELCOME SECTION */}
        <section className={`mb-8 rounded-[32px] p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl transition-all ${darkMode ? "bg-white/[0.03] border border-white/5" : "bg-gradient-to-br from-orange-100/50 to-amber-50/50 border border-orange-100"}`}>
          {/* Subtle background glow */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full"></div>
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              ✨ {t.welcome}
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-light tracking-tight">
              Khao Pio <span className="italic text-amber-500">Aish Karo</span>
            </h2>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-zinc-600"}`}>
              {settings.address} • <span className="font-semibold text-amber-500">{settings.openingHours}</span>
            </p>
          </div>

          <div className={`flex items-center gap-4 p-4 rounded-2xl ${darkMode ? "bg-amber-500/10 border border-amber-500/20" : "bg-white border border-orange-100"}`}>
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-black font-serif font-extrabold flex items-center justify-center text-xl">
              {tableNumber}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">{t.orderingFrom}</p>
              <h4 className="text-base font-serif font-medium">{t.tableNo} {tableNumber}</h4>
              <button 
                id="btn-edit-table"
                onClick={() => {
                  const num = prompt("Enter table number:", String(tableNumber));
                  if (num && !isNaN(Number(num))) onTableChange(Number(num));
                }}
                className="text-[10px] text-amber-500 font-bold underline cursor-pointer"
              >
                Change Table
              </button>
            </div>
          </div>
        </section>

        {/* SEARCH & FILTERS CONTAINER */}
        <section className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                id="input-dish-search"
                type="text" 
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-11 pr-4 py-3.5 rounded-full text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all ${darkMode ? "bg-white/5 border-white/10 text-zinc-200" : "bg-white border-orange-100 text-zinc-800"}`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-zinc-700/20 text-zinc-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-none">
              
              <button
                id="btn-filter-all-veg"
                onClick={() => setVegFilter('all')}
                className={`px-3 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${vegFilter === 'all' ? "bg-amber-500 border-amber-500 text-black" : (darkMode ? "border-white/10 bg-white/5 text-zinc-300" : "border-orange-100 hover:bg-orange-50")}`}
              >
                All
              </button>

              <button
                id="btn-filter-veg"
                onClick={() => setVegFilter('veg')}
                className={`px-3 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${vegFilter === 'veg' ? "bg-emerald-500 border-emerald-500 text-black" : (darkMode ? "border-white/10 bg-white/5 text-emerald-500" : "border-orange-100 text-emerald-600 hover:bg-orange-50")}`}
              >
                <span className="w-2 h-2 rounded-sm bg-emerald-500 ring-1 ring-black flex-shrink-0"></span>
                {t.vegOnly}
              </button>

              <button
                id="btn-filter-nonveg"
                onClick={() => setVegFilter('nonveg')}
                className={`px-3 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${vegFilter === 'nonveg' ? "bg-red-500 border-red-500 text-white" : (darkMode ? "border-white/10 bg-white/5 text-red-400" : "border-orange-100 text-red-600 hover:bg-orange-50")}`}
              >
                <span className="w-2 h-2 rounded-full bg-red-600 ring-1 ring-black flex-shrink-0"></span>
                {t.nonVegOnly}
              </button>

              <div className="h-6 w-[1px] bg-white/10 hidden sm:block"></div>

              {/* Sorting Filter Selector */}
              <select
                id="select-menu-sort"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-full text-xs font-bold border focus:outline-none transition-all cursor-pointer ${darkMode ? "bg-white/5 border-white/10 text-zinc-300" : "bg-white border-orange-100 text-zinc-700"}`}
              >
                <option value="default">{t.sortBy}: {t.defaultSort}</option>
                <option value="asc">{t.lowToHigh}</option>
                <option value="desc">{t.highToLow}</option>
                <option value="popular">{t.popular}</option>
                <option value="chef">{t.chefSpecial}</option>
              </select>

            </div>
          </div>
        </section>

        {/* HORIZONTAL CATEGORY NAVIGATION TABS */}
        <section className="mb-8 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
          <div className="flex gap-4">
            
            <button
              id="btn-cat-tab-all"
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-3 font-semibold text-xs tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${selectedCategory === "all" ? "border-b-2 border-amber-500 text-amber-500 bg-white/5 rounded-t-xl" : "opacity-40 hover:opacity-100 text-zinc-400"}`}
            >
              All Items
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`btn-cat-tab-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-3 font-semibold text-xs tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${selectedCategory === cat.id ? "border-b-2 border-amber-500 text-amber-500 bg-white/5 rounded-t-xl" : "opacity-40 hover:opacity-100 text-zinc-400"}`}
              >
                {cat.name}
              </button>
            ))}

          </div>
        </section>

        {/* MENU LIST GRID */}
        <section>
          {filteredMenuItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🍽️</div>
              <p className="text-zinc-400 text-sm">No dishes matched your search/filter criteria.</p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setVegFilter("all"); setSortBy("default"); }}
                className="mt-4 text-xs font-bold text-amber-500 underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <h2 className="text-3xl md:text-5xl font-serif font-light tracking-tight leading-tight">
                  {selectedCategory === "all" ? "Signature" : categories.find(c => c.id === selectedCategory)?.name || "Signature"}{" "}
                  <span className="italic text-amber-500">Mains</span>
                </h2>
                <p className="max-w-xs text-xs opacity-50 leading-relaxed font-sans">
                  Handcrafted authentic recipes passed down through generations. Prepared fresh for Table {tableNumber}.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredMenuItems.map((item) => {
                  const fav = favorites.includes(item.id);
                  return (
                    <article 
                      key={item.id}
                      id={`menu-item-${item.id}`}
                      className={`group rounded-[32px] p-5 transition-all duration-300 relative flex flex-col sm:flex-row gap-5 ${
                        darkMode 
                          ? "bg-white/[0.03] border border-white/5 hover:bg-white/[0.05]" 
                          : "bg-white border border-orange-100 hover:bg-orange-50/40 shadow-sm"
                      }`}
                    >
                      {/* Image and Badges */}
                      <div className="w-full sm:w-32 h-32 rounded-2xl flex-shrink-0 relative overflow-hidden bg-zinc-800/20">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        
                        {/* Veg indicator badge */}
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg flex items-center justify-center">
                          <span className={`w-3 h-3 rounded flex items-center justify-center border ${item.isVeg ? "border-emerald-600 bg-emerald-950/40" : "border-red-600 bg-red-950/40"}`}>
                            <span className={`w-1 h-1 rounded-full ${item.isVeg ? "bg-emerald-500" : "bg-red-500"}`}></span>
                          </span>
                        </div>

                        {/* Prep time badge */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-zinc-300 text-[9px] px-1.5 py-0.5 rounded">
                          <Clock className="w-2.5 h-2.5 text-amber-500" />
                          <span>{item.prepTime} min</span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className="font-semibold text-base tracking-tight line-clamp-1">{item.name}</h3>
                            <span className="text-amber-500 font-serif text-lg font-semibold whitespace-nowrap">{settings.currency}{item.price}</span>
                          </div>
                          
                          <p className={`text-xs line-clamp-2 leading-relaxed mb-2 ${darkMode ? "text-slate-400" : "text-zinc-600"}`}>
                            {item.description}
                          </p>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.isChefSpecial && (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[8px] rounded uppercase font-bold tracking-widest flex items-center gap-0.5">
                                <Sparkles className="w-2 h-2" />
                                Chef Special
                              </span>
                            )}
                            {item.isPopular && (
                              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[8px] rounded uppercase font-bold tracking-widest flex items-center gap-0.5">
                                <TrendingUp className="w-2 h-2" />
                                Popular
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 mt-2">
                          {/* Favorite button */}
                          <button 
                            id={`btn-fav-${item.id}`}
                            onClick={() => toggleFavorite(item.id)}
                            className={`p-1.5 rounded-full cursor-pointer transition-all ${fav ? "text-rose-500 bg-rose-500/10" : "text-zinc-400 hover:text-zinc-200"}`}
                          >
                            <Heart className={`w-4 h-4 ${fav ? "fill-current" : ""}`} />
                          </button>

                          {item.isAvailable ? (
                            <button
                              id={`btn-add-item-${item.id}`}
                              onClick={() => handleAddToCartClick(item)}
                              className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer ${
                                darkMode 
                                  ? "bg-white text-black hover:bg-slate-200" 
                                  : "bg-zinc-900 text-white hover:bg-zinc-800"
                              }`}
                            >
                              {t.addToCart}
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold tracking-[0.15em] bg-slate-700/20 text-zinc-500 py-2 px-4 rounded-full uppercase">
                              {t.unavailable}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* AI SMART FOOD RECOMMENDATIONS (Customers Also Ordered...) */}
        {menuItems.length > 0 && (
          <section className="mt-16 pt-8 border-t border-zinc-800/40">
            <h3 className="text-lg font-extrabold tracking-tight mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Smart Recommendations for You</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {getAIRecommendations().map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-xl flex gap-3 items-center ${darkMode ? "bg-zinc-900/40 border border-zinc-800" : "bg-white border border-orange-50"}`}
                >
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold truncate">{item.name}</h5>
                    <p className="text-xs text-amber-500 font-extrabold">{settings.currency}{item.price}</p>
                  </div>
                  <button
                    id={`btn-add-rec-${item.id}`}
                    onClick={() => handleAddToCartClick(item)}
                    className="p-1.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* CALL WAITER ASSISTANCE MODAL */}
      <AnimatePresence>
        {isWaiterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWaiterModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-sm rounded-3xl p-6 relative z-10 border ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-orange-100"}`}
            >
              <button 
                onClick={() => setIsWaiterModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black tracking-tight mb-1 text-center flex items-center justify-center gap-2">
                <BellRing className="w-5 h-5 text-amber-500" />
                <span>{t.callWaiter}</span>
              </h3>
              <p className="text-xs text-center text-zinc-400 mb-6 font-mono uppercase tracking-widest">Table #{tableNumber}</p>

              <div className="grid grid-cols-1 gap-3">
                <button
                  id="btn-request-water"
                  onClick={() => handleCallWaiter('water')}
                  className="p-4 rounded-2xl flex items-center justify-between border font-bold text-sm bg-amber-500/5 hover:bg-amber-500/15 border-amber-500/20 hover:border-amber-500 text-amber-500 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <GlassWater className="w-5 h-5" />
                    {t.water}
                  </span>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full uppercase">Tap</span>
                </button>

                <button
                  id="btn-request-bill"
                  onClick={() => handleCallWaiter('bill')}
                  className="p-4 rounded-2xl flex items-center justify-between border font-bold text-sm bg-amber-500/5 hover:bg-amber-500/15 border-amber-500/20 hover:border-amber-500 text-amber-500 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    {t.bill}
                  </span>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full uppercase">Tap</span>
                </button>

                <button
                  id="btn-request-assist"
                  onClick={() => handleCallWaiter('assistance')}
                  className="p-4 rounded-2xl flex items-center justify-between border font-bold text-sm bg-amber-500/5 hover:bg-amber-500/15 border-amber-500/20 hover:border-amber-500 text-amber-500 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    {t.assistance}
                  </span>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full uppercase">Tap</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DISH CUSTOM VARIANT SELECTOR MODAL */}
      <AnimatePresence>
        {variantModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVariantModalItem(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-sm rounded-3xl overflow-hidden relative z-10 border ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-orange-100"}`}
            >
              <div className="relative h-40">
                <img src={variantModalItem.image} alt={variantModalItem.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                <button 
                  onClick={() => setVariantModalItem(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-black/50 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-4">
                  <h3 className="text-base font-extrabold text-white">{variantModalItem.name}</h3>
                  <p className="text-xs text-amber-500 font-extrabold">{settings.currency}{variantModalItem.price}</p>
                </div>
              </div>

              <div className="p-5 space-y-5">
                
                {/* Spicy Level Variant */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Spicy Level</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['Mild', 'Medium', 'Hot', 'Extra Hot'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSelectedSpicy(lvl)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${selectedSpicy === lvl ? "bg-amber-500 border-amber-500 text-black" : (darkMode ? "border-zinc-800 hover:bg-zinc-800" : "border-orange-50 hover:bg-orange-50")}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extras Variant */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Customize Extras</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setExtraCheese(!extraCheese)}
                      className={`p-3 rounded-2xl flex items-center justify-between border font-bold text-xs cursor-pointer ${extraCheese ? "bg-amber-500/10 border-amber-500 text-amber-500" : (darkMode ? "border-zinc-800" : "border-zinc-200")}`}
                    >
                      <span>🧀 Extra Cheese</span>
                      <span className="font-extrabold">+₹30</span>
                    </button>
                    <button
                      onClick={() => setExtraButter(!extraButter)}
                      className={`p-3 rounded-2xl flex items-center justify-between border font-bold text-xs cursor-pointer ${extraButter ? "bg-amber-500/10 border-amber-500 text-amber-500" : (darkMode ? "border-zinc-800" : "border-zinc-200")}`}
                    >
                      <span>🧈 Extra Butter</span>
                      <span className="font-extrabold">+₹20</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    addExactToCart(variantModalItem, { spicyLevel: selectedSpicy, extraCheese, extraButter });
                    setVariantModalItem(null);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart • {settings.currency}{variantModalItem.price + (extraCheese ? 30 : 0) + (extraButter ? 20 : 0)}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HISTORY DRAWER */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className={`w-full max-w-md h-full relative z-10 flex flex-col justify-between border-l ${darkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-orange-50"}`}
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-base font-black flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>{t.history}</span>
                </h3>
                <button onClick={() => setIsHistoryOpen(false)} className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {orderHistory.map((histOrder) => (
                  <div key={histOrder.id} className={`p-4 rounded-2xl border ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-orange-50/20 border-orange-100"}`}>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-mono text-amber-500 font-bold">Token #{histOrder.tokenNumber}</span>
                      <span className="text-zinc-400">{new Date(histOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="space-y-1">
                      {histOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-zinc-300">
                          <span>{item.menuItem.name} x{item.quantity}</span>
                          <span>{settings.currency}{item.menuItem.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-400">Total paid</span>
                      <span className="text-sm font-black text-amber-500">{settings.currency}{histOrder.total}</span>
                    </div>

                    <button
                      onClick={() => handleReorder(histOrder)}
                      className="w-full mt-3 py-2 bg-amber-500 text-black text-xs font-black rounded-xl hover:bg-amber-400 transition-all cursor-pointer"
                    >
                      {t.reorder}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className={`w-full max-w-md h-full relative z-10 flex flex-col justify-between border-l ${darkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-orange-50"}`}
            >
              
              {/* Top Area */}
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-base font-black tracking-tight flex items-center gap-1.5">
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                  <span>{t.cart}</span>
                  <span className="text-xs bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded-full">{cart.length} items</span>
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-4xl mb-3 text-amber-500">🥘</div>
                    <p className="text-sm text-zinc-400 font-bold">{t.emptyCart}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {cart.map((item, index) => {
                        let price = item.menuItem.price;
                        if (item.selectedVariants?.extraCheese) price += 30;
                        if (item.selectedVariants?.extraButter) price += 20;

                        return (
                          <div 
                            key={index}
                            className={`p-3 rounded-2xl border flex gap-3 ${darkMode ? "bg-zinc-900/60 border-zinc-800" : "bg-orange-50/10 border-orange-100"}`}
                          >
                            <img src={item.menuItem.image} alt={item.menuItem.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-extrabold truncate">{item.menuItem.name}</h5>
                              
                              {/* Display Customizations */}
                              {item.selectedVariants && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.selectedVariants.spicyLevel && (
                                    <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">Spicy: {item.selectedVariants.spicyLevel}</span>
                                  )}
                                  {item.selectedVariants.extraCheese && (
                                    <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">🧀 Extra Cheese</span>
                                  )}
                                  {item.selectedVariants.extraButter && (
                                    <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">🧈 Extra Butter</span>
                                  )}
                                </div>
                              )}

                              <p className="text-xs text-amber-500 font-black mt-2">{settings.currency}{price}</p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex flex-col items-end justify-between">
                              <button 
                                onClick={() => updateCartQuantity(index, -item.quantity)}
                                className="text-zinc-500 hover:text-red-500 p-0.5 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="flex items-center gap-2 bg-zinc-800/40 p-1 rounded-lg border border-zinc-800">
                                <button 
                                  onClick={() => updateCartQuantity(index, -1)}
                                  className="text-zinc-400 p-1 hover:text-white"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateCartQuantity(index, 1)}
                                  className="text-zinc-400 p-1 hover:text-white"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Special Instructions */}
                    <div className="pt-4 border-t border-dashed border-zinc-800/80 space-y-1.5">
                      <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">{t.instructions}</label>
                      <textarea
                        id="textarea-special-instructions"
                        placeholder={t.instructionsPlaceholder}
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        rows={2}
                        className={`w-full p-3 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-200" : "bg-white border-orange-100 text-zinc-800"}`}
                      />
                    </div>

                    {/* Promocode Coupon Section */}
                    <div className="pt-4 border-t border-dashed border-zinc-800/80 space-y-2">
                      <label className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">{t.promoCode}</label>
                      <div className="flex gap-2">
                        <input 
                          id="input-coupon-code"
                          type="text" 
                          placeholder="e.g. AISHKARO, FESTIVE50"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className={`flex-1 px-3 py-2 text-xs rounded-xl border focus:outline-none uppercase ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-orange-100"}`}
                        />
                        <button
                          id="btn-apply-coupon"
                          onClick={applyCoupon}
                          className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-black cursor-pointer"
                        >
                          {t.apply}
                        </button>
                      </div>
                      {couponError && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {couponError}</p>}
                      {couponSuccess && <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {couponSuccess}</p>}
                      {activeCoupon && (
                        <div className="flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl">
                          <span className="font-bold text-emerald-500">Active Coupon: {activeCoupon.code}</span>
                          <button onClick={() => { setActiveCoupon(null); setCouponCode(""); }} className="text-emerald-500 hover:text-white font-extrabold text-[10px] uppercase">Remove</button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Totals */}
              {cart.length > 0 && (
                <div className={`p-5 border-t border-zinc-800/80 space-y-4 ${darkMode ? "bg-zinc-950" : "bg-zinc-50"}`}>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>{t.subtotal}</span>
                      <span>{settings.currency}{getSubtotal()}</span>
                    </div>
                    {activeCoupon && (
                      <div className="flex justify-between text-xs text-emerald-500 font-bold">
                        <span>{t.discount} ({activeCoupon.code})</span>
                        <span>-{settings.currency}{getDiscountAmount()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>{t.gst} ({settings.gstPercentage}%)</span>
                      <span>{settings.currency}{getGST()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>{t.serviceCharge} ({settings.serviceChargePercentage}%)</span>
                      <span>{settings.currency}{getServiceCharge()}</span>
                    </div>
                    <div className="flex justify-between text-base font-black border-t border-dashed border-zinc-800 pt-3 text-amber-500">
                      <span>{t.total}</span>
                      <span>{settings.currency}{getGrandTotal()}</span>
                    </div>
                  </div>

                  <button
                    id="btn-go-checkout"
                    onClick={() => {
                      setCheckoutStep('confirm_table');
                      setIsCheckoutOpen(true);
                      setIsCartOpen(false);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
                  >
                    <span>{t.checkout}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHECKOUT FLOW MODAL & LIVE TRACKER */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg rounded-3xl overflow-hidden relative z-10 border max-h-[90vh] overflow-y-auto ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-orange-50 text-zinc-800"}`}
            >
              
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6">
                
                {/* STEP 1: CONFIRM TABLE NUMBER */}
                {checkoutStep === 'confirm_table' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex p-3 bg-amber-500/10 text-amber-500 rounded-full mb-3">
                        <Utensils className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-black tracking-tight">{t.confirmTable}</h3>
                      <p className="text-xs text-zinc-400 mt-1">Please confirm you are seated at Table {tableNumber}</p>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => {
                          const n = Math.max(1, tableNumber - 1);
                          onTableChange(n);
                        }}
                        className="p-3 bg-zinc-800/40 rounded-xl text-white font-extrabold border border-zinc-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-4xl font-black text-amber-500">{tableNumber}</span>
                      <button
                        onClick={() => {
                          onTableChange(tableNumber + 1);
                        }}
                        className="p-3 bg-zinc-800/40 rounded-xl text-white font-extrabold border border-zinc-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      id="btn-checkout-table-confirm"
                      onClick={() => setCheckoutStep('payment_method')}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-2xl font-black text-xs cursor-pointer"
                    >
                      Confirm Table
                    </button>
                  </div>
                )}

                {/* STEP 2: CHOOSE PAYMENT METHOD */}
                {checkoutStep === 'payment_method' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-black tracking-tight">{t.paymentMethod}</h3>
                      <p className="text-xs text-zinc-400 mt-1">Total Amount: <span className="text-amber-500 font-extrabold text-sm">{settings.currency}{getGrandTotal()}</span></p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      
                      {/* Pay Now Online */}
                      <button
                        id="btn-pay-now-gateway"
                        onClick={() => setCheckoutStep('online_processing')}
                        className={`p-4 rounded-2xl flex items-center justify-between border text-left cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 ${darkMode ? "bg-zinc-950 border-zinc-800" : "bg-orange-50/10 border-orange-100"}`}
                      >
                        <div>
                          <h4 className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
                            <span>💳</span> {t.payNow}
                          </h4>
                          <p className="text-[10px] text-zinc-400 mt-1">Instantly pay via UPI, Card, Net Banking or Wallet</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      </button>

                      {/* Pay Later at Counter */}
                      <button
                        id="btn-pay-later-counter"
                        onClick={() => handlePlaceOrder('pay_later')}
                        className={`p-4 rounded-2xl flex items-center justify-between border text-left cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 ${darkMode ? "bg-zinc-950 border-zinc-800" : "bg-orange-50/10 border-orange-100"}`}
                      >
                        <div>
                          <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
                            <span>🧾</span> {t.payLater}
                          </h4>
                          <p className="text-[10px] text-zinc-400 mt-1">Place order immediately and settle bill at counter before leaving</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      </button>

                    </div>
                  </div>
                )}

                {/* STEP 3: MOCK ONLINE PAYMENT GATEWAY */}
                {checkoutStep === 'online_processing' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex p-2 bg-amber-500/10 text-amber-500 rounded-full mb-2">
                        <LockIcon />
                      </div>
                      <h3 className="text-base font-black tracking-tight">{t.simulatedPayment}</h3>
                      <p className="text-xs text-zinc-400">Total: <span className="font-extrabold text-amber-500">{settings.currency}{getGrandTotal()}</span></p>
                    </div>

                    {/* Standard Mock Options */}
                    <div className="space-y-4">
                      
                      {/* Card fields */}
                      <div className={`p-4 rounded-2xl border space-y-3 ${darkMode ? "bg-zinc-950 border-zinc-800" : "bg-zinc-100"}`}>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Credit / Debit Card</label>
                        <input type="text" placeholder="Card Number (XXXX-XXXX-XXXX-XXXX)" className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white" disabled value="4111 2222 3333 4444" />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="Expiry MM/YY" className="px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white" disabled value="12/28" />
                          <input type="password" placeholder="CVV" className="px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white" disabled value="123" />
                        </div>
                      </div>

                      {/* Mock UPI app options */}
                      <div className="flex gap-2 justify-center py-2">
                        {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(upi => (
                          <span key={upi} className="px-3 py-1.5 rounded-full border border-zinc-800 text-[10px] font-bold text-zinc-300 font-mono bg-zinc-950">{upi}</span>
                        ))}
                      </div>

                      <button
                        id="btn-submit-mock-payment"
                        onClick={async () => {
                          const soundAlert = document.createElement("div");
                          soundAlert.className = "fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 animate-bounce";
                          soundAlert.innerHTML = `<span>💳</span> ${t.paymentSuccess}`;
                          document.body.appendChild(soundAlert);
                          setTimeout(() => soundAlert.remove(), 2500);

                          handlePlaceOrder('pay_now', { method: 'card', transactionId: `txn_mock_${Date.now()}` });
                        }}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Confirm and Pay {settings.currency}{getGrandTotal()}</span>
                      </button>

                    </div>
                  </div>
                )}

                {/* STEP 4: ORDER CONFIRMATION & LIVE TRACKING SCREEN */}
                {checkoutStep === 'success' && trackedOrder && (
                  <div className="space-y-6 py-4">
                    
                    {/* Confirmation Check Animation */}
                    <div className="text-center">
                      <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-500 rounded-full mb-3 animate-pulse">
                        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                      </div>
                      <h3 className="text-xl font-black tracking-tight text-emerald-500">{t.orderConfirmed}</h3>
                      <p className="text-xs text-zinc-400 mt-1">Table {trackedOrder.tableNumber} • Token #{trackedOrder.tokenNumber}</p>
                    </div>

                    {/* Progress details */}
                    <div className={`p-5 rounded-2xl border space-y-4 ${darkMode ? "bg-zinc-950 border-zinc-800" : "bg-orange-50/20 border-orange-100"}`}>
                      
                      {/* Active Token vs Serving Token */}
                      <div className="grid grid-cols-2 gap-4 text-center divide-x divide-zinc-800">
                        <div>
                          <p className="text-[10px] uppercase text-zinc-400 font-mono tracking-wider">{t.tokenNum}</p>
                          <h4 className="text-2xl font-black text-amber-500">#{trackedOrder.tokenNumber}</h4>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-zinc-400 font-mono tracking-wider">{t.nowServing}</p>
                          <h4 className="text-2xl font-black text-zinc-300">#{nowServingToken}</h4>
                        </div>
                      </div>

                      {/* Estimated Waiting Time details */}
                      <div className="pt-3 border-t border-dashed border-zinc-800/80 flex justify-between text-xs items-center">
                        <span className="text-zinc-400">{t.waitingTime}</span>
                        <span className="font-extrabold text-amber-500">{trackedOrder.estimatedTime} Minutes</span>
                      </div>

                      {ordersAhead > 0 && (
                        <div className="flex justify-between text-xs text-zinc-400 pt-1">
                          <span>{t.ordersAhead}</span>
                          <span className="font-bold">{ordersAhead}</span>
                        </div>
                      )}

                    </div>

                    {/* Order Progress Flow */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Preparation Progress</h4>
                      
                      {/* Visual progress bar bar */}
                      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-amber-500 rounded-full transition-all duration-1000"
                          style={{
                            width: trackedOrder.status === 'pending_payment' ? '15%' :
                                   trackedOrder.status === 'accepted' ? '30%' :
                                   trackedOrder.status === 'preparing' ? '60%' :
                                   trackedOrder.status === 'ready' ? '85%' : '100%'
                          }}
                        ></div>
                      </div>

                      {/* Status checklist */}
                      <div className="grid grid-cols-4 text-center text-[10px] font-bold gap-1 text-zinc-400">
                        <span className={trackedOrder.status !== 'pending_payment' ? 'text-amber-500' : ''}>Accepted</span>
                        <span className={['preparing', 'ready', 'served', 'completed'].includes(trackedOrder.status) ? 'text-amber-500' : ''}>Preparing</span>
                        <span className={['ready', 'served', 'completed'].includes(trackedOrder.status) ? 'text-amber-500' : ''}>Ready</span>
                        <span className={['served', 'completed'].includes(trackedOrder.status) ? 'text-emerald-500' : ''}>Served</span>
                      </div>
                    </div>

                    {/* Feedback triggers */}
                    {['served', 'completed'].includes(trackedOrder.status) && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex flex-col items-center text-center gap-2">
                        <h5 className="text-xs font-extrabold text-amber-500">Delicious Experience?</h5>
                        <p className="text-[10px] text-zinc-300">We would love to hear your feedback on our service.</p>
                        <button
                          onClick={() => {
                            setIsCheckoutOpen(false);
                            setShowFeedbackModal(true);
                          }}
                          className="bg-amber-500 text-black px-4 py-1.5 rounded-full text-xs font-extrabold hover:bg-amber-400 cursor-pointer"
                        >
                          {t.feedback}
                        </button>
                      </div>
                    )}

                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOMER FEEDBACK MODAL */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFeedbackModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-sm rounded-3xl p-6 relative z-10 border ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-orange-50"}`}
            >
              
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl mb-1">🍰</div>
                  <h3 className="text-base font-black tracking-tight">{t.feedback}</h3>
                  <p className="text-xs text-zinc-400">{t.rating}</p>
                </div>

                {/* Rating selection */}
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 hover:scale-110 transition-all text-amber-500 cursor-pointer"
                    >
                      <Star className={`w-7 h-7 ${feedbackRating >= star ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>

                {/* Tip option buttons */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">{t.tip}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 20, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setTipAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${tipAmount === amt ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/10" : (darkMode ? "border-zinc-800 hover:bg-zinc-800" : "border-orange-50")}`}
                      >
                        {amt === 0 ? "No Tip" : `₹${amt}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments fields */}
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Your Name (Optional)"
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 ${darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-200"}`}
                  />
                  <textarea
                    placeholder="Share your dining experience with us..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={3}
                    className={`w-full p-3 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${darkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-200"}`}
                  />
                </div>

                {feedbackSubmitted ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center text-emerald-500 font-bold text-xs">
                    🎉 Feedback submitted! Thank you so much!
                  </div>
                ) : (
                  <button
                    onClick={handleFeedbackSubmit}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-2xl font-black text-xs transition-all cursor-pointer"
                  >
                    {t.submit}
                  </button>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Simple Lock Icon replacement
function LockIcon() {
  return (
    <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
