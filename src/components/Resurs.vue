<template>
  <div v-bind:class="'resurs ' + $props.resurs.dyrt" v-bind:style="{left: $props.resurs.x+'px', top: $props.resurs.y+'px'}" v-on:touchmove="_onTouchMoveFn">
    <div v-bind:class="$props.resurs.type">
      <svg class="icon_resurs" width="25px" height="25px" viewBox="0 0 100 100"><use v-bind:xlink:href="'#svg-' + $props.resurs.type "></use></svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'resurs',
  props: {
    resurs: Object,
    options: Object
  },
  data () {
    return {
     
    }
  },
  computed:{

  },
  methods: {
    _onTouchMoveFn: function(eve) {
      var x = 0;
      //if ( slideout.isOpen2() ){ return }
      //if ( slideout.isOpen() ){ x = slideout._padding; } 
      eve.stopPropagation();
      eve.preventDefault();
      this.$props.resurs.y = eve.touches[0].clientY-12.5;
      this.$props.resurs.x = eve.touches[0].clientX-12.5-x;
    }
  },
  mounted: function() {

  }
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
.säd{background-color: #f1c40f;}
.djur{background-color: #75B96B;}

</style>
