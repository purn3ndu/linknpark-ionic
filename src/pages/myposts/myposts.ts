import { Component } from '@angular/core';
import { NativeStorage, Toast } from 'ionic-native';
import { Http } from '@angular/http';
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
   //url changed - Response changed
   let url = 'https://citysavior.pythonanywhere.com/posts/api/user_post/'+this.user.email+'/';
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
	let time = postData[i].timestamp;
	time = time.substring(0,10);
	let day = time.substring(time.lastIndexOf('-')+1);
	let mon_index = Number(time.substring(time.indexOf('-')+1,time.lastIndexOf('-')));
	let mon = this.months[mon_index - 1];
	let year = time.substring(0,time.indexOf('-'));
	let timestamp = day+'-'+mon+'-'+year;
	
	
	let image_src = 'assets/img/other.jpg';
	switch(postData[i].category){
	 case 'Trash' : image_src='assets/img/garbage.jpg';
					break;
	
	 case 'Street Light': image_src='assets/img/street_light.jpg';
						  break;
	  
	 case 'Damaged Road': image_src='assets/img/roads.jpg';
						   break;

	 case 'Traffic Problems': image_src='assets/img/traffic.png';
							   break;
								
	 case 'Homeless': image_src='assets/img/homeless.jpg';
					  break;	
	}
	
	this.posts[i] = {'id':postData[i].id,'title':postData[i].title,'category':postData[i].category,'timestamp':timestamp,'address':'','views':postData[i].views,'image':image_src,'upvotes':postData[i].upvotes,'is_otherCategory':postData[i].is_otherCategory,'stats':postData[i].status};
    
	let i1 = i;
	
	let url='https://maps.googleapis.com/maps/api/geocode/json?latlng='+postData[i].lat+','+postData[i].lon+'&key=AIzaSyAUA6Q7vN-9u7rW4qyKb4i8KYbCo6gzBSE&sensor=true';
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
	 
	 if(postData[i].is_otherCategory)
	 {
		let url = 'https://citysavior.pythonanywhere.com/posts/api/post/image/get/'+postData[i].id+'/';	 
		//let body = JSON.stringify({'post_id':postData[i].id});
		//let headers = new Headers({'Content-Type': 'application/json'});
		//let options = new RequestOptions({ headers:headers});
		this.http.get(url).subscribe(imageResult =>{
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
			if(postData[i].id == this.posts[0].id)
			{
				break;
			}
			else
			{
				let time = postData[i].timestamp;
				time = time.substring(0,10);
				let day = time.substring(time.lastIndexOf('-')+1);
				let mon_index = Number(time.substring(time.indexOf('-')+1,time.lastIndexOf('-')));
				let mon = this.months[mon_index - 1];
				let year = time.substring(0,time.indexOf('-'));
				let timestamp = day+'-'+mon+'-'+year;
				
				
				let image_src = 'assets/img/other.jpg';
				switch(postData[i].category){
				 case 'Trash' : image_src='assets/img/garbage.jpg';
								break;
				
				 case 'Street Light': image_src='assets/img/street_light.jpg';
									  break;
				  
				 case 'Damaged Road': image_src='assets/img/roads.jpg';
									   break;

				 case 'Traffic Problems': image_src='assets/img/traffic.png';
										   break;
											
				 case 'Homeless': image_src='assets/img/homeless.jpg';
								  break;	
				 
				}
				
				temp_posts[i] = {'id':postData[i].id,'title':postData[i].title,'category':postData[i].category,'timestamp':timestamp,'address':'','views':postData[i].views,'image':image_src,'upvotes':postData[i].upvotes,'is_otherCategory':postData[i].is_otherCategory,'stats':postData[i].status};			
			}
		}
		for(var i=0,j=temp_posts.length;i<this.posts.length;i++,j++)
		{
			this.posts[i].views = postData[j].views;
			this.posts[i].upvotes = postData[j].upvotes;
			this.posts[i].stats = postData[j].status;
			this.posts[i].title = postData[j].title;
			if(this.posts[i].is_otherCategory)
				 {
					let i1=i; 
					let url = 'https://citysavior.pythonanywhere.com/posts/api/post/image/get/'+postData[j].id+'/';
					
					this.http.get(url).subscribe(imageResult =>{
						let img = imageResult.json();
						if(img.length != 0)
						{
							this.posts[i1].image='https://citysavior.pythonanywhere.com'+img[0].image_url;
							
						}else{
							this.posts[i1].image = 'assets/img/other.jpg';
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
			let url='https://maps.googleapis.com/maps/api/geocode/json?latlng='+postData[i].lat+','+postData[i].lon+'&key=AIzaSyAUA6Q7vN-9u7rW4qyKb4i8KYbCo6gzBSE&sensor=true';
			
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
			 
			if(temp_posts[i].is_otherCategory)
			 {
				let url = 'https://citysavior.pythonanywhere.com/posts/api/post/image/get/'+temp_posts[i].id+'/';
				
				this.http.get(url).subscribe(imageResult =>{
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
    
	let url = 'https://citysavior.pythonanywhere.com/posts/api/member/'
	
	this.http.get(url).subscribe( result =>{
	    
		this.spinnerHidden = true;
		
		Toast.show('Cannot connect to server. Please try again later','3000','center').subscribe(toast=>{
						
		}, error=>{
						
		});
		
	 }, error=>{
			
			this.spinnerHidden = true;
			
			Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
			
		});
   });
  }
  
}
