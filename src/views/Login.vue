<template>
  <div id="login_page">
    <modal v-bind:modal="modal" v-on:register="register"></modal>
    <div id="loginmenu" class="overlay" style="z-index: 100; height: 1000px;">
      <div id="login" style="height:100%">
        <div class="margintop" style="width:100%; height: 150px;"></div>
        <h1>{{game.name}}</h1>
        <form id="login_form">
          <label id="reg_label" name="reg_label" v-show="registration">Ny</label>
          <input  v-model="username" v-on:keyup="checkUser()"  v-bind:class="{exists: username_exists}" class="focus" type="text" name="username" autocapitalize="words" placeholder="Namn" required>
          <!-- <label>Password</label> -->
          <input v-on:keyup="checkPass()" v-model="pin" v-bind:class="{exists: user_exists, no: password_filled && !right_pass, yes: password_filled && right_pass}" placeholder="...." type="pin" name="password" value="" pattern="\d*" maxlength="4" size="4" style="-webkit-text-security: disc;" required>
          <button v-on:click="submitLoginForm" >{{ registration ? "Registrera" : "Logga in"}}</button>
          <button v-on:click="closeLoginPanel('/games')" style="position: absolute; top: 20px; left: 20px;"> Back </button>
        </form>
        <p v-if="registration&&username">Det ser ut som att du <br>inte är registrerad på spelet. </p>
        
        <div style="bottom:20px; position: absolute; width: 100%">
          <p><strong>Tips:</strong> lägg denna sida på hem-<br>skärmen så får du helskärm.</p>
          <div><i class="fas fa-arrow-down"></i></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Modal from '../components/Modal'

export default {
  name: 'login',
  components: { Modal },
  props:{
    game: Object
  },
  data () {
    return {
      registration: true,
      username: '',
      pin: '',
      user_exists: false,
      username_exists: false,
      right_pass: false,
      modal: {
        type: ''
      }
    }
  },
  computed: {
    password_filled: function(){
      return this.pin.toString().length == 4;
    }
  },
  sockets:{
    user_exists: function(exists) {
      if(exists){
        console.log('Username exists!')
        this.registration = false;
        this.username_exists = true;
      }
    },
    authorized: function(authorized){
      this.right_pass = false;
      if(authorized){
        console.log('authorized')
        this.right_pass = true;
        this.user_exists = true;
      }
    },
    login: function(user){
      if(user){
        console.log('Logging in')
        this.closeLoginPanel()
        this.$emit('loggedIn', user)
        this.$emit('notify', {html: '<p>Välkommen <strong>'+user.name+'</strong></p>', show: true})
        this.$socket.emit('initApp',this.$props.game, user)

      }
    },
    registration_done: function(done){
      if(done){
        console.log('Loging in')
        // this.closeLoginPanel()
      }
    },
    // games: function(games){
    //   console.log('games',games)
    //   console.log('this',this.game)
    //   const id = this.$route.params.id;
    //   this.game = games.filter(g => g.id==id)[0]
    // },
  },
  methods: {
    submitLoginForm: function(e){
      e.preventDefault()
      // Bypass
      // this.closeLoginPanel()
      
      if(!this.username || !this.pin){
        this.modal = {
          type: 'alert',
          action: '',
          isOpen: true,
          title: "Fel",
          msg: "Du måste ange namn och pinkod."
        }
      }else if(this.registration){
        this.modal = {
          type: 'confirm',
          action: 'register',
          isOpen: true,
          title: "Ny spelare?",
          msg: "Be admin för spelet lägga till dig i inställningarna för spelomgången."
          // msg: "Är du säker att du vill registrera en ny spelare i det här spelet?"
        }
      }else{
        this.$socket.emit('login', {id: this.game.id, username: this.username, pin: Number.parseInt(this.pin) })
      }
      //this.$socket.emit('login', {username: this.username, pin: this.pin })
//      window.location = "http://localhost:8080/#/component/"
    },
    closeLoginPanel: function(destination){
      this.$emit('closeLoginPanel', destination)
    },
    checkUser: function() {
      console.log('Check User...')
      this.username_exists = false;
      this.$socket.emit('checkUser', {id: this.game.id, username: this.username })
    },
    checkPass: function() {
      this.right_pass = false;
      if(!this.registration){
        console.log('Check pin...')

        this.$socket.emit('checkPass', {id: this.game.id,username: this.username, pin: Number.parseInt(this.pin) })
      }
    },
    register: function(confirm){
      if(confirm){
        console.log('Register new user!')
        this.closeLoginPanel()
      }
    }
  },
  mounted: function(){

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

input.exists {
  background: #2ECC71 !important;
}

.yes {
  animation: yes 0.6s;
}
.no {
  animation: no 0.5s;
}

/*LOGIN*/
#loginmenu {
      background: #F0D4AA;
      text-align: center;
    }
#loginmenu    input {
      display: block;
      margin: 10px auto;
      text-align: center; 
      font-weight: 100;
      font-size: x-large;
      color: white;
      vertical-align: middle;
      border: none;
      border-radius: 20px;
      background: #E0C69F;
      width: 140px;
      transition: 0.5s background-color, 0.2s width;
      height: 40px;
      /*padding: 8px;*/
    }
#loginmenu    input:focus, #loginmenu button:focus {
      border-color: #f1c40f;
      color: white;
      outline: none;
    }
#loginmenu    input:focus {
      font-weight: 700;
      width: 160px;
    }
#loginmenu    input.focus:focus, #loginmenu  button:focus{
      background-color: #f1c40f;
    }
#loginmenu    button {
      border: solid white 1px;
      border-radius: 20px;
      padding: 8px;
      min-width: 38px;
      background: #F0D4AA;
      color: white;
      font-weight: 200;
      opacity: 1;
      font-size: large;
    }
#loginmenu    button:disabled {
      opacity: 0.3;
    }
#loginmenu    .pass {
      background-image: linear-gradient(#f1c40f, #f1c40f);
      background-repeat: no-repeat;
      background-position-x: -200px;
    }
#loginmenu    #reg_label { 
      position: absolute;
      background: #2ECC71;
      border-radius: 20px;
      padding: 2px;
      margin-left: 57px;
      color: white;
    }
    @keyframes no {
      100% {-webkit-transform: translateX(0);}
      60% {-webkit-transform: translateX(10px);}
      40% {-webkit-transform: translateX(-10px);}
      15% {-webkit-transform: translateX(10px);}
      from {-webkit-transform: translateX(0);}
    }
    @keyframes yes {
      100% {-webkit-transform: translateY(0) rotate(0deg);}
      90% {-webkit-transform: translateY(-5px) rotate(3deg);}
      80% {-webkit-transform: translateY(0) rotate(0deg);}
      50% {-webkit-transform: translateY(-5px) rotate(-2deg);}
      40% {-webkit-transform: translateY(0) rotate(0deg);}
      10% {-webkit-transform: translateY(-5px) rotate(1deg);}
      from {-webkit-transform: translateY(0);}
    }
    @keyframes yesen {
      100% {-webkit-transform: translateY(0);}
      30% {-webkit-transform: translateY(-5px);}
      from {-webkit-transform: translateY(0);}
    }

</style>
