const express = require("express");
const cors = require("cors");
const res = require("express/lib/response");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) return response.status(400).json({ error: "User not found." });

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists)
    return response.status(400).json({ error: "User already exists!" });

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    deadline,
    done: false,
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoExists = user.todos.some((todo) => todo.id === id);

  if (!todoExists)
    return response.status(404).json({ error: "Todo not found!" });

  const updatedTodos = user.todos.map((todo) => {
    if (todo.id === id) return { ...todo, title, deadline };

    return todo;
  });

  user.todos = updatedTodos;

  const updatedTodo = user.todos.find((todo) => todo.id === id);

  response.status(200).json(updatedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.some((todo) => todo.id === id);

  if (!todoExists)
    return response.status(404).json({ error: "Todo not found!" });

  const updatedTodos = user.todos.map((todo) => {
    if (todo.id === id) return { ...todo, done: true };

    return todo;
  });

  user.todos = updatedTodos;

  const updatedTodo = user.todos.find((todo) => todo.id === id);

  response.status(200).json(updatedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.some((todo) => todo.id === id);

  if (!todoExists)
    return response.status(404).json({ error: "Todo not found!" });

  const currentTodo = user.todos.find((todo) => todo.id === id);

  user.todos.splice(currentTodo, 1);

  return response.status(204).send();
});

module.exports = app;
