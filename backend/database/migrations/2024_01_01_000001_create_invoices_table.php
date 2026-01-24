<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->date('date');
            $table->date('due_date');
            $table->json('seller_info'); // Stores name, address, email, phone, logo
            $table->json('customer_info'); // Stores name, address, email, phone
            $table->text('notes')->nullable();
            $table->text('terms')->nullable();
            $table->string('status')->default('draft'); // draft, sent, paid, etc.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
