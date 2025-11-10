

new Vue({
  /* ---------------------------------------------------------
     Root Element
     ---------------------------------------------------------
     - Mounts Vue instance to the <div id="app"> in index.html
     - Everything inside becomes reactive.
  --------------------------------------------------------- */
  el: "#app",

  /* ---------------------------------------------------------
     Application Data (Reactive State)
     ---------------------------------------------------------
     - Stores all variables used across the interface.
     - Automatically updates the DOM when values change.
  --------------------------------------------------------- */
  data: {
    // Base URL for the backend API (set empty "" for local design mode)
    API_BASE: "https://fs-backend-e7uu.onrender.com",

    // Controls which view (section) is displayed
    // Possible values: 'home' | 'lessons' | 'cart'
    view: "home",

    // Fetched lesson data from backend (or fallback seed)
    lessons: [],
    loading: true,

    // Sorting and searching state for Lessons view
    sortBy: "topic",   // default sort by topic
    sortDir: "asc",    // ascending order
    searchTerm: "",    // bound to search input

    // Cart + checkout form state
    cart: [],
    order: { name: "", phone: "" },
    message: "",

    // Modal visibility toggle for confirmation popup
    showConfirm: false
  },

  /* ---------------------------------------------------------
     Computed Properties (Derived Data)
     ---------------------------------------------------------
     - Automatically recomputed when dependencies change.
     - Used to simplify logic in the template (index.html).
  --------------------------------------------------------- */
  computed: {
    // === Form validation ===
    validName()  { return /^[A-Za-z ]+$/.test(this.order.name || ""); },
    validPhone() { return /^[0-9]+$/.test(this.order.phone || ""); },

    // Button enabled only when form + cart are valid
    canCheckout() {
      return this.cart.length > 0 && this.validName && this.validPhone;
    },

    // === Cart Calculations ===
    // Total price for checkout & table footer
    cartTotal() {
      return this.cart.reduce((sum, l) => sum + Number(l.price || 0), 0);
    },

    // === Filtering & Sorting for Lessons ===
    // Filter lessons according to search term
    filteredLessons() {
      const q = (this.searchTerm || "").toLowerCase();
      if (!q) return this.lessons;
      return this.lessons.filter(l =>
        String(l.topic).toLowerCase().includes(q) ||
        String(l.location).toLowerCase().includes(q) ||
        String(l.price).toLowerCase().includes(q) ||
        String(l.space).toLowerCase().includes(q)
      );
    },

    // Sort lessons after filtering, based on sortBy + sortDir
    sortedLessons() {
      const arr = this.filteredLessons.slice();
      const key = this.sortBy;
      const dir = this.sortDir === "asc" ? 1 : -1;

      return arr.sort((a,b) => {
        let va=a[key], vb=b[key];
        if (typeof va==="string") va=va.toLowerCase();
        if (typeof vb==="string") vb=vb.toLowerCase();
        if (va<vb) return -1*dir;
        if (va>vb) return 1*dir;
        return 0;
      });
    }
  },

  /* ---------------------------------------------------------
     METHODS – User Interaction & API Calls
     ---------------------------------------------------------
     - Define all the app’s actions (navigation, cart, submit).
     - Connected to HTML via @click, v-model, v-for, etc.
  --------------------------------------------------------- */
  methods: {
    /* ----- Navigation between sections ----- */
    go(view) { 
      this.view = view; 
      window.scrollTo(0, 0);   // scroll to top when switching pages
    },

    /* Capitalize first letter (used for lesson titles) */
    cap(s) { 
      return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1); 
    },

    /* ---------------------------------------------------------
       Load Lessons (GET /lessons)
       ---------------------------------------------------------
       - Fetches lessons from backend on Render.
       - If API fails or not set, use local seed data.
       - Updates the lessons array used by v-for.
    --------------------------------------------------------- */
    loadLessons(){
      // Fallback seed data used during development or API downtime
      const seed = [
        { _id:"1", topic:"math",      location:"Hendon",        price:500, space:5, rating:5, img:"assets/subjects/1.png" },
        { _id:"2", topic:"biology",   location:"Colindale",     price:900, space:5, rating:4, img:"assets/subjects/2.png" },
        { _id:"3", topic:"english",   location:"Brent Cross",   price:800, space:5, rating:5, img:"assets/subjects/3.png" },
        { _id:"4", topic:"music",     location:"Golders Green", price:600, space:5, rating:4.5, img:"assets/subjects/4.png" },
        { _id:"5", topic:"art",       location:"Hendon",        price:750, space:5, rating:5, img:"assets/subjects/5.png" },
        { _id:"6", topic:"coding",    location:"Wood Green",    price:450, space:5, rating:3, img:"assets/subjects/6.png" },
        { _id:"7", topic:"dance",     location:"Hendon",        price:960, space:5, rating:4, img:"assets/subjects/7.png" },
        { _id:"8", topic:"history",   location:"Colindale",     price:665, space:5, rating:4, img:"assets/subjects/8.png" },
        { _id:"9", topic:"economics", location:"Brent Cross",   price:500, space:5, rating:4, img:"assets/subjects/9.png" },
        { _id:"10",topic:"chemistry", location:"Golders Green", price:750, space:5, rating:5, img:"assets/subjects/10.png" }
      ];

      // If no backend URL is set, use seed lessons immediately
      if (!this.API_BASE) {
        this.lessons = seed; 
        this.loading = false; 
        return;
      }

      // Fetch lessons from backend (MongoDB via Express)
      fetch(this.API_BASE + "/lessons")
        .then(r => { if(!r.ok) throw new Error(); return r.json(); })
        .then(json => this.lessons = json)
        .catch(() => this.lessons = seed)    // fallback on error
        .finally(() => this.loading = false);
    },

    /* ---------------------------------------------------------
       Cart Management
       ---------------------------------------------------------
       - Add/Remove lessons dynamically.
       - Decrement/increment available spaces in real time.
    --------------------------------------------------------- */
    addToCart(lesson){
      if(lesson.space > 0){ 
        this.cart.push(lesson); 
        lesson.space -= 1;      // visually reduce available slots
      }
    },

    removeFromCart(idx){
      const lesson = this.cart.splice(idx,1)[0];
      const original = this.lessons.find(l => l._id===lesson._id);
      if (original) original.space += 1;    // restore space count
    },

    /* ---------------------------------------------------------
       Modal + Checkout Handling
       ---------------------------------------------------------
       - Opens confirmation popup only if form valid.
       - Finalizes checkout, submits order, resets UI.
    --------------------------------------------------------- */
    openConfirm(){
      if(this.canCheckout) this.showConfirm = true;
    },

    finalizeCheckout(){
      this.submitOrder();       // process checkout
      this.showConfirm = false; // close modal
    },

    /* Smooth scroll for "Our Tutors" button */
    scrollToTutors(){
      const el = document.getElementById('tutors');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },

    /* ---------------------------------------------------------
       Submit Order (POST /orders + PUT /lessons/:id)
       ---------------------------------------------------------
       - Sends new order to backend.
       - Updates spaces for each booked lesson.
       - Displays success or error message.
       - Resets form + navigates back to Home.
    --------------------------------------------------------- */
    async submitOrder() {
      // Validate form again (client-side safety)
      if (!this.order.name.match(/^[A-Za-z\s]+$/) || !this.order.phone.match(/^\d+$/)) return;

      // Order data payload
      const payload = {
        name: this.order.name.trim(),
        phone: this.order.phone.trim(),
        lessonIDs: this.cart.map(l => String(l._id)),
        space: this.cart.length
      };

      try {
        // 1) Save order in the backend database
        const r = await fetch(this.API_BASE + "/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!r.ok) throw new Error("Order failed");

        // 2) Update lesson availability (PUT request per lesson)
        await Promise.all(this.cart.map(l =>
          fetch(this.API_BASE + "/lessons/" + l._id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ space: l.space })  // use updated value
          })
        ));

        // 3) Reset + success message + redirect home
        this.cart = [];
        this.order = { name: "", phone: "" };
        this.message = "Order placed successfully 🎉";
        this.view = "home";
      } catch (e) {
        // Error handling (network/API issues)
        this.message = "Sorry, something went wrong. Please try again.";
        console.error(e);
      }
    }
  },

  /* ---------------------------------------------------------
     Lifecycle Hook – mounted()
     ---------------------------------------------------------
     - Runs automatically when Vue instance loads.
     - Triggers loadLessons() to populate data immediately.
  --------------------------------------------------------- */
  mounted(){ 
    this.loadLessons(); 
  }
});
