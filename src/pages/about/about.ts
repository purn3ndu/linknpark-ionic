import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AppVersion } from 'ionic-native';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  appName : string = null;
  appVersion : string = null;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    AppVersion.getAppName().then((success)=>{
	  this.appName = success.toString();
	});
	
	AppVersion.getVersionNumber().then((success)=>{
	  this.appVersion = success.toString();
	});
  }

}
