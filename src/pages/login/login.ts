import { Component } from '@angular/core';
import { Facebook, NativeStorage,GooglePlus, Toast } from 'ionic-native';
import { NavController,NavParams,LoadingController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';

import { Http, Headers, RequestOptions } from '@angular/http';



@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  FB_APP_ID: number = 107034156386647;
  isHidden : boolean ;
  loading : any;
  userParams : any;  
  locationStats : boolean;
  
  constructor(public navCtrl: NavController,
  private http : Http,
  public loadingCtrl: LoadingController,
  public navParams: NavParams) {
    Facebook.browserInit(this.FB_APP_ID, "v2.8");
	this.isHidden = false;
	this.userParams = navParams.get("params"); 
	
	
	
	
  }

  doFbLogin(){
  
    let permissions = new Array<string>();
    
    //the permissions your facebook app needs from the user
    permissions = ["public_profile","email"];

    Facebook.login(permissions)
    .then((response) => {
      this.isHidden = true;
	  let userId = response.authResponse.userID;
      let params = new Array<string>();

      //Getting name and gender properties
      Facebook.api("/me?fields=name,gender,email", params)
      .then((user) => {
        user.picture = "https://graph.facebook.com/" + userId + "/picture?type=large";
		
		this.checkMember(user,'Facebook');
        
      });
    }).catch((error) => {
      
	  this.isHidden = false;
	  	  
    });
	
  }
  
  checkMember(user : any, loginFrom : string)
  {
    
    let nav = this.navCtrl;
	
	let url = 'https://linknpark.pythonanywhere.com/posts/api/member/'+user.email+'/';
	this.http.get(url).subscribe( result => {
	
	 if(result.status == 200)
	  {
	   let data = result.json();
	
	    
		 this.httpUpdateMember(user.picture,data,loginFrom);
	
	 } 
	}, error => {
	  
	  
	  let url = 'https://linknpark.pythonanywhere.com/posts/api/member/'
	  this.http.get(url).subscribe( result =>{
		  
		  //member doesn't exist, create a new member
		let url = 'https://linknpark.pythonanywhere.com/posts/api/member/';
		let body = JSON.stringify({'email': user.email,'name':user.name,'profile_picture':user.picture});
		let headers = new Headers({'Content-Type': 'application/json'});
		let options = new RequestOptions({ headers:headers});
		this.http.post(url,body,options).subscribe( res => {
		
			if(res.status == 201)
			{
				NativeStorage.setItem('user',
				{
					name: user.name,
					picture: user.picture,
					email : user.email,
					phone : null,
					karma_points : 50,
					login : loginFrom
				})
				.then(() => {
					
					
		
					if(this.userParams.userEnter == 'push')
					{
						nav.setRoot(TabsPage,{params:this.userParams});
					}
					else
					{
						nav.setRoot(TabsPage);
					}
		  
		
				}).catch((error) => {
					this.isHidden = false;
		
					Toast.show('Login failed. Please try again','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});
		
				});
			}
		}, err => {
	    
			this.isHidden = false;	
			let url = 'https://linknpark.pythonanywhere.com/posts/api/member/'
			this.http.get(url).subscribe( result =>{
		
			Toast.show('Cannot connect to the server. Please try again','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
			 
			}, error=>{
		
				Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});
				
			});
		 
		});
	  },error=>{
		  
		  this.isHidden = false;	
		
		Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
	  });
	});
  }
  
  doGoogleLogin()
  {
    GooglePlus.login({
	 'webClientId':'779544737688-0ne0prma7njtqk2g4dj4g9mii126dcru.apps.googleusercontent.com'
	}).then((res)=>{
	  this.isHidden = true;
	  let user = {'name':res.displayName,'picture':res.imageUrl,'email':res.email};
	  
	  this.checkMember(user,'Google');
	},(error)=>{
		 
		 this.isHidden = false;
		 
		if(error.toString() != '12501')
		{
		let url = 'https://linknpark.pythonanywhere.com/posts/api/member/'
		this.http.get(url).subscribe( result =>{
		
		Toast.show('Login failed. Please check your email and password','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
		
		}, error=>{
			
			Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
		});
		}
	});
  }
  
  httpUpdateMember(picture: any,data:any,loginFrom:string)
  {
	
	//updated the url- using patch request to the api to update the profile_picture of the user
	let url ='https://linknpark.pythonanywhere.com/posts/api/member/'+data.email+'/';
	let body = JSON.stringify({'profile_picture':picture});
	let headers = new Headers({'Content-Type': 'application/json'});
	let options = new RequestOptions({ headers:headers});
	this.http.patch(url,body,options).subscribe( result =>{
	 
	 if(result.status == 200)
	 {
	  NativeStorage.setItem('user',
        {
          name: data.name,
          picture: picture,
		  email : data.email,
		  phone : data.phone_number,
		  karma_points : data.karma_points,
		  login : loginFrom
		  
        })
        .then(() => {
			
			
				
				if(this.userParams.userEnter == 'push')
				{
					this.navCtrl.setRoot(TabsPage,{params:this.userParams});
				}
				else
				{
					this.navCtrl.setRoot(TabsPage);
				}
		  
	
        }).catch((error) => {
	
		  this.isHidden = false;
		  
		  Toast.show('Login failed. Please try again','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
	
        });
	}
  }, error=>{
  
		this.isHidden = false;
		let url = 'https://linknpark.pythonanywhere.com/posts/api/member/'
		this.http.get(url).subscribe( result =>{
		
		Toast.show('Cannot connect to the server. Please try again later','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});

		}, error=>{
			
			Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
			 
		});
  });	
 }

}
