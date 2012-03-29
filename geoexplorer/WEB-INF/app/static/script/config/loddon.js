// Javascript configuration file for West Wimmera

// Workspace containing the layers and corresponding namespace
var gtWorkspaceName= "LODDON";
// This is a multi-database setup so we need to specify the LGA
var gtLGACode = "338";
var gtFeatureNS = "http://www.pozi.com/vicmap";

// Database config for the master search table
var gtDatabaseConfig = "vicmap";

// Aerial imagery credentials
gtAerialUsername = "Loddon";
gtAerialPassword = "loddon";

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
	{ urlLayout:'http://10.58.200.28/ws/rest/v3/ws_get_layouts.php', 	urlLiveData:'http://10.58.200.28/ws/rest/v3/ws_get_live_data.php',	storeMode:'sqlite',	storeName:'loddon'},
	{ urlLayout:'http://49.156.17.41/ws/rest/v3/ws_get_layouts.php', 	urlLiveData:'http://49.156.17.41/ws/rest/v3/ws_get_live_data.php',	storeMode:'pgsql',	storeName:'vicmap'}
];

// External resources
//var gtPoziLogoSrc = gtServicesHost+"/"+"theme/app/img/pozi-logo.png";
//var gtPoziLogoWidth = 165; 
var gtLogoClientSrc = "http://www.pozi.com/"+"theme/app/img/loddon_logo.jpg";
var gtLogoClientWidth=116;

// Map resources
// Center determined by: select ST_AsText(ST_Transform(ST_SetSRID(ST_Centroid(the_geom),4283),900913)) from dse_vmadmin_lga where lga_name='WEST WIMMERA'
var gtMapCenter = [16015218, -4350806];
var gtMapZoom = 9;
// When zooming after a search
var gtZoomMax = 18;
// Constraint on the general max zoom level of the map
var gtMaxZoomLevel = 20;
var gtQuickZoomDatastore = [
['143.713','-36.126','143.735','-36.108','Boort'],
['143.748','-36.294','143.758','-36.288','Borung'],
['143.930','-36.607','143.951','-36.596','Bridgewater'],
['144.072','-36.300','144.079','-36.299','Calivil'],
['144.228','-36.375','144.233','-36.368','Dingee'],
['143.848','-36.887','143.867','-36.877','Eddington'],
['143.857','-36.583','143.876','-36.563','Inglewood'],
['143.693','-36.358','143.710','-36.350','Korong Vale'],
['144.227','-36.213','144.238','-36.207','Mitiamo'],
['143.897','-36.748','143.916','-36.736','Newbridge'],
['144.106','-36.062','144.126','-36.045','Pyramid Hill'],
['143.959','-36.420','143.984','-36.403','Serpentine'],
['143.826','-36.777','143.835','-36.762','Tarnagulla'],
['143.603','-36.428','143.621','-36.407','Wedderburn'],
['143.598','-36.274','143.603','-36.270','Wychitella']
];

		
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
var gtPrintTitle = "Loddon Shire Council";

// Datasources 
var gtMapDataSources = {
	backend: {
		url: ["http://m1.pozi.com/geoserver/ows","http://m2.pozi.com/geoserver/ows","http://m3.pozi.com/geoserver/ows","http://m4.pozi.com/geoserver/ows"],
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
		name:gtWorkspaceName+":LSC_PROPERTY_VALUATION",
		title:"Stage 2:CIV Change (%)",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LSC_PROPERTY_VALUATION",
		title:"Stage 2:Level of Values ($ per ha)",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"LevelOfvalue($perha)",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LSC_PROPERTY_VALUATION",
		title:"Stage 2:SV Change (%)",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"SV_Change(%)",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LSC_PROPERTY_VALUATION",
		title:"Stage 2:SubMarket Groups",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"SubMarketsGroups",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LSC_PROPERTY_VALUATION",
		title:"Stage 2:Sales Use",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"PointGrad",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LSC_STAGE4_RESIDENTIAL",
		title:"Stage 4: Residential data:Sales Use",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"PointGrad_ST4",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LSC_STAGE4_RESIDENTIAL",
		title:"Stage 4: Residential data:CIV Change (%)",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"CIV_Change(%)",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LSC_STAGE4_RESIDENTIAL",
		title:"Stage 4: Residential data:SV Change(%)",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"SV_Change(%)",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LSC_STAGE4_RESIDENTIAL",
		title:"Stage 4: Residential data:SubMarkets Groups",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"SubMarketsGroups_Residential_ST4",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LSC_STAGE4_RESIDENTIAL",
		title:"Stage 4: Residential data:Level of values ($ per ha)",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"LevelOfvalue($perha)_ST4",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LSC_STAGE4_RURAL",
		title:"Stage 4: Rural data:Sales Use",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"PointGrad_ST4",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LSC_STAGE4_RURAL",
		title:"Stage 4: Rural data:CIV Change (%)",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"CIV_Change(%)",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LSC_STAGE4_RURAL",
		title:"Stage 4: Rural data:SV Change (%)",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"SV_Change(%)",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LSC_STAGE4_RURAL",
		title:"Stage 4: Rural data:Level of Values ($ per ha)",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"LevelOfvalue($perha)_ST4",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:gtWorkspaceName+":LSC_STAGE4_RURAL",
		title:"Stage 4: Rural data:SubMarkets Groups",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"SubMarketsGroups",
		transparent:true,
		tiled:false
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
		name:"LabelClassic",
		title:"Labels",
		visibility:true,
		opacity:1,
		selected:false,
		format:"image/png8",
		styles:"",
		transparent:true,
		cached:false,
		tiled:false
	},{
		source:"backend",
		name:"VICMAP:VW_LODDON_MASK",
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
		source:"dse",
		name :"SATELLITE_NTH-VIC-FLOODS_2010SEP07_SAT_TM542_25M_MGA55",
		title:"Aerial Photo (North Victoria 07/09/2010)",
		visibility:false,
		opacity:1,
		group:"background",
		selected:false,
		format:"image/JPEG",
		transparent:true
	},{
		source:"dse",
		name :"SATELLITE_LODDON-FLOOD_2011JAN16_SAT_RE321_5M_MGA54",
		title:"Aerial Photo (Loddon 16/01/2011)",
		visibility:false,
		opacity:1,
		group:"background",
		selected:false,
		format:"image/JPEG",
		transparent:true
	},{
		source:"dse",
		name :"TOWNS_SERPENTINE-FLOOD_2011JAN16_AIR_CIR_15CM_MGA55",
		title:"Aerial Photo (Serpentine 16/01/2011 IR)",
		visibility:false,
		opacity:1,
		group:"background",
		selected:false,
		format:"image/JPEG",
		transparent:true
	},{
		source:"dse",
		name :"TOWNS_SERPENTINE-FLOOD_2011JAN16_AIR_VIS_15CM_MGA55",
		title:"Aerial Photo (Serpentine 16/01/2011)",
		visibility:false,
		opacity:1,
		group:"background",
		selected:false,
		format:"image/JPEG",
		transparent:true
	},{
		source:"dse",
		name :"TOWNS_KERANG-FLOOD_2011JAN22_AIR_VIS_50CM_MGA54",
		title:"Aerial Photo (Kerang 22/01/2011)",
		visibility:false,
		opacity:1,
		group:"background",
		selected:false,
		format:"image/JPEG",
		transparent:true
	},{
		source:"dse",
		name :"TOWNS_KERANG-FLOOD_2011JAN19_AIR_CIR_50CM_MGA54",
		title:"Aerial Photo (Kerang 19/01/2011 IR)",
		visibility:false,
		opacity:1,
		group:"background",
		selected:false,
		format:"image/JPEG",
		transparent:true
	},{
		source:"dse",
		name :"TOWNS_KERANG-FLOOD_2011JAN19_AIR_VIS_50CM_MGA54",
		title:"Aerial Photo (Kerang 19/01/2011)",
		visibility:false,
		opacity:1,
		group:"background",
		selected:false,
		format:"image/JPEG",
		transparent:true
	},{
		source:"dse",
		name :"AERIAL_LODDON_2009APR14_AIR_CIR_35CM_MGA54",
		title:"Aerial Photo (CIP 2009 IR)",
		visibility:false,
		opacity:1,
		group:"background",
		selected:false,
		format:"image/JPEG",
		transparent:true
	},{
		source:"dse",
		name :"AERIAL_LODDON_2009APR14_AIR_VIS_35CM_MGA54",
		title:"Aerial Photo (CIP 2009)",
		visibility:false,
		opacity:1,
		group:"background",
		selected:false,
		format:"image/JPEG",
		transparent:true
	},{
		source:"mapquest",
		name: "osm",
		visibility: false,
		group:"background"
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
var gtRedirectIfDeclined="http://www.loddon.vic.gov.au/";
var gtLinkToCouncilWebsite="http://www.loddon.vic.gov.au/";
var gtBannerLineColor="#36A5D0";
var gtBannerRightCornerLine1="Loddon Shire Council";
var gtBannerRightCornerLine2="Victoria, Australia";