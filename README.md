# Full Stack Coursework – Front-End (Vue.js)
**Author:** Yukta Emrith (M00977987)

---

## 🌐 Overview
This repository contains the **Front-End (Vue.js)** interface of the Full Stack Coursework project, built to interact with a live Node.js + Express backend hosted on Render.  

The application allows users to browse available lessons, add them to a cart, and complete an order, with all data stored and updated dynamically via MongoDB Atlas.

---

## 🔗 Project Links
| Component | Platform | Link |
|------------|-----------|------|
| 🧩 Front-End (Repo) | GitHub | [FS_frontend](https://github.com/yuktaemrith12/FS_frontend) |
| 🌍 Front-End (Live) | GitHub Pages | [Open App](https://yuktaemrith12.github.io/FS_frontend/) |
| ⚙️ Back-End (Repo) | GitHub | [FS_backend](https://github.com/yuktaemrith12/FS_backend) |
| ☁️ Back-End (Live API) | Render | [API – /lessons](https://fs-backend-e7uu.onrender.com/lessons) |

---

## ⚙️ Core Functionalities

### 🧾 Lessons Display
- Dynamically fetches lessons from the backend (`GET /lessons`)
- Each lesson shows **Topic, Location, Price, Spaces, and Rating**
- Users can sort by subject, location, price, or space (ascending/descending)
- Includes a responsive search bar with real-time filtering

### 🛒 Cart & Checkout
- Add lessons to a cart and automatically reduce available spaces
- Remove lessons restores space count  
- Checkout form validates:
  - **Name:** Letters only (A–Z)
  - **Phone:** Digits only (0–9)
- Sends order to backend (`POST /orders`)  
- Updates lesson availability (`PUT /lessons/:id`)  
- Confirmation modal for user review before final submission  

### 🔍 Search
- Keyword-based filtering by topic, location, price, or spaces
- Integrated with backend `/search` route for live data lookup

---

## 🧩 App Structure

```bash
FS_frontend/
├── index.html        # Main Vue.js app structure and navigation
├── style.css         # Page styling (modern responsive design)
├── js/
│   └── app.js        # Vue instance with all reactive logic
└── assets/
    ├── subjects/     # Lesson thumbnails
    └── professors/   # Tutor images
