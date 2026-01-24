<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Notification;
use App\Notifications\VerifyEmailOtp;
use App\Services\XenditService;

class AuthController extends Controller
{
    protected $xenditService;

    public function __construct(XenditService $xenditService)
    {
        $this->xenditService = $xenditService;
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $otp = rand(100000, 999999);
        
        Cache::put('registration_' . $request->email, [
            'name' => $request->name,
            'email' => $request->email,
            'password' => encrypt($request->password), // Encrypt password for safety in cache
            'otp' => $otp
        ], 600); // 10 minutes

        try {
            Notification::route('mail', $request->email)
                ->notify(new VerifyEmailOtp($otp));
        } catch (\Exception $e) {
             return response()->json(['message' => 'Failed to send OTP email: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'message' => 'OTP sent to your email. Please verify to complete registration.',
            'email' => $request->email
        ], 200);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|numeric|digits:6'
        ]);

        $data = Cache::get('registration_' . $request->email);

        if (!$data || $data['otp'] != $request->otp) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 400);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => decrypt($data['password']),
        ]);
        
        $user->markEmailAsVerified();

        Cache::forget('registration_' . $request->email);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
            'message' => 'Registration successful.'
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials provided.'],
            ]);
        }

        // Check subscription expiration
        if ($user->plan === 'premium' && $user->subscription_expires_at && $user->subscription_expires_at->isPast()) {
            $user->plan = 'free';
            $user->save();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new \Illuminate\Auth\Events\PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        // Check subscription expiration
        if ($user->plan === 'premium' && $user->subscription_expires_at && $user->subscription_expires_at->isPast()) {
            $user->plan = 'free';
            $user->save();
        }

        return $user;
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();
        $user->name = $request->name;
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.'],
            ]);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }

    public function upgrade(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($user->plan === 'premium') {
            return response()->json(['message' => 'User is already premium'], 400);
        }

        try {
            $invoice = $this->xenditService->createInvoice($user);
            return response()->json([
                'message' => 'Payment link generated successfully',
                'payment_url' => $invoice['invoice_url'],
                'invoice' => $invoice
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to generate payment link'], 500);
        }
    }

    public function verifyPayment(Request $request)
    {
        $request->validate(['invoice_id' => 'required|string']);
        
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        try {
            $invoice = $this->xenditService->getInvoice($request->invoice_id);
            
            if ($invoice['status'] === 'PAID' || $invoice['status'] === 'SETTLED') {
                // Record Payment
                Payment::updateOrCreate(
                    ['external_id' => $invoice['external_id']],
                    [
                        'user_id' => $user->id,
                        'amount' => $invoice['amount'],
                        'status' => $invoice['status'],
                        'payment_channel' => $invoice['payment_channel'] ?? 'Unknown',
                        'payment_method' => $invoice['payment_method'] ?? 'Unknown',
                        'paid_at' => isset($invoice['paid_at']) ? \Carbon\Carbon::parse($invoice['paid_at']) : now(),
                        'payment_details' => $invoice
                    ]
                );

                if ($user->plan !== 'premium') {
                    $user->plan = 'premium';
                    // Set expiration to 1 month from now
                    $user->subscription_expires_at = now()->addMonth();
                    $user->save();
                }
                return response()->json([
                    'status' => 'success',
                    'message' => 'Payment verified, upgraded to premium',
                    'user' => $user
                ]);
            } else {
                return response()->json([
                    'status' => 'pending',
                    'message' => 'Payment not yet confirmed. Current status: ' . $invoice['status']
                ]);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to verify payment: ' . $e->getMessage()], 500);
        }
    }
}
