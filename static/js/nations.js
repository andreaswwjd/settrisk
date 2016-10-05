var players = [{player: 'Andreas'}, {player: 'Samuel'}, {player: 'Erik'}]

var byggnader = [{
  "player": "player",
  "type": "stad",
  "id": "1239878520998471",
  "nation": false,
  "marker": [{
    "mark": "säd", 
    "nr": 3, 
          },{
    "mark": "olja", 
    "nr": 12, 
          },{
    "mark": "djur", 
    "nr": 5
          }]
},{
  "player": "player",
  "type": "fabrik",
  "id": "1237381928378612",
  "nation": false,
  "marker": [{
    "mark": "sten", 
    "nr": 9, 
          },{
    "mark": "säd", 
    "nr": 3, 
          },{
    "mark": "djur", 
    "nr": 6
          }]
},{
  "player": "player",
  "type": "by",
  "id": "1239871280667238",
  "nation": false,
  "marker": [{
    "mark": "djur", 
    "nr": 6, 
          },{
    "mark": "trä", 
    "nr": 12
          }]
},{
  "player": "player",
  "type": "by",
  "id": "1239871284667238",
  "nation": false,
  "marker": [{
    "mark": "sten", 
    "nr": 9, 
          },{
    "mark": "djur", 
    "nr": 5
          }]
},{
  "player": "player",
  "type": "fabrik",
  "id": "1239871284667239",
  "nation": false,
  "marker": [{
    "mark": "sten", 
    "nr": 9 
  }]
}];

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

var constructNation = function(input, index){
  input.map(function(city){
    city.nation = index;
    city.p = 0;
    socket.emit('set nation to byggnad', {byggnad_id: city.id, nation: city.nation});
  });
  socket.emit('nationer', user, {index: index});

  // Remap input buildings 
  // OBS city är här en array av marker endast, ej object!
  var cities = input.map(function(city){ 
    city.menu = [ {'title':'Överge byggnad åt fiende', 'action':'ockuperad_byggnad'},
                  {'title':'Lägg till mark', 'action':'add_mark'} ];
    city.active = false;
    city.rank = 0;
    return city.marker.map(function(mark,i,a){ 
      mark.value = mark.mark+mark.nr;
      mark.byggnad = city;
      mark.byggnad.p = a.length;
      mark.byggnad.marker = [];
      mark.byggnader = [];
      mark.rank=0;
      mark.control = false;
      mark.occupied ? mark.menu = [ {'title':'Återta', 'action':'ockupera'} ] : mark.menu = [ {'title':'Ockuperad av fiende', 'action':'ockupera'} ];
      return mark;
    });
  });

  // Unique mark's
  var unika = [];
  var unika_marker = [];
  cities.map(function(city){ city.map(function(mark){ 
    if(unika.indexOf(mark.value) == -1){ 
      unika.push(mark.value); 
      unika_marker.push(mark);
    } 
  })});


  unika_marker = unika_marker.map(function(mark){ 
    mark.byggnader =  cities.filter(function(city){ 
                        return city.map(function(cmark){
                          return cmark.value==mark.value; //[false, false, true]
                        }).filter(function(bool){
                          return bool==true; // [true]
                        })[0]; 
                      }).map(function(city){
                        return city[0].byggnad
                      });
    mark.rank =       cities.filter(function(city){ 
                        return city.map(function(cmark){
                          return cmark.value==mark.value;
                        }).filter(function(bool){
                          return bool==true;
                        })[0]; 
                      }).map(function(city){
                        return parseInt('1'+'0'.repeat(city.length-1)) // rank_val for each city
                      }).reduce(function(rank_prev_city,rank_curr_city){
                        return rank_prev_city+rank_curr_city; // sum up all
                      })+Math.random(); // Needs to be a unique value
    return mark;
  });

  //
  cities.map(function(city){ city.map(function(mark){ 
    mark.byggnad.marker.push(unika_marker.filter(function(m){return m.value==mark.value})[0]);
  })}); 
 

  // Cities marks rank
  cities = cities.map(function(city){ 
    return city.map(function(mark){ 
      mark.rank = unika_marker.filter(function(m){ return m.value==mark.value; })[0].rank; 
      mark.byggnader = unika_marker.filter(function(m){ return m.value==mark.value; })[0].byggnader; 
      return mark;
    }).sort(function(mark_prev,mark_curr){ 
      return mark_curr.rank - mark_prev.rank; 
    })
  }).sort(function(city_prev,city_curr){ 
    var r1 = 0; city_curr.map(function(a){r1 += a.rank;});
    var r2 = 0; city_prev.map(function(a){r2 += a.rank;});
    return r1 - r2;
  });

  var nation = {
    index: index,
    range: {
      alla: [],
      upp: [],
      ner: []
    },
    marker: {
      alla: [],
      upp: [],
      ner: []
    },
    byggnader: {
      alla: [],
      upp: [],
      ner: []
    },
    bonus: false,
    menu: [{title:'Aktivera skatt', action:'activate_bonus'},{title:'Splitra nation', action:'split_nation'}]
  }

  // GENERATE NATION ALGORITM
  console.log('Genrate nation '+index)
  while(cities[0]){
    var byggnad = cities[0][0].byggnad;
    if( !nation.marker.alla[0] ){ // Empty array
      console.log('first');
      //if city of class b: 
      if(cities[0].length == 2){
        nation.marker.alla.unshift(cities[0].shift());
        nation.byggnader.alla.unshift([]);
        nation.marker.alla.unshift(undefined);
        nation.byggnader.alla.unshift([]);
        nation.marker.alla.unshift(cities[0].shift());
        nation.byggnader.alla.unshift([]);
      }else{
        while(cities[0][0]){ 
          nation.marker.alla.unshift(cities[0].shift());
          nation.byggnader.alla.unshift([]);
        }
      }
      nation.byggnader.alla[0].push(byggnad);
      cities.shift()
      continue;
    }
    if( cities[0].length == 3 ){ // If pos_class_3
        console.log('c');
      if( nation.marker.alla[0].value + nation.marker.alla[1].value == cities[0][0].value + cities[0][1].value ||  
          nation.marker.alla[0].value + nation.marker.alla[1].value == cities[0][1].value + cities[0][0].value ){ // Dubble matches? Begining
        console.log('dubble beg');
        cities[0].shift()
        cities[0].shift()
        nation.marker.alla.unshift(cities[0].shift()); 
        nation.byggnader.alla.unshift([byggnad]);
        cities.shift()
        continue;
      }
      if( nation.marker.alla[nation.marker.alla.length-1].value + nation.marker.alla[nation.marker.alla.length-2].value == cities[0][0].value + cities[0][1].value ||  
          nation.marker.alla[nation.marker.alla.length-2].value + nation.marker.alla[nation.marker.alla.length-1].value == cities[0][1].value + cities[0][0].value ){ // End
        console.log('dubble end');
        cities[0].shift()
        cities[0].shift()
        nation.marker.alla.push(cities[0].shift());
        nation.byggnader.alla.push([]);
        nation.byggnader.alla[nation.byggnader.alla.length-3].push(byggnad);
        cities.shift()
        continue;
      }
      if( nation.marker.alla[0].value == cities[0][0].value ){ // Match beginning?
        console.log('beg');
        cities[0].shift()
        while(cities[0][0]){
          nation.marker.alla.unshift(cities[0].shift()); // pop: Higest rank at ends.
          nation.byggnader.alla.unshift([]);
        }
        nation.byggnader.alla[0].push(byggnad);
        cities.shift()
        continue;
      }
      if( nation.marker.alla[nation.marker.alla.length-1].value == cities[0][0].value ){ // Match end?
        console.log('end');
        cities[0].shift()
        while(cities[0][0]){
          nation.marker.alla.push(cities[0].shift());
          nation.byggnader.alla.push([]);
        }
        nation.byggnader.alla[nation.byggnader.alla.length-3].push(byggnad);
        cities.shift()
        continue;
      }
        console.log('append');
      while(cities[0][0]){ // Else append in beginning
        nation.marker.alla.unshift(cities[0].shift());
        nation.byggnader.alla.unshift([]);
      }
      nation.byggnader.alla[0].push(byggnad);
      cities.shift()
      continue;
    }
    if( cities[0].length == 2 ){ // If pos_class_2
      console.log('b');
      for(var i=0; i<nation.marker.alla.length-2; i++){ // Search dubble match
        if(cities[0][0]){
          if(nation.marker.alla[i].value + nation.marker.alla[i+2].value == cities[0][0].value + cities[0][1].value ||  
          nation.marker.alla[i].value + nation.marker.alla[i+2].value == cities[0][1].value + cities[0][0].value){
            nation.byggnader.alla[i].push(byggnad);
            byggnad=false;
          }
        }else{ break }
      }
      if(!byggnad){
        console.log('dubble');
        cities.shift()
        continue;
      }
      if(nation.marker.alla[nation.marker.alla.length-1].value == cities[0][0].value){ // Match at end
        console.log('end');
        cities[0].shift()
        nation.marker.alla.push(false); 
        nation.byggnader.alla.push([]);
        nation.marker.alla.push(cities[0].shift()); 
        nation.byggnader.alla.push([]);
        nation.byggnader.alla[nation.byggnader.alla.length-3].push(byggnad)
        cities.shift()
        continue;
      }
      if(nation.marker.alla[nation.marker.alla.length-1].value == cities[0][1].value){ // Match at end
        console.log('end');
        cities[0].pop()
        nation.marker.alla.push(false); 
        nation.byggnader.alla.push([]);
        nation.marker.alla.push(cities[0].shift()); 
        nation.byggnader.alla.push([]);
        nation.byggnader.alla[nation.byggnader.alla.length-3].push(byggnad)
        cities.shift()
        continue;
      }
      if(nation.marker.alla[0].value == cities[0][0].value){ // Match at beginning
        console.log('beg');
        cities[0].shift()
      }else if(nation.marker.alla[0].value == cities[0][1].value){
        console.log('beg');
        cities[0].pop()
      }else{
        console.log('append');
        nation.marker.alla.unshift(cities[0].shift()); // Else append 
        nation.byggnader.alla.unshift([]);
      }
      nation.marker.alla.unshift(false); 
      nation.byggnader.alla.unshift([]);
      nation.marker.alla.unshift(cities[0].shift()); 
      nation.byggnader.alla.unshift([byggnad]);
      cities.shift()
      continue;
    }
    if( cities[0].length == 1 ){ // If pos_class_1
      console.log('a');
      for(i in nation.marker.alla){ // Match?
        if(cities[0][0].value){
          if(nation.marker.alla[i].value == cities[0][0].value){
            nation.byggnader.alla[i].push(byggnad);
            cities.shift();
            break;
          }
        }
      }
      if(cities[0]){ // Else append
        console.log('append');
        nation.marker.alla.push(cities[0].shift()); 
        nation.byggnader.alla.push([byggnad]);
        cities.shift();
      }
    }
  }

  cities.map(function(city){ city.map(function(mark){ 
    mark.byggnad.p = city.length; 
  })})

  nation.marker.upp = nation.marker.alla.filter(function(a,i){return i%2==0})
  nation.marker.ner = nation.marker.alla.filter(function(a,i){return i%2==1})
  nation.byggnader.upp = nation.byggnader.alla.filter(function(a,i){return i%2==0})
  nation.byggnader.ner = nation.byggnader.alla.filter(function(a,i){return i%2==1})
  nation.range.alla = nation.marker.alla.map(function(a,i){return i})
  nation.range.upp = nation.marker.upp.map(function(a,i){return i})
  nation.range.ner = nation.marker.ner.map(function(a,i){return i})

  console.log(nation)
  return nation;
}
