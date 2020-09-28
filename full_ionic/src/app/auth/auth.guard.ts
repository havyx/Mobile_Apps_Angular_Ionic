import { Injectable } from "@angular/core";
import { CanLoad, UrlTree, Route, UrlSegment, Router } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    if (!this.authService.userIsAuth) {
      this.router.navigateByUrl("/auth");
    }
    return this.authService.userIsAuth;
  }
}
