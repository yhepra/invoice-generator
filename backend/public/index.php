<?php
$actual_link = "https://$_SERVER[HTTP_HOST]";

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

if ($actual_link == "https://be.generateinvoice.id") {
    // Register the Composer autoloader...
    require __DIR__.'/../../invoice-generator/backend/vendor/autoload.php';
} else {
    require __DIR__.'/../vendor/autoload.php';
}
if ($actual_link == "https://be.generateinvoice.id") {
    // Bootstrap Laravel and handle the request...
    (require_once __DIR__.'/../../invoice-generator/backend/bootstrap/app.php')
        ->handleRequest(Request::capture());
} else {
    // Bootstrap Laravel and handle the request...
    (require_once __DIR__.'/../bootstrap/app.php')
        ->handleRequest(Request::capture());
}
