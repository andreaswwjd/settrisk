<?php
//köpa.php?p=1&q=2:tru,1:byy

$p = $_REQUEST["p"];
$q = explode(',', $_REQUEST["q"]);
$nr=sizeof($q)-1;
$msg="Du har köpt ";
$events="";


$price_files=["_infanteri.txt","_byggnader.txt"];

$myfile = fopen("p".$p."_resurser.txt", "r") or die("Kan inte öppna filen p".$p."_resurser.txt!");
	while(!feof($myfile)) {
		$l=explode("\t",fgets($myfile));
		$$l[0]=$l[1]; //$T=0;$S=0;$O=0;$G=0;$D=0;
	}
	fclose($myfile);

for($filenr=0;$filenr<sizeof($price_files);$filenr++){
	$myfile = fopen("p".$p.$price_files[$filenr], "r") or die("Kan inte öppna filen p".$p.$price_files[$filenr]."!");
	while(!feof($myfile)) {
		$l=explode("\t",fgets($myfile));
		$$l[0]=$l[1]; //$tru=0;$mtr=0;$ltk=0;$ttk=0;$jfp=0;
	}
	fclose($myfile);
}

for($a=0;$a<$nr;$a++){
	if($a!=0){$msg=$msg." och ";}
	for($filenr=0;$filenr<sizeof($price_files);$filenr++){
		$myfile = fopen("priser".$price_files[$filenr], "r") or die("Kan inte öppna filen priser$price_files[$filenr]!");
		while(!feof($myfile)) {
			$l=explode("\t", fgets($myfile));
			$pris=explode(',', $l[1]);
			
			if($l[0]==explode(':', $q[$a])[1]){
				for($x=0;$x<$q[$a][0];$x++){
					for($i=0;$i<sizeof($pris);$i++){
						if($$pris[$i][0]-$pris[$i][1]>=0){
							$$pris[$i][0]-=$pris[$i][1];//$S-=1;
						}else{ die("Sorry, du har för lite resurser.");}
					}
					if($filenr==1){$events=$events.'köp:'.$l[0]."\n";}
				}
				$$l[0]+=$x;//$tru+=1;
				if($q[$a][0]>1){$msg=$msg. "$x $l[3]";}else{$msg=$msg. "$x $l[2]";}
			}
			$$price_files[$filenr]=$$price_files[$filenr].$l[0]."\t".$$l[0]."\t\n";
			//die($$price_files[$filenr]);
		}
		fclose($myfile);
	}
}

$msg=$msg."!\n";

$myfile = fopen("p".$p."_resurser.txt", "w") or die("Kan inte öppna filen p".$p."_resurser.txt!");
fwrite($myfile, "T\t$T\t0\nS\t$S\t0\nO\t$O\t0\nG\t$G\t0\nD\t$D\t0");
fclose($myfile);


$myfile = fopen("p".$p."_infanteri.txt", "w") or die("Kan inte öppna filen p".$p."_resurser.txt!");
fwrite($myfile, $$price_files[0]); //$tru=0;$mtr=0;$ltk=0;$ttk=0;$jfp=0;
fclose($myfile);

$eventsfile = fopen("p".$p."_events.txt", "a") or die("Kan inte öppna filen p".$p."_events.txt!");
fwrite($eventsfile, $msg.$events);
fclose($eventsfile);



//$myfile = fopen("p".$p."_events.txt", "w") or die("Kan inte öppna filen file!");
//fwrite($myfile, $txt);
//while(!feof($myfile)) 
//fgets($myfile)
//fclose($myfile);
//readfile("p".$p."_events.txt")

?>