<template>
  <div id='buypanel' >
    <h1> Buy & Build </h1>
    <div id="items_container">
      <div class="item" v-for="item in Object.keys(buildingitems)">
        <button class="btn building_btn shadow" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c&&available[item]?buy(item):'';" v-bind:disabled="available[item]==false">
          <svg height="53" width="53" viewBox="-20 -20 40 40">
            <polygon fill="#FAFAFA" points="-20,0 -10,17.320508075688764 10,17.320508075688764 20,0 10,-17.320508075688764 -10,-17.320508075688764" >
              </polygon>
            <use v-bind:xlink:href="'#'+item"></use>
          </svg>
        </button>
        <div class="small" style="margin: 10px 5px 5px 5px; width: 170px">
          <span class="capitalize">{{item}}</span>
          <br>Pris: 
          <span v-for="res in Object.keys(resurser.types)">
            <div v-for="nr in buildingitems[item].price[res]" v-bind:class="{pris: true, not_enough: !resurser.has(res,nr)}" v-bind:style="{background: resurser.types[res].color}">
              <svg v-if="res=='people'" width="10px" height="10px" viewBox="14 10 72 80"><use v-bind:xlink:href="'#svg-'+res"></use></svg>
            </div>
          </span>
          <br>
          <span class="xsmall">{{buildingitems[item].info}}</span>
          <span class="xsmall" v-if="buildingitems[item].utdelning"><strong>Utdelning: </strong>{{buildingitems[item].utdelning}}/fält<br></span>
          <span class="xsmall" v-if="buildingitems[item].bonus"><strong>Bonus: </strong>{{buildingitems[item].bonus.antal+' '+buildingitems[item].bonus.type}}<br></span>
        </div>
      </div>
      <div class="item" v-for="item in Object.keys(armyitems)">
        <button class="btn army_btn shadow" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c&&available[item]?buy(item):'';" v-bind:disabled="available[item]==false">
          <svg height="53" width="53" viewBox="-20 -20 40 40">
            <rect fill="#FAFAFA" style="x: -14;y: -14; height: 28px;width: 28px; transform: rotate(45deg);" ></rect>
            <use v-bind:xlink:href="'#'+item"></use>
          </svg>
        </button>
        <div class="small" style="margin: 10px 5px 5px 5px; width: 175px">
          <span class="capitalize">{{item}}</span><br>Pris: 
          <span v-for="res in Object.keys(resurser.types)">
            <div v-for="nr in armyitems[item].price[res]" v-bind:class="{pris: true, not_enough: !resurser.has(res,nr)}" v-bind:style="{background: resurser.types[res].color}">
              <svg v-if="res=='people'" width="10px" height="10px" viewBox="14 10 72 80"><use v-bind:xlink:href="'#svg-'+res"></use></svg>
            </div>
          </span>
          <br>
          <span class="xsmall">
            <strong>Hastighet:</strong> {{armyitems[item].vel}} över {{armyitems[item].veg}}.<br>
            <span v-if="armyitems[item].range"><strong>Räckvidd:</strong> {{armyitems[item].range}}.<br></span>
            <span v-if="armyitems[item].capacity"><strong>Kapasitet:</strong> {{armyitems[item].capacity}}.</span>
          </span>
        </div>
      </div>
    </div>
    <!-- <div id="itemsmenu_container"><div class="item_menu"><div class="buy_btn green"> Köp </div><div class="buy_btn red"> Ångra </div></div></div> -->
    <div style="height: 60px"></div>

  </div>
</template>

<script>
export default {
  name: 'buypanel',
  props: {
    modals: Object, 
    resurser: Object
  },
  data () {
    return {
      armyitems: {
        "Trupp": {
          name: 'Trupp',
          price: {
            "people": [1],
          },
          vel: '1 fält/drag',
          veg: 'alla fält',
          range: 'Samma fält',
          rpd: 1
        },
        "Mek_infanteri": {
          name: 'Mek. infanteri',
          price: {
            "säd": [1],
            "sten": [1],
            "olja": [1],
            "people": [1]
          },
          vel: '2 fält/drag',
          veg: 'öppna fält',
          range: 'Samma fält',
          capacity: '5 trupper',
          rpd: 1
        },
        "Lätt_tank": {
          name: 'Lätt tank',
          price: {
            "säd": [1],
            "sten": [1],
            "olja": [1],
            "people": [1]
          },
          vel: '2 fält/drag',
          veg: 'öppna fält',
          range: 'Samma fält',
          rpd: 1
        },
        "Tung_tank": {
          name: 'Tung tank',
          price: {
            "säd": [1],
            "sten": [1,2],
            "olja": [1,2],
            "people": [1,2]
          },
          vel: '1 fält/drag',
          veg: 'öppna fält',
          range: '1 fält',
          rpd: 2
        },
        "Artilleri": {
          name: 'Artilleri',
          price: {
            "säd": [1],
            "sten": [1,2],
            "people": [1]
          },
          vel: '1 fält/drag',
          veg: 'öppna fält',
          range: '3 fält',
          rpd: 3
        },
        "Jaktplan": {
          name: 'Jaktplan',
          price: {
            "säd": [1],
            "trä": [1],
            "olja": [1],
            "people": [1]
          },
          vel: '12cm',
          veg: 'luft',
          range: '3 fält',
          rpd: 2
        },
        "Bombplan": {
          name: 'Bombplan',
          price: {
            "säd": [1],
            "trä": [1,2,3],
            "olja": [1],
            "people": [1,2]
          },
          vel: '8cm',
          veg: 'luft',
          range: 'Samma fält',
          capacity: '5 bomber',
          rpd: 3
        },
        "Herkules": {
          name: 'Herkules',
          price: {},
          vel: '8cm',
          veg: 'luft',
          range: 'Samma fält',
          capacity: '5 trupper',
          rpd: 0
        },
        "Slagskepp": {
          name: 'Slagskepp',
          price: {
            "säd": [1],
            "trä": [1],
            "sten": [1,2],
            "olja": [1,2],
            "people": [1,2,3,4,5,6]
          },
          vel: '6cm',
          veg: 'vatten',
          range: '5cm',
          rpd: 3
        },
        "Ubåt": {
          name: 'Ubåt',
          price: {
            "säd": [1],
            "trä": [1],
            "sten": [1],
            "olja": [1],
            "people": [1,2,3,4]
          },
          vel: '6cm',
          veg: 'vatten',
          range: '5cm',
          rpd: 3
        },
        "Transportfartyg": {
          name: 'Transportfartyg',
          price: {
            "säd": [1],
            "trä": [1],
            "sten": [1],
            "olja": [1],
            "people": [1,2]
          },
          vel: '4cm',
          veg: 'vatten',
          capacity: '10 trupper/3 tanks',
          rpd: 0
        },
        "Hangarfartyg": {
          name: 'Hangarfartyg',
          price: {
            "säd": [1],
            "sten": [1,2,3],
            "olja": [1,2,3],
            "people": [1,2,3,4,5,6]
          },
          vel: '4cm',
          veg: 'vatten',
          capacity: '5 flygplan',
          rpd: 2
        },
        "Missilramp": {
          name: 'Missilramp',
          price: {
            "säd": [1],
            "trä": [1],
            "sten": [1,2,3],
            "olja": [1]
          },
          vel: '0cm',
          veg: 'alla fält',
          range: '15cm',
          rpd: 1
        }
      },
      buildingitems: {
        "By": {
          price: {
            "säd": [1,2],
            "trä": [1,2]
          },
          utdelning: 1,
          bonus: {"type": 'people', "antal": 1},
          info: 'Ger utdelning för angränsande fält.'
        },
        "Stad": {
          price: {
            "säd": [1],
            "trä": [1,2],
            "sten": [1],
            "olja": [1]
          },
          utdelning: 2,
          bonus: {"type": 'people', "antal": 2},
          info: 'Ger utdelning för angränsande fält.'
        },
        "Storstad": {
          price: {
            "säd": [1],
            "sten": [1,2,3],
            "olja": [1,2]
          },
          utdelning: 2,
          bonus: {"type": 'people', "antal": 3},
          info: 'Ger utdelning för angränsande fält.'
        },
        "Fabrik": {
          price: {
            "säd": [1,2],
            "sten": [1],
            "olja": [1,2],
            "people": [1,2,3,4]
          },
          utdelning: 2,
          bonus: {"type": 'valfri', "antal": 1},
          info: 'Ger utdelning för angränsande fält.'
        },
        "Flygplats": {
          price: {
            "säd": [1],
            "sten": [1,2],
            "olja": [1,2],
            "people": [1,2,3,4,5,6]
          },
          info: 'Möjliggör flygplans-produktion.'
        },
        "Hamn": {
          price: {
            "säd": [1],
            "trä": [1],
            "sten": [1,2],
            "olja": [1],
            "people": [1,2,3,4]
          },
          info: 'Möjliggör fartygs-produktion, samt byteshandel med andra spelare som har hamn.'
        },
        // "Oljerigg": {
        //   "trä": [],
        //   "säd": [],
        //   "olja": [],
        //   "sten": [],
        //   "djur": []
        // },
        "Universitet": {
          price: {
            "säd": [1,2,3],
            "trä": [1],
            "sten": [1],
            "people": [1,2,3,4]
          },
          info: 'Lyckad forskning ger utvecklingskort.'
        },
        "Väg": {
          price: {
            "sten": [1],
            "olja": [1]
          },
          info: 'Möjliggör byggnadsplats.'
        },
        "Bro": {
          price: {
            "säd": [1],
            "trä": [1,2],
            "sten": [1],
            "olja": [1]
          },
          info: 'Möjliggör rörlighet över sund.'
        }
      }
    }
  },
  computed:{
  	available: function(){
      var obj = {};
      let itemkeys =Object.keys(this.buildingitems).concat(Object.keys(this.armyitems));
      itemkeys.map((item)=>{
        let itemgroup = this.armyitems[item] ? 'armyitems' : 'buildingitems';
        let pricekeys = Object.keys(this[itemgroup][item].price) ;
        let unavailable = pricekeys[0] ? pricekeys.find((res)=>{ 
          return !this.resurser.has(res, this[itemgroup][item].price[res].length)
        }) : true ;
        obj[item] = !unavailable;
      })
      return obj;
    }
  },
  methods: {
    buy: function(item){
      this.modals.mainModalQ.push({
          isOpen: true,
          type: 'confirm',
          svgClass: 'center',
          svg: '<svg height="53" width="53" viewBox="-20 -20 40 40" filter="url(#shadow)"><polygon fill="#FAFAFA" stroke="darkgray" points="-20,0 -10,17.320508075688764 10,17.320508075688764 20,0 10,-17.320508075688764 -10,-17.320508075688764" ></polygon><use xlink:href="#'+item+'" fill="black"></use></use></svg>',
          content: [{
            title: 'Vill du köpa en/ett '+item+'?',
            msg: '<strong>OBS!</strong> Bekräftan går ej att ångra.',
            button1: {text: 'Ja', action:'buy', response: true, then: 'close'},
            button2: {text: 'Avbryt', action:'buy', response: false, then: 'close'}
          }],
          // evt: e,
          // building: building
      })
    }
  },
  mounted: function() {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#buypanel {
  background: radial-gradient(at 40% 0%, #f3dfc1, #dfc9a9) 0% 0% repeat scroll transparent;
}
.slideout-menu {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  /*z-index: -1;*/
  width: 320px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: none;
  background: gray;
}

.slideout-panel {
  position:fixed;
  width:100%;
  /*position:relative;*/
  /*z-index: 1;*/
}

.slideout-open,
.slideout-open body {
  overflow: hidden;
}

.slideout-open .slideout-menu {
  display: block;
}

#items_container{
  text-align: left
}

button{
  border: 0px;
  outline: none;
}
button:disabled{
  border: 0;
  box-shadow: 2px 1px 0 0 rgba(169, 150, 120, 0.99333) inset;
  opacity: 0.8;
  background: radial-gradient(at top 55% left 55%, #E8D5B5, #E8D5B5, #C1AA81)
}
button:disabled *{
  opacity: 0.5;
}

.item{
  display: flex;
  vertical-align: middle;
}
.item > div{
  display: inline-block;
  width: 170px;
}
.item > .resurs{
  display: inline-block;
}
.item span{
  margin:-10px 0;
}
.pris{
  width: 10px; 
  height: 10px; 
  display: inline-block;
  margin: 0 1px;
}
.pris.not_enough {
  position: relative;
}
.pris.not_enough:after {
  content: '+';
  transform: rotate(45deg);
  position: absolute;
  top: -12px;
  left: -3px;
  opacity: 0.5;
  /*font-weight: bold;*/
  font-size: 24px;
  color: red; 
}
.capitalize{
  text-transform: uppercase;
}
.small{
  font-size: 10px;
  font-weight: bold;
}
.xsmall{
  font-weight: normal;
}
.dyrt{
  transform: scale(0.5);
}
.dyrt svg{
  display: none;
}

.btn{
  position: relative;
  display: inline-block;
  /*background: linear-gradient(135deg, rgb(255, 227, 137) 10%, rgb(232, 177, 0) 100%);*/
  box-shadow: rgba(0, 0, 0, 0.1) 1px 1px 6px;
  height:65px; 
  width:65px; 
  margin: 10px 5px 5px 5px; 
  border-radius: 7px; 
  z-index:1; 
  text-align: center; 
  padding: 6px;
}
.army_btn {
  background: linear-gradient(135deg, rgb(255, 227, 137) 10%, rgb(232, 177, 0) 100%);
}
.building_btn {
  background: linear-gradient(135deg, lightgray 10%, darkgray 100%);
}
.btn .resurs {
  position: absolute;
}
.buy_btn {
  display: inline-block;
  height: 20px;
  width: 50px;
  box-shadow: rgba(0, 0, 0, 0.3) 1px 1px 1px;
  padding: 10px;
  margin: 20px 0 20px 0px;
  color: white;
  text-align: center;
}
.red {
  background: #DE7979; 
  border-radius: 0 10px 10px 0;
}
.green { 
  background: #75B96B;
  border-radius: 5px 0 0 5px;
  margin-left: -3px;
}
.item_menu {margin-left: -150px; transition: 0.3s cubic-bezier(0, 0, 0, 1) ;}
.korg * {
    opacity: 1 !important;
}
.icon {
  display: block;
  height: 40px;
  width: 40px;
  float: left;
  margin: 0 15px;
}
.spacer{
  margin: 0 10px;
}
.item_img {
  max-width:100%; max-height:100%;
}
</style>
