<!DOCTYPE html>
<html>
<head>
<style>
body{margin:0;}
#resurser .tru{position: absolute !important;
  display: block !important;
  margin-top: -100px !important;
  margin-left: 10px !important;}

.resurs, .pris>div, .resx{
  width: 10px;
  height: 10px;
  
  position: absolute;
  border-radius: 100%;
  box-shadow: -1px 1px 1px 0px rgba(0,0,0,0.75);
  margin-left: -1px;
}
.T, .T>.cash{  background-color: green;}
.S, .S>.cash{  background-color: rgb(216, 216, 0);}
.O, .O>.cash{  background-color: black;}
.G, .G>.cash{  background-color: gray;}
.D, .D>.cash{  background-color: brown;}
.hide, .hidebox{  display: none;}
.show{  opacity: 1;}
.pris>.cash{  display:block;}
.pris{  position: absolute;
		margin: 0 0 0 -20px;
}
.korgimg{position:absolute;margin:-10px 0 0 10px;}

.infanteri, .byggnad{display: inline-flex;}
.infanteri_div, .byggnader_div{
  width: 120px;}
.infanteri img, .byggnad img{
  height: 30px;
  width: 30px;
}
.stilla{position: absolute;
  margin-top: 0px !important;
  margin-left: 0px !important;}
.gray>img{  -webkit-filter: grayscale(100%);}
.alert{height:100%;}
.blur{-webkit-filter: blur(10px); }
.btn{border-radius: 3px;
  box-shadow: -1px 1px 3px 0px rgba(0,0,0,0.55);
  width:60px;
  display: inline-flex;
  margin: 3px;
  padding: 0 3px;}
.selected{background-color: orange;}
</style>
<script src="jquery-min.js"></script>
<script>
var p=1; var T=0; var S=0; var O=0; var G=0; var D=0; var korg='';
<?php $p=1; ?>
var korginf;
var korgbygg;
var korg_res;
var xmlhttp=new XMLHttpRequest();
xmlhttp.onreadystatechange=function(){
  	if (xmlhttp.readyState==4 && xmlhttp.status==200){
    	var resurser=xmlhttp.responseText.split("\n");
    	korg_res=resurser;
    	var divs=""; var x=0;
	    for(var r=0;r<resurser.length;r++){
	    	var res=resurser[r].split("\t");
	    	korg_res[r]=[res[0],parseInt(res[1]),parseInt(res[2])];
	    	for(var i=0;i<res[1];i++){
	    		x+=9;
	    		divs+="<div id='"+res[0]+i+"' class='"+res[0]+" resurs' style='margin-left: "+x+"px;margin-top:0;'></div></div>";
	    	}
	    }
    	document.getElementById("resurser").innerHTML=divs;
    }
}
xmlhttp.open("GET","p"+p+"_resurser.txt",true);
xmlhttp.send();

</script>
</head>

<body onload="">
<div id="alert" style='width:100%;position: relative;  -webkit-filter: blur(0px);'>
	<div id='varbyggerdu' class='hidebox'>
		<div>
		<?php //for($i=1;$i<5;$i++){echo "<div class='nation btn' onclick='var N=".$i.";'>Nation ".$i."</div>";} ?>
		</div>
		<div>Mark 1:
		<?php for($i=0;$i<5;$i++){echo "<div class='mark1 btn' onclick='var m1=".$i.";'>".$i."</div>";} ?>
		</div>
		<div>
		<?php for($i=2;$i<13;$i++){if($i!=7){echo "<div class='nr1 btn' onclick='var nr1=".$i.";'>".$i."</div>";}} ?>
		</div>
		<div>Mark 2:
		<?php for($i=0;$i<5;$i++){echo "<div class='mark2 btn' onclick='var m2=".$i.";'>".$i."</div>";} ?>
		</div>
		<div>
		<?php for($i=2;$i<13;$i++){if($i!=7){echo "<div class='nr2 btn' onclick='var nr2=".$i.";'>".$i."</div>";}} ?>
		</div>
		<div>Mark 3:
		<?php for($i=0;$i<5;$i++){echo "<div class='mark3 btn' onclick='var m3=".$i.";'>".$i."</div>";} ?>
		</div>
		<div>
		<?php for($i=2;$i<13;$i++){if($i!=7){echo "<div class='nr3 btn' onclick='var nr3=".$i.";'>".$i."</div>";}} ?>
		</div>
		<div id="varbyggerduBTN" onclick="alertboxhide('#varbyggerdu')">avbryt</div>
	</div>
</div>
<div id='body'>
	<div id="notes_div"></div>
	<button type="button" onclick="kasta()">Kasta tärningar</button>
	<button type="button" onclick="uppdateraPriserInfanteri('all');uppdateraPriserByggnader('all');">Uppdatera priser</button>
	<button type="button" onclick="uppdateraResurser();">Uppdatera resurser</button>
	<div id="priser_infanteri">
		<?php
			$myfile=fopen("priser_infanteri.txt", "r");
			$txt=fread($myfile, filesize("priser_infanteri.txt"));
			fclose($myfile);
			$lines=explode("\n", $txt);
			$txt='';
			echo "<div class='infanteri_div'>";
		    for($l=0;$l<sizeof($lines);$l++){
				$line=explode("\t",$lines[$l]);
				$txt.="[0,'".$line[0]."','".$line[1]."'],";
		    	echo "<div id='".$line[0]."' class='".$line[0]." infanteri' onclick=\"tillKorgen('".$line[0]."', korginf, ".$l.");\">";
		    	echo "<img src='units/".$line[0].".png'>";
		    	echo "<div id='pris_".$line[0]."' class='pris'>";
		    	//echo $pricetag;
		    	echo "</div></div>";
		    }
		    echo "<script>korginf=[".$txt."]; </script></div>";
		?>
	</div>
	<div id="priser_byggnader">
		<?php
			$myfile=fopen("priser_byggnader.txt", "r");
			$txt=fread($myfile, filesize("priser_byggnader.txt"));
			fclose($myfile);
			$lines=explode("\n", $txt);
			$txt='';
			echo "<div class='byggnader_div'>";
		    for($l=0;$l<sizeof($lines);$l++){
				$line=explode("\t",$lines[$l]);
				$txt.="[0,'".$line[0]."','".$line[1]."'],";
		    	echo "<div id='".$line[0]."' class='".$line[0]." byggnad' onclick=\"tillKorgen('".$line[0]."', korgbygg, ".$l.");\">";
		    	echo "<img src='units/".$line[0].".png'>";
		    	echo "<div id='pris_".$line[0]."' class='pris'>";
		    	//echo $pricetag;
		    	echo "</div></div>";
		    }
		    echo "<script>korgbygg=[".$txt."];</script></div>";
		?>
	</div>
	<button type="button" onclick="köpa()">Köp</button>
	<button type="button" onclick="rensaKorg();">Rensa korg</button>
	<div id="resurser"><h2>Du har inga resurser...</h2></div>
</div>
<script>

function uppdateraInterval() {
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
	  	if (xmlhttp.readyState==4 && xmlhttp.status==200){
	    	switch (xmlhttp.responseText.split(':')[0]) {
			    case "":
			        break;
			    case "uppdatera priser":
			    	var utyp=xmlhttp.responseText.split(':')[1];
			        uppdateraPriserInfanteri(utyp);
			        uppdateraPriserByggnader(utyp);
			        break;
			    case "uppdatera resurser\n":
			        uppdateraResurser();
			        break;
			    case "köp":
			    	var byggnad=xmlhttp.responseText.split(':')[1]
			    	alertbox('#varbyggerdu');
			    	/*n=prompt("Nation (endast en siffra):");
			        m1=prompt("Mark1:");
			        m2=prompt("Mark2:");
			        m3=prompt("Mark3:");*/
			        break;
			    case "din tur\n":
			        msg = "Din tur!";
			        document.getElementById("notes_div").innerHTML=msg;
			        kasta();
			        break;
			    default:
			        msg = xmlhttp.responseText;
			        document.getElementById("notes_div").innerHTML=msg;
			        alert(msg);
			}
	    }
	  }
	xmlhttp.open("GET","events.php?p=1",true);
	xmlhttp.send();
}
setInterval(function(){ uppdateraInterval(); }, 1000);

function uppdateraResurser() {
	rensaKorg();
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
	  	if (xmlhttp.readyState==4 && xmlhttp.status==200){
	    	var resurser=xmlhttp.responseText.split("\n");
	    	korg_res=resurser;
	    	var divs=""; var x=0;
		    for(var r=0;r<resurser.length;r++){
		    	var res=resurser[r].split("\t");
		    	korg_res[r]=[res[0],parseInt(res[1]),parseInt(res[2])];
		    	for(var i=0;i<res[1];i++){
		    		x+=9;
		    		divs+="<div id='"+res[0]+i+"' class='"+res[0]+" resurs' style='margin-left: "+x+"px;margin-top:0;'></div></div>";
		    	}
		    }
	    	document.getElementById("resurser").innerHTML=divs;
	    }
	}
	xmlhttp.open("GET","p"+p+"_resurser.txt",true);
	xmlhttp.send();
}

function uppdateraPriserInfanteri(utyp) {
	rensaKorg();
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
	  	if (xmlhttp.readyState==4 && xmlhttp.status==200){
	    	var lines=xmlhttp.responseText.split("\n");
		    for(var l=0;l<lines.length;l++){
		    	typ=lines[l].split("\t")[0];
		    	if(utyp==typ || utyp=='all'){
		    		korginf[l][2]=lines[l].split("\t")[1];
		    		priser=lines[l].split("\t")[1].split(',');
		    		var divs='';
			    	for(var i=0;i<priser.length;i++){
			    		for(var n=0;n<priser[i][1];n++){
				    		divs+="<div class='"+priser[i][0]+" cash_"+korginf[l][1]+" hide'></div>";
				    	}
			    	}
	    			document.getElementById("pris_"+typ).innerHTML=divs;
			    }
		    }
	    }
	}
	xmlhttp.open("GET","priser_infanteri.txt",true);
	xmlhttp.send();
}

function uppdateraPriserByggnader(utyp) {
	rensaKorg();
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
	  	if (xmlhttp.readyState==4 && xmlhttp.status==200){
	    	var lines=xmlhttp.responseText.split("\n");
		    for(var l=0;l<lines.length;l++){
		    	typ=lines[l].split("\t")[0];
		    	if(utyp==typ || utyp=='all'){
		    		korgbygg[l][2]=lines[l].split("\t")[1];
		    		priser=lines[l].split("\t")[1].split(',');
		    		var divs='';
			    	for(var i=0;i<priser.length;i++){
			    		for(var n=0;n<priser[i][1];n++){
				    		divs+="<div class='"+priser[i][0]+" cash_"+korgbygg[l][1]+" hide'></div>";
				    	}
			    	}
	    			document.getElementById("pris_"+typ).innerHTML=divs;
			    }
		    }
	    }
	}
	xmlhttp.open("GET","priser_byggnader.txt",true);
	xmlhttp.send();
}

function kasta() {
	var t = prompt("Din tur! Ange utfall:");
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
	  	if (xmlhttp.readyState==4 && xmlhttp.status==200){
	    	document.getElementById("notes_div").innerHTML=xmlhttp.responseText;
	    	alert(xmlhttp.responseText);
	    	uppdateraResurser();
	    }
	}
	xmlhttp.open("GET","kasta.php?t="+t,true);
	xmlhttp.send();
}

function köpa(){
	var txt='';
	for(var i=0;i<korginf.length;i++){if (korginf[i][0]!=0){txt+=korginf[i][0]+':'+korginf[i][1]+',';}}
	for(var i=0;i<korgbygg.length;i++){if (korgbygg[i][0]!=0){txt+=korgbygg[i][0]+':'+korgbygg[i][1]+',';}}
	var confirmed=true;//confirm("Är du säker att du vill köpa?");
	if(confirmed!=true){return;}
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
	  	if (xmlhttp.readyState==4 && xmlhttp.status==200){
	  		uppdateraResurser();
	    	document.getElementById("notes_div").innerHTML=xmlhttp.responseText;
	    }
	}
	xmlhttp.open("GET","köp.php?p="+p+"&q="+txt,true);
	xmlhttp.send();
}

function tillKorgen(typ, korgklass, index){
	$(document).ready(function(){
	//Om har class "du har råd": else: note
		if(!$('#'+typ).hasClass('gray')){
	//Korgbygg +=1
			korgklass[index][0]+=1;
	//Tag addClass()
			$("#tag_"+typ).remove();//om har tag->remove
			$('#pris_'+typ).append("<img id='tag_"+typ+"' class='korgimg' src='"+korgklass[index][0]+".png'>");//tag i hörnet
	//Flytta res  addClass()
			var p=korgklass[index][2].split(',');
			for(var pl=0;pl<p.length;pl++){
				var i=0;var x=0;
				while(x<p[pl][1]){
					if(!$('#'+p[pl][0]+i).hasClass('hide')){
						$('#'+p[pl][0]+i).addClass('hide');
						x+=1; 
						//Korgres +=1
						korg_res[pl][2]+=1;
						//Cash append(<div>)
						var div="<div class='"+p[pl][0]+" korgimg resurs cash' style='margin-left: "+(-5+Math.random()*10)+"px;margin-top:"+(5+Math.random()*10)+"px;'></div>";
						$('#pris_'+typ).append(div);//cash hamnar ovanpå köp
					}
					i+=1;
				}
			}
			grayUnits();//Kolla har jag råd?-gråmarkera units: If(Res - korgres - prisunit>=0)
		}else{
			document.getElementById("notes_div").innerHTML='Sorry, du har för lite resurser.';
		}
	});
}

function grayUnits(){
	$(document).ready(function(){
		var pris;
		for(var u=0;u<korginf.length;u++){
			//Kolla har jag råd?-gråmarkera units: If(Res - korgres - prisunit>=0)
			pris=korginf[u][2].split(',');
			for(var i=0;i<pris.length;i++){
				if((korg_res[i][1] - korg_res[i][2] - pris[i][1]) < 0){$('#'+korginf[u][1]).addClass('gray');}
			}
		}
		for(var u=0;u<korgbygg.length;u++){
			//Kolla har jag råd?-gråmarkera units: If(Res - korgres - prisunit>=0)
			pris=korgbygg[u][2].split(',');
			for(var i=0;i<pris.length;i++){
				if((korg_res[i][1] - korg_res[i][2] - pris[i][1]) < 0){$('#'+korgbygg[u][1]).addClass('gray');}
			}
		}
	});
}

/*
function addClass(id, add, rmv){
	$(document).ready(function(){
		$(id).addClass(add).removeClass(rmv);
	});
}

function addToBasket(id, nr){
	$(document).ready(function(){
		$("#tag_"+id).remove();//om har tag->remove
		$('#pris_'+id).append("<img id='tag_"+id+"' class='korgimg' src='"+nr+".png'>");//tag i hörnet
		var div="<div class='korgimg resurs cash' style='margin-left: "+(-5+Math.random()*10)+"px;margin-top:"+(5+Math.random()*10)+"px;'></div>";
		$('.cash_'+id).append(div);//cash hamnar ovanpå köp
	});
}

function removeResurs(priser){
	$(document).ready(function(){
		var p=priser.split(',');
		for(var pl=0;pl<p.length;pl++){
			var i=0;var x=0;
			while(x<p[pl][1]){
				if($('#'+p[pl][0]+i).hasClass('resurs')){
					$('#'+p[pl][0]+i).addClass('hide');
					x+=1;
				}
				i+=1;
			}
		}
	});
}*/

function empty_korg(korg,index){
	var i=0;
	while(i<korg.length){
		korg[i][index]=0;
		i+=1;
	}
}
function rensaKorg(){
	empty_korg(korgbygg,0);
	empty_korg(korginf,0);
	empty_korg(korg_res,2);
	$(document).ready(function(){
		$('.korgimg').remove('.korgimg');
		$('.hide').removeClass('hide');
		$('.gray').removeClass('gray');
	});
}

function alertbox(box){
	$(document).ready(function(){
		$(box).removeClass('hidebox');
		//$('#body').addClass('hidebox');
		$('#alert').addClass('alert');
		$('#body').addClass('blur');
	});
}
function alertboxhide(box){
	$(document).ready(function(){
		$(box).addClass('hidebox');
		//$('#body').removeClass('hidebox');
		$('#alert').removeClass('alert');
		$('#body').removeClass('blur');
	});
}
$(document).ready(function(){
	$(".nation").click(function(){
		if(!$(this).hasClass("selected")){
			$(".nation").removeClass("selected");
			$(this).addClass("selected");
		};
	});
	$(".mark1").click(function(){
		if(!$(this).hasClass("selected")){
			$(".mark1").removeClass("selected");
			$(this).addClass("selected");
		};
	});
	$(".nr1").click(function(){
		if(!$(this).hasClass("selected")){
			$(".nr1").removeClass("selected");
			$(this).addClass("selected");
		};
	});
	$(".mark2").click(function(){
		if(!$(this).hasClass("selected")){
			$(".mark2").removeClass("selected");
			$(this).addClass("selected");
		};
	});
	$(".nr2").click(function(){
		if(!$(this).hasClass("selected")){
			$(".nr2").removeClass("selected");
			$(this).addClass("selected");
		};
	});
	$(".mark3").click(function(){
		if(!$(this).hasClass("selected")){
			$(".mark3").removeClass("selected");
			$(this).addClass("selected");
		};
	});
	$(".nr3").click(function(){
		if(!$(this).hasClass("selected")){
			$(".nr3").removeClass("selected");
			$(this).addClass("selected");
		};
	});
});


uppdateraResurser();uppdateraPriserInfanteri('all');uppdateraPriserByggnader('all');grayUnits();
</script>

</body>
</html>
