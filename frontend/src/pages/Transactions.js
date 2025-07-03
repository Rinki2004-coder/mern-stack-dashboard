import React, { useEffect, useState } from "react";
import API from "../services/api";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState("March");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = () => {
    API.get("/transactions", {
      params: {
        month,
        search,
        page,
        perPage,
      },
    })
      .then((res) => {
        setTransactions(res.data.data);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTransactions();
  }, [month, search, page]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📋 Transactions - {month}</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          🔽 Month:{" "}
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>

        <input
          style={{ marginLeft: "1rem", padding: "0.4rem", width: "200px" }}
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // reset to page 1 when search changes
          }}
        />
      </div>

      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price (₹)</th>
            <th>Category</th>
            <th>Sold</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>No data found</td>
            </tr>
          ) : (
            transactions.map((t) => (
              <tr key={t._id}>
                <td>{t.title}</td>
                <td>{t.price}</td>
                <td>{t.category}</td>
                <td>{t.sold ? "✅" : "❌"}</td>
                <td>{new Date(t.dateOfSale).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          ◀ Prev
        </button>
        <span style={{ margin: "0 1rem" }}>Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}

export default Transactions;
