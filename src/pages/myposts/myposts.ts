import { Component } from '@angular/core';
import { NativeStorage, Toast } from 'ionic-native';
import { Http,Headers,RequestOptions } from '@angular/http';
import { NavController, App } from 'ionic-angular';
import { PostdetailPage } from '../postdetail/postdetail';

var env ;
@Component({
  selector: 'page-myposts',
  templateUrl: 'myposts.html'
})
export class MypostsPage {

  user :any;
  userReady : boolean = false;
  posts : any =[];
  spinnerHidden : boolean = false;
  months =['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  constructor(public navCtrl: NavController,
  private http: Http,
  private app: App) {

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
	 
	  this.getPosts();
	  
	}).catch((error) =>{
   
      Toast.show('Error while fetching posts. Please try again later','3000','center').subscribe(toast=>{
						
		}, error=>{
						
		});
    });
	
  }
  
  getPostDetail(postID : number)
  {
    this.app.getRootNav().push(PostdetailPage, {postID:postID}, {animate: true, direction: 'forward'});
  }
  
  getPosts()
  {
   
   this.spinnerHidden = false;
   let url = 'https://citysavior.pythonanywhere.com/posts/api/post/'+this.user.email+'/';
   this.http.get(url).subscribe( result => {
    
	if(result.status == 200)
	{
	
	let postData = result.json();
	if(postData.length == 0)
	{
		this.userReady = true;
		this.spinnerHidden = true;
	}else
	{
	 if(this.posts.length == 0)
	 {	
	
	for(var i=0;i<postData.length;i++)
	{
	let time = postData[i].fields.timestamp;
	time = time.substring(0,10);
	let day = time.substring(time.lastIndexOf('-')+1);
	let mon_index = Number(time.substring(time.indexOf('-')+1,time.lastIndexOf('-')));
	let mon = this.months[mon_index - 1];
	let year = time.substring(0,time.indexOf('-'));
	let timestamp = day+'-'+mon+'-'+year;
	
	
	let image_src = null;
	switch(postData[i].fields.category){
	 case 'Trash' : image_src='assets/img/garbage.jpg';
					break;
	
	 case 'Street Light': image_src='assets/img/street_light.jpg';
						  break;
	  
	 case 'Damaged Road': image_src='assets/img/roads.jpg';
						   break;

	 case 'Traffic Problems': image_src='assets/img/traffic_lights.jpg';
							   break;
								
	 case 'Homeless': image_src='assets/img/homeless.jpg';
					  break;	
	 
     default : image_src=null;
					break;
	}
	
	this.posts[i] = {'pk':postData[i].pk,'title':postData[i].fields.title,'category':postData[i].fields.category,'timestamp':timestamp,'address':'','views':postData[i].fields.views,'image':image_src,'upvotes':postData[i].fields.upvotes,'is_otherCategory':postData[i].fields.is_otherCategory,'stats':postData[i].fields.status};
    
	let i1 = i;
	
	let url='https://maps.googleapis.com/maps/api/geocode/json?latlng='+postData[i].fields.lat+','+postData[i].fields.lon+'&key=AIzaSyAUA6Q7vN-9u7rW4qyKb4i8KYbCo6gzBSE&sensor=true';
	 this.http.get(url).subscribe( res => {
	
	  if(res.status == 200)
	   {
	    let address = res.json();
		let address_returned = null;
		if(address.status =="OK")
		{
			address_returned = address.results[0].formatted_address;
		}
		this.posts[i1].address = address_returned;
		if(i1 == postData.length - 1)
		{
		  this.userReady = true;
		  this.spinnerHidden = true;
		}
	   }
	 }, err =>{
	
	  this.spinnerHidden = true;
	  
	  Toast.show('Error while fetching posts. Please try again later','3000','center').subscribe(toast=>{
						
		}, error=>{
						
		});
	  
	 });
	 
	 if(postData[i].fields.is_otherCategory)
	 {
		let url = 'https://citysavior.pythonanywhere.com/posts/api/getImage/';	 
		let body = JSON.stringify({'post_id':postData[i].pk});
		let headers = new Headers({'Content-Type': 'application/json'});
		let options = new RequestOptions({ headers:headers});
		this.http.post(url,body,options).subscribe(imageResult =>{
			let img = imageResult.json();
			if(img.length != 0)
			{
				this.posts[i1].image='https://citysavior.pythonanywhere.com'+img[0].image_url;
				
			}
		},error=>{
			
		});
	 }
	 
	}
	 }else{
		let temp_posts = [];
		for(var i=0;i<postData.length ;i++)
		{
			if(postData[i].pk == this.posts[0].pk)
			{
				break;
			}
			else
			{
				let time = postData[i].fields.timestamp;
				time = time.substring(0,10);
				let day = time.substring(time.lastIndexOf('-')+1);
				let mon_index = Number(time.substring(time.indexOf('-')+1,time.lastIndexOf('-')));
				let mon = this.months[mon_index - 1];
				let year = time.substring(0,time.indexOf('-'));
				let timestamp = day+'-'+mon+'-'+year;
				
				
				let image_src = null;
				switch(postData[i].fields.category){
				 case 'Trash' : image_src='assets/img/garbage.jpg';
								break;
				
				 case 'Street Light': image_src='assets/img/street_light.jpg';
									  break;
				  
				 case 'Damaged Road': image_src='assets/img/roads.jpg';
									   break;

				 case 'Traffic Problems': image_src='assets/img/traffic_lights.png';
										   break;
											
				 case 'Homeless': image_src='assets/img/homeless.jpg';
								  break;	
				 
				 default : image_src=null;
								break;
				}
				
				temp_posts[i] = {'pk':postData[i].pk,'title':postData[i].fields.title,'category':postData[i].fields.category,'timestamp':timestamp,'address':'','views':postData[i].fields.views,'image':image_src,'upvotes':postData[i].fields.upvotes,'is_otherCategory':postData[i].fields.is_otherCategory,'stats':postData[i].fields.status};			
			}
		}
		for(var i=0,j=temp_posts.length;i<this.posts.length;i++,j++)
		{
			this.posts[i].views = postData[j].fields.views;
			this.posts[i].upvotes = postData[j].fields.upvotes;
			this.posts[i].stats = postData[j].fields.status;
			if(this.posts[i].is_otherCategory)
				 {
					let i1=i; 
					let url = 'https://citysavior.pythonanywhere.com/posts/api/getImage/';	 
					let body = JSON.stringify({'post_id':postData[j].pk});
					let headers = new Headers({'Content-Type': 'application/json'});
					let options = new RequestOptions({ headers:headers});
					this.http.post(url,body,options).subscribe(imageResult =>{
						let img = imageResult.json();
						if(img.length != 0)
						{
							this.posts[i1].image='https://citysavior.pythonanywhere.com'+img[0].image_url;
							
						}else{
							this.posts[i1].image = null;
						}
					},error=>{
						
					});
				 }
		}
		if(temp_posts.length == 0)
		{
		this.userReady = true;
		this.spinnerHidden = true;
		}
		
		for(var i =0;i<temp_posts.length;i++)
		{
			this.posts.splice(i,0,temp_posts[i]);
			let i1 =i;
			let url='https://maps.googleapis.com/maps/api/geocode/json?latlng='+postData[i].fields.lat+','+postData[i].fields.lon+'&key=AIzaSyAUA6Q7vN-9u7rW4qyKb4i8KYbCo6gzBSE&sensor=true';
			
			this.http.get(url).subscribe( res => {
	
			  if(res.status == 200)
			   {
				let address = res.json();
				let address_returned = null;
				if(address.status =="OK")
				{
					address_returned = address.results[0].formatted_address;
				}
				this.posts[i1].address = address_returned;
				if(i1 == temp_posts.length - 1)
				{
				  this.userReady = true;
				  this.spinnerHidden = true;
				}
			   }
			 }, err =>{
			
			  this.spinnerHidden = true;
			  
			  Toast.show('Error while fetching posts. Please try again later','3000','center').subscribe(toast=>{
								
				}, error=>{
								
				});
			  
			 });
			 
			if(temp_posts[i].fields.is_otherCategory)
			 {
				let url = 'https://citysavior.pythonanywhere.com/posts/api/getImage/';	 
				let body = JSON.stringify({'post_id':temp_posts[i].pk});
				let headers = new Headers({'Content-Type': 'application/json'});
				let options = new RequestOptions({ headers:headers});
				this.http.post(url,body,options).subscribe(imageResult =>{
					let img = imageResult.json();
					if(img.length != 0)
					{
						this.posts[i1].image='https://citysavior.pythonanywhere.com'+img[0].image_url;
						
					}
				},error=>{
					
				});
			 } 
			
		}
	 }
	}
   }
	
   }, error =>{
    
	let url = 'https://www.google.com';
	
	this.http.get(url).subscribe( result =>{
	    //this.loading.dismiss();
		this.spinnerHidden = true;
		
		Toast.show('Cannot connect to server. Please try again later','3000','center').subscribe(toast=>{
						
		}, error=>{
						
		});
		
	 }, error=>{
			//this.loading.dismiss();
			this.spinnerHidden = true;
			
			Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
			
		});
   });
  }
  
}
