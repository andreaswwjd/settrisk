<template>
  <div v-bind:class="'resurs ' + ($props.options.dyrt?'dyrt':'') " v-bind:style="{left: resurs.x+'px', top: resurs.y+'px'}" v-on:touchmove.stop.prevent="_onTouchMoveFn">
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
    options: Object,
    panelX: Number
  },
  data () {
    return {
     
    }
  },
  computed:{

  },
  methods: {
    _onTouchMoveFn: function(eve) {
      let x = this.$props.panelX ? this.$props.panelX : 0 ;
      let screenHeight = document.documentElement.clientHeight;
      this.$props.resurs.y = eve.touches[0].clientY > screenHeight - 62.5 ? screenHeight - 75 : eve.touches[0].clientY - 12.5;
      this.$props.resurs.x = eve.touches[0].clientX < x + 12.5 ? 0 : eve.touches[0].clientX - 12.5 - x;

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
.tra{background-color: #1abc9c;}
.sten{background-color: #FFFFFF;}
.olja{background-color: #B697D8;}
.sad{background-color: #f1c40f;}
.djur{background-color: #75B96B;}
.people{background-color: #5bc0de; }
.valfri{background-color: #5bc0de; }

</style>
