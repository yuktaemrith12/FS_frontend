      new Vue({
        el: "#app",
        data: {
          // Set to "" during design to use seed quickly; set to your Render URL later
          API_BASE: "https://fs-backend-e7uu.onrender.com",
          view: "home",           // 'home' | 'lessons' | 'cart'

          lessons: [],
          loading: true,

          // sorting + search (Lessons view)
          sortBy: "topic",
          sortDir: "asc",
          searchTerm: "",

          // cart + checkout
          cart: [],
          order: { name: "", phone: "" },
          message: "",
          // modal
          showConfirm: false
        },

        computed: {
          validName()  { return /^[A-Za-z ]+$/.test(this.order.name || ""); },
          validPhone() { return /^[0-9]+$/.test(this.order.phone || ""); },
          canCheckout(){ return this.cart.length>0 && this.validName && this.validPhone; },

          // running total for cart table + checkout
          cartTotal() {
            return this.cart.reduce((sum, l) => sum + Number(l.price || 0), 0);
          },

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

        methods: {
          go(view) { 
            this.view = view; 
            window.scrollTo(0, 0); 
          },

          cap(s) { 
            return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1); 
          },

          loadLessons(){
            const seed = [
              { _id:"1", topic:"math",      location:"Hendon",        price:500, space:5, rating:5, img:"assets/subjects/1.png" },
              { _id:"2", topic:"biology",   location:"Colindale",     price:900,  space:5, rating:4, img:"assets/subjects/2.png" },
              { _id:"3", topic:"english",   location:"Brent Cross",   price:800,  space:5, rating:5, img:"assets/subjects/3.png" },
              { _id:"4", topic:"music",     location:"Golders Green", price:600, space:5, rating:4.5, img:"assets/subjects/4.png" },
              { _id:"5", topic:"art",       location:"Hendon",        price:750,  space:5, rating:5, img:"assets/subjects/5.png" },
              { _id:"6", topic:"coding",    location:"Wood Green",    price:450, space:5, rating:3, img:"assets/subjects/6.png" },
              { _id:"7", topic:"dance",     location:"Hendon",        price:960,  space:5, rating:4, img:"assets/subjects/7.png" },
              { _id:"8", topic:"history",   location:"Colindale",     price:665,  space:5, rating:4, img:"assets/subjects/8.png" },
              { _id:"9", topic:"economics", location:"Brent Cross",   price:500, space:5, rating:4, img:"assets/subjects/9.png" },
              { _id:"10",topic:"chemistry", location:"Golders Green", price:750, space:5, rating:5, img:"assets/subjects/10.png" }
            ];

            if (!this.API_BASE) {
              this.lessons = seed; this.loading = false; return;
            }
            fetch(this.API_BASE + "/lessons")
              .then(r => { if(!r.ok) throw new Error(); return r.json(); })
              .then(json => this.lessons = json)
              .catch(() => this.lessons = seed)
              .finally(() => this.loading = false);
          },

          addToCart(lesson){
            if(lesson.space>0){ this.cart.push(lesson); lesson.space -= 1; }
          },
          removeFromCart(idx){
            const lesson = this.cart.splice(idx,1)[0];
            const original = this.lessons.find(l => l._id===lesson._id);
            if (original) original.space += 1;
          },

          // open the confirmation modal if form is valid
          openConfirm(){
            if(this.canCheckout) this.showConfirm = true;
          },

          // confirm -> submit order -> modal closes -> back home (submitOrder already routes home)
          finalizeCheckout(){
            this.submitOrder();
            this.showConfirm = false;
          },

          scrollToTutors(){
            const el = document.getElementById('tutors');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          },


          submitOrder(){
            const payload = {
              name: this.order.name.trim(),
              phone: this.order.phone.trim(),
              lessonIDs: this.cart.map(l=>l._id),
              space: this.cart.length
            };
            fetch(this.API_BASE + "/orders", {
              method:"POST", headers:{ "Content-Type":"application/json" },
              body: JSON.stringify(payload)
            })
            .finally(()=>{
              this.cart = []; this.order = {name:"", phone:""}; this.go('home');
            });
          }
        },

        mounted(){ this.loadLessons(); }
      });