// Javascript configuration file for Yarriambiack

// Workspace containing the layers and corresponding namespace
var gtWorkspaceName= "YARRIAMBIACK";
// This is a multi-database setup so we need to specify the LGA
var gtLGACode = "378";
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
	{ urlLayout:'http://192.168.10.12/ws/rest/v3/ws_get_layouts.php', 	urlLiveData:'http://192.168.10.12/ws/rest/v3/ws_get_live_data.php',	storeMode:'sqlite',	storeName:'yarriambiack'},
	{ urlLayout:'http://49.156.17.41/ws/rest/v3/ws_get_layouts.php', 	urlLiveData:'http://49.156.17.41/ws/rest/v3/ws_get_live_data.php',	storeMode:'pgsql',	storeName:'vicmap'}
];

// External resources
//var gtPoziLogoSrc = gtServicesHost+"/"+"theme/app/img/pozi-logo.png";
//var gtPoziLogoWidth = 165; 
var gtLogoClientSrc = "http://www.yarriambiack.vic.gov.au/media/img/logo.png";
var gtLogoClientWidth=122;

// Map resources
// Center determined by: select ST_AsText(ST_Transform(ST_SetSRID(ST_Centroid(the_geom),4283),900913)) from dse_vmadmin_lga where lga_name='WEST WIMMERA'
var gtMapCenter = [15854012, -4299244];
var gtMapZoom = 9;
// When zooming after a search
var gtZoomMax = 18;
// Constraint on the general max zoom level of the map
var gtMaxZoomLevel = 20;
var gtQuickZoomDatastore = [
['142.415','-35.945','142.424','-35.934','Beulah'],
['142.412','-36.079','142.421','-36.075','Brim'],
['142.356','-35.736','142.371','-35.709','Hopetoun'],
['142.578','-35.610','142.582','-35.605','Lascelles'],
['142.580','-36.466','142.595','-36.455','Minyip'],
['142.457','-36.625','142.483','-36.613','Murtoa'],
['142.186','-35.384','142.194','-35.377','Patchewollock'],
['142.626','-36.640','142.640','-36.623','Rupanyup'],
['142.438','-35.403','142.442','-35.400','Speed'],
['142.424','-35.348','142.428','-35.343','Tempy'],
['142.383','-36.265','142.403','-36.242','Warracknabeal'],
['142.659','-35.688','142.675','-35.679','Woomelang'],
['142.052','-35.771','142.057','-35.766','Yaapeet']
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
var gtPrintTitle = "Yarriambiack Shire Council";

// Datasources
var gtMapDataSources = {
	local: {
		url: "/geoserver/YARRIAMBIACK/ows",
		title: "Yarriambiack Shire Council Layers",
		ptype: "gxp_wmscsource",
		tiled: false
	},
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
//	osm: {
//		ptype: "gxp_osmsource"
//	},
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
		opacity:1,
		format:"image/png8",
		styles:"",
		transparent:true,
		tiled:false,
		transition:''
	},{
		source:"local",
		name:"YARRIAMBIACK:YSC_UG_DRAINAGE_PIPE",
		title:"Underground Drainage Pipes",
		visibility:false,
		opacity:1,
		format:"image/png8",
		styles:"",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:"YARRIAMBIACK:YSC_PIT",
		title:"Pits",
		visibility:false,
		opacity:1,
		format:"image/png8",
		styles:"",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:"YARRIAMBIACK:YSC_PUBLIC_LIGHTING",
		title:"Public Lighting",
		visibility:false,
		opacity:1,
		format:"image/png8",
		styles:"",
		transparent:true,
		tiled:false
	},{
		source:"local",
		name:"YARRIAMBIACK:YSC_URBAN_HYDRANT",
		title:"Urban Hydrants",
		visibility:false,
		opacity:1,
		format:"image/png8",
		styles:"",
		transparent:true,
		tiled:false
	},{
		source:"backend",
		name:"VICMAP:VW_YARRIAMBIACK_MASK",
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
var gtLinkToCouncilWebsite="http://www.yarriambiack.vic.gov.au/";
var gtBannerLineColor="#CF5D38";
var gtBannerRightCornerLine1="Yarriambiack Shire Council";
var gtBannerRightCornerLine2="Victoria, Australia";
