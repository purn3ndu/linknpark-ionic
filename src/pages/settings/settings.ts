import { Component } from '@angular/core';

import { NavController, App } from 'ionic-angular';

import { AccountPage } from '../account/account';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  constructor(public nav: NavController, private app: App) { }

    account(){
      //this.nav.push(AccountPage);
      this.app.getRootNav().setRoot(this);
      //this.nav.push(AccountPage, {}, {animate: true, direction: 'forward'});
      this.app.getRootNav().push(AccountPage, {}, {animate: true, direction: 'forward'});
    }

}
