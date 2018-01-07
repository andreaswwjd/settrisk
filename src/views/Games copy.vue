<template>
  <div class="games">
     <div id="loginmenu" class="overlay" style="z-index: 100; height: 1000px; margin-top: 0px">
      <div class="margintop" style="width:100%; height: 100px;"></div>
      <h1>Settrisk 3.0</h1>
      <div id="select_game" style="max-width: 300px; padding: 5px; margin: 0 auto; text-align: center; overflow: hidden; ">
        <div class="game" v-for="game in games" v-bind:key="game.id">
          <div class="innerbutton" style="left: 0;" v-on:click="gameSettings(game)">
            <i class="fas fa-cog" style="left: 20px; color: gray;" ></i>
          </div>
          <div class="innerbutton" style="right: 0;" >
            <i class="fas fa-pause" style="right: 20px; color: gray;" v-show="game.paused"></i>
            <i class="fas fa-play" style="right: 20px; color: #2ECC71;" v-show="!game.paused"></i>
          </div>
          <div style="display: inline-block;" v-on:click="selectGame(game)"><strong> {{game.name}} </strong>{{ game.time.day }}<p style="font-size: 16px; margin-top: -7px;"> {{ game.time.datum }} {{ game.time.kl }}</p></div>
          <!-- <div class="gamedrop"><button >x</button></div> -->
        </div>
        <button v-on:click="$router.push('/')" style="position: absolute; top: 20px; left: 20px;"> Back </button>
        <!-- <router-link to="/new/game"><button id="game_btn" class="round_btn" v-on:click="newGame()">New game</button></router-link> -->
        <button id="game_btn" class="round_btn" v-on:click="newGame()">New game</button>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'games',
  props: {
    games: Array
  },
  data () {
    return {

    }
  },
  computed: {
    
  },
  sockets:{
    newGameCreated: function(newgame){
      this.$router.push('/game/settings/' + newgame.id)
    }
  },
  mounted: function(){
    this.$emit('closeLoginPanel')
  },
  methods: {
    selectGame: function(game){
      console.log('Selected Game: '+game.date_text)
      //this.$socket.emit('', game)
      this.$emit('openLoginPanel', '/game/app/'+game.id)
    },
    newGame: function() {
      if(confirm('Vill du skapa ett nytt spel?')){
        this.$socket.emit('newGameDb')
      }
    },
    gameSettings: function(game){
      this.$socket.emit('getGame', game.id)
      this.$router.push('/game/settings/' + game.id)
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


/*LOGIN*/
#loginmenu {
      background: #E6CCA4;
      text-align: center;
    }

#loginmenu    .gamedrop { 
  position: absolute;
  background: #c0392b;
  border-radius: 20px;
  padding: 2px;
  margin-left: 57px;
  color: white;
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

.game {
  position: relative;
  width: 100%; 
  height: 37px; 
  margin: 5px 0; 
  background: #d8bd94; 
  border-radius: 5px; 
  vertical-align: middle; 
  font-size: x-large;
  padding: 13px 0;
  color: white;
}
.game.active{
  background: gray;
}
.gamedrop {
  width:20px; 
  height:20px; 
  border-radius: 50%; 
  background:#c0392b; 
  font-size: 13px;
  display: inline-block;
  right: 10px;
  color: white;
  margin-top: 7px;
}
#loginmenu .gamedrop>button {
border: none;
padding: 0;
min-width: 0;
background: inherit;
font-size: inherit;
font-weight: inherit;
color:white;
}

.innerbutton {
  position: absolute;
  top: 0;
  height: 63px;
  width: 63px;
}
.innerbutton > * {
  position: absolute;
  top: 20px;
  color: rgb(238, 238, 238);
}
</style>
