import { useState } from "react";

type ApiResponse = {
  success: boolean;
  message: string;
  users?: any[];
  userId?: number;
};

export function DatabaseDemo() {
  const [users, setUsers] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const API_BASE = "/api/db";

  const handleInit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/init`, { method: "POST" });
      const result = (await response.json()) as ApiResponse;
      setMessage(result.message);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to initialize",
      );
    }
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setMessage("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const result = (await response.json()) as ApiResponse;
      setMessage(result.message);

      if (result.success) {
        setName("");
        setEmail("");
        await handleGetUsers();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to add user");
    }
    setLoading(false);
  };

  const handleGetUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users`);
      const result = (await response.json()) as ApiResponse;
      if (result.success && result.users) {
        setUsers(result.users);
        setMessage(`Loaded ${result.users.length} users`);
      } else {
        setMessage(result.message || "Failed to load users");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to load users",
      );
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">D1 Database Demo</h1>

      {/* Status Message */}
      {message && (
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100">
          {message}
        </div>
      )}

      {/* Initialize Database */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">
          Step 1: Initialize Database
        </h2>
        <button
          onClick={handleInit}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Initialize Database"}
        </button>
      </div>

      {/* Add User Form */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Step 2: Add a User</h2>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
              placeholder="john@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>

      {/* Get Users */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Step 3: View Users</h2>
        <button
          onClick={handleGetUsers}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 mb-4"
        >
          {loading ? "Loading..." : "Get All Users"}
        </button>

        {users.length > 0 && (
          <div className="mt-4 space-y-2">
            {users.map((user: any) => (
              <div
                key={user.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  ID: {user.id} • Created: {user.created_at}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
