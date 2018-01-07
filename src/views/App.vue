<template>
  <div class="app slideout-open" v-bind:style="{height: screenheight}" >
    <div class="resurs_display" v-if="turn_panel.isOpen" style="width:100%; z-index:20; background: rgba(255,255,255,0.3);">
      <div class="" v-for="typ in resurser.resursTypes" :key="typ">
        <resurs v-bind:resurs="{type: typ}" v-bind:options="{movable:false}" style="display:inline-block; position: initial; margin-bottom:-5px;"></resurs>
        <div style="display:inline-block;">{{resurser.array.filter(r=>r.type==typ).length}}</div>
      </div>
    </div> 
    <turn v-bind:panel="turn_panel" v-bind:game="game" v-bind:dices="dices" v-bind:resurser="resurser" v-bind:armyitems="armyitems" v-bind:buildingitems="buildingitems" v-bind:trade_panel="trade_panel" v-bind:turn="turn"></turn>
    <buypanel class="slideout-menu" v-bind:modals="modals" v-bind:resurser="resurser" v-bind:armyitems="game.types.armyitems" v-bind:buildingitems="game.types.buildingitems"></buypanel>
    <panel v-bind:resurser="resurser" v-bind:isOpen="buy_panel.isOpen" v-bind:dices="dices" v-on:close="buy_panel.isOpen=false" v-on:open="buy_panel.isOpen=true" v-on:touchmove.prevent.stop></panel>
    <overlay v-bind:panel="trade_panel" v-on:close="closeOverlay('trade_panel')">
      <trade v-bind:resurser="resurser" v-bind:players="game.players" v-bind:user="user" v-bind:hasHamn="hasHamn"></trade>
    </overlay>
    <overlay 
      v-bind:panel="map_panel"  
      v-on:close="closeOverlay('map_panel')">
      <maps
        v-bind:players="game.players" 
        v-bind:user="user" 
        v-bind:dices="dices" 
        v-bind:buildings="buildings" 
        v-bind:resurser="resurser"
        v-bind:types="resurser.types"
        v-bind:modals="modals"
        v-bind:boardgame="game.boardgame"></maps>
    </overlay>
    <overlay v-bind:panel="cards_panel" v-on:close="closeOverlay('cards_panel')"><cards></cards></overlay>

    <modalmenu v-bind:modal="modal"
      v-on:buy="buy"
      v-on:fromValfriToYield="fromValfriToYield"
      v-on:selectValfri="selectValfri"
      v-on:nextModuleInQueue="nextModuleInQueue" ></modalmenu>


    <footer>
      <div class="spacer"></div>
      <svg class="icon" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?toggleOverlay('buy_panel'):'';" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
        <use xlink:href="#svg-dollar"></use>
      </svg>
      <svg id="trade_toggle" class="icon" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?toggleOverlay('trade_panel'):'';" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
        <use xlink:href="#svg-hands"></use>
        <g v-if="tradeNotices">
          <circle cx="80" cy="20" r="20" style="fill: red;"/>
          <text x="80" y="30" class="badge">{{ tradeNotices }}</text>
        </g>
      </svg>
      <svg id="maps_toggle" class="icon" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?toggleOverlay('map_panel'):'';" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
        <use xlink:href="#svg-flag" fill="#FDFDFD"></use>
        <g v-if="mapNotices">
          <circle cx="80" cy="20" r="20" style="fill: red;"/>
          <text x="80" y="30" class="badge">{{ mapNotices }}</text>
        </g>
      </svg>
      <svg class="icon" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?toggleOverlay('cards_panel'):'';" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
        <use xlink:href="#svg-eventcard"></use>
      </svg>
      <div class="spacer"></div>
    </footer>

<!--     
  info (events)
  cards
  stockmarket

  buy&build
  notes
  dices
  -->
  </div>
</template>

<script>
//import Trade from '@/components/Trade'
import Overlay from '@/components/Overlay'
import Buypanel from '@/components/Buypanel'
import Panel from '@/components/Panel'
import Trade from '@/components/Trade'
import Maps from '@/components/Maps'
import Cards from '@/components/Cards'
import Turn from '@/components/Turn'
import Resurs from '@/components/Resurs'

import Modalmenu from '../components/Modalmenu'


export default {
  name: 'app',
  components: { Overlay, Trade, Maps, Buypanel, Panel, Cards, Modalmenu, Turn, Resurs },
  props: {
    game: Object, // Game / Settings > game (types)
    user: Object  // Main / Users > user
  },
  data () {
    // - [x] Noticer
    // - [x] Resurser , allt i samma?
    // - [x] Byggnader
    // - [x] Armeer
    // - [x] Turns
    // - [ ] Types/settings/deals/dices
    // - [ ] Events
    return {
      panelIsOpen: '',
      buy_panel: {
        isOpen: false,
        color: '#f1c40f'
      },
      trade_panel: {
        isOpen: false,
        color: '#54ADC7',
        zIndex: 2,
        // noscroll: true
      },
      map_panel: {
        isOpen: false,
        color: '#f0d4aa',
        noscroll: true
      },
      cards_panel: {
        isOpen: false,
        color: '#e74c3c'
      },
      modals: { 
        lastModal: {isOpen: false, content:[]},
        mainModalQ: [], // Game / Noticer (type: main, player: user|all ) > mainModalQ 
        mapsModalQ: [], // Game / Noticer (type: maps, player: user|all ) > mapsModalQ
        // tradeModalQ: [], // Game / Noticer (type: trade, player: user|all ) > tradeModalQ
      },
      /* PLAYER */
      // user: {username: 'Andreas', color:'#27ae60'},
      /* BELONGINGS */
      resurser: {
          array:[ 
            // {"type":"tra","x":271,"y":360,"location":"panel"},
            // {"type":"tra","x":267,"y":396,"location":"panel"},{"type":"tra","x":229,"y":322,"location":"panel"},
            // {"type":"sad","x":96,"y":383,"location":"panel"},{"type":"sad","x":85,"y":336,"location":"panel"},
            // {"type":"olja","x":227,"y":386,"location":"panel"},{"type":"olja","x":111,"y":280,"location":"panel"},
            // {"type":"olja","x":127,"y":353,"location":"panel"},{"type":"sten","x":191,"y":234,"location":"panel"},
            // {"type":"sten","x":255,"y":316,"location":"panel"},{"type":"sten","x":176,"y":321,"location":"panel"},
            // {"type":"people","x":117,"y":225,"location":"panel"},{"type":"people","x":217,"y":224,"location":"panel"}
          ],
          // trade: [],
          // yield: [], // Game / Resurser > resurser.yield 
          valfri: [], // valfri väljs i mapsModuleQ / mainModuleQ ? 
          types: { // initApp
            "tra": {color: '#1abc9c',name:'Trä'},
            "sad": {color: '#f1c40f',name:'Säd'},
            "olja": {color: '#B697D8',name:'Olja'},
            "sten": {color: '#808080',name:'Sten'},
            "people": {color: 'rgb(91, 192, 222)',name:'Folk'},
            "valfri": {color: 'rgb(91, 192, 222)',name:'Valfri'},
            // "djur": {color: '#75B96B'}
          },
          tradeTypes: ["tra", "sad", "olja", "sten"],
          resursTypes: ["tra", "sad", "olja", "sten", "people"],
          has: function(type, nr){
            return this.array.filter((resurs)=>{return resurs.type == type}).length >= nr;
          },
          find: function(type){
            return this.array.find((resurs)=>{return resurs.type == type})
          },
          pop: function(type){
            var index = this.array.indexOf(this.find(type));
            return index != -1 ? this.array.splice(index,1)[0] : undefined ;
          },
          push: function(resurs){
            this.array.push(resurs)
          }
      },
      buildings: [// Game / Byggnader > buildings 
        //{
        //   id: 'k2l1-jdi3',
        //   type: 'By',
        //   pos: {x:0, y:0},
        //   fields: [],
        //   utdelning: 1,
        //   bonus: {"type": 'people', "antal": 1},
        //   isBuild: false,
        //   yieldStat: {}
        // },{
        //   id: 'k2l1-jdi3',
        //   type: 'Stad',
        //   pos: {x:0, y: 0},
        //   fields: [],
        //   utdelning: 2,
        //   bonus: {"type": 'people', "antal": 2},
        //   isBuild: false,
        //   yieldStat: {}
        // },{
        //   id: 'k2l1-jdi3',
        //   type: 'Storstad',
        //   pos: {x:0, y: 0},
        //   fields: [],
        //   utdelning: 2,
        //   bonus: {"type": 'people', "antal": 3},
        //   isBuild: false,
        //   yieldStat: {}
        // },{
        //   id: 'k2l1-jdi3',
        //   type: 'Fabrik',
        //   pos: {x:0, y: 0},
        //   fields: [],
        //   utdelning: 2,
        //   bonus: {"type": 'valfri', "antal": 1},
        //   isBuild: false,
        //   yieldStat: {}
        // },{
        //   id: 'k2l1-jdi3',
        //   type: 'Flygplats',
        //   pos: {x:0, y: 0},
        //   fields: [],
        //   isBuild: false,
        // },{
        //   id: 'k2l1-jdi3',
        //   type: 'Hamn',
        //   pos: {x:0, y: 0},
        //   fields: [],
        //   isBuild: false,
        // },{
        //   id: 'k2l1-jdi3',
        //   type: 'Universitet',
        //   pos: {x:0, y: 0},
        //   fields: [],
        //   isBuild: false,
      //}
      ],
      bought: {},
      /* GAME */
      //  {
			// 		active: false,
			// 		paused: true,
			// 		dices: {
			// 			player: '',
			// 			a: 0,
			// 			b: 0,
			// 			turns: 0
			// 		},
			// 		gameStarted: '',
			// 		runTimeBetweenPauses: [],
			// 		runTime: 0,
			// 	}
      turn: { // Game / Turer (player: user) > turn
        "player": undefined,
        "rolled": false,
        "time": {
          "rolled": undefined,
          "finnished": undefined,
          "duration": undefined
        },
        "state": 1,
        "moves": [],
        "outcome": {
          "dices": {
            "a": undefined,
            "b": undefined
          },
          "yield": {},
          "eventcard": {},
          "moves": [],
        },
        "done": false
      },
      dices: { 
        player: '', // Game / Turer / player > dices.player
        a: 1,
        b: 1,
        rotation_dice1: Math.random()*180, 
        rotation_dice2: Math.random()*180,
        nr: function(){
            return this.a + this.b
        },
        roll: function(){
          this.a = Math.ceil(Math.random()*6)
          this.b = Math.ceil(Math.random()*6)
          this.rotation_dice1 = Math.random()*180
          this.rotation_dice2 = Math.random()*180
          console.log(this.a+this.b)
        },
        render: function(a=this.a,b=this.b){
          return '<div class="dice roll1" style="transform: rotate('+this.rotation_dice1+'deg);">'+
            '<div style="left: 8px; top: 8px;" class="'+'hide'.repeat(a<4)+'"></div>'+
            '<div style="left: 20px; top: 8px;" class="'+'hide'.repeat(a<6)+'"></div>'+
            '<div style="left: 32px; top: 8px;" class="'+'hide'.repeat(a<2)+'"></div>'+
            '<div style="left: 20px; top: 20px;" class="'+'hide'.repeat(1-a%2)+'"></div>'+
            '<div style="left: 8px; top: 32px;" class="'+'hide'.repeat(a<2)+'"></div>'+
            '<div style="left: 20px; top: 32px;" class="'+'hide'.repeat(a<6)+'"></div>'+
            '<div style="left: 32px; top: 32px;" class="'+'hide'.repeat(a<4)+'"></div>'+
          '</div><div class="dice roll2" style="transform: rotate('+this.rotation_dice2+'deg);">'+
            '<div style="left: 8px; top: 8px;" class="'+'hide'.repeat(b<4)+'"></div>'+
            '<div style="left: 20px; top: 8px;" class="'+'hide'.repeat(b<6)+'"></div>'+
            '<div style="left: 32px; top: 8px;" class="'+'hide'.repeat(b<2)+'"></div>'+
            '<div style="left: 20px; top: 20px;" class="'+'hide'.repeat(1-b%2)+'"></div>'+
            '<div style="left: 8px; top: 32px;" class="'+'hide'.repeat(b<2)+'"></div>'+
            '<div style="left: 20px; top: 32px;" class="'+'hide'.repeat(b<6)+'"></div>'+
            '<div style="left: 32px; top: 32px;" class="'+'hide'.repeat(b<4)+'"></div>'+
          '</div>'+
          '<style>'+
          '.dice{display:inline-block; margin: 10px 10px;width: 50px;height: 50px;background-color: #FAFAFA;border-radius: 5px;box-shadow:0 0 10px -3px gray}'+
          '.dice>div{width:10px; height:10px; background-color:white; border-radius:100%; box-shadow: 2px 2px 6px 2px rgb(139, 139, 139) inset;position:absolute; }'+
          '.hide{display:none}'+
          '@keyframes roll {'+
          '  100% {-webkit-transform: translate(0,0) rotate(0);-webkit-transform-origin: 17px 22px; }'+
            '60% {-webkit-transform: translate(-50px,-30px) rotate(250deg);-webkit-transform-origin: 24px 22px; }'+
            '40% {-webkit-transform: translate(60px,-50px) rotate(500deg);-webkit-transform-origin: 16px 22px; }'+
            '15% {-webkit-transform: translate(-40px,-7px) rotate(990deg);-webkit-transform-origin: 23px 22px; }'+
            'from {-webkit-transform: translate(0,0) rotate(1000deg);}'+
          '}'+
          '.roll1 { animation: roll 0.5s reverse;}'+
          '.roll2 { animation: roll 0.5s; }'+
          '</style>';
        }
      },
      // players:[
      //   {username: 'Samuel', color:'#e74c3c'},
      //   {username: 'Dan-Jakob', color:'#9b59b6'},
      //   {username: 'Simon', color:'#3498db'}
      // ],
      armyitems: {
        // "Trupp": {
        //   name: 'Trupp',
        //   price: {
        //     "people": [1],
        //   },
        //   vel: '1 fält/drag',
        //   veg: 'alla fält',
        //   range: 'Samma fält',
        //   rpd: 1
        // },
        // "Mek_infanteri": {
        //   name: 'Mek. infanteri',
        //   price: {
        //     "sad": [1],
        //     "sten": [1],
        //     "olja": [1],
        //     "people": [1]
        //   },
        //   vel: '2 fält/drag',
        //   veg: 'öppna fält',
        //   range: 'Samma fält',
        //   capacity: '5 trupper',
        //   rpd: 1
        // },
        // "Lätt_tank": {
        //   name: 'Lätt tank',
        //   price: {
        //     "sad": [1],
        //     "sten": [1],
        //     "olja": [1],
        //     "people": [1]
        //   },
        //   vel: '2 fält/drag',
        //   veg: 'öppna fält',
        //   range: 'Samma fält',
        //   rpd: 1
        // },
        // "Tung_tank": {
        //   name: 'Tung tank',
        //   price: {
        //     "sad": [1],
        //     "sten": [1,2],
        //     "olja": [1,2],
        //     "people": [1,2]
        //   },
        //   vel: '1 fält/drag',
        //   veg: 'öppna fält',
        //   range: '1 fält',
        //   rpd: 2
        // },
        // "Artilleri": {
        //   name: 'Artilleri',
        //   price: {
        //     "sad": [1],
        //     "sten": [1,2],
        //     "people": [1]
        //   },
        //   vel: '1 fält/drag',
        //   veg: 'öppna fält',
        //   range: '3 fält',
        //   rpd: 3
        // },
        // "Jaktplan": {
        //   name: 'Jaktplan',
        //   price: {
        //     "sad": [1],
        //     "tra": [1],
        //     "olja": [1],
        //     "people": [1]
        //   },
        //   vel: '12cm',
        //   veg: 'luft',
        //   range: '3 fält',
        //   rpd: 2
        // },
        // "Bombplan": {
        //   name: 'Bombplan',
        //   price: {
        //     "sad": [1],
        //     "tra": [1,2,3],
        //     "olja": [1],
        //     "people": [1,2]
        //   },
        //   vel: '8cm',
        //   veg: 'luft',
        //   range: 'Samma fält',
        //   capacity: '5 bomber',
        //   rpd: 3
        // },
        // "Herkules": {
        //   name: 'Herkules',
        //   price: {},
        //   vel: '8cm',
        //   veg: 'luft',
        //   range: 'Samma fält',
        //   capacity: '5 trupper',
        //   rpd: 0
        // },
        // "Slagskepp": {
        //   name: 'Slagskepp',
        //   price: {
        //     "sad": [1],
        //     "tra": [1],
        //     "sten": [1,2],
        //     "olja": [1,2],
        //     "people": [1,2,3,4,5,6]
        //   },
        //   vel: '6cm',
        //   veg: 'vatten',
        //   range: '5cm',
        //   rpd: 3
        // },
        // "Ubåt": {
        //   name: 'Ubåt',
        //   price: {
        //     "sad": [1],
        //     "tra": [1],
        //     "sten": [1],
        //     "olja": [1],
        //     "people": [1,2,3,4]
        //   },
        //   vel: '6cm',
        //   veg: 'vatten',
        //   range: '5cm',
        //   rpd: 3
        // },
        // "Transportfartyg": {
        //   name: 'Transportfartyg',
        //   price: {
        //     "sad": [1],
        //     "tra": [1],
        //     "sten": [1],
        //     "olja": [1],
        //     "people": [1,2]
        //   },
        //   vel: '4cm',
        //   veg: 'vatten',
        //   capacity: '10 trupper/3 tanks',
        //   rpd: 0
        // },
        // "Hangarfartyg": {
        //   name: 'Hangarfartyg',
        //   price: {
        //     "sad": [1],
        //     "sten": [1,2,3],
        //     "olja": [1,2,3],
        //     "people": [1,2,3,4,5,6]
        //   },
        //   vel: '4cm',
        //   veg: 'vatten',
        //   capacity: '5 flygplan',
        //   rpd: 2
        // },
        // "Missilramp": {
        //   name: 'Missilramp',
        //   price: {
        //     "sad": [1],
        //     "tra": [1],
        //     "sten": [1,2,3],
        //     "olja": [1]
        //   },
        //   vel: '0cm',
        //   veg: 'alla fält',
        //   range: '15cm',
        //   rpd: 1
        // }
      },
      buildingitems: {
        // "By": {
        //   name: 'By',
        //   price: {
        //     "sad": [1,2],
        //     "tra": [1,2]
        //   },
        //   utdelning: 1,
        //   bonus: {"type": 'people', "antal": 1},
        //   info: 'Ger utdelning för angränsande fält.'
        // },
        // "Stad": {
        //   name: 'Stad',
        //   price: {
        //     "sad": [1],
        //     "tra": [1,2],
        //     "sten": [1],
        //     "olja": [1]
        //   },
        //   utdelning: 2,
        //   bonus: {"type": 'people', "antal": 2},
        //   info: 'Ger utdelning för angränsande fält.'
        // },
        // "Storstad": {
        //   name: 'Storstad',
        //   price: {
        //     "sad": [1],
        //     "sten": [1,2,3],
        //     "olja": [1,2]
        //   },
        //   utdelning: 2,
        //   bonus: {"type": 'people', "antal": 3},
        //   info: 'Ger utdelning för angränsande fält.'
        // },
        // "Fabrik": {
        //   name: 'Fabrik',
        //   price: {
        //     "sad": [1,2],
        //     "sten": [1],
        //     "olja": [1,2],
        //     "people": [1,2,3,4]
        //   },
        //   utdelning: 2,
        //   bonus: {"type": 'valfri', "antal": 1},
        //   info: 'Ger utdelning för angränsande fält.'
        // },
        // "Flygplats": {
        //   name: 'Flygplats',
        //   price: {
        //     "sad": [1],
        //     "sten": [1,2],
        //     "olja": [1,2],
        //     "people": [1,2,3,4,5,6]
        //   },
        //   info: 'Möjliggör flygplans-produktion.'
        // },
        // "Hamn": {
        //   name: 'Hamn',
        //   price: {
        //     "sad": [1],
        //     "tra": [1],
        //     "sten": [1,2],
        //     "olja": [1],
        //     "people": [1,2,3,4]
        //   },
        //   info: 'Möjliggör fartygs-produktion, samt byteshandel med andra spelare som har hamn.'
        // },
        // // "Oljerigg": {
        // //   "tra": [],
        // //   "sad": [],
        // //   "olja": [],
        // //   "sten": [],
        // //   "djur": []
        // // },
        // "Universitet": {
        //   name: 'Universitet',
        //   price: {
        //     "sad": [1,2,3],
        //     "tra": [1],
        //     "sten": [1],
        //     "people": [1,2,3,4]
        //   },
        //   info: 'Lyckad forskning ger utvecklingskort.'
        // },
        // "Väg": {
        //   name: 'Väg',
        //   price: {
        //     "sten": [1],
        //     "olja": [1]
        //   },
        //   info: 'Möjliggör byggnadsplats.'
        // },
        // "Bro": {
        //   name: 'Bro',
        //   price: {
        //     "sad": [1],
        //     "tra": [1,2],
        //     "sten": [1],
        //     "olja": [1]
        //   },
        //   info: 'Möjliggör rörlighet över sund.'
        // }
      },
    }
  },
  computed: {
    turn_panel: function(){
      return { 
        isOpen: this.turn.player == this.user.username && !this.turn.done
      }
    },
    screenheight: function() {
      return document.documentElement.clientHeight+'px';
    },
    modal: function(){
      return this.modals.mainModalQ[0] ? this.modals.mainModalQ[0] : this.modals.lastModal;
    },
    mapNotices: function(){
      let nrNewBuildings = this.buildings.filter( b => b.isBuild == false ).length;
      let nrYieldResurser = this.resurser.array.filter(r=>r.location == 'yield' ).length;
      let mapPanelAlerts = this.modals.mapsModalQ.filter((modal)=>{return modal.type == 'alert' || modal.type == 'confirm'}).length;
      return nrNewBuildings + nrYieldResurser + mapPanelAlerts - (this.map_panel.isOpen * mapPanelAlerts != 0)
    },
    tradeNotices: function(){
      let nrTradeResurser = this.resurser.array.filter(r=>r.location == 'trade' ).length;
      return nrTradeResurser;
    },
    hasHamn: function(){
      let hasHamn = Boolean(this.buildings.find(building=>Boolean(building.fields.find(f=>f.type=='hamn'))));
      // if(hasHamn!=this.hasHamn){this.$socket.emit('hasHamn')}
      return hasHamn;
    }
  },
  methods: {
    closeOverlay: function(type){
      this[type].isOpen = false;
    },
    openOverlay: function(type){
      if(this.panelIsOpen){this.closeOverlay(this.panelIsOpen)}
      this[type].isOpen = true;
      this.panelIsOpen = type;
    },
    toggleOverlay: function(type){
      this[type].isOpen ? this.closeOverlay(type) : this.openOverlay(type);
    },
    slideoutClose: function() {
      // this.slideout.close()
    },
    slideoutToggle: function() {
      // if(this.panelIsOpen){this.closeOverlay(this.panelIsOpen)}
      // this.slideout.toggle()
      // this.panelIsOpen = '';
    },
    selectValfri: function(bonus_item){
      if(bonus_item){
        this.$socket.emit('selectValfri',bonus_item)
        console.log('Item', bonus_item)
        console.log('Valfria',this.modal.valfria)

        
        // let r = this.resurser.valfri.find((resurs)=>{return responce.resurs.x == resurs.x && responce.resurs.y == resurs.y });
        // console.log(r)
        // r = this.resurser.valfri.splice(this.resurser.valfri.indexOf(r),1)[0];
        // console.log(r)
        // r.type = responce.type;
        // this.resurser.yield.push(r);
      }
    },
    nextModuleInQueue: function(){
      this.modals.lastModal = this.modals.mainModalQ.shift()
    },
    c4: function(){
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    },
    buy: function(buy) {
      console.log(buy)
      let dyrt = false;
      Object.keys(buy.item.price).map((res)=>{
			  buy.item.price[res].map(()=>{
          let r = this.resurser.array.find(r=>r.type==res)
          if(r){
            r.location = buy.item.name;
          }else{
            dyrt = true
          }
			  })
      })
      let betalning = this.resurser.array.filter(r=>r.location==buy.item.name);
      
      if(dyrt){
        // Returnera
        betalning.map(r=>r.location='panel')
        this.emit('notify',{title: 'Dyrt', msg:'Sorry, något hände! Betalningen gick inte igenom.'})
        return
      }
      buy.betalning = betalning;
      this.$socket.emit('buy', buy)

      // if(buy){
      //   // Price
      //   Object.keys(buy.item.price).map((res)=>{
      //     buy.item.price[res].map(()=>{
      //       this.resurser.pop(res)
      //     })
      //   })
      //   if(buy.itemgroup == 'buildingitems'){
      //     // Add building item
      //     let item = {
      //       id: this.c4()+'-'+this.c4(),
      //       type: buy.item.name,
      //       pos: {x:0, y:0},
      //       fields: [],
      //       utdelning: buy.item.utdelning || undefined,
      //       bonus: buy.item.bonus || undefined,
      //       isBuild: false,
      //       yieldStat: ['By','Stad','Storstad','Fabrik'].indexOf(buy.item.name) != -1 ? {} : undefined 
      //     }
      //     this.buildings.push(item)
      //   }
      //   this.bought[but.item.name] ? this.bought[but.item.name] += 1 : this.bought[but.item.name] = 1 ;
      // }
    },
    fromValfriToYield: function(responce){
      console.log('fromValfriToYield', this.modal.valfria)
      // this.$socket.emit('fromValfriToYield', this.modal.valfria)
    }, 
  },
  mounted: function(){
    console.log('App mounted')
    //this.trade_panel.open()

    this.$emit('openLoginPanel')
    this.$socket.emit('getGame',this.$route.params.id)


  },
  sockets:{
    'data': function(data){
      console.log(this.game.db)
      console.log('Dataupdate ', data.type)
      // if(data.type=='resurser'){
      //   this.resurser.array = data.change.new_val.resurser;
      // }

      if(data.type=='resurser'){
        console.log('Data Resurser ', data.change)
        if(data.change.old_val&&data.change.new_val){ // update
          this.resurser.array = this.resurser.array.map(resurs=>{
            resurs = resurs.id== data.change.new_val.id? data.change.new_val : resurs;
            return resurs
          })
        }else if(!data.change.old_val&&data.change.new_val){ // insert
          this.resurser.array.push(data.change.new_val)
        }else if(data.change.old_val&&!data.change.new_val){ // delete
          this.resurser.array = this.resurser.array.filter(res=>res.id!=data.change.old_val.id)
        }
      }

      if(data.type=='byggnader'){
        if(data.change.old_val&&data.change.new_val){ // update
          this.buildings = this.buildings.map(byggnad=>{
            byggnad = byggnad.id==data.change.new_val.id? data.change.new_val : byggnad;
            return byggnad
          })
        }else if(!data.change.old_val&&data.change.new_val){ // insert
          this.buildings.push(data.change.new_val)
        }else if(data.change.old_val&&!data.change.new_val){ // delete
          this.buildings = this.buildings.filter(byggnad=>byggnad.id!=data.change.old_val.id)
        }
      }

      if(data.type=='turn'){
        this.turn = data.change.new_val;
        console.log('Turn', this.dices)
      }

      if(data.type=='dices'){
        this.dices.player = data.change.new_val.player;
        this.dices.a = data.change.new_val.outcome.dices.a;
        this.dices.b = data.change.new_val.outcome.dices.b;
        this.dices.rotation_dice1 = Math.random()*180;
        this.dices.rotation_dice2 = Math.random()*180;
        console.log('Dices', this.dices)
      }
      
      if(data.type=='modal'){
        if(data.change.old_val&&data.change.new_val){ // update
          this.modals.mainModalQ = this.modals.mainModalQ.map(modal=>{
            modal = modal.id==data.change.new_val.id? data.change.new_val : modal;
            return modal
          })
        }else if(!data.change.old_val&&data.change.new_val){
          this.modals.mainModalQ.push(data.change.new_val)
        }else if(data.change.old_val&&!data.change.new_val){ // delete
          this.modals.mainModalQ = this.modals.mainModalQ.filter(modal=>modal.id!=data.change.new_val.id);
        }
      }
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  html, body {
    position: fixed;
    overflow: hidden;
  } 

@media all and (orientation:landscape) {
  #context:before {
    content: "";
    background: url("/static/flip.png");
    background-color: lightgray;
    position: fixed;
    z-index: 30;
    width: 100%;
    height: 100%;
    background-position: center;
    background-repeat: no-repeat;
    left: 0;
    top: 0;
  }
}

.app{
  position: relative;
  overflow: hidden;
}
#menu{
  position: absolute;
  z-index: 10;
  bottom: 0;
}
/* SLIDEOUT */
.slideout-menu {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  /*z-index: -1;*/
  width: 320px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: none;
  /*background: gray;*/
}

.slideoutpanel {
  position: absolute;
  position: fixed;
  width: 100%;
  /*position:relative;*/
  /*z-index: 1;*/
}

.slideout-open,
.slideout-open body {
  overflow: hidden;
}

.slideout-open .slideout-menu {
  display: block;
}
footer {
  position:fixed; left:0px; bottom:0px; height:50px; width:100%; background: #F0D4AA; z-index: 2; display: flex; 
  flex-wrap: wrap; flex-direction: row; align-items: center; justify-content: space-around;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.06);
}
.spacer{
  margin: 0 10px;
}
.icon {
  display: block;
  height: 40px;
  width: 40px;
  float: left;
  margin: 0 15px;
}
.badge {
  text-anchor: middle; fill: white; font-size: 33px; font-weight: bold
}
</style>
