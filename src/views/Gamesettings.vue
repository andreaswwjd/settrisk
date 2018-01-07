<template>
  <div class="new">
    <div class="margintop" style="width:100%; height: 100px;"></div>
    
    <h1>Inställningar</h1>
    <p>Glöm inte bort att spara.</p>
    <div><button v-on:click="activateGame()" class="lockbtn" v-bind:style="{background: !game.state.active?'#f1c40f':'#f0d5aa'}" v-html="lockbtnHTML">{{!game.state.active?'Lås inställningar':'Låst'}}</button></div>
    <div><button v-on:click="pauseToggle()" v-show="game.state.active" class="pausebtn" v-bind:style="{background: game.state.paused?'#f1c40f':'indianred'}" v-html="playbtnHTML"></button></div>
    
    <h1>Namn</h1>
    <div class="box"><input class="nameinput" v-model="game.name" type="text" name="username" autocapitalize="words" required></div>
    
    <h1>Datum</h1>
    <h2 class="box">{{game.date}}</h2>
    
    <h1 class="starter">Lägg till spelare</h1>
    <div class="adduser">
      <input  v-model="userinput" v-on:keyup="checkUser()" v-bind:class="{exists: username_exists}" class="adduserinput" type="text" name="username" autocapitalize="words" placeholder="Sök..." required>
      <button v-on:click="addUser(userinput)"><i class="fas fa-plus" style="right: 20px; "></i></button>
      <div v-bind:key="user.username" v-for="user in game.players" v-if="game.players[0]">
        <h2>{{user.name + ' ' + user.lastname}}</h2>
        <p>{{'@'+ user.username }}</p>
      </div>
    </div> 

    <h1 class="starter">Välj spelplan</h1>
    <div class="charusell box">
      <div class="inner" v-bind:style="{marginLeft: slideX+'vw'}" v-bind:class="{transition: slidetransition}" v-on:touchstart="slidestart" v-on:touchmove="slidemove" v-on:touchend="slideend" v-on:transitionend="slidetransitionend">
        <section v-bind:class="{selected: boardgame.id==game.boardgame.id}" v-for="boardgame in boardgames" v-bind:key="boardgame.id">
          <svg width="100%" height="83%" viewBox="0 0 600 498" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g id="svg-map">
              <g v-for="bp in boardgame.boardpieces" :key="bp.id">
                <field v-for="field in bp.fields" :key="field.refid" class="passive" v-bind:field="field" ></field>
              </g>
              <g v-for="bp in boardgame.boardpieces" :key="bp.id+'ii'">
                <boardpiece v-bind:boardpiece="bp" >
                  <g>
                    <road v-for="road in bp.roads" :key="road.id" v-bind:road="road" ></road>
                    <buildsite v-for="buildsite in bp.buildsites" :key="buildsite.id" v-bind:buildsite="buildsite" ></buildsite>
                  </g>
                </boardpiece>
              </g>
            </g>
          </svg>
          <button style="margin-top: -20px;" v-if="!game.active" v-on:touchend.prevent.stop="setBoardgame(boardgame)">Välj</button>
        </section>
      </div>
    </div>

    <h1 class="starter">Starters</h1>
    <div class="plusminusbutton" v-bind:key="key" v-for="(val,key) in game.types.resurser" v-if="game.types.resurser">
      <div class="innerbutton" style="left: 0;" v-on:click="removeStarterResurs(key)">
        <i class="fas fa-minus" style="left: 20px; color: indianred;" ></i>
      </div>
      <div class="innerbutton" style="right: 0;" v-on:click="addStarterResurs(key)">
        <i class="fas fa-plus" style="right: 20px; color: #4CAF50"></i>
      </div>
      <div style="display: inline-block;" ><strong> {{key}} <span style="float:right">{{starters.resurser[key] || 0}}st</span></strong></div>
    </div>

    <h1 class="starter">Byggnader</h1>
    <div class="plusminusbutton" v-bind:class="{inactive: buildingTypes[key].inactive? true:false}" v-bind:key="key" v-for="(val,key) in buildingTypes" v-if="buildingTypes">
      <div class="innerbutton" style="left: 0;" v-on:click="removeStarterByggnad(key)">
        <i class="fas fa-minus" style="left: 20px; color: indianred;" ></i>
      </div>
      <div class="innerbutton" style="right: 0;" v-on:click="addStarterByggnad(key)">
        <i class="fas fa-plus" style="right: 20px; color: #4CAF50;"></i>
      </div>
      <div style="display: inline-block;" ><strong> {{key}} <span style="float:right">{{starters.byggnader[key] || 0 }}st</span></strong></div>
    </div>

    <h1 class="starter">Armer</h1>
    <div class="plusminusbutton" v-bind:class="{inactive: armyTypes[key].inactive? true:false}" v-bind:key="key" v-for="(val,key) in armyTypes" v-if="armyTypes">
      <div class="innerbutton" style="left: 0;" v-on:click="removeStarterArmy(key)">
        <i class="fas fa-minus" style="left: 20px; color: indianred;" ></i>
      </div>
      <div class="innerbutton" style="right: 0;" v-on:click="addStarterArmy(key)">
        <i class="fas fa-plus" style="right: 20px; color: #4CAF50;"></i>
      </div>
      <div style="display: inline-block;" ><strong> {{key}} <span style="float:right">{{starters.infanteri[key] || 0}}st</span></strong></div>
    </div>

    <button class="deletebtn" v-on:click="dropGame({id:game.id, db: game.db})" style="right: 0; background: indianred" >
      Delete game <i class="fas fa-trash-alt" style="right: 20px; color: rgb(175, 82, 82)"></i>
    </button>
    
    <button v-on:click="saveGameSettings()" style="position: absolute; top: 20px; right: 20px;"> Save </button>
    <router-link to="/games"><button style="position: absolute; top: 20px; left: 20px;"> Back </button></router-link>
  </div>
</template>

<script>
import Boardpiece from '@/components/Boardpiece'
import Field from '@/components/Field'
import Road from '@/components/Road'
import Buildsite from '@/components/Buildsite'

export default {
  name: 'gamesettings',
  components: { Boardpiece, Field, Road, Buildsite },
  props: {
    game: Object
  },
  data () {
    return {
      userinput: '',
      username_exists: false,
      slidetransition: false,
      slidecurrent: 0,
      move: 0,
      
      boardgames: [],
      game: {
        date: '', 
        id: this.$route.params.id,
				name: '', 
        db: '', 
        active: false,
        paused: true,
        dices: {
          player: '',
          a: 0,
          b: 0,
          turns: 0
        },
        gameStarted: '',
        runTimeBetweenPauses: [],
        runTime: 0,
        archived: false,
        players: [],
        boardgame: {},
        // boardgame_id: ''; Ska man separera types, starters och boardgame till den dedikerade db? Mindre klutter...
        // resurser: {},
        types: {
          resurser: {},        
          infanteri: {},         
          byggnader: {},         
        },
				starters: {
					resurser: [],
					infanteri: [],
					byggnader: []
				}
			}
    }
  },
  computed: {
    armyTypes: function(){
      // return this.game.types.filter(t=>t.category=='army')
      return this.game.types.armyitems
    },
    buildingTypes: function(){
      // return this.game.types.filter(t=>t.category=='building')
      return this.game.types.buildingitems
    },
    slideX: function(){
      return this.slidecurrent + this.move * 100/screen.availWidth;
    },
    playbtnHTML: function(){
      return this.game.state.paused ? 
      '<i class="fas fa-play" style="left: 20px; color: #2ECC71;" ></i> Starta' : 
      '<i class="fas fa-circle" style="left: 20px; color: rgb(175, 82, 82);" ></i> Pausa';
    },
    lockbtnHTML: function(){
      return !this.game.state.active ? 
      '<i class="fas fa-lock-open" style="left: 20px; color: gray;" ></i> Lås inställningar' : 
      '<i class="fas fa-lock" style="left: 20px; color: darkgray;" ></i> Låst';
    },
    starters: function(){
      let resurser = {}
      Object.keys(this.game.types.resurser).map((restype) => {
        let nr_of_restype = this.game.starters.resurser.filter(resurs=>resurs.type==restype).length
        if(nr_of_restype){
          resurser[restype] = nr_of_restype;
        }
      })
      let byggnader = {}
      Object.keys(this.game.types.buildingitems).map((byggtype) => {
        let nr_of_byggtype = this.game.starters.byggnader.filter(bygg=>bygg.type==byggtype).length
        if(nr_of_byggtype){
          byggnader[byggtype] = nr_of_byggtype;
        }
      })
      let infanteri = {}
      Object.keys(this.game.types.armyitems).map((armytype) => {
        let nr_of_armytype = this.game.starters.infanteri.filter(bygg=>bygg.type==armytype).length
        if(nr_of_armytype){
          infanteri[armytype] = nr_of_armytype;
        }
      })
      return {
        resurser: resurser,
        byggnader: byggnader,
        infanteri: infanteri 
      }
    }
  },
  mounted: function(){
    this.$socket.emit('getGame',this.$route.params.id)
    this.$socket.emit('getDbBuilderData')
  },
  sockets:{
    user_exists: function(exists) {
      if(exists){
        console.log('Username exists!')
        this.username_exists = true;
      }
    },
    game: function(game){
      console.log('games',game)
      console.log('this',this)
      this.game = game;
    },
    addUser: function(user){
      this.game.players.push(user)
      this.userinput = '';
      this.username_exists = false
    },

    receiveBuilderData: function(data){
      this.boardgames = data.boardgames;
    },

  },
  methods: {
    checkUser: function() {
      console.log('Check User...')
      if(this.game.players.filter(p=>p.username==this.userinput)[0]){return}
      this.username_exists = false
      this.$socket.emit('checkUser', {username: this.userinput })
    },
    addUser: function(username){
      if(this.game.players.filter(p=>p.username==this.userinput)[0]){return}
      this.$socket.emit('getUser', {username: username})
    },
    saveGameSettings: function(){
      this.$socket.emit('saveGameSettings', this.game)
    },
    addStarterResurs: function(type){
      console.log('Add type %s.',type)
      this.game.starters.resurser.push({
        username: '',
        type:type,
        x:Math.random()*300+30,
        y:Math.random()*450+120,
        location:'panel'
      });
    },
    removeStarterResurs: function(type){
      console.log('Remove type %s.',type)
      let flag = true
      this.game.starters.resurser.map((r,i,a)=>{
        if( r.type == type && flag){ 
          a.splice(i,1);
          flag = false;
        }
      })
    },
    addStarterByggnad: function(type){
      console.log('Add type %s.',type)
      let bitem = this.buildingTypes[type]
      if(bitem.inactive){ 
        bitem.inactive = false;
      }else{
        this.game.starters.byggnader.push({
            type: bitem.name,
            pos: {x:0, y:0},
            fields: [],
            utdelning: bitem.utdelning || undefined,
            bonus: bitem.bonus || undefined,
            isBuild: false,
            yieldStat: ['By','Stad','Storstad','Fabrik'].indexOf(bitem.name) != -1 ? {} : undefined 
        })
      }
    },
    removeStarterByggnad: function(type){
      console.log('Remove type %s.',type)
      let flag = true
      if(!this.starters.byggnader[type]){
        this.buildingTypes[type].inactive = true;
        console.log('Inactivate %s', type)
      } else {
        this.game.starters.byggnader.map((b,i,a)=>{
          if( b.type.replace(' ', '_') == type && flag){ 
            a.splice(i,1);
            flag = false;
          }
        })
      }
    },
    addStarterArmy: function(type){
      console.log('Add type %s.',type)
      let aitem = this.armyTypes[type]
      if(aitem.inactive){ 
        aitem.inactive = false;
      }else{
        this.game.starters.infanteri.push(aitem)
      }
    },
    removeStarterArmy: function(type){
      console.log('Remove type %s.',type)
      let flag = true
      if(!this.starters.infanteri[type]){
        this.armyTypes[type].inactive = true;
        console.log('Inactivate %s', type)
      } else {
        this.game.starters.infanteri.map((b,i,a)=>{
          if( b.name.replace(' ', '_') == type && flag){ 
            a.splice(i,1);
            flag = false;
          }
        })
      }
    },
    pauseToggle: function(){
      this.$socket.emit('pauseToggle', {id: this.game.id, paused: !this.game.paused})
    },
    dropGame: function(game){
      if(confirm('Är du säker på att du vill radera spelet ('+this.game.name+')? Det går ej att ångra.')){
        this.$socket.emit('dropGameDb', game)
      }
    },
    activateGame: function(){
      this.saveGameSettings()
      if(confirm('Påbörjar du spelet ('+this.game.name+') går vissa inställningar ej att ändra. Vill du aktivera spelet?')){
        this.$socket.emit('activateGame', this.game)
        this.game.active = true;
      }
    },

    slidestart: function(e){
      if(screen.availWidth >= 800 && this.boardgames.length <= 4){return}
      this.slidetransition = false
      this.start = e.touches[0].clientX;
    },
    slidemove: function(e){
      if(screen.availWidth >= 800 && this.boardgames.length <= 4){return}
      let left = this.move < 0,
          right = this.move > 0,
          noleft = false,
          noright = false;

      if(screen.availWidth < 800){
        noright = this.slidecurrent >= 0 && right;
        noleft = this.slidecurrent <= (this.boardgames.length-1)*(-100) && left;
      }else{
        noright = this.slidecurrent >= 0 && right;
        noleft = this.slidecurrent <= (this.boardgames.length/4-1)*(-100)*800/screen.availWidth && left;
      }

      this.move = noright || noleft ? (e.touches[0].clientX - this.start)/2 : this.move = e.touches[0].clientX - this.start ;
    },
    slideend: function(e){
      if(screen.availWidth >= 800 && this.boardgames.length <= 4){return}
      this.slidetransition = true
      let left = this.move < 0,
          right = this.move > 0,
          noleft = false,
          noright = false;

      if(screen.availWidth < 800){
        noright = this.slidecurrent >= 0 && right;
        noleft = this.slidecurrent <= (this.boardgames.length-1)*(-100) && left;
      }else{
        noright = this.slidecurrent >= 0 && right;
        noleft = this.slidecurrent <= (this.boardgames.length/4-1)*(-100)*800/screen.availWidth && left;
      }

      if( noright || noleft ){
        this.move = 0;
        return
      }
      if(screen.availWidth < 800){
        if( this.move < -10 || this.move > 10 ){
          this.move > 0 ? this.slidecurrent += 100 : this.slidecurrent -= 100;
        }
      }else{
        if( this.move < -10 || this.move > 10 ){
          this.move > 0 ? this.slidecurrent += 100*800/screen.availWidth : this.slidecurrent -= 100*800/screen.availWidth;
        }
      }
      this.move = 0;
      
    },
    slidetransitionend: function(e){
      this.slidetransition = false
    },

    setBoardgame: function(boardgame){
      if(this.game.active){ return }
      this.game.boardgame = boardgame
    },
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
button {
  border-radius: 5px; 
  vertical-align: middle; 
  font-size: x-large;
  padding: 13px 0;
    max-width: 300px;
    margin: 10px auto;
    background-color: #d8bd94; /* Green */
    border: none;
    color: white;
    padding: 7px 16px;
    text-align: center;
    text-decoration: none;
    display: block;
    border-radius: 50px;
}

.plusminusbutton{
  max-width: 360px;
  margin: 5px auto;
  position: relative;
  width: 100%; 
  height: 37px; 
  background: #d8bd94; 
  border-radius: 5px; 
  vertical-align: middle; 
  font-size: x-large;
  padding: 13px 0;
  color: white;
}

.plusminusbutton > *{
  display: block;
    width: 60%;
    /* text-align: left; */
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

.adduser > button {
    display: inline-block;
}
input.nameinput{
  /* background:#e6cda7; */
    color: gray;
}
.adduserinput, .nameinput {
    display: inline-block;
    margin: 10px auto;
    text-align: left;
    padding-left: 20px;
    font-weight: 300;
    font-size: x-large;
    color: gray;
    vertical-align: middle;
    border: none;
    border-radius: 20px;
    background: #f5e9d7;
    width: 140px;
    -webkit-transition: 0.5s background-color, 0.2s width;
    transition: 0.5s background-color, 0.2s width;
    height: 40px;
}
.nameinput, .deletebtn, .pausebtn, .lockbtn{
  width: 100%;
  max-width: 250px;
}
.deletebtn, .pausebtn, .lockbtn{
  margin: 40px auto;
}
.adduserinput:focus, .nameinput:focus {
  background-color: #f1c40f;
  font-weight: bold;
}

.adduser, .box{
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
input.exists {
  background: #2ECC71 !important;
}

.starter {
    margin-top: 40px;
}

.plusminusbutton.inactive {
    opacity: 0.4;
}
.plusminusbutton.inactive strong:after {
    content: '';
    width: 60%;
    height: 3px;
    background: indianred;
    position: absolute;
    top: 50%;
    left: 20%;
}

.charusell {
  height: 100%;
  width: 100%;
  max-width: 800px;
  overflow: hidden;
}
.charusell .inner{
  display: flex;
  width: 100000px;
  margin-left: 0vw;
}
.charusell .inner.transition{
  transition: 0.3s margin;
}
section {
  width: 100vw;
  max-width: 800px;
  position: relative;
}
section.selected:after {
    content: '';
    width: 90%;
    height: 90%;
    position: absolute;
    border: rgb(76, 175, 80) solid 3px;
    border-radius: 20px;
    top: 5%;
    left: 5%;
}

@media screen and (min-width:  800px) {
  section{
    width: 400px;
    height: 400px;
  }
  .charusell .inner{
    height: 800px;
  }
  
}

</style>
