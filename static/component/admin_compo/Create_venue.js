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

            <button @click='create_venue'>Submit</button>
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
        error:''
      }
    },
    
    methods:{
        create_venue:function(){
            console.log(this.venue_name);
            fetch('http://localhost:5000/create_venue', {
            method: 'POST',
            body: JSON.stringify({
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
        }
},
}