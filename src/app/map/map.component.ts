///<reference types="googlemaps" />
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { HttpClient } from '../../../node_modules/@angular/common/http';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  //D3 loading css
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {

  constructor(private httpClient: HttpClient) { }
  initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 8,
      center: new google.maps.LatLng(37.76487, -122.41948),
      mapTypeId: google.maps.MapTypeId.TERRAIN

    });
    this.httpClient.get<any>('./assets/stations.json').subscribe(data => {
      // Load the station data. When the data comes back, create an overlay.
      var overlay = new google.maps.OverlayView();
      // Add the container when the overlay is added to the map.
      overlay.onAdd = function () {
        //overlayMouseTarget才有滑鼠反映
        var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
          .attr("class", "stations");
        // Draw each marker as a separate SVG element.
        // We could use a single SVG, but what size would it have?
        overlay.draw = function () {
          var projection = this.getProjection(),
            padding = 10;
          var marker = layer.selectAll("svg")
            .data(d3.entries(data))
            .each(transform) // update existing markers
            .enter().append("svg")
            .each(transform)
            .attr("class", "marker");
          // Add a circle.
          marker.append("circle")
            .attr("r", 4.5)
            .attr("cx", padding)
            .attr("cy", padding)
          marker.on('click', function (data: any) { alert(data.value[2]) });
          // Add a label.
          marker.append("text")
            .attr("x", padding + 7)
            .attr("y", padding)
            .attr("dy", ".31em")
            .text(function (d) { return d.key; });
          function transform(d) {
            d = new google.maps.LatLng(d.value[1], d.value[0]);
            d = projection.fromLatLngToDivPixel(d);
            return d3.select(this)
              .style("left", (d.x - padding) + "px")
              .style("top", (d.y - padding) + "px");
          }
        };
      };
      // Bind our overlay to the map…
      overlay.setMap(map);
    });

  }
  ngOnInit() {
    this.initMap();
  }

}
