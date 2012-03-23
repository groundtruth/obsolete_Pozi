// Javascript configuration file for West Wimmera

// Workspace containing the layers and corresponding namespace
var gtWorkspaceName= "BULOKE";
// This is a multi-database setup so we need to specify the LGA
var gtLGACode = "309";
var gtFeatureNS = "http://www.pozi.com/vicmap";

// Database config for the master search table
var gtDatabaseConfig = "vicmap";

// Aerial imagery credentials
gtAerialUsername = "gtruth";
gtAerialPassword = "buloke";

//  Services
var gtServicesHost = "http://49.156.17.41";
///var gtServicesHost = "http://localhost";
////var gtOWSEndPoint = 		gtServicesHost + "/geoserver/"+gtWorkspaceName+"/ows";
var gtOWSEndPoint = 		gtServicesHost + "/geoserver/ows";
//var gtOWSEndPointVicmap = 	gtServicesHost + "/geoserver/ows";
var gtWFSEndPoint = 		gtServicesHost + "/geoserver/wfs";
var gtSearchPropertyEndPoint =  gtServicesHost + "/ws/rest/v3/ws_property_id_by_propnum.php";
var gtSearchComboEndPoint = 	gtServicesHost + "/ws/rest/v3/ws_all_features_by_string_and_lga.php";

var gtGetLiveDataEndPoints=[
	{ urlLayout:'http://10.58.200.28/ws/rest/v3/ws_get_layouts.php', 	urlLiveData:'http://10.58.200.28/ws/rest/v3/ws_get_live_data.php',	storeMode:'sqlite',	storeName:'buloke'},
	{ urlLayout:'http://49.156.17.41/ws/rest/v3/ws_get_layouts.php', 	urlLiveData:'http://49.156.17.41/ws/rest/v3/ws_get_live_data.php',	storeMode:'pgsql',	storeName:'vicmap'}
];

// External resources
//var gtPoziLogoSrc = gtServicesHost+"/"+"theme/app/img/pozi-logo.png";
//var gtPoziLogoWidth = 165; 
var gtLogoClientSrc = "http://www.pozi.com/theme/app/img/buloke_banner.png";
var gtLogoClientWidth=179;

// Map resources
// Center determined by: select ST_AsText(ST_Transform(ST_SetSRID(ST_Centroid(the_geom),4283),900913)) from dse_vmadmin_lga where lga_name='WEST WIMMERA'
var gtMapCenter = [15932253, -4280583];
var gtMapZoom = 9;
// When zooming after a search
var gtZoomMax = 18;
// Constraint on the general max zoom level of the map
var gtMaxZoomLevel = 20;
var gtQuickZoomDatastore = [
	['142.992',	'-35.6407',	'142.997',	'-35.6357'	,'Berriwillock'	],
	['142.909',	'-35.9871',	'142.918',	'-35.9798'	,'Birchip'	],
	['143.348',	'-36.2773',	'143.366',	'-36.2639'	,'Charlton'	],
	['143.099',	'-35.7215',	'143.107',	'-35.7163'	,'Culgoa'	],
	['142.976',	'-36.3759',	'142.987',	'-36.3629'	,'Donald'	],
	['142.698',	'-35.3103',	'142.704',	'-35.3058'	,'Nandaly'	],
	['143.176',	'-35.8547',	'143.179',	'-35.8517'	,'Nullawil'	],
	['142.851',	'-35.5088',	'142.86',	'-35.5004'	,'Sea Lake'	],
	['142.86',	'-36.1584',	'142.866',	'-36.1489'	,'Watchem'	],
	['142.723',	'-35.7577',	'142.725',	'-35.7573'	,'Watchupga'	],
	['143.223',	'-36.0791',	'143.234',	'-36.0706'	,'Wycheproof'	] ];

		
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
var gtPrintTitle = "Buloke Shire Council";

// Datasources 
var gtMapDataSources = {
	backend: {
		url: gtOWSEndPoint,
		title: "Remote GeoServer",
		ptype: "gxp_wmscsource"
	},
	local: {
		url: "/geoserver/ows",
		title: "Local GeoServer",
		ptype: "gxp_wmscsource"
	},
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
	},
	dse: {
		url: "http://images.land.vic.gov.au/ecwp/ecw_wms.dll",
		title: "DSE Imagery Server"
	}
};
    
// Initial layers      
var gtLayers = [
	{
		source:"dse",
		name :"AERIAL_MALLEE_2009JAN14_AIR_VIS_50CM_MGA54",
		title:"Aerial Photo (CIP 2009)",
		visibility:false,
		opacity:0.9,
		selected:false,
		format:"image/JPEG",
		transparent:true
	},{
		source:"backend",
		name:"VICMAP:VW_DSE_VMPLAN_ZONE",
		title:"Planning Zones (Vicmap)",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"",
		transparent:true,
		tiled: false
	},{
		source:"backend",
		name:"VICMAP:VW_DSE_VMPLAN_OVERLAY",
		title:"Planning Overlays (Vicmap)",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"",
		transparent:true,
		tiled: false
	},{
		source:"backend",
		name:"VICMAP:VICMAP_PROPERTY_ADDRESS",
		title:"Property (Vicmap)",
		visibility:true,
		opacity:0.25,
		format:"image/png8",
		styles:"",
		transparent:true,
		tiled:false
	},{
		source:"backend",
		name:"VICMAP:VMPROP_PARCEL",
		title:"Parcel (Vicmap)",
		visibility:false,
		opacity:0.75,
		format:"image/png8",
		styles:"parcel_label",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LYNX_PROPERTY_OWNER",
		title:"Property Owner (Lynx)",
		visibility:false,
		opacity:0.5,
		format:"image/png8",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":LYNX_DOG_REGISTRATION",
		title:"Dog Registration (Lynx)",
		visibility:false,
		opacity:1,
		format:"image/png8",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":LYNX_CAT_REGISTRATION",
		title:"Cat Registration (Lynx)",
		visibility:false,
		opacity:1,
		format:"image/png8",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":LYNX_WASTE_COLLECTION",
		title:"Waste Collection (Lynx)",
		visibility:false,
		opacity:1,
		format:"image/png8",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":LYNX_BUILDING_PERMIT",
		title:"Building Permit (Lynx)",
		visibility:false,
		opacity:1,
		format:"image/png8",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":LYNX_PLANNING_PERMIT",
		title:"Planning Permit (Lynx)",
		visibility:false,
		opacity:1,
		format:"image/png8",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":ASSETS_MOLONEY_ROADS",
		title:"Roads (Moloney)",
		visibility:false,
		opacity:1,
		format:"image/png8",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":ASSETS_PROPOSED_ROAD_HIERARCHY",
		title:"Proposed Road Hierarchy (Assets)",
		visibility:false,
		opacity:0.5,
		format:"image/png8",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":DOT_SCHOOLBUS_ROUTES_2011",
		title:"School Bus Routes (DOT 2011)",
		visibility:false,
		opacity:0.5,
		format:"image/png8",
		styles:"",
		transparent:true
	},{
		source:"backend",
		name:"VICMAP:VW_TRANSFER_STATION",
		title:"Transfer Stations",
		visibility:false,
		opacity:0.85,
		format:"image/png8",
		styles:"",
		transparent:true,
		tiled:false
	},{
		source:"backend",
		name:"VICMAP:VW_BULOKE_MASK",
		title:"Municipal Boundary",
		visibility:true,
		opacity:0.6,
		format:"image/png8",
		styles:"",
		transparent:true,
		tiled:false
	},{
		source:"backend",
		name:"VicmapClassic",
		title:"Vicmap Classic",
		visibility:true,
		opacity:1,
		group:"background",
		selected:false,
		format:"image/png8",
		styles:"",
		transparent:true,
		cached:true
	},{
		source:"mapquest",
		name: "osm",
		visibility: false
	},{
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
var gtRedirectIfDeclined="http://www.buloke.vic.gov.au/";
var gtLinkToCouncilWebsite="http://www.buloke.vic.gov.au/";
var gtBannerLineColor="#0066A3";
var gtBannerRightCornerLine1="Buloke Shire Council";
var gtBannerRightCornerLine2="Victoria, Australia";
