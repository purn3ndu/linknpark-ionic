import { Component } from '@angular/core';

import { AlertController, NavController, App  } from 'ionic-angular';

import { SupportPage } from '../support/support';


import { Facebook, NativeStorage } from 'ionic-native';
import { LoginPage } from '../login/login';


@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage {

  user: any;
  userReady: boolean = false;

  constructor(public alertCtrl: AlertController, public nav: NavController, private app: App) {

  }

  updatePicture() {
    console.log('Clicked to update picture');
  }

  updatePhone() {
    console.log('Clicked to update Phone number');
  }

  changeUsername() {
    console.log('Clicked to change username');
  }

  changePassword() {
    console.log('Clicked to change password');
  }




  support() {
    this.nav.push(SupportPage);
  }

  ionViewCanEnter(){
    let env = this;
    NativeStorage.getItem('user')
    .then(function (data){
      env.user = {
        name: data.name,
        gender: data.gender,
        picture: data.picture,
		email: data.email
      };
        env.userReady = true;
        console.log('Works'+env.user.name+' Email= '+env.user.email);
    }, function(error){
      console.log(error);
      console.log('Error');
    });
  }

  doFbLogout(){
    var nav = this.nav;
    Facebook.logout()
    .then(function(response) {
      //user logged out so we will remove him from the NativeStorage
      NativeStorage.remove('user');
      //nav.push(LoginPage);
      nav.setRoot(LoginPage, {}, {animate: true, direction: 'forward'});
      //this.app.getRootNav().setRoot(LoginPage, {}, {animate: true, direction: 'forward'});
    }, function(error){
      console.log(error);
    });
  }

}
