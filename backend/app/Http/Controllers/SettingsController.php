<?php

namespace App\Http\Controllers;

use App\Models\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SettingsController extends Controller
{
    private function isDataUriImage($value): bool
    {
        if (!is_string($value)) return false;
        return preg_match('/^data:image\/(png|jpeg|jpg|webp);base64,/', $value) === 1;
    }

    private function extractPublicStorageRelativePath(string $urlOrPath): ?string
    {
        $path = parse_url($urlOrPath, PHP_URL_PATH);
        if (!is_string($path) || $path === '') $path = $urlOrPath;
        if (!is_string($path)) return null;

        $needle = '/storage/';
        $pos = strpos($path, $needle);
        if ($pos === false) return null;

        return ltrim(substr($path, $pos + strlen($needle)), '/');
    }

    private function ensurePublicStorageCopy(string $relativePath): void
    {
        $publicFile = public_path('storage/' . ltrim($relativePath, '/'));
        if (is_file($publicFile)) return;
        if (!Storage::disk('public')->exists($relativePath)) return;

        $dir = dirname($publicFile);
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }

        try {
            $contents = Storage::disk('public')->get($relativePath);
            file_put_contents($publicFile, $contents);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    private function publicStorageUrl(string $relativePath): string
    {
        $base = rtrim(config('app.url'), '/');
        return $base . '/api/public-files/' . ltrim($relativePath, '/');
    }

    private function storeDataUriImage(string $dataUri, string $kind): ?string
    {
        if (preg_match('/^data:image\/(png|jpeg|jpg|webp);base64,(.*)$/', $dataUri, $m) !== 1) {
            return null;
        }

        $ext = strtolower($m[1]);
        if ($ext === 'jpeg') $ext = 'jpg';

        $binary = base64_decode($m[2], true);
        if ($binary === false) return null;

        $userId = Auth::id();
        $path = "user-assets/{$userId}/{$kind}/" . Str::uuid()->toString() . ".{$ext}";
        Storage::disk('public')->put($path, $binary);

        $this->ensurePublicStorageCopy($path);
        return $this->publicStorageUrl($path);
    }

    private function normalizeImageHistory(?array $items, string $kind): array
    {
        $result = [];
        foreach (($items ?? []) as $item) {
            if (!is_string($item) || $item === '') continue;

            if ($this->isDataUriImage($item)) {
                $stored = $this->storeDataUriImage($item, $kind);
                if ($stored) $result[] = $stored;
                continue;
            }

            $relative = $this->extractPublicStorageRelativePath($item);
            if ($relative) {
                $this->ensurePublicStorageCopy($relative);
                $result[] = $this->publicStorageUrl($relative);
                continue;
            }

            $result[] = $item;
        }

        $result = array_values(array_unique($result));
        return array_slice($result, 0, 10);
    }

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
            'logo_history' => $this->normalizeImageHistory($settings->logo_history, 'logos'),
            'signature_history' => $this->normalizeImageHistory($settings->signature_history, 'signatures'),
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

        if (array_key_exists('logo_history', $validated)) {
            $validated['logo_history'] = $this->normalizeImageHistory($validated['logo_history'], 'logos');
        }

        if (array_key_exists('signature_history', $validated)) {
            $validated['signature_history'] = $this->normalizeImageHistory($validated['signature_history'], 'signatures');
        }

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
