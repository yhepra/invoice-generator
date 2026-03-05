<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
            $email = urlencode($notifiable->getEmailForPasswordReset());
            $token = urlencode($token);

            return "{$frontendUrl}/reset-password?token={$token}&email={$email}";
        });
    }
}
