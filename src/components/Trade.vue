<template>
  <div id='trade'>
    <h1> Trademarket </h1>
    <svg width="70px" height="100px" viewBox="0 0 100 100">
      <use xlink:href="#svg-hands"></use>
    </svg>
    <div style="width: 100%; height: 40px; justify-content: center;">
      <div id="trade_container" >
        <p style="font-size: 10px; margin: 0; transition: 0.7s; opacity: 0" v-bind:class="{show: trade[0]}" >TAP TO REMOVE</p>
        <div v-for="resurs in trade" v-bind:key="resurs.x+resurs.y" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?del(resurs):'';">
          <resurs v-bind:resurs="resurs" v-bind:options="{movable:false, dyrt:''}"></resurs>
        </div>
      </div>
    </div>
    <div style="width: 100%; height: 20px;"></div>
    <!-- Resurs buttons -->
    <button v-for="resurstype in resurser.tradeTypes" :key="resurstype" v-bind:class="'res ' + resurstype" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?add(resurstype):'';" v-bind:disabled="!$props.resurser.array.find(r=>r.type==resurstype&&r.location=='panel')"> {{ $props.resurser.types[resurstype].name }} </button>
    <div class="" style="width: 100%; height: 20px;"></div>
    <!-- To buttons -->
    <button v-for="player in players" :key="player.id" v-bind:disabled="'trade.korg.length' < 1" v-if="hasHamn && player.username != user.username" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?send(player):'';" class="player shadow_blue txtshadow"><p>{{player.name}}</p></button>
    <button v-bind:disabled="!isBankable" v-on:click="send({name: 'Bank', username: 'bank'})" class="player shadow_blue txtshadow"><p>Bank</p></button>
     
  </div>
</template>

<script>
import Resurs from '@/components/Resurs'

export default {
  name: 'trade',
  props: {
    resurser: Object,
    players: Array,
    user: Object,
    hasHamn: Boolean
  },
  data () {
    return {

    }
  },
  computed:{
  	trade: function(){
      // return this.$props.resurser.trade;
      return this.$props.resurser.array.filter(r=>r.location=='trade');
    },
    isBankable: function(){
      return this.trade.filter(t=>t.type==this.trade[0].type).length==4;
    }
  },
  methods: {
    add: function(type){
      this.$props.resurser.array.find(r=>r.type==type&&r.location=='panel').location = 'trade';
      // var resurs = this.$props.resurser.pop(type);
      // if(resurs){this.trade.push(resurs)};
    },
    del: function(resurs){
      resurs.location = 'panel'
      // var res = this.trade.splice(this.trade.indexOf(resurs),1)[0]
      // this.$props.resurser.push(res);
    },
    send: function(player){
      if(player.name!='Bank'){
        this.$socket.emit('trade',{resurser: this.trade, to: player})
      }else if(this.isBankable){
        this.$socket.emit('trade',{resurser: this.trade, to: player})
      }
    }
  },
  mounted: function() {
    
  },
  components: { Resurs }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.resurs{ 
  margin: 2px;
}
#panel .resurs{
  position: absolute;
}

.resurs>div {
    height: 25px;
    width: 25px;
    border-radius: 100%;
    display: inline-block;
    box-shadow: -0.5px -2px 8px -2px black inset;
}
.trä{background-color: #1abc9c;}
.sten{background-color: #FFFFFF;}
.olja{background-color: #B697D8;}
.sad{background-color: #f1c40f;}
.djur{background-color: #75B96B;}


.res{ width: 35%; height: 35px; }
.player{ width: 40%; height: 50px; }
.resurs {display: inline-block;}

.resurs_staplar {
    display: inline-block;
    justify-content: center;
    text-align: center;
    width: 100%;
}
.resurs_staplar * {
    display: inline-block;
    vertical-align: middle;
}
.resurs_staplar .stapel {
    display: inline-block;
    margin: 5px;
}
.stapel h5 {
    text-indent: -5px;
}

/*#trade .res, #trade .player {
  justify-content: center;
  border-radius: 15px;    
  box-shadow: 0 0 0 1px rgb(79, 147, 169), 0 2px 1px 1px #5CB7D4 inset, 0 -2px 1px 1px #4697B0 inset, 0 4px 1px 1px rgba(11, 41, 49, 0.27), 0 5px 1px 2px #5FAFC7, 0 -2px 0px 3px #3994AF;
  background: radial-gradient(at top 55% left 55%, #47AFCC, #45ABC5, #3C92A9);
  font-size: 20px;
  margin: 10px 7px;
  text-shadow: 0 2px 2px gray;
  color: white;
}
#trade .res:disabled, #trade .res:active, #trade .player:disabled, #trade .player:active {
  box-shadow: 0 0 0 1px rgb(79, 147, 169), 0 2px 1px 1px #4697B0 inset, 0 -2px 2px 0px rgba(1, 54, 68, 0.93), 0 5px 1px 2px #5FAFC7, 0 -2px 0px 3px #3994AF;
  background: radial-gradient(at top 55% left 55%, #47AFCC, #45ABC5, #3C92A9);
}*/
#trade .res:disabled, #trade .player:disabled {
  opacity: 0.5;
}
/*#trade .res, #trade .player {
  justify-content: center;
  border-radius: 100px;    
  overflow: hidden;
  box-shadow: -1px -1px 0px 1px rgb(60, 130, 152);
  background: radial-gradient(at top 55% left 55%, #47AFCC, #45ABC5, #3C92A9);
  font-size: 20px;
  margin: 10px 7px;
  text-shadow: 0 2px 2px gray;
  color: white;
}*/
#trade .res:disabled, #trade .res:active, #trade .player:disabled, #trade .player:active { 
  box-shadow: none;  
  opacity: 0.7;
  /*box-shadow: 0 0 0 1px rgb(79, 147, 169), 0 2px 1px 1px #4697B0 inset, 0 -2px 2px 0px rgba(1, 54, 68, 0.93), 0 5px 1px 2px #5FAFC7, 0 -2px 0px 3px #3994AF;
  background: radial-gradient(at top 55% left 55%, #47AFCC, #45ABC5, #3C92A9);
  text-shadow: 2px 1px 0 rgba(61, 132, 148, 0.99333), 1px 1px 0.2px rgba(47, 147, 172, 0.99333),2px 2px 0.4px rgba(47, 147, 172, 0.98667),3px 3px 0.6px rgba(47, 147, 172, 0.98),4px 4px 0.8px rgba(47, 147, 172, 0.97333),5px 5px 1px rgba(47, 147, 172, 0.96667),6px 6px 1.2px rgba(47, 147, 172, 0.96),7px 7px 1.4px rgba(47, 147, 172, 0.95333),8px 8px .6px rgba(47, 147, 172, 0.94667),9px 9px .8px rgba(47, 147, 172, 0.94),10px 10px 2px rgba(47, 147, 172, 0.93333),11px 11px .2px rgba(47, 147, 172, 0.92667),12px 12px 2.4px rgba(47, 147, 172, 0.92),13px 13px 2.6px rgba(47, 147, 172, 0.91333),14px 14px 2.8px rgba(47, 147, 172, 0.90667),15px 15px 3px rgba(47, 147, 172, 0.9),16px 16px 3.2px rgba(47, 147, 172, 0.89333),17px 17px 3.4px rgba(47, 147, 172, 0.88667),18px 18px 3.6px rgba(47, 147, 172, 0.88),19px 19px 3.8px rgba(47, 147, 172, 0.87333),20px 20px 4px rgba(47, 147, 172, 0.86667); 
*/}
#trade .res, #trade .player {
  justify-content: center;
  border-radius: 100px;    
  overflow: hidden;
  font-size: 20px;
  margin: 10px 7px;
  color: white;
  box-shadow: 1px 2px 1px 1px #3994AF;
  border-width: 0;
  background: #54ADC7;
  box-shadow: 0 1px 0px 1px #5CB7D4 inset, 0 0px 0px 0px #4697B0 inset, 0 3px 0px 0px rgba(11, 41, 49, 0.27), 0 0px 0px 3px #3994AF, 0 2px 0px 3px #5DB5D0;
  /*background: radial-gradient(at top 55% left 55%, #47AFCC, #45ABC5, #3C92A9);*/
  /*text-shadow: 2px 1px 0 rgba(61, 132, 148, 0.99333), 1px 1px 0.2px rgba(47, 147, 172, 0.99333),2px 2px 0.4px rgba(47, 147, 172, 0.98667),3px 3px 0.6px rgba(47, 147, 172, 0.98),4px 4px 0.8px rgba(47, 147, 172, 0.97333);*/
}
#trade_container div {
  display: inline-block;
}
.show {
  opacity: 1 !important;
}
</style>
