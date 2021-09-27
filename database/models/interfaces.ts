import { LogMode } from "../../types";
import { UserStatus, UserSystemAccessLevel } from "../types";

export interface CoreUserModel {
   id?: number;
   password?: string;
   email?: string;
   username: string;
   avatar?: string;
   alias?: string;
   status: UserStatus;
   sys_access?: UserSystemAccessLevel[];
   birth_year?: number;
   email_verified_at?: number;
   security_question?: string;
   security_answer?: string;
   settings?: {
      verify_code?: string;
   };
   expired_at?: number;
   created_at?: number;
   online_at?: number;
   deleted_at?: number;

   avatar_name?: string;
}

export interface CoreFileModel {
   id?: number;
   filename: string;
   original_name: string;
   path: string;
   mime_type: string;
   size: number; // bytes
   created_at?: number;
   created_by: number;
   deleted_at?: number;
}

export interface CoreLogModel {
   id?: number;
   namespace: string;
   name: string;
   uid?: number;
   ip?: string;
   var1?: string; // 255 ch
   var2?: string; // 400 ch
   mode?: LogMode;
   created_at: number;
}

export interface CoreSessionModel {
   id?: number;
   uid: number;
   ip: string;
   user_agent: string;
   token: string;
   refresh_token: string;
   expired_token_at: number;
   refresh_token_at?: number;
   checked_token_at?: number; // last check token datetime
   created_at: number;
}