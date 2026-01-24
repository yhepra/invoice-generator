<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
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
        if (isset($data['status']) && $data['status'] === 'PAID') {
            $external_id = $data['external_id'];
            
            // Format: upgrade_{user_id}_{timestamp}
            $parts = explode('_', $external_id);
            if (count($parts) >= 3 && $parts[0] === 'upgrade') {
                $userId = $parts[1];
                $user = User::find($userId);

                if ($user) {
                    $user->plan = 'premium';
                    $user->save();
                    Log::info("User {$userId} upgraded to premium via Xendit webhook.");
                }
            }
        }

        return response()->json(['message' => 'Webhook received']);
    }
}
