<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;

class ContactController extends Controller
{
    public function index()
    {
        return response()->json(Contact::where('user_id', Auth::id())->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:seller,customer',
        ]);

        $user = Auth::user();
        if ($user->plan === 'free') {
            $limit = $request->type === 'seller' ? 1 : 5;
            $count = Contact::where('user_id', $user->id)->where('type', $request->type)->count();
            
            if ($count >= $limit) {
                return response()->json(['message' => "Free plan limit reached. Upgrade to Premium for unlimited {$request->type}s."], 403);
            }
        }

        $data = $request->all();
        $data['user_id'] = Auth::id();

        $contact = Contact::create($data);
        return response()->json($contact, 201);
    }

    public function show($id)
    {
        return response()->json(Contact::where('user_id', Auth::id())->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $contact = Contact::where('user_id', Auth::id())->findOrFail($id);
        $contact->update($request->all());
        return response()->json($contact);
    }

    public function destroy($id)
    {
        $contact = Contact::where('user_id', Auth::id())->findOrFail($id);
        $contact->delete();
        return response()->json(null, 204);
    }
}
