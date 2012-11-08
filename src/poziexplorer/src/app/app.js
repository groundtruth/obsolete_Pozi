/**
 * Add all your dependencies here.
 *
 * @require widgets/Viewer.js
 * @require plugins/LayerManager.js
 * @require plugins/OLSource.js
 * @require plugins/OSMSource.js
 * @require plugins/BingSource.js
 * @require plugins/GoogleSource.js
 * @require plugins/WMSCSource.js
 * @require plugins/MapQuestSource.js
 * @require plugins/Zoom.js
 * @require plugins/ZoomToLayerExtent.js
 * @require plugins/AddLayers.js
 * @require plugins/RemoveLayer.js
 * @require plugins/WMSGetFeatureInfo.js
 * @require plugins/Print.js
 * @require plugins/LayerProperties.js
 * @require plugins/Measure.js
 * @require plugins/FeatureEditor.js 
 * @require plugins/FeatureManager.js 
 * @require plugins/Styler.js 
 * @require widgets/WMSLayerPanel.js
 * @require widgets/ScaleOverlay.js
 * @require RowExpander.js
 * @require RowLayout.js
 * @require GeoExt/widgets/PrintMapPanel.js
 * @require GeoExt/plugins/PrintProviderField.js
 * @require GeoExt/plugins/PrintPageField.js
 * @require GeoExt/plugins/PrintExtent.js
 * @require OpenLayers/Layer.js
 * @require OpenLayers/Handler/Path.js
 * @require OpenLayers/Handler/Point.js
 * @require OpenLayers/Handler/Polygon.js
 * @require OpenLayers/Renderer.js
 * @require OpenLayers/Renderer/SVG.js 
 * @require OpenLayers/Renderer/VML.js 
 * @require OpenLayers/Renderer/Canvas.js 
 * @require OpenLayers/StyleMap.js
 * @require OpenLayers/Feature/Vector.js
 * @require OpenLayers/Console.js
 * @require OpenLayers/Lang.js 
 * @require OpenLayers/Layer/Vector.js
 * @require OpenLayers/Layer/OSM.js
 * @require OpenLayers/Control/ScaleLine.js
 * @require OpenLayers/Control/Zoom.js
 * @require OpenLayers/Projection.js
 * @require PrintPreview.js
 * @require OpenLayers/StyleMap.js
 * @require OpenLayers/Strategy.js
 * @require OpenLayers/Strategy/BBOX.js
 * @require OpenLayers/Protocol.js
 * @require OpenLayers/Protocol/WFS.js
 * @require OpenLayers/Filter.js
 * @require OpenLayers/Filter/Comparison.js
 * @require OpenLayers/Request/XMLHttpRequest.js
 */

var gtProxy,gtLoginEndpoint,gtLocalLayerSourcePrefix;
var debugMode = (/(localhost|\.dev|\.local)/i).test(window.location.hostname);

if (debugMode)
{
	gtProxy = "proxy/?url=";
	gtLoginEndpoint = "http://v3.pozi.com/geoexplorer/login/";
	gtLocalLayerSourcePrefix = "http://v3.pozi.com";
}
else
{
	gtProxy = "/geoexplorer/proxy/?url=";
	gtLoginEndpoint = "/geoexplorer/login";
	gtLocalLayerSourcePrefix = "";
}

var app;
var glayerLocSel,gComboDataArray=[],gfromWFS,clear_highlight,gCombostore,gCurrentExpandedTabIdx=[],gCurrentLoggedRole="NONE",JSONconf,propertyDataInit,gtLayerPresentationConfiguration,eastPanel,westPanel,northPart,gLayoutsArr,gLoggedUsername,gLoggedPassword,gtZoomMax,gtHideSelectedFeaturePanel,add_default_tabs;
var poziLinkClickHandler;
var vector_layer = new OpenLayers.Layer.Vector("WKT",{displayInLayerSwitcher:false});
var wkt_format = new OpenLayers.Format.WKT();
var gtLayerLabel;
var desc = "hello";
var count = 0;

// Helper functions
function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function gotNum(str){
	return /\d/.test(str);
}

function toSmartTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){
    	if (gotNum(txt)) 
    	{return txt;} 
    	else 
    	{return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}
    });
}

function trim(str)
{
	if (str) 
		{return str.replace(/^\s*/, "").replace(/\s*$/, "");}
	else 
		{return "";}
}

Ext.onReady(function() {

// Ext overrides

	// Overriding the behaviour of the property column model because it HTML encodes everything
	// This is where we can format cell content, regardless of the name of the property to render, but based on the content of its value
	// If we knew the name of the property in advance, we could use PropertyGrid custom renderers
	// Based on the source code: http://docs.sencha.com/ext-js/3-4/source/Column.html
	// TODO: this is a good candidate for a custom type extending the PropertyGrid if we find ourselves modifying its core functionalities anymore	

	Ext.grid.PropertyColumnModel.prototype.renderCell = function(val, meta, rec){
		var renderer = this.grid.customRenderers[rec.get('name')], doNotHTMLEncode = false, rv = val;
		if(renderer){
			return renderer.apply(this, arguments);
		}
		if(Ext.isDate(val)){
			rv = this.renderDate(val);
		}else if(typeof val === 'boolean'){
			rv = this.renderBool(val);
		}else if(val){
			if (val.search(/^http/)>-1){
				if (val.search(/\.jpg/)>-1)
				{
					rv ="<a href='"+val+"' target='_blank'><img src='"+val+"' style='display:block; max-height:150px; max-width:230px; height:auto; margin-right:auto;' /></a>";
				}
				else
				{
					var linkName=val.split("/").pop();
					if (linkName.length<1) {linkName = 'link';}
					if (linkName.length>25) {linkName = 'link';}
					rv ="<a href='"+val+"' target='_blank'>"+linkName+"</a>";
				}
				doNotHTMLEncode = true;
			}else	{
				try {
					// Decoding those strings that have been URI-encoded
					rv = decodeURI(val);
				}
				catch (e)
				{
					// Or presenting them as is, if they can't be decoded
					rv = val;
				}
				// Converting line returns to HTML line breaks (needs to be after URI-decoding)
				rv=rv.replace(/\n/g, '<br />');
				
				// Better presentation of boolean values (they are not detected as boolean in the tests above)
				if (val == "true")  {rv="<input type='checkbox' name='a' value='a' checked='checked' disabled='disabled'/>";}
				if (val == "false") {rv="<input type='checkbox' name='b' value='b' disabled='disabled'/>";}
				
				// Presentation of email addresses
				if (/^[-+.\w]{1,64}@[-.\w]{1,64}\.[-.\w]{2,6}$/.test(val))
				{
					rv="<a href='mailto:"+val+"'>"+val+"</a>";
				}
				
				// We HTML-encode nothing!
				doNotHTMLEncode = true;
			}
		}
		if (doNotHTMLEncode)
		{return rv;}
		else
		{return Ext.util.Format.htmlEncode(rv);}
	};

// GXP overrides

    /** api: method[addActions]
     */
	// Reasons for override:
	// - increase size (height/width) of the popup
	// - JSON customisation of the edit form by layer

    gxp.plugins.FeatureEditor.prototype.addActions = function() {
        var popup;
        var featureManager = this.getFeatureManager();
        var featureLayer = featureManager.featureLayer;
        
        var intercepting = false;
        // intercept calls to methods that change the feature store - allows us
        // to persist unsaved changes before calling the original function
        function intercept(mgr, fn) {
            var fnArgs = Array.prototype.slice.call(arguments);
            // remove mgr and fn, which will leave us with the original
            // arguments of the intercepted loadFeatures or setLayer function
            fnArgs.splice(0, 2);
            if (!intercepting && popup && !popup.isDestroyed) {
                if (popup.editing) {
                    function doIt() {
                        intercepting = true;
                        unregisterDoIt.call(this);
                        if (fn === "setLayer") {
                            this.target.selectLayer(fnArgs[0]);
                        } else if (fn === "clearFeatures") {
                            // nothing asynchronous involved here, so let's
                            // finish the caller first before we do anything.
                            window.setTimeout(function() {mgr[fn].call(mgr);});
                        } else {
                            mgr[fn].apply(mgr, fnArgs);
                        }
                    }
                    function unregisterDoIt() {
                        featureManager.featureStore.un("write", doIt, this);
                        popup.un("canceledit", doIt, this);
                        popup.un("cancelclose", unregisterDoIt, this);
                    }
                    featureManager.featureStore.on("write", doIt, this);
                    popup.on({
                        canceledit: doIt,
                        cancelclose: unregisterDoIt,
                        scope: this
                    });
                    popup.close();
                }
                return !popup.editing;
            }
            intercepting = false;
        }
        featureManager.on({
            // TODO: determine where these events should be unregistered
            "beforequery": intercept.createDelegate(this, "loadFeatures", 1),
            "beforelayerchange": intercept.createDelegate(this, "setLayer", 1),
            "beforesetpage": intercept.createDelegate(this, "setPage", 1),
            "beforeclearfeatures": intercept.createDelegate(this, "clearFeatures", 1),
            scope: this
        });
        
        this.drawControl = new OpenLayers.Control.DrawFeature(
            featureLayer,
            OpenLayers.Handler.Point, 
            {
                eventListeners: {
                    featureadded: function(evt) {
                        if (this.autoLoadFeature === true) {
                            this.autoLoadedFeature = evt.feature;
                        }
                    },
                    activate: function() {
                        this.target.doAuthorized(this.roles, function() {
                            featureManager.showLayer(
                                this.id, this.showSelectedOnly && "selected"
                            );
                        }, this);
                    },
                    deactivate: function() {
                        featureManager.hideLayer(this.id);
                    },
                    scope: this
                }
            }
        );
        
        // create a SelectFeature control
        // "fakeKey" will be ignord by the SelectFeature control, so only one
        // feature can be selected by clicking on the map, but allow for
        // multiple selection in the featureGrid
        this.selectControl = new OpenLayers.Control.SelectFeature(featureLayer, {
            clickout: false,
            multipleKey: "fakeKey",
            unselect: function() {
                // TODO consider a beforefeatureunselected event for
                // OpenLayers.Layer.Vector
                if (!featureManager.featureStore.getModifiedRecords().length) {
                    OpenLayers.Control.SelectFeature.prototype.unselect.apply(this, arguments);
                }
            },
            eventListeners: {
                "activate": function() {
                    this.target.doAuthorized(this.roles, function() {
                        if (this.autoLoadFeature === true || featureManager.paging) {
                            this.target.mapPanel.map.events.register(
                                "click", this, this.noFeatureClick
                            );
                        }
                        featureManager.showLayer(
                            this.id, this.showSelectedOnly && "selected"
                        );
                        this.selectControl.unselectAll(
                            popup && popup.editing && {except: popup.feature}
                        );
                    }, this);
                },
                "deactivate": function() {
                    if (this.autoLoadFeature === true || featureManager.paging) {
                        this.target.mapPanel.map.events.unregister(
                            "click", this, this.noFeatureClick
                        );
                    }
                    if (popup) {
                        if (popup.editing) {
                            popup.on("cancelclose", function() {
                                this.selectControl.activate();
                            }, this, {single: true});
                        }
                        popup.on("close", function() {
                            featureManager.hideLayer(this.id);
                        }, this, {single: true});
                        popup.close();
                    } else {
                        featureManager.hideLayer(this.id);
                    }
                },
                scope: this
            }
        });
        
        featureLayer.events.on({
            "beforefeatureremoved": function(evt) {
                if (this.popup && evt.feature === this.popup.feature) {
                    this.selectControl.unselect(evt.feature);
                }
            },
            "featureunselected": function(evt) {
                var feature = evt.feature;
                if (feature) {
                    this.fireEvent("featureeditable", this, feature, false);
                }
                if (feature && feature.geometry && popup && !popup.hidden) {
                    popup.close();
                }
            },
            "beforefeatureselected": function(evt) {
                //TODO decide if we want to allow feature selection while a
                // feature is being edited. If so, we have to revisit the
                // SelectFeature/ModifyFeature setup, because that would
                // require to have the SelectFeature control *always*
                // activated *after* the ModifyFeature control. Otherwise. we
                // must not configure the ModifyFeature control in standalone
                // mode, and use the SelectFeature control that comes with the
                // ModifyFeature control instead.
                if(popup) {
                    return !popup.editing;
                }
            },
            "featureselected": function(evt) {
                var feature = evt.feature;
                if (feature) {
                    this.fireEvent("featureeditable", this, feature, true);
                }
                var featureStore = featureManager.featureStore;
                if(this._forcePopupForNoGeometry === true || (this.selectControl.active && feature.geometry !== null)) {
                    // deactivate select control so no other features can be
                    // selected until the popup is closed
                    if (this.readOnly === false) {
                        this.selectControl.deactivate();
                        // deactivate will hide the layer, so show it again
                        featureManager.showLayer(this.id, this.showSelectedOnly && "selected");
                    }
                    
                    // JSON customisations to edit form
                    // We need to identify what is the current selected layer
                    // We do that thru featureLayer.features[0].fid which by construction starts with the laeyr name
                    // Note: this could be done more elegantly
                       
                    if (featureLayer.features[0].fid)
                    {
                    	var layerName = featureLayer.features[0].fid.split(".")[0];
                    	
                    	// The JSON can contain a customisation for the edit form (presence and order of attributes):
			//    "layerEditPresentation": {
			//	"CREEK_SEGMENT_FINAL":[
			//		"label",
			//		"interested",
			//		"visited",
			//		"visited_date",
			//		"stock_excluded",
			//		"stock_excluded_date",
			//		"native_vegetation",
			//		"revegetated_date",
			//		"comments",
			//		"credits",
			//		"management_group"
			//	]
			//    }, 
                    	if (JSONconf.layerEditPresentation)
                    	{
	                    	this.fields = JSONconf.layerEditPresentation[layerName];
	                }
                    }
                                       
                    popup = this.addOutput({
                        xtype: "gxp_featureeditpopup",
                        collapsible: true,
                        feature: featureStore.getByFeature(feature),
                        vertexRenderIntent: "vertex",
                        readOnly: this.readOnly,
                        fields: this.fields,
                        excludeFields: this.excludeFields,
                        editing: feature.state === OpenLayers.State.INSERT,
                        schema: this.schema,
                        allowDelete: true,
                        width: 400,
                        height: 450,
                        listeners: {
                            "close": function() {
                                if (this.readOnly === false) {
                                    this.selectControl.activate();
                                }
                                if(feature.layer && feature.layer.selectedFeatures.indexOf(feature) !== -1) {
                                    this.selectControl.unselect(feature);
                                }
                                if (feature === this.autoLoadedFeature) {
                                    if (feature.layer) {
                                        feature.layer.removeFeatures([evt.feature]);
                                    }
                                    this.autoLoadedFeature = null;
                                }
                            },
                            "featuremodified": function(popup, feature) {
                                popup.disable();
                                featureStore.on({
                                    write: {
                                        fn: function() {
                                            if (popup) {
                                                if (popup.isVisible()) {
                                                    popup.enable();
                                                }
                                                if (this.closeOnSave) {
                                                    popup.close();
                                                }
                                            }
                                            var layer = featureManager.layerRecord;
                                            this.target.fireEvent("featureedit", featureManager, {
                                                name: layer.get("name"),
                                                source: layer.get("source")
                                            });
                                        },
                                        single: true
                                    },
                                    exception: {
                                        fn: function(proxy, type, action, options, response, records) {
                                            var msg = this.exceptionText;
                                            if (type === "remote") {
                                                // response is service exception
                                                if (response.exceptionReport) {
                                                    msg = gxp.util.getOGCExceptionText(response.exceptionReport);
                                                }
                                            } else {
                                                // non-200 response from server
                                                msg = "Status: " + response.status;
                                            }
                                            // fire an event on the feature manager
                                            featureManager.fireEvent("exception", featureManager, 
                                                response.exceptionReport || {}, msg, records);
                                            // only show dialog if there is no listener registered
                                            if (featureManager.hasListener("exception") === false && 
                                                featureStore.hasListener("exception") === false) {
                                                    Ext.Msg.show({
                                                        title: this.exceptionTitle,
                                                        msg: msg,
                                                        icon: Ext.MessageBox.ERROR,
                                                        buttons: {ok: true}
                                                    });
                                            }
                                            if (popup && popup.isVisible()) {
                                                popup.enable();
                                                popup.startEditing();
                                            }
                                        },
                                        single: true
                                    },
                                    scope: this
                                });                                
                                if(feature.state === OpenLayers.State.DELETE) {                                    
                                    /**
                                     * If the feature state is delete, we need to
                                     * remove it from the store (so it is collected
                                     * in the store.removed list.  However, it should
                                     * not be removed from the layer.  Until
                                     * http://trac.geoext.org/ticket/141 is addressed
                                     * we need to stop the store from removing the
                                     * feature from the layer.
                                     */
                                    featureStore._removing = true; // TODO: remove after http://trac.geoext.org/ticket/141
                                    featureStore.remove(featureStore.getRecordFromFeature(feature));
                                    delete featureStore._removing; // TODO: remove after http://trac.geoext.org/ticket/141
                                }
                                featureStore.save();
                            },
                            "canceledit": function(popup, feature) {
                                featureStore.commitChanges();
                            },
                            scope: this
                        }
                    });
                    this.popup = popup;
                }
            },
            "sketchcomplete": function(evt) {
                // Why not register for featuresadded directly? We only want
                // to handle features here that were just added by a
                // DrawFeature control, and we need to make sure that our
                // featuresadded handler is executed after any FeatureStore's,
                // because otherwise our selectControl.select statement inside
                // this handler would trigger a featureselected event before
                // the feature row is added to a FeatureGrid. This, again,
                // would result in the new feature not being shown as selected
                // in the grid.
                featureManager.featureLayer.events.register("featuresadded", this, function(evt) {
                    featureManager.featureLayer.events.unregister("featuresadded", this, arguments.callee);
                    this.drawControl.deactivate();
                    this.selectControl.activate();
                    this.selectControl.select(evt.features[0]);
                });
            },
            scope: this
        });

        var toggleGroup = this.toggleGroup || Ext.id();

        var actions = [];
        var commonOptions = {
            tooltip: this.createFeatureActionTip,
            // backwards compatibility: only show text if configured
            menuText: this.initialConfig.createFeatureActionText,
            text: this.initialConfig.createFeatureActionText,
            iconCls: this.iconClsAdd,
            disabled: true,
            hidden: this.modifyOnly || this.readOnly,
            toggleGroup: toggleGroup,
            //TODO Tool.js sets group, but this doesn't work for GeoExt.Action
            group: toggleGroup,
            groupClass: null,
            enableToggle: true,
            allowDepress: true,
            control: this.drawControl,
            deactivateOnDisable: true,
            map: this.target.mapPanel.map,
            listeners: {checkchange: this.onItemCheckchange, scope: this}
        };
        if (this.supportAbstractGeometry === true) {
            var menuItems = [];
            if (this.supportNoGeometry === true) {
                menuItems.push(
                    new Ext.menu.CheckItem({
                        text: this.noGeometryText,
                        iconCls: "gxp-icon-event",
                        groupClass: null,
                        group: toggleGroup,
                        listeners: {
                            checkchange: function(item, checked) {
                                if (checked === true) {
                                    var feature = new OpenLayers.Feature.Vector(null);
                                    feature.state = OpenLayers.State.INSERT;
                                    featureLayer.addFeatures([feature]);
                                    this._forcePopupForNoGeometry = true;
                                    featureLayer.events.triggerEvent("featureselected", {feature: feature});
                                    delete this._forcePopupForNoGeometry;
                                }
                                if (this.createAction.items[0] instanceof Ext.menu.CheckItem) {
                                    this.createAction.items[0].setChecked(false);
                                } else {
                                    this.createAction.items[0].toggle(false);
                                }
                            },
                            scope: this
                        }
                    })
                );
            }
            var checkChange = function(item, checked, Handler) {
                if (checked === true) {
                    this.setHandler(Handler, false);
                }
                if (this.createAction.items[0] instanceof Ext.menu.CheckItem) {
                    this.createAction.items[0].setChecked(checked);
                } else {
                    this.createAction.items[0].toggle(checked);
                }
            };
            menuItems.push(
                new Ext.menu.CheckItem({
                    groupClass: null,
                    text: this.pointText,
                    group: toggleGroup,
                    iconCls: 'gxp-icon-point',
                    listeners: {
                        checkchange: checkChange.createDelegate(this, [OpenLayers.Handler.Point], 2)
                    }
                }),
                new Ext.menu.CheckItem({
                    groupClass: null,
                    text: this.lineText,
                    group: toggleGroup,
                    iconCls: 'gxp-icon-line',
                    listeners: {
                        checkchange: checkChange.createDelegate(this, [OpenLayers.Handler.Path], 2)
                    }
                }),
                new Ext.menu.CheckItem({
                    groupClass: null,
                    text: this.polygonText,
                    group: toggleGroup,
                    iconCls: 'gxp-icon-polygon',
                    listeners: {
                        checkchange: checkChange.createDelegate(this, [OpenLayers.Handler.Polygon], 2)
                    }
                })
            );

            actions.push(
                new GeoExt.Action(Ext.apply(commonOptions, {
                    menu: new Ext.menu.Menu({items: menuItems})
                }))
            );
        } else {
            actions.push(new GeoExt.Action(commonOptions));
        }
        actions.push(new GeoExt.Action({
            tooltip: this.editFeatureActionTip,
            // backwards compatibility: only show text if configured
            text: this.initialConfig.editFeatureActionText,
            menuText: this.initialConfig.editFeatureActionText,
            iconCls: this.iconClsEdit,
            disabled: true,
            toggleGroup: toggleGroup,
            //TODO Tool.js sets group, but this doesn't work for GeoExt.Action
            group: toggleGroup,
            groupClass: null,
            enableToggle: true,
            allowDepress: true,
            control: this.selectControl,
            deactivateOnDisable: true,
            map: this.target.mapPanel.map,
            listeners: {checkchange: this.onItemCheckchange, scope: this}
        }));
        
        this.createAction = actions[0];
        this.editAction = actions[1];
        
        if (this.splitButton) {
            this.splitButton = new Ext.SplitButton({
                menu: {items: [
                    Ext.apply(new Ext.menu.CheckItem(actions[0]), {
                        text: this.createFeatureActionText
                    }),
                    Ext.apply(new Ext.menu.CheckItem(actions[1]), {
                        text: this.editFeatureActionText
                    })
                ]},
                disabled: true,
                buttonText: this.splitButtonText,
                tooltip: this.splitButtonTooltip,
                iconCls: this.iconClsAdd,
                enableToggle: true,
                toggleGroup: this.toggleGroup,
                allowDepress: true,
                handler: function(button, event) {
                    if(button.pressed) {
                        button.menu.items.itemAt(this.activeIndex).setChecked(true);
                    }
                },
                scope: this,
                listeners: {
                    toggle: function(button, pressed) {
                        // toggleGroup should handle this
                        if(!pressed) {
                            button.menu.items.each(function(i) {
                                i.setChecked(false);
                            });
                        }
                    },
                    render: function(button) {
                        // toggleGroup should handle this
                        Ext.ButtonToggleMgr.register(button);
                    }
                }
            });
            actions = [this.splitButton];
        }

        actions = gxp.plugins.FeatureEditor.superclass.addActions.call(this, actions);

        featureManager.on("layerchange", this.onLayerChange, this);

        var snappingAgent = this.getSnappingAgent();
        if (snappingAgent) {
            snappingAgent.registerEditor(this);
        }

        return actions;
    };

    /** private: method[addLayers]
     *  :arg records: ``Array`` the layer records to add
     *  :arg source: :class:`gxp.plugins.LayerSource` The source to add from
     *  :arg isUpload: ``Boolean`` Do the layers to add come from an upload?
     */
 	// Reasons for override:
	// - do not zoom to layer extent when it's added
	// - more precise control of the group a layer is being added to

    gxp.plugins.AddLayers.prototype.addLayers = function(records, source, isUpload) {
        source = source || this.selectedSource;
        var layerStore = this.target.mapPanel.layers,
            extent, record, layer;
        for (var i=0, ii=records.length; i<ii; ++i) {
            record = source.createLayerRecord({
                name: records[i].get("name"),
                source: source.id
            });
            if (record) {
                layer = record.getLayer();
                if (layer.maxExtent) {
                    if (!extent) {
                        extent = record.getLayer().maxExtent.clone();
                    } else {
                        extent.extend(record.getLayer().maxExtent);
                    }
                }
 		if (record.get("group") === "background") {

                    layerStore.insert(0, [record]);
                } else {
 		    // TODO: Try triggering the layer/map refresh that happens when drag/dropping a layer
                    layerStore.add([record]);
                }
            }
        }
        if (extent) {
        	// TODO: we could trigger the zoomToExtent but only if we are outside the extent
            //this.target.mapPanel.map.zoomToExtent(extent);
        }
        if (records.length === 1 && record) {	
            // select the added layer
            this.target.selectLayer(record);
            if (isUpload && this.postUploadAction) {
                // show LayerProperties dialog if just one layer was uploaded
                var outputConfig,
                    actionPlugin = this.postUploadAction;
                if (!Ext.isString(actionPlugin)) {
                    outputConfig = actionPlugin.outputConfig;
                    actionPlugin = actionPlugin.plugin;
                }
                this.target.tools[actionPlugin].addOutput(outputConfig);
            }
        }
    };

	/** private: method[onRenderNode]
	 *  :param node: ``Ext.tree.TreeNode``
	 */
 	// Reasons for override:
	// - initial collapse of the legend for each node
	
	GeoExt.plugins.TreeNodeComponent.prototype.onRenderNode = function(node) {
		var rendered = node.rendered;
		var attr = node.attributes;
		var component = attr.component || this.component;
		if(!rendered && component) {
		    // We're initially hiding the component
		    component.hidden=true;
		    var elt = Ext.DomHelper.append(node.ui.elNode, [
			{"tag": "div"}
		    ]);
		    if(typeof component == "function") {
			component = component(node, elt);
		    } else if (typeof component == "object" &&
			       typeof component.fn == "function") {
			component = component.fn.apply(
			    component.scope, [node, elt]
			);
		    }
		    if(typeof component == "object" &&
		       typeof component.xtype == "string") {
			component = Ext.ComponentMgr.create(component);
		    }
		    if(component instanceof Ext.Component) {
			component.render(elt);
			node.component = component;
		    }
		}
	};

	/** api: constructor
	 *  .. class:: FeatureEditor(config)
	 *
	 *    Plugin for feature editing. Requires a
	 *    :class:`gxp.plugins.FeatureManager`.
	 */ 

 	// Reasons for override:
	// - layer change activates create/edit control irrespective of user being logged in

	gxp.plugins.FeatureEditor.prototype.enableOrDisable = function() {
		// disable editing if no schema or non authorized
		// TODO: entire control to be deactivated (so that describe layers are not sent to the server)
		var disable = !this.schema || !this.target.isAuthorized(this.roles);
		if (this.splitButton) {
		    this.splitButton.setDisabled(disable);
		}
		this.createAction.setDisabled(disable);
		this.editAction.setDisabled(disable);
		
		/*
		// Activating or deactivating the getFeatureInfo controls based on the feature editor being enabled or disabled
		var controls = app.mapPanel.map.controls.filter(function(a){return a.CLASS_NAME=="OpenLayers.Control.WMSGetFeatureInfo";})
                for (var i = 0, len = controls.length; i < len; i++){
                    if (disable) {
                        controls[i].activate();
                    } else {
                        controls[i].deactivate();
                    }
                }
		*/
		
		return disable;
	};

    /** private: method[createOutputConfig]
     *  :returns: ``Object`` Configuration object for an Ext.tree.TreePanel
     */
 	// Reasons for override:
	// - configuration for expanded / collapsed initial display of layer groups (controlled by layer manager's group config)
	// - handling of checkbox changes to select/deselect the node with the same click
	
    gxp.plugins.LayerTree.prototype.createOutputConfig = function() {
        var treeRoot = new Ext.tree.TreeNode({
            text: this.rootNodeText,
            expanded: true,
            isTarget: false,
            allowDrop: false
        });
        
        var defaultGroup = this.defaultGroup,
            plugin = this,
            groupConfig,
            exclusive;
        for (var group in this.groups) {
            groupConfig = typeof this.groups[group] == "string" ?
                {title: this.groups[group]} : this.groups[group];
            exclusive = groupConfig.exclusive;
            treeRoot.appendChild(new GeoExt.tree.LayerContainer(Ext.apply({
                text: groupConfig.title,
                iconCls: "gxp-folder",
                // Extracting the expanded/collapsed state from groupConfig
                expanded: ("collapsed" in groupConfig?!groupConfig.collapsed:true),
                group: group == this.defaultGroup ? undefined : group,
                loader: new GeoExt.tree.LayerLoader({
                    baseAttrs: exclusive ?
                        {checkedGroup: Ext.isString(exclusive) ? exclusive : group} :
                        undefined,
                    store: this.target.mapPanel.layers,
                    filter: (function(group) {
                        return function(record) {
                            return (record.get("group") || defaultGroup) == group &&
                                record.getLayer().displayInLayerSwitcher == true;
                        };
                    })(group),
                    createNode: function(attr) {
                        plugin.configureLayerNode(this, attr);
                        return GeoExt.tree.LayerLoader.prototype.createNode.apply(this, arguments);
                    }
                }),
                singleClickExpand: true,
                allowDrag: false,
                listeners: {
                    append: function(tree, node) {
                        node.expand();
                    }
                }
            }, groupConfig)));
        }
        
        return {
            xtype: "treepanel",
            root: treeRoot,
            rootVisible: false,
            shortTitle: this.shortTitle,
            border: false,
            enableDD: true,
            selModel: new Ext.tree.DefaultSelectionModel({
                listeners: {
                    beforeselect: this.handleBeforeSelect,
                    scope: this
                }
            }),
            listeners: {
                contextmenu: this.handleTreeContextMenu,
                beforemovenode: this.handleBeforeMoveNode,   
                checkchange:function(n,c){
                	// If the node checkbox is clicked then we select the node
                	if (c)
                	{
                		n.select();
                	}
                	else 
                	// We deselect any selected nodes
                	{	
                		this.output[0].getSelectionModel().clearSelections();
                	}
                },
                scope: this
            },
            contextMenu: new Ext.menu.Menu({
                items: []
            })
        };
    };


    /** api: method[createStore]
     *
     *  Creates a store of layer records.  Fires "ready" when store is loaded.
     */

 	// Reasons for override:
	// - managing URL parameters that are arrays
	// - add a random parameter to burst the cache in IE (for users to see protected layers on page refresh after login in IE)

    gxp.plugins.WMSSource.prototype.createStore = function() {
        var baseParams = this.baseParams || {
            SERVICE: "WMS",
            REQUEST: "GetCapabilities"
        };

	// Adding random parameter to base params, wherever these base params are coming from        
        baseParams.EXTRA=Math.floor(Math.random()*1000);

        if (this.version) {
            baseParams.VERSION = this.version;
        }

        var lazy = this.isLazy();
        
        this.store = new GeoExt.data.WMSCapabilitiesStore({
            // Since we want our parameters (e.g. VERSION) to override any in the 
            // given URL, we need to remove corresponding paramters from the 
            // provided URL.  Simply setting baseParams on the store is also not
            // enough because Ext just tacks these parameters on to the URL - so
            // we get requests like ?Request=GetCapabilities&REQUEST=GetCapabilities
            // (assuming the user provides a URL with a Request parameter in it).

	    // Override consists of using the first URL of the array if there are several
            //url: this.trimUrl(this.url, baseParams),
            url: this.trimUrl((typeof this.url=="object"?this.url[0]:this.url), baseParams),
            
            baseParams: baseParams,
            format: this.format,
            autoLoad: !lazy,
            layerParams: {exceptions: null},
            listeners: {
                load: function() {
                    // The load event is fired even if a bogus capabilities doc 
                    // is read (http://trac.geoext.org/ticket/295).
                    // Until this changes, we duck type a bad capabilities 
                    // object and fire failure if found.
                    if (!this.store.reader.raw || !this.store.reader.raw.service) {
                        this.fireEvent("failure", this, "Invalid capabilities document.");
                    } else {
                        if (!this.title) {
                            this.title = this.store.reader.raw.service.title;                        
                        }
                        if (!this.ready) {
                            this.ready = true;
                            this.fireEvent("ready", this);
                        } else {
                            this.lazy = false;
                            //TODO Here we could update all records from this
                            // source on the map that were added when the
                            // source was lazy.
                        }
                    }
                    // clean up data stored on format after parsing is complete
                    delete this.format.data;
                },
                exception: function(proxy, type, action, options, response, error) {
                    delete this.store;
                    var msg, details = "";
                    if (type === "response") {
                        if (typeof error == "string") {
                            msg = error;
                        } else {
                            msg = "Invalid response from server.";
                            // special error handling in IE
                            var data = this.format && this.format.data;
                            if (data && data.parseError) {
                                msg += "  " + data.parseError.reason + " - line: " + data.parseError.line;
                            }
                            var status = response.status;
                            if (status >= 200 && status < 300) {
                                // TODO: consider pushing this into GeoExt
                                var report = error && error.arg && error.arg.exceptionReport;
                                details = gxp.util.getOGCExceptionText(report);
                            } else {
                                details = "Status: " + status;
                            }
                        }
                    } else {
                        msg = "Trouble creating layer store from response.";
                        details = "Unable to handle response.";
                    }
                    // TODO: decide on signature for failure listeners
                    this.fireEvent("failure", this, msg, details);
                    // clean up data stored on format after parsing is complete
                    delete this.format.data;
                },
                scope: this
            }
        });
        if (lazy) {
            this.lazy = true;
            // ping server of lazy source with an incomplete request, to see if it is available
            
            Ext.Ajax.request({
                method: "GET",
                url: this.url,
                params: {SERVICE: "WMS"},
                callback: function(options, success, response) {
                    var status = response.status;
                    // responseText should not be empty (OGCException)
                    if (status >= 200 && status < 403 && response.responseText) {
                        this.ready = true;
                        this.fireEvent("ready", this);
                    } else {
                        this.fireEvent("failure", this,
                            "Layer source not available.",
                            "Unable to contact WMS service."
                        );
                    }
                },
                scope: this
            });
        }
    };

    /** api: method[createLayerRecord]
     *  :arg config:  ``Object``  The application config for this layer.
     *  :returns: ``GeoExt.data.LayerRecord`` or null when the source is lazy.
     *
     *  Create a layer record given the config. Applications should check that
     *  the source is not :obj:`lazy`` or that the ``config`` is complete (i.e.
     *  configured with all fields listed in :obj:`requiredProperties` before
     *  using this method. Otherwise, it is recommended to use the asynchronous
     *  :meth:`gxp.Viewer.createLayerRecord` method on the target viewer
     *  instead, which will load the source's store to complete the
     *  configuration if necessary.
     */
     
 	// Reasons for override:
	// - transition effect on single tiled layer should be null  
	// - URL of a layer should be an array, not the first one created via the layer store
	// - managing store-wide parameters (especially for layers added behind + button)

	    gxp.plugins.WMSSource.prototype.createLayerRecord = function(config) {
		var record, original;
		var index = this.store.findExact("name", config.name);
		if (index > -1) {
		    original = this.store.getAt(index);
		} else if (Ext.isObject(config.capability)) {
		    original = this.store.reader.readRecords({capability: {
			request: {getmap: {href: this.url}},
			layers: [config.capability]}
		    }).records[0];
		} else if (this.layerConfigComplete(config)) {
		    original = this.createLazyLayerRecord(config);
		}
		if (original) {

		    var layer = original.getLayer().clone();

		    // Overriding the URL parameter of the GetMap to the one from the source
		    layer.url = this.url;

		    /**
		     * TODO: The WMSCapabilitiesReader should allow for creation
		     * of layers in different SRS.
		     */
		    var projection = this.getMapProjection();

		    // If the layer is not available in the map projection, find a
		    // compatible projection that equals the map projection. This helps
		    // us in dealing with the different EPSG codes for web mercator.
		    var layerProjection = this.getProjection(original);

		    var projCode = (layerProjection || projection).getCode(),
			bbox = original.get("bbox"), maxExtent;
		    if (bbox && bbox[projCode]){
			layer.addOptions({projection: layerProjection});
			maxExtent = OpenLayers.Bounds.fromArray(bbox[projCode].bbox, layer.reverseAxisOrder());
		    } else {
			var llbbox = original.get("llbbox");
			if (llbbox) {
			    var extent = OpenLayers.Bounds.fromArray(llbbox).transform("EPSG:4326", projection);
			    // make sure maxExtent is valid (transform does not succeed for all llbbox)
			    if ((1 / extent.getHeight() > 0) && (1 / extent.getWidth() > 0)) {
				// maxExtent has infinite or non-numeric width or height
				// in this case, the map maxExtent must be specified in the config
				maxExtent = extent;
			    }
			}
		    }

			// Apply store-wide config if none present in the layer config - format, group, tiling and transitionEffect
			if (config && JSONconf.sources[config.source])
			{
				if (!('format' in config))
				{
					if ('defaultType' in JSONconf.sources[config.source])
					{
						config.format=JSONconf.sources[config.source].defaultType;
					}
				}
				if (!('group' in config))
				{
					if ('group' in JSONconf.sources[config.source])
					{
						config.group=JSONconf.sources[config.source].group;
					}
				}
				if (!('tiled' in config))
				{
					if ('tiled' in JSONconf.sources[config.source])
					{
						config.tiled=JSONconf.sources[config.source].tiled;
					}
				}
				if (!('transition' in config))
				{
					if ('transition' in JSONconf.sources[config.source])
					{
						config.transition=JSONconf.sources[config.source].transition;
					}
				}
			}

		    // update params from config
		    layer.mergeNewParams({
			STYLES: config.styles,
			FORMAT: config.format,
			TRANSPARENT: config.transparent,
			CQL_FILTER: config.cql_filter
		    });

		    var singleTile = false;
		    if ("tiled" in config) {
			singleTile = !config.tiled;
		    } else {
			// for now, if layer has a time dimension, use single tile
			if (original.data.dimensions && original.data.dimensions.time) {
			    singleTile = true;
			}
		    }

		    layer.setName(config.title || layer.name);
		    layer.addOptions({
			attribution: layer.attribution,
			maxExtent: maxExtent,
			restrictedExtent: maxExtent,
			singleTile: singleTile,
			ratio: config.ratio || 1,
			visibility: ("visibility" in config) ? config.visibility : true,
			opacity: ("opacity" in config) ? config.opacity : 1,
			buffer: ("buffer" in config) ? config.buffer : 1,
			dimensions: original.data.dimensions,
			transitionEffect: ("transition" in config) ? config.transition : null,
//			transitionEffect: singleTile ? null : 'resize',
			minScale: config.minscale,
			maxScale: config.maxscale
		    });

		    // data for the new record
		    var data = Ext.applyIf({
			title: layer.name,
			group: config.group,
			infoFormat: config.infoFormat,
			source: config.source,
			properties: "gxp_wmslayerpanel",
			fixed: config.fixed,
			selected: "selected" in config ? config.selected : false,
			restUrl: this.restUrl,
			layer: layer
		    }, original.data);

			// Overwriting the queryable attribute if present in config
			if ('queryable' in config)
			{
				data.queryable = config.queryable;
			}

		    // add additional fields
		    var fields = [
			{name: "source", type: "string"}, 
			{name: "group", type: "string"},
			{name: "properties", type: "string"},
			{name: "fixed", type: "boolean"},
			{name: "selected", type: "boolean"},
			{name: "restUrl", type: "string"},
			{name: "infoFormat", type: "string"}
		    ];
		    original.fields.each(function(field) {
			fields.push(field);
		    });

		    var Record = GeoExt.data.LayerRecord.create(fields);
		    record = new Record(data, layer.id);
		    record.json = config;

		} else {
		    if (window.console && this.store.getCount() > 0) {
			console.warn("Could not create layer record for layer '" + config.name + "'. Check if the layer is found in the WMS GetCapabilities response.");
		    }
		}
		return record;
	    };

	/** api: constructor
	 *  .. class:: WMSLayerPanel(config)
	 *   
	 *      Create a dialog for setting WMS layer properties like title, abstract,
	 *      opacity, transparency and image format.
	 */

 	// Reasons for override:
	// - managing URL parameters that are arrays  
	// -> this entire override could be replaced by a better management of restUrl (but it could disappear in future versions, so risky)

	gxp.WMSLayerPanel.prototype.initComponent = function() {
		this.cqlFormat = new OpenLayers.Format.CQL();
		if (this.source) {
			this.source.getSchema(this.layerRecord, function(attributeStore) {
				if (attributeStore !== false) {
					var filter = this.layerRecord.getLayer().params.CQL_FILTER;
					this.filterBuilder = new gxp.FilterBuilder({
						filter: filter && this.cqlFormat.read(filter),
						allowGroups: false,
						listeners: {
							afterrender: function() {
								this.filterBuilder.cascade(function(item) {
									if (item.getXType() === "toolbar") {
										item.addText(this.cqlPrefixText);
										item.addButton({
											text: this.cqlText,
											handler: this.switchToCQL,
											scope: this
										});
									}
								}, this);
							},
							change: function(builder) {
								var filter = builder.getFilter();
								var cql = null;
								if (filter !== false) {
									cql = this.cqlFormat.write(filter);
								}
								this.layerRecord.getLayer().mergeNewParams({
									CQL_FILTER: cql
								});
							},
							scope: this
						},
						attributes: attributeStore
					});
					this.filterFieldset.add(this.filterBuilder);
					this.filterFieldset.doLayout();
				}
			}, this);
		}
		this.addEvents(
			/** api: event[change]
			*  Fires when the ``layerRecord`` is changed using this dialog.
			*/
			"change"
		);
		this.items = [
			this.createAboutPanel(),
			this.createDisplayPanel()
		];

		// only add the Styles panel if we know for sure that we have styles
		if (this.styling && gxp.WMSStylesDialog && this.layerRecord.get("styles")) {
			// TODO: revisit this
			var url = this.layerRecord.get("restUrl");
			if (!url) {
				url = (this.source || this.layerRecord.get("layer")).url;
				if (typeof url == "object")
				{
					url = url[0];
				}
				url = url.split("?").shift().replace(/\/(wms|ows)\/?$/, "/rest");
			}
			if (this.sameOriginStyling) {
				// this could be made more robust
				// for now, only style for sources with relative url
				this.editableStyles = url.charAt(0) === "/";
			} else {
				this.editableStyles = true;
			}
			this.items.push(this.createStylesPanel(url));
		}

		gxp.WMSLayerPanel.superclass.initComponent.call(this);
	};

/** api: constructor
 *  .. class:: WMSGetFeatureInfo(config)
 *
 *    This plugins provides an action which, when active, will issue a
 *    GetFeatureInfo request to the WMS of all layers on the map. The output
 *    will be displayed in a popup.
 */   
 	// Reasons for override:
 	// - custom selection of objects to return
 	// - custom content (JSON in HTML)
	// - custom interaction with the right hand panel
	// - managing array of URLs
	// - activating the control by default and masking its icon


    gxp.plugins.WMSGetFeatureInfo.prototype.addActions = function() {
        this.popupCache = {};
        
        var actions = gxp.plugins.WMSGetFeatureInfo.superclass.addActions.call(this, [{
//            tooltip: this.infoActionTip,
//            iconCls: "gxp-icon-getfeatureinfo",
            buttonText: this.buttonText,
            toggleGroup: this.toggleGroup,
	    // The info button does not need to be clickable
	    disabled: true,            
            enableToggle: true,
            allowDepress: true,
            toggleHandler: function(button, pressed) {
                for (var i = 0, len = info.controls.length; i < len; i++){
                    if (pressed) {
                        info.controls[i].activate();
                    } else {
                        info.controls[i].deactivate();
                    }
                }
             }
        }]);
        var infoButton = this.actions[0].items[0];

        var info = {controls: []};
        var updateInfo = function() {
            var queryableLayers = this.target.mapPanel.layers.queryBy(function(x){
                //return x.get("queryable");
		return x.get("queryable") && x.get("layer").visibility && (x.get("group") != "background") 
            });

            // Keeping track of the number of objects to be returned
            var layerMax=queryableLayers.length;
            // ID within the combostore must be unique, so we use a counter
            var id_ct=0;
            // Count the number of features within a layer
            var layerCounter = 0;
			
            var map = this.target.mapPanel.map;
            var control;
            for (var i = 0, len = info.controls.length; i < len; i++){
                control = info.controls[i];
                control.deactivate();  // TODO: remove when http://trac.openlayers.org/ticket/2130 is closed
                control.destroy();
            }

            info.controls = [];
            
            queryableLayers.each(function(x){
                var layer = x.getLayer();
                var vendorParams = Ext.apply({}, this.vendorParams), param;
                if (this.layerParams) {
                    for (var i=this.layerParams.length-1; i>=0; --i) {
                        param = this.layerParams[i].toUpperCase();
                        vendorParams[param] = layer.params[param];
                    }
                }
                var infoFormat = x.get("infoFormat");
                if (infoFormat === undefined) {
                    // TODO: check if chosen format exists in infoFormats array
                    // TODO: this will not work for WMS 1.3 (text/xml instead for GML)
                    //infoFormat = this.format == "html" ? "text/html" : "application/vnd.ogc.gml";
                    infoFormat = "text/html";
                }
                var control = new OpenLayers.Control.WMSGetFeatureInfo(Ext.applyIf({
                    // Managing array of URLs
                    url: (typeof layer.url == "object" ? layer.url[0] : layer.url),
                    queryVisible: true,
                    radius: 64,
                    layers: [layer],
                    infoFormat: infoFormat,
                    vendorParams: vendorParams,
                    eventListeners: {
                        getfeatureinfo: function(evt) {
				layerCounter = layerCounter+1;
				var idx=0;
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
						// Attempt to format it nicely (removing the parenthesis content)
						var simpleTitle=x.data.title.match(/(.*) ?\(.*\)/);
						if (simpleTitle) {typ=trim(simpleTitle[1]);}
						// All the attributes are contained in a serialised JSON object
						var cont=res.rows[i].row;

						// Layer name (without namespace), to enable additional accordion panels
						var lay=x.data.layer.params.LAYERS.split(":")[1];
						// Catering for layer groups (they don't have a workspace name as a prefix)
						if (!lay)
						{
							lay=x.data.layer.params.LAYERS;
						}

						// Label									
						var lab='';
						var fti_arr = gtLayerPresentationConfiguration[lay];
						// We select the right attribute as the label
						if (fti_arr)
						{
							// If the layer presentation is configured, we select the first configured field value
							lab = cont[fti_arr[0].attr_name];
						}
						else
						{
							for (l in cont)
							{						
								// If not, we select the first field that comes along (provided it's not a geometry and it's value is non null)
								if (l!="the_geom" && l!="SHAPE" && l!="projection")
								{
									var lab=cont[l];
									if (lab) 
									{
										break;
									}
								}
							}							
						}
						// If too long for the drop down, we truncate the string to the space remaining after "<LAYER NAME>:"
						var num_char_in_drop_down = 38;
						if (lab.length>num_char_in_drop_down-typ.length)
						{
							
							lab = lab.substring(0,num_char_in_drop_down-typ.length-2)+"..";
						}

						// Building a row and pushing it to an array																		
						row_array = new Array(id_ct,typ,cont,idx,lab,lay); 

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
						gComboDataArray.sort(function(a,b){return b[3]-a[3]});
						gfromWFS="N";
						gCombostore.loadData(gComboDataArray);
						
						// Features found during the getFeatureInfo: showing the tab
						if (!(gtHideSelectedFeaturePanel))
						{
							northPart.setHeight(60);
							Ext.getCmp('gtInfoCombobox').setVisible(true);
							// Collapsing the drop-down
							Ext.getCmp('gtInfoCombobox').collapse();
						}
						eastPanel.expand();
					}

					gComboDataArray=[];
					layerCounter=0;
				}
			},
			scope: this
			}
		}, this.controlOptions));
		map.addControl(control);
		info.controls.push(control);
		// Activating the info control by default
		//if(infoButton.pressed) {
			control.activate();
		//}
		}, this);
	};

	this.target.mapPanel.layers.on("update", updateInfo, this);
	this.target.mapPanel.layers.on("add", updateInfo, this);
	this.target.mapPanel.layers.on("remove", updateInfo, this);
	
	return actions;
	};

	// Extraction of parameters from the URL to load the correct configuration file, and an optional property number to focus on
	function getURLParameter(name) {	
		return decodeURI(	
			(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,''])[1]	
		);
	}

	// Extracting parameters values: config and property
	var configScript = getURLParameter('config');
	var propnum = getURLParameter('property');

	// If the URL does not offer itself to splitting according to the rules above, it means, we are having Apache clean URL: http://www.pozi.com/mitchell/property/45633
	// We extract the information according to this pattern
	if (!(configScript))
	{
		// We extract the end of the URL
		// This will no longer work when we consider saved maps
		var urlquery=location.href.split("/");
		if (urlquery[urlquery.length-2])
		{
			if (urlquery[urlquery.length-2]=="property")
			{
				configScript = urlquery[urlquery.length-3];
				propnum = urlquery[urlquery.length-1];
			}
			else
			{
				configScript = urlquery[urlquery.length-1];
			}
		}
	}	

	// Function to execute on successful return of the JSON configuration file loading
	var onConfigurationLoaded = function() {

		// Customising the scale combo visibility
		gxp.ScaleOverlay.prototype.bind = function(map) {
			this.map = map;
			this.addScaleLine();
			// Hiding the scale combo
			if ('hideScaleCombo' in JSONconf)
			{
				if (!(JSONconf.hideScaleCombo))
				{
					this.addScaleCombo();
				}
			}
			else
			{
				this.addScaleCombo();
			}
			this.doLayout();
		}		



		// Based on the previous JSON configuration, we may decide to dynamically load an additional Javascript file of interaction customisations

		// Function that is able to dynamically load the extra Javascript
		var loadjscssfile = function(filename, cbk){
			var fileref = document.createElement('script');
			fileref.setAttribute("type",'text/javascript');

			// The onload callback option does not work as expected in IE so we are using the following work-around
			// From: http://www.nczonline.net/blog/2009/07/28/the-best-way-to-load-external-javascript/
			if (fileref.readyState){  
				//IE
				fileref.onreadystatechange = function(){
					if (fileref.readyState == "loaded" || fileref.readyState == "complete"){
						fileref.onreadystatechange = null;
						cbk();
					}
				};
			} else {  
				//Others
				fileref.onload = function(){
					cbk();
				};
			}
			fileref.setAttribute("src", filename);
			document.getElementsByTagName('head')[0].appendChild(fileref);
		};

		// Encapsulating the loading of the main app in a callback  
		var extraJSScriptLoaded = function(){
			// Fixing local URL source for debug mode
			if (JSONconf.sources.local)
			{
				JSONconf.sources.local.url = gtLocalLayerSourcePrefix + JSONconf.sources.local.url;
			}
			
			// Global variables all clients
			var gtEmptyTextSearch = 'Find address, road, feature, etc...';
			var gtLoadingText = 'Searching...';
			var gtLoadingText = "Loading ...";
			var gtDetailsTitle = "Details";
			var gtClearButton = "Clear";
			var gtEmptyTextSelectFeature = "Selected feature ...";
			var gtEmptyTextQuickZoom = "Zoom to town ...";
			
			// Client-specific overridable variables
			var gtServicesHost = "http://49.156.17.41";		
			if (JSONconf.servicesHost) {gtServicesHost = JSONconf.servicesHost;};
			// Not sure it would make sense to override the WFS endpoint
			var gtWFSEndPoint = gtServicesHost + "/geoserver/wfs";
			
			var gtSearchComboEndPoint = gtServicesHost + "/ws/rest/v3/ws_all_features_by_string_and_lga.php";
			if (JSONconf.searchEndPoint) {gtSearchComboEndPoint = gtServicesHost + JSONconf.searchEndPoint;};

			var gtLGACode = "346";
			if (JSONconf.LGACode) {gtLGACode = JSONconf.LGACode;};

			var gtDatabaseConfig = "vicmap";
			if (JSONconf.databaseConfig) {gtDatabaseConfig = JSONconf.databaseConfig;};

			var gtWorkspace = "";
			if (JSONconf.workspace) {gtWorkspace = JSONconf.workspace;};		
			
			var gtSymbolizer = {"name": "test","strokeColor": "yellow","strokeWidth": 15,"strokeOpacity": 0.5,"fillColor": "yellow","fillOpacity": 0.2};
			if(JSONconf.highlightSymboliser) {gtSymbolizer = JSONconf.highlightSymboliser;};

			var gtGetLiveDataEndPoints = JSONconf.liveDataEndPoints;

			var gtLogoClientSrc = "http://www.pozi.com/theme/app/img/mitchell_banner.jpg";
			if (JSONconf.logoClientSrc) {gtLogoClientSrc = JSONconf.logoClientSrc;};
			
			var gtLogoClientWidth=238;
			if (JSONconf.logoClientWidth) {gtLogoClientWidth = JSONconf.logoClientWidth;};

			gtZoomMax = 18;
			if (JSONconf.zoomMax) {gtZoomMax = JSONconf.zoomMax;};

			var gtBannerLineColor="#A0A0A0";
			if (JSONconf.bannerLineColor) {gtBannerLineColor = JSONconf.bannerLineColor;};

			var gtBannerRightCornerLine1="Mitchell Shire Council";
			if (JSONconf.bannerRightCornerLine1) {gtBannerRightCornerLine1 = JSONconf.bannerRightCornerLine1;};

			var gtBannerRightCornerLine2="Victoria, Australia";
			if (JSONconf.bannerRightCornerLine2) {gtBannerRightCornerLine2 = JSONconf.bannerRightCornerLine2;};
	
			var gtPrintMapTitle="";
			if (JSONconf.printMapTitle) {gtPrintMapTitle=JSONconf.printMapTitle;};

			var gtLinkToCouncilWebsite="http://www.mitchellshire.vic.gov.au/";
			if (JSONconf.linkToCouncilWebsite) {gtLinkToCouncilWebsite = JSONconf.linkToCouncilWebsite;};
			
			var gtQuickZoomDatastore=[];
			if (JSONconf.quickZoomDatastore) {gtQuickZoomDatastore = JSONconf.quickZoomDatastore;};

			var gtCollapseWestPanel = false;
			if ('collapseWestPanel' in JSONconf) {gtCollapseWestPanel=JSONconf.collapseWestPanel;};

			var gtHideNorthRegion = false;
			if ('hideNorthRegion' in JSONconf) {gtHideNorthRegion=JSONconf.hideNorthRegion;};
			
			gtHideSelectedFeaturePanel = false;
			if ('hideSelectedFeaturePanel' in JSONconf) {gtHideSelectedFeaturePanel=JSONconf.hideSelectedFeaturePanel;};

			var gtEastPanelCollapsed = false;
			if ('eastPanelCollapsed' in JSONconf) {gtEastPanelCollapsed=JSONconf.eastPanelCollapsed;};

			var gtInfoTitle = "Info";
			if ('infoTitle' in JSONconf) {gtInfoTitle = JSONconf.infoTitle;};
			
			var gtHideLayerPanelButton = false;
			if ('hideLayerPanelButton' in JSONconf) {gtHideLayerPanelButton = JSONconf.hideLayerPanelButton;};

			var gtMapContexts = [{"name":"Property Map","size":120}];
			if ('mapContexts' in JSONconf) {gtMapContexts = JSONconf.mapContexts;};
			// Transforming the map contexts variable into the right format
			if (gtMapContexts.length==0)
			{
				gtMapContexts = "&nbsp;";
				gtMapContextsSize = 0;
			}
			else
			{
				if (gtMapContexts.length==1)
				{
					gtMapContextsSize = gtMapContexts[0].size;
					gtMapContexts = gtMapContexts[0].name;
				}
				else
				{
					// TODO: format the contexts into a drop down loading different layers
				}
			}

			// This structure deals with fields to show, in which order and with which name
			gtLayerPresentationConfiguration =
			{
				"VICMAP_PROPERTY_ADDRESS":
					[
						{"attr_name":"ezi_add","alt_name":"Address"},
						{"attr_name":"pr_propnum","alt_name":"Property Number"},
						{"attr_name":"locality"},
						{"attr_name":"postcode"},
						{"attr_name":"lga_code","alt_name":"LGA"},
						{"attr_name":"pr_multass","alt_name":"Multi Assessment"},
						{"attr_name":"pfi","alt_name":"PFI"}
					]
			};
			// Augment this structure with the client-specific JSON configuration
			if (JSONconf.layerPresentation) {
				for (l in JSONconf.layerPresentation)
				{
					gtLayerPresentationConfiguration[l]=JSONconf.layerPresentation[l];
				}
			};

			var gtReloadOnLogin = false;
			if ('reloadOnLogin' in JSONconf) {gtReloadOnLogin = JSONconf.reloadOnLogin;};

			var gtOpenFirstDefaultTab = false;
			if ('openFirstDefaultTab' in JSONconf) {gtOpenFirstDefaultTab = JSONconf.openFirstDefaultTab;};

			poziLinkClickHandler = function () {
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
					height: 320,
					items: [
						tabs]
					});
				win.show();
			};	

			var gtInitialDisclaimerFlag=true;
			var gtDisclaimer="disclaimer.html";
			var gtRedirectIfDeclined="http://www.mitchellshire.vic.gov.au/";

			// Layout for the extra tabs
			gLayoutsArr = [];

			// Flag to track the origin of the store refresh
			var gfromWFS="N";

			// WFS layer: style , definition , namespaces
			var gtStyleMap = new OpenLayers.StyleMap();
			var rule_for_all = new OpenLayers.Rule({
				symbolizer: gtSymbolizer, elseFilter: true
			});
			rule_for_all.title=" ";
			gtStyleMap.styles["default"].addRules([rule_for_all]);
			var gtWFSsrsName = "EPSG:4326";
			var gtWFSgeometryName = "the_geom";
			var gtFeatureNS="http://www.pozi.com/vicmap";

			// Pushing the WFS layer in the layer store
			JSONconf.layers.push({
				source: "ol",
				visibility: true,
				type: "OpenLayers.Layer.Vector",
				group: "top",
				args: [
					"Selection", {
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
					}
				]
			});		

			// Store behind the info drop-down list
			gCombostore = new Ext.data.ArrayStore({
			    //autoDestroy: true,
			    storeId: 'myStore',
			    idIndex: 0,  
			    fields: [
			       'id',
			       'type',
			       'content',
			       'index',
			       'label',
			       'layer',
			       {
					name : 'labelx',
					convert : function(v, rec) {          
						return toSmartTitleCase(rec[4]);
					}
				}
			    ],
			    listeners: {
				    load: function(ds,records,o) {
					var cb = Ext.getCmp('gtInfoCombobox');
					var rec = records[0];
					if (records.length>1)
					{
						// Multiple records, color of the combo background is different
						cb.removeClass("x-form-single");
						cb.addClass("x-form-multi");
					}
					else
					{
						// Restoring the color to a normal white
						cb.removeClass("x-form-multi");
						cb.addClass("x-form-single");
						
						// Collapsing the drop down
						cb.collapse();
					}
					cb.setValue(rec.data.labelx);
					cb.fireEvent('select',cb,rec);
					},
				    scope: this
				}
			});

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
				proxy: new Ext.data.ScriptTagProxy({
					url: gtSearchComboEndPoint
				})
			});

			// Adding the default tabs
			add_default_tabs = function(){
				// Clearing the details from the panel
				accordion.removeAll();

				// Layout configuration the global variable array loaded at application start										
				var configArray = gLayoutsArr["NONE"];
				if (configArray)
				{
					// Here we should do the styling substitution to transform a config option into a proper style element
					for (c in configArray)
					{
						if (configArray.hasOwnProperty(c))
						{
							if (!(configArray[c].headerCfg))
							{	
								var t = configArray[c].title;
								// headerCfg would not work if the title was part of the initial config
								delete configArray[c].title;

								var col = configArray[c].col;
								
								if (!(col))
								{
									col = "#A0A0A0";
								}
								
								configArray[c].headerCfg={
									tag: 'div',
									style:'	background-image: url();background-color: '+col+';padding-left: 10px;',
									children: [
									    { tag: 'div', 'html': t }
									]
								};
							}
						}
					}

					// And initialisation of the accordion items
					accordion.add(configArray);

				}			

				// Refreshing the DOM with the newly added parts
				accordion.doLayout();

				// Expanding the first tab if configured to do so
				if (gtOpenFirstDefaultTab)
				{
					accordion.items.items[0].expand();
				}
			};

			// Remove the WFS highlight, clear and disable the select feature combo, empty the combostore and clean the details panel 
			clear_highlight = function(){ 
				// Removing the highlight by clearing the selected features in the WFS layer
				glayerLocSel.removeAllFeatures();
				glayerLocSel.redraw();
				// Clearing combo
				var cb = Ext.getCmp('gtInfoCombobox');
				cb.collapse();
				cb.clearValue();
				cb.disable();
				cb.removeClass("x-form-multi");
				cb.addClass("x-form-single");
				
				// Removing all values from the combo
				gCombostore.removeAll();
				
				// Add default tabs
				add_default_tabs()
				
				// Hiding the north part of the east panel
				northPart.setHeight(30);
				cb.setVisible(false);
				
				// Clearing the feature type
				Ext.get('gtInfoTypeLabel').dom.innerHTML="&nbsp;";
				
			};

			// Handler called when:
			// - a record is selected in the search drop down list
			// - a property number is passed in the URL and has returned a valid property record
			var search_record_select_handler = function (combo,record){
				// Zooming to the relevant area (covering the selected record)
				var bd = new OpenLayers.Bounds(record.data.xmini,record.data.ymini,record.data.xmaxi,record.data.ymaxi).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
				var z = app.mapPanel.map.getZoomForExtent(bd);

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
				
				//
				if (!(gtHideSelectedFeaturePanel))
				{
					northPart.setHeight(60);
					Ext.getCmp('gtInfoCombobox').setVisible(true);
					// Collapsing the drop-down
					Ext.getCmp('gtInfoCombobox').collapse();
				}
				eastPanel.expand();
				

			};

			// Panels and portals
			westPanel = new Ext.Panel({
				id:"westpanel",
				border: false,
				layout: "anchor",
				region: "west",
				width: 250,
				split: true,
				border: true,
				collapsible: true,
				collapseMode: "mini",
				collapsed: gtCollapseWestPanel,
				hideCollapseTool: true,
				autoScroll:true,
				// Only padding on the right as all other sides covered by the parent container
				style:"padding: 0px 10px 0px 0px; background-color:white;",
				headerCfg: {
					// Required to have the footer display
					html: '<p style="font-size:16px;font-family: tahoma,arial,verdana,sans-serif;">Layers</p>',
					bodyStyle: " background-color: white; "
				},
				headerStyle:'background-color:'+gtBannerLineColor+';border:0px; margin:0px 0px 0px; padding: 5px 8px;',
				items: [{
					region: 'center',
					border: false,
					id: 'tree'
				}]
			});

			var tabCollapse = function(p){
				// Current layer (cl) as per content of the current type (ct) and current drop down (cb)
				var ct = gtLayerLabel; // that contains the type of the currently selected feature
				var cb = Ext.getCmp('gtInfoCombobox'); // the Ext JS component containing the combo - used to link type to layer name

				var cl;				
				// If the item can be found, then we extract the layer name
				if (cb.getStore().data.items[cb.getStore().find("type",ct)])
				{
					cl = cb.getStore().data.items[cb.getStore().find("type",ct)].data.layer;  					
				}
				else 
				// There is no item in the drop down and the current layer is "NONE"
				{
					cl="NONE";				
				}
				
				if (gCurrentExpandedTabIdx[cl] != 0)
				{
					var configArray = gLayoutsArr[cl];

					if (configArray)
					{
						// This only performs the query corresponding to the currently open tab
						for (var i=gCurrentExpandedTabIdx[cl]-1; i< gCurrentExpandedTabIdx[cl]; i++)
						{
							// Triggering the tab-wide actions
							if (configArray[i].onTabClose)
							{
								// Avoiding the use of the 'eval' function
								var fn = window[configArray[i].onTabClose];
								if (typeof fn === 'function') {
									// Context passed: the id of the clicked feature
									fn();
								}
							}
						}
					}
				}				
			};

			var tabExpand = function(p){
				// Current layer (cl) as per content of the current type (ct) and current drop down (cb)
				var ct = gtLayerLabel; // that contains the type of the currently selected feature
				var cb = Ext.getCmp('gtInfoCombobox'); // the Ext JS component containing the combo - used to link type to layer name

				var cl;				
				// If the item can be found, then we extract the layer name
				if (cb.getStore().data.items[cb.getStore().find("type",ct)])
				{
					cl = cb.getStore().data.items[cb.getStore().find("type",ct)].data.layer;  					
				}
				else 
				// There is no item in the drop down so the current layer is "NONE"
				{
					cl="NONE";				
				}

				// Updating the index of the currently opened tab
				for(k in p.ownerCt.items.items)
				{	
					if (p.ownerCt.items.items[k].id==p.id)
					{
						// Layer name of the currently selected item in the combo
						gCurrentExpandedTabIdx[cl] = k;
						break;
					}
				}	
				
				// Fix for the NONE layer so that the index is not 0 and the loop just below is entered
				if (cl=="NONE")
				{
					gCurrentExpandedTabIdx[cl]++;
				}
				
				// Sending in the query to populate this specific tab (tab on demand)
				if (gCurrentExpandedTabIdx[cl] != 0)
				{
					var configArray = gLayoutsArr[cl];
					if (configArray)
					{
						// This only performs the query corresponding to the currently open tab
						for (var i=gCurrentExpandedTabIdx[cl]-1; i< gCurrentExpandedTabIdx[cl]; i++)
						{
							var g=0;

							// Adding a loading indicator for user feedback		
							var targ2 = Ext.getCmp(configArray[i].id);
							targ2.removeAll();

							// Rendering as a table
							var win2 = new Ext.Panel({
								id:'tblayout-win-loading'
								,layout:'hbox'
								,layoutConfig: {
									padding:'5',
									pack:'center',
									align:'middle'
								}
								,border:false
								,defaults:{height:26}
								,items: [
									{html:'<img src="http://www.pozi.com/externals/ext/resources/images/default/grid/loading.gif"/>',border:false,padding:'5'}
								]
							});
							targ2.add(win2);
							targ2.doLayout();

							// Finding the unique ID of the selected record, to pass to the live query
							var selectedRecordIndex = cb.selectedIndex;	
							if ((selectedRecordIndex==-1) || (selectedRecordIndex>=cb.store.data.items.length))
							{
								selectedRecordIndex=0;
							}
							
							// Property to pass to the queries
							var idFeature, idEpsg;

							// Special case when requesting the geometry
							if (configArray[i].idName=="the_geom")
							{
								// 2 scenarios
								if (cb.store.data.items[selectedRecordIndex].data.content.the_geom_WFS)
								{
									// Comes from a WFS call (search)
									idFeature=cb.store.data.items[selectedRecordIndex].data.content.the_geom_WFS.geometry.toString();
									idEpsg = "900913";
									
								}
								else
								{
									// Comes from a getFeatureInfo click
									idFeature=cb.store.data.items[selectedRecordIndex].data.content.the_geom;
									idEpsg = "4326";
								}
								idFeature="'"+idFeature+"',"+idEpsg;
							}
							else
							{
								if (cl != "NONE")
								{
									// Using the name configured
									idFeature = cb.store.data.items[selectedRecordIndex].data.content[configArray[i].idName];
								}
							}
							
							// Triggering the tab-wide actions
							if (configArray[i].onTabOpen)
							{
								// Avoiding the use of the 'eval' function
								var fn = window[configArray[i].onTabOpen];
								if (typeof fn === 'function') {
									// Context passed: the id of the clicked feature
									fn(idFeature);
								}
							}

							if (configArray[i].id.substring(0,1)!='X')
							{
								// Live query using the script tag
								var ds = new Ext.data.Store({
									autoLoad:true,
									// Script tag proxy uses a GET method (can not be overriden to a POST)
									// Source: http://www.sencha.com/forum/showthread.php?15916-ScriptTagProxy-with-POST-method-in-grid-with-paging
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
										// Passing the LGA code, so that the query can be narrowed down (used for planning tab schedules links)
										lga: gtLGACode
									},
									listeners:
									{
										load: function(store, recs)
										{
											// Looping thru the records returned by the query
											tab_array = new Array();
											var geom_array = new Array();
											for (m = 0 ; m < recs.length; m++)
											{
												res_data = recs[m].json.row;
												var has_gsv = false;	
												var src_attr_array = new Array();
												var first_element="";

												for (j in res_data)
												{
													if (j!="target" && j!="tabaction" && j!="the_geom")
													{
														var val=res_data[j];

														if (j.search(/^gsv/)>-1)
														{
															// Not showing the cells - technical properties for Google Street View
															has_gsv = true;
														}
														else
														{	
															// Building the source array for a property grid
															src_attr_array[toTitleCase(trim(j.replace(/_/g," ")))]=trim(val);
															
															// Setting the title of the horizontal panel - first non-null value encountered
															if (first_element.length==0)
															{
																if (trim(val).length>14)
																{
																	first_element=trim(val).substring(0,12)+'..';
																}
																else
																{
																	first_element=trim(val);
																}
															}
														}
													}
												}

												// Getting all geometries in an associative array
												// so that we're able to pass the right parameter to the subtab activate function
												// Note: the geometry name is necessarily "the_geom"
												for (j in res_data)
												{
													if (j=="the_geom"){
														geom_array[first_element] = res_data[j];
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
														var size_thumb = 335;
														var gsvthumb = "http://maps.googleapis.com/maps/api/streetview?location="+gsv_lat+","+gsv_lon+"&fov=90&heading="+gsv_head+"&pitch=-10&sensor=false&size="+size_thumb+"x"+size_thumb;
														var gsvlink = "http://maps.google.com.au/maps?layer=c&cbll="+gsv_lat+","+gsv_lon+"&cbp=12,"+gsv_head+",,0,0";


														tab_el = {
															layout	: 'fit',
															height  : size_thumb,
															items	: [{
																html:"<div><a href='"+gsvlink+"' target='_blank'><img src='"+gsvthumb+"' style='display:block;margin:auto;'/></a></div>"
															}]
														};
													}
												}
												else
												{
													// This is a different tab than Google Street View, we push the attribute names and values
													// By setting a title, we create a header (required to number the different tabs if multiple elements)
													// but if it's the only property grid, we deny it to be rendered
													// Based on API doc: http://docs.sencha.com/ext-js/3-4/#!/api/Ext.Panel-cfg-header
													tab_el = new Ext.grid.PropertyGrid({
															title:first_element,
															header: (recs.length>1),
															listeners: {
																'beforeedit': function (e) { 
																	return false; 
																}
															},
															stripeRows: true,
															autoHeight: true,
															hideHeaders: true,
															// Removing the space on the right usually reserved for scrollbar
															viewConfig: {
																forceFit: true,
																scrollOffset: 0
															}
													});

													// Remove default sorting
													delete tab_el.getStore().sortInfo;
													tab_el.getColumnModel().getColumnById('name').sortable = false;
													// Managing column width ratio
													tab_el.getColumnModel().getColumnById('name').width = 30;
													tab_el.getColumnModel().getColumnById('value').width = 70;
													// Now load data
													tab_el.setSource(src_attr_array);

												}

												tab_array.push(tab_el);
											}	

											// Identification of the div to render the attributes to, if there is anything to render
											if (recs[0])
											{
												// The target div for placing this data
												var targ = Ext.getCmp(recs[0].json.row["target"]);
												
												// In some cases the tab has already been removed (i.e. targ is null)
												if (targ)
												{
													targ.removeAll();

													// Adding the listener to each subtab
													if (recs[0].json.row["tabaction"])
													{
														// Avoiding the use of the 'eval' function
														var fn2 = window[recs[0].json.row["tabaction"]];
														if (typeof fn2 === 'function') {
															// Going thru all the elements in the tab_array to add the listener
															// Note: we can not just add a default listener in the containing panel/tabpanel
															// because the elements have already been instantiated
															for(b in tab_array)
															{
																if (tab_array.hasOwnProperty(b))
																{
																	tab_array[b].addListener('activate',function(tab) {
																		tab.the_geom = geom_array[tab.title];
																		fn2(tab);
																	});
																}
															}
														}													
													}
											
													// The container depends on the number of records returned
													if (tab_array.length==1)
													{
														// Removing the title - it's useless
														// We should be able to remove the header that was created with a non-null title
														tab_array[0].title = undefined;

														// Rendering as a table
														var win = new Ext.Panel({
															id:'tblayout-win'+g,
															layout:'fit',
															bbar:true,
															bbarCfg: {
																tag: 'center',
        														html: '<p>' +configArray[i-1].desc+ '</p>'
        													},
															border:true,
															items: tab_array[0]
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
															minTabWidth     : 20,
															bbar:true,
															bbarCfg: {
																tag: 'center',
        														html: '<p>' +configArray[i-1].desc+ '</p>'
        													},
															border:true,
															items: tab_array
														});
													}
													targ.add(win);
													targ.doLayout();
													i++;
												}
											}
											else
											{
												// The target div for placing this data: the loading div's parent
												targ2.removeAll();

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
														{html:'<p style="font-size:12px;font-family: tahoma,arial,verdana,sans-serif;">No result found</p>',border:false,padding:'5'}
													]
												});
												targ2.add(win3);
												targ2.doLayout();
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
								targ2.removeAll();

								// Rendering as a table
								var win4 = new Ext.Panel({
									id:'tblayout-win-generic'
									//,width:227
									,idFeature:idFeature
									,layout:'fit'
									,border:false
									,items: [
										{html:configArray[i].html_to_render}
									]
								});
								targ2.add(win4);
								targ2.doLayout();
							}
						}

					}							
				}
			};

			// Defines the north part of the east panel
			northPart = new Ext.Panel({
				region: "north",
				border: false,
				//hidden: true,
				layout: {
					type:'vbox',
					align:'stretch'
				},
				height: 30,
				bodyStyle: "background-color:"+gtBannerLineColor+";",
				items: [
					{
						layout:'column',
						height:30,
						border:false,
						bodyStyle: "background-color:"+gtBannerLineColor+";",
						items:[
							{
								html:"<p style='background-color:"+gtBannerLineColor+";height:19px;padding:5px 8px; cursor: hand;' id='gtInfoTypeLabel'>&nbsp;</p>",
								columnWidth:1,
								id: 'gtInfoTypeCmp',
								bodyCssClass: 'selectedFeatureType',
								listeners: {
									render: function(c) {
										// Expanding the drop down on click
										c.el.on('click', function() { 
											var infoComboBox = Ext.getCmp('gtInfoCombobox');
											// Expand does not work directly (because custom style in drop down), using this workaround
											infoComboBox.keyNav.down.call(infoComboBox);
										});
										// Using the pointer cursor when hovering over the element
										c.el.on('mouseover', function() { 
											this.dom.style.cursor = 'pointer';
										});
									},
									scope: this
								}
							},{
								html:"<p style='background-color:"+gtBannerLineColor+";'><img src='theme/app/img/panel/cross-white.png' style='padding:2px;' alt='Clear' title='Clear' /></p>",
								width:17,
								bodyCssClass: 'selectedFeatureType',
								listeners: {
									render: function(c) {
										// Expanding the drop down on click
										c.el.on('click', function() { 
											// Removing highlight and emptying combo
											clear_highlight();
										});
										// Using the pointer cursor when hovering over the element
										c.el.on('mouseover', function() { 
											this.dom.style.cursor = 'pointer';
										});
									},
									scope: this
								}
						}]
					},					
					new Ext.form.ComboBox({
						id: 'gtInfoCombobox',
						hidden:true,
						store: gCombostore,
						displayField:'labelx',
						disabled: true,
						mode: 'local',
						style: 'background-color: '+gtBannerLineColor+';',
						// Setting the background image initially to nothing
						cls: 'x-form-single',
						typeAhead: true,
						hideTrigger: true,
						forceSelection: true,
						editable:false,
						triggerAction: 'all',
						emptyText: gtEmptyTextSelectFeature,
						tpl: '<tpl for="."><div class="info-item" style="height:40px;padding:5px 8px;"><b>{type}</b><br>{labelx}</div></tpl>',
						itemSelector: 'div.info-item',
						listeners: {'select': function (combo,record){
									// Displaying the feature type
									var ft = record.get("type");

									gtLayerLabel = ft;
									
									ft = ft.replace(/es\s/g,"e ");
									
									if(ft.charAt(ft.length-2) != 's' && ft.charAt(ft.length-1) == 's')
									{			
										ft = ft.replace(/s$/,"");
										Ext.get('gtInfoTypeLabel').dom.innerHTML = ft.replace(/ie$/,"y");
									}
									else 
									{
										Ext.get('gtInfoTypeLabel').dom.innerHTML = ft;
									}
									
									// Displaying the different tabs in the accordion
									var e0=Ext.getCmp('gtAccordion');
									e0.removeAll();

									// Whatever the current expanded tab is, we populate the direct attributes accordion panel
									var lab;
									var val;
									var item_array=new Array();
									var has_gsv = false;
									var fa = [], fte= [];

									// Working out the layer presentation configuration
									// Current layer name
									var cl = record.get("layer");
									// Configuration field array
									var fti_arr = gtLayerPresentationConfiguration[cl];
									// Arrays to store ordered attribute names and values
									var an_arr,av_arr;
									if (fti_arr)
									{
										an_arr = new Array(fti_arr.length);
										av_arr = new Array(fti_arr.length);
									}

									for(var k in record.data.content)
									{
										if (k=="the_geom" || k=="SHAPE")
										{
											var featureToRead = record.data.content[k];
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
											glayerLocSel.removeAllFeatures();
											glayerLocSel.addFeatures(wktfeatures);
										}
										else
										{
											lab=k;
											val=record.data.content[k];

											// Processing the fields according to presentation configuration array
											if (fti_arr)
											{
												// Locating the index the current attribute should be positioned at
												for(q=0;q<fti_arr.length;q++)
												{
													if(fti_arr[q].attr_name == lab)
													{
														// Substitution with a optional alternate name
														if (fti_arr[q].alt_name)
														{
															an_arr[q]=fti_arr[q].alt_name;
														}
														else
														{
															// If no alternate name, just the normal clean title case
															an_arr[q]=toTitleCase(trim(lab.replace(/_/g," ")));
														}
														av_arr[q]=trim(val);
														break;
													}
												}

											}
											else
											{
												// Pushing this element in the source of the property grid
												fa[toTitleCase(trim(lab.replace(/_/g," ")))]=trim(val);
											}
										}

									}

									// Ordered population of the source data for the grid
									if (fti_arr)
									{
										// We build the fa object based on the 2 arrays of attributes names and values
										for(q=0;q<fti_arr.length;q++)
										{
											fa[an_arr[q]]=av_arr[q];
										}
									}

									var p = new Ext.grid.PropertyGrid({
											listeners: {
												'beforeedit': function (e) { 
													return false; 
												} 
											},
											stripeRows: true,
											autoHeight: true,
											hideHeaders: true,
											viewConfig: {
												forceFit: true,
												scrollOffset: 0
											}
									});

									// Remove default sorting
									delete p.getStore().sortInfo;
									p.getColumnModel().getColumnById('name').sortable = false;
									// Managing column width ratio
									p.getColumnModel().getColumnById('name').width = 30;
									p.getColumnModel().getColumnById('value').width = 70;										
									// Now load data
									p.setSource(fa);
									
									var panel = new Ext.Panel({
										  id:'attributeAcc',
										  headerCfg:{
											tag: 'div',
											style:'	background-image: url();background-color: #A0A0A0;padding-left: 10px;',
											children: [
											    { tag: 'div', 'html': gtDetailsTitle }
											]
										  },
										  layout: 'fit',
										  // style: couldn't find a way to override the style inherited from the parent (gtAccordion)
										  items: [p],
										  listeners:{
											scope:this,
											expand:tabExpand
										  }
									});

									e0.add(panel);

									// Layout configuration the global variable array loaded at application start										
									var configArray = gLayoutsArr[record.data.layer];
									if (configArray)
									{
										// Here we should do the styling substitution to transform a config option into a proper style element
										for (c in configArray)
										{
											if (!(configArray[c].headerCfg))
											{	
												var t = configArray[c].title;
												// Header config would not work if the title was part of the initial config
												delete configArray[c].title;
												
												var col = configArray[c].col;
												
												var lock = configArray[c].lock;
												
												desc = configArray[c].desc;
												
												if (!(col))
												{
													col = "#A0A0A0";
												}
												
												if(lock)
												{
													lock = "background-image: url(theme/app/img/panel/lock.png);";
												}
												
												configArray[c].headerCfg={
													tag: 'div',
													style: lock+ 'background-position: right; background-repeat: no-repeat; background-color:' +col+ ';padding-left: 10px;',
													children: [
													    { tag: 'div', 'html': t }
													]
												};
											}
										}											

										// And initialisation of the accordion items
										e0.add(configArray);
									}

									// Refreshing the DOM with the newly added parts
									e0.doLayout();	

									/// Expanding the tab whose index has been memorised
									if (!(gCurrentExpandedTabIdx[record.data.layer]))
									{
										gCurrentExpandedTabIdx[record.data.layer]=0;
									}
									e0.items.itemAt(gCurrentExpandedTabIdx[record.data.layer]).expand();
								},
							    scope:this}

						})
					]
			});

			var accordion = new Ext.Panel({
				id:'gtAccordion',
				layout:'accordion',
				region: "center",
				border: false,
				rowHeight:1,
				collapsible: false,
				autoScroll:true,
				defaults: {
					// applied to each contained panel
					bodyStyle: " background-color: transparent ",
					style:"padding:10px 0px 0px;",
					collapsed: true,
					listeners: {
						scope:this,
						expand: tabExpand,
						collapse: tabCollapse
					}
				},
				layoutConfig: {
					// layout-specific configs go here
					animate: false,
					titleCollapse: true,
					activeOnTop: false,
					hideCollapseTool: false,
					fill: false 
				}
			});
			
			var bottomEastItem = {
				border:false
			};
			if (JSONconf.bottomEastItem)
			{
				bottomEastItem = 
				{ 
					id:'bottomEastItem',
					title:JSONconf.bottomEastItem.title,
					html:"<iframe src='"+JSONconf.bottomEastItem.URL+"' height='"+JSONconf.bottomEastItem.height+"' frameborder='0' />" ,
					collapsible:true,
					animCollapse:false,
					border:false,
					height:JSONconf.bottomEastItem.height,
					listeners: {
						scope:this,
						expand: function(p){
							eastPanel.doLayout();
						},
						collapse: function(p){
							eastPanel.doLayout();
						}
					}
				};
			}	
			
			eastPanel = new Ext.Panel({
				border: false,
				layout: "ux.row",
				region: "east",
				// Padding only on the left, as all over basis are covered by the parent container
				style:"padding: 0px 0px 0px 10px; background-color:white;",
				collapseMode: "mini",
				collapsed: gtEastPanelCollapsed,
				width: 350,
				listeners:{
						scope: this,
						resize:function(p){
							// This is required to get the content of the accordion tabs to resize
							for (i in p.items.items)
							{	
								// hasOwnProperty appropriate way to deal with direct property of this object, not inherited ones
								// In the case on an array, direct members are indexes
								if (p.items.items.hasOwnProperty(i))
								{						
									p.items.items[i].doLayout();
								}
							}
						}
				},
				split: true,
				items: [
					northPart,
					accordion,
					bottomEastItem
				]
			});

			var portalItems = [
			{
				region: "north",
				layout: "column",
				height: 100,
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
					new Ext.Panel({
						region: "center",
						width: 492,
						padding: "31px",
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
								style: "border-color: "+gtBannerLineColor+";",
								pageSize:0,
								emptyText:gtEmptyTextSearch,
								hideTrigger:true,
								tpl: '<tpl for="."><div class="search-item" style="height: 28px;"><font color="#666666">{ld}</font> : {[values.label.replace(new RegExp( "(" +  Ext.get(\'gtSearchCombobox\').getValue()  + ")" , \'gi\' ), "<b>$1</b>" )]} <br></div></tpl>',
								itemSelector: 'div.search-item',
								listeners: {'select': search_record_select_handler,scope:this}
							})
						]
					})
					,
					new Ext.Panel({
						region: "center",
						style:"padding:31px 0px 0px; text-align: center;",
						width: 80,
						height: 67,
						border:false,
						padding: "7px",
						bodyStyle: {backgroundColor:gtBannerLineColor},
						html:'<img style="vertical-align: middle;"src="theme/app/img/panel/search_button.png"/>'
					})
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
						html: '<p style="text-align:right;padding: 15px;font-size:12px;"><a href="'+gtLinkToCouncilWebsite+'" target="_blank">'+ gtBannerRightCornerLine1 +'</a><br> '+ gtBannerRightCornerLine2 +' <br><br>Map powered by <a href="http://www.pozi.com" target="_blank">Pozi</a></p>'

					})
					]
			},
			{
			// HS MOD END
				region: "center",
				layout: "border",
				style: " background-color:white;padding:0px 10px 10px;",
				items: [
					{
						id: "centerpanel",
						xtype: "panel",
						layout: {
							type: "vbox",
							align: "stretch"
						},
						region: "center",
						border: false,
						items: [{
								height: 29,
								border:false,
								bodyStyle:{
									backgroundColor:gtBannerLineColor,
									margin:'0px 0px 0px',
									padding: '5px 8px',
									fontSize:'16px',
									fontFamily: 'tahoma,arial,verdana,sans-serif',
									color:'#FFFFFF',
									fontWeight:'bolder'
								},
								defaults:{
									bodyStyle: {
										backgroundColor:gtBannerLineColor
									},
									border:false
								},
								layout:'column',
								items:[
									{
										html: '<div id="headerContainer">'+gtMapContexts+'</p></div>',
										width: gtMapContextsSize
									},
									{
										html:"<img src='theme/app/img/panel/list-white-final.png' style='padding:2px;' alt='Layers' title='Layers' />",
										id:'layerListButton',
										width: 20,
										hidden: gtHideLayerPanelButton,
										listeners: {
											render: function(c) {
												// Expanding the drop down on click
												c.el.on('click', function() { 
													if (westPanel.collapsed)
													{
														westPanel.expand();
													}
													else
													{
														westPanel.collapse();
													}
												});
												// Using the pointer cursor when hovering over the element
												c.el.on('mouseover', function() { 
													this.dom.style.cursor = 'pointer';
												});
											},
											scope: this
										}
									},
									{
										columnWidth: 1,
										html:"",
										height: 28
									},
									{
										id:"toolPlaceHolder",
										style:{
											// Haven't bee able to find a configuration to replicate:
											//  div align='right'
											//
										},
										width:25
									}
								]
							},
							{
								xtype: "panel",
								layout: 'fit',
								border:false,
								flex:1,
								items:["mymap"]
							}
						]					
					},
					westPanel,
					eastPanel
				]}
			];
			
			// Masking the north region
			if (gtHideNorthRegion)
			{
				portalItems=[portalItems[1]];
			}

			app = new gxp.Viewer({
				authorizedRoles: ['ROLE_ADMINISTRATOR'],
				proxy: gtProxy,
				//defaultSourceType: "gxp_wmscsource",
				portalConfig: {
					layout: "border",
					region: "center",
					// by configuring items here, we don't need to configure portalItems and save a wrapping container
					items: portalItems
				},
				// configuration of all tool plugins for this application
				tools: JSONconf.tools,
				// layer sources
				sources: JSONconf.sources,
				// map and layers
				map: {
					id: "mymap", // id needed to reference map in portalConfig above
					projection: "EPSG:900913",
					center: JSONconf.center,
					zoom: JSONconf.zoom,
					layers: JSONconf.layers,
					// Setting controls manually to have the simple OpenLayers zoom control
					controls: [
						new OpenLayers.Control.Navigation(),
						new OpenLayers.Control.Zoom(),
						new OpenLayers.Control.Attribution(),
						new OpenLayers.Control.ScaleLine()
					],
					mapItems: [{
						xtype: "gxp_scaleoverlay"
					}]
				}
			});

			app.on("ready", function() {
				// Setting the title of the map to print
				app.about={};
				app.about["title"]=gtPrintMapTitle;

				// This is when we want to find the handle to the WFS layer
				for(x in app.mapPanel.layers.data.items) {
					var u = app.mapPanel.layers.data.items[x];
					if (u.data)
					{
						// Assigning the selection layer to a global variable for easier access
						if (u.data.name == "Selection")
						{
							glayerLocSel = u.getLayer();
						}
					}
				};

				glayerLocSel.events.on({
					featuresadded: function(event) {
						if (gfromWFS=="Y")
						{
							var row_array = [];
							var cont;
							gComboDataArray=[];

							for (var k=0;k<this.features.length;k++)
							{
								// We capture the attributes brought back by the WFS call
								cont=this.features[k].data;
								// Capturing the feature as well (it contains the geometry)
								cont["the_geom_WFS"]=this.features[k];										

								// If too long for the drop down, we truncate the string to the space remaining after "<LAYER NAME>:"
								var num_char_in_drop_down = 38;
								if (glab.length>num_char_in_drop_down-gtyp.length)
								{
									glab = glab.substring(0,num_char_in_drop_down-gtyp.length-2)+"..";
								}

								// Building a record and inserting it into an array											
								//row_array = new Array(k,typ,lab,cont,null,null,this.features[k].layer.protocol.featureType); 
								row_array = new Array(k,gtyp,cont,0,glab,this.features[k].layer.protocol.featureType); 
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

				// If we have found a property to zoom to, well, zoom to and highlight it
				if (propertyDataInit)
				{
					var r = [];
					r["data"] = propertyDataInit;
					search_record_select_handler(null, r);
				} 

				// The main toolbar containing tools to be activated / deactivated on login/logout
				// TODO: determine if this is still relevant
				toolbar = app.mapPanel.toolbars[0];

				// Selecting the layer that the opacity slider will select
				var l_to_os;
				for (k in JSONconf.layers)
				{
					if (JSONconf.layers[k].displayInOpacitySlider)
					{
						for(l in app.mapPanel.map.layers)
						{
							if (JSONconf.layers[k].title==app.mapPanel.map.layers[l].name)
							{
								l_to_os=app.mapPanel.map.layers[l];
								break;
							}
						}
					}
				}
				
				if (l_to_os)
				{
					// Adding a label
					toolbar.items.add(new Ext.form.Label({
						text:"Aerial Photo",
						style:'font: normal 13px verdana'
					}));

					// Adding a bit of space
					toolbar.items.add(new Ext.Toolbar.Spacer({width:8}));
					
					// Adding the eye-con
					toolbar.items.add(new Ext.Component({
						html:'<img src="theme/app/img/panel/eye-con.png"/>'
					}));
					
					// Adding a bit of space
					toolbar.items.add(new Ext.Toolbar.Spacer({width:8}));
					
					// Adding an opacity slider to the toolbar
					var os = new GeoExt.LayerOpacitySlider({
						layer:l_to_os,
						aggressive:true,
						width:100
					});
					toolbar.items.add(os);

					// Rendering the toolbar
					toolbar.doLayout();
				}
				

				
				// Tree toolbar to add the login button to
				var westpaneltoolbar = Ext.getCmp('tree').getTopToolbar();
				westpaneltoolbar.addFill();
				westpaneltoolbar.items.add(new Ext.Button({id:"loginbutton"}));
				westpaneltoolbar.doLayout();

				// Login management via cookie and internal this.authorizedRoles variable
				// Variable and functions copied across from GeoExplorer' Composer.js:
				// https://github.com/opengeo/GeoExplorer/blob/master/app/static/script/app/GeoExplorer/Composer.js
				app.cookieParamName= 'geoexplorer-user';
				app.loginText= "Login";
				app.logoutText= "Logout, {user}";
				app.loginErrorText= "Invalid username or password.";
				app.saveErrorText= "Trouble saving: ";

				/** private: method[setCookieValue]
				* Set the value for a cookie parameter
				*/
				app.setCookieValue = function(param, value) {
					document.cookie = param + '=' + escape(value);
				};

				/** private: method[clearCookieValue]
				* Clear a certain cookie parameter.
				*/
				app.clearCookieValue = function(param) {
					document.cookie = param + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
				};

				/** private: method[getCookieValue]
				* Get the value of a certain cookie parameter. Returns null if not found.
				*/
				app.getCookieValue = function(param) {
					var i, x, y, cookies = document.cookie.split(";");
					for (i=0; i < cookies.length; i++) {
						x = cookies[i].substr(0, cookies[i].indexOf("="));
						y = cookies[i].substr(cookies[i].indexOf("=")+1);
						x=x.replace(/^\s+|\s+$/g,"");
						if (x==param) {
							return unescape(y);
						}
					}
					return null;
				};

				/** private: method[logout]
				* Log out the current user from the application.
				*/
				app.logout = function() {
					app.clearCookieValue("JSESSIONID");
					app.clearCookieValue(app.cookieParamName);
					app.setAuthorizedRoles([]);
					// This section became useless for tools which are actively monitoring the authorization status
					//toolbar.items.each(function(tool) {
					//	if (tool.needsAuthorization === true) {
					//		tool.disable();
					//	}
					//});
					app.showLogin();

					if (gtReloadOnLogin)
					{
						// Issue with users having to refresh the page to access their priviledged functionalities
						// This section should disappear when we're able to reload the layer tree / manager properly
						window.location.reload();
					}
				};


				/** private: method[authenticate]
				* Show the login dialog for the user to login.
				*/
				app.authenticate = function() {

					var submitLogin=function() {
						panel.buttons[0].disable();

						// Prefixes the username with the workspace name
						win.hide();
						var typedUsername=panel.getForm().items.items[0].getValue();
						if (typedUsername != "admin")
						{
							panel.getForm().items.items[0].setValue(gtWorkspace+"."+typedUsername);
						}
						//


						panel.getForm().submit({
							success: function(form, action) {
								toolbar.items.each(function(tool) {
									if (tool.needsAuthorization === true) {
										tool.enable();
									}
								});
								var user = form.findField('username').getValue();
								app.setCookieValue(app.cookieParamName, user);
								app.setAuthorizedRoles(["ROLE_ADMINISTRATOR"]);
								// Reloading the layer tree (TODO)
								////Ext.getCmp('tree').body=null;
								////app.addLayers();
								// Reloading the tabs
								gCurrentLoggedRole = app.authorizedRoles[0];
								loadTabConfig();
								clear_highlight();
								// Keeping username and password in variables for injection in WMS queries of local source
								gLoggedUsername = form.findField('username').getValue();
								gLoggedPassword = form.findField('password').getValue();
								// Only showing the username without its workspace
								var typedUsername = user;
								if (user.split(".")[1])
								{
									typedUsername = user.split(".")[1];
								}
								app.showLogout(typedUsername);
								win.un("beforedestroy", this.cancelAuthentication, this);
								win.close();

								if (gtReloadOnLogin)
								{
									// Issue with users having to refresh the page to access their priviledged functionalities
									// This section should disappear when we're able to reload the layer tree / manager properly
									window.location.reload();
								}
							},
							failure: function(form, action) {
								// Reset the username to what was initially typed, and show the login window
								panel.getForm().items.items[0].setValue(typedUsername);
								win.show();
								//
								app.authorizedRoles = [];
								panel.buttons[0].enable();
								form.markInvalid({
									"username": this.loginErrorText,
									"password": this.loginErrorText
								});
							},
							scope: this
						});
					};

					var panel = new Ext.FormPanel({
						url: gtLoginEndpoint,
						frame: true,
						labelWidth: 60,
						defaultType: "textfield",
						errorReader: {
							read: function(response) {
								var success = false;
								var records = [];
								if (response.status === 200) {
									success = true;
								} else {
									records = [
										{data: {id: "username", msg: app.loginErrorText}},
										{data: {id: "password", msg: app.loginErrorText}}
									];
								}
								return {
									success: success,
									records: records
								};
							}
						},
						items: [{
							fieldLabel: "Username",
							name: "username",
							allowBlank: false,
							listeners: {
								render: function() {
									this.focus(true, 100);
								}
							}
						}, {
							fieldLabel: "Password",
							name: "password",
							inputType: "password",
							allowBlank: false
						}],
						buttons: [{
							text: app.loginText,
							formBind: true,
							handler: submitLogin,
							scope: this
						}],
						keys: [{
							key: [Ext.EventObject.ENTER],
							handler: submitLogin,
							scope: this
						}]
					});

					var win = new Ext.Window({
						title: app.loginText,
						layout: "fit",
						width: 235,
						height: 130,
						plain: true,
						border: false,
						modal: true,
						items: [panel],
						listeners: {
							beforedestroy: this.cancelAuthentication,
							scope: this
						}
					});
					win.show();
				};

				/**
				* private: method[applyLoginState]
				* Attach a handler to the login button and set its text.
				*/
				app.applyLoginState = function(iconCls, text, handler, scope) {
					var loginButton = Ext.getCmp("loginbutton");
					loginButton.setIconClass(iconCls);
					loginButton.setText(text);
					loginButton.setHandler(handler, scope);
				};

				/** private: method[showLogin]
				* Show the login button.
				*/
				app.showLogin = function() {
					var text = app.loginText;
					var handler = app.authenticate;
					app.applyLoginState('login', text, handler, this);
				};

				/** private: method[showLogout]
				* Show the logout button.
				*/
				app.showLogout = function(user) {
					var text = new Ext.Template(this.logoutText).applyTemplate({user: user});
					var handler = app.logout;
					app.applyLoginState('logout', text, handler, this);
				};

				app.authorizedRoles = [];
				if (app.authorizedRoles) {
					// If there is a cookie, the user is authorized
					var user = app.getCookieValue(app.cookieParamName);
					if (user !== null) {
						app.setAuthorizedRoles(["ROLE_ADMINISTRATOR"]);
						gCurrentLoggedRole=app.authorizedRoles[0];
					}

					// unauthorized, show login button
					if (app.authorizedRoles.length === 0) {
						app.showLogin();
					} else {
						var user = app.getCookieValue(app.cookieParamName);
						if (user === null) {
							user = "unknown";
						}
						// Only showing the username without its workspace
						var typedUsername = user;
						if (user.split(".")[1])
						{
							typedUsername = user.split(".")[1];
						}
						app.showLogout(typedUsername);
						// Showing the layer tree because we're logged in
						westPanel.expand();						

						if (app.authorizedRoles[0])
						{
							gCurrentLoggedRole=app.authorizedRoles[0];
						}

					}
				};


				var loadTabConfig = function(){

					// Information panel layouts for the current authorized role - we should degrade nicely if the service is not found
					var ds;
					for (urlIdx in gtGetLiveDataEndPoints)
					{
						if (gtGetLiveDataEndPoints.hasOwnProperty(urlIdx))
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
												// Reordering the array elements inside the array for this key, according to orderNum
												gLayoutsArr[recs[key].json.row.key_arr].sort(function(a,b){
													return parseInt(a.orderNum) - parseInt(b.orderNum);
												});
											}
											else
											{
												// We create this key if it didn't exist
												gLayoutsArr[recs[key].json.row.key_arr]=a; 
											}
										}
										
										add_default_tabs();
									}
								}
							});
						}
					};
				};
				
				// Loading the tabs on initial page load
				loadTabConfig();

			});

		};

		// Loading the extra Javascript if the configuration file contains a name
		if (JSONconf.customJS)
		{
			loadjscssfile('lib/custom/js/'+JSONconf.customJS,extraJSScriptLoaded);
		}
		else
		{
			extraJSScriptLoaded();
		}

	};
	

	// Loading the JSON configuration based on the council name
	OpenLayers.Request.GET({
		url: "lib/custom/json/"+configScript+".json",
		success: function(request) {
			// Decoding the configuration file - it's a JSON file
			JSONconf = Ext.util.JSON.decode(request.responseText);
			// If a property number has been passed
			if (propnum)
			{
				// Handler for result of retrieving the property details by its number
				var prop_by_prop_num_handler=function(request){
					// The first row returned contains our property record
					// We populate the global variable with that
					if (request.data && request.data.items[0])
					{
						propertyDataInit = request.data.items[0].json.row;
					}
					else
					{
						alert("No property found in "+toTitleCase(configScript)+" with number: "+propnum+".");
					}
					
					onConfigurationLoaded();
				};
 
				var ds = new Ext.data.JsonStore({
					autoLoad: true, //autoload the data
					root: 'rows',
					baseParams: {query: propnum, config: JSONconf.databaseConfig, lga: JSONconf.LGACode},
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
						url: JSONconf.servicesHost + "/ws/rest/v3/ws_property_id_by_propnum.php"
					}),
					listeners: {
						load: prop_by_prop_num_handler
					}
				});
 
 			}
			else
			{
				onConfigurationLoaded();
			}
		},
		failure: function(request) {
			var obj;
			try {
				obj = Ext.util.JSON.decode(request.responseText);
			} catch (err) {
				// pass
			}
			var msg = this.loadConfigErrorText;
			if (obj && obj.error) {
				msg += obj.error;
			} else {
				msg += this.loadConfigErrorDefaultText;
			}
			this.on({
				ready: function() {
					this.displayXHRTrouble(msg, request.status);
				},
				scope: this
			});
		},
		scope: this
	});
	
});