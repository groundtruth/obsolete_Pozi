<?php
/**
 * Get layouts for the given role
 *
 * @param 		string 		$role	 	role of the logged in user (if not logged in, the role is 'NONE'
 * @param 		string		$config		database to perform the query routing against
 * @return 		string		- resulting json or xml string
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
	$rol = $_REQUEST['role'];
	$config = $_REQUEST['config'];
	$format = 'json';
}
catch (Exception $e) {
    trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

# Performs the query and returns XML or JSON
try {
	// PGSQL query
	// $sql = sanitizeSQL("select gs1.layer_name as key_arr,'['||array_to_string(array(select gs2.ext_group_definition from gt_service_routing gs2 where gs2.role='".$rol."' and gs2.layer_name=gs1.layer_name),',')||']' as val_arr from (select layer_name from gt_service_routing where role='".$rol."' group by layer_name) gs1");
	// SQLITE query
	$sql = sanitizeSQL("select layer_name as key_arr,\"[\"||group_concat(ext_group_definition,\",\")||\"]\" as val_arr from gt_service_routing where role='".$rol."'");

	//echo $sql."\n";

	// Postgre connection
	//$pgconn = pgConnection();
	// SQLite connection (using PDO)
	if (file_exists($config.".sqlite"))
	{
		$sqliteConn = new PDO("sqlite:".$config.".sqlite", null, null, array(PDO::ATTR_PERSISTENT => true));
	}
	else
	{
		trigger_error("The SQLite configuration file for '".$config."' can not be found.", E_USER_ERROR);
	}

    /*** fetch into an PDOStatement object ***/
    $recordSet = $sqliteConn->prepare($sql);
    $recordSet->execute();

	require_once("../inc/json.pdo.inc.php");
	if (isset($_REQUEST['callback']))
	{
		header("Content-Type: text/javascript");
	}
	else
	{
		header("Content-Type: application/json");
	}
	echo rs2json2($recordSet);

}
catch (Exception $e) {
	trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

?>