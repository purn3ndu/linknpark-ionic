import { Component } from '@angular/core';
import { MenuController, NavController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { Diagnostic, LocationAccuracy } from 'ionic-native';

@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})

export class TutorialPage {
  showSkip = true;

  constructor(
    public navCtrl: NavController,
    public menu: MenuController,
    public storage: Storage,
	public platform: Platform
  ) { }

  startApp() {
    this.checkPermission(LoginPage)
    //this.navCtrl.setRoot(LoginPage).then(() => {
     // this.storage.set('hasSeenTutorial', 'true');
    //})
  }

  onSlideChangeStart(slider) {
    this.showSkip = !slider.isEnd;
  }

  ionViewDidEnter() {
    // the root left menu should be disabled on the tutorial page
    this.menu.enable(false);
  }

  ionViewDidLeave() {
    // enable the root left menu when leaving the tutorial page
    this.menu.enable(true);
  }
  
  exit()
  {
    this.platform.exitApp();
  }
  
  checkPermission(page : any)
  {
	
	LocationAccuracy.canRequest().then((canRequest: boolean) => {
	if(canRequest){
	 LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
	 () => {
	   console.log('Request successful');
	   this.navCtrl.setRoot(page).then(() => {
      this.storage.set('hasSeenTutorial', 'true');
    });
	 }).catch((error) => {
	    this.exit();
	   console.log('Error in requesting permission'+error); 
	 });
	}
	else{
	  Diagnostic.requestLocationAuthorization().then((result) => {
	   switch(result){
	   
	   case "authorized_when_in_use": console.log("Permission granted previously IOS");
	     LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
		  () => {
		   console.log('Request Location authorization successful');
		   this.navCtrl.setRoot(page).then(() => {
             this.storage.set('hasSeenTutorial', 'true');
           });
		   }).catch((error) => {
		    console.log('Error requesting location permissions'+ error);
			this.exit();
		   });
		   break;

       case "denied": console.log("Prompting user to grant location permission IOS");
       alert("Please allow location access to City Savior app in your settings to proceed.")
       LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
       console.log('Request Location authorization successful');
       this.navCtrl.setRoot(page).then(() => {
             this.storage.set('hasSeenTutorial', 'true');
           });
       }).catch((error) => {
        console.log('Error requesting location permissions'+ error);
      this.exit();
       });
       break;

       case "not_determined": console.log("Asking user for permission IOS");
       LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
       console.log('Request Location authorization successful');
       this.navCtrl.setRoot(page).then(() => {
             this.storage.set('hasSeenTutorial', 'true');
           });
       }).catch((error) => {
        console.log('Error requesting location permissions'+ error);
      this.exit();
       });
       break;

       case Diagnostic.permissionStatus.GRANTED: console.log("Permission granted");
       LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
       console.log('Request Location authorization successful');
       this.navCtrl.setRoot(page).then(() => {
             this.storage.set('hasSeenTutorial', 'true');
           });
       }).catch((error) => {
        console.log('Error requesting location permissions'+ error);
      this.exit();
       });
       break;
		  
        case Diagnostic.permissionStatus.DENIED:  console.log("Permission denied");
            this.storage.set('hasSeenTutorial', 'true');
			this.exit();
			break;

        case Diagnostic.permissionStatus.NOT_REQUESTED : console.log("Permission not requested");
            this.storage.set('hasSeenTutorial', 'true');
			this.exit();
			break;

        case Diagnostic.permissionStatus.DENIED_ALWAYS:   console.log("Permission denied always");
            this.storage.set('hasSeenTutorial', 'true');
			this.exit();
			break; 			
	   }
	   console.log('Location Authorization '+ result)
	  }).catch((error) => {
	    console.error('The following error occurred: ' +error);
	  });
	}
	});
  }

}
