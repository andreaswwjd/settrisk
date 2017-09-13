<template>
  <div class="app" v-bind:style="{height: height}" >
    <buypanel></buypanel>
    <panel v-bind:resurser="resurser" v-on:close="slideoutClose" v-on:touchmove="noscroll" v-on:trigger="trigger"></panel>
    <overlay v-bind:panel="trade_panel" v-on:close="closeOverlay('trade_panel')"><trade v-bind:resurser="resurser" v-bind:players="players" v-bind:user="user"></trade></overlay>
    <overlay v-bind:panel="map_panel" v-on:close="closeOverlay('map_panel')"><karta v-bind:players="players" v-bind:user="user"></karta></overlay>
    <overlay v-bind:panel="cards_panel" v-on:close="closeOverlay('cards_panel')"><cards></cards></overlay>

    <footer>
      <div class="spacer"></div>
      <svg class="icon" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?slideoutToggle():'';" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
        <use xlink:href="#svg-dollar"></use>
      </svg>
      <svg class="icon" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?toggleOverlay('trade_panel'):'';" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
        <use xlink:href="#svg-hands"></use>
      </svg>
      <svg class="icon" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?toggleOverlay('map_panel'):'';" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
        <use xlink:href="#svg-flag" fill="#FDFDFD"></use>
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
import Karta from '@/components/Karta'
import Cards from '@/components/Cards'

export default {
  name: 'app',
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
      resurser: {
        "trä":[{"type":"trä","x":271,"y":360},{"type":"trä","x":267,"y":396},{"type":"trä","x":229,"y":322}],
        "säd":[{"type":"säd","x":96,"y":383},{"type":"säd","x":85,"y":336}],
        "olja":[{"type":"olja","x":227,"y":386},{"type":"olja","x":111,"y":280},{"type":"olja","x":127,"y":353}],
        "sten":[{"type":"sten","x":191,"y":234},{"type":"sten","x":255,"y":316},{"type":"sten","x":176,"y":321}],
        "djur":[{"type":"djur","x":117,"y":225},{"type":"djur","x":217,"y":224}]
      },
      players:[{username: 'Samuel', color:'#e74c3c'},{username: 'Dan-Jakob', color:'#9b59b6'},{username: 'Simon', color:'#3498db'}],
      user: {username: 'Andreas', color:'#27ae60'},
    }
  },
  computed: {
    height: function() {
      return document.documentElement.clientHeight+'px';
    }
  },
  methods: {
    noscroll: function(e){
      e.stopPropagation();
      e.preventDefault()
    },
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
    trigger: function(obj){
      console.log('Kalas!', obj.msg)
    }
  },
  mounted: function(){
    console.log('App mounted')
    //this.trade_panel.open()
    this.$emit('openLoginPanel')
    this.slideout = new Slideout({
      'panel': document.getElementById('panel'),
      'menu': document.getElementById('buypanel'),
      'padding': 75,
      'padding2': 175,
      'tolerance': 35,
      'speed': 1,
      'both': false,
      'limit': false
    });
  },
  sockets:{

  },
  components: { Overlay, Trade, Karta, Buypanel, Panel, Cards }
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
  background: gray;
}

.slideout-panel {
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
</style>
