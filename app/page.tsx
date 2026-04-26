import { sql, ensureTable } from "@/lib/db";
import TodoList from "./TodoList";

export const dynamic = "force-dynamic";

export default async function Page() {
  await ensureTable();
  const { rows } = await sql`SELECT * FROM todos ORDER BY created_at DESC`;
  return <TodoList initialTodos={rows as Todo[]} />;
}

export interface Todo {
  id: number;
  text: string;
  done: boolean;
  created_at: string;
}
