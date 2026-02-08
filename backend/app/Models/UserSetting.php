<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'currency',
        'locale',
        'language',
        'footerText',
        'logo_history',
        'signature_history',
    ];

    protected $casts = [
        'logo_history' => 'array',
        'signature_history' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
