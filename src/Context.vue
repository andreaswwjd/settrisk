<template>
  <div id="context" >
    <div id="curtain" v-bind:style="{height: curtain}" v-on:transitionend="curtainRollEnd()">
      <Login v-on:closeLoginPanel="curtainDown"></Login>
    </div>
    <!-- <modal v-bind:modal="modal" v-on:response="modalResponse"></modal> -->
    <router-view id="router" v-on:openLoginPanel="curtainUp" v-on:closeLoginPanel="curtainDown"></router-view>
    
  </div>
</template>

<script>
import Login from './views/Login'
import Modal from './components/Modal'
import Router from 'vue-router'

export default {
  name: 'context',
  components: { Login, Modal },
  data() {
    return {
      curtain: '0%',
      destination: '',
      username: '',
      user_id: '',
      modal: {}
    }
  },
  methods: {
    curtainUp: function(dest_onend){
      this.curtain = '100%'
      console.log('Curtain up!')
      if(dest_onend){
        this.destination = dest_onend
      }
    },
    curtainDown: function(dest_onstart){
      this.curtain = '0%'
      console.log('Curtain down!')
      if(dest_onstart){
        this.$router.push(dest_onstart)
      }
    },
    curtainRollEnd: function(){
      if(this.destination){
        this.$router.push(this.destination)
        this.destination = '';
      }
    },
    modalResponse: function(res){
      console.log(res)
    }
  },
  mounted: function(){
    // var evt = document.body.createEvent('Event');
    // evt.initEvent('openModal', true, true)
    // document.body.addEventListener("openModal", this.openModal, false); 
    // var modal = document.getElementById('modal');
    // modal.open = this.openModal;
    // modal.close = this.closeModal;
    // var self = this;
    // setTimeout(function() {self.modal = {
    //   isOpen: true,
    //   title: "Är du säker?",
    //   msg: "Loggar du in kommer du inte kunna logga ut."
    // }}, 1000);
    
  }
}

</script>

<style>
#context {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0;
  display: block;
  position: relative
}
#curtain { 
  display: block;
  position: absolute; 
  /*position: fixed; */left:0px; bottom:0px; height:0%; width:100%; /*background: radial-gradient(at 40% 0%, #2ECC71, #1E8246) 0% 0% repeat scroll transparent;*/ z-index: 20;transition: 0.5s; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.45); overflow: hidden;
}
#router {
  transition: 0.3s filter;
}


</style>

