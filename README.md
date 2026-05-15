
# Multi-tenant Feature Flag System

A robust feature management tool that allows organizations to control their application features in real-time without redeploying code.

## 🚀 Overview
This project is a **Multi-tenant Feature Flag System** built to provide data isolation and secure feature management for different companies (organizations). It uses a centralized dashboard where admins can toggle features ON or OFF instantly.

## ✨ Key Features
- **Multi-tenancy:** Secure data isolation using `org_id`, ensuring one organization cannot see another's data.
- **Role-Based Access:** - **Super Admin:** Create and manage organizations.
  - **Org Admin:** Manage (Create, Toggle, Delete) feature flags for their specific org.
- **JWT Authentication:** Secure login system using JSON Web Tokens.
- **Real-time Toggle:** Frontend updates instantly via REST APIs without page reloads.

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Security:** JWT (JSON Web Tokens), Bcrypt
- **Frontend:** HTML5, CSS3, Vanilla JavaScript

## 📊 Database Schema
The system relies on two primary tables:
1. **Organizations:** Stores unique `org_id` and company details.
2. **Feature_Flags:** Stores flag keys, enabled status, and a reference to the `org_id`.
## 📸 Project Preview

### 1. Super Admin Dashboard
Manage and create different organizations in the system.
![Super Admin Dashboard](https://raw.githubusercontent.com/kr1thi/multi-tenant-feature-flags/main/super_admin.png)

### 2. Org Admin Dashboard
Manage and toggle feature flags for a specific organization.
![Org Admin Dashboard](https://raw.githubusercontent.com/kr1thi/multi-tenant-feature-flags/main/org_admin.png)

### 3. End User View (API Output)
The final API response that the client application consumes to enable/disable features.
![End User View](https://raw.githubusercontent.com/kr1thi/multi-tenant-feature-flags/main/end_admin.png)

## ⚙️ Future Improvements
- [ ] **Soft delete:** This helps to avoid data loss and we can restore deleted data later.
- [ ] **Caching:** Implementing Redis for faster flag evaluation.
- [ ] **Audit Logs:** To track which admin changed which flag and when.

