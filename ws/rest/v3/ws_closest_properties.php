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
	$latitude = $_REQUEST['latitude'];
	$longitude = $_REQUEST['longitude'];
	$limit = $_REQUEST['limit'];
	if ($limit=='') {$limit='10'};
	$format = 'json';
}
catch (Exception $e) {
    trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

# Performs the query and returns XML or JSON
try {
	$sql = sanitizeSQL("SELECT p.ezi_address as label,p.prop_propnum as prop_num FROM vw_dse_property_address As p WHERE ST_DWithin(p.the_geom, ST_Transform(ST_SetSRID(ST_Point(".$longitude.",".$latitude."),4326),4283), 0.001) AND p.prop_propnum<>'NCPR' ORDER BY ST_Distance(p.the_geom,ST_Transform(ST_SetSRID(ST_Point(".$longitude.", ".$latitude."),4326),4283)) limit ".$limit);
	$pgconn = pgConnection();

    /*** fetch into an PDOStatement object ***/
    $recordSet = $pgconn->prepare($sql);
    $recordSet->execute();

	if ($format == 'xml') {
		require_once("../inc/xml.pdo.inc.php");
		header("Content-Type: text/xml");
		echo rs2xml($recordSet);
	}
	elseif ($format == 'json') {
		require_once("../inc/json.pdo.inc.php");
		header("Content-Type: application/json");
		echo rs2json($recordSet);
	}
	elseif ($format == "text") {
		header("Content-Type: application/text");
		while($line = $recordSet->fetch(PDO::FETCH_ASSOC))
		{
			foreach ($line as $col_key => $col_val)
			{
				echo $col_val . "\n";
			}
		}
	}
	else {
		trigger_error("Caught Exception: format must be xml or json.", E_USER_ERROR);
	}
}
catch (Exception $e) {
	trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

?>