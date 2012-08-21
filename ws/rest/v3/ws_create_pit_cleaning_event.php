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
	$drainage_pit = $_REQUEST['drainage_pit'];
	#
	if (!isset($_REQUEST['eqpmt_used']))
		{$eqpmt_used=null;}
	else
		{$eqpmt_used = $_REQUEST['eqpmt_used'];}

	#
	if (!isset($_REQUEST['depth_debris']))
		{$depth_debris=null;}
	else
		{
			if (empty($depth_debris))
			{
				$depth_debris='null';
			}
			else
			{	
				$depth_debris = $_REQUEST['depth_debris'];
			}
		}

	#
	if (!isset($_REQUEST['check_again_date']))
		{$check_again_date=null;}
	else
		{$check_again_date = $_REQUEST['check_again_date'];}

	#
	if (!isset($_REQUEST['eqpmt_to_use']))
		{$eqpmt_to_use=null;}
	else
		{$eqpmt_to_use = $_REQUEST['eqpmt_to_use'];}

	#
	if (!isset($_REQUEST['time_taken']))
		{$time_taken=null;}
	else
		{
			if (empty($time_taken))
			{
				$time_taken='null';
			}
			else
			{
				$time_taken = $_REQUEST['time_taken'];
			}
		}


	#
	if (!isset($_REQUEST['officer_name']))
		{$officer_name=null;}
	else
		{$officer_name = $_REQUEST['officer_name'];}

}
catch (Exception $e) {
    trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

# Performs the query and returns XML or JSON
try {
//	$sql = "INSERT INTO msc_capture (prop_num,comments,haz_type,the_geom,longitude,latitude,haz_status) VALUES ('".$prop_num."','".$comments."',".$haz_type.",(select ST_Transform(ST_Centroid(p.the_geom),4326) from dse_vmprop_property p where p.pr_propnum='".$prop_num."' and p.pr_lgac='".$lga."'),".$longitude.",".$latitude.",".$haz_status.") RETURNING id";
	$sql = "INSERT INTO wsc_drainage_pit_cleaning_event (pit_id,eqpmt_used,depth_debris,check_again_date,eqpmt_to_use,time_taken,officer_name,creation_datetime) VALUES (".$drainage_pit.",".$eqpmt_used.",".$depth_debris.",'".$check_again_date."',".$eqpmt_to_use.",".$time_taken.",'".$officer_name."',current_timestamp) RETURNING id";

	$sql = sanitizeSQL($sql);
	$pgconn = pgConnection();

//	echo $sql;

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