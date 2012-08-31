<?php

	# Includes
	require_once("../inc/error.inc.php");
	require_once("../inc/database.inc.php");
	require_once("../inc/security.inc.php");

	// Extracting the URL
	$pfi = $_REQUEST['pfi'];

	// Determining the BBOX of the property whose PFI is $pfi
//	$sql = sanitizeSQL("select xmini||','||ymini||','||xmaxi||','||ymaxi as bbox from (select round(cast((select min(st_x) from (select ST_X(ST_PointN(s.bbox_geom,generate_series(1, 4))) as st_x) xm) as numeric),6) as xmini,round(cast((select min(st_y) from (select ST_Y(ST_PointN(s.bbox_geom,generate_series(1, 4))) as st_y) ym) as numeric),6) as ymini,round(cast((select max(st_x) from (select ST_X(ST_PointN(s.bbox_geom,generate_series(1, 4))) as st_x) xm2) as numeric),6) as xmaxi,round(cast((select max(st_y) from (select ST_Y(ST_PointN(s.bbox_geom,generate_series(1, 4))) as st_y) ym2) as numeric),6) as ymaxi from (SELECT ST_Boundary(ST_Envelope(ST_Buffer(the_geom,st_maxdistance(the_geom,the_geom)/8))) as bbox_geom FROM dse_vmprop_property WHERE prop_pfi='".$pfi."') s) t");
	$sql = sanitizeSQL("select round(((xmini+xmaxi)/2-offset_c),6)||','||round(((ymini+ymaxi)/2-offset_c),6)||','||round(((xmini+xmaxi)/2+offset_c),6)||','||round(((ymini+ymaxi)/2+offset_c),6) as bbox from (select xmini,ymini,xmaxi,ymaxi,greatest(xmaxi-xmini,ymaxi-ymini)/2 as offset_c from (select round(cast((select min(st_x) from (select ST_X(ST_PointN(s.bbox_geom,generate_series(1, 4))) as st_x) xm) as numeric),6) as xmini,round(cast((select min(st_y) from (select ST_Y(ST_PointN(s.bbox_geom,generate_series(1, 4))) as st_y) ym) as numeric),6) as ymini,round(cast((select max(st_x) from (select ST_X(ST_PointN(s.bbox_geom,generate_series(1, 4))) as st_x) xm2) as numeric),6) as xmaxi,round(cast((select max(st_y) from (select ST_Y(ST_PointN(s.bbox_geom,generate_series(1, 4))) as st_y) ym2) as numeric),6) as ymaxi from (SELECT st_transform(ST_Boundary(ST_Envelope(ST_Buffer(the_geom,st_maxdistance(the_geom,the_geom)/16))),900913) as bbox_geom FROM dse_vmprop_property WHERE prop_pfi='".$pfi."') s) t) d");
	if (isset($_REQUEST['debug']))
	{
		echo $sql;
		echo "<br><br>";
	}
	$pgconn = pgConnection();
    /*** fetch into an PDOStatement object ***/
    $recordSet = $pgconn->prepare($sql);
    $recordSet->execute();

       while ($row  = $recordSet->fetch(PDO::FETCH_ASSOC))
	{
		foreach ($row as $key => $val)
		{
			$bbox = $val;
		}
	}

	// open the file in a binary mode
	$url = "http://basemap.pozi.com/geoserver/VICMAP/wms?service=WMS&version=1.1.0&request=GetMap&layers=VICMAP:VW_VICMAP_PROPERTY,VICMAP:VW_VICMAP_PROPERTY_LINE&styles=&bbox=".$bbox."&format=image/png&width=250&height=250&srs=EPSG:900913&viewparams=PFI:".$pfi;
	$url2 = "http://basemap.pozi.com/geoserver/VICMAP/wms?service=WMS&version=1.1.0&request=GetMap&layers=VICMAP:VMPROP_PROPERTY_OPTI&styles=&bbox=".$bbox."&format=image/png&width=250&height=250&srs=EPSG:900913";
	if (isset($_REQUEST['debug']))
	{
		echo $url;
		echo "<br><br>";
		echo "<img src='".$url."' border=1 />";

		echo "<br><br>";

		echo $url2;
		echo "<br><br>";
		echo "<img src='".$url2."' border=1 />";
	}
	else
	{
		$fp = file_get_contents($url);

		// send the right headers
		header("Content-Type: image/png");
		//header("Content-Length: " . filesize($url));
		// dump the picture and stop the script
		fpassthru($fp);
		exit;}?>