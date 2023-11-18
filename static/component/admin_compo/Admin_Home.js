export default {
template: `
<div>
  <div>
    <div class="row">
      <div class="card col-4 my-3 mx-3" style="width: 18rem;" v-for="venue in venues">
        <div class="card-body" >
          <h2 class="card-title">{{venue.venue_name}}</h2>
          
          <div  v-for='show in shows'>
            <div v-if="show.venue_id == venue.id">
              <div class="card">
                <div class="card-body">
                  <h4 class="card-title"> {{show.show_name}} </h4>
                  <p class="card-text"> 
                    Date: {{show.date}}</br>
                    Time: {{show.timing_starts}} to {{show.timing_ends}}</br>
                    Total seats: {{show.seats}}</br>
                    <h6>
                      price: {{show.price}}</br>
                      Seats left: {{show.seats - show.booked_seats}}
                    </h6>
                  </p>
                  <router-link :to="{name:'edit_show', params:{show_id:show.id } }"> <button> Edit </button> </router-link>
                  <button @click="delete_show(show.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>

          <router-link :to="{name:'create_show', params:{venue_name:venue.venue_name } }"> <button> Create Show</button> </router-link>
          </br>
          </br>
          <router-link :to="{name:'edit_venue', params:{venue_name:venue.venue_name } }"> <button>Edit</button> </router-link>
          <button @click="delete_venue(venue.venue_name)">Delete</button>
        </div>
      </div>
    </div>
  </div>

  <div>
    {{error}}
  </div>

  <div>
    <router-link to="/create_venue"><button>Create Venue</button> </router-link>      
  </div>

</div>`,
data(){
  return{
    current_user:null,
    venue_length:null,
    venues:{},
    shows:{},
    error:null
  }
},

mounted(){
  fetch('http://localhost:5000/read_venue')
  .then((res) => {return res.json()})
  .then((data) => {console.log(data); this.venues = data})
  .then(()=> {console.log(this.venues); this.venue_length=Object.keys(this.venues).length})

  fetch('http://localhost:5000/read_show')
  .then((res) => {return res.json()})
  .then((data) => {console.log(data); this.shows = data})
  .then(()=> console.log(this.shows))

},

methods:{
  delete_venue:function(venue_name){      
    console.log(venue_name),
      fetch('http://localhost:5000/delete_venue', {
      method: 'POST',
      body: JSON.stringify({
          venue_name: venue_name
        }),
      headers: {
          'Content-Type': 'application/json',
      },
      })
  .then((res) => {return res.json()})
  .then((data) => {console.log(data); this.error = data})

  this.$router.go('/')
  },

  delete_show:function(id){      
    console.log(id),
      fetch('http://localhost:5000/delete_show', {
      method: 'POST',
      body: JSON.stringify({
          id: id
        }),
      headers: {
          'Content-Type': 'application/json',
      },
      })
  .then((res) => {return res.json()})
  .then((data) => {console.log(data); this.error = data})

  this.$router.go('/')
  },
},
}