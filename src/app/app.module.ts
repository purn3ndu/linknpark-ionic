import { NgModule } from '@angular/core';

import { IonicApp, IonicModule } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { CitysavApp } from './app.component';

import { SettingsPage } from '../pages/settings/settings';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/map';
import { MypostsPage } from '../pages/myposts/myposts';
import { RankPage } from '../pages/rank/rank';

import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { SupportPage } from '../pages/support/support';
import { IssuePostPage } from '../pages/post/post';


import { PostDetailPage } from '../pages/postdetail/postdetail';



@NgModule({
  declarations: [
    CitysavApp,
    SettingsPage,
    AccountPage,
    LoginPage,
    MapPage,
    MypostsPage,
    RankPage,
    TabsPage,
    TutorialPage,
    SupportPage,
    IssuePostPage,
    PostDetailPage
  ],
  imports: [
    IonicModule.forRoot(CitysavApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    CitysavApp,
    SettingsPage,
    AccountPage,
    LoginPage,
    MapPage,
    MypostsPage,
    RankPage,
    TabsPage,
    TutorialPage,
    SupportPage,
    IssuePostPage,
    PostDetailPage
  ],
  providers: [ Storage]
})
export class AppModule { }
