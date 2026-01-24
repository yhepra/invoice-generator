<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::where('user_id', Auth::id())->with('items')->latest()->get();
        return response()->json($invoices);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->plan === 'free') {
            $count = Invoice::where('user_id', $user->id)->count();
            if ($count >= 30) {
                return response()->json(['message' => 'Free plan limit reached. Upgrade to Premium for unlimited invoices.'], 403);
            }
        }

        $request->validate([
            'number' => 'required|string',
            'date' => 'required|date',
            'due_date' => 'required|date',
            'seller_info' => 'required|array',
            'customer_info' => 'required|array',
            'items' => 'required|array|min:1',
        ]);

        return DB::transaction(function () use ($request) {
            $data = $request->only([
                'number', 'date', 'due_date', 'seller_info', 'customer_info', 'notes', 'terms', 'status'
            ]);
            $data['user_id'] = Auth::id();
            
            $invoice = Invoice::create($data);

            foreach ($request->items as $item) {
                $invoice->items()->create($item);
            }

            return response()->json($invoice->load('items'), 201);
        });
    }

    public function show($id)
    {
        $invoice = Invoice::where('user_id', Auth::id())->with('items')->findOrFail($id);
        return response()->json($invoice);
    }

    public function update(Request $request, $id)
    {
        $invoice = Invoice::where('user_id', Auth::id())->findOrFail($id);
        
        return DB::transaction(function () use ($request, $invoice) {
            $invoice->update($request->only([
                'number', 'date', 'due_date', 'seller_info', 'customer_info', 'notes', 'terms', 'status'
            ]));

            if ($request->has('items')) {
                $invoice->items()->delete();
                foreach ($request->items as $item) {
                    $invoice->items()->create($item);
                }
            }

            return response()->json($invoice->load('items'));
        });
    }

    public function destroy($id)
    {
        $invoice = Invoice::where('user_id', Auth::id())->findOrFail($id);
        $invoice->delete();
        return response()->json(null, 204);
    }
}
