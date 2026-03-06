import { useState, useEffect } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export function UsersExample() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // Add user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();
      if (data.success) {
        setName("");
        setEmail("");
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to add user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Prisma + PostgreSQL Example</h1>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add User"}
        </button>
      </form>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Users ({users.length})</h2>
        {users.map((user) => (
          <div
            key={user.id}
            className="p-3 bg-gray-50 dark:bg-gray-800 rounded"
          >
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {user.email}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
