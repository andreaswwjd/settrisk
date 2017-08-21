<template>
  <div id="login_page">
    <div id="loginmenu" class="overlay" style="z-index: 100; height: 1000px;">
      <div id="login" >
        <div class="margintop" style="width:100%; height: 150px;"></div>
        <h1>Logga in</h1>
        <form id="login_form">
          <label id="reg_label" name="reg_label" v-show="registration">Ny</label>
          <input  v-model="username" class="focus" type="text" name="username" autocapitalize="words" onkeyup="checkUser()" placeholder="Namn" required>
          <!-- <label>Password</label> -->
          <input v-on:keyup="checkPass()" v-model="password" placeholder="...." type="pin" name="password" value="" pattern="\d*" maxlength="4" size="4" style="-webkit-text-security: disc;" required>
          <button v-on:click="submitLoginForm" >{{ registration ? "Registrera" : "Logga in"}}</button>
          <button v-on:click="closeLoginPanel('/games')" style="position: absolute; top: 20px; left: 20px;"> Back </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      registration: true,
      username: '',
      password: ''
    }
  },
  computed: {
    
  },
  sockets:{
    authorized: function(val){
      console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
      console.log(val)
    }
  },
  methods: {
    submitLoginForm: function(e){
      e.preventDefault()
      this.closeLoginPanel()
      //this.$socket.emit('login', {username: this.username, password: this.password })
//      window.location = "http://localhost:8080/#/component/"
    },
    closeLoginPanel: function(destination){
      this.$emit('closeLoginPanel', destination)
    },
    checkPass: function() {
      console.log('Check Password...')
      this.$socket.emit('checkPass', {username: this.username, password: this.password })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

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
