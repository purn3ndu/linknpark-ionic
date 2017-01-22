import { Component } from '@angular/core';
import {NavController} from 'ionic-angular';
import {Http, Headers, RequestOptions } from '@angular/http';


@Component({
  selector: 'page-postdetail',
  templateUrl: 'postdetail.html'
})
export class postDetailPage {

   private http: Http;

    public img = "http://www.crainsnewyork.com/apps/pbcsi.dll/storyimage/CN/20160302/OPINION/160229932/AR/0/garbage.jpg";

    public postData = [];

    constructor(private navController: NavController, http: Http) {
        this.http = http;
        this.getPost(20);
    }

    public getPost(postId: any){
        var url = "http://citysavior.pythonanywhere.com/posts/api/post/"+postId+"/?format=json";
        var self = this;
        this.http.get(url).subscribe( result => {
            self.postData = result.json();
        });
    }

}
