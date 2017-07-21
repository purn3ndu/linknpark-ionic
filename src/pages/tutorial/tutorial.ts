import { Component } from '@angular/core';
import { MenuController, NavController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})

export class TutorialPage {
  showSkip = true;

  constructor(
    public navCtrl: NavController,
    public menu: MenuController,
    public storage: Storage,
	public platform: Platform
  ) { }

  startApp() {
	let normalJSON = {userEnter:'normal'};
    
	this.navCtrl.setRoot(LoginPage,{params:normalJSON}).then(() => {
      this.storage.set('hasSeenTutorial', 'true');
	});

  }

  onSlideChangeStart(slider) {
    this.showSkip = !slider.isEnd;
  }

  ionViewDidEnter() {
    // the root left menu should be disabled on the tutorial page
    this.menu.enable(false);
  }

  ionViewDidLeave() {
    // enable the root left menu when leaving the tutorial page
    this.menu.enable(true);
  }
  
  
}
