<template>
  <div class="games">
    <div class="margintop" style="width:100%; height: 100px;"></div>
    <h1>Settrisk 3.0</h1>
    <router-link to="/games"><button class="big_btn">Games</button></router-link>
    <router-link to="/rules"><button class="big_btn">Rules</button></router-link>
    <router-link to="/guide"><button class="big_btn">Guide</button></router-link>
    <router-link to="/about"><button class="big_btn">About</button></router-link>
  </div>
</template>

<script>
export default {
  name: 'games',
  data () {
    return {
      
    }
  },
  computed: {
    
  },
  sockets:{
    connect: function(){
      console.log('socket connected')
    },
    authorized: function(val){
      console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
      console.log(val)
    }
  },
  methods: {
    
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.games {
  overflow: hidden;
  
}
</style>
