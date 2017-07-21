import { Component, ViewChild } from '@angular/core';

import { Events, Nav, Platform,ToastController } from 'ionic-angular';
import { Splashscreen, NativeStorage,GooglePlus } from 'ionic-native';
import { Storage } from '@ionic/storage';

import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { SupportPage } from '../pages/support/support';

import {Push} from 'ionic-native';

import {Params} from '../providers/params';

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
  
  pushJSON :any = {userEnter:'normal',post_id:null,'app_running':false};

  constructor(
    public events: Events,
    public platform: Platform,
    public storage: Storage,
	private toastCtrl:ToastController,
	public params: Params
  ) {

    // Check if the user has already seen the tutorial
    this.storage.get('hasSeenTutorial')
      .then((hasSeenTutorial) => {
		
        if (hasSeenTutorial) {

            platform.ready().then(() => {
            // Here we will check if the user is already logged in
            // because we don't want to ask users to log in each time they open the app
            
			
			setTimeout(()=>{
			
			NativeStorage.getItem('user')
            .then((data) => {
              // user is previously logged and we have his data
              // we will let him access the app
            
				
			  if(data.login == 'Google')
			  {
			    GooglePlus.trySilentLogin({
				 'webClientId':'779544737688-0ne0prma7njtqk2g4dj4g9mii126dcru.apps.googleusercontent.com'
				}).then((res) =>{
				
						
						if(this.pushJSON.userEnter == 'normal')
						{
						
						this.nav.push(TabsPage);
						
						}
						else
						{
						
							this.nav.push(TabsPage,{params:this.pushJSON});
						}
				}, (error) =>{
						
						let toast = this.toastCtrl.create({
							message : 'Please check your Internet connection',
							duration : 5000,
							position:'middle'
						});
						toast.present(); 
				});
			  }
			  else{
					
					if(this.pushJSON.userEnter == 'normal')
					{
					
					
						this.nav.push(TabsPage);
					}
					else
					{
					
						this.nav.push(TabsPage,{params:this.pushJSON });
					}
			  }
              Splashscreen.hide();
            }).catch((error) =>{
              //we don't have the user data so we will ask him to log in
			 
			 if(this.pushJSON.userEnter == 'normal')
			 {
			 let normalJSON = {userEnter:'normal'};
			 
			 this.nav.push(LoginPage,{params:normalJSON});
			 }
			 else
			 {
			
				this.nav.push(LoginPage,{params:this.pushJSON});
			 }
              Splashscreen.hide();
            });
			},200);
            
          });

        } else {
          this.rootPage = TutorialPage;
		  
        }
        this.platformReady()
      });

  }

  openPage(page: PageInterface) {
    // the nav component was found using @ViewChild(Nav)
    // reset the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.index) {
      this.nav.setRoot(page.component, { tabIndex: page.index });

    } else {
      this.nav.setRoot(page.component).catch(() => {
        
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
	  
	  //Push notification
			
			Push.hasPermission().then(perm=>{
				
			});
			
			let push = Push.init({
				android:{
					senderID:'779544737688',
					forceShow:true,
					icon:'notif',
					sound:true,
					vibrate:true
				},
				ios:{
					alert:'true',
					badge:false,
					sound:'true'
				},
				windows:{}	
			});
			
			push.on('registration',(data)=>{
				
				this.storage.set('Registration_key', data.registrationId);
			});
			
			push.on('notification',(data)=>{
				
				let additionalReceived = JSON.parse(JSON.stringify(data.additionalData));
				
				if(data.additionalData.coldstart)
				{
					// If the app is starting from push notification we only need to set the parameter 
					// as the default call method would send the set parameter to the new pages.
					
					this.pushJSON = {userEnter:'push',post_id:additionalReceived.post,'app_running':false};
					this.params.params=this.pushJSON;
					
					
				}
				else
				{
					if (data.additionalData.foreground) {

						//if app running in foreground

						

						// show notification in a non intrusive way. Though depends on priority of message.

					}else{

						// if app running in background, update params service.

						// its the responsibility of the page to check for entry method 
						// from updated parameters after resume and thus
						// correspondingly show notification contents if present.

						this.pushJSON = {userEnter:'push',post_id:additionalReceived.post,'app_running':true};

						this.params.params=this.pushJSON;

						

					}
					
				}
			});
			
			
			
			push.on('error',(e)=>{
				
			});
    });
  }
  
  
  
}
