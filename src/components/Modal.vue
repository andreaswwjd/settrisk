<template>
  <div id="modal" v-bind:class="{closing: closing}" v-bind:style="{height: height, opacity: opacity}" v-on:click.stop>
    <div id="modal-content" v-bind:style="{top: top}" v-on:transitionend="closing = false" class="arrow">
      <span class="close" v-on:click="$emit('response', false); close()">&times;</span>
      <div style="clear: both; margin-bottom: 40px; padding: 0 10px">
        <h1 style=" color: darkgray;" v-if="modal.title">{{modal.title}}</h1>
        <p style=" color: darkgray;" v-if="modal.msg">{{modal.msg}}</p>
        <button class="round_btn" v-on:click="$emit(modal.action, true); close()">{{ modal.type == 'alert' ? 'Okej' : 'Ja' }}</button>
        <button class="round_btn" v-on:click="$emit(modal.action, false); close()" v-if="modal.type == 'confirm'">Avbryt</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'modal',
  props: {
    modal: {}
  },
  data(){
    return {
      closing: false
    }
  },
  computed: {
    height: function(){ return this.$props.modal.isOpen || this.closing ? '100%' : '0%'; },
    opacity: function(){ return this.$props.modal.isOpen ? '1' : '0'; },
    top: function(){ return this.$props.modal.isOpen ? '10%' : '0%'; }
  },
  mounted: function(){
    // this.openModal()
  },
  sockets:{

  },
  methods: {
    open: function(){
      this.$props.modal.isOpen = true;
    },
    close: function(){
      this.$props.modal.isOpen = false;
      this.closing = true;
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


#modal{
  /*height: 0px;*/
  height: 0;
  /*transition: 0.7s height;*/
  opacity: 0;
  transition: 0.3s opacity;
  background-color: rgba(0,0,0,0.5);
  z-index: 25;
  overflow: auto;
    width: 100%;
    top: 0;
    position: absolute;
}
#modal-content {
  /*background: url("/static/flip.png");*/
  background-color: #f7f7f7;
  position: absolute;
  z-index: 25;
  width: calc(100% - 20px);
  transition: 0.5s top;
  /*height: calc(100% - 20px);*/
  background-position: center;
  background-repeat: no-repeat;
  left: 10px;
  /*top: calc(-100%);*/
  border-radius: 10px;
  opacity: 1;
}
.arrow:before {
  bottom: 100%;
  left: 50%;
  border: solid transparent;
  content: "";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
  border-color: transparent;
  border-bottom-color: #f7f7f7;
  border-width: 10px;
  margin-left: -10px;
}
.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    margin: 0 10px;
}
#modal button {
  width: 100px;
  height: 40px;
  background-color: gray;
  margin: 10px;
}

</style>
