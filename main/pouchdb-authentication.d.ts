/// <reference types="pouchdb-core" />
/* tslint:disable:no-single-declare-module */

declare namespace PouchDB {
  namespace Authentication {
    interface AuthResponse {
      ok: boolean,
      id: string,
      rev: string
    }

    interface SignupError {
      name: "conflict" | "forbidden"
    }

    interface SignupOptions {
      metadata: any
    }

    interface LoginResponse {
      ok: boolean,
      name: string,
      roles: string[]
    }

    interface LoginError {
      name: "unauthorized"
    }

    interface LogoutResponse {
      ok: boolean
    }

    interface GetSessionResponse {
      info: {
        authenticated: string,
        authenticated_db: string,
        authenticated_handlers: string[]
      },
      ok: boolean,
      userCtx: any
    }

    interface GetUserResponse {
      _id: string,
      _rev: string,
      derived_key: string,
      iterations: number,
      name: string,
      password_scheme: string,
      roles: string[],
      salt: string,
      type: string
    }

    interface ChangePasswordError {
      name: "not_found"
    }
  }

  interface Database<Content extends {}> {
    signup(user: string, pass: string,
           callback?: Core.Callback<Authentication.SignupError, Authentication.AuthResponse>): void;
    signup(user: string, pass: string, options: Authentication.SignupOptions,
           callback?: Core.Callback<Authentication.SignupError, Authentication.AuthResponse>): void;
    signup(user: string, pass: string): Promise<Authentication.AuthResponse>;

    login(user: string, pass: string,
          callback?: Core.Callback<Authentication.LoginError, Authentication.LoginResponse>): void;
    login(user: string, pass: string): Promise<Authentication.LoginResponse>;

    logout(callback?: Core.Callback<any, Authentication.LogoutResponse>): void;
    logout(): Promise<Authentication.LogoutResponse>;

    getSession(callback?: Core.Callback<any, Authentication.GetSessionResponse>): void;
    getSession(): Promise<Authentication.GetSessionResponse>;

    getUser(user: string, callback?: Core.Callback<any, Authentication.GetUserResponse>): void;
    getUser(user: string): Promise<Authentication.GetUserResponse>;

    putUser(user: string, opts: any, callback?: Core.Callback<any, any>): void;
    putUser(user: string, opts: any): Promise<any>;

    changePassword(user: string, pass: string,
                   callback?: Core.Callback<Authentication.ChangePasswordError, Authentication.AuthResponse>): void
    changePassword(user: string, pass: string): Promise<Authentication.AuthResponse>;

    changeUsername(oldName: string, newName: string,
                   callback?: Core.Callback<Authentication.ChangePasswordError, any>): void;
    changeUsername(oldName: string, newName: string): Promise<any>;
  }
}

declare module 'pouchdb-authentication' {
  const plugin: PouchDB.Plugin;
  export = plugin;
}
