import { Component } from '@angular/core';

import { NavParams,Platform } from 'ionic-angular';

import { MapPage } from '../map/map';
import { MypostsPage } from '../myposts/myposts';
import { RankPage } from '../rank/rank';
import {AccountPage} from '../account/account';
import {Params} from '../../providers/params';


@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // set the root pages for each tab
  tab1Root: any = RankPage;
  tab2Root: any = MypostsPage;
  tab3Root: any = MapPage;
  tab4Root: any = AccountPage;
  mySelectedIndex: number;
  mapParams: any;
  
  constructor(navParams: NavParams,
  public platform: Platform,
  public params: Params) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;
	this.mapParams = navParams.data;
	
	// set app open to default (ie normal open) for next time open when going into background.
      this.platform.pause.subscribe(() => {
            
        });
		
	 //TO DO
        //check if app is opening from push or from normal open by user.
        // if opening from push (for new post) set this.mySelectedIndex to 0 to show map page with new post - for the case that the app is open in background and a tab other than map is opened.
        this.platform.resume.subscribe(() => {
            
            this.mapParams = navParams.data;
        });	
  }

}
