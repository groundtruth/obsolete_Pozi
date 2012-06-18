// Javascript configuration file for Mitchell

// Workspace containing the layers and corresponding namespace
var gtWorkspaceName= "MITCHELL"; 
// In a multi-council database setup, use 346
var gtLGACode = "346";
var gtFeatureNS = "http://www.pozi.com/vicmap";

// Database config for the master search table
var gtDatabaseConfig = "vicmap";

//  Services
var gtServicesHost = "http://49.156.17.41";
///var gtServicesHost = "http://localhost";
////var gtOWSEndPoint = 		gtServicesHost + "/geoserver/"+gtWorkspaceName+"/ows";
var gtOWSEndPoint = 		gtServicesHost + "/geoserver/ows";
//var gtOWSEndPointVicmap = 	gtServicesHost + "/geoserver/ows";
var gtWFSEndPoint = 		gtServicesHost + "/geoserver/wfs";
var gtSearchPropertyEndPoint =  gtServicesHost + "/ws/rest/v3/ws_property_id_by_propnum.php";
var gtSearchComboEndPoint = 	gtServicesHost + "/ws/rest/v3/ws_all_features_by_string_and_lga.php";
// Doing away with the search box:
var gtHideSearch=true;
// Collapsing layer tree on initial display
var gtCollapseLayerTree=true;
// Doing away with the top part
var gtHideGlobalNorthRegion=true;

var gtGetLiveDataEndPoints=[
	{ urlLayout:'http://103.29.64.29/ws/rest/v3/ws_get_layouts.php', 	urlLiveData:'http://103.29.64.29/ws/rest/v3/ws_get_live_data.php',	storeMode:'pgsql',	storeName:'creeklinkgis'}
];

// External resources
//var gtLogoClientSrc = "http://www.pozi.com/"+"theme/app/img/mitchell_banner.jpg";
var gtLogoClientSrc = "http://www.pozi.com/"+"theme/app/img/creeklink-logo.png";
var gtLogoClientWidth=173;

// Map resources
// Center determined by: select ST_AsText(ST_Transform(ST_SetSRID(ST_Centroid(the_geom),4283),900913)) from dse_vmadmin_lga where lga_name='MITCHELL'
var gtMapCenter = [16024006, -4632500];
var gtMapZoom = 12;
// When zooming after a search
var gtZoomMax = 18;
// Constraint on the general max zoom level of the map
var gtMaxZoomLevel = 21;
var gtQuickZoomDatastore = [
	['144.936',	'-37.484',	'144.989',	'-37.467', 'Beveridge'	],
	['145.025',	'-37.229',	'145.069',	'-37.195', 'Broadford'	],
	['144.931',	'-37.325',	'144.967',	'-37.281', 'Kilmore'	],
	['144.845',	'-37.148',	'144.876',	'-37.111', 'Pyalong'	],
	['145.12',	'-37.04',	'145.168',	'-37.006', 'Seymour'	],
	['145.085',	'-37.109',	'145.112',	'-37.084', 'Tallarook'	],
	['144.793',	'-37.049',	'144.803',	'-37.038', 'Tooborac'	],
	['144.953',	'-37.431',	'145.021',	'-37.379', 'Wallan'	],
	['145.018',	'-37.381',	'145.045',	'-37.349', 'Wandong'	],
	['145.064',	'-37.303',	'145.069',	'-37.297', 'Waterford Park']];

		
// UI labels
var gtDetailsTitle='Details';
var gtInfoTitle = 'Info';
var gtEmptyTextQuickZoom = 'Zoom to creek';
var gtEmptyTextSearch = 'Find properties, roads, features, etc...';
var gtLoadingText = 'Searching...';
var gtEmptyTextSelectFeature = 'Selected features ...';
var gtClearButton='clear';
var gtPropNum;
var gtLegendHeight = 400;
var gtPrintTitle = "Creek-link";

// Datasources
var gtMapDataSources = {
	local: {
		url: "http://www.pozi.com/geoserver/CREEKLINK/ows",
		title: "CreekLink Layers",
		ptype: "gxp_wmscsource",
		tiled: false
	},
//	google: {
//	    ptype: "gxp_googlesource"
//	},
//	bing: {
//	    ptype: "gxp_bingsource"
//	},
//	ol: {
//		ptype: "gxp_olsource"
//	},
	mapquest: {
		ptype: "gxp_mapquestsource"
	},
	backend: {
		url: ["http://m1.pozi.com/geoserver/ows","http://m2.pozi.com/geoserver/ows","http://m3.pozi.com/geoserver/ows","http://m4.pozi.com/geoserver/ows"],
		title: "Pozi Data Server",
		ptype: "gxp_wmscsource",
		transition:'resize'
	},
	cl: {
		url: "http://103.29.64.29/geoserver/ows",
		title: "New Pozi Data Server",
		ptype: "gxp_wmscsource",
		transition:'resize'
	},
	ol: {
		ptype: "gxp_olsource"
	}
};
    
// Initial layers      
var gtLayers = [
	{
//		source:"backend",
//		name:"VICMAP:VICMAP_PROPERTY_ADDRESS",
//		title:"Property (Vicmap)",
//		visibility:true,
//		opacity:0.25,
//		format:"image/GIF",
//		styles:"",
//		transparent:true,
//		tiled:false
//	},{
		source:"cl",
		name:"CREEKLINK:CREEK",
		title:"Creeks",
		visibility:true,
		opacity:0.85,
		format:"image/png8",
		styles:"",
		transparent:true,
		tiled:false,
		transition:''
	},{
		source:"backend",
		name:"VICMAP:VMPROP_PARCEL_OPTI",
		title:"Parcels (Vicmap)",
		visibility:true,
		opacity:0.5,
		format:"image/png8",
		styles:"creek_parcel",
		transparent:true,
		tiled:false,
		transition:''
	},{
		source:"cl",
		name:"creek_segments",
		title:"Creek Tiles",
		visibility:true,
		opacity:0.66,
		format:"image/png8",
		styles:"",
		transparent:true,
		tiled:false,
		transition:null
//	},{
//	    source: "google",
//	    name: "HYBRID",
//		visibility: true
	},{
	    source: "mapquest",
	    name: "osm",
		visibility: false

//	},{
//	    source: "bing",
//	    title: "Bing Road Map",
//	    name: "Road"

//	},{
//		source:"backend",
//		name:"VicmapClassic",
//		title:"Vicmap Classic",
//		visibility:true,
//		opacity:1,
//		group:"background",
//		selected:false,
//		format:"image/png8",
//		styles:"",
//		transparent:true,
//		cached:true
//	},{
//		source:"mapquest",
//		name: "osm",
//		visibility: false,
//		group:"background"
	},{
		source: "ol",
		group: "background",
		fixed: true,
		type: "OpenLayers.Layer",
		args: [
			"None", {visibility: true}
		]
	}];


// WFS layer: style , definition , namespaces
var gtStyleMap = new OpenLayers.StyleMap();
var gtSymbolizer = {name:"test",strokeColor:"yellow",strokeWidth: 15, strokeOpacity:0.5,fillColor:"yellow",fillOpacity:0.2};
var gtWFSsrsName = "EPSG:4326";
var gtWFSgeometryName = "the_geom";

// Definition of the WFS layer - arbitrarily defining a WFS layer to be able to add it to the map (so that it's ready to be used when the app has loaded)
var gtLayerLocSel = new OpenLayers.Layer.Vector("Selection", {
	styleMap: gtStyleMap,
	strategies: [new OpenLayers.Strategy.BBOX({ratio:100})],
        protocol: new OpenLayers.Protocol.WFS({
		version:       "1.1.0",
		url:           gtWFSEndPoint,
		featureType:   "VMPROP_PROPERTY",
		srsName:       gtWFSsrsName,
		featureNS:     gtFeatureNS,
		geometryName:  gtWFSgeometryName,
		schema:        gtWFSEndPoint+"?service=WFS&version=1.1.0&request=DescribeFeatureType&TypeName="+"VICMAP:VMPROP_PROPERTY"
	}),
	filter: new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.EQUAL_TO,property: 'pr_propnum',value: -1}),
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
		}, {
//			ptype: "gxp_addlayers",
//			actionTarget: "tree.tbar",
//			upload: true
//		}, {
			ptype: "gxp_removelayer",
			actionTarget: ["layertree.contextMenu"]
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
			ptype: "gxp_wmsgetfeatureinfo",
			toggleGroup: this.toggleGroup,
			actionTarget: {
				target: "paneltbar",
				index: 2
			}
		}, {
			ptype: "gxp_measure",
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
		if (this.authorizedRoles.length === 0) {
			this.loginButton = new Ext.Button({
				iconCls: 'login',
				text: this.loginText,
				handler: this.showLoginDialog,
				scope: this
			});
			tools.push(['->', this.loginButton]);
		} else {

		}
		tools.unshift("");
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
		tools.unshift("");
		return tools;
	};
	
	
var poziLinkClickHandler = function () {
	var appInfo = new Ext.Panel({
		title: "GeoExplorer",
		html: "<iframe style='border: none; height: 100%; width: 100%' src='about.html' frameborder='0' border='0'><a target='_blank' href='about.html'>" + this.aboutText + "</a> </iframe>"
	});
	var poziInfo = new Ext.Panel({
		title: "Pozi Explorer",
		html: "<iframe style='border: none; height: 100%; width: 100%' src='about-pozi.html' frameborder='0' border='0'><a target='_blank' href='about-pozi.html'>" + "</a> </iframe>"
	});
	var tabs = new Ext.TabPanel({
		activeTab: 0,
		items: [
		poziInfo,appInfo]
	});
	var win = new Ext.Window({
		title: "About this map",
		modal: true,
		layout: "fit",
		width: 300,
		height: 300,
		items: [
			tabs]
		});
	win.show();
};	
	
var gtInitialDisclaimerFlag=false;
var gtDisclaimer="disclaimer.html";
var gtRedirectIfDeclined="http://www.mitchellshire.vic.gov.au/";
var gtLinkToCouncilWebsite="http://www.mitchellshire.vic.gov.au/";
var gtBannerLineColor="#596C13";
var gtBannerRightCornerLine1="Creek-link";
var gtBannerRightCornerLine2="Victoria, Australia";
