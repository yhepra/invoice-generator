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
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
