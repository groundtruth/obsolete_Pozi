<?php
/**
 * Get live data from a (remote) database
 *
 * @param 		string 		$role	 	role of the logged in user (if not logged in, the role is 'NONE'
 * @param 		string		$id			identifier for the records to be retrieved
 * @param 		string		$infoGroup	information group (Lynx, ...)
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
	$idp = $_REQUEST['id'];
	$infogroup = $_REQUEST['infoGroup'];
	$format = 'json';
}
catch (Exception $e) {
    trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

# Performs the query and returns XML or JSON
try {
	$sql = sanitizeSQL("select * from gt_service_routing where role='".$rol."' and info_group='".$infogroup."'");
///	echo "SQL1: ".$sql;
	$pgconn = pgConnection();

    /*** fetch into an PDOStatement object ***/
    $recordSet = $pgconn->prepare($sql);
    $recordSet->execute();

    $query_to_exec='';
    $connection_str ='';
    $username_conn ='';
	$password_conn ='';

    // Using the query returned to build an ODBC request
	while ($row  = $recordSet->fetch(PDO::FETCH_ASSOC))
	{
		foreach ($row as $key => $val)
		{
			if ($key == "query")
			{
				$query_to_exec = $val;
			}
			if ($key == "odbc_conn_str")
			{
				$connection_str = $val;
			}
			if ($key == "username_conn")
			{
				$username_conn = $val;
			}
			if ($key == "password_conn")
			{
				$password_conn = $val;
			}
		}
	}

///	echo "Q: ".$query_to_exec;
///	echo "C: ".$connection_str;
///	echo "U: ".$username_conn;
///	echo "P: ".$password_conn;



	if ($idp && $connection_str)
	{
	    $odbcconn = new PDO($connection_str, $username_conn, $password_conn, array(PDO::ATTR_PERSISTENT => true));
		$ODBCrecordSet = $odbcconn->prepare($query_to_exec.$idp."'");
///		echo "SQL2: ".$query_to_exec.$idp."'";
		$ODBCrecordSet->execute();

		require_once("../inc/json.pdo.inc.php");
		if (isset($_REQUEST['callback']))
		{
			header("Content-Type: text/javascript");
		}
		else
		{
			header("Content-Type: application/json");
		}
		echo rs2json($ODBCrecordSet);
	}
	else
	{
		echo "{\"total_rows\":\"0\",\"rows\":[]}";
	}

}
catch (Exception $e) {
	trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
}

?>