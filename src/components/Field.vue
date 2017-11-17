<template>
  <g class="field" v-bind:type="field.type" v-bind:fill="field.fill" v-bind:stroke="field.fill" v-bind:style="{'stroke': field.occupiedBy!='none'?'black':'', 'stroke-opacity': 0.2, 'stroke-width': 1}" v-on:touchstart="c=true" v-on:touchmove="c=false"  v-on:touchend="c?$emit('fieldclick'):'';" v-on:click.prevent>
    <polygon v-for="t in field.array" v-bind:points="t.join(' ')"></polygon>
    <g class="number" v-if="field.number" style="text-anchor: middle; font-family: 'Helvetica'; font-size: 13px; fill: #606060; fill-opacity:1; stroke-width: 0;">
      <circle v-bind:cx="field.pos[0]" v-bind:cy="field.pos[1]" r="8.1"/>
      <text v-bind:transform="'matrix(1 0 0 1 '+field.pos[0]+' '+(field.pos[1]+4.5)+')'" fill="#FFFFFF">{{field.number}}</text>
    </g>
  </g>
</template>

<script>
export default {
  name: 'field',
  props: {
    field: Object,
  }
}
</script>

