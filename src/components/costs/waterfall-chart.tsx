"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format";

type WaterfallDatum = {
  label: string;
  offset: number;
  value: number;
  isTotal?: boolean;
};

export function WaterfallChart({
  ticketAmount,
  flightAmount,
  hotelAmount,
  localTransportAmount,
  totalAmount,
}: {
  ticketAmount: number;
  flightAmount: number;
  hotelAmount: number;
  localTransportAmount: number;
  totalAmount: number;
}) {
  const steps = [
    { label: "Ticket", value: ticketAmount },
    { label: "Flight", value: flightAmount },
    { label: "Hotel", value: hotelAmount },
    { label: "Local", value: localTransportAmount },
  ];

  let runningTotal = 0;
  const data: WaterfallDatum[] = steps.map((step) => {
    const entry = {
      label: step.label,
      offset: runningTotal,
      value: step.value,
    };

    runningTotal += step.value;
    return entry;
  });

  data.push({
    label: "Total",
    offset: 0,
    value: totalAmount,
    isTotal: true,
  });

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip
            formatter={(value) =>
              formatCurrency(typeof value === "number" ? value : Number(value ?? 0))
            }
            cursor={{ fill: "rgba(75, 63, 114, 0.08)" }}
          />
          <Bar
            dataKey="offset"
            stackId="trip"
            fill="transparent"
            isAnimationActive={false}
          />
          <Bar
            dataKey="value"
            stackId="trip"
            radius={[10, 10, 0, 0]}
            fill="var(--color-secondary-container, #4b3f72)"
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
