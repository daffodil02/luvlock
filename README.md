# 🎀 Luvlock Masterlist & Tracking Portal

Welcome to the **Luvlock Masterlist & Tracking Portal**! This is a custom-built, premium order tracking dashboard designed for group order participants. It features a modern, "bubble-glass" aesthetic with a curated color palette and focus on user experience.

---

## ✨ Key Features

- **Dual-Mode Search**: 
  - Search by **@username** to see your individual order summary and status.
  - Search by **#tag** to see all orders in a specific batch, including estimated shipment/arrival dates.
- **BAAM! Summary Cards**: High-impact visual summaries of your order progress.
- **Glassmorphism UI**: A soft, translucent design system with smooth animations (powered by Framer Motion).
- **Real-time Data**: Syncs directly with Google Sheets for instant updates.
- **Responsive Design**: Looks stunning on both desktop and mobile devices.

---

## 🏗️ Implementation Journey (Technical Breakdown)

I've documented the steps we took to build this project so you can learn the structure in detail:

### 1️⃣ Step 1: Setting up the Foundation
We used **Vite**, a modern, super-fast builder for React applications. It provides the "skeleton" of the project and handles the live-reload features while we develop.

### 2️⃣ Step 2: Adding Styling (Tailwind CSS v4)
To apply the "Pink Soccer/Luvlock" theme, we used **Tailwind CSS**. Unlike older versions, Tailwind v4 lets us define our custom colors (`--color-pink-500`) and fonts directly in `src/index.css` using CSS variables.

### 3️⃣ Step 3: Installing Power-Up Libraries
- **`react-router-dom`**: Handles navigation between pages without reloading.
- **`lucide-react`**: Provides the beautiful icons (Search, Heart, Package).
- **`framer-motion`**: Makes the "bubbles" and cards slide in smoothly.
- **`papaparse`**: The magic tool that reads your Google Sheets CSV data.

### 4️⃣ Step 4: Building the "Database" Integration
We wrote `src/data.js` to connect to your Google Sheets. We use a **Smart Section Scanner** logic to handle merged cells and different header patterns, allowing your human-friendly spreadsheet to work as a professional database.

### 5️⃣ Step 5: The Dashboard & Search Logic
In `Dashboard.jsx`, we use React's `useState` to track searches.
- **The Filter Logic**: We use `.filter()` to match the `searchTerm` against either the `USERNAME` (if starting with `@`) or the `CODE` (if starting with `#`).
- **Conditional Rendering**: The app automatically switches layouts between "User View" and "Batch View" based on the search type.

### 6️⃣ Step 6: Advanced Table & Date Fallbacks
We implemented a "Fallback" pattern for shipment dates: `{order['EST SHIPMENT'] || 'TBA 🗓️'}`. This ensures the site never looks broken if a date is missing in the sheet.

---

## 🎨 Design & Branding

- **Theme**: Bubblegum Pink & soft gradients (custom Luvlock palette).
- **Typography**: 
  - **Baloo 2**: Chunky, playful headers for a "sticker/patch" feel.
  - **Delius**: Professional yet friendly handwritten font for data and body text.
- **Visuals**: Custom Luvlock logo integration and animated background accents.

---

## 🛠️ Technical Stack

- **React 19**: The core framework.
- **Tailwind CSS v4**: For the modern, utility-first styling system.
- **React Router 7**: Managing the transition between Masterlist, Ongoing GOs, and Postage pages.
- **Lucide React**: Premium icon set.
- **PapaParse**: Advanced CSV parsing to bridge Google Sheets and the website.
- **Vite**: High-performance build tool and dev server.

---

## ❤️ Credits & Mission

Created as a personalized tracking portal to make the Group Order experience more transparent, fun, and beautiful!

*(P.S. Make sure to check out `LEARN.md` in this directory for a complete guide on how this app was built from the ground up!)*
