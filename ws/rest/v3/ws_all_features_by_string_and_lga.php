<?php
/**
 * Multi Search
 * Search for database objects containing the string passed as a parameter and returns a JSON object that locates the record
 * (both spatially with the bounding box extent and in the database, with the table name and object ID)
 *
 * @param 		string 		$query 		string to search for
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
	$query = $_REQUEST['query'];
	if (!isset($_REQUEST['limit']))
		{$limit='10';}
	else
		{$limit = $_REQUEST['limit'];}
	$format = 'json';
}
catch (Exception $e) {
    trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

# Performs the query and returns XML or JSON
try {
	$lga_clause="";
	$lga = $_REQUEST['lga'];
	if ($lga!='') {$lga_clause="AND lga='".$lga."'"};
	$sql = sanitizeSQL("select (case ld when 'Parcel SPI' then replace(label,'\\\','\\\\\\\') else initcap(label) end) as label,xmini,ymini,xmaxi,ymaxi,gsns,gsln,idcol,(case ld when 'Parcel SPI' then replace(idval,'\\\','\\\\\\\') else idval end) as idval,ld from gt_master_search where label like '%'||upper('".$query."')||'%' ".$lga_clause."order by position(upper('".$query."') in label),(case when ld in ('Locality') then 1 when ld in ('Feature') then 2 when ld in ('Road') then 3 when ld in ('Address') then 4 else 9 end),label limit ".$limit);
	$pgconn = pgConnection();

    /*** fetch into an PDOStatement object ***/
//	echo $sql;
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