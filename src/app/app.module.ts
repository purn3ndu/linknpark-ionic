import { NgModule, ErrorHandler } from '@angular/core';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { CitysavApp } from './app.component';

import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/map';
import { MypostsPage } from '../pages/myposts/myposts';
import { RankPage } from '../pages/rank/rank';

import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { SupportPage } from '../pages/support/support';

import { PostdetailPage } from '../pages/postdetail/postdetail';
import { EditPostPage } from '../pages/edit-post/edit-post';
import { AboutPage } from '../pages/about/about';
import {NotificationAreaPage} from '../pages/notification-area/notification-area';
import {UserProfilePage} from '../pages/user-profile/user-profile';
import { IssuePostPage } from '../pages/issue-post/issue-post';

import {Params} from '../providers/params';
import {Data} from '../providers/data';





@NgModule({
  declarations: [
    CitysavApp,
    AccountPage,
    LoginPage,
    MapPage,
    MypostsPage,
    RankPage,
    TabsPage,
    TutorialPage,
    SupportPage,
	PostdetailPage,
	EditPostPage,
	AboutPage,
	NotificationAreaPage,
	UserProfilePage,
	IssuePostPage
  ],
  imports: [
    IonicModule.forRoot(CitysavApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    CitysavApp,
    AccountPage,
    LoginPage,
    MapPage,
    MypostsPage,
    RankPage,
    TabsPage,
    TutorialPage,
    SupportPage,
	PostdetailPage,
	EditPostPage,
	AboutPage,
	NotificationAreaPage,
	UserProfilePage,
	IssuePostPage
  ],
  providers: [ Storage, Params,  Data,
  {provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule { }
