"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500">
      Loading map...
    </div>
  ),
});

function TrackContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      setOrder(data);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading order...
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
            <span className="font-bold text-gray-900">Track Order</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-orange-500">
            Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-bold text-lg">
                {order ? order.id.slice(0, 8) : "No order"}
              </p>
            </div>
            <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full capitalize">
              {order?.status || "pending"}
            </span>
          </div>

          {order && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">From:</span> {order.from_address}
              </p>
              <p>
                <span className="text-gray-500">To:</span> {order.to_address}
              </p>
              <p>
                <span className="text-gray-500">Total:</span>{" "}
                TSh {Number(order.total_amount || 0).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-5 h-72">
          <Map
            driverLat={-6.7924}
            driverLng={39.2083}
            destLat={-6.78}
            destLng={39.22}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold mb-4">Order Status</h3>
          <div className="space-y-4">
            {[
              { key: "pending", label: "Order Placed" },
              { key: "accepted", label: "Driver Accepted" },
              { key: "picked", label: "Picked Up" },
              { key: "on_the_way", label: "On the Way" },
              { key: "delivered", label: "Delivered" },
            ].map((step, i) => {
              const statusOrder = ["pending", "accepted", "picked", "on_the_way", "delivered"];
              const currentIndex = statusOrder.indexOf(order?.status || "pending");
              const done = i <= currentIndex;

              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      done ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      done ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <TrackContent />
    </Suspense>
  );
}
