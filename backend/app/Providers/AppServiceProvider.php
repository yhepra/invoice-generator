<?php

namespace App\Providers;

use Dedoc\Scramble\Scramble;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Routing\Route as LaravelRoute;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

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

        Gate::define('viewApiDocs', function ($user = null) {
            $ip = request()->ip();

            if (app()->environment('local')) {
                return true;
            }

            if (filter_var(env('SCRAMBLE_PUBLIC_DOCS', false), FILTER_VALIDATE_BOOL)) {
                return true;
            }

            $allowedIps = array_filter(array_map('trim', explode(',', (string) env('SCRAMBLE_ALLOWED_IPS', ''))));
            if ($ip && in_array($ip, $allowedIps, true)) {
                return true;
            }

            return ($user?->role ?? null) === 'super_admin';
        });

        Scramble::configure()
            ->routes(function (LaravelRoute $route) {
                $uri = ltrim($route->uri(), '/');

                if (! Str::startsWith($uri, 'api/')) {
                    return false;
                }

                if (Str::startsWith($uri, 'api/admin')) {
                    return false;
                }

                if (Str::startsWith($uri, 'api/xendit')) {
                    return false;
                }

                return true;
            });
    }
}
