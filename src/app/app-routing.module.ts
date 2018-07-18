import { MapComponent } from './map/map.component';
import { PolygonComponent } from './polygon/polygon.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import{ Routes, RouterModule } from '@angular/router';
const routes:Routes=[
 
  {path:'polygon',component:PolygonComponent},
  {path:'marker',component:MapComponent},
  {path:'',redirectTo:'/marker',pathMatch:'full'}
  ];
@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],exports:[RouterModule],
  declarations: []
})
export class AppRoutingModule { }
