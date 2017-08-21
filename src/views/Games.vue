<template>
  <div class="games">
     <div id="loginmenu" class="overlay" style="z-index: 100; height: 1000px; margin-top: 0px">
      <div class="margintop" style="width:100%; height: 100px;"></div>
      <h1>Settrisk 3.0</h1>
      <div id="select_game" style="max-width: 300px; padding: 5px; margin: 0 auto; text-align: center; overflow: hidden; ">
        <div class="game" v-for="game in games">
          <div style="display: inline-block;" v-on:click="selectGame(game)">{{game.name}}<strong>{{ game.day }}</strong><p style="font-size: 16px; margin-top: -7px;"> {{ game.datum }} {{ game.kl }}</p></div>
          <div class="gamedrop"><button v-on:click="dropGame({id:game.id, name: game.name})">x</button></div>
        </div>
        <button id="game_btn" class="round_btn" v-on:click="newGame()">New game</button>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'games',
  data () {
    return {
      db_games: [
        {
          name: '',
          id: '',
          players: [],
          date: new Date(1502370507028)
        },{
          name: '',
          id: '',
          players: [],
          date: new Date(1502168496804)
        },
        {
          name: '',
          id: '',
          players: [],
          date: new Date(1501968496804)
        },
        {
          name: '',
          id: '',
          players: [],
          date: new Date(1501168496804)
        }
      ]      
    }
  },
  computed: {
    games: function(){
      var days = ['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag']
      var months = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December']

      return this.db_games = this.db_games.map(function(game){
        return {
          name:   game.name,
          id:     game.id,
          players: game.players,  
          date:   game.date,
          day:    (() => {
                    return game.date.toString().substr(0,15) == new Date().toString().substr(0,15) ? 'Idag' : days[game.date.getDay()] ;
                  })(),
          datum:  (() => {
                    return game.date.getDate()+' '+months[game.date.getMonth()];
                  })(),
          kl:     (() => {
                    return 'kl '+game.date.getHours()+':'+(game.date.getMinutes()<10?'0':'')+game.date.getMinutes();
                  })(),
          date_text: () => {return this.day+' '+this.datum+' '+this.kl }
        }
      }) 

    }
  },
  sockets:{
    connect: function(){
      console.log('socket connected')
    },
    authorized: function(val){
      console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
      console.log(val)
    }
  },
  mounted: function(){
    this.$emit('closeLoginPanel')
  },
  methods: {
    selectGame: function(game){
      console.log('Selected Game: '+game.date_text)
      //this.$socket.emit('', game)
      this.$emit('openLoginPanel', '/game/app')
    },
    newGame: function() {
      if(confirm('Vill du skapa ett nytt spel?')){
        this.$socket.emit('')
      }
    },
    dropGame: function(game){
      if(confirm('Är du säker på att du vill radera spelet? Det går ej att ångra.')){
        this.$socket.emit('', game)
      }
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
</style>
