<?php

$imgRealPath=getcwd();
$imgWebPath =substr($imgRealPath,24);

echo "<h1>Directories</h1>";
echo "<a href=\"..\">..</a><br>";
foreach(glob($imgRealPath."/*") as $dname){
	if(is_dir($dname))
	{
		echo "<a href=\"" . $imgWebPath . "/" . baseName($dname) . "\">".baseName($dname)."</a><br>";
	}
}

echo "<br>";
echo "<h1>Images</h1>";
foreach(glob("$imgRealPath/{*.jpg,*.png,*.gif}", GLOB_BRACE) as $fname) {
	echo "<a href=\"" . $imgWebPath . "/" . baseName($fname) . "\"><img src=\"" . $imgWebPath . "/" . baseName($fname) . "\" border=0/></a>";
}

?>
