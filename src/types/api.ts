export interface User {
  email: string;
  username: string;
  avatar_url: string | null;
  onboarded: boolean;
}

export type TaskStatus = "pending" | "in_progress" | "done" | "archived";

export interface Tag {
  name: string;
  color: string | null;
}

export interface Task {
  slug: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  start_date: string;
  due_date: string;
  category_slug: string;
  assignee_username: string | null;
  tags: Tag[];
}

export interface Category {
  slug: string;
  name: string;
  color: string | null;
}

export type GroupRole = "admin" | "member";

export interface Group {
  slug: string;
  name: string;
  description: string | null;
  member_count: number;
}

export interface GroupCreated {
  slug: string;
  name: string;
  description: string | null;
  key: string;
}

export interface GroupMember {
  username: string;
  role: GroupRole;
  joined_at: string;
}

export type JoinRequestStatus = "pending" | "accepted" | "rejected" | "expired";

export interface JoinRequest {
  slug: string;
  username: string;
  status: JoinRequestStatus;
  expires_at: string;
  created_at: string;
}

export type NotificationType =
  | "join_request_created"
  | "join_request_accepted"
  | "join_request_rejected"
  | "task_assigned"
  | "subtask_assigned"
  | "member_removed"
  | "group_deleted";

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface SessionInfo {
  user: User;
  session_expires_at: string;
  access_expires_at: string;
}

export interface ForgotPasswordResponse {
  message: string;
  reset_token: string | null;
}

export interface Subtask {
  slug: string;
  task_slug: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  start_date: string;
  due_date: string;
  assignee_username: string | null;
}
