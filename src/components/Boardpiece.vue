<template>
  <g class="boardpiece" v-bind:id="boardpiece.id" v-on:click="$emit('clickboard')" v-on:click.prevent>
    <slot></slot>
  </g>
</template>

<script>

export default {
  name: 'boardpiece',
  components: { },
  props: {
    boardpiece: Object
  },
  data () {
    return {
    }
  },
  computed:{
  },
  methods: {
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
