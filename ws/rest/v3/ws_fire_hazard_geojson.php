<?php
/**
 * Multi Search
 * Search for the properties closest to the lat/long passed as a parameter and returns a JSON object
 * (both spatially with the bounding box extent and in the database, with the table name and object ID)
 *
 * @param 		string 		$lat 		latitude
 * @param		string		$lon		longitude
 * @param		string		$limit		maximum number of records returned by the entire search
 * @return 		string		- resulting json string
 */

# Includes
require_once("../inc/error.inc.php");
require_once("../inc/database.inc.php");
require_once("../inc/security.inc.php");

# Set arguments for error email
$err_user_name = "Herve";
$err_email = "herve.senot@groundtruth.com.au";


# Retrive URL arguments
try {
	if (!isset($_REQUEST['lat']))
		{$latitude="-38";}
	else
		{$latitude = $_REQUEST['lat'];}

	if (!isset($_REQUEST['lon']))
		{$longitude="144";}
	else
		{$longitude = $_REQUEST['lon'];}

	if (!isset($_REQUEST['limit']))
		{$limit='10';}
	else
		{$limit = $_REQUEST['limit'];}
	$lga = $_REQUEST['lga'];
//	$format = 'geojson';
}
catch (Exception $e) {
    trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

# Performs the query and returns XML or JSON
try {
	$sql = sanitizeSQL("SELECT t.id,t.prop_num,t.ezi_add as add_label,comments,t.ts,t.haz_type,t.haz_status,ST_AsGeoJSON(ST_Transform(t.the_geom,900913),6) as the_geom FROM (select * from msc_capture m ORDER BY ST_Distance(m.the_geom,ST_SetSRID(ST_Point(".$longitude.",".$latitude."),4326)) limit ".$limit.") t");
	//echo $sql;
	$pgconn = pgConnection();

    /*** fetch into an PDOStatement object ***/
    $recordSet = $pgconn->prepare($sql);
    $recordSet->execute();

	require_once("../inc/geojson.pdo.inc.php");
	header("Content-Type: application/json");
	echo rs2geojson($recordSet);
}
catch (Exception $e) {
	trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

?>