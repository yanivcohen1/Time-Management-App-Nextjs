"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Flex,
  Heading,
  AlertDialog,
  Separator,
  Tabs,
  Text,
  TextField,
} from "@radix-ui/themes";

type FilterValue = "all" | "active" | "completed";

type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

const FILTERS: Array<{ value: FilterValue; label: string; description: string }> = [
  { value: "all", label: "All", description: "Every task on your list" },
  { value: "active", label: "Active", description: "Things you still need to do" },
  { value: "completed", label: "Completed", description: "Wrapped-up work" },
];

const seedTodos: TodoItem[] = [
  {
    id: "welcome",
    text: "Sketch your ideal workflow",
    completed: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "radix",
    text: "Explore Radix UI Themes components",
    completed: true,
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "ship",
    text: "Ship your next feature",
    completed: false,
    createdAt: Date.now() - 1000 * 15,
  },
];

function createTodo(text: string): TodoItem {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `todo-${Date.now()}`,
    text,
    completed: false,
    createdAt: Date.now(),
  };
}

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>(seedTodos);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [draft, setDraft] = useState("");

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const remaining = total - completed;
    return { total, completed, remaining };
  }, [todos]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    setTodos((previous) => [createTodo(trimmed), ...previous]);
    setDraft("");
  }

  function handleToggle(id: string) {
    setTodos((previous) =>
      previous.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  function handleDelete(id: string) {
    setTodos((previous) => previous.filter((todo) => todo.id !== id));
  }

  function handleClearCompleted() {
    setTodos((previous) => previous.filter((todo) => !todo.completed));
  }

  function getFilteredTodos(value: FilterValue) {
    switch (value) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }

  return (
    <Container size="3" py={{ initial: "5", sm: "7" }}>
      <Flex direction="column" gap="6">
        <Card size="3" variant="surface">
          <Flex
            direction={{ initial: "column", sm: "row" }}
            justify="between"
            align={{ sm: "center" }}
            gap="4"
          >
            <Flex direction="column" gap="2">
              <Heading size="6">FocusFlow</Heading>
              <Text size="3" color="gray">
                Organize your day with a clean Radix-powered workspace.
              </Text>
            </Flex>
            <Flex gap="4" align="center" wrap="wrap" justify="end">
              <Box>
                <Text size="2" weight="medium" color="gray">
                  Total
                </Text>
                <Text size="4" weight="bold">
                  {stats.total}
                </Text>
              </Box>
              <Separator orientation="vertical" size="2" />
              <Box>
                <Text size="2" weight="medium" color="gray">
                  Remaining
                </Text>
                <Text size="4" weight="bold">
                  {stats.remaining}
                </Text>
              </Box>
              <Separator orientation="vertical" size="2" />
              <Box>
                <Text size="2" weight="medium" color="gray">
                  Completed
                </Text>
                <Text size="4" weight="bold">
                  {stats.completed}
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Card>

        <Card size="3" variant="surface">
          <Flex direction="column" gap="4">
            <Tabs.Root
              value={filter}
              onValueChange={(value) => setFilter(value as FilterValue)}
            >
              <Flex direction="column" gap="3">
                <Tabs.List size="2" style={{ flexWrap: "wrap" }}>
                  {FILTERS.map((item) => (
                    <Tabs.Trigger key={item.value} value={item.value}>
                      <Flex direction="column" gap="1" align="start">
                        <Text weight="medium">{item.label}</Text>
                        <Text size="1" color="gray">
                          {item.description}
                        </Text>
                      </Flex>
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
              </Flex>

              <Box pt="3">
                {FILTERS.map((item) => (
                  <Tabs.Content key={item.value} value={item.value}>
                    <Flex direction="column" gap="3">
                      <Box asChild>
                        <form onSubmit={handleSubmit} aria-label="Add a todo">
                          <Flex
                            gap="3"
                            direction={{ initial: "column", sm: "row" }}
                            align={{ sm: "center" }}
                          >
                            <TextField.Root
                              value={draft}
                              onChange={(event) => setDraft(event.target.value)}
                              placeholder="Add a task and press enter"
                              radius="full"
                              variant="soft"
                              size="3"
                              style={{ flex: 1 }}
                            />
                            <Button type="submit" size="3">
                              Add task
                            </Button>
                          </Flex>
                        </form>
                      </Box>

                      <Separator size="4" />

                      <Flex direction="column" gap="2">
                        {getFilteredTodos(item.value).length === 0 ? (
                          <Card variant="classic">
                            <Flex direction="column" gap="2" align="center" py="5">
                              <Heading size="3">Nothing here yet</Heading>
                              <Text size="2" color="gray" align="center">
                                Add something new or switch to another view.
                              </Text>
                            </Flex>
                          </Card>
                        ) : (
                          getFilteredTodos(item.value).map((todo) => (
                            <Card key={todo.id} variant="ghost" size="2">
                              <Flex justify="between" align="center" gap="4">
                                <Flex align="center" gap="3" asChild>
                                  <label>
                                    <Checkbox
                                      checked={todo.completed}
                                      onCheckedChange={() => handleToggle(todo.id)}
                                      size="3"
                                    />
                                    <Text
                                      size="3"
                                      style={{
                                        textDecoration: todo.completed
                                          ? "line-through"
                                          : "none",
                                        opacity: todo.completed ? 0.6 : 1,
                                      }}
                                    >
                                      {todo.text}
                                    </Text>
                                  </label>
                                </Flex>
                                <Flex align="center" gap="3" wrap="wrap">
                                  <Text size="2" color="gray">
                                    {new Intl.DateTimeFormat(undefined, {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    }).format(todo.createdAt)}
                                  </Text>
                                  <AlertDialog.Root>
                                    <AlertDialog.Trigger>
                                      <Button
                                        size="2"
                                        variant="soft"
                                        color="red"
                                      >
                                        Remove
                                      </Button>
                                    </AlertDialog.Trigger>
                                    <AlertDialog.Content maxWidth="360px">
                                      <AlertDialog.Title>Remove todo?</AlertDialog.Title>
                                      <AlertDialog.Description size="2" color="gray">
                                        This action can&apos;t be undone. The item will be removed from
                                        your todo list.
                                      </AlertDialog.Description>
                                      <Flex gap="2" justify="end" mt="4">
                                        <AlertDialog.Cancel>
                                          <Button variant="soft" color="gray">
                                            Cancel
                                          </Button>
                                        </AlertDialog.Cancel>
                                        <AlertDialog.Action>
                                          <Button
                                            variant="solid"
                                            color="red"
                                            onClick={() => handleDelete(todo.id)}
                                          >
                                            Remove
                                          </Button>
                                        </AlertDialog.Action>
                                      </Flex>
                                    </AlertDialog.Content>
                                  </AlertDialog.Root>
                                </Flex>
                              </Flex>
                            </Card>
                          ))
                        )}
                      </Flex>

                      {stats.completed > 0 && (
                        <Flex justify="end">
                          <Button
                            variant="outline"
                            color="gray"
                            size="2"
                            onClick={handleClearCompleted}
                          >
                            Clear completed ({stats.completed})
                          </Button>
                        </Flex>
                      )}
                    </Flex>
                  </Tabs.Content>
                ))}
              </Box>
            </Tabs.Root>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}
