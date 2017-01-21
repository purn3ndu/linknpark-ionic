import { Component} from '@angular/core';

import { NavController, Platform, NavParams, LoadingController } from 'ionic-angular';
import { GoogleMap, GoogleMapsEvent, Geolocation, GoogleMapsLatLng, GoogleMapsMarkerOptions, GoogleMapsMarker } from 'ionic-native';

import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';



 
@Component({
  selector: 'map-page',
  templateUrl: 'map.html'
})
export class MapPage {
    
    postHide:boolean =true;	
    data : any = [];
	markers =[] ;
    map: GoogleMap;
    postMarker : GoogleMapsMarker;
	currLocation : GoogleMapsLatLng = null;
    lastLocation : GoogleMapsLatLng = null;
    lastZoom : number = null;	
	loading : any;
	
    constructor(public navCtrl: NavController, 
	public platform: Platform, 
	private navParams: NavParams,
	private http : Http,
	public loadingCtrl: LoadingController) {
        platform.ready().then(() => {
           // this.loadMap();
		 //  this.checkPermission();
		 this.loadMap();
        });
	this.loading = this.loadingCtrl.create({
      content : 'Fetching location'
	 });	
    }
	
 
    loadMap(){

    //let location = new GoogleMapsLatLng(-34.9290,138.6010);
	
    // 29.615056, -82.379833
    this.map = new GoogleMap('map', {
      'backgroundColor': 'white',
      'controls': {
        'compass': true,
        'myLocationButton': true,
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
	

    this.map.on(GoogleMapsEvent.MAP_READY).subscribe(() => {
      console.log('Map is ready!');
      this.loading.present();
	  this.getUserLocation();
	});
	
	this.map.on(GoogleMapsEvent.CAMERA_CHANGE).subscribe(() =>{
	 
	 console.log('Camera change event fired');
	 this.cameraLocationChange();
	});
	

  }
  
  getUserLocation() {
   
     
     let GeolocOptions = {
	  'maximumAge': 900000
	 }; 
	 
     Geolocation.getCurrentPosition(GeolocOptions).then((res) => {
       
	     let userLocation = new GoogleMapsLatLng(res.coords.latitude,res.coords.longitude);
	    
	
     this.currLocation = userLocation;	
	 this.lastLocation = userLocation;
	 this.lastZoom = 17;
	 
      
      this.map.animateCamera({
        //'target' : userLocation.latLng
		'target': userLocation,
        'zoom': 17,
        'duration' : 2000,
        'tilt': 30,
        'bearing': 50
      }).then(() => {
	  this.map.getVisibleRegion().then((visibleRegion) => {
	     
	     let neStr = visibleRegion.northeast.toUrlValue();
		 let neLat = Number(neStr.substring(0,neStr.indexOf(',')));
		 let neLng = Number(neStr.substring(neStr.indexOf(',') + 1));
		 let swStr = visibleRegion.southwest.toUrlValue();
		 let swLat = Number(swStr.substring(0,swStr.indexOf(',')));
		 let swLng = Number(swStr.substring(swStr.indexOf(',') + 1));
		 
		 
		 let lat_diff = (Math.abs(neLat-swLat))/4;
		 let lng_diff = (Math.abs(neLng-swLng))/4;
		 
		 let lat_max = 0;
		 let lat_min =0;
		 let lng_max = 0;
		 let lng_min = 0;
		 
		 if(neLat > swLat)
		 {
		  lat_max = neLat + lat_diff;
		  lat_min = swLat - lat_diff;
		 }
		 else
		 {
		  lat_max = swLat + lat_diff;
		  lat_min = neLat - lat_diff;
		 }
		 if(neLng > swLng)
		 {
		  lng_max = neLng + lng_diff;
		  lng_min = swLng - lng_diff;
		 }
		 else
		 {
		   lng_max = swLng + lng_diff;
		   lng_min = neLng - lng_diff;
		 }
	         			
  		this.searchNearby(lat_min,lat_max,lng_min,lng_max);
		});
	  });

	  
	  
    }).catch((error) => {
      console.log(error);
    });
  }
  
  cameraLocationChange()
  {
    this.map.getCameraPosition().then((position) => {
	 let locStr = position.target.toString();
	 let latStr = locStr.substring(0,locStr.indexOf(','));
	  let lngStr = locStr.substring(locStr.indexOf(',') + 1);
	  let lat  = Number(latStr);
	  let lng = Number(lngStr);
	  let location = new GoogleMapsLatLng(lat,lng);
	  let currZoom = position.zoom;
	  if(Math.abs(currZoom - this.lastZoom) > 0)
	  {
	    if(Math.abs(currZoom - this.lastZoom) > 2)
		{
		  this.loading = this.loadingCtrl.create({
           content : 'Fetching posts'
	      });
		  this.loading.present();
		  this.lastZoom = currZoom;
		  this.map.getCameraPosition().then((position) => {
		   console.log('fetch issues due to zoom');
		   let newLocStr = position.target.toString();
			let newLatStr = newLocStr.substring(0,newLocStr.indexOf(','));
	        let newLngStr = newLocStr.substring(newLocStr.indexOf(',') + 1);
	        let newLat  = Number(newLatStr);
	        let newLng = Number(newLngStr);
			this.lastLocation = new GoogleMapsLatLng(newLat,newLng);
			this.map.getVisibleRegion().then((visibleRegion) => {
			 let neStr = visibleRegion.northeast.toUrlValue();
		     let neLat = Number(neStr.substring(0,neStr.indexOf(',')));
		     let neLng = Number(neStr.substring(neStr.indexOf(',') + 1));
		     let swStr = visibleRegion.southwest.toUrlValue();
		     let swLat = Number(swStr.substring(0,swStr.indexOf(',')));
		     let swLng = Number(swStr.substring(swStr.indexOf(',') + 1));
			 
			 let lat_diff = (Math.abs(neLat-swLat))/4;
		     let lng_diff = (Math.abs(neLng-swLng))/4;
			 
			 let lat_max = 0;
		     let lat_min =0;
		     let lng_max = 0;
		     let lng_min = 0;
			 
			 if(neLat > swLat)
		      {
		        lat_max = neLat + lat_diff;
		        lat_min = swLat - lat_diff;
		      }
		     else
		      {
				lat_max = swLat + lat_diff;
				lat_min = neLat - lat_diff;
			  }
			 if(neLng > swLng)
			  {
				lng_max = neLng + lng_diff;
				lng_min = swLng - lng_diff;
			  }
			 else
			  {
				lng_max = swLng + lng_diff;
				lng_min = neLng - lng_diff;
			  }
			  
			  this.searchNearby(lat_min,lat_max,lng_min,lng_max);
			});
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
		  
		  let lat_diff = (Math.abs(neLat-swLat))/4;
		  let lng_diff = (Math.abs(neLng-swLng))/4;
		  
		  if(Math.abs(this.lastLocation.lat - location.lat) > lat_diff || Math.abs(this.lastLocation.lng - location.lng ) > lng_diff)
		  {
		      this.loading = this.loadingCtrl.create({
               content : 'Fetching posts'
	          });
		      this.loading.present();
			  let lat_max = 0;
		      let lat_min =0;
		      let lng_max = 0;
		      let lng_min = 0;
			  
			  if(neLat > swLat)
		      {
		        lat_max = neLat + lat_diff;
		        lat_min = swLat - lat_diff;
		      }
		      else
		      {
				lat_max = swLat + lat_diff;
				lat_min = neLat - lat_diff;
			  }
			  if(neLng > swLng)
			  {
				lng_max = neLng + lng_diff;
				lng_min = swLng - lng_diff;
			  }
			  else
			  {
				lng_max = swLng + lng_diff;
				lng_min = neLng - lng_diff;
			  }
			  this.searchNearby(lat_min,lat_max,lng_min,lng_max);
		  }
		});
	  }
	});
  }
 
  ionViewDidEnter()
  {
   console.log('ionViewDidEnter called');
   GoogleMap.isAvailable().then((available) => {
    if(available)
    {
     if(this.currLocation != null)
	 {
	   this.map.animateCamera({
        //'target' : userLocation.latLng
		'target': this.currLocation,
        'zoom': this.lastZoom,
        'duration' : 2000,
        'tilt': 30,
        'bearing': 50
       }).then(() => {
	   this.map.getVisibleRegion().then((visibleRegion) => {
	     
	     let neStr = visibleRegion.northeast.toUrlValue();
		 let neLat = Number(neStr.substring(0,neStr.indexOf(',')));
		 let neLng = Number(neStr.substring(neStr.indexOf(',') + 1));
		 let swStr = visibleRegion.southwest.toUrlValue();
		 let swLat = Number(swStr.substring(0,swStr.indexOf(',')));
		 let swLng = Number(swStr.substring(swStr.indexOf(',') + 1));
		 
		 console.log('NE Lat='+neLat+'neLng='+neLng+'swLat='+swLat+'swLng='+swLng);
		 console.log('curr loc='+this.currLocation);
		 let lat_diff = (Math.abs(neLat-swLat))/4;
		 let lng_diff = (Math.abs(neLng-swLng))/4;
		 
		 let lat_max = 0;
		 let lat_min =0;
		 let lng_max = 0;
		 let lng_min = 0;
		 
		 if(neLat > swLat)
		 {
		  lat_max = neLat + lat_diff;
		  lat_min = swLat - lat_diff;
		 }
		 else
		 {
		  lat_max = swLat + lat_diff;
		  lat_min = neLat - lat_diff;
		 }
		 if(neLng > swLng)
		 {
		  lng_max = neLng + lng_diff;
		  lng_min = swLng - lng_diff;
		 }
		 else
		 {
		   lng_max = swLng + lng_diff;
		   lng_min = neLng - lng_diff;
		 }
	         			
  		//this.searchNearby(lat_min,lat_max,lng_min,lng_max);
		});
	 });
	 }
	 
	 else
	 {
	   console.log('Fetching location');
	 }
	}
   });
  }
  
  showpostIssueMarker()
  {
    var el = document.getElementById("show");
	if(el.textContent == "Post")
	{
	 el.textContent = "Hide Post";
	 this.postHide = false;
	}
	else
	{
	 el.textContent = "Post";
	 this.postHide = true;
	}
   }
   postIssueMarker()
   {
  	this.map.getCameraPosition().then((position) => {
	 let locStr = position.target.toString();
	 let latStr = locStr.substring(0,locStr.indexOf(','));
	  let lngStr = locStr.substring(locStr.indexOf(',') + 1);
	  let lat  = Number(latStr);
	  let lng = Number(lngStr);
	  let location = new GoogleMapsLatLng(lat,lng);
	  
	  let markerOptions : GoogleMapsMarkerOptions = {
	  position: location,
      title: 'Post',
      icon : '#900' 
	  };
	  this.map.addMarker(markerOptions).then((marker: GoogleMapsMarker) => {
	  marker.showInfoWindow();
		this.postMarker = marker;
      });
	}).catch((error) => {
    console.log(error);
   });
   this.map.getVisibleRegion().then((visibleRegion) => {
	     console.log('North East'+ visibleRegion.northeast.toUrlValue());
		 console.log('SouthWest' + visibleRegion.southwest.toUrlValue());
	  });
  }
  
  searchNearby(lat_min : number, lat_max : number, lng_min : number, lng_max : number)
  { 
    let url = 'http://citysavior.pythonanywhere.com/posts/api/post_search_nearby/';
	let body = JSON.stringify({'min_lat': lat_min, 'min_lon': lng_min, 'max_lat': lat_max, 'max_lon': lng_max});
	
	let headers = new Headers({'Content-Type': 'application/json'});
	let options = new RequestOptions({ headers:headers});
	this.http.post(url,body,options).subscribe( result => {
	console.log(result.status);
	if(this.data.length > 0){
	 this.data.length =0;
	 this.markers.length =0;
	 }
	this.data = result.json();
     //console.log(JSON.stringify(this.data));
	
	for(var i=0;i < this.data.length;i++)
	{
	  let loc = new GoogleMapsLatLng(this.data[i].fields.lat,this.data[i].fields.lon);
	  let markerOptions : GoogleMapsMarkerOptions = {
	   position : loc,
	   title : this.data[i].fields.title,
	   icon : '#009' 
	  };
	  this.map.addMarker(markerOptions).then((marker: GoogleMapsMarker) =>{
	    
		this.markers.push(marker);
	    	marker.addEventListener(GoogleMapsEvent.INFO_CLICK).subscribe(() => {
		     for(var i=0;i<this.markers.length;i++)
			  {
			   if(marker == this.markers[i])
			   {
			     console.log('PK='+this.data[i].pk);
				 this.markers[i].getPosition().then((pos) => {
				  console.log('Location ='+pos.lat+","+pos.lng);
				 });
			   }
			  }			 
		});
	  });
	  
	}
	this.loading.dismiss();
	});
  }
  
  
}

