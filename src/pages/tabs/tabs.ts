import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { SettingsPage } from '../settings/settings';
import { MapPage } from '../map/map';
import { MypostsPage } from '../myposts/myposts';
import { RankPage } from '../rank/rank';


@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // set the root pages for each tab
  tab1Root: any = RankPage;
  tab2Root: any = MypostsPage;
  tab3Root: any = MapPage;
  tab4Root: any = SettingsPage;
  mySelectedIndex: number;

  constructor(navParams: NavParams) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;
  }

}
