<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContactManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_crud_endpoints_work_for_authenticated_user(): void
    {
        $user = User::factory()->create([
            'plan' => 'premium',
        ]);
        $otherUser = User::factory()->create([
            'plan' => 'premium',
        ]);

        Sanctum::actingAs($user);

        $createResponse = $this->postJson('/api/contacts/customers', [
            'name' => 'PT Pelanggan Maju',
            'email' => 'customer@example.com',
            'phone' => '08123456789',
            'address' => 'Jakarta',
        ]);

        $createResponse->assertCreated();
        $createResponse->assertJsonPath('type', 'customer');
        $contactId = $createResponse->json('id');

        $this->getJson('/api/contacts/customers')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $contactId);

        $this->getJson("/api/contacts/customers/{$contactId}")
            ->assertOk()
            ->assertJsonPath('id', $contactId);

        $this->patchJson("/api/contacts/customers/{$contactId}", [
            'name' => 'PT Pelanggan Updated',
            'phone' => '08999999999',
        ])
            ->assertOk()
            ->assertJsonPath('name', 'PT Pelanggan Updated');

        Sanctum::actingAs($otherUser);
        $this->getJson("/api/contacts/customers/{$contactId}")
            ->assertNotFound();

        Sanctum::actingAs($user);
        $this->deleteJson("/api/contacts/customers/{$contactId}")
            ->assertNoContent();
    }

    public function test_seller_crud_endpoints_work_for_authenticated_user(): void
    {
        $user = User::factory()->create([
            'plan' => 'premium',
        ]);

        Sanctum::actingAs($user);

        $createResponse = $this->postJson('/api/contacts/sellers', [
            'name' => 'CV Seller Jaya',
            'email' => 'seller@example.com',
            'phone' => '08111111111',
            'address' => 'Bandung',
            'logo' => 'https://cdn.example.com/logo.png',
        ]);

        $createResponse->assertCreated();
        $createResponse->assertJsonPath('type', 'seller');
        $sellerId = $createResponse->json('id');

        $this->getJson('/api/contacts/sellers')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $sellerId);

        $this->putJson("/api/contacts/sellers/{$sellerId}", [
            'name' => 'CV Seller Baru',
            'email' => 'seller@example.com',
            'phone' => '08222222222',
            'address' => 'Bandung',
            'logo' => 'https://cdn.example.com/logo-baru.png',
        ])
            ->assertOk()
            ->assertJsonPath('name', 'CV Seller Baru')
            ->assertJsonPath('type', 'seller');

        $this->deleteJson("/api/contacts/sellers/{$sellerId}")
            ->assertNoContent();
    }
}
