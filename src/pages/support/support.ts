import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { NativeStorage, Toast } from 'ionic-native';
import { Http, Headers, RequestOptions } from '@angular/http';


@Component({
  selector: 'page-user',
  templateUrl: 'support.html'
})
export class SupportPage {

  submitted: boolean = false;
  supportMessage: string;
  user:any;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
	public http:Http
  ) {

  }

  submit(form) {
    this.submitted = true;

    if (form.valid) {
	
		let url ='https://citysavior.pythonanywhere.com/posts/api/sendSupportMessage/';
		let body = JSON.stringify({'email':this.user.email,'message':this.supportMessage});
		let headers = new Headers({'Content-Type': 'application/json'});
		let options = new RequestOptions({ headers:headers});
		this.http.post(url,body,options).subscribe((result)=>{
				if(result.status == 201)
				{
					Toast.show('Thank you for your feedback','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});

					this.supportMessage = ''; 
					this.submitted = false;
				}
		},error=>{
			let url='https://citysavior.pythonanywhere.com/posts/api/member/';
			this.http.get(url).subscribe( result =>{
				
				Toast.show('Cannot connect to server. Please try again later','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});

				this.submitted = false;
			},error=>{
				
				Toast.show('Please check your Internet connection','3000','center').subscribe(toast=>{
						
					}, error=>{
						
					});

				this.submitted = false;
			});	
		});
    }
  }
  
  ionViewCanEnter(){
    let env = this;
    NativeStorage.getItem('user')
    .then((data) =>{
      env.user = {
        name: data.name,
        picture: data.picture,
		email: data.email,
		phone : data.phone,
		karma_points : data.karma_points,
		login : data.login
      };  
    }).catch((error) =>{
      
    });
  }

  // If the user enters text in the support question and then navigates
  // without submitting first, ask if they meant to leave the page
  ionViewCanLeave(): boolean | Promise<boolean> {
    // If the support message is empty we should just navigate
    if (!this.supportMessage || this.supportMessage.trim().length === 0) {
      return true;
    }

    return new Promise((resolve: any, reject: any) => {
      let alert = this.alertCtrl.create({
        title: 'Leave this page?',
        message: 'Are you sure you want to leave this page? Your support message will not be submitted.'
      });
      alert.addButton({ text: 'Stay', handler: reject });
      alert.addButton({ text: 'Leave', role: 'cancel', handler: resolve });

      alert.present();
    });
  }
}
