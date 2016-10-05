<!DOCTYPE html>
<html>
<head>
<script>
function loadXMLDoc()
{
var xmlhttp;
if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
  }
else
  {// code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
xmlhttp.onreadystatechange=function()
  {
  if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
    document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
    }
  }
xmlhttp.open("GET","player1.txt",true);
xmlhttp.send();
}
</script>
<style>
  .skog{
    display: inline-block;
    position: absolute;
    height: 154px;
    background-image: url("skog.png");
    width: 136px;
  }
  .nr{
    height: 154px;
    width: 136px;
    position: absolute;
  }
  .nr5{
    background-image: url("5.png");
  }
  .p2{
    margin-left: 136px;
  }
  .p3{
    margin-left: 272px;
  }
  .p4{
    margin-left: 68px;
    margin-top: 118px;
  }
  .p5{
    margin-left: 204px;
    margin-top: 118px;
  }
  .p6{
    margin-left: 340px;
    margin-top: 118px;
  }
</style>
</head>
<body>

<div id="myDiv"><h2>Let AJAX change this text</h2></div>
<button type="button" onclick="loadXMLDoc()">Change Content</button>

<div>

<div class="skog p1" id="id1"></div>
<div class="skog p2" id="id2"></div>
<div class="skog p3" id="id3"></div>
<div class="skog p4" id="id4"></div>
<div class="skog p5" id="id5"></div>
<div class="skog p6" id="id6"></div>
<div class="nr5 nr p1" id="id1"></div>
<div class="nr5 nr p2" id="id2"></div>
<div class="nr5 nr p3" id="id3"></div>
<div class="nr5 nr p4" id="id4"></div>
<div class="nr5 nr p5" id="id5"></div>
<div class="nr5 nr p6" id="id6"></div>

</div>

</body>
</html>
