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
            $table->string('customer_name')->nullable()->after('customer_info');
            $table->string('customer_email')->nullable()->after('customer_name');
            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'status', 'created_at']);
        });

        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("
                UPDATE invoices
                SET
                    customer_name = JSON_UNQUOTE(JSON_EXTRACT(customer_info, '$.name')),
                    customer_email = JSON_UNQUOTE(JSON_EXTRACT(customer_info, '$.email'))
            ");
            return;
        }

        if ($driver === 'pgsql') {
            DB::statement("
                UPDATE invoices
                SET
                    customer_name = (customer_info->>'name'),
                    customer_email = (customer_info->>'email')
            ");
            return;
        }

        $rows = DB::table('invoices')->select(['id', 'customer_info'])->orderBy('id')->get();
        foreach ($rows as $row) {
            $info = json_decode($row->customer_info ?? '', true);
            $name = is_array($info) ? ($info['name'] ?? null) : null;
            $email = is_array($info) ? ($info['email'] ?? null) : null;
            DB::table('invoices')->where('id', $row->id)->update([
                'customer_name' => $name,
                'customer_email' => $email,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['user_id', 'status', 'created_at']);
            $table->dropColumn(['customer_name', 'customer_email']);
        });
    }
};

