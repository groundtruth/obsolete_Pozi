<?php
/**
 * Search for a property ID for its property number
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
	$lga = $_REQUEST['lga'];
	$format = 'json';
}
catch (Exception $e) {
    trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

# Performs the query and returns XML or JSON
try {
//	$sql = sanitizeSQL("select * from gt_master_search where gsln='VMPROP_PROPERTY' and idval='".$query."' and lga='".$lga."' limit 1");
//	$sql = sanitizeSQL("select * from gt_master_search s where s.gsln='VICMAP_PROPERTY_ADDRESS' and s.idval=(select p.ezi_add from dse_property_address p where p.pr_propnum='".$query."' and p.lga_code='".$lga."' limit 1) and s.lga='".$lga."' limit 1");
//	$sql = sanitizeSQL("select label,(select min(st_x) from (select ST_X(ST_PointN(bbox,generate_series(1, bbox_length))) as st_x) xm) as xmini,(select min(st_y) from (select ST_Y(ST_PointN(bbox,generate_series(1, bbox_length))) as st_y) ym) as ymini,(select max(st_x) from (select ST_X(ST_PointN(bbox,generate_series(1, bbox_length))) as st_x) xm2) as xmaxi,(select max(st_y) from (select ST_Y(ST_PointN(bbox,generate_series(1, bbox_length))) as st_y) ym2) as ymaxi,'VICMAP' as gsns,'VICMAP_PROPERTY_ADDRESS' as gsln,'ezi_add' as idcol,ezi_add as idval,'Address' as ld,lga from (select ezi_add,upper(ezi_add) as label,ST_Boundary(ST_Envelope(the_geom)) as bbox,ST_NPoints(ST_Boundary(ST_Envelope(the_geom)))-2 as bbox_length,lga from (select ezi_add,lga_code as lga,ST_Union(the_geom) as the_geom from dse_property_address where pr_propnum='".$query."' and lga_code='".$lga."' group by ezi_add,lga_code) u) t");
	$sql = sanitizeSQL("select label,(select min(st_x) from (select ST_X(ST_PointN(bbox,generate_series(1, bbox_length))) as st_x) xm) as xmini,(select min(st_y) from (select ST_Y(ST_PointN(bbox,generate_series(1, bbox_length))) as st_y) ym) as ymini,(select max(st_x) from (select ST_X(ST_PointN(bbox,generate_series(1, bbox_length))) as st_x) xm2) as xmaxi,(select max(st_y) from (select ST_Y(ST_PointN(bbox,generate_series(1, bbox_length))) as st_y) ym2) as ymaxi,'VICMAP' as gsns,'VICMAP_PROPERTY_ADDRESS' as gsln,'pr_propnum' as idcol,'".$query."' as idval,'Address' as ld,lga from (select ezi_add,upper(ezi_add) as label,ST_Boundary(ST_Envelope(the_geom)) as bbox,ST_NPoints(ST_Boundary(ST_Envelope(the_geom)))-2 as bbox_length,lga from (select ezi_add,lga_code as lga,ST_Union(the_geom) as the_geom from dse_property_address where pr_propnum='".$query."' and lga_code='".$lga."' group by ezi_add,lga_code) u) t");

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