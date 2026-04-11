<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->decimal('subtotal', 15, 2)->default(0)->after('status');
            $table->decimal('tax_amount', 15, 2)->default(0)->after('subtotal');
            $table->decimal('total', 15, 2)->default(0)->after('tax_amount');
            $table->unsignedInteger('items_count')->default(0)->after('total');
        });

        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("
                UPDATE invoices i
                LEFT JOIN (
                    SELECT
                        invoice_id,
                        SUM(quantity * price) AS subtotal,
                        SUM(quantity * price * (tax_percent / 100)) AS tax_amount,
                        SUM(quantity * price * (1 + (tax_percent / 100))) AS total,
                        COUNT(*) AS items_count
                    FROM invoice_items
                    GROUP BY invoice_id
                ) t ON t.invoice_id = i.id
                SET
                    i.subtotal = COALESCE(t.subtotal, 0),
                    i.tax_amount = COALESCE(t.tax_amount, 0),
                    i.total = COALESCE(t.total, 0),
                    i.items_count = COALESCE(t.items_count, 0)
            ");
            return;
        }

        if ($driver === 'pgsql') {
            DB::statement("UPDATE invoices SET subtotal = 0, tax_amount = 0, total = 0, items_count = 0");
            DB::statement("
                UPDATE invoices
                SET
                    subtotal = COALESCE(t.subtotal, 0),
                    tax_amount = COALESCE(t.tax_amount, 0),
                    total = COALESCE(t.total, 0),
                    items_count = COALESCE(t.items_count, 0)
                FROM (
                    SELECT
                        invoice_id,
                        SUM(quantity * price) AS subtotal,
                        SUM(quantity * price * (tax_percent / 100)) AS tax_amount,
                        SUM(quantity * price * (1 + (tax_percent / 100))) AS total,
                        COUNT(*) AS items_count
                    FROM invoice_items
                    GROUP BY invoice_id
                ) t
                WHERE invoices.id = t.invoice_id
            ");
            return;
        }

        DB::statement("
            UPDATE invoices
            SET
                subtotal = COALESCE((SELECT SUM(quantity * price) FROM invoice_items WHERE invoice_id = invoices.id), 0),
                tax_amount = COALESCE((SELECT SUM(quantity * price * (tax_percent / 100)) FROM invoice_items WHERE invoice_id = invoices.id), 0),
                total = COALESCE((SELECT SUM(quantity * price * (1 + (tax_percent / 100))) FROM invoice_items WHERE invoice_id = invoices.id), 0),
                items_count = COALESCE((SELECT COUNT(*) FROM invoice_items WHERE invoice_id = invoices.id), 0)
        ");
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'tax_amount', 'total', 'items_count']);
        });
    }
};

