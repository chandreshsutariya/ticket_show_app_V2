import router from './router.js'

new Vue({
  el: '#app',
  template: `
  <div>
        <div class="row">
          <div class="col-6 border text-center">
            <h2>Sign Up</h2>

                <label for="email">Email:</label>
                <input type="email" id="email" v-model='email' required>
                </br>

                <label for="password">Password:</label>
                <input type="password" v-model='password' required>
                </br>

                <button class="btn btn-outline-success" @click='signup'>Sign Up</button>


          </div>


          <div class="col-6 border text-center">
            <h2>Log In</h2>
            <a href="/loginn">
              <button type="button" class="btn btn-outline-success"> Login </button>
            </a>
          </div>
      </div>

      
      <div>
        Email comment: {{error}}
        </br>
        Password comment: {{error2}}
        </br>
        {{final_comment}}
      </div>

      
  </div>`,
  router,

  data(){
    return{
      email:'',
      password:'',
      error:"Email can't be empty",
      error2:"Password can't be empty",
      final_comment:'',
      emails:[],
      IsEmailOk:'no',
      IsPasswordOk:'no'
    }
  },

  mounted(){
      fetch('http://localhost:5000/read_users/')
      .then((res) => {return res.json()})
      .then((data) => {console.log(data); this.emails = data['1']})
      .then(()=>console.log(this.emails))
  },

  methods:{
    signup:function(){
        console.log(this.IsEmailOk);
        console.log(this.IsPasswordOk)
        if (this.IsEmailOk=='yes' && this.IsPasswordOk=='yes'){
          fetch('http://localhost:5000/signup/', {
          method: 'POST',
          body: JSON.stringify({
              email: this.email,
              password: this.password,}),
          headers: {
              'Content-Type': 'application/json',
          },
          })
          .then((res) => {return res.json()})
          .then((data) => {console.log(data); this.final_comment = data})
      }
}
},

  watch:{
    email(NewValue){
      if (!this.email){
        this.error = "Email can't be empty"
        this.IsEmailOk = 'no'
      } else if (!this.email.includes('@')){
        this.error = "the email must include '@'.";
        this.IsEmailOk = 'no'
      } else if (!/\.[^.]+$/.test(this.email)){
        this.error = "the email must include endpoint."
        this.IsEmailOk = 'no'
      } else if (this.emails.includes(NewValue)){
        this.error = 'this email is already there.'
        this.IsEmailOk = 'no'
      } else{
        this.error = 'email looks fine.'
        this.IsEmailOk = 'yes'
      }
      },
    
    password(NewValue){
      if (!this.password){
        this.error2 = "Password can't be empty."
        this.IsEmailOk = 'no'
      } else{
        this.error2 = "Password looks fine."
        this.IsPasswordOk = 'yes'
      }
    }


      }
})
