<template>
  <g class="buildsite" v-on:click="$emit('click')" v-bind:transform="'translate('+buildsite.pos[0]+', '+buildsite.pos[1]+')'" style="fill: black; fill-opacity: 0.2; " v-bind:data="buildsite.fields">
  <polygon points="-20,0 -10,17.320508075688764 10,17.320508075688764 20,0 10,-17.320508075688764 -10,-17.320508075688764" ></polygon></g>
</template>

<script>
export default {
  name: 'buildsite',
  props: {
    buildsite: Object
  }
}
</script>
