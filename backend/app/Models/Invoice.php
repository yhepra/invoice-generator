<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'number',
        'date',
        'due_date',
        'seller_info',
        'customer_info',
        'notes',
        'terms',
        'status',
    ];

    protected $casts = [
        'seller_info' => 'array',
        'customer_info' => 'array',
        'date' => 'date',
        'due_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }
}
