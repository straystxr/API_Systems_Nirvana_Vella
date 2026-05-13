<?php //This file sets up the core API structure

    //define named constants
    //DS = /
    //SITE_ROOT = root directory of the proejct meaning:
    //C:\xampp\htdocs\API-Classwork 

    //an if condition within a single line
    defined('DS') ? null : define('DS', DIRECTORY_SEPARATOR);
    defined('SITE_ROOT') ? null : define('SITE_ROOT', DS.'Applications'.DS.'mamp'.DS.'htdocs'.DS.'API_Systems_Nirvana_Vella'.DS.'flashpoint-api');

    //setting up core path to be used when requiring class files
    defined("CORE_PATH") ? NULL : define("CORE_PATH",SITE_ROOT.DS."core".DS);

    //loading the database
    require_once("config.php");

    //loads the classes
    require_once(CORE_PATH."user.php");
    require_once(CORE_PATH."articles.php");
    require_once(CORE_PATH."bookmarks.php");
    require_once(CORE_PATH."comments.php");
?>