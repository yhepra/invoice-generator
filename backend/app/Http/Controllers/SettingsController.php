<?php

namespace App\Http\Controllers;

use App\Models\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = UserSetting::where('user_id', Auth::id())->first();

        if (!$settings) {
            // Return default settings if not found
            return response()->json([
                'currency' => 'IDR',
                'locale' => 'id-ID',
                'language' => 'id',
                'footerText' => 'Terima kasih atas kerjasama Anda.'
            ]);
        }

        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'currency' => 'nullable|string',
            'locale' => 'nullable|string',
            'language' => 'nullable|string',
            'footerText' => 'nullable|string',
            'logo_history' => 'nullable|array',
            'signature_history' => 'nullable|array',
        ]);

        $settings = UserSetting::updateOrCreate(
            ['user_id' => Auth::id()],
            $validated
        );

        return response()->json($settings);
    }
}
