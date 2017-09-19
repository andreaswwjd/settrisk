var app = angular.module('myApp', []);

//GLOBALS
players = [];

//Elements
var resurs_container = document.getElementById('resurs_container');
var items_container = document.getElementById('items_container');
var itemsmenu_container = document.getElementById('itemsmenu_container');
var trade_container = document.getElementById('trade_container');
var byggnader_container = document.getElementById('byggnader_container');

itemsmenu_container.close = function(){
  // this.style.display = 'none';
  itemsmenu_container.style.left = '-130px'
}
itemsmenu_container.open = function(){
  // this.style.display = 'block';
  itemsmenu_container.style.left = '-5px'
}

function getData() {
  var data = {};
  data.infanteri = {};
  data.byggnader = {};
  data.priser = {};
  data.resurser = {
    "trä": [],
    "säd": [],
    "olja": [],
    "sten": [],
    "djur": [],
    "invånare": []
  };
  // data.infanteri = {
  //     "trupp": [],
  //     "lätt tank": [],
  //     "tung tank": [],
  //     "slagskepp": []
  // };
  // data.byggnader = {
  //     "stad": [],
  //     "by": [],
  //     "fabrik": [],
  //     "flygplats": [],
  //     "hamn": [],
  //     "oljerigg": [],
  //     "universitet": [],
  //     "väg": [],
  //     "bro": []
  // };
  // data.nationer = [];
  // data.priser = {
  //   "trupp": {
  //     "trä": [],
  //     "säd": [1],
  //     "olja": [],
  //     "sten": [],
  //     "djur": [1]
  //   },
  //   "tung tank": {
  //     "trä": [],
  //     "säd": [1],
  //     "olja": [1,2],
  //     "sten": [],
  //     "djur": [1]
  //   },
  //   "lätt tank": {
  //     "trä": [],
  //     "säd": [1],
  //     "olja": [1,2],
  //     "sten": [],
  //     "djur": [1]
  //   },
  //   "slagskepp": {
  //     "trä": [],
  //     "säd": [],
  //     "olja": [],
  //     "sten": [],
  //     "djur": []
  //   },
  //   "stad": {
  //     "trä": [],
  //     "säd": [1,2],
  //     "olja": [],
  //     "sten": [1,2,3],
  //     "djur": []
  //   },
  //   "by": {
  //     "trä": [1],
  //     "säd": [1],
  //     "olja": [1],
  //     "sten": [],
  //     "djur": [1]
  //   },
  //   "fabrik": {
  //     "trä": [1],
  //     "säd": [1,2],
  //     "olja": [],
  //     "sten": [1,2],
  //     "djur": []
  //   },
  //   "flygplats": {
  //     "trä": [1],
  //     "säd": [],
  //     "olja": [1,2,3],
  //     "sten": [1,2],
  //     "djur": []
  //   },
  //   "hamn": {
  //     "trä": [],
  //     "säd": [],
  //     "olja": [],
  //     "sten": [],
  //     "djur": []
  //   },
  //   "oljerigg": {
  //     "trä": [],
  //     "säd": [],
  //     "olja": [],
  //     "sten": [],
  //     "djur": []
  //   },
  //   "universitet": {
  //     "trä": [],
  //     "säd": [],
  //     "olja": [],
  //     "sten": [],
  //     "djur": []
  //   },
  //   "väg": {
  //     "trä": [1],
  //     "säd": [],
  //     "olja": [1],
  //     "sten": [],
  //     "djur": []
  //   },
  //   "bro": {
  //     "trä": [1,2],
  //     "säd": [],
  //     "olja": [1],
  //     "sten": [],
  //     "djur": []
  //   }
  // };

  return data;
}

// Varibles
var data = getData();
// var resurserKeys = Object.keys(data.resurser);
var resurser = {};
Object.keys(data.resurser).map(function(resurs){ 
  resurser[resurs] = [];
  resurser['t_'+resurs] = []; 
  resurser['i_'+resurs] = []; 
})
// var itemKeys = Object.keys(data.priser);
// var infanteriKeys = Object.keys(data.infanteri);
// var byggnaderKeys = Object.keys(data.byggnader);
var priser = {};
var korg = { items: [] };

// Render resorse data do DOM:
function updateResorces(){
  Object.keys(data.resurser).map(function(resurs){
    if(!resurser[resurs]){ resurser[resurs] = [] }
    while ( resurser[resurs].length > data.resurser[resurs].length ){
      var d = resurser[resurs].pop();
      resurs_container.removeChild(d.node);
    }
    resurser[resurs] = data.resurser[resurs].map(function(v,i,a){
      // Add data only if the data does not exist.
      if(!resurser[resurs][i]){
        var res = new Resurs({
          type: resurs,
          top: 60+Math.random()*50+'px',
          left: Math.random()*300+'px',
          movable: true
        });
        resurs_container.appendChild(res.node);
        return res;
      } else { 
        return resurser[resurs][i]; 
      }
    })
  })
}
updateResorces();

//Render items into DOM:
var priserNODE = {'infanteri':{},'byggnader':{}};
function generateItems(){
  var generate = function(item, type){
    console.log('generateItems();')
    var prisdiv = document.createElement('div'); // '<div class="prisdivs">'
    prisdiv.className = 'prisdivs';

    var b = document.createElement('button'); // '<div id="items_container"><div class="prisdivs"><button class="btn shadow"><img class="item_img" src="img/'+item+'.png"></button></div></div>'
    b.className = 'btn shadow';
    b.innerHTML = '<img src="img/'+item+'.png" class="item_img">';

    var m = document.createElement('div'); // '<div id="itemsmenu_container"><div class="item_menu"><div class="buy_btn green"> Köp </div><div class="buy_btn red"> Ångra </div></div></div>'
    m.className = 'item_menu'
    m.innerHTML = '<div class="buy_btn green" > Köp </div><div class="buy_btn red"> Ångra </div>'

    var obj = new Item({
      item: item,
      type: type,
      cost: data.priser[type][item],
      button: b,
      menu: m,
      costNodes: {}
    });
    console.log(obj.cost['djur'])
    // obj.button.disabled = false;
    obj.button.disabled = obj.isAvailable();
    
    obj.costkeys.map(function(key){
      obj.costNodes[key] = []
      obj.cost[key].map(function(d,i,a){
        var r = new Resurs({
          type: key,
          dyrt: i+1 > resurser[key].length 
        });
        obj.costNodes[key].push(r);
      })
    })
    
    priserNODE[type][item] = obj;
    prisdiv.appendChild(obj.button);
    obj.costkeys.map(function(key){ obj.costNodes[key].map(function(resurs){ prisdiv.appendChild(resurs.node) }) })
    //DOM objects
    items_container.appendChild(prisdiv);
    itemsmenu_container.appendChild(m);

  }
  Object.keys(data.priser.infanteri).map(function(item){generate(item, 'infanteri')})
  Object.keys(data.priser.byggnader).map(function(item){generate(item, 'byggnader')})
}
// generateItems();


function updateItems(){
  //Om antalet items är ändrade så ska de nya genereras
  // if(Object.keys(priserNODE.infanteri).length != Object.keys(priser.infanteri).length || Object.keys(priserNODE.byggnader).length != Object.keys(priser.byggnader).length){
  //   items_container.innerHTML = '';
  //   itemsmenu_container.innerHTML = '';
  //   Object.keys(data.priser.infanteri).map(function(item){generate(item, 'infanteri')});
  //   Object.keys(data.priser.byggnader).map(function(item){generate(item, 'byggnader')})
  // }
  // else{ //Annars uppdateras de bara...
    Object.keys(priser).map(function(type){ 
      Object.keys(priser[type]).map(function(item){
        priserNODE[type][item].button.disabled = priserNODE[type][item].isAvailable() 
        priserNODE[type][item].costkeys.map(function(key){ 
          priserNODE[type][item].costNodes[key].map(function(resurs,i,a){
            var dyrt = i+1 > resurser[resurs.type].length ? 'dyrt' : '' ; // costNodes måste ändras till objekt { trä: [], säd: [] ... }
            if (resurs.dyrt != dyrt) {
              resurs.dyrt = dyrt;
              resurs.node.className = resurs.node.className.replace(' dyrt', '');
              if(dyrt == 'dyrt'){resurs.node.className+=' dyrt'}
            } 
          }) 
        })
      })
    });
  // }
  console.log('Items updated')
}

app.controller('mainboardOLController', function($scope, $http) {
  //console.log($scope)
  $scope.resurser = resurser;
  $scope.resurserKeys = Object.keys(data.resurser);
})

function Mark(obj){
  this.node = document.createElement('div');
  this.node.className = 'mark';
  this.node.innerHTML = '<svg class="icon_resurs" width="25px" height="25px" viewBox="0 0 100 100" ><use xlink:href="#svg-'+obj.mark+'"></use></svg><svg class="hexagon" version="1.1" x="0px" y="0px" width="60px" height="69.28px" viewBox="0 0 60 69.28"><polygon fill="'+ '#F0D5A7' +'" points="0,17.18 30,-0.14 60,17.18 60,51.82 30,69.14 0,51.82 "/><text transform="matrix(1 0 0 1 30 44)" font-family="\'Calibri\'" font-size="27" text-anchor="left">'+obj.nr+'</text></svg>';
}

function Byggnad(obj){
  this.node = document.createElement('div');
  this.node.className = 'byggnad';
  this.node.innerHTML = '<img src="img/'+obj.type+'.png">'
  this.node.setAttribute('ng-click', 'modal.set(byggnad); modal.open(byggnad.id+i, 0, 5, $event); modal.slide($event)');
}

var updateByggnader;

var prepareByggnader = function(byggnader){
  byggnader.map(function(city){prepareByggnad(city)});
  return byggnader;
}

var prepareByggnad = function(city){ 
  city.marker.map(function(mark,i,a){ 
    mark.value = mark.mark+mark.nr;
    mark.byggnad = city;
    mark.byggnad.p = a.length;
    mark.byggnader = [city];
    mark.rank=0;
    mark.control = false;
    mark.occupied ? mark.menu = [ {'title':'Återta', 'action':'ockupera'} ] : mark.menu = [ {'title':'Ockuperad av fiende', 'action':'ockupera'} ];
  });
  city.menu = [ {'title':'Överge byggnad åt fiende', 'action':'ockuperad_byggnad'},
                {'title':'Lägg till mark', 'action':'add_mark'} ];
  city.active = false;
  // city.nation = false;
}

app.controller('nationsOLController', function($scope, $http) {
  $scope.nationer = data.nationer;
  // // $scope.nationer[0] = constructNation(input,123);
  // data.byggnader = prepareByggnader(byggnader);
  // $scope.byggnader = data.byggnader;
  // $scope.byggnader.map(function(b){
  //   if(!b.nation){
  //     b.node = document.createElement('div');
  //     b.node.style ='text-align: center; display: inline-block; margin: 10px; '
  //     for (i in b.marker){
  //       var marknode = new Mark(b.marker[i])
  //       if(i==2){
  //         var n = document.createElement('div');
  //         n.style = 'width: 100%; height: 0px;';
  //         b.node.appendChild(n);
  //       }
  //       b.node.appendChild(marknode.node);
  //       if(i==0){
  //         var byggnad = new Byggnad(b);
  //         b.node.appendChild(byggnad.node);
  //       }
  //     }
  //     // <-- aktivera     byggnader_container.appendChild(b.node);
      
  //     // var n = document.createElement('div');
  //     // n.style = 'width: 100%; height: 20px;';
  //     // byggnader_container.appendChild(n);
  //   }
  // })
  console.log($scope)

  updateByggnader = function(){
    $scope.byggnader = data.byggnader;
    $scope.nationer = data.nationer;
    console.log('updateByggnader()')
    $scope.$apply();
  }



  $scope.modal = {};
  $scope.modal.modal = document.getElementById('modal');
  $scope.modal.content = document.getElementById('modal_content');
  $scope.modal.arrow = document.getElementById('modal_arrow');
  $scope.modal.selected;
  $scope.modal.menu = [];
  $scope.modal.sendTo = '';
  $scope.modal.active = true;

  $scope.nation = {};
  $scope.nation.new_btn = document.getElementById('new_btn');
  $scope.nation.selection = [];

  $scope.nation.toggle = function() {
    $scope.modal.active ? $scope.nation.activate() : $scope.nation.inactivate() ;
  }
  $scope.nation.inactivate = function() {
    $scope.modal.active = true;
    $scope.nation.empty();
    $scope.nation.new_btn.style.background = '#28AF60';
    $scope.nation.new_btn.innerHTML = '<p>Markera</p>';
  }
  $scope.nation.activate = function() {
    $scope.modal.active = false;
    $scope.nation.new_btn.style.background = '#c0392b';
    $scope.nation.new_btn.innerHTML = '<p>Avbryt</p>';
  }
  $scope.nation.select = function(byggnad) {
    if($scope.modal.active == true){ return 'nation inactive' } 
    if(!byggnad.active){
      $scope.nation.selection.push(byggnad);
      byggnad.active = true;
    } else {
      $scope.nation.selection = $scope.nation.selection.filter(function(city){ return city.id != byggnad.id; });
      byggnad.active = false;
    }
  } 
  $scope.nation.empty = function(){
    $scope.nation.selection.map(function(b){b.active = false});
    $scope.nation.selection = [];
  }
  $scope.nation.create = function() {
    if($scope.nation.selection[0]){
      // $scope.nationer.unshift(constructNation($scope.nation.selection, $scope.nationer.length+1));
      $scope.nation.selection.map(function(city){
        socket.emit('set nation to byggnad', {byggnad_id: city.id, nation: (data.nationer.length+1)});
      });
      socket.emit('nationer', user, {index: (data.nationer.length+1)});
      $scope.nation.inactivate();
    }
  }


  // $scope.$watch($scope.modal.selected);

  $scope.modal.open = function(id, x, y, event) {
    if($scope.modal.active == false){ return 'modal inactive' } 
    event? x = event.clientX - document.documentElement.clientWidth/2 :'';
    $scope.modal.modal.style.transform = 'translateY('+y+'px)';
    $scope.modal.arrow.style.transform = 'translateX('+x+'px)';
    document.getElementById(id).appendChild($scope.modal.modal);
    $scope.modal.content.style.height = ($scope.modal.menu.length*40+40)+'px';
    console.log('Modal: open()')
  }
  $scope.modal.set = function(selection, e) {
    if(e){e.stopImmediatePropagation();}
    if($scope.modal.active == false){ return 'modal inactive' } 
    $scope.modal.selected = selection;
    $scope.modal.menu = selection.menu;
    if(selection.byggnad && selection.byggnad.nation ){ //Bara marker tillhörande nation
      $scope.modal.nation = $scope.nationer.filter(function(n){return n.index == selection.byggnad.nation })[0];
      if($scope.modal.nationIsBonusable() && $scope.modal.nation.bonus == false ){
        $scope.modal.menu = $scope.modal.menu.concat($scope.modal.nation.menu);
      }
    }else if(selection.byggnad){
      $scope.modal.menu = $scope.modal.menu.concat([{'title':'Ändra', 'action':'set_mark'},{'title':'Ta bort', 'action':'delete_mark'}]);
    }
    $scope.modal.content.style.height = '0px';
    console.log(selection);
  }
  $scope.modal.slide = function(event) {
    if($scope.modal.active == false){ return 'modal inactive' } 
    var dist_to_mid = event.clientY - document.documentElement.clientHeight/2 + 70 ;
    Math.abs(dist_to_mid) > 50 ? nationsmenu.slide(dist_to_mid) : 'do nothing';
  }
  $scope.modal.close = function() {
    $scope.modal.content.style.height = '0px';
    document.getElementById('modal_hidingplace').appendChild($scope.modal.modal);
    console.log('Modal: close()')
  }
  $scope.events = {};
  $scope.modal.trigger = function(item) {
    if(!$scope.events[item]){
      $scope.events[item.action]= document.createEvent('Event');
      $scope.events[item.action].initEvent(item.action, true, true);
    }
    $scope.events[item.action].selected = $scope.modal.selected;
    if(item.sendTo){ $scope.modal.sendTo = item.sendTo; }
    if(item.setMark){ $scope.modal.setMark = item.setMark; }
    if(item.setNr){ $scope.modal.setNr = item.setNr; }
    document.body.dispatchEvent($scope.events[item.action]);
  }
  $scope.modal.nationIsBonusable = function(){
    console.log('Bonus');
    console.log($scope.modal.nation);
    return $scope.modal.nation.marker.alla.map(function(m){ if(m){ return m.occupied == false }else{return true;}}).sort()[0];
  }
  // document.body.addEventListener('under_kontroll', function(e){
  //   console.log('Allt är under kontroll.')
  //   var setControlToggle = function(m) {
  //     if(m.control){
  //       m.control = false; 
  //       m.menu = [{'title':'Under kontroll', 'action':'under_kontroll'},
  //               {'title':'Ockuperad av fiende', 'action':'ockupera'} ]; 
  //     }else{
  //       m.control = true; 
  //       m.menu = [{'title':'Ej under kontroll', 'action':'under_kontroll'},
  //               {'title':'Ockuperad av fiende', 'action':'ockupera'} ]; 
  //     }
  //   }
  //   if(false){
  //     e.selected.byggnader.map(function(byggnad){ 
  //       var m = byggnad.marker.filter(function(mark){ return mark.value == e.selected.value; })[0]; 
  //       setControlToggle(m)
  //     });
  //   } else {
  //     setControlToggle(e.selected);
  //   }
  //   $scope.modal.close();
  // });
  document.body.addEventListener('ockupera', function(e){
    console.log('Ockuperad mark.')
    var setOccupied = function(m) {
      if(m.occupied){ 
        // m.occupied = false; 
        m.menu = [{'title':'Ockuperad av fiende', 'action':'ockupera'}]; 
        m.byggnader.map(function(byggnad){
          // data.byggnader.map(function(b){
          //   if(byggnad.id == b.id){
          //     b.marker.map(function(mark){
          //       if(m.value==mark.value){
          //         console.log('Occupied false')
          //         socket.emit('occupied', {byggnad_id: byggnad.id, mark: m.mark, nr: m.nr, index: m.index, occupied: false});
          //       }
          //     });
          //   }
          // })
          byggnad.marker.map(function(mark){
            if(m.value==mark.value){
              console.log('Occupied false')
              socket.emit('occupied', {byggnad_id: byggnad.id, value: m.value, occupied: false});
            }
          });
        });
      }else{ 
        // m.occupied = true; 
        m.menu = [{'title':'Återta', 'action':'ockupera'}];
        m.byggnader.map(function(byggnad){
          byggnad.marker.map(function(mark){
            if(m.value==mark.value){
              console.log('Occupied true')
              socket.emit('occupied', {byggnad_id: byggnad.id, value: m.value, occupied: true});
            }
          });
        });
        if($scope.modal.nation) {
          setBonusToSelected(false);
        }
      } 
    }
    if(false){
      e.selected.byggnader.map(function(byggnad){ 
        var m = byggnad.marker.filter(function(mark){ return mark.value == e.selected.value; })[0]; 
        setOccupied(m);
      });
    } else {
      setOccupied(e.selected);
    }
    $scope.modal.close();
  });
  document.body.addEventListener('ockuperad_byggnad', function(e){
    console.log('Byggnad belägrad.')
    $scope.modal.menu = players.filter(function(p){return p.username != user.username;}).map(function(p){return {'title': p.username, 'action':'skicka_byggnad', 'sendTo': p.username}; });
    $scope.modal.content.style.height = ($scope.modal.menu.length*40+40)+'px';
  });
  document.body.addEventListener('skicka_byggnad', function(e){
    console.log('Byggnad övergiven. Ockuperad av '+ $scope.modal.sendTo + '.')
    //Send 
    var e ={from: user.username, to: $scope.modal.sendTo, type: $scope.modal.selected.type, byggnad_id: $scope.modal.selected.id};
    console.log(e);
    socket.emit('skicka_byggnad', {from: user.username, to: $scope.modal.sendTo, type: $scope.modal.selected.type, byggnad_id: $scope.modal.selected.id});
    socket.emit('nationer', user, {nation: undefined, index: $scope.modal.selected.nation})
    $scope.modal.close();
    $scope.modal.sendTo = '';
  });
  document.body.addEventListener('activate_bonus', function(e){
    note.innerHTML ='Nyhet: Ökade internationella konflikter tvingar staten att införa skatteplikt.';
    setBonusToSelected(true);
    // socket.emit('nationer', user, {index: $scope.modal.nation.index})
    $scope.modal.close();
  });
  var setBonusToSelected = function(bool){
    // $scope.modal.nation.bonus = bool; 
    $scope.modal.nation.byggnader.alla.map(function(pos){
      pos.map(function(byggnad){
        socket.emit('nation bonus', {byggnad_id: byggnad.id, bonus: bool});
      })
    })
  }
  document.body.addEventListener('split_nation', function(e){
    // var index = $scope.nationer.indexOf($scope.modal.nation);
    // $scope.nationer[index].byggnader.alla.map(function(markpos){ return markpos.map(function(city){
    //   city.nation = false;
    //   city.marker = city.marker.map(function(m){return {mark:m.mark, nr:m.nr, menu:m.menu};});
    //   prepareByggnad(city);
    //   return city;
    // })})
    // $scope.nationer.splice(index,1);
    $scope.modal.nation.byggnader.alla.map(function(pos){
      pos.map(function(city){
        socket.emit('set nation to byggnad', {byggnad_id: city.id, nation: false});
      });
    });
    socket.emit('nationer', user, {index: $scope.modal.nation.index});
    $scope.modal.close();
  });
  document.body.addEventListener('set_mark', function(e){
    console.log('Ändra mark.')
    $scope.modal.menu = [{'title':'Säd', 'action':'set_nr', 'setMark':'säd'},
                         {'title':'Olja', 'action':'set_nr', 'setMark':'olja'},
                         {'title':'Trä', 'action':'set_nr', 'setMark':'trä'},
                         {'title':'Djur', 'action':'set_nr', 'setMark':'djur'},
                         {'title':'Sten', 'action':'set_nr', 'setMark':'sten'}];
    $scope.modal.content.style.height = ($scope.modal.menu.length*40+40)+'px';
  });
  document.body.addEventListener('set_nr', function(e){
    console.log('Ändra mark.')
    $scope.modal.menu = [{'title':'2', 'action':'change_mark', 'setNr': 2},
                         {'title':'3', 'action':'change_mark', 'setNr': 3},
                         {'title':'4', 'action':'change_mark', 'setNr': 4},
                         {'title':'5', 'action':'change_mark', 'setNr': 5},
                         {'title':'6', 'action':'change_mark', 'setNr': 6},
                         {'title':'8', 'action':'change_mark', 'setNr': 8},
                         {'title':'9', 'action':'change_mark', 'setNr': 9},
                         {'title':'10', 'action':'change_mark', 'setNr': 10},
                         {'title':'11', 'action':'change_mark', 'setNr': 11},
                         {'title':'12', 'action':'change_mark', 'setNr': 12}];
    $scope.modal.content.style.height = ($scope.modal.menu.length*40+40)+'px';
  });
  document.body.addEventListener('change_mark', function(e){
    console.log('Ändra mark.')
    // socket.emit('byggnad_change_mark', {id: $scope.modal.selected.byggnad.id, updateMark: {index: $scope.modal.selected.byggnad.marker.indexOf($scope.modal.selected), mark: $scope.modal.setMark, nr: $scope.modal.setNr, value: $scope.modal.setMark + $scope.modal.setNr}})
    // $scope.modal.selected.index = $scope.modal.selected.byggnad.marker.indexOf($scope.modal.selected);
    // $scope.modal.selected.mark = $scope.modal.setMark;
    // $scope.modal.selected.nr = $scope.modal.setNr;
    // $scope.modal.selected.value = $scope.modal.setMark + $scope.modal.setNr;
    var d = {
      index: $scope.modal.selected.byggnad.marker.indexOf($scope.modal.selected),
      mark: $scope.modal.setMark,
      nr: $scope.modal.setNr,
      value: $scope.modal.setMark + $scope.modal.setNr,
      occupied: false,
      utdelning: $scope.modal.selected.byggnad.utdelning
    };
    console.log($scope.modal.selected.byggnad.id);
    socket.emit('byggnad_change_mark', {id: $scope.modal.selected.byggnad.id, updateMark: d} );
    $scope.modal.close();
  });
  document.body.addEventListener('add_mark', function(e){
    console.log('Lägg till mark.')
    $scope.modal.selected.marker.push({mark:'',nr:'?',value:'?',byggnad:$scope.modal.selected,menu:[]})
    $scope.modal.close();
  });
  document.body.addEventListener('delete_mark', function(e){
    console.log('Ta bort mark.')
    $scope.modal.selected.byggnad.marker = $scope.modal.selected.byggnad.marker.filter(function(m){return m.value != $scope.modal.selected.value;});
    $scope.modal.close();
  });
});

var updateTradeMenu;

app.controller('tradeOLController', function($scope){

  //TRADE
  $scope.resurser= resurser;
  $scope.resurserKeys= Object.keys(data.resurser);
  $scope.players = players;
  $scope.user = user;
  $scope.trade ={};
  $scope.trade.korg = [];

  updateTradeMenu = function(){
    $scope.user = user;
    $scope.players = players;
    $scope.$apply();
  }

  $scope.trade.add = function(type){
    if(!resurser[type][0]){return}
    var r = resurser[type].pop();
    resurser['t_'+type].push(r);
    $scope.trade.korg.push(r);
    trade_container.appendChild(r.node);
    updateItems();
  }
  $scope.trade.del = function(){
    var r = $scope.trade.korg.pop();
    resurser['t_'+r.type].pop();
    resurser[r.type].push(r);
    resurs_container.appendChild(r.node);
    updateItems();
  }
  $scope.trade.send = function(toPlayer){
    console.log('Sending '+$scope.trade.korg.map(function(r){return r.type}).toString()+' to '+toPlayer);
    $scope.trade.korg.map(function(res) { 
      // resurser['t_'+res.type] = [] 
      socket.emit('trade', {type: res.type, to: toPlayer.username, from: user.username});
    });
    // emptyTrade();
    $scope.trade.korg = []
    trade_container.innerHTML = '';
    setTimeout(function() {
      trademenu.toggle()
    }, 300);
  }
  $scope.trade.isTradable = function(){
    // Följande är en version där man bara kan trada med bank om man har över 4 av samma sort.
    // var most = {} ;
    // $scope.trade.korg.map(function(i){most[i.type] ? most[i.type]++ : most[i.type]=1 ;});
    // var key = Object.keys(most).sort(function(a,b){return most[a] < most[b];})[0] ;
    // $scope.trade.bankTradeValuta = key;
    // return $scope.trade.korg.filter(function(item){return item.type == key; }).length < 4;
    return true;
  }
  $scope.trade.tradeWithBank = function(){
    console.log('Trade four '+$scope.trade.bankTradeValuta+' for anything you like!')

    socket.emit('bank', {korg: $scope.trade.korg, from: user.username});
  }
  emptyTrade = function(){
    while($scope.trade.korg[0]){
      $scope.trade.del()
    }
    $scope.$apply();
  }

});

app.controller('priserSlideoutController', function($scope){
  $scope.resurser = resurser;
  $scope.resurserKeys = Object.keys(data.resurser);
  $scope.priser = priser;
  // $scope.priserItems = Object.keys($scope.priser.infanteri).concat(Object.keys($scope.priser.byggnader));
  // $scope.canBye = {}
  // $scope.canIBye = function(item, type){ 
  //   return !Object.keys(data.resurser).map(function(resurs){
  //     return $scope.priser[type][item][resurs].length <= resurser[resurs].length;
  //   }).sort()[0];
  // }
})

app.controller('eventController', function($scope){
  socket.on('events', function(events){
    $scope.events = events;
    console.log('events');
    console.log(events);
  })
})
var utdelning = [];

app.controller('dinturController', function($scope){

  $scope.user = user;
  socket.on('player', function(player){
    $scope.user = player;
    $scope.$apply();
  })
  socket.on('dices', function(q){
    $scope.d = q.dices;
    $scope.drag = [];
    utdelning = q.utd || [];
    $scope.$apply();
    dice_1.className += ' roll1'; 
    dice_2.className += ' roll2'; 
    setTimeout(function() {
      dice_1.className = 'dice'; 
      dice_2.className = 'dice';
      du_fick.style.height = '120px'; 
      du_fick.innerHTML = '<p>Du fick:</p>';
      // var utdelning = ['trä', 'säd'];
      utdelning.map(function(res) {
        r = new Resurs({type: res});
        r.node.style.display = 'inline-block'
        du_fick.appendChild(r.node);
      })
      var b =document.createElement('p');
      b.innerHTML = 'Bonus';
      du_fick.appendChild(b);
      var bonus = q.bonus || [];
      bonus.map(function(res) {
        r = new Resurs({type: res});
        r.node.style.display = 'inline-block'
        du_fick.appendChild(r.node);
      })
      du_fick.onclick = function() {
        du_fick.style.height = '30px'; 
        turer.style.height = '280px';
        du_fick.style.opacity = 0;
      }
    }, 1500);
  })

  $scope.drag = [];
  $scope.rollDices = function() {
    socket.emit('dices');
  }

  armedrag.onclick = function() {
    var conf = klar.hidden && confirm('Är du säker att du vill göra armedrag?');
    if(conf&&klar.hidden){
      $scope.drag.push({drag:'armedrag'});
      if($scope.drag.length==3){
        klar.hidden = false;
      }
      $scope.$apply();
    }
  }
  forska.onclick = function() {
    var conf = klar.hidden && confirm('Är du säker att du vill forska?');
    if(conf&&klar.hidden){
      $scope.drag.push({drag:'forska'});
      if($scope.drag.length==3){
        klar.hidden = false;
      }
      $scope.$apply();
    }
  }
  kort.onclick = function() {
    var conf = klar.hidden && confirm('Är du säker att du vill spela ett utväcklingskort?');
    if(conf&&klar.hidden){
      $scope.drag.push({drag:'kort'});
      if($scope.drag.length==3){
        klar.hidden = false;
      }
      $scope.$apply();
    }
  }
  klar.onclick = function(){
    socket.emit('din_tur');
    $scope.drag = [];
    klar.hidden = true;
    du_fick.style.height = '0px'; 
    du_fick.innerHTML = '<p>Slå tärningarna</p>';
    du_fick.style.height = '30px'; 
    turer.style.height = '0px';
    du_fick.style.opacity = 1;

  }

  var dice1 = (7*$scope.d-25);
  var dice2 = (-($scope.d*7+5));
  if($scope.d==3 || $scope.d==4 || $scope.d==6 || $scope.d==7 || $scope.d==9 || $scope.d==10 || $scope.d==11 || $scope.d==12){var d1_1 = '';}else{var d1_1 = 'hide';}
  if($scope.d==5 || $scope.d==6 || $scope.d==8 || $scope.d==9 || $scope.d==10 || $scope.d==11 || $scope.d==12){var d1_2 = '';}else{var d1_2 = 'hide';}
  if($scope.d==5 || $scope.d==6 || $scope.d==8 || $scope.d==9 || $scope.d==10 || $scope.d==11 || $scope.d==12){var d1_3 = '';}else{var d1_3 = 'hide';}
  if($scope.d==3 || $scope.d==4 || $scope.d==6 || $scope.d==7 || $scope.d==9 || $scope.d==10 || $scope.d==11 || $scope.d==12){var d1_4 = '';}else{var d1_4 = 'hide';}
  if($scope.d==2 || $scope.d==7 || $scope.d==10){var d1_5 = '';}else{var d1_5 = 'hide';}
  if($scope.d==9 || $scope.d==11 || $scope.d==12){var d1_6 = '';}else{var d1_6 = 'hide';}
  if($scope.d==9 || $scope.d==11 || $scope.d==12){var d1_7 = '';}else{var d1_7 = 'hide';}

  if($scope.d==5 || $scope.d==6 || $scope.d==7|| $scope.d==8 || $scope.d==10 || $scope.d==11 || $scope.d==12){var d2_1 = '';}else{var d2_1 = 'hide';}
  if($scope.d==4 || $scope.d==7|| $scope.d==8 || $scope.d==9 || $scope.d==10 || $scope.d==11 || $scope.d==12){var d2_2 = '';}else{var d2_2 = 'hide';}
  if($scope.d==4 || $scope.d==7|| $scope.d==8 || $scope.d==9 || $scope.d==10 || $scope.d==11 || $scope.d==12){var d2_3 = '';}else{var d2_3 = 'hide';}
  if($scope.d==5 || $scope.d==6 || $scope.d==7|| $scope.d==8 || $scope.d==10 || $scope.d==11 || $scope.d==12){var d2_4 = '';}else{var d2_4 = 'hide';}
  if($scope.d==2 || $scope.d==3 || $scope.d==5 || $scope.d==9 || $scope.d==10 || $scope.d==11){var d2_5 = '';}else{var d2_5 = 'hide';}
  if($scope.d==8 || $scope.d==12){var d2_6 = '';}else{var d2_6 = 'hide';}
  if($scope.d==8 || $scope.d==12){var d2_7 = '';}else{var d2_7 = 'hide';}

  // dices.innerHTML = '<h1 style="display:inline-block; margin:0px 5px;">'+$scope.d+'</h1>'+'<div style="display:inline-block;"><div class="dice" style="-webkit-transform: rotate('+dice1+'deg);"><div class="'+d1_1+'" style="left: 8px; top: 8px;"></div><div class="'+d1_2+'" style="left: 32px; top: 8px;"></div><div class="'+d1_3+'" style="left: 8px; top: 32px;"></div><div class="'+d1_4+'" style="left: 32px; top: 32px;"></div><div class="'+d1_5+'" style="left: 20px; top: 20px;"></div><div class="'+d1_6+'" style="left: 8px; top: 20px;"></div><div class="'+d1_7+'" style="left: 32px; top: 20px;"></div></div><div class="dice" style="-webkit-transform: rotate('+dice2+'deg);"><div class="'+d2_1+'" style="left: 8px; top: 8px;"></div><div class="'+d2_2+'" style="left: 32px; top: 8px;"></div><div class="'+d2_3+'" style="left: 8px; top: 32px;"></div><div class="'+d2_4+'" style="left: 32px; top: 32px;"></div><div class="'+d2_5+'" style="left: 20px; top: 20px;"></div><div class="'+d2_6+'" style="left: 8px; top: 20px;"></div><div class="'+d2_7+'" style="left: 32px; top: 20px;"></div></div></div>';

})