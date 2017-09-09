import { Component } from '@angular/core';
import { NavController, NavParams,Platform,LoadingController,App, AlertController } from 'ionic-angular';
import {NativeStorage, Geolocation, Diagnostic,LocationAccuracy, Toast} from 'ionic-native';
import { Http, Headers, RequestOptions } from '@angular/http';




@Component({
  selector: 'page-notification-area',
  templateUrl: 'notification-area.html'
})
export class NotificationAreaPage {
	
  map1:any ;
  userLocation: any;
  circle: any;
  autocomplete1 : any;
  inputAdd : string = '';
  changeNotification : boolean=false;  
  user:any;
  loading : any;
  userParams : any;
  radioText : string = '';

  
  
  constructor(public navCtrl: NavController, 
  public navParams: NavParams,
  public platform: Platform,
  public http:Http,
  public loadingCtrl: LoadingController,
  private alertCtrl:AlertController,
  public app:App) {
	platform.ready().then(() => {
	

	  NativeStorage.getItem('user')
    .then((data) => {
      this.user = {
        name: data.name,
        picture: data.picture,
		email: data.email,
		phone : data.phone,
		karma_points : data.karma_points,
		login : data.login
      };
		this.getArea();
	});
  });
 }
 	
	loadMap1(){
		
	
		let loc = new google.maps.LatLng(this.userLocation.lat,this.userLocation.lon);
	
		this.map1 = new google.maps.Map(document.getElementById('map1'),{
		backgroundColor : 'white',
		center : loc,
		zoom :13,
		mapTypeControl:false,
		overviewMapControl: false,
		streetViewControl:false
		});	
		
		
		this.circle = new google.maps.Circle({
		 center: new google.maps.LatLng(this.userLocation.lat,this.userLocation.lon),
		 radius:this.userLocation.radius,
		 strokeColor: '#008000',
		 strokeOpacity: 0.8,
		 fillColor: '#7CFC00',
		 fillOpacity : 0.35,
		 map: this.map1,
		 editable:false,
		 draggable:false
		});
		
		
	   this.map1.addListener('center_changed',()=>{
		   
			var cen = this.map1.getCenter();
			if(this.changeNotification)
			{
				this.circle.setCenter(cen);
            }    

	   });
	   
	   this.map1.addListener('drag',()=>{
		   
		   let activeElement = <HTMLElement>document.activeElement;
			activeElement && activeElement.blur && activeElement.blur();
		   
	   });
	   
	   
	   this.map1.addListener('click',()=>{
		
		   let activeElement = <HTMLElement>document.activeElement;
			activeElement && activeElement.blur && activeElement.blur();
	   });
	   
	   this.circle.addListener('click',()=>{
		   let activeElement = <HTMLElement>document.activeElement;
			activeElement && activeElement.blur && activeElement.blur();
		  
	   });
	   
	   let elem = <HTMLInputElement>document.getElementsByClassName('searchbar-input')[1];
	   		
		this.autocomplete1 = new google.maps.places.Autocomplete(elem);
		
		this.autocomplete1.addListener('place_changed',() =>{
		
		var place = this.autocomplete1.getPlace();
		if(!place.geometry)
			{
	    
		 return;
			}
		if(place.geometry)
			{ 
		
				loc = new google.maps.LatLng(place.geometry.location.lat(),place.geometry.location.lng());
				let options={
					backgroundColor : 'white',
					center : loc,
					zoom :15,
					mapTypeControl:false,
					overviewMapControl: false,
					streetViewControl:false
				};	
				this.map1.setOptions(options);
		
			}
		});

		
	}
	
	
	onClear(event)
	{
	
		this.inputAdd ='';
	}
	
	getMyLocation()
	{
	  
	  let GeolocOptions = {
	  'maximumAge': 900000
	 }; 
	 
	 
     Geolocation.getCurrentPosition(GeolocOptions).then((res) => {
		 
		 
       
	     let loc = new google.maps.LatLng(res.coords.latitude,res.coords.longitude);
		 let options={
					backgroundColor : 'white',
					center : loc,
					zoom :14,
					mapTypeControl:false,
					overviewMapControl: false,
					streetViewControl:false
				};	
				this.map1.setOptions(options);
			
		}).catch((error) => {
			
			
		
		});	
	   
	}
	
	changeNotificationArea()
	{
			if(this.changeNotification)
			{
				this.changeNotification = false;
				this.circle.setDraggable(false);
				this.circle.setEditable(false);
			}
			else{
				this.changeNotification = true;
				var cen = this.map1.getCenter();
				this.circle.setCenter(cen);
				this.circle.setDraggable(true);
				this.circle.setEditable(true);
		
	        }
	}
	
	updateNotificationArea()
	{
		var center = this.circle.getCenter();
		var radius = this.circle.getRadius()/1000;
		
		this.loading = this.loadingCtrl.create({
			content : 'Updating notification Area'
		});
		this.loading.present();
		
		// url changed - patch request to NotificationDetail class view
		let url = 'https://linknpark.pythonanywhere.com/posts/api/notificationarea/'+this.userLocation.notification_id+'/';
		let body = JSON.stringify({'cen_lat':center.lat(),'cen_lon':center.lng(),'radius':radius,'user_set':true});
		let headers = new Headers({'Content-Type': 'application/json'});
		let options = new RequestOptions({ headers:headers});
		this.http.patch(url,body,options).subscribe(result=>{
			if(result.status == 200)
			{
		
				
				this.loading.dismiss();
				
				Toast.show('Notification Area updated successfully','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});
				
				this.changeNotification = false;
				this.circle.setDraggable(false);
				this.circle.setEditable(false);
			 
			}
		},error=>{
			
			let url='https://linknpark.pythonanywhere.com/posts/api/member/'
			this.http.get(url).subscribe( result =>{
				this.loading.dismiss();
				
				Toast.show('Cannot connect to server. Please try again','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});
				 
			},error=>{
				this.loading.dismiss();
				
				Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
				}, error=>{
						
				});
				
			});
			
		});
	}
	
	getArea()
	{
		// url changed - Response changed
		let url = 'https://linknpark.pythonanywhere.com/posts/api/notificationarea/'+this.user.email+'/';
		this.http.get(url).subscribe( result => {
			if(result.status == 200)
			{
				let areaData = result.json();
				if(!(areaData[0].user_set))
				{
						this.radioText = 'Add Notification Area';
			
				}
				else
				{
					this.radioText = 'Update Notification Area';
				}
				this.userLocation = {
						lat: areaData[0].cen_lat,
						lon: areaData[0].cen_lon,
						radius : areaData[0].radius * 1000,
						notification_id : areaData[0].notification_id
					};
				this.loadMap1();
			}
		}, error=>{
			
			let url = 'https://linknpark.pythonanywhere.com/posts/api/member/'
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
	
checkPermission()
  {
	  
	Diagnostic.isLocationAuthorized().then(locAuth =>{ // called when user clicks my Location button and checks if authorization status for location permission
				if(locAuth)   // called when app is authorized for location permission
				{
					LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
						  () => { // called when gps is on
						   
								  Toast.show('Fetching location','2000','center').subscribe(toast=>{
						
									}, error=>{
												
									});
							
							this.getMyLocation();
						
						   
						   }).catch((error) => {
							   
						   });
				}
	else{
	  Diagnostic.requestLocationAuthorization().then((result) => {
	   switch(result){
	   
	   case Diagnostic.permissionStatus.GRANTED: 
	     LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
		  () => {
		   
			
			Toast.show('Fetching location','2000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
			
			this.getMyLocation();
		   
		   }).catch((error) => {
			   
			
		   });
		   break;
		  
        case Diagnostic.permissionStatus.DENIED:  
			
			break;

        case Diagnostic.permissionStatus.NOT_REQUESTED : 
            
			break;

        case Diagnostic.permissionStatus.DENIED_ALWAYS:   
            
			let locAlert = this.alertCtrl.create({
				title : 'Location Permission',
				subTitle : 'Location permission has been denied. Enable the Location permission manually from the Settings to access location',
				buttons: [{
					text: 'Ok',
					role: 'cancel',
					handler: () => {
						
					}
				}]
			});
			
			locAlert.present();
			
			break; 			
	   }
	  
	  }).catch((error) => {
		  
	  
	  });
	}
	
  });
  }
	
	
}
