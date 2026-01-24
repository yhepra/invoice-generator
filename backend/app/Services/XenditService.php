<?php

namespace App\Services;

use Xendit\Configuration;
use Xendit\Invoice\InvoiceApi;
use Xendit\Invoice\CreateInvoiceRequest;
use Illuminate\Support\Facades\Log;

class XenditService
{
    public function __construct()
    {
        Configuration::setXenditKey(env('XENDIT_SECRET_KEY'));
    }

    public function createInvoice($user, $amount = 1000)
    {
        $apiInstance = new InvoiceApi();
        $external_id = 'upgrade_' . $user->id . '_' . time();
        $frontendUrl = env('APP_FRONTEND_URL', 'http://localhost:5173');

        $create_invoice_request = new CreateInvoiceRequest([
            'external_id' => $external_id,
            'description' => 'Upgrade to Premium Plan',
            'amount' => $amount,
            'payer_email' => $user->email,
            'success_redirect_url' => $frontendUrl . '/upgrade/success',
            'failure_redirect_url' => $frontendUrl . '/upgrade/failure',
            'currency' => 'IDR',
            'items' => [
                [
                    'name' => 'Premium Plan',
                    'quantity' => 1,
                    'price' => $amount,
                    'category' => 'Subscription'
                ]
            ]
        ]);

        try {
            $result = $apiInstance->createInvoice($create_invoice_request);
            return $result;
        } catch (\Exception $e) {
            Log::error('Xendit Create Invoice Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getInvoice($invoiceId)
    {
        $apiInstance = new InvoiceApi();
        try {
            return $apiInstance->getInvoiceById($invoiceId);
        } catch (\Exception $e) {
            Log::error('Xendit Get Invoice Error: ' . $e->getMessage());
            throw $e;
        }
    }
}
