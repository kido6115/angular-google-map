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
            .attr('fill', function (d) {
              var feature: any = d;
              var grad = d3.scaleLinear<string, number>().domain([0, 100]).range(["white", "red"]);
              var i = Math.random() * 100;
              d3.select(this).attr('rate', feature.properties.AREA / 1000000);
              return grad(feature.properties.AREA / 1000000);
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
  barChart(dataset: any[]) {
    var svgWidth = 1500;
    var svgHeight = 300;
    var svg = d3.select('#svg-barchart').append('svg')
      .attr("width", svgWidth)
      .attr("height", svgHeight + 50)
      .attr("class", "bar-chart")

    // var dataset = [80, 100, 56, 12, 18, 30, 40, 12, 16];
    var barPadding = 5;
    var barWidth = (svgWidth * 0.9 / dataset.length - 1);
    var barChart = svg.selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("y", function (d) {
        return svgHeight - 30 + 50 - d.properties.AREA / 1000000 * svgHeight / 100
      })
      .attr("x", '55')
      .attr("height", function (d) {
        return d.properties.AREA / 1000000 * svgHeight / 100;
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
      .attr('fill', function (d) {
        var feature: any = d;
        var grad = d3.scaleLinear<string, number>().domain([0, 100]).range(["white", "red"]);
        var i = Math.random() * 100;
        d3.select(this).attr('rate', feature.properties.AREA / 1000000);
        return grad(feature.properties.AREA / 1000000);
      });;
    var distance = barPadding;
    //rate
    svg.selectAll('text')
      .data(dataset)
      .enter()
      .append('text')
      .text(function (d) { return (d.properties.AREA / 1000000).toFixed(2) })
      .attr('y', function (d) {
        return svgHeight - 30 + 50 - d.properties.AREA / 1000000 * svgHeight / 100;
      })
      .attr('x', function () {
        var target = distance
        distance += (barWidth)
        return target + 55
      });
    //x-axis
    var x = d3.scaleBand().rangeRound([0, svgWidth * 0.9]);
    var y = d3.scaleLinear().rangeRound([svgHeight, 0]);

    var column = svg.append("g")
      .attr("transform", "translate(40,20)");

    x.domain(dataset.map(function (d) {
      return d.properties.TOWN;
    }));
    y.domain([0, 100]);
    //x軸
    column.append("g")
      .attr("transform", "translate(0," + svgHeight + ")")
      .call(d3.axisBottom(x));

    //y軸
    column.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");
  }
  lineChart(data: any[]) {

    var svgWidth = 1500, svgHeight = 400;
    var margin = { top: 20, right: 20, bottom: 30, left: 50 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;
    var svg = d3.select('#svg-linechart').append('svg')
      .attr("width", svgWidth)
      .attr("height", svgHeight);
    var g = svg.append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")"
      );
    var x = d3.scaleBand().rangeRound([0, width]);
    var y = d3.scaleLinear().rangeRound([height, 0]);
    var line = d3.line()
      .x(function (d: any) { return x(d.key) })
      .y(function (d: any) { return y(+d.value) })
    x.domain(data.map(data => data.key));
    y.domain(d3.extent(data, function (d: any) { return +d.value }));

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll('text');

    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Price ($)");
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }
  ngOnInit() {
    this.initMap();
    this.bar();
    this.httpClient.get<any>('./assets/chcg.json').subscribe(data => {
      this.barChart(data.features);
    });
    this.httpClient.get<any>('https://api.coindesk.com/v1/bpi/historical/close.json?start=2018-04-01&end=2018-04-30').subscribe(data => {
      this.lineChart(d3.entries(data.bpi));
    })

  }

}
