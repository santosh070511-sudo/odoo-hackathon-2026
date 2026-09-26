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

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [products, setProducts] = useState(initialProducts);
  const [ledger, setLedger] = useState(initialLedger);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const lowStock = products.filter((p) => p.stock <= p.reorder);

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

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

  function receiveStock(productId, quantity) {
    setProducts((current) =>
      current.map((p) =>
        p.id === productId
          ? { ...p, stock: p.stock + quantity }
          : p
      )
    );

    const product = products.find((p) => p.id === productId);

    setLedger((current) => [
      {
        id: Date.now(),
        product: product.name,
        type: "Receipt",
        quantity: `+${quantity}`,
        location: product.warehouse,
        time: "Just now",
      },
      ...current,
    ]);
  }

  function deliverStock(productId, quantity) {
    setProducts((current) =>
      current.map((p) =>
        p.id === productId
          ? { ...p, stock: Math.max(0, p.stock - quantity) }
          : p
      )
    );

    const product = products.find((p) => p.id === productId);

    setLedger((current) => [
      {
        id: Date.now(),
        product: product.name,
        type: "Delivery",
        quantity: `-${quantity}`,
        location: product.warehouse,
        time: "Just now",
      },
      ...current,
    ]);
  }

  function renderPage() {
    switch (activePage) {
      case "Products":
        return (
          <ProductsPage
            products={products}
            search={search}
            setSearch={setSearch}
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
        return <TransfersPage products={products} />;

      case "Adjustments":
        return <AdjustmentsPage products={products} />;

      case "Stock Ledger":
        return <LedgerPage ledger={ledger} />;

      case "Warehouses":
        return <WarehousesPage products={products} />;

      default:
        return (
          <Dashboard
            products={products}
            ledger={ledger}
            totalStock={totalStock}
            lowStock={lowStock}
          />
        );
    }
  }

  return (
    <div className="app">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <h1>StockSense</h1>
            <span>Inventory Intelligence</span>
          </div>

          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace">
          <span>WORKSPACE</span>
          <strong>Main Organization</strong>
        </div>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => {
                  setActivePage(item.name);
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
              <strong>System Online</strong>
              <small>Inventory synced</small>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            <span>Inventory</span>
            <ChevronRight size={15} />
            <strong>{activePage}</strong>
          </div>

          <div className="top-actions">
            <button className="icon-button notification">
              <Bell size={19} />
              {lowStock.length > 0 && <span className="notification-dot" />}
            </button>

            <div className="user">
              <div className="avatar">AD</div>
              <div className="user-info">
                <strong>Admin</strong>
                <span>Inventory Manager</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content">{renderPage()}</div>
      </main>
    </div>
  );
}

function Dashboard({ products, ledger, totalStock, lowStock }) {
  return (
    <>
      <PageHeader
        title="Inventory Dashboard"
        subtitle="Real-time overview of your inventory operations."
      />

      <div className="kpi-grid">
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
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Inventory Overview</h2>
              <p>Current stock by product</p>
            </div>
            <span className="live-badge">
              <span></span> Live
            </span>
          </div>

          <div className="stock-chart">
            {products.map((product) => {
              const percentage = Math.min(
                100,
                (product.stock / Math.max(product.reorder * 2, 100)) * 100
              );

              return (
                <div className="stock-row" key={product.id}>
                  <div className="stock-label">
                    <div>
                      <strong>{product.name}</strong>
                      <small>{product.sku}</small>
                    </div>
                    <strong>{product.stock}</strong>
                  </div>

                  <div className="bar">
                    <div
                      className={`bar-fill ${
                        product.stock <= product.reorder
                          ? "danger"
                          : ""
                      }`}
                      style={{ width: `${percentage}%` }}
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
              <h2>Low Stock Alerts</h2>
              <p>Products approaching reorder level</p>
            </div>
            <AlertTriangle size={20} className="warning-icon" />
          </div>

          {lowStock.length === 0 ? (
            <div className="empty-state">
              <TrendingUp size={30} />
              <p>All inventory levels are healthy.</p>
            </div>
          ) : (
            <div className="alert-list">
              {lowStock.map((product) => (
                <div className="alert-item" key={product.id}>
                  <div className="alert-icon">
                    <AlertTriangle size={17} />
                  </div>
                  <div className="alert-content">
                    <strong>{product.name}</strong>
                    <span>
                      {product.stock} {product.unit} remaining · Reorder at{" "}
                      {product.reorder}
                    </span>
                  </div>
                  <button className="small-action">
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="panel ledger-preview">
        <div className="panel-header">
          <div>
            <h2>Recent Stock Activity</h2>
            <p>Latest inventory movements</p>
          </div>
          <button className="text-button">View Ledger →</button>
        </div>

        <LedgerTable ledger={ledger.slice(0, 5)} />
      </section>
    </>
  );
}

function ProductsPage({ products, search, setSearch }) {
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Manage products, stock levels and reorder rules."
        action="+ Add Product"
      />

      <section className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              placeholder="Search products or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <button>All Categories</button>
            <button>All Warehouses</button>
            <button>Stock Status</button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Location</th>
                <th>Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-name">
                      <div className="product-icon">
                        <Package size={17} />
                      </div>
                      <strong>{product.name}</strong>
                    </div>
                  </td>
                  <td className="muted">{product.sku}</td>
                  <td>{product.category}</td>
                  <td>
                    {product.warehouse}
                    <small className="location">
                      {product.location}
                    </small>
                  </td>
                  <td>
                    <strong>{product.stock}</strong>{" "}
                    <span className="muted">{product.unit}</span>
                  </td>
                  <td>{product.reorder}</td>
                  <td>
                    <StatusBadge
                      low={product.stock <= product.reorder}
                    />
                  </td>
                </tr>
              ))}
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
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />

      <div className="operation-grid">
        {products.map((product) => (
          <div className="operation-card" key={product.id}>
            <div className="operation-top">
              <div className="product-icon large">
                <Package size={21} />
              </div>
              <StatusBadge low={product.stock <= product.reorder} />
            </div>

            <h3>{product.name}</h3>
            <span className="sku">{product.sku}</span>

            <div className="operation-stock">
              <span>Current Stock</span>
              <strong>
                {product.stock} {product.unit}
              </strong>
            </div>

            <button
              className="primary-button full"
              onClick={() => onAction(product.id, 10)}
            >
              <Plus size={17} />
              {action} 10 {product.unit}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function TransfersPage({ products }) {
  return (
    <>
      <PageHeader
        title="Internal Transfers"
        subtitle="Move inventory between warehouses and locations."
        action="+ New Transfer"
      />

      <div className="transfer-layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Transfer Stock</h2>
              <p>Move products between locations</p>
            </div>
            <ArrowLeftRight size={22} />
          </div>

          <div className="form-grid">
            <FormField label="Product">
              <select>
                {products.map((p) => (
                  <option key={p.id}>{p.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Quantity">
              <input type="number" defaultValue="10" />
            </FormField>

            <FormField label="From Location">
              <select>
                <option>Main Warehouse · Rack A</option>
                <option>Main Warehouse · Rack B</option>
                <option>Warehouse 2 · Rack C</option>
              </select>
            </FormField>

            <FormField label="To Location">
              <select>
                <option>Warehouse 2 · Rack A</option>
                <option>Production Floor</option>
                <option>Main Warehouse · Rack B</option>
              </select>
            </FormField>
          </div>

          <button className="primary-button">
            Confirm Transfer
          </button>
        </section>

        <section className="panel transfer-info">
          <div className="info-icon">
            <ArrowLeftRight size={25} />
          </div>
          <h2>Transfer tracking</h2>
          <p>
            Every internal movement is recorded in the stock ledger
            so inventory remains traceable across locations.
          </p>

          <div className="transfer-stat">
            <span>Scheduled Transfers</span>
            <strong>6</strong>
          </div>
        </section>
      </div>
    </>
  );
}

function AdjustmentsPage({ products }) {
  return (
    <>
      <PageHeader
        title="Stock Adjustments"
        subtitle="Correct inventory mismatches after physical counting."
        action="+ New Adjustment"
      />

      <section className="panel adjustment-panel">
        <div className="panel-header">
          <div>
            <h2>Inventory Count</h2>
            <p>Update recorded stock to match physical stock.</p>
          </div>
          <ClipboardCheck size={22} />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Location</th>
                <th>Recorded</th>
                <th>Physical Count</th>
                <th>Difference</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td>{product.location}</td>
                  <td>{product.stock}</td>
                  <td>
                    <input
                      className="table-input"
                      type="number"
                      defaultValue={product.stock}
                    />
                  </td>
                  <td>
                    <span className="difference">0</span>
                  </td>
                  <td>
                    <button className="small-action">
                      Apply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function LedgerPage({ ledger }) {
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
            <input placeholder="Search ledger..." />
          </div>

          <div className="filter-group">
            <button>All Operations</button>
            <button>Today</button>
          </div>
        </div>

        <LedgerTable ledger={ledger} />
      </section>
    </>
  );
}

function WarehousesPage({ products }) {
  const warehouses = [...new Set(products.map((p) => p.warehouse))];

  return (
    <>
      <PageHeader
        title="Warehouses"
        subtitle="Monitor inventory across storage locations."
        action="+ Add Warehouse"
      />

      <div className="warehouse-grid">
        {warehouses.map((warehouse, index) => {
          const warehouseProducts = products.filter(
            (p) => p.warehouse === warehouse
          );

          const total = warehouseProducts.reduce(
            (sum, p) => sum + p.stock,
            0
          );

          return (
            <div className="warehouse-card" key={warehouse}>
              <div className="warehouse-icon">
                <Warehouse size={24} />
              </div>

              <span>WAREHOUSE {index + 1}</span>
              <h2>{warehouse}</h2>

              <div className="warehouse-stat">
                <span>Total Stock</span>
                <strong>{total}</strong>
              </div>

              <div className="warehouse-stat">
                <span>Products</span>
                <strong>{warehouseProducts.length}</strong>
              </div>

              <button className="secondary-button">
                View Inventory
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function LedgerTable({ ledger }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Operation</th>
            <th>Quantity</th>
            <th>Location</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {ledger.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.product}</strong>
              </td>
              <td>
                <OperationBadge type={item.type} />
              </td>
              <td>
                <strong
                  className={
                    item.quantity.startsWith("-")
                      ? "negative"
                      : "positive"
                  }
                >
                  {item.quantity}
                </strong>
              </td>
              <td>{item.location}</td>
              <td className="muted">{item.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">INVENTORY MANAGEMENT</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {action && (
        <button className="primary-button">
          <Plus size={18} />
          {action.replace("+ ", "")}
        </button>
      )}
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon, trend, danger }) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${danger ? "danger-bg" : ""}`}>
        {icon}
      </div>

      <div className="kpi-info">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{subtitle}</small>
      </div>

      {trend && <span className="trend">{trend}</span>}
    </div>
  );
}

function StatusBadge({ low }) {
  return (
    <span className={`status-badge ${low ? "low" : "healthy"}`}>
      <span></span>
      {low ? "Low Stock" : "Healthy"}
    </span>
  );
}

function OperationBadge({ type }) {
  const classes = {
    Receipt: "receipt",
    Delivery: "delivery",
    Transfer: "transfer",
    Adjustment: "adjustment",
  };

  return (
    <span className={`operation-badge ${classes[type] || ""}`}>
      {type}
    </span>
  );
}

function FormField({ label, children }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default App;