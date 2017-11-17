<template>
  <g class="road" v-on:click="$emit('click')" style="fill: #606060; stroke: #606060; stroke-width: 4;">
    <circle v-bind:cx="road.pos1[0]" v-bind:cy="road.pos1[1]" r="2" />
    <circle v-bind:cx="road.pos2[0]" v-bind:cy="road.pos2[1]" r="2" />
    <line v-bind:x1="road.pos1[0]" v-bind:y1="road.pos1[1]" v-bind:x2="road.pos2[0]" v-bind:y2="road.pos2[1]" />
  </g>
</template>

<script>
export default {
  name: 'road',
  props: {
    road: Object
  }
}
</script>
