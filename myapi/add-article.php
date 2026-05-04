<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["message" => "Waiting for POST request"]);
    exit();
}

// Get the JSON data sent from the app
$data = json_decode(file_get_contents("php://input"), true);

// Pull each field from the form
$title      = $conn->real_escape_string($data['title']);
$content    = $conn->real_escape_string($data['body']);
$created_by = $conn->real_escape_string($data['authorName']);
$category   = $conn->real_escape_string($data['category']);

// status defaults to pending since it needs verification
$status              = 'pending';
$verification_status = 'unverified';

$sql = "INSERT INTO articles (title, content, status, verification_status, created_at, updated_at)
        VALUES ('$title', '$content', '$status', '$verification_status', NOW(), NOW())";

if ($conn->query($sql)) {
    echo json_encode(["success" => true, "message" => "Article saved successfully"]);
} else {
    echo json_encode(["success" => false, "message" => $conn->error]);
}

$conn->close();
?>