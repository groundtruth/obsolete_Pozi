<?php
/**
 * Process the capture form
 *
 * @param 		string		$prop_num		property number
 * @param 		string		$comments		comments associated to the capture
 * @return 		string						resulting json string for form success / failure processing
 */

# Includes
require_once("../inc/error.inc.php");
require_once("../inc/database.inc.php");
require_once("../inc/security.inc.php");

# Set arguments for error email
$err_user_name = "Herve";
$err_email = "hs.enot@gmail.com";

# Retrieve URL arguments
try {
	$latitude = $_REQUEST['lat'];
	$longitude = $_REQUEST['lon'];
	$prop_num = $_REQUEST['prop_num'];
	$comments = $_REQUEST['comments'];
	# Hazard type default to 1
	if (!isset($_REQUEST['haz_type']))
		{$haz_type=1;}
	else
		{$haz_type = $_REQUEST['haz_type'];}
	# Hazard status default to 1
	if (!isset($_REQUEST['haz_status']))
		{$haz_status=1;}
	else
		{$haz_status = $_REQUEST['haz_status'];}
}
catch (Exception $e) {
    trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

# Performs the query and returns XML or JSON
try {
	$sql = "INSERT INTO msc_capture (prop_num,comments,haz_type,the_geom,longitude,latitude,haz_status) VALUES ('".$prop_num."','".$comments."',".$haz_type.",(select ST_Transform(ST_Centroid(p.the_geom),4326) from dse_vmprop_property p where p.prop_propnum='".$prop_num."'),".$longitude.",".$latitude.",".$haz_status.") RETURNING id";

	$sql = sanitizeSQL($sql);
	$pgconn = pgConnection();

	/*** fetch into an PDOStatement object ***/
    $recordSet = $pgconn->prepare($sql);
    $recordSet->execute();

	require_once("../inc/json.pdo.inc.php");
	header("Content-Type: application/json");

	echo fs2json($recordSet);
}
catch (Exception $e) {
	trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

?>