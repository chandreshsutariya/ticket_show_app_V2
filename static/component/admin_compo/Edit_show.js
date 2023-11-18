export default {
    template: `
    <div>
    
      <div>
          <form>
            <label for="venue_name">Show name:</label>
            <input type="text" v-model='show_name'>

            </br>

            <label for="place">Rating:</label>
            <input type="text" v-model='rating'>

            </br>

            <label for="location">Date:</label>
            <input type="date" v-model='date'>

            </br>

            <label for="location">Timing starts:</label>
            <input type="time" v-model='timing_starts'>

            </br>

            <label for="location">Timing Ends:</label>
            <input type="time" v-model='timing_ends'>

            </br>

            <label for="capacity">Tags:</label>
            <input type="text" v-model='tags'>
            
            </br>

            <label for="capacity">Price:</label>
            <input type="text" v-model='price'>

            </br>

            <label for="capacity">Seats:</label>
            <input type="text" v-model='seats'>
            
            </br>

            <button @click='submit'>Submit</button>
            <router-link to="/"><button>Venue Home</button> </router-link>      
          </form>
      </div>

      <div>
        {{error}}
      </div>
    </div>`,
    
    data(){
      return{
        show_name:'',
        rating:'',
        date:'',
        timing_starts:'',
        timing_ends:'',
        tags:'',
        price:'',
        seats:'',
        show:{},
        error:'',
      }
    },

    mounted(){
      if (this.$route.params.show_id) {
        fetch('http://localhost:5000/read_single_show/'+this.$route.params.show_id)
        .then((res) => {return res.json()})
        .then((data) => {console.log(data); this.show = data})
        .then(()=>console.log(Object.keys(this.show)))
        .then(()=> {
                    this.show_name = this.show['show_name'];
                    this.rating = this.show['rating'];
                    this.date = this.show['date'];
                    this.timing_starts = this.show['timing_starts'];
                    this.timing_ends = this.show['timing_ends'];
                    this.tags = this.show['tags'];
                    this.price = this.show['price'];
                    this.seats = this.show['seats']
                })
      } else {
        this.$router.push('/')
      }      
    },

    methods:{
      submit:function(){
          fetch('http://localhost:5000/edit_show/', {
          method: 'POST',
          body: JSON.stringify({
                show_id: this.$route.params.show_id,
                show_name: this.show_name,
                rating : this.rating,
                date : this.date,
                timing_starts : this.timing_starts,
                timing_ends : this.timing_ends,
                tags : this.tags,
                price : this.price,
                seats : this.seats}),
          headers: {
              'Content-Type': 'application/json',
          },
          })
      .then((res) => {return res.json()})
      .then((data) => {console.log(data); this.error = data})
      .then(()=> {
        if (this.error == 'show edited!') this.$router.push('/')
      })
      }
},
}