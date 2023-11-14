export type UserId = string;
export enum UserType {
  ANONYMOUS = 'ANONYMOUS',
  STANDARD = 'STANDARD',
  PRE_REGISTRATION = 'PRE-REGISTRATION',
}
export type UserResult = {
  id: UserId;
  user_name: string;
  email?: string;
  status: string;
  type: UserType;
  isAllowComment?: boolean;
  custom_data?: string;
  created_at?: number;
  updated_at?: number;
  last_read?: string;
};
export interface Member {
  id: UserId;
  userName: string;
  email: string;
  type: UserType;
  isAllowComment?: boolean;
  status: string;
  lastRead?: string;
}

export function formatUserResult(info: UserResult) {
  const { id, user_name, email, status, type, isAllowComment, last_read } =
    info;
  let user: Member = {
    id: id,
    userName: user_name,
    email: email!,
    status: status,
    isAllowComment,
    type: type,
    lastRead: last_read,
  };
  return user;
}

export enum DocEvent {
  onlineStatusChanged = 'onlineStatusChanged',
}
