var glayerLocSel;
var gComboDataArray=[];
var gfromWFS="N";
var gtyp;
var glab;
var gFormat;
var gLayoutsArr = new Array();
var gCurrentLoggedRole='NONE';

// TMS Nearmaps
//var mapBounds = new OpenLayers.Bounds( 140.661827141, -37.2265422532, 144.266533381, -33.6703768551).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
var mapBounds = new OpenLayers.Bounds(-20037508.3427892,-20037508.3427892,20037508.3427892,20037508.3427892);
var mapMinZoom = 6;
var mapMaxZoom = 14;
var baseCacheURL = "http://www.nearmap.com/maps/v=57&nml=Vert";
			    
function overlay_getTileURL(bounds) {
	var res = app.mapPanel.layers.map.getResolution();
	var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
	var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
	var z = app.mapPanel.layers.map.getZoom();

	if (mapBounds.intersectsBounds( bounds ) && z >= mapMinZoom && z <= mapMaxZoom ) {
		//console.log( this.url + z + "/" + x + "/" + y + "." + this.type);
		return baseCacheURL + "&z="+ z + "&x=" + x + "&y=" + y ;
	} else {
		return "http://www.maptiler.org/img/none.png";
	}
}

// Timeout of AJAX requests in ms
Ext.Ajax.timeout = 2000;





// Style for WFS highlight
var rule_for_all = new OpenLayers.Rule({
	symbolizer: gtSymbolizer, elseFilter: true
});
rule_for_all.title=" ";
gtStyleMap.styles["default"].addRules([rule_for_all]);

// Helper functions
function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function trim(str)
{
	if (str) 
		{return str.replace(/^\s*/, "").replace(/\s*$/, "");}
	else 
		{return "";}
}

// Store behind the info drop-down list
var gCombostore = new Ext.data.ArrayStore({
    // store configs
    //autoDestroy: true,
    storeId: 'myStore',
    // reader configs
    idIndex: 0,  
    fields: [
       'id',
       'type',
       'label',
       'content',
       'index',
       'projCode',
       'layer'
    ],
    listeners: {
            load: function(ds,records,o) {
		var cb = Ext.getCmp('gtInfoCombobox');
		var rec = records[0];
		cb.setValue(rec.data.type);
		cb.fireEvent('select',cb,rec);
	        },
            scope: this
        }
});

// Remove the WFS highlight, clear and disable the select feature combo, empty the combostore and clean the details panel 
var clear_highlight = function(){ 
	// Removing the highlight by clearing the selected features in the WFS layer
	glayerLocSel.removeAllFeatures();
	
	// Fix the issue where the layer's startegy layer is nulled after printing
	if (!(glayerLocSel.strategies[0].layer)) {glayerLocSel.strategies[0].layer=glayerLocSel;}
	if (!(glayerLocSel.strategies[0].layer.map)) 	{glayerLocSel.strategies[0].layer.map=app.mapPanel.map;}
	if (!(glayerLocSel.protocol.format)) 		{glayerLocSel.protocol.format=gFormat;}
	
	glayerLocSel.redraw();
	// Clearing combo
	var cb = Ext.getCmp('gtInfoCombobox');
	cb.collapse();
	cb.clearValue();
	cb.disable();
	// Removing all values from the combo
	gCombostore.removeAll();
	// Clearing the details from the panel
	var e1=Ext.getCmp('gtAccordion').items.items[0].body.id;
	var e2=Ext.get(e1).dom;
	e2.innerHTML="";
}

Ext.namespace("gxp.plugins");

//// Overrride the legend addAction to try to remove VicmapClassic from the legend -- so far unsuccessful
///gxp.plugins.Legend.prototype.addOutput = function (config) {
///        return gxp.plugins.Legend.superclass.addOutput.call(this, Ext.apply({
///            xtype: 'gx_legendpanel',
///            ascending: false,
///            border: false,
///            layerStore: (function(arr){
///            			return arr;
///            		})(this.target.mapPanel.layers),
///            defaults: {
///                cls: 'gxp-legend-item'
///            }
///        }, config));
///    };

// Override of the GetFeatureInfo addActions handler
gxp.plugins.WMSGetFeatureInfo.prototype.addActions = function() {
		this.popupCache = {};
		var actions = gxp.plugins.WMSGetFeatureInfo.superclass.addActions.call(this, [{
			tooltip: this.infoActionTip,
			iconCls: "gxp-icon-getfeatureinfo",
			toggleGroup: this.toggleGroup,
			enableToggle: true,
			allowDepress: true,
			toggleHandler: function (button, pressed) {
				for (var i = 0, len = info.controls.length; i < len; i++) {
					if (pressed) {
						info.controls[i].activate();
					} else {
						info.controls[i].deactivate();
					}
				}
			}
		}]);
		var infoButton = this.actions[0];
		var info = {
			controls: []
		};
		var updateInfo = function () {
			// On layer add or select/deselect, we re-evaluate the number of queries that we will wait the result on
			// It's the number of layers that support WMS get feature info that are currently visible
			var queryableLayers = this.target.mapPanel.layers.queryBy(function (x) {
				var u = x.getLayer().url;
				if (u)
				{
					// Removing the by-default assumption that the local layers will have 8080, except for basemaps
					if (x.get("group") != "background")
					{
						x.getLayer().url=u.replace(/http:\/\/\d+.\d+.\d+.\d+:\d+/,gtServicesHost);
					}
				}
				return x.get("queryable") && x.get("layer").visibility && (x.get("group") != "background") ;
			});
			var layerMax=queryableLayers.length;

			// Set the transition effect to "resize" for all layers and the legend URL to accommodate Apache
			for(var l in app.mapPanel.map.layers)
			{
				app.mapPanel.map.layers[l].transitionEffect="resize";
				if (app.mapPanel.layers.data.items[l].data)
					{
					if (app.mapPanel.layers.data.items[l].data.styles)
					{
						if (app.mapPanel.layers.data.items[l].data.styles.length > 0)
						{
							var urlLegend=app.mapPanel.layers.data.items[l].data.styles[0].legend.href;
							app.mapPanel.layers.data.items[l].data.styles[0].legend.href = urlLegend.replace(/http:\/\/\d+.\d+.\d+.\d+:\d+/,gtServicesHost);
						}	
					}
				}
			}

			// Id property within the combostore must be unique, so we use a counter
			var id_ct=0;
			
			var map = this.target.mapPanel.map;
			var control;
			for (var i = 0, len = info.controls.length; i < len; i++) {
				control = info.controls[i];
				control.deactivate();
				control.destroy();
			}
			info.controls = [];
			var layerCounter = 0;
			queryableLayers.each(function (x) {
//				x.getLayer().url=x.getLayer().url.replace(/:8080/,"");
				var control = new OpenLayers.Control.WMSGetFeatureInfo({
					url: x.getLayer().url,
					queryVisible: true,
					radius: 64,
					infoFormat: 'text/html',
					// Differentiate a click from a drag - getFeatureInfo not triggered if drag is more than X pixels (X=6 hardcoded) 
					handler: OpenLayers.Handler.Click,
					handlerOptions: {"click":{"pixelTolerance":6}},
					layers: [x.getLayer()],
					eventListeners: {
						getfeatureinfo: function (evt) {
							layerCounter = layerCounter+1;

							var idx=0;
							var projCode="";
							// Index contains the position of the layer within the tree layer
							for(i=0;i<app.mapPanel.layers.data.items.length;i++)
							{
								if (app.mapPanel.layers.data.items[i]===x) 
								{
									idx=i;
									break;
								}
							}

							// Extract the core of the object, that is the JSON object
							var match = evt.text.match(/<body[^>]*>([\s\S]*)<\/body>/);
							if (match && !match[1].match(/^\s*$/)) {
								// Issue with simple quotes - with the template js_string, they appear as \', which is not parseable as JSON
								res=Ext.util.JSON.decode(match[1].replace('\\\'','\''));
						
								// We hydrate an object that powers the datastore for the right panel combo
								var row_array;
								for (var i=0;i<res.rows.length;i++)
								{
									// Id - need to be distinct for all objects in the drop down: if several layers activated, must be different across all layers (we can't use looping variable i)
									id_ct++;
									// Type - from the layer name in the layer selector
									var typ=x.data.title;
									// Layer name (without namespace), to enable additional accordion panels
									var lay=x.data.layer.params.LAYERS.split(":")[1];
									// Attempt to format it nicely (removing the parenthesis content)
									var simpleTitle=x.data.title.match(/(.*) ?\(.*\)/);
									if (simpleTitle)
									{typ=trim(simpleTitle[1]);}
									// Label - for now, nothing									
									var lab='';
									// All the attributes are contained in a serialised JSON object
									var cont=res.rows[i].row;
									// We select the first attribute that is not the_geom as the label
									for (l in cont)
									{
										if (l!="the_geom" && l!="projection"){var lab=cont[l];break;}
									}
									for (l in cont)
									{
										if (l=="projection"){var projCode=cont[l];break;}
									}
									// Building a row and pushing it to an array																		
									row_array = new Array(id_ct,typ,lab,cont,idx,projCode,lay); 
									gComboDataArray.push(row_array);
								}
							}
							
							// Only to be executed when all queriable layers have been traversed (depends number of layers actually ticked in the layer tree)
							if (layerCounter==layerMax)
							{
								// Remove any previous results						
								clear_highlight();
								
								if (gComboDataArray.length)
								{
									var cb = Ext.getCmp('gtInfoCombobox');
									if (cb.disabled) {cb.enable();}
									gComboDataArray.sort(function(a,b){return b[4]-a[4]});
									gfromWFS="N";
									gCombostore.loadData(gComboDataArray);
								}
								//else			
								//{cb.disable();}
								
								gComboDataArray=[];
								layerCounter=0;
							}
						},
						scope: this
					}
				});
				map.addControl(control);
				info.controls.push(control);
				// Activating the control by default
				//if (infoButton.pressed) {
					control.activate();
				//}
			}, this);
		};
		this.target.mapPanel.layers.on("update", updateInfo, this);
		this.target.mapPanel.layers.on("add", updateInfo, this);
		this.target.mapPanel.layers.on("remove", updateInfo, this);
		// Adding this to update the getFeatureInfo controls according to the layers ticked and unticked
		this.target.mapPanel.on("afterlayervisibilitychange",updateInfo,this);
		return actions;
	};

// Handler called when:
// - a record is selected in the search drop down list
// - a property number is passed in the URL and has returned a valid property record
var search_record_select_handler = function (combo,record){
	// Zooming to the relevant area (covering the selected record)
	var bd = new OpenLayers.Bounds(record.data.xmini,record.data.ymini,record.data.xmaxi,record.data.ymaxi).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
	var z = app.mapPanel.map.getZoomForExtent(bd);

	// Fix the issue where the WFS layer's strategy's layer and its protocol's format are nulled after invoking the printing functionality
	// Symptom is this.layer is null (strategy) or this.format is null (protocol)
	if (!(glayerLocSel.strategies[0].layer)) 	{glayerLocSel.strategies[0].layer=glayerLocSel;}
	if (!(glayerLocSel.strategies[0].layer.map)) 	{glayerLocSel.strategies[0].layer.map=app.mapPanel.map;}
	if (!(glayerLocSel.protocol.format)) 		{glayerLocSel.protocol.format=gFormat;}
	
	if (z<gtZoomMax)
	{	
		app.mapPanel.map.zoomToExtent(bd);
	}
	else
	{// If zooming too close, taking step back to level gtZoomMax , centered on the center of the bounding box for this record
		app.mapPanel.map.moveTo(new OpenLayers.LonLat((bd.left+bd.right)/2,(bd.top+bd.bottom)/2), gtZoomMax);
	}
		
	// Updating the WFS protocol to fetch this record
	// Potential trap: the featureNS has to match the GeoServer workspace's namespace - at the moment, this will only work if we query DSE workspace objects where DSE's namespace is dse.vic.gov.au
	// TBC that this is a problem
	glayerLocSel.protocol = new OpenLayers.Protocol.WFS({
		version:       "1.1.0",
		url:           gtWFSEndPoint,
		featureType:   record.data.gsln,
		srsName:       gtWFSsrsName,
		featureNS:     gtFeatureNS,
		geometryName:  gtWFSgeometryName,
		schema:        gtWFSEndPoint+"?service=WFS&version=1.1.0&request=DescribeFeatureType&TypeName="+record.data.gsns+":"+record.data.gsln
	});
	
	// Filtering the WFS layer on a column name and value - if the value contains a \, we escape it by doubling it
	glayerLocSel.filter = new OpenLayers.Filter.Comparison({type: OpenLayers.Filter.Comparison.EQUAL_TO,property: record.data.idcol ,value: record.data.idval.replace('\\','\\\\') });
	gfromWFS="Y";
	gtyp=record.data.ld;
	glab=record.data.label;
							
	glayerLocSel.events.on({
		featuresadded: function(event) {
			if (gfromWFS=="Y")
			{
				var typ=gtyp;
				var lab=glab;
										
				var row_array = [];
				var cont;
				gComboDataArray=[];
										
				for (var k=0;k<this.features.length;k++)
				{
					// We capture the attributes brought back by the WFS call
					cont=this.features[k].data;
					// Capturing the feature as well (it contains the geometry)
					cont["the_geom_WFS"]=this.features[k];										

					// Building a record and inserting it into an array											
					row_array = new Array(k,typ,lab,cont); 
					gComboDataArray.push(row_array);
				}
				
				// Clearing existing value from the drop-down list
				var cb = Ext.getCmp('gtInfoCombobox');
				cb.clearValue();
				
				// If there is a record (and there should be at least one - by construction of the search table)
				if (gComboDataArray.length)
				{							
					if (cb.disabled) {cb.enable();}
					gCombostore.removeAll();
					gCombostore.loadData(gComboDataArray);
					gComboDataArray=[];
				}									
			}
		}
	});

	// Refreshing the WFS layer so that the highlight appears and triggers the featuresadded event handler above
	glayerLocSel.refresh({force:true});
				
};

var GroundtruthExplorer = Ext.extend(GeoExplorer.Composer, {
  
	constructor: function(config) { 
		GroundtruthExplorer.superclass.constructor.apply(this, arguments);
	
		// Global variable containing the property number to initialise on
		var initPropertyNum=gtPropNum;
	 
		// Assigning the parameter, dummy WFS layer to a global variable		
		glayerLocSel = gtLayerLocSel;
		// Keeping the format in another variable to cater for a bug after print preview
		gFormat = glayerLocSel.protocol.format;
	 
	 	// When DOM is ready
		this.on("ready", function() {
		
			for(var l in app.mapPanel.map.layers)
			{
				// Additional WMS parameters - allows printing of the imagery at Buloke (username and password to be reinstated when deploying onsite)			
				if (app.mapPanel.map.layers[l].name=="Aerial Photo (CIP 2009)")
				{
					app.mapPanel.map.layers[l].params["USERNAME"]="";
					app.mapPanel.map.layers[l].params["PASSWORD"]="";
				}
			}
		
			// Adding the WFS layer to the map
////changed 17/06/2011	app.mapPanel.layers.map.addLayers([glayerLocSel]);

//			var tmsoverlay = new OpenLayers.Layer.TMS( "Near Maps", "",
//			{   // url: '', serviceVersion: '.', layername: '.',
//				type: 'png', getURL: overlay_getTileURL, alpha: true, isBaseLayer: false, transparent: true, selected: false, transitionEffect: 'resize', group:"background"
//			});	
//			if (OpenLayers.Util.alphaHack() == false) 
//			{ 
//				tmsoverlay.setOpacity(1.0); 
//			} 
	
//			app.mapPanel.layers.map.addLayers([glayerLocSel,tmsoverlay]);

///			Proj4js.defs["EPSG:3111"] = "+proj=lcc +lat_1=-36 +lat_2=-38 +lat_0=-37 +lon_0=145 +x_0=2500000 +y_0=2500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
///			OpenLayers.Vicmap.Util = OpenLayers.Vicmap.Util || {};
///			OpenLayers.Vicmap.Util.PROJECTION = new OpenLayers.Projection("EPSG:3111");

///			OpenLayers.Layer.WMS.prototype.getFullRequestString = function(newParams, altUrl) { 
///				this.params.SRS = "EPSG:3111";
///				return OpenLayers.Layer.Grid.prototype.getFullRequestString.apply( this, arguments); 
///			};

///			var vicmapwms = new OpenLayers.Layer.WMS("VicMap", "http://116.240.195.134/vicmapapi/map/wms", {
///				layers: "CARTOGRAPHICAL",
///				format: "image/png",
///				firstTile: true,
///			}, {
///				projection: "EPSG:3111",
///				tileSize: new OpenLayers.Size(512, 512),
///				tileOrigin: new OpenLayers.LonLat(-34932800, 57119200),
///				isBaseLayer: true,
///				buffer: 0,
///				maxExtent: new OpenLayers.Bounds(1786000.0, 1997264.499195665, 3953471.00160867, 3081000.0),
///				attribution: "Vicmap API &copy; 2011 State Government of Victoria"
///			});
			
///			app.mapPanel.map.addLayers([glayerLocSel,vicmapwms]);
			app.mapPanel.map.addLayers([glayerLocSel]);
	
			// If a property number has been passed
		        if (initPropertyNum)
		        {
				// Handler for result of retrieving the property details by its number
				var prop_by_prop_num_handler=function(request){
					// Considering only the first row returned
					var res=[];
					res_data = Ext.util.JSON.decode(request.responseText).rows[0].row;
				
					if (res_data)
					{
						// Extracting the data and proceeding to populating selected feature combo
						res["data"] = res_data;
						search_record_select_handler(null, res);
					}
					else
					{
						alert("No property found for number: "+initPropertyNum+".");
					}
				};
				
				// AJAX request for info on the property passed in the URL
				var request = OpenLayers.Request.GET({
				    url: gtSearchPropertyEndPoint,
				    params: {query: initPropertyNum,config:gtDatabaseConfig},
				    callback: prop_by_prop_num_handler
				});
		        }
		        else
		        {
				// Refresh the WFS layer now (no object highlighted)
		        	//glayerLocSel.refresh({force:true});
		        	// Trialing to not have that done when the application loads -- it would happen on a first pan or search result
		        	// We don't really need to have it done at the same time everything else is happening		        	
		        }
			// Bringing the disclaimer in - if selected by council
			if (gtInitialDisclaimerFlag)
			{
				var winDisclaim = new Ext.Window({
					modal: true,
					closable: false, 
					layout: "fit",
					width: 300,
					height: 300,
//					closeAction:'hide',
					items:[
						{
							html: "<iframe style='border: none; height: 100%; width: 100%' src='"+gtDisclaimer+"' frameborder='0' border='0'><a target='_blank' href='"+gtDisclaimer+"'>" + "</a> </iframe>",
							autoScroll: true
						}
					],
					buttons: [{
							text: 'Decline',
							handler: function(){
								window.location.href=gtRedirectIfDeclined;
							}
						},{
							text:'Accept',
							handler: function(){
								winDisclaim.hide();
							}
						}]
				});
				winDisclaim.show();
			}
			
			// Currently logged role
			if (app.authorizedRoles[0])
			{
				gCurrentLoggedRole=app.authorizedRoles[0];
			}
			
			// Extraction of the information panel layouts for the current authorized role
//			Ext.Ajax.request({
//			   url: gtGetLayoutEndPoint,
//			   success: function(a){
//					// A JSON is returned, we just want to insert the content in the corresponding accordion
//					var item_array = new Array();
//					var res_data = Ext.util.JSON.decode(a.responseText);
//
//					// Setting up a global variable array to define the info panel layouts
//					for (key=0;key<res_data.rows.length;key++)
//					{
//						gLayoutsArr[res_data.rows[key].row.key_arr]=res_data.rows[key].row.val_arr;
//					}
//				},
//			   failure: function(){
//					// We should process gracefully when this service is not available (i.e. outside the firewall)
//				},
//			   params: {
//				// Logged in role
//				role: gCurrentLoggedRole,
//				// Passing the database to query
//				config:gtDatabaseConfig
//			   }
//			});			

			// We should degrade nicely if the service is not found
			var ds = new Ext.data.Store({
				autoLoad:true,
				proxy: new Ext.data.ScriptTagProxy({
					url: gtGetLayoutEndPoint
				}),
				reader: new Ext.data.JsonReader({	
					root: 'rows',
					totalProperty: 'total_rows',
					id: 'key_arr'	
					}, 
					[	{name: 'key_arr', mapping: 'row.key_arr'}
			        ]),
				baseParams: {
					role: gCurrentLoggedRole,
					config:gtDatabaseConfig
				},
				listeners:
				{
					load: function(store, recs)
					{
						// Setting up a global variable array to define the info panel layouts
						for (key=0;key<recs.length;key++)
						{
							gLayoutsArr[recs[key].json.row.key_arr]=recs[key].json.row.val_arr;
						}
					}
				}
			});
		        
		});

	},

	initPortal: function() {  
		// West panel
		var westPanel = new Ext.Panel({
			border: false,
			layout: "anchor",
			region: "west",
			width: 250,
			split: true,
			collapsible: true,
			collapseMode: "mini",
			autoScroll:true,
			header: false,
			items: [{
				region: 'center',
				tbar: [

				],
				border: false,
				id: 'tree',
				title: this.layersText
			}, {
				region: 'south',
				xtype: "container",
				border: false,
				id: 'legend'
			}]
		});

		// HS mod start
		// Defines the north part of the east panel
		var northPart = new Ext.Panel({
			region: "north",
		    	border: false,
		    	layout: 'column',
		        height: 23,
			bodyStyle: " background-color: transparent ",
			items: [
				new Ext.Panel({
					border: false,
					layout: 'fit',
					height: 22,
					columnWidth: 1,
					items: [
						new Ext.form.ComboBox({
							id: 'gtInfoCombobox',
							store: gCombostore,
							displayField:'type',
							disabled: true,
							mode: 'local',
							typeAhead: true,
							//listAlign: ['tr-br?', [22,0] ],
							//listWidth: 200,
							//hideMode:'offsets',
							forceSelection: true,
							//selectOnFocus: true,
							triggerAction: 'all',
							emptyText: gtEmptyTextSelectFeature,
							tpl: '<tpl for="."><div class="info-item" style="height: 16px;">{type}: {label}</div></tpl>',
							itemSelector: 'div.info-item',
							listeners: {'select': function (combo,record){
										var e0=Ext.getCmp('gtAccordion');

										//var e1=e0.items.items[0].body.id;
										//var e2=Ext.get(e1).dom;
										//e2.innerHTML="";
										
										e0.removeAll();
										// Accordion part for normal attributes
										e0.add({id:'attributeAcc',title: gtDetailsTitle,html: '<p></p>',autoScroll: true});

										// Layout configuration the global variable array loaded at application start										
										var configArray = gLayoutsArr[record.data.layer];
										if (configArray)
										{
											e0.add(configArray);										
										}
										
										// Refreshing the DOM with the newly added parts
										e0.doLayout();										
										e0.items.itemAt(0).expand();
	
										// Setting a reference on this part of the DOM for injection of the attributes										
										var e1=e0.items.items[0].body.id;
										var e2=Ext.get(e1).dom;
										
										// Sending live queries based on the layout
										if (configArray)
										{
											// This could be further refined by sending only the query corresponding to the open accordion part
											for (var i=0; i< configArray.length; i++)
											{
												var g=0;
//												Ext.Ajax.request({
//												   url: gtGetLiveDataEndPoint,
//												   success: function(a){
//												   		// A JSON is returned, we just want to insert the content in the corresponding accordion
//												   		var item_array=new Array();
//												   		var res_data = Ext.util.JSON.decode(a.responseText).rows[0].row;
//												   		
//												   		if (res_data)
//												   		{
//															for (j in res_data)
//															{
//																if (j!="target")
//																{
//																	// Formatting the cells for attribute display in a tidy table
//																	item_array.push({html:"<div style='font-size:8pt;'><font color='#666666'>"+j+"</font></div>"});
//																	item_array.push({html:"<div style='font-size:10pt;'>"+res_data[j]+"</div>"});	
//																}
//															}
//															// Identification of the div to render the attributes to
//															var targ = Ext.get(Ext.getCmp(res_data["target"]).body.id).dom;
//															// And rendering that to the relevant part of the screen
//															var win = new Ext.Panel({
//																id:'tblayout-win'+g
//																//,width:227
//																,layout:'table'
//																,layoutConfig:{columns:2}
//																,border:false
//																//,closable:false
//																,defaults:{height:20}
//																,renderTo: targ
//																,items: item_array
//															});
//															win.doLayout();
//															g++;
//														}
//												   	},
//												   failure: function(){
//												   	},
//												   params: {
//												   	// Logged in role
//												   	role: gCurrentLoggedRole,
//												   	// Passing the value of the property defined as containing the common ID
//												   	id: record.data.content[configArray[i].idName],
//												   	// Passing the tab name
//												   	infoGroup: configArray[i].id,
//												   	// Passing the database to query
//												   	config:gtDatabaseConfig
//												   }
//												});

 
												// Live query using the script tag
												var ds = new Ext.data.Store({
													autoLoad:true,
													proxy: new Ext.data.ScriptTagProxy({
														url: gtGetLiveDataEndPoint
													}),
													reader: new Ext.data.JsonReader({	
														root: 'rows',
														totalProperty: 'total_rows',
														id: 'id'	
														}, 
														[	{name: 'id', mapping: 'row.id'}
												        ]),
													baseParams: {
													   	// Logged in role
													   	role: gCurrentLoggedRole,
													   	// Passing the value of the property defined as containing the common ID
													   	id: record.data.content[configArray[i].idName],
													   	// Passing the tab name
													   	infoGroup: configArray[i].id,
													   	// Passing the database to query
													   	config:gtDatabaseConfig
													},
													listeners:
													{
														load: function(store, recs)
														{
													   		// A JSONP is returned, we just want to insert the content in the corresponding accordion
													   		var res_data = recs[0].json.row;
															var item_array=new Array();
												   		
													   		if (res_data)
													   		{
																for (j in res_data)
																{
																	if (j!="target")
																	{
																		// Formatting the cells for attribute display in a tidy table
																		item_array.push({html:"<div style='font-size:8pt;'><font color='#666666'>"+j+"</font></div>"});
																		item_array.push({html:"<div style='font-size:10pt;'>"+res_data[j]+"</div>"});	
																	}
																}
																// Identification of the div to render the attributes to
																var targ = Ext.get(Ext.getCmp(res_data["target"]).body.id).dom;
																// And rendering that to the relevant part of the screen
																var win = new Ext.Panel({
																	id:'tblayout-win'+g
																	//,width:227
																	,layout:'table'
																	,layoutConfig:{columns:2}
																	,border:false
																	//,closable:false
																	,defaults:{height:20}
																	,renderTo: targ
																	,items: item_array
																});
																win.doLayout();
																g++;
															}
														}
													}
												});



											}
										}
										
										// Population of the direct attributes accordion panel
										var lab;
										var val;
										var item_array=new Array();
										var has_gsv = false;
										
										for(var k in record.data.content)
										{
											if (k=="the_geom")
											{
												lab="spatial type";
												var featureToRead = record.data.content[k];
												val=featureToRead.replace(/\(.*\)\s*/,"");
												
												// record.data.projCode contains the projection system of the highlighing geometry
												// Unfortunately, it seems that the OpenLayers transform only caters for 4326
												// Other attempts to transform from 4283 (for instance) have resulted in the data not being projected to Google's SRS
												// Attempts to invoke Proj4js library have rendered the zoom to tool ineffective (the bounding box data would not be transformed anymore)
												var wktObj = new OpenLayers.Format.WKT({
													externalProjection: new OpenLayers.Projection("EPSG:4326"), //projection your data is in
													internalProjection: new OpenLayers.Projection("EPSG:900913") //projection you map uses to display stuff
												});
												var wktfeatures = wktObj.read(featureToRead);
												
												// Should be able to select several if the control key is pressed
												glayerLocSel.removeAllFeatures();
												glayerLocSel.addFeatures(wktfeatures);
											
											}
											else if (k=="the_geom_WFS")
											{
												var wktfeatures=record.data.content[k];
												gfromWFS="N";
												lab="spatial type";
												val=wktfeatures.geometry.CLASS_NAME.replace(/OpenLayers\.Geometry\./,"").toUpperCase();
												glayerLocSel.removeAllFeatures();
												glayerLocSel.addFeatures(wktfeatures);
											}
											else
											{
												lab=k;
												val=record.data.content[k];
												if (val.search(/^http/)>-1)
												{
													if (val.search(/\.jpg/)>-1)
													{
														val="<a href='"+val+"' target='_blank'><img src='"+val+"' height='20' width='20' /></a>";
													}
													else
													{
														val="<a href='"+val+"' target='_blank'>link</a>";
													}
												}
												else
												{
													val=val.replace(/ 12:00 AM/g,"");
												}
											}
											
											if (k.search(/^gsv/)>-1)
											{
												// Not showing the cells
												// technical properties for Google Street View
												has_gsv = true;
											}
											else
											{
												// Formatting the cells for attribute display in a tidy table
												item_array.push({html:"<div style='font-size:8pt;'><font color='#666666'>"+trim(lab)+"</font></div>"});
												item_array.push({html:"<div style='font-size:10pt;'>"+trim(val)+"</div>"});
											}
										}
										
										// Adding a Google Street View link for selected datasets
										if (has_gsv)
										{
											var gsv_lat, gsv_lon, gsv_head=0;

											for(var k in record.data.content)
											{
												if (k=="gsv_lat")
												{
													gsv_lat=record.data.content[k];
												}
												if (k=="gsv_lon")
												{
													gsv_lon=record.data.content[k];
												}
												if (k=="gsv_head")
												{
													gsv_head=record.data.content[k];
												}												
											}

											if (gsv_lat && gsv_lon)
											{
												// Adjusted to the size of the column
												var size_thumb = 245;
												var gsvthumb = "http://maps.googleapis.com/maps/api/streetview?location="+gsv_lat+","+gsv_lon+"&fov=90&heading="+gsv_head+"&pitch=-10&sensor=false&size="+size_thumb+"x"+size_thumb;
												var gsvlink = "http://maps.google.com.au/maps?layer=c&cbll="+gsv_lat+","+gsv_lon+"&cbp=12,"+gsv_head+",,0,0";
											
												item_array.push({html:"<div style='font-size:10pt;'><a href='"+gsvlink+"' target='_blank'><img src='"+gsvthumb+"'/></a></div>",height:size_thumb,colspan:2});											
											}
										}										
																			
										var win = new Ext.Panel({
											id:'tblayout-win'
											//,width:227
											,layout:'table'
											,layoutConfig:{columns:2}
											,border:false
											//,closable:false
											,defaults:{height:20}
											,renderTo: e2
											,items: item_array
										});
																				
									},
								    scope:this}
						    
							})
						]}),
						
				new Ext.Panel({
					border: false,
					layout: 'fit',
					width: 35,
					height: 22,
					items: [
							new Ext.Button({
								text: gtClearButton,
								handler: clear_highlight
							})
					]
				})
			]
		});


		var accordion = new Ext.Panel({
			//title: 'Accordion Layout',
			id:'gtAccordion',
			layout:'accordion',
			region: "center",
			border: false,
			collapsible: false,
			
//			multi: true,
	     
			defaults: {
				// applied to each contained panel
				bodyStyle: " background-color: transparent ",
				collapsed: true
			},
			layoutConfig: {
				// layout-specific configs go here
				animate: false,
				titleCollapse: true,
				activeOnTop: false,
				fill:true,
				hideCollapseTool: true,
				multi: true
			},
			items: [{
				title: gtDetailsTitle,
				html: '<p></p>',
				autoScroll: true
			}]
		});
        
		var eastPanel = new Ext.Panel({
			border: false,
			layout: "border",
			region: "east",
			title: gtInfoTitle,
			collapsible: true,
			collapseMode: "mini",
			width: 250,
			split: true,
			items: [
				northPart,
				accordion
			]
		});
		// HS mod end
		
		
		this.toolbar = new Ext.Toolbar({
			disabled: true,
			id: 'paneltbar',
			items: this.createTools()
		});
		this.on("ready", function () {
			var disabled = this.toolbar.items.filterBy(function (item) {
				return item.initialConfig && item.initialConfig.disabled;
			});
			this.toolbar.enable();
			disabled.each(function (item) {
				item.disable();
			});
		});
		var googleEarthPanel = new gxp.GoogleEarthPanel({
			mapPanel: this.mapPanel,
			listeners: {
				beforeadd: function (record) {
					return record.get("group") !== "background";
				}
			}
		});
		var preGoogleDisabled = [

		];
		googleEarthPanel.on("show", function () {
			preGoogleDisabled.length = 0;
			this.toolbar.items.each(function (item) {
				if (item.disabled) {
					preGoogleDisabled.push(item);
				}
			}); this.toolbar.disable();
			for (var key in this.tools) {
				var tool = this.tools[
				key];
				if (tool.outputTarget === "map") {
					tool.removeOutput();
				}
			}
			var layersContainer = Ext.getCmp("tree");
			var layersToolbar = layersContainer && layersContainer.getTopToolbar();
			if (layersToolbar) {
				layersToolbar.items.each(function (item) {
					if (item.disabled) {
						preGoogleDisabled.push(item);
					}
				});
				layersToolbar.disable();
			}
		}, this);
		googleEarthPanel.on("hide", function () {
			this.toolbar.enable();
			var layersContainer = Ext.getCmp("tree");
			var layersToolbar = layersContainer && layersContainer.getTopToolbar();
			if (layersToolbar) {
				layersToolbar.enable();
			}
			for (var i = 0, ii = preGoogleDisabled.length; i < ii; ++i) {
				preGoogleDisabled[
				i].disable();
			}
		}, this);
		this.mapPanelContainer = new Ext.Panel({
			layout: "card",
			region: "center",
			defaults: {
				border: false
			},
			items: [
			this.mapPanel, googleEarthPanel],
			activeItem: 0
		});
		
        // HS MOD START
	// Datastore definition for the web service search results 
 	var ds = new Ext.data.JsonStore({
		autoLoad: false, //autoload the data
		root: 'rows',
		baseParams: { config: gtDatabaseConfig},
		fields: [{name: "label"	, mapping:"row.label"},
			{name: "xmini"	, mapping:"row.xmini"},
			{name: "ymini"	, mapping:"row.ymini"},
 			{name: "xmaxi"	, mapping:"row.xmaxi"},
			{name: "ymaxi"	, mapping:"row.ymaxi"},
			{name: "gsns"	, mapping:"row.gsns"},
 			{name: "gsln"	, mapping:"row.gsln"},
 			{name: "idcol"	, mapping:"row.idcol"},
 			{name: "idval"	, mapping:"row.idval"},
 			{name: "ld"	, mapping:"row.ld"}
 		],
		proxy: new Ext.data.HttpProxy({
			url: gtSearchComboEndPoint
		})
	});
	
	
        this.portalItems = [
        {
            	region: "north",
            	layout: "column",
            	height: 100,
            	items:
                    	[
                    	new Ext.BoxComponent({
                    	region: "west",
                    	width: gtPoziLogoWidth,
	                height: 100,
	                autoEl: {
			tag: 'div',
			html: '<img style="height: 100px" src="'+gtPoziLogoSrc+'"/>'
	                }
        		})
        		,
        		{
				columnWidth: 0.5,
				html:"",
	                	height: 100,
//				bodyStyle: " background-color: white ; ",
				border:false
        		}
			,
			new Ext.Panel({
			region: "center",
			//anchor:50%,
                    	//columnWidth:1,
                    	width: 500,
			padding: "34px",
			border: false,
			bodyStyle: " background-color: white ; ",
		 	items: [
			new Ext.form.ComboBox({
				id: 'gtSearchCombobox',
				queryParam: 'query',
				store: ds,
				displayField:'label',
				selectOnFocus: true,
				minChars: 3,
				typeAhead: false,
				loadingText: gtLoadingText,
				width: 450,
				style: "border: 2px solid #BBBBBB; width: 490px; height: 24px; font-size: 11pt;",
				pageSize:0,
				emptyText:gtEmptyTextSearch,
				hideTrigger:true,
				tpl: '<tpl for="."><div class="search-item" style="height: 28px;"><font color="#666666">{ld}</font> : {[values.label.replace(new RegExp( "(" +  Ext.get(\'gtSearchCombobox\').getValue()  + ")" , \'gi\' ), "<b>$1</b>" )]} <br></div></tpl>',
				itemSelector: 'div.search-item',
				listeners: {'select': search_record_select_handler,
					    scope:this}
				})
			]}),
			{
				columnWidth: 0.5,
				html:"",
	                	height: 100,
//				bodyStyle: " background-color: white ; ",
				border:false
			}
			,
				
			new Ext.Panel({
				region: "east",
				border: false,
				width: gtLogoClientWidth,
				bodyStyle: " background-color: transparent ",
				autoEl: {
					tag: 'div',
					html: '<img style="height: 100px" src="'+gtLogoClientSrc+'" align="right"/>'
	                	}
				
			})
			]
        },
        {
       	// HS MOD END
            region: "center",
            layout: "border",
            tbar: this.toolbar,
            items: [
                this.mapPanelContainer,
                westPanel,
                eastPanel
            ]}
        ];
      
 	GeoExplorer.superclass.initPortal.apply(this, arguments);
    },
    createTools: function() {
    	// data store for the quick zoom
	Ext.namespace('Ext.selectdata');
	Ext.selectdata.zooms = gtQuickZoomDatastore;
  
	var zoomstore = new Ext.data.ArrayStore({
		fields: [{ name : 'xmin', type: 'float'},
			{ name : 'ymin', type: 'float'},
			{ name : 'xmax', type: 'float'},
			{ name : 'ymax', type: 'float'},
			{ name : 'label', type: 'string'}],
		data : Ext.selectdata.zooms
	});
 
	// additional tools:
	var addTool1 = "->";
	var addTool2 = new Ext.form.ComboBox({
      	    	tpl: '<tpl for="."><div ext:qtip="{label}" class="x-combo-list-item">{label}</div></tpl>',
      	    	store: zoomstore,
      	    	displayField:'label',
      	    	typeAhead: true,
      	    	mode: 'local',
      	    	forceSelection: true,
      	    	triggerAction: 'all',
      	    	width:125,
      	    	emptyText:gtEmptyTextQuickZoom,
      	    	selectOnFocus:true,
      	    	listeners: {'select': function (combo,record){
      	    				var projsrc = new OpenLayers.Projection("EPSG:4326");
      	    				var projdest = new OpenLayers.Projection("EPSG:900913");
      	    				var bd = new OpenLayers.Bounds(record.data.xmin,record.data.ymin,record.data.xmax,record.data.ymax);
      	    				var bd2 = bd.transform(projsrc, projdest);
      	    				this.mapPanel.map.zoomToExtent(bd2);},
      			    scope:this}
      		}	     
	     );
	// Adding these tools to the base tools 
	///var mybaseTools = GroundtruthExplorer.superclass.createTools.apply(this, arguments);
	var mybaseTools = gtCreateTools.apply(this, arguments);
	// Or just use an empty list to just our tools
	//var mybaseTools = [];
	mybaseTools.push(addTool1,addTool2);
	return mybaseTools;
    },
    /** private: method[save]
     *
     * Saves the map config and displays the URL in a window.
     */ 
    save: function(callback, scope) {
    
    	/** delete the search result layer if it exists **/
    	if (app.mapPanel.layers.map.getLayerIndex(glayerLocSel)>-1)
        {app.mapPanel.layers.map.removeLayer(glayerLocSel);}
        
    	/** perform the regular save  **/
        var configStr = Ext.util.JSON.encode(this.getState());
        var method, url;
        if (this.id) {
            method = "PUT";
            url = "geoexplorer/maps/" + this.id;
        } else {
            method = "POST";
            url = "geoexplorer/maps"
        }
        OpenLayers.Request.issue({
            method: method,
            url: url,
            data: configStr,
            callback: function(request) {
                this.handleSave(request);
                if (callback) {
                    callback.call(scope || this);
                }
            },
            scope: this
        });
        
        /** Reinstate the search result layer so that subsequent search still work **/
        if (app.mapPanel.layers.map.getLayerIndex(glayerLocSel)==-1)
        {app.mapPanel.layers.map.addLayers([glayerLocSel]);}
    }
  
});
