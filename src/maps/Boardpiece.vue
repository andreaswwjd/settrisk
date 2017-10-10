<template>
  <g class="boardpiece" v-bind:id="boardpiece.id" v-on:click="$emit('clickboard')">
    <slot v-bind:transform="'rotate('+angle/Math.PI*180+' '+(origin[0]+translate[0])+' '+(origin[1]+translate[1])+') translate('+translate.join(' ')+')'"></slot>
  </g>
</template>

<script>
import Field from '@/maps/Field'
import Road from '@/maps/Road'
import Buildsite from '@/maps/Buildsite'

export default {
  name: 'boardpiece',
  components: { Field, Road, Buildsite },
  props: {
    boardpiece: Object,
    selected: Object
  },
  data () {
    return {
    }
  },
  computed:{
    translate: function(){
      return this.boardpiece.transform.translate;
    },
    angle: function(){
      return this.boardpiece.transform.rotation.angle;
    },
    origin: function(){
      return this.boardpiece.transform.rotation.origin;
    },
    fieldPointerEvents: function(){
      return ['edit','number','move'].indexOf(this.selected.tool) != -1  ? 'auto' : 'none';
    },
  },
  methods: {
    triangleclick: function(obj){
      this.$emit('triangleclick',obj)
    }
  }
}

// var c4 = function(){ // Random id generator
//   return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
// }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .field.passive{ 
    fill-opacity: 0.7;
  }
  .field.passive:hover{ 
    fill-opacity: 0.9;
  }
</style>
