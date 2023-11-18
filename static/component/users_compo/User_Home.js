export default {
template: `
<div>
  <div class="row">
    <div class="col-6 border text-center">
      <label > Seach by Location:</label>
      <input v-model='search_by_location'>
      </br>
    </div>

    <div class="col-6 border text-center">
      <label >Search by movie Tag:</label>
      <input v-model='search_by_tag'>
      </br>
    </div>
  </div>


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
                  
                  <button v-if='(show.seats - show.booked_seats) < 1' disabled> Housefull </button>  
                  <button v-else @click='book_show(show.id)'> Book Show </button>

                </div>
              </div>
            </div>
          </div>

          </br>
      </div>
      </div>
    </div>
  </div>

  <div>
    {{error}}
  </div>

  
</div>`,
data(){
  return{
    search_by_location:'',
    search_by_tag:'',
    venues:{},
    shows:{},
    all_venues:{},
    all_shows:{},
    search_location:'surat',
    error:null
  }
},

mounted(){
  fetch('http://localhost:5000/read_venue')
  .then((res) => {return res.json()})
  .then((data) => {console.log(data); this.all_venues = data})
  .then(()=> {console.log(this.venues); this.venues=this.all_venues})

  fetch('http://localhost:5000/read_show')
  .then((res) => {return res.json()})
  .then((data) => {console.log(data); this.all_shows = data})
  .then(()=> {console.log(this.shows); this.shows=this.all_shows})

},

methods:{
  book_show:function(show_id){      
    var message;
    console.log(show_id),
      fetch('http://localhost:5000/check_seats_availability/', {
      method: 'POST',
      body: JSON.stringify({
          show_id: show_id
        }),
      headers: {
          'Content-Type': 'application/json',
      },
      })
      .then((res) => {return res.json()})
      .then((data) => {console.log(data); message = data;})
      .then(()=>{
        console.log(message);
        if(message=='seats are not available'){
          this.$router.go('/')
        } else {this.$router.push({name:'book_show', params:{show_id:show_id}});
      }

      })  
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

watch:{
  search_by_location(NewValue){
    let dic={}
    for (let key in this.all_venues) {
      let string = this.all_venues[key]['location']
      if (string.includes(NewValue)){
        dic[key] = this.all_venues[key]
      }
      this.venues = dic
      }
    if(!NewValue){
      this.venues = this.all_venues
    }
    },
  

  search_by_tag(NewValue){
    let venue_dic={}
    let show_dic={}
    for (let key in this.all_shows){
      let string = this.all_shows[key]['tags']
      console.log(string)
      if (string.includes(NewValue)){
        show_dic[key]=this.all_shows[key]
        let id = this.all_shows[key]['venue_id']
        venue_dic[id.toString()] = this.all_venues[id.toString()]
      }
      this.venues = venue_dic
      this.shows = show_dic
      console.log(venue_dic)
      console.log(show_dic)
    }
    if(!NewValue){
      this.venues = this.all_venues
      this.shows = this.all_shows
    }
    
  }
  }
}