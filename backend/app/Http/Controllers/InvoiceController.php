<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\UserSetting;
use App\Mail\InvoiceMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InvoiceController extends Controller
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
        $base = request()->getSchemeAndHttpHost();
        return $base . '/storage/' . ltrim($relativePath, '/');
    }

    private function sanitizeRichTextHtml($value): ?string
    {
        if ($value === null) return null;
        if (!is_string($value)) return null;

        $input = trim($value);
        if ($input === '') return '';

        if (strpos($input, '<') === false) {
            $decoded = html_entity_decode($input, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            $escaped = htmlspecialchars($decoded, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            return str_replace("\n", "<br>", $escaped);
        }

        $allowed = [
            'b' => true,
            'strong' => true,
            'i' => true,
            'em' => true,
            'u' => true,
            's' => true,
            'strike' => true,
            'del' => true,
            'ul' => true,
            'ol' => true,
            'li' => true,
            'br' => true,
            'p' => true,
            'div' => true,
        ];

        $doc = new \DOMDocument('1.0', 'UTF-8');
        $prev = libxml_use_internal_errors(true);
        $doc->loadHTML('<div>' . $input . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        libxml_use_internal_errors($prev);

        $clean = function ($node) use (&$clean, $doc, $allowed) {
            if (!$node) return;

            if ($node->nodeType === XML_COMMENT_NODE) {
                $node->parentNode?->removeChild($node);
                return;
            }

            if ($node->nodeType === XML_ELEMENT_NODE) {
                $tag = strtolower($node->nodeName);
                if (!isset($allowed[$tag])) {
                    $text = $doc->createTextNode($node->textContent ?? '');
                    $node->parentNode?->replaceChild($text, $node);
                    return;
                }

                if ($node->hasAttributes()) {
                    for ($i = $node->attributes->length - 1; $i >= 0; $i--) {
                        $attr = $node->attributes->item($i);
                        if ($attr) $node->removeAttributeNode($attr);
                    }
                }
            }

            if ($node->hasChildNodes()) {
                $children = [];
                foreach ($node->childNodes as $child) $children[] = $child;
                foreach ($children as $child) $clean($child);
            }
        };

        $root = $doc->documentElement;
        if ($root) $clean($root);

        $out = '';
        if ($root && $root->hasChildNodes()) {
            foreach ($root->childNodes as $child) {
                $out .= $doc->saveHTML($child);
            }
        }

        return $out;
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
        $path = "invoice-assets/{$userId}/{$kind}/" . Str::uuid()->toString() . ".{$ext}";
        Storage::disk('public')->put($path, $binary);

        $this->ensurePublicStorageCopy($path);
        return $this->publicStorageUrl($path);
    }

    private function normalizeSellerInfoImages(array $sellerInfo): array
    {
        foreach (['logo' => 'logos', 'signature' => 'signatures'] as $key => $kind) {
            if (!array_key_exists($key, $sellerInfo)) continue;
            $value = $sellerInfo[$key];

            if ($this->isDataUriImage($value)) {
                $stored = $this->storeDataUriImage($value, $kind);
                if ($stored) {
                    $sellerInfo[$key] = $stored;
                } else {
                    unset($sellerInfo[$key]);
                }
                continue;
            }

            if (is_string($value)) {
                $relative = $this->extractPublicStorageRelativePath($value);
                if ($relative) {
                    $this->ensurePublicStorageCopy($relative);
                    $sellerInfo[$key] = $this->publicStorageUrl($relative);
                }
            }
        }

        return $sellerInfo;
    }

    public function history(Request $request)
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = (int) $request->query('per_page', 20);
        if ($perPage <= 0) $perPage = 20;
        if ($perPage > 200) $perPage = 200;

        $q = trim((string) $request->query('q', ''));
        $period = (string) $request->query('period', 'all');
        $status = (string) $request->query('status', 'all');

        $query = Invoice::query()->where('user_id', Auth::id());

        if ($period === '30days') {
            $query->where('created_at', '>=', now()->subDays(30)->startOfDay());
        } elseif ($period === 'thisMonth') {
            $query->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
        } elseif ($period === 'lastMonth') {
            $query->whereBetween('created_at', [
                now()->subMonthNoOverflow()->startOfMonth(),
                now()->subMonthNoOverflow()->endOfMonth(),
            ]);
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($q !== '') {
            $date = null;
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $q)) {
                $date = $q;
            } elseif (preg_match('/^\d{1,2}\/\d{1,2}\/\d{4}$/', $q)) {
                $parts = explode('/', $q);
                if (count($parts) === 3) {
                    $date = sprintf('%04d-%02d-%02d', (int) $parts[2], (int) $parts[1], (int) $parts[0]);
                }
            }

            if ($date) {
                $query->whereDate('created_at', $date);
            } else {
                $query->where(function ($sub) use ($q) {
                    $sub->where('number', 'like', "%{$q}%")
                        ->orWhere('customer_name', 'like', "%{$q}%");
                });
            }
        }

        $summaryRow = (clone $query)
            ->selectRaw('COALESCE(SUM(total), 0) as total_sum')
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'Paid' THEN total ELSE 0 END), 0) as paid_sum")
            ->selectRaw("COALESCE(SUM(CASE WHEN status IN ('Unpaid', 'Overdue') THEN total ELSE 0 END), 0) as balance_sum")
            ->first();

        $paginator = $query
            ->orderByDesc('created_at')
            ->paginate(
                $perPage,
                [
                    'id',
                    'uuid',
                    'number',
                    'status',
                    'created_at',
                    'total',
                    'items_count',
                    'customer_name',
                ],
                'page',
                $page,
            );

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'summary' => [
                'total' => (float) ($summaryRow->total_sum ?? 0),
                'paid' => (float) ($summaryRow->paid_sum ?? 0),
                'balance' => (float) ($summaryRow->balance_sum ?? 0),
            ],
        ]);
    }

    public function index(Request $request)
    {
        if ($request->boolean('summary')) {
            $invoices = Invoice::query()
                ->where('user_id', Auth::id())
                ->orderByDesc('created_at')
                ->get([
                    'id',
                    'uuid',
                    'number',
                    'date',
                    'due_date',
                    'customer_info',
                    'status',
                    'created_at',
                    'subtotal',
                    'tax_amount',
                    'total',
                    'items_count',
                ]);

            return response()->json($invoices);
        }

        $invoices = Invoice::where('user_id', Auth::id())->with('items')->latest()->get();
        foreach ($invoices as $inv) {
            if (is_array($inv->seller_info ?? null)) {
                $inv->seller_info = $this->normalizeSellerInfoImages($inv->seller_info);
            }
        }
        return response()->json($invoices);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->plan === 'free') {
            $count = Invoice::where('user_id', $user->id)->count();
            if ($count >= 30) {
                return response()->json(['message' => 'Free plan limit reached. Upgrade to Premium for unlimited invoices.'], 403);
            }
        }

        $request->validate([
            'number' => 'required|string',
            'date' => 'required|date',
            'due_date' => 'required|date',
            'seller_info' => 'required|array',
            'customer_info' => 'required|array',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.tax_percent' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $data = $request->only([
                'number', 'date', 'due_date', 'seller_info', 'customer_info', 'notes', 'terms', 'status'
            ]);
            $data['user_id'] = Auth::id();

            if (array_key_exists('notes', $data)) {
                $data['notes'] = $this->sanitizeRichTextHtml($data['notes']);
            }

            if (array_key_exists('terms', $data)) {
                $data['terms'] = $this->sanitizeRichTextHtml($data['terms']);
            }

            if (is_array($data['seller_info'] ?? null)) {
                $data['seller_info'] = $this->normalizeSellerInfoImages($data['seller_info']);
            }

            if (is_array($data['customer_info'] ?? null)) {
                $data['customer_name'] = $data['customer_info']['name'] ?? null;
                $data['customer_email'] = $data['customer_info']['email'] ?? null;
            }

            $analytics = $this->calculateTotalsFromPayload($request->items);
            $data['subtotal'] = $analytics['subtotal'];
            $data['tax_amount'] = $analytics['taxAmount'];
            $data['total'] = $analytics['total'];
            $data['items_count'] = $analytics['itemsCount'];
            
            $invoice = Invoice::create($data);

            foreach ($request->items as $item) {
                if (array_key_exists('name', $item)) {
                    $item['name'] = $this->sanitizeRichTextHtml($item['name']);
                }
                $invoice->items()->create($item);
            }

            return response()->json($invoice->load('items'), 201);
        });
    }

    public function show($id)
    {
        $invoice = Invoice::where('user_id', Auth::id())
            ->where(function ($query) use ($id) {
                $query->where('uuid', $id)->orWhere('id', $id);
            })
            ->with('items')
            ->firstOrFail();

        if (is_array($invoice->seller_info ?? null)) {
            $invoice->seller_info = $this->normalizeSellerInfoImages($invoice->seller_info);
        }

        return response()->json($invoice);
    }

    public function update(Request $request, $id)
    {
        $invoice = Invoice::where('user_id', Auth::id())
            ->where(function ($query) use ($id) {
                $query->where('uuid', $id)->orWhere('id', $id);
            })
            ->firstOrFail();

        $request->validate([
            'number' => 'required|string',
            'date' => 'required|date',
            'due_date' => 'required|date',
            'seller_info' => 'required|array',
            'customer_info' => 'required|array',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.tax_percent' => 'nullable|numeric|min:0',
        ]);
        
        return DB::transaction(function () use ($request, $invoice) {
            $data = $request->only([
                'number', 'date', 'due_date', 'seller_info', 'customer_info', 'notes', 'terms', 'status'
            ]);

            if (array_key_exists('notes', $data)) {
                $data['notes'] = $this->sanitizeRichTextHtml($data['notes']);
            }

            if (array_key_exists('terms', $data)) {
                $data['terms'] = $this->sanitizeRichTextHtml($data['terms']);
            }

            if (is_array($data['seller_info'] ?? null)) {
                $data['seller_info'] = $this->normalizeSellerInfoImages($data['seller_info']);
            }

            if (is_array($data['customer_info'] ?? null)) {
                $data['customer_name'] = $data['customer_info']['name'] ?? null;
                $data['customer_email'] = $data['customer_info']['email'] ?? null;
            }

            $analytics = $this->calculateTotalsFromPayload($request->items);
            $data['subtotal'] = $analytics['subtotal'];
            $data['tax_amount'] = $analytics['taxAmount'];
            $data['total'] = $analytics['total'];
            $data['items_count'] = $analytics['itemsCount'];

            $invoice->update($data);

            if ($request->has('items')) {
                $invoice->items()->delete();
                foreach ($request->items as $item) {
                    if (array_key_exists('name', $item)) {
                        $item['name'] = $this->sanitizeRichTextHtml($item['name']);
                    }
                    $invoice->items()->create($item);
                }
            }

            return response()->json($invoice->load('items'));
        });
    }

    public function updateStatus(Request $request, $id)
    {
        $payload = $request->validate([
            'status' => 'required|string|max:50',
        ]);

        $invoice = Invoice::where('user_id', Auth::id())
            ->where(function ($query) use ($id) {
                $query->where('uuid', $id)->orWhere('id', $id);
            })
            ->firstOrFail();

        $invoice->update(['status' => $payload['status']]);

        return response()->json($invoice);
    }

    public function destroy($id)
    {
        $invoice = Invoice::where('user_id', Auth::id())
            ->where(function ($query) use ($id) {
                $query->where('uuid', $id)->orWhere('id', $id);
            })
            ->firstOrFail();
            
        $invoice->delete();
        return response()->json(null, 204);
    }

    public function sendEmail(Request $request, $id)
    {
        $payload = $request->validate([
            'to' => 'required|email',
            'subject' => 'nullable|string|max:200',
            'message' => 'nullable|string|max:5000',
            'language' => 'nullable|string|in:en,id',
            'currency' => 'nullable|string|max:10',
            'locale' => 'nullable|string|max:20',
            'pdfBase64' => 'nullable|string',
            'filename' => 'nullable|string|max:200',
            'smtp_host' => 'nullable|string|max:255',
            'smtp_port' => 'nullable|integer|min:1|max:65535',
            'smtp_encryption' => 'nullable|string|in:tls,ssl,none',
            'smtp_username' => 'nullable|string|max:255',
            'smtp_password' => 'nullable|string|max:255',
            'from_address' => 'nullable|email|max:200',
            'from_name' => 'nullable|string|max:200',
        ]);

        $invoice = Invoice::where('user_id', Auth::id())
            ->where(function ($query) use ($id) {
                $query->where('uuid', $id)->orWhere('id', $id);
            })
            ->with('items')
            ->firstOrFail();

        $totals = $this->calculateTotals($invoice->items);

        $subject = $payload['subject'] ?? null;
        if (!$subject) {
            $subject = "Invoice {$invoice->number}";
        }

        $pdfBinary = null;
        $pdfFilename = $payload['filename'] ?? null;
        if (!empty($payload['pdfBase64'])) {
            $decoded = base64_decode($payload['pdfBase64'], true);
            if ($decoded === false) {
                return response()->json(['message' => 'Invalid PDF payload.'], 422);
            }
            $pdfBinary = $decoded;
            if (!$pdfFilename) {
                $pdfFilename = "Invoice-{$invoice->number}.pdf";
            }
        }

        try {
            $settings = UserSetting::where('user_id', Auth::id())->first();

            $smtpHost = $payload['smtp_host'] ?? ($settings?->smtpHost ?? null);
            $smtpPort = $payload['smtp_port'] ?? ($settings?->smtpPort ?? null);
            $smtpEncryption = $payload['smtp_encryption'] ?? ($settings?->smtpEncryption ?? null);
            $smtpUsername = $payload['smtp_username'] ?? ($settings?->smtpUsername ?? null);
            $smtpPassword = $payload['smtp_password'] ?? ($settings?->smtpPassword ?? null);

            if (empty($smtpHost) || empty($smtpPort) || empty($smtpUsername) || empty($smtpPassword)) {
                return response()->json([
                    'message' => 'SMTP settings not configured.',
                ], 422);
            }

            $encryption = $smtpEncryption;
            if ($encryption === 'none') $encryption = null;

            config([
                'mail.mailers.dynamic' => [
                    'transport' => 'smtp',
                    'host' => $smtpHost,
                    'port' => $smtpPort,
                    'encryption' => $encryption,
                    'username' => $smtpUsername,
                    'password' => $smtpPassword,
                    'timeout' => null,
                    'auth_mode' => null,
                ],
            ]);

            $fromAddress = $payload['from_address'] ?? ($settings?->fromAddress ?? null);
            $fromName = $payload['from_name'] ?? ($settings?->fromName ?? null);

            Mail::mailer('dynamic')->to($payload['to'])->send(
                new InvoiceMail($invoice, $totals, [
                    'subject' => $subject,
                    'message' => $payload['message'] ?? '',
                    'language' => $payload['language'] ?? 'id',
                    'currency' => $payload['currency'] ?? 'IDR',
                    'locale' => $payload['locale'] ?? 'id-ID',
                    'pdfBinary' => $pdfBinary,
                    'pdfFilename' => $pdfFilename,
                    'fromAddress' => $fromAddress,
                    'fromName' => $fromName,
                ])
            );
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to send email.',
            ], 500);
        }

        return response()->json(['message' => 'Email sent.']);
    }

    private function calculateTotals($items)
    {
        $subtotal = 0.0;
        $taxAmount = 0.0;

        foreach ($items as $item) {
            $line = (float) $item->quantity * (float) $item->price;
            $subtotal += $line;
            $taxPercent = (float) ($item->tax_percent ?? 0);
            $taxAmount += $line * ($taxPercent / 100.0);
        }

        return [
            'subtotal' => $subtotal,
            'taxAmount' => $taxAmount,
            'total' => $subtotal + $taxAmount,
        ];
    }

    private function calculateTotalsFromPayload($items)
    {
        $subtotal = 0.0;
        $taxAmount = 0.0;
        $itemsCount = 0;

        foreach ($items as $item) {
            $qty = (float) ($item['quantity'] ?? 0);
            $price = (float) ($item['price'] ?? 0);
            $line = $qty * $price;
            $subtotal += $line;
            $taxPercent = (float) ($item['tax_percent'] ?? 0);
            $taxAmount += $line * ($taxPercent / 100.0);
            $itemsCount++;
        }

        $subtotal = round($subtotal, 2);
        $taxAmount = round($taxAmount, 2);

        return [
            'subtotal' => $subtotal,
            'taxAmount' => $taxAmount,
            'total' => round($subtotal + $taxAmount, 2),
            'itemsCount' => $itemsCount,
        ];
    }
}
