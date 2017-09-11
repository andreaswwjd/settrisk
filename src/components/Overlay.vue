<template>
  <div class="overlay">
    <div class="menuitem transition" v-bind:style="{height: height, background: $props.panel.color}" v-on:touchstart="tstart" v-on:touchmove="tmove" v-on:touchend="tend" v-on:transitionend="transend">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'menuitem',
  props: {
  	panel: Object
  },

  data () {
    return {
      scroll: false,
      startY: 0,
      dismissOverlayPX: 0
    }
  },

  computed:{
  	height: function(){
  	  return this.$props.panel.isOpen ? (document.documentElement.clientHeight + this.dismissOverlayPX)+'px' : '0px';
  	},
  },

  methods: {
  	tstart: function(e){
            if(this.$props.panel.noscroll){return}
					  this.allowUp = (this.menuitem.scrollTop > 0);
            this.allowDown = (this.menuitem.scrollTop < this.menuitem.scrollHeight - this.menuitem.clientHeight);
            this.slideBeginY = e.touches[0].pageY;
            this.startY = e.touches[0].clientY; 
            this.menuitem.classList.remove('transition');
					},
		tmove: function(e){
            if(this.$props.panel.noscroll){return}
            var up = (e.touches[0].pageY > this.slideBeginY);
            var down = (e.touches[0].pageY < this.slideBeginY);
            this.slideBeginY = e.touches[0].pageY;
            if ((up && this.allowUp) || (down && this.allowDown)) {
                e.stopPropagation();
            }
            else {
                e.preventDefault();
                if(!down){
                  this.dismissOverlayPX = this.startY - e.touches[0].clientY;
                }
            }
			    },
    tend: function(e){
            if(this.$props.panel.noscroll){return}
            if(this.dismissOverlayPX < -100 ){
              this.$emit('close')
            }
            this.menuitem.classList.add('transition');
            this.dismissOverlayPX = 0;
			    },
    transend: function(e){
			     //if(!this.$props.panel.isOpen){ this.hidden = true; } 
			    },
    slide: function(distance) {
            var pos = 0;
            var id = setInterval(frame, 5);
            var factor = 1;
            if(distance < 0){ distance = -distance; factor=-1; }
            function frame() {
              if (pos*factor > distance-10) {
                this.currentY += pos;
                clearInterval(id);
              } else {
                // pos+=factor;
                var left = distance-pos*factor;
                left/20 < 1 ? pos+=factor : pos+=factor*left/20;
                this.firstElementChild.style.bottom = (nationsmenu.currentY + pos) + 'px'; 
              }
            }
          }
  },
  mounted: function() {
    this.menuitem = this.$el.firstElementChild;
    console.log(this.menuitem)

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.overlay {
    position: absolute;
    width: 100%;
    bottom: 0px;
}
.menuitem { 
  display: block;
  position: relative; 
  top:0px; 
  height:0%; 
  width:100%; 
  z-index: 2;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.45); 
  overflow-x: hidden; 
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}
.transition {
  transition: 0.5s;
}
.inside {bottom:0; width:100%; position: relative; /*flex-direction: row;  flex-wrap: wrap;*/ justify-content: center;}
</style>
