var limit = 50;
var y50 = 200;
//OBS! Kom ihåg att dessa 'limits' står i proportion till y50!
var upper_limit = [15, 12, 9, 7, 4, 2];
var lower_limit = [-15,-13,-11,-9,-7,-5];

//Hämtas från Databas game_1.stockmarket
var utdelning = {
	'säd':  [0],
	'olja': [0],
	'trä':  [0],
	'sten': [0],
	'djur': [0]
};
//Hämtas från Databas
var summa = {
	'säd':  0,
	'olja': 0,
	'trä':  0,
	'sten': 0,
	'djur': 0
};

var total = 0;
var resurser = summa;
// Sätt variablerna total och summa;
for(res in resurser){ 
	total += summa[res];
	for(i in utdelning[res]){
		summa[res] += utdelning[res][i];
	}
}
var tur = utdelning[resurser[0]].length;

//Hämtas från Databas
var coord = {
	'säd':  [1],
	'olja': [1],
	'trä':  [1],
	'sten': [1],
	'djur': [1]
};
//Hämtas från Databas
var derivata = {
	'säd':  [0],
	'olja': [0],
	'trä':  [0],
	'sten': [0],
	'djur': [0]
};
//******** Pushas till spelare/bank *********//
//Statisk i server.js! Hämtas från Databas bara första gången! 
//Uppdateras efter varje utdelning!
var coord_txt = {
	'säd':  '',
	'olja': '',
	'trä':  '',
	'sten': '',
	'djur': ''
};
//Hämtas från Databas
var color = {
	'säd':  'yellow',
	'olja': 'black',
	'trä':  'darkgreen',
	'sten': 'gray',
	'djur': 'green'
};
//Hämtas från Databas 
//Uppdateras från spelare
/*player.stock_inset = {
	'säd':  ['olja'],
	'olja': [],
	'trä':  [],
	'sten': [],
	'djur': []
};
//********************************************//
//Hämtas från Databas 
/*player.stock_outcome = {
	'säd':  0,
	'olja': 0,
	'trä':  0,
	'sten': 0,
	'djur': 0
};
*/


var players = {
	"Andreas": {
		"stock_inset": {
			"säd":  [],
			"olja": [],
			"trä":  [],
			"sten": [],
			"djur": []
		},
		"stock_outcome": {
			"säd":  0,
			"olja": 0,
			"trä":  0,
			"sten": 0,
			"djur": 0
		},
		"upper_limit_premie": [0, 0, 0, 0, 0, 0],
		"lower_limit_premie": [0, 0, 0, 0, 0, 0]
	},
	"Samuel": {
		"stock_inset": {
			"säd":  [],
			"olja": [],
			"trä":  [],
			"sten": [],
			"djur": []
		},
		"stock_outcome": {
			"säd":  0,
			"olja": 0,
			"trä":  0,
			"sten": 0,
			"djur": 0
		},
		"upper_limit_premie": [0, 0, 0, 0, 0, 0],
		"lower_limit_premie": [0, 0, 0, 0, 0, 0]
	}
};

var resurser_premie = {
	"upper_limit_premie": {
			"säd":  [0, 0, 0, 0, 0, 0],
			"olja": [0, 0, 0, 0, 0, 0],
			"trä":  [0, 0, 0, 0, 0, 0],
			"sten": [0, 0, 0, 0, 0, 0],
			"djur": [0, 0, 0, 0, 0, 0]
		},
	"lower_limit_premie":{
			"säd":  [0, 0, 0, 0, 0, 0],
			"olja": [0, 0, 0, 0, 0, 0],
			"trä":  [0, 0, 0, 0, 0, 0],
			"sten": [0, 0, 0, 0, 0, 0],
			"djur": [0, 0, 0, 0, 0, 0]
		},
};



for (player in players){
	for(res in resurser){
		coord[res].push( ( 1 - (tur/limit) + ( tur*summa[res]*total / (resurser.length*limit) ) )*y50 );
		derivata[res].push( coord[res][-1] - coord[res][-2] );

		for(i in utdelning[res] ){ coord_txt[res] += (i*10)+','+(2*y50-utdelning[res][i])+' ';}

		if(players[player].stock_inset[res].length > 0){
			players[player].stock_outcome[res] += derivata[res][-1];
			l = (players[player].stock_inset[res].length-1); 
			var upp_lim = upper_limit[l] + players[player]['upper_limit_premie'][l] + resurser_premie['upper_limit_premie'][res];
			var low_lim = lower_limit[l] + players[player]['lower_limit_premie'][l] + resurser_premie['lower_limit_premie'][res];
			
			if(players[player].stock_outcome[res] / upper_limit[l] > 1){ 
				x = Math.floor(players[player].stock_outcome[res] / upper_limit[l]);
				for(i=0;i<x;i++){
					players[player].stock_inset[res].push(res);
					players[player].stock_outcome[res] = 0;
				}
			}
			if(players[player].stock_outcome[res] / lower_limit[l] > 1){ 
				x = Math.floor(players[player].stock_outcome[res] / lower_limit[l]);
				for(i=0;i<x;i++){
					players[player].stock_inset[res].pop();
					players[player].stock_outcome[res] = 0;
				}
			}
		}else{ 
			players[player].stock_outcome[res] = 0;
		}

	}
}

//******** Angular App *********//
<svg height="400" width="500">
  <polyline ng-repeat="(key, value) in color" id="stock_{{key}}" points="{{coord_txt[key]}}" style="fill:none;stroke:{{value}};stroke-width:3" />
</svg>

<div ng-repeat="(key, value) in player.stock_inset" ng-show="value.length>0" class="resurs"><div ng-repeat="i in value" class="{{value[i]}}"></div></div>
//******************************//




<polyline points="0,200 525,200 525,300 0,300" style="fill:rgb(237, 237, 237);stroke-width:2" />
      <polyline ng-repeat="res in stock.color" points="{{stock.coord_txt[res]}" style="fill:none;stroke:{{stock.color[res]};stroke-width:3" />
      <g ng-repeat="res in stock.color">
        <path transform="matrix(1 0 0 1 327.67 99.67)" data="Obs! Ska transformeras -2.33 -2.33 från akuell punkt!" fill="darkgray" d="M36.767,20.69L17.132,0.888C16.568,0.319,15.802,0,15.001,0H3C1.343,0,0,1.343,0,3v12c0,0.794,0.315,1.557,0.876,2.119l19.678,19.719c0.586,0.587,1.354,0.881,2.124,0.881c0.766,0,1.532-0.292,2.118-0.875
    l11.959-11.917C37.926,23.76,37.932,21.864,36.767,20.69z M5.257,7.547c-1.22,0-2.208-0.989-2.208-2.208S4.037,3.13,5.257,3.13s2.208,0.989,2.208,2.208S6.477,7.547,5.257,7.547z"/>
      </g>
      <text transform="matrix(0.7071 0.7071 -0.7071 0.7071 333.2208 111.2906)" data="Obs! Ska transformeras +3.2208 +9.2906 från akuell punkt!" fill="#FFFFFF" font-family="'MyriadPro-Regular'" font-size="16">sten</text>
      <polyline transform="matrix(1 0 0 1 -480 0)"points="0,200 10,208 20,212 30,206 40,210 50,214 60,217 70,222 80,226 90,230 100,233 110,237 120,241 130,234 140,238 150,242 160,245 170,249 180,253 190,257 200,260 210,264 220,268 230,260 240,265 250,268 260,272 270,276 280,280 290,284 300,287 310,267 320,247 330,231 340,212 350,217 360,217 370,222 380,208 390,198 400,198 410,193 420,193 430,196 440,195 450,185 460,190 470,195 480,205 490,208 500,203 510,205 520,217 530,219 540,225 550,227 560,221 570,217 580,219 590,221 600,212 610,214 620,221 630,219 640,221 650,223 660,221 670,217 680,219 690,221 700,212 710,214 720,221 730,219 740,221 750,223 760,221 770,217 780,198 790,181 800,183 810,183 820,200 830,219 840,219 850,209 860,200 870,200 880,205 890,209 900,209 910,217 920,217 930,205 940,209 " style="fill:none;stroke:#f0cd4e;stroke-width:3" />
      <g>
        <path transform="matrix(1 0 0 1 457.67 206.67)" data="Obs! Ska transformeras -2.33 -2.33 från akuell punkt!" fill="#f0cd4e" d="M36.767,20.69L17.132,0.888C16.568,0.319,15.802,0,15.001,0H3C1.343,0,0,1.343,0,3v12
    c0,0.794,0.315,1.557,0.876,2.119l19.678,19.719c0.586,0.587,1.354,0.881,2.124,0.881c0.766,0,1.532-0.292,2.118-0.875
    l11.959-11.917C37.926,23.76,37.932,21.864,36.767,20.69z M5.257,7.547c-1.22,0-2.208-0.989-2.208-2.208S4.037,3.13,5.257,3.13
    s2.208,0.989,2.208,2.208S6.477,7.547,5.257,7.547z"/>
      </g>
      <text transform="matrix(0.7071 0.7071 -0.7071 0.7071 463.2208 218.2906)" data="Obs! Ska transformeras +3.2208 +9.2906 från akuell punkt!" fill="#FFFFFF" font-family="'MyriadPro-Regular'" font-size="16">säd</text>


