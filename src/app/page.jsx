"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState("food");
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

  const getDistance = () => {
    if (!pickup || !dropoff) return null;
    const base = pickup.length + dropoff.length;
    return (3 + (base % 12)).toFixed(1);
  };

  const placePackageOrder = async () => {
    if (!pickup.trim() || !dropoff.trim()) {
      setError("Enter both pickup and delivery addresses.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in first.");
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

    setSuccess("Order placed successfully.");
    setLoading(false);

    setTimeout(() => {
      router.push(`/track?id=${data.id}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen" style={{ background: "#F7F5F2" }}>
      <header
        className="border-b sticky top-0 z-20"
        style={{ background: "#FFFFFF", borderColor: "#E5E2DC" }}
      >
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "#E85D04" }}
            >
              SD
            </div>
            <span
              className="text-[15px] font-semibold tracking-tight"
              style={{ color: "#111111" }}
            >
              SwiftDeliver
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-medium"
              style={{ color: "#5C5C5C" }}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium px-4 py-2 text-white"
              style={{ background: "#E85D04" }}
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-14">
        <section className="mb-14 max-w-2xl">
          <h1
            className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.15] mb-4"
            style={{ color: "#111111" }}
          >
            Food and packages delivered with precision.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "#5C5C5C" }}>
            Reliable local delivery for restaurants and personal parcels.
            Track every order in real time.
          </p>
        </section>

        <div
          className="flex mb-8 border"
          style={{ borderColor: "#E5E2DC", width: "fit-content" }}
        >
          <button
            onClick={() => setMode("food")}
            className="px-6 py-2.5 text-sm font-medium"
            style={{
              background: mode === "food" ? "#E85D04" : "#FFFFFF",
              color: mode === "food" ? "#FFFFFF" : "#5C5C5C",
            }}
          >
            Food
          </button>
          <button
            onClick={() => setMode("package")}
            className="px-6 py-2.5 text-sm font-medium border-l"
            style={{
              background: mode === "package" ? "#E85D04" : "#FFFFFF",
              color: mode === "package" ? "#FFFFFF" : "#5C5C5C",
              borderColor: "#E5E2DC",
            }}
          >
            Package
          </button>
        </div>

        <div
          className="border p-8 max-w-xl"
          style={{ background: "#FFFFFF", borderColor: "#E5E2DC" }}
        >
          {mode === "food" ? (
            <div>
              <h2
                className="text-xl font-semibold mb-1"
                style={{ color: "#111111" }}
              >
                Order food
              </h2>
              <p className="text-sm mb-6" style={{ color: "#5C5C5C" }}>
                Browse restaurants and place your order in a few taps.
              </p>

              <input
                type="text"
                placeholder="Search restaurants or dishes"
                className="w-full border px-4 py-3 text-sm mb-5 focus:outline-none"
                style={{ borderColor: "#E5E2DC", color: "#111111" }}
              />

              <div className="grid grid-cols-2 gap-3 mb-6">
                {["Pizza", "Burgers", "Local meals", "Drinks"].map((item) => (
                  <button
                    key={item}
                    className="border py-3 text-sm font-medium text-left px-4"
                    style={{ borderColor: "#E5E2DC", color: "#111111" }}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <Link
                href="/cart"
                className="block w-full text-center py-3.5 text-sm font-medium text-white"
                style={{ background: "#E85D04" }}
              >
                Continue to cart
              </Link>
            </div>
          ) : (
            <div>
              <h2
                className="text-xl font-semibold mb-1"
                style={{ color: "#111111" }}
              >
                Send a package
              </h2>
              <p className="text-sm mb-6" style={{ color: "#5C5C5C" }}>
                Enter pickup and drop-off details to get started.
              </p>

              <div className="space-y-4 mb-5">
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "#5C5C5C" }}
                  >
                    Pickup address
                  </label>
                  <input
                    type="text"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Street, area, landmark"
                    className="w-full border px-4 py-3 text-sm focus:outline-none"
                    style={{ borderColor: "#E5E2DC", color: "#111111" }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "#5C5C5C" }}
                  >
                    Delivery address
                  </label>
                  <input
                    type="text"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    placeholder="Street, area, landmark"
                    className="w-full border px-4 py-3 text-sm focus:outline-none"
                    style={{ borderColor: "#E5E2DC", color: "#111111" }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "#5C5C5C" }}
                  >
                    Package size
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full border px-4 py-3 text-sm focus:outline-none bg-white"
                    style={{ borderColor: "#E5E2DC", color: "#111111" }}
                  >
                    <option value="small">Small (up to 5 kg) — TSh 5,000</option>
                    <option value="medium">Medium (5–15 kg) — TSh 8,000</option>
                    <option value="large">Large (15 kg+) — TSh 12,000</option>
                  </select>
                </div>
              </div>

              <div
                className="border px-4 py-3 mb-5 flex justify-between items-center"
                style={{ borderColor: "#E5E2DC", background: "#F7F5F2" }}
              >
                <div>
                  <p className="text-xs" style={{ color: "#5C5C5C" }}>
                    Estimated total
                  </p>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: "#111111" }}
                  >
                    TSh {getPrice().toLocaleString()}
                  </p>
                </div>
                {getDistance() && (
                  <p className="text-sm" style={{ color: "#5C5C5C" }}>
                    ~{getDistance()} km
                  </p>
                )}
              </div>

              {error && (
                <p className="text-sm mb-4" style={{ color: "#B91C1C" }}>
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm mb-4" style={{ color: "#4A5D4E" }}>
                  {success}
                </p>
              )}

              <button
                onClick={placePackageOrder}
                disabled={loading}
                className="w-full py-3.5 text-sm font-medium text-white disabled:opacity-60"
                style={{ background: "#E85D04" }}
              >
                {loading ? "Placing order..." : "Place package order"}
              </button>
            </div>
          )}
        </div>

        <div
          className="mt-16 pt-10 border-t"
          style={{ borderColor: "#E5E2DC" }}
        >
          <div className="grid sm:grid-cols-3 gap-10">
            <div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "#111111" }}
              >
                Live tracking
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#5C5C5C" }}
              >
                Follow your driver from pickup to doorstep on the map.
              </p>
            </div>
            <div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "#111111" }}
              >
                Local drivers
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#5C5C5C" }}
              >
                Verified riders who know the city and handle packages carefully.
              </p>
            </div>
            <div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "#111111" }}
              >
                Clear pricing
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#5C5C5C" }}
              >
                See the total before you confirm. No hidden fees.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer
        className="border-t py-8 mt-auto"
        style={{ borderColor: "#E5E2DC", background: "#FFFFFF" }}
      >
        <div
          className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row justify-between gap-4 text-sm"
          style={{ color: "#5C5C5C" }}
        >
          <span>© 2026 SwiftDeliver</span>
          <div className="flex gap-6">
            <Link href="/login">Driver login</Link>
            <Link href="/track">Track order</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
