// Javascript configuration file for Mitchell

// Workspace containing the layers and corresponding namespace
var gtWorkspaceName= "MITCHELL"; 
var gtFeatureNS = "http://www.pozi.com.au/mitchell";

// Database config for the master search table
var gtDatabaseConfig = "mitchellgis";

//  Services
var gtServicesHost = "http://www.pozi.com";
////var gtOWSEndPoint = 		gtServicesHost + "/geoserver/"+gtWorkspaceName+"/ows";
var gtOWSEndPoint = 		gtServicesHost + "/geoserver/ows";
//var gtOWSEndPointVicmap = 	gtServicesHost + "/geoserver/ows";
var gtWFSEndPoint = 		gtServicesHost + "/geoserver/wfs";
var gtSearchPropertyEndPoint =  gtServicesHost + "/ws/rest/v3/ws_property_id_by_propnum.php";
var gtSearchComboEndPoint = 	gtServicesHost + "/ws/rest/v3/ws_all_features_by_string.php";

// External resources
var gtPoziLogoSrc = gtServicesHost+"/"+"theme/app/img/pozi-logo.png";
var gtPoziLogoWidth = 265; 
var gtLogoClientSrc = gtServicesHost+"/"+"theme/app/img/mitchell_banner.jpg";
var gtLogoClientWidth=265;

// Map resources
// Center determined by: select ST_AsText(ST_Transform(ST_SetSRID(ST_Centroid(the_geom),4283),900913)) from dse_vmadmin_lga where lga_name='MITCHELL'
var gtMapCenter = [16143500, -4461908];
var gtMapZoom = 10;
var gtZoomMax=18;
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
var gtEmptyTextQuickZoom = 'Zoom to town';
var gtEmptyTextSearch = 'Find properties, roads, features, etc...';
var gtLoadingText = 'Searching...';
var gtEmptyTextSelectFeature = 'Selected features ...';
var gtClearButton='clear';
var gtPropNum;
var gtLegendHeight = 400;
var gtPrintTitle = "Mitchell Shire Council";

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
		name:gtWorkspaceName+":VMPLAN_ZONE_CODELIST",
		title:"Planning Zones (Vicmap)",
		visibility:false,
		opacity:0.5,
		format:"image/png8",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":VMPLAN_OVERLAY_CODELIST",
		title:"Planning Overlays (Vicmap)",
		visibility:false,
		opacity:0.5,
		format:"image/png8",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":VICMAP_BUILDINGREG_BUSHFIRE_PRONE_AREA",
		title:"Busfire-Prone Areas (Vicmap)",
		visibility:false,
		opacity:0.25,
		format:"image/png8",
		styles:"",
		transparent:true
	},{
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
		name:gtWorkspaceName+":MSC_GARBAGE_COLLECTION",
		title:"Waste Collection",
		visibility:false,
		opacity:0.6,
		format:"image/png8",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":MSC_LEISURE_CENTRE",
		title:"Leisure Centres",
		visibility:false,
		opacity:0.75,
		format:"image/png",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":MSC_SPORTS_RESERVE",
		title:"Sports Reserves",
		visibility:false,
		opacity:0.75,
		format:"image/png",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":MSC_LIBRARY",
		title:"Libraries",
		visibility:false,
		opacity:0.75,
		format:"image/png",
		styles:"",
		transparent:true
	},{
		source:"local",
		name:gtWorkspaceName+":MSC_KINDERGARTEN",
		title:"Kindergartens",
		visibility:false,
		opacity:0.75,
		format:"image/png",
		styles:"",
		transparent:true
	},{
//		source:"localVicmap",
		source:"local",
		name:"VicmapClassicMitchell",
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
	filter: new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.EQUAL_TO,property: 'prop_propnum',value: 0}),
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
//		if (this.authorizedRoles.length === 0) {
//			this.loginButton = new Ext.Button({
//				iconCls: 'login',
//				text: this.loginText,
//				handler: this.showLoginDialog,
//				scope: this
//			});
//			tools.push(['->', this.loginButton]);
//		} else {
//
//		}
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
	
var gtInitialDisclaimerFlag=true;
var gtDisclaimer="disclaimer.html";
var gtRedirectIfDeclined="http://www.mitchellshire.vic.gov.au/";