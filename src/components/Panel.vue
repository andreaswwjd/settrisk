<template>
  <div id='panel' v-on:click="$emit('close')">
    <div class="margintop" style="width:100%; height: 100px;"></div>
    <!-- <h1> Main panel </h1> -->
    <div v-for="res in resurserKeys"><resurs v-for="resurs in $props.resurser[res]" :key="resurs.type" v-bind:resurs="resurs" v-bind:options="{movable:true}" v-on:trigger="trigger"></resurs></div>
  <br>
  </div>
</template>

<script>
import Resurs from '@/components/Resurs'

export default {
  name: 'panel',
  props: {
    resurser: Object
  },
  data () {
    return {
      
    }
  },
  computed:{
    resurserKeys: function(){
      return Object.keys(this.$props.resurser)
    }
  },
  methods: {
    trigger: function(obj){
      this.$emit('trigger', obj)
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
</style>
