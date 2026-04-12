@php
  $lang = ($meta['language'] ?? 'id') === 'en' ? 'en' : 'id';
  $labels = $lang === 'en'
    ? [
        'title' => 'Invoice',
        'number' => 'Invoice No.',
        'date' => 'Invoice Date',
        'due' => 'Due Date',
        'from' => 'From',
        'to' => 'Bill To',
        'item' => 'Item',
        'qty' => 'Qty',
        'price' => 'Price',
        'tax' => 'Tax (%)',
        'total' => 'Total',
        'subtotal' => 'Subtotal',
        'taxAmount' => 'Tax',
        'grandTotal' => 'Grand Total',
        'notes' => 'Notes',
        'terms' => 'Terms & Conditions',
      ]
    : [
        'title' => 'Faktur',
        'number' => 'No. Faktur',
        'date' => 'Tanggal Faktur',
        'due' => 'Jatuh Tempo',
        'from' => 'Dari',
        'to' => 'Kepada',
        'item' => 'Barang',
        'qty' => 'Jml',
        'price' => 'Harga',
        'tax' => 'Pajak (%)',
        'total' => 'Total',
        'subtotal' => 'Subtotal',
        'taxAmount' => 'Pajak',
        'grandTotal' => 'Total',
        'notes' => 'Catatan',
        'terms' => 'Syarat & Ketentuan',
      ];

  $seller = $invoice->seller_info ?? [];
  $customer = $invoice->customer_info ?? [];
  $currency = $meta['currency'] ?? 'IDR';
  $money = function ($value) use ($lang, $currency) {
      $amount = (float) ($value ?? 0);
      $currencyUpper = strtoupper((string) $currency);
      if ($currencyUpper === 'IDR') {
          return ($lang === 'en' ? 'IDR ' : 'Rp ') . number_format($amount, 0, ',', '.');
      }
      if ($currencyUpper === 'USD') {
          return '$' . number_format($amount, 2, '.', ',');
      }
      return $currencyUpper . ' ' . number_format($amount, 2, '.', ',');
  };
@endphp

<div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.4;">
  <h2 style="margin: 0 0 12px 0;">{{ $labels['title'] }}</h2>

  @if(!empty($meta['message']))
    <div style="margin: 0 0 16px 0; padding: 12px; background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 8px;">
      {!! nl2br(e($meta['message'])) !!}
    </div>
  @endif

  <table style="width: 100%; border-collapse: collapse; margin: 0 0 16px 0;">
    <tr>
      <td style="vertical-align: top; width: 50%; padding-right: 12px;">
        <div style="font-weight: 700; margin-bottom: 6px;">{{ $labels['from'] }}</div>
        <div style="font-weight: 600;">{{ $seller['name'] ?? '' }}</div>
        <div style="white-space: pre-line; color: #374151;">{{ $seller['address'] ?? '' }}</div>
        <div style="color: #374151;">{{ $seller['phone'] ?? '' }}</div>
        <div style="color: #374151;">{{ $seller['email'] ?? '' }}</div>
      </td>
      <td style="vertical-align: top; width: 50%; padding-left: 12px;">
        <div style="font-weight: 700; margin-bottom: 6px;">{{ $labels['to'] }}</div>
        <div style="font-weight: 600;">{{ $customer['name'] ?? '' }}</div>
        <div style="white-space: pre-line; color: #374151;">{{ $customer['address'] ?? '' }}</div>
        <div style="color: #374151;">{{ $customer['phone'] ?? '' }}</div>
        <div style="color: #374151;">{{ $customer['email'] ?? '' }}</div>
      </td>
    </tr>
  </table>

  <table style="width: 100%; border-collapse: collapse; margin: 0 0 16px 0;">
    <tr>
      <td style="padding: 6px 0; color: #374151;"><strong>{{ $labels['number'] }}:</strong> {{ $invoice->number }}</td>
      <td style="padding: 6px 0; color: #374151; text-align: right;"><strong>{{ $labels['date'] }}:</strong> {{ optional($invoice->date)->format('Y-m-d') }}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; color: #374151;"><strong>{{ $labels['due'] }}:</strong> {{ optional($invoice->due_date)->format('Y-m-d') }}</td>
      <td></td>
    </tr>
  </table>

  <table style="width: 100%; border-collapse: collapse; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
    <thead>
      <tr style="background: #F9FAFB;">
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #E5E7EB;">{{ $labels['item'] }}</th>
        <th style="padding: 10px; text-align: right; border-bottom: 1px solid #E5E7EB; width: 80px;">{{ $labels['qty'] }}</th>
        <th style="padding: 10px; text-align: right; border-bottom: 1px solid #E5E7EB; width: 120px;">{{ $labels['price'] }}</th>
        <th style="padding: 10px; text-align: right; border-bottom: 1px solid #E5E7EB; width: 90px;">{{ $labels['tax'] }}</th>
        <th style="padding: 10px; text-align: right; border-bottom: 1px solid #E5E7EB; width: 120px;">{{ $labels['total'] }}</th>
      </tr>
    </thead>
    <tbody>
      @foreach($invoice->items as $it)
        @php
          $line = (float) $it->quantity * (float) $it->price;
          $taxPercent = (float) ($it->tax_percent ?? 0);
          $lineTotal = $line + ($line * ($taxPercent / 100.0));
        @endphp
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #F3F4F6;">{!! $it->name !!}</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #F3F4F6;">{{ $it->quantity }}</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #F3F4F6;">{{ $money($it->price) }}</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #F3F4F6;">{{ (float) ($it->tax_percent ?? 0) }}%</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #F3F4F6;">{{ $money($lineTotal) }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>

  <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
    <tr>
      <td></td>
      <td style="width: 280px;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #374151;">
          <span>{{ $labels['subtotal'] }}</span>
          <span style="font-weight: 600;">{{ $money($totals['subtotal'] ?? 0) }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #374151;">
          <span>{{ $labels['taxAmount'] }}</span>
          <span style="font-weight: 600;">{{ $money($totals['taxAmount'] ?? 0) }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #E5E7EB;">
          <span style="font-weight: 700;">{{ $labels['grandTotal'] }}</span>
          <span style="font-weight: 700;">{{ $money($totals['total'] ?? 0) }}</span>
        </div>
      </td>
    </tr>
  </table>

  @if(!empty($invoice->notes))
    <div style="margin-top: 16px;">
      <div style="font-weight: 700; margin-bottom: 4px;">{{ $labels['notes'] }}</div>
      <div style="color: #374151;">{!! $invoice->notes !!}</div>
    </div>
  @endif

  @if(!empty($invoice->terms))
    <div style="margin-top: 12px;">
      <div style="font-weight: 700; margin-bottom: 4px;">{{ $labels['terms'] }}</div>
      <div style="color: #374151;">{!! $invoice->terms !!}</div>
    </div>
  @endif
</div>
