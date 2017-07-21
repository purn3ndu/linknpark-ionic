import { Component } from '@angular/core';
import { NativeStorage, Toast } from 'ionic-native';
import { Http, Headers, RequestOptions} from '@angular/http';
import { NavController,App } from 'ionic-angular';

import {UserProfilePage} from '../user-profile/user-profile';
import {AccountPage} from '../account/account';

@Component({
  selector: 'page-rank',
  templateUrl: 'rank.html'
})
export class RankPage {
   user :any;
   userReady : boolean = false;
   members : any = [];
   firstMember : any= {'rank':null,'name':null,'karma_points':null,'picture':null};
   secondMember :any={'rank':null,'name':null,'karma_points':null,'picture':null};
   thirdMember : any={'rank':null,'name':null,'karma_points':null,'picture':null};
   userRank : any;
   userKarma : any;
   isUserRank : boolean = false;
   isLeaderboard : boolean = false;
   isUserPresent : boolean = false;
   userPicture : string = null;
   spinnerHidden :boolean = false;
   
  constructor(public navCtrl: NavController,
  private http: Http,
  private app: App) {

	
  }
  
  
  ionViewWillEnter()
  {
   let env = this;
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
	
	  this.userKarma = this.user.karma_points;
	  this.userPicture = this.user.picture;
	   
	  this.getLeaderboard();
	  
	}).catch((error) =>{
    
      Toast.show('Error in loading leaderboard. Please try again later','3000','center').subscribe(toast=>{
						
		}, error=>{
						
		});
    });
	
  }
  
  getLeaderboard()
  {
	this.spinnerHidden = false;
	this.isUserRank =false;
	this.isLeaderboard = false;
	this.isUserPresent=false;
	let url ='https://citysavior.pythonanywhere.com/posts/api/updateKarma/';
	let body = JSON.stringify({'email':this.user.email,'karma_points':this.user.karma_points});
	let headers = new Headers({'Content-Type': 'application/json'});
	let options = new RequestOptions({ headers:headers});
	
	this.http.post(url,body,options).subscribe(result =>{
		
		url = 'https://citysavior.pythonanywhere.com/posts/api/getMyRank/';
		body = JSON.stringify({'karma_points':this.user.karma_points});
		this.http.post(url,body,options).subscribe(result =>{
		
		  this.userRank = result.json().rank + 1;
		  this.isUserRank = true;
		  if(this.userPicture.trim().length == 0 )
		  {
			this.userPicture = 'assets/img/leaderboard_img.jpg';
		  }
		  
		  if(this.isUserRank && this.isLeaderboard)
			{
				let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
				let body = JSON.stringify({'email':this.user.email,'activity_done':'Viewed Leaderboard'});
		
				this.http.post(url,body,options).subscribe(result =>{
		
				}, error=>{
					
				});
			  this.userReady = true;
			  this.spinnerHidden = true;
			  
			}
		},error=>{
			let url='https://citysavior.pythonanywhere.com/posts/api/member/';
			this.http.get(url).subscribe( result =>{
				
				this.spinnerHidden = true;
				
				Toast.show('Cannot connect to the server. Please try agin later','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});
			}, error =>{
				
				this.spinnerHidden = true;
				
				Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});
				
			});
			
		});
		
		url ='https://citysavior.pythonanywhere.com/posts/api/getLeaderBoard/';
		this.http.get(url).subscribe(result=>{
		
		let memberData = result.json();
		let memberRank=1;
		for(var i=0;i<memberData.length;i++)
			{
				if(i>0)
				{
				  if(memberData[i].fields.karma_points != memberData[i-1].fields.karma_points)
					{
					  memberRank = i+1;
					}
				}
				let memberItem = {'rank':memberRank,'name':memberData[i].fields.name,'karma_points':memberData[i].fields.karma_points,'picture':memberData[i].fields.profile_picture};
				if(memberItem.picture.trim().length == 0)
				{
				  memberItem.picture='assets/img/leaderboard_img.jpg';
				}
				if(memberData[i].pk == this.user.email)
				{
				  memberItem.name = 'Me';
				  this.isUserPresent = true;	
				}
				if(i <= 2)
				{
				 switch(i){
				  case 0: this.firstMember = memberItem;
							break;
				  case 1: this.secondMember = memberItem;
							break;
				  case 2: this.thirdMember = memberItem;
							break;				
				 }
				 
				}
				else{
				this.members[i-3]= memberItem;
				}
			}
		this.isLeaderboard = true;
		if(this.isUserRank && this.isLeaderboard)
			{
				let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
				body = JSON.stringify({'email':this.user.email,'activity_done':'Viewed Leaderboard'});
		
				this.http.post(url,body,options).subscribe(result =>{
					
				}, error=>{
					
				});
				this.userReady = true;
				this.spinnerHidden = true;
				
			}
		
	}, error=>{
		let url='https://citysavior.pythonanywhere.com/posts/api/member/';
			this.http.get(url).subscribe( result =>{
				
				this.spinnerHidden = true;
				Toast.show('Cannot connect to the server. Please try agin later','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});
				
			}, error =>{
				
				this.spinnerHidden  = true;
				
				Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});
			});
	});
	
	}, error =>{
	  let url='https://citysavior.pythonanywhere.com/posts/api/member/';
	  this.http.get(url).subscribe( result =>{
			
				this.spinnerHidden = true;
				
				Toast.show('Cannot connect to the server. Please try agin later','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});
				
			}, error =>{
			
				this.spinnerHidden = true;
				Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});
				
			});
	
	});
	
	
  }
  
  //function to open clicked user's profile page
  showUserProfile(member: any , showUser : boolean)
  {
	if(showUser)
	{
		if(member.name !='Me')
		{
			this.app.getRootNav().push(UserProfilePage, {name:member.name,picture:member.picture,karma_points:member.karma_points,rank:member.rank}, {animate: true, direction: 'forward'});
		}else
		{
			this.app.getRootNav().push(AccountPage,{animate: true, direction: 'forward'});  
		}
	}else
	{
		this.app.getRootNav().push(AccountPage,{animate: true, direction: 'forward'});  
	}		
  }

}
