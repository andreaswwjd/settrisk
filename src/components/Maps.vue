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
          <g v-for="bp in boardgame.boardpieces" :key="bp.id">
              <boardpiece v-bind:boardpiece="bp" >
              <g>
                <field v-for="field in bp.fields" :key="field.id" class="passive" v-bind:field="field"
                v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?selectField(field):'';"></field>
                <use v-for="field in bp.fields" class="occupy_flag" xlink:href="#svg-occupy" v-if="field.occupiedBy!='none'" v-bind:transform="'translate('+(field.pos[0]-8)+','+(field.pos[1]-26)+') scale(0.3)'" v-bind:fill="field.occupiedBy==user.username?'white':'black'"></use>
                <road v-for="road in bp.roads" :key="road.id" v-bind:road="road" ></road>
                <buildsite v-for="buildsite in bp.buildsites" :key="buildsite.id" v-bind:buildsite="buildsite" ></buildsite>
              </g>
            </boardpiece>
            </g>
          <!-- <g class="boardpiece" v-for="boardpiece in boardgame.bps" v-bind:id="boardpiece.id">
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
          </g> -->
        </g>
      </defs>

      <g id="svg-board">
        <use xlink:href="#svg-map"></use>
 
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

        <g class="yield" v-for="resurs in resurser.yield">
              <circle v-bind:cx="resurs.x" v-bind:cy="resurs.y" r="10" v-bind:style="{fill: resurser.types[resurs.type].color, filter: 'url(#shadow)', stroke: '#606060', strokeWidth: '1'}"></circle>
              <use v-bind:xlink:href="'#svg-'+ resurs.type" v-bind:style="{transform: 'translate('+(resurs.x-10)+'px,'+(resurs.y-10)+'px) scale(0.2)'}"></use>
        </g>

        <g id="new_buildings_dragmenu" v-bind:style="{transform: 'translate('+ viewBox[0] +'px,'+ viewBox[1] +'px)'}">
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

import Boardpiece from '@/maps/Boardpiece'
import Field from '@/maps/Field'
import Road from '@/maps/Road'
import Buildsite from '@/maps/Buildsite'

export default {
  name: 'maps',
  props: {
    players: Array,
    user: Object,
    buildings: Array,
    resurser: Object,
    // yield: Array,
    dices: Object,
    // types: Object,
    modals: Object
  },
  components: { Modalmenu, Resurs, Boardpiece, Field, Road, Buildsite },
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
    yieldgiving_buildings: function(){
      return this.$props.buildings.filter((b)=>{return ['By','Stad','Storstad','Fabrik'].indexOf(b.type) != -1 }).length;
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
            htmlClass: 'left',
            html: 'Info: '+building.fields.map((f)=>{ 
                  var field = this.getField(f); 
                  return field ? f.type+' '+field.number.nr : f.type;
            }).join(', ') +'<br><span style="font-size:11px;font-weight:bold;">Utdelning: % / tot<br>'+ Object.keys(building.yieldStat).map((res)=>{return '<div style="background:'+this.resurser.types[res].color+';height:13px;width:'+(building.yieldStat[res]/(this.yieldStat.tot/this.yieldgiving_buildings)*50)+'%;margin:2px 0; white-space:nowrap; display:inline-block;"> '+building.yieldStat[res]+'st</div><span style="float: right;">≈'+Math.floor(building.yieldStat[res]/this.yieldStat[res]*100)+'%/all '+res+'</span><br>'}).join('')+'</span>',
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
      console.log(this.resurser.yield)
      var transformPos = {}
      Object.keys(this.resurser.types).map((res,i,a)=>{
            transformPos[res] = {
                  x: (i+0.5) * document.documentElement.clientWidth/a.length , 
                  y: document.documentElement.clientHeight-100
            }
      })
      while(this.resurser.yield[0]){
            var resurs = this.resurser.yield.pop()
            resurs.x = transformPos[resurs.type].x + Math.random()*20-10;
            resurs.y = transformPos[resurs.type].y + Math.random()*20-10;
            this.resurser.push(resurs)
      }
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
            // 1. Roll dices
            //    -> dices.nr
            // 2. Ge utdelning och bonus
            //    - Vilka byggnader har:
            //           Angränsande fält med:
            //                - Rätt nummer (annars skippa resten)
            //                I: Byggnad har utdelning och:
            //                - Ej ockuperad eller ockuperad av User
            //                     -> Utdelning:
            //                            X resurser för X i 'byggnad.utdelning' och fält.
            //                            Spara ovanståede för notis senare i Modal: Modal.utdelning[res] += 1
            //
            //                II: Byggnad har bonus och:
            //                - Nation ockuperas av User
            //                     -> Bonus:
            //                            X resurser för X i 'bonus.antal' och 'bonus.type'.
            //                            Spara ovanståede för notis senare i Modal: 
            //                            Om 'bonus.type'=='valfri': Modal.bonus[res]+=1 
            //                            Annars                     Modal.utdelning[res]+=1
            //                            
            // 3. Skapa Modal (per utdelande byggnad):
            //    -> Du har fått X i utdelning på fält från byggnad (och X valfri)
            //       (Om valfri): ... Välj valfri resurs.
            //                     

            self.dices.roll()            
            var buildings_yeild = self.buildings.filter((building)=>{
                  if(building.utdelning){
                        building.yield = []
                        return building.fields.filter((f)=>{
                              var bp = self.getBp(f)
                              var field = self.getField(f)
                              if(field && Object.keys(self.resurser.types).indexOf(field.type) != -1 && field.number.nr == self.dices.nr() && (field.occupiedBy=='none' || field.occupiedBy==self.user.username) ){
            console.log('building condition met')
                                    if(building.bonus){
                                          for(var i=0; i<building.bonus.antal;i++){
                                                if(building.bonus.type=='valfri'){
            console.log('bonus valfri')
                                                      self.resurser.valfri.push({
                                                            type: building.bonus.type, 
                                                            x: building.pos.x+Math.random()*15-7, 
                                                            y: building.pos.y+Math.random()*15-7
                                                      })
                                                }else{
            console.log('bonus people')
                                                      self.resurser.yield.push({
                                                            type: building.bonus.type, 
                                                            x: building.pos.x+Math.random()*15-7, 
                                                            y: building.pos.y+Math.random()*15-7
                                                      })
                                                      building.yieldStat[building.bonus.type] ? building.yieldStat[building.bonus.type] += 1 : building.yieldStat[building.bonus.type] = 1;
                                                      self.yieldStat[building.bonus.type] ? self.yieldStat[building.bonus.type] +=1 : self.yieldStat[building.bonus.type] = 1;
                                                      self.yieldStat.tot += 1;
                                                }
                                          }
                                    }
                                    if(building.utdelning){
                                          for(var i=0; i<building.utdelning;i++){
            console.log('Utdelning '+field.type)
                                                self.resurser.yield.push({
                                                      type: field.type, 
                                                      x: (building.pos.x+field.pos.x)/2+Math.random()*15-7, 
                                                      y: (building.pos.y+field.pos.y)/2+Math.random()*15-7
                                                })
                                                building.yieldStat[field.type] ? building.yieldStat[field.type] += 1 : building.yieldStat[field.type] = 1;
                                                self.yieldStat[field.type] ? self.yieldStat[field.type] +=1 : self.yieldStat[field.type] = 1;
                                                self.yieldStat.tot += 1;
            // console.log(self.resurser.yield)
                                          }
                                    }
                                    return true
                              }
                        })[0];
                  }
            });

            if(buildings_yeild[0]){
                  let välj_valfri = self.resurser.valfri.map((resurs,i,a)=>{
                        return i != a.length - 1 ? 
                        {
                              title: 'Välj bonus-resurs!',
                              menu: Object.keys(self.resurser.types).map((res)=>{
                                    return {
                                          text: res, action: 'fromValfriToYield', response: {resurs: resurs, type: res}, then: 'slide'
                                    }
                              })
                        }
                        :
                        {
                              title: 'Välj bonus-resurs!',
                              menu: Object.keys(self.resurser.types).map((res)=>{
                                    return {
                                          text: res, action: 'fromValfriToYield', response: {resurs: resurs, type: res}, then: 'close'
                                    }
                              })
                        };
                  })
                  self.modals.mainModalQ.push({
                    type: 'alert',
                    isOpen: true,
                    svgClass: 'left',       
                    svg: '<div style="text-align: center; margin: -25px 0 -30px">'+self.dices.render()+'</div>',
                    content: buildings_yeild.map((building,i,a)=>{
                        return i != a.length - 1 || välj_valfri[0] ? 
                        {
                              title: 'Utdelning',
                              htmlClass: 'selection',
                              html: '<svg width="100%" height="140px" viewBox="'+(building.pos.x-width*zoom/2)+' '+(building.pos.y-height*zoom/2)+' '+width*zoom+' '+height*zoom+'"><use xlink:href="#svg-board"></use></svg>Plus en bonus!',
                              menu: [{
                                text: 'Nästa', then: 'slide'
                              }]
                        }
                        :
                        {
                              title: 'Utdelning',
                              htmlClass: 'selection',
                              html: '<svg width="100%" height="140px" viewBox="'+(building.pos.x-width*zoom/2)+' '+(building.pos.y-height*zoom/2)+' '+width*zoom+' '+height*zoom+'"><use xlink:href="#svg-board"></use></svg>',
                              menu: [{
                                text: 'Stäng', then: 'close'
                              }]
                        };
                    }).concat(välj_valfri)
                  })
            }
      }, 1000);

    this.boardgame = {"id":"567d","boardpieces":[{"id":"c375-cdc5","fields":[{"id":"8d1f-3db8","type":"trä","fill":"#1abc9c","array":[[[120,99.28],[130,116.6],[110,116.6]],[[110,116.6],[130,116.6],[120,133.92]],[[120,133.92],[130,151.24],[110,151.24]],[[120,133.92],[140,133.92],[130,151.24]],[[140,133.92],[150,151.24],[130,151.24]],[[140,133.92],[160,133.92],[150,151.24]],[[150,116.6],[160,133.92],[140,133.92]],[[130,116.6],[150,116.6],[140,133.92]],[[140,99.28],[150,116.6],[130,116.6]],[[120,99.28],[140,99.28],[130,116.6]],[[130,116.6],[140,133.92],[120,133.92]],[[150,116.6],[170,116.6],[160,133.92]],[[160,99.28],[170,116.6],[150,116.6]],[[140,99.28],[160,99.28],[150,116.6]],[[150,81.96],[160,99.28],[140,99.28]],[[170,116.6],[180,133.92],[160,133.92]],[[160,133.92],[180,133.92],[170,151.24]],[[160,133.92],[170,151.24],[150,151.24]]],"number":5,"pos":[150,128.14666666666665],"occupiedBy":"none"},{"id":"2f73-f803","type":"olja","fill":"#B697D8","array":[[[150,81.96],[170,81.96],[160,99.28]],[[170,81.96],[180,99.28],[160,99.28]],[[160,99.28],[180,99.28],[170,116.6]],[[180,99.28],[190,116.6],[170,116.6]],[[170,116.6],[190,116.6],[180,133.92]],[[190,116.6],[200,133.92],[180,133.92]],[[180,133.92],[200,133.92],[190,151.24]],[[180,133.92],[190,151.24],[170,151.24]],[[170,151.24],[190,151.24],[180,168.56]],[[170,151.24],[180,168.56],[160,168.56]],[[150,151.24],[170,151.24],[160,168.56]],[[150,151.24],[160,168.56],[140,168.56]],[[130,151.24],[150,151.24],[140,168.56]],[[130,151.24],[140,168.56],[120,168.56]],[[110,151.24],[130,151.24],[120,168.56]],[[190,151.24],[200,168.56],[180,168.56]],[[190,151.24],[210,151.24],[200,168.56]],[[200,133.92],[210,151.24],[190,151.24]],[[170,81.96],[190,81.96],[180,99.28]],[[190,81.96],[200,99.28],[180,99.28]],[[180,99.28],[200,99.28],[190,116.6]],[[200,99.28],[210,116.6],[190,116.6]],[[190,116.6],[210,116.6],[200,133.92]],[[210,116.6],[220,133.92],[200,133.92]],[[200,133.92],[220,133.92],[210,151.24]],[[210,151.24],[220,168.56],[200,168.56]]],"number":4,"pos":[190,105.05333333333333],"occupiedBy":"none"}],"roads":[{"id":"2a34-774c","pos1":[150,81.96152422706633],"pos2":[190,81.96152422706633]},{"id":"e693-2a03","pos1":[190,81.96152422706633],"pos2":[220,133.92304845413267]},{"id":"b2eb-af59","pos1":[220,133.92304845413267],"pos2":[210,151.24355652982143]},{"id":"fcb2-71ef","pos1":[210,151.24355652982143],"pos2":[110,151.24355652982143]}],"buildsites":[{"id":"0687-03b9","pos":[180,133.92304845413267],"fields":[{"bp_id":"c375-cdc5","refid":"8d1f-3db8","type":"trä","nr":5},{"bp_id":"c375-cdc5","refid":"2f73-f803","type":"olja","nr":4}]}],"transform":{"translate":[0,0],"rotation":{"angle":0,"origin":[0,0]}}},{"id":"d775-07a1","fields":[{"id":"807e-ef7e","type":"sten","fill":"lightgray","array":[[[220,99.27847577293372],[240,99.27847577293372],[230,116.59847577293371]],[[220,99.27847577293372],[230,116.59847577293371],[210,116.59847577293371]],[[210,116.59847577293371],[230,116.59847577293371],[220,133.9184757729337]],[[220,133.9184757729337],[230,151.24847577293372],[210,151.24847577293372]],[[210,151.24847577293372],[230,151.24847577293372],[220,168.5684757729337]],[[230,151.24847577293372],[240,168.5684757729337],[220,168.5684757729337]],[[230,151.24847577293372],[250,151.24847577293372],[240,168.5684757729337]],[[240,133.9184757729337],[250,151.24847577293372],[230,151.24847577293372]],[[230,116.59847577293371],[240,133.9184757729337],[220,133.9184757729337]],[[230,116.59847577293371],[250,116.59847577293371],[240,133.9184757729337]],[[240,99.27847577293372],[250,116.59847577293371],[230,116.59847577293371]],[[240,99.27847577293372],[260,99.27847577293372],[250,116.59847577293371]],[[250,116.59847577293371],[270,116.59847577293371],[260,133.9184757729337]],[[250,116.59847577293371],[260,133.9184757729337],[240,133.9184757729337]],[[220,133.9184757729337],[240,133.9184757729337],[230,151.24847577293372]],[[240,133.9184757729337],[260,133.9184757729337],[250,151.24847577293372]]],"number":5,"pos":[230,139.69514243960037],"occupiedBy":"none"}],"roads":[{"id":"2460-8af8","pos1":[220,99.28203230275514],"pos2":[250,151.24355652982143]}],"buildsites":[{"id":"1cb5-ec5c","pos":[250,116.6025403784439],"fields":[{"bp_id":"d775-07a1","refid":"807e-ef7e","type":"sten","nr":5},{"type":"hamn"}]}],"transform":{"translate":[0,0],"rotation":{"angle":0,"origin":[0,0]}}}]};
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
