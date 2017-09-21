<template>
  <div id='panel' v-bind:class="{slideoutpanel: true, transition: transition}" v-bind:style="{transform: 'translate3d('+x+'px,0,0)'}" v-on:click="$emit('close')" v-on:touchstart.stop.prevent="tstart" v-on:touchmove.stop.prevent="tmove" v-on:touchend.stop.prevent="tend" v-on:touchcancel.stop.prevent="tend" v-on:transitionend="transend" v-on:scroll.stop.prevent>
  <!-- <div id='panel' v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?$emit('close'):''"> -->
    <div class="margintop" style="width:100%; height: 30px;"></div>
    <!-- <h1> Main panel </h1> -->
    <div v-html="dicesHTML"></div>
    <resurs v-for="resurs in $props.resurser.array" :key="resurs.type" v-bind:resurs="resurs" v-bind:panelX="current" v-bind:options="{movable:true}" ></resurs>
    <div id="itemsmenu_container" style="position: absolute;  z-index:1; overflow: hidden; transition: left 0.3s; padding: 0 5px;">
      <div style="height: 30px"></div>
    </div>
  <br>
  </div>
</template>

<script>
import Resurs from '@/components/Resurs'

export default {
  name: 'panel',
  props: {
    resurser: Object,
    dices: Object
  },
  data () {
    return {
      x:0,
      transition: false,
      start: 0,
      moving: false,
      current: 0,
      end: 0

      // panel: document.getElementById('panel')
    }
  },
  computed:{
    dicesHTML: function(){
      return this.dices.render()
    }
  },
  methods: {
    tstart: function(e){
      this.moving = false;
      this.start = e.touches[0].clientX;
    },
    tmove: function(e){
      this.moving = true;
      this.end = e.touches[0].clientX;
      this.vel = e.touches[0].clientX;
      this.dist = this.end - this.start;
      this.x = this.current + this.dist;
      this.x = (this.x < 0) ? 0 : this.x;
      // this.panel.style.transform = 'translate3d('+this.x+',0,0)';
    },
    tend: function(e){
      if(this.moving){ 
        this.transition = true
        // if(40 < this.x && this.x < 110){ this.x = 75 }
        // else if(110 <= this.x ){ this.x = 250 }
        // else{ this.x = 0 }
        if((this.end - this.start)<0) { // closing
          switch(this.current) {
            case 75:
            // transition to 0
              this.transition = true;
              this.x = this.current = 0;
            break;
            case 250:
            // transition to 75
              this.transition = true;
              this.x = this.current = (this.x <= 5)? 0 : 75;
            break;
          }
        } else { // opening
          switch(this.current) {
            case 0:
              // transition to 75  
              this.transition = true;
              this.x = this.current = 75;
            break;
            case 75:
            // transition to 250
              this.transition = true;
              this.x = this.current = 250;
            break;
            case 250:
              this.transition = true;
              this.x = this.current = 250;
            
            break;
          }
        }

        // this.swipe_dist = this.end - this.start;
        // if(40 < this.x && this.x < 200){ this.x = 75 }
        // else if(200 <= this.x ){ this.x = 250 }
        // else{ this.x = 0 }
        // this.current = this.x;
        // this.panel.style.transform = 'translate3d('+this.x+',0,0)';
      }
    },
    transend: function(e) {
      this.transition = false;
    }
  },
  mounted: function() {

  },
  components: { Resurs }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

#panel{
  height: 100%;
  min-height: 675px;
  background: #f7e2c2;box-shadow: -3px 0 23px rgba(0, 0, 0, 0.25);
}
.transition {
  transition: 0.3s transform cubic-bezier(0.21, 0.78, 0.58, 1);
}
</style>
