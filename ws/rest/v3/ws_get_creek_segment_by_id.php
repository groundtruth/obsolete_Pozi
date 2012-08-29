<?php
/**
 * Locality Name Search
 * Search for locality name containing the string passed as a parameter
 *
 * @param 		string 		$localityname 	locality name to search for
 * @param 		string		$format			output format, xml or json
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
	$segid = (int) $_REQUEST['seg_id'];
	$format = 'json';
}
catch (Exception $e) {
    trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

# Performs the query and returns XML or JSON
try {
	if ($segid >= 0)
	{
		$cols = "id, label as creek_name, interested1 as interested, visited1 as visited, to_char(visited_date1,'DD-MM-YYYY') as visited_date,comments1 as comments, stock_excluded1 as stock_excluded, to_char(stock_excluded_date1,'DD-MM-YYYY') as stock_excluded_date, native_vegetation1 as native_vegetation, to_char(revegetated_date1,'DD-MM-YYYY') as revegetated_date, credit1 as credit, split";
	}
	else
	{
		$cols = "id, label as creek_name, interested2 as interested, visited2 as visited, to_char(visited_date2,'DD-MM-YYYY') as visited_date, comments2 as comments, stock_excluded2 as stock_excluded, to_char(stock_excluded_date2,'DD-MM-YYYY') as stock_excluded_date, native_vegetation2 as native_vegetation, to_char(revegetated_date2,'DD-MM-YYYY') as revegetated_date, credit2 as credit, split";
		$segid = -$segid;
	}
	$sql = sanitizeSQL("select ".$cols." from creek_segment where id=" . $segid);
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