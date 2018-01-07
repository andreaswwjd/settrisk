<template>
  <div class="new">
    <div class="margintop" style="width:100%; height: 100px;"></div>
    <h1>Ny spelare</h1>
    <input  v-model="name" type="text" name="username" autocapitalize="words" placeholder="Namn" required>
    <input  v-model="lastname" type="text" name="username" autocapitalize="words" placeholder="Efternamn" required>
    <input  v-model="username" type="text" name="username" autocapitalize="words" placeholder="Användarnamn" required>
    <!-- <input v-model="password" type="password" name="password" placeholder="Lösenord" value="" size="8" style="-webkit-text-security: disc;" required> -->
    <input v-model="pin" type="pin" name="pin" placeholder="Pinkod (4 siffror)" value="" pattern="\d*" maxlength="4" size="4" style="-webkit-text-security: disc;" required>
    <!-- <label>Password</label> -->
    <h1>Välj färg</h1>
    <div class="colorgrid"><div v-on:click="color = hex" v-for="hex in colors" v-bind:key="hex" v-bind:style="{background: hex}" v-bind:class="{selected: color==hex}"><i class="fas fa-check"></i></div></div>
    <button class="register" v-on:click="submitAddUser" >Registrera</button>
    <router-link to="/"><button style="position: absolute; top: 20px; left: 20px;"> Back </button></router-link>
    <div class="box">
      <div class="user" v-for="user in users" v-bind:key="user.username" v-bind:style="{background: user.color}">
        <h2>{{user.name + ' ' + user.lastname}}</h2>
        <p>{{'@'+ user.username + ' (tillagd ' + new Date(user.dateAdded).getDate() +' '+ months[new Date(user.dateAdded).getMonth()]+')'}}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'newuser',
  data () {
    return {
      name: '',
      lastname: '',
      username: '',
      // password: '',
      pin: '',
      color: '',
      colors: ['#1abc9c', '#16a085', '#2ecc71', '#27ae60', '#3498db', '#2980b9', '#9b59b6', '#8e44ad', '#f1c40f', '#f39c12', '#e67e22', '#d35400',  '#e74c3c', '#c0392b', '#bdc3c7', '#95a5a6'],
      users: [],
      months: ['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december']
    }
  },
  computed: {
    
  },
  mounted: function(){
    this.$socket.emit('getUsers')
  },
  sockets:{
    userAdded: function(res){
      if(res.errors){
        console.log('Something went wrong when the user was added...')
      }else{
        this.name = this.lastname = this.username = this.password = this.pin = this.color = ""
        this.$socket.emit('getUsers')
      }
    },
    users: function(users){
      console.log('Users:',users)
      this.users = users
    },
  },
  methods: {
    submitAddUser: function(){
      if(Number.parseInt(this.pin).toString().length==4){
        this.$socket.emit('submitAddUser', {
          name: this.name,
          lastname: this.lastname,
          username: this.username,
          password: this.password,
          // dateAdded: new Date(),
          color: this.color,
          pin: (Number.parseInt(this.pin))
        })
      }
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

input {
    font-size: 2em;
    max-width: 300px;
    margin: 10px auto;
    width: 80%;
    display: block;
    border-radius: 5px;
    border: none;
    padding: 5px;
}
input[type="text"] {
}
button.register {
    font-size: 1.4em;
    max-width: 300px;
    margin: 10px auto;
    background-color: #4CAF50; /* Green */
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: block;
    border-radius: 50px;
}
button {
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

.box{
  max-width: 300px;
  margin: 5px auto;
  position: relative;
  width: 100%; 
  height: 100%; 
  background: #e6cda7; 
  border-radius: 5px; 
  vertical-align: middle; 
  padding: 13px 0;
  color: white;
}

.user {
    border-radius: 30px;
    margin: 10px 20px;
    padding: 5px;
}

.colorgrid {
    display: grid;
    width: 310px;
    height: 250px;
    margin: 0 auto;
    border-radius: 10px;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
    overflow: hidden;
}
.colorgrid .fa-check {
  display: none;
}
.colorgrid .selected .fa-check {
  display: block;
  color: white;
}
.colorgrid .selected {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5em;
}
</style>
