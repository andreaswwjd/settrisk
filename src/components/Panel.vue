<template>
  <!-- <div id='panel' v-bind:class="{transition: transition}" v-bind:style="{transform: 'translate3d('+x+'px,0,0)'}" v-on:click="$emit('close')" v-on:touchstart.stop="tstart" v-on:touchmove.stop="tmove" v-on:touchend.stop="tend" v-on:transitionend="transend" > -->
  <div id='panel' v-on:click="$emit('close')">
    <div class="margintop" style="width:100%; height: 30px;"></div>
    <!-- <h1> Main panel </h1> -->
    <div v-html="dices.render()"></div>
    <resurs v-for="resurs in $props.resurser.array" :key="resurs.type" v-bind:resurs="resurs" v-bind:options="{movable:true}" ></resurs>
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
      transition: false
    }
  },
  computed:{

  },
  methods: {
    // tstart: function(e){
    //   this.moving = false;
    //   this.start = e.touches[0].clientX;
    // },
    // tmove: function(e){
    //   this.moving = true;
    //   this.end = e.touches[0].clientX;
    //   this.x = this.current + this.end - this.start;
    // },
    // tend: function(e){
    //   if(this.moving){ 
    //     this.moved = true
    //     this.transition = true
    //     if(40 < this.x && this.x < 110){ this.x = 75 }
    //     else if(110 <= this.x ){ this.x = 250 }
    //     else{ this.x = 0 }
    //     this.current = this.x;
    //   }
    // },
    // transend: function(e) {
    //   this.transition = false;
    // }
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
  transition: 0.5s transform;
}
</style>
