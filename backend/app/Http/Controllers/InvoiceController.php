<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\UserSetting;
use App\Mail\InvoiceMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class InvoiceController extends Controller
{
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
