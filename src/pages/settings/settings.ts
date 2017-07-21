import { Component } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import { AccountPage } from '../account/account';
import { NativeStorage,SocialSharing, AppVersion, Toast } from 'ionic-native';
import {AboutPage} from '../about/about';
import { Http, Headers, RequestOptions } from '@angular/http';

var env;

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  user: any;
  isShareDisabled: boolean = false;
  packageName : string = null;
  constructor(public nav: NavController, 
  private app: App,
  private http: Http) {
   
    AppVersion.getPackageName().then((success) =>{
	 this.packageName=success.toString();
	}, error =>{
	  this.packageName= 'com.citySavior';
	});
  }
  
  ionViewCanEnter()
  {
   env = this;
   NativeStorage.getItem('user')
    .then((data) => {
      env.user = {
        name: data.name,
        picture: data.picture,
		email: data.email,
		phone : data.phone,
		karma_points : data.karma_points,
		login : data.login
      };
	}).catch((error) =>{
      
    });
  }

    account(){
      
      this.app.getRootNav().push(AccountPage, {}, {animate: true, direction: 'forward'});
    }
	
	shareLink()
	{
		this.isShareDisabled = true;
		SocialSharing.share('City Savior - Facilitating effective solutions for civic issues around you. Download it from ',null,null,'https://play.google.com/store/apps/details?id='+this.packageName).then((success)=>{
			this.isShareDisabled=false;
			
			let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
			let body = JSON.stringify({'email':this.user.email,'activity_done':'Shared application link'});
			let headers = new Headers({'Content-Type': 'application/json'});
			let options = new RequestOptions({ headers:headers});
			this.http.post(url,body,options).subscribe(result =>{
		
			}, error=>{
		
			});
			
		},error=>{
			this.isShareDisabled=false;
			
			Toast.show('Error in sharing. Please try again later','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});
			
		});
	}

  
  
  help()
  {
    this.app.getRootNav().push(AboutPage, null, {animate: true, direction: 'forward'});
  }
}  

