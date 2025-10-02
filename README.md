# CST3144 Coursework – Full Stack App

This repository contains my implementation of the CST3144 module coursework.  
It is split into two parts: a **Vue.js front-end app** and a **Node.js/Express back-end app** (connected to MongoDB Atlas).  
The apps are deployed on **GitHub Pages** (frontend) and **Render** (backend).

---

## 📌 Required Links

- **[Vue.js App Repository]**  
  👉 [https://github.com/YOUR-USERNAME/cst3144-frontend](https://github.com/YOUR-USERNAME/cst3144-frontend)

- **[Vue.js App Live on GitHub Pages]**  
  👉 [https://YOUR-USERNAME.github.io/cst3144-frontend/](https://YOUR-USERNAME.github.io/cst3144-frontend/)

- **[Express.js App Repository]**  
  👉 [https://github.com/YOUR-USERNAME/cst3144-backend](https://github.com/YOUR-USERNAME/cst3144-backend)

- **[Express.js App Live on Render]** (returns all lessons via `/lessons` route)  
  👉 [https://cst3144-backend.onrender.com/lessons](https://cst3144-backend.onrender.com/lessons)

---

## 📖 Tech & Hosting Constraints (Pinned from Handbook)

- **Frontend**
  - Must use **Vue.js** (no React/Angular/Svelte).
  - Data access: **fetch with Promises** only (no Axios/XMLHttpRequest).
  - Hosted on **GitHub Pages**.

- **Backend**
  - **Node.js + Express** only.
  - Database: **MongoDB Atlas** (cloud).
  - Must use **native MongoDB driver** (no Mongoose).
  - Hosted on **AWS or Render**.

---

## 📝 Features Implemented
- Lessons displayed from API (`GET /lessons`).
- Add to Cart, Remove from Cart.
- Checkout with validation (letters-only name, numbers-only phone).
- Order submission (`POST /orders`).
- Lesson update on checkout (`PUT /lessons/:id`).

---

## 🚀 How to Run Locally
1. Clone the repositories.
2. Install dependencies for backend:  
   ```bash
   cd cst3144-backend
   npm install
   npm start
