"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

interface AddUserFormProps {
  initialUsers: User[];
}

export default function AddUserForm({ initialUsers }: AddUserFormProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/users", {
        name,
        email,
      });
      const newUser = res.data as User;
      setUsers((prev) => [...prev, newUser]);
      setName("");
      setEmail("");
    } catch (error) {
      console.error("Failed to add user", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Add User</button>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </form>
  );
}