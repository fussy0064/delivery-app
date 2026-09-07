"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

const sampleItems: CartItem[] = [
  { id: "1", name: "Chicken Pizza", price: 18000, qty: 1 },
  { id: "2", name: "Coca Cola 500ml", price: 2000, qty: 2 },
];

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(sampleItems);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const placeOrder = async () => {
    if (!address.trim()) {
      setError("Please enter delivery address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Please login first");
      setLoading(false);
      router.push("/login");
      return;
    }

    const { data, error } = await supabase.from("orders").insert({
      user_id: user.id,
      type: "food",
      status: "pending",
      from_address: "Restaurant",
      to_address: address,
      items: items,
      total_amount: total,
    }).select().single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(`Order placed! ID: ${data.id.slice(0, 8)}`);
    setLoading(false);

    setTimeout(() => {
      router.push(`/track?id=${data.id}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold">Cart</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500">Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
            Cart is empty
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      TSh {item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-8 h-8 rounded-full bg-gray-100 font-bold"
                    >
                      −
                    </button>
                    <span className="font-medium w-6 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
              <label className="block text-sm font-medium mb-2">
                Delivery Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Mikocheni B, House 12"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-orange-500">
                  TSh {total.toLocaleString()}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl mb-4">
                {success}
              </div>
            )}

            <button
              onClick={placeOrder}
              disabled={loading}
              className="w-full bg-orange-500 text-white font-semibold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-60"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
