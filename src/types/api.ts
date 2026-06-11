import { z } from "zod";

export const UserSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  avatar_url: z.string().nullable(),
  timezone: z.string(),
  onboarded: z.boolean(),
});
export type User = z.infer<typeof UserSchema>;

export const TaskStatusSchema = z.enum(["pending", "in_progress", "done", "archived"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TagSchema = z.object({
  name: z.string(),
  color: z.string().nullable(),
});
export type Tag = z.infer<typeof TagSchema>;

export const TaskSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: TaskStatusSchema,
  start_date: z.string(),
  due_date: z.string(),
  created_at: z.string(),
  creator_username: z.string(),
  category_slug: z.string(),
  assignee_username: z.string().nullable(),
  assignee_avatar_url: z.string().nullable(),
  tags: z.array(TagSchema),
  subtask_done_count: z.number(),
  subtask_total_count: z.number(),
});
export type Task = z.infer<typeof TaskSchema>;

export const HabitStatusSchema = z.enum(["pending", "in_progress", "done"]);
export type HabitStatus = z.infer<typeof HabitStatusSchema>;

export const HabitSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  every_day: z.boolean(),
  days_of_week: z.array(z.number().int()),
  scheduled_today: z.boolean(),
  today_status: HabitStatusSchema.nullable(),
  created_at: z.string(),
});
export type Habit = z.infer<typeof HabitSchema>;

export const HabitStatsSchema = z.object({
  date: z.string(),
  daily_scheduled: z.number(),
  daily_done: z.number(),
  daily_percent: z.number(),
  month: z.string(),
  monthly_scheduled: z.number(),
  monthly_done: z.number(),
  monthly_percent: z.number(),
});
export type HabitStats = z.infer<typeof HabitStatsSchema>;

export const CategorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  color: z.string().nullable(),
});
export type Category = z.infer<typeof CategorySchema>;

export const GroupRoleSchema = z.enum(["admin", "member"]);
export type GroupRole = z.infer<typeof GroupRoleSchema>;

export const GroupSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  member_count: z.number(),
});
export type Group = z.infer<typeof GroupSchema>;

export const GroupCreatedSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  key: z.string(),
});
export type GroupCreated = z.infer<typeof GroupCreatedSchema>;

export const GroupMemberSchema = z.object({
  username: z.string(),
  role: GroupRoleSchema,
  joined_at: z.string(),
});
export type GroupMember = z.infer<typeof GroupMemberSchema>;

export const JoinRequestStatusSchema = z.enum(["pending", "accepted", "rejected", "expired"]);
export type JoinRequestStatus = z.infer<typeof JoinRequestStatusSchema>;

export const JoinRequestSchema = z.object({
  slug: z.string(),
  username: z.string(),
  status: JoinRequestStatusSchema,
  expires_at: z.string(),
  created_at: z.string(),
});
export type JoinRequest = z.infer<typeof JoinRequestSchema>;

export const NotificationTypeSchema = z.enum([
  "join_request_created",
  "join_request_accepted",
  "join_request_rejected",
  "task_assigned",
  "subtask_assigned",
  "member_removed",
  "group_deleted",
  "daily_reminder",
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationSchema = z.object({
  id: z.number(),
  type: NotificationTypeSchema,
  title: z.string(),
  payload: z.record(z.string(), z.unknown()),
  read_at: z.string().nullable(),
  created_at: z.string(),
});
export type Notification = z.infer<typeof NotificationSchema>;

export const NotificationPageSchema = z.object({
  items: z.array(NotificationSchema),
  next_cursor: z.number().nullable(),
});
export type NotificationPage = z.infer<typeof NotificationPageSchema>;

export const UnreadCountSchema = z.object({
  count: z.number(),
});
export type UnreadCount = z.infer<typeof UnreadCountSchema>;

export const SessionInfoSchema = z.object({
  user: UserSchema,
  session_expires_at: z.string(),
  access_expires_at: z.string(),
});
export type SessionInfo = z.infer<typeof SessionInfoSchema>;

export const ForgotPasswordResponseSchema = z.object({
  message: z.string(),
});
export type ForgotPasswordResponse = z.infer<typeof ForgotPasswordResponseSchema>;

export const SubtaskSchema = z.object({
  slug: z.string(),
  task_slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: TaskStatusSchema,
  start_date: z.string(),
  due_date: z.string(),
  created_at: z.string(),
  creator_username: z.string(),
  assignee_username: z.string().nullable(),
  assignee_avatar_url: z.string().nullable(),
});
export type Subtask = z.infer<typeof SubtaskSchema>;
