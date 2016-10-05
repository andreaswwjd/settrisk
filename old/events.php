<?php

$p = $_REQUEST["p"];

//Echo first line from p1_events.txt, and overwrite with the rest:
$eventsfile = fopen("p".$p."_events.txt", "r") or die("Unable to open file!");
$line = fgets($eventsfile);
echo $line;
$allotherlines='';
while(!feof($eventsfile)) { $allotherlines = $allotherlines.fgets($eventsfile); }
fclose($eventsfile);

$eventsfile = fopen("p".$p."_events.txt", "w") or die("Unable to open file!");
fwrite($eventsfile, $allotherlines);
fclose($eventsfile);

//Log events in p1_log.txt
$logfile = fopen("p".$p."_log.txt", "a");
fwrite($logfile, $line);
fclose($logfile);


//$myfile = fopen("p".$p."_events.txt", "w") or die("Unable to open file!");
//fwrite($myfile, $txt);
//while(!feof($myfile)) 
//fgets($myfile)
//fclose($myfile);
//readfile("p".$p."_events.txt")

?>