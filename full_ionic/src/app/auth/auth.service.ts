import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor() {}

  private _userIsAuthenticated = true;
  private _userId = "abcd";

  get userIsAuth() {
    return this._userIsAuthenticated;
  }

  get userId() {
    return this._userId;
  }

  login() {
    this._userIsAuthenticated = true;
  }
  logout() {
    this._userIsAuthenticated = false;
  }
}
