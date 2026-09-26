import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ClipboardCheck,
  ScrollText,
  Warehouse,
  Search,
  Bell,
  Plus,
  AlertTriangle,
  TrendingUp,
  Boxes,
  Truck,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from "lucide-react";
import "./App.css";

const initialProducts = [
  {
    id: 1,
    name: "Steel Rods",
    sku: "ST-001",
    category: "Raw Material",
    unit: "kg",
    warehouse: "Main Warehouse",
    location: "Rack A",
    stock: 120,
    reorder: 50,
  },
  {
    id: 2,
    name: "Copper Wire",
    sku: "CW-102",
    category: "Electrical",
    unit: "kg",
    warehouse: "Main Warehouse",
    location: "Rack B",
    stock: 18,
    reorder: 30,
  },
  {
    id: 3,
    name: "Industrial Bolts",
    sku: "BL-205",
    category: "Hardware",
    unit: "pcs",
    warehouse: "Warehouse 2",
    location: "Rack C",
    stock: 420,
    reorder: 100,
  },
  {
    id: 4,
    name: "Aluminium Sheets",
    sku: "AL-301",
    category: "Raw Material",
    unit: "pcs",
    warehouse: "Warehouse 2",
    location: "Rack A",
    stock: 65,
    reorder: 40,
  },
];

const initialLedger = [
  {
    id: 1,
    product: "Steel Rods",
    type: "Receipt",
    quantity: "+50",
    location: "Main Warehouse",
    time: "09:42 AM",
  },
  {
    id: 2,
    product: "Copper Wire",
    type: "Delivery",
    quantity: "-12",
    location: "Main Warehouse",
    time: "10:18 AM",
  },
  {
    id: 3,
    product: "Industrial Bolts",
    type: "Transfer",
    quantity: "40 → W2",
    location: "Warehouse 2",
    time: "11:06 AM",
  },
  {
    id: 4,
    product: "Steel Rods",
    type: "Adjustment",
    quantity: "-3",
    location: "Rack A",
    time: "12:30 PM",
  },
];

const locationOptions = [
  "Main Warehouse · Rack A",
  "Main Warehouse · Rack B",
  "Warehouse 2 · Rack A",
  "Warehouse 2 · Rack C",
  "Production Floor",
];

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("stocksense_current_user")) || null
      );
    } catch {
      return null;
    }
  });

  const [activePage, setActivePage] = useState("Dashboard");
  const [products, setProducts] = useState(initialProducts);
  const [ledger, setLedger] = useState(initialLedger);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scheduledTransfers] = useState(6);

  const lowStock = products.filter((p) => p.stock <= p.reorder);

  const totalStock = products.reduce(
    (sum, p) => sum + p.stock,
    0
  );

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Products", icon: Package },
    { name: "Receipts", icon: ArrowDownToLine },
    { name: "Deliveries", icon: ArrowUpFromLine },
    { name: "Transfers", icon: ArrowLeftRight },
    { name: "Adjustments", icon: ClipboardCheck },
    { name: "Stock Ledger", icon: ScrollText },
    { name: "Warehouses", icon: Warehouse },
  ];

  function handleLogin(user) {
    setCurrentUser(user);

    localStorage.setItem(
      "stocksense_current_user",
      JSON.stringify(user)
    );

    setActivePage("Dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("stocksense_current_user");
    setCurrentUser(null);
  }

  function addLedgerEntry(
    product,
    type,
    quantity,
    location
  ) {
    setLedger((current) => [
      {
        id: Date.now() + Math.random(),
        product: product.name,
        type,
        quantity,
        location,
        time: "Just now",
      },
      ...current,
    ]);
  }

  function receiveStock(productId, quantity) {
    const amount = Number(quantity);

    if (!amount || amount <= 0) {
      return;
    }

    const product = products.find(
      (p) => p.id === productId
    );

    if (!product) {
      return;
    }

    setProducts((current) =>
      current.map((p) =>
        p.id === productId
          ? {
              ...p,
              stock: p.stock + amount,
            }
          : p
      )
    );

    addLedgerEntry(
      product,
      "Receipt",
      `+${amount}`,
      product.warehouse
    );
  }

  function deliverStock(productId, quantity) {
    const amount = Number(quantity);

    if (!amount || amount <= 0) {
      return;
    }

    const product = products.find(
      (p) => p.id === productId
    );

    if (!product) {
      return;
    }

    if (amount > product.stock) {
      window.alert(
        `Only ${product.stock} ${product.unit} is available.`
      );
      return;
    }

    setProducts((current) =>
      current.map((p) =>
        p.id === productId
          ? {
              ...p,
              stock: p.stock - amount,
            }
          : p
      )
    );

    addLedgerEntry(
      product,
      "Delivery",
      `-${amount}`,
      product.warehouse
    );
  }

  function transferStock(
    productId,
    quantity,
    toLocation
  ) {
    const amount = Number(quantity);

    const product = products.find(
      (p) => p.id === productId
    );

    if (!product) {
      return false;
    }

    if (!amount || amount <= 0) {
      window.alert(
        "Enter a valid transfer quantity."
      );
      return false;
    }

    if (amount > product.stock) {
      window.alert(
        `Only ${product.stock} ${product.unit} is available.`
      );
      return false;
    }

    const [warehouse, location] =
      toLocation.split(" · ");

    setProducts((current) =>
      current.map((p) =>
        p.id === productId
          ? {
              ...p,
              warehouse:
                warehouse || p.warehouse,
              location:
                location || toLocation,
            }
          : p
      )
    );

    addLedgerEntry(
      product,
      "Transfer",
      `${amount} → ${
        location || toLocation
      }`,
      `${warehouse || product.warehouse} · ${
        location || toLocation
      }`
    );

    return true;
  }

  function applyAdjustment(
    productId,
    countedQuantity
  ) {
    const counted = Number(countedQuantity);

    const product = products.find(
      (p) => p.id === productId
    );

    if (!product) {
      return false;
    }

    if (
      !Number.isFinite(counted) ||
      counted < 0
    ) {
      window.alert(
        "Enter a valid physical count."
      );
      return false;
    }

    const difference =
      counted - product.stock;

    if (difference === 0) {
      window.alert(
        "No adjustment is required."
      );
      return false;
    }

    setProducts((current) =>
      current.map((p) =>
        p.id === productId
          ? {
              ...p,
              stock: counted,
            }
          : p
      )
    );

    addLedgerEntry(
      product,
      "Adjustment",
      `${difference > 0 ? "+" : ""}${difference}`,
      product.warehouse
    );

    return true;
  }

  function addProduct(productData) {
    const newProduct = {
      id: Date.now(),
      name: productData.name.trim(),
      sku: productData.sku.trim(),
      category:
        productData.category.trim() ||
        "General",
      unit:
        productData.unit.trim() ||
        "pcs",
      warehouse:
        productData.warehouse.trim() ||
        "Main Warehouse",
      location:
        productData.location.trim() ||
        "Rack A",
      stock:
        Number(productData.stock) || 0,
      reorder:
        Number(productData.reorder) || 0,
    };

    if (
      !newProduct.name ||
      !newProduct.sku
    ) {
      window.alert(
        "Product name and SKU are required."
      );
      return false;
    }

    if (
      products.some(
        (p) =>
          p.sku.toLowerCase() ===
          newProduct.sku.toLowerCase()
      )
    ) {
      window.alert(
        "SKU already exists."
      );
      return false;
    }

    setProducts((current) => [
      ...current,
      newProduct,
    ]);

    if (newProduct.stock > 0) {
      addLedgerEntry(
        newProduct,
        "Receipt",
        `+${newProduct.stock}`,
        newProduct.warehouse
      );
    }

    return true;
  }

  function renderPage() {
    switch (activePage) {
      case "Products":
        return (
          <ProductsPage
            products={products}
            search={search}
            setSearch={setSearch}
            onAddProduct={addProduct}
          />
        );

      case "Receipts":
        return (
          <OperationsPage
            title="Receipts"
            subtitle="Manage incoming goods from vendors"
            products={products}
            action="Receive"
            onAction={receiveStock}
          />
        );

      case "Deliveries":
        return (
          <OperationsPage
            title="Delivery Orders"
            subtitle="Manage outgoing stock and customer shipments"
            products={products}
            action="Deliver"
            onAction={deliverStock}
          />
        );

      case "Transfers":
        return (
          <TransfersPage
            products={products}
            onTransfer={transferStock}
          />
        );

      case "Adjustments":
        return (
          <AdjustmentsPage
            products={products}
            onAdjustment={applyAdjustment}
          />
        );

      case "Stock Ledger":
        return (
          <LedgerPage ledger={ledger} />
        );

      case "Warehouses":
        return (
          <WarehousesPage
            products={products}
          />
        );

      default:
        return (
          <Dashboard
            products={products}
            ledger={ledger}
            totalStock={totalStock}
            lowStock={lowStock}
            scheduledTransfers={
              scheduledTransfers
            }
          />
        );
    }
  }

  if (!currentUser) {
    return (
      <AuthPage onLogin={handleLogin} />
    );
  }

  const initials = currentUser.name
    ? currentUser.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <div className="app">
      <aside
        className={`sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="brand">
          <div className="brand-mark">
            S
          </div>

          <div>
            <h1>StockSense</h1>
            <span>
              Inventory Intelligence
            </span>
          </div>

          <button
            className="close-sidebar"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace">
          <span>WORKSPACE</span>
          <strong>
            Main Organization
          </strong>
        </div>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setActivePage(
                    item.name
                  );
                  setSidebarOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot"></span>

            <div>
              <strong>
                System Online
              </strong>

              <small>
                Inventory synced
              </small>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <main className="main">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            <span>Inventory</span>
            <ChevronRight size={15} />
            <strong>
              {activePage}
            </strong>
          </div>

          <div className="top-actions">
            <button className="icon-button notification">
              <Bell size={19} />

              {lowStock.length > 0 && (
                <span className="notification-dot" />
              )}
            </button>

            <div className="user">
              <div className="avatar">
                {initials}
              </div>

              <div className="user-info">
                <strong>
                  {currentUser.name}
                </strong>

                <span>
                  {currentUser.role ||
                    "Inventory Manager"}
                </span>
              </div>
            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>

        <div className="content">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

function AuthPage({ onLogin }) {
  const [mode, setMode] =
    useState("login");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  function getUsers() {
    try {
      return (
        JSON.parse(
          localStorage.getItem(
            "stocksense_users"
          )
        ) || []
      );
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(
      "stocksense_users",
      JSON.stringify(users)
    );
  }

  function resetMessages() {
    setError("");
    setMessage("");
  }

  function switchMode(nextMode) {
    resetMessages();
    setMode(nextMode);
    setPassword("");
    setOtp("");
    setNewPassword("");
  }

  function submitLogin(e) {
    e.preventDefault();
    resetMessages();

    const users = getUsers();

    const user = users.find(
      (item) =>
        item.email.toLowerCase() ===
          email
            .trim()
            .toLowerCase() &&
        item.password === password
    );

    if (!user) {
      setError(
        "Invalid email or password."
      );
      return;
    }

    onLogin(user);
  }

  function submitSignup(e) {
    e.preventDefault();
    resetMessages();

    if (
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      setError(
        "Please fill in all required fields."
      );
      return;
    }

    const users = getUsers();

    if (
      users.some(
        (item) =>
          item.email.toLowerCase() ===
          email
            .trim()
            .toLowerCase()
      )
    ) {
      setError(
        "An account with this email already exists."
      );
      return;
    }

    const user = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      password,
      role: "Inventory Manager",
    };

    saveUsers([
      ...users,
      user,
    ]);

    onLogin(user);
  }

  function requestOtp(e) {
    e.preventDefault();
    resetMessages();

    const users = getUsers();

    const exists = users.some(
      (item) =>
        item.email.toLowerCase() ===
        email
          .trim()
          .toLowerCase()
    );

    if (!exists) {
      setError(
        "No account was found with this email."
      );
      return;
    }

    sessionStorage.setItem(
      "stocksense_demo_otp",
      "123456"
    );

    setMessage(
      "Demo OTP generated. Use 123456 to continue."
    );

    setMode("reset");
  }

  function resetPassword(e) {
    e.preventDefault();
    resetMessages();

    const savedOtp =
      sessionStorage.getItem(
        "stocksense_demo_otp"
      );

    if (otp !== savedOtp) {
      setError("Invalid OTP.");
      return;
    }

    if (
      !newPassword ||
      newPassword.length < 6
    ) {
      setError(
        "New password must contain at least 6 characters."
      );
      return;
    }

    const users = getUsers();

    const updatedUsers = users.map(
      (item) =>
        item.email.toLowerCase() ===
        email
          .trim()
          .toLowerCase()
          ? {
              ...item,
              password: newPassword,
            }
          : item
    );

    saveUsers(updatedUsers);

    sessionStorage.removeItem(
      "stocksense_demo_otp"
    );

    setPassword("");
    setNewPassword("");
    setOtp("");

    setMessage(
      "Password reset successfully. You can now log in."
    );

    setMode("login");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            S
          </div>

          <div>
            <h1>StockSense</h1>
            <span>
              Inventory Intelligence
            </span>
          </div>
        </div>

        <div className="auth-heading">
          <h2>
            {mode === "login"
              ? "Welcome back"
              : mode === "signup"
              ? "Create your account"
              : mode === "forgot"
              ? "Reset your password"
              : "Verify OTP"}
          </h2>

          <p>
            {mode === "login"
              ? "Sign in to manage your inventory."
              : mode === "signup"
              ? "Set up your Inventory Manager account."
              : mode === "forgot"
              ? "Enter your registered email to receive an OTP."
              : "Enter the OTP and choose a new password."}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {message && (
          <div className="auth-success">
            {message}
          </div>
        )}

        {mode === "login" && (
          <form
            className="auth-form"
            onSubmit={submitLogin}
          >
            <FormField label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                required
              />
            </FormField>

            <FormField label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                required
              />
            </FormField>

            <button
              className="auth-submit"
              type="submit"
            >
              Sign In
            </button>

            <button
              className="auth-link"
              type="button"
              onClick={() =>
                switchMode("forgot")
              }
            >
              Forgot password?
            </button>
          </form>
        )}

        {mode === "signup" && (
          <form
            className="auth-form"
            onSubmit={submitSignup}
          >
            <FormField label="Full Name">
              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Your name"
                required
              />
            </FormField>

            <FormField label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                required
              />
            </FormField>

            <FormField label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </FormField>

            <button
              className="auth-submit"
              type="submit"
            >
              Create Account
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form
            className="auth-form"
            onSubmit={requestOtp}
          >
            <FormField label="Registered Email">
              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                required
              />
            </FormField>

            <button
              className="auth-submit"
              type="submit"
            >
              Send OTP
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form
            className="auth-form"
            onSubmit={resetPassword}
          >
            <FormField label="OTP">
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value)
                }
                placeholder="Enter OTP"
                required
              />
            </FormField>

            <FormField label="New Password">
              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </FormField>

            <button
              className="auth-submit"
              type="submit"
            >
              Reset Password
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span>or</span>
        </div>

        {mode === "login" ? (
          <button
            className="auth-secondary"
            type="button"
            onClick={() =>
              switchMode("signup")
            }
          >
            Create a new account
          </button>
        ) : (
          <button
            className="auth-secondary"
            type="button"
            onClick={() =>
              switchMode("login")
            }
          >
            Back to login
          </button>
        )}

        {mode === "reset" && (
          <button
            className="auth-link"
            type="button"
            onClick={() =>
              switchMode("forgot")
            }
          >
            Use a different email
          </button>
        )}
      </div>
    </div>
  );
}

function Dashboard({
  products,
  ledger,
  totalStock,
  lowStock,
  scheduledTransfers,
}) {
  return (
    <>
      <PageHeader
        title="Inventory Dashboard"
        subtitle="Real-time overview of your inventory operations."
      />

      <div
        className="kpi-grid"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
        }}
      >
        <KpiCard
          title="Total Stock"
          value={totalStock.toLocaleString()}
          subtitle="Units across warehouses"
          icon={<Boxes />}
          trend="+8.4%"
        />

        <KpiCard
          title="Low Stock"
          value={lowStock.length}
          subtitle="Products need attention"
          icon={<AlertTriangle />}
          danger
        />

        <KpiCard
          title="Pending Receipts"
          value="8"
          subtitle="Awaiting validation"
          icon={<ArrowDownToLine />}
        />

        <KpiCard
          title="Pending Deliveries"
          value="5"
          subtitle="Ready for dispatch"
          icon={<Truck />}
        />

        <KpiCard
          title="Transfers Scheduled"
          value={scheduledTransfers}
          subtitle="Internal movements"
          icon={<ArrowLeftRight />}
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>
                Inventory Overview
              </h2>
              <p>
                Current stock by product
              </p>
            </div>

            <span className="live-badge">
              <span></span> Live
            </span>
          </div>

          <div className="stock-chart">
            {products.map((product) => {
              const percentage =
                Math.min(
                  100,
                  (product.stock /
                    Math.max(
                      product.reorder * 2,
                      100
                    )) *
                    100
                );

              return (
                <div
                  className="stock-row"
                  key={product.id}
                >
                  <div className="stock-label">
                    <div>
                      <strong>
                        {product.name}
                      </strong>

                      <small>
                        {product.sku}
                      </small>
                    </div>

                    <strong>
                      {product.stock}
                    </strong>
                  </div>

                  <div className="bar">
                    <div
                      className={`bar-fill ${
                        product.stock <=
                        product.reorder
                          ? "danger"
                          : ""
                      }`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>
                Low Stock Alerts
              </h2>

              <p>
                Products approaching reorder level
              </p>
            </div>

            <AlertTriangle
              size={20}
              className="warning-icon"
            />
          </div>

          {lowStock.length === 0 ? (
            <div className="empty-state">
              <TrendingUp size={30} />
              <p>
                All inventory levels are healthy.
              </p>
            </div>
          ) : (
            <div className="alert-list">
              {lowStock.map((product) => (
                <div
                  className="alert-item"
                  key={product.id}
                >
                  <div className="alert-icon">
                    <AlertTriangle
                      size={17}
                    />
                  </div>

                  <div className="alert-content">
                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      {product.stock}{" "}
                      {product.unit} remaining
                      · Reorder at{" "}
                      {product.reorder}
                    </span>
                  </div>

                  <span className="small-action">
                    Review
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="panel ledger-preview">
        <div className="panel-header">
          <div>
            <h2>
              Recent Stock Activity
            </h2>

            <p>
              Latest inventory movements
            </p>
          </div>

          <span className="text-button">
            View Ledger →
          </span>
        </div>

        <LedgerTable
          ledger={ledger.slice(0, 5)}
        />
      </section>
    </>
  );
}

function ProductsPage({
  products,
  search,
  setSearch,
  onAddProduct,
}) {
  const [category, setCategory] =
    useState("");

  const [warehouse, setWarehouse] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [newProduct, setNewProduct] =
    useState({
      name: "",
      sku: "",
      category: "Raw Material",
      unit: "pcs",
      warehouse: "Main Warehouse",
      location: "Rack A",
      stock: 0,
      reorder: 0,
    });

  const categories = [
    ...new Set(
      products.map(
        (p) => p.category
      )
    ),
  ];

  const warehouses = [
    ...new Set(
      products.map(
        (p) => p.warehouse
      )
    ),
  ];

  const filtered = products.filter(
    (p) => {
      const matchesSearch =
        p.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        p.sku
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesCategory =
        !category ||
        p.category === category;

      const matchesWarehouse =
        !warehouse ||
        p.warehouse === warehouse;

      const matchesStatus =
        !status ||
        (status === "Low" &&
          p.stock <= p.reorder) ||
        (status === "Healthy" &&
          p.stock > p.reorder);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWarehouse &&
        matchesStatus
      );
    }
  );

  function submitProduct(e) {
    e.preventDefault();

    const added =
      onAddProduct(newProduct);

    if (added) {
      setNewProduct({
        name: "",
        sku: "",
        category: "Raw Material",
        unit: "pcs",
        warehouse: "Main Warehouse",
        location: "Rack A",
        stock: 0,
        reorder: 0,
      });

      setShowForm(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Manage products, stock levels and reorder rules."
        action={
          showForm
            ? "Cancel"
            : "+ Add Product"
        }
        onAction={() =>
          setShowForm(
            (current) => !current
          )
        }
      />

      {showForm && (
        <section
          className="panel"
          style={{
            marginBottom: 20,
          }}
        >
          <div className="panel-header">
            <div>
              <h2>
                Create Product
              </h2>

              <p>
                Add a new product to inventory.
              </p>
            </div>

            <Package size={22} />
          </div>

          <form
            className="form-grid"
            onSubmit={submitProduct}
          >
            <FormField label="Product Name">
              <input
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    name: e.target.value,
                  })
                }
                placeholder="e.g. Steel Plates"
                required
              />
            </FormField>

            <FormField label="SKU / Code">
              <input
                value={newProduct.sku}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    sku: e.target.value,
                  })
                }
                placeholder="e.g. SP-401"
                required
              />
            </FormField>

            <FormField label="Category">
              <input
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    category:
                      e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Unit of Measure">
              <select
                value={newProduct.unit}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    unit: e.target.value,
                  })
                }
              >
                <option>
                  pcs
                </option>
                <option>
                  kg
                </option>
                <option>
                  litre
                </option>
                <option>
                  box
                </option>
                <option>
                  unit
                </option>
              </select>
            </FormField>

            <FormField label="Initial Stock">
              <input
                type="number"
                min="0"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stock:
                      e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Reorder Level">
              <input
                type="number"
                min="0"
                value={
                  newProduct.reorder
                }
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    reorder:
                      e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Warehouse">
              <input
                value={
                  newProduct.warehouse
                }
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    warehouse:
                      e.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Location">
              <input
                value={
                  newProduct.location
                }
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    location:
                      e.target.value,
                  })
                }
              />
            </FormField>

            <button
              className="primary-button"
              type="submit"
            >
              <Plus size={18} />
              Create Product
            </button>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              placeholder="Search products or SKU..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

          <div className="filter-group">
            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
            >
              <option value="">
                All Categories
              </option>

              {categories.map(
                (item) => (
                  <option key={item}>
                    {item}
                  </option>
                )
              )}
            </select>

            <select
              value={warehouse}
              onChange={(e) =>
                setWarehouse(
                  e.target.value
                )
              }
            >
              <option value="">
                All Warehouses
              </option>

              {warehouses.map(
                (item) => (
                  <option key={item}>
                    {item}
                  </option>
                )
              )}
            </select>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
            >
              <option value="">
                Stock Status
              </option>

              <option value="Healthy">
                Healthy
              </option>

              <option value="Low">
                Low Stock
              </option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  Product
                </th>
                <th>SKU</th>
                <th>
                  Category
                </th>
                <th>
                  Location
                </th>
                <th>Stock</th>
                <th>
                  Reorder Level
                </th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length ===
              0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <Package
                        size={28}
                      />

                      <p>
                        No products match the current filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(
                  (product) => (
                    <tr
                      key={
                        product.id
                      }
                    >
                      <td>
                        <div className="product-name">
                          <div className="product-icon">
                            <Package
                              size={17}
                            />
                          </div>

                          <strong>
                            {
                              product.name
                            }
                          </strong>
                        </div>
                      </td>

                      <td className="muted">
                        {
                          product.sku
                        }
                      </td>

                      <td>
                        {
                          product.category
                        }
                      </td>

                      <td>
                        {
                          product.warehouse
                        }

                        <small className="location">
                          {
                            product.location
                          }
                        </small>
                      </td>

                      <td>
                        <strong>
                          {
                            product.stock
                          }
                        </strong>{" "}
                        <span className="muted">
                          {
                            product.unit
                          }
                        </span>
                      </td>

                      <td>
                        {
                          product.reorder
                        }
                      </td>

                      <td>
                        <StatusBadge
                          low={
                            product.stock <=
                            product.reorder
                          }
                        />
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function OperationsPage({
  title,
  subtitle,
  products,
  action,
  onAction,
}) {
  const [quantities, setQuantities] =
    useState(
      Object.fromEntries(
        products.map((p) => [
          p.id,
          10,
        ])
      )
    );

  function submit(product) {
    const amount = Number(
      quantities[product.id]
    );

    if (!amount || amount <= 0) {
      window.alert(
        "Enter a valid quantity."
      );
      return;
    }

    onAction(
      product.id,
      amount
    );
  }

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
      />

      <div className="operation-grid">
        {products.map(
          (product) => (
            <div
              className="operation-card"
              key={product.id}
            >
              <div className="operation-top">
                <div className="product-icon large">
                  <Package
                    size={21}
                  />
                </div>

                <StatusBadge
                  low={
                    product.stock <=
                    product.reorder
                  }
                />
              </div>

              <h3>
                {product.name}
              </h3>

              <span className="sku">
                {product.sku}
              </span>

              <div className="operation-stock">
                <span>
                  Current Stock
                </span>

                <strong>
                  {product.stock}{" "}
                  {product.unit}
                </strong>
              </div>

              <FormField
                label={`${action} Quantity`}
              >
                <input
                  type="number"
                  min="1"
                  value={
                    quantities[
                      product.id
                    ] || ""
                  }
                  onChange={(e) =>
                    setQuantities({
                      ...quantities,
                      [product.id]:
                        e.target.value,
                    })
                  }
                />
              </FormField>

              <button
                className="primary-button full"
                onClick={() =>
                  submit(product)
                }
                style={{
                  marginTop: 14,
                }}
              >
                <Plus size={17} />
                {action} Stock
              </button>
            </div>
          )
        )}
      </div>
    </>
  );
}

function TransfersPage({
  products,
  onTransfer,
}) {
  const [productId, setProductId] =
    useState(
      products[0]?.id || ""
    );

  const [quantity, setQuantity] =
    useState(10);

  const [toLocation, setToLocation] =
    useState(
      locationOptions[2]
    );

  const [message, setMessage] =
    useState("");

  const selectedProduct =
    products.find(
      (p) =>
        p.id === Number(productId)
    );

  function submitTransfer(e) {
    e.preventDefault();
    setMessage("");

    if (!selectedProduct) {
      return;
    }

    if (
      `${selectedProduct.warehouse} · ${selectedProduct.location}` ===
      toLocation
    ) {
      setMessage(
        "Choose a different destination."
      );
      return;
    }

    const success =
      onTransfer(
        productId,
        quantity,
        toLocation
      );

    if (success) {
      setMessage(
        "Transfer completed and added to the stock ledger."
      );
    }
  }

  return (
    <>
      <PageHeader
        title="Internal Transfers"
        subtitle="Move inventory between warehouses and locations."
      />

      <div className="transfer-layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>
                Transfer Stock
              </h2>

              <p>
                Move products between locations
              </p>
            </div>

            <ArrowLeftRight
              size={22}
            />
          </div>

          <form
            onSubmit={
              submitTransfer
            }
          >
            <div className="form-grid">
              <FormField label="Product">
                <select
                  value={productId}
                  onChange={(e) =>
                    setProductId(
                      Number(
                        e.target.value
                      )
                    )
                  }
                >
                  {products.map(
                    (p) => (
                      <option
                        key={p.id}
                        value={p.id}
                      >
                        {p.name} ·{" "}
                        {p.stock}{" "}
                        {p.unit}
                      </option>
                    )
                  )}
                </select>
              </FormField>

              <FormField label="Quantity">
                <input
                  type="number"
                  min="1"
                  max={
                    selectedProduct?.stock ||
                    1
                  }
                  value={
                    quantity
                  }
                  onChange={(e) =>
                    setQuantity(
                      e.target.value
                    )
                  }
                />
              </FormField>

              <FormField label="From Location">
                <input
                  value={
                    selectedProduct
                      ? `${selectedProduct.warehouse} · ${selectedProduct.location}`
                      : ""
                  }
                  readOnly
                />
              </FormField>

              <FormField label="To Location">
                <select
                  value={
                    toLocation
                  }
                  onChange={(e) =>
                    setToLocation(
                      e.target.value
                    )
                  }
                >
                  {locationOptions.map(
                    (location) => (
                      <option
                        key={location}
                      >
                        {location}
                      </option>
                    )
                  )}
                </select>
              </FormField>
            </div>

            <button
              className="primary-button"
              type="submit"
            >
              <ArrowLeftRight
                size={18}
              />
              Confirm Transfer
            </button>
          </form>

          {message && (
            <p
              style={{
                padding:
                  "12px 22px",
                color: "#4f46e5",
                fontSize: 12,
              }}
            >
              {message}
            </p>
          )}
        </section>

        <section className="panel transfer-info">
          <div className="info-icon">
            <ArrowLeftRight
              size={25}
            />
          </div>

          <h2>
            Transfer tracking
          </h2>

          <p>
            Every internal movement is
            recorded in the stock ledger
            so inventory remains traceable
            across locations.
          </p>

          <div className="transfer-stat">
            <span>
              Scheduled Transfers
            </span>

            <strong>
              6
            </strong>
          </div>
        </section>
      </div>
    </>
  );
}

function AdjustmentsPage({
  products,
  onAdjustment,
}) {
  const [counts, setCounts] =
    useState(
      Object.fromEntries(
        products.map((p) => [
          p.id,
          p.stock,
        ])
      )
    );

  const [applied, setApplied] =
    useState({});

  function updateCount(
    productId,
    value
  ) {
    setCounts((current) => ({
      ...current,
      [productId]: value,
    }));
  }

  function apply(product) {
    const success =
      onAdjustment(
        product.id,
        counts[product.id]
      );

    if (success) {
      setApplied(
        (current) => ({
          ...current,
          [product.id]:
            true,
        })
      );
    }
  }

  return (
    <>
      <PageHeader
        title="Stock Adjustments"
        subtitle="Correct inventory mismatches after physical counting."
      />

      <section className="panel adjustment-panel">
        <div className="panel-header">
          <div>
            <h2>
              Inventory Count
            </h2>

            <p>
              Update recorded stock to match physical stock.
            </p>
          </div>

          <ClipboardCheck
            size={22}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  Product
                </th>

                <th>
                  Location
                </th>

                <th>
                  Recorded
                </th>

                <th>
                  Physical Count
                </th>

                <th>
                  Difference
                </th>

                <th>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map(
                (product) => {
                  const counted =
                    Number(
                      counts[
                        product.id
                      ]
                    );

                  const difference =
                    Number.isFinite(
                      counted
                    )
                      ? counted -
                        product.stock
                      : 0;

                  return (
                    <tr
                      key={
                        product.id
                      }
                    >
                      <td>
                        <strong>
                          {
                            product.name
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          product.warehouse
                        }{" "}
                        ·{" "}
                        {
                          product.location
                        }
                      </td>

                      <td>
                        {
                          product.stock
                        }
                      </td>

                      <td>
                        <input
                          className="table-input"
                          type="number"
                          min="0"
                          value={
                            counts[
                              product.id
                            ]
                          }
                          onChange={(e) =>
                            updateCount(
                              product.id,
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <span className="difference">
                          {difference >
                          0
                            ? "+"
                            : ""}
                          {
                            difference
                          }
                        </span>
                      </td>

                      <td>
                        <button
                          className="small-action"
                          onClick={() =>
                            apply(
                              product
                            )
                          }
                        >
                          {applied[
                            product.id
                          ]
                            ? "Applied"
                            : "Apply"}
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function LedgerPage({
  ledger,
}) {
  const [search, setSearch] =
    useState("");

  const [operation, setOperation] =
    useState("");

  const filtered =
    ledger.filter((item) => {
      const text =
        `${item.product} ${item.location} ${item.type}`.toLowerCase();

      return (
        text.includes(
          search.toLowerCase()
        ) &&
        (!operation ||
          item.type === operation)
      );
    });

  return (
    <>
      <PageHeader
        title="Stock Ledger"
        subtitle="Complete history of inventory movements."
      />

      <section className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              placeholder="Search ledger..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

          <div className="filter-group">
            <select
              value={operation}
              onChange={(e) =>
                setOperation(
                  e.target.value
                )
              }
            >
              <option value="">
                All Operations
              </option>

              <option value="Receipt">
                Receipts
              </option>

              <option value="Delivery">
                Deliveries
              </option>

              <option value="Transfer">
                Transfers
              </option>

              <option value="Adjustment">
                Adjustments
              </option>
            </select>
          </div>
        </div>

        <LedgerTable
          ledger={filtered}
        />
      </section>
    </>
  );
}

function WarehousesPage({
  products,
}) {
  const warehouses = [
    ...new Set(
      products.map(
        (p) => p.warehouse
      )
    ),
  ];

  return (
    <>
      <PageHeader
        title="Warehouses"
        subtitle="Monitor inventory across storage locations."
        action="+ Add Warehouse"
      />

      <div className="warehouse-grid">
        {warehouses.map(
          (warehouse, index) => {
            const warehouseProducts =
              products.filter(
                (p) =>
                  p.warehouse ===
                  warehouse
              );

            const total =
              warehouseProducts.reduce(
                (sum, p) =>
                  sum + p.stock,
                0
              );

            return (
              <div
                className="warehouse-card"
                key={warehouse}
              >
                <div className="warehouse-icon">
                  <Warehouse
                    size={24}
                  />
                </div>

                <span>
                  WAREHOUSE{" "}
                  {index + 1}
                </span>

                <h2>
                  {warehouse}
                </h2>

                <div className="warehouse-stat">
                  <span>
                    Total Stock
                  </span>

                  <strong>
                    {total}
                  </strong>
                </div>

                <div className="warehouse-stat">
                  <span>
                    Products
                  </span>

                  <strong>
                    {
                      warehouseProducts.length
                    }
                  </strong>
                </div>

                <button className="secondary-button">
                  View Inventory
                </button>
              </div>
            );
          }
        )}
      </div>
    </>
  );
}

function LedgerTable({
  ledger,
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>
              Product
            </th>

            <th>
              Operation
            </th>

            <th>
              Quantity
            </th>

            <th>
              Location
            </th>

            <th>
              Time
            </th>
          </tr>
        </thead>

        <tbody>
          {ledger.length ===
          0 ? (
            <tr>
              <td colSpan="5">
                <div className="empty-state">
                  <ScrollText
                    size={28}
                  />

                  <p>
                    No ledger entries found.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            ledger.map(
              (item) => (
                <tr
                  key={
                    item.id
                  }
                >
                  <td>
                    <strong>
                      {
                        item.product
                      }
                    </strong>
                  </td>

                  <td>
                    <OperationBadge
                      type={
                        item.type
                      }
                    />
                  </td>

                  <td>
                    <strong
                      className={
                        item.quantity.startsWith(
                          "-"
                        )
                          ? "negative"
                          : "positive"
                      }
                    >
                      {
                        item.quantity
                      }
                    </strong>
                  </td>

                  <td>
                    {
                      item.location
                    }
                  </td>

                  <td className="muted">
                    {
                      item.time
                    }
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function PageHeader({
  title,
  subtitle,
  action,
  onAction,
}) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">
          INVENTORY MANAGEMENT
        </div>

        <h1>{title}</h1>

        <p>{subtitle}</p>
      </div>

      {action && (
        <button
          className="primary-button"
          onClick={onAction}
        >
          <Plus size={18} />
          {action.replace(
            "+ ",
            ""
          )}
        </button>
      )}
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  danger,
}) {
  return (
    <div className="kpi-card">
      <div
        className={`kpi-icon ${
          danger
            ? "danger-bg"
            : ""
        }`}
      >
        {icon}
      </div>

      <div className="kpi-info">
        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {subtitle}
        </small>
      </div>

      {trend && (
        <span className="trend">
          {trend}
        </span>
      )}
    </div>
  );
}

function StatusBadge({
  low,
}) {
  return (
    <span
      className={`status-badge ${
        low
          ? "low"
          : "healthy"
      }`}
    >
      <span></span>

      {low
        ? "Low Stock"
        : "Healthy"}
    </span>
  );
}

function OperationBadge({
  type,
}) {
  const classes = {
    Receipt: "receipt",
    Delivery: "delivery",
    Transfer: "transfer",
    Adjustment:
      "adjustment",
  };

  return (
    <span
      className={`operation-badge ${
        classes[type] || ""
      }`}
    >
      {type}
    </span>
  );
}

function FormField({
  label,
  children,
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default App;