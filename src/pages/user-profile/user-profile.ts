import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html'
})
export class UserProfilePage {
	
   user : any = {'name':null,'picture':null,'karma_points':null,'rank':null};	

  constructor(public navCtrl: NavController, public navParams: NavParams) {
	  
	  this.user.name = navParams.get('name');
	  this.user.picture = navParams.get('picture');
	  this.user.karma_points = navParams.get('karma_points');
	  this.user.rank = navParams.get('rank');
	  
  }

}
