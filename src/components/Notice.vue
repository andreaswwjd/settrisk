<template>
  <div id="notice" v-bind:class="{show_notice: show}" v-on:animationend="animationend">
    <div class="note" v-if="note&&note.title||note&&note.msg">
      <p>
        <span v-html="note.icon" v-if="note.icon"></span> 
        <strong>{{note.title?note.title:''}}</strong> {{note.msg?note.msg:''}}
      </p>
    </div>
    <div class="note" v-if="note&&note.html" v-html="note.html" style="color: #262626; "></div>
  </div>
</template>

<script>
export default {
  name: 'notice',
  props: {
    notesQ: Array
  },
  data () {
    return {

    }
  },
  computed: {
    note: function(){
      // return this.$props.notesQ[0] || (this.show = false && {})
      return this.$props.notesQ[0]
    },
    show: function(){
      return this.note ? this.note.show : false;
    }
  },
  methods: {
    animationend: function(){
      this.note.show = false;
      let self = this;
      setTimeout(function(){
        self.$emit('next')
      },500)
    }
  },
  mounted: function() {
    this.$emit('notify',{title:'Welcome', msg:'to Settrisk 3.0!', show: true})
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
#notice {
  position: fixed;
  height:0%;
  width: 100%;
  top: 0%;
  left: 0%;
  overflow: hidden;
  z-index: 110;
}
#notice .note {
  display: block;
  background: #fafafa;
  width: 100%;
  height: auto;
  padding-top: 20px; 
  box-shadow: 0 0 10px rgba(100,100,100,0.5);
}
#notice .note p, #notice .note strong {
  color: #262626;
  font-size: 1em;
  margin:3px;
}
#notice .note p {
  display: flex;
  justify-content: center;
  align-items: center;
}
#notice.show_notice {
  animation: show_notice 6s;
}
@keyframes show_notice {
  0% { height: 0px; }
  10% { height: 100px; }
  90% { height: 100px; }
  100% { height: 0px; }
}
</style>
