<template>
  <div id='maps'>
    <!-- <h1> Map of Nations </h1> -->
    <svg width="600" height="498" v-bind:viewBox="viewBox.join(' ')" v-on:touchstart="mapMoveStart" v-on:touchmove.prevent.stop="mapMove" v-on:touchend="mapMoveEnd">
      <defs>
        <filter id="shadow" x="0" y="0" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/> 
          <feOffset dx="1" dy="6"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2"/>
          </feComponentTransfer>
          <feMerge> 
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
        <g id="svg-map">
          <g class="boardpiece" v-for="boardpiece in boardgame.bps" v-bind:id="boardpiece.id">
            <g v-bind:id="'fields_'+boardpiece.id">
              <g v-for="field in boardpiece.fields" class="field" v-bind:fill="field.color" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?selectField(field):'';">
                <g v-html="field.svg"></g>
                <g class="number" style="text-anchor: middle; font-family: 'Helvetica'; font-size: 13px; fill: #606060;">
                  <use class="occupy_flag" xlink:href="#svg-occupy" v-if="field.occupiedBy!='none'" v-bind:transform="'translate('+(field.pos.x-8)+','+(field.pos.y-26)+') scale(0.3)'" v-bind:fill="field.occupiedColor"></use>
                  <circle v-bind:cx="field.pos.x" v-bind:cy="field.pos.y" r="8.1"></circle>
                  <text v-bind:transform="'matrix(1 0 0 1 '+field.pos.x+' '+(field.pos.y+4.5)+')'" fill="#FFF">{{field.number.nr}}</text>
                </g>
              </g>
            </g>
            <g v-bind:id="'roads_'+boardpiece.id">
              <g class="road" v-for="roadSVG in boardpiece.roadsSVG" v-html="roadSVG" style="fill: #606060; stroke: #606060; stroke-width: 4;"></g>
            </g>
            <g v-bind:id="'buildsites_'+boardpiece.id">
              <g class="buildsite" v-for="buildsite in boardpiece.buildings" v-bind:transform="'translate('+buildsite.pos.x+', '+buildsite.pos.y+')'" style="fill: black; fill-opacity: 0.1; "><polygon points="-20,0 -10,17.320508075688764 10,17.320508075688764 20,0 10,-17.320508075688764 -10,-17.320508075688764" >
          </polygon></g>
            </g>
          </g>
        </g>
      </defs>

      <g id="svg-board">
        <use xlink:href="#svg-map"></use>

        <g v-bind:style="{transform: 'translate('+ viewBox[0] +'px,'+ viewBox[1] +'px)'}">
          <rect width="100%" style="fill:#ad9d85; filter: url('#shadow')" v-bind:style="{height: new_buildings.length==0 ? '0' : '60'}" />
          
          <g class="new_building" 
          v-for="building in new_buildings" 
          v-bind:style="{transform: building.pos.x && building.pos.y ? 'translate('+ (building.pos.x) +'px,'+ (building.pos.y) +'px)' : 'translate('+ (new_buildings.indexOf(building)*41+30) +'px,'+ 30 +'px)', filter: 'url(#shadow)'}"
          v-on:touchstart="buildingMoveStart($event, building)" 
          v-on:touchmove.stop.prevent="buildingMove($event, building)" 
          v-on:touchend="buildingMoveEnd($event, building)"
          v-on:transitionend="transitionEnd($event)">
            <title>empty djur empty empty</title>
            <polygon points="-20,0 -10,17.320508075688764 10,17.320508075688764 20,0 10,-17.320508075688764 -10,-17.320508075688764"></polygon>
            <use v-bind:xlink:href="'#'+building.type" fill="black"></use>
          </g> 
        </g> 
 
        <g class="set_building" 
        v-for="building in set_buildings" 
        v-on:touchstart="c=true" 
        v-on:touchmove="c=false" 
        v-on:touchend="c?selectBuilding(building):'';" 
        v-bind:style="{transform: 'translate('+ (building.pos.x) +'px,'+ (building.pos.y) +'px)'}">
          <title>{{building.type}}</title>
          <polygon points="-20,0 -10,17.320508075688764 10,17.320508075688764 20,0 10,-17.320508075688764 -10,-17.320508075688764" >
          </polygon>
          <use v-bind:xlink:href="'#'+building.type" fill="black"></use>
        </g> 

        <g class="yield" v-for="resurs in yield">
              <circle v-bind:cx="resurs.x" v-bind:cy="resurs.y" r="10" v-bind:style="{fill: types[resurs.type].color, filter: 'url(#shadow)', stroke: '#606060', strokeWidth: '1'}"></circle>
              <use v-bind:xlink:href="'#svg-'+ resurs.type" v-bind:style="{transform: 'translate('+(resurs.x-10)+'px,'+(resurs.y-10)+'px) scale(0.2)'}"></use>
        </g>

        
      </g>
    </svg>
    <div id="collect_btn" v-bind:style="{height: collectBtnHeigth}" 
          v-on:touchstart="c=true" 
          v-on:touchmove="c=false" 
          v-on:touchend="c?collectYield():''"
          v-on:transitionend="">  
      <div>Hämta alla resurser</div>
    </div>
    <modalmenu v-bind:modal="modal" 
      v-on:buildAtSite="buildAtSite" 
      v-on:surrenderTo="surrenderTo" 
      v-on:occupyField="occupyField"
      v-on:nextModuleInQueue="nextModuleInQueue"></modalmenu>
    
  </div>
</template>

<script>
import Modalmenu from '../components/Modalmenu'
import Resurs from '../components/Resurs'

export default {
  name: 'maps',
  props: {
    players: Array,
    user: Object,
    buildings: Array,
    resurser: Object,
    yield: Array,
    dices: Object,
    types: Object,
    modals: Object
  },
  components: { Modalmenu, Resurs },
  data () {
    return {
      yieldStat: {tot:0},
      lastModal: {isOpen: false, content:[]},
      currentViewBox: [120,-44,600,498],
      moveViewBox: [0,0],
      boardgame: {}, 
      c: false
    }
  },
  computed:{
    modal: function(){
      return this.modals.mapsModalQ[0] ? this.modals.mapsModalQ[0] : this.lastModal;
    },
    viewBox: function(){
      return [
        this.currentViewBox[0] + this.moveViewBox[0], 
        this.currentViewBox[1] + this.moveViewBox[1], 
        this.currentViewBox[2], 
        this.currentViewBox[3]
      ]
    },
    building_pos: function(){
      var buildingsites = []
      this.boardgame.bps.map((bp)=>{
        buildingsites = buildingsites.concat(bp.buildings);
      })
      return buildingsites;
    },
    new_buildings: function(){
      return this.buildings.filter((b)=>{return b.isBuild == false })
    },
    set_buildings: function(){
      return this.$props.buildings.filter((b)=>{return b.isBuild == true })
    },
    occupyFlags: function(){
      return this.fields.filter((b)=>{return b.isBuild == true })
    },
    collectBtnHeigth: function(){
      return this.resurser.yield.length ? '100px':'';
    },

    // 1. Nya byggnader ska kunna sättas på byggnads-site. DONE
    // 2. Klicka på byggnad för att få upp meny.
    //      - Surrender building to enemy.
    //      - ...
    // 3. Klicka på fält för att få upp meny.
    //      - Fält okuperad av fiende
    //      - Fält okuperad av spelare
    //      - ...
    // 
  	
  },
  methods: {
    setModal: function(modal){
      this.modals.mapsModalQ.push(modal);
      // this.modal = modal
    },
    nextModuleInQueue: function(){
      this.lastModal = this.modals.mapsModalQ.shift()
    },
    mapMoveStart: function(e){
      this.start = [e.touches[0].clientX, e.touches[0].clientY]
    },
    mapMove: function(e){
      if(this.moving){return}
      this.moveViewBox = [this.start[0] - e.touches[0].clientX, this.start[1] - e.touches[0].clientY]
    },
    mapMoveEnd: function(e){
      this.currentViewBox[0] += this.moveViewBox[0];
      this.currentViewBox[1] += this.moveViewBox[1];
      this.moveViewBox = [0,0]
    },
    buildingMoveStart: function(e, building){
      this.currentBuildingStartPos = building.pos;
      this.closestSite = undefined;
      this.moved = false;
      // this.flag = true;
      e.currentTarget.closest('g').setAttribute('filter', 'url(#shadow)')
    },
    buildingMove: function(e, building){
      /* Throttler for transitions */
      // if(!this.flag){ return }
      // var self = this;
      // this.flag = true;
      // setTimeout(function(){ self.flag = true; }, 50);
      this.moved = true;
      
      var pos = {
        x: e.touches[0].clientX + this.viewBox[0],
        y: e.touches[0].clientY + this.viewBox[1]
      }
      var posToView = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
      
      this.closestSite = this.building_pos.find((a)=>{return Math.pow(a.pos.x-pos.x,2)<625 && Math.pow(a.pos.y-pos.y, 2)<625});
      
      if(this.closestSite){
        building.pos = {x: this.closestSite.pos.x-this.viewBox[0], y:this.closestSite.pos.y-this.viewBox[1]}; 
      }else{
        building.pos = posToView;
      }
    },
    buildingMoveEnd: function(e, building){
      var width = screen.availWidth-20;
      var height = 140;
      var zoom = 1.3;
      if(this.closestSite){
        this.setModal({
          isOpen: true,
          type: 'confirm',
          svgClass: 'selection',
          svg: '<svg width="100%" height="140px" viewBox="'+(this.closestSite.pos.x-width*zoom/2)+' '+(this.closestSite.pos.y-height*zoom/2)+' '+width*zoom+' '+height*zoom+'"><use xlink:href="#svg-board"></use></svg>',
          content: [{
            title: 'Vill du bygga här?',
            msg: '<strong>OBS!</strong> Bekräftan går ej att ångra.',
            button1: {text: 'Ja', action:'buildAtSite', response: true, then: 'close'},
            button2: {text: 'Avbryt', action:'buildAtSite', response: false, then: 'close'}
          }],
          evt: e,
          building: building
        })
      }else{
        building.pos = this.currentBuildingStartPos;
        if(this.moved){
            e.target.closest('g').style.transition = '0.5s transform'
        }
        e.currentTarget.closest('g').setAttribute('filter', '');
      }
    },
    transitionEnd(e){
      e.target.closest('g').style.transition = ''
      e.currentTarget.closest('g').setAttribute('filter', '');
    },


    /*** Byggnad ***/

    buildAtSite: function(confirmed, modal){
      if(confirmed){
        modal.evt.target.closest('g').setAttribute('filter', '');
        
        //Build at site
        modal.building.id = this.closestSite.id
        modal.building.pos = this.closestSite.pos
        modal.building.fields = this.closestSite.fields
        modal.building.isBuild = true

        console.log('Building established')
      }else{
        modal.evt.target.closest('g').style.transition = '0.5s transform'
        modal.building.pos = this.currentBuildingStartPos;
      }
      // this.nextModuleInQueue()
    },
    selectBuilding: function(building){
      var width = screen.availWidth-20;
      var height = 140;
      var zoom = 0.7;
      this.setModal({
        isOpen: true,
        type: 'building_menu',
        dismissable: true,
        svgClass: 'selection',
        svg: '<svg width="100%" height="140px" viewBox="'+(building.pos.x-width*zoom/2)+' '+(building.pos.y-height*zoom/2)+' '+width*zoom+' '+height*zoom+'"><use xlink:href="#svg-board"></use></svg>',
        content: [{
            title: 'Byggnad: '+building.type,
            html: 'Info: '+building.fields.map((f)=>{ 
                  var field = this.getField(f); 
                  return field ? f.type+' '+field.number.nr : f.type;
            }).join(', ') +'<br><span style="font-size:11px;font-weight:bold;">Utdelning: % / tot'+ Object.keys(building.yieldStat).map((res)=>{return '<div style="background:'+this.types[res].color+';height:13px;width:'+(building.yieldStat[res]/this.yieldStat.tot*100)+'%;margin:2px 0;white-space: nowrap;"> '+building.yieldStat[res]+'st / '+Math.floor(building.yieldStat[res]/this.yieldStat[res]*100)+'%</div>'}).join('')+'</span>',
            menu: [
                  {text: 'Överge...', then: 'slide'},
                  {text: 'Radera...', action: 'delete', response: building}
            ]
          },{ 
            menu: this.$props.players.map((p)=>{return {
              text: '...till '+p.username, action:'surrenderTo', response: {building: building, to: p.username}, then: 'close'
            }})
          }]
      })
    },
    // surrenderBuilding: function(building){

    // },
    surrenderTo: function(res){
      this.$socket.emit('surrenderTo', res)
      // this.nextModuleInQueue()
    },



    /*** Fält ***/
    selectField: function(field){
      var width = screen.availWidth-20;
      var height = 140;
      var zoom = 0.7;
      this.setModal({
        isOpen: true,
        dismissable: true,
        svgClass: 'selection',
        svg: '<svg width="100%" height="140px" viewBox="'+(field.pos.x-width*zoom/2)+' '+(field.pos.y-height*zoom/2)+' '+width*zoom+' '+height*zoom+'"><use xlink:href="#svg-board"></use></svg>',
        content: [{
            // title: ,
            menu: [{
              text: 'Ockupera', action:'occupyField', response: field, then: 'close'
            }]
          }],
          field: field
      })
    },
    occupyField: function(field){
      field.occupiedBy = field.occupiedBy == this.user.username ? 'none' : this.user.username ;
      // field.occupiedColor = this.user.color;
      field.occupiedColor = '#f0f0f0';
      // this.nextModuleInQueue()
    },


    collectYield: function(){
      console.log('Collect yield')
      // this.resurser.push(this.resurser.yield.pop())
    },

    getBp: function(f){
      return this.boardgame.bps.find((bp)=>{return bp.id==f.bp_id})
    },
    getField: function(f){
      var bp = this.getBp(f);
      return bp ? bp.fields.find((field)=>{return field.id==f.refid}) : undefined ;
    },

  },

  sockets:{
      utdelning: function(){

      }
  },

  mounted: function() {
      var width = screen.availWidth-20;
      var height = 140;
      var zoom = 0.7;
      var self = this;

      

      setInterval(function(){
            console.log('Utdelning')
            self.dices.roll()            
            var buildings_yeild = self.$props.buildings.filter((building)=>{
                  if(building.yieldStat){
                        building.yield = []
                        return building.fields.filter((f)=>{
                              var bp = self.getBp(f)
                              var field = self.getField(f)
                              if(field && Object.keys(self.types).indexOf(field.type) != -1 && field.number.nr == self.dices.nr() && (field.occupiedBy=='none' || field.occupiedBy==self.$props.user.username) ){
                                    self.yield.push({
                                          type: field.type, 
                                          x: (building.pos.x+field.pos.x)/2+Math.random()*15-7, 
                                          y: (building.pos.y+field.pos.y)/2+Math.random()*15-7
                                    })
                                    building.yieldStat[field.type] ? building.yieldStat[field.type] += 1 : building.yieldStat[field.type] = 1;
                                    self.yieldStat[field.type] ? self.yieldStat[field.type] +=1 : self.yieldStat[field.type] = 1;
                                    self.yieldStat.tot += 1;
                                    return true
                              }
                        })[0];
                  }
            });

            if(buildings_yeild[0]){
                  self.modals.mainModalQ.push({
                    type: 'alert',
                    isOpen: true,
                    svgClass: 'left',       
                    svg: '<div style="text-align: center; margin: -25px 0 -30px">'+self.dices.render()+'</div>',
                    content: buildings_yeild.map((building,i,a)=>{
                        return {
                              title: 'Utdelning',
                              htmlClass: 'selection',
                              html: '<svg width="100%" height="140px" viewBox="'+(building.pos.x-width*zoom/2)+' '+(building.pos.y-height*zoom/2)+' '+width*zoom+' '+height*zoom+'"><use xlink:href="#svg-board"></use></svg>',
                              menu: [{
                                text: 'Nästa', then: 'slide'
                              }]
                        }
                    }).concat({
                        title: 'Bonus',
                        menu: [{
                          text: 'Okej', then: 'close'
                        }]
                    })
                  })
            }
      }, 10000);

    this.boardgame = {
  "id": "5027_23ef_24e8",
  "bps": [
    {
      "id": "98c1-e360-dd6c",
      "fields": [
        {
          "id": "e9dd-24d8",
          "type": "tr\u00e4",
          "array": [
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "23-4",
              "_pos": {
                "_x": 22,
                "_y": 4,
                "x_ny": 23,
                "y_ny": 4
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "22-5",
              "_pos": {
                "_x": 21,
                "_y": 4,
                "x_ny": 22,
                "y_ny": 5
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "21-4",
              "_pos": {
                "_x": 20,
                "_y": 4,
                "x_ny": 21,
                "y_ny": 4
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "21-6",
              "_pos": {
                "_x": 20,
                "_y": 5,
                "x_ny": 21,
                "y_ny": 6
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "20-5",
              "_pos": {
                "_x": 19,
                "_y": 5,
                "x_ny": 20,
                "y_ny": 5
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "20-7",
              "_pos": {
                "_x": 19,
                "_y": 6,
                "x_ny": 20,
                "y_ny": 7
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "19-6",
              "_pos": {
                "_x": 18,
                "_y": 6,
                "x_ny": 19,
                "y_ny": 6
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "21-6",
              "_pos": {
                "_x": 20,
                "_y": 6,
                "x_ny": 21,
                "y_ny": 6
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "22-7",
              "_pos": {
                "_x": 21,
                "_y": 6,
                "x_ny": 22,
                "y_ny": 7
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "22-5",
              "_pos": {
                "_x": 21,
                "_y": 5,
                "x_ny": 22,
                "y_ny": 5
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "23-6",
              "_pos": {
                "_x": 22,
                "_y": 5,
                "x_ny": 23,
                "y_ny": 5.5
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "24-5",
              "_pos": {
                "_x": 23,
                "_y": 4,
                "x_ny": 24,
                "y_ny": 5
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "25-4",
              "_pos": {
                "_x": 24,
                "_y": 4,
                "x_ny": 25,
                "y_ny": 4
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "25-6",
              "_pos": {
                "_x": 24,
                "_y": 5,
                "x_ny": 25,
                "y_ny": 6
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "24-5",
              "_pos": {
                "_x": 23,
                "_y": 5,
                "x_ny": 24,
                "y_ny": 5
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "24-7",
              "_pos": {
                "_x": 23,
                "_y": 6,
                "x_ny": 24,
                "y_ny": 7
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "23-6",
              "_pos": {
                "_x": 22,
                "_y": 6,
                "x_ny": 23,
                "y_ny": 6
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "index": "23-8",
              "_pos": {
                "_x": 22,
                "_y": 7,
                "x_ny": 23,
                "y_ny": 8
              },
              "flip": false,
              "type": "tr\u00e4"
            }
          ],
          "color": "#1abc9c",
          "number": {
            "_pos": {
              "_x": 22,
              "_y": 5,
              "x_ny": 23,
              "y_ny": 5.5
            },
            "nr": 6
          },
          "svg": "<polygon points=\"230,116.60254037844388 250,116.60254037844388 240,99.2820323027551\"\/>,<polygon points=\"220,99.2820323027551 240,99.2820323027551 230,116.60254037844388\"\/>,<polygon points=\"210,116.60254037844388 230,116.60254037844388 220,99.2820323027551\"\/>,<polygon points=\"210,116.60254037844388 230,116.60254037844388 220,133.92304845413264\"\/>,<polygon points=\"200,133.92304845413264 220,133.92304845413264 210,116.60254037844388\"\/>,<polygon points=\"200,133.92304845413264 220,133.92304845413264 210,151.24355652982143\"\/>,<polygon points=\"190,151.24355652982143 210,151.24355652982143 200,133.92304845413264\"\/>,<polygon points=\"210,151.24355652982143 230,151.24355652982143 220,133.92304845413264\"\/>,<polygon points=\"220,133.92304845413264 240,133.92304845413264 230,151.24355652982143\"\/>,<polygon points=\"220,133.92304845413264 240,133.92304845413264 230,116.60254037844388\"\/>,<polygon points=\"230,116.60254037844388 250,116.60254037844388 240,133.92304845413264\"\/>,<polygon points=\"240,99.2820323027551 260,99.2820323027551 250,116.60254037844388\"\/>,<polygon points=\"250,116.60254037844388 270,116.60254037844388 260,99.2820323027551\"\/>,<polygon points=\"250,116.60254037844388 270,116.60254037844388 260,133.92304845413264\"\/>,<polygon points=\"240,133.92304845413264 260,133.92304845413264 250,116.60254037844388\"\/>,<polygon points=\"240,133.92304845413264 260,133.92304845413264 250,151.24355652982143\"\/>,<polygon points=\"230,151.24355652982143 250,151.24355652982143 240,133.92304845413264\"\/>,<polygon points=\"230,151.24355652982143 250,151.24355652982143 240,168.5640646055102\"\/>",
          "pos": {
            "x": 240,
            "y": 125.26279441629
          },
          "occupiedBy": "none"
        },
        {
          "id": "b3eb-f140",
          "type": "s\u00e4d",
          "array": [
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "26-5",
              "_pos": {
                "_x": 25,
                "_y": 4,
                "x_ny": 26,
                "y_ny": 5
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "27-4",
              "_pos": {
                "_x": 26,
                "_y": 4,
                "x_ny": 27,
                "y_ny": 4
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "27-6",
              "_pos": {
                "_x": 26,
                "_y": 5,
                "x_ny": 27,
                "y_ny": 6
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "28-5",
              "_pos": {
                "_x": 27,
                "_y": 5,
                "x_ny": 28,
                "y_ny": 5.5
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "28-7",
              "_pos": {
                "_x": 27,
                "_y": 6,
                "x_ny": 28,
                "y_ny": 7
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "29-6",
              "_pos": {
                "_x": 28,
                "_y": 6,
                "x_ny": 29,
                "y_ny": 6
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "30-7",
              "_pos": {
                "_x": 29,
                "_y": 6,
                "x_ny": 30,
                "y_ny": 7
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "31-6",
              "_pos": {
                "_x": 30,
                "_y": 6,
                "x_ny": 31,
                "y_ny": 6
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "32-7",
              "_pos": {
                "_x": 31,
                "_y": 6,
                "x_ny": 32,
                "y_ny": 7
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "33-6",
              "_pos": {
                "_x": 32,
                "_y": 6,
                "x_ny": 33,
                "y_ny": 6
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "32-5",
              "_pos": {
                "_x": 31,
                "_y": 5,
                "x_ny": 32,
                "y_ny": 5
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "31-6",
              "_pos": {
                "_x": 30,
                "_y": 5,
                "x_ny": 31,
                "y_ny": 6
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "31-4",
              "_pos": {
                "_x": 30,
                "_y": 4,
                "x_ny": 31,
                "y_ny": 4
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "30-5",
              "_pos": {
                "_x": 29,
                "_y": 4,
                "x_ny": 30,
                "y_ny": 5
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "29-4",
              "_pos": {
                "_x": 28,
                "_y": 4,
                "x_ny": 29,
                "y_ny": 4
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "28-5",
              "_pos": {
                "_x": 27,
                "_y": 4,
                "x_ny": 28,
                "y_ny": 5
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "29-6",
              "_pos": {
                "_x": 28,
                "_y": 5,
                "x_ny": 29,
                "y_ny": 6
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "index": "30-5",
              "_pos": {
                "_x": 29,
                "_y": 5,
                "x_ny": 30,
                "y_ny": 5
              },
              "flip": true,
              "type": "s\u00e4d"
            }
          ],
          "color": "#f1c40f",
          "number": {
            "_pos": {
              "_x": 27,
              "_y": 5,
              "x_ny": 28,
              "y_ny": 5.5
            },
            "nr": 11
          },
          "svg": "<polygon points=\"260,99.2820323027551 280,99.2820323027551 270,116.60254037844388\"\/>,<polygon points=\"270,116.60254037844388 290,116.60254037844388 280,99.2820323027551\"\/>,<polygon points=\"270,116.60254037844388 290,116.60254037844388 280,133.92304845413264\"\/>,<polygon points=\"280,133.92304845413264 300,133.92304845413264 290,116.60254037844388\"\/>,<polygon points=\"280,133.92304845413264 300,133.92304845413264 290,151.24355652982143\"\/>,<polygon points=\"290,151.24355652982143 310,151.24355652982143 300,133.92304845413264\"\/>,<polygon points=\"300,133.92304845413264 320,133.92304845413264 310,151.24355652982143\"\/>,<polygon points=\"310,151.24355652982143 330,151.24355652982143 320,133.92304845413264\"\/>,<polygon points=\"320,133.92304845413264 340,133.92304845413264 330,151.24355652982143\"\/>,<polygon points=\"330,151.24355652982143 350,151.24355652982143 340,133.92304845413264\"\/>,<polygon points=\"320,133.92304845413264 340,133.92304845413264 330,116.60254037844388\"\/>,<polygon points=\"310,116.60254037844388 330,116.60254037844388 320,133.92304845413264\"\/>,<polygon points=\"310,116.60254037844388 330,116.60254037844388 320,99.2820323027551\"\/>,<polygon points=\"300,99.2820323027551 320,99.2820323027551 310,116.60254037844388\"\/>,<polygon points=\"290,116.60254037844388 310,116.60254037844388 300,99.2820323027551\"\/>,<polygon points=\"280,99.2820323027551 300,99.2820323027551 290,116.60254037844388\"\/>,<polygon points=\"290,116.60254037844388 310,116.60254037844388 300,133.92304845413264\"\/>,<polygon points=\"300,133.92304845413264 320,133.92304845413264 310,116.60254037844388\"\/>",
          "pos": {
            "x": 290,
            "y": 125.26279441629
          },
          "occupiedBy": "none"
        },
        {
          "id": "5ab9-e799",
          "type": "djur",
          "array": [
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "26-5",
              "_pos": {
                "_x": 25,
                "_y": 5,
                "x_ny": 26,
                "y_ny": 5
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "26-7",
              "_pos": {
                "_x": 25,
                "_y": 6,
                "x_ny": 26,
                "y_ny": 7
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "25-6",
              "_pos": {
                "_x": 24,
                "_y": 6,
                "x_ny": 25,
                "y_ny": 6
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "25-8",
              "_pos": {
                "_x": 24,
                "_y": 7,
                "x_ny": 25,
                "y_ny": 8
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "26-7",
              "_pos": {
                "_x": 25,
                "_y": 7,
                "x_ny": 26,
                "y_ny": 7
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "27-8",
              "_pos": {
                "_x": 26,
                "_y": 7,
                "x_ny": 27,
                "y_ny": 8
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "27-6",
              "_pos": {
                "_x": 26,
                "_y": 6,
                "x_ny": 27,
                "y_ny": 6
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "28-7",
              "_pos": {
                "_x": 27,
                "_y": 7,
                "x_ny": 28,
                "y_ny": 7
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "28-9",
              "_pos": {
                "_x": 27,
                "_y": 8,
                "x_ny": 28,
                "y_ny": 9
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "27-8",
              "_pos": {
                "_x": 26,
                "_y": 8,
                "x_ny": 27,
                "y_ny": 8.5
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "29-8",
              "_pos": {
                "_x": 28,
                "_y": 8,
                "x_ny": 29,
                "y_ny": 8
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "27-10",
              "_pos": {
                "_x": 26,
                "_y": 9,
                "x_ny": 27,
                "y_ny": 10
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "26-9",
              "_pos": {
                "_x": 25,
                "_y": 8,
                "x_ny": 26,
                "y_ny": 9
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "24-7",
              "_pos": {
                "_x": 23,
                "_y": 7,
                "x_ny": 24,
                "y_ny": 7
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "24-9",
              "_pos": {
                "_x": 23,
                "_y": 8,
                "x_ny": 24,
                "y_ny": 9
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "23-8",
              "_pos": {
                "_x": 22,
                "_y": 8,
                "x_ny": 23,
                "y_ny": 8
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "23-10",
              "_pos": {
                "_x": 22,
                "_y": 9,
                "x_ny": 23,
                "y_ny": 10
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "24-9",
              "_pos": {
                "_x": 23,
                "_y": 9,
                "x_ny": 24,
                "y_ny": 9
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "25-10",
              "_pos": {
                "_x": 24,
                "_y": 9,
                "x_ny": 25,
                "y_ny": 10
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "26-9",
              "_pos": {
                "_x": 25,
                "_y": 9,
                "x_ny": 26,
                "y_ny": 9
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "26-11",
              "_pos": {
                "_x": 25,
                "_y": 10,
                "x_ny": 26,
                "y_ny": 11
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "25-10",
              "_pos": {
                "_x": 24,
                "_y": 10,
                "x_ny": 25,
                "y_ny": 10
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "25-8",
              "_pos": {
                "_x": 24,
                "_y": 8,
                "x_ny": 25,
                "y_ny": 8
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "25-12",
              "_pos": {
                "_x": 24,
                "_y": 11,
                "x_ny": 25,
                "y_ny": 12
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "24-11",
              "_pos": {
                "_x": 23,
                "_y": 11,
                "x_ny": 24,
                "y_ny": 11
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "23-12",
              "_pos": {
                "_x": 22,
                "_y": 11,
                "x_ny": 23,
                "y_ny": 12
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "22-11",
              "_pos": {
                "_x": 21,
                "_y": 11,
                "x_ny": 22,
                "y_ny": 11
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "22-13",
              "_pos": {
                "_x": 21,
                "_y": 12,
                "x_ny": 22,
                "y_ny": 13
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "26-11",
              "_pos": {
                "_x": 25,
                "_y": 11,
                "x_ny": 26,
                "y_ny": 11
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "27-12",
              "_pos": {
                "_x": 26,
                "_y": 11,
                "x_ny": 27,
                "y_ny": 12
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "27-10",
              "_pos": {
                "_x": 26,
                "_y": 10,
                "x_ny": 27,
                "y_ny": 10
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "28-9",
              "_pos": {
                "_x": 27,
                "_y": 9,
                "x_ny": 28,
                "y_ny": 9
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "28-11",
              "_pos": {
                "_x": 27,
                "_y": 10,
                "x_ny": 28,
                "y_ny": 11
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "29-10",
              "_pos": {
                "_x": 28,
                "_y": 10,
                "x_ny": 29,
                "y_ny": 10
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "30-11",
              "_pos": {
                "_x": 29,
                "_y": 10,
                "x_ny": 30,
                "y_ny": 11
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "31-10",
              "_pos": {
                "_x": 30,
                "_y": 10,
                "x_ny": 31,
                "y_ny": 10
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "31-12",
              "_pos": {
                "_x": 30,
                "_y": 11,
                "x_ny": 31,
                "y_ny": 12
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "32-11",
              "_pos": {
                "_x": 31,
                "_y": 11,
                "x_ny": 32,
                "y_ny": 11
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "26-13",
              "_pos": {
                "_x": 25,
                "_y": 12,
                "x_ny": 26,
                "y_ny": 13
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "29-10",
              "_pos": {
                "_x": 28,
                "_y": 9,
                "x_ny": 29,
                "y_ny": 10
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "30-9",
              "_pos": {
                "_x": 29,
                "_y": 9,
                "x_ny": 30,
                "y_ny": 9
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "30-9",
              "_pos": {
                "_x": 29,
                "_y": 8,
                "x_ny": 30,
                "y_ny": 9
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "30-7",
              "_pos": {
                "_x": 29,
                "_y": 7,
                "x_ny": 30,
                "y_ny": 7
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "29-8",
              "_pos": {
                "_x": 28,
                "_y": 7,
                "x_ny": 29,
                "y_ny": 8
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "31-8",
              "_pos": {
                "_x": 30,
                "_y": 7,
                "x_ny": 31,
                "y_ny": 8
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "32-7",
              "_pos": {
                "_x": 31,
                "_y": 7,
                "x_ny": 32,
                "y_ny": 7
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "32-9",
              "_pos": {
                "_x": 31,
                "_y": 8,
                "x_ny": 32,
                "y_ny": 9
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "33-8",
              "_pos": {
                "_x": 32,
                "_y": 7,
                "x_ny": 33,
                "y_ny": 8
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "34-7",
              "_pos": {
                "_x": 33,
                "_y": 7,
                "x_ny": 34,
                "y_ny": 7
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "34-9",
              "_pos": {
                "_x": 33,
                "_y": 8,
                "x_ny": 34,
                "y_ny": 9
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "35-8",
              "_pos": {
                "_x": 34,
                "_y": 8,
                "x_ny": 35,
                "y_ny": 8
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "35-10",
              "_pos": {
                "_x": 34,
                "_y": 9,
                "x_ny": 35,
                "y_ny": 10
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "34-9",
              "_pos": {
                "_x": 33,
                "_y": 9,
                "x_ny": 34,
                "y_ny": 9
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "34-11",
              "_pos": {
                "_x": 33,
                "_y": 10,
                "x_ny": 34,
                "y_ny": 11
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "33-10",
              "_pos": {
                "_x": 32,
                "_y": 10,
                "x_ny": 33,
                "y_ny": 10
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "33-12",
              "_pos": {
                "_x": 32,
                "_y": 11,
                "x_ny": 33,
                "y_ny": 12
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "32-11",
              "_pos": {
                "_x": 31,
                "_y": 10,
                "x_ny": 32,
                "y_ny": 11
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "32-9",
              "_pos": {
                "_x": 31,
                "_y": 9,
                "x_ny": 32,
                "y_ny": 9
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "33-10",
              "_pos": {
                "_x": 32,
                "_y": 9,
                "x_ny": 33,
                "y_ny": 10
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "33-8",
              "_pos": {
                "_x": 32,
                "_y": 8,
                "x_ny": 33,
                "y_ny": 8
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "31-8",
              "_pos": {
                "_x": 30,
                "_y": 8,
                "x_ny": 31,
                "y_ny": 8
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "index": "31-10",
              "_pos": {
                "_x": 30,
                "_y": 9,
                "x_ny": 31,
                "y_ny": 10
              },
              "flip": false,
              "type": "djur"
            }
          ],
          "color": "#75B96B",
          "number": {
            "_pos": {
              "_x": 26,
              "_y": 8,
              "x_ny": 27,
              "y_ny": 8.5
            },
            "nr": 5
          },
          "svg": "<polygon points=\"260,133.92304845413264 280,133.92304845413264 270,116.60254037844388\"\/>,<polygon points=\"260,133.92304845413264 280,133.92304845413264 270,151.24355652982143\"\/>,<polygon points=\"250,151.24355652982143 270,151.24355652982143 260,133.92304845413264\"\/>,<polygon points=\"250,151.24355652982143 270,151.24355652982143 260,168.5640646055102\"\/>,<polygon points=\"260,168.5640646055102 280,168.5640646055102 270,151.24355652982143\"\/>,<polygon points=\"270,151.24355652982143 290,151.24355652982143 280,168.5640646055102\"\/>,<polygon points=\"270,151.24355652982143 290,151.24355652982143 280,133.92304845413264\"\/>,<polygon points=\"280,168.5640646055102 300,168.5640646055102 290,151.24355652982143\"\/>,<polygon points=\"280,168.5640646055102 300,168.5640646055102 290,185.88457268119896\"\/>,<polygon points=\"270,185.88457268119896 290,185.88457268119896 280,168.5640646055102\"\/>,<polygon points=\"290,185.88457268119896 310,185.88457268119896 300,168.5640646055102\"\/>,<polygon points=\"270,185.88457268119896 290,185.88457268119896 280,203.20508075688775\"\/>,<polygon points=\"260,168.5640646055102 280,168.5640646055102 270,185.88457268119896\"\/>,<polygon points=\"240,168.5640646055102 260,168.5640646055102 250,151.24355652982143\"\/>,<polygon points=\"240,168.5640646055102 260,168.5640646055102 250,185.88457268119896\"\/>,<polygon points=\"230,185.88457268119896 250,185.88457268119896 240,168.5640646055102\"\/>,<polygon points=\"230,185.88457268119896 250,185.88457268119896 240,203.20508075688775\"\/>,<polygon points=\"240,203.20508075688775 260,203.20508075688775 250,185.88457268119896\"\/>,<polygon points=\"250,185.88457268119896 270,185.88457268119896 260,203.20508075688775\"\/>,<polygon points=\"260,203.20508075688775 280,203.20508075688775 270,185.88457268119896\"\/>,<polygon points=\"260,203.20508075688775 280,203.20508075688775 270,220.52558883257652\"\/>,<polygon points=\"250,220.52558883257652 270,220.52558883257652 260,203.20508075688775\"\/>,<polygon points=\"250,185.88457268119896 270,185.88457268119896 260,168.5640646055102\"\/>,<polygon points=\"250,220.52558883257652 270,220.52558883257652 260,237.84609690826528\"\/>,<polygon points=\"240,237.84609690826528 260,237.84609690826528 250,220.52558883257652\"\/>,<polygon points=\"230,220.52558883257652 250,220.52558883257652 240,237.84609690826528\"\/>,<polygon points=\"220,237.84609690826528 240,237.84609690826528 230,220.52558883257652\"\/>,<polygon points=\"220,237.84609690826528 240,237.84609690826528 230,255.16660498395407\"\/>,<polygon points=\"260,237.84609690826528 280,237.84609690826528 270,220.52558883257652\"\/>,<polygon points=\"270,220.52558883257652 290,220.52558883257652 280,237.84609690826528\"\/>,<polygon points=\"270,220.52558883257652 290,220.52558883257652 280,203.20508075688775\"\/>,<polygon points=\"280,203.20508075688775 300,203.20508075688775 290,185.88457268119896\"\/>,<polygon points=\"280,203.20508075688775 300,203.20508075688775 290,220.52558883257652\"\/>,<polygon points=\"290,220.52558883257652 310,220.52558883257652 300,203.20508075688775\"\/>,<polygon points=\"300,203.20508075688775 320,203.20508075688775 310,220.52558883257652\"\/>,<polygon points=\"310,220.52558883257652 330,220.52558883257652 320,203.20508075688775\"\/>,<polygon points=\"310,220.52558883257652 330,220.52558883257652 320,237.84609690826528\"\/>,<polygon points=\"320,237.84609690826528 340,237.84609690826528 330,220.52558883257652\"\/>,<polygon points=\"260,237.84609690826528 280,237.84609690826528 270,255.16660498395407\"\/>,<polygon points=\"290,185.88457268119896 310,185.88457268119896 300,203.20508075688775\"\/>,<polygon points=\"300,203.20508075688775 320,203.20508075688775 310,185.88457268119896\"\/>,<polygon points=\"300,168.5640646055102 320,168.5640646055102 310,185.88457268119896\"\/>,<polygon points=\"300,168.5640646055102 320,168.5640646055102 310,151.24355652982143\"\/>,<polygon points=\"290,151.24355652982143 310,151.24355652982143 300,168.5640646055102\"\/>,<polygon points=\"310,151.24355652982143 330,151.24355652982143 320,168.5640646055102\"\/>,<polygon points=\"320,168.5640646055102 340,168.5640646055102 330,151.24355652982143\"\/>,<polygon points=\"320,168.5640646055102 340,168.5640646055102 330,185.88457268119896\"\/>,<polygon points=\"330,151.24355652982143 350,151.24355652982143 340,168.5640646055102\"\/>,<polygon points=\"340,168.5640646055102 360,168.5640646055102 350,151.24355652982143\"\/>,<polygon points=\"340,168.5640646055102 360,168.5640646055102 350,185.88457268119896\"\/>,<polygon points=\"350,185.88457268119896 370,185.88457268119896 360,168.5640646055102\"\/>,<polygon points=\"350,185.88457268119896 370,185.88457268119896 360,203.20508075688775\"\/>,<polygon points=\"340,203.20508075688775 360,203.20508075688775 350,185.88457268119896\"\/>,<polygon points=\"340,203.20508075688775 360,203.20508075688775 350,220.52558883257652\"\/>,<polygon points=\"330,220.52558883257652 350,220.52558883257652 340,203.20508075688775\"\/>,<polygon points=\"330,220.52558883257652 350,220.52558883257652 340,237.84609690826528\"\/>,<polygon points=\"320,203.20508075688775 340,203.20508075688775 330,220.52558883257652\"\/>,<polygon points=\"320,203.20508075688775 340,203.20508075688775 330,185.88457268119896\"\/>,<polygon points=\"330,185.88457268119896 350,185.88457268119896 340,203.20508075688775\"\/>,<polygon points=\"330,185.88457268119896 350,185.88457268119896 340,168.5640646055102\"\/>,<polygon points=\"310,185.88457268119896 330,185.88457268119896 320,168.5640646055102\"\/>,<polygon points=\"310,185.88457268119896 330,185.88457268119896 320,203.20508075688775\"\/>",
          "pos": {
            "x": 280,
            "y": 177.22431864335
          },
          "occupiedBy": "none"
        },
        {
          "id": "de40-2521",
          "type": "sten",
          "array": [
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "22-7",
              "_pos": {
                "_x": 21,
                "_y": 7,
                "x_ny": 22,
                "y_ny": 7
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "21-8",
              "_pos": {
                "_x": 20,
                "_y": 7,
                "x_ny": 21,
                "y_ny": 8
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "20-7",
              "_pos": {
                "_x": 19,
                "_y": 7,
                "x_ny": 20,
                "y_ny": 7
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "19-8",
              "_pos": {
                "_x": 18,
                "_y": 7,
                "x_ny": 19,
                "y_ny": 8
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "18-7",
              "_pos": {
                "_x": 17,
                "_y": 7,
                "x_ny": 18,
                "y_ny": 7
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "18-9",
              "_pos": {
                "_x": 17,
                "_y": 8,
                "x_ny": 18,
                "y_ny": 9
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "17-8",
              "_pos": {
                "_x": 16,
                "_y": 8,
                "x_ny": 17,
                "y_ny": 8
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "17-10",
              "_pos": {
                "_x": 16,
                "_y": 9,
                "x_ny": 17,
                "y_ny": 10
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "18-9",
              "_pos": {
                "_x": 17,
                "_y": 9,
                "x_ny": 18,
                "y_ny": 9
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "19-10",
              "_pos": {
                "_x": 18,
                "_y": 9,
                "x_ny": 19,
                "y_ny": 10
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "19-8",
              "_pos": {
                "_x": 18,
                "_y": 8,
                "x_ny": 19,
                "y_ny": 8
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "20-9",
              "_pos": {
                "_x": 19,
                "_y": 8,
                "x_ny": 20,
                "y_ny": 9
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "21-8",
              "_pos": {
                "_x": 20,
                "_y": 8,
                "x_ny": 21,
                "y_ny": 8
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "21-10",
              "_pos": {
                "_x": 20,
                "_y": 9,
                "x_ny": 21,
                "y_ny": 9.5
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "20-9",
              "_pos": {
                "_x": 19,
                "_y": 9,
                "x_ny": 20,
                "y_ny": 9
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "20-11",
              "_pos": {
                "_x": 19,
                "_y": 10,
                "x_ny": 20,
                "y_ny": 11
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "19-10",
              "_pos": {
                "_x": 18,
                "_y": 10,
                "x_ny": 19,
                "y_ny": 10
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "22-9",
              "_pos": {
                "_x": 21,
                "_y": 8,
                "x_ny": 22,
                "y_ny": 9
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "21-10",
              "_pos": {
                "_x": 20,
                "_y": 10,
                "x_ny": 21,
                "y_ny": 10
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "22-11",
              "_pos": {
                "_x": 21,
                "_y": 10,
                "x_ny": 22,
                "y_ny": 11
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "23-10",
              "_pos": {
                "_x": 22,
                "_y": 10,
                "x_ny": 23,
                "y_ny": 10
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "24-11",
              "_pos": {
                "_x": 23,
                "_y": 10,
                "x_ny": 24,
                "y_ny": 11
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "22-9",
              "_pos": {
                "_x": 21,
                "_y": 9,
                "x_ny": 22,
                "y_ny": 9
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "21-12",
              "_pos": {
                "_x": 20,
                "_y": 11,
                "x_ny": 21,
                "y_ny": 12
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "20-11",
              "_pos": {
                "_x": 19,
                "_y": 11,
                "x_ny": 20,
                "y_ny": 11
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "19-12",
              "_pos": {
                "_x": 18,
                "_y": 11,
                "x_ny": 19,
                "y_ny": 12
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "index": "18-11",
              "_pos": {
                "_x": 17,
                "_y": 10,
                "x_ny": 18,
                "y_ny": 11
              },
              "flip": false,
              "type": "sten"
            }
          ],
          "color": "lightgray",
          "number": {
            "_pos": {
              "_x": 20,
              "_y": 9,
              "x_ny": 21,
              "y_ny": 9.5
            },
            "nr": 4
          },
          "svg": "<polygon points=\"220,168.5640646055102 240,168.5640646055102 230,151.24355652982143\"\/>,<polygon points=\"210,151.24355652982143 230,151.24355652982143 220,168.5640646055102\"\/>,<polygon points=\"200,168.5640646055102 220,168.5640646055102 210,151.24355652982143\"\/>,<polygon points=\"190,151.24355652982143 210,151.24355652982143 200,168.5640646055102\"\/>,<polygon points=\"180,168.5640646055102 200,168.5640646055102 190,151.24355652982143\"\/>,<polygon points=\"180,168.5640646055102 200,168.5640646055102 190,185.88457268119896\"\/>,<polygon points=\"170,185.88457268119896 190,185.88457268119896 180,168.5640646055102\"\/>,<polygon points=\"170,185.88457268119896 190,185.88457268119896 180,203.20508075688775\"\/>,<polygon points=\"180,203.20508075688775 200,203.20508075688775 190,185.88457268119896\"\/>,<polygon points=\"190,185.88457268119896 210,185.88457268119896 200,203.20508075688775\"\/>,<polygon points=\"190,185.88457268119896 210,185.88457268119896 200,168.5640646055102\"\/>,<polygon points=\"200,168.5640646055102 220,168.5640646055102 210,185.88457268119896\"\/>,<polygon points=\"210,185.88457268119896 230,185.88457268119896 220,168.5640646055102\"\/>,<polygon points=\"210,185.88457268119896 230,185.88457268119896 220,203.20508075688775\"\/>,<polygon points=\"200,203.20508075688775 220,203.20508075688775 210,185.88457268119896\"\/>,<polygon points=\"200,203.20508075688775 220,203.20508075688775 210,220.52558883257652\"\/>,<polygon points=\"190,220.52558883257652 210,220.52558883257652 200,203.20508075688775\"\/>,<polygon points=\"220,168.5640646055102 240,168.5640646055102 230,185.88457268119896\"\/>,<polygon points=\"210,220.52558883257652 230,220.52558883257652 220,203.20508075688775\"\/>,<polygon points=\"220,203.20508075688775 240,203.20508075688775 230,220.52558883257652\"\/>,<polygon points=\"230,220.52558883257652 250,220.52558883257652 240,203.20508075688775\"\/>,<polygon points=\"240,203.20508075688775 260,203.20508075688775 250,220.52558883257652\"\/>,<polygon points=\"220,203.20508075688775 240,203.20508075688775 230,185.88457268119896\"\/>,<polygon points=\"210,220.52558883257652 230,220.52558883257652 220,237.84609690826528\"\/>,<polygon points=\"200,237.84609690826528 220,237.84609690826528 210,220.52558883257652\"\/>,<polygon points=\"190,220.52558883257652 210,220.52558883257652 200,237.84609690826528\"\/>,<polygon points=\"180,203.20508075688775 200,203.20508075688775 190,220.52558883257652\"\/>",
          "pos": {
            "x": 220,
            "y": 194.54482671904
          },
          "occupiedBy": "none"
        },
        {
          "id": "1a66-806f",
          "type": "olja",
          "array": [
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "20-13",
              "_pos": {
                "_x": 19,
                "_y": 12,
                "x_ny": 20,
                "y_ny": 13
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "21-12",
              "_pos": {
                "_x": 20,
                "_y": 12,
                "x_ny": 21,
                "y_ny": 12
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "21-14",
              "_pos": {
                "_x": 20,
                "_y": 13,
                "x_ny": 21,
                "y_ny": 14
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "22-13",
              "_pos": {
                "_x": 21,
                "_y": 13,
                "x_ny": 22,
                "y_ny": 13
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "23-14",
              "_pos": {
                "_x": 22,
                "_y": 13,
                "x_ny": 23,
                "y_ny": 14
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "23-12",
              "_pos": {
                "_x": 22,
                "_y": 12,
                "x_ny": 23,
                "y_ny": 12
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "24-13",
              "_pos": {
                "_x": 23,
                "_y": 12,
                "x_ny": 24,
                "y_ny": 13
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "25-12",
              "_pos": {
                "_x": 24,
                "_y": 12,
                "x_ny": 25,
                "y_ny": 12
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "25-14",
              "_pos": {
                "_x": 24,
                "_y": 13,
                "x_ny": 25,
                "y_ny": 14
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "26-13",
              "_pos": {
                "_x": 25,
                "_y": 13,
                "x_ny": 26,
                "y_ny": 13
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "27-14",
              "_pos": {
                "_x": 26,
                "_y": 13,
                "x_ny": 27,
                "y_ny": 14
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "27-12",
              "_pos": {
                "_x": 26,
                "_y": 12,
                "x_ny": 27,
                "y_ny": 12
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "28-13",
              "_pos": {
                "_x": 27,
                "_y": 12,
                "x_ny": 28,
                "y_ny": 13
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "28-11",
              "_pos": {
                "_x": 27,
                "_y": 11,
                "x_ny": 28,
                "y_ny": 11.5
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "29-12",
              "_pos": {
                "_x": 28,
                "_y": 11,
                "x_ny": 29,
                "y_ny": 12
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "30-11",
              "_pos": {
                "_x": 29,
                "_y": 11,
                "x_ny": 30,
                "y_ny": 11
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "30-13",
              "_pos": {
                "_x": 29,
                "_y": 12,
                "x_ny": 30,
                "y_ny": 13
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "31-14",
              "_pos": {
                "_x": 30,
                "_y": 13,
                "x_ny": 31,
                "y_ny": 14
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "24-13",
              "_pos": {
                "_x": 23,
                "_y": 13,
                "x_ny": 24,
                "y_ny": 13
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "30-13",
              "_pos": {
                "_x": 29,
                "_y": 13,
                "x_ny": 30,
                "y_ny": 13
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "29-14",
              "_pos": {
                "_x": 28,
                "_y": 13,
                "x_ny": 29,
                "y_ny": 14
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "28-13",
              "_pos": {
                "_x": 27,
                "_y": 13,
                "x_ny": 28,
                "y_ny": 13
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "29-12",
              "_pos": {
                "_x": 28,
                "_y": 12,
                "x_ny": 29,
                "y_ny": 12
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "31-12",
              "_pos": {
                "_x": 30,
                "_y": 12,
                "x_ny": 31,
                "y_ny": 12
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "index": "32-13",
              "_pos": {
                "_x": 31,
                "_y": 12,
                "x_ny": 32,
                "y_ny": 13
              },
              "flip": false,
              "type": "olja"
            }
          ],
          "color": "#B697D8",
          "number": {
            "_pos": {
              "_x": 27,
              "_y": 11,
              "x_ny": 28,
              "y_ny": 11.5
            },
            "nr": 12
          },
          "svg": "<polygon points=\"200,237.84609690826528 220,237.84609690826528 210,255.16660498395407\"\/>,<polygon points=\"210,255.16660498395407 230,255.16660498395407 220,237.84609690826528\"\/>,<polygon points=\"210,255.16660498395407 230,255.16660498395407 220,272.48711305964287\"\/>,<polygon points=\"220,272.48711305964287 240,272.48711305964287 230,255.16660498395407\"\/>,<polygon points=\"230,255.16660498395407 250,255.16660498395407 240,272.48711305964287\"\/>,<polygon points=\"230,255.16660498395407 250,255.16660498395407 240,237.84609690826528\"\/>,<polygon points=\"240,237.84609690826528 260,237.84609690826528 250,255.16660498395407\"\/>,<polygon points=\"250,255.16660498395407 270,255.16660498395407 260,237.84609690826528\"\/>,<polygon points=\"250,255.16660498395407 270,255.16660498395407 260,272.48711305964287\"\/>,<polygon points=\"260,272.48711305964287 280,272.48711305964287 270,255.16660498395407\"\/>,<polygon points=\"270,255.16660498395407 290,255.16660498395407 280,272.48711305964287\"\/>,<polygon points=\"270,255.16660498395407 290,255.16660498395407 280,237.84609690826528\"\/>,<polygon points=\"280,237.84609690826528 300,237.84609690826528 290,255.16660498395407\"\/>,<polygon points=\"280,237.84609690826528 300,237.84609690826528 290,220.52558883257652\"\/>,<polygon points=\"290,220.52558883257652 310,220.52558883257652 300,237.84609690826528\"\/>,<polygon points=\"300,237.84609690826528 320,237.84609690826528 310,220.52558883257652\"\/>,<polygon points=\"300,237.84609690826528 320,237.84609690826528 310,255.16660498395407\"\/>,<polygon points=\"310,255.16660498395407 330,255.16660498395407 320,272.48711305964287\"\/>,<polygon points=\"240,272.48711305964287 260,272.48711305964287 250,255.16660498395407\"\/>,<polygon points=\"300,272.48711305964287 320,272.48711305964287 310,255.16660498395407\"\/>,<polygon points=\"290,255.16660498395407 310,255.16660498395407 300,272.48711305964287\"\/>,<polygon points=\"280,272.48711305964287 300,272.48711305964287 290,255.16660498395407\"\/>,<polygon points=\"290,255.16660498395407 310,255.16660498395407 300,237.84609690826528\"\/>,<polygon points=\"310,255.16660498395407 330,255.16660498395407 320,237.84609690826528\"\/>,<polygon points=\"320,237.84609690826528 340,237.84609690826528 330,255.16660498395407\"\/>",
          "pos": {
            "x": 290,
            "y": 229.18584287042
          },
          "occupiedBy": "none"
        }
      ],
      "roads": [
        [
          {
            "_x": 21,
            "_y": 4,
            "x_ny": 21,
            "y_ny": 4
          },
          {
            "_x": 31,
            "_y": 4,
            "x_ny": 31,
            "y_ny": 4
          }
        ],
        [
          {
            "_x": 31,
            "_y": 4,
            "x_ny": 31,
            "y_ny": 4
          },
          {
            "_x": 36,
            "_y": 9,
            "x_ny": 36,
            "y_ny": 9
          }
        ],
        [
          {
            "_x": 36,
            "_y": 9,
            "x_ny": 36,
            "y_ny": 9
          },
          {
            "_x": 31,
            "_y": 14,
            "x_ny": 31,
            "y_ny": 14
          }
        ],
        [
          {
            "_x": 31,
            "_y": 14,
            "x_ny": 31,
            "y_ny": 14
          },
          {
            "_x": 21,
            "_y": 14,
            "x_ny": 21,
            "y_ny": 14
          }
        ],
        [
          {
            "_x": 21,
            "_y": 14,
            "x_ny": 21,
            "y_ny": 14
          },
          {
            "_x": 16,
            "_y": 9,
            "x_ny": 16,
            "y_ny": 9
          }
        ],
        [
          {
            "_x": 16,
            "_y": 9,
            "x_ny": 16,
            "y_ny": 9
          },
          {
            "_x": 21,
            "_y": 4,
            "x_ny": 21,
            "y_ny": 4
          }
        ]
      ],
      "buildings": [
        {
          "id": "ef96-401a",
          "_pos": {
            "_x": 23,
            "_y": 4,
            "x_ny": 23,
            "y_ny": 4
          },
          "array": [
            {
              "index": "21-4",
              "_pos": {
                "_x": 21,
                "_y": 4,
                "x_ny": 22,
                "y_ny": 5
              },
              "flip": false,
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "type": "tr\u00e4"
            },
            {
              "index": "22-4",
              "_pos": {
                "_x": 22,
                "_y": 4,
                "x_ny": 23,
                "y_ny": 4
              },
              "flip": true
            },
            {
              "index": "23-4",
              "_pos": {
                "_x": 23,
                "_y": 4,
                "x_ny": 24,
                "y_ny": 5
              },
              "flip": false,
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "type": "tr\u00e4"
            },
            {
              "index": "21-3",
              "_pos": {
                "_x": 21,
                "_y": 3,
                "x_ny": 22,
                "y_ny": 3
              },
              "flip": true
            },
            {
              "index": "22-3",
              "_pos": {
                "_x": 22,
                "_y": 3,
                "x_ny": 23,
                "y_ny": 4
              },
              "flip": false
            },
            {
              "index": "23-3",
              "_pos": {
                "_x": 23,
                "_y": 3,
                "x_ny": 24,
                "y_ny": 3
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "type": "tr\u00e4"
            },
            {
              "refid": "aba6",
              "type": "hamn"
            }
          ],
          "pos": {
            "x": 240,
            "y": 99.282032302755
          }
        },
        {
          "id": "5df7-9422",
          "_pos": {
            "_x": 29,
            "_y": 4,
            "x_ny": 29,
            "y_ny": 4
          },
          "array": [
            {
              "index": "27-4",
              "_pos": {
                "_x": 27,
                "_y": 4,
                "x_ny": 28,
                "y_ny": 5
              },
              "flip": false,
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "type": "s\u00e4d"
            },
            {
              "index": "28-4",
              "_pos": {
                "_x": 28,
                "_y": 4,
                "x_ny": 29,
                "y_ny": 4
              },
              "flip": true
            },
            {
              "index": "29-4",
              "_pos": {
                "_x": 29,
                "_y": 4,
                "x_ny": 30,
                "y_ny": 5
              },
              "flip": false,
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "type": "s\u00e4d"
            },
            {
              "index": "27-3",
              "_pos": {
                "_x": 27,
                "_y": 3,
                "x_ny": 28,
                "y_ny": 3
              },
              "flip": true
            },
            {
              "index": "28-3",
              "_pos": {
                "_x": 28,
                "_y": 3,
                "x_ny": 29,
                "y_ny": 4
              },
              "flip": false
            },
            {
              "index": "29-3",
              "_pos": {
                "_x": 29,
                "_y": 3,
                "x_ny": 30,
                "y_ny": 3
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "type": "s\u00e4d"
            },
            {
              "refid": "6982",
              "type": "hamn"
            }
          ],
          "pos": {
            "x": 300,
            "y": 99.282032302755
          }
        },
        {
          "id": "289c-78c2",
          "_pos": {
            "_x": 32,
            "_y": 5,
            "x_ny": 32,
            "y_ny": 5
          },
          "array": [
            {
              "index": "30-5",
              "_pos": {
                "_x": 30,
                "_y": 5,
                "x_ny": 31,
                "y_ny": 6
              },
              "flip": false,
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "type": "s\u00e4d"
            },
            {
              "index": "31-5",
              "_pos": {
                "_x": 31,
                "_y": 5,
                "x_ny": 32,
                "y_ny": 5
              },
              "flip": true
            },
            {
              "index": "32-5",
              "_pos": {
                "_x": 32,
                "_y": 5,
                "x_ny": 33,
                "y_ny": 6
              },
              "flip": false,
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "type": "s\u00e4d"
            },
            {
              "index": "30-4",
              "_pos": {
                "_x": 30,
                "_y": 4,
                "x_ny": 31,
                "y_ny": 4
              },
              "flip": true
            },
            {
              "index": "31-4",
              "_pos": {
                "_x": 31,
                "_y": 4,
                "x_ny": 32,
                "y_ny": 5
              },
              "flip": false,
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "type": "s\u00e4d"
            },
            {
              "index": "32-4",
              "_pos": {
                "_x": 32,
                "_y": 4,
                "x_ny": 33,
                "y_ny": 4
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "type": "s\u00e4d"
            },
            {
              "refid": "524d",
              "type": "hamn"
            }
          ],
          "pos": {
            "x": 330,
            "y": 116.60254037844
          }
        },
        {
          "id": "72af-4b78",
          "_pos": {
            "_x": 35,
            "_y": 8,
            "x_ny": 35,
            "y_ny": 8
          },
          "array": [
            {
              "index": "33-8",
              "_pos": {
                "_x": 33,
                "_y": 8,
                "x_ny": 34,
                "y_ny": 9
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "34-8",
              "_pos": {
                "_x": 34,
                "_y": 8,
                "x_ny": 35,
                "y_ny": 8
              },
              "flip": true
            },
            {
              "index": "35-8",
              "_pos": {
                "_x": 35,
                "_y": 8,
                "x_ny": 36,
                "y_ny": 9
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "33-7",
              "_pos": {
                "_x": 33,
                "_y": 7,
                "x_ny": 34,
                "y_ny": 7
              },
              "flip": true
            },
            {
              "index": "34-7",
              "_pos": {
                "_x": 34,
                "_y": 7,
                "x_ny": 35,
                "y_ny": 8
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "35-7",
              "_pos": {
                "_x": 35,
                "_y": 7,
                "x_ny": 36,
                "y_ny": 7
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "refid": "30da",
              "type": "hamn"
            }
          ],
          "pos": {
            "x": 360,
            "y": 168.56406460551
          }
        },
        {
          "id": "69e1-c0a4",
          "_pos": {
            "_x": 35,
            "_y": 10,
            "x_ny": 35,
            "y_ny": 10
          },
          "array": [
            {
              "index": "33-10",
              "_pos": {
                "_x": 33,
                "_y": 10,
                "x_ny": 34,
                "y_ny": 11
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "34-10",
              "_pos": {
                "_x": 34,
                "_y": 10,
                "x_ny": 35,
                "y_ny": 10
              },
              "flip": true
            },
            {
              "index": "35-10",
              "_pos": {
                "_x": 35,
                "_y": 10,
                "x_ny": 36,
                "y_ny": 11
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "33-9",
              "_pos": {
                "_x": 33,
                "_y": 9,
                "x_ny": 34,
                "y_ny": 9
              },
              "flip": true
            },
            {
              "index": "34-9",
              "_pos": {
                "_x": 34,
                "_y": 9,
                "x_ny": 35,
                "y_ny": 10
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "35-9",
              "_pos": {
                "_x": 35,
                "_y": 9,
                "x_ny": 36,
                "y_ny": 9
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "refid": "4c2b",
              "type": "hamn"
            }
          ],
          "pos": {
            "x": 360,
            "y": 203.20508075689
          }
        },
        {
          "id": "f32c-c6ea",
          "_pos": {
            "_x": 29,
            "_y": 14,
            "x_ny": 29,
            "y_ny": 14
          },
          "array": [
            {
              "index": "27-14",
              "_pos": {
                "_x": 27,
                "_y": 14,
                "x_ny": 28,
                "y_ny": 15
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "28-14",
              "_pos": {
                "_x": 28,
                "_y": 14,
                "x_ny": 29,
                "y_ny": 14
              },
              "flip": true
            },
            {
              "index": "29-14",
              "_pos": {
                "_x": 29,
                "_y": 14,
                "x_ny": 30,
                "y_ny": 15
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "27-13",
              "_pos": {
                "_x": 27,
                "_y": 13,
                "x_ny": 28,
                "y_ny": 13
              },
              "flip": true
            },
            {
              "index": "28-13",
              "_pos": {
                "_x": 28,
                "_y": 13,
                "x_ny": 29,
                "y_ny": 14
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "29-13",
              "_pos": {
                "_x": 29,
                "_y": 13,
                "x_ny": 30,
                "y_ny": 13
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "refid": "ec74",
              "type": "hamn"
            }
          ],
          "pos": {
            "x": 300,
            "y": 272.48711305964
          }
        },
        {
          "id": "3032-da07",
          "_pos": {
            "_x": 23,
            "_y": 14,
            "x_ny": 23,
            "y_ny": 14
          },
          "array": [
            {
              "index": "21-14",
              "_pos": {
                "_x": 21,
                "_y": 14,
                "x_ny": 22,
                "y_ny": 15
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "22-14",
              "_pos": {
                "_x": 22,
                "_y": 14,
                "x_ny": 23,
                "y_ny": 14
              },
              "flip": true
            },
            {
              "index": "23-14",
              "_pos": {
                "_x": 23,
                "_y": 14,
                "x_ny": 24,
                "y_ny": 15
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "21-13",
              "_pos": {
                "_x": 21,
                "_y": 13,
                "x_ny": 22,
                "y_ny": 13
              },
              "flip": true
            },
            {
              "index": "22-13",
              "_pos": {
                "_x": 22,
                "_y": 13,
                "x_ny": 23,
                "y_ny": 14
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "23-13",
              "_pos": {
                "_x": 23,
                "_y": 13,
                "x_ny": 24,
                "y_ny": 13
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "refid": "e7e9",
              "type": "hamn"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            }
          ],
          "pos": {
            "x": 240,
            "y": 272.48711305964
          }
        },
        {
          "id": "4e2a-da82",
          "_pos": {
            "_x": 20,
            "_y": 13,
            "x_ny": 20,
            "y_ny": 13
          },
          "array": [
            {
              "index": "18-13",
              "_pos": {
                "_x": 18,
                "_y": 13,
                "x_ny": 19,
                "y_ny": 14
              },
              "flip": false,
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "type": "djur"
            },
            {
              "index": "19-13",
              "_pos": {
                "_x": 19,
                "_y": 13,
                "x_ny": 20,
                "y_ny": 13
              },
              "flip": true
            },
            {
              "index": "20-13",
              "_pos": {
                "_x": 20,
                "_y": 13,
                "x_ny": 21,
                "y_ny": 14
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "18-12",
              "_pos": {
                "_x": 18,
                "_y": 12,
                "x_ny": 19,
                "y_ny": 12
              },
              "flip": true
            },
            {
              "index": "19-12",
              "_pos": {
                "_x": 19,
                "_y": 12,
                "x_ny": 20,
                "y_ny": 13
              },
              "flip": false,
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "type": "sten"
            },
            {
              "index": "20-12",
              "_pos": {
                "_x": 20,
                "_y": 12,
                "x_ny": 21,
                "y_ny": 12
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "type": "djur"
            },
            {
              "refid": "0209",
              "type": "hamn"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "type": "sten"
            }
          ],
          "pos": {
            "x": 210,
            "y": 255.16660498395
          }
        },
        {
          "id": "d108-9f6d",
          "_pos": {
            "_x": 17,
            "_y": 10,
            "x_ny": 17,
            "y_ny": 10
          },
          "array": [
            {
              "index": "15-10",
              "_pos": {
                "_x": 15,
                "_y": 10,
                "x_ny": 16,
                "y_ny": 11
              },
              "flip": false,
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "type": "sten"
            },
            {
              "index": "16-10",
              "_pos": {
                "_x": 16,
                "_y": 10,
                "x_ny": 17,
                "y_ny": 10
              },
              "flip": true
            },
            {
              "index": "17-10",
              "_pos": {
                "_x": 17,
                "_y": 10,
                "x_ny": 18,
                "y_ny": 11
              },
              "flip": false,
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "type": "sten"
            },
            {
              "index": "15-9",
              "_pos": {
                "_x": 15,
                "_y": 9,
                "x_ny": 16,
                "y_ny": 9
              },
              "flip": true
            },
            {
              "index": "16-9",
              "_pos": {
                "_x": 16,
                "_y": 9,
                "x_ny": 17,
                "y_ny": 10
              },
              "flip": false,
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "type": "sten"
            },
            {
              "index": "17-9",
              "_pos": {
                "_x": 17,
                "_y": 9,
                "x_ny": 18,
                "y_ny": 9
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "type": "sten"
            },
            {
              "refid": "aa45",
              "type": "hamn"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "type": "sten"
            }
          ],
          "pos": {
            "x": 180,
            "y": 203.20508075689
          }
        },
        {
          "id": "6ba5-ee0d",
          "_pos": {
            "_x": 17,
            "_y": 8,
            "x_ny": 17,
            "y_ny": 8
          },
          "array": [
            {
              "index": "15-8",
              "_pos": {
                "_x": 15,
                "_y": 8,
                "x_ny": 16,
                "y_ny": 9
              },
              "flip": false
            },
            {
              "index": "16-8",
              "_pos": {
                "_x": 16,
                "_y": 8,
                "x_ny": 17,
                "y_ny": 8
              },
              "flip": true
            },
            {
              "index": "17-8",
              "_pos": {
                "_x": 17,
                "_y": 8,
                "x_ny": 18,
                "y_ny": 9
              },
              "flip": false,
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "type": "sten"
            },
            {
              "index": "15-7",
              "_pos": {
                "_x": 15,
                "_y": 7,
                "x_ny": 16,
                "y_ny": 7
              },
              "flip": true
            },
            {
              "index": "16-7",
              "_pos": {
                "_x": 16,
                "_y": 7,
                "x_ny": 17,
                "y_ny": 8
              },
              "flip": false
            },
            {
              "index": "17-7",
              "_pos": {
                "_x": 17,
                "_y": 7,
                "x_ny": 18,
                "y_ny": 7
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "d811",
              "type": "hamn"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "type": "sten"
            }
          ],
          "pos": {
            "x": 180,
            "y": 168.56406460551
          }
        },
        {
          "id": "700f-f81d",
          "_pos": {
            "_x": 20,
            "_y": 5,
            "x_ny": 20,
            "y_ny": 5
          },
          "array": [
            {
              "index": "18-5",
              "_pos": {
                "_x": 18,
                "_y": 5,
                "x_ny": 19,
                "y_ny": 6
              },
              "flip": false
            },
            {
              "index": "19-5",
              "_pos": {
                "_x": 19,
                "_y": 5,
                "x_ny": 20,
                "y_ny": 5
              },
              "flip": true
            },
            {
              "index": "20-5",
              "_pos": {
                "_x": 20,
                "_y": 5,
                "x_ny": 21,
                "y_ny": 6
              },
              "flip": false,
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "type": "tr\u00e4"
            },
            {
              "index": "18-4",
              "_pos": {
                "_x": 18,
                "_y": 4,
                "x_ny": 19,
                "y_ny": 4
              },
              "flip": true
            },
            {
              "index": "19-4",
              "_pos": {
                "_x": 19,
                "_y": 4,
                "x_ny": 20,
                "y_ny": 5
              },
              "flip": false
            },
            {
              "index": "20-4",
              "_pos": {
                "_x": 20,
                "_y": 4,
                "x_ny": 21,
                "y_ny": 4
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "4dcf",
              "type": "hamn"
            },
            {
              "refid": "e9dd-24d8",
              "bp_id": "98c1-e360-dd6c",
              "type": "tr\u00e4"
            }
          ],
          "pos": {
            "x": 210,
            "y": 116.60254037844
          }
        },
        {
          "id": "59af-f3d8",
          "_pos": {
            "_x": 32,
            "_y": 13,
            "x_ny": 32,
            "y_ny": 13
          },
          "array": [
            {
              "index": "30-13",
              "_pos": {
                "_x": 30,
                "_y": 13,
                "x_ny": 31,
                "y_ny": 14
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "31-13",
              "_pos": {
                "_x": 31,
                "_y": 13,
                "x_ny": 32,
                "y_ny": 13
              },
              "flip": true
            },
            {
              "index": "32-13",
              "_pos": {
                "_x": 32,
                "_y": 13,
                "x_ny": 33,
                "y_ny": 14
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "30-12",
              "_pos": {
                "_x": 30,
                "_y": 12,
                "x_ny": 31,
                "y_ny": 12
              },
              "flip": true
            },
            {
              "index": "31-12",
              "_pos": {
                "_x": 31,
                "_y": 12,
                "x_ny": 32,
                "y_ny": 13
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "32-12",
              "_pos": {
                "_x": 32,
                "_y": 12,
                "x_ny": 33,
                "y_ny": 12
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "refid": "41f8",
              "type": "hamn"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            }
          ],
          "pos": {
            "x": 330,
            "y": 255.16660498395
          }
        }
      ],
      "svg": "<svg width=\"220\" height=\"233.20508075688775\"><g id=\"fields_98c1-e360-dd6c\"><g id=\"e9dd-24d8\" class=\"field tr\u00e4\" type=\"tr\u00e4\"><polygon points=\"70,81.96152422706632 90,81.96152422706632 80,99.2820323027551\"><\/polygon><polygon points=\"70,81.96152422706632 90,81.96152422706632 80,64.64101615137756\"><\/polygon><polygon points=\"80,64.64101615137756 100,64.64101615137756 90,81.96152422706632\"><\/polygon><polygon points=\"80,64.64101615137756 100,64.64101615137756 90,47.32050807568878\"><\/polygon><polygon points=\"90,47.32050807568878 110,47.32050807568878 100,64.64101615137756\"><\/polygon><polygon points=\"90,47.32050807568878 110,47.32050807568878 100,30\"><\/polygon><polygon points=\"80,30 100,30 90,47.32050807568878\"><\/polygon><polygon points=\"70,47.32050807568878 90,47.32050807568878 80,64.64101615137756\"><\/polygon><polygon points=\"60,64.64101615137756 80,64.64101615137756 70,47.32050807568878\"><\/polygon><polygon points=\"60,64.64101615137756 80,64.64101615137756 70,81.96152422706632\"><\/polygon><polygon points=\"50,81.96152422706632 70,81.96152422706632 60,64.64101615137756\"><\/polygon><polygon points=\"30,81.96152422706632 50,81.96152422706632 40,64.64101615137756\"><\/polygon><polygon points=\"40,64.64101615137756 60,64.64101615137756 50,81.96152422706632\"><\/polygon><polygon points=\"40,64.64101615137756 60,64.64101615137756 50,47.32050807568878\"><\/polygon><polygon points=\"50,47.32050807568878 70,47.32050807568878 60,64.64101615137756\"><\/polygon><polygon points=\"50,47.32050807568878 70,47.32050807568878 60,30\"><\/polygon><polygon points=\"60,30 80,30 70,47.32050807568878\"><\/polygon><polygon points=\"70,47.32050807568878 90,47.32050807568878 80,30\"><\/polygon><g class=\"number\"><circle cx=\"80\" cy=\"55.98076211353316\" r=\"8.1\"><\/circle><text id=\"nr-e9dd-24d8\" transform=\"matrix(1 0 0 1 80 60.98076211353316)\">6<\/text><\/g><\/g><g id=\"b3eb-f140\" class=\"field s\u00e4d\" type=\"s\u00e4d\"><polygon points=\"140,64.64101615137756 160,64.64101615137756 150,47.32050807568878\"><\/polygon><polygon points=\"130,47.32050807568878 150,47.32050807568878 140,64.64101615137756\"><\/polygon><polygon points=\"120,30 140,30 130,47.32050807568878\"><\/polygon><polygon points=\"130,47.32050807568878 150,47.32050807568878 140,30\"><\/polygon><polygon points=\"140,30 160,30 150,47.32050807568878\"><\/polygon><polygon points=\"150,47.32050807568878 170,47.32050807568878 160,30\"><\/polygon><polygon points=\"150,47.32050807568878 170,47.32050807568878 160,64.64101615137756\"><\/polygon><polygon points=\"160,64.64101615137756 180,64.64101615137756 170,47.32050807568878\"><\/polygon><polygon points=\"170,81.96152422706632 190,81.96152422706632 180,64.64101615137756\"><\/polygon><polygon points=\"160,64.64101615137756 180,64.64101615137756 170,81.96152422706632\"><\/polygon><polygon points=\"150,81.96152422706632 170,81.96152422706632 160,64.64101615137756\"><\/polygon><polygon points=\"140,64.64101615137756 160,64.64101615137756 150,81.96152422706632\"><\/polygon><polygon points=\"130,81.96152422706632 150,81.96152422706632 140,64.64101615137756\"><\/polygon><polygon points=\"120,64.64101615137756 140,64.64101615137756 130,81.96152422706632\"><\/polygon><polygon points=\"120,64.64101615137756 140,64.64101615137756 130,47.32050807568878\"><\/polygon><polygon points=\"110,47.32050807568878 130,47.32050807568878 120,64.64101615137756\"><\/polygon><polygon points=\"110,47.32050807568878 130,47.32050807568878 120,30\"><\/polygon><polygon points=\"100,30 120,30 110,47.32050807568878\"><\/polygon><g class=\"number\"><circle cx=\"130\" cy=\"55.98076211353316\" r=\"8.1\"><\/circle><text id=\"nr-b3eb-f140\" transform=\"matrix(1 0 0 1 130 60.98076211353316)\">11<\/text><\/g><\/g><g id=\"5ab9-e799\" class=\"field djur\" type=\"djur\"><polygon points=\"150,116.60254037844388 170,116.60254037844388 160,133.92304845413264\"><\/polygon><polygon points=\"150,116.60254037844388 170,116.60254037844388 160,99.2820323027551\"><\/polygon><polygon points=\"170,116.60254037844388 190,116.60254037844388 180,99.2820323027551\"><\/polygon><polygon points=\"170,116.60254037844388 190,116.60254037844388 180,133.92304845413264\"><\/polygon><polygon points=\"160,133.92304845413264 180,133.92304845413264 170,116.60254037844388\"><\/polygon><polygon points=\"160,133.92304845413264 180,133.92304845413264 170,151.24355652982143\"><\/polygon><polygon points=\"170,151.24355652982143 190,151.24355652982143 180,168.5640646055102\"><\/polygon><polygon points=\"170,151.24355652982143 190,151.24355652982143 180,133.92304845413264\"><\/polygon><polygon points=\"180,133.92304845413264 200,133.92304845413264 190,151.24355652982143\"><\/polygon><polygon points=\"180,133.92304845413264 200,133.92304845413264 190,116.60254037844388\"><\/polygon><polygon points=\"190,116.60254037844388 210,116.60254037844388 200,133.92304845413264\"><\/polygon><polygon points=\"190,116.60254037844388 210,116.60254037844388 200,99.2820323027551\"><\/polygon><polygon points=\"180,99.2820323027551 200,99.2820323027551 190,116.60254037844388\"><\/polygon><polygon points=\"180,99.2820323027551 200,99.2820323027551 190,81.96152422706632\"><\/polygon><polygon points=\"170,81.96152422706632 190,81.96152422706632 180,99.2820323027551\"><\/polygon><polygon points=\"160,99.2820323027551 180,99.2820323027551 170,116.60254037844388\"><\/polygon><polygon points=\"160,99.2820323027551 180,99.2820323027551 170,81.96152422706632\"><\/polygon><polygon points=\"150,81.96152422706632 170,81.96152422706632 160,99.2820323027551\"><\/polygon><polygon points=\"130,81.96152422706632 150,81.96152422706632 140,99.2820323027551\"><\/polygon><polygon points=\"140,99.2820323027551 160,99.2820323027551 150,81.96152422706632\"><\/polygon><polygon points=\"140,99.2820323027551 160,99.2820323027551 150,116.60254037844388\"><\/polygon><polygon points=\"140,133.92304845413264 160,133.92304845413264 150,116.60254037844388\"><\/polygon><polygon points=\"130,116.60254037844388 150,116.60254037844388 140,133.92304845413264\"><\/polygon><polygon points=\"100,168.5640646055102 120,168.5640646055102 110,185.88457268119896\"><\/polygon><polygon points=\"160,168.5640646055102 180,168.5640646055102 170,151.24355652982143\"><\/polygon><polygon points=\"150,151.24355652982143 170,151.24355652982143 160,168.5640646055102\"><\/polygon><polygon points=\"150,151.24355652982143 170,151.24355652982143 160,133.92304845413264\"><\/polygon><polygon points=\"140,133.92304845413264 160,133.92304845413264 150,151.24355652982143\"><\/polygon><polygon points=\"130,151.24355652982143 150,151.24355652982143 140,133.92304845413264\"><\/polygon><polygon points=\"120,133.92304845413264 140,133.92304845413264 130,151.24355652982143\"><\/polygon><polygon points=\"120,133.92304845413264 140,133.92304845413264 130,116.60254037844388\"><\/polygon><polygon points=\"110,151.24355652982143 130,151.24355652982143 120,133.92304845413264\"><\/polygon><polygon points=\"110,151.24355652982143 130,151.24355652982143 120,168.5640646055102\"><\/polygon><polygon points=\"100,168.5640646055102 120,168.5640646055102 110,151.24355652982143\"><\/polygon><polygon points=\"60,168.5640646055102 80,168.5640646055102 70,185.88457268119896\"><\/polygon><polygon points=\"60,168.5640646055102 80,168.5640646055102 70,151.24355652982143\"><\/polygon><polygon points=\"70,151.24355652982143 90,151.24355652982143 80,168.5640646055102\"><\/polygon><polygon points=\"80,168.5640646055102 100,168.5640646055102 90,151.24355652982143\"><\/polygon><polygon points=\"90,151.24355652982143 110,151.24355652982143 100,168.5640646055102\"><\/polygon><polygon points=\"90,116.60254037844388 110,116.60254037844388 100,99.2820323027551\"><\/polygon><polygon points=\"90,151.24355652982143 110,151.24355652982143 100,133.92304845413264\"><\/polygon><polygon points=\"100,133.92304845413264 120,133.92304845413264 110,151.24355652982143\"><\/polygon><polygon points=\"100,133.92304845413264 120,133.92304845413264 110,116.60254037844388\"><\/polygon><polygon points=\"90,116.60254037844388 110,116.60254037844388 100,133.92304845413264\"><\/polygon><polygon points=\"80,133.92304845413264 100,133.92304845413264 90,116.60254037844388\"><\/polygon><polygon points=\"70,116.60254037844388 90,116.60254037844388 80,133.92304845413264\"><\/polygon><polygon points=\"70,116.60254037844388 90,116.60254037844388 80,99.2820323027551\"><\/polygon><polygon points=\"80,99.2820323027551 100,99.2820323027551 90,116.60254037844388\"><\/polygon><polygon points=\"80,99.2820323027551 100,99.2820323027551 90,81.96152422706632\"><\/polygon><polygon points=\"100,99.2820323027551 120,99.2820323027551 110,116.60254037844388\"><\/polygon><polygon points=\"110,116.60254037844388 130,116.60254037844388 120,133.92304845413264\"><\/polygon><polygon points=\"130,116.60254037844388 150,116.60254037844388 140,99.2820323027551\"><\/polygon><polygon points=\"110,116.60254037844388 130,116.60254037844388 120,99.2820323027551\"><\/polygon><polygon points=\"120,99.2820323027551 140,99.2820323027551 130,116.60254037844388\"><\/polygon><polygon points=\"120,99.2820323027551 140,99.2820323027551 130,81.96152422706632\"><\/polygon><polygon points=\"110,81.96152422706632 130,81.96152422706632 120,64.64101615137756\"><\/polygon><polygon points=\"110,81.96152422706632 130,81.96152422706632 120,99.2820323027551\"><\/polygon><polygon points=\"100,99.2820323027551 120,99.2820323027551 110,81.96152422706632\"><\/polygon><polygon points=\"90,81.96152422706632 110,81.96152422706632 100,99.2820323027551\"><\/polygon><polygon points=\"90,81.96152422706632 110,81.96152422706632 100,64.64101615137756\"><\/polygon><polygon points=\"100,64.64101615137756 120,64.64101615137756 110,81.96152422706632\"><\/polygon><polygon points=\"100,64.64101615137756 120,64.64101615137756 110,47.32050807568878\"><\/polygon><g class=\"number\"><circle cx=\"120\" cy=\"107.94228634059948\" r=\"8.1\"><\/circle><text id=\"nr-5ab9-e799\" transform=\"matrix(1 0 0 1 120 112.94228634059948)\">5<\/text><\/g><\/g><g id=\"de40-2521\" class=\"field sten\" type=\"sten\"><polygon points=\"20,133.92304845413264 40,133.92304845413264 30,151.24355652982143\"><\/polygon><polygon points=\"30,151.24355652982143 50,151.24355652982143 40,168.5640646055102\"><\/polygon><polygon points=\"40,168.5640646055102 60,168.5640646055102 50,151.24355652982143\"><\/polygon><polygon points=\"50,151.24355652982143 70,151.24355652982143 60,168.5640646055102\"><\/polygon><polygon points=\"60,133.92304845413264 80,133.92304845413264 70,116.60254037844388\"><\/polygon><polygon points=\"80,133.92304845413264 100,133.92304845413264 90,151.24355652982143\"><\/polygon><polygon points=\"70,151.24355652982143 90,151.24355652982143 80,133.92304845413264\"><\/polygon><polygon points=\"60,133.92304845413264 80,133.92304845413264 70,151.24355652982143\"><\/polygon><polygon points=\"50,151.24355652982143 70,151.24355652982143 60,133.92304845413264\"><\/polygon><polygon points=\"60,99.2820323027551 80,99.2820323027551 70,116.60254037844388\"><\/polygon><polygon points=\"30,151.24355652982143 50,151.24355652982143 40,133.92304845413264\"><\/polygon><polygon points=\"40,133.92304845413264 60,133.92304845413264 50,151.24355652982143\"><\/polygon><polygon points=\"40,133.92304845413264 60,133.92304845413264 50,116.60254037844388\"><\/polygon><polygon points=\"50,116.60254037844388 70,116.60254037844388 60,133.92304845413264\"><\/polygon><polygon points=\"50,116.60254037844388 70,116.60254037844388 60,99.2820323027551\"><\/polygon><polygon points=\"40,99.2820323027551 60,99.2820323027551 50,116.60254037844388\"><\/polygon><polygon points=\"30,116.60254037844388 50,116.60254037844388 40,99.2820323027551\"><\/polygon><polygon points=\"30,116.60254037844388 50,116.60254037844388 40,133.92304845413264\"><\/polygon><polygon points=\"20,133.92304845413264 40,133.92304845413264 30,116.60254037844388\"><\/polygon><polygon points=\"10,116.60254037844388 30,116.60254037844388 20,133.92304845413264\"><\/polygon><polygon points=\"10,116.60254037844388 30,116.60254037844388 20,99.2820323027551\"><\/polygon><polygon points=\"20,99.2820323027551 40,99.2820323027551 30,116.60254037844388\"><\/polygon><polygon points=\"20,99.2820323027551 40,99.2820323027551 30,81.96152422706632\"><\/polygon><polygon points=\"30,81.96152422706632 50,81.96152422706632 40,99.2820323027551\"><\/polygon><polygon points=\"40,99.2820323027551 60,99.2820323027551 50,81.96152422706632\"><\/polygon><polygon points=\"50,81.96152422706632 70,81.96152422706632 60,99.2820323027551\"><\/polygon><polygon points=\"60,99.2820323027551 80,99.2820323027551 70,81.96152422706632\"><\/polygon><g class=\"number\"><circle cx=\"60\" cy=\"125.26279441628826\" r=\"8.1\"><\/circle><text id=\"nr-de40-2521\" transform=\"matrix(1 0 0 1 60 130.26279441628827)\">4<\/text><\/g><\/g><g id=\"1a66-806f\" class=\"field olja\" type=\"olja\"><polygon points=\"160,168.5640646055102 180,168.5640646055102 170,185.88457268119896\"><\/polygon><polygon points=\"150,185.88457268119896 170,185.88457268119896 160,168.5640646055102\"><\/polygon><polygon points=\"130,185.88457268119896 150,185.88457268119896 140,168.5640646055102\"><\/polygon><polygon points=\"120,203.20508075688775 140,203.20508075688775 130,185.88457268119896\"><\/polygon><polygon points=\"130,185.88457268119896 150,185.88457268119896 140,203.20508075688775\"><\/polygon><polygon points=\"140,203.20508075688775 160,203.20508075688775 150,185.88457268119896\"><\/polygon><polygon points=\"80,203.20508075688775 100,203.20508075688775 90,185.88457268119896\"><\/polygon><polygon points=\"150,185.88457268119896 170,185.88457268119896 160,203.20508075688775\"><\/polygon><polygon points=\"140,168.5640646055102 160,168.5640646055102 150,185.88457268119896\"><\/polygon><polygon points=\"140,168.5640646055102 160,168.5640646055102 150,151.24355652982143\"><\/polygon><polygon points=\"130,151.24355652982143 150,151.24355652982143 140,168.5640646055102\"><\/polygon><polygon points=\"120,168.5640646055102 140,168.5640646055102 130,151.24355652982143\"><\/polygon><polygon points=\"120,168.5640646055102 140,168.5640646055102 130,185.88457268119896\"><\/polygon><polygon points=\"110,185.88457268119896 130,185.88457268119896 120,168.5640646055102\"><\/polygon><polygon points=\"110,185.88457268119896 130,185.88457268119896 120,203.20508075688775\"><\/polygon><polygon points=\"100,203.20508075688775 120,203.20508075688775 110,185.88457268119896\"><\/polygon><polygon points=\"90,185.88457268119896 110,185.88457268119896 100,203.20508075688775\"><\/polygon><polygon points=\"90,185.88457268119896 110,185.88457268119896 100,168.5640646055102\"><\/polygon><polygon points=\"80,168.5640646055102 100,168.5640646055102 90,185.88457268119896\"><\/polygon><polygon points=\"70,185.88457268119896 90,185.88457268119896 80,168.5640646055102\"><\/polygon><polygon points=\"70,185.88457268119896 90,185.88457268119896 80,203.20508075688775\"><\/polygon><polygon points=\"60,203.20508075688775 80,203.20508075688775 70,185.88457268119896\"><\/polygon><polygon points=\"50,185.88457268119896 70,185.88457268119896 60,203.20508075688775\"><\/polygon><polygon points=\"50,185.88457268119896 70,185.88457268119896 60,168.5640646055102\"><\/polygon><polygon points=\"40,168.5640646055102 60,168.5640646055102 50,185.88457268119896\"><\/polygon><g class=\"number\"><circle cx=\"130\" cy=\"159.9038105676658\" r=\"8.1\"><\/circle><text id=\"nr-1a66-806f\" transform=\"matrix(1 0 0 1 130 164.9038105676658)\">12<\/text><\/g><\/g><\/g><g id=\"roads_98c1-e360-dd6c\"><g class=\"road\"><circle cx=\"60\" cy=\"30\" r=\"2\"><\/circle> <circle cx=\"160\" cy=\"30\" r=\"2\"><\/circle><line x1=\"60\" y1=\"30\" x2=\"160\" y2=\"30\"><\/line><\/g><g class=\"road\"><circle cx=\"160\" cy=\"30\" r=\"2\"><\/circle> <circle cx=\"210\" cy=\"116.60254037844388\" r=\"2\"><\/circle><line x1=\"160\" y1=\"30\" x2=\"210\" y2=\"116.60254037844388\"><\/line><\/g><g class=\"road\"><circle cx=\"210\" cy=\"116.60254037844388\" r=\"2\"><\/circle> <circle cx=\"160\" cy=\"203.20508075688775\" r=\"2\"><\/circle><line x1=\"210\" y1=\"116.60254037844388\" x2=\"160\" y2=\"203.20508075688775\"><\/line><\/g><g class=\"road\"><circle cx=\"160\" cy=\"203.20508075688775\" r=\"2\"><\/circle> <circle cx=\"60\" cy=\"203.20508075688775\" r=\"2\"><\/circle><line x1=\"160\" y1=\"203.20508075688775\" x2=\"60\" y2=\"203.20508075688775\"><\/line><\/g><g class=\"road\"><circle cx=\"60\" cy=\"203.20508075688775\" r=\"2\"><\/circle> <circle cx=\"10\" cy=\"116.60254037844388\" r=\"2\"><\/circle><line x1=\"60\" y1=\"203.20508075688775\" x2=\"10\" y2=\"116.60254037844388\"><\/line><\/g><g class=\"road\"><circle cx=\"10\" cy=\"116.60254037844388\" r=\"2\"><\/circle> <circle cx=\"60\" cy=\"30\" r=\"2\"><\/circle><line x1=\"10\" y1=\"116.60254037844388\" x2=\"60\" y2=\"30\"><\/line><\/g><\/g><g id=\"buildings_98c1-e360-dd6c\"><g class=\"building\" id=\"ef96-401a\"><polygon points=\"60,30 80,30 70,47.32050807568878\"><\/polygon>,<polygon points=\"70,47.32050807568878 90,47.32050807568878 80,30\"><\/polygon>,<polygon points=\"80,30 100,30 90,47.32050807568878\"><\/polygon>,<polygon points=\"60,30 80,30 70,12.679491924311225\"><\/polygon>,<polygon points=\"70,12.679491924311225 90,12.679491924311225 80,30\"><\/polygon>,<polygon points=\"80,30 100,30 90,12.679491924311225\"><\/polygon><\/g><g class=\"building\" id=\"5df7-9422\"><polygon points=\"120,30 140,30 130,47.32050807568878\"><\/polygon>,<polygon points=\"130,47.32050807568878 150,47.32050807568878 140,30\"><\/polygon>,<polygon points=\"140,30 160,30 150,47.32050807568878\"><\/polygon>,<polygon points=\"120,30 140,30 130,12.679491924311225\"><\/polygon>,<polygon points=\"130,12.679491924311225 150,12.679491924311225 140,30\"><\/polygon>,<polygon points=\"140,30 160,30 150,12.679491924311225\"><\/polygon><\/g><g class=\"building\" id=\"289c-78c2\"><polygon points=\"150,47.32050807568878 170,47.32050807568878 160,64.64101615137756\"><\/polygon>,<polygon points=\"160,64.64101615137756 180,64.64101615137756 170,47.32050807568878\"><\/polygon>,<polygon points=\"170,47.32050807568878 190,47.32050807568878 180,64.64101615137756\"><\/polygon>,<polygon points=\"150,47.32050807568878 170,47.32050807568878 160,30\"><\/polygon>,<polygon points=\"160,30 180,30 170,47.32050807568878\"><\/polygon>,<polygon points=\"170,47.32050807568878 190,47.32050807568878 180,30\"><\/polygon><\/g><g class=\"building\" id=\"72af-4b78\"><polygon points=\"180,99.2820323027551 200,99.2820323027551 190,116.60254037844388\"><\/polygon>,<polygon points=\"190,116.60254037844388 210,116.60254037844388 200,99.2820323027551\"><\/polygon>,<polygon points=\"200,99.2820323027551 220,99.2820323027551 210,116.60254037844388\"><\/polygon>,<polygon points=\"180,99.2820323027551 200,99.2820323027551 190,81.96152422706632\"><\/polygon>,<polygon points=\"190,81.96152422706632 210,81.96152422706632 200,99.2820323027551\"><\/polygon>,<polygon points=\"200,99.2820323027551 220,99.2820323027551 210,81.96152422706632\"><\/polygon><\/g><g class=\"building\" id=\"69e1-c0a4\"><polygon points=\"180,133.92304845413264 200,133.92304845413264 190,151.24355652982143\"><\/polygon>,<polygon points=\"190,151.24355652982143 210,151.24355652982143 200,133.92304845413264\"><\/polygon>,<polygon points=\"200,133.92304845413264 220,133.92304845413264 210,151.24355652982143\"><\/polygon>,<polygon points=\"180,133.92304845413264 200,133.92304845413264 190,116.60254037844388\"><\/polygon>,<polygon points=\"190,116.60254037844388 210,116.60254037844388 200,133.92304845413264\"><\/polygon>,<polygon points=\"200,133.92304845413264 220,133.92304845413264 210,116.60254037844388\"><\/polygon><\/g><g class=\"building\" id=\"f32c-c6ea\"><polygon points=\"120,203.20508075688775 140,203.20508075688775 130,220.52558883257652\"><\/polygon>,<polygon points=\"130,220.52558883257652 150,220.52558883257652 140,203.20508075688775\"><\/polygon>,<polygon points=\"140,203.20508075688775 160,203.20508075688775 150,220.52558883257652\"><\/polygon>,<polygon points=\"120,203.20508075688775 140,203.20508075688775 130,185.88457268119896\"><\/polygon>,<polygon points=\"130,185.88457268119896 150,185.88457268119896 140,203.20508075688775\"><\/polygon>,<polygon points=\"140,203.20508075688775 160,203.20508075688775 150,185.88457268119896\"><\/polygon><\/g><g class=\"building\" id=\"3032-da07\"><polygon points=\"60,203.20508075688775 80,203.20508075688775 70,220.52558883257652\"><\/polygon>,<polygon points=\"70,220.52558883257652 90,220.52558883257652 80,203.20508075688775\"><\/polygon>,<polygon points=\"80,203.20508075688775 100,203.20508075688775 90,220.52558883257652\"><\/polygon>,<polygon points=\"60,203.20508075688775 80,203.20508075688775 70,185.88457268119896\"><\/polygon>,<polygon points=\"70,185.88457268119896 90,185.88457268119896 80,203.20508075688775\"><\/polygon>,<polygon points=\"80,203.20508075688775 100,203.20508075688775 90,185.88457268119896\"><\/polygon><\/g><g class=\"building\" id=\"4e2a-da82\"><polygon points=\"30,185.88457268119896 50,185.88457268119896 40,203.20508075688775\"><\/polygon>,<polygon points=\"40,203.20508075688775 60,203.20508075688775 50,185.88457268119896\"><\/polygon>,<polygon points=\"50,185.88457268119896 70,185.88457268119896 60,203.20508075688775\"><\/polygon>,<polygon points=\"30,185.88457268119896 50,185.88457268119896 40,168.5640646055102\"><\/polygon>,<polygon points=\"40,168.5640646055102 60,168.5640646055102 50,185.88457268119896\"><\/polygon>,<polygon points=\"50,185.88457268119896 70,185.88457268119896 60,168.5640646055102\"><\/polygon><\/g><g class=\"building\" id=\"d108-9f6d\"><polygon points=\"0,133.92304845413264 20,133.92304845413264 10,151.24355652982143\"><\/polygon>,<polygon points=\"10,151.24355652982143 30,151.24355652982143 20,133.92304845413264\"><\/polygon>,<polygon points=\"20,133.92304845413264 40,133.92304845413264 30,151.24355652982143\"><\/polygon>,<polygon points=\"0,133.92304845413264 20,133.92304845413264 10,116.60254037844388\"><\/polygon>,<polygon points=\"10,116.60254037844388 30,116.60254037844388 20,133.92304845413264\"><\/polygon>,<polygon points=\"20,133.92304845413264 40,133.92304845413264 30,116.60254037844388\"><\/polygon><\/g><g class=\"building\" id=\"6ba5-ee0d\"><polygon points=\"0,99.2820323027551 20,99.2820323027551 10,116.60254037844388\"><\/polygon>,<polygon points=\"10,116.60254037844388 30,116.60254037844388 20,99.2820323027551\"><\/polygon>,<polygon points=\"20,99.2820323027551 40,99.2820323027551 30,116.60254037844388\"><\/polygon>,<polygon points=\"0,99.2820323027551 20,99.2820323027551 10,81.96152422706632\"><\/polygon>,<polygon points=\"10,81.96152422706632 30,81.96152422706632 20,99.2820323027551\"><\/polygon>,<polygon points=\"20,99.2820323027551 40,99.2820323027551 30,81.96152422706632\"><\/polygon><\/g><g class=\"building\" id=\"700f-f81d\"><polygon points=\"30,47.32050807568878 50,47.32050807568878 40,64.64101615137756\"><\/polygon>,<polygon points=\"40,64.64101615137756 60,64.64101615137756 50,47.32050807568878\"><\/polygon>,<polygon points=\"50,47.32050807568878 70,47.32050807568878 60,64.64101615137756\"><\/polygon>,<polygon points=\"30,47.32050807568878 50,47.32050807568878 40,30\"><\/polygon>,<polygon points=\"40,30 60,30 50,47.32050807568878\"><\/polygon>,<polygon points=\"50,47.32050807568878 70,47.32050807568878 60,30\"><\/polygon><\/g><g class=\"building\" id=\"59af-f3d8\"><polygon points=\"150,185.88457268119896 170,185.88457268119896 160,203.20508075688775\"><\/polygon>,<polygon points=\"160,203.20508075688775 180,203.20508075688775 170,185.88457268119896\"><\/polygon>,<polygon points=\"170,185.88457268119896 190,185.88457268119896 180,203.20508075688775\"><\/polygon>,<polygon points=\"150,185.88457268119896 170,185.88457268119896 160,168.5640646055102\"><\/polygon>,<polygon points=\"160,168.5640646055102 180,168.5640646055102 170,185.88457268119896\"><\/polygon>,<polygon points=\"170,185.88457268119896 190,185.88457268119896 180,168.5640646055102\"><\/polygon><\/g><\/g><\/svg>",
      "prelRoad": [
        
      ],
      "roadsSVG": [
        "<circle cx=\"220\" cy=\"99.2820323027551\" r=\"2\" \/> <circle cx=\"320\" cy=\"99.2820323027551\" r=\"2\" \/><line x1=\"220\" y1=\"99.2820323027551\" x2=\"320\" y2=\"99.2820323027551\" \/>",
        "<circle cx=\"320\" cy=\"99.2820323027551\" r=\"2\" \/> <circle cx=\"370\" cy=\"185.88457268119896\" r=\"2\" \/><line x1=\"320\" y1=\"99.2820323027551\" x2=\"370\" y2=\"185.88457268119896\" \/>",
        "<circle cx=\"370\" cy=\"185.88457268119896\" r=\"2\" \/> <circle cx=\"320\" cy=\"272.48711305964287\" r=\"2\" \/><line x1=\"370\" y1=\"185.88457268119896\" x2=\"320\" y2=\"272.48711305964287\" \/>",
        "<circle cx=\"320\" cy=\"272.48711305964287\" r=\"2\" \/> <circle cx=\"220\" cy=\"272.48711305964287\" r=\"2\" \/><line x1=\"320\" y1=\"272.48711305964287\" x2=\"220\" y2=\"272.48711305964287\" \/>",
        "<circle cx=\"220\" cy=\"272.48711305964287\" r=\"2\" \/> <circle cx=\"170\" cy=\"185.88457268119896\" r=\"2\" \/><line x1=\"220\" y1=\"272.48711305964287\" x2=\"170\" y2=\"185.88457268119896\" \/>",
        "<circle cx=\"170\" cy=\"185.88457268119896\" r=\"2\" \/> <circle cx=\"220\" cy=\"99.2820323027551\" r=\"2\" \/><line x1=\"170\" y1=\"185.88457268119896\" x2=\"220\" y2=\"99.2820323027551\" \/>"
      ]
    },
    {
      "id": "4091-f401-d1ac",
      "fields": [
        {
          "id": "9acc-df61",
          "type": "tr\u00e4",
          "array": [
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "32-5",
              "_pos": {
                "_x": 31,
                "_y": 4,
                "x_ny": 32,
                "y_ny": 5
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "33-4",
              "_pos": {
                "_x": 32,
                "_y": 4,
                "x_ny": 33,
                "y_ny": 4
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "34-5",
              "_pos": {
                "_x": 33,
                "_y": 4,
                "x_ny": 34,
                "y_ny": 5
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "35-4",
              "_pos": {
                "_x": 34,
                "_y": 4,
                "x_ny": 35,
                "y_ny": 4
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "35-6",
              "_pos": {
                "_x": 34,
                "_y": 5,
                "x_ny": 35,
                "y_ny": 6
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "36-5",
              "_pos": {
                "_x": 35,
                "_y": 5,
                "x_ny": 36,
                "y_ny": 5.5
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "36-7",
              "_pos": {
                "_x": 35,
                "_y": 6,
                "x_ny": 36,
                "y_ny": 7
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "37-6",
              "_pos": {
                "_x": 36,
                "_y": 6,
                "x_ny": 37,
                "y_ny": 6
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "37-8",
              "_pos": {
                "_x": 36,
                "_y": 7,
                "x_ny": 37,
                "y_ny": 8
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "35-6",
              "_pos": {
                "_x": 34,
                "_y": 6,
                "x_ny": 35,
                "y_ny": 6
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "34-7",
              "_pos": {
                "_x": 33,
                "_y": 6,
                "x_ny": 34,
                "y_ny": 7
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "34-5",
              "_pos": {
                "_x": 33,
                "_y": 5,
                "x_ny": 34,
                "y_ny": 5
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "33-6",
              "_pos": {
                "_x": 32,
                "_y": 5,
                "x_ny": 33,
                "y_ny": 6
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "35-8",
              "_pos": {
                "_x": 34,
                "_y": 7,
                "x_ny": 35,
                "y_ny": 8
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "36-7",
              "_pos": {
                "_x": 35,
                "_y": 7,
                "x_ny": 36,
                "y_ny": 7
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "index": "36-9",
              "_pos": {
                "_x": 35,
                "_y": 8,
                "x_ny": 36,
                "y_ny": 9
              },
              "flip": false,
              "type": "tr\u00e4"
            }
          ],
          "color": "#1abc9c",
          "number": {
            "_pos": {
              "_x": 35,
              "_y": 5,
              "x_ny": 36,
              "y_ny": 5.5
            },
            "nr": 11
          },
          "svg": "<polygon points=\"320,99.2820323027551 340,99.2820323027551 330,116.60254037844388\"\/>,<polygon points=\"330,116.60254037844388 350,116.60254037844388 340,99.2820323027551\"\/>,<polygon points=\"340,99.2820323027551 360,99.2820323027551 350,116.60254037844388\"\/>,<polygon points=\"350,116.60254037844388 370,116.60254037844388 360,99.2820323027551\"\/>,<polygon points=\"350,116.60254037844388 370,116.60254037844388 360,133.92304845413264\"\/>,<polygon points=\"360,133.92304845413264 380,133.92304845413264 370,116.60254037844388\"\/>,<polygon points=\"360,133.92304845413264 380,133.92304845413264 370,151.24355652982143\"\/>,<polygon points=\"370,151.24355652982143 390,151.24355652982143 380,133.92304845413264\"\/>,<polygon points=\"370,151.24355652982143 390,151.24355652982143 380,168.5640646055102\"\/>,<polygon points=\"350,151.24355652982143 370,151.24355652982143 360,133.92304845413264\"\/>,<polygon points=\"340,133.92304845413264 360,133.92304845413264 350,151.24355652982143\"\/>,<polygon points=\"340,133.92304845413264 360,133.92304845413264 350,116.60254037844388\"\/>,<polygon points=\"330,116.60254037844388 350,116.60254037844388 340,133.92304845413264\"\/>,<polygon points=\"350,151.24355652982143 370,151.24355652982143 360,168.5640646055102\"\/>,<polygon points=\"360,168.5640646055102 380,168.5640646055102 370,151.24355652982143\"\/>,<polygon points=\"360,168.5640646055102 380,168.5640646055102 370,185.88457268119896\"\/>",
          "pos": {
            "x": 370,
            "y": 125.26279441629
          },
          "occupiedBy": "none"
        },
        {
          "id": "d18f-b64b",
          "type": "djur",
          "array": [
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "37-6",
              "_pos": {
                "_x": 36,
                "_y": 5,
                "x_ny": 37,
                "y_ny": 6
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "38-5",
              "_pos": {
                "_x": 37,
                "_y": 5,
                "x_ny": 38,
                "y_ny": 5
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "38-7",
              "_pos": {
                "_x": 37,
                "_y": 6,
                "x_ny": 38,
                "y_ny": 7
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "39-6",
              "_pos": {
                "_x": 38,
                "_y": 6,
                "x_ny": 39,
                "y_ny": 6
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "40-7",
              "_pos": {
                "_x": 39,
                "_y": 6,
                "x_ny": 40,
                "y_ny": 6.5
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "40-5",
              "_pos": {
                "_x": 39,
                "_y": 5,
                "x_ny": 40,
                "y_ny": 5
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "41-6",
              "_pos": {
                "_x": 40,
                "_y": 5,
                "x_ny": 41,
                "y_ny": 6
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "42-5",
              "_pos": {
                "_x": 41,
                "_y": 5,
                "x_ny": 42,
                "y_ny": 5
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "43-6",
              "_pos": {
                "_x": 42,
                "_y": 5,
                "x_ny": 43,
                "y_ny": 6
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "43-4",
              "_pos": {
                "_x": 42,
                "_y": 4,
                "x_ny": 43,
                "y_ny": 4
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "44-5",
              "_pos": {
                "_x": 43,
                "_y": 4,
                "x_ny": 44,
                "y_ny": 5
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "44-3",
              "_pos": {
                "_x": 43,
                "_y": 3,
                "x_ny": 44,
                "y_ny": 3
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "45-4",
              "_pos": {
                "_x": 44,
                "_y": 3,
                "x_ny": 45,
                "y_ny": 4
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "46-3",
              "_pos": {
                "_x": 45,
                "_y": 3,
                "x_ny": 46,
                "y_ny": 3
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "46-5",
              "_pos": {
                "_x": 45,
                "_y": 4,
                "x_ny": 46,
                "y_ny": 5
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "45-4",
              "_pos": {
                "_x": 44,
                "_y": 4,
                "x_ny": 45,
                "y_ny": 4
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "47-4",
              "_pos": {
                "_x": 46,
                "_y": 4,
                "x_ny": 47,
                "y_ny": 4
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "47-6",
              "_pos": {
                "_x": 46,
                "_y": 5,
                "x_ny": 47,
                "y_ny": 6
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "46-5",
              "_pos": {
                "_x": 45,
                "_y": 5,
                "x_ny": 46,
                "y_ny": 5
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "45-6",
              "_pos": {
                "_x": 44,
                "_y": 5,
                "x_ny": 45,
                "y_ny": 6
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "44-5",
              "_pos": {
                "_x": 43,
                "_y": 5,
                "x_ny": 44,
                "y_ny": 5
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "42-7",
              "_pos": {
                "_x": 41,
                "_y": 6,
                "x_ny": 42,
                "y_ny": 7
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "41-6",
              "_pos": {
                "_x": 40,
                "_y": 6,
                "x_ny": 41,
                "y_ny": 6
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "41-8",
              "_pos": {
                "_x": 40,
                "_y": 7,
                "x_ny": 41,
                "y_ny": 8
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "40-7",
              "_pos": {
                "_x": 39,
                "_y": 7,
                "x_ny": 40,
                "y_ny": 7
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "40-9",
              "_pos": {
                "_x": 39,
                "_y": 8,
                "x_ny": 40,
                "y_ny": 9
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "39-8",
              "_pos": {
                "_x": 38,
                "_y": 8,
                "x_ny": 39,
                "y_ny": 8
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "38-9",
              "_pos": {
                "_x": 37,
                "_y": 8,
                "x_ny": 38,
                "y_ny": 9
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "37-8",
              "_pos": {
                "_x": 36,
                "_y": 8,
                "x_ny": 37,
                "y_ny": 8
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "38-7",
              "_pos": {
                "_x": 37,
                "_y": 7,
                "x_ny": 38,
                "y_ny": 7
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "index": "39-8",
              "_pos": {
                "_x": 38,
                "_y": 7,
                "x_ny": 39,
                "y_ny": 8
              },
              "flip": false,
              "type": "djur"
            }
          ],
          "color": "#75B96B",
          "number": {
            "_pos": {
              "_x": 39,
              "_y": 6,
              "x_ny": 40,
              "y_ny": 6.5
            },
            "nr": 5
          },
          "svg": "<polygon points=\"370,116.60254037844388 390,116.60254037844388 380,133.92304845413264\"\/>,<polygon points=\"380,133.92304845413264 400,133.92304845413264 390,116.60254037844388\"\/>,<polygon points=\"380,133.92304845413264 400,133.92304845413264 390,151.24355652982143\"\/>,<polygon points=\"390,151.24355652982143 410,151.24355652982143 400,133.92304845413264\"\/>,<polygon points=\"400,133.92304845413264 420,133.92304845413264 410,151.24355652982143\"\/>,<polygon points=\"400,133.92304845413264 420,133.92304845413264 410,116.60254037844388\"\/>,<polygon points=\"410,116.60254037844388 430,116.60254037844388 420,133.92304845413264\"\/>,<polygon points=\"420,133.92304845413264 440,133.92304845413264 430,116.60254037844388\"\/>,<polygon points=\"430,116.60254037844388 450,116.60254037844388 440,133.92304845413264\"\/>,<polygon points=\"430,116.60254037844388 450,116.60254037844388 440,99.2820323027551\"\/>,<polygon points=\"440,99.2820323027551 460,99.2820323027551 450,116.60254037844388\"\/>,<polygon points=\"440,99.2820323027551 460,99.2820323027551 450,81.96152422706632\"\/>,<polygon points=\"450,81.96152422706632 470,81.96152422706632 460,99.2820323027551\"\/>,<polygon points=\"460,99.2820323027551 480,99.2820323027551 470,81.96152422706632\"\/>,<polygon points=\"460,99.2820323027551 480,99.2820323027551 470,116.60254037844388\"\/>,<polygon points=\"450,116.60254037844388 470,116.60254037844388 460,99.2820323027551\"\/>,<polygon points=\"470,116.60254037844388 490,116.60254037844388 480,99.2820323027551\"\/>,<polygon points=\"470,116.60254037844388 490,116.60254037844388 480,133.92304845413264\"\/>,<polygon points=\"460,133.92304845413264 480,133.92304845413264 470,116.60254037844388\"\/>,<polygon points=\"450,116.60254037844388 470,116.60254037844388 460,133.92304845413264\"\/>,<polygon points=\"440,133.92304845413264 460,133.92304845413264 450,116.60254037844388\"\/>,<polygon points=\"420,133.92304845413264 440,133.92304845413264 430,151.24355652982143\"\/>,<polygon points=\"410,151.24355652982143 430,151.24355652982143 420,133.92304845413264\"\/>,<polygon points=\"410,151.24355652982143 430,151.24355652982143 420,168.5640646055102\"\/>,<polygon points=\"400,168.5640646055102 420,168.5640646055102 410,151.24355652982143\"\/>,<polygon points=\"400,168.5640646055102 420,168.5640646055102 410,185.88457268119896\"\/>,<polygon points=\"390,185.88457268119896 410,185.88457268119896 400,168.5640646055102\"\/>,<polygon points=\"380,168.5640646055102 400,168.5640646055102 390,185.88457268119896\"\/>,<polygon points=\"370,185.88457268119896 390,185.88457268119896 380,168.5640646055102\"\/>,<polygon points=\"380,168.5640646055102 400,168.5640646055102 390,151.24355652982143\"\/>,<polygon points=\"390,151.24355652982143 410,151.24355652982143 400,168.5640646055102\"\/>",
          "pos": {
            "x": 410,
            "y": 142.58330249198
          },
          "occupiedBy": "none"
        },
        {
          "id": "d26b-91a3",
          "type": "s\u00e4d",
          "array": [
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "41-8",
              "_pos": {
                "_x": 40,
                "_y": 8,
                "x_ny": 41,
                "y_ny": 8
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "42-9",
              "_pos": {
                "_x": 41,
                "_y": 8,
                "x_ny": 42,
                "y_ny": 9
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "43-8",
              "_pos": {
                "_x": 42,
                "_y": 8,
                "x_ny": 43,
                "y_ny": 8
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "44-9",
              "_pos": {
                "_x": 43,
                "_y": 8,
                "x_ny": 44,
                "y_ny": 9
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "45-8",
              "_pos": {
                "_x": 44,
                "_y": 8,
                "x_ny": 45,
                "y_ny": 8
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "46-9",
              "_pos": {
                "_x": 45,
                "_y": 8,
                "x_ny": 46,
                "y_ny": 9
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "46-7",
              "_pos": {
                "_x": 45,
                "_y": 7,
                "x_ny": 46,
                "y_ny": 7
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "47-8",
              "_pos": {
                "_x": 46,
                "_y": 7,
                "x_ny": 47,
                "y_ny": 8
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "47-6",
              "_pos": {
                "_x": 46,
                "_y": 6,
                "x_ny": 47,
                "y_ny": 6
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "46-7",
              "_pos": {
                "_x": 45,
                "_y": 6,
                "x_ny": 46,
                "y_ny": 7
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "45-6",
              "_pos": {
                "_x": 44,
                "_y": 6,
                "x_ny": 45,
                "y_ny": 6
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "44-7",
              "_pos": {
                "_x": 43,
                "_y": 6,
                "x_ny": 44,
                "y_ny": 7
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "43-6",
              "_pos": {
                "_x": 42,
                "_y": 6,
                "x_ny": 43,
                "y_ny": 6
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "43-8",
              "_pos": {
                "_x": 42,
                "_y": 7,
                "x_ny": 43,
                "y_ny": 8
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "42-7",
              "_pos": {
                "_x": 41,
                "_y": 7,
                "x_ny": 42,
                "y_ny": 7
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "44-7",
              "_pos": {
                "_x": 43,
                "_y": 7,
                "x_ny": 44,
                "y_ny": 7
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "index": "45-8",
              "_pos": {
                "_x": 44,
                "_y": 7,
                "x_ny": 45,
                "y_ny": 7.5
              },
              "flip": false,
              "type": "s\u00e4d"
            }
          ],
          "color": "#f1c40f",
          "number": {
            "_pos": {
              "_x": 44,
              "_y": 7,
              "x_ny": 45,
              "y_ny": 7.5
            },
            "nr": 10
          },
          "svg": "<polygon points=\"410,185.88457268119896 430,185.88457268119896 420,168.5640646055102\"\/>,<polygon points=\"420,168.5640646055102 440,168.5640646055102 430,185.88457268119896\"\/>,<polygon points=\"430,185.88457268119896 450,185.88457268119896 440,168.5640646055102\"\/>,<polygon points=\"440,168.5640646055102 460,168.5640646055102 450,185.88457268119896\"\/>,<polygon points=\"450,185.88457268119896 470,185.88457268119896 460,168.5640646055102\"\/>,<polygon points=\"460,168.5640646055102 480,168.5640646055102 470,185.88457268119896\"\/>,<polygon points=\"460,168.5640646055102 480,168.5640646055102 470,151.24355652982143\"\/>,<polygon points=\"470,151.24355652982143 490,151.24355652982143 480,168.5640646055102\"\/>,<polygon points=\"470,151.24355652982143 490,151.24355652982143 480,133.92304845413264\"\/>,<polygon points=\"460,133.92304845413264 480,133.92304845413264 470,151.24355652982143\"\/>,<polygon points=\"450,151.24355652982143 470,151.24355652982143 460,133.92304845413264\"\/>,<polygon points=\"440,133.92304845413264 460,133.92304845413264 450,151.24355652982143\"\/>,<polygon points=\"430,151.24355652982143 450,151.24355652982143 440,133.92304845413264\"\/>,<polygon points=\"430,151.24355652982143 450,151.24355652982143 440,168.5640646055102\"\/>,<polygon points=\"420,168.5640646055102 440,168.5640646055102 430,151.24355652982143\"\/>,<polygon points=\"440,168.5640646055102 460,168.5640646055102 450,151.24355652982143\"\/>,<polygon points=\"450,151.24355652982143 470,151.24355652982143 460,168.5640646055102\"\/>",
          "pos": {
            "x": 460,
            "y": 159.90381056767
          },
          "occupiedBy": "none"
        },
        {
          "id": "ee31-f6c5",
          "type": "djur",
          "array": [
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "48-5",
              "_pos": {
                "_x": 47,
                "_y": 5,
                "x_ny": 48,
                "y_ny": 5
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "48-7",
              "_pos": {
                "_x": 47,
                "_y": 6,
                "x_ny": 48,
                "y_ny": 7
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "49-6",
              "_pos": {
                "_x": 48,
                "_y": 6,
                "x_ny": 49,
                "y_ny": 6
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "49-8",
              "_pos": {
                "_x": 48,
                "_y": 7,
                "x_ny": 49,
                "y_ny": 8
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "48-7",
              "_pos": {
                "_x": 47,
                "_y": 7,
                "x_ny": 48,
                "y_ny": 7
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "48-9",
              "_pos": {
                "_x": 47,
                "_y": 8,
                "x_ny": 48,
                "y_ny": 9
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "47-10",
              "_pos": {
                "_x": 46,
                "_y": 9,
                "x_ny": 47,
                "y_ny": 10
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "48-9",
              "_pos": {
                "_x": 47,
                "_y": 9,
                "x_ny": 48,
                "y_ny": 9
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "47-8",
              "_pos": {
                "_x": 46,
                "_y": 8,
                "x_ny": 47,
                "y_ny": 8
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "49-8",
              "_pos": {
                "_x": 48,
                "_y": 8,
                "x_ny": 49,
                "y_ny": 8
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "49-10",
              "_pos": {
                "_x": 48,
                "_y": 9,
                "x_ny": 49,
                "y_ny": 9.5
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "48-11",
              "_pos": {
                "_x": 47,
                "_y": 10,
                "x_ny": 48,
                "y_ny": 11
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "49-10",
              "_pos": {
                "_x": 48,
                "_y": 10,
                "x_ny": 49,
                "y_ny": 10
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "50-11",
              "_pos": {
                "_x": 49,
                "_y": 10,
                "x_ny": 50,
                "y_ny": 11
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "index": "50-9",
              "_pos": {
                "_x": 49,
                "_y": 9,
                "x_ny": 50,
                "y_ny": 9
              },
              "flip": true,
              "type": "djur"
            }
          ],
          "color": "#75B96B",
          "number": {
            "_pos": {
              "_x": 48,
              "_y": 9,
              "x_ny": 49,
              "y_ny": 9.5
            },
            "nr": 2
          },
          "svg": "<polygon points=\"480,133.92304845413264 500,133.92304845413264 490,116.60254037844388\"\/>,<polygon points=\"480,133.92304845413264 500,133.92304845413264 490,151.24355652982143\"\/>,<polygon points=\"490,151.24355652982143 510,151.24355652982143 500,133.92304845413264\"\/>,<polygon points=\"490,151.24355652982143 510,151.24355652982143 500,168.5640646055102\"\/>,<polygon points=\"480,168.5640646055102 500,168.5640646055102 490,151.24355652982143\"\/>,<polygon points=\"480,168.5640646055102 500,168.5640646055102 490,185.88457268119896\"\/>,<polygon points=\"470,185.88457268119896 490,185.88457268119896 480,203.20508075688775\"\/>,<polygon points=\"480,203.20508075688775 500,203.20508075688775 490,185.88457268119896\"\/>,<polygon points=\"470,185.88457268119896 490,185.88457268119896 480,168.5640646055102\"\/>,<polygon points=\"490,185.88457268119896 510,185.88457268119896 500,168.5640646055102\"\/>,<polygon points=\"490,185.88457268119896 510,185.88457268119896 500,203.20508075688775\"\/>,<polygon points=\"480,203.20508075688775 500,203.20508075688775 490,220.52558883257652\"\/>,<polygon points=\"490,220.52558883257652 510,220.52558883257652 500,203.20508075688775\"\/>,<polygon points=\"500,203.20508075688775 520,203.20508075688775 510,220.52558883257652\"\/>,<polygon points=\"500,203.20508075688775 520,203.20508075688775 510,185.88457268119896\"\/>",
          "pos": {
            "x": 500,
            "y": 194.54482671904
          },
          "occupiedBy": "none"
        },
        {
          "id": "46a8-6cd0",
          "type": "tr\u00e4",
          "array": [
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "49-12",
              "_pos": {
                "_x": 48,
                "_y": 11,
                "x_ny": 49,
                "y_ny": 12
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "50-11",
              "_pos": {
                "_x": 49,
                "_y": 11,
                "x_ny": 50,
                "y_ny": 11
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "52-13",
              "_pos": {
                "_x": 51,
                "_y": 12,
                "x_ny": 52,
                "y_ny": 13
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "52-13",
              "_pos": {
                "_x": 51,
                "_y": 13,
                "x_ny": 52,
                "y_ny": 13
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "53-14",
              "_pos": {
                "_x": 52,
                "_y": 13,
                "x_ny": 53,
                "y_ny": 14
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "51-14",
              "_pos": {
                "_x": 50,
                "_y": 13,
                "x_ny": 51,
                "y_ny": 14
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "51-12",
              "_pos": {
                "_x": 50,
                "_y": 12,
                "x_ny": 51,
                "y_ny": 12
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "50-13",
              "_pos": {
                "_x": 49,
                "_y": 12,
                "x_ny": 50,
                "y_ny": 13
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "51-12",
              "_pos": {
                "_x": 50,
                "_y": 11,
                "x_ny": 51,
                "y_ny": 12
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "51-10",
              "_pos": {
                "_x": 50,
                "_y": 10,
                "x_ny": 51,
                "y_ny": 10
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "52-11",
              "_pos": {
                "_x": 51,
                "_y": 11,
                "x_ny": 52,
                "y_ny": 11
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "53-12",
              "_pos": {
                "_x": 52,
                "_y": 12,
                "x_ny": 53,
                "y_ny": 12
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "54-13",
              "_pos": {
                "_x": 53,
                "_y": 13,
                "x_ny": 54,
                "y_ny": 13
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "55-14",
              "_pos": {
                "_x": 54,
                "_y": 13,
                "x_ny": 55,
                "y_ny": 14
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "56-15",
              "_pos": {
                "_x": 55,
                "_y": 14,
                "x_ny": 56,
                "y_ny": 15
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "55-14",
              "_pos": {
                "_x": 54,
                "_y": 14,
                "x_ny": 55,
                "y_ny": 14
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "55-16",
              "_pos": {
                "_x": 54,
                "_y": 15,
                "x_ny": 55,
                "y_ny": 16
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "54-15",
              "_pos": {
                "_x": 53,
                "_y": 15,
                "x_ny": 54,
                "y_ny": 15
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "53-16",
              "_pos": {
                "_x": 52,
                "_y": 15,
                "x_ny": 53,
                "y_ny": 16
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "53-14",
              "_pos": {
                "_x": 52,
                "_y": 14,
                "x_ny": 53,
                "y_ny": 14
              },
              "flip": true,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "54-15",
              "_pos": {
                "_x": 53,
                "_y": 14,
                "x_ny": 54,
                "y_ny": 14.5
              },
              "flip": false,
              "type": "tr\u00e4"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "index": "52-15",
              "_pos": {
                "_x": 51,
                "_y": 14,
                "x_ny": 52,
                "y_ny": 15
              },
              "flip": false,
              "type": "tr\u00e4"
            }
          ],
          "color": "#1abc9c",
          "number": {
            "_pos": {
              "_x": 53,
              "_y": 14,
              "x_ny": 54,
              "y_ny": 14.5
            },
            "nr": 4
          },
          "svg": "<polygon points=\"490,220.52558883257652 510,220.52558883257652 500,237.84609690826528\"\/>,<polygon points=\"500,237.84609690826528 520,237.84609690826528 510,220.52558883257652\"\/>,<polygon points=\"520,237.84609690826528 540,237.84609690826528 530,255.16660498395407\"\/>,<polygon points=\"520,272.48711305964287 540,272.48711305964287 530,255.16660498395407\"\/>,<polygon points=\"530,255.16660498395407 550,255.16660498395407 540,272.48711305964287\"\/>,<polygon points=\"510,255.16660498395407 530,255.16660498395407 520,272.48711305964287\"\/>,<polygon points=\"510,255.16660498395407 530,255.16660498395407 520,237.84609690826528\"\/>,<polygon points=\"500,237.84609690826528 520,237.84609690826528 510,255.16660498395407\"\/>,<polygon points=\"510,220.52558883257652 530,220.52558883257652 520,237.84609690826528\"\/>,<polygon points=\"510,220.52558883257652 530,220.52558883257652 520,203.20508075688775\"\/>,<polygon points=\"520,237.84609690826528 540,237.84609690826528 530,220.52558883257652\"\/>,<polygon points=\"530,255.16660498395407 550,255.16660498395407 540,237.84609690826528\"\/>,<polygon points=\"540,272.48711305964287 560,272.48711305964287 550,255.16660498395407\"\/>,<polygon points=\"550,255.16660498395407 570,255.16660498395407 560,272.48711305964287\"\/>,<polygon points=\"560,272.48711305964287 580,272.48711305964287 570,289.8076211353316\"\/>,<polygon points=\"550,289.8076211353316 570,289.8076211353316 560,272.48711305964287\"\/>,<polygon points=\"550,289.8076211353316 570,289.8076211353316 560,307.1281292110204\"\/>,<polygon points=\"540,307.1281292110204 560,307.1281292110204 550,289.8076211353316\"\/>,<polygon points=\"530,289.8076211353316 550,289.8076211353316 540,307.1281292110204\"\/>,<polygon points=\"530,289.8076211353316 550,289.8076211353316 540,272.48711305964287\"\/>,<polygon points=\"540,272.48711305964287 560,272.48711305964287 550,289.8076211353316\"\/>,<polygon points=\"520,272.48711305964287 540,272.48711305964287 530,289.8076211353316\"\/>",
          "pos": {
            "x": 550,
            "y": 281.14736709749
          },
          "occupiedBy": "none"
        },
        {
          "id": "bc8b-23fa",
          "type": "olja",
          "array": [
            {
              "refid": "bc8b-23fa",
              "bp_id": "4091-f401-d1ac",
              "index": "52-15",
              "_pos": {
                "_x": 51,
                "_y": 15,
                "x_ny": 52,
                "y_ny": 15
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "bc8b-23fa",
              "bp_id": "4091-f401-d1ac",
              "index": "51-16",
              "_pos": {
                "_x": 50,
                "_y": 15,
                "x_ny": 51,
                "y_ny": 16
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "bc8b-23fa",
              "bp_id": "4091-f401-d1ac",
              "index": "51-14",
              "_pos": {
                "_x": 50,
                "_y": 14,
                "x_ny": 51,
                "y_ny": 14
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "bc8b-23fa",
              "bp_id": "4091-f401-d1ac",
              "index": "50-15",
              "_pos": {
                "_x": 49,
                "_y": 14,
                "x_ny": 50,
                "y_ny": 15
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "bc8b-23fa",
              "bp_id": "4091-f401-d1ac",
              "index": "50-13",
              "_pos": {
                "_x": 49,
                "_y": 13,
                "x_ny": 50,
                "y_ny": 13
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "bc8b-23fa",
              "bp_id": "4091-f401-d1ac",
              "index": "49-14",
              "_pos": {
                "_x": 48,
                "_y": 13,
                "x_ny": 49,
                "y_ny": 14
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "bc8b-23fa",
              "bp_id": "4091-f401-d1ac",
              "index": "49-12",
              "_pos": {
                "_x": 48,
                "_y": 12,
                "x_ny": 49,
                "y_ny": 12
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "bc8b-23fa",
              "bp_id": "4091-f401-d1ac",
              "index": "48-13",
              "_pos": {
                "_x": 47,
                "_y": 13,
                "x_ny": 48,
                "y_ny": 13
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "bc8b-23fa",
              "bp_id": "4091-f401-d1ac",
              "index": "48-15",
              "_pos": {
                "_x": 47,
                "_y": 14,
                "x_ny": 48,
                "y_ny": 15
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "bc8b-23fa",
              "bp_id": "4091-f401-d1ac",
              "index": "49-14",
              "_pos": {
                "_x": 48,
                "_y": 14,
                "x_ny": 49,
                "y_ny": 14.5
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "bc8b-23fa",
              "bp_id": "4091-f401-d1ac",
              "index": "49-16",
              "_pos": {
                "_x": 48,
                "_y": 15,
                "x_ny": 49,
                "y_ny": 16
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "bc8b-23fa",
              "bp_id": "4091-f401-d1ac",
              "index": "50-15",
              "_pos": {
                "_x": 49,
                "_y": 15,
                "x_ny": 50,
                "y_ny": 15
              },
              "flip": true,
              "type": "olja"
            }
          ],
          "color": "#B697D8",
          "number": {
            "_pos": {
              "_x": 48,
              "_y": 14,
              "x_ny": 49,
              "y_ny": 14.5
            },
            "nr": 2
          },
          "svg": "<polygon points=\"520,307.1281292110204 540,307.1281292110204 530,289.8076211353316\"\/>,<polygon points=\"510,289.8076211353316 530,289.8076211353316 520,307.1281292110204\"\/>,<polygon points=\"510,289.8076211353316 530,289.8076211353316 520,272.48711305964287\"\/>,<polygon points=\"500,272.48711305964287 520,272.48711305964287 510,289.8076211353316\"\/>,<polygon points=\"500,272.48711305964287 520,272.48711305964287 510,255.16660498395407\"\/>,<polygon points=\"490,255.16660498395407 510,255.16660498395407 500,272.48711305964287\"\/>,<polygon points=\"490,255.16660498395407 510,255.16660498395407 500,237.84609690826528\"\/>,<polygon points=\"480,272.48711305964287 500,272.48711305964287 490,255.16660498395407\"\/>,<polygon points=\"480,272.48711305964287 500,272.48711305964287 490,289.8076211353316\"\/>,<polygon points=\"490,289.8076211353316 510,289.8076211353316 500,272.48711305964287\"\/>,<polygon points=\"490,289.8076211353316 510,289.8076211353316 500,307.1281292110204\"\/>,<polygon points=\"500,307.1281292110204 520,307.1281292110204 510,289.8076211353316\"\/>",
          "pos": {
            "x": 500,
            "y": 281.14736709749
          },
          "occupiedBy": "none"
        },
        {
          "id": "0b5d-b3ed",
          "type": "djur",
          "array": [
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "47-14",
              "_pos": {
                "_x": 46,
                "_y": 13,
                "x_ny": 47,
                "y_ny": 14
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "47-12",
              "_pos": {
                "_x": 46,
                "_y": 12,
                "x_ny": 47,
                "y_ny": 12
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "48-13",
              "_pos": {
                "_x": 47,
                "_y": 12,
                "x_ny": 48,
                "y_ny": 13
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "46-13",
              "_pos": {
                "_x": 45,
                "_y": 12,
                "x_ny": 46,
                "y_ny": 13
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "46-11",
              "_pos": {
                "_x": 45,
                "_y": 11,
                "x_ny": 46,
                "y_ny": 11
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "45-12",
              "_pos": {
                "_x": 44,
                "_y": 11,
                "x_ny": 45,
                "y_ny": 11.5
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "44-13",
              "_pos": {
                "_x": 43,
                "_y": 12,
                "x_ny": 44,
                "y_ny": 13
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "44-11",
              "_pos": {
                "_x": 43,
                "_y": 11,
                "x_ny": 44,
                "y_ny": 11
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "45-12",
              "_pos": {
                "_x": 44,
                "_y": 12,
                "x_ny": 45,
                "y_ny": 12
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "43-12",
              "_pos": {
                "_x": 42,
                "_y": 11,
                "x_ny": 43,
                "y_ny": 12
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "42-11",
              "_pos": {
                "_x": 41,
                "_y": 11,
                "x_ny": 42,
                "y_ny": 11
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "41-12",
              "_pos": {
                "_x": 40,
                "_y": 11,
                "x_ny": 41,
                "y_ny": 12
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "41-10",
              "_pos": {
                "_x": 40,
                "_y": 10,
                "x_ny": 41,
                "y_ny": 10
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "40-11",
              "_pos": {
                "_x": 39,
                "_y": 10,
                "x_ny": 40,
                "y_ny": 11
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "39-10",
              "_pos": {
                "_x": 38,
                "_y": 10,
                "x_ny": 39,
                "y_ny": 10
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "42-11",
              "_pos": {
                "_x": 41,
                "_y": 10,
                "x_ny": 42,
                "y_ny": 11
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "42-9",
              "_pos": {
                "_x": 41,
                "_y": 9,
                "x_ny": 42,
                "y_ny": 9
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "43-10",
              "_pos": {
                "_x": 42,
                "_y": 9,
                "x_ny": 43,
                "y_ny": 10
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "44-9",
              "_pos": {
                "_x": 43,
                "_y": 9,
                "x_ny": 44,
                "y_ny": 9
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "45-10",
              "_pos": {
                "_x": 44,
                "_y": 9,
                "x_ny": 45,
                "y_ny": 10
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "46-9",
              "_pos": {
                "_x": 45,
                "_y": 9,
                "x_ny": 46,
                "y_ny": 9
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "46-11",
              "_pos": {
                "_x": 45,
                "_y": 10,
                "x_ny": 46,
                "y_ny": 11
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "47-10",
              "_pos": {
                "_x": 46,
                "_y": 10,
                "x_ny": 47,
                "y_ny": 10
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "47-12",
              "_pos": {
                "_x": 46,
                "_y": 11,
                "x_ny": 47,
                "y_ny": 12
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "48-11",
              "_pos": {
                "_x": 47,
                "_y": 11,
                "x_ny": 48,
                "y_ny": 11
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "45-10",
              "_pos": {
                "_x": 44,
                "_y": 10,
                "x_ny": 45,
                "y_ny": 10
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "44-11",
              "_pos": {
                "_x": 43,
                "_y": 10,
                "x_ny": 44,
                "y_ny": 11
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "43-10",
              "_pos": {
                "_x": 42,
                "_y": 10,
                "x_ny": 43,
                "y_ny": 10
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "40-11",
              "_pos": {
                "_x": 39,
                "_y": 11,
                "x_ny": 40,
                "y_ny": 11
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "40-13",
              "_pos": {
                "_x": 39,
                "_y": 12,
                "x_ny": 40,
                "y_ny": 13
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "39-14",
              "_pos": {
                "_x": 38,
                "_y": 13,
                "x_ny": 39,
                "y_ny": 14
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "index": "38-13",
              "_pos": {
                "_x": 37,
                "_y": 13,
                "x_ny": 38,
                "y_ny": 13
              },
              "flip": true,
              "type": "djur"
            }
          ],
          "color": "#75B96B",
          "number": {
            "_pos": {
              "_x": 44,
              "_y": 11,
              "x_ny": 45,
              "y_ny": 11.5
            },
            "nr": 8
          },
          "svg": "<polygon points=\"470,255.16660498395407 490,255.16660498395407 480,272.48711305964287\"\/>,<polygon points=\"470,255.16660498395407 490,255.16660498395407 480,237.84609690826528\"\/>,<polygon points=\"480,237.84609690826528 500,237.84609690826528 490,255.16660498395407\"\/>,<polygon points=\"460,237.84609690826528 480,237.84609690826528 470,255.16660498395407\"\/>,<polygon points=\"460,237.84609690826528 480,237.84609690826528 470,220.52558883257652\"\/>,<polygon points=\"450,220.52558883257652 470,220.52558883257652 460,237.84609690826528\"\/>,<polygon points=\"440,237.84609690826528 460,237.84609690826528 450,255.16660498395407\"\/>,<polygon points=\"440,237.84609690826528 460,237.84609690826528 450,220.52558883257652\"\/>,<polygon points=\"450,255.16660498395407 470,255.16660498395407 460,237.84609690826528\"\/>,<polygon points=\"430,220.52558883257652 450,220.52558883257652 440,237.84609690826528\"\/>,<polygon points=\"420,237.84609690826528 440,237.84609690826528 430,220.52558883257652\"\/>,<polygon points=\"410,220.52558883257652 430,220.52558883257652 420,237.84609690826528\"\/>,<polygon points=\"410,220.52558883257652 430,220.52558883257652 420,203.20508075688775\"\/>,<polygon points=\"400,203.20508075688775 420,203.20508075688775 410,220.52558883257652\"\/>,<polygon points=\"390,220.52558883257652 410,220.52558883257652 400,203.20508075688775\"\/>,<polygon points=\"420,203.20508075688775 440,203.20508075688775 430,220.52558883257652\"\/>,<polygon points=\"420,203.20508075688775 440,203.20508075688775 430,185.88457268119896\"\/>,<polygon points=\"430,185.88457268119896 450,185.88457268119896 440,203.20508075688775\"\/>,<polygon points=\"440,203.20508075688775 460,203.20508075688775 450,185.88457268119896\"\/>,<polygon points=\"450,185.88457268119896 470,185.88457268119896 460,203.20508075688775\"\/>,<polygon points=\"460,203.20508075688775 480,203.20508075688775 470,185.88457268119896\"\/>,<polygon points=\"460,203.20508075688775 480,203.20508075688775 470,220.52558883257652\"\/>,<polygon points=\"470,220.52558883257652 490,220.52558883257652 480,203.20508075688775\"\/>,<polygon points=\"470,220.52558883257652 490,220.52558883257652 480,237.84609690826528\"\/>,<polygon points=\"480,237.84609690826528 500,237.84609690826528 490,220.52558883257652\"\/>,<polygon points=\"450,220.52558883257652 470,220.52558883257652 460,203.20508075688775\"\/>,<polygon points=\"440,203.20508075688775 460,203.20508075688775 450,220.52558883257652\"\/>,<polygon points=\"430,220.52558883257652 450,220.52558883257652 440,203.20508075688775\"\/>,<polygon points=\"400,237.84609690826528 420,237.84609690826528 410,220.52558883257652\"\/>,<polygon points=\"400,237.84609690826528 420,237.84609690826528 410,255.16660498395407\"\/>,<polygon points=\"390,255.16660498395407 410,255.16660498395407 400,272.48711305964287\"\/>,<polygon points=\"380,272.48711305964287 400,272.48711305964287 390,255.16660498395407\"\/>",
          "pos": {
            "x": 460,
            "y": 229.18584287042
          },
          "occupiedBy": "none"
        },
        {
          "id": "6ad7-2977",
          "type": "sten",
          "array": [
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "37-14",
              "_pos": {
                "_x": 36,
                "_y": 13,
                "x_ny": 37,
                "y_ny": 14
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "37-12",
              "_pos": {
                "_x": 36,
                "_y": 12,
                "x_ny": 37,
                "y_ny": 12
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "36-13",
              "_pos": {
                "_x": 35,
                "_y": 12,
                "x_ny": 36,
                "y_ny": 12.5
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "35-12",
              "_pos": {
                "_x": 34,
                "_y": 12,
                "x_ny": 35,
                "y_ny": 12
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "35-14",
              "_pos": {
                "_x": 34,
                "_y": 13,
                "x_ny": 35,
                "y_ny": 14
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "34-13",
              "_pos": {
                "_x": 33,
                "_y": 12,
                "x_ny": 34,
                "y_ny": 13
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "33-12",
              "_pos": {
                "_x": 32,
                "_y": 12,
                "x_ny": 33,
                "y_ny": 12
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "33-14",
              "_pos": {
                "_x": 32,
                "_y": 13,
                "x_ny": 33,
                "y_ny": 14
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "32-13",
              "_pos": {
                "_x": 31,
                "_y": 13,
                "x_ny": 32,
                "y_ny": 13
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "34-11",
              "_pos": {
                "_x": 33,
                "_y": 11,
                "x_ny": 34,
                "y_ny": 11
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "35-12",
              "_pos": {
                "_x": 34,
                "_y": 11,
                "x_ny": 35,
                "y_ny": 12
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "36-11",
              "_pos": {
                "_x": 35,
                "_y": 11,
                "x_ny": 36,
                "y_ny": 11
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "37-12",
              "_pos": {
                "_x": 36,
                "_y": 11,
                "x_ny": 37,
                "y_ny": 12
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "38-11",
              "_pos": {
                "_x": 37,
                "_y": 11,
                "x_ny": 38,
                "y_ny": 11
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "38-13",
              "_pos": {
                "_x": 37,
                "_y": 12,
                "x_ny": 38,
                "y_ny": 13
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "39-12",
              "_pos": {
                "_x": 38,
                "_y": 12,
                "x_ny": 39,
                "y_ny": 12
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "39-12",
              "_pos": {
                "_x": 38,
                "_y": 11,
                "x_ny": 39,
                "y_ny": 12
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "37-10",
              "_pos": {
                "_x": 36,
                "_y": 10,
                "x_ny": 37,
                "y_ny": 10
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "38-11",
              "_pos": {
                "_x": 37,
                "_y": 10,
                "x_ny": 38,
                "y_ny": 11
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "38-9",
              "_pos": {
                "_x": 37,
                "_y": 9,
                "x_ny": 38,
                "y_ny": 9
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "39-10",
              "_pos": {
                "_x": 38,
                "_y": 9,
                "x_ny": 39,
                "y_ny": 10
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "40-9",
              "_pos": {
                "_x": 39,
                "_y": 9,
                "x_ny": 40,
                "y_ny": 9
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "41-10",
              "_pos": {
                "_x": 40,
                "_y": 9,
                "x_ny": 41,
                "y_ny": 10
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "37-10",
              "_pos": {
                "_x": 36,
                "_y": 9,
                "x_ny": 37,
                "y_ny": 10
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "36-9",
              "_pos": {
                "_x": 35,
                "_y": 9,
                "x_ny": 36,
                "y_ny": 9
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "36-11",
              "_pos": {
                "_x": 35,
                "_y": 10,
                "x_ny": 36,
                "y_ny": 11
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "35-10",
              "_pos": {
                "_x": 34,
                "_y": 10,
                "x_ny": 35,
                "y_ny": 10
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "32-15",
              "_pos": {
                "_x": 31,
                "_y": 14,
                "x_ny": 32,
                "y_ny": 15
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "6ad7-2977",
              "bp_id": "4091-f401-d1ac",
              "index": "33-14",
              "_pos": {
                "_x": 32,
                "_y": 14,
                "x_ny": 33,
                "y_ny": 14
              },
              "flip": true,
              "type": "sten"
            }
          ],
          "color": "lightgray",
          "number": {
            "_pos": {
              "_x": 35,
              "_y": 12,
              "x_ny": 36,
              "y_ny": 12.5
            },
            "nr": 3
          },
          "svg": "<polygon points=\"370,255.16660498395407 390,255.16660498395407 380,272.48711305964287\"\/>,<polygon points=\"370,255.16660498395407 390,255.16660498395407 380,237.84609690826528\"\/>,<polygon points=\"360,237.84609690826528 380,237.84609690826528 370,255.16660498395407\"\/>,<polygon points=\"350,255.16660498395407 370,255.16660498395407 360,237.84609690826528\"\/>,<polygon points=\"350,255.16660498395407 370,255.16660498395407 360,272.48711305964287\"\/>,<polygon points=\"340,237.84609690826528 360,237.84609690826528 350,255.16660498395407\"\/>,<polygon points=\"330,255.16660498395407 350,255.16660498395407 340,237.84609690826528\"\/>,<polygon points=\"330,255.16660498395407 350,255.16660498395407 340,272.48711305964287\"\/>,<polygon points=\"320,272.48711305964287 340,272.48711305964287 330,255.16660498395407\"\/>,<polygon points=\"340,237.84609690826528 360,237.84609690826528 350,220.52558883257652\"\/>,<polygon points=\"350,220.52558883257652 370,220.52558883257652 360,237.84609690826528\"\/>,<polygon points=\"360,237.84609690826528 380,237.84609690826528 370,220.52558883257652\"\/>,<polygon points=\"370,220.52558883257652 390,220.52558883257652 380,237.84609690826528\"\/>,<polygon points=\"380,237.84609690826528 400,237.84609690826528 390,220.52558883257652\"\/>,<polygon points=\"380,237.84609690826528 400,237.84609690826528 390,255.16660498395407\"\/>,<polygon points=\"390,255.16660498395407 410,255.16660498395407 400,237.84609690826528\"\/>,<polygon points=\"390,220.52558883257652 410,220.52558883257652 400,237.84609690826528\"\/>,<polygon points=\"370,220.52558883257652 390,220.52558883257652 380,203.20508075688775\"\/>,<polygon points=\"380,203.20508075688775 400,203.20508075688775 390,220.52558883257652\"\/>,<polygon points=\"380,203.20508075688775 400,203.20508075688775 390,185.88457268119896\"\/>,<polygon points=\"390,185.88457268119896 410,185.88457268119896 400,203.20508075688775\"\/>,<polygon points=\"400,203.20508075688775 420,203.20508075688775 410,185.88457268119896\"\/>,<polygon points=\"410,185.88457268119896 430,185.88457268119896 420,203.20508075688775\"\/>,<polygon points=\"370,185.88457268119896 390,185.88457268119896 380,203.20508075688775\"\/>,<polygon points=\"360,203.20508075688775 380,203.20508075688775 370,185.88457268119896\"\/>,<polygon points=\"360,203.20508075688775 380,203.20508075688775 370,220.52558883257652\"\/>,<polygon points=\"350,220.52558883257652 370,220.52558883257652 360,203.20508075688775\"\/>,<polygon points=\"320,272.48711305964287 340,272.48711305964287 330,289.8076211353316\"\/>,<polygon points=\"330,289.8076211353316 350,289.8076211353316 340,272.48711305964287\"\/>",
          "pos": {
            "x": 370,
            "y": 246.50635094611
          },
          "occupiedBy": "none"
        }
      ],
      "roads": [
        [
          {
            "_x": 31,
            "_y": 4,
            "x_ny": 31,
            "y_ny": 4
          },
          {
            "_x": 36,
            "_y": 9,
            "x_ny": 36,
            "y_ny": 9
          }
        ],
        [
          {
            "_x": 36,
            "_y": 9,
            "x_ny": 36,
            "y_ny": 9
          },
          {
            "_x": 31,
            "_y": 14,
            "x_ny": 31,
            "y_ny": 14
          }
        ],
        [
          {
            "_x": 36,
            "_y": 9,
            "x_ny": 36,
            "y_ny": 9
          },
          {
            "_x": 46,
            "_y": 9,
            "x_ny": 46,
            "y_ny": 9
          }
        ],
        [
          {
            "_x": 40,
            "_y": 9,
            "x_ny": 40,
            "y_ny": 9
          },
          {
            "_x": 45,
            "_y": 4,
            "x_ny": 45,
            "y_ny": 4
          }
        ],
        [
          {
            "_x": 46,
            "_y": 9,
            "x_ny": 46,
            "y_ny": 9
          },
          {
            "_x": 51,
            "_y": 14,
            "x_ny": 51,
            "y_ny": 14
          }
        ]
      ],
      "buildings": [
        {
          "id": "7874-d0e0",
          "_pos": {
            "_x": 32,
            "_y": 5,
            "x_ny": 32,
            "y_ny": 5
          },
          "array": [
            {
              "index": "30-5",
              "_pos": {
                "_x": 30,
                "_y": 5,
                "x_ny": 31,
                "y_ny": 6
              },
              "flip": false,
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "type": "s\u00e4d"
            },
            {
              "index": "31-5",
              "_pos": {
                "_x": 31,
                "_y": 5,
                "x_ny": 32,
                "y_ny": 5
              },
              "flip": true
            },
            {
              "index": "32-5",
              "_pos": {
                "_x": 32,
                "_y": 5,
                "x_ny": 33,
                "y_ny": 6
              },
              "flip": false,
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "type": "s\u00e4d"
            },
            {
              "index": "30-4",
              "_pos": {
                "_x": 30,
                "_y": 4,
                "x_ny": 31,
                "y_ny": 4
              },
              "flip": true
            },
            {
              "index": "31-4",
              "_pos": {
                "_x": 31,
                "_y": 4,
                "x_ny": 32,
                "y_ny": 5
              },
              "flip": false,
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "type": "s\u00e4d"
            },
            {
              "index": "32-4",
              "_pos": {
                "_x": 32,
                "_y": 4,
                "x_ny": 33,
                "y_ny": 4
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "b3eb-f140",
              "bp_id": "98c1-e360-dd6c",
              "type": "s\u00e4d"
            },
            {
              "refid": "9acc-df61",
              bp_id: "4091-f401-d1ac",
              "type": "tr\u00e4"
            }
          ],
/*****/          "pos": {
            "x": 330,
            "y": 116.60254037844
          }
        },
        {
          "id": "433e-54af",
          "_pos": {
            "_x": 35,
            "_y": 8,
            "x_ny": 35,
            "y_ny": 8
          },
          "array": [
            {
              "index": "33-8",
              "_pos": {
                "_x": 33,
                "_y": 8,
                "x_ny": 34,
                "y_ny": 9
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "34-8",
              "_pos": {
                "_x": 34,
                "_y": 8,
                "x_ny": 35,
                "y_ny": 8
              },
              "flip": true
            },
            {
              "index": "35-8",
              "_pos": {
                "_x": 35,
                "_y": 8,
                "x_ny": 36,
                "y_ny": 9
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "33-7",
              "_pos": {
                "_x": 33,
                "_y": 7,
                "x_ny": 34,
                "y_ny": 7
              },
              "flip": true
            },
            {
              "index": "34-7",
              "_pos": {
                "_x": 34,
                "_y": 7,
                "x_ny": 35,
                "y_ny": 8
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "35-7",
              "_pos": {
                "_x": 35,
                "_y": 7,
                "x_ny": 36,
                "y_ny": 7
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "refid": "c209",
              "type": "hamn"
            }
          ],
          "pos": {
            "x": 360,
            "y": 168.56406460551
          }
        },
        {
          "id": "96a1-bf8c",
          "_pos": {
            "_x": 38,
            "_y": 9,
            "x_ny": 38,
            "y_ny": 9
          },
          "array": [
            {
              "index": "36-9",
              "_pos": {
                "_x": 36,
                "_y": 9,
                "x_ny": 37,
                "y_ny": 10
              },
              "flip": false,
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "type": "tr\u00e4"
            },
            {
              "index": "37-9",
              "_pos": {
                "_x": 37,
                "_y": 9,
                "x_ny": 38,
                "y_ny": 9
              },
              "flip": true
            },
            {
              "index": "38-9",
              "_pos": {
                "_x": 38,
                "_y": 9,
                "x_ny": 39,
                "y_ny": 10
              },
              "flip": false,
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "type": "djur"
            },
            {
              "index": "36-8",
              "_pos": {
                "_x": 36,
                "_y": 8,
                "x_ny": 37,
                "y_ny": 8
              },
              "flip": true
            },
            {
              "index": "37-8",
              "_pos": {
                "_x": 37,
                "_y": 8,
                "x_ny": 38,
                "y_ny": 9
              },
              "flip": false,
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "type": "tr\u00e4"
            },
            {
              "index": "38-8",
              "_pos": {
                "_x": 38,
                "_y": 8,
                "x_ny": 39,
                "y_ny": 8
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "9acc-df61",
              "bp_id": "4091-f401-d1ac",
              "type": "tr\u00e4"
            },
            {
              "refid": "8469",
              "type": "hamn"
            },
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "type": "djur"
            }
          ],
          "pos": {
            "x": 390,
            "y": 185.8845726812
          }
        },
        {
          "id": "f7c9-5cd5",
          "_pos": {
            "_x": 35,
            "_y": 10,
            "x_ny": 35,
            "y_ny": 10
          },
          "array": [
            {
              "index": "33-10",
              "_pos": {
                "_x": 33,
                "_y": 10,
                "x_ny": 34,
                "y_ny": 11
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "34-10",
              "_pos": {
                "_x": 34,
                "_y": 10,
                "x_ny": 35,
                "y_ny": 10
              },
              "flip": true
            },
            {
              "index": "35-10",
              "_pos": {
                "_x": 35,
                "_y": 10,
                "x_ny": 36,
                "y_ny": 11
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "33-9",
              "_pos": {
                "_x": 33,
                "_y": 9,
                "x_ny": 34,
                "y_ny": 9
              },
              "flip": true
            },
            {
              "index": "34-9",
              "_pos": {
                "_x": 34,
                "_y": 9,
                "x_ny": 35,
                "y_ny": 10
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "35-9",
              "_pos": {
                "_x": 35,
                "_y": 9,
                "x_ny": 36,
                "y_ny": 9
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "refid": "51c1",
              "type": "hamn"
            }
          ],
          "pos": {
            "x": 360,
            "y": 203.20508075689
          }
        },
        {
          "id": "e7e6-d349",
          "_pos": {
            "_x": 32,
            "_y": 13,
            "x_ny": 32,
            "y_ny": 13
          },
          "array": [
            {
              "index": "30-13",
              "_pos": {
                "_x": 30,
                "_y": 13,
                "x_ny": 31,
                "y_ny": 14
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "31-13",
              "_pos": {
                "_x": 31,
                "_y": 13,
                "x_ny": 32,
                "y_ny": 13
              },
              "flip": true
            },
            {
              "index": "32-13",
              "_pos": {
                "_x": 32,
                "_y": 13,
                "x_ny": 33,
                "y_ny": 14
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "30-12",
              "_pos": {
                "_x": 30,
                "_y": 12,
                "x_ny": 31,
                "y_ny": 12
              },
              "flip": true
            },
            {
              "index": "31-12",
              "_pos": {
                "_x": 31,
                "_y": 12,
                "x_ny": 32,
                "y_ny": 13
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "32-12",
              "_pos": {
                "_x": 32,
                "_y": 12,
                "x_ny": 33,
                "y_ny": 12
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "refid": "5ae2",
              "type": "hamn"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            }
          ],
          "pos": {
            "x": 330,
            "y": 255.16660498395
          }
        },
        {
          "id": "d13e-d1d0",
          "_pos": {
            "_x": 41,
            "_y": 8,
            "x_ny": 41,
            "y_ny": 8
          },
          "array": [
            {
              "index": "39-8",
              "_pos": {
                "_x": 39,
                "_y": 8,
                "x_ny": 40,
                "y_ny": 9
              },
              "flip": false,
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "type": "djur"
            },
            {
              "index": "40-8",
              "_pos": {
                "_x": 40,
                "_y": 8,
                "x_ny": 41,
                "y_ny": 8
              },
              "flip": true
            },
            {
              "index": "41-8",
              "_pos": {
                "_x": 41,
                "_y": 8,
                "x_ny": 42,
                "y_ny": 9
              },
              "flip": false,
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "type": "djur"
            },
            {
              "index": "39-7",
              "_pos": {
                "_x": 39,
                "_y": 7,
                "x_ny": 40,
                "y_ny": 7
              },
              "flip": true
            },
            {
              "index": "40-7",
              "_pos": {
                "_x": 40,
                "_y": 7,
                "x_ny": 41,
                "y_ny": 8
              },
              "flip": false,
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "type": "djur"
            },
            {
              "index": "41-7",
              "_pos": {
                "_x": 41,
                "_y": 7,
                "x_ny": 42,
                "y_ny": 7
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "type": "djur"
            },
            {
              "refid": "389c",
              "type": "hamn"
            }
          ],
          "pos": {
            "x": 420,
            "y": 168.56406460551
          }
        },
        {
          "id": "e0e2-88a0",
          "_pos": {
            "_x": 44,
            "_y": 5,
            "x_ny": 44,
            "y_ny": 5
          },
          "array": [
            {
              "index": "42-5",
              "_pos": {
                "_x": 42,
                "_y": 5,
                "x_ny": 43,
                "y_ny": 6
              },
              "flip": false,
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "type": "djur"
            },
            {
              "index": "43-5",
              "_pos": {
                "_x": 43,
                "_y": 5,
                "x_ny": 44,
                "y_ny": 5
              },
              "flip": true
            },
            {
              "index": "44-5",
              "_pos": {
                "_x": 44,
                "_y": 5,
                "x_ny": 45,
                "y_ny": 6
              },
              "flip": false,
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "type": "djur"
            },
            {
              "index": "42-4",
              "_pos": {
                "_x": 42,
                "_y": 4,
                "x_ny": 43,
                "y_ny": 4
              },
              "flip": true
            },
            {
              "index": "43-4",
              "_pos": {
                "_x": 43,
                "_y": 4,
                "x_ny": 44,
                "y_ny": 5
              },
              "flip": false,
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "type": "djur"
            },
            {
              "index": "44-4",
              "_pos": {
                "_x": 44,
                "_y": 4,
                "x_ny": 45,
                "y_ny": 4
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "d18f-b64b",
              "bp_id": "4091-f401-d1ac",
              "type": "djur"
            },
            {
              "refid": "f118",
              "type": "hamn"
            }
          ],
          "pos": {
            "x": 450,
            "y": 116.60254037844
          }
        },
        {
          "id": "3561-fecc",
          "_pos": {
            "_x": 44,
            "_y": 9,
            "x_ny": 44,
            "y_ny": 9
          },
          "array": [
            {
              "index": "42-9",
              "_pos": {
                "_x": 42,
                "_y": 9,
                "x_ny": 43,
                "y_ny": 10
              },
              "flip": false,
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "type": "s\u00e4d"
            },
            {
              "index": "43-9",
              "_pos": {
                "_x": 43,
                "_y": 9,
                "x_ny": 44,
                "y_ny": 9
              },
              "flip": true
            },
            {
              "index": "44-9",
              "_pos": {
                "_x": 44,
                "_y": 9,
                "x_ny": 45,
                "y_ny": 10
              },
              "flip": false,
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "type": "s\u00e4d"
            },
            {
              "index": "42-8",
              "_pos": {
                "_x": 42,
                "_y": 8,
                "x_ny": 43,
                "y_ny": 8
              },
              "flip": true
            },
            {
              "index": "43-8",
              "_pos": {
                "_x": 43,
                "_y": 8,
                "x_ny": 44,
                "y_ny": 9
              },
              "flip": false,
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "type": "s\u00e4d"
            },
            {
              "index": "44-8",
              "_pos": {
                "_x": 44,
                "_y": 8,
                "x_ny": 45,
                "y_ny": 8
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "type": "s\u00e4d"
            },
            {
              "refid": "5660",
              "type": "hamn"
            }
          ],
          "pos": {
            "x": 450,
            "y": 185.8845726812
          }
        },
        {
          "id": "93ca-54c8",
          "_pos": {
            "_x": 47,
            "_y": 10,
            "x_ny": 47,
            "y_ny": 10
          },
          "array": [
            {
              "index": "45-10",
              "_pos": {
                "_x": 45,
                "_y": 10,
                "x_ny": 46,
                "y_ny": 11
              },
              "flip": false,
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "type": "djur"
            },
            {
              "index": "46-10",
              "_pos": {
                "_x": 46,
                "_y": 10,
                "x_ny": 47,
                "y_ny": 10
              },
              "flip": true
            },
            {
              "index": "47-10",
              "_pos": {
                "_x": 47,
                "_y": 10,
                "x_ny": 48,
                "y_ny": 11
              },
              "flip": false,
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "type": "djur"
            },
            {
              "index": "45-9",
              "_pos": {
                "_x": 45,
                "_y": 9,
                "x_ny": 46,
                "y_ny": 9
              },
              "flip": true
            },
            {
              "index": "46-9",
              "_pos": {
                "_x": 46,
                "_y": 9,
                "x_ny": 47,
                "y_ny": 10
              },
              "flip": false,
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "type": "s\u00e4d"
            },
            {
              "index": "47-9",
              "_pos": {
                "_x": 47,
                "_y": 9,
                "x_ny": 48,
                "y_ny": 9
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "0b5d-b3ed",
              "bp_id": "4091-f401-d1ac",
              "type": "djur"
            },
            {
              "refid": "b1b0",
              "type": "hamn"
            },
            {
              "refid": "ee31-f6c5",
              "bp_id": "4091-f401-d1ac",
              "type": "djur"
            },
            {
              "refid": "d26b-91a3",
              "bp_id": "4091-f401-d1ac",
              "type": "s\u00e4d"
            }
          ],
          "pos": {
            "x": 480,
            "y": 203.20508075689
          }
        },
        {
          "id": "0cf5-42f8",
          "_pos": {
            "_x": 50,
            "_y": 13,
            "x_ny": 50,
            "y_ny": 13
          },
          "array": [
            {
              "index": "48-13",
              "_pos": {
                "_x": 48,
                "_y": 13,
                "x_ny": 49,
                "y_ny": 14
              },
              "flip": false,
              "refid": "bc8b-23fa",
              "bp_id": "4091-f401-d1ac",
              "type": "olja"
            },
            {
              "index": "49-13",
              "_pos": {
                "_x": 49,
                "_y": 13,
                "x_ny": 50,
                "y_ny": 13
              },
              "flip": true
            },
            {
              "index": "50-13",
              "_pos": {
                "_x": 50,
                "_y": 13,
                "x_ny": 51,
                "y_ny": 14
              },
              "flip": false,
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "type": "tr\u00e4"
            },
            {
              "index": "48-12",
              "_pos": {
                "_x": 48,
                "_y": 12,
                "x_ny": 49,
                "y_ny": 12
              },
              "flip": true
            },
            {
              "index": "49-12",
              "_pos": {
                "_x": 49,
                "_y": 12,
                "x_ny": 50,
                "y_ny": 13
              },
              "flip": false,
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "type": "tr\u00e4"
            },
            {
              "index": "50-12",
              "_pos": {
                "_x": 50,
                "_y": 12,
                "x_ny": 51,
                "y_ny": 12
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "bc8b-23fa",
              "bp_id": "4091-f401-d1ac",
              "type": "olja"
            },
            {
              "refid": "1aad",
              "type": "hamn"
            },
            {
              "refid": "46a8-6cd0",
              "bp_id": "4091-f401-d1ac",
              "type": "tr\u00e4"
            }
          ],
          "pos": {
            "x": 510,
            "y": 255.16660498395
          }
        }
      ],
      "svg": "<svg width=\"280\" height=\"285.1666049839541\"><g id=\"fields_4091-f401-d1ac\"><g id=\"9acc-df61\" class=\"field tr\u00e4\" type=\"tr\u00e4\"><polygon points=\"50,116.60254037844388 70,116.60254037844388 60,133.92304845413264\"><\/polygon><polygon points=\"50,116.60254037844388 70,116.60254037844388 60,99.2820323027551\"><\/polygon><polygon points=\"40,99.2820323027551 60,99.2820323027551 50,116.60254037844388\"><\/polygon><polygon points=\"20,64.64101615137756 40,64.64101615137756 30,81.96152422706632\"><\/polygon><polygon points=\"30,81.96152422706632 50,81.96152422706632 40,64.64101615137756\"><\/polygon><polygon points=\"30,81.96152422706632 50,81.96152422706632 40,99.2820323027551\"><\/polygon><polygon points=\"40,99.2820323027551 60,99.2820323027551 50,81.96152422706632\"><\/polygon><polygon points=\"60,99.2820323027551 80,99.2820323027551 70,116.60254037844388\"><\/polygon><polygon points=\"60,99.2820323027551 80,99.2820323027551 70,81.96152422706632\"><\/polygon><polygon points=\"50,81.96152422706632 70,81.96152422706632 60,99.2820323027551\"><\/polygon><polygon points=\"50,81.96152422706632 70,81.96152422706632 60,64.64101615137756\"><\/polygon><polygon points=\"40,64.64101615137756 60,64.64101615137756 50,81.96152422706632\"><\/polygon><polygon points=\"40,64.64101615137756 60,64.64101615137756 50,47.32050807568878\"><\/polygon><polygon points=\"30,47.32050807568878 50,47.32050807568878 40,64.64101615137756\"><\/polygon><polygon points=\"20,64.64101615137756 40,64.64101615137756 30,47.32050807568878\"><\/polygon><polygon points=\"10,47.32050807568878 30,47.32050807568878 20,64.64101615137756\"><\/polygon><g class=\"number\"><circle cx=\"60\" cy=\"73.30127018922194\" r=\"8.1\"><\/circle><text id=\"nr-9acc-df61\" transform=\"matrix(1 0 0 1 60 78.30127018922194)\">11<\/text><\/g><\/g><g id=\"d18f-b64b\" class=\"field djur\" type=\"djur\"><polygon points=\"80,99.2820323027551 100,99.2820323027551 90,116.60254037844388\"><\/polygon><polygon points=\"70,116.60254037844388 90,116.60254037844388 80,99.2820323027551\"><\/polygon><polygon points=\"60,133.92304845413264 80,133.92304845413264 70,116.60254037844388\"><\/polygon><polygon points=\"70,116.60254037844388 90,116.60254037844388 80,133.92304845413264\"><\/polygon><polygon points=\"80,133.92304845413264 100,133.92304845413264 90,116.60254037844388\"><\/polygon><polygon points=\"90,116.60254037844388 110,116.60254037844388 100,133.92304845413264\"><\/polygon><polygon points=\"90,116.60254037844388 110,116.60254037844388 100,99.2820323027551\"><\/polygon><polygon points=\"100,99.2820323027551 120,99.2820323027551 110,116.60254037844388\"><\/polygon><polygon points=\"100,99.2820323027551 120,99.2820323027551 110,81.96152422706632\"><\/polygon><polygon points=\"110,81.96152422706632 130,81.96152422706632 120,99.2820323027551\"><\/polygon><polygon points=\"130,81.96152422706632 150,81.96152422706632 140,64.64101615137756\"><\/polygon><polygon points=\"140,64.64101615137756 160,64.64101615137756 150,81.96152422706632\"><\/polygon><polygon points=\"150,81.96152422706632 170,81.96152422706632 160,64.64101615137756\"><\/polygon><polygon points=\"160,64.64101615137756 180,64.64101615137756 170,81.96152422706632\"><\/polygon><polygon points=\"160,64.64101615137756 180,64.64101615137756 170,47.32050807568878\"><\/polygon><polygon points=\"140,64.64101615137756 160,64.64101615137756 150,47.32050807568878\"><\/polygon><polygon points=\"150,47.32050807568878 170,47.32050807568878 160,64.64101615137756\"><\/polygon><polygon points=\"150,47.32050807568878 170,47.32050807568878 160,30\"><\/polygon><polygon points=\"140,30 160,30 150,47.32050807568878\"><\/polygon><polygon points=\"130,47.32050807568878 150,47.32050807568878 140,30\"><\/polygon><polygon points=\"130,47.32050807568878 150,47.32050807568878 140,64.64101615137756\"><\/polygon><polygon points=\"120,64.64101615137756 140,64.64101615137756 130,47.32050807568878\"><\/polygon><polygon points=\"120,64.64101615137756 140,64.64101615137756 130,81.96152422706632\"><\/polygon><polygon points=\"110,81.96152422706632 130,81.96152422706632 120,64.64101615137756\"><\/polygon><polygon points=\"100,64.64101615137756 120,64.64101615137756 110,81.96152422706632\"><\/polygon><polygon points=\"90,81.96152422706632 110,81.96152422706632 100,64.64101615137756\"><\/polygon><polygon points=\"90,81.96152422706632 110,81.96152422706632 100,99.2820323027551\"><\/polygon><polygon points=\"80,99.2820323027551 100,99.2820323027551 90,81.96152422706632\"><\/polygon><polygon points=\"70,81.96152422706632 90,81.96152422706632 80,99.2820323027551\"><\/polygon><polygon points=\"70,81.96152422706632 90,81.96152422706632 80,64.64101615137756\"><\/polygon><polygon points=\"60,64.64101615137756 80,64.64101615137756 70,81.96152422706632\"><\/polygon><g class=\"number\"><circle cx=\"100\" cy=\"90.62177826491072\" r=\"8.1\"><\/circle><text id=\"nr-d18f-b64b\" transform=\"matrix(1 0 0 1 100 95.62177826491072)\">5<\/text><\/g><\/g><g id=\"d26b-91a3\" class=\"field s\u00e4d\" type=\"s\u00e4d\"><polygon points=\"140,99.2820323027551 160,99.2820323027551 150,116.60254037844388\"><\/polygon><polygon points=\"130,116.60254037844388 150,116.60254037844388 140,99.2820323027551\"><\/polygon><polygon points=\"110,116.60254037844388 130,116.60254037844388 120,99.2820323027551\"><\/polygon><polygon points=\"120,99.2820323027551 140,99.2820323027551 130,116.60254037844388\"><\/polygon><polygon points=\"120,99.2820323027551 140,99.2820323027551 130,81.96152422706632\"><\/polygon><polygon points=\"130,81.96152422706632 150,81.96152422706632 140,99.2820323027551\"><\/polygon><polygon points=\"140,99.2820323027551 160,99.2820323027551 150,81.96152422706632\"><\/polygon><polygon points=\"150,81.96152422706632 170,81.96152422706632 160,99.2820323027551\"><\/polygon><polygon points=\"160,99.2820323027551 180,99.2820323027551 170,81.96152422706632\"><\/polygon><polygon points=\"160,99.2820323027551 180,99.2820323027551 170,116.60254037844388\"><\/polygon><polygon points=\"150,116.60254037844388 170,116.60254037844388 160,99.2820323027551\"><\/polygon><polygon points=\"150,116.60254037844388 170,116.60254037844388 160,133.92304845413264\"><\/polygon><polygon points=\"140,133.92304845413264 160,133.92304845413264 150,116.60254037844388\"><\/polygon><polygon points=\"130,116.60254037844388 150,116.60254037844388 140,133.92304845413264\"><\/polygon><polygon points=\"120,133.92304845413264 140,133.92304845413264 130,116.60254037844388\"><\/polygon><polygon points=\"110,116.60254037844388 130,116.60254037844388 120,133.92304845413264\"><\/polygon><polygon points=\"100,133.92304845413264 120,133.92304845413264 110,116.60254037844388\"><\/polygon><g class=\"number\"><circle cx=\"150\" cy=\"107.94228634059948\" r=\"8.1\"><\/circle><text id=\"nr-d26b-91a3\" transform=\"matrix(1 0 0 1 150 112.94228634059948)\">10<\/text><\/g><\/g><g id=\"ee31-f6c5\" class=\"field djur\" type=\"djur\"><polygon points=\"190,151.24355652982143 210,151.24355652982143 200,133.92304845413264\"><\/polygon><polygon points=\"190,151.24355652982143 210,151.24355652982143 200,168.5640646055102\"><\/polygon><polygon points=\"180,168.5640646055102 200,168.5640646055102 190,151.24355652982143\"><\/polygon><polygon points=\"170,151.24355652982143 190,151.24355652982143 180,168.5640646055102\"><\/polygon><polygon points=\"180,133.92304845413264 200,133.92304845413264 190,151.24355652982143\"><\/polygon><polygon points=\"180,133.92304845413264 200,133.92304845413264 190,116.60254037844388\"><\/polygon><polygon points=\"160,133.92304845413264 180,133.92304845413264 170,116.60254037844388\"><\/polygon><polygon points=\"170,151.24355652982143 190,151.24355652982143 180,133.92304845413264\"><\/polygon><polygon points=\"160,133.92304845413264 180,133.92304845413264 170,151.24355652982143\"><\/polygon><polygon points=\"170,116.60254037844388 190,116.60254037844388 180,133.92304845413264\"><\/polygon><polygon points=\"170,116.60254037844388 190,116.60254037844388 180,99.2820323027551\"><\/polygon><polygon points=\"180,99.2820323027551 200,99.2820323027551 190,116.60254037844388\"><\/polygon><polygon points=\"180,99.2820323027551 200,99.2820323027551 190,81.96152422706632\"><\/polygon><polygon points=\"170,81.96152422706632 190,81.96152422706632 180,99.2820323027551\"><\/polygon><polygon points=\"170,81.96152422706632 190,81.96152422706632 180,64.64101615137756\"><\/polygon><g class=\"number\"><circle cx=\"190\" cy=\"142.58330249197704\" r=\"8.1\"><\/circle><text id=\"nr-ee31-f6c5\" transform=\"matrix(1 0 0 1 190 147.58330249197704)\">2<\/text><\/g><\/g><g id=\"46a8-6cd0\" class=\"field tr\u00e4\" type=\"tr\u00e4\"><polygon points=\"210,220.52558883257652 230,220.52558883257652 220,237.84609690826528\"><\/polygon><polygon points=\"230,220.52558883257652 250,220.52558883257652 240,237.84609690826528\"><\/polygon><polygon points=\"220,237.84609690826528 240,237.84609690826528 230,220.52558883257652\"><\/polygon><polygon points=\"220,237.84609690826528 240,237.84609690826528 230,255.16660498395407\"><\/polygon><polygon points=\"230,255.16660498395407 250,255.16660498395407 240,237.84609690826528\"><\/polygon><polygon points=\"240,237.84609690826528 260,237.84609690826528 250,255.16660498395407\"><\/polygon><polygon points=\"240,237.84609690826528 260,237.84609690826528 250,220.52558883257652\"><\/polygon><polygon points=\"250,220.52558883257652 270,220.52558883257652 260,237.84609690826528\"><\/polygon><polygon points=\"240,203.20508075688775 260,203.20508075688775 250,220.52558883257652\"><\/polygon><polygon points=\"230,220.52558883257652 250,220.52558883257652 240,203.20508075688775\"><\/polygon><polygon points=\"220,203.20508075688775 240,203.20508075688775 230,185.88457268119896\"><\/polygon><polygon points=\"210,185.88457268119896 230,185.88457268119896 220,168.5640646055102\"><\/polygon><polygon points=\"200,168.5640646055102 220,168.5640646055102 210,151.24355652982143\"><\/polygon><polygon points=\"200,168.5640646055102 220,168.5640646055102 210,185.88457268119896\"><\/polygon><polygon points=\"190,185.88457268119896 210,185.88457268119896 200,203.20508075688775\"><\/polygon><polygon points=\"200,203.20508075688775 220,203.20508075688775 210,185.88457268119896\"><\/polygon><polygon points=\"200,203.20508075688775 220,203.20508075688775 210,220.52558883257652\"><\/polygon><polygon points=\"220,203.20508075688775 240,203.20508075688775 230,220.52558883257652\"><\/polygon><polygon points=\"210,220.52558883257652 230,220.52558883257652 220,203.20508075688775\"><\/polygon><polygon points=\"210,185.88457268119896 230,185.88457268119896 220,203.20508075688775\"><\/polygon><polygon points=\"190,185.88457268119896 210,185.88457268119896 200,168.5640646055102\"><\/polygon><polygon points=\"180,168.5640646055102 200,168.5640646055102 190,185.88457268119896\"><\/polygon><g class=\"number\"><circle cx=\"240\" cy=\"229.1858428704209\" r=\"8.1\"><\/circle><text id=\"nr-46a8-6cd0\" transform=\"matrix(1 0 0 1 240 234.1858428704209)\">4<\/text><\/g><\/g><g id=\"bc8b-23fa\" class=\"field olja\" type=\"olja\"><polygon points=\"190,255.16660498395407 210,255.16660498395407 200,237.84609690826528\"><\/polygon><polygon points=\"180,237.84609690826528 200,237.84609690826528 190,255.16660498395407\"><\/polygon><polygon points=\"180,237.84609690826528 200,237.84609690826528 190,220.52558883257652\"><\/polygon><polygon points=\"170,220.52558883257652 190,220.52558883257652 180,237.84609690826528\"><\/polygon><polygon points=\"170,220.52558883257652 190,220.52558883257652 180,203.20508075688775\"><\/polygon><polygon points=\"180,203.20508075688775 200,203.20508075688775 190,185.88457268119896\"><\/polygon><polygon points=\"180,203.20508075688775 200,203.20508075688775 190,220.52558883257652\"><\/polygon><polygon points=\"190,220.52558883257652 210,220.52558883257652 200,203.20508075688775\"><\/polygon><polygon points=\"190,220.52558883257652 210,220.52558883257652 200,237.84609690826528\"><\/polygon><polygon points=\"200,237.84609690826528 220,237.84609690826528 210,220.52558883257652\"><\/polygon><polygon points=\"200,237.84609690826528 220,237.84609690826528 210,255.16660498395407\"><\/polygon><polygon points=\"210,255.16660498395407 230,255.16660498395407 220,237.84609690826528\"><\/polygon><g class=\"number\"><circle cx=\"190\" cy=\"229.1858428704209\" r=\"8.1\"><\/circle><text id=\"nr-bc8b-23fa\" transform=\"matrix(1 0 0 1 190 234.1858428704209)\">2<\/text><\/g><\/g><g id=\"0b5d-b3ed\" class=\"field djur\" type=\"djur\"><polygon points=\"70,220.52558883257652 90,220.52558883257652 80,203.20508075688775\"><\/polygon><polygon points=\"80,203.20508075688775 100,203.20508075688775 90,220.52558883257652\"><\/polygon><polygon points=\"90,185.88457268119896 110,185.88457268119896 100,203.20508075688775\"><\/polygon><polygon points=\"90,185.88457268119896 110,185.88457268119896 100,168.5640646055102\"><\/polygon><polygon points=\"120,168.5640646055102 140,168.5640646055102 130,151.24355652982143\"><\/polygon><polygon points=\"130,151.24355652982143 150,151.24355652982143 140,168.5640646055102\"><\/polygon><polygon points=\"140,168.5640646055102 160,168.5640646055102 150,151.24355652982143\"><\/polygon><polygon points=\"170,185.88457268119896 190,185.88457268119896 180,168.5640646055102\"><\/polygon><polygon points=\"160,168.5640646055102 180,168.5640646055102 170,185.88457268119896\"><\/polygon><polygon points=\"160,168.5640646055102 180,168.5640646055102 170,151.24355652982143\"><\/polygon><polygon points=\"150,151.24355652982143 170,151.24355652982143 160,168.5640646055102\"><\/polygon><polygon points=\"150,151.24355652982143 170,151.24355652982143 160,133.92304845413264\"><\/polygon><polygon points=\"140,133.92304845413264 160,133.92304845413264 150,151.24355652982143\"><\/polygon><polygon points=\"130,151.24355652982143 150,151.24355652982143 140,133.92304845413264\"><\/polygon><polygon points=\"120,133.92304845413264 140,133.92304845413264 130,151.24355652982143\"><\/polygon><polygon points=\"110,151.24355652982143 130,151.24355652982143 120,133.92304845413264\"><\/polygon><polygon points=\"110,151.24355652982143 130,151.24355652982143 120,168.5640646055102\"><\/polygon><polygon points=\"80,168.5640646055102 100,168.5640646055102 90,151.24355652982143\"><\/polygon><polygon points=\"90,151.24355652982143 110,151.24355652982143 100,168.5640646055102\"><\/polygon><polygon points=\"100,168.5640646055102 120,168.5640646055102 110,151.24355652982143\"><\/polygon><polygon points=\"100,168.5640646055102 120,168.5640646055102 110,185.88457268119896\"><\/polygon><polygon points=\"110,185.88457268119896 130,185.88457268119896 120,168.5640646055102\"><\/polygon><polygon points=\"120,168.5640646055102 140,168.5640646055102 130,185.88457268119896\"><\/polygon><polygon points=\"140,203.20508075688775 160,203.20508075688775 150,185.88457268119896\"><\/polygon><polygon points=\"130,185.88457268119896 150,185.88457268119896 140,168.5640646055102\"><\/polygon><polygon points=\"130,185.88457268119896 150,185.88457268119896 140,203.20508075688775\"><\/polygon><polygon points=\"140,168.5640646055102 160,168.5640646055102 150,185.88457268119896\"><\/polygon><polygon points=\"150,185.88457268119896 170,185.88457268119896 160,168.5640646055102\"><\/polygon><polygon points=\"150,185.88457268119896 170,185.88457268119896 160,203.20508075688775\"><\/polygon><polygon points=\"170,185.88457268119896 190,185.88457268119896 180,203.20508075688775\"><\/polygon><polygon points=\"160,203.20508075688775 180,203.20508075688775 170,185.88457268119896\"><\/polygon><polygon points=\"160,203.20508075688775 180,203.20508075688775 170,220.52558883257652\"><\/polygon><g class=\"number\"><circle cx=\"150\" cy=\"177.2243186433546\" r=\"8.1\"><\/circle><text id=\"nr-0b5d-b3ed\" transform=\"matrix(1 0 0 1 150 182.2243186433546)\">8<\/text><\/g><\/g><g id=\"6ad7-2977\" class=\"field sten\" type=\"sten\"><polygon points=\"20,237.84609690826528 40,237.84609690826528 30,220.52558883257652\"><\/polygon><polygon points=\"10,220.52558883257652 30,220.52558883257652 20,237.84609690826528\"><\/polygon><polygon points=\"40,168.5640646055102 60,168.5640646055102 50,151.24355652982143\"><\/polygon><polygon points=\"50,151.24355652982143 70,151.24355652982143 60,168.5640646055102\"><\/polygon><polygon points=\"50,151.24355652982143 70,151.24355652982143 60,133.92304845413264\"><\/polygon><polygon points=\"60,133.92304845413264 80,133.92304845413264 70,151.24355652982143\"><\/polygon><polygon points=\"100,133.92304845413264 120,133.92304845413264 110,151.24355652982143\"><\/polygon><polygon points=\"90,151.24355652982143 110,151.24355652982143 100,133.92304845413264\"><\/polygon><polygon points=\"80,133.92304845413264 100,133.92304845413264 90,151.24355652982143\"><\/polygon><polygon points=\"70,151.24355652982143 90,151.24355652982143 80,133.92304845413264\"><\/polygon><polygon points=\"70,151.24355652982143 90,151.24355652982143 80,168.5640646055102\"><\/polygon><polygon points=\"60,168.5640646055102 80,168.5640646055102 70,151.24355652982143\"><\/polygon><polygon points=\"80,168.5640646055102 100,168.5640646055102 90,185.88457268119896\"><\/polygon><polygon points=\"80,203.20508075688775 100,203.20508075688775 90,185.88457268119896\"><\/polygon><polygon points=\"70,185.88457268119896 90,185.88457268119896 80,203.20508075688775\"><\/polygon><polygon points=\"70,185.88457268119896 90,185.88457268119896 80,168.5640646055102\"><\/polygon><polygon points=\"60,168.5640646055102 80,168.5640646055102 70,185.88457268119896\"><\/polygon><polygon points=\"50,185.88457268119896 70,185.88457268119896 60,168.5640646055102\"><\/polygon><polygon points=\"40,168.5640646055102 60,168.5640646055102 50,185.88457268119896\"><\/polygon><polygon points=\"30,185.88457268119896 50,185.88457268119896 40,168.5640646055102\"><\/polygon><polygon points=\"10,220.52558883257652 30,220.52558883257652 20,203.20508075688775\"><\/polygon><polygon points=\"20,203.20508075688775 40,203.20508075688775 30,220.52558883257652\"><\/polygon><polygon points=\"20,203.20508075688775 40,203.20508075688775 30,185.88457268119896\"><\/polygon><polygon points=\"30,185.88457268119896 50,185.88457268119896 40,203.20508075688775\"><\/polygon><polygon points=\"40,203.20508075688775 60,203.20508075688775 50,220.52558883257652\"><\/polygon><polygon points=\"40,203.20508075688775 60,203.20508075688775 50,185.88457268119896\"><\/polygon><polygon points=\"50,185.88457268119896 70,185.88457268119896 60,203.20508075688775\"><\/polygon><polygon points=\"60,203.20508075688775 80,203.20508075688775 70,185.88457268119896\"><\/polygon><polygon points=\"60,203.20508075688775 80,203.20508075688775 70,220.52558883257652\"><\/polygon><g class=\"number\"><circle cx=\"60\" cy=\"194.54482671904336\" r=\"8.1\"><\/circle><text id=\"nr-6ad7-2977\" transform=\"matrix(1 0 0 1 60 199.54482671904336)\">3<\/text><\/g><\/g><\/g><g id=\"roads_4091-f401-d1ac\"><g class=\"road\"><circle cx=\"10\" cy=\"47.32050807568878\" r=\"2\"><\/circle> <circle cx=\"60\" cy=\"133.92304845413264\" r=\"2\"><\/circle><line x1=\"10\" y1=\"47.32050807568878\" x2=\"60\" y2=\"133.92304845413264\"><\/line><\/g><g class=\"road\"><circle cx=\"60\" cy=\"133.92304845413264\" r=\"2\"><\/circle> <circle cx=\"10\" cy=\"220.52558883257652\" r=\"2\"><\/circle><line x1=\"60\" y1=\"133.92304845413264\" x2=\"10\" y2=\"220.52558883257652\"><\/line><\/g><g class=\"road\"><circle cx=\"60\" cy=\"133.92304845413264\" r=\"2\"><\/circle> <circle cx=\"160\" cy=\"133.92304845413264\" r=\"2\"><\/circle><line x1=\"60\" y1=\"133.92304845413264\" x2=\"160\" y2=\"133.92304845413264\"><\/line><\/g><g class=\"road\"><circle cx=\"100\" cy=\"133.92304845413264\" r=\"2\"><\/circle> <circle cx=\"150\" cy=\"47.32050807568878\" r=\"2\"><\/circle><line x1=\"100\" y1=\"133.92304845413264\" x2=\"150\" y2=\"47.32050807568878\"><\/line><\/g><g class=\"road\"><circle cx=\"160\" cy=\"133.92304845413264\" r=\"2\"><\/circle> <circle cx=\"210\" cy=\"220.52558883257652\" r=\"2\"><\/circle><line x1=\"160\" y1=\"133.92304845413264\" x2=\"210\" y2=\"220.52558883257652\"><\/line><\/g><\/g><g id=\"buildings_4091-f401-d1ac\"><g class=\"building\" id=\"7874-d0e0\"><polygon points=\"0,64.64101615137756 20,64.64101615137756 10,81.96152422706632\"><\/polygon>,<polygon points=\"10,81.96152422706632 30,81.96152422706632 20,64.64101615137756\"><\/polygon>,<polygon points=\"20,64.64101615137756 40,64.64101615137756 30,81.96152422706632\"><\/polygon>,<polygon points=\"0,64.64101615137756 20,64.64101615137756 10,47.32050807568878\"><\/polygon>,<polygon points=\"10,47.32050807568878 30,47.32050807568878 20,64.64101615137756\"><\/polygon>,<polygon points=\"20,64.64101615137756 40,64.64101615137756 30,47.32050807568878\"><\/polygon><\/g><g class=\"building\" id=\"433e-54af\"><polygon points=\"30,116.60254037844388 50,116.60254037844388 40,133.92304845413264\"><\/polygon>,<polygon points=\"40,133.92304845413264 60,133.92304845413264 50,116.60254037844388\"><\/polygon>,<polygon points=\"50,116.60254037844388 70,116.60254037844388 60,133.92304845413264\"><\/polygon>,<polygon points=\"30,116.60254037844388 50,116.60254037844388 40,99.2820323027551\"><\/polygon>,<polygon points=\"40,99.2820323027551 60,99.2820323027551 50,116.60254037844388\"><\/polygon>,<polygon points=\"50,116.60254037844388 70,116.60254037844388 60,99.2820323027551\"><\/polygon><\/g><g class=\"building\" id=\"96a1-bf8c\"><polygon points=\"60,133.92304845413264 80,133.92304845413264 70,151.24355652982143\"><\/polygon>,<polygon points=\"70,151.24355652982143 90,151.24355652982143 80,133.92304845413264\"><\/polygon>,<polygon points=\"80,133.92304845413264 100,133.92304845413264 90,151.24355652982143\"><\/polygon>,<polygon points=\"60,133.92304845413264 80,133.92304845413264 70,116.60254037844388\"><\/polygon>,<polygon points=\"70,116.60254037844388 90,116.60254037844388 80,133.92304845413264\"><\/polygon>,<polygon points=\"80,133.92304845413264 100,133.92304845413264 90,116.60254037844388\"><\/polygon><\/g><g class=\"building\" id=\"f7c9-5cd5\"><polygon points=\"30,151.24355652982143 50,151.24355652982143 40,168.5640646055102\"><\/polygon>,<polygon points=\"40,168.5640646055102 60,168.5640646055102 50,151.24355652982143\"><\/polygon>,<polygon points=\"50,151.24355652982143 70,151.24355652982143 60,168.5640646055102\"><\/polygon>,<polygon points=\"30,151.24355652982143 50,151.24355652982143 40,133.92304845413264\"><\/polygon>,<polygon points=\"40,133.92304845413264 60,133.92304845413264 50,151.24355652982143\"><\/polygon>,<polygon points=\"50,151.24355652982143 70,151.24355652982143 60,133.92304845413264\"><\/polygon><\/g><g class=\"building\" id=\"e7e6-d349\"><polygon points=\"0,203.20508075688775 20,203.20508075688775 10,220.52558883257652\"><\/polygon>,<polygon points=\"10,220.52558883257652 30,220.52558883257652 20,203.20508075688775\"><\/polygon>,<polygon points=\"20,203.20508075688775 40,203.20508075688775 30,220.52558883257652\"><\/polygon>,<polygon points=\"0,203.20508075688775 20,203.20508075688775 10,185.88457268119896\"><\/polygon>,<polygon points=\"10,185.88457268119896 30,185.88457268119896 20,203.20508075688775\"><\/polygon>,<polygon points=\"20,203.20508075688775 40,203.20508075688775 30,185.88457268119896\"><\/polygon><\/g><g class=\"building\" id=\"d13e-d1d0\"><polygon points=\"90,116.60254037844388 110,116.60254037844388 100,133.92304845413264\"><\/polygon>,<polygon points=\"100,133.92304845413264 120,133.92304845413264 110,116.60254037844388\"><\/polygon>,<polygon points=\"110,116.60254037844388 130,116.60254037844388 120,133.92304845413264\"><\/polygon>,<polygon points=\"90,116.60254037844388 110,116.60254037844388 100,99.2820323027551\"><\/polygon>,<polygon points=\"100,99.2820323027551 120,99.2820323027551 110,116.60254037844388\"><\/polygon>,<polygon points=\"110,116.60254037844388 130,116.60254037844388 120,99.2820323027551\"><\/polygon><\/g><g class=\"building\" id=\"e0e2-88a0\"><polygon points=\"120,64.64101615137756 140,64.64101615137756 130,81.96152422706632\"><\/polygon>,<polygon points=\"130,81.96152422706632 150,81.96152422706632 140,64.64101615137756\"><\/polygon>,<polygon points=\"140,64.64101615137756 160,64.64101615137756 150,81.96152422706632\"><\/polygon>,<polygon points=\"120,64.64101615137756 140,64.64101615137756 130,47.32050807568878\"><\/polygon>,<polygon points=\"130,47.32050807568878 150,47.32050807568878 140,64.64101615137756\"><\/polygon>,<polygon points=\"140,64.64101615137756 160,64.64101615137756 150,47.32050807568878\"><\/polygon><\/g><g class=\"building\" id=\"3561-fecc\"><polygon points=\"120,133.92304845413264 140,133.92304845413264 130,151.24355652982143\"><\/polygon>,<polygon points=\"130,151.24355652982143 150,151.24355652982143 140,133.92304845413264\"><\/polygon>,<polygon points=\"140,133.92304845413264 160,133.92304845413264 150,151.24355652982143\"><\/polygon>,<polygon points=\"120,133.92304845413264 140,133.92304845413264 130,116.60254037844388\"><\/polygon>,<polygon points=\"130,116.60254037844388 150,116.60254037844388 140,133.92304845413264\"><\/polygon>,<polygon points=\"140,133.92304845413264 160,133.92304845413264 150,116.60254037844388\"><\/polygon><\/g><g class=\"building\" id=\"93ca-54c8\"><polygon points=\"150,151.24355652982143 170,151.24355652982143 160,168.5640646055102\"><\/polygon>,<polygon points=\"160,168.5640646055102 180,168.5640646055102 170,151.24355652982143\"><\/polygon>,<polygon points=\"170,151.24355652982143 190,151.24355652982143 180,168.5640646055102\"><\/polygon>,<polygon points=\"150,151.24355652982143 170,151.24355652982143 160,133.92304845413264\"><\/polygon>,<polygon points=\"160,133.92304845413264 180,133.92304845413264 170,151.24355652982143\"><\/polygon>,<polygon points=\"170,151.24355652982143 190,151.24355652982143 180,133.92304845413264\"><\/polygon><\/g><g class=\"building\" id=\"0cf5-42f8\"><polygon points=\"180,203.20508075688775 200,203.20508075688775 190,220.52558883257652\"><\/polygon>,<polygon points=\"190,220.52558883257652 210,220.52558883257652 200,203.20508075688775\"><\/polygon>,<polygon points=\"200,203.20508075688775 220,203.20508075688775 210,220.52558883257652\"><\/polygon>,<polygon points=\"180,203.20508075688775 200,203.20508075688775 190,185.88457268119896\"><\/polygon>,<polygon points=\"190,185.88457268119896 210,185.88457268119896 200,203.20508075688775\"><\/polygon>,<polygon points=\"200,203.20508075688775 220,203.20508075688775 210,185.88457268119896\"><\/polygon><\/g><\/g><\/svg>",
      "prelRoad": [
        
      ],
      "roadsSVG": [
        "<circle cx=\"320\" cy=\"99.2820323027551\" r=\"2\" \/> <circle cx=\"370\" cy=\"185.88457268119896\" r=\"2\" \/><line x1=\"320\" y1=\"99.2820323027551\" x2=\"370\" y2=\"185.88457268119896\" \/>",
        "<circle cx=\"370\" cy=\"185.88457268119896\" r=\"2\" \/> <circle cx=\"320\" cy=\"272.48711305964287\" r=\"2\" \/><line x1=\"370\" y1=\"185.88457268119896\" x2=\"320\" y2=\"272.48711305964287\" \/>",
        "<circle cx=\"370\" cy=\"185.88457268119896\" r=\"2\" \/> <circle cx=\"470\" cy=\"185.88457268119896\" r=\"2\" \/><line x1=\"370\" y1=\"185.88457268119896\" x2=\"470\" y2=\"185.88457268119896\" \/>",
        "<circle cx=\"410\" cy=\"185.88457268119896\" r=\"2\" \/> <circle cx=\"460\" cy=\"99.2820323027551\" r=\"2\" \/><line x1=\"410\" y1=\"185.88457268119896\" x2=\"460\" y2=\"99.2820323027551\" \/>",
        "<circle cx=\"470\" cy=\"185.88457268119896\" r=\"2\" \/> <circle cx=\"520\" cy=\"272.48711305964287\" r=\"2\" \/><line x1=\"470\" y1=\"185.88457268119896\" x2=\"520\" y2=\"272.48711305964287\" \/>"
      ]
    },
    {
      "id": "de39-9e31-9871",
      "fields": [
        {
          "id": "4a03-abfe",
          "type": "olja",
          "array": [
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "index": "17-18",
              "_pos": {
                "_x": 16,
                "_y": 18,
                "x_ny": 17,
                "y_ny": 18
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "index": "18-19",
              "_pos": {
                "_x": 17,
                "_y": 18,
                "x_ny": 18,
                "y_ny": 19
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "index": "19-18",
              "_pos": {
                "_x": 18,
                "_y": 18,
                "x_ny": 19,
                "y_ny": 18
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "index": "20-19",
              "_pos": {
                "_x": 19,
                "_y": 18,
                "x_ny": 20,
                "y_ny": 19
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "index": "20-17",
              "_pos": {
                "_x": 19,
                "_y": 17,
                "x_ny": 20,
                "y_ny": 17.5
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "index": "21-18",
              "_pos": {
                "_x": 20,
                "_y": 17,
                "x_ny": 21,
                "y_ny": 18
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "index": "21-16",
              "_pos": {
                "_x": 20,
                "_y": 16,
                "x_ny": 21,
                "y_ny": 16
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "index": "20-17",
              "_pos": {
                "_x": 19,
                "_y": 16,
                "x_ny": 20,
                "y_ny": 17
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "index": "19-16",
              "_pos": {
                "_x": 18,
                "_y": 16,
                "x_ny": 19,
                "y_ny": 16
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "index": "19-18",
              "_pos": {
                "_x": 18,
                "_y": 17,
                "x_ny": 19,
                "y_ny": 18
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "index": "18-17",
              "_pos": {
                "_x": 17,
                "_y": 17,
                "x_ny": 18,
                "y_ny": 17
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "index": "17-18",
              "_pos": {
                "_x": 16,
                "_y": 17,
                "x_ny": 17,
                "y_ny": 18
              },
              "flip": false,
              "type": "olja"
            },
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "index": "16-17",
              "_pos": {
                "_x": 15,
                "_y": 17,
                "x_ny": 16,
                "y_ny": 17
              },
              "flip": true,
              "type": "olja"
            },
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "index": "16-19",
              "_pos": {
                "_x": 15,
                "_y": 18,
                "x_ny": 16,
                "y_ny": 19
              },
              "flip": false,
              "type": "olja"
            }
          ],
          "color": "#B697D8",
          "number": {
            "_pos": {
              "_x": 19,
              "_y": 17,
              "x_ny": 20,
              "y_ny": 17.5
            },
            "nr": 11
          },
          "svg": "<polygon points=\"170,359.0896534380867 190,359.0896534380867 180,341.7691453623979\"\/>,<polygon points=\"180,341.7691453623979 200,341.7691453623979 190,359.0896534380867\"\/>,<polygon points=\"190,359.0896534380867 210,359.0896534380867 200,341.7691453623979\"\/>,<polygon points=\"200,341.7691453623979 220,341.7691453623979 210,359.0896534380867\"\/>,<polygon points=\"200,341.7691453623979 220,341.7691453623979 210,324.4486372867092\"\/>,<polygon points=\"210,324.4486372867092 230,324.4486372867092 220,341.7691453623979\"\/>,<polygon points=\"210,324.4486372867092 230,324.4486372867092 220,307.1281292110204\"\/>,<polygon points=\"200,307.1281292110204 220,307.1281292110204 210,324.4486372867092\"\/>,<polygon points=\"190,324.4486372867092 210,324.4486372867092 200,307.1281292110204\"\/>,<polygon points=\"190,324.4486372867092 210,324.4486372867092 200,341.7691453623979\"\/>,<polygon points=\"180,341.7691453623979 200,341.7691453623979 190,324.4486372867092\"\/>,<polygon points=\"170,324.4486372867092 190,324.4486372867092 180,341.7691453623979\"\/>,<polygon points=\"160,341.7691453623979 180,341.7691453623979 170,324.4486372867092\"\/>,<polygon points=\"160,341.7691453623979 180,341.7691453623979 170,359.0896534380867\"\/>",
          "pos": {
            "x": 210,
            "y": 333.10889132455
          },
          "occupiedBy": "none"
        },
        {
          "id": "3b4c-f3c0",
          "type": "djur",
          "array": [
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "17-16",
              "_pos": {
                "_x": 16,
                "_y": 16,
                "x_ny": 17,
                "y_ny": 16
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "16-17",
              "_pos": {
                "_x": 15,
                "_y": 16,
                "x_ny": 16,
                "y_ny": 17
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "16-15",
              "_pos": {
                "_x": 15,
                "_y": 15,
                "x_ny": 16,
                "y_ny": 15
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "17-16",
              "_pos": {
                "_x": 16,
                "_y": 15,
                "x_ny": 17,
                "y_ny": 16
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "18-17",
              "_pos": {
                "_x": 17,
                "_y": 16,
                "x_ny": 18,
                "y_ny": 17
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "18-15",
              "_pos": {
                "_x": 17,
                "_y": 15,
                "x_ny": 18,
                "y_ny": 15
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "19-16",
              "_pos": {
                "_x": 18,
                "_y": 15,
                "x_ny": 19,
                "y_ny": 16
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "19-14",
              "_pos": {
                "_x": 18,
                "_y": 14,
                "x_ny": 19,
                "y_ny": 14
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "20-15",
              "_pos": {
                "_x": 19,
                "_y": 14,
                "x_ny": 20,
                "y_ny": 15
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "20-13",
              "_pos": {
                "_x": 19,
                "_y": 13,
                "x_ny": 20,
                "y_ny": 13
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "19-14",
              "_pos": {
                "_x": 18,
                "_y": 13,
                "x_ny": 19,
                "y_ny": 14
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "18-13",
              "_pos": {
                "_x": 17,
                "_y": 13,
                "x_ny": 18,
                "y_ny": 13
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "18-15",
              "_pos": {
                "_x": 17,
                "_y": 14,
                "x_ny": 18,
                "y_ny": 15
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "17-14",
              "_pos": {
                "_x": 16,
                "_y": 14,
                "x_ny": 17,
                "y_ny": 14.5
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "16-15",
              "_pos": {
                "_x": 15,
                "_y": 14,
                "x_ny": 16,
                "y_ny": 15
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "17-14",
              "_pos": {
                "_x": 16,
                "_y": 13,
                "x_ny": 17,
                "y_ny": 14
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "16-13",
              "_pos": {
                "_x": 15,
                "_y": 13,
                "x_ny": 16,
                "y_ny": 13
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "15-14",
              "_pos": {
                "_x": 14,
                "_y": 13,
                "x_ny": 15,
                "y_ny": 14
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "15-12",
              "_pos": {
                "_x": 14,
                "_y": 12,
                "x_ny": 15,
                "y_ny": 12
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "14-13",
              "_pos": {
                "_x": 13,
                "_y": 12,
                "x_ny": 14,
                "y_ny": 13
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "14-11",
              "_pos": {
                "_x": 13,
                "_y": 11,
                "x_ny": 14,
                "y_ny": 11
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "13-12",
              "_pos": {
                "_x": 12,
                "_y": 11,
                "x_ny": 13,
                "y_ny": 12
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "index": "13-10",
              "_pos": {
                "_x": 12,
                "_y": 10,
                "x_ny": 13,
                "y_ny": 10
              },
              "flip": true,
              "type": "djur"
            }
          ],
          "color": "#75B96B",
          "number": {
            "_pos": {
              "_x": 16,
              "_y": 14,
              "x_ny": 17,
              "y_ny": 14.5
            },
            "nr": 2
          },
          "svg": "<polygon points=\"170,324.4486372867092 190,324.4486372867092 180,307.1281292110204\"\/>,<polygon points=\"160,307.1281292110204 180,307.1281292110204 170,324.4486372867092\"\/>,<polygon points=\"160,307.1281292110204 180,307.1281292110204 170,289.8076211353316\"\/>,<polygon points=\"170,289.8076211353316 190,289.8076211353316 180,307.1281292110204\"\/>,<polygon points=\"180,307.1281292110204 200,307.1281292110204 190,324.4486372867092\"\/>,<polygon points=\"180,307.1281292110204 200,307.1281292110204 190,289.8076211353316\"\/>,<polygon points=\"190,289.8076211353316 210,289.8076211353316 200,307.1281292110204\"\/>,<polygon points=\"190,289.8076211353316 210,289.8076211353316 200,272.48711305964287\"\/>,<polygon points=\"200,272.48711305964287 220,272.48711305964287 210,289.8076211353316\"\/>,<polygon points=\"200,272.48711305964287 220,272.48711305964287 210,255.16660498395407\"\/>,<polygon points=\"190,255.16660498395407 210,255.16660498395407 200,272.48711305964287\"\/>,<polygon points=\"180,272.48711305964287 200,272.48711305964287 190,255.16660498395407\"\/>,<polygon points=\"180,272.48711305964287 200,272.48711305964287 190,289.8076211353316\"\/>,<polygon points=\"170,289.8076211353316 190,289.8076211353316 180,272.48711305964287\"\/>,<polygon points=\"160,272.48711305964287 180,272.48711305964287 170,289.8076211353316\"\/>,<polygon points=\"170,255.16660498395407 190,255.16660498395407 180,272.48711305964287\"\/>,<polygon points=\"160,272.48711305964287 180,272.48711305964287 170,255.16660498395407\"\/>,<polygon points=\"150,255.16660498395407 170,255.16660498395407 160,272.48711305964287\"\/>,<polygon points=\"150,255.16660498395407 170,255.16660498395407 160,237.84609690826528\"\/>,<polygon points=\"140,237.84609690826528 160,237.84609690826528 150,255.16660498395407\"\/>,<polygon points=\"140,237.84609690826528 160,237.84609690826528 150,220.52558883257652\"\/>,<polygon points=\"130,220.52558883257652 150,220.52558883257652 140,237.84609690826528\"\/>,<polygon points=\"130,220.52558883257652 150,220.52558883257652 140,203.20508075688775\"\/>",
          "pos": {
            "x": 180,
            "y": 281.14736709749
          },
          "occupiedBy": "none"
        },
        {
          "id": "3d96-ebe8",
          "type": "sten",
          "array": [
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "19-12",
              "_pos": {
                "_x": 18,
                "_y": 12,
                "x_ny": 19,
                "y_ny": 12
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "18-13",
              "_pos": {
                "_x": 17,
                "_y": 12,
                "x_ny": 18,
                "y_ny": 13
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "17-12",
              "_pos": {
                "_x": 16,
                "_y": 12,
                "x_ny": 17,
                "y_ny": 12
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "16-13",
              "_pos": {
                "_x": 15,
                "_y": 12,
                "x_ny": 16,
                "y_ny": 13
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "16-11",
              "_pos": {
                "_x": 15,
                "_y": 11,
                "x_ny": 16,
                "y_ny": 11.5
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "15-12",
              "_pos": {
                "_x": 14,
                "_y": 11,
                "x_ny": 15,
                "y_ny": 12
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "15-10",
              "_pos": {
                "_x": 14,
                "_y": 10,
                "x_ny": 15,
                "y_ny": 10
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "14-11",
              "_pos": {
                "_x": 13,
                "_y": 10,
                "x_ny": 14,
                "y_ny": 11
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "14-9",
              "_pos": {
                "_x": 13,
                "_y": 9,
                "x_ny": 14,
                "y_ny": 9
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "15-10",
              "_pos": {
                "_x": 14,
                "_y": 9,
                "x_ny": 15,
                "y_ny": 10
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "16-9",
              "_pos": {
                "_x": 15,
                "_y": 9,
                "x_ny": 16,
                "y_ny": 9
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "16-11",
              "_pos": {
                "_x": 15,
                "_y": 10,
                "x_ny": 16,
                "y_ny": 11
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "17-10",
              "_pos": {
                "_x": 16,
                "_y": 10,
                "x_ny": 17,
                "y_ny": 10
              },
              "flip": true,
              "type": "sten"
            },
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "17-12",
              "_pos": {
                "_x": 16,
                "_y": 11,
                "x_ny": 17,
                "y_ny": 12
              },
              "flip": false,
              "type": "sten"
            },
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "index": "18-11",
              "_pos": {
                "_x": 17,
                "_y": 11,
                "x_ny": 18,
                "y_ny": 11
              },
              "flip": true,
              "type": "sten"
            }
          ],
          "color": "lightgray",
          "number": {
            "_pos": {
              "_x": 15,
              "_y": 11,
              "x_ny": 16,
              "y_ny": 11.5
            },
            "nr": 2
          },
          "svg": "<polygon points=\"190,255.16660498395407 210,255.16660498395407 200,237.84609690826528\"\/>,<polygon points=\"180,237.84609690826528 200,237.84609690826528 190,255.16660498395407\"\/>,<polygon points=\"170,255.16660498395407 190,255.16660498395407 180,237.84609690826528\"\/>,<polygon points=\"160,237.84609690826528 180,237.84609690826528 170,255.16660498395407\"\/>,<polygon points=\"160,237.84609690826528 180,237.84609690826528 170,220.52558883257652\"\/>,<polygon points=\"150,220.52558883257652 170,220.52558883257652 160,237.84609690826528\"\/>,<polygon points=\"150,220.52558883257652 170,220.52558883257652 160,203.20508075688775\"\/>,<polygon points=\"140,203.20508075688775 160,203.20508075688775 150,220.52558883257652\"\/>,<polygon points=\"140,203.20508075688775 160,203.20508075688775 150,185.88457268119896\"\/>,<polygon points=\"150,185.88457268119896 170,185.88457268119896 160,203.20508075688775\"\/>,<polygon points=\"160,203.20508075688775 180,203.20508075688775 170,185.88457268119896\"\/>,<polygon points=\"160,203.20508075688775 180,203.20508075688775 170,220.52558883257652\"\/>,<polygon points=\"170,220.52558883257652 190,220.52558883257652 180,203.20508075688775\"\/>,<polygon points=\"170,220.52558883257652 190,220.52558883257652 180,237.84609690826528\"\/>,<polygon points=\"180,237.84609690826528 200,237.84609690826528 190,220.52558883257652\"\/>",
          "pos": {
            "x": 170,
            "y": 229.18584287042
          },
          "occupiedBy": "none"
        },
        {
          "id": "63f5-ae76",
          "type": "djur",
          "array": [
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "20-15",
              "_pos": {
                "_x": 19,
                "_y": 15,
                "x_ny": 20,
                "y_ny": 15
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "21-16",
              "_pos": {
                "_x": 20,
                "_y": 15,
                "x_ny": 21,
                "y_ny": 16
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "22-15",
              "_pos": {
                "_x": 21,
                "_y": 15,
                "x_ny": 22,
                "y_ny": 15
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "22-17",
              "_pos": {
                "_x": 21,
                "_y": 16,
                "x_ny": 22,
                "y_ny": 17
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "21-14",
              "_pos": {
                "_x": 20,
                "_y": 14,
                "x_ny": 21,
                "y_ny": 14
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "22-15",
              "_pos": {
                "_x": 21,
                "_y": 14,
                "x_ny": 22,
                "y_ny": 15
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "23-14",
              "_pos": {
                "_x": 22,
                "_y": 14,
                "x_ny": 23,
                "y_ny": 14
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "23-16",
              "_pos": {
                "_x": 22,
                "_y": 15,
                "x_ny": 23,
                "y_ny": 16
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "24-15",
              "_pos": {
                "_x": 23,
                "_y": 15,
                "x_ny": 24,
                "y_ny": 15
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "24-17",
              "_pos": {
                "_x": 23,
                "_y": 16,
                "x_ny": 24,
                "y_ny": 16.5
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "23-16",
              "_pos": {
                "_x": 22,
                "_y": 16,
                "x_ny": 23,
                "y_ny": 16
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "23-18",
              "_pos": {
                "_x": 22,
                "_y": 17,
                "x_ny": 23,
                "y_ny": 18
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "22-17",
              "_pos": {
                "_x": 21,
                "_y": 17,
                "x_ny": 22,
                "y_ny": 17
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "25-16",
              "_pos": {
                "_x": 24,
                "_y": 16,
                "x_ny": 25,
                "y_ny": 16
              },
              "flip": true,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "26-17",
              "_pos": {
                "_x": 25,
                "_y": 16,
                "x_ny": 26,
                "y_ny": 17
              },
              "flip": false,
              "type": "djur"
            },
            {
              "refid": "63f5-ae76",
              "bp_id": "de39-9e31-9871",
              "index": "27-16",
              "_pos": {
                "_x": 26,
                "_y": 16,
                "x_ny": 27,
                "y_ny": 16
              },
              "flip": true,
              "type": "djur"
            }
          ],
          "color": "#75B96B",
          "number": {
            "_pos": {
              "_x": 23,
              "_y": 16,
              "x_ny": 24,
              "y_ny": 16.5
            },
            "nr": 10
          },
          "svg": "<polygon points=\"200,307.1281292110204 220,307.1281292110204 210,289.8076211353316\"\/>,<polygon points=\"210,289.8076211353316 230,289.8076211353316 220,307.1281292110204\"\/>,<polygon points=\"220,307.1281292110204 240,307.1281292110204 230,289.8076211353316\"\/>,<polygon points=\"220,307.1281292110204 240,307.1281292110204 230,324.4486372867092\"\/>,<polygon points=\"210,289.8076211353316 230,289.8076211353316 220,272.48711305964287\"\/>,<polygon points=\"220,272.48711305964287 240,272.48711305964287 230,289.8076211353316\"\/>,<polygon points=\"230,289.8076211353316 250,289.8076211353316 240,272.48711305964287\"\/>,<polygon points=\"230,289.8076211353316 250,289.8076211353316 240,307.1281292110204\"\/>,<polygon points=\"240,307.1281292110204 260,307.1281292110204 250,289.8076211353316\"\/>,<polygon points=\"240,307.1281292110204 260,307.1281292110204 250,324.4486372867092\"\/>,<polygon points=\"230,324.4486372867092 250,324.4486372867092 240,307.1281292110204\"\/>,<polygon points=\"230,324.4486372867092 250,324.4486372867092 240,341.7691453623979\"\/>,<polygon points=\"220,341.7691453623979 240,341.7691453623979 230,324.4486372867092\"\/>,<polygon points=\"250,324.4486372867092 270,324.4486372867092 260,307.1281292110204\"\/>,<polygon points=\"260,307.1281292110204 280,307.1281292110204 270,324.4486372867092\"\/>,<polygon points=\"270,324.4486372867092 290,324.4486372867092 280,307.1281292110204\"\/>",
          "pos": {
            "x": 250,
            "y": 315.78838324886
          },
          "occupiedBy": "none"
        },
        {
          "id": "c1c1-a918",
          "type": "s\u00e4d",
          "array": [
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "28-17",
              "_pos": {
                "_x": 27,
                "_y": 16,
                "x_ny": 28,
                "y_ny": 17
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "28-15",
              "_pos": {
                "_x": 27,
                "_y": 15,
                "x_ny": 28,
                "y_ny": 15.5
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "29-16",
              "_pos": {
                "_x": 28,
                "_y": 15,
                "x_ny": 29,
                "y_ny": 16
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "29-14",
              "_pos": {
                "_x": 28,
                "_y": 14,
                "x_ny": 29,
                "y_ny": 14
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "30-15",
              "_pos": {
                "_x": 29,
                "_y": 14,
                "x_ny": 30,
                "y_ny": 15
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "28-15",
              "_pos": {
                "_x": 27,
                "_y": 14,
                "x_ny": 28,
                "y_ny": 15
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "27-14",
              "_pos": {
                "_x": 26,
                "_y": 14,
                "x_ny": 27,
                "y_ny": 14
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "26-15",
              "_pos": {
                "_x": 25,
                "_y": 14,
                "x_ny": 26,
                "y_ny": 15
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "25-14",
              "_pos": {
                "_x": 24,
                "_y": 14,
                "x_ny": 25,
                "y_ny": 14
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "24-15",
              "_pos": {
                "_x": 23,
                "_y": 14,
                "x_ny": 24,
                "y_ny": 15
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "25-16",
              "_pos": {
                "_x": 24,
                "_y": 15,
                "x_ny": 25,
                "y_ny": 16
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "26-15",
              "_pos": {
                "_x": 25,
                "_y": 15,
                "x_ny": 26,
                "y_ny": 15
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "27-16",
              "_pos": {
                "_x": 26,
                "_y": 15,
                "x_ny": 27,
                "y_ny": 16
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "31-14",
              "_pos": {
                "_x": 30,
                "_y": 14,
                "x_ny": 31,
                "y_ny": 14
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "31-16",
              "_pos": {
                "_x": 30,
                "_y": 15,
                "x_ny": 31,
                "y_ny": 16
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "30-15",
              "_pos": {
                "_x": 29,
                "_y": 15,
                "x_ny": 30,
                "y_ny": 15
              },
              "flip": true,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "30-17",
              "_pos": {
                "_x": 29,
                "_y": 16,
                "x_ny": 30,
                "y_ny": 17
              },
              "flip": false,
              "type": "s\u00e4d"
            },
            {
              "refid": "c1c1-a918",
              "bp_id": "de39-9e31-9871",
              "index": "29-16",
              "_pos": {
                "_x": 28,
                "_y": 16,
                "x_ny": 29,
                "y_ny": 16
              },
              "flip": true,
              "type": "s\u00e4d"
            }
          ],
          "color": "#f1c40f",
          "number": {
            "_pos": {
              "_x": 27,
              "_y": 15,
              "x_ny": 28,
              "y_ny": 15.5
            },
            "nr": 5
          },
          "svg": "<polygon points=\"280,307.1281292110204 300,307.1281292110204 290,324.4486372867092\"\/>,<polygon points=\"280,307.1281292110204 300,307.1281292110204 290,289.8076211353316\"\/>,<polygon points=\"290,289.8076211353316 310,289.8076211353316 300,307.1281292110204\"\/>,<polygon points=\"290,289.8076211353316 310,289.8076211353316 300,272.48711305964287\"\/>,<polygon points=\"300,272.48711305964287 320,272.48711305964287 310,289.8076211353316\"\/>,<polygon points=\"280,272.48711305964287 300,272.48711305964287 290,289.8076211353316\"\/>,<polygon points=\"270,289.8076211353316 290,289.8076211353316 280,272.48711305964287\"\/>,<polygon points=\"260,272.48711305964287 280,272.48711305964287 270,289.8076211353316\"\/>,<polygon points=\"250,289.8076211353316 270,289.8076211353316 260,272.48711305964287\"\/>,<polygon points=\"240,272.48711305964287 260,272.48711305964287 250,289.8076211353316\"\/>,<polygon points=\"250,289.8076211353316 270,289.8076211353316 260,307.1281292110204\"\/>,<polygon points=\"260,307.1281292110204 280,307.1281292110204 270,289.8076211353316\"\/>,<polygon points=\"270,289.8076211353316 290,289.8076211353316 280,307.1281292110204\"\/>,<polygon points=\"310,289.8076211353316 330,289.8076211353316 320,272.48711305964287\"\/>,<polygon points=\"310,289.8076211353316 330,289.8076211353316 320,307.1281292110204\"\/>,<polygon points=\"300,307.1281292110204 320,307.1281292110204 310,289.8076211353316\"\/>,<polygon points=\"300,307.1281292110204 320,307.1281292110204 310,324.4486372867092\"\/>,<polygon points=\"290,324.4486372867092 310,324.4486372867092 300,307.1281292110204\"\/>",
          "pos": {
            "x": 290,
            "y": 298.46787517318
          },
          "occupiedBy": "none"
        }
      ],
      "roads": [
        [
          {
            "_x": 16,
            "_y": 9,
            "x_ny": 16,
            "y_ny": 9
          },
          {
            "_x": 21,
            "_y": 14,
            "x_ny": 21,
            "y_ny": 14
          }
        ],
        [
          {
            "_x": 21,
            "_y": 14,
            "x_ny": 21,
            "y_ny": 14
          },
          {
            "_x": 31,
            "_y": 14,
            "x_ny": 31,
            "y_ny": 14
          }
        ],
        [
          {
            "_x": 21,
            "_y": 14,
            "x_ny": 21,
            "y_ny": 14
          },
          {
            "_x": 16,
            "_y": 19,
            "x_ny": 16,
            "y_ny": 19
          }
        ]
      ],
      "buildings": [
        {
          "id": "5ea4-9102",
          "_pos": {
            "_x": 29,
            "_y": 14,
            "x_ny": 29,
            "y_ny": 14
          },
          "array": [
            {
              "index": "27-14",
              "_pos": {
                "_x": 27,
                "_y": 14,
                "x_ny": 28,
                "y_ny": 15
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "28-14",
              "_pos": {
                "_x": 28,
                "_y": 14,
                "x_ny": 29,
                "y_ny": 14
              },
              "flip": true
            },
            {
              "index": "29-14",
              "_pos": {
                "_x": 29,
                "_y": 14,
                "x_ny": 30,
                "y_ny": 15
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "27-13",
              "_pos": {
                "_x": 27,
                "_y": 13,
                "x_ny": 28,
                "y_ny": 13
              },
              "flip": true
            },
            {
              "index": "28-13",
              "_pos": {
                "_x": 28,
                "_y": 13,
                "x_ny": 29,
                "y_ny": 14
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "29-13",
              "_pos": {
                "_x": 29,
                "_y": 13,
                "x_ny": 30,
                "y_ny": 13
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "refid": "ee08",
              "type": "hamn"
            }
          ],
          "pos": {
            "x": 300,
            "y": 272.48711305964
          }
        },
        {
          "id": "d0a1-2255",
          "_pos": {
            "_x": 23,
            "_y": 14,
            "x_ny": 23,
            "y_ny": 14
          },
          "array": [
            {
              "index": "21-14",
              "_pos": {
                "_x": 21,
                "_y": 14,
                "x_ny": 22,
                "y_ny": 15
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "22-14",
              "_pos": {
                "_x": 22,
                "_y": 14,
                "x_ny": 23,
                "y_ny": 14
              },
              "flip": true
            },
            {
              "index": "23-14",
              "_pos": {
                "_x": 23,
                "_y": 14,
                "x_ny": 24,
                "y_ny": 15
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "21-13",
              "_pos": {
                "_x": 21,
                "_y": 13,
                "x_ny": 22,
                "y_ny": 13
              },
              "flip": true
            },
            {
              "index": "22-13",
              "_pos": {
                "_x": 22,
                "_y": 13,
                "x_ny": 23,
                "y_ny": 14
              },
              "flip": false,
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            },
            {
              "index": "23-13",
              "_pos": {
                "_x": 23,
                "_y": 13,
                "x_ny": 24,
                "y_ny": 13
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "refid": "e527",
              "type": "hamn"
            },
            {
              "refid": "5ab9-e799",
              "bp_id": "98c1-e360-dd6c",
              "type": "djur"
            }
          ],
          "pos": {
            "x": 240,
            "y": 272.48711305964
          }
        },
        {
          "id": "65e7-afd8",
          "_pos": {
            "_x": 20,
            "_y": 13,
            "x_ny": 20,
            "y_ny": 13
          },
          "array": [
            {
              "index": "18-13",
              "_pos": {
                "_x": 18,
                "_y": 13,
                "x_ny": 19,
                "y_ny": 14
              },
              "flip": false,
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "type": "djur"
            },
            {
              "index": "19-13",
              "_pos": {
                "_x": 19,
                "_y": 13,
                "x_ny": 20,
                "y_ny": 13
              },
              "flip": true
            },
            {
              "index": "20-13",
              "_pos": {
                "_x": 20,
                "_y": 13,
                "x_ny": 21,
                "y_ny": 14
              },
              "flip": false,
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "index": "18-12",
              "_pos": {
                "_x": 18,
                "_y": 12,
                "x_ny": 19,
                "y_ny": 12
              },
              "flip": true
            },
            {
              "index": "19-12",
              "_pos": {
                "_x": 19,
                "_y": 12,
                "x_ny": 20,
                "y_ny": 13
              },
              "flip": false,
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "type": "sten"
            },
            {
              "index": "20-12",
              "_pos": {
                "_x": 20,
                "_y": 12,
                "x_ny": 21,
                "y_ny": 12
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "type": "djur"
            },
            {
              "refid": "11e1",
              "type": "hamn"
            },
            {
              "refid": "1a66-806f",
              "bp_id": "98c1-e360-dd6c",
              "type": "olja"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "type": "sten"
            }
          ],
          "pos": {
            "x": 210,
            "y": 255.16660498395
          }
        },
        {
          "id": "67fe-93db",
          "_pos": {
            "_x": 17,
            "_y": 10,
            "x_ny": 17,
            "y_ny": 10
          },
          "array": [
            {
              "index": "15-10",
              "_pos": {
                "_x": 15,
                "_y": 10,
                "x_ny": 16,
                "y_ny": 11
              },
              "flip": false,
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "type": "sten"
            },
            {
              "index": "16-10",
              "_pos": {
                "_x": 16,
                "_y": 10,
                "x_ny": 17,
                "y_ny": 10
              },
              "flip": true
            },
            {
              "index": "17-10",
              "_pos": {
                "_x": 17,
                "_y": 10,
                "x_ny": 18,
                "y_ny": 11
              },
              "flip": false,
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "type": "sten"
            },
            {
              "index": "15-9",
              "_pos": {
                "_x": 15,
                "_y": 9,
                "x_ny": 16,
                "y_ny": 9
              },
              "flip": true
            },
            {
              "index": "16-9",
              "_pos": {
                "_x": 16,
                "_y": 9,
                "x_ny": 17,
                "y_ny": 10
              },
              "flip": false,
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "type": "sten"
            },
            {
              "index": "17-9",
              "_pos": {
                "_x": 17,
                "_y": 9,
                "x_ny": 18,
                "y_ny": 9
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "3d96-ebe8",
              "bp_id": "de39-9e31-9871",
              "type": "sten"
            },
            {
              "refid": "168b",
              "type": "hamn"
            },
            {
              "refid": "de40-2521",
              "bp_id": "98c1-e360-dd6c",
              "type": "sten"
            }
          ],
          "pos": {
            "x": 180,
            "y": 203.20508075689
          }
        },
        {
          "id": "050d-ac92",
          "_pos": {
            "_x": 20,
            "_y": 15,
            "x_ny": 20,
            "y_ny": 15
          },
          "array": [
            {
              "index": "18-15",
              "_pos": {
                "_x": 18,
                "_y": 15,
                "x_ny": 19,
                "y_ny": 16
              },
              "flip": false,
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "type": "djur"
            },
            {
              "index": "19-15",
              "_pos": {
                "_x": 19,
                "_y": 15,
                "x_ny": 20,
                "y_ny": 15
              },
              "flip": true
            },
            {
              "index": "20-15",
              "_pos": {
                "_x": 20,
                "_y": 15,
                "x_ny": 21,
                "y_ny": 16
              },
              "flip": false,
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "type": "djur"
            },
            {
              "index": "18-14",
              "_pos": {
                "_x": 18,
                "_y": 14,
                "x_ny": 19,
                "y_ny": 14
              },
              "flip": true
            },
            {
              "index": "19-14",
              "_pos": {
                "_x": 19,
                "_y": 14,
                "x_ny": 20,
                "y_ny": 15
              },
              "flip": false,
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "type": "djur"
            },
            {
              "index": "20-14",
              "_pos": {
                "_x": 20,
                "_y": 14,
                "x_ny": 21,
                "y_ny": 14
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "3b4c-f3c0",
              "bp_id": "de39-9e31-9871",
              "type": "djur"
            },
            {
              "refid": "4ae2",
              "type": "hamn"
            }
          ],
          "pos": {
            "x": 210,
            "y": 289.80762113533
          }
        },
        {
          "id": "9525-e532",
          "_pos": {
            "_x": 17,
            "_y": 18,
            "x_ny": 17,
            "y_ny": 18
          },
          "array": [
            {
              "index": "15-18",
              "_pos": {
                "_x": 15,
                "_y": 18,
                "x_ny": 16,
                "y_ny": 19
              },
              "flip": false
            },
            {
              "index": "16-18",
              "_pos": {
                "_x": 16,
                "_y": 18,
                "x_ny": 17,
                "y_ny": 18
              },
              "flip": true
            },
            {
              "index": "17-18",
              "_pos": {
                "_x": 17,
                "_y": 18,
                "x_ny": 18,
                "y_ny": 19
              },
              "flip": false,
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "type": "olja"
            },
            {
              "index": "15-17",
              "_pos": {
                "_x": 15,
                "_y": 17,
                "x_ny": 16,
                "y_ny": 17
              },
              "flip": true
            },
            {
              "index": "16-17",
              "_pos": {
                "_x": 16,
                "_y": 17,
                "x_ny": 17,
                "y_ny": 18
              },
              "flip": false,
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "type": "olja"
            },
            {
              "index": "17-17",
              "_pos": {
                "_x": 17,
                "_y": 17,
                "x_ny": 18,
                "y_ny": 17
              },
              "flip": true
            }
          ],
          "fields": [
            {
              "refid": "4322",
              "type": "hamn"
            },
            {
              "refid": "4a03-abfe",
              "bp_id": "de39-9e31-9871",
              "type": "olja"
            }
          ],
          "pos": {
            "x": 180,
            "y": 341.7691453624
          }
        }
      ],
      "svg": "<svg width=\"220\" height=\"233.20508075688775\"><g id=\"fields_de39-9e31-9871\"><g id=\"4a03-abfe\" class=\"field olja\" type=\"olja\"><polygon points=\"40,185.88457268119896 60,185.88457268119896 50,203.20508075688775\"><\/polygon><polygon points=\"40,185.88457268119896 60,185.88457268119896 50,168.5640646055102\"><\/polygon><polygon points=\"50,168.5640646055102 70,168.5640646055102 60,185.88457268119896\"><\/polygon><polygon points=\"60,185.88457268119896 80,185.88457268119896 70,168.5640646055102\"><\/polygon><polygon points=\"70,168.5640646055102 90,168.5640646055102 80,185.88457268119896\"><\/polygon><polygon points=\"70,168.5640646055102 90,168.5640646055102 80,151.24355652982143\"><\/polygon><polygon points=\"80,151.24355652982143 100,151.24355652982143 90,168.5640646055102\"><\/polygon><polygon points=\"90,168.5640646055102 110,168.5640646055102 100,151.24355652982143\"><\/polygon><polygon points=\"90,168.5640646055102 110,168.5640646055102 100,185.88457268119896\"><\/polygon><polygon points=\"80,185.88457268119896 100,185.88457268119896 90,168.5640646055102\"><\/polygon><polygon points=\"80,185.88457268119896 100,185.88457268119896 90,203.20508075688775\"><\/polygon><polygon points=\"70,203.20508075688775 90,203.20508075688775 80,185.88457268119896\"><\/polygon><polygon points=\"60,185.88457268119896 80,185.88457268119896 70,203.20508075688775\"><\/polygon><polygon points=\"50,203.20508075688775 70,203.20508075688775 60,185.88457268119896\"><\/polygon><g class=\"number\"><circle cx=\"90\" cy=\"177.2243186433546\" r=\"8.1\"><\/circle><text id=\"nr-4a03-abfe\" transform=\"matrix(1 0 0 1 90 182.2243186433546)\">11<\/text><\/g><\/g><g id=\"3b4c-f3c0\" class=\"field djur\" type=\"djur\"><polygon points=\"10,64.64101615137756 30,64.64101615137756 20,47.32050807568878\"><\/polygon><polygon points=\"10,64.64101615137756 30,64.64101615137756 20,81.96152422706632\"><\/polygon><polygon points=\"20,81.96152422706632 40,81.96152422706632 30,64.64101615137756\"><\/polygon><polygon points=\"20,81.96152422706632 40,81.96152422706632 30,99.2820323027551\"><\/polygon><polygon points=\"30,99.2820323027551 50,99.2820323027551 40,81.96152422706632\"><\/polygon><polygon points=\"30,99.2820323027551 50,99.2820323027551 40,116.60254037844388\"><\/polygon><polygon points=\"40,116.60254037844388 60,116.60254037844388 50,99.2820323027551\"><\/polygon><polygon points=\"50,99.2820323027551 70,99.2820323027551 60,116.60254037844388\"><\/polygon><polygon points=\"40,116.60254037844388 60,116.60254037844388 50,133.92304845413264\"><\/polygon><polygon points=\"50,133.92304845413264 70,133.92304845413264 60,116.60254037844388\"><\/polygon><polygon points=\"60,116.60254037844388 80,116.60254037844388 70,133.92304845413264\"><\/polygon><polygon points=\"60,116.60254037844388 80,116.60254037844388 70,99.2820323027551\"><\/polygon><polygon points=\"70,99.2820323027551 90,99.2820323027551 80,116.60254037844388\"><\/polygon><polygon points=\"80,116.60254037844388 100,116.60254037844388 90,99.2820323027551\"><\/polygon><polygon points=\"80,116.60254037844388 100,116.60254037844388 90,133.92304845413264\"><\/polygon><polygon points=\"70,133.92304845413264 90,133.92304845413264 80,116.60254037844388\"><\/polygon><polygon points=\"70,133.92304845413264 90,133.92304845413264 80,151.24355652982143\"><\/polygon><polygon points=\"60,151.24355652982143 80,151.24355652982143 70,133.92304845413264\"><\/polygon><polygon points=\"60,151.24355652982143 80,151.24355652982143 70,168.5640646055102\"><\/polygon><polygon points=\"50,133.92304845413264 70,133.92304845413264 60,151.24355652982143\"><\/polygon><polygon points=\"40,151.24355652982143 60,151.24355652982143 50,133.92304845413264\"><\/polygon><polygon points=\"40,151.24355652982143 60,151.24355652982143 50,168.5640646055102\"><\/polygon><polygon points=\"50,168.5640646055102 70,168.5640646055102 60,151.24355652982143\"><\/polygon><g class=\"number\"><circle cx=\"60\" cy=\"125.26279441628826\" r=\"8.1\"><\/circle><text id=\"nr-3b4c-f3c0\" transform=\"matrix(1 0 0 1 60 130.26279441628827)\">2<\/text><\/g><\/g><g id=\"3d96-ebe8\" class=\"field sten\" type=\"sten\"><polygon points=\"60,81.96152422706632 80,81.96152422706632 70,64.64101615137756\"><\/polygon><polygon points=\"50,64.64101615137756 70,64.64101615137756 60,81.96152422706632\"><\/polygon><polygon points=\"50,64.64101615137756 70,64.64101615137756 60,47.32050807568878\"><\/polygon><polygon points=\"40,47.32050807568878 60,47.32050807568878 50,64.64101615137756\"><\/polygon><polygon points=\"40,47.32050807568878 60,47.32050807568878 50,30\"><\/polygon><polygon points=\"30,30 50,30 40,47.32050807568878\"><\/polygon><polygon points=\"20,47.32050807568878 40,47.32050807568878 30,30\"><\/polygon><polygon points=\"20,47.32050807568878 40,47.32050807568878 30,64.64101615137756\"><\/polygon><polygon points=\"30,64.64101615137756 50,64.64101615137756 40,47.32050807568878\"><\/polygon><polygon points=\"30,64.64101615137756 50,64.64101615137756 40,81.96152422706632\"><\/polygon><polygon points=\"40,81.96152422706632 60,81.96152422706632 50,64.64101615137756\"><\/polygon><polygon points=\"40,81.96152422706632 60,81.96152422706632 50,99.2820323027551\"><\/polygon><polygon points=\"50,99.2820323027551 70,99.2820323027551 60,81.96152422706632\"><\/polygon><polygon points=\"60,81.96152422706632 80,81.96152422706632 70,99.2820323027551\"><\/polygon><polygon points=\"70,99.2820323027551 90,99.2820323027551 80,81.96152422706632\"><\/polygon><g class=\"number\"><circle cx=\"50\" cy=\"73.30127018922194\" r=\"8.1\"><\/circle><text id=\"nr-3d96-ebe8\" transform=\"matrix(1 0 0 1 50 78.30127018922194)\">2<\/text><\/g><\/g><g id=\"63f5-ae76\" class=\"field djur\" type=\"djur\"><polygon points=\"150,168.5640646055102 170,168.5640646055102 160,151.24355652982143\"><\/polygon><polygon points=\"140,151.24355652982143 160,151.24355652982143 150,168.5640646055102\"><\/polygon><polygon points=\"130,168.5640646055102 150,168.5640646055102 140,151.24355652982143\"><\/polygon><polygon points=\"100,185.88457268119896 120,185.88457268119896 110,168.5640646055102\"><\/polygon><polygon points=\"110,168.5640646055102 130,168.5640646055102 120,185.88457268119896\"><\/polygon><polygon points=\"110,168.5640646055102 130,168.5640646055102 120,151.24355652982143\"><\/polygon><polygon points=\"120,151.24355652982143 140,151.24355652982143 130,168.5640646055102\"><\/polygon><polygon points=\"120,151.24355652982143 140,151.24355652982143 130,133.92304845413264\"><\/polygon><polygon points=\"110,133.92304845413264 130,133.92304845413264 120,151.24355652982143\"><\/polygon><polygon points=\"110,133.92304845413264 130,133.92304845413264 120,116.60254037844388\"><\/polygon><polygon points=\"100,116.60254037844388 120,116.60254037844388 110,133.92304845413264\"><\/polygon><polygon points=\"90,133.92304845413264 110,133.92304845413264 100,116.60254037844388\"><\/polygon><polygon points=\"100,151.24355652982143 120,151.24355652982143 110,168.5640646055102\"><\/polygon><polygon points=\"100,151.24355652982143 120,151.24355652982143 110,133.92304845413264\"><\/polygon><polygon points=\"90,133.92304845413264 110,133.92304845413264 100,151.24355652982143\"><\/polygon><polygon points=\"80,151.24355652982143 100,151.24355652982143 90,133.92304845413264\"><\/polygon><g class=\"number\"><circle cx=\"130\" cy=\"159.9038105676658\" r=\"8.1\"><\/circle><text id=\"nr-63f5-ae76\" transform=\"matrix(1 0 0 1 130 164.9038105676658)\">10<\/text><\/g><\/g><g id=\"c1c1-a918\" class=\"field s\u00e4d\" type=\"s\u00e4d\"><polygon points=\"170,168.5640646055102 190,168.5640646055102 180,151.24355652982143\"><\/polygon><polygon points=\"180,151.24355652982143 200,151.24355652982143 190,168.5640646055102\"><\/polygon><polygon points=\"180,151.24355652982143 200,151.24355652982143 190,133.92304845413264\"><\/polygon><polygon points=\"190,133.92304845413264 210,133.92304845413264 200,151.24355652982143\"><\/polygon><polygon points=\"190,133.92304845413264 210,133.92304845413264 200,116.60254037844388\"><\/polygon><polygon points=\"150,133.92304845413264 170,133.92304845413264 160,151.24355652982143\"><\/polygon><polygon points=\"140,151.24355652982143 160,151.24355652982143 150,133.92304845413264\"><\/polygon><polygon points=\"130,133.92304845413264 150,133.92304845413264 140,151.24355652982143\"><\/polygon><polygon points=\"120,116.60254037844388 140,116.60254037844388 130,133.92304845413264\"><\/polygon><polygon points=\"130,133.92304845413264 150,133.92304845413264 140,116.60254037844388\"><\/polygon><polygon points=\"140,116.60254037844388 160,116.60254037844388 150,133.92304845413264\"><\/polygon><polygon points=\"150,133.92304845413264 170,133.92304845413264 160,116.60254037844388\"><\/polygon><polygon points=\"160,116.60254037844388 180,116.60254037844388 170,133.92304845413264\"><\/polygon><polygon points=\"180,116.60254037844388 200,116.60254037844388 190,133.92304845413264\"><\/polygon><polygon points=\"170,133.92304845413264 190,133.92304845413264 180,116.60254037844388\"><\/polygon><polygon points=\"170,133.92304845413264 190,133.92304845413264 180,151.24355652982143\"><\/polygon><polygon points=\"160,151.24355652982143 180,151.24355652982143 170,133.92304845413264\"><\/polygon><polygon points=\"160,151.24355652982143 180,151.24355652982143 170,168.5640646055102\"><\/polygon><g class=\"number\"><circle cx=\"170\" cy=\"142.58330249197704\" r=\"8.1\"><\/circle><text id=\"nr-c1c1-a918\" transform=\"matrix(1 0 0 1 170 147.58330249197704)\">5<\/text><\/g><\/g><\/g><g id=\"roads_de39-9e31-9871\"><g class=\"road\"><circle cx=\"50\" cy=\"30\" r=\"2\"><\/circle> <circle cx=\"100\" cy=\"116.60254037844388\" r=\"2\"><\/circle><line x1=\"50\" y1=\"30\" x2=\"100\" y2=\"116.60254037844388\"><\/line><\/g><g class=\"road\"><circle cx=\"100\" cy=\"116.60254037844388\" r=\"2\"><\/circle> <circle cx=\"200\" cy=\"116.60254037844388\" r=\"2\"><\/circle><line x1=\"100\" y1=\"116.60254037844388\" x2=\"200\" y2=\"116.60254037844388\"><\/line><\/g><g class=\"road\"><circle cx=\"100\" cy=\"116.60254037844388\" r=\"2\"><\/circle> <circle cx=\"50\" cy=\"203.20508075688775\" r=\"2\"><\/circle><line x1=\"100\" y1=\"116.60254037844388\" x2=\"50\" y2=\"203.20508075688775\"><\/line><\/g><\/g><g id=\"buildings_de39-9e31-9871\"><g class=\"building\" id=\"5ea4-9102\"><polygon points=\"160,116.60254037844388 180,116.60254037844388 170,133.92304845413264\"><\/polygon>,<polygon points=\"170,133.92304845413264 190,133.92304845413264 180,116.60254037844388\"><\/polygon>,<polygon points=\"180,116.60254037844388 200,116.60254037844388 190,133.92304845413264\"><\/polygon>,<polygon points=\"160,116.60254037844388 180,116.60254037844388 170,99.2820323027551\"><\/polygon>,<polygon points=\"170,99.2820323027551 190,99.2820323027551 180,116.60254037844388\"><\/polygon>,<polygon points=\"180,116.60254037844388 200,116.60254037844388 190,99.2820323027551\"><\/polygon><\/g><g class=\"building\" id=\"d0a1-2255\"><polygon points=\"100,116.60254037844388 120,116.60254037844388 110,133.92304845413264\"><\/polygon>,<polygon points=\"110,133.92304845413264 130,133.92304845413264 120,116.60254037844388\"><\/polygon>,<polygon points=\"120,116.60254037844388 140,116.60254037844388 130,133.92304845413264\"><\/polygon>,<polygon points=\"100,116.60254037844388 120,116.60254037844388 110,99.2820323027551\"><\/polygon>,<polygon points=\"110,99.2820323027551 130,99.2820323027551 120,116.60254037844388\"><\/polygon>,<polygon points=\"120,116.60254037844388 140,116.60254037844388 130,99.2820323027551\"><\/polygon><\/g><g class=\"building\" id=\"65e7-afd8\"><polygon points=\"70,99.2820323027551 90,99.2820323027551 80,116.60254037844388\"><\/polygon>,<polygon points=\"80,116.60254037844388 100,116.60254037844388 90,99.2820323027551\"><\/polygon>,<polygon points=\"90,99.2820323027551 110,99.2820323027551 100,116.60254037844388\"><\/polygon>,<polygon points=\"70,99.2820323027551 90,99.2820323027551 80,81.96152422706632\"><\/polygon>,<polygon points=\"80,81.96152422706632 100,81.96152422706632 90,99.2820323027551\"><\/polygon>,<polygon points=\"90,99.2820323027551 110,99.2820323027551 100,81.96152422706632\"><\/polygon><\/g><g class=\"building\" id=\"67fe-93db\"><polygon points=\"40,47.32050807568878 60,47.32050807568878 50,64.64101615137756\"><\/polygon>,<polygon points=\"50,64.64101615137756 70,64.64101615137756 60,47.32050807568878\"><\/polygon>,<polygon points=\"60,47.32050807568878 80,47.32050807568878 70,64.64101615137756\"><\/polygon>,<polygon points=\"40,47.32050807568878 60,47.32050807568878 50,30\"><\/polygon>,<polygon points=\"50,30 70,30 60,47.32050807568878\"><\/polygon>,<polygon points=\"60,47.32050807568878 80,47.32050807568878 70,30\"><\/polygon><\/g><g class=\"building\" id=\"050d-ac92\"><polygon points=\"70,133.92304845413264 90,133.92304845413264 80,151.24355652982143\"><\/polygon>,<polygon points=\"80,151.24355652982143 100,151.24355652982143 90,133.92304845413264\"><\/polygon>,<polygon points=\"90,133.92304845413264 110,133.92304845413264 100,151.24355652982143\"><\/polygon>,<polygon points=\"70,133.92304845413264 90,133.92304845413264 80,116.60254037844388\"><\/polygon>,<polygon points=\"80,116.60254037844388 100,116.60254037844388 90,133.92304845413264\"><\/polygon>,<polygon points=\"90,133.92304845413264 110,133.92304845413264 100,116.60254037844388\"><\/polygon><\/g><g class=\"building\" id=\"9525-e532\"><polygon points=\"40,185.88457268119896 60,185.88457268119896 50,203.20508075688775\"><\/polygon>,<polygon points=\"50,203.20508075688775 70,203.20508075688775 60,185.88457268119896\"><\/polygon>,<polygon points=\"60,185.88457268119896 80,185.88457268119896 70,203.20508075688775\"><\/polygon>,<polygon points=\"40,185.88457268119896 60,185.88457268119896 50,168.5640646055102\"><\/polygon>,<polygon points=\"50,168.5640646055102 70,168.5640646055102 60,185.88457268119896\"><\/polygon>,<polygon points=\"60,185.88457268119896 80,185.88457268119896 70,168.5640646055102\"><\/polygon><\/g><\/g><\/svg>",
      "prelRoad": [
        
      ],
      "roadsSVG": [
        "<circle cx=\"170\" cy=\"185.88457268119896\" r=\"2\" \/> <circle cx=\"220\" cy=\"272.48711305964287\" r=\"2\" \/><line x1=\"170\" y1=\"185.88457268119896\" x2=\"220\" y2=\"272.48711305964287\" \/>",
        "<circle cx=\"220\" cy=\"272.48711305964287\" r=\"2\" \/> <circle cx=\"320\" cy=\"272.48711305964287\" r=\"2\" \/><line x1=\"220\" y1=\"272.48711305964287\" x2=\"320\" y2=\"272.48711305964287\" \/>",
        "<circle cx=\"220\" cy=\"272.48711305964287\" r=\"2\" \/> <circle cx=\"170\" cy=\"359.0896534380867\" r=\"2\" \/><line x1=\"220\" y1=\"272.48711305964287\" x2=\"170\" y2=\"359.0896534380867\" \/>"
      ]
    }
  ],
  "svg": "<svg width=\"600\" height=\"498\"><g class=\"boardpiece\" id=\"98c1-e360-dd6c\"><g id=\"fields_98c1-e360-dd6c\"><g id=\"e9dd-24d8\" class=\"field tr\u00e4\" type=\"tr\u00e4\"><polygon points=\"230,151.24355652982143 250,151.24355652982143 240,168.5640646055102\"><\/polygon><polygon points=\"230,151.24355652982143 250,151.24355652982143 240,133.92304845413264\"><\/polygon><polygon points=\"240,133.92304845413264 260,133.92304845413264 250,151.24355652982143\"><\/polygon><polygon points=\"240,133.92304845413264 260,133.92304845413264 250,116.60254037844388\"><\/polygon><polygon points=\"250,116.60254037844388 270,116.60254037844388 260,133.92304845413264\"><\/polygon><polygon points=\"250,116.60254037844388 270,116.60254037844388 260,99.2820323027551\"><\/polygon><polygon points=\"240,99.2820323027551 260,99.2820323027551 250,116.60254037844388\"><\/polygon><polygon points=\"230,116.60254037844388 250,116.60254037844388 240,133.92304845413264\"><\/polygon><polygon points=\"220,133.92304845413264 240,133.92304845413264 230,116.60254037844388\"><\/polygon><polygon points=\"220,133.92304845413264 240,133.92304845413264 230,151.24355652982143\"><\/polygon><polygon points=\"210,151.24355652982143 230,151.24355652982143 220,133.92304845413264\"><\/polygon><polygon points=\"190,151.24355652982143 210,151.24355652982143 200,133.92304845413264\"><\/polygon><polygon points=\"200,133.92304845413264 220,133.92304845413264 210,151.24355652982143\"><\/polygon><polygon points=\"200,133.92304845413264 220,133.92304845413264 210,116.60254037844388\"><\/polygon><polygon points=\"210,116.60254037844388 230,116.60254037844388 220,133.92304845413264\"><\/polygon><polygon points=\"210,116.60254037844388 230,116.60254037844388 220,99.2820323027551\"><\/polygon><polygon points=\"220,99.2820323027551 240,99.2820323027551 230,116.60254037844388\"><\/polygon><polygon points=\"230,116.60254037844388 250,116.60254037844388 240,99.2820323027551\"><\/polygon><g class=\"number\"><circle cx=\"240\" cy=\"125.26279441628826\" r=\"8.1\"><\/circle><text id=\"nr-e9dd-24d8\" transform=\"matrix(1 0 0 1 240 130.26279441628827)\">6<\/text><\/g><\/g><g id=\"b3eb-f140\" class=\"field s\u00e4d\" type=\"s\u00e4d\"><polygon points=\"300,133.92304845413264 320,133.92304845413264 310,116.60254037844388\"><\/polygon><polygon points=\"290,116.60254037844388 310,116.60254037844388 300,133.92304845413264\"><\/polygon><polygon points=\"280,99.2820323027551 300,99.2820323027551 290,116.60254037844388\"><\/polygon><polygon points=\"290,116.60254037844388 310,116.60254037844388 300,99.2820323027551\"><\/polygon><polygon points=\"300,99.2820323027551 320,99.2820323027551 310,116.60254037844388\"><\/polygon><polygon points=\"310,116.60254037844388 330,116.60254037844388 320,99.2820323027551\"><\/polygon><polygon points=\"310,116.60254037844388 330,116.60254037844388 320,133.92304845413264\"><\/polygon><polygon points=\"320,133.92304845413264 340,133.92304845413264 330,116.60254037844388\"><\/polygon><polygon points=\"330,151.24355652982143 350,151.24355652982143 340,133.92304845413264\"><\/polygon><polygon points=\"320,133.92304845413264 340,133.92304845413264 330,151.24355652982143\"><\/polygon><polygon points=\"310,151.24355652982143 330,151.24355652982143 320,133.92304845413264\"><\/polygon><polygon points=\"300,133.92304845413264 320,133.92304845413264 310,151.24355652982143\"><\/polygon><polygon points=\"290,151.24355652982143 310,151.24355652982143 300,133.92304845413264\"><\/polygon><polygon points=\"280,133.92304845413264 300,133.92304845413264 290,151.24355652982143\"><\/polygon><polygon points=\"280,133.92304845413264 300,133.92304845413264 290,116.60254037844388\"><\/polygon><polygon points=\"270,116.60254037844388 290,116.60254037844388 280,133.92304845413264\"><\/polygon><polygon points=\"270,116.60254037844388 290,116.60254037844388 280,99.2820323027551\"><\/polygon><polygon points=\"260,99.2820323027551 280,99.2820323027551 270,116.60254037844388\"><\/polygon><g class=\"number\"><circle cx=\"290\" cy=\"125.26279441628826\" r=\"8.1\"><\/circle><text id=\"nr-b3eb-f140\" transform=\"matrix(1 0 0 1 290 130.26279441628827)\">11<\/text><\/g><\/g><g id=\"5ab9-e799\" class=\"field djur\" type=\"djur\"><polygon points=\"310,185.88457268119896 330,185.88457268119896 320,203.20508075688775\"><\/polygon><polygon points=\"310,185.88457268119896 330,185.88457268119896 320,168.5640646055102\"><\/polygon><polygon points=\"330,185.88457268119896 350,185.88457268119896 340,168.5640646055102\"><\/polygon><polygon points=\"330,185.88457268119896 350,185.88457268119896 340,203.20508075688775\"><\/polygon><polygon points=\"320,203.20508075688775 340,203.20508075688775 330,185.88457268119896\"><\/polygon><polygon points=\"320,203.20508075688775 340,203.20508075688775 330,220.52558883257652\"><\/polygon><polygon points=\"330,220.52558883257652 350,220.52558883257652 340,237.84609690826528\"><\/polygon><polygon points=\"330,220.52558883257652 350,220.52558883257652 340,203.20508075688775\"><\/polygon><polygon points=\"340,203.20508075688775 360,203.20508075688775 350,220.52558883257652\"><\/polygon><polygon points=\"340,203.20508075688775 360,203.20508075688775 350,185.88457268119896\"><\/polygon><polygon points=\"350,185.88457268119896 370,185.88457268119896 360,203.20508075688775\"><\/polygon><polygon points=\"350,185.88457268119896 370,185.88457268119896 360,168.5640646055102\"><\/polygon><polygon points=\"340,168.5640646055102 360,168.5640646055102 350,185.88457268119896\"><\/polygon><polygon points=\"340,168.5640646055102 360,168.5640646055102 350,151.24355652982143\"><\/polygon><polygon points=\"330,151.24355652982143 350,151.24355652982143 340,168.5640646055102\"><\/polygon><polygon points=\"320,168.5640646055102 340,168.5640646055102 330,185.88457268119896\"><\/polygon><polygon points=\"320,168.5640646055102 340,168.5640646055102 330,151.24355652982143\"><\/polygon><polygon points=\"310,151.24355652982143 330,151.24355652982143 320,168.5640646055102\"><\/polygon><polygon points=\"290,151.24355652982143 310,151.24355652982143 300,168.5640646055102\"><\/polygon><polygon points=\"300,168.5640646055102 320,168.5640646055102 310,151.24355652982143\"><\/polygon><polygon points=\"300,168.5640646055102 320,168.5640646055102 310,185.88457268119896\"><\/polygon><polygon points=\"300,203.20508075688775 320,203.20508075688775 310,185.88457268119896\"><\/polygon><polygon points=\"290,185.88457268119896 310,185.88457268119896 300,203.20508075688775\"><\/polygon><polygon points=\"260,237.84609690826528 280,237.84609690826528 270,255.16660498395407\"><\/polygon><polygon points=\"320,237.84609690826528 340,237.84609690826528 330,220.52558883257652\"><\/polygon><polygon points=\"310,220.52558883257652 330,220.52558883257652 320,237.84609690826528\"><\/polygon><polygon points=\"310,220.52558883257652 330,220.52558883257652 320,203.20508075688775\"><\/polygon><polygon points=\"300,203.20508075688775 320,203.20508075688775 310,220.52558883257652\"><\/polygon><polygon points=\"290,220.52558883257652 310,220.52558883257652 300,203.20508075688775\"><\/polygon><polygon points=\"280,203.20508075688775 300,203.20508075688775 290,220.52558883257652\"><\/polygon><polygon points=\"280,203.20508075688775 300,203.20508075688775 290,185.88457268119896\"><\/polygon><polygon points=\"270,220.52558883257652 290,220.52558883257652 280,203.20508075688775\"><\/polygon><polygon points=\"270,220.52558883257652 290,220.52558883257652 280,237.84609690826528\"><\/polygon><polygon points=\"260,237.84609690826528 280,237.84609690826528 270,220.52558883257652\"><\/polygon><polygon points=\"220,237.84609690826528 240,237.84609690826528 230,255.16660498395407\"><\/polygon><polygon points=\"220,237.84609690826528 240,237.84609690826528 230,220.52558883257652\"><\/polygon><polygon points=\"230,220.52558883257652 250,220.52558883257652 240,237.84609690826528\"><\/polygon><polygon points=\"240,237.84609690826528 260,237.84609690826528 250,220.52558883257652\"><\/polygon><polygon points=\"250,220.52558883257652 270,220.52558883257652 260,237.84609690826528\"><\/polygon><polygon points=\"250,185.88457268119896 270,185.88457268119896 260,168.5640646055102\"><\/polygon><polygon points=\"250,220.52558883257652 270,220.52558883257652 260,203.20508075688775\"><\/polygon><polygon points=\"260,203.20508075688775 280,203.20508075688775 270,220.52558883257652\"><\/polygon><polygon points=\"260,203.20508075688775 280,203.20508075688775 270,185.88457268119896\"><\/polygon><polygon points=\"250,185.88457268119896 270,185.88457268119896 260,203.20508075688775\"><\/polygon><polygon points=\"240,203.20508075688775 260,203.20508075688775 250,185.88457268119896\"><\/polygon><polygon points=\"230,185.88457268119896 250,185.88457268119896 240,203.20508075688775\"><\/polygon><polygon points=\"230,185.88457268119896 250,185.88457268119896 240,168.5640646055102\"><\/polygon><polygon points=\"240,168.5640646055102 260,168.5640646055102 250,185.88457268119896\"><\/polygon><polygon points=\"240,168.5640646055102 260,168.5640646055102 250,151.24355652982143\"><\/polygon><polygon points=\"260,168.5640646055102 280,168.5640646055102 270,185.88457268119896\"><\/polygon><polygon points=\"270,185.88457268119896 290,185.88457268119896 280,203.20508075688775\"><\/polygon><polygon points=\"290,185.88457268119896 310,185.88457268119896 300,168.5640646055102\"><\/polygon><polygon points=\"270,185.88457268119896 290,185.88457268119896 280,168.5640646055102\"><\/polygon><polygon points=\"280,168.5640646055102 300,168.5640646055102 290,185.88457268119896\"><\/polygon><polygon points=\"280,168.5640646055102 300,168.5640646055102 290,151.24355652982143\"><\/polygon><polygon points=\"270,151.24355652982143 290,151.24355652982143 280,133.92304845413264\"><\/polygon><polygon points=\"270,151.24355652982143 290,151.24355652982143 280,168.5640646055102\"><\/polygon><polygon points=\"260,168.5640646055102 280,168.5640646055102 270,151.24355652982143\"><\/polygon><polygon points=\"250,151.24355652982143 270,151.24355652982143 260,168.5640646055102\"><\/polygon><polygon points=\"250,151.24355652982143 270,151.24355652982143 260,133.92304845413264\"><\/polygon><polygon points=\"260,133.92304845413264 280,133.92304845413264 270,151.24355652982143\"><\/polygon><polygon points=\"260,133.92304845413264 280,133.92304845413264 270,116.60254037844388\"><\/polygon><g class=\"number\"><circle cx=\"280\" cy=\"177.2243186433546\" r=\"8.1\"><\/circle><text id=\"nr-5ab9-e799\" transform=\"matrix(1 0 0 1 280 182.2243186433546)\">5<\/text><\/g><\/g><g id=\"de40-2521\" class=\"field sten\" type=\"sten\"><polygon points=\"180,203.20508075688775 200,203.20508075688775 190,220.52558883257652\"><\/polygon><polygon points=\"190,220.52558883257652 210,220.52558883257652 200,237.84609690826528\"><\/polygon><polygon points=\"200,237.84609690826528 220,237.84609690826528 210,220.52558883257652\"><\/polygon><polygon points=\"210,220.52558883257652 230,220.52558883257652 220,237.84609690826528\"><\/polygon><polygon points=\"220,203.20508075688775 240,203.20508075688775 230,185.88457268119896\"><\/polygon><polygon points=\"240,203.20508075688775 260,203.20508075688775 250,220.52558883257652\"><\/polygon><polygon points=\"230,220.52558883257652 250,220.52558883257652 240,203.20508075688775\"><\/polygon><polygon points=\"220,203.20508075688775 240,203.20508075688775 230,220.52558883257652\"><\/polygon><polygon points=\"210,220.52558883257652 230,220.52558883257652 220,203.20508075688775\"><\/polygon><polygon points=\"220,168.5640646055102 240,168.5640646055102 230,185.88457268119896\"><\/polygon><polygon points=\"190,220.52558883257652 210,220.52558883257652 200,203.20508075688775\"><\/polygon><polygon points=\"200,203.20508075688775 220,203.20508075688775 210,220.52558883257652\"><\/polygon><polygon points=\"200,203.20508075688775 220,203.20508075688775 210,185.88457268119896\"><\/polygon><polygon points=\"210,185.88457268119896 230,185.88457268119896 220,203.20508075688775\"><\/polygon><polygon points=\"210,185.88457268119896 230,185.88457268119896 220,168.5640646055102\"><\/polygon><polygon points=\"200,168.5640646055102 220,168.5640646055102 210,185.88457268119896\"><\/polygon><polygon points=\"190,185.88457268119896 210,185.88457268119896 200,168.5640646055102\"><\/polygon><polygon points=\"190,185.88457268119896 210,185.88457268119896 200,203.20508075688775\"><\/polygon><polygon points=\"180,203.20508075688775 200,203.20508075688775 190,185.88457268119896\"><\/polygon><polygon points=\"170,185.88457268119896 190,185.88457268119896 180,203.20508075688775\"><\/polygon><polygon points=\"170,185.88457268119896 190,185.88457268119896 180,168.5640646055102\"><\/polygon><polygon points=\"180,168.5640646055102 200,168.5640646055102 190,185.88457268119896\"><\/polygon><polygon points=\"180,168.5640646055102 200,168.5640646055102 190,151.24355652982143\"><\/polygon><polygon points=\"190,151.24355652982143 210,151.24355652982143 200,168.5640646055102\"><\/polygon><polygon points=\"200,168.5640646055102 220,168.5640646055102 210,151.24355652982143\"><\/polygon><polygon points=\"210,151.24355652982143 230,151.24355652982143 220,168.5640646055102\"><\/polygon><polygon points=\"220,168.5640646055102 240,168.5640646055102 230,151.24355652982143\"><\/polygon><g class=\"number\"><circle cx=\"220\" cy=\"194.54482671904336\" r=\"8.1\"><\/circle><text id=\"nr-de40-2521\" transform=\"matrix(1 0 0 1 220 199.54482671904336)\">4<\/text><\/g><\/g><g id=\"1a66-806f\" class=\"field olja\" type=\"olja\"><polygon points=\"320,237.84609690826528 340,237.84609690826528 330,255.16660498395407\"><\/polygon><polygon points=\"310,255.16660498395407 330,255.16660498395407 320,237.84609690826528\"><\/polygon><polygon points=\"290,255.16660498395407 310,255.16660498395407 300,237.84609690826528\"><\/polygon><polygon points=\"280,272.48711305964287 300,272.48711305964287 290,255.16660498395407\"><\/polygon><polygon points=\"290,255.16660498395407 310,255.16660498395407 300,272.48711305964287\"><\/polygon><polygon points=\"300,272.48711305964287 320,272.48711305964287 310,255.16660498395407\"><\/polygon><polygon points=\"240,272.48711305964287 260,272.48711305964287 250,255.16660498395407\"><\/polygon><polygon points=\"310,255.16660498395407 330,255.16660498395407 320,272.48711305964287\"><\/polygon><polygon points=\"300,237.84609690826528 320,237.84609690826528 310,255.16660498395407\"><\/polygon><polygon points=\"300,237.84609690826528 320,237.84609690826528 310,220.52558883257652\"><\/polygon><polygon points=\"290,220.52558883257652 310,220.52558883257652 300,237.84609690826528\"><\/polygon><polygon points=\"280,237.84609690826528 300,237.84609690826528 290,220.52558883257652\"><\/polygon><polygon points=\"280,237.84609690826528 300,237.84609690826528 290,255.16660498395407\"><\/polygon><polygon points=\"270,255.16660498395407 290,255.16660498395407 280,237.84609690826528\"><\/polygon><polygon points=\"270,255.16660498395407 290,255.16660498395407 280,272.48711305964287\"><\/polygon><polygon points=\"260,272.48711305964287 280,272.48711305964287 270,255.16660498395407\"><\/polygon><polygon points=\"250,255.16660498395407 270,255.16660498395407 260,272.48711305964287\"><\/polygon><polygon points=\"250,255.16660498395407 270,255.16660498395407 260,237.84609690826528\"><\/polygon><polygon points=\"240,237.84609690826528 260,237.84609690826528 250,255.16660498395407\"><\/polygon><polygon points=\"230,255.16660498395407 250,255.16660498395407 240,237.84609690826528\"><\/polygon><polygon points=\"230,255.16660498395407 250,255.16660498395407 240,272.48711305964287\"><\/polygon><polygon points=\"220,272.48711305964287 240,272.48711305964287 230,255.16660498395407\"><\/polygon><polygon points=\"210,255.16660498395407 230,255.16660498395407 220,272.48711305964287\"><\/polygon><polygon points=\"210,255.16660498395407 230,255.16660498395407 220,237.84609690826528\"><\/polygon><polygon points=\"200,237.84609690826528 220,237.84609690826528 210,255.16660498395407\"><\/polygon><g class=\"number\"><circle cx=\"290\" cy=\"229.1858428704209\" r=\"8.1\"><\/circle><text id=\"nr-1a66-806f\" transform=\"matrix(1 0 0 1 290 234.1858428704209)\">12<\/text><\/g><\/g><\/g><g id=\"roads_98c1-e360-dd6c\"><g class=\"road\"><circle cx=\"220\" cy=\"99.2820323027551\" r=\"2\"><\/circle> <circle cx=\"320\" cy=\"99.2820323027551\" r=\"2\"><\/circle><line x1=\"220\" y1=\"99.2820323027551\" x2=\"320\" y2=\"99.2820323027551\"><\/line><\/g><g class=\"road\"><circle cx=\"320\" cy=\"99.2820323027551\" r=\"2\"><\/circle> <circle cx=\"370\" cy=\"185.88457268119896\" r=\"2\"><\/circle><line x1=\"320\" y1=\"99.2820323027551\" x2=\"370\" y2=\"185.88457268119896\"><\/line><\/g><g class=\"road\"><circle cx=\"370\" cy=\"185.88457268119896\" r=\"2\"><\/circle> <circle cx=\"320\" cy=\"272.48711305964287\" r=\"2\"><\/circle><line x1=\"370\" y1=\"185.88457268119896\" x2=\"320\" y2=\"272.48711305964287\"><\/line><\/g><g class=\"road\"><circle cx=\"320\" cy=\"272.48711305964287\" r=\"2\"><\/circle> <circle cx=\"220\" cy=\"272.48711305964287\" r=\"2\"><\/circle><line x1=\"320\" y1=\"272.48711305964287\" x2=\"220\" y2=\"272.48711305964287\"><\/line><\/g><g class=\"road\"><circle cx=\"220\" cy=\"272.48711305964287\" r=\"2\"><\/circle> <circle cx=\"170\" cy=\"185.88457268119896\" r=\"2\"><\/circle><line x1=\"220\" y1=\"272.48711305964287\" x2=\"170\" y2=\"185.88457268119896\"><\/line><\/g><g class=\"road\"><circle cx=\"170\" cy=\"185.88457268119896\" r=\"2\"><\/circle> <circle cx=\"220\" cy=\"99.2820323027551\" r=\"2\"><\/circle><line x1=\"170\" y1=\"185.88457268119896\" x2=\"220\" y2=\"99.2820323027551\"><\/line><\/g><\/g><g id=\"buildings_98c1-e360-dd6c\"><g class=\"building\" id=\"ef96-401a\"><polygon points=\"220,99.2820323027551 240,99.2820323027551 230,116.60254037844388\"><\/polygon>,<polygon points=\"230,116.60254037844388 250,116.60254037844388 240,99.2820323027551\"><\/polygon>,<polygon points=\"240,99.2820323027551 260,99.2820323027551 250,116.60254037844388\"><\/polygon>,<polygon points=\"220,99.2820323027551 240,99.2820323027551 230,81.96152422706632\"><\/polygon>,<polygon points=\"230,81.96152422706632 250,81.96152422706632 240,99.2820323027551\"><\/polygon>,<polygon points=\"240,99.2820323027551 260,99.2820323027551 250,81.96152422706632\"><\/polygon><\/g><g class=\"building\" id=\"5df7-9422\"><polygon points=\"280,99.2820323027551 300,99.2820323027551 290,116.60254037844388\"><\/polygon>,<polygon points=\"290,116.60254037844388 310,116.60254037844388 300,99.2820323027551\"><\/polygon>,<polygon points=\"300,99.2820323027551 320,99.2820323027551 310,116.60254037844388\"><\/polygon>,<polygon points=\"280,99.2820323027551 300,99.2820323027551 290,81.96152422706632\"><\/polygon>,<polygon points=\"290,81.96152422706632 310,81.96152422706632 300,99.2820323027551\"><\/polygon>,<polygon points=\"300,99.2820323027551 320,99.2820323027551 310,81.96152422706632\"><\/polygon><\/g><g class=\"building\" id=\"289c-78c2\"><polygon points=\"310,116.60254037844388 330,116.60254037844388 320,133.92304845413264\"><\/polygon>,<polygon points=\"320,133.92304845413264 340,133.92304845413264 330,116.60254037844388\"><\/polygon>,<polygon points=\"330,116.60254037844388 350,116.60254037844388 340,133.92304845413264\"><\/polygon>,<polygon points=\"310,116.60254037844388 330,116.60254037844388 320,99.2820323027551\"><\/polygon>,<polygon points=\"320,99.2820323027551 340,99.2820323027551 330,116.60254037844388\"><\/polygon>,<polygon points=\"330,116.60254037844388 350,116.60254037844388 340,99.2820323027551\"><\/polygon><\/g><g class=\"building\" id=\"72af-4b78\"><polygon points=\"340,168.5640646055102 360,168.5640646055102 350,185.88457268119896\"><\/polygon>,<polygon points=\"350,185.88457268119896 370,185.88457268119896 360,168.5640646055102\"><\/polygon>,<polygon points=\"360,168.5640646055102 380,168.5640646055102 370,185.88457268119896\"><\/polygon>,<polygon points=\"340,168.5640646055102 360,168.5640646055102 350,151.24355652982143\"><\/polygon>,<polygon points=\"350,151.24355652982143 370,151.24355652982143 360,168.5640646055102\"><\/polygon>,<polygon points=\"360,168.5640646055102 380,168.5640646055102 370,151.24355652982143\"><\/polygon><\/g><g class=\"building\" id=\"69e1-c0a4\"><polygon points=\"340,203.20508075688775 360,203.20508075688775 350,220.52558883257652\"><\/polygon>,<polygon points=\"350,220.52558883257652 370,220.52558883257652 360,203.20508075688775\"><\/polygon>,<polygon points=\"360,203.20508075688775 380,203.20508075688775 370,220.52558883257652\"><\/polygon>,<polygon points=\"340,203.20508075688775 360,203.20508075688775 350,185.88457268119896\"><\/polygon>,<polygon points=\"350,185.88457268119896 370,185.88457268119896 360,203.20508075688775\"><\/polygon>,<polygon points=\"360,203.20508075688775 380,203.20508075688775 370,185.88457268119896\"><\/polygon><\/g><g class=\"building\" id=\"f32c-c6ea\"><polygon points=\"280,272.48711305964287 300,272.48711305964287 290,289.8076211353316\"><\/polygon>,<polygon points=\"290,289.8076211353316 310,289.8076211353316 300,272.48711305964287\"><\/polygon>,<polygon points=\"300,272.48711305964287 320,272.48711305964287 310,289.8076211353316\"><\/polygon>,<polygon points=\"280,272.48711305964287 300,272.48711305964287 290,255.16660498395407\"><\/polygon>,<polygon points=\"290,255.16660498395407 310,255.16660498395407 300,272.48711305964287\"><\/polygon>,<polygon points=\"300,272.48711305964287 320,272.48711305964287 310,255.16660498395407\"><\/polygon><\/g><g class=\"building\" id=\"3032-da07\"><polygon points=\"220,272.48711305964287 240,272.48711305964287 230,289.8076211353316\"><\/polygon>,<polygon points=\"230,289.8076211353316 250,289.8076211353316 240,272.48711305964287\"><\/polygon>,<polygon points=\"240,272.48711305964287 260,272.48711305964287 250,289.8076211353316\"><\/polygon>,<polygon points=\"220,272.48711305964287 240,272.48711305964287 230,255.16660498395407\"><\/polygon>,<polygon points=\"230,255.16660498395407 250,255.16660498395407 240,272.48711305964287\"><\/polygon>,<polygon points=\"240,272.48711305964287 260,272.48711305964287 250,255.16660498395407\"><\/polygon><\/g><g class=\"building\" id=\"4e2a-da82\"><polygon points=\"190,255.16660498395407 210,255.16660498395407 200,272.48711305964287\"><\/polygon>,<polygon points=\"200,272.48711305964287 220,272.48711305964287 210,255.16660498395407\"><\/polygon>,<polygon points=\"210,255.16660498395407 230,255.16660498395407 220,272.48711305964287\"><\/polygon>,<polygon points=\"190,255.16660498395407 210,255.16660498395407 200,237.84609690826528\"><\/polygon>,<polygon points=\"200,237.84609690826528 220,237.84609690826528 210,255.16660498395407\"><\/polygon>,<polygon points=\"210,255.16660498395407 230,255.16660498395407 220,237.84609690826528\"><\/polygon><\/g><g class=\"building\" id=\"d108-9f6d\"><polygon points=\"160,203.20508075688775 180,203.20508075688775 170,220.52558883257652\"><\/polygon>,<polygon points=\"170,220.52558883257652 190,220.52558883257652 180,203.20508075688775\"><\/polygon>,<polygon points=\"180,203.20508075688775 200,203.20508075688775 190,220.52558883257652\"><\/polygon>,<polygon points=\"160,203.20508075688775 180,203.20508075688775 170,185.88457268119896\"><\/polygon>,<polygon points=\"170,185.88457268119896 190,185.88457268119896 180,203.20508075688775\"><\/polygon>,<polygon points=\"180,203.20508075688775 200,203.20508075688775 190,185.88457268119896\"><\/polygon><\/g><g class=\"building\" id=\"6ba5-ee0d\"><polygon points=\"160,168.5640646055102 180,168.5640646055102 170,185.88457268119896\"><\/polygon>,<polygon points=\"170,185.88457268119896 190,185.88457268119896 180,168.5640646055102\"><\/polygon>,<polygon points=\"180,168.5640646055102 200,168.5640646055102 190,185.88457268119896\"><\/polygon>,<polygon points=\"160,168.5640646055102 180,168.5640646055102 170,151.24355652982143\"><\/polygon>,<polygon points=\"170,151.24355652982143 190,151.24355652982143 180,168.5640646055102\"><\/polygon>,<polygon points=\"180,168.5640646055102 200,168.5640646055102 190,151.24355652982143\"><\/polygon><\/g><g class=\"building\" id=\"700f-f81d\"><polygon points=\"190,116.60254037844388 210,116.60254037844388 200,133.92304845413264\"><\/polygon>,<polygon points=\"200,133.92304845413264 220,133.92304845413264 210,116.60254037844388\"><\/polygon>,<polygon points=\"210,116.60254037844388 230,116.60254037844388 220,133.92304845413264\"><\/polygon>,<polygon points=\"190,116.60254037844388 210,116.60254037844388 200,99.2820323027551\"><\/polygon>,<polygon points=\"200,99.2820323027551 220,99.2820323027551 210,116.60254037844388\"><\/polygon>,<polygon points=\"210,116.60254037844388 230,116.60254037844388 220,99.2820323027551\"><\/polygon><\/g><g class=\"building\" id=\"59af-f3d8\"><polygon points=\"310,255.16660498395407 330,255.16660498395407 320,272.48711305964287\"><\/polygon>,<polygon points=\"320,272.48711305964287 340,272.48711305964287 330,255.16660498395407\"><\/polygon>,<polygon points=\"330,255.16660498395407 350,255.16660498395407 340,272.48711305964287\"><\/polygon>,<polygon points=\"310,255.16660498395407 330,255.16660498395407 320,237.84609690826528\"><\/polygon>,<polygon points=\"320,237.84609690826528 340,237.84609690826528 330,255.16660498395407\"><\/polygon>,<polygon points=\"330,255.16660498395407 350,255.16660498395407 340,237.84609690826528\"><\/polygon><\/g><\/g><\/g><g class=\"boardpiece\" id=\"4091-f401-d1ac\"><g id=\"fields_4091-f401-d1ac\"><g id=\"9acc-df61\" class=\"field tr\u00e4\" type=\"tr\u00e4\"><polygon points=\"360,168.5640646055102 380,168.5640646055102 370,185.88457268119896\"><\/polygon><polygon points=\"360,168.5640646055102 380,168.5640646055102 370,151.24355652982143\"><\/polygon><polygon points=\"350,151.24355652982143 370,151.24355652982143 360,168.5640646055102\"><\/polygon><polygon points=\"330,116.60254037844388 350,116.60254037844388 340,133.92304845413264\"><\/polygon><polygon points=\"340,133.92304845413264 360,133.92304845413264 350,116.60254037844388\"><\/polygon><polygon points=\"340,133.92304845413264 360,133.92304845413264 350,151.24355652982143\"><\/polygon><polygon points=\"350,151.24355652982143 370,151.24355652982143 360,133.92304845413264\"><\/polygon><polygon points=\"370,151.24355652982143 390,151.24355652982143 380,168.5640646055102\"><\/polygon><polygon points=\"370,151.24355652982143 390,151.24355652982143 380,133.92304845413264\"><\/polygon><polygon points=\"360,133.92304845413264 380,133.92304845413264 370,151.24355652982143\"><\/polygon><polygon points=\"360,133.92304845413264 380,133.92304845413264 370,116.60254037844388\"><\/polygon><polygon points=\"350,116.60254037844388 370,116.60254037844388 360,133.92304845413264\"><\/polygon><polygon points=\"350,116.60254037844388 370,116.60254037844388 360,99.2820323027551\"><\/polygon><polygon points=\"340,99.2820323027551 360,99.2820323027551 350,116.60254037844388\"><\/polygon><polygon points=\"330,116.60254037844388 350,116.60254037844388 340,99.2820323027551\"><\/polygon><polygon points=\"320,99.2820323027551 340,99.2820323027551 330,116.60254037844388\"><\/polygon><g class=\"number\"><circle cx=\"370\" cy=\"125.26279441628826\" r=\"8.1\"><\/circle><text id=\"nr-9acc-df61\" transform=\"matrix(1 0 0 1 370 130.26279441628827)\">11<\/text><\/g><\/g><g id=\"d18f-b64b\" class=\"field djur\" type=\"djur\"><polygon points=\"390,151.24355652982143 410,151.24355652982143 400,168.5640646055102\"><\/polygon><polygon points=\"380,168.5640646055102 400,168.5640646055102 390,151.24355652982143\"><\/polygon><polygon points=\"370,185.88457268119896 390,185.88457268119896 380,168.5640646055102\"><\/polygon><polygon points=\"380,168.5640646055102 400,168.5640646055102 390,185.88457268119896\"><\/polygon><polygon points=\"390,185.88457268119896 410,185.88457268119896 400,168.5640646055102\"><\/polygon><polygon points=\"400,168.5640646055102 420,168.5640646055102 410,185.88457268119896\"><\/polygon><polygon points=\"400,168.5640646055102 420,168.5640646055102 410,151.24355652982143\"><\/polygon><polygon points=\"410,151.24355652982143 430,151.24355652982143 420,168.5640646055102\"><\/polygon><polygon points=\"410,151.24355652982143 430,151.24355652982143 420,133.92304845413264\"><\/polygon><polygon points=\"420,133.92304845413264 440,133.92304845413264 430,151.24355652982143\"><\/polygon><polygon points=\"440,133.92304845413264 460,133.92304845413264 450,116.60254037844388\"><\/polygon><polygon points=\"450,116.60254037844388 470,116.60254037844388 460,133.92304845413264\"><\/polygon><polygon points=\"460,133.92304845413264 480,133.92304845413264 470,116.60254037844388\"><\/polygon><polygon points=\"470,116.60254037844388 490,116.60254037844388 480,133.92304845413264\"><\/polygon><polygon points=\"470,116.60254037844388 490,116.60254037844388 480,99.2820323027551\"><\/polygon><polygon points=\"450,116.60254037844388 470,116.60254037844388 460,99.2820323027551\"><\/polygon><polygon points=\"460,99.2820323027551 480,99.2820323027551 470,116.60254037844388\"><\/polygon><polygon points=\"460,99.2820323027551 480,99.2820323027551 470,81.96152422706632\"><\/polygon><polygon points=\"450,81.96152422706632 470,81.96152422706632 460,99.2820323027551\"><\/polygon><polygon points=\"440,99.2820323027551 460,99.2820323027551 450,81.96152422706632\"><\/polygon><polygon points=\"440,99.2820323027551 460,99.2820323027551 450,116.60254037844388\"><\/polygon><polygon points=\"430,116.60254037844388 450,116.60254037844388 440,99.2820323027551\"><\/polygon><polygon points=\"430,116.60254037844388 450,116.60254037844388 440,133.92304845413264\"><\/polygon><polygon points=\"420,133.92304845413264 440,133.92304845413264 430,116.60254037844388\"><\/polygon><polygon points=\"410,116.60254037844388 430,116.60254037844388 420,133.92304845413264\"><\/polygon><polygon points=\"400,133.92304845413264 420,133.92304845413264 410,116.60254037844388\"><\/polygon><polygon points=\"400,133.92304845413264 420,133.92304845413264 410,151.24355652982143\"><\/polygon><polygon points=\"390,151.24355652982143 410,151.24355652982143 400,133.92304845413264\"><\/polygon><polygon points=\"380,133.92304845413264 400,133.92304845413264 390,151.24355652982143\"><\/polygon><polygon points=\"380,133.92304845413264 400,133.92304845413264 390,116.60254037844388\"><\/polygon><polygon points=\"370,116.60254037844388 390,116.60254037844388 380,133.92304845413264\"><\/polygon><g class=\"number\"><circle cx=\"410\" cy=\"142.58330249197704\" r=\"8.1\"><\/circle><text id=\"nr-d18f-b64b\" transform=\"matrix(1 0 0 1 410 147.58330249197704)\">5<\/text><\/g><\/g><g id=\"d26b-91a3\" class=\"field s\u00e4d\" type=\"s\u00e4d\"><polygon points=\"450,151.24355652982143 470,151.24355652982143 460,168.5640646055102\"><\/polygon><polygon points=\"440,168.5640646055102 460,168.5640646055102 450,151.24355652982143\"><\/polygon><polygon points=\"420,168.5640646055102 440,168.5640646055102 430,151.24355652982143\"><\/polygon><polygon points=\"430,151.24355652982143 450,151.24355652982143 440,168.5640646055102\"><\/polygon><polygon points=\"430,151.24355652982143 450,151.24355652982143 440,133.92304845413264\"><\/polygon><polygon points=\"440,133.92304845413264 460,133.92304845413264 450,151.24355652982143\"><\/polygon><polygon points=\"450,151.24355652982143 470,151.24355652982143 460,133.92304845413264\"><\/polygon><polygon points=\"460,133.92304845413264 480,133.92304845413264 470,151.24355652982143\"><\/polygon><polygon points=\"470,151.24355652982143 490,151.24355652982143 480,133.92304845413264\"><\/polygon><polygon points=\"470,151.24355652982143 490,151.24355652982143 480,168.5640646055102\"><\/polygon><polygon points=\"460,168.5640646055102 480,168.5640646055102 470,151.24355652982143\"><\/polygon><polygon points=\"460,168.5640646055102 480,168.5640646055102 470,185.88457268119896\"><\/polygon><polygon points=\"450,185.88457268119896 470,185.88457268119896 460,168.5640646055102\"><\/polygon><polygon points=\"440,168.5640646055102 460,168.5640646055102 450,185.88457268119896\"><\/polygon><polygon points=\"430,185.88457268119896 450,185.88457268119896 440,168.5640646055102\"><\/polygon><polygon points=\"420,168.5640646055102 440,168.5640646055102 430,185.88457268119896\"><\/polygon><polygon points=\"410,185.88457268119896 430,185.88457268119896 420,168.5640646055102\"><\/polygon><g class=\"number\"><circle cx=\"460\" cy=\"159.9038105676658\" r=\"8.1\"><\/circle><text id=\"nr-d26b-91a3\" transform=\"matrix(1 0 0 1 460 164.9038105676658)\">10<\/text><\/g><\/g><g id=\"ee31-f6c5\" class=\"field djur\" type=\"djur\"><polygon points=\"500,203.20508075688775 520,203.20508075688775 510,185.88457268119896\"><\/polygon><polygon points=\"500,203.20508075688775 520,203.20508075688775 510,220.52558883257652\"><\/polygon><polygon points=\"490,220.52558883257652 510,220.52558883257652 500,203.20508075688775\"><\/polygon><polygon points=\"480,203.20508075688775 500,203.20508075688775 490,220.52558883257652\"><\/polygon><polygon points=\"490,185.88457268119896 510,185.88457268119896 500,203.20508075688775\"><\/polygon><polygon points=\"490,185.88457268119896 510,185.88457268119896 500,168.5640646055102\"><\/polygon><polygon points=\"470,185.88457268119896 490,185.88457268119896 480,168.5640646055102\"><\/polygon><polygon points=\"480,203.20508075688775 500,203.20508075688775 490,185.88457268119896\"><\/polygon><polygon points=\"470,185.88457268119896 490,185.88457268119896 480,203.20508075688775\"><\/polygon><polygon points=\"480,168.5640646055102 500,168.5640646055102 490,185.88457268119896\"><\/polygon><polygon points=\"480,168.5640646055102 500,168.5640646055102 490,151.24355652982143\"><\/polygon><polygon points=\"490,151.24355652982143 510,151.24355652982143 500,168.5640646055102\"><\/polygon><polygon points=\"490,151.24355652982143 510,151.24355652982143 500,133.92304845413264\"><\/polygon><polygon points=\"480,133.92304845413264 500,133.92304845413264 490,151.24355652982143\"><\/polygon><polygon points=\"480,133.92304845413264 500,133.92304845413264 490,116.60254037844388\"><\/polygon><g class=\"number\"><circle cx=\"500\" cy=\"194.54482671904336\" r=\"8.1\"><\/circle><text id=\"nr-ee31-f6c5\" transform=\"matrix(1 0 0 1 500 199.54482671904336)\">2<\/text><\/g><\/g><g id=\"46a8-6cd0\" class=\"field tr\u00e4\" type=\"tr\u00e4\"><polygon points=\"520,272.48711305964287 540,272.48711305964287 530,289.8076211353316\"><\/polygon><polygon points=\"540,272.48711305964287 560,272.48711305964287 550,289.8076211353316\"><\/polygon><polygon points=\"530,289.8076211353316 550,289.8076211353316 540,272.48711305964287\"><\/polygon><polygon points=\"530,289.8076211353316 550,289.8076211353316 540,307.1281292110204\"><\/polygon><polygon points=\"540,307.1281292110204 560,307.1281292110204 550,289.8076211353316\"><\/polygon><polygon points=\"550,289.8076211353316 570,289.8076211353316 560,307.1281292110204\"><\/polygon><polygon points=\"550,289.8076211353316 570,289.8076211353316 560,272.48711305964287\"><\/polygon><polygon points=\"560,272.48711305964287 580,272.48711305964287 570,289.8076211353316\"><\/polygon><polygon points=\"550,255.16660498395407 570,255.16660498395407 560,272.48711305964287\"><\/polygon><polygon points=\"540,272.48711305964287 560,272.48711305964287 550,255.16660498395407\"><\/polygon><polygon points=\"530,255.16660498395407 550,255.16660498395407 540,237.84609690826528\"><\/polygon><polygon points=\"520,237.84609690826528 540,237.84609690826528 530,220.52558883257652\"><\/polygon><polygon points=\"510,220.52558883257652 530,220.52558883257652 520,203.20508075688775\"><\/polygon><polygon points=\"510,220.52558883257652 530,220.52558883257652 520,237.84609690826528\"><\/polygon><polygon points=\"500,237.84609690826528 520,237.84609690826528 510,255.16660498395407\"><\/polygon><polygon points=\"510,255.16660498395407 530,255.16660498395407 520,237.84609690826528\"><\/polygon><polygon points=\"510,255.16660498395407 530,255.16660498395407 520,272.48711305964287\"><\/polygon><polygon points=\"530,255.16660498395407 550,255.16660498395407 540,272.48711305964287\"><\/polygon><polygon points=\"520,272.48711305964287 540,272.48711305964287 530,255.16660498395407\"><\/polygon><polygon points=\"520,237.84609690826528 540,237.84609690826528 530,255.16660498395407\"><\/polygon><polygon points=\"500,237.84609690826528 520,237.84609690826528 510,220.52558883257652\"><\/polygon><polygon points=\"490,220.52558883257652 510,220.52558883257652 500,237.84609690826528\"><\/polygon><g class=\"number\"><circle cx=\"550\" cy=\"281.14736709748723\" r=\"8.1\"><\/circle><text id=\"nr-46a8-6cd0\" transform=\"matrix(1 0 0 1 550 286.14736709748723)\">4<\/text><\/g><\/g><g id=\"bc8b-23fa\" class=\"field olja\" type=\"olja\"><polygon points=\"500,307.1281292110204 520,307.1281292110204 510,289.8076211353316\"><\/polygon><polygon points=\"490,289.8076211353316 510,289.8076211353316 500,307.1281292110204\"><\/polygon><polygon points=\"490,289.8076211353316 510,289.8076211353316 500,272.48711305964287\"><\/polygon><polygon points=\"480,272.48711305964287 500,272.48711305964287 490,289.8076211353316\"><\/polygon><polygon points=\"480,272.48711305964287 500,272.48711305964287 490,255.16660498395407\"><\/polygon><polygon points=\"490,255.16660498395407 510,255.16660498395407 500,237.84609690826528\"><\/polygon><polygon points=\"490,255.16660498395407 510,255.16660498395407 500,272.48711305964287\"><\/polygon><polygon points=\"500,272.48711305964287 520,272.48711305964287 510,255.16660498395407\"><\/polygon><polygon points=\"500,272.48711305964287 520,272.48711305964287 510,289.8076211353316\"><\/polygon><polygon points=\"510,289.8076211353316 530,289.8076211353316 520,272.48711305964287\"><\/polygon><polygon points=\"510,289.8076211353316 530,289.8076211353316 520,307.1281292110204\"><\/polygon><polygon points=\"520,307.1281292110204 540,307.1281292110204 530,289.8076211353316\"><\/polygon><g class=\"number\"><circle cx=\"500\" cy=\"281.14736709748723\" r=\"8.1\"><\/circle><text id=\"nr-bc8b-23fa\" transform=\"matrix(1 0 0 1 500 286.14736709748723)\">2<\/text><\/g><\/g><g id=\"0b5d-b3ed\" class=\"field djur\" type=\"djur\"><polygon points=\"380,272.48711305964287 400,272.48711305964287 390,255.16660498395407\"><\/polygon><polygon points=\"390,255.16660498395407 410,255.16660498395407 400,272.48711305964287\"><\/polygon><polygon points=\"400,237.84609690826528 420,237.84609690826528 410,255.16660498395407\"><\/polygon><polygon points=\"400,237.84609690826528 420,237.84609690826528 410,220.52558883257652\"><\/polygon><polygon points=\"430,220.52558883257652 450,220.52558883257652 440,203.20508075688775\"><\/polygon><polygon points=\"440,203.20508075688775 460,203.20508075688775 450,220.52558883257652\"><\/polygon><polygon points=\"450,220.52558883257652 470,220.52558883257652 460,203.20508075688775\"><\/polygon><polygon points=\"480,237.84609690826528 500,237.84609690826528 490,220.52558883257652\"><\/polygon><polygon points=\"470,220.52558883257652 490,220.52558883257652 480,237.84609690826528\"><\/polygon><polygon points=\"470,220.52558883257652 490,220.52558883257652 480,203.20508075688775\"><\/polygon><polygon points=\"460,203.20508075688775 480,203.20508075688775 470,220.52558883257652\"><\/polygon><polygon points=\"460,203.20508075688775 480,203.20508075688775 470,185.88457268119896\"><\/polygon><polygon points=\"450,185.88457268119896 470,185.88457268119896 460,203.20508075688775\"><\/polygon><polygon points=\"440,203.20508075688775 460,203.20508075688775 450,185.88457268119896\"><\/polygon><polygon points=\"430,185.88457268119896 450,185.88457268119896 440,203.20508075688775\"><\/polygon><polygon points=\"420,203.20508075688775 440,203.20508075688775 430,185.88457268119896\"><\/polygon><polygon points=\"420,203.20508075688775 440,203.20508075688775 430,220.52558883257652\"><\/polygon><polygon points=\"390,220.52558883257652 410,220.52558883257652 400,203.20508075688775\"><\/polygon><polygon points=\"400,203.20508075688775 420,203.20508075688775 410,220.52558883257652\"><\/polygon><polygon points=\"410,220.52558883257652 430,220.52558883257652 420,203.20508075688775\"><\/polygon><polygon points=\"410,220.52558883257652 430,220.52558883257652 420,237.84609690826528\"><\/polygon><polygon points=\"420,237.84609690826528 440,237.84609690826528 430,220.52558883257652\"><\/polygon><polygon points=\"430,220.52558883257652 450,220.52558883257652 440,237.84609690826528\"><\/polygon><polygon points=\"450,255.16660498395407 470,255.16660498395407 460,237.84609690826528\"><\/polygon><polygon points=\"440,237.84609690826528 460,237.84609690826528 450,220.52558883257652\"><\/polygon><polygon points=\"440,237.84609690826528 460,237.84609690826528 450,255.16660498395407\"><\/polygon><polygon points=\"450,220.52558883257652 470,220.52558883257652 460,237.84609690826528\"><\/polygon><polygon points=\"460,237.84609690826528 480,237.84609690826528 470,220.52558883257652\"><\/polygon><polygon points=\"460,237.84609690826528 480,237.84609690826528 470,255.16660498395407\"><\/polygon><polygon points=\"480,237.84609690826528 500,237.84609690826528 490,255.16660498395407\"><\/polygon><polygon points=\"470,255.16660498395407 490,255.16660498395407 480,237.84609690826528\"><\/polygon><polygon points=\"470,255.16660498395407 490,255.16660498395407 480,272.48711305964287\"><\/polygon><g class=\"number\"><circle cx=\"460\" cy=\"229.1858428704209\" r=\"8.1\"><\/circle><text id=\"nr-0b5d-b3ed\" transform=\"matrix(1 0 0 1 460 234.1858428704209)\">8<\/text><\/g><\/g><g id=\"6ad7-2977\" class=\"field sten\" type=\"sten\"><polygon points=\"330,289.8076211353316 350,289.8076211353316 340,272.48711305964287\"><\/polygon><polygon points=\"320,272.48711305964287 340,272.48711305964287 330,289.8076211353316\"><\/polygon><polygon points=\"350,220.52558883257652 370,220.52558883257652 360,203.20508075688775\"><\/polygon><polygon points=\"360,203.20508075688775 380,203.20508075688775 370,220.52558883257652\"><\/polygon><polygon points=\"360,203.20508075688775 380,203.20508075688775 370,185.88457268119896\"><\/polygon><polygon points=\"370,185.88457268119896 390,185.88457268119896 380,203.20508075688775\"><\/polygon><polygon points=\"410,185.88457268119896 430,185.88457268119896 420,203.20508075688775\"><\/polygon><polygon points=\"400,203.20508075688775 420,203.20508075688775 410,185.88457268119896\"><\/polygon><polygon points=\"390,185.88457268119896 410,185.88457268119896 400,203.20508075688775\"><\/polygon><polygon points=\"380,203.20508075688775 400,203.20508075688775 390,185.88457268119896\"><\/polygon><polygon points=\"380,203.20508075688775 400,203.20508075688775 390,220.52558883257652\"><\/polygon><polygon points=\"370,220.52558883257652 390,220.52558883257652 380,203.20508075688775\"><\/polygon><polygon points=\"390,220.52558883257652 410,220.52558883257652 400,237.84609690826528\"><\/polygon><polygon points=\"390,255.16660498395407 410,255.16660498395407 400,237.84609690826528\"><\/polygon><polygon points=\"380,237.84609690826528 400,237.84609690826528 390,255.16660498395407\"><\/polygon><polygon points=\"380,237.84609690826528 400,237.84609690826528 390,220.52558883257652\"><\/polygon><polygon points=\"370,220.52558883257652 390,220.52558883257652 380,237.84609690826528\"><\/polygon><polygon points=\"360,237.84609690826528 380,237.84609690826528 370,220.52558883257652\"><\/polygon><polygon points=\"350,220.52558883257652 370,220.52558883257652 360,237.84609690826528\"><\/polygon><polygon points=\"340,237.84609690826528 360,237.84609690826528 350,220.52558883257652\"><\/polygon><polygon points=\"320,272.48711305964287 340,272.48711305964287 330,255.16660498395407\"><\/polygon><polygon points=\"330,255.16660498395407 350,255.16660498395407 340,272.48711305964287\"><\/polygon><polygon points=\"330,255.16660498395407 350,255.16660498395407 340,237.84609690826528\"><\/polygon><polygon points=\"340,237.84609690826528 360,237.84609690826528 350,255.16660498395407\"><\/polygon><polygon points=\"350,255.16660498395407 370,255.16660498395407 360,272.48711305964287\"><\/polygon><polygon points=\"350,255.16660498395407 370,255.16660498395407 360,237.84609690826528\"><\/polygon><polygon points=\"360,237.84609690826528 380,237.84609690826528 370,255.16660498395407\"><\/polygon><polygon points=\"370,255.16660498395407 390,255.16660498395407 380,237.84609690826528\"><\/polygon><polygon points=\"370,255.16660498395407 390,255.16660498395407 380,272.48711305964287\"><\/polygon><g class=\"number\"><circle cx=\"370\" cy=\"246.50635094610968\" r=\"8.1\"><\/circle><text id=\"nr-6ad7-2977\" transform=\"matrix(1 0 0 1 370 251.50635094610968)\">3<\/text><\/g><\/g><\/g><g id=\"roads_4091-f401-d1ac\"><g class=\"road\"><circle cx=\"320\" cy=\"99.2820323027551\" r=\"2\"><\/circle> <circle cx=\"370\" cy=\"185.88457268119896\" r=\"2\"><\/circle><line x1=\"320\" y1=\"99.2820323027551\" x2=\"370\" y2=\"185.88457268119896\"><\/line><\/g><g class=\"road\"><circle cx=\"370\" cy=\"185.88457268119896\" r=\"2\"><\/circle> <circle cx=\"320\" cy=\"272.48711305964287\" r=\"2\"><\/circle><line x1=\"370\" y1=\"185.88457268119896\" x2=\"320\" y2=\"272.48711305964287\"><\/line><\/g><g class=\"road\"><circle cx=\"370\" cy=\"185.88457268119896\" r=\"2\"><\/circle> <circle cx=\"470\" cy=\"185.88457268119896\" r=\"2\"><\/circle><line x1=\"370\" y1=\"185.88457268119896\" x2=\"470\" y2=\"185.88457268119896\"><\/line><\/g><g class=\"road\"><circle cx=\"410\" cy=\"185.88457268119896\" r=\"2\"><\/circle> <circle cx=\"460\" cy=\"99.2820323027551\" r=\"2\"><\/circle><line x1=\"410\" y1=\"185.88457268119896\" x2=\"460\" y2=\"99.2820323027551\"><\/line><\/g><g class=\"road\"><circle cx=\"470\" cy=\"185.88457268119896\" r=\"2\"><\/circle> <circle cx=\"520\" cy=\"272.48711305964287\" r=\"2\"><\/circle><line x1=\"470\" y1=\"185.88457268119896\" x2=\"520\" y2=\"272.48711305964287\"><\/line><\/g><\/g><g id=\"buildings_4091-f401-d1ac\"><g class=\"building\" id=\"7874-d0e0\"><polygon points=\"310,116.60254037844388 330,116.60254037844388 320,133.92304845413264\"><\/polygon>,<polygon points=\"320,133.92304845413264 340,133.92304845413264 330,116.60254037844388\"><\/polygon>,<polygon points=\"330,116.60254037844388 350,116.60254037844388 340,133.92304845413264\"><\/polygon>,<polygon points=\"310,116.60254037844388 330,116.60254037844388 320,99.2820323027551\"><\/polygon>,<polygon points=\"320,99.2820323027551 340,99.2820323027551 330,116.60254037844388\"><\/polygon>,<polygon points=\"330,116.60254037844388 350,116.60254037844388 340,99.2820323027551\"><\/polygon><\/g><g class=\"building\" id=\"433e-54af\"><polygon points=\"340,168.5640646055102 360,168.5640646055102 350,185.88457268119896\"><\/polygon>,<polygon points=\"350,185.88457268119896 370,185.88457268119896 360,168.5640646055102\"><\/polygon>,<polygon points=\"360,168.5640646055102 380,168.5640646055102 370,185.88457268119896\"><\/polygon>,<polygon points=\"340,168.5640646055102 360,168.5640646055102 350,151.24355652982143\"><\/polygon>,<polygon points=\"350,151.24355652982143 370,151.24355652982143 360,168.5640646055102\"><\/polygon>,<polygon points=\"360,168.5640646055102 380,168.5640646055102 370,151.24355652982143\"><\/polygon><\/g><g class=\"building\" id=\"96a1-bf8c\"><polygon points=\"370,185.88457268119896 390,185.88457268119896 380,203.20508075688775\"><\/polygon>,<polygon points=\"380,203.20508075688775 400,203.20508075688775 390,185.88457268119896\"><\/polygon>,<polygon points=\"390,185.88457268119896 410,185.88457268119896 400,203.20508075688775\"><\/polygon>,<polygon points=\"370,185.88457268119896 390,185.88457268119896 380,168.5640646055102\"><\/polygon>,<polygon points=\"380,168.5640646055102 400,168.5640646055102 390,185.88457268119896\"><\/polygon>,<polygon points=\"390,185.88457268119896 410,185.88457268119896 400,168.5640646055102\"><\/polygon><\/g><g class=\"building\" id=\"f7c9-5cd5\"><polygon points=\"340,203.20508075688775 360,203.20508075688775 350,220.52558883257652\"><\/polygon>,<polygon points=\"350,220.52558883257652 370,220.52558883257652 360,203.20508075688775\"><\/polygon>,<polygon points=\"360,203.20508075688775 380,203.20508075688775 370,220.52558883257652\"><\/polygon>,<polygon points=\"340,203.20508075688775 360,203.20508075688775 350,185.88457268119896\"><\/polygon>,<polygon points=\"350,185.88457268119896 370,185.88457268119896 360,203.20508075688775\"><\/polygon>,<polygon points=\"360,203.20508075688775 380,203.20508075688775 370,185.88457268119896\"><\/polygon><\/g><g class=\"building\" id=\"e7e6-d349\"><polygon points=\"310,255.16660498395407 330,255.16660498395407 320,272.48711305964287\"><\/polygon>,<polygon points=\"320,272.48711305964287 340,272.48711305964287 330,255.16660498395407\"><\/polygon>,<polygon points=\"330,255.16660498395407 350,255.16660498395407 340,272.48711305964287\"><\/polygon>,<polygon points=\"310,255.16660498395407 330,255.16660498395407 320,237.84609690826528\"><\/polygon>,<polygon points=\"320,237.84609690826528 340,237.84609690826528 330,255.16660498395407\"><\/polygon>,<polygon points=\"330,255.16660498395407 350,255.16660498395407 340,237.84609690826528\"><\/polygon><\/g><g class=\"building\" id=\"d13e-d1d0\"><polygon points=\"400,168.5640646055102 420,168.5640646055102 410,185.88457268119896\"><\/polygon>,<polygon points=\"410,185.88457268119896 430,185.88457268119896 420,168.5640646055102\"><\/polygon>,<polygon points=\"420,168.5640646055102 440,168.5640646055102 430,185.88457268119896\"><\/polygon>,<polygon points=\"400,168.5640646055102 420,168.5640646055102 410,151.24355652982143\"><\/polygon>,<polygon points=\"410,151.24355652982143 430,151.24355652982143 420,168.5640646055102\"><\/polygon>,<polygon points=\"420,168.5640646055102 440,168.5640646055102 430,151.24355652982143\"><\/polygon><\/g><g class=\"building\" id=\"e0e2-88a0\"><polygon points=\"430,116.60254037844388 450,116.60254037844388 440,133.92304845413264\"><\/polygon>,<polygon points=\"440,133.92304845413264 460,133.92304845413264 450,116.60254037844388\"><\/polygon>,<polygon points=\"450,116.60254037844388 470,116.60254037844388 460,133.92304845413264\"><\/polygon>,<polygon points=\"430,116.60254037844388 450,116.60254037844388 440,99.2820323027551\"><\/polygon>,<polygon points=\"440,99.2820323027551 460,99.2820323027551 450,116.60254037844388\"><\/polygon>,<polygon points=\"450,116.60254037844388 470,116.60254037844388 460,99.2820323027551\"><\/polygon><\/g><g class=\"building\" id=\"3561-fecc\"><polygon points=\"430,185.88457268119896 450,185.88457268119896 440,203.20508075688775\"><\/polygon>,<polygon points=\"440,203.20508075688775 460,203.20508075688775 450,185.88457268119896\"><\/polygon>,<polygon points=\"450,185.88457268119896 470,185.88457268119896 460,203.20508075688775\"><\/polygon>,<polygon points=\"430,185.88457268119896 450,185.88457268119896 440,168.5640646055102\"><\/polygon>,<polygon points=\"440,168.5640646055102 460,168.5640646055102 450,185.88457268119896\"><\/polygon>,<polygon points=\"450,185.88457268119896 470,185.88457268119896 460,168.5640646055102\"><\/polygon><\/g><g class=\"building\" id=\"93ca-54c8\"><polygon points=\"460,203.20508075688775 480,203.20508075688775 470,220.52558883257652\"><\/polygon>,<polygon points=\"470,220.52558883257652 490,220.52558883257652 480,203.20508075688775\"><\/polygon>,<polygon points=\"480,203.20508075688775 500,203.20508075688775 490,220.52558883257652\"><\/polygon>,<polygon points=\"460,203.20508075688775 480,203.20508075688775 470,185.88457268119896\"><\/polygon>,<polygon points=\"470,185.88457268119896 490,185.88457268119896 480,203.20508075688775\"><\/polygon>,<polygon points=\"480,203.20508075688775 500,203.20508075688775 490,185.88457268119896\"><\/polygon><\/g><g class=\"building\" id=\"0cf5-42f8\"><polygon points=\"490,255.16660498395407 510,255.16660498395407 500,272.48711305964287\"><\/polygon>,<polygon points=\"500,272.48711305964287 520,272.48711305964287 510,255.16660498395407\"><\/polygon>,<polygon points=\"510,255.16660498395407 530,255.16660498395407 520,272.48711305964287\"><\/polygon>,<polygon points=\"490,255.16660498395407 510,255.16660498395407 500,237.84609690826528\"><\/polygon>,<polygon points=\"500,237.84609690826528 520,237.84609690826528 510,255.16660498395407\"><\/polygon>,<polygon points=\"510,255.16660498395407 530,255.16660498395407 520,237.84609690826528\"><\/polygon><\/g><\/g><\/g><g class=\"boardpiece\" id=\"de39-9e31-9871\"><g id=\"fields_de39-9e31-9871\"><g id=\"4a03-abfe\" class=\"field olja\" type=\"olja\"><polygon points=\"160,341.7691453623979 180,341.7691453623979 170,359.0896534380867\"><\/polygon><polygon points=\"160,341.7691453623979 180,341.7691453623979 170,324.4486372867092\"><\/polygon><polygon points=\"170,324.4486372867092 190,324.4486372867092 180,341.7691453623979\"><\/polygon><polygon points=\"180,341.7691453623979 200,341.7691453623979 190,324.4486372867092\"><\/polygon><polygon points=\"190,324.4486372867092 210,324.4486372867092 200,341.7691453623979\"><\/polygon><polygon points=\"190,324.4486372867092 210,324.4486372867092 200,307.1281292110204\"><\/polygon><polygon points=\"200,307.1281292110204 220,307.1281292110204 210,324.4486372867092\"><\/polygon><polygon points=\"210,324.4486372867092 230,324.4486372867092 220,307.1281292110204\"><\/polygon><polygon points=\"210,324.4486372867092 230,324.4486372867092 220,341.7691453623979\"><\/polygon><polygon points=\"200,341.7691453623979 220,341.7691453623979 210,324.4486372867092\"><\/polygon><polygon points=\"200,341.7691453623979 220,341.7691453623979 210,359.0896534380867\"><\/polygon><polygon points=\"190,359.0896534380867 210,359.0896534380867 200,341.7691453623979\"><\/polygon><polygon points=\"180,341.7691453623979 200,341.7691453623979 190,359.0896534380867\"><\/polygon><polygon points=\"170,359.0896534380867 190,359.0896534380867 180,341.7691453623979\"><\/polygon><g class=\"number\"><circle cx=\"210\" cy=\"333.10889132455355\" r=\"8.1\"><\/circle><text id=\"nr-4a03-abfe\" transform=\"matrix(1 0 0 1 210 338.10889132455355)\">11<\/text><\/g><\/g><g id=\"3b4c-f3c0\" class=\"field djur\" type=\"djur\"><polygon points=\"130,220.52558883257652 150,220.52558883257652 140,203.20508075688775\"><\/polygon><polygon points=\"130,220.52558883257652 150,220.52558883257652 140,237.84609690826528\"><\/polygon><polygon points=\"140,237.84609690826528 160,237.84609690826528 150,220.52558883257652\"><\/polygon><polygon points=\"140,237.84609690826528 160,237.84609690826528 150,255.16660498395407\"><\/polygon><polygon points=\"150,255.16660498395407 170,255.16660498395407 160,237.84609690826528\"><\/polygon><polygon points=\"150,255.16660498395407 170,255.16660498395407 160,272.48711305964287\"><\/polygon><polygon points=\"160,272.48711305964287 180,272.48711305964287 170,255.16660498395407\"><\/polygon><polygon points=\"170,255.16660498395407 190,255.16660498395407 180,272.48711305964287\"><\/polygon><polygon points=\"160,272.48711305964287 180,272.48711305964287 170,289.8076211353316\"><\/polygon><polygon points=\"170,289.8076211353316 190,289.8076211353316 180,272.48711305964287\"><\/polygon><polygon points=\"180,272.48711305964287 200,272.48711305964287 190,289.8076211353316\"><\/polygon><polygon points=\"180,272.48711305964287 200,272.48711305964287 190,255.16660498395407\"><\/polygon><polygon points=\"190,255.16660498395407 210,255.16660498395407 200,272.48711305964287\"><\/polygon><polygon points=\"200,272.48711305964287 220,272.48711305964287 210,255.16660498395407\"><\/polygon><polygon points=\"200,272.48711305964287 220,272.48711305964287 210,289.8076211353316\"><\/polygon><polygon points=\"190,289.8076211353316 210,289.8076211353316 200,272.48711305964287\"><\/polygon><polygon points=\"190,289.8076211353316 210,289.8076211353316 200,307.1281292110204\"><\/polygon><polygon points=\"180,307.1281292110204 200,307.1281292110204 190,289.8076211353316\"><\/polygon><polygon points=\"180,307.1281292110204 200,307.1281292110204 190,324.4486372867092\"><\/polygon><polygon points=\"170,289.8076211353316 190,289.8076211353316 180,307.1281292110204\"><\/polygon><polygon points=\"160,307.1281292110204 180,307.1281292110204 170,289.8076211353316\"><\/polygon><polygon points=\"160,307.1281292110204 180,307.1281292110204 170,324.4486372867092\"><\/polygon><polygon points=\"170,324.4486372867092 190,324.4486372867092 180,307.1281292110204\"><\/polygon><g class=\"number\"><circle cx=\"180\" cy=\"281.14736709748723\" r=\"8.1\"><\/circle><text id=\"nr-3b4c-f3c0\" transform=\"matrix(1 0 0 1 180 286.14736709748723)\">2<\/text><\/g><\/g><g id=\"3d96-ebe8\" class=\"field sten\" type=\"sten\"><polygon points=\"180,237.84609690826528 200,237.84609690826528 190,220.52558883257652\"><\/polygon><polygon points=\"170,220.52558883257652 190,220.52558883257652 180,237.84609690826528\"><\/polygon><polygon points=\"170,220.52558883257652 190,220.52558883257652 180,203.20508075688775\"><\/polygon><polygon points=\"160,203.20508075688775 180,203.20508075688775 170,220.52558883257652\"><\/polygon><polygon points=\"160,203.20508075688775 180,203.20508075688775 170,185.88457268119896\"><\/polygon><polygon points=\"150,185.88457268119896 170,185.88457268119896 160,203.20508075688775\"><\/polygon><polygon points=\"140,203.20508075688775 160,203.20508075688775 150,185.88457268119896\"><\/polygon><polygon points=\"140,203.20508075688775 160,203.20508075688775 150,220.52558883257652\"><\/polygon><polygon points=\"150,220.52558883257652 170,220.52558883257652 160,203.20508075688775\"><\/polygon><polygon points=\"150,220.52558883257652 170,220.52558883257652 160,237.84609690826528\"><\/polygon><polygon points=\"160,237.84609690826528 180,237.84609690826528 170,220.52558883257652\"><\/polygon><polygon points=\"160,237.84609690826528 180,237.84609690826528 170,255.16660498395407\"><\/polygon><polygon points=\"170,255.16660498395407 190,255.16660498395407 180,237.84609690826528\"><\/polygon><polygon points=\"180,237.84609690826528 200,237.84609690826528 190,255.16660498395407\"><\/polygon><polygon points=\"190,255.16660498395407 210,255.16660498395407 200,237.84609690826528\"><\/polygon><g class=\"number\"><circle cx=\"170\" cy=\"229.1858428704209\" r=\"8.1\"><\/circle><text id=\"nr-3d96-ebe8\" transform=\"matrix(1 0 0 1 170 234.1858428704209)\">2<\/text><\/g><\/g><g id=\"63f5-ae76\" class=\"field djur\" type=\"djur\"><polygon points=\"270,324.4486372867092 290,324.4486372867092 280,307.1281292110204\"><\/polygon><polygon points=\"260,307.1281292110204 280,307.1281292110204 270,324.4486372867092\"><\/polygon><polygon points=\"250,324.4486372867092 270,324.4486372867092 260,307.1281292110204\"><\/polygon><polygon points=\"220,341.7691453623979 240,341.7691453623979 230,324.4486372867092\"><\/polygon><polygon points=\"230,324.4486372867092 250,324.4486372867092 240,341.7691453623979\"><\/polygon><polygon points=\"230,324.4486372867092 250,324.4486372867092 240,307.1281292110204\"><\/polygon><polygon points=\"240,307.1281292110204 260,307.1281292110204 250,324.4486372867092\"><\/polygon><polygon points=\"240,307.1281292110204 260,307.1281292110204 250,289.8076211353316\"><\/polygon><polygon points=\"230,289.8076211353316 250,289.8076211353316 240,307.1281292110204\"><\/polygon><polygon points=\"230,289.8076211353316 250,289.8076211353316 240,272.48711305964287\"><\/polygon><polygon points=\"220,272.48711305964287 240,272.48711305964287 230,289.8076211353316\"><\/polygon><polygon points=\"210,289.8076211353316 230,289.8076211353316 220,272.48711305964287\"><\/polygon><polygon points=\"220,307.1281292110204 240,307.1281292110204 230,324.4486372867092\"><\/polygon><polygon points=\"220,307.1281292110204 240,307.1281292110204 230,289.8076211353316\"><\/polygon><polygon points=\"210,289.8076211353316 230,289.8076211353316 220,307.1281292110204\"><\/polygon><polygon points=\"200,307.1281292110204 220,307.1281292110204 210,289.8076211353316\"><\/polygon><g class=\"number\"><circle cx=\"250\" cy=\"315.78838324886476\" r=\"8.1\"><\/circle><text id=\"nr-63f5-ae76\" transform=\"matrix(1 0 0 1 250 320.78838324886476)\">10<\/text><\/g><\/g><g id=\"c1c1-a918\" class=\"field s\u00e4d\" type=\"s\u00e4d\"><polygon points=\"290,324.4486372867092 310,324.4486372867092 300,307.1281292110204\"><\/polygon><polygon points=\"300,307.1281292110204 320,307.1281292110204 310,324.4486372867092\"><\/polygon><polygon points=\"300,307.1281292110204 320,307.1281292110204 310,289.8076211353316\"><\/polygon><polygon points=\"310,289.8076211353316 330,289.8076211353316 320,307.1281292110204\"><\/polygon><polygon points=\"310,289.8076211353316 330,289.8076211353316 320,272.48711305964287\"><\/polygon><polygon points=\"270,289.8076211353316 290,289.8076211353316 280,307.1281292110204\"><\/polygon><polygon points=\"260,307.1281292110204 280,307.1281292110204 270,289.8076211353316\"><\/polygon><polygon points=\"250,289.8076211353316 270,289.8076211353316 260,307.1281292110204\"><\/polygon><polygon points=\"240,272.48711305964287 260,272.48711305964287 250,289.8076211353316\"><\/polygon><polygon points=\"250,289.8076211353316 270,289.8076211353316 260,272.48711305964287\"><\/polygon><polygon points=\"260,272.48711305964287 280,272.48711305964287 270,289.8076211353316\"><\/polygon><polygon points=\"270,289.8076211353316 290,289.8076211353316 280,272.48711305964287\"><\/polygon><polygon points=\"280,272.48711305964287 300,272.48711305964287 290,289.8076211353316\"><\/polygon><polygon points=\"300,272.48711305964287 320,272.48711305964287 310,289.8076211353316\"><\/polygon><polygon points=\"290,289.8076211353316 310,289.8076211353316 300,272.48711305964287\"><\/polygon><polygon points=\"290,289.8076211353316 310,289.8076211353316 300,307.1281292110204\"><\/polygon><polygon points=\"280,307.1281292110204 300,307.1281292110204 290,289.8076211353316\"><\/polygon><polygon points=\"280,307.1281292110204 300,307.1281292110204 290,324.4486372867092\"><\/polygon><g class=\"number\"><circle cx=\"290\" cy=\"298.467875173176\" r=\"8.1\"><\/circle><text id=\"nr-c1c1-a918\" transform=\"matrix(1 0 0 1 290 303.467875173176)\">5<\/text><\/g><\/g><\/g><g id=\"roads_de39-9e31-9871\"><g class=\"road\"><circle cx=\"170\" cy=\"185.88457268119896\" r=\"2\"><\/circle> <circle cx=\"220\" cy=\"272.48711305964287\" r=\"2\"><\/circle><line x1=\"170\" y1=\"185.88457268119896\" x2=\"220\" y2=\"272.48711305964287\"><\/line><\/g><g class=\"road\"><circle cx=\"220\" cy=\"272.48711305964287\" r=\"2\"><\/circle> <circle cx=\"320\" cy=\"272.48711305964287\" r=\"2\"><\/circle><line x1=\"220\" y1=\"272.48711305964287\" x2=\"320\" y2=\"272.48711305964287\"><\/line><\/g><g class=\"road\"><circle cx=\"220\" cy=\"272.48711305964287\" r=\"2\"><\/circle> <circle cx=\"170\" cy=\"359.0896534380867\" r=\"2\"><\/circle><line x1=\"220\" y1=\"272.48711305964287\" x2=\"170\" y2=\"359.0896534380867\"><\/line><\/g><\/g><g id=\"buildings_de39-9e31-9871\"><g class=\"building\" id=\"5ea4-9102\"><polygon points=\"280,272.48711305964287 300,272.48711305964287 290,289.8076211353316\"><\/polygon>,<polygon points=\"290,289.8076211353316 310,289.8076211353316 300,272.48711305964287\"><\/polygon>,<polygon points=\"300,272.48711305964287 320,272.48711305964287 310,289.8076211353316\"><\/polygon>,<polygon points=\"280,272.48711305964287 300,272.48711305964287 290,255.16660498395407\"><\/polygon>,<polygon points=\"290,255.16660498395407 310,255.16660498395407 300,272.48711305964287\"><\/polygon>,<polygon points=\"300,272.48711305964287 320,272.48711305964287 310,255.16660498395407\"><\/polygon><\/g><g class=\"building\" id=\"d0a1-2255\"><polygon points=\"220,272.48711305964287 240,272.48711305964287 230,289.8076211353316\"><\/polygon>,<polygon points=\"230,289.8076211353316 250,289.8076211353316 240,272.48711305964287\"><\/polygon>,<polygon points=\"240,272.48711305964287 260,272.48711305964287 250,289.8076211353316\"><\/polygon>,<polygon points=\"220,272.48711305964287 240,272.48711305964287 230,255.16660498395407\"><\/polygon>,<polygon points=\"230,255.16660498395407 250,255.16660498395407 240,272.48711305964287\"><\/polygon>,<polygon points=\"240,272.48711305964287 260,272.48711305964287 250,255.16660498395407\"><\/polygon><\/g><g class=\"building\" id=\"65e7-afd8\"><polygon points=\"190,255.16660498395407 210,255.16660498395407 200,272.48711305964287\"><\/polygon>,<polygon points=\"200,272.48711305964287 220,272.48711305964287 210,255.16660498395407\"><\/polygon>,<polygon points=\"210,255.16660498395407 230,255.16660498395407 220,272.48711305964287\"><\/polygon>,<polygon points=\"190,255.16660498395407 210,255.16660498395407 200,237.84609690826528\"><\/polygon>,<polygon points=\"200,237.84609690826528 220,237.84609690826528 210,255.16660498395407\"><\/polygon>,<polygon points=\"210,255.16660498395407 230,255.16660498395407 220,237.84609690826528\"><\/polygon><\/g><g class=\"building\" id=\"67fe-93db\"><polygon points=\"160,203.20508075688775 180,203.20508075688775 170,220.52558883257652\"><\/polygon>,<polygon points=\"170,220.52558883257652 190,220.52558883257652 180,203.20508075688775\"><\/polygon>,<polygon points=\"180,203.20508075688775 200,203.20508075688775 190,220.52558883257652\"><\/polygon>,<polygon points=\"160,203.20508075688775 180,203.20508075688775 170,185.88457268119896\"><\/polygon>,<polygon points=\"170,185.88457268119896 190,185.88457268119896 180,203.20508075688775\"><\/polygon>,<polygon points=\"180,203.20508075688775 200,203.20508075688775 190,185.88457268119896\"><\/polygon><\/g><g class=\"building\" id=\"050d-ac92\"><polygon points=\"190,289.8076211353316 210,289.8076211353316 200,307.1281292110204\"><\/polygon>,<polygon points=\"200,307.1281292110204 220,307.1281292110204 210,289.8076211353316\"><\/polygon>,<polygon points=\"210,289.8076211353316 230,289.8076211353316 220,307.1281292110204\"><\/polygon>,<polygon points=\"190,289.8076211353316 210,289.8076211353316 200,272.48711305964287\"><\/polygon>,<polygon points=\"200,272.48711305964287 220,272.48711305964287 210,289.8076211353316\"><\/polygon>,<polygon points=\"210,289.8076211353316 230,289.8076211353316 220,272.48711305964287\"><\/polygon><\/g><g class=\"building\" id=\"9525-e532\"><polygon points=\"160,341.7691453623979 180,341.7691453623979 170,359.0896534380867\"><\/polygon>,<polygon points=\"170,359.0896534380867 190,359.0896534380867 180,341.7691453623979\"><\/polygon>,<polygon points=\"180,341.7691453623979 200,341.7691453623979 190,359.0896534380867\"><\/polygon>,<polygon points=\"160,341.7691453623979 180,341.7691453623979 170,324.4486372867092\"><\/polygon>,<polygon points=\"170,324.4486372867092 190,324.4486372867092 180,341.7691453623979\"><\/polygon>,<polygon points=\"180,341.7691453623979 200,341.7691453623979 190,324.4486372867092\"><\/polygon><\/g><\/g><\/g><\/svg>"
      }
   }
}




</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

#collect_btn {
      position: absolute; 
      background: #ad9d85; 
      bottom: 0px; 
      width: 100%; 
      padding: 10px 0;
      transition: 0.3s height;
}

#collect_btn > div {
      position: absolute; 
      top: 10px; 
      left: 10%; 
      padding: 10px 0; 
      background: #fafafa;
      width: 80%;
      height: 30px;
      border-radius: 5px;
      margin: 0 auto 10px auto;
      font-size: 20px;
}


/*

.triangle {
      stroke: rgba(0, 0, 0, 0.1);
    stroke-width: 1;
    fill: rgba(0, 0, 0, 0);
  }
    .triangle:hover {
      fill: lightgray;
      opacity: 0.7;
      transition: 0.1s;
    }
    .dot {
      fill: lightgray;
      stroke: rgba(0, 0, 0, 0);
    stroke-width: 20;
    }
    .dot:hover {
      r: 5;
      stroke-width: 15; 
      fill: darkgray;
      transition: 0.1s;
    }*/
  /*.field circle {
    fill: #606060;
  }
  .field text {
    text-anchor: middle;
    fill: #FFFFFF;
    font-family: 'Helvetica';
    font-size:13px;
  }*/
  /*.road {
    fill: #606060; 
    stroke: #606060;
    stroke-width: 4;
  }*/
  /*.building {
      fill: black;
      fill-opacity: 0.1;
      pointer-events: all;
  }
  .building:hover {
      fill-opacity: 0.6;
  }*/
  .new_building {
      fill: white;
  }

  .set_building {
      fill: white;
  }
  .occupy_flag {
      stroke-width: 0; stroke: black; stroke-opacity: 0.3;
  }

.resurs>div {
    height: 25px;
    width: 25px;
    border-radius: 100%;
    display: inline-block;
    box-shadow: -0.5px -2px 8px -2px black inset;
}
.trä{background-color: #1abc9c;}
.sten{background-color: #FFFFFF;}
.olja{background-color: #B697D8;}
.säd{background-color: #f1c40f;}
.djur{background-color: #75B96B;}

/*
  .field.trä polygon{ 
    fill: #1abc9c;
  }
  .field.sten polygon{ 
    fill: lightgray;
  }
  .field.olja polygon{ 
    fill: #B697D8;
  }
  .field.säd polygon{ 
    fill: #f1c40f;
  }
  .field.djur polygon{ 
    fill: #75B96B;
  }*/
  /*.trä{background-color: #1abc9c;}
    .sten{background-color: #FFFFFF;}
    .olja{background-color: #B697D8;}
    .säd{background-color: #f1c40f;}
    .djur{background-color: #75B96B;}*/
</style>
