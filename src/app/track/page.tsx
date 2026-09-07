"use client";

import Link from "next/link";
import { useState } from "react";

export default function TrackPage() {
  const [orderId, setOrderId] = useState("ORD-101");
  const [status] = useState("On the way");

  // Mock driver location progress (0-100)
  const progress = 65;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
        {/* Order Info */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-bold text-lg">{orderId}</p>
            </div>
            <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full">
              {status}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">From:</span> Pizza Hut - Msasani
            </p>
            <p>
              <span className="text-gray-500">To:</span> Mikocheni B
            </p>
            <p>
              <span className="text-gray-500">Driver:</span> John M. • +255 712 345 678
            </p>
          </div>
        </div>

        {/* Simple Map Placeholder */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-5">
          <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 relative flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="font-semibold text-gray-700">Live Map</p>
              <p className="text-sm text-gray-500">Driver is 2.4 km away</p>
            </div>

            {/* Fake route line */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Picked up</span>
                <span>On the way</span>
                <span>Delivered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Steps */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold mb-4">Order Status</h3>
          <div className="space-y-4">
            {[
              { label: "Order Placed", done: true, time: "18:42" },
              { label: "Driver Accepted", done: true, time: "18:45" },
              { label: "Picked Up", done: true, time: "18:58" },
              { label: "On the Way", done: true, time: "19:05" },
              { label: "Delivered", done: false, time: "" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.done
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.done ? "✓" : i + 1}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      step.done ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {step.time && (
                  <span className="text-xs text-gray-400">{step.time}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Search another order */}
        <div className="mt-6">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID to track"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </main>
    </div>
  );
}
