export default {
    template: `
    <div>
    
      <div>
          <form>
            <label for="venue_name">Available seats:  {{available_seats}}</label>

            </br>

            <label for="place">Numbers:</label>
            <input type="text" v-model='numbers'>

            </br>

            <label for="location">Price:</label>
            <input type="text" v-model='price' disabled>

            </br>

            <label for="location">Total:  {{total}}</label>

                       
            </br>

            <button @click='book_show'> Book Show </button>
            <router-link to="/user_home"><button>User Home</button> </router-link>      
          </form>
      </div>

      <div>
        {{error}}
      </div>
    </div>`,
    
    data(){
      return{
        available_seats:null,
        already_booked_tickets:null,
        numbers:'',
        price:null,
        error:'',
        show:{}
      }
    },

    mounted(){
      if (this.$route.params.show_id) {
        fetch('http://localhost:5000/read_single_show/'+this.$route.params.show_id)
        .then((res) => {return res.json()})
        .then((data) => {console.log(data); this.show = data})
        .then(()=>{
          this.price = this.show['price'];
          this.available_seats = this.show['seats'] - this.show['booked_seats']
        })

        fetch('http://localhost:5000/read_single_show/'+this.$route.params.show_id)
        .then((res) => {return res.json()})
        .then((data) => {console.log(data); this.show = data})
        .then(()=>{
          this.price = this.show['price'];
          this.available_seats = this.show['seats'] - this.show['booked_seats']
        })
      } else {
        this.$router.push('/')
      }      
    },


    methods:{
        book_show:function(){
            console.log(this.$route.params);
            fetch('http://localhost:5000/book_show', {
            method: 'POST',
            body: JSON.stringify({
                show_id: this.$route.params.show_id,
                numbers: this.numbers,}),
            headers: {
                'Content-Type': 'application/json',
            },
            })
            .then((res) => {return res.json()})
            .then((data) => {console.log(data); this.error = data})
  }
},

    computed:{
        total(){
            return parseInt(this.numbers)*parseInt(this.price)
        }
    
}}