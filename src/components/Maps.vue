<template>
  <div id='maps'>
    <!-- <h1> Map of Nations </h1> -->
    <svg width="1000" height="1000" v-bind:viewBox="viewBox.join(' ')" v-on:touchstart="mapMoveStart" v-on:touchmove.prevent.stop="mapMove" v-on:touchend="mapMoveEnd">
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
          <g v-for="bp in boardgame.boardpieces" v-bind:key="bp.id">
            <field v-for="field in bp.fields" v-bind:key="field.id" class="passive" v-bind:field="field" v-on:fieldclick="selectField(field)"></field>
          </g>
          <g v-for="bp in boardgame.boardpieces" v-bind:key="bp.id+'i'">
            <boardpiece v-bind:boardpiece="bp" >
              <g>
                <road v-for="road in bp.roads" v-bind:key="road.id" v-bind:road="road" ></road>
                <buildsite v-for="buildsite in bp.buildsites" v-bind:key="buildsite.id" v-bind:buildsite="buildsite" ></buildsite>
                <use v-for="field in bp.fields" v-bind:key="field.id+'i'" class="occupy_flag" xlink:href="#svg-occupy" v-if="field.occupiedBy!='none'" v-bind:transform="'translate('+(field.pos[0]-8)+','+(field.pos[1]-26)+') scale(0.3)'" v-bind:fill="players.find(p=>p.username==field.occupiedBy).color"></use>
              </g>
            </boardpiece>
          </g>
          <!-- <g class="boardpiece" v-for="boardpiece in boardgame.bps" v-bind:id="boardpiece.id">
            <g v-bind:id="'fields_'+boardpiece.id">
              <g v-for="field in boardpiece.fields" class="field" v-bind:fill="field.color" v-on:touchstart="c=true" v-on:touchmove="c=false" v-on:touchend="c?selectField(field):'';">
                <g v-html="field.svg"></g>
                <g class="number" style="text-anchor: middle; font-family: 'Helvetica'; font-size: 13px; fill: #606060;">
                  <use class="occupy_flag" xlink:href="#svg-occupy" v-if="field.occupiedBy!='none'" v-bind:transform="'translate('+(field.pos[0]-8)+','+(field.pos[1]-26)+') scale(0.3)'" v-bind:fill="field.occupiedColor"></use>
                  <circle v-bind:cx="field.pos[0]" v-bind:cy="field.pos[1]" r="8.1"></circle>
                  <text v-bind:transform="'matrix(1 0 0 1 '+field.pos[0]+' '+(field.pos[1]+4.5)+')'" fill="#FFF">{{field.number.nr}}</text>
                </g>
              </g>
            </g>
            <g v-bind:id="'roads_'+boardpiece.id">
              <g class="road" v-for="roadSVG in boardpiece.roadsSVG" v-html="roadSVG" style="fill: #606060; stroke: #606060; stroke-width: 4;"></g>
            </g>
            <g v-bind:id="'buildsites_'+boardpiece.id">
              <g class="buildsite" v-for="buildsite in boardpiece.buildings" v-bind:transform="'translate('+buildsite.pos[0]+', '+buildsite.pos[1]+')'" style="fill: black; fill-opacity: 0.1; "><polygon points="-20,0 -10,17.320508075688764 10,17.320508075688764 20,0 10,-17.320508075688764 -10,-17.320508075688764" >
          </polygon></g>
            </g>
          </g> -->
        </g>
      </defs>

      <g id="svg-board">
        <use xlink:href="#svg-map"></use>
 
        <g class="set_building" 
        v-for="building in set_buildings" v-bind:key="building.id+'site'"
        v-on:touchstart="c=true" 
        v-on:touchmove="c=false" 
        v-on:touchend="c?selectBuilding(building):'';" 
        v-bind:style="{transform: 'translate('+ (building.pos[0]) +'px,'+ (building.pos[1]) +'px)'}">
          <title>{{building.type}}</title>
          <polygon points="-20,0 -10,17.320508075688764 10,17.320508075688764 20,0 10,-17.320508075688764 -10,-17.320508075688764" >
          </polygon>
          <use v-bind:xlink:href="'#'+building.type" fill="black"></use>
        </g> 

        <g class="yield" v-for="resurs in _yield" v-bind:key="resurs.id">
              <circle v-bind:cx="resurs.x" v-bind:cy="resurs.y" r="10" v-bind:style="{fill: resurser.types[resurs.type].color, filter: 'url(#shadow)', stroke: '#606060', strokeWidth: '1'}"></circle>
              <use v-bind:xlink:href="'#svg-'+ resurs.type" v-bind:style="{transform: 'translate('+(resurs.x-10)+'px,'+(resurs.y-10)+'px) scale(0.2)'}"></use>
        </g>

        <g id="new_buildings_dragmenu" v-bind:style="{transform: 'translate('+ viewBox[0] +'px,'+ viewBox[1] +'px)'}">
          <rect width="100%" style="fill:#ad9d85; filter: url('#shadow')" v-bind:style="{height: new_buildings.length==0 ? '0' : '70'}" />
          <g class="new_building" 
            v-for="building in new_buildings" v-bind:key="building.id+'bb'"
            v-bind:style="{transform: building.pos[0] && building.pos[1] ? 'translate('+ (building.pos[0]) +'px,'+ (building.pos[1]) +'px)' : 'translate('+ (new_buildings.indexOf(building)*41+30) +'px,'+ 40 +'px)', filter: 'url(#shadow)'}"
            v-on:touchstart="buildingMoveStart($event, building)" 
            v-on:touchmove.stop.prevent="buildingMove($event, building)" 
            v-on:touchend="buildingMoveEnd($event, building)"
            v-on:transitionend="transitionEnd($event)"
          >
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
          v-on:touchend="c?collectYield():''">  
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

import Boardpiece from '@/components/Boardpiece'
import Field from '@/components/Field'
import Road from '@/components/Road'
import Buildsite from '@/components/Buildsite'

export default {
  name: 'maps',
  props: {
    players: Array,
    user: Object,
    buildings: Array,
    resurser: Object,
    // yield: Array,
    boardgame: Object,
    dices: Object,
    // types: Object,
    modals: Object
  },
  components: { Modalmenu, Resurs, Boardpiece, Field, Road, Buildsite },
  data () {
    return {
      yieldStat: {tot:0},
      lastModal: {isOpen: false, content:[]},
      currentViewBox: [0,0,1000,1000],
      moveViewBox: [0,0],
      // boardgame: {}, 
      c: false
    }
  },
  computed:{
    _yield: function(){
      return this.resurser.array.filter(r=>r.location=='yield');
    },
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
      this.boardgame.boardpieces.map((bp)=>{
      // console.log('bp', bp)
        buildingsites = buildingsites.concat(bp.buildsites);
      })
      // console.log('buildingsites', buildingsites)
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
      return this._yield.length ? '100px':'';
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
      
      let pos = [
        e.touches[0].clientX + this.viewBox[0],
        e.touches[0].clientY + this.viewBox[1]
      ]
      let posToView = [
        e.touches[0].clientX,
        e.touches[0].clientY
      ]
      
      this.closestSite = this.building_pos.find((a)=>{return Math.pow(a.pos[0]-pos[0],2)<625 && Math.pow(a.pos[1]-pos[1], 2)<625});
      
      if(this.closestSite){
        building.pos = [this.closestSite.pos[0]-this.viewBox[0], this.closestSite.pos[1]-this.viewBox[1]];
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
          svg: '<svg width="100%" height="140px" viewBox="'+(this.closestSite.pos[0]-width*zoom/2)+' '+(this.closestSite.pos[1]-height*zoom/2)+' '+width*zoom+' '+height*zoom+'"><use xlink:href="#svg-board"></use></svg>',
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
        // modal.building.id = this.closestSite.id
        modal.building.pos = this.closestSite.pos
        modal.building.fields = this.closestSite.fields
        modal.building.isBuild = true

        this.$socket.emit('updateBuilding', modal.building)
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
        svg: '<svg width="100%" height="140px" viewBox="'+(building.pos[0]-width*zoom/2)+' '+(building.pos[1]-height*zoom/2)+' '+width*zoom+' '+height*zoom+'"><use xlink:href="#svg-board"></use></svg>',
        content: [{
            title: 'Byggnad: '+building.type,
            htmlClass: 'left',
            html: 'Info: '+building.fields.map((f)=>{ 
                  var field = this.getField(f); 
                  return field ? f.type+' '+field.number : f.type;
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
      console.log('field',field)
      var width = screen.availWidth-20;
      var height = 140;
      var zoom = 0.7;
      this.setModal({
        isOpen: true,
        dismissable: true,
        svgClass: 'selection',
        svg: '<svg width="100%" height="140px" viewBox="'+(field.pos[0]-width*zoom/2)+' '+(field.pos[1]-height*zoom/2)+' '+width*zoom+' '+height*zoom+'"><use xlink:href="#svg-board"></use></svg>',
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
      // field.occupiedBy = field.occupiedBy == this.user.username ? 'none' : this.user.username ;
      this.$socket.emit('occupyField',field)
      // field.occupiedColor = this.user.color;
      // field.occupiedColor = '#f0f0f0';
      // this.nextModuleInQueue()
    },


    collectYield: function(){
      console.log('Collect yield')
      console.log(this._yield)
      var transformPos = {}
      Object.keys(this.resurser.types).map((res,i,a)=>{
            transformPos[res] = {
                  x: (i+0.5) * document.documentElement.clientWidth/a.length , 
                  y: document.documentElement.clientHeight-100
            }
      })
      // while(this.resurser.yield[0]){
      //       var resurs = this.resurser.yield.pop()
      //       resurs.x = transformPos[resurs.type].x + Math.random()*20-10;
      //       resurs.y = transformPos[resurs.type].y + Math.random()*20-10;
      //       this.resurser.push(resurs)
      // }
      this._yield.map((resurs)=>{
        resurs.x = transformPos[resurs.type].x + Math.random()*20-10;
        resurs.y = transformPos[resurs.type].y + Math.random()*20-10;
        resurs.location = 'panel';
      })
      this.$socket.emit('updateResurser',this.resurser.array)
    },

    getBp: function(f){
      return this.boardgame.boardpieces.find((bp)=>{return bp.id==f.bp_id})
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
      // var width = screen.availWidth-20;
      // var height = 140;
      // var zoom = 0.7;
      // var self = this;

      

      // var rollDices = function(){
      // setInterval(function(){
      //       console.log('Utdelning')
      //       // 1. Roll dices
      //       //    -> dices.nr
      //       // 2. Ge utdelning och bonus
      //       //    - Vilka byggnader har:
      //       //           Angränsande fält med:
      //       //                - Rätt nummer (annars skippa resten)
      //       //                I: Byggnad har utdelning och:
      //       //                - Ej ockuperad eller ockuperad av User
      //       //                     -> Utdelning:
      //       //                            X resurser för X i 'byggnad.utdelning' och fält.
      //       //                            Spara ovanståede för notis senare i Modal: Modal.utdelning[res] += 1
      //       //
      //       //                II: Byggnad har bonus och:
      //       //                - Nation ockuperas av User
      //       //                     -> Bonus:
      //       //                            X resurser för X i 'bonus.antal' och 'bonus.type'.
      //       //                            Spara ovanståede för notis senare i Modal: 
      //       //                            Om 'bonus.type'=='valfri': Modal.bonus[res]+=1 
      //       //                            Annars                     Modal.utdelning[res]+=1
      //       //                            
      //       // 3. Skapa Modal (per utdelande byggnad):
      //       //    -> Du har fått X i utdelning på fält från byggnad (och X valfri)
      //       //       (Om valfri): ... Välj valfri resurs.
      //       //                     

      //       self.dices.roll()            
      //       var buildings_yeild = self.buildings.filter((building)=>{
      //             if(building.utdelning){
      //                   building.yield = []
      //                   return building.fields.filter((f)=>{
      //                         var bp = self.getBp(f)
      //                         var field = self.getField(f)
      //                         if(field && Object.keys(self.resurser.types).indexOf(field.type) != -1 && field.number == self.dices.nr() && (field.occupiedBy=='none' || field.occupiedBy==self.user.username) ){
      //       console.log('building condition met')
      //       //                         if(building.bonus){
      //       //                               for(var i=0; i<building.bonus.antal;i++){
      //       //                                     if(building.bonus.type=='valfri'){
      //       // console.log('bonus valfri')
      //       //                                           self.resurser.valfri.push({
      //       //                                                 type: building.bonus.type, 
      //       //                                                 x: building.pos[0]+Math.random()*15-7, 
      //       //                                                 y: building.pos[1]+Math.random()*15-7
      //       //                                           })
      //       //                                     }else{
      //       // console.log('bonus people')
      //       //                                           self.resurser.yield.push({
      //       //                                                 type: building.bonus.type, 
      //       //                                                 x: building.pos[0]+Math.random()*15-7, 
      //       //                                                 y: building.pos[1]+Math.random()*15-7
      //       //                                           })
      //       //                                           building.yieldStat[building.bonus.type] ? building.yieldStat[building.bonus.type] += 1 : building.yieldStat[building.bonus.type] = 1;
      //       //                                           self.yieldStat[building.bonus.type] ? self.yieldStat[building.bonus.type] +=1 : self.yieldStat[building.bonus.type] = 1;
      //       //                                           self.yieldStat.tot += 1;
      //       //                                     }
      //       //                               }
      //       //                         }
      //                               if(building.utdelning){
      //                                     for(var i=0; i<building.utdelning;i++){
      //       console.log('Utdelning '+field.type)
      //                                           // self.resurser.yield.push({
      //                                           //       type: field.type, 
      //                                           //       x: (building.pos[0]+field.pos[0])/2+Math.random()*15-7, 
      //                                           //       y: (building.pos[1]+field.pos[1])/2+Math.random()*15-7
      //                                           // })
      //                                           self.resurser.array.push({
      //                                                 type: field.type, 
      //                                                 location: 'yield',
      //                                                 x: (building.pos[0]+field.pos[0])/2+Math.random()*15-7, 
      //                                                 y: (building.pos[1]+field.pos[1])/2+Math.random()*15-7
      //                                           })
      //                                           building.yieldStat[field.type] ? building.yieldStat[field.type] += 1 : building.yieldStat[field.type] = 1;
      //                                           self.yieldStat[field.type] ? self.yieldStat[field.type] +=1 : self.yieldStat[field.type] = 1;
      //                                           self.yieldStat.tot += 1;
      //       // console.log(self.resurser.yield)
      //                                     }
      //                               }
      //                               return true
      //                         }
      //                   })[0];
      //             }
      //       });

      //       if(buildings_yeild[0]){
      //             let välj_valfri = self.resurser.valfri.map((resurs,i,a)=>{
      //                   return i != a.length - 1 ? 
      //                   {
      //                         title: 'Välj bonus-resurs!',
      //                         menu: Object.keys(self.resurser.types).map((res)=>{
      //                               return {
      //                                     text: res, action: 'fromValfriToYield', response: {resurs: resurs, type: res}, then: 'slide'
      //                               }
      //                         })
      //                   }
      //                   :
      //                   {
      //                         title: 'Välj bonus-resurs!',
      //                         menu: Object.keys(self.resurser.types).map((res)=>{
      //                               return {
      //                                     text: res, action: 'fromValfriToYield', response: {resurs: resurs, type: res}, then: 'close'
      //                               }
      //                         })
      //                   };
      //             })
      //             self.modals.mainModalQ.push({
      //               type: 'alert',
      //               isOpen: true,
      //               svgClass: 'left',       
      //               svg: '<div style="text-align: center; margin: -25px 0 -30px">'+self.dices.render()+'</div>',
      //               content: buildings_yeild.map((building,i,a)=>{
      //                   return i != a.length - 1 || välj_valfri[0] ? 
      //                   {
      //                         title: 'Utdelning',
      //                         htmlClass: 'selection',
      //                         html: '<svg width="100%" height="140px" viewBox="'+(building.pos[0]-width*zoom/2)+' '+(building.pos[1]-height*zoom/2)+' '+width*zoom+' '+height*zoom+'"><use xlink:href="#svg-board"></use></svg>Plus en bonus!',
      //                         menu: [{
      //                           text: 'Nästa', then: 'slide'
      //                         }]
      //                   }
      //                   :
      //                   {
      //                         title: 'Utdelning',
      //                         htmlClass: 'selection',
      //                         html: '<svg width="100%" height="140px" viewBox="'+(building.pos[0]-width*zoom/2)+' '+(building.pos[1]-height*zoom/2)+' '+width*zoom+' '+height*zoom+'"><use xlink:href="#svg-board"></use></svg>',
      //                         menu: [{
      //                           text: 'Stäng', then: 'close'
      //                         }]
      //                   };
      //               }).concat(välj_valfri)
      //             })
      //       }
      // },5000);

    //this.boardgame = {"id":"567d","boardpieces":[{"id":"4589-e838","fields":[{"id":"9bd5-afaa","type":"tra","fill":"#1abc9c","array":[[[130,81.95898384862247],[140,99.27898384862246],[120,99.27898384862246]],[[120,99.27898384862246],[140,99.27898384862246],[130,116.59898384862248]],[[140,99.27898384862246],[150,116.59898384862248],[130,116.59898384862248]],[[140,99.27898384862246],[160,99.27898384862246],[150,116.59898384862248]],[[150,81.95898384862247],[160,99.27898384862246],[140,99.27898384862246]],[[130,81.95898384862247],[150,81.95898384862247],[140,99.27898384862246]],[[150,81.95898384862247],[170,81.95898384862247],[160,99.27898384862246]],[[160,99.27898384862246],[180,99.27898384862246],[170,116.59898384862248]],[[160,99.27898384862246],[170,116.59898384862248],[150,116.59898384862248]],[[150,116.59898384862248],[170,116.59898384862248],[160,133.91898384862247]],[[170,81.95898384862247],[180,99.27898384862246],[160,99.27898384862246]],[[180,99.27898384862246],[190,116.59898384862248],[170,116.59898384862248]],[[170,116.59898384862248],[190,116.59898384862248],[180,133.91898384862247]],[[170,116.59898384862248],[180,133.91898384862247],[160,133.91898384862247]],[[150,116.59898384862248],[160,133.91898384862247],[140,133.91898384862247]],[[130,116.59898384862248],[150,116.59898384862248],[140,133.91898384862247]],[[130,116.59898384862248],[140,133.91898384862247],[120,133.91898384862247]],[[120,99.27898384862246],[130,116.59898384862248],[110,116.59898384862248]],[[110,116.59898384862248],[130,116.59898384862248],[120,133.91898384862247]],[[110,116.59898384862248],[120,133.91898384862247],[100,133.91898384862247]],[[100,133.91898384862247],[120,133.91898384862247],[110,151.23898384862247]],[[120,133.91898384862247],[130,151.23898384862247],[110,151.23898384862247]],[[120,133.91898384862247],[140,133.91898384862247],[130,151.23898384862247]],[[160,133.91898384862247],[180,133.91898384862247],[170,151.23898384862247]],[[160,133.91898384862247],[170,151.23898384862247],[150,151.23898384862247]],[[140,133.91898384862247],[160,133.91898384862247],[150,151.23898384862247]],[[140,133.91898384862247],[150,151.23898384862247],[130,151.23898384862247]]],"number":4,"pos":[160,122.37231718195582],"occupiedBy":"none"},{"id":"7d07-7b9d","type":"olja","fill":"#B697D8","array":[[[170,81.95898384862247],[190,81.95898384862247],[180,99.27898384862246]],[[190,81.95898384862247],[200,99.27898384862246],[180,99.27898384862246]],[[180,99.27898384862246],[200,99.27898384862246],[190,116.59898384862248]],[[200,99.27898384862246],[210,116.59898384862248],[190,116.59898384862248]],[[200,99.27898384862246],[220,99.27898384862246],[210,116.59898384862248]],[[210,81.95898384862247],[220,99.27898384862246],[200,99.27898384862246]],[[210,81.95898384862247],[230,81.95898384862247],[220,99.27898384862246]],[[230,81.95898384862247],[240,99.27898384862246],[220,99.27898384862246]],[[190,81.95898384862247],[210,81.95898384862247],[200,99.27898384862246]],[[220,99.27898384862246],[230,116.59898384862248],[210,116.59898384862248]],[[220,99.27898384862246],[240,99.27898384862246],[230,116.59898384862248]],[[240,99.27898384862246],[250,116.59898384862248],[230,116.59898384862248]],[[230,116.59898384862248],[250,116.59898384862248],[240,133.91898384862247]],[[230,116.59898384862248],[240,133.91898384862247],[220,133.91898384862247]],[[210,116.59898384862248],[230,116.59898384862248],[220,133.91898384862247]],[[210,116.59898384862248],[220,133.91898384862247],[200,133.91898384862247]],[[190,116.59898384862248],[210,116.59898384862248],[200,133.91898384862247]],[[190,116.59898384862248],[200,133.91898384862247],[180,133.91898384862247]],[[180,133.91898384862247],[200,133.91898384862247],[190,151.23898384862247]],[[200,133.91898384862247],[210,151.23898384862247],[190,151.23898384862247]],[[200,133.91898384862247],[220,133.91898384862247],[210,151.23898384862247]],[[220,133.91898384862247],[230,151.23898384862247],[210,151.23898384862247]]],"number":5,"pos":[200,122.37231718195582],"occupiedBy":"none"},{"id":"47df-f537","type":"sad","fill":"#f1c40f","array":[[[250,116.59898384862248],[260,133.91898384862247],[240,133.91898384862247]],[[240,133.91898384862247],[260,133.91898384862247],[250,151.23898384862247]],[[240,133.91898384862247],[250,151.23898384862247],[230,151.23898384862247]],[[220,133.91898384862247],[240,133.91898384862247],[230,151.23898384862247]],[[260,133.91898384862247],[270,151.23898384862247],[250,151.23898384862247]],[[250,151.23898384862247],[270,151.23898384862247],[260,168.56898384862248]],[[250,151.23898384862247],[260,168.56898384862248],[240,168.56898384862248]],[[240,168.56898384862248],[260,168.56898384862248],[250,185.88898384862247]],[[230,151.23898384862247],[250,151.23898384862247],[240,168.56898384862248]],[[230,151.23898384862247],[240,168.56898384862248],[220,168.56898384862248]],[[210,151.23898384862247],[230,151.23898384862247],[220,168.56898384862248]],[[210,151.23898384862247],[220,168.56898384862248],[200,168.56898384862248]],[[190,151.23898384862247],[210,151.23898384862247],[200,168.56898384862248]],[[190,151.23898384862247],[200,168.56898384862248],[180,168.56898384862248]],[[170,151.23898384862247],[190,151.23898384862247],[180,168.56898384862248]],[[180,133.91898384862247],[190,151.23898384862247],[170,151.23898384862247]],[[270,151.23898384862247],[280,168.56898384862248],[260,168.56898384862248]],[[260,168.56898384862248],[280,168.56898384862248],[270,185.88898384862247]],[[260,168.56898384862248],[270,185.88898384862247],[250,185.88898384862247]],[[250,185.88898384862247],[270,185.88898384862247],[260,203.20898384862247]],[[250,185.88898384862247],[260,203.20898384862247],[240,203.20898384862247]],[[230,185.88898384862247],[250,185.88898384862247],[240,203.20898384862247]],[[230,185.88898384862247],[240,203.20898384862247],[220,203.20898384862247]],[[220,203.20898384862247],[240,203.20898384862247],[230,220.52898384862246]],[[240,168.56898384862248],[250,185.88898384862247],[230,185.88898384862247]],[[220,168.56898384862248],[240,168.56898384862248],[230,185.88898384862247]],[[240,203.20898384862247],[260,203.20898384862247],[250,220.52898384862246]],[[240,203.20898384862247],[250,220.52898384862246],[230,220.52898384862246]],[[210,185.88898384862247],[230,185.88898384862247],[220,203.20898384862247]],[[220,168.56898384862248],[230,185.88898384862247],[210,185.88898384862247]],[[200,168.56898384862248],[220,168.56898384862248],[210,185.88898384862247]],[[200,168.56898384862248],[210,185.88898384862247],[190,185.88898384862247]],[[180,168.56898384862248],[200,168.56898384862248],[190,185.88898384862247]]],"number":11,"pos":[220,180.11565051528913],"occupiedBy":"none"},{"id":"3349-4a16","type":"gräs","fill":"#75B96B","array":[[[230,220.52898384862246],[250,220.52898384862246],[240,237.84898384862248]],[[230,220.52898384862246],[240,237.84898384862248],[220,237.84898384862248]],[[220,237.84898384862248],[240,237.84898384862248],[230,255.16898384862247]],[[220,237.84898384862248],[230,255.16898384862247],[210,255.16898384862247]],[[200,237.84898384862248],[220,237.84898384862248],[210,255.16898384862247]],[[210,220.52898384862246],[220,237.84898384862248],[200,237.84898384862248]],[[210,220.52898384862246],[230,220.52898384862246],[220,237.84898384862248]],[[220,203.20898384862247],[230,220.52898384862246],[210,220.52898384862246]],[[200,203.20898384862247],[220,203.20898384862247],[210,220.52898384862246]],[[210,185.88898384862247],[220,203.20898384862247],[200,203.20898384862247]],[[190,185.88898384862247],[210,185.88898384862247],[200,203.20898384862247]],[[190,185.88898384862247],[200,203.20898384862247],[180,203.20898384862247]],[[170,185.88898384862247],[190,185.88898384862247],[180,203.20898384862247]],[[180,168.56898384862248],[190,185.88898384862247],[170,185.88898384862247]],[[160,168.56898384862248],[180,168.56898384862248],[170,185.88898384862247]],[[170,151.23898384862247],[180,168.56898384862248],[160,168.56898384862248]],[[150,151.23898384862247],[170,151.23898384862247],[160,168.56898384862248]],[[150,151.23898384862247],[160,168.56898384862248],[140,168.56898384862248]],[[130,151.23898384862247],[150,151.23898384862247],[140,168.56898384862248]],[[130,151.23898384862247],[140,168.56898384862248],[120,168.56898384862248]],[[110,151.23898384862247],[130,151.23898384862247],[120,168.56898384862248]],[[140,168.56898384862248],[160,168.56898384862248],[150,185.88898384862247]],[[140,168.56898384862248],[150,185.88898384862247],[130,185.88898384862247]],[[160,168.56898384862248],[170,185.88898384862247],[150,185.88898384862247]],[[150,185.88898384862247],[170,185.88898384862247],[160,203.20898384862247]],[[150,185.88898384862247],[160,203.20898384862247],[140,203.20898384862247]],[[170,185.88898384862247],[180,203.20898384862247],[160,203.20898384862247]],[[160,203.20898384862247],[180,203.20898384862247],[170,220.52898384862246]],[[180,203.20898384862247],[190,220.52898384862246],[170,220.52898384862246]],[[180,203.20898384862247],[200,203.20898384862247],[190,220.52898384862246]],[[200,203.20898384862247],[210,220.52898384862246],[190,220.52898384862246]],[[190,220.52898384862246],[210,220.52898384862246],[200,237.84898384862248]],[[190,220.52898384862246],[200,237.84898384862248],[180,237.84898384862248]],[[170,220.52898384862246],[190,220.52898384862246],[180,237.84898384862248]],[[170,220.52898384862246],[180,237.84898384862248],[160,237.84898384862248]],[[180,237.84898384862248],[200,237.84898384862248],[190,255.16898384862247]],[[200,237.84898384862248],[210,255.16898384862247],[190,255.16898384862247]],[[180,237.84898384862248],[190,255.16898384862247],[170,255.16898384862247]],[[160,237.84898384862248],[180,237.84898384862248],[170,255.16898384862247]]],"number":5,"pos":[190,208.9823171819558],"occupiedBy":"none"},{"id":"e87f-cd12","type":"sten","fill":"lightgray","array":[[[100,133.91898384862247],[110,151.23898384862247],[90,151.23898384862247]],[[90,151.23898384862247],[110,151.23898384862247],[100,168.56898384862248]],[[90,151.23898384862247],[100,168.56898384862248],[80,168.56898384862248]],[[80,168.56898384862248],[100,168.56898384862248],[90,185.88898384862247]],[[100,168.56898384862248],[120,168.56898384862248],[110,185.88898384862247]],[[120,168.56898384862248],[130,185.88898384862247],[110,185.88898384862247]],[[120,168.56898384862248],[140,168.56898384862248],[130,185.88898384862247]],[[110,151.23898384862247],[120,168.56898384862248],[100,168.56898384862248]],[[100,168.56898384862248],[110,185.88898384862247],[90,185.88898384862247]],[[110,185.88898384862247],[120,203.20898384862247],[100,203.20898384862247]],[[110,185.88898384862247],[130,185.88898384862247],[120,203.20898384862247]],[[130,185.88898384862247],[140,203.20898384862247],[120,203.20898384862247]],[[120,203.20898384862247],[140,203.20898384862247],[130,220.52898384862246]],[[130,185.88898384862247],[150,185.88898384862247],[140,203.20898384862247]],[[140,203.20898384862247],[150,220.52898384862246],[130,220.52898384862246]],[[140,203.20898384862247],[160,203.20898384862247],[150,220.52898384862246]],[[160,203.20898384862247],[170,220.52898384862246],[150,220.52898384862246]],[[150,220.52898384862246],[170,220.52898384862246],[160,237.84898384862248]],[[150,220.52898384862246],[160,237.84898384862248],[140,237.84898384862248]],[[140,237.84898384862248],[160,237.84898384862248],[150,255.16898384862247]],[[160,237.84898384862248],[170,255.16898384862247],[150,255.16898384862247]],[[140,237.84898384862248],[150,255.16898384862247],[130,255.16898384862247]],[[130,220.52898384862246],[150,220.52898384862246],[140,237.84898384862248]],[[130,220.52898384862246],[140,237.84898384862248],[120,237.84898384862248]],[[110,220.52898384862246],[130,220.52898384862246],[120,237.84898384862248]],[[120,203.20898384862247],[130,220.52898384862246],[110,220.52898384862246]],[[120,237.84898384862248],[140,237.84898384862248],[130,255.16898384862247]],[[100,203.20898384862247],[120,203.20898384862247],[110,220.52898384862246]],[[90,185.88898384862247],[110,185.88898384862247],[100,203.20898384862247]]],"number":3,"pos":[130,197.43565051528915],"occupiedBy":"none"}],"roads":[{"id":"1c55-5bc9","pos1":[130,81.96152422706636],"pos2":[230,81.96152422706636]},{"id":"ed69-f720","pos1":[230,81.96152422706636],"pos2":[280,168.5640646055102]},{"id":"ef1d-0f67","pos1":[280,168.5640646055102],"pos2":[230,255.16660498395407]},{"id":"28a8-6082","pos1":[230,255.16660498395407],"pos2":[130,255.16660498395407]},{"id":"0f24-7166","pos1":[130,255.16660498395407],"pos2":[80,168.5640646055102]},{"id":"e4a8-0ae1","pos1":[80,168.5640646055102],"pos2":[130,81.96152422706636]}],"buildsites":[{"id":"8667-2b46","pos":[210,81.96152422706636],"fields":[{"bp_id":"4589-e838","refid":"7d07-7b9d","type":"olja","nr":5},{"type":"hamn"}]},{"id":"48ee-17e8","pos":[240,99.28203230275514],"fields":[{"bp_id":"4589-e838","refid":"7d07-7b9d","type":"olja","nr":5},{"type":"hamn"}]},{"id":"380f-a1af","pos":[270,151.24355652982143],"fields":[{"bp_id":"4589-e838","refid":"47df-f537","type":"sad","nr":11},{"type":"hamn"}]},{"id":"8841-4adf","pos":[270,185.88457268119896],"fields":[{"bp_id":"4589-e838","refid":"47df-f537","type":"sad","nr":11},{"type":"hamn"}]},{"id":"9006-6d5c","pos":[240,237.84609690826528],"fields":[{"bp_id":"4589-e838","refid":"3349-4a16","type":"gräs","nr":5},{"type":"hamn"}]},{"id":"076c-a849","pos":[210,255.16660498395407],"fields":[{"bp_id":"4589-e838","refid":"3349-4a16","type":"gräs","nr":5},{"type":"hamn"}]},{"id":"976e-e226","pos":[150,255.16660498395407],"fields":[{"bp_id":"4589-e838","refid":"e87f-cd12","type":"sten","nr":3},{"type":"hamn"}]},{"id":"8d26-be58","pos":[120,237.84609690826528],"fields":[{"bp_id":"4589-e838","refid":"e87f-cd12","type":"sten","nr":3},{"type":"hamn"}]},{"id":"6551-67e1","pos":[90,185.88457268119896],"fields":[{"bp_id":"4589-e838","refid":"e87f-cd12","type":"sten","nr":3},{"type":"hamn"}]},{"id":"b919-0e01","pos":[90,151.24355652982143],"fields":[{"bp_id":"4589-e838","refid":"e87f-cd12","type":"sten","nr":3},{"type":"hamn"}]},{"id":"c704-23e7","pos":[120,99.28203230275514],"fields":[{"bp_id":"4589-e838","refid":"9bd5-afaa","type":"tra","nr":4},{"type":"hamn"}]},{"id":"3ea4-83e1","pos":[150,81.96152422706636],"fields":[{"bp_id":"4589-e838","refid":"9bd5-afaa","type":"tra","nr":4},{"type":"hamn"}]}],"transform":{"translate":[0,0],"rotation":{"angle":0,"origin":[0,0]}}}]};
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
.tra{background-color: #1abc9c;}
.sten{background-color: #FFFFFF;}
.olja{background-color: #B697D8;}
.sad{background-color: #f1c40f;}
.djur{background-color: #75B96B;}

/*
  .field.tra polygon{ 
    fill: #1abc9c;
  }
  .field.sten polygon{ 
    fill: lightgray;
  }
  .field.olja polygon{ 
    fill: #B697D8;
  }
  .field.sad polygon{ 
    fill: #f1c40f;
  }
  .field.djur polygon{ 
    fill: #75B96B;
  }*/
  /*.tra{background-color: #1abc9c;}
    .sten{background-color: #FFFFFF;}
    .olja{background-color: #B697D8;}
    .sad{background-color: #f1c40f;}
    .djur{background-color: #75B96B;}*/
</style>
