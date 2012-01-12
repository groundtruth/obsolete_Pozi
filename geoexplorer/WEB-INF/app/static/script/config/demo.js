// Javascript configuration file for Moyne

// Workspace containing the layers and corresponding namespace
var gtWorkspaceName= "MOYNE"; 
// In a multi-council database setup, use 354
var gtLGACode = "";
var gtFeatureNS = "http://www.pozi.com.au/moyne";

// Database config for the master search table
var gtDatabaseConfig = "moynegis";
var gtInternalDBConfig = "moyne";

// Aerial imagery credentials
gtAerialUsername = "";
gtAerialPassword = "";

//  Services
var gtServicesHost = "http://www.pozi.com";
///var gtServicesHost = "http://localhost";
////var gtOWSEndPoint = 		gtServicesHost + "/geoserver/"+gtWorkspaceName+"/ows";
var gtOWSEndPoint = 		gtServicesHost + "/geoserver/ows";
//var gtOWSEndPointVicmap = 	gtServicesHost + "/geoserver/ows";
var gtWFSEndPoint = 		gtServicesHost + "/geoserver/wfs";
var gtSearchPropertyEndPoint =  gtServicesHost + "/ws/rest/v3/ws_property_id_by_propnum.php";
var gtSearchComboEndPoint = 	gtServicesHost + "/ws/rest/v3/ws_all_features_by_string.php";

var gtGetLayoutEndPoint='http://localhost/ws_apache/rest/v3/ws_get_layouts.php';
var gtGetLiveDataEndPoint='http://localhost/ws_apache/rest/v3/ws_get_live_data.php';

// External resources
var gtPoziLogoSrc = gtServicesHost+"/"+"theme/app/img/pozi-logo.png";
var gtPoziLogoWidth = 165; 
var gtLogoClientSrc = gtServicesHost+"/"+"theme/app/img/blank.gif";
var gtLogoClientWidth=1;

// Map resources
// Map center over Mortlake: select ST_AsText(ST_Transform(ST_SetSRID(ST_Centroid(the_geom),4283),900913)) from dse_vmfeat_locality_point where place_name='MORTLAKE'
var gtMapCenter = [15896865, -4590599];
var gtMapZoom = 15;
var gtZoomMax=18;
var gtQuickZoomDatastore = [
	['142.630',	'-38.155',	'142.949',	'-37.961', 'Mortlake'	],
	['142.328',	'-38.322',	'142.416',	'-38.231', 'Koroit'	],
	['142.116',	'-38.397',	'142.291',	'-38.249', 'Port Fairy'	],
	['141.848',	'-38.116',	'142.219',	'-37.969', 'Macarthur'	]];

// UI labels
var gtDetailsTitle='Details';
var gtInfoTitle = 'Info';
var gtEmptyTextQuickZoom = 'Zoom to town';
var gtEmptyTextSearch = 'Find properties, roads, features, etc...';
var gtLoadingText = 'Searching...';
var gtEmptyTextSelectFeature = 'Selected features ...';
var gtClearButton='clear';
var gtPropNum;
var gtLegendHeight = 400;
var gtPrintTitle = "Moyne Shire Council";

// Datasources
var gtMapDataSources = {
	local: {
		url: gtOWSEndPoint,
		title: "Local GeoServer",
		ptype: "gxp_wmscsource"
	},
//	local_gwc: {
//		url: "/geoserver/gwc/service/wms",
//		title: "GeoWebCache",
//		ptype: "gxp_wmssource"
//	},
	mapquest: {
		ptype: "gxp_mapquestsource"
	},
	osm: {
		ptype: "gxp_osmsource"
	},
//	google: {
//		ptype: "gxp_googlesource"
//	},
//	bing: {
//		ptype: "gxp_bingsource"
//	},
	ol: {
		ptype: "gxp_olsource"
//	},
//	dse: {
//		url: "http://images.land.vic.gov.au/ecwp/ecw_wms.dll",
//		title: "DSE Imagery Server"
	}
//	,
//	localVicmap: {
//		url: gtOWSEndPointVicmap,
//		title: "Vicmap source",
//		ptype: "gxp_wmscsource"
//	}
};
    
// Initial layers      
var gtLayers = [
	{
		source:"local",
		name:gtWorkspaceName+":VICMAP_PROPERTY_ADDRESS",
		title:"Property (Vicmap)",
		visibility:true,
		opacity:0.25,
		format:"image/png8",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":MSC_CAPTURE_MOYNE",
		title:"Fire Inspection",
		visibility:false,
		format:"image/png",
		styles:"",
		transparent:true
	},{
    source: "osm",
    name: "mapnik"
},{
		source:"local",
		name:"VicmapClassicMoyne",
		title:"Vicmap Classic",
		visibility:true,
		opacity:1,
		group:"background",
		selected:false,
		format:"image/png8",
		styles:"",
		transparent:true,
		cached:true
	},
{
		source: "ol",
		group: "background",
		fixed: true,
		type: "OpenLayers.Layer",
		args: [
			"None", {visibility: false}
		]
	}];


// WFS layer: style , definition , namespaces
var gtStyleMap = new OpenLayers.StyleMap();
var gtSymbolizer = {name:"test",strokeColor:"yellow",strokeWidth: 15, strokeOpacity:0.5,fillColor:"yellow",fillOpacity:0.2};
var gtWFSsrsName = "EPSG:4326";
var gtWFSgeometryName = "the_geom";

// Definition of the WFS layer - arbitrarily defining a WFS layer to be able to add it to the map (so that it's ready to be used when the app has loaded)
var gtLayerLocSel = new OpenLayers.Layer.Vector("Search Result", {
	styleMap: gtStyleMap,
	strategies: [new OpenLayers.Strategy.BBOX({ratio:100})],
        protocol: new OpenLayers.Protocol.WFS({
		version:       "1.1.0",
		url:           gtWFSEndPoint,
		featureType:   "VMPROP_PROPERTY",
		srsName:       gtWFSsrsName,
		featureNS:     gtFeatureNS,
		geometryName:  gtWFSgeometryName,
		schema:        gtWFSEndPoint+"?service=WFS&version=1.1.0&request=DescribeFeatureType&TypeName="+gtWorkspaceName+":VMPROP_PROPERTY"
	}),
	filter: new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.EQUAL_TO,property: 'prop_propnum',value: 99999999}),
	projection: new OpenLayers.Projection("EPSG:4326")			
});

var gtPrintService = "/geoserver/pdf/";

var gtTools = [{
			ptype: "gxp_layertree",
			outputConfig: {
				id: "layertree"
			},
			outputTarget: "tree"
		}, {
			ptype: "gxp_legend",
			outputTarget: 'legend',
			outputConfig: {
				autoScroll: true
			}
//		}, {
//			ptype: "gxp_addlayers",
//			actionTarget: "tree.tbar",
//			upload: true
//		}, {
//			ptype: "gxp_removelayer",
//			actionTarget: ["tree.tbar", "layertree.contextMenu"]
		}, {
			ptype: "gxp_layerproperties",
///			actionTarget: ["tree.tbar", "layertree.contextMenu"]
			actionTarget: ["layertree.contextMenu"]
//		}, {
//			ptype: "gxp_styler",
//			actionTarget: ["tree.tbar", "layertree.contextMenu"]
		}, {
			ptype: "gxp_zoomtolayerextent",
			actionTarget: {
				target: "layertree.contextMenu",
				index: 0
			}
		}, {
			ptype: "gxp_measure",
			toggleGroup: this.toggleGroup,
			actionTarget: {
				target: "paneltbar",
				index: 2
			}
		}, {
			ptype: "gxp_wmsgetfeatureinfo",
			toggleGroup: this.toggleGroup,
			actionTarget: {
				target: "paneltbar",
				index: 2
			}
		}, {
//			ptype: "gxp_navigation",
//			toggleGroup: this.toggleGroup,
//			actionTarget: {
//				target: "paneltbar",
//				index: 2
//			}
//		}, {
//			ptype: "gxp_featuremanager",
//			id: "featuremanager",
//			maxFeatures: 20
//		}, {
//			ptype: "gxp_featureeditor",
//			featureManager: "featuremanager",
//			autoLoadFeatures: true,
//			toggleGroup: this.toggleGroup,
//			actionTarget: {
//				target: "paneltbar",
//				index: 6
//			}
//		}, {

//			ptype: "gxp_zoom",
//			actionTarget: {
//				target: "paneltbar",
//				index: 11
//			}
//		}, {
//			ptype: "gxp_navigationhistory",
//			actionTarget: {
//				target: "paneltbar",
//				index: 13
//			}
//		}, {
//			ptype: "gxp_zoomtoextent",
//			actionTarget: {
//				target: "paneltbar",
//				index: 15
//			}
//		}, {
			ptype: "gxp_print",
			customParams: {
				outputFilename: 'GeoExplorer-print'
			},
			printService: gtPrintService,
			actionTarget: {
				target: "paneltbar",
				index: 2
			}
		}
//		, {
//			ptype: "gxp_googleearth",
//			actionTarget: {
//				target: "paneltbar",
//				index: 9
//			},
//			apiKey: 'ABQIAAAAeDjUod8ItM9dBg5_lz0esxTnme5EwnLVtEDGnh-lFVzRJhbdQhQBX5VH8Rb3adNACjSR5kaCLQuBmw'
//		}
		
		];


	var gtCreateTools = function () {
		var tools = GeoExplorer.Composer.superclass.createTools.apply(this, arguments);
///		if (this.authorizedRoles.length === 0) {
///			this.loginButton = new Ext.Button({
///				iconCls: 'login',
///				text: this.loginText,
///				handler: this.showLoginDialog,
///				scope: this
///			});
///			tools.push(['->', this.loginButton]);
///		} else {
///
///		}
		var aboutButton = new Ext.Button({
			text: "Pozi",
			iconCls: "icon-geoexplorer",
			handler: 
				function () {
					var appInfo = new Ext.Panel({
						title: this.appInfoText,
						html: "<iframe style='border: none; height: 100%; width: 100%' src='about.html' frameborder='0' border='0'><a target='_blank' href='about.html'>" + this.aboutText + "</a> </iframe>"
					});
//					var about = Ext.applyIf(this.about, {
//						title: '',
//						"abstract": '',
//						contact: ''
//					});
//					var mapInfo = new Ext.Panel({
//						title: this.mapInfoText,
//						html: '<div class="gx-info-panel">' + '<h2>' + this.titleText + '</h2><p>' + about.title + '</p><h2>' + this.descriptionText + '</h2><p>' + about['abstract'] + '</p> <h2>' + this.contactText + '</h2><p>' + about.contact + '</p></div>',
//						height: 'auto',
//						width: 'auto'
//					});
					var poziInfo = new Ext.Panel({
						title: "Pozi",
						html: "<iframe style='border: none; height: 100%; width: 100%' src='about-pozi.html' frameborder='0' border='0'><a target='_blank' href='about-pozi.html'>" + "</a> </iframe>"
					});
					var tabs = new Ext.TabPanel({
						activeTab: 0,
						items: [
						poziInfo,appInfo]
					});
					var win = new Ext.Window({
						title: this.aboutThisMapText,
						modal: true,
						layout: "fit",
						width: 300,
						height: 300,
						items: [
						tabs]
					});
					win.show();
				},			
			scope: this
		});
		tools.unshift("-");
//		tools.unshift(new Ext.Button({
//			tooltip: this.exportMapText,
//			needsAuthorization: true,
//			disabled: !this.isAuthorized(),
//			handler: function () {
//				this.save(this.showEmbedWindow);
//			},
//			scope: this,
//			iconCls: 'icon-export'
//		}));
//		tools.unshift(new Ext.Button({
//			tooltip: this.saveMapText,
//			needsAuthorization: true,
//			disabled: !this.isAuthorized(),
//			handler: function () {
//				this.save(this.showUrl);
//			},
//			scope: this,
//			iconCls: "icon-save"
//		}));
		tools.unshift("-");
		tools.unshift(aboutButton);
		return tools;
	};
	
var gtInitialDisclaimerFlag=false;
var gtDisclaimer="disclaimer.html";
var gtRedirectIfDeclined="http://www.moyne.vic.gov.au/";