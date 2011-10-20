// API key for http://openlayers.org. Please get your own at
// http://bingmapsportal.com/ and use that instead.
var apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";

// initialize map when page ready
var map,fhLayer,getFeatures,clickedFeature,selectControl;
var gg = new OpenLayers.Projection("EPSG:4326");
var sm = new OpenLayers.Projection("EPSG:900913");
var limit_feature = 20;

var init = function () {

    var vector = new OpenLayers.Layer.Vector("Vector Layer", {});

//    var sprintersLayer = new OpenLayers.Layer.Vector("Sprinters", {
//        styleMap: new OpenLayers.StyleMap({
//            externalGraphic: "img/mobile-loc.png",
//            graphicOpacity: 1.0,
//            graphicWith: 16,
//            graphicHeight: 26,
//            graphicYOffset: -26
//        })
//    });

    var fhLayer = new OpenLayers.Layer.Vector("Fire Hazards", {
        styleMap: new OpenLayers.StyleMap({
            externalGraphic: "img/mobile-loc.png",
            graphicOpacity: 1.0,
            graphicWith: 16,
            graphicHeight: 26,
            graphicYOffset: -26
        })
    });


///	fh = new OpenLayers.Layer.Vector("Fire Hazard",{
///		strategies: [new OpenLayers.Strategy.Fixed()],
///		protocol: new OpenLayers.Protocol.WFS({
///			url: "/geoserver/wfs",
///			featureType: "MSC_CAPTURE",
///			featureNS: "http://www.pozi.com.au/mitchell"
///		}),
///		projection:new OpenLayers.Projection("EPSG:4326"),
///		styleMap: new OpenLayers.StyleMap({
///		    externalGraphic: "img/mobile-loc.png",
///		    graphicOpacity: 1.0,
///		    graphicWith: 16,
///		    graphicHeight: 26,
///		    graphicYOffset: -26
///		})
///	})            

	var onSelectFeatureFunction = function(feature){
		//alert("nlah");
		clickedFeature = feature;
		if (!app.captureUpdateFormPopupPanel) {

			app.captureUpdateFormPopupPanel = new App.CaptureUpdateFormPopupPanel();

		}
		else
		{
			// Updating the lat / lon values in the existing form
			app.captureUpdateFormPopupPanel.setFeature(clickedFeature);
		}
		app.captureUpdateFormPopupPanel.show('pop');
	};


    selectControl = new OpenLayers.Control.SelectFeature(fhLayer, {
        autoActivate:true,
        onSelect: onSelectFeatureFunction});

    var geolocate = new OpenLayers.Control.Geolocate({
        id: 'locate-control',
        geolocationOptions: {
            enableHighAccuracy: false,
            maximumAge: 0,
            timeout: 20000
        },
        failure:function(e){alert("There was an error obtaining the geo-location: "+e);}
    });
    
    // create map
    map = new OpenLayers.Map({
        div: "map",
        theme: null,
        projection: sm,
        units: "m",
        numZoomLevels: 20,
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(
            -20037508.34, -20037508.34, 20037508.34, 20037508.34
        ),
        controls: [
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    interval: 100,
                    enableKinetic: true
                }
            }),
            geolocate,
            selectControl
        ],
        layers: [
            new OpenLayers.Layer.WMS("Vicmap Classic",
	                        "http://49.156.19.227:8080/geoserver/wms",
                    {layers: 'VicmapClassicMitchell'}
// singletile could reduce traffic but bigger files, except if ratio is really large
//                    ,{ singleTile: true, ratio: 1.2 } 
,{attribution:"+"}
                    ),
            new OpenLayers.Layer.OSM("OpenStreetMap", null, {
                transitionEffect: 'resize'
            }),
            new OpenLayers.Layer.Bing({
                key: apiKey,
                type: "Road",
                // custom metadata parameter to request the new map style - only useful
                // before May 1st, 2011
                metadataParams: {
                    mapVersion: "v1"
                },
                name: "Bing Road",
                transitionEffect: 'resize'
            }),
            new OpenLayers.Layer.Bing({
                key: apiKey,
                type: "Aerial",
                name: "Bing Aerial",
                transitionEffect: 'resize'
            }),
            new OpenLayers.Layer.Bing({
                key: apiKey,
                type: "AerialWithLabels",
                name: "Bing Aerial + Labels",
                transitionEffect: 'resize'
            }),
            vector,
 //           sprintersLayer,
 		fhLayer
        ],
        center: new OpenLayers.LonLat(16143500, -4461908),
        zoom: 10
    });
    
	map.events.register('moveend', this, function() {
		getFeatures();
	});


	
    var style = {
        fillOpacity: 0.1,
        fillColor: '#000',
        strokeColor: '#f00',
        strokeOpacity: 0.6
    };
    geolocate.events.register("locationupdated", this, function(e) {
	// Logging the event values
	var pt = new OpenLayers.LonLat(e.point.x,e.point.y);	
	var pt_wgs84 = pt.transform(sm,gg);
	
	var logMsg = "X="+e.point.x+" ("+pt_wgs84.lon+")";
	logMsg = logMsg + "\n" + "Y="+e.point.y+" ("+pt_wgs84.lat+")";	
	logMsg = logMsg + "\n" + "Accuracy="+e.position.coords.accuracy;
//	alert(logMsg);
	
        vector.removeAllFeatures();
        vector.addFeatures([
            new OpenLayers.Feature.Vector(
                e.point,
                {},
                {
                    graphicName: 'cross',
                    strokeColor: '#f00',
                    strokeWidth: 2,
                    fillOpacity: 0,
                    pointRadius: 10
                }
            ),
            new OpenLayers.Feature.Vector(
                OpenLayers.Geometry.Polygon.createRegularPolygon(
                    new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                    e.position.coords.accuracy / 2,
                    50,
                    0
                ),
                {},
                style
            )
        ]);
        map.zoomToExtent(vector.getDataExtent());
    });

   geolocate.events.register("locationfailed", this, function(e) {
        switch (e.error.code) {
            case 0: alert(OpenLayers.i18n("There was an error while retrieving your location: ") + e.error.message); break;
            case 1: alert(OpenLayers.i18n("The user didn't accept to provide the location: ")); break;
            case 2: alert(OpenLayers.i18n("The browser was unable to determine your location: ") + e.error.message); break;
            case 3: alert(OpenLayers.i18n("The browser timed out before retrieving the location.")); break;
        }
    });

    getFeatures = function() {
	// Old version works - we know need to get to retrieve the data from a WFS service endpoint
	// If WFS is not an option, we'll have to figure out a way for a web service to serve the data (in JSON?)
//        var features = {
//            "type": "FeatureCollection",
//            "features": [
//                { "type": "Feature", "geometry": {"type": "Point", "coordinates": [16157904.1632392, -4443695.26331407]},
//                    "properties": {"Name": "Igor Tihonov", "Country":"Sweden", "City":"Gothenburg"}},
//                { "type": "Feature", "geometry": {"type": "Point", "coordinates": [16126445.9955415, -4456187.26182341]},
//                    "properties": {"Name": "Marc Jansen", "Country":"Germany", "City":"Bonn"}},
//                { "type": "Feature", "geometry": {"type": "Point", "coordinates": [16147991.9910391, -4467745.95078927]},
//                    "properties": {"Name": "Bart van den Eijnden", "Country":"Netherlands", "City":"Utrecht"}}
//                    ]
//        };
	var ll=map.getCenter();
	var ll_wgs84 = ll.transform(sm,gg);

        var reader = new OpenLayers.Format.GeoJSON();
        
	Ext.Ajax.request({
	  loadMask: true,
	  url: '/ws/rest/v3/ws_fire_hazard_geojson.php',
	  params: {
	  		lat:ll_wgs84.lat,
	  		lon:ll_wgs84.lon,
	  		limit:limit_feature
	  	},
	  success: function(resp) {
		// resp is the XmlHttpRequest object
		var fh_from_geojson = reader.read(resp.responseText);
		// Before blindly adding, we should compare to the features already in there and decide to not include duplicates - duplicates can be found using the id of the features
		// Or more simply, we could just remove all the features form the layer
		fhLayer.removeAllFeatures();
		fhLayer.addFeatures(fh_from_geojson);
	  }
	});

    }
    
	// Loading features in the fire hazard layer - AJAX GeoJSON
	getFeatures();

};