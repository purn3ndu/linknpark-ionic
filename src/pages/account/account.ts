import { Component } from '@angular/core';

import { AlertController, NavController, App,LoadingController  } from 'ionic-angular';

import { SupportPage } from '../support/support';
import {NotificationAreaPage} from '../notification-area/notification-area';
import {AboutPage} from '../about/about';

import { Facebook, NativeStorage, GooglePlus, Toast, SocialSharing, AppVersion } from 'ionic-native';
import { LoginPage } from '../login/login';
import { Http, Headers, RequestOptions } from '@angular/http';

@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage {

  user: any = null;
  userReady: boolean = false;
  
  phoneExist : string = 'Add Phone Number';
  
  isPhoneEdit : boolean = false;
  
  countryCode: string ;
  
  phoneNumber:string = null;
  
  userName : string ;
  
  isUsernameEdit: boolean = false;
  
  
  isShareDisabled: boolean = false;
  packageName : string = null;
  
  constructor(public alertCtrl: AlertController, 
  public nav: NavController, private app: App,
  private http: Http,
  public loadingCtrl: LoadingController) {
	  
	  this.countryCode = '';
	  AppVersion.getPackageName().then((success) =>{
	 this.packageName=success.toString();
	}, error =>{
	  this.packageName= 'com.citySavior';
	});
  }

  
  httpUpdateMember(name: string , phone: string)
  {
	// url changed - patch request to MemberDetail for updating name or phone number  
    let url ='https://citysavior.pythonanywhere.com/posts/api/member/'+this.user.email+'/';
	let body = null;
	if(phone!=null)
	{
		body = JSON.stringify({'phone_number':phone});
	}else
	{
		body = JSON.stringify({'name':name});
	}		
	let headers = new Headers({'Content-Type': 'application/json'});
	let options = new RequestOptions({ headers:headers});
	this.http.patch(url,body,options).subscribe( result =>{
	 
	 if(result.status == 200)
	 {
	 
	   if(phone!=null)
	   {
		this.user.phone = result.json().phone_number;
		this.phoneExist='Update Phone Number';
		this.isPhoneEdit = false;
		this.phoneNumber = null;	
		this.countryCode='';
	   }
	   if(name!=null)
	   {
		this.user.name = result.json().name;
		this.isUsernameEdit = false;
	   }
		url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
		body = JSON.stringify({'email':this.user.email,'activity_done':'Updated Profile details'});
		
			this.http.post(url,body,options).subscribe(result =>{
	
		}, error=>{
	
		});
	   
		 NativeStorage.setItem('user',
		  {
          name: this.user.name,
          picture: this.user.picture,
		  email : this.user.email,
		  phone : this.user.phone,
		  karma_points : this.user.karma_points,
		  login : this.user.login  
        }).then(()=> { 
        }).catch((error) => {
		 
        });
	 }
	}, error=>{
		
			url='https://citysavior.pythonanywhere.com/posts/api/member/'
			this.http.get(url).subscribe( result =>{
				Toast.show('Cannot connect to server. Please try again later','3000','center').subscribe(toast=>{
						
				}, error=>{
				
				});
				
			}, error=>{
				Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
				}, error=>{
				
				});
				
			});
	});
  }


  support() {
	this.app.getRootNav().push(SupportPage, {animate: true, direction: 'forward'});
  }

  ionViewWillEnter(){
    let env = this;
    NativeStorage.getItem('user')
    .then((data) =>{
      env.user = {
        name: data.name,
        picture: data.picture,
		email: data.email,
		phone : data.phone,
		karma_points : data.karma_points,
		login : data.login
      };
		
        this.userName = this.user.name;
		if(env.user.phone != null)
		{
		  this.phoneExist='Update Phone Number';
		}
		env.userReady = true;
       
    }).catch((error) =>{
      
    });
  }

  doLogout(){
	let loading =  this.loadingCtrl.create({
      content : 'Logging out'
	 });
	loading.present(); 
	//url changed - patch request to MemberDetail to update karma points
	let url ='https://citysavior.pythonanywhere.com/posts/api/member/'+this.user.email+'/';
	let body = JSON.stringify({'karma_points':this.user.karma_points});
	let headers = new Headers({'Content-Type': 'application/json'});
	let options = new RequestOptions({ headers:headers});
	
	this.http.patch(url,body,options).subscribe(result=>{
	  if(this.user.login == 'Facebook')
		{
			Facebook.logout()
			.then((response) => {
			//user logged out so we will remove him from the NativeStorage
				NativeStorage.remove('user');
				
				loading.dismiss();
				let normalJSON = {userEnter:'normal'};
				
				this.app.getRootNav().setRoot(LoginPage,{params:normalJSON}, {animate: true, direction: 'forward'});
				
			},(error)=>{
		
				loading.dismiss();
				Toast.show('Cannot connect to the Server. Please try again later','3000','center').subscribe(toast=>{
						
				}, error=>{
				
				});
			});
		}
		else
		{	
			GooglePlus.logout().then(() => {
				NativeStorage.remove('user');
				loading.dismiss();
				let normalJSON = {userEnter:'normal'};
				
				this.app.getRootNav().setRoot(LoginPage,{params:normalJSON}, {animate: true, direction: 'forward'});
		
			}, (error)=>{
		
				loading.dismiss();
				Toast.show('Cannot connect to the Server. Please try again later','3000','center').subscribe(toast=>{
						
				}, error=>{
				
				});
			});
		}
	},error=>{
		loading.dismiss();
		
		Toast.show('Cannot connect to the Server. Please try again later','3000','center').subscribe(toast=>{
						
		}, error=>{
				
		});
	});
	
 }
 
 setNotificationArea()
 {
	this.app.getRootNav().push(NotificationAreaPage, {animate: true, direction: 'forward'});
 }
 
 addPhoneNumber()
 {
	
	if(this.user.phone !=null && this.user.phone.length !=0)
	{
		if(this.user.phone.substr(1,1) == '9')
		{
			this.countryCode = '+91';
			this.phoneNumber = this.user.phone.substr(3);
		}
		else
		{
			this.countryCode = '+1';
			this.phoneNumber = this.user.phone.substr(2);
		}
		
		
	}
			
	this.isPhoneEdit = true;
 }
 
 changeUsername()
 {
	 this.userName = this.user.name;
	 this.isUsernameEdit = true;
	 
 }
 
 cancelEditPhone()
 {
	this.isPhoneEdit = false;
	this.phoneNumber = null;
	this.countryCode='';
 }
 
 cancelEditUsername()
 {
	 this.isUsernameEdit = false;
	 this.userName = this.user.name;
 }
 
 updatePhoneNumber()
 {
	
	let phone : string = this.phoneNumber+'';
	if(this.countryCode != '')
	{	
	if(phone.length == 10)
	{
		
		phone = this.countryCode + phone;
		if(phone != this.user.phone)
		{
			this.httpUpdateMember(null,phone);
		}
		else
		{
			Toast.show('No changes made','3000','center').subscribe(toast=>{
						
			}, error=>{
				
			});
			
		}
	}
	else
	{
		Toast.show('You entered an incorrect number','3000','center').subscribe(toast=>{
						
		}, error=>{
				
		});
		
	}
	}else
	{
		Toast.show('Please select a country','3000','center').subscribe(toast=>{
						
		}, error=>{
				
		});
	}
	
 }
 
 
 updateUsername()
 {
	if(this.userName.length != 0)
	   {
	    if(this.userName != this.user.name)
	    {
	      this.httpUpdateMember(this.userName,null);
	    }
	    else 
	    {
	     
		 Toast.show('No changes made.','3000','center').subscribe(toast=>{
						
		}, error=>{
				
		});
		
	    }
	  }
	  else{
	   
	   Toast.show('UserName cannot be blank.','3000','center').subscribe(toast=>{
						
		}, error=>{
				
		});
		} 
 }
 
 //code to share app's link 
 
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

 // opening About and Help page	
 help()
  {
    this.app.getRootNav().push(AboutPage, null, {animate: true, direction: 'forward'});
  }

}
