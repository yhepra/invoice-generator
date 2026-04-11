<?php

namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Invoice $invoice,
        public array $totals,
        public array $meta
    ) {
    }

    public function envelope(): Envelope
    {
        $fromAddress = $this->meta['fromAddress'] ?? null;
        $fromName = $this->meta['fromName'] ?? null;

        return new Envelope(
            subject: $this->meta['subject'] ?? "Invoice {$this->invoice->number}",
            from: $fromAddress ? new Address($fromAddress, $fromName ?: null) : null,
            replyTo: $fromAddress ? [new Address($fromAddress, $fromName ?: null)] : [],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice',
            with: [
                'invoice' => $this->invoice,
                'totals' => $this->totals,
                'meta' => $this->meta,
            ]
        );
    }

    public function attachments(): array
    {
        $binary = $this->meta['pdfBinary'] ?? null;
        if (!$binary) return [];

        $filename = $this->meta['pdfFilename'] ?? "Invoice {$this->invoice->number}.pdf";

        return [
            Attachment::fromData(fn () => $binary, $filename)->withMime('application/pdf'),
        ];
    }
}
