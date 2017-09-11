<template>
  <div id="modal" v-bind:class="{closing: closing}" v-bind:style="{height: height, opacity: opacity}" v-on:click.stop>
    <div id="modal-content" v-bind:style="{top: top}" v-on:transitionend="closing = false" >
      <span class="close" v-on:click="respond(false)">&times;</span>
        <div id="select_container" v-html="modal.html"></div>
        <h1 style=" color: darkgray;" v-if="modal.title">{{modal.title}}</h1>
        <p style=" color: darkgray;" v-if="modal.msg" v-html="modal.msg"></p>
        <button class="round_btn" v-on:click="respond(true)">{{ modal.type == 'alert' ? 'Okej' : 'Ja' }}</button>
        <button class="round_btn" v-on:click="respond(false)" v-if="modal.type == 'confirm'">Avbryt</button>
    </div>
    <div style="height: 100px; width: 100%"></div>
  </div>
</template>

<script>
export default {
  name: 'modalmenu',
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
    top: function(){ return this.$props.modal.isOpen ? '10%' : '20%'; }
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
    },
    respond: function(response){
      if(this.$props.modal.type=='confirm'){
        this.$props.modal.confirmed = response;
        this.$emit(this.$props.modal.action, this.$props.modal);
      }
      this.close()

    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


#select_container {
    position: relative;
    height: 140px;
    overflow: hidden;
    border-radius: 10px 10px 0 0;
}
#select_container:before {
    content: "";
    background: radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 50px, rgba(0,0,0,0.2) 0%);
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
}

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
#modal-content:after {
    content: "";
    height: 100px;
    width: 100%;
    position: absolute;
    bottom: -100px;
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
    /*color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    margin: 0 10px;*/
    position: absolute;
    top: 10px;
    right: 10px;
    margin: 0 10px;
    z-index: 1;
    font-size: 28px;
    font-weight: bold;
    color: white;
}
#modal button {
  width: 100px;
  height: 40px;
  background-color: gray;
  margin: 15px;
}

</style>
