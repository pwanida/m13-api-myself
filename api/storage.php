<?php
// Shared helpers for all API files: require 'storage.php';

// The data lives OUTSIDE the public web folder (/var/www/html)
const DATA_FILE = '/var/www/data/portfolios.json';

// Read all Portfolios from the JSON file (empty list if no file yet)
function readPortfolios() {
    if (!file_exists(DATA_FILE)) {
        return [];
    }
    return json_decode(file_get_contents(DATA_FILE), true) ?? [];
}

// Write all Portfolios back to the JSON file
function writePortfolios($portfolios) {
    $json = json_encode($portfolios, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    file_put_contents(DATA_FILE, $json, LOCK_EX);   // LOCK_EX: one writer at a time
}

// Send an answer back to JavaScript as JSON, then stop
function sendJson($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
