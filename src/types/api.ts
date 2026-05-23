export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarded: boolean;
}

export type TaskStatus = "pending" | "in_progress" | "done" | "archived";

export interface Tag {
  id: number;
  name: string;
  color: string | null;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  start_date: string;
  due_date: string;
  category_id: number;
  creator_user_id: number;
  owner_user_id: number | null;
  group_id: number | null;
  assignee_user_id: number | null;
  tags: Tag[];
}

export interface Category {
  id: number;
  name: string;
  color: string | null;
  owner_user_id: number | null;
  group_id: number | null;
}

export type GroupRole = "admin" | "member";

export interface Group {
  id: number;
  name: string;
  description: string | null;
  admin_user_id: number;
  member_count: number;
}

export interface GroupCreated extends Omit<Group, "member_count"> {
  key: string;
}

export interface GroupMember {
  user_id: number;
  username: string;
  role: GroupRole;
  joined_at: string;
}

export type JoinRequestStatus = "pending" | "accepted" | "rejected" | "expired";

export interface JoinRequest {
  id: number;
  group_id: number;
  user_id: number;
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
