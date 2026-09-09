"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  type: "food" | "package";
  from_address: string;
  to_address: string;
  total_amount: number;
  status: string;
  created_at: string;
};

export default function DriverDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      fetchOrders();
    };
    checkUser();
  }, [router]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["pending", "accepted", "picked", "on_the_way"])
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const acceptOrder = async (id: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "accepted", driver_id: user?.id })
      .eq("id", id);

    if (!error) fetchOrders();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (!error) fetchOrders();
  };

  const available = orders.filter((o) => o.status === "pending");
  const active = orders.filter((o) =>
    ["accepted", "picked", "on_the_way"].includes(o.status)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold text-gray-900">Driver</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                isOnline ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
              }`}
            >
              {isOnline ? "● Online" : "○ Offline"}
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="text-sm text-gray-500 hover:text-orange-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-orange-500">{available.length}</p>
            <p className="text-xs text-gray-500">Available</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-500">{active.length}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-500">—</p>
            <p className="text-xs text-gray-500">Today</p>
          </div>
        </div>

        {active.length > 0 && (
          <section className="mb-8">
            <h2 className="font-bold text-gray-900 mb-3">Active Orders</h2>
            <div className="space-y-3">
              {active.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                        {order.type === "food" ? "🍔 Food" : "📦 Package"}
                      </span>
                      <p className="font-semibold mt-1">{order.id.slice(0, 8)}</p>
                    </div>
                    <span className="font-bold text-green-600">
                      TSh {Number(order.total_amount).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">From:</span> {order.from_address}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">To:</span> {order.to_address}
                  </p>

                  <div className="flex gap-2">
                    {order.status === "accepted" && (
                      <button
                        onClick={() => updateStatus(order.id, "picked")}
                        className="flex-1 bg-blue-500 text-white text-sm font-medium py-2 rounded-lg"
                      >
                        Mark Picked Up
                      </button>
                    )}
                    {order.status === "picked" && (
                      <button
                        onClick={() => updateStatus(order.id, "on_the_way")}
                        className="flex-1 bg-purple-500 text-white text-sm font-medium py-2 rounded-lg"
                      >
                        Start Delivery
                      </button>
                    )}
                    {order.status === "on_the_way" && (
                      <button
                        onClick={() => updateStatus(order.id, "delivered")}
                        className="flex-1 bg-green-500 text-white text-sm font-medium py-2 rounded-lg"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-bold text-gray-900 mb-3">
            Available Orders {isOnline ? "" : "(Go Online to accept)"}
          </h2>

          {!isOnline ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              You are offline. Turn online to see and accept jobs.
            </div>
          ) : available.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              No available orders right now. Stay online!
            </div>
          ) : (
            <div className="space-y-3">
              {available.map((order) => (
                <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {order.type === "food" ? "🍔 Food" : "📦 Package"}
                      </span>
                      <p className="font-semibold mt-1">{order.id.slice(0, 8)}</p>
                    </div>
                    <span className="font-bold text-green-600">
                      TSh {Number(order.total_amount).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">From:</span> {order.from_address}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">To:</span> {order.to_address}
                  </p>
                  <button
                    onClick={() => acceptOrder(order.id)}
                    className="w-full bg-orange-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-orange-600 transition"
                  >
                    Accept Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
