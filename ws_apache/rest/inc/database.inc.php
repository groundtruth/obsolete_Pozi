<?php
/**
 * Database Include
 * Handles all database functions required by the REST web services.
 */



#Use this to work arround lack of document_root variable under PHP CGI.
//if( empty($_SERVER['DOCUMENT_ROOT']) )
//{
//	$_SERVER['DOCUMENT_ROOT'] = dirname("c:/inetpub/wwwroot/rest");
//}


/**
 * Return postgres data connection
 * @return 		object		- adodb data connection
 */
function pgConnection() {
	try {
		// Connect to the database passed in the config variable
		$db_config = $_REQUEST['config'];
		if (empty($db_config))
		{
			$db_config = "mitchellgis";
		}
		$conn = new PDO ("pgsql:host=localhost;dbname=".$db_config.";port=54321","ws_app","ws_app", array(PDO::ATTR_PERSISTENT => true));
	    return $conn;
	}
	catch (Exception $e) {
		trigger_error("Caught Exception: " . $e->getMessage(), E_USER_ERROR);
	}
}


/**
 * Sample SQL Server connection
 * @return 		object		- adodb data connection
 */
function camaConnection() {
    $conn = new PDO("odbc:Driver={SQL Server};Server=server_name;Database=database;Uid=userid;Pwd=password;Pooling=false;", "userid", "password");
    return $conn;
}




?>