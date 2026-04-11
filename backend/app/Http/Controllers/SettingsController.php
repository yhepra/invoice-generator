<?php

namespace App\Http\Controllers;

use App\Models\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    private function settingsResponse(?UserSetting $settings)
    {
        if (!$settings) {
            return [
                'currency' => 'IDR',
                'locale' => 'id-ID',
                'language' => 'id',
                'footerText' => 'Terima kasih atas kerjasama Anda.',
                'logo_history' => [],
                'signature_history' => [],
                'fromAddress' => null,
                'fromName' => null,
                'smtpHost' => null,
                'smtpPort' => null,
                'smtpEncryption' => 'tls',
                'smtpUsername' => null,
                'hasSmtpPassword' => false,
            ];
        }

        return [
            'currency' => $settings->currency,
            'locale' => $settings->locale,
            'language' => $settings->language,
            'footerText' => $settings->footerText,
            'logo_history' => $settings->logo_history,
            'signature_history' => $settings->signature_history,
            'fromAddress' => $settings->fromAddress,
            'fromName' => $settings->fromName,
            'smtpHost' => $settings->smtpHost,
            'smtpPort' => $settings->smtpPort,
            'smtpEncryption' => $settings->smtpEncryption,
            'smtpUsername' => $settings->smtpUsername,
            'hasSmtpPassword' => !empty($settings->smtpPassword),
        ];
    }

    public function index()
    {
        $settings = UserSetting::where('user_id', Auth::id())->first();

        return response()->json($this->settingsResponse($settings));
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
            'fromAddress' => 'nullable|email',
            'fromName' => 'nullable|string',
            'smtpHost' => 'nullable|string',
            'smtpPort' => 'nullable|integer|min:1|max:65535',
            'smtpEncryption' => 'nullable|string|in:none,tls,ssl',
            'smtpUsername' => 'nullable|string',
            'smtpPassword' => 'nullable|string',
        ]);

        if (array_key_exists('smtpPassword', $validated) && $validated['smtpPassword'] === '') {
            unset($validated['smtpPassword']);
        }

        if (array_key_exists('smtpEncryption', $validated) && $validated['smtpEncryption'] === 'none') {
            $validated['smtpEncryption'] = null;
        }

        $settings = UserSetting::updateOrCreate(
            ['user_id' => Auth::id()],
            $validated
        );

        return response()->json($this->settingsResponse($settings));
    }
}
