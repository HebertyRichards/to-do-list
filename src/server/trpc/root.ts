import "server-only";
import { router } from "./init";
import { authRouter } from "./routers/auth";
import { tasksRouter } from "./routers/tasks";
import { categoriesRouter } from "./routers/categories";
import { groupsRouter } from "./routers/groups";
import { notificationsRouter } from "./routers/notifications";

export const appRouter = router({
  auth: authRouter,
  tasks: tasksRouter,
  categories: categoriesRouter,
  groups: groupsRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
