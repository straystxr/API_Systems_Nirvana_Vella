<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db.php';

$raw  = file_get_contents("php://input");
$data = json_decode($raw, true);

$title               = $conn->real_escape_string($data['title']);
$content             = $conn->real_escape_string($data['body']);
$created_by          = $conn->real_escape_string($data['authorName']);
$url                 = '';
$source              = '';
$verified_by         = '';
$status              = 'pending';
$verification_status = 'unverified';

$created_by = 1; // Use the ID of the user

$sql = "INSERT INTO articles (title, content, url, source, created_by, verified_by, status, verification_status, created_at, updated_at)
        VALUES ('$title', '$content', NULL, NULL, '$created_by', NULL, '$status', '$verification_status', NOW(), NOW())";
if ($conn->query($sql)) {
    echo json_encode(["step" => 4, "success" => true]);
} else {
    echo json_encode(["step" => 4, "success" => false, "error" => $conn->error, "errno" => $conn->errno]);
}
exit();