import { Component,ViewChild } from '@angular/core';
import { NavController, NavParams, LoadingController, App, AlertController,Platform,Content } from 'ionic-angular';
import { NativeStorage, Screenshot, SocialSharing, AppVersion, PhotoViewer, Toast } from 'ionic-native';
import { Http, Headers, RequestOptions } from '@angular/http';
import { EditPostPage } from '../edit-post/edit-post';


var env ;

@Component({
  selector: 'page-postdetail',
  templateUrl: 'postdetail.html'
})
export class PostdetailPage {

  @ViewChild(Content) content : Content;
  user :any;
  userReady : boolean;
  postID: number = null;
  postData :any ;
  userName : string = null;
  postAddress : string =null;
  postComments :any =[];
  postImages : any =[];
  months =['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  isColor : string = 'black';
  commentsText :string = null;
  
  loading : any=null;
  isDisabled : boolean = true;
  isReportDisabled : boolean = false;
  isCommentDisabled : boolean = false;
  newCommentHidden: boolean = true;
  newCommentsText : string = null;
  isEditHidden : boolean = true;
  
  
  isShareDisabled : boolean = false;
  
  isUserNameLoaded : boolean = false;
  isUpvoteLoaded : boolean = false;
  isCommentsLoaded : boolean = false;
  isImageLoaded : boolean = false;
  isAddressLoaded : boolean = false;
 
  
  packageName : string = null;
  
  imgHeight : string = null;
  
     
  constructor(public navCtrl: NavController, 
  public navParams: NavParams,
  private http: Http,
  public loadingCtrl: LoadingController,
  private app: App,
  private alertCtrl: AlertController,
  private platform:Platform) {
   this.postID = navParams.get("postID"); 
	
  this.postData={'id':null,'title':null,'desc':null,'lat':null,'lon':null,'email':null,'category':null,'is_otherCategory':null,'upvotes':null,'timestamp':null,'is_anonymous':null,'views':null, 'stats': null };
  
  AppVersion.getPackageName().then((success)=>{
    this.packageName = success.toString();
  }, error =>{
    this.packageName = 'com.citySavior';
  });
  
  }		


  ionViewWillEnter()
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

	  this.loading = this.loadingCtrl.create({
      content : 'Fetching Post details'
	  });
	  this.loading.present();
	  this.getPostDetails();
	}).catch((error) =>{

	  Toast.show('Error while fetching details. Please try again later','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});

      this.navCtrl.pop();	  
    });
  }
  
  getPostDetails()
  {
   let url = 'https://citysavior.pythonanywhere.com/posts/api/post/'+this.postID+'/';
   this.http.get(url).subscribe( postResult => {

	if(postResult.status == 200)
	{
	 let data = postResult.json();
	 this.postData.id= data.id;
	 this.postData.title= data.title;
	 this.postData.lat= data.lat;
	 this.postData.lon= data.lon;
	 this.postData.category= data.category;
	 this.postData.is_anonymous= data.is_anonymous;
	 this.postData.email=data.email;
	 this.postData.desc = data.desc;
	 this.postData.views = data.views;
	 this.postData.stats = data.status; 
	 if(data.email == this.user.email)
	 {
	   this.isEditHidden = false;
	 }else{
		 
		// url changed request type changed to patch and Response changed 
		let url = 'https://citysavior.pythonanywhere.com/posts/api/post/views/increase/';
		let body = JSON.stringify({'post_id':this.postData.id});
		let headers = new Headers({'Content-Type': 'application/json'});
		let options = new RequestOptions({headers:headers});
		
		this.http.patch(url,body,options).subscribe(result =>{
			this.postData.views = result.json().views;
		},error=>{
			
		});
		
	 }
	 if(data.upvotes > 0)
	 {
	 this.postData.upvotes = data.upvotes;
	 }
	 
	 
	 let time = data.timestamp;
	 time = time.substring(0,10);
	 let day = time.substring(time.lastIndexOf('-')+1);
	 let mon_index = Number(time.substring(time.indexOf('-')+1,time.lastIndexOf('-')));
	 let mon = this.months[mon_index - 1];
	 let year = time.substring(0,time.indexOf('-'));
	 this.postData.timestamp = day+'-'+mon+'-'+year;
	 
	 let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
	 let body = JSON.stringify({'email':this.user.email,'activity_done':'Viewed post-'+this.postID+' :'+this.postData.title});
	 let headers = new Headers({'Content-Type': 'application/json'});
	 let options = new RequestOptions({headers:headers});
	 
	 this.http.post(url,body,options).subscribe(result =>{

	 }, error=>{

	 });
	 
	 let anonymous : boolean = this.postData.is_anonymous;
	 let userEmail = this.postData.email;
	 
	 
	 url = 'https://citysavior.pythonanywhere.com/posts/api/member/'+this.user.email+'/';
	 this.http.get(url).subscribe(userResult=>{
		 let userData = userResult.json();
		 if(userData.role == 'authority' || userData.role == 'moderator')
		 {
			 this.isEditHidden = false;
		 }
	 },userError=>{
		 
	 });
	 
	 
	 if(!anonymous)
	 {
	  let url = 'https://citysavior.pythonanywhere.com/posts/api/member/'+userEmail+'/';
	  this.http.get(url).subscribe( userResult => {
	 
	   if(userResult.status == 200)
	   {
	     let userData = userResult.json();
		 this.userName=userData.name;
		 this.isUserNameLoaded = true;
		 
		 if(this.isUserNameLoaded && this.isUpvoteLoaded && this.isCommentsLoaded && this.isImageLoaded && this.isAddressLoaded)
		 {
		   this.loading.dismiss();
		   this.userReady = true;
		   
		 }
	   }	   
	  }, userError =>{
	   
	    let url='https://citysavior.pythonanywhere.com/posts/api/member/'
		this.http.get(url).subscribe( result =>{
		this.loading.dismiss();
		
		Toast.show('Cannot connect to the server. Please try again later','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
		
		this.navCtrl.pop();
		}, error=>{
			this.loading.dismiss();
			
			Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});

			this.navCtrl.pop();
		});
	  });
	 }
	 else
	   {
	    this.userName='Anonymous';
		this.isUserNameLoaded = true;
	   }
	   
	// url changed - Response changed   
	url = 'https://citysavior.pythonanywhere.com/posts/api/upvote/check/';
    body = JSON.stringify({'email': this.user.email,'post_id':this.postID});
    headers = new Headers({'Content-Type': 'application/json'});
    options = new RequestOptions({ headers:headers});
    this.http.post(url,body,options).subscribe( upvoteResult => {
	 
	  if(upvoteResult.status == 200)
	  {
	   let userUpvote = upvoteResult.json();
	   
	   if(userUpvote.length!=0)
	   {
	     this.isColor = 'primary';
	   }
	   this.isDisabled = false;
	   this.isUpvoteLoaded = true;
	   
	   if(this.isUserNameLoaded && this.isUpvoteLoaded && this.isCommentsLoaded && this.isImageLoaded && this.isAddressLoaded)
		 {
		   this.loading.dismiss();
		   this.userReady = true;
		 }
	  }
	}, upvoteError =>{
	  let url='https://citysavior.pythonanywhere.com/posts/api/member/'
	  this.http.get(url).subscribe( result =>{
		this.loading.dismiss();
		
		Toast.show('Cannot connect to the server. Please try again later','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
		
		this.navCtrl.pop();
		}, error =>{
			this.loading.dismiss();
			
			Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});
		
			this.navCtrl.pop();
		});
	});	
	 
	 // url changed - Response changed
     url='https://citysavior.pythonanywhere.com/posts/api/post/getComment/'+this.postID+'/';
     this.http.get(url).subscribe( commentsResult => {
	 
	  if(commentsResult.status == 200)
	   {
	    let dataComments = commentsResult.json();
		

		if(dataComments.length == 0)
		 {
		   this.isCommentsLoaded = true;
		   
		   if(this.isUserNameLoaded && this.isUpvoteLoaded && this.isCommentsLoaded && this.isImageLoaded && this.isAddressLoaded)
		 {
		   this.loading.dismiss();
		   this.userReady = true;
		 } 
		}
		
		for(var i=0;i<dataComments.length;i++)
		{
		let commentTime = dataComments[i].timestamp;
	    commentTime = commentTime.substring(0,10);
	    let commentDay = commentTime.substring(commentTime.lastIndexOf('-')+1);
	    let comment_mon_index = Number(commentTime.substring(commentTime.indexOf('-')+1,commentTime.lastIndexOf('-')));
	    let commentMon = this.months[comment_mon_index - 1];
	    let commentYear = commentTime.substring(0,commentTime.indexOf('-'));
	    let commentTimestamp = commentDay+'-'+commentMon+'-'+commentYear;
		 	 
		 this.postComments[i]= {'comment_id':dataComments[i].comment_id,'email':dataComments[i].email,'comment_text':dataComments[i].comment_text,'timestamp':commentTimestamp,'name':null,enabled:false,detailsEnabled:true}; 

         let i1 = i;		
		
		let url = 'https://citysavior.pythonanywhere.com/posts/api/member/'+dataComments[i].email+'/'; 
		this.http.get(url).subscribe( commentsEmailResult =>{
		  
		  if(commentsEmailResult.status == 200)
		  {
		   let commentsName = commentsEmailResult.json();
		   this.postComments[i1].name = commentsName.name;
		   if(this.postComments[i1].email == this.user.email)
		   {
		     this.postComments[i1].enabled = true;
		   }
		   if(i1 == dataComments.length - 1)
		    {
			  this.isCommentsLoaded = true;
			
			  if(this.isUserNameLoaded && this.isUpvoteLoaded && this.isCommentsLoaded && this.isImageLoaded && this.isAddressLoaded)
		       {
				this.loading.dismiss();
				this.userReady = true;
			   }
			}
		  }
		},commentsEmailError =>{
		  
		  let url='https://citysavior.pythonanywhere.com/posts/api/member/'
		  this.http.get(url).subscribe( result =>{
			this.loading.dismiss();
			
			Toast.show('Cannot connect to the server. Please try again later','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});
			
			this.navCtrl.pop();
		   }, error =>{
				this.loading.dismiss();
				
				Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});

				this.navCtrl.pop();
		   });	
		});  
		}
	   }
	 }, commentsError =>{
	   
	    let url='https://citysavior.pythonanywhere.com/posts/api/member/'
		this.http.get(url).subscribe( result =>{
			this.loading.dismiss();
			
			Toast.show('Cannot connect to the server. Please try again later','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});

			this.navCtrl.pop();
		}, error =>{
			this.loading.dismiss();
			
			Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});
			
			this.navCtrl.pop();
		});	
	 });

     url = 'https://citysavior.pythonanywhere.com/posts/api/post/image/get/'+this.postID+'/';
	//body = JSON.stringify({'post_id':this.postID});
	//headers = new Headers({'Content-Type': 'application/json'});
	//options = new RequestOptions({ headers:headers});
	this.http.get(url).subscribe(imageResult =>{
	  this.postImages = [];
	 
	  if(imageResult.status == 200)
	  {
	    let images = imageResult.json();
		
		if(images.length == 0)
		{
		  this.isImageLoaded = true;
		  
		  if(this.isUserNameLoaded && this.isUpvoteLoaded && this.isCommentsLoaded && this.isImageLoaded && this.isAddressLoaded)
			{ 
				this.loading.dismiss();
				this.userReady = true;
			}
		}
		
		for(var i=0;i<images.length;i++)
		{
		 	
		 let imageURL = 'https://citysavior.pythonanywhere.com'+images[i].image_url;
		 this.postImages[i]= imageURL;
		 
		 if(images.length == 1)
			{	
				this.imgHeight="300";
			}
		else{
				this.imgHeight="140";
			}		
		 
		 if(i == images.length - 1)
		  {
		   this.isImageLoaded = true;
		  
		   if(this.isUserNameLoaded && this.isUpvoteLoaded && this.isCommentsLoaded && this.isImageLoaded && this.isAddressLoaded)
			{
				this.loading.dismiss();
				this.userReady = true;
			}
		  }
		}
		
	  }
	}, imageError =>{
		let url='https://citysavior.pythonanywhere.com/posts/api/member/'
		this.http.get(url).subscribe( result =>{
			this.loading.dismiss();
			
			Toast.show('Cannot connect to the server. Please try again later','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});
			
			this.navCtrl.pop();
		}, error =>{
			this.loading.dismiss();
			
			Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});

			this.navCtrl.pop();
		});
	 });
	 
	 this.getAddress(this.postData.lat,this.postData.lon);
	
   }
   }, postError =>{
     
		let url='https://citysavior.pythonanywhere.com/posts/api/member/'
		this.http.get(url).subscribe( result =>{
			this.loading.dismiss();
			
			Toast.show('Cannot connect to the server. Please try again later','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});

			this.navCtrl.pop();
		}, error =>{
			this.loading.dismiss();
			
			Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});
			
			this.navCtrl.pop();
		});
   });
  }
  
  updateUpvote()
  {
    this.isDisabled = true;
    if(this.isColor == 'black')
	{
	  let url='https://citysavior.pythonanywhere.com/posts/api/postUpvote/';
	  let body=JSON.stringify({'post_id':this.postID,'email':this.user.email});
	  let headers = new Headers({'Content-Type': 'application/json'});
      let options = new RequestOptions({ headers:headers});
	  this.http.post(url,body,options).subscribe(postResult =>{
	 
		this.user.karma_points = this.user.karma_points + 5;
	   
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
		
		
		//url changed - patch request to MemberDetail to update karma points
		url= 'https://citysavior.pythonanywhere.com/posts/api/member/'+this.user.email+'/';
		body = JSON.stringify({'karma_points':this.user.karma_points});
		this.http.patch(url,body,options).subscribe(result =>{ 
		
		}, error =>{
	
		});
		
		let toastOptions={
			message:'You earned 5 karma points',
			duration:1000,
			position:'top',
			addPixelsY:200,
			styling:{
				backgroundColor:'#ff0000',
				textColor:'#ffffff'
			}
			
		};
		Toast.showWithOptions(toastOptions).subscribe(toast=>{
			
		},error=>{
			
		});
		  
		  // url changed - both increase and decrease combined into one patch request and Response changed
		  url ='https://citysavior.pythonanywhere.com/posts/api/post/upvote/update/';
		  body=JSON.stringify({'post_id':this.postID,'operate':'increase'});
		  headers = new Headers({'Content-Type': 'application/json'});
		  options = new RequestOptions({ headers:headers});
		  this.http.patch(url,body,options).subscribe(updateResult=> {
		    
			if(updateResult.status == 200)
			{
			  let upvoteUpdate = updateResult.json();
			  this.postData.upvotes = upvoteUpdate.upvotes;
			  this.isColor = 'primary';
			  this.isDisabled = false;
			  
			  let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
			  let body = JSON.stringify({'email':this.user.email,'activity_done':'Upvoted post-'+this.postID+' :'+this.postData.title});
	 
			  this.http.post(url,body,options).subscribe(result =>{
				  
				  let memberActivity = result.json();
			
			  if(this.user.email != this.postData.email)
			  {
				
				let url='https://citysavior.pythonanywhere.com/posts/api/send_user_notification/';
				let body = JSON.stringify({'post_id':this.postID,'email':this.postData.email,'title':'Your post just earned a helpful upvote','message':this.user.name+' upvoted your post : '+this.postData.title+' on City Savior.\n Total upvotes for the post ='+this.postData.upvotes,'not_id':memberActivity.activity_id,'send_not':true});
				this.http.post(url,body,options).subscribe(result=>{
				  
				}, error=>{
				  
				});
			  }	
	
			  }, error=>{
	
			  });
			  
			}
		  }, updateError =>{
		   
			let url='https://citysavior.pythonanywhere.com/posts/api/member/'
			this.http.get(url).subscribe( result =>{
			
				Toast.show('Failed to upvote. Please try again later','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});

					this.isDisabled = false;
			}, error =>{
			
				Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});

				this.isDisabled = false;
			});
		});
	  }, postError =>{
	    
			let url='https://citysavior.pythonanywhere.com/posts/api/member/'
			this.http.get(url).subscribe( result =>{
			
				Toast.show('Failed to upvote. Please try again later','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});

				this.isDisabled = false;
			}, error =>{
			
				Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});

				this.isDisabled = false;
			});
		
	  });
	}
	else
	{
	  // url changed - delete request to view and Response changed	
	  let url='https://citysavior.pythonanywhere.com/posts/api/post/upvote/delete/';
	  let body=JSON.stringify({'post_id':this.postID,'email':this.user.email});
	  let headers = new Headers({'Content-Type': 'application/json'});
      let options = new RequestOptions({ headers:headers,body:body});
	  
	  this.http.delete(url,options).subscribe(cancelResult=>{
	    
		if(cancelResult.status == 200)
		{
		 
		this.user.karma_points = this.user.karma_points - 5;
	   
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
		
		url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
		body = JSON.stringify({'email':this.user.email,'activity_done':'Downvoted post-'+this.postID+' :'+this.postData.title});
	 
		this.http.post(url,body,options).subscribe(result =>{
		
		}, error=>{
		
		});
		
		//url changed - patch request to MemberDetail to update karma points
		url= 'https://citysavior.pythonanywhere.com/posts/api/member/'+this.user.email+'/';
		body = JSON.stringify({'karma_points':this.user.karma_points});
		this.http.patch(url,body,options).subscribe(result =>{ 
		
		}, error =>{
		
		});	
		  // url changed - both increase and decrease combined into one patch request and Response changed	
		  url ='https://citysavior.pythonanywhere.com/posts/api/post/upvote/update/';
		  body=JSON.stringify({'post_id':this.postID,'operate':'decrease'});
		  headers = new Headers({'Content-Type': 'application/json'});
		  options = new RequestOptions({ headers:headers});
		  
		  this.http.patch(url,body,options).subscribe( updateResult =>{
		
			if(updateResult.status == 200)
			{ 
			 let upvoteUpdate = updateResult.json();
			  if(upvoteUpdate.upvotes > 0)
			  {
			  this.postData.upvotes = upvoteUpdate.upvotes;
			  }
			  else
			  {
			   this.postData.upvotes = null;
			  }
			  this.isColor = 'black';
			  this.isDisabled = false;
			}
		  }, updateError =>{
				let url='https://citysavior.pythonanywhere.com/posts/api/member/'
				this.http.get(url).subscribe( result =>{
			
					Toast.show('Failed to update upvote. Please try again later','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});
					
					this.isDisabled = false;
				}, error =>{
			
				Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});

				this.isDisabled = false;
			});
      
		  });
		}
	  }, cancelError=>{
			let url='https://citysavior.pythonanywhere.com/posts/api/member/'
			this.http.get(url).subscribe( result =>{
			
				Toast.show('Failed to update upvote. Please try again later','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});
				
				this.isDisabled = false;
			}, error =>{
			
				Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});
				
				this.isDisabled = false;
			});
	  });
	  
	}
  }
  
  getAddress(lat,lon)  // using the geocoder api
 {
   let url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lon+'&key=AIzaSyAUA6Q7vN-9u7rW4qyKb4i8KYbCo6gzBSE&sensor=true';
   this.http.get(url).subscribe( result => {
    
	if(result.status == 200)
	{
	let address = result.json();
	if(address.status == "OK")
	{
		this.postAddress = address.results[0].formatted_address;
	}	
	this.isAddressLoaded = true;
	
	if(this.isUserNameLoaded && this.isUpvoteLoaded && this.isCommentsLoaded && this.isImageLoaded && this.isAddressLoaded)
			{
				this.loading.dismiss();
				this.userReady = true;
			}
	}
	
   },error => {
     
	 this.loading.dismiss();
	 
	 Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
		}, error=>{
						
		});

      this.navCtrl.pop();
   });
 }
 
 editComment(comment)
 {
	comment.detailsEnabled=false;
	this.isCommentDisabled= true;
	
	let comment_id : string= comment.comment_id;
	let elem = document.getElementById(comment_id);
	let divElem = document.getElementById("newCommentSpace");
	let yOffset = elem.offsetTop;
	let yHeight = elem.offsetHeight;
	let ySet = yOffset+yHeight;
	
	divElem.style.height = Math.trunc(this.platform.height()/2)+'px';
    if(this.content.getContentDimensions().scrollTop ==0)
	{
		this.content.scrollTo(0,Math.trunc(this.platform.height()),300);
	}
	else
	{
	
		this.content.scrollTo(0,ySet,300);
	}
   this.commentsText = comment.comment_text;
   
    
   setTimeout(() =>{ 
     
	 elem.focus();
	 
	 elem.style.height = ((elem.scrollHeight > elem.clientHeight) ? elem.scrollHeight+"px" : "60px") ;
	 
   },500);
   
 }
 
 cancelEdit(comment)
 {
  comment.detailsEnabled=true;
  this.isCommentDisabled= false;
  
 }
 
 adjustHeight(el : string)
  {
  let elem = <HTMLInputElement>document.getElementById(el);
  elem.style.height = ((elem.scrollHeight > elem.clientHeight) ? elem.scrollHeight+"px" : "60px") ;
  }
 
 submitComment(comment)
 {
   
   let commentID : number=comment.comment_id; 
   let index = this.postComments.indexOf(comment);
   if(index > -1){
	   
	// url changed to patch request to CommentDetail class view	
   let url='https://citysavior.pythonanywhere.com/posts/api/comment/'+commentID+'/';
   let body = JSON.stringify({'comment_text':this.commentsText});
   let headers = new Headers({'Content-Type': 'application/json'});
   let options = new RequestOptions({ headers:headers});
   this.http.patch(url,body,options).subscribe(result =>{
     
	 if(result.status == 200)
	 {
	   let oldCommentsText = this.postComments[index].comment_text;
	   this.postComments[index].comment_text = this.commentsText;
       comment.detailsEnabled=true;
	   this.isCommentDisabled= false;
	
	   
		let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
		let body = JSON.stringify({'email':this.user.email,'activity_done':'Edited comment-'+commentID+' for post-'+this.postID+'.Old comment='+oldCommentsText+' New comment='+ this.commentsText});
	 
		this.http.post(url,body,options).subscribe(result =>{
	
		}, error=>{
	
		});
	 }
   }, error =>{
      
	  let url='https://citysavior.pythonanywhere.com/posts/api/member/'
	  this.http.get(url).subscribe( result =>{
			
		Toast.show('Failed to edit comment. Please try again later','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
	
	  }, error =>{
			
			Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});

	  });
    });
   }
 }
 
 deleteComment(comment)
 {
   this.isCommentDisabled= true;
   
   let commentID : number=comment.comment_id; 
   let index= this.postComments.indexOf(comment);
   if(index > -1)
   {
	 // url changed  to delete request to CommentDetail class view
	 let url ='https://citysavior.pythonanywhere.com/posts/api/comment/'+commentID+'/';
   let headers = new Headers({'Content-Type': 'application/json'});
   let options = new RequestOptions({ headers:headers});
   this.http.delete(url,options).subscribe(result =>{
   
     if(result.status == 204)
	 {
		
	   this.postComments.splice(index,1);
	   this.isCommentDisabled= false;
	   
	   this.user.karma_points = this.user.karma_points - 10;
	   
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
		
		let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
		let body = JSON.stringify({'email':this.user.email,'activity_done':'Deleted comment-'+commentID+' for post-'+this.postID+'.Comments :'+comment.comment_text});
	 
		this.http.post(url,body,options).subscribe(result =>{
		
		}, error=>{
		
		});
		
		//url changed - patch request to MemberDetail to update karma points
		url= 'https://citysavior.pythonanywhere.com/posts/api/member/'+this.user.email+'/';
		body = JSON.stringify({'karma_points':this.user.karma_points});
		this.http.patch(url,body,options).subscribe(result =>{ 
		
		}, error =>{
		
		});
	 }
   }, error =>{
     
	 let url='https://citysavior.pythonanywhere.com/posts/api/member/'
	  this.http.get(url).subscribe( result =>{
			
		Toast.show('Failed to delete comment. Please try again later','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});

		this.isCommentDisabled = false;
	  }, error =>{
			
			Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
			
			this.isCommentDisabled = false;
	  }); 
   });
  }
 }
 
 showNewComment()
 {
   this.isCommentDisabled = true;
   this.newCommentHidden = false;
   
   let elem = document.getElementById("newComment");
   let divElem = document.getElementById("newCommentSpace");
   
   divElem.style.height = Math.trunc(this.platform.height()/2) +'px';
   this.content.scrollTo(0,this.content.getContentDimensions().scrollHeight,300);
   
   setTimeout(() =>{ 
   
   elem.focus();
   
   
   },500);
 }

 reportPost()
 {

 	this.isReportDisabled = true;

	Toast.show('Thank you for reporting. This post will be reviewed within 24 hours and necessary action will be taken.','3000','center').subscribe(toast=>{
					
	}, error=>{
					
	});
 }
 
 cancelNewComment()
 {
  this.isCommentDisabled = false;
  this.newCommentHidden = true;
  
 }
 newComment()
 {
   let today = new Date();
   let day= today.getDate();
   let mon = this.months[today.getMonth()];
   let year = today.getFullYear();
   let timestamp = day+'-'+mon+'-'+year;
   let url = 'https://citysavior.pythonanywhere.com/posts/api/comment/';
   let body = JSON.stringify({'post_id':this.postID,'email':this.user.email,'comment_text':this.newCommentsText});
   let headers = new Headers({'Content-Type': 'application/json'});
   let options = new RequestOptions({ headers:headers});
   
   this.http.post(url,body,options).subscribe( commentResult =>{
   
	 if(commentResult.status == 201)
	 {
		let result = commentResult.json();
	
	   let newCom = {'comment_id':result.comment_id,'email':this.user.email,'comment_text':this.newCommentsText,'timestamp':timestamp,'name':this.user.name,enabled:true,detailsEnabled:true};
		this.postComments.push(newCom);
		this.newCommentHidden = true;
        this.isCommentDisabled = false;
		this.newCommentsText= null;
		  
		this.user.karma_points = this.user.karma_points + 10;
	   
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
		
		let toastOptions={
			message:'You earned 10 karma points',
			duration:1000,
			position:'top',
			addPixelsY:200,
			styling:{
				backgroundColor:'#ff0000',
				textColor:'#ffffff'
			}
			
		};
		Toast.showWithOptions(toastOptions).subscribe(toast=>{
			
		},error=>{
			
		});
		
		
		let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
		let body = JSON.stringify({'email':this.user.email,'activity_done':'Submitted comment-'+newCom.comment_id+' for post-'+this.postID+'.Comments :'+newCom.comment_text});
	 
		this.http.post(url,body,options).subscribe(result =>{
			
			let memberActivity = result.json();
			if(this.user.email != this.postData.email)
			{
				let url='https://citysavior.pythonanywhere.com/posts/api/send_user_notification/';
				let body = JSON.stringify({'post_id':this.postID,'email':this.postData.email,'title':'You received a comment on your post','message':this.user.name+' commented on your post : '+this.postData.title+' on City Savior.','not_id':memberActivity.activity_id,'send_not':true});
				this.http.post(url,body,options).subscribe(result=>{
				  
				}, error=>{
				  
				});
			}
		}, error=>{
	
		});
		
		//url changed - patch request to MemberDetail to update karma points
		url= 'https://citysavior.pythonanywhere.com/posts/api/member/'+this.user.email+'/';
		body = JSON.stringify({'karma_points':this.user.karma_points});
		this.http.patch(url,body,options).subscribe(result =>{ 
		
		}, error =>{
			
		});
	   
	 }
   }, commentError =>{
     
	 
	 let url='https://citysavior.pythonanywhere.com/posts/api/member/'
	 this.http.get(url).subscribe( result =>{
			
	 Toast.show('Failed to comment. Please try again later','3000','center').subscribe(toast=>{
						
		}, error=>{
						
		});
	
	  }, error =>{
			
			Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
	
	  });
   });
 }
 
 editPost()
 {

	this.app.getRootNav().push(EditPostPage, {postID:this.postID}, {animate: true, direction: 'forward'});  
 }
 
 zoomImage(image_path : string)
 {
  
  PhotoViewer.show(image_path, '', {share: false});
  
 }
 
 sharePost()
 {
	
	this.isShareDisabled = true;
	
	Screenshot.URI(100).then((result) =>{
		SocialSharing.share('Share your support for this issue in City Savior. Download it from',null,result.URI,'https://play.google.com/store/apps/details?id='+this.packageName).then((success) =>{
	
			this.isShareDisabled=false;
		  
			let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
			let body = JSON.stringify({'email':this.user.email,'activity_done':'Shared post-'+this.postID+' :'+this.postData.title});
			let headers = new Headers({'Content-Type': 'application/json'});
			let options = new RequestOptions({ headers:headers});
		
			this.http.post(url,body,options).subscribe(result =>{

			}, error=>{

			});
		}, error=>{
			this.isShareDisabled=false;
			
			Toast.show('Error in sharing post. Please try again later','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
			
		});
		
		
		
	}, error=>{
	
		  
		  
		  this.isShareDisabled=false;
		  
		  Toast.show('Error in sharing post. Please try again later','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
      
	});
 }
 
 
}

