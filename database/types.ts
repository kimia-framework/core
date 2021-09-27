
export enum UserStatus {
   ACTIVE = 1,
   DISABLE_WRONG_PASS = 2,
   SUSPEND = 3,
   NEED_VERIFIED = 4,
}

export enum UserSystemAccessLevel {
   NO_ACCESS = 0,
   ADMIN_ACCESS = 1,

   FULL_ACCESS = 1000,
}

export type CoreModelName = 'CoreUser' | 'CoreFile' | 'CoreLog' | 'CoreSession';