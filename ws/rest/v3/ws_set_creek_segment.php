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
	$segid = $_REQUEST['seg_id'];
}
catch (Exception $e) {
    trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

# Performs the query and returns XML or JSON
try {
	if ($segid >= 0)
	{
		$c = "1";
	}
	else
	{
		$c = "2";
		$segid = -$segid;
	}

	if (isset($_REQUEST['toggle_split']))
	{
		$sql = "UPDATE creek_segment SET split=(split<>true) WHERE id=".$segid;
	}
	else
	{
		$sql = "UPDATE creek_segment SET ".
			"comments".$c."='".$_REQUEST['comments']."',".
			"interested".$c."=".$_REQUEST['interested'].",".
			"visited".$c."=".$_REQUEST['visited'].",".
			"visited_date".$c."=case when '".$_REQUEST['visited_date']."'<>'' then to_date('".$_REQUEST['visited_date']."','DD-MM-YYYY') else null end".",".
			"stock_excluded".$c."=".$_REQUEST['stock_excluded'].",".
			"stock_excluded_date".$c."=case when '".$_REQUEST['stock_excluded_date']."'<>'' then to_date('".$_REQUEST['stock_excluded_date']."','DD-MM-YYYY') else null end".",".
			"native_vegetation".$c."=".$_REQUEST['native_vegetation'].",".
			"revegetated_date".$c."=case when '".$_REQUEST['revegetated_date']."'<>'' then to_date('".$_REQUEST['revegetated_date']."','DD-MM-YYYY') else null end".",".
			"credit".$c."='".$_REQUEST['credit']."'".
			" WHERE id=".$segid;
	}
	//echo $sql;

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