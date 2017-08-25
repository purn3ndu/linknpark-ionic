import { Component} from '@angular/core';

import { NavController, Platform, NavParams, App, Events,AlertController } from 'ionic-angular';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarkerOptions, GoogleMapsMarker,GoogleMapsAnimation, NativeStorage,Diagnostic, LocationAccuracy,Toast } from 'ionic-native';

import { Http, Headers, RequestOptions } from '@angular/http';
import { PostdetailPage } from '../postdetail/postdetail';

import { Storage } from '@ionic/storage';

import {Params} from '../../providers/params';
import {Camera, File} from 'ionic-native';

import { IssuePostPage } from '../issue-post/issue-post';


 
@Component({
  selector: 'map-page',
  templateUrl: 'map.html'
})
export class MapPage {
    
    postHide:boolean =true;	
    data : any = [];
	sorted_index : any =[];
	markers =[] ;
    map: GoogleMap;
    postMarker : GoogleMapsMarker;
	currLocation : GoogleMapsLatLng = null;
    lastLocation : GoogleMapsLatLng = null;
    lastZoom : number = null;	
	loading : any;
	autocomplete : any;
	myInput : string ='';
	pinColor: string ='danger';
	user:any;
	reg_id:string;
	isHidden : boolean = false;
	
	newMarker: any;

	checkPermissionCalled : boolean ;
	
	cameraDisabled : boolean = false;
	
    constructor(public navCtrl: NavController, 
	public platform: Platform, 
	public navParams: NavParams,
	private http : Http,
	public alertCtrl: AlertController,
	private app: App,
	public events: Events,
	public storage: Storage,
	public params: Params) {
     
	 platform.ready().then(() => {
		 
		this.newMarker= navParams.get('params'); 
			
		this.platform.resume.subscribe(() => {
			
			this.resumeCalled();
			
		});	
	 
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
	 this.storage.get('Registration_key')
		.then((reg_id)=>{
			this.reg_id = reg_id;
			this.loadMap();
		});	
	}).catch((error) =>{

    });
	
	  
	 
	});

	 events.subscribe('issue-posted',(message) =>{
	   
	   this.pinColor = 'danger';
	   this.postHide = true;
	
	   this.map.animateCamera({

		'target': this.currLocation,
        'zoom': this.lastZoom,
        'duration' : 100,
		'tilt':40,
        'bearing': 0
       }).then(() => {
	    this.getVisibleRegion();
		});
	 });
   	 
    }
	
	onInput(event)
	{
	 
	  if(this.myInput == '')
	   {
	     this.map.setClickable(true);
	   }
	   else
	   {
	   this.map.setClickable(false);
	   }
	}
	
	onBlur(event)
	{
	 
	 this.map.setClickable(true);
	 
	}
	
	
	onClear(event)
	{
		this.myInput = '';
		this.onInput(event);	
	}
	
 
    loadMap(){
	
	let from_device=null;
	
	if(this.platform.is('android'))
	{
		from_device='android';
	}
	else if(this.platform.is('ios'))
	{
		from_device = 'ios';
	}
	
	let url='https://citysavior.pythonanywhere.com/posts/api/checkOrCreateFCMDevice/';
	let body = JSON.stringify({'email':this.user.email,'reg_id':this.reg_id,'device':from_device});
	let headers = new Headers({'Content-Type': 'application/json'});
	let options = new RequestOptions({ headers:headers});
	this.http.post(url,body,options).subscribe(result=>{
	
	},error=>{
	
	});
	
	this.map = new GoogleMap('map', {
      'backgroundColor': 'white',
      'controls': {
	    'compass' : true,
        'myLocationButton' : true,
		'indoorPicker': true,
        'zoom': true
      },
      'gestures': {
        'scroll': true,
        'tilt': true,
        'rotate': true,
        'zoom': true
      }
    });
	
	this.map.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK).subscribe(() => {				
	  this.getMyLocation();				
	});

	let elem = <HTMLInputElement>document.getElementsByClassName('searchbar-input')[0];
	this.autocomplete = new google.maps.places.Autocomplete(elem);
	
	this.autocomplete.addListener('place_changed',() =>{
	   this.map.setClickable(true);
	   var place = this.autocomplete.getPlace();
	   if(!place.geometry)
	   {
	
		 return;
	   }
	   if(place.geometry)
	   { 
	    let userLocation = new GoogleMapsLatLng(place.geometry.location.lat(),place.geometry.location.lng());
		
		
		this.map.animateCamera({
		'target': userLocation,
        'zoom': 17,
		'duration' : 2000,
		'tilt':40,
		'bearing': 0
       });
	
	   }
	  });
	
    
     this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
	  
	  Diagnostic.isLocationAuthorized().then(locAuth =>{
		  		  
		  if(this.newMarker!= undefined && this.newMarker.userEnter=='push'){
			  
				this.checkPermissionCalled = true;
					
				let url = 'https://citysavior.pythonanywhere.com/posts/api/post/'+this.newMarker.post_id+'/';
				this.http.get(url).subscribe( result => {
					if(result.status == 200)
						{
							let resultData = result.json();
							let newLatStr = resultData.lat;
					        let newLngStr = resultData.lon;
							let newLat  = Number(newLatStr);
					        let newLng = Number(newLngStr);
							this.lastLocation = new GoogleMapsLatLng(newLat,newLng);

							let loc = new GoogleMapsLatLng(newLat,newLng);
							this.map.animateCamera({

								'target': loc,
						        'zoom': 17,
						        'duration' : 1000,
								'tilt':40,
						        'bearing': 0
					       }).then(() => {
							    this.getVisibleRegion();
						   });
						   
						}
				}, error=>{
						
					});
		  }else{		
		  
		  if(locAuth)
		  {
			
			this.checkPermission('loadMap');
		  
		  }else{

		  	// For first time enter. Should also be extended to detect later changes in location permission by user.				
		  		Diagnostic.registerLocationStateChangeHandler((state) =>{				
		  			console.log("Location state changed to : " + state);				
				    let from_device=null;				
		  			if(this.platform.is('android'))				
					{				
						from_device='Android';				
					}				
					else if(this.platform.is('ios'))				
					{				
						from_device = 'iOS';				
					}				
				    if((from_device === "Android" && state !== Diagnostic.locationMode.LOCATION_OFF)				
				        || (from_device === "iOS") && ( state === 'authorized_when_in_use'				
				            || state === Diagnostic.permissionStatus.GRANTED_WHEN_IN_USE				
				    )){				
				        console.log("Location is available now!");				
				    	console.log('Calling user location method');				
				    	this.checkPermission('loadMap');				
				    }else{				
				    	console.log("Location is still not available now!");				
				    }				
		  							
			});
			  
			  this.checkPermissionCalled = true;
			  
		  this.map.getCameraPosition().then((position) => {
			let locStr = position.target.toString();
			let latStr = locStr.substring(0,locStr.indexOf(','));
			let lngStr = locStr.substring(locStr.indexOf(',') + 1);
			let postlat  = Number(latStr);
			let postlng = Number(lngStr);
			let loc = new GoogleMapsLatLng(postlat,postlng);
			this.currLocation = loc;
			this.lastLocation = loc;
			this.lastZoom = 1;
			
			// url changed - Response changed
			let url = 'https://citysavior.pythonanywhere.com/posts/api/notificationarea/'+this.user.email+'/';
			this.http.get(url).subscribe( result => {
			if(result.status == 200)
			{
				
				let resultData = result.json();
				if(resultData.length == 0 )
				{
					// url changed - post request to Notification List class view to create a new area
					let url = 'https://citysavior.pythonanywhere.com/posts/api/notificationarea/';
					let body = JSON.stringify({'email':this.user.email,'cen_lat':loc.lat,'cen_lon':loc.lng,'radius':2,'user_set':false});
					let headers = new Headers({'Content-Type': 'application/json'});
					let options = new RequestOptions({ headers:headers});
					this.http.post(url,body,options).subscribe(result=>{
			
					},error=>{
			
					});	
						
				}
			}
			}, error=>{
			
			});
			
			
			this.getVisibleRegion();

		}).catch((error) => {

		});
	  }
		  }
	  });
	  
	});
	
	this.map.on(GoogleMapsEvent.CAMERA_CHANGE).subscribe(() =>{
	 
	 
	 this.cameraLocationChange();
	});
	
	this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe(() => {
		let activeElement = <HTMLElement>document.activeElement;
		activeElement && activeElement.blur && activeElement.blur();
	
	});
	

  }
  
  getMyLocation(){
   
	  this.checkPermission('myLocationBtn');	
  }
  
  getUserLocation(called:string) {
   
		
		this.map.getMyLocation().then(myLoc=>{
       
			let newLat  = Number(myLoc.latLng.lat.toString());
	        let newLng = Number(myLoc.latLng.lng.toString());
			let userLocation = new GoogleMapsLatLng(newLat,newLng);
	    
	
     this.currLocation = userLocation;	
	 this.lastLocation = userLocation;
	 
	 
	 if(this.lastZoom == null)
	 {
	 this.lastZoom = 17;
	 }
      
      this.map.animateCamera({
     
		'target': userLocation,
        'zoom': 17,
        'duration' : 2000,
		'tilt':40,
        'bearing': 0
      }).then(() => {
		  
		  
	  if(called == 'cameraBtn')
	  {
		  this.checkPermissionCalled = false;
		  
		  this.startCamera(userLocation);
		  
	  }else{
	  
	  // url changed - Reponse changed
	  let url = 'https://citysavior.pythonanywhere.com/posts/api/notificationarea/'+this.user.email+'/';
		this.http.get(url).subscribe( result => {
			if(result.status == 200)
			{
				
				let resultData = result.json();
				if(!(resultData[0].user_set))
				{
					// url changed - patch request to NotificationDetail class view to update the area
					let url = 'https://citysavior.pythonanywhere.com/posts/api/notificationarea/'+resultData[0].notification_id+'/';
					let body = JSON.stringify({'cen_lat':this.currLocation.lat,'cen_lon':this.currLocation.lng,'radius':2});
					let headers = new Headers({'Content-Type': 'application/json'});
					let options = new RequestOptions({ headers:headers});
					this.http.patch(url,body,options).subscribe(result=>{
			
					},error=>{
			
					});	
						
				}
			}
		}, error=>{
			
		});
	  
	  this.getVisibleRegion();
	  }
	  });

    }).catch((error) => {	
		
 
    });
  }
  
  cameraLocationChange()
  {
	let activeElement = <HTMLElement>document.activeElement;
	activeElement && activeElement.blur && activeElement.blur();
	if(this.lastLocation !=null || this.lastZoom !=null)
	{		
	
    this.map.getCameraPosition().then((position) => {
	 let locStr = position.target.toString();
	 let latStr = locStr.substring(0,locStr.indexOf(','));
	  let lngStr = locStr.substring(locStr.indexOf(',') + 1);
	  let lat  = Number(latStr);
	  let lng = Number(lngStr);
	  let loc = new GoogleMapsLatLng(lat,lng);


	  let currZoom = position.zoom;
	  if(Math.abs(currZoom - this.lastZoom) > 0)
	  {
	    if(Math.abs(currZoom - this.lastZoom) > 2)
		{
		  
		  this.isHidden = true;
		  this.lastZoom = currZoom;
		  this.map.getCameraPosition().then((position) => {

		   let newLocStr = position.target.toString();
			let newLatStr = newLocStr.substring(0,newLocStr.indexOf(','));
	        let newLngStr = newLocStr.substring(newLocStr.indexOf(',') + 1);
	        let newLat  = Number(newLatStr);
	        let newLng = Number(newLngStr);
			this.lastLocation = new GoogleMapsLatLng(newLat,newLng);
			this.getVisibleRegion();
		  });
		}
	  }
	  else
	  {
	    this.map.getVisibleRegion().then((visibleRegion) => {
		  let neStr = visibleRegion.northeast.toUrlValue();
		  let neLat = Number(neStr.substring(0,neStr.indexOf(',')));
		  let neLng = Number(neStr.substring(neStr.indexOf(',') + 1));
		  let swStr = visibleRegion.southwest.toUrlValue();
		  let swLat = Number(swStr.substring(0,swStr.indexOf(',')));
		  let swLng = Number(swStr.substring(swStr.indexOf(',') + 1));
		  
		  let lat_diff = Math.abs(neLat-swLat);
		  let lng_diff = Math.abs(neLng-swLng);
		  
		  if(Math.abs(this.lastLocation.lat - loc.lat) > lat_diff/3 || Math.abs(this.lastLocation.lng - loc.lng ) > lng_diff/3)
		  {
		      

			  this.lastLocation = loc;
			  this.isHidden = true;
			
			  let lat_max = 0;
		      let lat_min =0;
		      let lng_max = 0;
		      let lng_min = 0;
			  
			  if(neLat > swLat)
		      {
		        lat_max = neLat + (lat_diff/4);
		        lat_min = swLat - (lat_diff/4);
		      }
		      else
		      {
				lat_max = swLat + (lat_diff/4);
				lat_min = neLat - (lat_diff/4);
			  }
			  if(neLng > swLng)
			  {
				lng_max = neLng + (lng_diff/4);
				lng_min = swLng - (lng_diff/4);
			  }
			  else
			  {
				lng_max = swLng + (lng_diff/4);
				lng_min = neLng - (lng_diff/4);
			  }
			  this.searchNearby(lat_min,lat_max,lng_min,lng_max);
		  }
		});
	  }
	});
  }
 
 } 
 
  ionViewDidEnter()
  {


   GoogleMap.isAvailable().then((available) => {
    if(available)
    {
     if(this.currLocation != null)
	 {
		
	   
	   this.map.animateCamera({

		'target': this.currLocation,
        'zoom': this.lastZoom,
        'duration' : 2000,
		'tilt':40,
        'bearing': 0
       }).then(() => {
	    this.getVisibleRegion(); 
	});
	 }
	}
   });
  }
  
  ionViewWillLeave()
  {
	
	
	
	this.map.getCameraPosition().then((position) => {
	  let locStr = position.target.toString();
	  let latStr = locStr.substring(0,locStr.indexOf(','));
	  let lngStr = locStr.substring(locStr.indexOf(',') + 1);
	  let lat  = Number(latStr);
	  let lng = Number(lngStr);
	  let loc = new GoogleMapsLatLng(lat,lng);

	  this.currLocation = loc;
	  this.lastLocation = loc;
	  this.postHide = true;
	  this.pinColor = 'danger';

	}).catch((error) => {

   });
  }
  
  showpostIssueMarker()
  {
	if(!this.postHide)
	{
	  this.pinColor= 'danger';
	  this.postHide = true;
	}
	else
	{
	  this.pinColor= 'black';
	  this.postHide = false;
	}
   }
   postIssueMarker()
   {
  	this.map.getCameraPosition().then((position) => {
	 let locStr = position.target.toString();
	 let latStr = locStr.substring(0,locStr.indexOf(','));
	  let lngStr = locStr.substring(locStr.indexOf(',') + 1);
	  let postlat  = Number(latStr);
	  let postlng = Number(lngStr);
	  let loc = new GoogleMapsLatLng(postlat,postlng);
	  this.currLocation = loc;
	  this.lastLocation = loc;

	  this.app.getRootNav().push(IssuePostPage, {lat:postlat,lon:postlng,inputImage:null}, {animate: true, direction: 'forward'});
	}).catch((error) => {

   });
  }
  
  searchNearby(lat_min : number, lat_max : number, lng_min : number, lng_max : number)
  { 
	// url changed - Response changed
    let url = 'https://citysavior.pythonanywhere.com/posts/api/post_nearby/';
	let body = JSON.stringify({'min_lat': lat_min, 'min_lon': lng_min, 'max_lat': lat_max, 'max_lon': lng_max});
	
	let headers = new Headers({'Content-Type': 'application/json'});
	let options = new RequestOptions({ headers:headers});
	this.http.post(url,body,options).subscribe( result => {

	
	let i_previous = this.data.length;
	
	console.log('working 1');
	if(this.data.length == 0)
	{
		this.data = result.json();
		for(var index=0;index<this.data.length;index++)
		{
			this.sorted_index.push(index);
		}
	}
	else
	{
		let resultData = result.json();
		
		console.log('working 2');
		for(var n1=0;n1<resultData.length;n1++)
		{
			
			let low : number = 0;
			let high : number = this.data.length - 1;
			let mid : number = 0;
			while (low <= high)
			{	
				
				mid = Math.trunc((low + high)/2);
				
				if (this.data[this.sorted_index[mid]].id == resultData[n1].id)
				{
					low = high = mid;
					this.data[this.sorted_index[mid]].title = resultData[n1].title;
					this.markers[this.sorted_index[mid]].setTitle(this.data[this.sorted_index[mid]].title);
					if(this.newMarker!= undefined && this.newMarker.userEnter=='push' && this.data[this.sorted_index[mid]].id == this.newMarker.post_id){
						
						if(resultData[n1].status.toLowerCase() == 'archived')
						{
							this.data[this.sorted_index[mid]].status = resultData[n1].status;
							this.markers[this.sorted_index[mid]].setVisible(false);
							let normalJSON = {userEnter:'normal'};
							this.params.params=normalJSON;	  
							this.newMarker= this.params.params;
							this.app.getRootNav().push(PostdetailPage, {postID:this.data[this.sorted_index[mid]].id}, {animate: true, direction: 'forward'});
							
						}else{
								if(this.data[this.sorted_index[mid]].status != resultData[n1].status)
								{
									this.data[this.sorted_index[mid]].status = resultData[n1].status;
									let url = 'https://citysavior.pythonanywhere.com/posts/api/post/image/thumbnail/';
									let body = JSON.stringify({'post_id':this.data[this.sorted_index[mid]].id,'status':this.data[this.sorted_index[mid]].status});
									let headers = new Headers({'Content-Type': 'application/json'});
									let options = new RequestOptions({ headers:headers});
												
									let i1 = this.sorted_index[mid];
									let icon_img = null;
												console.log('working 3');
									this.http.post(url,body,options).subscribe(thumbnailResult=>{
										
										
										let thumbnail = thumbnailResult.json();
							  
										if(thumbnail.length != 0)
											{
														
												icon_img ='https://citysavior.pythonanywhere.com'+thumbnail[0].thumbnail_url;

											}else{
												switch(this.data[i1].category){
													case 'Trash' : icon_img='./assets/img/garbage_'+this.data[i1].status.toLowerCase()+'.png';
																	break;
																
													case 'Street Light': icon_img='./assets/img/street_light_'+this.data[i1].status.toLowerCase()+'.png';
																		break;
																  
													case 'Damaged Road': icon_img='./assets/img/roads_'+this.data[i1].status.toLowerCase()+'.png';
																		break;

													case 'Traffic Problems': icon_img='./assets/img/traffic_'+this.data[i1].status.toLowerCase()+'.png';
																			break;
																							
													case 'Homeless': icon_img='./assets/img/homeless_'+this.data[i1].status.toLowerCase()+'.png';
																	break;	
																 
													default : icon_img='./assets/img/other_'+this.data[i1].status.toLowerCase()+'.png';
																break;
													}		  
														  
											}
											console.log('working 4');
											let icon={
												
												url : icon_img
											};
											this.markers[i1].setIcon(icon);
											this.markers[i1].setVisible(true);
											//this.markers[i1].setAnimation(GoogleMapsAnimation.DROP);
											
											let normalJSON = {userEnter:'normal'};
											this.params.params=normalJSON;	  
											this.newMarker= this.params.params;
											this.app.getRootNav().push(PostdetailPage, {postID:this.data[i1].id}, {animate: true, direction: 'forward'});
											
									},error=>{
										console.log('working 5');
									});
								}else{
									console.log('working 6');
									this.markers[this.sorted_index[mid]].setVisible(true);
									//this.markers[this.sorted_index[mid]].setAnimation(GoogleMapsAnimation.DROP);
									let normalJSON = {userEnter:'normal'};
									this.params.params=normalJSON;	  
									this.newMarker= this.params.params;
									this.app.getRootNav().push(PostdetailPage, {postID:this.data[this.sorted_index[mid]].id}, {animate: true, direction: 'forward'});
								}
							}	
								
					}else{
						console.log('working 7');
						if(resultData[n1].status.toLowerCase() == 'archived')
						{
							this.data[this.sorted_index[mid]].status = resultData[n1].status;
							this.markers[this.sorted_index[mid]].setVisible(false);
						}else{
						
						if(this.data[this.sorted_index[mid]].status != resultData[n1].status){
						
							this.data[this.sorted_index[mid]].status = resultData[n1].status;	
							let url = 'https://citysavior.pythonanywhere.com/posts/api/post/image/thumbnail/';
							let body = JSON.stringify({'post_id':this.data[this.sorted_index[mid]].id,'status':this.data[this.sorted_index[mid]].status});
							let headers = new Headers({'Content-Type': 'application/json'});
							let options = new RequestOptions({ headers:headers});
										
							let i1 = this.sorted_index[mid];
							let icon_img = null;
										console.log('working 8');
							this.http.post(url,body,options).subscribe(thumbnailResult=>{
								let thumbnail = thumbnailResult.json();
								
													  
								if(thumbnail.length != 0)
									{
												
										icon_img ='https://citysavior.pythonanywhere.com'+thumbnail[0].thumbnail_url;

									}else{
										switch(this.data[i1].category){
											case 'Trash' : icon_img='./assets/img/garbage_'+this.data[i1].status.toLowerCase()+'.png';
															break;
														
											case 'Street Light': icon_img='./assets/img/street_light_'+this.data[i1].status.toLowerCase()+'.png';
																break;
														  
											case 'Damaged Road': icon_img='./assets/img/roads_'+this.data[i1].status.toLowerCase()+'.png';
																break;

											case 'Traffic Problems': icon_img='./assets/img/traffic_'+this.data[i1].status.toLowerCase()+'.png';
																	break;
																					
											case 'Homeless': icon_img='./assets/img/homeless_'+this.data[i1].status.toLowerCase()+'.png';
															break;	
														 
											default : icon_img='./assets/img/other_'+this.data[i1].status.toLowerCase()+'.png';
														break;
											}		  
												  
									}
									console.log('working 9');
									let icon={
										
										url : icon_img
									};
									this.markers[i1].setIcon(icon);
									this.markers[i1].setVisible(true);
									//this.markers[i1].set('icon',{'url':'https://citysavior.pythonanywhere.com'+thumbnail[0].thumbnail_url});
										},error=>{

										});
									
							}
						}	
						
					}
					break;
				}
				else if(resultData[n1].id > this.data[this.sorted_index[mid]].id )
				{
				
					low = mid + 1;
				}
				else 
				{
				
					high = mid -1;
				}
				
				console.log('working 10');
			
			}
			if(low > high)
			{
				var new_length = this.data.push(resultData[n1]);
				if(resultData[n1].id > this.data[this.sorted_index[mid]].id)
				{
					this.sorted_index.splice(mid+1,0,new_length-1);
			    }
				else 
				{
					this.sorted_index.splice(mid,0,new_length-1);
				}
		
			}				
		}
		
	}
	
	console.log('working 11');
	
	for(var i=i_previous;i < this.data.length;i++)
	{
		
	  let i1 = i;
	  let loc = new GoogleMapsLatLng(this.data[i].lat,this.data[i].lon);	  
	 
					
	  let icon_img = 'blue';
	  
		if(this.data[i].status.toLowerCase()!= 'archived')
		{
			switch(this.data[i].category){
				case 'Trash' : icon_img='./assets/img/garbage_'+this.data[i].status.toLowerCase()+'.png';
								break;
							
				case 'Street Light': icon_img='./assets/img/street_light_'+this.data[i].status.toLowerCase()+'.png';
									break;
							  
				case 'Damaged Road': icon_img='./assets/img/roads_'+this.data[i].status.toLowerCase()+'.png';
									break;

				case 'Traffic Problems': icon_img='./assets/img/traffic_'+this.data[i].status.toLowerCase()+'.png';
										break;
														
				case 'Homeless': icon_img='./assets/img/homeless_'+this.data[i].status.toLowerCase()+'.png';
								break;	
							 
				default : icon_img='./assets/img/other_'+this.data[i].status.toLowerCase()+'.png';
							break;
			}
		}	
					console.log('working 12');		
			let icon = {
				url : icon_img
				
			};
		
		if(this.newMarker!= undefined && this.newMarker.userEnter=='push' && this.data[i].id == this.newMarker.post_id){
			
				let markerOptions : GoogleMapsMarkerOptions = null;
				
				if(this.data[i].status.toLowerCase()=='archived')
				{	
					markerOptions  = {
						position : loc,
						title : this.data[i].title,
						icon : icon,
						//animation:GoogleMapsAnimation.DROP,
						visible: false		
					};
				}else{
						markerOptions  = {
							position : loc,
							title : this.data[i].title,
							icon : icon
					};	
				}
				console.log('working 13');
				let normalJSON = {userEnter:'normal'};
				this.params.params=normalJSON;	  
				this.newMarker= this.params.params;
				this.map.addMarker(markerOptions).then((marker: GoogleMapsMarker) =>{
						
					this.markers[i1]= marker;
					
					let i2 = i1;
					if(this.data[i1].status.toLowerCase()!='archived')
					{
							let url = 'https://citysavior.pythonanywhere.com/posts/api/post/image/thumbnail/';
							let body = JSON.stringify({'post_id':this.data[i1].id,'status':this.data[i1].status});
							let headers = new Headers({'Content-Type': 'application/json'});
							let options = new RequestOptions({ headers:headers});
							
							this.http.post(url,body,options).subscribe(thumbnailResult=>{
								let thumbnail = thumbnailResult.json();
		  
								  if(thumbnail.length != 0)
								  {
									
									let icon = {
										url : 'https://citysavior.pythonanywhere.com'+thumbnail[0].thumbnail_url
										
									};
									
									this.markers[i2].setIcon(icon);
									this.app.getRootNav().push(PostdetailPage, {postID:this.data[i2].id}, {animate: true, direction: 'forward'});
									//this.markers[i2].set('icon',{'url':'https://citysavior.pythonanywhere.com'+thumbnail[0].thumbnail_url});
								  }
							},error=>{

							});
					}		
					
					marker.getTitle();	
					marker.addEventListener(GoogleMapsEvent.INFO_CLICK).subscribe(() => {
						
						
						let postID=this.data[i1].id;
						
						this.app.getRootNav().push(PostdetailPage, {postID:postID}, {animate: true, direction: 'forward'});
						
					});
					console.log('working 14');
					this.map.animateCamera({

						'target': loc,
						'zoom': 17,
						'duration' : 1000,
						'tilt':40,
						'bearing': 0
					   });	

					marker.showInfoWindow();	
					if(this.data[i1].status == 'archived')
					{
						this.app.getRootNav().push(PostdetailPage, {postID:this.data[i1].id}, {animate: true, direction: 'forward'});
					}
				});
			  }else{

					console.log('working 15');
			  let markerOptions : GoogleMapsMarkerOptions = null;
			  
				if(this.data[i].status.toLowerCase() == 'archived')
				{
					markerOptions = {
					   position : loc,
					   title : this.data[i].title,
					   icon : icon,
					   visible : false
					};
				}else{
					markerOptions = {
					   position : loc,
					   title : this.data[i].title,
					   icon : icon
					};
				}
				console.log('working 16');
			  this.map.addMarker(markerOptions).then((marker: GoogleMapsMarker) =>{
				  
				  this.markers[i1]= marker;
				  
				  let i2 = i1;
				  if(this.data[i1].status !='archived')
				  {	
					let url = 'https://citysavior.pythonanywhere.com/posts/api/post/image/thumbnail/';
					let body = JSON.stringify({'post_id':this.data[i1].id,'status':this.data[i1].status});
					let headers = new Headers({'Content-Type': 'application/json'});
					let options = new RequestOptions({ headers:headers});
					this.http.post(url,body,options).subscribe(thumbnailResult=>{
						let thumbnail = thumbnailResult.json();

						if(thumbnail.length != 0)
						  {
							
							let icon = {
								url : 'https://citysavior.pythonanywhere.com'+thumbnail[0].thumbnail_url
								
							};
							
							this.markers[i2].setIcon(icon);
							//this.markers[i2].set('icon',{'url':'https://citysavior.pythonanywhere.com'+thumbnail[0].thumbnail_url});
						  }
					},error=>{
						
					});
				  }
				  console.log('working 17');
				marker.getTitle();
					marker.addEventListener(GoogleMapsEvent.INFO_CLICK).subscribe(() => {
						
						let postID=this.data[i1].id;
						
						this.app.getRootNav().push(PostdetailPage, {postID:postID}, {animate: true, direction: 'forward'});
						
				});
				
			  });
			 }
	}
			
			
				this.isHidden = false;
				this.checkPermissionCalled = false;
			
	}, err =>
	{
		console.log('working 17');
		let url='https://citysavior.pythonanywhere.com/posts/api/member/';
		this.http.get(url).subscribe( result =>{
	
				this.isHidden = false;
				this.checkPermissionCalled = false;
	
				Toast.show('Cannot connect to server. Please try again.','4000','center').subscribe(toast=>{
						
				}, error=>{
				
				});
			
		}, error=>{
	
				this.isHidden = false;
				this.checkPermissionCalled = false;
	
				Toast.show('Please check your Internet connection','4000','center').subscribe(toast=>{
						
				}, error=>{
				
				});
		});	
	});
  }
 
checkPermission(called : string)
{
	this.checkPermissionCalled = true; 
	
		if(called == 'loadMap')  // this will be called only when location authorization has been given when map is loaded
		{
				LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
					() => { // called when gps is on
				
		
						this.isHidden = true;
						
						Toast.show('Fetching location','2000','bottom').subscribe(toast=>{
						
						}, error=>{
						
						});
						this.getUserLocation(called);

					}).catch((error) => {  // called when gps is off and user denies the request to turn gps on
					
					
					this.map.getCameraPosition().then((position) => {
						let locStr = position.target.toString();
						let latStr = locStr.substring(0,locStr.indexOf(','));
						let lngStr = locStr.substring(locStr.indexOf(',') + 1);
						let postlat  = Number(latStr);
						let postlng = Number(lngStr);
						let loc = new GoogleMapsLatLng(postlat,postlng);
						this.currLocation = loc;
						this.lastLocation = loc;
						this.lastZoom = 1;
					
						//url changed - Response changed 
						let url = 'https://citysavior.pythonanywhere.com/posts/api/notificationarea/'+this.user.email+'/';
						this.http.get(url).subscribe( result => {
						if(result.status == 200)
						{
						
								let resultData = result.json();
								if(resultData.length == 0 )
								{
									// url changed - post request to NotificationList class view to create a area
									let url = 'https://citysavior.pythonanywhere.com/posts/api/notificationarea/';
									let body = JSON.stringify({'email':this.user.email,'cen_lat':loc.lat,'cen_lon':loc.lng,'radius':2,'user_set':false});
									let headers = new Headers({'Content-Type': 'application/json'});
									let options = new RequestOptions({ headers:headers});
									this.http.post(url,body,options).subscribe(result=>{
					
									},error=>{
					
									});	
								
								}
						}
						}, error=>{
				
						});
				
							this.getVisibleRegion();

						}).catch((error) => {
							
							this.checkPermissionCalled = false;

						});
					});	
				
			}else // called when location button is clicked
			{	
			Diagnostic.isLocationAuthorized().then(locAuth =>{ // called when user clicks my Location button and checks if authorization status for location permission
				if(locAuth)   // called when app is authorized for location permission
				{
					LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
						  () => { // called when gps is on
						   
								  if(called == 'myLocationBtn')
								  {
								  
									  this.isHidden = true;
									  
									  Toast.show('Fetching location','2000','bottom').subscribe(toast=>{
							
									}, error=>{
							
									});
									this.getUserLocation(called);
								  }
								  else
								  {
									  this.checkStoragePermission();
								  }
						   
						   }).catch((error) => {
							   
							   if(called == 'cameraBtn')
								{
									
									
									Toast.show('Location Permission is required to use this feature','2000','center').subscribe(toast=>{
						
									}, error=>{
						
									});
								}
							   
						   });
					
				}else
				{ // app requests for location authorization if location permission not given before
					Diagnostic.getLocationAuthorizationStatus().then((result) => {
		
					   switch(result){
						   
						 case "authorized_when_in_use": console.log("Permission granted previously IOS");
						
						 LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
						  () => {
									if(called == 'myLocationBtn')
									{
									  this.isHidden = true;
									  
										Toast.show('Fetching location','2000','bottom').subscribe(toast=>{
							
										}, error=>{
							
										});
									  
										this.getUserLocation(called);
									}
									else
									{
										this.checkStoragePermission();
									}
						   
						   }).catch((error) => {
								
								if(called == 'cameraBtn')
								{
									
									
									Toast.show('Location Permission is required to use this feature','2000','center').subscribe(toast=>{
						
									}, error=>{
						
									});
								}
								this.checkPermissionCalled = false;
						   });
						   break;
		  
							case Diagnostic.permissionStatus.DENIED: 
								
								if(called == 'cameraBtn')
								{
									
									
									Toast.show('Location Permission is required to use this feature','2000','center').subscribe(toast=>{
						
									}, error=>{
						
									});
								}
								this.checkPermissionCalled = false;
								break;

							case Diagnostic.permissionStatus.NOT_REQUESTED : 
								this.checkPermissionCalled = false;
								break;

							case "denied": console.log("Prompting user to grant location permission IOS");
								let locAlert = this.alertCtrl.create({
									title : 'Location Permission',
									subTitle : 'Location permission has been denied. Enable the Location permission manually from the Settings to access location',
									buttons: [{
										text: 'Ok',
										role: 'cancel',
										handler: () => {
											this.map.setClickable(true);
											this.checkPermissionCalled = false;
										}
									}]
								});
								this.map.setClickable(false);
								locAlert.present();
								break; 			
						}	
					}).catch(error=>{
							this.checkPermissionCalled = false;
						
					});		
				}
			});
			}
		
		
	
}

  
  resumeCalled()
  {
	  
	  
	  
  setTimeout(()=>{
  				
  				
  				this.newMarker= this.params.params;
				
				
				if(this.newMarker.userEnter=='push'){
					
				let url = 'https://citysavior.pythonanywhere.com/posts/api/post/'+this.newMarker.post_id+'/';
				this.http.get(url).subscribe( result => {
					if(result.status == 200)
						{
							let resultData = result.json();
							let newLatStr = resultData.lat;
					        let newLngStr = resultData.lon;
							let newLat  = Number(newLatStr);
					        let newLng = Number(newLngStr);
							this.lastLocation = new GoogleMapsLatLng(newLat,newLng);
							
							

							let loc = new GoogleMapsLatLng(newLat,newLng);
							this.map.animateCamera({

								'target': loc,
						        'zoom': 17,
						        'duration' : 1000,
								'tilt':40,
						        'bearing': 0
					       }).then(() => {
							    this.getVisibleRegion();
						   });
						   
						}
				}, error=>{
						
					});
				
					
				}else{
					if(!this.checkPermissionCalled)
					{
						this.getVisibleRegion();
					}
				}					
			},600);
  }
  
  getVisibleRegion()  // function to get the current visible region of map and then call search nearby function
  {
	  this.map.getVisibleRegion().then((visibleRegion) => {
				let neStr = visibleRegion.northeast.toUrlValue();
				let neLat = Number(neStr.substring(0,neStr.indexOf(',')));
				let neLng = Number(neStr.substring(neStr.indexOf(',') + 1));
				let swStr = visibleRegion.southwest.toUrlValue();
				let swLat = Number(swStr.substring(0,swStr.indexOf(',')));
				let swLng = Number(swStr.substring(swStr.indexOf(',') + 1));
		 
				let lat_diff = Math.abs(neLat-swLat);
				let lng_diff = Math.abs(neLng-swLng);
		 
				let lat_max = 0;
				let lat_min =0;
				let lng_max = 0;
				let lng_min = 0;
		 
				if(neLat > swLat)
				{
					lat_max = neLat + (lat_diff/4);
					lat_min = swLat - (lat_diff/4);
				}
				else
				{
					lat_max = swLat + (lat_diff/4);
					lat_min = neLat - (lat_diff/4);
				}
				if(neLng > swLng)
				{
					lng_max = neLng + (lng_diff/4);
					lng_min = swLng - (lng_diff/4);
				}
				else
				{
					lng_max = swLng + (lng_diff/4);
					lng_min = neLng - (lng_diff/4);
				}
	   
				this.isHidden = true;	
				this.searchNearby(lat_min,lat_max,lng_min,lng_max);
		});
  }
  
  
  cameraClick()
  {
	 
	this.checkPermission('cameraBtn');		
  }
  
  checkStoragePermission()
  {
	  Diagnostic.getPermissionAuthorizationStatus(Diagnostic.permission.READ_EXTERNAL_STORAGE).then(result=>{
		  

		  switch(result){
			  
			case Diagnostic.permissionStatus.GRANTED: 	
						this.cameraDisabled = true;
						this.isHidden = true;
						this.getUserLocation('cameraBtn');
						break;
			
			case Diagnostic.permissionStatus.DENIED : 
				Diagnostic.requestRuntimePermission(Diagnostic.permission.READ_EXTERNAL_STORAGE).then(result=>{
					
					
					switch(result){
					
					case Diagnostic.permissionStatus.GRANTED: 	
							this.cameraDisabled = true;
							this.isHidden = true;
							this.getUserLocation('cameraBtn');
							break;
			
					case Diagnostic.permissionStatus.DENIED : 
									
				
									
									Toast.show('Storage Permission is required to use this feature','2000','center').subscribe(toast=>{
						
									}, error=>{
						
									});
									this.checkPermissionCalled = false;
									break;
			
					case Diagnostic.permissionStatus.DENIED_ALWAYS : 
					
						let storageAlert = this.alertCtrl.create({
							title : 'Storage Permission',
							subTitle : 'Storage permission has been denied. Enable the Storage permission manually from the Settings to access files',
							buttons: [{
								text: 'Ok',
								role: 'cancel',
								handler: () => {
									this.map.setClickable(true);
									this.checkPermissionCalled = false;
							}
						}]
					});
						this.map.setClickable(false);
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
									this.map.setClickable(true);
									this.checkPermissionCalled = false;
							}
						}]
					});
				this.map.setClickable(false);
				storageAlert.present();
				break;
			
			case Diagnostic.permissionStatus.NOT_REQUESTED :
				Diagnostic.requestRuntimePermission(Diagnostic.permission.READ_EXTERNAL_STORAGE).then(result=>{
					
					
					switch(result){
					
					case Diagnostic.permissionStatus.GRANTED: 
							this.cameraDisabled = true;
							this.isHidden = true;
							this.getUserLocation('cameraBtn');
																break;
			
					case Diagnostic.permissionStatus.DENIED : 
									
									
									Toast.show('Storage Permission is required to use this feature','2000','center').subscribe(toast=>{
						
									}, error=>{
						
									});
									this.checkPermissionCalled = false;
									break;
			
					case Diagnostic.permissionStatus.DENIED_ALWAYS : 
						let storageAlert = this.alertCtrl.create({
							title : 'Storage Permission',
							subTitle : 'Storage permission has been denied. Enable the Storage permission manually from the Settings to access files',
							buttons: [{
								text: 'Ok',
								role: 'cancel',
								handler: () => {
									this.map.setClickable(true);
									this.checkPermissionCalled = false;
							}
							}]
						});
						this.map.setClickable(false);
						storageAlert.present();
					
						break;
					}
				});
				break;
				
		  } 
	  }).catch(error=>{
		  
		  this.cameraDisabled = true;
		  this.isHidden = true;
		  this.getUserLocation('cameraBtn');
		  
	  });
  }
  
  
  startCamera(userLocation : any)
  {
	 this.isHidden = false;
	 this.cameraDisabled = false;
	 let cameraOptions= {
		quality : 30,
		sourceType : Camera.PictureSourceType.CAMERA,
		encodingType : Camera.EncodingType.JPEG,
		saveToPhotoAlbum : false,
		correctOrientation : true
	};
	
	
	
	Camera.getPicture(cameraOptions).then((imagePath) =>{
    File.resolveLocalFilesystemUrl(imagePath).then((entry)=>{
	 entry.getMetadata(metaData=>{
	
		if((metaData.size/(1024*1024)) > 10)
		{
			Toast.show('Image size greater than 10 MB not allowed. Please try again','3000','center').subscribe(toast=>{
						
			}, error=>{
						
			});
		}
		else
		{
			this.app.getRootNav().push(IssuePostPage, {lat:userLocation.lat,lon:userLocation.lng,inputImage:imagePath}, {animate: true, direction: 'forward'});
		}
	 },error=>{
		
	 });
	});
	},err=>{
     
	});	
  }
  
}

