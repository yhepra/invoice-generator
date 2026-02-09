<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // Get aggregated statistics
    public function getStats()
    {
        $totalUsers = User::count();
        $totalPremiumUsers = User::where('plan', 'premium')->count();
        $totalInvoices = Invoice::count();
        $totalRevenue = Payment::where('status', 'PAID')->sum('amount');
        
        // Active users (users who created an invoice in last 30 days)
        $activeUsers = User::whereHas('invoices', function ($query) {
            $query->where('created_at', '>=', now()->subDays(30));
        })->count();

        return response()->json([
            'total_users' => $totalUsers,
            'premium_users' => $totalPremiumUsers,
            'active_users' => $activeUsers,
            'total_invoices' => $totalInvoices,
            'total_revenue' => $totalRevenue,
        ]);
    }

    // Get paginated users list
    public function getUsers(Request $request)
    {
        $query = User::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('plan') && !empty($request->plan)) {
            $query->where('plan', $request->plan);
        }

        $users = $query->withCount('invoices')->latest()->paginate(20);
        return response()->json($users);
    }

    // Update user (e.g., change plan, role, or ban)
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'role' => 'sometimes|in:user,super_admin',
            'plan' => 'sometimes|in:free,premium',
        ]);

        if (isset($validated['plan'])) {
            if ($validated['plan'] === 'premium') {
                // If switching to premium and no expiry date set, default to 1 year
                if (!$user->subscription_expires_at) {
                    $user->subscription_expires_at = now()->addYear();
                }
            } else {
                // If switching to free, remove expiry date
                $user->subscription_expires_at = null;
            }
        }

        $user->update($validated);
        // Explicitly save the subscription_expires_at change if it wasn't in $validated
        $user->save();
        
        return response()->json($user);
    }

    // Get payment history
    public function getPayments(Request $request)
    {
        $query = Payment::with('user:id,name,email');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $payments = $query->latest()->paginate(20);
        return response()->json($payments);
    }
}
