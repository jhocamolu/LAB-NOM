import { Component, OnInit } from '@angular/core';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { Router } from '@angular/router';
import { AutorizacionService } from '../login/autorizacion.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(
    private _router: Router,
    private _fuseProgressBarService: FuseProgressBarService,

    private cookieService: CookieService,
    private _autorizacionService: AutorizacionService,
  ) {

    this._fuseProgressBarService.setMode('indeterminate');
  }

  ngOnInit(): void {
    this._fuseProgressBarService.show();
    this._autorizacionService.userSubject.next(null)
    // this.cookieService.deleteAll()
    this.cookieService.delete('User')
    localStorage.removeItem('Permisos')
    localStorage.removeItem('changeImagen')
    localStorage.removeItem('nombres')
    this._router.navigate(['/login']);
  }

}
