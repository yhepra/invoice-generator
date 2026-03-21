<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handleXenditCallback(Request $request)
    {
        $callbackToken = $request->header('x-callback-token');
        $xenditCallbackToken = env('XENDIT_CALLBACK_TOKEN');

        // Optional: Verify callback token if set in env
        if ($xenditCallbackToken && $callbackToken !== $xenditCallbackToken) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $data = $request->all();
        Log::info('Xendit Webhook:', $data);

        // Check for Invoice Callback
        if (isset($data['status']) && in_array($data['status'], ['PAID', 'SETTLED'], true)) {
            $external_id = $data['external_id'] ?? '';
            
            // Format: upgrade_{user_id}_{period}_{timestamp} (or legacy: upgrade_{user_id}_{timestamp})
            $parts = explode('_', (string) $external_id);
            $period = 'month';

            if (count($parts) >= 4 && $parts[0] === 'upgrade') {
                $periodCandidate = $parts[2] ?? 'month';
                $period = $periodCandidate === 'year' ? 'year' : 'month';
                $userId = $parts[1];
                $user = User::find($userId);

                if ($user) {
                    Payment::updateOrCreate(
                        ['external_id' => (string) $external_id],
                        [
                            'user_id' => $user->id,
                            'amount' => $data['amount'] ?? 0,
                            'status' => $data['status'] ?? 'PAID',
                            'payment_channel' => $data['payment_channel'] ?? null,
                            'payment_method' => $data['payment_method'] ?? null,
                            'paid_at' => isset($data['paid_at']) ? \Carbon\Carbon::parse($data['paid_at']) : now(),
                            'payment_details' => $data,
                        ]
                    );

                    $base = ($user->subscription_expires_at && $user->subscription_expires_at->isFuture())
                        ? $user->subscription_expires_at
                        : now();

                    $user->plan = 'premium';
                    $user->subscription_expires_at = $period === 'year'
                        ? $base->copy()->addYear()
                        : $base->copy()->addMonth();
                    $user->save();
                    Log::info("User {$userId} upgraded to premium via Xendit webhook.");
                }
            } elseif (count($parts) >= 3 && $parts[0] === 'upgrade') {
                $userId = $parts[1];
                $user = User::find($userId);

                if ($user) {
                    Payment::updateOrCreate(
                        ['external_id' => (string) $external_id],
                        [
                            'user_id' => $user->id,
                            'amount' => $data['amount'] ?? 0,
                            'status' => $data['status'] ?? 'PAID',
                            'payment_channel' => $data['payment_channel'] ?? null,
                            'payment_method' => $data['payment_method'] ?? null,
                            'paid_at' => isset($data['paid_at']) ? \Carbon\Carbon::parse($data['paid_at']) : now(),
                            'payment_details' => $data,
                        ]
                    );

                    $base = ($user->subscription_expires_at && $user->subscription_expires_at->isFuture())
                        ? $user->subscription_expires_at
                        : now();

                    $user->plan = 'premium';
                    $user->subscription_expires_at = $base->copy()->addMonth();
                    $user->save();
                    Log::info("User {$userId} upgraded to premium via Xendit webhook.");
                }
            }
        }

        return response()->json(['message' => 'Webhook received']);
    }
}
