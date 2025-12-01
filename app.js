new Vue({

  el: "#app",

  /* ---------------------------------------------------------
     Application Data (Reactive State)
  --------------------------------------------------------- */
  data: {
    // Render backend API 
    API_BASE: "https://fs-backend-e7uu.onrender.com",

    // Display Home View by default
    view: "home",

    // Fetched lesson data from backend  
    lessons: [],
    loading: true,

    // Default sorting and searching state 
    sortBy: "topic",   
    sortDir: "asc",    
    searchTerm: "",    
    searchResults: [],     //results returned by /search
    searching: false,      

    // Default cart + checkout form state
    cart: [],
    order: { name: "", phone: "" },
    message: "",

    showConfirm: false
  },

  // Smooth scroll for "Our Tutors" button
  scrollToTutors(){
    const el = document.getElementById('tutors');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },

  /* ---------------------------------------------------------
     Computed Properties (Recalculates data on state change)
  --------------------------------------------------------- */
  computed: {

    //  Form validation 
    validName()  { return /^[A-Za-z ]+$/.test(this.order.name || ""); },  // true if name contains only letters + spaces
    validPhone() { return /^[0-9]+$/.test(this.order.phone || ""); },     // true if phone contains only digits

    // Checkout Validation
    canCheckout() {
      return this.cart.length > 0 && this.validName && this.validPhone;   // at least one lesson + valid form
    },

    // Total price 
    cartTotal() {
      return this.cart.reduce((sum, l) => sum + Number(l.price || 0), 0); // sum of lesson prices
    },


    // Filter lessons 
    filteredLessons() { 
      const q = (this.searchTerm || "").trim();
      return q ? this.searchResults : this.lessons;
    },

    // Sort lessons 
    sortedLessons() {
      const arr = this.filteredLessons.slice();     // create a copy of filtered array
      const key = this.sortBy;                      // key = sort by fields
      const dir = this.sortDir === "asc" ? 1 : -1;  // direction multiplier -> flips the result of the comparison

      return arr.sort((a,b) => {
        let va=a[key], vb=b[key];                             // compare "sort by" values
        if (typeof va==="string") va=va.toLowerCase();  
        if (typeof vb==="string") vb=vb.toLowerCase();
        if (va<vb) return -1*dir;                             // -1 A before B  
        if (va>vb) return 1*dir;                              // +1 B before A      
        return 0;
      });
    }
  },

  /* ---------------------------------------------------------
     METHODS – User Interaction & API Calls
  --------------------------------------------------------- */
  methods: {
    // Navigation between sections
    go(view) { 
      this.view = view; 
      window.scrollTo(0, 0);   // scroll to top when switching pages
    },

    //Capitalize first letter (titles) 
    cap(s) { 
      return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1); 
    },

    /* ---------------------------------------------------------
       Load Lessons (GET /lessons)
       ---------------------------------------------------------*/
    loadLessons(){

      // Fallback seed data 
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
      if (!this.API_BASE) {
        this.lessons = seed; 
        this.loading = false; 
        return;
      }

      // Fetch lessons from backend (MongoDB via Express)
      fetch(this.API_BASE + "/lessons")                               // GET request to /lessons from Express server
        .then(r => { if(!r.ok) throw new Error(); return r.json(); }) // check response
        .then(json => this.lessons = json)                            // parses the JSON, stores it in this.lessons
        .catch(() => this.lessons = seed)                             // fallback on error to seed
        .finally(() => this.loading = false);
    },

    /* ---------------------------------------------------------
       Cart Management
       --------------------------------------------------------- */
    addToCart(lesson){
      if(lesson.space > 0){     // only if space available 
        this.cart.push(lesson); //  add lesson to cart
        lesson.space -= 1;      // visually reduce available slots
      }
    },

    removeFromCart(idx){
      const lesson = this.cart.splice(idx,1)[0];                    // remove element from array
      const original = this.lessons.find(l => l._id===lesson._id);  // find original lesson (id)
      if (original) original.space += 1;                            // increase space count
    },

    /* ---------------------------------------------------------
      Checkout Handling
    --------------------------------------------------------- */

    // Open confirmation modal
    openConfirm(){
      if(this.canCheckout) this.showConfirm = true;
    },

    // Finalize checkout from modal
    finalizeCheckout(){
      this.submitOrder();       // process checkout
      this.showConfirm = false; // close modal
    },


    /* ---------------------------------------------------------
       Submit Order (POST /orders + PUT /lessons/:id)
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
        const r = await fetch(this.API_BASE + "/orders", {    // HTTP sends POST request to /orders
          method: "POST",
          headers: { "Content-Type": "application/json" },  
          body: JSON.stringify(payload)                       // turns payload into JSON
        });
        if (!r.ok) throw new Error("Order failed");

        // 2) Update lesson availability 
        await Promise.all(this.cart.map(l =>                  // for each lesson in cart
          fetch(this.API_BASE + "/lessons/" + l._id, {        // send PUT request to /lessons/:id
            method: "PUT",
            headers: { "Content-Type": "application/json" },  // specify JSON content
            body: JSON.stringify({ space: l.space })          // send updated space count as JSON   
          })
        ));

        // 3) Reset + success message + redirect home
        this.cart = [];
        this.order = { name: "", phone: "" };
        this.message = "Order placed successfully 🎉";
        this.view = "home";
      } catch (e) {
        // Error handling 
        this.message = "Sorry, something went wrong. Please try again.";
        console.error(e);
      }
    },

    /* ---------------------------------------------------------
       Search Handling (GET /search?q=...)
    --------------------------------------------------------- */

    // Called every time the user types in the search box
      onSearchInput() {
        const q = (this.searchTerm || "").trim();

        // If the box is empty → clear backend search results -> show full list
        if (!q) {
          this.searchResults = [];
          return;
        }

        // Otherwise, call backend search
        this.fetchSearch(q);
      },

      // Actually call GET /search?q=...
      async fetchSearch(q) {
        try {
          this.searching = true;

          const r = await fetch(this.API_BASE + "/search?q=" + encodeURIComponent(q)); // GET request to /search with query parameter
          if (!r.ok) throw new Error("Search failed");

          const json = await r.json(); // parse JSON response
          this.searchResults = json;   // save filtered lessons from backend
        } catch (e) {
          console.error(e);
          this.searchResults = [];     // on error, show no results
        } finally {
          this.searching = false;
        }
      },



  },


  mounted(){ 
    this.loadLessons(); 
  }
});
