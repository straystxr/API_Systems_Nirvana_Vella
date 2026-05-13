<?php
//headers
//this controls where the request can come from
//* is wherever
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET");

header("Access-Control-Allow-Headers: Access-Control-Allow-Origin, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With");

include_once("../../includes/initialize.php");

//creates a new instance of the user class
//allows us to use its structure and functions
$articles = new Articles($db);

$data = json_decode(file_get_contents("php://input"));

//filling in the user instanace properties with decoded values from the request
$articles->created_by = $data->created_by;
$articles->title = $data->title;
$articles->content = $data->content;

if($articles->create()){
    echo json_encode(array("message" => "Post Created"));
}
else{
    echo json_encode(array("message" => "Post not created"));
}



?>