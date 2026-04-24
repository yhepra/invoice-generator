<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json(['message' => 'Backend API is running']);
});

Route::options('/public-files/{path}', function () {
    return response('', 204);
})->where('path', '.*');

Route::get('/public-files/{path}', function (string $path) {
    $relative = ltrim($path, '/');
    if ($relative === '' || str_contains($relative, '..') || str_contains($relative, "\0")) {
        abort(404);
    }

    $candidates = [
        storage_path('app/public/'.$relative),
        public_path('storage/'.$relative),
    ];

    $file = null;
    foreach ($candidates as $candidate) {
        if (is_file($candidate)) {
            $file = $candidate;
            break;
        }
    }

    if (! $file) {
        abort(404);
    }

    return response()
        ->file($file);
})->where('path', '.*');

// Public Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verify'])->name('verification.verify');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Xendit Webhook
Route::post('/xendit/callback', [WebhookController::class, 'handleXenditCallback']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'changePassword']);
    Route::post('/upgrade', [AuthController::class, 'upgrade']);
    Route::post('/upgrade/verify', [AuthController::class, 'verifyPayment']);

    Route::patch('/invoices/{id}/status', [InvoiceController::class, 'updateStatus']);
    Route::get('/invoices/history', [InvoiceController::class, 'history']);
    Route::apiResource('invoices', InvoiceController::class);
    Route::post('/invoices/{id}/send-email', [InvoiceController::class, 'sendEmail']);

    Route::get('/contacts/customers', [ContactController::class, 'indexCustomers']);
    Route::post('/contacts/customers', [ContactController::class, 'storeCustomer']);
    Route::get('/contacts/customers/{id}', [ContactController::class, 'showCustomer']);
    Route::put('/contacts/customers/{id}', [ContactController::class, 'updateCustomer']);
    Route::patch('/contacts/customers/{id}', [ContactController::class, 'updateCustomer']);
    Route::delete('/contacts/customers/{id}', [ContactController::class, 'destroyCustomer']);

    Route::get('/contacts/sellers', [ContactController::class, 'indexSellers']);
    Route::post('/contacts/sellers', [ContactController::class, 'storeSeller']);
    Route::get('/contacts/sellers/{id}', [ContactController::class, 'showSeller']);
    Route::put('/contacts/sellers/{id}', [ContactController::class, 'updateSeller']);
    Route::patch('/contacts/sellers/{id}', [ContactController::class, 'updateSeller']);
    Route::delete('/contacts/sellers/{id}', [ContactController::class, 'destroySeller']);

    Route::apiResource('contacts', ContactController::class);

    Route::get('/settings', [SettingsController::class, 'index']);
    Route::post('/settings', [SettingsController::class, 'update']);

    // Admin Routes
    Route::middleware('super_admin')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'getStats']);
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::get('/payments', [AdminController::class, 'getPayments']);
    });
});
