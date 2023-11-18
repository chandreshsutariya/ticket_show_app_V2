import router from './router.js'

new Vue({
  el: '#app',
  template: `
  <div>
      <div class="container-fluid" id="app">
      <nav class="navbar navbar-expand-lg bg-warning">
          <a class="navbar-brand" href="#">Ticket Show App</a>
          <div class="collapse navbar-collapse" id="navbarNav">
              <div class="navbar-nav">
                  <a class="nav-link mr-auto" aria-current="page"> <router-link to="/">{{current_user}}</router-link> </a>
                  <a class="nav-link" ><router-link to="/export_data">export_data</router-link></a>

                  <a class="nav-link mr-auto" > <button @click='logout'> Logout </button> </a>
              </div>
          </div>
      </nav>
    </div>
    
    <router-view></router-view>
  </div>`,
  router,

  data(){
    return{
      current_user:null,
    }
  },


  mounted(){
      fetch('http://localhost:5000/find_current_user/')
      .then((res) => {return res.json()})
      .then((data) => {console.log(data); this.current_user = data})
    },



    methods:{
      logout:function(){
        fetch('http://localhost:5000/update_timestamp')
        .then((res) => {return res.json})
        .then((date) => {console.log(data)})
        
        fetch('http://localhost:5000/logout')
        .then(() => localStorage.removeItem('auth-token'))
        .then(()=> window.location.href='/')
      }
    }
})
