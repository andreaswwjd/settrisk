<template>
  <div id="component">COMPONENT</div>
</template>

<script>
export default {
  name: 'component',
  data () {
    return {
      
    }
  },
  mounted: function() {
    this.$emit('closeLoginPanel')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#component {height:1000px;}
</style>
