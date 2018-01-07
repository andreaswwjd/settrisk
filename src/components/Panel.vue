<template>
  <div id='panel' v-bind:class="{slideoutpanel: true, transition: transition}" v-bind:style="{transform: 'translate3d('+translationX+'px,0,0)'}" v-on:click="$props.isOpen=false" v-on:touchstart.stop.prevent="tstart" v-on:touchmove.stop.prevent="tmove" v-on:touchend.stop.prevent="tend" v-on:touchcancel.stop.prevent="tend" v-on:transitionend="transend" v-on:scroll.stop.prevent>
  <!-- <div id='panel' v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?$emit('close'):''"> -->
    <div class="resurs_display" style="width:100%; height: 30px;">
      <div class="" v-for="typ in resurser.resursTypes" :key="typ">
        <resurs v-bind:resurs="{type: typ}" v-bind:options="{movable:false}" style="display:inline-block; position: initial; margin-bottom:-5px;"></resurs>
        <div style="display:inline-block;">{{resurser.array.filter(r=>r.type==typ).length}}</div>
      </div>
    </div> 
    <div class="margintop" style="width:100%; height: 50px;"></div>
    <!-- <h1> Main panel </h1> -->
    <div v-html="dicesHTML"></div>
    <resurs v-for="resurs in _resurser" v-bind:key="resurs.id+'p'" v-bind:resurs="resurs" v-bind:panelX="current" v-bind:options="{movable:true}" ></resurs>
    <div id="itemsmenu_container" style="position: absolute; z-index: 1; overflow: hidden; transition: left 0.3s; padding: 0 5px;">
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
    isOpen: Boolean,
    resurser: Object,
    dices: Object,
  },
  data () {
    return {
      x:0,
      transition: false,
      start: 0,
      moving: false,
      current: 0,
      end: 0
    }
  },
  computed:{
    _resurser: function(){
      return this.$props.resurser.array.filter(r=>r.location=='panel')
    },
    dicesHTML: function(){
      return this.dices.render()
    },
    translationX: function(){
      // if(this.isOpen){
      //   this.current = this.isOpen ? 250 : 0 ;
      // }
      if(this.moving){
        this.transition = false;
        return this.x
      }else{
        this.transition = true;
        this.current = this.isOpen ? 250 : this.current ;
        if(this.current == 250 && !this.isOpen){this.current = 0}
        return this.current;
      }
    }
  },
  methods: {
    // open: function(){
    //   this.x = this.current = 250;
    // },
    // close: function(){
    //   this.x = this.current = 0;
    // },
    // toggle: function(){
    //   this.open_state ? this.close() : this.open();
    // },
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
    },
    tend: function(e){
      if(this.moving){ 
        this.transition = true

        if((this.end - this.start)<0) { // closing
          switch(this.current) {
            case 75:
            // transition to 0
              this.x = this.current = 0;
            break;
            case 250:
            // transition to 75
              this.$emit('close');
              this.x = this.current = (this.x <= 5)? 0 : 75;
            break;
          }
        } else { // opening
          switch(this.current) {
            case 0:
              // transition to 75  
              this.x = this.current = 75;
            break;
            case 75:
            // transition to 250
              this.x = this.current = 250;
              this.$emit('open');
            break;
            case 250:
              this.x = this.current = 250;
            break;
          }
        }

        this.moving = false;
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
<style>
.resurs_display {
  position:fixed; top: 0; left: 0; width:100%; 
}
.resurs_display > div {
  display: inline-flex;
  margin: 10px;
  align-items: center;
}
.resurs_display .resurs > div {
  background: none;
  box-shadow: none !important
}
#panel{
  height: 100%;
  min-height: 675px;
  background: #f7e2c2;box-shadow: -3px 0 23px rgba(0, 0, 0, 0.25);
}
#panel.transition {
  transition: 0.3s transform cubic-bezier(0.21, 0.78, 0.58, 1);
}
</style>
