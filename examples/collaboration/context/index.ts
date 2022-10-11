
import { Member } from "@foxitsoftware/web-collab-client";
import React from "react";
export interface PermissionContextModel {
  isDocComment:boolean;
  isPublic:boolean
  editIsPublic:Function
  editAnnotPermissionByDoc:Function
}
export const UserContext = React.createContext<Member|null>(null);

export const PermissionContext = React.createContext<PermissionContextModel|null>(null);
export const MemberContext = React.createContext<any[] | undefined>([]);