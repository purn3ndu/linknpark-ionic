import { Component } from '@angular/core';
import { Facebook, NativeStorage } from 'ionic-native';
import { NavController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { Http, Headers, RequestOptions } from '@angular/http';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  FB_APP_ID: number = 107034156386647;
 

  constructor(public navCtrl: NavController,private http : Http) {
    Facebook.browserInit(this.FB_APP_ID, "v2.8");
  }

  doFbLogin(){
   
    let permissions = new Array<string>();
    let nav = this.navCtrl;
    //the permissions your facebook app needs from the user
    permissions = ["public_profile","email"];

    Facebook.login(permissions)
    .then((response) => {
      let userId = response.authResponse.userID;
      let params = new Array<string>();

      //Getting name and gender properties
      Facebook.api("/me?fields=name,gender,email", params)
      .then((user) => {
        user.picture = "https://graph.facebook.com/" + userId + "/picture?type=large";
        //now we have the users info, let's save it in the NativeStorage
		console.log("User is"+user.email);
		//this.checkMember(user);
        console.log("Working here");
        NativeStorage.setItem('user',
        {
          name: user.name,
          gender: user.gender,
          picture: user.picture
        })
        .then(function(){
          nav.setRoot(TabsPage);
        }, function (error) {
          console.log(error);
        })


      });
    }).catch((error) => {
      console.log("check1"+error);
    });
  }
  
  checkMember(user : any)
  {
    let nav = this.navCtrl;
	let url = 'http://citysavior.pythonanywhere.com/posts/api/member/'+user.email+'/';
	this.http.get(url).subscribe( result => {
	 console.log(result.status);
	 if(result.status == 200)
	  {
	   let data = result.json();
	   NativeStorage.setItem('user',
        {
          name: data.name,
          gender: user.gender,
          picture: user.picture,
		  email : user.email
        })
        .then(() => {
		  nav.setRoot(TabsPage);
        }).catch((error) => {
		  console.log(error);
        });
	  }
	}, error => {
	  
	  let url = 'http://citysavior.pythonanywhere.com/posts/api/member/';
      let body = JSON.stringify({'email': user.email,'name':user.name});
	  let headers = new Headers({'Content-Type': 'application/json'});
	  let options = new RequestOptions({ headers:headers});
	  this.http.post(url,body,options).subscribe( res => {
	  console.log(res.status);
	   if(res.status == 201)
	   {
	     NativeStorage.setItem('user',
        {
          name: user.name,
          gender: user.gender,
          picture: user.picture,
		  email : user.email
        })
        .then(() => {
		  nav.setRoot(TabsPage);
        }).catch((error) => {
		  console.log(error);
        });
	   }
	   }, err => {
	    console.log('Sign up Error occured');
		console.log(JSON.stringify(err.json()));
	   });
	});
  }

}
