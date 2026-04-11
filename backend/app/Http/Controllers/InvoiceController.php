<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Mail\InvoiceMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class InvoiceController extends Controller
{
    public function index()
    {
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
        ]);

        return DB::transaction(function () use ($request) {
            $data = $request->only([
                'number', 'date', 'due_date', 'seller_info', 'customer_info', 'notes', 'terms', 'status'
            ]);
            $data['user_id'] = Auth::id();
            
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
        ]);
        
        return DB::transaction(function () use ($request, $invoice) {
            $invoice->update($request->only([
                'number', 'date', 'due_date', 'seller_info', 'customer_info', 'notes', 'terms', 'status'
            ]));

            if ($request->has('items')) {
                $invoice->items()->delete();
                foreach ($request->items as $item) {
                    $invoice->items()->create($item);
                }
            }

            return response()->json($invoice->load('items'));
        });
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
            'smtp_host' => 'required|string|max:255',
            'smtp_port' => 'required|integer|min:1|max:65535',
            'smtp_encryption' => 'nullable|string|in:tls,ssl,none',
            'smtp_username' => 'required|string|max:255',
            'smtp_password' => 'required|string|max:255',
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
            $encryption = $payload['smtp_encryption'] ?? null;
            if ($encryption === 'none') $encryption = null;

            config([
                'mail.mailers.dynamic' => [
                    'transport' => 'smtp',
                    'host' => $payload['smtp_host'],
                    'port' => $payload['smtp_port'],
                    'encryption' => $encryption,
                    'username' => $payload['smtp_username'],
                    'password' => $payload['smtp_password'],
                    'timeout' => null,
                    'auth_mode' => null,
                ],
            ]);

            Mail::mailer('dynamic')->to($payload['to'])->send(
                new InvoiceMail($invoice, $totals, [
                    'subject' => $subject,
                    'message' => $payload['message'] ?? '',
                    'language' => $payload['language'] ?? 'id',
                    'currency' => $payload['currency'] ?? 'IDR',
                    'locale' => $payload['locale'] ?? 'id-ID',
                    'pdfBinary' => $pdfBinary,
                    'pdfFilename' => $pdfFilename,
                    'fromAddress' => $payload['from_address'] ?? null,
                    'fromName' => $payload['from_name'] ?? null,
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
}
