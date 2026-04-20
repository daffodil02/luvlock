# 🎀 Luvlock Masterlist & Tracking Portal

Welcome to the **Luvlock Masterlist & Tracking Portal**! This is a custom-built, premium order tracking dashboard designed for group order participants. It features a modern, "bubble-glass" aesthetic with a curated color palette and focus on user experience.

---

## ✨ Key Features (Original)

- **Dual-Mode Search**: 
  - Search by **@username** to see your individual order summary and status.
  - Search by **#tag** to see all orders in a specific batch, including estimated shipment/arrival dates.
- **BAAM! Summary Cards**: High-impact visual summaries of your order progress.
- **Glassmorphism UI**: A soft, translucent design system with smooth animations (powered by Framer Motion).
- **Real-time Data**: Syncs directly with Google Sheets for instant updates.
- **Responsive Design**: Looks stunning on both desktop and mobile devices.

## 🌟 Sekata Upgrade Phase (New Features) 🕵️‍♀️🎯

- **Global Flag System 🇰🇷🇨🇳**: 
  - Automatic Regex-based country detection in tags (e.g., `KR #PCO123` automatically displays a Korea flag sticker).
  - Cross-platform compatibility: Stylized stickers on PC and colorful emojis on mobile.
- **Smart-Memory Data Parser 🧠**: 
  - Advanced forward-filling logic for Google Sheets. 
  - It "remembers" tags, usernames, and statuses across merged cells, ensuring 100% data integrity even with complex spreadsheet formatting.
- **Secret Roadmap Guide 🗺️**: 
  - A toggle-able, interactive "How-to" guide on the Masterlist page.
  - Explains the **Track → Shop → Ship** journey using custom Boutique icons (Heart, List, MapPin).
- **Midnight Glow (Dark Mode) 🌙**: 
  - A system-wide, responsive dark mode that adapts to your device settings or user preference, maintaining the playful "Sekata" vibe in low light.
- **Visual Quiet & Polish ✨**: 
  - Replaced noisy "N/A" text with sleek minimalist dashes (`—`).
  - Standardized status badges (including the high-contrast **CANCELLED** status).
- **Production Ready 🚀**: 
  - Fully integrated live production Google Form links for the Postage Portal.
- **Global Magic Calculator 🪄**: 
  - A persistent, floating multi-currency price converter available on every page.
  - Supports KRW, JPY, YUAN, BAHT, USD, and SGD with real-time exchange rates fetched directly from Google Sheets.
  - Features a premium glassmorphic popup with automatic conversion to MYR.

---

## 🏗️ Implementation Journey (Technical Breakdown)

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

### 6️⃣ The "Sekata Upgrade" (Technical Masterclass)
- **Regex for Flags**: Using **Regular Expressions** to scan tags for patterns like `KR` or `CN` and automatically wrap them in a stylized flag container.
- **The Roadmap Toggle**: Using `useState` to manage the "Secret Roadmap" state, keeping the site clean while providing help when asked.
- **Status Color Normalization**: Refining the status badges (READY, OTW, ARRIVED, etc.) to have specific "Sekata" color themes that work perfectly in both Light and Dark modes.

---

## 🎨 Design & Branding

- **Theme**: Bubblegum Pink, Soft Lavender, and "Midnight Glow" Dark Mode.
- **Typography**: 
  - **Baloo 2**: Chunky, playful headers for a "sticker/patch" feel.
  - **Delius**: Professional yet friendly handwritten font for data and body text.
- **Visuals**: Custom Luvlock logo integration and animated background accents.
- **Icons**: Curated **Lucide React** set (Heart, List, MapPin, ExternalLink).

---

## 🛠️ Technical Stack (Updated)

- **React 19**: Modern UI framework.
- **Tailwind CSS v4**: Utility-first styling with custom "Sekata" color tokens.
- **React Router 7**: Managing the transition between Masterlist, Ongoing GOs, and Postage pages.
- **Lucide React**: Premium icon set.
- **Framer Motion**: Premium animations and roadmap transitions.
- **PapaParse**: High-performance CSV parsing to bridge Google Sheets and the website.
- **Vite**: High-performance build tool and dev server.

---

## ❤️ Credits & Mission

Created as a personalized tracking portal to make the Group Order experience more transparent, fun, and beautifully unified! 🦄💖 ✨ 🌸💖

*(P.S. Make sure to check out `LEARN.md` in this directory for a complete guide on how this app was built from the ground up!)*
