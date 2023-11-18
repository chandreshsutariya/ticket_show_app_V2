export default {
    template: `
    <div>
    </br>
    <div>
        <h5> Here you can export data of a theater in .csv format </h5>
    </div>

      <div>
        <div class="row">
          <div class="card col-4 my-3 mx-3" style="width: 18rem;" v-for="venue in venues">
            <div class="card-body" >
              <h2 class="card-title">{{venue.venue_name}}</h2>
              
              
              <button @click='export_data(venue.id)'> Export data </button>
              </br>
              </br>
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
        venues:{},
        error:null,
        venue_name:''
      }
    },
    
    mounted(){
      fetch('http://localhost:5000/read_venue')
      .then((res) => {return res.json()})
      .then((data) => {console.log(data); this.venues = data})
      .then(()=> {console.log(this.venues); this.venue_length=Object.keys(this.venues).length})
    
    },
    
    methods:{
      export_data(venue_id){      
        console.log(venue_id),
        fetch('http://localhost:5000/trigger_export_data_job', {
        method: 'POST',
        body: JSON.stringify({
            venue_id: venue_id
        }),
        headers: {
            'Content-Type': 'application/json',
        },
        })
        .then((res) => {return res.json()})
        .then((data) => {
            console.log(data); 
            this.error = data;
            this.venue_name=data.venue_name
            return data
        })
        .then((data)=>{
            const vm=this;
            let interv = setInterval(function(){
                fetch('http://localhost:5000/find_status_of_the_job', {
                    method: 'POST',
                    body: JSON.stringify({
                        task_id: data.task_id
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                .then((res) => {return res.json()})
                .then((data) => {
                            console.log(data); 
                            if(data.task_state==='SUCCESS'){
                                console.log('task is completed!!')
                                clearInterval(interv)
                                vm.error = data
                                window.location.href = "/static/"+vm.venue_name+".csv";
                            } else{
                                console.log('task is still running!!')
                            }
                        })
            },1000)
        })       
    },

    
    }
}