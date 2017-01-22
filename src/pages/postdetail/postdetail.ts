import { Component } from '@angular/core';
import {NavController,NavParams} from 'ionic-angular';
import {Http, Headers, RequestOptions } from '@angular/http';


@Component({
  selector: 'page-postdetail',
  templateUrl: 'postdetail.html'
})
export class PostDetailPage {

   private http: Http;

    public img = "http://www.crainsnewyork.com/apps/pbcsi.dll/storyimage/CN/20160302/OPINION/160229932/AR/0/garbage.jpg";

    public postData = [];

    public id : any;

    constructor(private navController: NavController, http: Http, public params:NavParams) {
        this.http = http;

        this.id = params.get("id");
        this.getPost(this.id);
    }

    public getPost(postId: any){
        var url = "http://citysavior.pythonanywhere.com/posts/api/post/"+postId+"/?format=json";
        var self = this;
        this.http.get(url).subscribe( result => {
            self.postData = result.json();
        });
    }

}
