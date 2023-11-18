export default {
    template: `
    <div>
    
      <div>
            <label for="venue_name">Venue name:</label>
            <input type="text" v-model='venue_name' required>

            </br>

            <label for="place">Place:</label>
            <input type="text" v-model='place'>

            </br>

            <label for="location">Location:</label>
            <input type="text" v-model='location'>

            </br>

            <label for="capacity">Capacity:</label>
            <input type="text" v-model='capacity'>
            
            </br>

            <button @click='submit'>Submit</button>
            <router-link to="/"><button>Venue Home</button> </router-link>      
      </div>

      <div>
        {{error}}
      </div>
    </div>`,
    
    data(){
      return{
        venue_name:'',
        place:'',
        location:'',
        capacity:'',
        error:'',
        venue:{}
      }
    },

    mounted(){
      if (this.$route.params.venue_name) {
        fetch('http://localhost:5000/read_single_venue/'+this.$route.params.venue_name)
        .then((res) => {return res.json()})
        .then((data) => {console.log(data); this.venue = data})
        .then(()=>console.log(Object.keys(this.venue)))
        .then(()=> {this.venue_name = this.venue['venue_name'];
        this.place = this.venue['place'];
        this.location = this.venue['location'];
        this.capacity = this.venue['capacity'];})
      } else {
        this.$router.push('/')
      }      
    },

    methods:{
      submit:function(){
          console.log(this.venue_name);
          fetch('http://localhost:5000/edit_venue/', {
          method: 'POST',
          body: JSON.stringify({
              original_venue_name: this.$route.params.venue_name,
              venue_name: this.venue_name, 
              place: this.place, 
              location: this.location, 
              capacity:this.capacity }),
          headers: {
              'Content-Type': 'application/json',
          },
          })
      .then((res) => {return res.json()})
      .then((data) => {console.log(data); this.error = data})
      .then(()=> {
        if (this.error == 'Venue created!') this.$router.push('/')
      })
      }
},
}