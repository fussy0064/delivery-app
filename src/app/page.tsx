"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<"food" | "package">("food");

  // Package form state
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [size, setSize] = useState("small");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getPrice = () => {
    if (size === "small") return 5000;
    if (size === "medium") return 8000;
    return 12000;
  };

  const placePackageOrder = async () => {
    if (!pickup.trim() || !dropoff.trim()) {
      setError("Please enter both pickup and delivery address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please login first");
      setLoading(false);
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        type: "package",
        status: "pending",
        from_address: pickup,
        to_address: dropoff,
        items: [{ name: `${size} package`, price: getPrice(), qty: 1 }],
        total_amount: getPrice(),
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess("Package order placed!");
    setLoading(false);

    setTimeout(() => {
      router.push(`/track?id=${data.id}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <span className="text-xl font-bold text-gray-900">SwiftDeliver</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-orange-500"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-orange-600 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Food & Packages. Delivered Fast.
          </h1>
          <p className="text-gray-600 text-lg">
            Order food or send packages in minutes
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-full shadow-md flex gap-1">
            <button
              onClick={() => setMode("food")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition ${
                mode === "food"
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              🍔 Food
            </button>
            <button
              onClick={() => setMode("package")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition ${
                mode === "package"
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              📦 Package
            </button>
          </div>
        </div>

        {/* Food Mode */}
        {mode === "food" ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Order Food</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search restaurants or dishes..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Pizza", "Burgers", "Sushi", "Local Food", "Desserts", "Drinks"].map(
                  (item) => (
                    <button
                      key={item}
                      className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-3 rounded-xl transition"
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
              <Link
                href="/cart"
                className="block w-full bg-orange-500 text-white font-semibold py-3.5 rounded-xl hover:bg-orange-600 transition mt-2 text-center"
              >
                Go to Cart & Order
              </Link>
            </div>
          </div>
        ) : (
          /* Package Mode */
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Send a Package</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Pickup address"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="text"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="Delivery address"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="small">Small package (up to 5kg) – TSh 5,000</option>
                <option value="medium">Medium package (5-15kg) – TSh 8,000</option>
                <option value="large">Large package (15kg+) – TSh 12,000</option>
              </select>

              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-sm text-gray-600">Estimated Price</p>
                <p className="text-xl font-bold text-orange-600">
                  TSh {getPrice().toLocaleString()}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl">
                  {success}
                </div>
              )}

              <button
                onClick={placePackageOrder}
                disabled={loading}
                className="w-full bg-orange-500 text-white font-semibold py-3.5 rounded-xl hover:bg-orange-600 transition disabled:opacity-60"
              >
                {loading ? "Placing Order..." : "Place Package Order"}
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-6 mt-14">
          <div className="text-center p-5">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold mb-1">Fast Delivery</h3>
            <p className="text-sm text-gray-600">Average 25-40 minutes</p>
          </div>
          <div className="text-center p-5">
            <div className="text-3xl mb-2">📍</div>
            <h3 className="font-bold mb-1">Live Tracking</h3>
            <p className="text-sm text-gray-600">See your order in real time</p>
          </div>
          <div className="text-center p-5">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-bold mb-1">Secure Payment</h3>
            <p className="text-sm text-gray-600">Safe & encrypted</p>
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-500 py-8">
        © 2026 SwiftDeliver. Built for speed.
      </footer>
    </div>
  );
}
