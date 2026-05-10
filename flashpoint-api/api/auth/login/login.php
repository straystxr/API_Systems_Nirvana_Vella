<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Content-Type: application/json");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }


    $data = json_decode(file_get_contents("php://input"));

    $email = $data->email;
    $password = $data->password;

    // lookup user in database
    // verify password hash

    if ($validUser) {
        echo json_encode([
            "success" => true,
            "token" => "abc123"
        ]);
    } else {
        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "Invalid credentials"
        ]);
    }
?>