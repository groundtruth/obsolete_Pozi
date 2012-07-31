// Javascript configuration file for Cardinia

// Workspace containing the layers and corresponding namespace
var gtWorkspaceName= "CARDINIA";
// This is a multi-database setup so we need to specify the LGA
var gtLGACode = "311";
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

var gtGetLiveDataEndPoints=[
	{ urlLayout:'http://192.168.10.12/ws/rest/v3/ws_get_layouts.php', 	urlLiveData:'http://192.168.10.12/ws/rest/v3/ws_get_live_data.php',	storeMode:'sqlite',	storeName:'cardinia'},
	{ urlLayout:'http://49.156.17.41/ws/rest/v3/ws_get_layouts.php', 	urlLiveData:'http://49.156.17.41/ws/rest/v3/ws_get_live_data.php',	storeMode:'pgsql',	storeName:'vicmap'}
];

// External resources
//var gtPoziLogoSrc = gtServicesHost+"/"+"theme/app/img/pozi-logo.png";
//var gtPoziLogoWidth = 165; 
var gtLogoClientSrc = "http://www.pozi.com/"+"theme/app/img/cardinia_logo.png";
var gtLogoClientWidth=214;

// Map resources
// Center determined by: select ST_AsText(ST_Transform(ST_SetSRID(ST_Centroid(the_geom),4283),900913)) from dse_vmadmin_lga where lga_name='CARDINIA'
var gtMapCenter = [16205074, -4591164];
var gtMapZoom = 11;
// When zooming after a search
var gtZoomMax = 18;
// Constraint on the general max zoom level of the map
var gtMaxZoomLevel = 20;
var gtQuickZoomDatastore = [
['145.346','-38.062','145.389','-38.038','Beaconsfield'],
['145.409','-38.006','145.417','-37.991','Beaconsfield Upper'],
['145.296','-38.085','145.372','-37.997','Berwick'],
['145.706','-38.099','145.728','-38.090','Bunyip'],
['145.639','-38.196','145.643','-38.192','Catani'],
['145.316','-38.117','145.367','-38.046','Clyde North'],
['145.483','-37.950','145.501','-37.924','Cockatoo'],
['145.433','-37.936','145.449','-37.926','Emerald'],
['145.668','-38.095','145.688','-38.084','Garfield'],
['145.537','-37.955','145.561','-37.948','Gembrook'],
['145.481','-38.208','145.504','-38.189','Koo Wee Rup'],
['145.560','-38.276','145.586','-38.255','Lang Lang'],
['145.760','-38.119','145.778','-38.104','Longwarry'],
['145.600','-38.033','145.602','-38.032','Maryknoll'],
['145.566','-38.086','145.574','-38.080','Nar Nar Goon'],
['145.423','-38.071','145.437','-38.064','Officer'],
['145.442','-38.091','145.520','-38.052','Pakenham'],
['145.621','-38.086','145.634','-38.079','Tynong']
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
var gtPrintTitle = "Cardinia Shire Council";

// Datasources
var gtMapDataSources = {
//	local: {
//		url: "/geoserver/CARDINIA/ows",
//		title: "Cardinia Shire Council Layers",
//		ptype: "gxp_wmscsource",
//		tiled: false
//	},
	backend_cascaded: {
		url: "http://basemap.pozi.com/geoserver/DSE/wms",
		title: "DSE Vicmap Layers",
		ptype: "gxp_wmscsource"
	},
//	dse_iws_cascaded: {
//		url: ["http://m1.pozi.com/geoserver/WESTWIMMERA/ows","http://m2.pozi.com/geoserver/WESTWIMMERA/ows","http://m3.pozi.com/geoserver/WESTWIMMERA/ows","http://m4.pozi.com/geoserver/WESTWIMMERA/ows"],
//		title: "DSE Image Web Server",
//		ptype: "gxp_wmscsource",
//		format: "image/JPEG",
//		group: "background",
//		transition:'resize'
//	},
	mapquest: {
		ptype: "gxp_mapquestsource"
	},
//	bing: {
//		ptype: "gxp_bingsource"
//	},
	osm: {
		ptype: "gxp_osmsource"
	},
	ol: {
		ptype: "gxp_olsource"
	},
	backend: {
		url: ["http://m1.pozi.com/geoserver/ows","http://m2.pozi.com/geoserver/ows","http://m3.pozi.com/geoserver/ows","http://m4.pozi.com/geoserver/ows"],
		title: "Pozi Data Server",
		ptype: "gxp_wmscsource",
		transition:'resize'
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
		format:"image/GIF",
		styles:"",
		transparent:true,
		tiled: false
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
		name:"VICMAP:VW_CARDINIA_MASK",
		title:"Municipal Boundary",
		visibility:true,
		opacity:0.6,
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
		tiled:false,
		transition:''
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
		tiled: true,
		cached:true
	},{
		source:"mapquest",
		name: "osm",
		visibility: false
///	},{ // Bing bug - getFeatureInfo triggered at each pan
///		source:"bing",
///		name: "Aerial",
///		title: "Bing Aerial Imagery",
///		visibility: false
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
			ptype: "gxp_addlayers",
			actionTarget: "tree.tbar",
			upload: true
		}, {
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
///			ptype: "gxp_featuremanager",
///			id: "featuremanager",
///			maxFeatures: 20
///		}, {
///			ptype: "gxp_featureeditor",
///			featureManager: "featuremanager",
///			autoLoadFeatures: true,
///			toggleGroup: this.toggleGroup,
///			actionTarget: {
///				target: "paneltbar",
///				index: 6
///			}
///		}, {
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
		tools.unshift("");
		tools.unshift("");
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
///		tools.unshift("");
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
var gtRedirectIfDeclined="http://www.yarriambiack.vic.gov.au/";
var gtLinkToCouncilWebsite="http://www.cardinia.vic.gov.au/";
var gtBannerLineColor="#FEC422";
var gtBannerRightCornerLine1="Cardinia Shire Council";
var gtBannerRightCornerLine2="Victoria, Australia";
