export default {
    template: `
    <div>
    
    <div  v-for='booking in bookings'>

        <div class="card">
            <div class="card-body">
                <h4 class="card-title"> {{booking.show_name}} </h4>
                    <p class="card-text"> 
                        Date: {{booking.show_date}}</br>
                        Time: {{booking.timing_starts}} to {{booking.timing_ends}}</br>
                        
                        <h6>
                        price: {{booking.show_price}}</br>
                        Seats booked: {{booking.seats_booked}} </br>
                        Total Amount: {{booking.show_price * booking.seats_booked}}
                        </h6>
                    </p>
            </div>
        </div>
    </div>

 
    </div>`,
    
    data(){
      return{
        bookings:{}
      }
    },

    mounted(){
        fetch('http://localhost:5000/read_bookings/')
        .then((res) => {return res.json()})
        .then((data) => {console.log(data); this.bookings = data})
    },
}