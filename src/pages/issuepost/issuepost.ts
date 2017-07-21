import { Component,ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, LoadingController, Events, AlertController } from 'ionic-angular';
import { NativeStorage,Diagnostic, Toast } from 'ionic-native';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Camera, File, FilePath, Transfer } from 'ionic-native';
import {Data} from '../../providers/data';



declare var cordova : any;
var env ;

declare var Clarifai : any;

var folderOptions = {
 sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
 quality : 30,
 encodingType : Camera.EncodingType.JPEG,
 correctOrientation : true
};


@Component({
  selector: 'page-issuepost',
  templateUrl: 'issuepost.html'
})
export class IssuepostPage {
	
  @ViewChild('input') myInput;

  user :any;
  userReady : boolean = false;
  
  public imageTags : string;
  public app: any;
  public tags : string ="";
  public lat : any;
  public lon : any;
  public title : string = '';
  public desc : string = null;
  public category : string =null;

  submitted : boolean = false;
  
  image1: string = null;
  image2: string = null;
  img1_occ : boolean = false;
  img2_occ : boolean = false;
  loading : any;
  userAnonymous: boolean = false;
  
  items : any;
  
  showSuggestion : boolean = true;
  descHidden : boolean = true;
  
  constructor(public navCtrl: NavController, 
  public params: NavParams,
  private platform : Platform,
  private http: Http,
  public loadingCtrl: LoadingController,
  public events: Events,
  private alertCtrl:AlertController,
  public data:Data) {
   
   this.lat = params.get("lat");
   this.lon = params.get("lon");
   
   this.image1 ="";
   this.image2 ="";
   this.imageTags = "";
   
   this.app = new Clarifai.App(
         'OTGj6hMz_MJdIFld4q91EmNMuxqR_ttUq7FF83YI',
         '_yIdO28TNqonDVoz6jDJFcbrTQA9bSm-hSDbJNR_'
       );
   
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
	  env.userReady = true;
	  env.userName = data.name;

	}).catch((error) =>{

    });
  }
  
  ionViewDidEnter()
  {
	  this.setFilteredItems();
	  setTimeout(()=>{
		  this.myInput.setFocus();
		},500);
  }


takePicture()
  {
    
   Camera.getPicture(folderOptions).then((imagePath) =>{
    File.resolveLocalFilesystemUrl(imagePath).then((entry)=>{
	 entry.getMetadata(metaData=>{
	
		if((metaData.size/(1024*1024)) <= 10)
		{	
			if(this.platform.is('android')){
			 FilePath.resolveNativePath(imagePath).then(filePath => {
			  var currentName = filePath.substr(imagePath.lastIndexOf('/') + 1);
			  var correctPath = filePath.substr(0,imagePath.lastIndexOf('/') + 1);
			  File.readAsDataURL(correctPath,currentName).then( (imageData) =>{
				let base64Image = imageData.toString();
				
				this.calCategoryTags(base64Image.substring(base64Image.indexOf(',') + 1));
				
			  });
			 
			  this.copyFileToLocalDir(correctPath,currentName,this.createFileName());
			 });
			}
			else{
			 var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
			 var correctPath = imagePath.substr(0,imagePath.lastIndexOf('/') + 1);
			 File.readAsDataURL(correctPath,currentName).then( (imageData) =>{
				let base64Image = imageData.toString();
				
				this.calCategoryTags(base64Image.substring(base64Image.indexOf(',') + 1));
			  });
			
			 this.copyFileToLocalDir(correctPath,currentName,this.createFileName());
			}
		}
		else		
		{
		  Toast.show('Image size greater than 10 MB not allowed. Please try again','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
		}
	},error=>{
		
		});
	});	
   },err=>{
     
   });
 }
 
 
 calCategoryTags(imageData : string)
 {
   var category = [];
   var categoryNames = ['Trash', 'Street Light','Damaged Road','Traffic Problems','Homeless'];
   category.push(["garbage","trash","waste","litter","recycle","disposal"]);
   category.push(["streetlight","lamp","lantern","post","dark"]);
   category.push(["road","street","pavement","asphalt","pothole"]);
   category.push(["traffic","road","car","highway","vehicle","light"]);
   category.push(["people","adult","animal","mammal","fatigue","poor"]);
   
   var finalCategoryCount = [0,0,0,0,0];
   var self = this;
   this.imageTags = "";
   
   this.app.models.predict(Clarifai.GENERAL_MODEL, imageData).then(
              (response)=> {
     
                if(response.data.status.code == 10000){
                    response.data.outputs[0].data.concepts.forEach((concept)=> {
                        self.imageTags += concept.name + " : " + concept.value + "\n";
                        self.tags += concept.name + "    ";

                        category.forEach((valu, index)=> {
                            valu.forEach((val)=>{
                                if(concept.name.toLowerCase() == val){
                                    finalCategoryCount[index] += concept.value;
                                }
                            });
                        });
                    });
					var maxValue = 0;
                    var maxIndex = -1;
                    finalCategoryCount.forEach((val, index) => {
                        if(val > maxValue){
                            maxValue = val;
                            maxIndex = index;
                        }
                    });
					
					if(maxIndex != -1)
					{	
							self.category = categoryNames[maxIndex] ;
					}
					
                }
				},
              (err) => {
                
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
  
  
  hasFocus()
  {
	  this.showSuggestion = true;
	  
  }
  
  noFocus()
  {
	  this.showSuggestion = false;
  }
  
  setTitle(item : any)
  {
	  //console.log('setTitle called');
	 // console.log('Title='+item.title);
	  
	  this.title = item.title;
  }
  
  addDescription()
  {
	  this.descHidden = false;
  }
  
  setFilteredItems()
  {
	  this.items = this.data.filterItems(this.title);
	  if(this.title.trim().length == 50)
	  {
		  Toast.show('Add addition details in Description','1000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
	  }
  }

  

  onPostSubmit()
 {
   var navCtrl = this.navCtrl;
   var events = this.events;
   this.submitted = true;
   let is_otherCategory : boolean = false;
   
   if(this.category === null )
	{
		is_otherCategory = true;
		this.category = 'Other';	
	}
   
	if(this.title != null && this.title.trim().length != 0 && (this.category !=null && this.category.trim().length != 0 ) && (this.img1_occ || (this.desc !=null && this.desc.trim().length != 0)))
   {
   this.loading = this.loadingCtrl.create({
      content : 'Posting issue'
	 });
   this.loading.present();
   
   let url = 'https://citysavior.pythonanywhere.com/posts/api/post/';
   let body = JSON.stringify({'title': this.title, 'desc': this.desc, 'lat': this.lat, 'lon': this.lon,'email': this.user.email,'category': this.category,'is_otherCategory': is_otherCategory,'is_anonymous': this.userAnonymous});
   let headers = new Headers({'Content-Type': 'application/json'});
   let options = new RequestOptions({ headers:headers});
   this.http.post(url,body,options).subscribe( result => {
   
	let postData = result.json();
	
	this.user.karma_points = this.user.karma_points + 40;
	
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
		
	url = 'https://citysavior.pythonanywhere.com/posts/api/send_user_notification/';	
	body = JSON.stringify({'post_id':postData.id,'email':this.user.email,'title':'Thanks for posting on City Savior','message':'We have received your post : '+this.title+'. Its in review status. We will notify you about its progress.','not_id':postData.id,send_not:false});
	
	this.http.post(url,body,options).subscribe(result=>{
					 
	},error=>{

	});
	
	
	 url = 'https://citysavior.pythonanywhere.com/posts/api/postMemberActivity/';
	 body = JSON.stringify({'email':this.user.email,'activity_done':'Submitted post-'+postData.id+' with title:'+this.title});
	 headers = new Headers({'Content-Type': 'application/json'});
	 options = new RequestOptions({ headers:headers});
	 this.http.post(url,body,options).subscribe(result =>{
		 
		let memberActivity = result.json();
		 
		let url='https://citysavior.pythonanywhere.com/posts/api/send_area_notification/';
		let body = JSON.stringify({'lat':postData.lat,'lon':postData.lon,'post_id':postData.id,'email':this.user.email,'title':'New issue posted in your area','message':'New post : '+postData.title+' has been posted in you area in '+postData.category+' category on City Savior.','not_id':memberActivity.activity_id});
	
		this.http.post(url,body,options).subscribe(result=>{

		},error=>{
			
		});
	   
	 }, error=>{
	   
	 });
	
	url= 'https://citysavior.pythonanywhere.com/posts/api/updateKarma/';
	body = JSON.stringify({'email':this.user.email,'karma_points':this.user.karma_points});
	headers = new Headers({'Content-Type': 'application/json'});
	options = new RequestOptions({ headers:headers});
	this.http.post(url,body,options).subscribe(result =>{ 

	}, err=>{

	});
	
	
   url = 'https://citysavior.pythonanywhere.com/posts/api/imageUpload/';
   let fileOptions = {
    fileKey:'uploadedfile',
	chunkedMode:false,
	mimeType:'multipart/form-data',
	params: {'post_id':postData.id}
   };
   let fileTransfer = new Transfer();
   if(this.img1_occ)
   {
    fileTransfer.upload(this.image1,url ,fileOptions).then(data1 =>
   {
     if(data1.responseCode == 200)
	   {
	     if(this.img2_occ)
		  {
			let url = 'https://citysavior.pythonanywhere.com/posts/api/imageUpload/';
			let fileOptions = {
				fileKey:'uploadedfile',
				chunkedMode:false,
				mimeType:'multipart/form-data',
				params: {'post_id':postData.id}
			   };  
		    fileTransfer.upload(this.image2,url ,fileOptions).then(data2 => {
			  if(data2.responseCode == 200)
			   {
				 
				 this.loading.dismiss();
				 
				 Toast.show('Post submitted successfully','3000','bottom').subscribe(toast=>{
						
				}, error=>{
						
				}); 
					
				 this.title= null;
				 this.category= null; 
				 this.desc=null; 
				 this.img1_occ=false ;
				 this.img2_occ=false;
				 	
				 navCtrl.pop();
				 events.publish('issue-posted','Done');
			   }
			} , err2 => {
				
			 
			let url='https://www.google.com';
			 this.http.get(url).subscribe( result =>{
				this.loading.dismiss();
				
				Toast.show('Failed to upload image. Please try again','3000','center').subscribe(toast=>{
						
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
				
		    this.loading.dismiss();
			
			Toast.show('Post submitted successfully','3000','bottom').subscribe(toast=>{
						
			}, error=>{
						
			});
			
			this.title= null ;
			this.category= null ;
			this.desc=null ;
			this.img1_occ=false ;
			this.img2_occ=false; 
			navCtrl.pop();
			
			events.publish('issue-posted','Done');
		   }
	   }
   } , err1 =>{
     
			let url='https://www.google.com';
			this.http.get(url).subscribe( result =>{
			this.loading.dismiss();
			
			Toast.show('Failed to upload image. Please try again','3000','center').subscribe(toast=>{
						
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
 else{
	
   this.loading.dismiss();
   
   Toast.show('Post submitted successfully','3000','bottom').subscribe(toast=>{
						
	}, error=>{
						
	});
   
		this.title=null ;
		this.category= null ;
		this.desc=null ;
		this.img1_occ=false ;
		this.img2_occ=false; 
		navCtrl.pop();
		events.publish('issue-posted','Done');
  }	
 } , err => {
     
	 let url = 'https://www.google.com';
	 this.http.get(url).subscribe( result =>{
		this.loading.dismiss();
		
		Toast.show('Cannot connect to server. Please try again','3000','center').subscribe(toast=>{
						
		}, error=>{
						
		});
		
	}, error =>{
	    this.loading.dismiss();
		
		Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
		}, error=>{
						
		});
		
	});
   });
  }	
 }  
 
 onCancel(img_id : number)
 {
  if(img_id == 1)
  {
    if(this.img2_occ == true)
	{
	  this.image1 = this.image2;
	  this.img2_occ = false;
	  this.image2 = "";

	}
	else{
	this.img1_occ = false;
	this.image1 = "";
	
	}
  }
  else if(img_id == 2)
  {
    this.img2_occ = false;
	this.image2 = "";
	
  }
 }
 
 
 
 
 ionViewCanLeave(): boolean | Promise<boolean> {
    
   
	if ((this.title== null || (this.title!=null && this.title.trim().length ==0)) && (this.desc==null ||(this.desc!=null && this.desc.trim().length == 0)) && this.img1_occ==false && this.img2_occ==false ) {
     
	return true;
    }
	
    return new Promise((resolve: any, reject: any) => {
      let alert = this.alertCtrl.create({
        title: 'Leave this page?',
        message: 'Are you sure you want to leave this page? Your post will not be submitted.'
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
			  
			case Diagnostic.permissionStatus.GRANTED: this.takePicture();
														break;
			
			case Diagnostic.permissionStatus.DENIED : 
				Diagnostic.requestRuntimePermission(Diagnostic.permission.READ_EXTERNAL_STORAGE).then(result=>{
					
					
					switch(result){
					
					case Diagnostic.permissionStatus.GRANTED: this.takePicture();
																break;
			
					case Diagnostic.permissionStatus.DENIED : break;
			
					case Diagnostic.permissionStatus.DENIED_ALWAYS : 
						let storageAlert = this.alertCtrl.create({
							title : 'Storage Permission',
							subTitle : 'Storage permission has been denied. Enable the Storage permission manually from the Settings to access files',
							buttons: [{
								text: 'Ok',
								role: 'cancel',
								handler: () => {
						
							}
						}]
					});
			
						storageAlert.present();
						break;
					}
				});
				break;
			
			case Diagnostic.permissionStatus.DENIED_ALWAYS : 
				let storageAlert = this.alertCtrl.create({
							title : 'Storage Permission',
							subTitle : 'Storage permission has been denied. Enable the Storage permission manually from the Settings to access files',
							buttons: [{
								text: 'Ok',
								role: 'cancel',
								handler: () => {
						
							}
						}]
					});
			
				storageAlert.present();
				break;
			
			case Diagnostic.permissionStatus.NOT_REQUESTED :
				Diagnostic.requestRuntimePermission(Diagnostic.permission.READ_EXTERNAL_STORAGE).then(result=>{
					
					
					switch(result){
					
					case Diagnostic.permissionStatus.GRANTED: this.takePicture();
																break;
			
					case Diagnostic.permissionStatus.DENIED : break;
			
					case Diagnostic.permissionStatus.DENIED_ALWAYS : 
						let storageAlert = this.alertCtrl.create({
							title : 'Storage Permission',
							subTitle : 'Storage permission has been denied. Enable the Storage permission manually from the Settings to access files',
							buttons: [{
								text: 'Ok',
								role: 'cancel',
								handler: () => {
						
							}
							}]
						});
			
						storageAlert.present();
					
						break;
					}
				});
				break;
				
		  } 
	  }).catch(error=>{
		  this.takePicture();
		  
	  });
  }
  
}
