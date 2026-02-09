<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminEmail = 'admin@example.com';
        
        $user = User::where('email', $adminEmail)->first();
        
        if (!$user) {
            User::create([
                'name' => 'Super Admin',
                'email' => $adminEmail,
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'plan' => 'premium',
                'email_verified_at' => now(),
            ]);
            $this->command->info('Super Admin created: admin@example.com / password');
        } else {
            $user->update(['role' => 'super_admin']);
            $this->command->info('Existing user updated to Super Admin: ' . $adminEmail);
        }
    }
}
