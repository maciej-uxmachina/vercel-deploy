"use client";

import { useState } from "react";
import type { Todo } from "./page";

export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [text, setText] = useState("");

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const todo = await res.json();
    setTodos([todo, ...todos]);
    setText("");
  }

  async function toggleTodo(todo: Todo) {
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !todo.done }),
    });
    const updated = await res.json();
    setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
  }

  async function deleteTodo(id: number) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <>
      <h1>Todos</h1>
      <form onSubmit={addTodo} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs doing?"
          style={{ flex: 1, padding: "8px 12px", fontSize: 16, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "8px 16px", fontSize: 16, borderRadius: 6, cursor: "pointer" }}>
          Add
        </button>
      </form>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #eee" }}
          >
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo)}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            <span style={{ flex: 1, textDecoration: todo.done ? "line-through" : "none", color: todo.done ? "#aaa" : "inherit" }}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#e00", fontSize: 18 }}
              aria-label="delete"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      {todos.length === 0 && <p style={{ color: "#aaa" }}>No todos yet.</p>}
    </>
  );
}
