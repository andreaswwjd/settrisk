boardgame: {
	id: "",
	boardpieces: [{
		id: "",
		fields: [{
			id:"",
			type: "",
			fill: "",
			_array:[ [[1,1],[3,1],[2,2]], [[1,1],[3,1],[2,2]], [[1,1],[3,1],[2,2]] ],
			array:[ 
				[[12.76576576875,2.45646465465],[27.5657576555,30.1234354567],[42.76576576875,32.45646465465]], 
				[[12.76576576875,2.45646465465],[27.5657576555,30.1234354567],[42.76576576875,32.45646465465]], 
				[[12.76576576875,2.45646465465],[27.5657576555,30.1234354567],[42.76576576875,32.45646465465]]
			],
			number: 3,
			_pos: [1,2],
			pos: [12.649283749823,23.09128309812],
			occupiedBy: 'none',
		}],
		roads: [{
			id: "",
			_rpos: [[1,2], [2,3]],
			rpos: [[12.76576576875,2.45646465465], [27.5657576555,30.1234354567]],
		}],
		buildsites: [{
			id:"",
			_pos: [1,2],
			pos: [12.649283749823,23.09128309812],
			fields: [{
				"field_id": "e9dd-24d8",
				"boardpiece_id": "98c1-e360-dd6c",
				"type": "trä"
			},{
				"refid": "aba6",
				"type": "hamn"
			}]
		}],
	}]
}

factorX: 5,
factorY: 10,
transform: [1,2],
rotation: {
	angle: 1.234,
	origin: [1,2]
}


translate: function(points){
	return points.map(point => [ point[0] + transform[0], point[1] + transform[1] ])
}
rotate: function(points){
	return rotation.angle ? points.map(point => [ 
		(point[0] - rotation.origin[0]) * Math.cos(rotation.angle) - (point[1] - rotation.origin[1]) * Math.sin(rotation.angle), 
		(point[0] - rotation.origin[0]) * Math.sin(rotation.angle) + (point[1] - rotation.origin[1]) * Math.cos(rotation.angle) 
	]) : points ; 
}

toPoints: function(points){
	return points.map(point => [point[0]*factorX, point[1]*factorY])
}

transformAll: function(points){
	return toPoints(rotate(translate(points)))
}

var translate = translater(transform);
var rotate = rotater(rotation);

array = _array.map(tripoints => toPoints(rotate(translate(tripoints))).join(' '))
pos = toPoints(rotate(translate([_pos])))[0]
rpos = toPoints(rotate(translate(_rpos)))

// eller

array = _array.map(tripoints => transformAll(tripoints).join(' '))
pos = transformAll([_pos])[0]
rpos = transformAll(_rpos)

<g id="boardgame">
  <g class="boardpiece" v-for="boardpiece in boardgame.bps" v-bind:id="boardpiece.id" v-on:click="boardpieceClick(boardpiece)" v-bind:style="{fillOpacity: currentpiece==boardpiece ? '1' : '0.5' }">

    <g v-bind:id="'fields_'+boardpiece.id">
      <g v-for="field in boardpiece.fields" class="field" v-bind:type="field.type" v-on:click="selected.tool=='edit'?boardpiece.editField(field):'';">
        <polygon v-for="points in field.array" v-bind:points="points" v-bind:fill="f.fill" v-on:click="selected.tool=='number'? boardpiece.setFieldNumber(f, field):'';"></polygon>
        <g class="number" v-if="field.number" style="text-anchor: middle; font-family: 'Helvetica'; font-size: 13px; fill: #606060;">
          <circle v-bind:cx="field.pos[0]" v-bind:cy="field.pos[0]" r="8.1"/>
          <text v-bind:transform="'matrix(1 0 0 1 '+field.pos[0]+' '+(field.pos[1]+4.5)+')'" fill="#FFF">{{field.number}}</text>
        </g>
      </g>
    </g>

    <g v-bind:id="'roads_'+boardpiece.id">
      <g class="road" v-for="road in boardpiece.roads" v-on:click="selected.tool == 'road' && altPress ? boardpiece.removeRoad(road) :'';" style="fill: #606060; stroke: #606060; stroke-width: 4;">
        <circle v-bind:cx="road.rpos[0][0]" v-bind:cy="road.rpos[0][1]" r="2" />
        <circle v-bind:cx="road.rpos[1][0]" v-bind:cy="road.rpos[1][1]" r="2" />
        <line v-bind:x1="road.rpos[0][0]" v-bind:y1="road.rpos[0][1]" v-bind:x2="road.rpos[1][0]" v-bind:y2="road.rpos[1][1]" />
      </g>
    </g>

    <g v-bind:id="'buildsites_'+boardpiece.id">
      <g class="buildsite" v-for="buildsite in boardpiece.buildings" v-on:click="selected.tool == 'building' && altPress ? boardpiece.removeBuilding(buildsite) :'';" v-bind:transform="'translate('+buildsite.pos[0]+', '+buildsite.pos[1]+')'" style="fill: black; fill-opacity: 0.5; ">
        <title>{{buildsite.fields()}}</title>
        <polygon points="-20,0 -10,17.320508075688764 10,17.320508075688764 20,0 10,-17.320508075688764 -10,-17.320508075688764" ></polygon></g>
    </g>
  </g>
</g>


