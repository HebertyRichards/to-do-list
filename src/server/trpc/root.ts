import "server-only";
import { router } from "./init";
import { authRouter } from "./routers/auth";
import { tasksRouter } from "./routers/tasks";
import { subtasksRouter } from "./routers/subtasks";
import { commentsRouter } from "./routers/comments";
import { categoriesRouter } from "./routers/categories";
import { groupsRouter } from "./routers/groups";
import { habitsRouter } from "./routers/habits";
import { notificationsRouter } from "./routers/notifications";
import { usersRouter } from "./routers/users";

export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  tasks: tasksRouter,
  subtasks: subtasksRouter,
  comments: commentsRouter,
  categories: categoriesRouter,
  groups: groupsRouter,
  habits: habitsRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
