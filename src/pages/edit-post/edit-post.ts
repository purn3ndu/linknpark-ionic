import { Component,ViewChild } from '@angular/core';
import { NavController, NavParams, LoadingController, ActionSheetController, Platform, AlertController,Content} from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { NativeStorage,Camera, File, FilePath, Transfer, Diagnostic, Toast } from 'ionic-native';

declare var cordova : any;
var env;
var folderOptions = {
 sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
 quality : 30,
 encodingType : Camera.EncodingType.JPEG,
 correctOrientation : true
};

var cameraOptions= {
 quality : 15,
 sourceType : Camera.PictureSourceType.CAMERA,
 encodingType : Camera.EncodingType.JPEG,
 saveToPhotoAlbum : false,
 correctOrientation : true
};


@Component({
  selector: 'page-edit-post',
  templateUrl: 'edit-post.html'
})
export class EditPostPage {
	
	@ViewChild('descInput') descInput;	
	@ViewChild(Content) content : Content;

  userReady : boolean ;
  user : any;
  
  postID: number = null;
  postData : any;
  userName : string = null;
  
  issueDesc: string =null;
  image1: string = null;
  image2: string = null;
  img1_occ : boolean = false;
  img2_occ : boolean = false;
  image_id1: number = null;
  image_id2: number = null;
  deletedImages = [];
  
  
  submitted : boolean = false;
  
  descEdited: boolean ;
  imageUpload1Edited : boolean ;
  imageUpload2Edited : boolean ;
  imageDeleteEdited : boolean ;
  
  loading : any;
  
  descHidden : boolean = true;
  
  constructor(public navCtrl: NavController, 
  public navParams: NavParams,
  private http: Http,
  public loadingCtrl: LoadingController,
  public actionSheetCtrl: ActionSheetController,
  private platform : Platform,
  private alertCtrl : AlertController) {
  
  this.postID = navParams.get("postID"); 
  this.postData={'id':null,'title':null,'desc':null,'lat':null,'lon':null,'email':null,'category':null,'timestamp':null,'is_anonymous':null};
  this.image1 ="";
   this.image2 ="";
   
   this.descEdited=false;
   this.imageUpload1Edited=false;
   this.imageDeleteEdited=false;
   this.imageUpload2Edited=false;
   
  }
 
 ionViewCanEnter()
 {
  env =this;
  
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
	  env.userReady = true;
	  
	  this.loading = this.loadingCtrl.create({
      content : 'Fetching Post details'
	 });
	  this.loading.present();	 
	  this.getPostDetails();  
	  
	}).catch((error) =>{

    });
 }
 
 getPostDetails()
 {
  
   let url='https://citysavior.pythonanywhere.com/posts/api/post/'+this.postID+'/';
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
	 this.issueDesc = this.postData.desc;
	 if(this.issueDesc !=null && this.issueDesc.trim().length !=0 )
	 {
		 this.descHidden = false;
	 }else{
		 this.descHidden = true;
	 }
	 if(!this.postData.is_anonymous)
	 {
	  let url = 'https://citysavior.pythonanywhere.com/posts/api/member/'+this.postData.email+'/';
	  this.http.get(url).subscribe( userResult => {
	
	   if(userResult.status == 200)
	   {
	     let userData = userResult.json();
		 this.userName=userData.name;
		
	   }	  
	  }, userError =>{
	
	   });
	 }
	 else
	   {
	    this.userName='Anonymous';
	   }
	url = 'https://citysavior.pythonanywhere.com/posts/api/getImage/';	 
    let body = JSON.stringify({'post_id':this.postID});
	let headers = new Headers({'Content-Type': 'application/json'});
	let options = new RequestOptions({ headers:headers});
	this.http.post(url,body,options).subscribe(imageResult =>{
	
	  if(imageResult.status == 200)
	  {
	    let images = imageResult.json();
		if(images.length == 0)
		{
	
		  this.loading.dismiss(); 
		}
		for(var i=0;i<images.length;i++)
		{
		  if(i==0)
		  {
		    this.image1='https://citysavior.pythonanywhere.com'+images[i].image_url;
			this.img1_occ = true;
			this.image_id1 = images[i].image_id;
			
		  }
		  else if(i==1)
		  {
		    this.image2='https://citysavior.pythonanywhere.com'+images[i].image_url;
			this.img2_occ = true;
			this.image_id2 = images[i].image_id;
		  }
		  if(i==images.length-1)
		    {
			 
		    this.loading.dismiss();
		   
		    }
		}
	  }
	}, imageError =>{
	
	  this.loading.dismiss();
	});
   
   }
   },postError =>{
    
	 let url='https://citysavior.pythonanywhere.com/posts/api/member/';
	 this.http.get(url).subscribe( result =>{
	    this.loading.dismiss();
		
		Toast.show('Cannot connect to server. Please try again','3000','center').subscribe(toast=>{
						
		}, error=>{
						
		});
		
	 }, error=>{
			this.loading.dismiss();
			
			Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
		});
	 
	 });
 }
 
 
 selectImage()
{
  let actionSheet = this.actionSheetCtrl.create({
    title : 'Select Image Source',
	buttons : [
	{
	  text: 'Load From Library',
	  handler : () => {
	    this.takePicture(Camera.PictureSourceType.PHOTOLIBRARY);
		
	   }
	 },
     {
	  text : 'Use Camera',
	  handler : () => {
	       this.takePicture(Camera.PictureSourceType.CAMERA);
	   }
	 },
     {
       text :'Cancel',
       role: 'cancel'	   
	 }
    ]	 
   });
  actionSheet.present();   
}

takePicture(sourceType)
  {
  
   var options = sourceType === 0 ? folderOptions : cameraOptions;
   Camera.getPicture(options).then((imagePath) =>{
    File.resolveLocalFilesystemUrl(imagePath).then((entry)=>{
	 entry.getMetadata(metaData=>{
	
		if((metaData.size/(1024*1024)) <= 10)
		{	
			if(this.platform.is('android') && sourceType === Camera.PictureSourceType.PHOTOLIBRARY){
			 FilePath.resolveNativePath(imagePath).then(filePath => {
			  var currentName = filePath.substr(imagePath.lastIndexOf('/') + 1);
			  var correctPath = filePath.substr(0,imagePath.lastIndexOf('/') + 1);
			  
			 
			  this.copyFileToLocalDir(correctPath,currentName,this.createFileName());
			 });
			}
			else{
			 var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
			 var correctPath = imagePath.substr(0,imagePath.lastIndexOf('/') + 1);
			 
			 console.log('The image path is: ',imagePath);		
		   	if(this.img1_occ == false){		
			   	this.image1= imagePath;		
			   this.img1_occ = true;		
			} else if(this.img2_occ== false){		
				this.image2= imagePath;		
			  this.img2_occ = true;		
			  }
			
			 //this.copyFileToLocalDir(correctPath,currentName,this.createFileName());
			}
		}
		else
		{
		  
			Toast.show('Image size greater than 10 MB not allowed. Please try again','4000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
		  
		}
		},error=>{
	
		});
	});
   },err=>{
    
   });
 }
 
 //create a new name for the image
  createFileName() : string
  {
    var d = new Date();
	let n = d.getTime();
	let newFileName : string = n + ".jpg";
    return newFileName ;	
  }
  
  //Copy the image to a local folder
  
  copyFileToLocalDir(namePath : string,currentName: string,newFileName : string)
  {
    File.copyFile(namePath, currentName , cordova.file.dataDirectory, newFileName).then( success => {
	 if(this.img1_occ == false){
	   this.image1= cordova.file.dataDirectory + newFileName;
	   this.img1_occ = true;
	} else if(this.img2_occ== false){
      this.image2= cordova.file.dataDirectory + newFileName;
	  this.img2_occ = true;
	  }
	},err => {
	 
	});
  }
  
  onCancel(img_id : number)
 {
  if(img_id == 1)
  {
    if(this.image_id1 != null)
	  {
	   this.deletedImages.push(this.image_id1);
	  }
	  
	if(this.img2_occ == true)
	{
	  this.image1 = this.image2;
	  this.img2_occ = false;
	  this.image2 = "";
	  if(this.image_id2!=null)
	  {
	  this.image_id1 = this.image_id2;
	  this.image_id2 = null;
	  }
	}
	else{
	this.img1_occ = false;
	this.image1 = "";
	this.image_id1=null;
	}
	
  }
  else if(img_id == 2)
  {
    this.img2_occ = false;
	this.image2 = "";
	if(this.image_id2 != null)
	  {
	   this.deletedImages.push(this.image_id2);
	   this.image_id2= null;
	  }
  }
 }
 
 addDescription()
  {
	  this.descHidden = false;
	  this.content.scrollToBottom(300);
	  setTimeout(()=>{
		  this.descInput.setFocus();
		},300);
  }

 onPostSubmit()
 {
     
   this.submitted = true;
	if(((this.issueDesc != this.postData.desc) || (this.img1_occ == true && this.image_id1==null) || (this.img2_occ == true && this.image_id2==null) || (this.deletedImages.length > 0) ) && ((this.issueDesc != null && this.issueDesc.trim().length!=0)|| this.img1_occ))
   {
	this.descEdited=false;
	this.imageUpload1Edited=false;
	this.imageDeleteEdited=false;
	this.imageUpload2Edited=false;
	
	this.loading = this.loadingCtrl.create({
      content : 'Updating post'
	 });
	this.loading.present();	 
  if(this.issueDesc != this.postData.desc)
  {
   let url = 'https://citysavior.pythonanywhere.com/posts/api/updatePost/';
   let body = JSON.stringify({'post_id':this.postID,'issueDes':this.issueDesc});
   let headers = new Headers({'Content-Type': 'application/json'});
   let options = new RequestOptions({ headers:headers});
   this.http.post(url,body,options).subscribe( postUpdate=>{
    
	  if(postUpdate.status == 200)
	  {
	   let postUpdateResult= postUpdate.json();
	
	   this.descEdited = true;
	   this.postData.desc = postUpdateResult.issueDes;
	   if(this.descEdited && this.imageUpload1Edited && this.imageDeleteEdited && this.imageUpload2Edited)
	   {
	     
		 this.submitted = false;
		 let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
		 let body = JSON.stringify({'email':this.user.email,'activity_done':'Edited post-'+this.postID+' :'+this.postData.title});
		 
		 this.http.post(url,body,options).subscribe(result =>{
	
			}, error=>{

		});
			
		 this.loading.dismiss();
		 
		Toast.show('Post updated successfully','3000','bottom').subscribe(toast=>{
						
		}, error=>{
						
		});
		 
		 this.navCtrl.pop();
	   }	   
	  }
   }, postUpdateError=>{
       
	   let url='https://citysavior.pythonanywhere.com/posts/api/member/';
	   this.http.get(url).subscribe( result =>{
		this.loading.dismiss();
		
		Toast.show('Cannot connect to server. Please try again','3000','center').subscribe(toast=>{
						
		}, error=>{
						
		});

	  }, error=>{
			this.loading.dismiss();
			
			Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});

		});
				 
   });
 }
  else
  {

  this.descEdited = true;
  if(this.descEdited && this.imageUpload1Edited && this.imageDeleteEdited && this.imageUpload2Edited)
	   {
	     this.submitted = false;
		 let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
		 let body = JSON.stringify({'email':this.user.email,'activity_done':'Edited post-'+this.postID+' :'+this.postData.title});
		 let headers = new Headers({'Content-Type': 'application/json'});
	     let options = new RequestOptions({ headers:headers});
		 
		 this.http.post(url,body,options).subscribe(result =>{

			}, error=>{

		});
		 
		 this.loading.dismiss();
		 
		 Toast.show('Post updated successfully','3000','bottom').subscribe(toast=>{
						
		}, error=>{
						
		});
		 
		 this.navCtrl.pop();
	   }
  }
  
  if(this.img1_occ == true && this.image_id1==null)
  {
    this.img1_occ = false;
	let url = 'https://citysavior.pythonanywhere.com/posts/api/imageUpload/';
	let fileOptions = {
      fileKey:'uploadedfile',
	  chunkedMode:false,
	  mimeType:'multipart/form-data',
	  params: {'post_id':this.postID}
     };
	let fileTransfer = new Transfer();
	fileTransfer.upload(this.image1,url ,fileOptions).then(data1=>{

		  if(data1.responseCode == 200)
		  {
		   
		   this.imageUpload1Edited= true;

		   if(this.descEdited && this.imageUpload1Edited && this.imageDeleteEdited && this.imageUpload2Edited)
	       {
	        this.submitted = false;
			let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
			let body = JSON.stringify({'email':this.user.email,'activity_done':'Edited post-'+this.postID+' :'+this.postData.title});
			let headers = new Headers({'Content-Type': 'application/json'});
			let options = new RequestOptions({ headers:headers});
		 
			this.http.post(url,body,options).subscribe(result =>{

			}, error=>{

			});
			
			this.loading.dismiss();			
			
			Toast.show('Post updated successfully','3000','bottom').subscribe(toast=>{
						
			}, error=>{
						
			});
			
			 this.navCtrl.pop();
	       }
		  }
		},error1=>{
			
			let url='https://citysavior.pythonanywhere.com/posts/api/member/';
			this.http.get(url).subscribe( result =>{
			this.loading.dismiss();
			
			Toast.show('Cannot connect to server. Please try again','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});

			}, error=>{
				this.loading.dismiss();
				
				Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});

			});
		});  	
  }
  else
  {
    this.imageUpload1Edited= true;

	if(this.descEdited && this.imageUpload1Edited && this.imageDeleteEdited && this.imageUpload2Edited)
	       {
	        this.submitted = false;
			let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
			let body = JSON.stringify({'email':this.user.email,'activity_done':'Edited post-'+this.postID+' :'+this.postData.title});
			let headers = new Headers({'Content-Type': 'application/json'});
			let	options = new RequestOptions({ headers:headers});
		 
			this.http.post(url,body,options).subscribe(result =>{

			}, error=>{

			});
		
			this.loading.dismiss();
			
			Toast.show('Post updated successfully','3000','bottom').subscribe(toast=>{
						
			}, error=>{
						
			});
					
			 this.navCtrl.pop();
	       }
	
  }
  if(this.img2_occ == true && this.image_id2==null)
  {
   this.img2_occ = false;
   let url = 'https://citysavior.pythonanywhere.com/posts/api/imageUpload/';
	let fileOptions = {
      fileKey:'uploadedfile',
	  chunkedMode:false,
	  mimeType:'multipart/form-data',
	  params: {'post_id':this.postID}
     };
	let fileTransfer = new Transfer();
	fileTransfer.upload(this.image2,url ,fileOptions).then( data2=>{

			 if(data2.responseCode == 200)
			   {
			     this.loading.dismiss();
				 this.imageUpload2Edited= true;

				 if(this.descEdited && this.imageUpload1Edited && this.imageDeleteEdited && this.imageUpload2Edited)
	              {
					this.submitted = false;  
					let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
					let body = JSON.stringify({'email':this.user.email,'activity_done':'Edited post-'+this.postID+' :'+this.postData.title});
					let headers = new Headers({'Content-Type': 'application/json'});
					let options = new RequestOptions({ headers:headers});
		 
					this.http.post(url,body,options).subscribe(result =>{

					}, error=>{

					});
					
					Toast.show('Post updated successfully','3000','bottom').subscribe(toast=>{
						
					}, error=>{
						
					});
					
					this.navCtrl.pop();
	              }
			   }
			},error2=>{
				
				let url='https://citysavior.pythonanywhere.com/posts/api/member/';
				this.http.get(url).subscribe( result =>{
				this.loading.dismiss();
					
					Toast.show('Cannot connect to server. Please try again','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});

				}, error=>{
					this.loading.dismiss();
					
					Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});

			});	
			});
  }
  else
  {
   this.imageUpload2Edited= true;

   if(this.descEdited && this.imageUpload1Edited && this.imageDeleteEdited && this.imageUpload2Edited)
        {
   
			this.submitted = false;
			let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
			let body = JSON.stringify({'email':this.user.email,'activity_done':'Edited post-'+this.postID+' :'+this.postData.title});
			let headers = new Headers({'Content-Type': 'application/json'});
			let options = new RequestOptions({ headers:headers});
		 
			this.http.post(url,body,options).subscribe(result =>{

			}, error=>{

			});
		
			this.loading.dismiss();
			
			Toast.show('Post updated successfully','3000','bottom').subscribe(toast=>{
						
			}, error=>{
						
			});
		   this.navCtrl.pop();
	    }
  }
  
  if(this.deletedImages.length > 0)
  {
    let url ='https://citysavior.pythonanywhere.com/posts/api/deleteImage/';
	let body1 ={'no_of_images':this.deletedImages.length};
	for(var i=0;i<this.deletedImages.length;i++)
	   {
	    let image_name ='image'+i;
		body1[image_name]= this.deletedImages[i];
	   }
	let body=JSON.stringify(body1);
	let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({ headers:headers});
	this.http.post(url,body,options).subscribe(deleteImageResult =>{

		if(deleteImageResult.status == 200)
		   {
			if(deleteImageResult.json().count == 0)
				{
				this.deletedImages = [];
				this.imageDeleteEdited = true;

				if(this.descEdited && this.imageUpload1Edited && this.imageDeleteEdited && this.imageUpload2Edited)
                  {
					this.submitted = false;  
                    let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
					let body = JSON.stringify({'email':this.user.email,'activity_done':'Edited post-'+this.postID+' :'+this.postData.title});
		 
					this.http.post(url,body,options).subscribe(result =>{

					}, error=>{

					});
					
					this.loading.dismiss();
					
					Toast.show('Post updated successfully','3000','bottom').subscribe(toast=>{
						
					}, error=>{
						
					});
					
					this.navCtrl.pop();
	              }
				}  
			}	
	  }, deleteImageError =>{
	
			let url='https://citysavior.pythonanywhere.com/posts/api/member/';
			this.http.get(url).subscribe( result =>{
			this.loading.dismiss();
			
			Toast.show('Cannot connect to server. Please try again','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});

			}, error=>{
				this.loading.dismiss();
				
				Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});

			});
		});		
  }
  else
  {
    this.imageDeleteEdited = true;

    if(this.descEdited && this.imageUpload1Edited && this.imageDeleteEdited && this.imageUpload2Edited)
       {
	   
		 this.submitted = false;	
		 let url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
		 let body = JSON.stringify({'email':this.user.email,'activity_done':'Edited post-'+this.postID+' :'+this.postData.title});
		 let headers = new Headers({'Content-Type': 'application/json'});
	     let options = new RequestOptions({ headers:headers});
		 
		 this.http.post(url,body,options).subscribe(result =>{

			}, error=>{

		});
		
	    this.loading.dismiss();
		
        Toast.show('Post updated successfully','3000','bottom').subscribe(toast=>{
						
		}, error=>{
				
		});
		
		this.navCtrl.pop();
	   }
  }
  }
  else
  {
	  Toast.show('No changes made','3000','center').subscribe(toast=>{
						
		}, error=>{
						
		});
  }
  
 }
 
 ionViewCanLeave(): boolean | Promise<boolean> {
    
    if (this.issueDesc == this.postData.desc && ((this.img1_occ == true && this.image_id1!=null) || this.img1_occ == false) && ((this.img2_occ == true && this.image_id2!=null) || this.img2_occ == false) && this.deletedImages.length == 0) {
      return true;
    }

    return new Promise((resolve: any, reject: any) => {
      let alert = this.alertCtrl.create({
        title: 'Leave this page?',
        message: 'Are you sure you want to leave this page? Your post will not be updated.'
      });
      alert.addButton({ text: 'Stay', handler: reject });
      alert.addButton({ text: 'Leave', role: 'cancel', handler: resolve });

      alert.present();
    });
  }
  
  checkStoragePermission()
  {
	  Diagnostic.getPermissionAuthorizationStatus(Diagnostic.permission.READ_EXTERNAL_STORAGE).then(result=>{
		  
	
		  switch(result){
			  
			case Diagnostic.permissionStatus.GRANTED: this.selectImage();
														break;
			
			case Diagnostic.permissionStatus.DENIED : 
				Diagnostic.requestRuntimePermission(Diagnostic.permission.READ_EXTERNAL_STORAGE).then(result=>{
					
					
					switch(result){
					
					case Diagnostic.permissionStatus.GRANTED: this.selectImage();
																break;
			
					case Diagnostic.permissionStatus.DENIED : break;
			
					case Diagnostic.permissionStatus.DENIED_ALWAYS : break;
					}
				});
				break;
			
			case Diagnostic.permissionStatus.DENIED_ALWAYS : break;
			
			case Diagnostic.permissionStatus.NOT_REQUESTED :
				Diagnostic.requestRuntimePermission(Diagnostic.permission.READ_EXTERNAL_STORAGE).then(result=>{
					
					
					switch(result){
					
					case Diagnostic.permissionStatus.GRANTED: this.selectImage();
																break;
			
					case Diagnostic.permissionStatus.DENIED : break;
			
					case Diagnostic.permissionStatus.DENIED_ALWAYS : break;
					}
				});
				break;
				
		  } 
	  }).catch(error=>{
		  this.selectImage();
		  
	  });
  }
}
