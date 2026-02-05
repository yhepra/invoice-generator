<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->uuid('uuid')->after('id')->unique()->nullable();
        });
        
        // Populate existing records
        \Illuminate\Support\Facades\DB::table('invoices')->orderBy('id')->chunk(100, function ($invoices) {
            foreach ($invoices as $invoice) {
                if (empty($invoice->uuid)) {
                    \Illuminate\Support\Facades\DB::table('invoices')
                        ->where('id', $invoice->id)
                        ->update(['uuid' => \Illuminate\Support\Str::uuid()]);
                }
            }
        });

        // Make it not nullable
        Schema::table('invoices', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
