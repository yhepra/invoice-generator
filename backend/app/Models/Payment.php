<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'external_id',
        'amount',
        'status',
        'payment_channel',
        'payment_method',
        'paid_at',
        'payment_details'
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'payment_details' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
