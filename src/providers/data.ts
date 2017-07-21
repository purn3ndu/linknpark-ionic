import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the Data provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Data {
	
	items : any;

  constructor(public http: Http) {
    this.items = [{title : 'Garbage not disposed properly'}, {title :'Request for New Streetlight'},{title: 'Damaged Road'},{title:'Extreme Traffic'},{title:'Homeless'},{title:'Narrow Road'},{title:'Graffiti'},{title:'Sidewalk'},{title:'Tree Plantation Suggestion'},{title:'Street Sign'},{title:'Drainage Mainteance'},{title:'Stray Animals'},{title:'Traffic Signal problem'},{title:'Parking problem'}];
  }
  
  filterItems(searchTerm)
  {
	  return this.items.filter((item)=>{
		  return item.title.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 ;
	  });
  }

}
