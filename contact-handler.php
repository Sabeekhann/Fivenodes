<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://5ivenodes.com');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Sanitise inputs
$fname   = trim(strip_tags($_POST['name']    ?? ''));
$email   = filter_var(trim($_POST['email']   ?? ''), FILTER_SANITIZE_EMAIL);
$company = trim(strip_tags($_POST['company'] ?? ''));
$service = trim(strip_tags($_POST['service'] ?? ''));
$message = trim(strip_tags($_POST['message'] ?? ''));

if (!$fname || !$email || !$message || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing or invalid required fields']);
    exit;
}

$to      = 'Sabee@5ivenodes.com';
$subject = "New Project Brief from {$fname}" . ($company ? " ({$company})" : '');

$body  = "You have a new project brief from 5ivenodes.com\n";
$body .= str_repeat('─', 50) . "\n\n";
$body .= "Name:    {$fname}\n";
$body .= "Email:   {$email}\n";
if ($company) $body .= "Company: {$company}\n";
if ($service) $body .= "Service: {$service}\n";
$body .= "\nMessage:\n{$message}\n\n";
$body .= str_repeat('─', 50) . "\n";
$body .= "Reply directly to this email to respond.\n";

$headers  = "From: FiveNodes Contact Form <noreply@5ivenodes.com>\r\n";
$headers .= "Reply-To: {$fname} <{$email}>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: FiveNodes/1.0\r\n";

$sent = mail($to, $subject, $body, $headers);

echo json_encode(['success' => (bool)$sent]);
