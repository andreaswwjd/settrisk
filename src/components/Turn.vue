<template>
  <div class="overlay">
    <div class="menuitem transition" v-bind:style="{height: height, transform: 'translateX(-'+(current+x)*100+'vw)'}" v-on:touchstart="tstart" v-on:touchmove.prevent="tmove" v-on:touchend="tend" v-on:transitionend="transend" style="">
      <section>
      </section>
      <section>
        <h1>Din tur!</h1>
        <div v-html="dicesHTML"></div>
        <button class="button" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?rollDices():'';" v-bind:disabled="turn.rolled" v-on:click.prevent>Slå tärningarna</button>
      </section>

      <!-- <section style="display: none"> -->
      <section >
          <h1>Nytt händelsekort!</h1>
        <div class="card" style="width: 300px; height: 400px">
          <h1>Torka</h1>
          Beskrivning av händelsekort här
        </div>
        <button class="button" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?next():'';" v-on:click.prevent>Nästa</button>
      </section>

      <section>
        <span>
          <h1 style="margin:-8px 0">{{turn.moves.length!=3? 'Vad vill du göra?':'Done!'}}</h1>
          <svg v-for="i in [0,1,2]" height="53" width="53" viewBox="-20 -20 40 40" v-bind:class="{animat: turn.moves[i]!=undefined}" v-bind:style="{stroke: turn.moves[i]? '#f1f1f1': '#af3636' }" style="stroke: #af3636; stroke-width:1;stroke-linecap:round;stroke-miterlimit:10;fill:none;">
            <g class="clock"><use v-bind:xlink:href="'#Stopwatch'"></use></g>
            <line class="swline" x1="-13.9" y1="15.6" x2="-9.8" y2="11.5"/>
            <line class="swline" x1="13.1" y1="15" x2="9.3" y2="11.2"/>
            <line class="swline" x1="13.4" y1="-11.7" x2="9.7" y2="-8"/>
            <line class="swline" x1="-14.1" y1="-12.2" x2="-10.1" y2="-8.2"/>
          </svg>
          <span style="display: block; margin: -10px 0;"><span v-for="i in [0,1,2]" style="display: inline-block; color: white; margin: 0 2px;">{{turn.moves[i] }} </span> </span>
        </span>
        <div style="height: 50vh; margin-top: -0vh">
          <button class="button scale shadow" v-bind:class="{active: active_btn=='Armedrag'}" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?toggleMoveBtn('Armedrag'):'';" v-bind:disabled="turn.moves.length == 3" v-on:click.prevent>Armedrag
            <div class="card" v-on:touchmove.stop v-on:touchend.stop>
              <div id="items_container">
                <!-- <div class="item" v-for="item in Object.keys(buildingitems)">
                  <div class="small" style="margin: 10px 5px 5px 5px; width: 170px">
                    <span class="capitalize">{{item}}</span>
                    <br>Pris: 
                    <span v-for="res in Object.keys(resurser.types)">
                      <div v-for="nr in buildingitems[item].price[res]" v-bind:class="{pris: true, not_enough: !resurser.has(res,nr)}" v-bind:style="{background: resurser.types[res].color}">
                        <svg v-if="res=='people'" width="10px" height="10px" viewBox="14 10 72 80"><use v-bind:xlink:href="'#svg-'+res"></use></svg>
                      </div>
                    </span>
                    <br>
                    <span class="xsmall">{{buildingitems[item].info}}</span>
                    <span class="xsmall" v-if="buildingitems[item].utdelning"><strong>Utdelning: </strong>{{buildingitems[item].utdelning}}/fält<br></span>
                    <span class="xsmall" v-if="buildingitems[item].bonus"><strong>Bonus: </strong>{{buildingitems[item].bonus.antal+' '+buildingitems[item].bonus.type}}<br></span>
                  </div>
                </div> -->
                <div class="item" v-for="item in Object.keys(armyitems)">
                  <button class="btn armysymbol">
                  <svg height="53" width="53" viewBox="-20 -20 40 40">
                    <rect fill="#FAFAFA" style="x: -14;y: -14; height: 28px;width: 28px; transform: rotate(45deg);" ></rect>
                    <use v-bind:xlink:href="'#'+item"></use>
                  </svg>
                  </button>
                  <div class="small" style="margin: 10px 5px 5px 5px; width: 175px">
                    <span class="capitalize">{{item}}</span><br>Pris: 
                    <span v-for="res in Object.keys(resurser.types)">
                      <div v-for="nr in armyitems[item].price[res]" v-bind:class="{pris: true, not_enough: !resurser.has(res,nr)}" v-bind:style="{background: resurser.types[res].color}">
                        <svg v-if="res=='people'" width="10px" height="10px" viewBox="14 10 72 80"><use v-bind:xlink:href="'#svg-'+res"></use></svg>
                      </div>
                    </span>
                    <br>
                    <span class="xsmall">
                      <strong>Hastighet:</strong> {{armyitems[item].vel}} över {{armyitems[item].veg}}.<br>
                      <span v-if="armyitems[item].range"><strong>Räckvidd:</strong> {{armyitems[item].range}}.<br></span>
                      <span v-if="armyitems[item].capacity"><strong>Kapasitet:</strong> {{armyitems[item].capacity}}.</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button class="button" style="background: antiquewhite; color: black; " v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?addmove('Armedrag'):'';" v-on:click.prevent>Förflytta/Attackera</button>
            <br>Tillbaka
          </button>
          <button class="button scale shadow" v-bind:class="{active: active_btn=='Forskning'}" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?toggleMoveBtn('Forskning'):'';" v-bind:disabled="turn.moves.length == 3" v-on:click.prevent>Forskning
            <div class="card" v-on:touchmove.stop v-on:touchend.stop></div>
            <button class="button" style="background: antiquewhite; color: black;" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?addmove('Forskning'):'';" v-on:click.prevent>Forska</button>
            <br>Tillbaka
          </button>
          <button class="button scale shadow" v-bind:class="{active: active_btn=='Utvecklingskort'}" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?toggleMoveBtn('Utvecklingskort'):'';" v-bind:disabled="turn.moves.length == 3" v-on:click.prevent>Utvecklingskort
            <div class="card" v-on:touchmove.stop v-on:touchend.stop></div>
            <button class="button" style="background: antiquewhite; color: black;" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?addmove('Utvecklingskort'):'';" v-on:click.prevent>Använd ett kort</button>
            <br>Tillbaka
          </button>
          <button class="button scale shadow" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?openTradepanel():'';" v-bind:disabled="turn.moves.length == 3" v-on:click.prevent>Byteshandel
            <div class="card" v-on:touchmove.stop></div>
            <button class="button" style="background: antiquewhite; color: black;" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?'':'';" v-on:click.prevent>Öppna bytesmenyn</button>
            <br>Tillbaka
          </button>
        </div>
        <button class="button" v-bind:style="{opacity: turn.moves.length==3?1:0, visibility: turn.moves.length==3? 'visible' : 'hidden', transition: '2s', marginTop: '0vh'}" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?turn.done=true:'';" v-on:click.prevent>Överlämna</button>

      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'turn',
  props: {
    panel: Object,
    dices: Object,
  	turn: Object,
    trade_panel: Object,
    resurser: Object,
    armyitems: Object,
    // buildingitems: Object
  },

  data () {
    return {
      active_btn: 'none',
      x1: 0,
      distx: 0,
      current: 1,
      x: 0
    }
  },

  computed:{
    dicesHTML: function(){
      return this.dices.render()
    },
  	height: function(){
      return this.panel.isOpen ? '100vh' : '0vh';
  	},
    menuitem: function(){
      return this.$el.firstElementChild;
    }
  },

  methods: {
    rollDices: function(){
      if(this.turn.rolled){return}
      this.dices.roll()
      this.turn.rolled = true
      var self = this;
      setTimeout(function(){self.next()},1500)
    },
    addmove: function(move){
      var self = this;
      setTimeout(function(){self.turn.moves.push(move)},500)
      // this.toggleMoveBtn(move);
      console.log(move)
    },
    next: function(){
      this.current += 1
      this.turn.state = this.turn.state<this.current? this.current : this.turn.state;
    },
    toggleMoveBtn: function(btn){
      console.log(btn)
      this.active_btn = this.active_btn != btn ? btn : 'none';
    },
    openTradepanel: function(){
      this.trade_panel.zIndex = 20; 
      this.trade_panel.isOpen = true;
    },
  	tstart: function(e){
            this.x1 = e.touches[0].clientX; 
					},
		tmove: function(e){
            this.distx = (this.x1 - e.touches[0].clientX);
            let direction = this.distx>0 ? 'right' : 'left';
            let friction = direction == 'right' && this.turn.state == this.current ||
                            direction == 'left' && this.current == 1;
            this.x = (this.distx/document.documentElement.clientWidth);
            if(friction){this.x/=4}
			    },
    tend: function(e){
            if(this.distx < -30 ){
              if(this.current>1){ this.current -= 1 }
            }
            if(this.distx > 30 ){
              if(this.current!=this.turn.state){ this.current += 1 }
            }
            this.menuitem.classList.add('transition');
            this.distx = this.x = 0;
			    },
    transend: function(e){
            this.menuitem.classList.remove('transition');
			     //if(!this.$props.panel.isOpen){ this.hidden = true; } 
			    }
  },
  mounted: function() {
    // this.menuitem = this.$el.firstElementChild;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.overlay {
    position: absolute;
    width: 100%;
    bottom: 0px;
}
h1 {
  font-size: 2.5em;
    font-weight: 500;
}
.menuitem { 
  position: relative; 
  top:0px; 
  z-index: 19;
  /*box-shadow: 0 2px 2px rgba(0, 0, 0, 0.45); */
  overflow-x: hidden; 
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  /*background: #e74c3c;*/
  background: #ea5e50;

  display: flex;
  flex-direction: row;
  justify-content: start;
  width: 1000%;
  height: 100vh;
  left:0
}
.menuitem > section {
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: space-around;
  width: 100vw;
  height: 100vh;
}
.button {
  border: none;
  width: 80%;
  /*height: 30px;*/
  background: lightblue;
  padding: 10px;
  border-radius: 5px;
  margin: 0 auto 10px auto;
  font-size: 20px;
}
.button.scale {
    transition: 0.3s cubic-bezier(0, 0.49, 0, 1.01);
    position: absolute;
    width: 145px;
    height: 160px;
    margin: 5px;
    bottom: 47vh;
    right: 50vw;
    vertical-align: middle;
    overflow: hidden;
    padding: 65px 0;
    /*padding: 10px 0;*/
    /*top: 50vh;*/
}
.button.scale:nth-child(3),.button.scale:nth-child(4) {
    top: 53vh;
}
.button.scale:nth-child(even) {
    left: 50vw;
}
.button.scale.active {
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
    margin-top: 0;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    border-radius: 0;
}
.button.scale.active:nth-child(3),.button.scale.active:nth-child(4) {
    top: 0;
}
.card {
  width: 90vw;
  height: 60vh;
  margin: 0 auto;
  border-radius: 5px;
  background: antiquewhite;
  overflow: scroll; 
  color: #606060;
}
.button.scale .card{
  opacity: 0;
  visibility: hidden;
  transition: 0.3s cubic-bezier(0, 0.49, 0, 1.01);
  height: 72vh;
  margin: 10px auto;
}
.button.scale.active .card{
  opacity: 1;
  visibility: visible;
}
.button.scale.active:before {
    content: '';
    height: 10px;
    width: 100%;
    display: block;
}
.armysymbol {
  box-shadow: none;
    background: #E0E0E0;
}
.transition {
  transition: 0.3s transform cubic-bezier(0.21, 0.78, 0.58, 1), 0.5s height;
}
.shadow {
  box-shadow: 0 0px 5px 0px rgba(0, 0, 0, 0.28);
}
.inside {bottom:0; width:100%; position: relative; /*flex-direction: row;  flex-wrap: wrap;*/ justify-content: center;}

@keyframes roll {
  100% {-webkit-transform: translate(0,0) rotate(0);-webkit-transform-origin: 17px 22px; }
  60% {-webkit-transform: translate(-50px,-30px) rotate(250deg);-webkit-transform-origin: 24px 22px; }
  40% {-webkit-transform: translate(60px,-50px) rotate(500deg);-webkit-transform-origin: 16px 22px; }
  15% {-webkit-transform: translate(-40px,-7px) rotate(990deg);-webkit-transform-origin: 23px 22px; }
  from {-webkit-transform: translate(0,0) rotate(1000deg);}
}
.roll1 {
  animation: roll 0.5s reverse;
}
.roll2 {
  animation: roll 0.5s;
}

.swline {
      stroke-dasharray: 15;
      stroke-dashoffset: 15;
    }
   .animat .swline {
      animation: dash 0.2s linear forwards;
      animation-iteration-count: 1;
    }

    .animat .clock{

      animation: bump 0.3s cubic-bezier(0.25, 0.1, 0, 1.43) forwards;
      animation-iteration-count: 1;
    }

    @keyframes dash {
      0% {
        stroke-dashoffset: -1;
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        stroke-dashoffset: 15;
      }
    }

    @keyframes bump {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
      }
    }
</style>
