"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Registration failed");
    } else {
      setSuccess("User created successfully!");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        <input
          type="text"
          placeholder="Login"
          value={login}
          onChange={e => setLogin(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Register</button>
      </form>
    </div>
  );
}
