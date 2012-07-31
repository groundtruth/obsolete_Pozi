var glayerLocSel;
var gComboDataArray=[];
var gfromWFS="N";
var gtyp;
var glab;
var gFormat;
var gLayoutsArr = new Array();
var gCurrentLoggedRole='NONE';
var gCurrentExpandedTabIdx=[];

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
		if (records.length>1)
		{
			// Multiple records, color of the combo background is different
			cb.addClass("x-form-multi");
			
		}
		else
		{
			// Restoring the color to a normal white
			cb.removeClass("x-form-multi");
		}
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
	cb.removeClass("x-form-multi");
	// Removing all values from the combo
	gCombostore.removeAll();
	// Clearing the details from the panel
	var e1=Ext.getCmp('gtAccordion').items.items[0].body.id;
	var e2=Ext.get(e1).dom;
	e2.innerHTML="";
};

Ext.namespace("gxp.plugins");

// Overrride for a better control of zoom levels on individual layers
gxp.plugins.WMSCSource.prototype.createLayerRecord = function (config) {
        var record = gxp.plugins.WMSCSource.superclass.createLayerRecord.apply(this, arguments);
        var caps = this.store.reader.raw.capability;
        var tileSets = (caps && caps.vendorSpecific && caps.vendorSpecific) ? caps.vendorSpecific.tileSets : null;
        if ((tileSets !== null) && (record !== undefined)) {
            var layer = record.get("layer");
            var mapProjection = this.getMapProjection();
            for (var i = 0, len = tileSets.length; i < len; i++) {
                var tileSet = tileSets[i];
                if (tileSet.layers === layer.params.LAYERS) {
                    var tileProjection;
                    for (var srs in tileSet.srs) {
                        tileProjection = new OpenLayers.Projection(srs);
                        break;
                    }
                    if (mapProjection.equals(tileProjection)) {
                        var bbox = tileSet.bbox[srs].bbox;
                        // We narrow the number of zooms available
                        tileSet.resolutions = tileSet.resolutions.slice(0,gtMaxZoomLevel);
                        layer.addOptions({
                            resolutions: tileSet.resolutions,
                            tileSize: new OpenLayers.Size(tileSet.width, tileSet.height),
                            tileOrigin: new OpenLayers.LonLat(bbox[0], bbox[1])
                        });
                        layer.params.TILED = (config.cached !== false) && true;
                        break;
                    }
                }
            }
        }
        return record;
    };


// Override for control of the additional parameters per source
gxp.plugins.WMSSource.prototype.createLayerRecord = function (config) {
	var record;
	var index = this.store.findExact("name", config.name);
	if (index > -1) {
		var original = this.store.getAt(index);
		var layer = original.getLayer();
		var projection = this.getMapProjection();
		var layerProjection = this.getProjection(original);
		var projCode = projection.getCode();
		var nativeExtent = original.get("bbox")[projCode];
		var swapAxis = layer.params.VERSION >= "1.3" && !! layer.yx[projCode];
		var maxExtent = (nativeExtent && OpenLayers.Bounds.fromArray(nativeExtent.bbox, swapAxis)) || OpenLayers.Bounds.fromArray(original.get("llbbox")).transform(new OpenLayers.Projection("EPSG:4326"), projection);
		if (!(1 / maxExtent.getHeight() > 0) || !(1 / maxExtent.getWidth() > 0)) {
			maxExtent = undefined;
		}
		// Apply store-wide config if none present in the layer config - format, group and tiling
		if (config && gtMapDataSources[config.source])
		{
			if (!('format' in config))
			{
				if ('format' in gtMapDataSources[config.source])
				{
					config.format=gtMapDataSources[config.source].format;
				}
			}
			if (!('group' in config))
			{
				if ('group' in gtMapDataSources[config.source])
				{
					config.group=gtMapDataSources[config.source].group;
				}
			}
			if (!('tiled' in config))
			{
				if ('tiled' in gtMapDataSources[config.source])
				{
					config.tiled=gtMapDataSources[config.source].tiled;
				}
			}
			if (!('transition' in config))
			{
				if ('transition' in gtMapDataSources[config.source])
				{
					config.transition=gtMapDataSources[config.source].transition;
				}
			}
		}

		var params = Ext.applyIf({
			STYLES: config.styles,
			FORMAT: config.format,
			TRANSPARENT: config.transparent
		}, layer.params);
		// layer = new OpenLayers.Layer.WMS(config.title || layer.name, layer.url, params, {
		layer = new OpenLayers.Layer.WMS(config.title || layer.name, this.url, params, {
			attribution: layer.attribution,
			maxExtent: maxExtent,
			restrictedExtent: maxExtent,
			singleTile: ("tiled" in config) ? !config.tiled : false,
			transitionEffect: ("transition" in config) ? config.transition : '',
			ratio: config.ratio || 1,
			visibility: ("visibility" in config) ? config.visibility : true,
			opacity: ("opacity" in config) ? config.opacity : 1,
			buffer: ("buffer" in config) ? config.buffer : 1,
			projection: layerProjection
		});
		var data = Ext.applyIf({
			title: layer.name,
			group: config.group,
			source: config.source,
			properties: "gxp_wmslayerpanel",
			fixed: config.fixed,
			selected: "selected" in config ? config.selected : false,
			layer: layer
		}, original.data);

		// Overwriting the queryable attribute if present in config
		if ('queryable' in config)
		{
			data.queryable = config.queryable;
		}

		var fields = [{
			name: "source",
			type: "string"
		}, {
			name: "group",
			type: "string"
		}, {
			name: "properties",
			type: "string"
		}, {
			name: "fixed",
			type: "boolean"
		}, {
			name: "selected",
			type: "boolean"
		}];
		original.fields.each(function (field) {
			fields.push(field);
		});
		var Record = GeoExt.data.LayerRecord.create(fields);
		record = new Record(data, layer.id);
	}
	return record;
};


// Override of legend layer selection to exclude known layer groups
gxp.plugins.Legend.prototype.addOutput = function (config) {
        return gxp.plugins.Legend.superclass.addOutput.call(this, Ext.apply({
            xtype: 'gx_legendpanel',
            ascending: false,
            border: false,
            layerStore: this.target.mapPanel.layers,
            filter: function(record)
            {
            	if (record.data.name)
            	{
            		if (record.data.name.startsWith("VicmapClassic") || record.data.name=="LabelClassic")
            		{return false;}
	            	else
	            	{
				if (record.data.group)
				{
					if (record.data.group=="background")
					{return false;}
					else
					{return true;}
				}
				else
				{return true;}
	            	}
            	}
            	else
            	{return true;}
            },
            defaults: {
                cls: 'gxp-legend-item'
            }
        }, config));
    };


// Overrride to fix the bug on the WMS layer panel when the store is multi-source (URLs)
gxp.WMSLayerPanel.prototype.initComponent = function () {
	this.addEvents("change");
	this.items = [this.createAboutPanel(), this.createDisplayPanel()];
	if (this.layerRecord.get("layer").params.TILED != null) {
		this.items.push(this.createCachePanel());
	}
	if (this.layerRecord.get("styles")) {
		var first_url;
		if (typeof this.layerRecord.get("layer").url == "object")
		{
			first_url = this.layerRecord.get("layer").url[0];
		}
		else
		{
			first_url = this.layerRecord.get("layer").url;
		}
		var url = first_url.split("?").shift().replace(/\/geoserver\/.*\/(wms|ows)\/?$/, "/geoserver/rest");
		if (this.sameOriginStyling) {
			this.editableStyles = url.charAt(0) === "/";
		} else {
			this.editableStyles = true;
		}
		this.items.push(this.createStylesPanel(url));
	}
	gxp.WMSLayerPanel.superclass.initComponent.call(this);
};


// Override of the GetFeatureInfo addActions handler
gxp.plugins.WMSGetFeatureInfo.prototype.addActions = function() {
		this.popupCache = {};
		var actions = gxp.plugins.WMSGetFeatureInfo.superclass.addActions.call(this, [{
			// Masking the icon in the toolbar by removing its tooltip and its style
			//tooltip: this.infoActionTip,
			//iconCls: "gxp-icon-getfeatureinfo",
			toggleGroup: this.toggleGroup,
			// The info button does not need to be clickable
			disabled: true,
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
				if (u && typeof u == "string")
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
				//app.mapPanel.map.layers[l].transitionEffect="resize";
				if (app.mapPanel.layers.data.items[l].data)
					{
					if (app.mapPanel.layers.data.items[l].data.styles)
					{
						if (app.mapPanel.layers.data.items[l].data.styles.length > 0)
						{
							var urlLegend=app.mapPanel.layers.data.items[l].data.styles[0].legend.href;
							app.mapPanel.layers.data.items[l].data.styles[0].legend.href = urlLegend.replace(/http:\/\/\d+.\d+.\d+.\d+:\d+/,gtServicesHost);
						}	
						else
						{
							// Layer groups don't have a legend URL and trigger a Java exception on each map call
							// Work-around: provide the blank image as the legend URL (ideally, the item would not appear at all in the legend)
							app.mapPanel.layers.data.items[l].data.styles=[{legend:{href:Ext.BLANK_IMAGE_URL}}];
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
				// There might be a way to distribute the controls over several URLs
				var first_url;
				if (typeof x.getLayer().url == "object")
				{
					first_url = x.getLayer().url[0];
				}
				else
				{
					first_url = x.getLayer().url;
				}
				var control = new OpenLayers.Control.WMSGetFeatureInfo({
					url: first_url,
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
									// Catering for layer groups (they don't have a workspace name as a prefix)
									if (!lay)
									{
										lay=x.data.layer.params.LAYERS;
									}
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


// Override to allow the upload shapefile button on workspaced endpoints
gxp.plugins.AddLayers.prototype.createUploadButton = function () {
        var button;
        var uploadConfig = this.initialConfig.upload;
        var url;
        if (uploadConfig) {
            if (typeof uploadConfig === "boolean") {
                uploadConfig = {};
            }
            button = new Ext.Button({
                xtype: "button",
                text: this.uploadText,
                iconCls: "gxp-icon-filebrowse",
                hidden: true,
                handler: function () {
                    var panel = new gxp.LayerUploadPanel(Ext.apply({
                        url: url,
                        width: 350,
                        border: false,
                        bodyStyle: "padding: 10px 10px 0 10px;",
                        frame: true,
                        labelWidth: 65,
                        defaults: {
                            anchor: "95%",
                            allowBlank: false,
                            msgTarget: "side"
                        },
                        listeners: {
                            uploadcomplete: function (panel, detail) {
                                var layers = detail.layers;
                                var names = {};
                                for (var i = 0, len = layers.length; i < len; ++i) {
                                    names[layers[i].name] = true;
                                }
                                this.selectedSource.store.load({
                                    callback: function (records, options, success) {
                                        var gridPanel = this.capGrid.items.get(0);
                                        var sel = gridPanel.getSelectionModel();
                                        sel.clearSelections();
                                        var newRecords = [];
                                        var last = 0;
                                        this.selectedSource.store.each(function (record, index) {
                                            if (record.get("name") in names) {
                                                last = index;
                                                newRecords.push(record);
                                            }
                                        });
                                        sel.selectRecords(newRecords);
                                        window.setTimeout(function () {
                                            gridPanel.getView().focusRow(last);
                                        }, 100);
                                    },
                                    scope: this
                                });
                                win.close();
                            },
                            scope: this
                        }
                    }, uploadConfig));
                    var win = new Ext.Window({
                        title: this.uploadText,
                        modal: true,
                        resizable: false,
                        items: [panel]
                    });
                    win.show();
                },
                scope: this
            });
            var urlCache = {};

            function getStatus(url, callback, scope) {
                if (url in urlCache) {
                    window.setTimeout(function () {
                        callback.call(scope, urlCache[url]);
                    }, 0);
                } else {
                    Ext.Ajax.request({
                        url: url,
                        disableCaching: false,
                        callback: function (options, success, response) {
                            var status = response.status;
                            urlCache[url] = status;
                            callback.call(scope, status);
                        }
                    });
                }
            }
            this.on({
                sourceselected: function (tool, source) {
                    button.hide();
                    var show = false;
                    if (this.isEligibleForUpload(source)) {
                        var parts = source.url.split("/");
                        parts.pop();
			   if (parts[parts.length-1] != "geoserver")
			   {
				// Popping the workspace out of the array
				parts.pop();
			   }
                        parts.push("rest");
                        url = parts.join("/");
                        if (this.target.isAuthenticated()) {
                            getStatus(url + "/upload", function (status) {
                                var available = (status === 405);
                                var authorized = this.target.isAuthorized();
                                button.setVisible(authorized && available);
                            }, this);
                        }
                    }
                },
                scope: this
            });
        }
        return button;
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
			// Defining the behavior of the vector layer when features are added
			glayerLocSel.events.on({
				"featuresadded": function(event) {
					//alert("Adding features");
					if (gfromWFS=="Y")
					{
						var row_array = [];
						var cont;
						gComboDataArray=[];
										
						for (var k=0;k<event.features.length;k++)
						{
							// We capture the attributes brought back by the WFS call
							cont=event.features[k].data;
							// Capturing the feature as well (it contains the geometry)
							cont["the_geom_WFS"]=event.features[k];											

							// Building a record and inserting it into an array											
							row_array = new Array(k,gtyp,glab,cont,null,null,event.features[k].layer.protocol.featureType); 
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
				},
				scope:this
			});
		
			// Adding the WFS layer to the map
			app.mapPanel.map.addLayers([glayerLocSel]);

			// If a property number has been passed
		        if (initPropertyNum)
		        {
				// Handler for result of retrieving the property details by its number
				var prop_by_prop_num_handler=function(request){
					// Considering only the first row returned
					var res=[];
					res_data = request.data.items[0].json.row;
				
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

				var ds = new Ext.data.JsonStore({
					autoLoad: true, //autoload the data
					root: 'rows',
					baseParams: {query: initPropertyNum, config: gtDatabaseConfig, lga:gtLGACode},
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
					proxy: new Ext.data.ScriptTagProxy({
						url: gtSearchPropertyEndPoint
					}),
					listeners: {
						load: prop_by_prop_num_handler
					}
				});


		        }
			else
			{
				// Fixes the issue with the first getFeatureInfo/selection flicking
				glayerLocSel.refresh({force:true});
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
			
			// Extraction of the information panel layouts for the current authorized role - we should degrade nicely if the service is not found
			// Using endpoints array
			var ds;
			for (urlIdx in gtGetLiveDataEndPoints)
			{
				if (gtGetLiveDataEndPoints.hasOwnProperty(urlIdx))
				//if (urlIdx != "remove")
				{
					ds = new Ext.data.Store({
						autoLoad:true,
						proxy: new Ext.data.ScriptTagProxy({
							url: gtGetLiveDataEndPoints[urlIdx].urlLayout
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
							mode: gtGetLiveDataEndPoints[urlIdx].storeMode,
							config: gtGetLiveDataEndPoints[urlIdx].storeName
						},
						listeners:
						{
							load: function(store, recs)
							{
								// Setting up a global variable array to define the info panel layouts
								for (key=0;key<recs.length;key++)
								{
									var a = recs[key].json.row.val_arr;
								
									if (gLayoutsArr[recs[key].json.row.key_arr])
									{
										// If this key (layer) already exists, we add the JSON element (tab) to its value (tab array)
										gLayoutsArr[recs[key].json.row.key_arr]= gLayoutsArr[recs[key].json.row.key_arr].concat(a);
									}
									else
									{
										// We create this key if it didn't exist
										gLayoutsArr[recs[key].json.row.key_arr]=a; 
									}
								}
							}
						}
					});
				}
			}
		        
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
			collapsed: (typeof gtCollapseLayerTree ==='undefined'?false:true),
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
							forceSelection: true,
							triggerAction: 'all',
							emptyText: gtEmptyTextSelectFeature,
							tpl: '<tpl for="."><div class="info-item" style="height: 16px;">{type}: {label}</div></tpl>',
							itemSelector: 'div.info-item',
							listeners: {'select': function (combo,record){
										var e0=Ext.getCmp('gtAccordion');

										e0.removeAll();
										// Accordion part for normal attributes
										e0.add({id:'attributeAcc',title: gtDetailsTitle,html: '<p></p>'});

										// Layout configuration the global variable array loaded at application start										
										var configArray = gLayoutsArr[record.data.layer];
										if (configArray)
										{
											e0.add(configArray);										
										}
										
										// Refreshing the DOM with the newly added parts
										e0.doLayout();										
										//e0.items.itemAt(0).expand();
										if (!(gCurrentExpandedTabIdx[record.data.layer]))
										{
											gCurrentExpandedTabIdx[record.data.layer]="0";
										}
										e0.items.itemAt(gCurrentExpandedTabIdx[record.data.layer]).expand();
	
										// Setting a reference on this part of the DOM for injection of the attributes										
										var e1=e0.items.items[0].body.id;
										var e2=Ext.get(e1).dom;
										
										// Population of the direct attributes accordion panel
										var lab;
										var val;
										var item_array=new Array();
										var has_gsv = false;
										
										for(var k in record.data.content)
										{
											if (k=="the_geom" || k=="SHAPE")
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
											
											// Formatting the cells for attribute display in a tidy table
											item_array.push({html:"<div style='font-size:8pt;'><font color='#666666'>"+trim(lab)+"</font></div>"});
											item_array.push({html:"<div style='font-size:10pt;'>"+trim(val)+"</div>"});
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
			autoScroll:true,
			defaults: {
				// applied to each contained panel
				bodyStyle: " background-color: transparent ",
				collapsed: true,
				listeners:{
					scope: this,
					expand:function(p){
						// Updating the index of the currently opened tab
						for(k in p.ownerCt.items.items)
						{	
							if (p.ownerCt.items.items[k].id==p.id)
							{
								var cb = Ext.getCmp('gtInfoCombobox');
								// Layer name of the currently selected item in the combo
								gCurrentExpandedTabIdx[cb.getStore().data.items[cb.getStore().find("type",cb.getValue())].data.layer] = k;
								break;
							}
						}
						
						// Sending in the query to populate this specific tab (tab on demand)
						// Could be further refined by keeping track of which tab has already been opened, so that we don't re-request the data
						
						// Current layer, as per content of the drop down
						var cl = cb.getStore().data.items[cb.getStore().find("type",cb.getValue())].data.layer;
						
						if (gCurrentExpandedTabIdx[cl] != 0)
						{
							//alert("Requesting data on demand!");
							var configArray = gLayoutsArr[cl];
							if (configArray)
							{
								// This could be further refined by sending only the query corresponding to the open accordion part
								for (var i=gCurrentExpandedTabIdx[cl]-1; i< gCurrentExpandedTabIdx[cl]; i++)
								{
									var g=0;
									
									// Adding a loading indicator for user feedback		
									var targ2 = Ext.get(Ext.getCmp(configArray[i].id).body.id).dom;

									// If data already exists, we remove it for replacement with the latest data
									if (targ2.hasChildNodes())
									{
										targ2.removeChild(targ2.firstChild);
									}

									// Rendering as a table
									var win2 = new Ext.Panel({
										id:'tblayout-win-loading'
										//,width:227
										,layout:'hbox'
										,layoutConfig: {
											padding:'5',
											pack:'center',
											align:'middle'
										}
										,border:false
										,defaults:{height:26}
										,renderTo: targ2
										,items: [
											{html:'<img src="/externals/ext/resources/images/default/grid/loading.gif"/>',border:false,padding:'5'}
										]
									});
									
									// Finding the unique ID of the selected record, to pass to the live query
									var selectedRecordIndex = cb.selectedIndex;	
									if ((selectedRecordIndex==-1) || (selectedRecordIndex>=cb.store.data.items.length))
									{
										selectedRecordIndex=0;
									}
									var idFeature = cb.store.data.items[selectedRecordIndex].data.content[configArray[i].idName];

									if (configArray[i].id.substring(0,1)!='X')
									{
										// Live query using the script tag
										var ds = new Ext.data.Store({
											autoLoad:true,
											proxy: new Ext.data.ScriptTagProxy({
												url: gtGetLiveDataEndPoints[configArray[i].definition].urlLiveData
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
												id: idFeature,
												// Passing the tab name
												infoGroup: configArray[i].id,
												// Passing the database type to query
												mode: gtGetLiveDataEndPoints[configArray[i].definition].storeMode,
												// Passing the database name to query
												config: gtGetLiveDataEndPoints[configArray[i].definition].storeName,
												// Passing the LGA code, so that the query can be narrowed down (unused)
												lga: gtLGACode
											},
											listeners:
											{
												load: function(store, recs)
												{
													// Looping thru the records returned by the query
													tab_array = new Array();
													for (m = 0 ; m < recs.length; m++)
													{
														res_data = recs[m].json.row;
														var item_array2 = new Array();
														var has_gsv = false;		

														for (j in res_data)
														{
															if (j!="target")
															{
																var val=res_data[j];
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

																if (j.search(/^gsv/)>-1)
																{
																	// Not showing the cells - technical properties for Google Street View
																	has_gsv = true;
																}
																else
																{																			// Formatting the cells for attribute display in a tidy table
																	item_array2.push({html:"<div style='font-size:8pt;'><font color='#666666'>"+j+"</font></div>"});
																	item_array2.push({html:"<div style='font-size:10pt;'>"+val+"</div>"});
																}
															}
														}

														// Adding a Google Street View link for selected datasets
														if (has_gsv)
														{
															var gsv_lat, gsv_lon, gsv_head=0;

															for(var k in res_data)
															{
																if (k=="gsv_lat")
																{
																	gsv_lat=res_data[k];
																}
																if (k=="gsv_lon")
																{
																	gsv_lon=res_data[k];
																}
																if (k=="gsv_head")
																{
																	gsv_head=res_data[k];
																}												
															}

															if (gsv_lat && gsv_lon)
															{
																// Adjusted to the size of the column
																var size_thumb = 245;
																var gsvthumb = "http://maps.googleapis.com/maps/api/streetview?location="+gsv_lat+","+gsv_lon+"&fov=90&heading="+gsv_head+"&pitch=-10&sensor=false&size="+size_thumb+"x"+size_thumb;
																var gsvlink = "http://maps.google.com.au/maps?layer=c&cbll="+gsv_lat+","+gsv_lon+"&cbp=12,"+gsv_head+",,0,0";
																item_array2.push({html:"<div style='font-size:10pt;'><a href='"+gsvlink+"' target='_blank'><img src='"+gsvthumb+"'/></a></div>",height:size_thumb,colspan:2});											
															}
														}

														tab_el = {
															title	: m+1,
															layout	: 'table',
															defaults:{height:20},
															layoutConfig:{columns:2},
															items	: item_array2
														};

														tab_array.push(tab_el);
													}	

													// Identification of the div to render the attributes to, if there is anything to render
													if (recs[0])
													{
														// The target div for placing this data
														var targ = Ext.get(Ext.getCmp(recs[0].json.row["target"]).body.id).dom;
														// If data already exists, we remove it for replacement with the latest data
														if (targ.hasChildNodes())
														{
															targ.removeChild(targ.firstChild);
														}	
													
														// The container depends on the number of records returned
														if (tab_array.length==1)
														{
															// Rendering as a table
															var win = new Ext.Panel({
																id:'tblayout-win'+g
																//,width:227
																,layout:'table'
																,layoutConfig:{columns:2}
																,border:false
																//,closable:false
																,defaults:{height:20}
																,renderTo: targ
																,items: tab_array[0].items
															});
														}
														else
														{
															// Renderng as a tab panel of tables
															var win = new Ext.TabPanel({
																activeTab       : 0,
																id              : 'tblayout-win'+g,
																enableTabScroll : true,
																resizeTabs      : false,
																minTabWidth     : 15,																
																border:false,
																renderTo: targ,
																items: tab_array
															});
														}
														win.doLayout();	
													}
													else
													{
														// The target div for placing this data: the loading div's parent
														var targ = Ext.get(Ext.getCmp('tblayout-win-loading').body.id).dom.parentNode;
														// If data already exists, we remove it for replacement with the latest data
														if (targ.hasChildNodes())
														{
															targ.removeChild(targ.firstChild);
														}
													
														// Rendering as a table
														var win3 = new Ext.Panel({
															id:'tblayout-win-noresult'
															//,width:227
															,layout:'hbox'
															,layoutConfig: {
																padding:'5',
																pack:'center',
																align:'middle'
															}
															,border:false
															,defaults:{height:26}
															,renderTo: targ
															,items: [
																{html:'<p style="font-size:12px;">No result found</p>',border:false,padding:'5'}
															]
														});
														win3.doLayout();
													}
													g++;
												}
											}
										});
									}
									else
									{
										// Rendering a generic tab based on its HTML definition
										// The target div for placing this data: the loading div's parent
										var targ3 = Ext.get(Ext.getCmp('tblayout-win-loading').body.id).dom.parentNode.parentElement.parentElement;
										// If data already exists, we remove it for replacement with the latest data
										if (targ3.hasChildNodes())
										{
											targ3.removeChild(targ3.firstChild);
										}
									
										// Rendering as a table
										var win4 = new Ext.Panel({
											id:'tblayout-win-generic'
											//,width:227
											,layout:'fit'
											,idFeature:idFeature
											,border:false
//											,defaults:{height:100%}
											,renderTo: targ3
											,items: [
												{html:configArray[i].html_to_render}
											]
										});
										win4.doLayout();
									}
								}

							}							
							
						}
	
					}
				}
			},
			layoutConfig: {
				// layout-specific configs go here
				animate: false,
				titleCollapse: true,
				activeOnTop: false,
				hideCollapseTool: false,
				fill: false 
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
		baseParams: { config: gtDatabaseConfig, lga:gtLGACode},
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
//		proxy: new Ext.data.HttpProxy({
		proxy: new Ext.data.ScriptTagProxy({
			url: gtSearchComboEndPoint
		})
	});

        this.portalItems = [
        {
            	region: "north",
            	layout: "column",
            	height: 100,
            	footerCfg: {
            		// Required to have the footer display
		        html: '<p style="font-size:8px;"><br></p>'
		},
		footerStyle:'background-color:'+gtBannerLineColor+';border:0px;',
		// Removes the grey border around the footer (and around the whole container body)
		bodyStyle:'border:0px;',
            	items:
                    	[
                    	new Ext.BoxComponent({
                    	region: "west",
				width: gtLogoClientWidth,
				bodyStyle: " background-color: transparent ",
				html: '<img style="height: 90px" src="'+gtLogoClientSrc+'" align="right"/>'
        		})
        		,
        		{
				columnWidth: 0.5,
				html:"",
	                	height: 100,
				border:false
        		}
			,
			(typeof gtHideSearch ==='undefined'?
			new Ext.Panel({
				region: "center",
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
				]
			})
			:
			{
				columnWidth: 0,
				html:"",
	                	height: 100,
				border:false
			}			
			)
			,
			{
				columnWidth: 0.5,
				html:"",
	                	height: 100,
				border:false
			}
			,
				
			new Ext.Panel({
				region: "east",
				border: false,
				width: 200,
				height: 100,
				bodyStyle: " background-color: transparent; ",
				html: '<p style="text-align:right;padding: 15px;font-size:12px;"><a href="'+gtLinkToCouncilWebsite+'" target="_blank">'+ gtBannerRightCornerLine1 +'</a><br> '+ gtBannerRightCornerLine2 +' <br><br>Map powered by <a href="javascript:poziLinkClickHandler()">Pozi</a></p>'
				
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

	if (typeof gtHideGlobalNorthRegion ==='undefined')
	{
		
	}
	else
	{
	this.portalItems=[this.portalItems[1]];
	}
      
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
	var addTool2 = "->";

	// Not displaying the zoom to combo if the underlying store is empty
	if (zoomstore.data.length>0)
	{
		var addTool2 = new Ext.form.ComboBox({
      		    	tpl: '<tpl for="."><div ext:qtip="{label}" class="x-combo-list-item">{label}</div></tpl>',
	      	    	store: zoomstore,
	      	    	displayField:'label',
	      	    	typeAhead: true,
	      	    	mode: 'local',
			editable: false,
	      	    	forceSelection: true,
	      	    	triggerAction: 'all',
	      	    	width:125,
	      	    	emptyText:gtEmptyTextQuickZoom,
	      	    	listeners: {'select': function (combo,record){
	      	    				var projsrc = new OpenLayers.Projection("EPSG:4326");
	      	    				var projdest = new OpenLayers.Projection("EPSG:900913");
	      	    				var bd = new OpenLayers.Bounds(record.data.xmin,record.data.ymin,record.data.xmax,record.data.ymax);
	      	    				var bd2 = bd.transform(projsrc, projdest);
	      	    				this.mapPanel.map.zoomToExtent(bd2);},
	      			    scope:this}
	      		}	     
		     );
	}
	// Adding these tools to the base tools 
	///var mybaseTools = GroundtruthExplorer.superclass.createTools.apply(this, arguments);
	var mybaseTools = gtCreateTools.apply(this, arguments);
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
