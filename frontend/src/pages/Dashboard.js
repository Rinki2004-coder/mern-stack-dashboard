import React, { useEffect, useState } from "react";
import API from "../services/api";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#9F00FF", "#FF4560", "#36A2EB", "#F3669A", "#40E0D0"];

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/combined-data?month=March")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!data) return <p>Loading...</p>;

  const barData = Object.entries(data.barChart).map(([range, count]) => ({
    range,
    count,
  }));

  const pieData = Object.entries(data.pieChart).map(([category, value]) => ({
    name: category,
    value,
  }));

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 Dashboard - {data.month}</h2>

      <h3>📈 Statistics</h3>
      <ul>
        <li>Total Sale Amount: ₹{data.statistics.totalSaleAmount}</li>
        <li>Total Sold Items: {data.statistics.totalSoldItems}</li>
        <li>Total Unsold Items: {data.statistics.totalUnsoldItems}</li>
      </ul>

      <h3>💵 Bar Chart (Price Ranges)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData}>
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h3>🥧 Pie Chart (Category-wise Sales)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Dashboard;
