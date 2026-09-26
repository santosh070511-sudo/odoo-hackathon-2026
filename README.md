# odoo-hackathon-2026
Project developed for the Odoo x GCET Hyderabad Hackathon 2026.

# StockSense 📦

> A modular, centralized Inventory Management System built for the **Odoo x GCET Hyderabad Hackathon 2026**.

## 📌 About the Project

StockSense is an Inventory Management System designed to digitize and streamline stock-related operations within a business.

It provides a centralized platform for managing products, incoming and outgoing stock, internal transfers, inventory adjustments, warehouses, and stock movement history.

The system aims to replace manual registers, spreadsheets, and scattered stock-tracking methods with a real-time and easy-to-use inventory platform.

## 🎯 Problem Statement

The system is designed to support:

- Inventory managers managing incoming and outgoing stock
- Warehouse staff performing transfers, picking, shelving, and counting
- Centralized visibility of inventory across locations
- Real-time tracking of stock movements and adjustments

## 🚀 Core Features

### 📊 Inventory Dashboard
- Total products in stock
- Low-stock and out-of-stock items
- Pending receipts
- Pending deliveries
- Scheduled internal transfers
- Dynamic filtering by:
  - Document type
  - Status
  - Warehouse/location
  - Product category

### 📦 Product Management
- Create and update products
- SKU / product codes
- Product categories
- Units of measure
- Initial stock
- Stock availability by location
- Reordering rules

### 📥 Receipts
Manage incoming goods from vendors.

**Flow:**

`Create Receipt → Add Supplier & Products → Enter Quantity → Validate → Stock Increases`

### 📤 Delivery Orders
Manage outgoing goods for customer shipments.

**Flow:**

`Pick → Pack → Validate → Stock Decreases`

### 🔄 Internal Transfers
Move inventory between:

- Warehouses
- Storage locations
- Racks
- Production areas

All movements are recorded in the stock ledger.

### 🛠️ Stock Adjustments
Correct differences between recorded inventory and physical counts.

**Flow:**

`Select Product/Location → Enter Counted Quantity → Update Stock → Record Adjustment`

### 🏭 Multi-Warehouse Management
Track inventory across multiple warehouses and locations.

### 🔎 Search & Smart Filters
Quickly find products and filter inventory operations based on relevant criteria.

### ⚠️ Low-Stock Alerts
Identify products approaching or falling below their reorder levels.

### 📜 Stock Ledger
Maintain a history of inventory movements, including receipts, deliveries, transfers, and adjustments.

## 🔄 Inventory Flow

```text
Vendor
  │
  ▼
Receipt
  │
  ▼
Stock In
  │
  ├──────────────► Internal Transfer
  │                    │
  │                    ▼
  │               New Location
  │
  ▼
Delivery Order
  │
  ▼
Stock Out
  │
  ▼
Stock Adjustment
  │
  ▼
Stock Ledger
