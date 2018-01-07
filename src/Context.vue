<template>
  <div id="context">
    <div id="curtain" v-bind:style="{height: curtain}" v-on:transitionend="curtainRollEnd()">
      <Login v-on:closeLoginPanel="curtainDown" v-bind:game="game" v-on:loggedIn="setUser" v-on:notify="notify"></Login>
    </div>
    <router-view id="router" v-on:notify="notify" v-on:openLoginPanel="curtainUp" v-on:closeLoginPanel="curtainDown" v-bind:games="games" v-bind:game="game" v-bind:user="user"></router-view>
    <notice v-bind:notesQ="notesQ" v-on:notify="notify" v-on:next="notesQ.shift()"></notice>

  </div>
</template>

<script>
import Router from 'vue-router'
import Login from './views/Login'
import Notice from '@/components/Notice'

export default {
  name: 'context',
  components: { Login, Notice },
  data() {
    return {
      curtain: '0%',
      destination: '',
      game_id: '',
      user: {},
      game: {name:'Loading...'},
      db_games: [],
      notesQ: [],
    }
  },
  computed: {
    games: function(){
      var days = ['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag']
      var months = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December']

      return this.db_games = this.db_games.map(function(game){
        game.date = new Date(game.date);
        game.time = {
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
        return game;
      }) 
    },
    // game: function(){
    //   if(this.game_id){
    //     return this.games.filter(g=>g.id==this.game_id)[0]
    //   }else{
    //     return {name:'Loading...'};
    //   }

    // }
  },
  methods: {
    notify: function(note){
      note.show=true;
      this.notesQ.push(note);
      console.log('notify',note)
      console.log('notesQ',this.notesQ)
    },
    curtainUp: function(dest_onend){
      this.curtain = '100%'
      if(dest_onend && dest_onend.substr(0,10)=='/game/app/'){
        this.game_id = dest_onend.substr(10);
        this.$socket.emit('getGame',this.game_id)
      }
      if(dest_onend){
        this.destination = dest_onend
      }
    },
    curtainDown: function(dest_onstart){
      this.curtain = '0%'
      if(dest_onstart){
        this.$router.push(dest_onstart)
      }
    },
    curtainRollEnd: function(){
      if(this.destination){
        this.$router.push(this.destination)
        this.destination = '';
      }
    },
    setUser: function(user){
      this.user = user;
    }
  },
  sockets: {
    games: function(games){
      console.log('Games:',games)
      this.db_games = games
    }, 
    game: function(game){
      console.log('Game:',game)
      this.game = game
    },
    data: function(data){
      if(data.type=="game"){
        this.game = game
      }
    },
    notify: function(note){
      this.notify(note);
    }
  },
  mounted: function(){
    document.body.touchmove = function(e){
      e.preventDefault()
      e.stopPropagation()
    }
    this.$socket.emit('getGames')
  }
}

</script>

<style>
#context {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0;
  display: block;
  position: relative
}
#curtain { 
  display: block;
  position: absolute; 
  /*position: fixed; */left:0px; bottom:0px; height:0%; width:100%; /*background: radial-gradient(at 40% 0%, #2ECC71, #1E8246) 0% 0% repeat scroll transparent;*/ z-index: 30;transition: 0.5s; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.45); overflow: hidden;
}
#router {
  transition: 0.3s filter;
}


</style>

