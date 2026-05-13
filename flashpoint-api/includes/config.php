<?php //this file is the database connection configuration

$db_user = 'root';
$db_password = 'root';
$db_name = 'flashpoint';

//PDO = PHP Data Objects
//Used for Object Oriented Programming
//Creating an 'object' makes our code more organized

$db = new PDO(
    'mysql:host=localhost;dbname='.$db_name.';charset=utf8',
    $db_user,
    $db_password
);

//setting up db attributes
$db -> setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
$db -> setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
$db -> setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
?>