import { Component, ViewChild } from '@angular/core';

import { Events, Nav, Platform } from 'ionic-angular';
import { Splashscreen, NativeStorage } from 'ionic-native';
import { Storage } from '@ionic/storage';

import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { SupportPage } from '../pages/support/support';
import { Diagnostic, LocationAccuracy } from 'ionic-native';

export interface PageInterface {
  title: string;
  component: any;
  icon: string;
  logsOut?: boolean;
  index?: number;
}

@Component({
  templateUrl: 'app.template.html'
})
export class CitysavApp {
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  appPages: PageInterface[] = [
    { title: 'Schedule', component: TabsPage, icon: 'calendar' },
    { title: 'Speakers', component: TabsPage, index: 1, icon: 'contacts' },
    { title: 'Map', component: TabsPage, index: 2, icon: 'map' },
    { title: 'Settings', component: TabsPage, index: 3, icon: 'information-circle' }
  ];
  loggedInPages: PageInterface[] = [
    { title: 'Account', component: AccountPage, icon: 'person' },
    { title: 'Support', component: SupportPage, icon: 'help' },
    { title: 'Logout', component: LoginPage, icon: 'log-out', logsOut: true }
  ];
  loggedOutPages: PageInterface[] = [
    { title: 'Login', component: LoginPage, icon: 'log-in' },
    { title: 'Support', component: SupportPage, icon: 'help' },
  ];
  rootPage: any;

  constructor(
    public events: Events,
    public platform: Platform,
    public storage: Storage
  ) {

    // Check if the user has already seen the tutorial
    this.storage.get('hasSeenTutorial')
      .then((hasSeenTutorial) => {
        if (hasSeenTutorial) {
          //this.rootPage = LoginPage;

            platform.ready().then(() => {
            // Here we will check if the user is already logged in
            // because we don't want to ask users to log in each time they open the app
            //let env = this;
            NativeStorage.getItem('user')
            .then((data) => {
              // user is previously logged and we have his data
              // we will let him access the app
            // env.nav.push(TabsPage);
			  this.checkPermission(TabsPage);
              Splashscreen.hide();
            }).catch((error) =>{
              //we don't have the user data so we will ask him to log in
             // env.nav.push(LoginPage);
			 this.checkPermission(LoginPage);
              Splashscreen.hide();
            });

            //StatusBar.styleDefault();
          });

        } else {
          this.rootPage = TutorialPage;
        }
        this.platformReady()
      })

  }

  openPage(page: PageInterface) {
    // the nav component was found using @ViewChild(Nav)
    // reset the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.index) {
      this.nav.setRoot(page.component, { tabIndex: page.index });

    } else {
      this.nav.setRoot(page.component).catch(() => {
        console.log("Didn't set nav root");
      });
    }

  }
  openTutorial() {
    this.nav.setRoot(TutorialPage);
  }

 
  platformReady() {
    // Call any initial plugins when ready
    this.platform.ready().then(() => {
      Splashscreen.hide();
    });
  }
  
  exit()
  {
    this.platform.exitApp();
  }
  
  checkPermission(page : any)
  {
    let env = this;
	
	LocationAccuracy.canRequest().then((canRequest: boolean) => {
	if(canRequest){
	 LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
	 () => {
	   console.log('Request successful');
	   env.nav.push(page);
	 }).catch((error) => {
	    this.exit();
	   console.log('Error in requesting permission'+error); 
	 });
	}
	else{
	  Diagnostic.requestLocationAuthorization().then((result) => {
	   switch(result){

       case "not_determined": console.log("Asking user for permission IOS");
       LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
       console.log('Request Location authorization successful');
       env.nav.push(page);
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
       env.nav.push(page);
       }).catch((error) => {
        console.log('Error requesting location permissions'+ error);
      this.exit();
       });
       break;

       case "authorized_when_in_use": console.log("Permission granted previously IOS");
       LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
       console.log('Request Location authorization successful');
       env.nav.push(page);
       }).catch((error) => {
        console.log('Error requesting location permissions'+ error);
      this.exit();
       });
       break;
	   
	   case Diagnostic.permissionStatus.GRANTED: console.log("Permission granted");
	     LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
		  () => {
		   console.log('Request Location authorization successful');
		   env.nav.push(page);
		   }).catch((error) => {
		    console.log('Error requesting location permissions'+ error);
			this.exit();
		   });
		   break;
		  
        case Diagnostic.permissionStatus.DENIED:  console.log("Permission denied");
            this.exit();
			break;

        case Diagnostic.permissionStatus.NOT_REQUESTED : console.log("Permission not requested");
            this.exit();
			break;

        case Diagnostic.permissionStatus.DENIED_ALWAYS:   console.log("Permission denied always");
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
