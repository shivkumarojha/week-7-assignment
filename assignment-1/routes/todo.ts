import express from 'express'
import { authenticateJwt, SECRET } from "../middleware/index"
import { Todo } from "../db"
const router = express.Router();

interface CreateTodoInterface {
  title: string | undefined
  description: string | undefined
  done: boolean | undefined
  userId: string | undefined
}

import {Request, Response, NextFunction} from "express"
router.post('/todos', authenticateJwt, (req: Request, res: Response) => {
  const { title, description } = req.body;
  const done: boolean = false;
  const userId: string = req.headers.userId as string;

  const newTodo = new Todo<CreateTodoInterface>({ title, description, done, userId });

  newTodo.save()
    .then((savedTodo) => {
      res.status(201).json(savedTodo);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Failed to create a new todo' });
    });
});


router.get('/todos', authenticateJwt, (req: Request, res:Response) => {
  const userId = req.headers.userId;

  Todo.find({ userId })
    .then((todos) => {
      res.json(todos);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Failed to retrieve todos' });
    });
});

router.patch('/todos/:todoId/done', authenticateJwt, (req:Request, res: Response) => {
  const { todoId } = req.params;
  const userId = req.headers.userId;

  Todo.findOneAndUpdate({ _id: todoId, userId }, { done: true }, { new: true })
    .then((updatedTodo) => {
      if (!updatedTodo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      res.json(updatedTodo);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Failed to update todo' });
    });
});

export default router;