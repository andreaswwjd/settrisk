<template>
  <div id="modal" v-bind:class="{closing: closing}" v-bind:style="{height: height, opacity: opacity}" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c&&modal.dismissable?close():'';" v-on:click.prevent.stop v-on:touchend.stop>
    <div id="modal-content" v-bind:style="{top: top}" v-on:transitionend="closeTransitionEnd" v-on:touchend.stop>
      <span class="back" v-if="currentMenuIndex" v-on:click="back()"><</span>
      <span class="close" v-if="modal.dismissable" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?close():'';" v-on:click.prevent>&times;</span>
      <div v-bind:class="modal.svgClass" v-if="modal.svg" v-html="modal.svg"></div>
      <div id="menues_container">
        <div id="menu_slider" v-bind:style="{transform: 'translateX('+(currentMenuIndex * (-100) / modal.content.length)+'%)', width: (100 * modal.content.length) +'%'}" v-on:transitionend.stop>
          <div class="menu" v-for="content in modal.content" v-bind:style="{width: (100 / modal.content.length) +'%'}">
            <h1 style=" color: darkgray;" v-if="content.title">{{content.title}}</h1>
            <p style=" color: darkgray;" v-if="content.msg" v-html="content.msg"></p>
            <div v-bind:class="content.htmlClass" v-if="content.html" v-html="content.html"></div>
            <div v-if="content.menu" style="height:10px; width:100%"></div>
            <div class="menu_item" v-if="content.menu" v-for="item in content.menu" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?action(item.action, item.response, item.then):'';">{{ item.text }}</div>
            <button class="round_btn" v-if="content.button1" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?action(content.button1.action, content.button1.response, content.button1.then):'';">{{ content.button1.text }}</button>
            <button class="round_btn" v-if="content.button2" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?action(content.button2.action, content.button2.response, content.button1.then):'';">{{ content.button2.text }}</button>
          </div>
        </div>
      </div>
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
      closing: false,
      currentMenuIndex: 0,
      c: false
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
    action: function(action, response, then){
      if(action){
        this.$emit(action, response, this.$props.modal);
      }
      this[then]()
    },
    slide: function(){
      this.currentMenuIndex += 1;
    },
    back: function(){
      this.currentMenuIndex -= 1;
    },
    closeTransitionEnd: function() {
      if(this.closing){
        this.closing = false
        this.currentMenuIndex = 0;
        this.$emit('nextModuleInQueue');
      }
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


.selection {
    position: relative;
    height: 140px;
    overflow: hidden;
    border-radius: 10px 10px 0 0;
}
.selection:before {
    content: "";
    background: radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 50px, rgba(0,0,0,0.2) 0%);
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
}

#modal{
  height: 0;
  opacity: 0;
  transition: 0.3s opacity;
  background-color: rgba(0,0,0,0.5);
  z-index: 25;
  overflow: hidden;
  /*overflow: auto;  SCROLL? */
    width: 100%;
    top: 0;
    position: absolute;
}
#modal-content {
  background-color: #f7f7f7;
  position: absolute;
  z-index: 25;
  width: calc(100% - 20px);
  transition: 0.5s top;
  left: 10px;
  border-radius: 10px;
  opacity: 1;
  /*overflow: hidden;*/
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
    position: absolute;
    top: 10px;
    right: 10px;
    margin: 0 10px;
    z-index: 1;
    font-size: 28px;
    font-weight: bold;
    color: white;
}
.back {
    position: absolute;
    top: 10px;
    left: 10px;
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

#menues_container{
  width: 100%; 
  overflow: hidden;
}
#menu_slider{
  /*width: 400%;*/
  transition: 0.3s transform;
}
.menu {
  display: inline-block; 
  /*width: 25%;*/ 
  float: left;
}
.menu_item{
    width: 80%;
    height: 30px;
    background: lightblue;
    padding: 10px;
    border-radius: 5px;
    margin: 0 auto 10px auto;
    font-size: 20px;
}
.left{
  text-align: left;
  padding: 0 20px;
}
.center{
  text-align: center;
  padding-top: 20px;
  margin-bottom: -20px;
}
</style>
