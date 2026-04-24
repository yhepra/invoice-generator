<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InvoicePaginationTest extends TestCase
{
    use RefreshDatabase;

    public function test_invoices_index_can_be_paginated_with_10_items_per_page(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        for ($i = 1; $i <= 25; $i++) {
            Invoice::create([
                'user_id' => $user->id,
                'number' => "INV-{$i}",
                'date' => now()->toDateString(),
                'due_date' => now()->addDays(7)->toDateString(),
                'seller_info' => ['name' => 'Seller'],
                'customer_info' => ['name' => 'Customer'],
                'status' => 'Unpaid',
                'subtotal' => 100,
                'tax_amount' => 0,
                'total' => 100,
                'items_count' => 0,
            ]);
        }

        for ($i = 1; $i <= 7; $i++) {
            Invoice::create([
                'user_id' => $otherUser->id,
                'number' => "OTHER-{$i}",
                'date' => now()->toDateString(),
                'due_date' => now()->addDays(7)->toDateString(),
                'seller_info' => ['name' => 'Seller'],
                'customer_info' => ['name' => 'Customer'],
                'status' => 'Unpaid',
                'subtotal' => 100,
                'tax_amount' => 0,
                'total' => 100,
                'items_count' => 0,
            ]);
        }

        Sanctum::actingAs($user);

        $page1 = $this->getJson('/api/invoices?page=1');
        $page1->assertOk();
        $page1->assertJsonPath('meta.per_page', 10);
        $page1->assertJsonPath('meta.current_page', 1);
        $page1->assertJsonPath('meta.last_page', 3);
        $page1->assertJsonPath('meta.total', 25);
        $this->assertCount(10, $page1->json('data'));

        $page3 = $this->getJson('/api/invoices?page=3');
        $page3->assertOk();
        $page3->assertJsonPath('meta.current_page', 3);
        $page3->assertJsonPath('meta.total', 25);
        $this->assertCount(5, $page3->json('data'));
    }
}
