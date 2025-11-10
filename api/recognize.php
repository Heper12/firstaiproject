<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST allowed']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Image missing or invalid']);
    exit;
}

$api_key = 'acc_776c4543ac5432e';
$api_secret = 'b7f023c3c20cff03ff4f602e8cd4adb5';

$image = $_FILES['image']['tmp_name'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.imagga.com/v2/tags');
curl_setopt($ch, CURLOPT_USERPWD, "$api_key:$api_secret");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, ['image' => new CURLFile($image)]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 200) {
    http_response_code(500);
    echo json_encode(['error' => 'Imagga error', 'details' => $response]);
    exit;
}

$data = json_decode($response, true);
$tags = array_slice($data['result']['tags'], 0, 5);

$food_keywords = ['food', 'vegetable', 'fruit', 'meat', 'egg', 'onion', 'potato', 'tomato', 'cheese', 'bread', 'pasta'];
$ingredients = [];

foreach ($tags as $tag) {
    $label = strtolower($tag['tag']['en']);
    if (strpos($label, 'food') !== false || in_array($label, $food_keywords)) {
        $ingredients[] = $label;
    }
}

echo json_encode(['ingredients' => implode(', ', $ingredients)]);