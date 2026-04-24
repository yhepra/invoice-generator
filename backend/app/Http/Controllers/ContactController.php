<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $query = Contact::query()
            ->where('user_id', Auth::id())
            ->latest();

        $type = $request->query('type');
        if (in_array($type, ['seller', 'customer'], true)) {
            $query->where('type', $type);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $payload = $this->validateContactPayload($request, false);

        $user = Auth::user();
        if ($user->plan === 'free') {
            $limit = $payload['type'] === 'seller' ? 1 : 5;
            $count = Contact::where('user_id', $user->id)->where('type', $payload['type'])->count();

            if ($count >= $limit) {
                return response()->json(['message' => "Free plan limit reached. Upgrade to Premium for unlimited {$payload['type']}s."], 403);
            }
        }

        $data = $payload;
        $data['user_id'] = Auth::id();

        $contact = Contact::create($data);

        return response()->json($contact, 201);
    }

    public function show($id)
    {
        return response()->json($this->findOwnedContact($id));
    }

    public function update(Request $request, $id)
    {
        $contact = $this->findOwnedContact($id);
        $payload = $this->validateContactPayload($request, true);
        $contact->update($payload);

        return response()->json($contact);
    }

    public function destroy($id)
    {
        $contact = $this->findOwnedContact($id);
        $contact->delete();

        return response()->json(null, 204);
    }

    public function indexCustomers()
    {
        return response()->json($this->queryOwnedByType('customer')->get());
    }

    public function storeCustomer(Request $request)
    {
        return $this->storeByType($request, 'customer');
    }

    public function showCustomer($id)
    {
        return response()->json($this->findOwnedByType($id, 'customer'));
    }

    public function updateCustomer(Request $request, $id)
    {
        return $this->updateByType($request, $id, 'customer');
    }

    public function destroyCustomer($id)
    {
        return $this->destroyByType($id, 'customer');
    }

    public function indexSellers()
    {
        return response()->json($this->queryOwnedByType('seller')->get());
    }

    public function storeSeller(Request $request)
    {
        return $this->storeByType($request, 'seller');
    }

    public function showSeller($id)
    {
        return response()->json($this->findOwnedByType($id, 'seller'));
    }

    public function updateSeller(Request $request, $id)
    {
        return $this->updateByType($request, $id, 'seller');
    }

    public function destroySeller($id)
    {
        return $this->destroyByType($id, 'seller');
    }

    private function storeByType(Request $request, string $type)
    {
        $payload = $this->validateContactPayload($request, false, $type);

        $user = Auth::user();
        if ($user->plan === 'free') {
            $limit = $type === 'seller' ? 1 : 5;
            $count = Contact::where('user_id', $user->id)->where('type', $type)->count();
            if ($count >= $limit) {
                return response()->json(['message' => "Free plan limit reached. Upgrade to Premium for unlimited {$type}s."], 403);
            }
        }

        $payload['user_id'] = Auth::id();
        $contact = Contact::create($payload);

        return response()->json($contact, 201);
    }

    private function updateByType(Request $request, $id, string $type)
    {
        $contact = $this->findOwnedByType($id, $type);
        $payload = $this->validateContactPayload($request, true, $type);
        $contact->update($payload);

        return response()->json($contact);
    }

    private function destroyByType($id, string $type)
    {
        $contact = $this->findOwnedByType($id, $type);
        $contact->delete();

        return response()->json(null, 204);
    }

    private function validateContactPayload(Request $request, bool $partial = false, ?string $forcedType = null): array
    {
        $nameRule = $partial ? 'sometimes|required|string|max:255' : 'required|string|max:255';
        $emailRule = $partial ? 'sometimes|nullable|email|max:255' : 'nullable|email|max:255';
        $phoneRule = $partial ? 'sometimes|nullable|string|max:50' : 'nullable|string|max:50';
        $addressRule = $partial ? 'sometimes|nullable|string' : 'nullable|string';
        $logoRule = $partial ? 'sometimes|nullable|string|max:500' : 'nullable|string|max:500';

        $rules = [
            'name' => $nameRule,
            'email' => $emailRule,
            'phone' => $phoneRule,
            'address' => $addressRule,
            'logo' => $logoRule,
        ];

        if ($forcedType === null) {
            $rules['type'] = $partial
                ? 'sometimes|required|in:seller,customer'
                : 'required|in:seller,customer';
        }

        $payload = $request->validate($rules);
        if ($forcedType !== null) {
            $payload['type'] = $forcedType;
        }

        return $payload;
    }

    private function findOwnedContact($id): Contact
    {
        return Contact::query()
            ->where('user_id', Auth::id())
            ->findOrFail($id);
    }

    private function queryOwnedByType(string $type)
    {
        return Contact::query()
            ->where('user_id', Auth::id())
            ->where('type', $type)
            ->latest();
    }

    private function findOwnedByType($id, string $type): Contact
    {
        return Contact::query()
            ->where('user_id', Auth::id())
            ->where('type', $type)
            ->findOrFail($id);
    }
}
