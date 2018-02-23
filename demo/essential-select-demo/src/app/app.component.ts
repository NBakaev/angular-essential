import {Component, ViewContainerRef} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';

  // useBootstrap = false;
  useBootstrap = true;

  openNavbar = false;

  constructor(public router: Router) {
  }

  private viewContainerRef: ViewContainerRef;

}
