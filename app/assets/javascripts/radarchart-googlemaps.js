/*global google, $, window, d3 */
/*jslint browser:true, devel:true, this:true, for:true */
/*global google, d3, $ */


'use strict';

var blankScores = [],
    center,
    options,
    map,
    score,
    markers = [];

var lat_array = [];
var lng_array = [];

center = new google.maps.LatLng(35.5614174, 139.6928321);

options = {
    zoom: 13,
    center: center,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};

map = new google.maps.Map($('#map').get(0), options);

/* zoomの値から1pxあたり何mかを計算する */
function mpp(zoom){
    // 赤道の距離
    var equator = 40075334.2563;
    // 1ピクセルあたりの距離
    var one_pixel = equator / (256 * 2 ** zoom);
    console.log(zoom);
    console.log(one_pixel);
    return one_pixel;
}

function MarkerClear(){
    if(markers.length > 0){
        for(var i=0;i<markers.length; i++){
            markers[i].setMap();
        }
    }
};

google.maps.event.addListener(map,'zoom_changed', function(){
    if(markers.length > 0){
        var zoom = map.getZoom();
        console.log('akl;dfa' + zoom);
        mpp(zoom);
        MarkerClear();

        for(var i=0;i<lat_array.length;i++){
            RADAR_CHART.removeRadarchart(i);        
        }
        $.getJSON("notes.json", function(spots) {
            /* 同地点を判別する*/
          CheckNearPlace(spots, score,zoom);
        });
    };
        
});

/* jsonの成型 */
$.getJSON("notes.json", function (spots) {
    var i;
    var isObject = function(o) {
        return (o instanceof Object && !(o instanceof Array)) ? true : false;
    };
    for(i=0; i<spots.length;i++){
        var obj = spots[i];
        var key01;
        var dataArray;
        var j;
        j=0;
        for(key01 in obj){
            if (!isObject(obj[key01])){
            } else {
                var key02;
                dataArray = [];
                for( key02 in obj[key01]){
                    dataArray.push(obj[key01][key02]);
                }
                formatData[i][j] = dataArray;
                j++;
            }
        }
    }
});


var RADAR_CHART = {};

var formatData = [];
for(var i=0;i<4;i++){
    formatData[i] = new Array(6);
}

RADAR_CHART.radarChart = function (index, scores) {
    'use strict';

    var w,
        h,
        padding,
        i,
        j,
        svg,
        dataset,
        paramCount,
        max,
        rScale,
        grid,
        label,
        line;

    w = 200;
    h = 200;
    padding = 30;

    svg = d3.select('#infodiv' + index)
        .append('svg')
        .attr('width', w)
        .attr('height', h);

    dataset = [scores];

    var k, axis =[], dataAxis;
    if(scores.length % 2 == 0){
        for (k=0;k < scores.length;k++){
            axis.push(0);    
            axis.push(3);    
            axis.push(0); 
        }   
    } else {
        for (k=0;k < scores.length;k++){
            axis.push(0);    
            axis.push(3);    
        }
    }
    

    dataAxis = [axis];
    




    paramCount = dataset[0].length;

    max = 3;

    rScale = d3.scale.linear()
        .domain([0, max])
        .range([0, w / 2 - padding]);

    grid = function () {
        var result = [],
            arr;
        for (i = 1; i <= max; i += 1) {
            arr = [];
            for (j = 0; j < paramCount; j += 1) {
                arr.push(i);
            }
            result.push(arr);
        }
        return result;
    };
    grid();


    label  = (function(){
        var result = [];
        for(var i=0; i<paramCount; i++){
          result.push(max + 1);
        }
        return result;
      })();

    line = d3.svg.line()
        .x(function (d, i) {
            return rScale(d) * Math.cos(2 * Math.PI / paramCount * i - (Math.PI / 2)) + w / 2;
        })
        .y(function (d, i) {
            return rScale(d) * Math.sin(2 * Math.PI / paramCount * i - (Math.PI / 2)) + w / 2;
        })
        .interpolate('linear');

    svg.selectAll('path')
        .data(dataset)
        .enter()
        .append('path')
        .attr('d', function (d, i) {
            return line(d) + "z";
        })
        .attr("stroke", function (d, i) {
            return d3.scale.category10().range()[i];
        })
        .attr("stroke-width", 2)
        .attr('fill', '#1f77b4');

    svg.selectAll('path.axis')
        .data(dataAxis)
        .enter()
        .append('path')
        .attr('d', function (d,i) {
            return line(d) + "z";
        })
        .attr("stroke", "black")
        .attr("stroke-width", "2")
        .attr('fill', 'none');


    svg.selectAll("path.grid")
        .data(grid)
        .enter()
        .append("path")
        .attr("d", function (d, i) {
            return line(d) + "z";
        })
        .attr("stroke", "black")
        .attr("stroke-dasharray", "2")
        .attr('fill', 'none');

     svg.selectAll("text")
     .data(label)
     .enter()
     .append('text')
     .text(function(d, i){ return i+1; })
     .attr("text-anchor", "middle")
     .attr("dominant-baseline", "middle")
     .attr('x', function(d, i){ return rScale(d) * Math.cos(2 * Math.PI / paramCount * i - (Math.PI / 2)) + w/2; })
     .attr('y', function(d, i){ return rScale(d) * Math.sin(2 * Math.PI / paramCount * i - (Math.PI / 2)) + w/2; })
     .attr("font-size", "15px");
};

RADAR_CHART.removeRadarchart = function(index){
    var svg = d3.select('#infodiv' + index).remove();
}

RADAR_CHART.createMarker = function (spot, map) {
    'use strict';
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(spot.lat, spot.lng),
        map: map
    });

    return marker;
};



// 自然のすがた
// formatData[][0]
$("#a0").on('click', function(e) {
    var blankScores =[];
    score=0;
    for(var i=0;i<markers.length;i++){
        markers[i].setMap();
    };

    $.getJSON("notes.json", function(spots) {
        CheckNearPlace(spots, score);
    });
    document.getElementById('content').innerHTML = '<p>項目: 自然のすがた</p><p>1:岸のようすは自然らしいですか？</p><p>2:水の流れはゆたかですか？</p><p>3:魚が川をさかのぼれるだろうか？</p>';
 
    e.preventDefault();
});

// ゆたかな生き物
// formatData[][1]
$("#a1").on('click', function(e) {
    var blankScores =[];
    score=1;
    for(var i=0;i<markers.length;i++){
        markers[i].setMap();
    };

    $.getJSON("notes.json", function(spots) {
        CheckNearPlace(spots, score);
    });
    document.getElementById('content').innerHTML = '<p>項目: ゆたかな生き物</p><p>1:海底に生き物がいますか？</p><p>2:河原と水辺に植物が生えていますか？</p><p>3:魚がいますか？</p><p>4:鳥はいますか？</p>';

    e.preventDefault();
});

// 水のきれいさ
// formatData[][2]
$("#a2").on('click', function(e) {
    var blankScores =[];
    score=2;
    for(var i=0;i<markers.length;i++){
        markers[i].setMap();
    };

    $.getJSON("notes.json", function(spots) {
        CheckNearPlace(spots, score);
    });
    document.getElementById('content').innerHTML = '<p>項目: 水のきれいさ</p><p>1:水はきれいですか？</p><p>2:水はくさくないですか？</p><p>3:水は透明ですか？</p>';

    e.preventDefault();
});

// 快適な水辺
// formatData[][3]
$("#a3").on('click', function(e) {
    var blankScores =[];
    score=3;    
    for(var i=0;i<markers.length;i++){
        markers[i].setMap();
    };

    $.getJSON("notes.json", function(spots) {
        CheckNearPlace(spots, score);
    });
    document.getElementById('content').innerHTML = '<p>項目: 快適な水辺</p><p>1:ごみが目につきますか？</p><p>2:どんなにおいを感じますか？</p><p>3:どんな音が聞こえますか？</p><p>4:川やまわりの景色は美しいですか？</p><p>5:水にふれてみたいですか？</p>';

    e.preventDefault();
});

// 地域とのつながり
// formatData[][4]
$("#a4").on('click', function(e) {
    var blankScores =[];
    score=4;    
    for(var i=0;i<markers.length;i++){
        markers[i].setMap();
    };

    $.getJSON("notes.json", function(spots) {
        CheckNearPlace(spots, score);
    });
    document.getElementById('content').innerHTML = '<p>項目: 地域とのつながり</p><p>1:多くの人が利用していますか？</p><p>2:川にまつわる話を聞いたことがありますか？</p><p>3:水辺に近づきやすいですか？</p><p>4:環境の活動</p><p>5:産業などの活動</p>';

    e.preventDefault();
});

// 総合平均
// formatData[][5]
$("#a5").on('click', function(e) {
    var blankScores =[];
    score=5;
    for(var i=0;i<markers.length;i++){
        markers[i].setMap();
    };
    $.getJSON("notes.json", function(spots) {
        /* 同地点を判別する*/
        var zoom = map.getZoom();
        CheckNearPlace(spots, score,zoom);
    });

    document.getElementById('content').innerHTML = '<p>項目: 総合平均</p><p>1:ゆたかな生き物</p><p>2:地域とのつながり</p><p>3:快適な水辺</p><p>4:水のきれいさ</p><p>5:自然のすがた</p>';
    e.preventDefault();
});

/* 同地点を判別する関数 */
/* 同地点付近を判別する関数を作成 */


function Find_1second_distance_by_LatLng(lat, lng){
    var lat0,lng0;
    var earthradius = 6378150;
    var circumference = 2 * Math.PI * earthradius;
    lat0 = circumference / (360 * 60 * 60);
    var lng0 = earthradius * Math.cos(lng / 180 * Math.PI) * 2 * Math.PI / (360 * 60 * 60)
    if(lng0 < 0){
        lng0 = lng0 * -1;
    }
    console.log(lat0,lng0);
}
function CreateIntersects(lat,lng,diff){
    var lat0 = parseInt(lat * 100000);
    var lng0 = parseInt(lng * 100000);
    var dis = diff;
    var sw = new google.maps.LatLng((lat0-dis) / 100000,(lng0+dis) / 100000);
    var ne = new google.maps.LatLng((lat0+dis) / 100000,(lng0-dis) / 100000);
    var latlngBounds = new google.maps.LatLngBounds(sw, ne);
    return latlngBounds;
}

function CheckNearPlace(spots,score,zoom){
    console.log(zoom);
    var flag;
    var latlngBounds1,latlngBounds2;
    for(var i=0;i<spots.length;i++){
        flag = false;
        latlngBounds1 = CreateIntersects(spots[i].lat, spots[i].lng,Find(spots[i].lat,spots[i].lng,zoom));
        for(var j=0;j<i;j++){
            latlngBounds2 = CreateIntersects(spots[j].lat, spots[i].lng,Find(spots[j].lat, spots[i].lng,zoom));
            if(latlngBounds1.intersects(latlngBounds2) == true){
                /*console.log(spots[i].name + 'と' + spots[j].name + 'はかぶっています');
                console.log('i='+i,'j='+j);
                */flag = true;
            }                
        }
        blankScores = formatData[i][score];        
        markers[i] = RADAR_CHART.createMarker(spots[i], map);
        lat_array.push(spots[i].lat);
        lng_array.push(spots[i].lng);
        RADAR_CHART.attachSameInfoWindow(markers[i],spots[i]["name"], blankScores, i, flag);
        Find(spots[i].lat, spots[i].lng);

    }

}

RADAR_CHART.attachSameInfoWindow = function (marker, name, blankScores, index,same) {
    'use strict';

    var infoWindow = null;
    function attachSameInfoWindow(){
        if(infoWindow === null){
            if(same == false){
                infoWindow = new google.maps.InfoWindow({
                    content:　name + '<div id="infodiv' + index + '"></div>'
                });
            } else {
                infoWindow = new google.maps.InfoWindow({
                    content:　name + '<div id="infodiv' + index + '"></div>',
                    pixelOffset: new google.maps.Size(-100 * index, 50 * index)
                });
            }
            infoWindow.close();
            infoWindow.open(marker.getMap(), marker);
            google.maps.event.addListener(infoWindow,'closeclick',function(){
                infoWindow = null;
            });
        }
        google.maps.event.addListener(infoWindow, 'domready', function () {
                RADAR_CHART.radarChart(index, blankScores);
        });
    }

    attachSameInfoWindow();
    google.maps.event.addListener(marker, 'click', function () {
        attachSameInfoWindow();
    });
};


function Find(lat,lng,zoom){
    var lat0,lng0;
    var earthradius = 6378150;
    var circumference = 2 * Math.PI * earthradius;
    lat0 = circumference / (360 * 60 * 60);
    var lng0 = earthradius * Math.cos(lng / 180 * Math.PI) * 2 * Math.PI / (360 * 60 * 60)
    if(lng0 < 0){
        lng0 = lng0 * -1;
    }
    console.log(zoom);
    // 100pxでは何秒ずれるか
    var temp = mpp(zoom) * 100 / lat0;
    // console.log(temp);
    return temp;
}
