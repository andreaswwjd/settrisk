<template>
  <div class="app" v-bind:style="{height: screenheight}" >
    <buypanel class="slideout-menu" v-bind:modals="modals" v-bind:resurser="resurser"></buypanel>
    <panel  v-bind:resurser="resurser" v-bind:dices="dices" v-on:close="slideoutClose" v-on:touchmove.prevent.stop></panel>
    <overlay v-bind:panel="trade_panel" v-on:close="closeOverlay('trade_panel')"><trade v-bind:resurser="resurser" v-bind:players="players" v-bind:user="user"></trade></overlay>
    <overlay 
      v-bind:panel="map_panel"  
      v-on:close="closeOverlay('map_panel')"
      ><maps 
      v-bind:players="players" 
      v-bind:user="user" 
      v-bind:dices="dices" 
      v-bind:buildings="buildings" 
      v-bind:resurser="resurser"
      v-bind:yield="resurser.yield"
      v-bind:types="resurser.types"
      v-bind:modals="modals"></maps>
    </overlay>
    <overlay v-bind:panel="cards_panel" v-on:close="closeOverlay('cards_panel')"><cards></cards></overlay>

    <modalmenu v-bind:modal="modal"
      v-on:nextModuleInQueue="nextModuleInQueue" ></modalmenu>

    <footer>
      <div class="spacer"></div>
      <svg class="icon" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?slideoutToggle():'';" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
        <use xlink:href="#svg-dollar"></use>
      </svg>
      <svg id="trade_toggle" class="icon" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?toggleOverlay('trade_panel'):'';" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
        <use xlink:href="#svg-hands"></use>
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

import Modalmenu from '../components/Modalmenu'


export default {
  name: 'app',
  components: { Overlay, Trade, Maps, Buypanel, Panel, Cards, Modalmenu },
  data () {
    return {
      panelIsOpen: '',
      trade_panel: {
        isOpen: false,
        color: '#54ADC7'
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
      dices: {
        a: Math.ceil(Math.random()*6), 
        b: Math.ceil(Math.random()*6),
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
          console.log(this.a)
        },
        render: function(){
          return '<div class="dice" style="transform: rotate('+this.rotation_dice1+'deg);">'+
            '<div style="left: 8px; top: 8px;" class="'+'hide'.repeat(this.a<4)+'"></div>'+
            '<div style="left: 20px; top: 8px;" class="'+'hide'.repeat(this.a<6)+'"></div>'+
            '<div style="left: 32px; top: 8px;" class="'+'hide'.repeat(this.a<2)+'"></div>'+
            '<div style="left: 20px; top: 20px;" class="'+'hide'.repeat(1-this.a%2)+'"></div>'+
            '<div style="left: 8px; top: 32px;" class="'+'hide'.repeat(this.a<2)+'"></div>'+
            '<div style="left: 20px; top: 32px;" class="'+'hide'.repeat(this.a<6)+'"></div>'+
            '<div style="left: 32px; top: 32px;" class="'+'hide'.repeat(this.a<4)+'"></div>'+
          '</div><div class="dice" style="transform: rotate('+this.rotation_dice2+'deg);">'+
            '<div style="left: 8px; top: 8px;" class="'+'hide'.repeat(this.b<4)+'"></div>'+
            '<div style="left: 20px; top: 8px;" class="'+'hide'.repeat(this.b<6)+'"></div>'+
            '<div style="left: 32px; top: 8px;" class="'+'hide'.repeat(this.b<2)+'"></div>'+
            '<div style="left: 20px; top: 20px;" class="'+'hide'.repeat(1-this.b%2)+'"></div>'+
            '<div style="left: 8px; top: 32px;" class="'+'hide'.repeat(this.b<2)+'"></div>'+
            '<div style="left: 20px; top: 32px;" class="'+'hide'.repeat(this.b<6)+'"></div>'+
            '<div style="left: 32px; top: 32px;" class="'+'hide'.repeat(this.b<4)+'"></div>'+
          '</div>'+
          '<style>'+
          '.dice{display:inline-block; margin: 10px 10px;width: 50px;height: 50px;background-color: #FAFAFA;border-radius: 5px;box-shadow:0 0 10px -3px gray}'+
          '.dice>div{width:10px; height:10px; background-color:white; border-radius:100%; box-shadow: 2px 2px 6px 2px rgb(139, 139, 139) inset;position:absolute; }'+
          '.hide{display:none}'+
          '</style>';
        }
      },
      resurser: {
          array:[
            {"type":"trä","x":271,"y":360},
            {"type":"trä","x":267,"y":396},{"type":"trä","x":229,"y":322},
            {"type":"säd","x":96,"y":383},{"type":"säd","x":85,"y":336},
            {"type":"olja","x":227,"y":386},{"type":"olja","x":111,"y":280},
            {"type":"olja","x":127,"y":353},{"type":"sten","x":191,"y":234},
            {"type":"sten","x":255,"y":316},{"type":"sten","x":176,"y":321},
            {"type":"people","x":117,"y":225},{"type":"people","x":217,"y":224}
          ],
          trade: [],
          yield: [],
          types: {
            "trä": {color: '#1abc9c'},
            "säd": {color: '#f1c40f'},
            "olja": {color: '#B697D8'},
            "sten": {color: '#808080'},
            "people": {color: 'rgb(91, 192, 222)'},
            // "djur": {color: '#75B96B'}
          },
          typeNames: ["trä", "säd", "olja", "sten"],
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
      modals: {
        lastModal: {isOpen: false, content:[]},
        mainModalQ: [],
        mapsModalQ: [],
        tradeModalQ: [],
      },
      players:[
        {username: 'Samuel', color:'#e74c3c'},
        {username: 'Dan-Jakob', color:'#9b59b6'},
        {username: 'Simon', color:'#3498db'}
      ],
      user: {username: 'Andreas', color:'#27ae60'},
      buildings: [{
        id: 'k2l1-jdi3',
        type: 'By',
        pos: {x:0, y:0},
        fields: [],
        isBuild: false,
        yieldStat: {}
      },{
        id: 'k2l1-jdi3',
        type: 'Stad',
        pos: {x:0, y: 0},
        fields: [],
        isBuild: false,
        yieldStat: {}
      },{
        id: 'k2l1-jdi3',
        type: 'Storstad',
        pos: {x:0, y: 0},
        fields: [],
        isBuild: false,
        yieldStat: {}
      },{
        id: 'k2l1-jdi3',
        type: 'Fabrik',
        pos: {x:0, y: 0},
        fields: [],
        isBuild: false,
        yieldStat: {}
      },{
        id: 'k2l1-jdi3',
        type: 'Flygplats',
        pos: {x:0, y: 0},
        fields: [],
        isBuild: false,
      },{
        id: 'k2l1-jdi3',
        type: 'Hamn',
        pos: {x:0, y: 0},
        fields: [],
        isBuild: false,
      },{
        id: 'k2l1-jdi3',
        type: 'Universitet',
        pos: {x:0, y: 0},
        fields: [],
        isBuild: false,
      }],
    }
  },
  computed: {
    screenheight: function() {
      return document.documentElement.clientHeight+'px';
    },
    modal: function(){
      return this.modals.mainModalQ[0] ? this.modals.mainModalQ[0] : this.modals.lastModal;
    },
    mapNotices: function(){
      var nrNewBuildings = this.buildings.filter((b)=>{return b.isBuild == false }).length;
      var mapPanelAlerts = this.modals.mapsModalQ.filter((modal)=>{return modal.type == 'alert' || modal.type == 'confirm'}).length;
      return nrNewBuildings + mapPanelAlerts - (this.map_panel.isOpen * mapPanelAlerts != 0)
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
      this.slideout.close()
    },
    slideoutToggle: function() {
      if(this.panelIsOpen){this.closeOverlay(this.panelIsOpen)}
      this.slideout.toggle()
      this.panelIsOpen = '';
    },
    nextModuleInQueue: function(){
      this.modals.lastModal = this.modals.mainModalQ.shift()
    },
  },
  mounted: function(){
    console.log('App mounted')
    //this.trade_panel.open()
    
    this.$emit('openLoginPanel')
    // this.slideout = new Slideout({
    //   'panel': document.getElementById('panel'),
    //   'menu': document.getElementById('buypanel'),
    //   'padding': 75,
    //   'padding2': 185,
    //   'tolerance': 35,
    //   'speed': 1,
    //   'both': false,
    //   'limit': false
    // });


  },
  sockets:{

  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
  position:fixed;
  width:100%;
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
