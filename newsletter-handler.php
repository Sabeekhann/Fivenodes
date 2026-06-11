<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://5ivenodes.com');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false]);
    exit;
}

$email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false]);
    exit;
}

$to      = 'Sabee@5ivenodes.com';
$subject = 'New Newsletter Subscriber';
$body    = "New subscriber: {$email}\n\nFrom: 5ivenodes.com newsletter signup";
$headers = "From: FiveNodes Newsletter <noreply@5ivenodes.com>\r\nContent-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($to, $subject, $body, $headers);
echo json_encode(['success' => (bool)$sent]);
