<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_settings', function (Blueprint $table) {
            $table->string('fromAddress')->nullable()->after('footerText');
            $table->string('fromName')->nullable()->after('fromAddress');
            $table->string('smtpHost')->nullable()->after('fromName');
            $table->unsignedInteger('smtpPort')->nullable()->after('smtpHost');
            $table->string('smtpEncryption')->nullable()->after('smtpPort');
            $table->string('smtpUsername')->nullable()->after('smtpEncryption');
            $table->text('smtpPassword')->nullable()->after('smtpUsername');
        });
    }

    public function down(): void
    {
        Schema::table('user_settings', function (Blueprint $table) {
            $table->dropColumn([
                'fromAddress',
                'fromName',
                'smtpHost',
                'smtpPort',
                'smtpEncryption',
                'smtpUsername',
                'smtpPassword',
            ]);
        });
    }
};

