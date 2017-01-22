import { Component } from '@angular/core';

import { NavController, NavParams  } from 'ionic-angular';



import {NativeStorage } from 'ionic-native';


import { Http, Headers, RequestOptions } from '@angular/http';

import { TabsPage } from '../tabs/tabs';

import {Camera} from "ionic-native";

declare var Clarifai : any;

var useremail;

var env;

var folderOptions = {
    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
    destinationType: Camera.DestinationType.DATA_URL,      
    quality: 100,
    targetWidth: 300,
    targetHeight: 300,
    encodingType: Camera.EncodingType.JPEG,      
    correctOrientation: true
};

var cameraOptions = {
    quality : 75,
    destinationType : Camera.DestinationType.DATA_URL,
    sourceType : Camera.PictureSourceType.CAMERA,
    allowEdit : true,
    encodingType: Camera.EncodingType.JPEG,
    targetWidth: 300,
    targetHeight: 300,
    saveToPhotoAlbum: false
};


@Component({
  selector: 'page-post',
  templateUrl: 'post.html'
})



export class IssuePostPage {


  user: any;
  userReady: boolean = false;

  public base64Image: string;
    public imageTags: string;
    public app: any;
    public tags: string = "Tags: ";
    public lat : any;
    public lon : any;
    public title = 'test';
    public desc = 'test';
    public category = 'other';
    public email = 'purnendurocks@gmail.com'

  constructor(public navCtrl: NavController, private http : Http, public params:NavParams) {
      this.lat = params.get("lat");
      this.lon = params.get("lon") ;

      //alert(this.lat);
      //alert(this.lon);



    this.base64Image = "https://placehold.it/150x150";
        this.imageTags = "";
        console.log("haha");
        this.app = new Clarifai.App(
          'OTGj6hMz_MJdIFld4q91EmNMuxqR_ttUq7FF83YI',
          '_yIdO28TNqonDVoz6jDJFcbrTQA9bSm-hSDbJNR_'
        );
        console.log(this.app);
  }

  public takePicture(typ: string) {
        var category = [];
        var categoryNames = ['Trash', 'Street Light', 'Broken Road', 'Traffic Problems', 'Homeless'];
        category.push(["garbage", "trash", "waste", "litter", "recycle", "disposal"]);
        category.push(["streetlight", "lamp", "lantern", "post", "dark"]);
        category.push(["road", "street", "pavement", "asphalt", "pothole"]);
        category.push(["traffic", "road", "car", "highway", "vehicle", "light"]);
        category.push(["people", "adult", "animal", "mammal", "fatigue", "poor"]);
        var finalCategoryCount = [0,0,0,0,0];

        var self = this;
        var options = typ === "camera" ? cameraOptions : folderOptions;
        Camera.getPicture(options).then(imageData => {
            this.base64Image = "data:image/jpeg;base64," + imageData;
            //alert(imageData);
            this.app.models.predict(Clarifai.GENERAL_MODEL, imageData).then(
              function(response) {
                //alert(response);
                console.log(response);
                if(response.data.status.code == 10000){
                    self.tags = "";
                    response.data.outputs[0].data.concepts.forEach(function(concept) {
                        self.imageTags += concept.name + " : " + concept.value + "\n";
                        self.tags += concept.name + "    ";

                        category.forEach(function(valu, index) {
                            valu.forEach(function(val) {
                                if(concept.name.toLowerCase() == val){
                                    finalCategoryCount[index] += concept.value;
                                }
                            });
                        });
                    });
                    var maxValue = 0;
                    var maxIndex = 0;
                    finalCategoryCount.forEach((val, index) => {
                        if(val > maxValue){
                            maxValue = val;
                            maxIndex = index;
                        }
                    });
                    self.category = categoryNames[maxIndex];
                    console.log(self.imageTags);
                    //alert(self.imageTags)
                }
              },
              function(err) {
                alert(err);
                console.error(err);
              }
            );
        }, error => {
            console.log("ERROR -> " + JSON.stringify(error));
        });
    }

   ionViewCanEnter(){
    env = this;
    NativeStorage.getItem('user')
    .then(function (data){
      env.user = {
        name: data.name,
        gender: data.gender,
        picture: data.picture,
    email: data.email
      };
        env.userReady = true;
        console.log('Works'+env.user.name+' Email= '+env.user.email);
        useremail = env.user.email;
    }, function(error){
      console.log('Error '+error);
    });
  }

  onPostSubmit(){
    //alert('Works '+useremail);
    let nav = this.navCtrl;
    

  	let url = 'http://citysavior.pythonanywhere.com/posts/api/post/';
    let lat = Number(this.lat);
    let lon = Number(this.lon);
      //let body = JSON.stringify({ title: 'tes1', desc: 'test', lat: '2322', lon: '2322', email: 'purnendurocks@gmail.com', category :'other'});
      //alert(body);
      var email = useremail.replace('@','%40');
      let testbody = 'lat='+lat+'&title='+this.title+'&email='+email+'&category='+this.category+'&desc='+this.desc+'&lon='+lon;
      //alert(testbody);
      //let body = encodeURIComponent(testbody);
      //alert(body);
      //body = 'lat=233&title=test&email=purnendurocks%40gmail.com&category=other&desc=test&lon=2322';
      //var encodedBody = encodeURIComponent(body);
      //alert(encodedBody);
      //alert(body);
	  let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
	  let options = new RequestOptions({ headers:headers});
	  this.http.post(url,testbody,options).subscribe( res => {
	  console.log(res.status);
	   if(res.status == 201)
	   {
        alert('Post submitted successfully');
        nav.setRoot(TabsPage);
	     
	   }
	   }, err => {
	    console.log('Submission error occured');
      alert('error '+err);
      alert(JSON.stringify(err.json()));
		console.log(JSON.stringify(err.json()));
	   });

/*

  var req = {
      method: 'POST',
      url: 'http://lexico.pythonanywhere.com/vocabsession/api/userprog/',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {"user":"riddhima", "word":$scope.word, "level":$scope.newLevel}
    }

    $http(req).then(function (response) {
      ////////alert("blah");
    }, function (response) {
      ////////alert("nah");
      // Failure Function
      });




    let url1 = 'http://citysavior.pythonanywhere.com/posts/api/member/';
      let body1= JSON.stringify({'email': 'test101@swamphacks.com','name':'test1'});
    let headers1 = new Headers({'Content-Type': 'application/json'});
    let options1 = new RequestOptions({ headers:headers});
    this.http.post(url1,body1,options1).subscribe( res => {
    console.log(res.status);
     if(res.status == 201)
     {
        alert('member url post works!');
     }
     }, err => {
      console.log('Sign up Error occured');
      alert('error '+err);
    console.log(JSON.stringify(err.json()));
     });




    let url = 'http://citysavior.pythonanywhere.com/posts/api/post_search_nearby/';
  let body = JSON.stringify({'min_lat': lat_min, 'min_lon': lng_min, 'max_lat': lat_max, 'max_lon': lng_max});
  
  let headers = new Headers({'Content-Type': 'application/json'});
  let options = new RequestOptions({ headers:headers});
  this.http.post(url,body,options).subscribe( result => {
  console.log('Result:'+result.status);
  console.log('Data ='+this.data.length);
  console.log('Markers ='+this.markers.length);
  if(this.data.length > 0){
   this.data.length =0;
   this.markers.length =0;
   this.map.clear();
   }
  this.data = result.json();
     //console.log(JSON.stringify(this.data));
  
  this.loading.dismiss();
  console.log('Data ='+this.data.length);
  console.log('Markers ='+this.markers.length);
  this.map.setClickable(true);
  });
  }

  */


  }

}
