///<reference types="googlemaps" />
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '../../../node_modules/@angular/common/http';
import * as d3 from 'd3';
import { from } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-polygon',
  templateUrl: './polygon.component.html',
  styleUrls: ['./polygon.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PolygonComponent implements OnInit {
  constructor(private httpClient: HttpClient) { }
  initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 11,
      center: new google.maps.LatLng(23.986855, 120.479622),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    this.polygon(map);
    this.marker(map);

  }
  polygon(map: google.maps.Map) {
    var obj: any = {}
    this.httpClient.get<any>('./assets/chcg-spot.json').subscribe(data => {
      obj = data;
    });
    this.httpClient.get<any>('./assets/chcg.json').subscribe(data => {
      var overlay = new google.maps.OverlayView();
      overlay.onAdd = function () {

        var layer = d3.select(this.getPanes().overlayMouseTarget).append("div").attr("class", "SvgOverlay");
        var svg = layer.append("svg");
        var gunmalayer = svg.append("g").attr("class", "AdminDivisions");
        var overlayProjection = this.getProjection();

        var geoToPixel = function (x, y) {
          var d = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(y, x));
          this.stream.point(d.x + 4000, d.y + 4000);
        }
        var googleMapProjection = d3.geoTransform({ point: geoToPixel });
        var path = d3.geoPath().projection(googleMapProjection);

        overlay.draw = function () {


          gunmalayer.selectAll("path")
            .data(data.features)
            .attr("d", path)
            .enter().append("path")
            .attr("d", path)
            .attr("class", 'village')
            .attr('fill', function () {
              var grad = d3.scaleLinear<string, number>().domain([0, 100]).range(["white", "red"]);
              var i = Math.random() * 100;
              d3.select(this).attr('rate', i);
              return grad(+i);
            })
            .on('mouseover', function () { d3.select(this).attr('org', d3.select(this).attr('fill')).style('fill', 'green'); })
            .on('mouseout', function () { d3.select(this).style('fill', d3.select(this).attr('org')); })
            .on('click', function (town: any) {
              const source = from(obj.features);
              const test = source.pipe(filter(data => { var feature: any = data; return feature.properties.ID === +town.properties.TOWN_ID }));
              let count = 0;
              let rate = d3.select(this).attr('rate');
              test.subscribe(val => count++);
              alert('ID: ' + town.properties.TOWN_ID + '\n' + 'NAME: ' + town.properties.TOWN + '\n' + '數量: ' + count + "\nRate: " + rate);
            });

        };
      };

      overlay.setMap(map);
    });

  }
  marker(map: google.maps.Map) {
    this.httpClient.get<any>('./assets/chcg-spot.json').subscribe(data => {
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
            .data(d3.entries(data.features))
            .each(transform) // update existing markers
            .enter().append("svg")
            .each(transform)
            .attr("class", "marker");
          // Add a circle.
          marker.append("circle")
            .attr("r", 4.5)
            .attr("cx", padding)
            .attr("cy", padding)
          marker.on('click', function (data: any) { alert(data) });
          // Add a label.
          marker.append("text")
            .attr("x", padding + 7)
            .attr("y", padding)
            .attr("dy", ".31em")
            .text(function (d) { return d.key; });
          function transform(d) {
            d = new google.maps.LatLng(d.value.geometry.coordinates[1], d.value.geometry.coordinates[0]);
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
  bar() {
    var width = 500,
      height = 40,
      padding = 15;

    var div = d3.select('#svg-container'),
      svg = div.append('svg');

    svg.attr('width', width).attr('height', height);

    // Create the svg:defs element and the main gradient definition.
    var svgDefs = svg.append('defs');

    var mainGradient = svgDefs.append('linearGradient')
      .attr('id', 'mainGradient');

    // Create the stops of the main gradient. Each stop will be assigned
    // a class to style the stop using CSS.
    mainGradient.append('stop')
      .attr('class', 'stop-left')
      .attr('offset', '0');

    mainGradient.append('stop')
      .attr('class', 'stop-right')
      .attr('offset', '1');

    // Use the gradient to set the shape fill, via CSS.

    svg.append('rect')
      .classed('filled', true)
      .attr('x', padding)
      .attr('y', padding)
      .attr('width', width)
      .attr('height', height - 2 * padding);

    svg.append('text')
      .attr('x', 10)
      .attr('y', height)
      .text('0%');
    svg.append('text')
      .attr('x', 460)
      .attr('y', height)
      .text('100%');

  }
  barChart() {
    var svgWidth = 500;
    var svgHeight = 300;
    var svg = d3.select('#svg-barchart').append('svg')
      .attr("width", svgWidth)
      .attr("height", svgHeight + 50)
      .attr("class", "bar-chart")

    var dataset = [80, 100, 56, 12, 18, 30, 40, 12, 16];
    var barPadding = 5;
    var barWidth = (svgWidth / dataset.length);
    var barChart = svg.selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("y", function (d) {
        return svgHeight + 50 - d * svgHeight / 100
      })
      .attr("height", function (d) {
        return d * svgHeight / 100;
      })
      .attr("width", barWidth - barPadding)
      .attr("transform", function (d, i) {
        var translate = [barWidth * i, 0];
        return "translate(" + translate + ")";
      })
      .on('mouseover', function () {
        d3.select(this).attr('org', d3.select(this).attr('fill')).style('fill', 'green');
      })
      .on('mouseout', function () { d3.select(this).style('fill', d3.select(this).attr('org')); })
      .attr('fill', 'orange');;
    var distance = barPadding;
    svg.selectAll('text')
      .data(dataset)
      .enter()
      .append('text')
      .text(function (d) { return d })
      .attr('y', function (d) {
        return svgHeight + 50 - d * svgHeight / 100;
      })
      .attr('x', function () {
        var target = distance
        distance += (barWidth)
        return barPadding + target
      });
  }
  ngOnInit() {
    this.initMap();
    this.bar();
    this.barChart();

  }

}
