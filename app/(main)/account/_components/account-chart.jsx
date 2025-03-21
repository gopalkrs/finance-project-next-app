"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DATE_RANGES = {
  "1M": { days: 30, label: "Last Month" },
  "7D": { days: 7, label: "Last 7 days" },
  "3M": { days: 90, label: "Last 3 Months" },
  "6M": { days: 120, label: "Last 6 Months" },
};

const AccountChart = ({ transactions }) => {
  const [dateRange, setDateRange] = useState("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const dateNow = new Date();

    const startDate = range
      ? startOfDay(subDays(dateNow, range.days))
      : startOfDay(new Date(0));

    const filtered = transactions.filter(
      (transaction) =>
        new Date(transaction.date) >= startDate &&
        new Date(transaction.date) <= endOfDay(dateNow)
    );

    const grouped = filtered.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");

      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (transaction.type === "EXPENSE") {
        acc[date].expense += transaction.amount;
      } else {
        acc[date].income += transaction.amount;
      }

      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions, dateRange]);

  console.log(filteredData);

  const totalAmounts = useMemo(() => {
    return filteredData.reduce(
      (acc, data) => ({
        income: acc.income + data.income,
        expense: acc.expense + data.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row justify-between space-y-0 pb-7">
          <CardTitle className="text-base font-normal">
            Transaction Overview
          </CardTitle>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DATE_RANGES).map(([key, { label }]) => (
                <SelectItem value={key} key={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="flex justify-around mb-6 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground">Income</p>
              <p className="text-lg font-bold text-green-500">
                &#8377;{totalAmounts.income.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Expense</p>
              <p className="text-lg font-bold text-red-500">
                &#8377;{totalAmounts.expense.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Net</p>
              <p
                className={`text-lg font-bold ${
                  totalAmounts.income > totalAmounts.expense
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                &#8377;{(totalAmounts.income - totalAmounts.expense).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12} 
                  tickFormatter={(value)=>`${value}`}
                />
                <Tooltip formatter={(value)=>[`₹${value}`]} />
                <Legend />
                <Bar
                  dataKey="income"
                  name={'Income'}
                  fill="#4CAF50"
                  radius={[4,4,0,0]}
                  activeBar={<Rectangle stroke="#228B22" />}
                />
                <Bar
                  dataKey="expense"
                  radius={[4,4,0,0]}
                  name={'Expense'}
                  fill="#F44336"
                  activeBar={<Rectangle stroke="#CC5500" />}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountChart;
