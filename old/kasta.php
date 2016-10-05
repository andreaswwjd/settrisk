<?php
//kasta.php?t=09
$t = $_REQUEST["t"];

for($p=1;$p<2;$p++){
	$utd=0;$T=0;$S=0;$O=0;$G=0;$D=0;
	$myfile = fopen("p".$p."_byggnader.txt", "r") or die("Unable to open file!");
	while(!feof($myfile)) {
		$l=str_split(fgets($myfile),3);
		$typ=$l[0];
		$nr1=$l[2];
		$nr2=$l[3];
		$nr3=$l[4];
		if($typ=='byy'||$typ=='std'){$f=1;}elseif($typ=='fab'){$f=2;}else{$f=0;}
		if($t==$nr1[1].$nr1[2]){$$nr1[0]+=(1*$f);}
		if($t==$nr2[1].$nr2[2]){$$nr2[0]+=(1*$f);}
		if($t==$nr3[1].$nr3[2]){$$nr3[0]+=(1*$f);}
	}
	fclose($myfile);
	$utd = $T+$S+$O+$G+$D;
	//echo "T$T\nS$S\nO$O\nG$G\nD$D\n";

	$myfile = fopen("p".$p."_resurser.txt", "r") or die("Unable to open file!");
	while(!feof($myfile)) {
		$l=explode("\t",fgets($myfile));
		$$l[0]+=$l[1];
	}
	fclose($myfile);
	$myfile = fopen("p".$p."_resurser.txt", "w") or die("Unable to open file!");
	fwrite($myfile, "T\t$T\t0\nS\t$S\t0\nO\t$O\t0\nG\t$G\t0\nD\t$D\t0");
	fclose($myfile);
	if($utd==1){$msg = "Du har fått $utd ny resurs!\n";}else{$msg = "Du har fått $utd nya resurser!\n";}
	echo $msg;

	$myfile = fopen("p".$p."_events.txt", "a") or die("Unable to open file!");
	fwrite($myfile, "uppdatera resurser\n");
	//fwrite($myfile, $msg);
	fclose($myfile);
}

?>