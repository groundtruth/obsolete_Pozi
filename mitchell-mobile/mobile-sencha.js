Ext.ns('App');

/**
 * The model for the geonames records used in the search
 */
//Ext.regModel('PoziSearch', {
//    fields: ['countryName', 'toponymName', 'name', 'lat', 'lng']
//});

/**
 * Custom class for the Search 
 */
App.SearchFormPopupPanel = Ext.extend(Ext.Panel, {
    map: null,
    floating: true,
    modal: true,
    centered: true,
    hideOnMaskTap: true,
    width: Ext.is.Phone ? undefined : 400,
    height: Ext.is.Phone ? undefined : 400,
    scroll: false,
    layout: 'fit',
    fullscreen: Ext.is.Phone ? true : undefined,
    url: '/ws/rest/v3/ws_all_features_by_string.php',
    errorText: 'Sorry, we had problems communicating with Pozi search. Please try again.',
    errorTitle: 'Communication error',
    maxResults: 6,
    featureClass: "P",
    
    createStore: function(){
        this.store = new Ext.data.JsonStore({
			autoLoad: false, //autoload the data
			root: 'rows',
			// Pb passing the config parameter to the Web service - for now database.inc (from ws) hardcodes the database to connect to
			baseParams: { config: 'mitchellgis'},
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
			proxy: {
				type: 'scripttag',
				timeout: 5000,
				listeners: {
					exception: function(){
						this.hide();
						Ext.Msg.alert(this.errorTitle, this.errorText, Ext.emptyFn);
					},
					scope: this
				},
				url: this.url,
				reader: {
					type: 'json',
					root: 'rows'
				}
			}
	});
    },
    
    doSearch: function(searchfield, evt){
        var q = searchfield.getValue();
        this.store.load({
            params: {
                query: q,
                config: 'mitchellgis'
            }
        });
    },
    
    onItemTap: function(dataView, index, item, event){
        var record = this.store.getAt(index);
        var xmin = record.get('xmini');
        var ymin = record.get('ymini');
        var xmax = record.get('xmaxi');
        var ymax = record.get('ymaxi');    
        var x = xmin/2+xmax/2;
        var y = ymin/2+ymax/2;
        //alert("Moving to x:"+x+" y:"+y);
        var lonlat = new OpenLayers.LonLat(xmin/2+xmax/2, ymin/2+ymax/2);
        map.setCenter(lonlat.transform(gg, sm), 18);
        this.hide("pop");
    },
    
    initComponent: function(){
        this.createStore();
        this.resultList = new Ext.List({
            scroll: 'vertical',
            cls: 'searchList',
            loadingText: "Searching ...",
            store: this.store,
            itemTpl: '<div>{label}</div>',
            listeners: {
                itemtap: this.onItemTap,
                scope: this
            }
        });
        this.formContainer = new Ext.form.FormPanel({
            scroll: false,
            items: [{
                xtype: 'button',
                cls: 'close-btn',
                ui: 'decline-small',
                text: 'Close',
                handler: function(){
                    this.hide();
                },
                scope: this 
            }, {
                xtype: 'fieldset',
                scroll: false,
                title: 'Search for a place',
                items: [{
                    xtype: 'searchfield',
                    label: 'Search',
                    placeHolder: 'placename',
                    listeners: {
                        action: this.doSearch,
                        scope: this
                    }
                },
                    this.resultList
                ]
            }]
        });
        this.items = [{
            xtype: 'panel',
            layout: 'fit',
            items: [this.formContainer]
        }];
        App.SearchFormPopupPanel.superclass.initComponent.call(this);
    }
});

App.LayerList = Ext.extend(Ext.List, {
    
    map: null,
    
    createStore: function(){
        Ext.regModel('Layer', {
            fields: ['id', 'name', 'visibility', 'zindex']
        });
        var data = [];
        Ext.each(this.map.layers, function(layer){
            if (layer.displayInLayerSwitcher === true) {
                var visibility = layer.isBaseLayer ? (this.map.baseLayer == layer) : layer.getVisibility();
                data.push({
                    id: layer.id,
                    name: layer.name,
                    visibility: visibility,
                    zindex: layer.getZIndex()
                });
            }
        });
        return new Ext.data.Store({
            model: 'Layer',
            sorters: 'zindex',
            data: data
        });
    },
    
    initComponent: function(){
        this.store = this.createStore();
        this.itemTpl = new Ext.XTemplate(
            '<tpl if="visibility == true">', 
                '<img width="20" src="img/check-round-green.png">', 
            '</tpl>', 
            '<tpl if="visibility == false">', 
                '<img width="20" src="img/check-round-grey.png">', 
            '</tpl>', 
            '<span class="gx-layer-item">{name}</span>'
        );
        this.listeners = {
            itemtap: function(dataview, index, item, e){
                var record = dataview.getStore().getAt(index);
                var layer = this.map.getLayersBy("id", record.get("id"))[0];
                if (layer.isBaseLayer) {
                    this.map.setBaseLayer(layer);
                }
                else {
                    layer.setVisibility(!layer.getVisibility());
                }
                record.set("visibility", layer.getVisibility());
            }
        };
        this.map.events.on({
            "changelayer": this.onChangeLayer,
            scope: this
        });
        App.LayerList.superclass.initComponent.call(this);
    },

    findLayerRecord: function(layer){
        var found;
        this.store.each(function(record){
            if (record.get("id") === layer.id) {
                found = record;
            }
        }, this);
        return found;
    },
    
    onChangeLayer: function(evt){
        if (evt.property == "visibility") {
            var record = this.findLayerRecord(evt.layer);
            record.set("visibility", evt.layer.getVisibility());
        }
    }
    
});
Ext.reg('app_layerlist', App.LayerList);



App.CaptureFormPopupPanel = Ext.extend(Ext.Panel, {
	map: null,
	propertyAddressStore: null,
	floating: true,
	modal: true,
	centered: true,
	// Deactivated mask on tap to allow for selection in the drop down list
	hideOnMaskTap: false,
	width: Ext.is.Phone ? undefined : 400,
	height: Ext.is.Phone ? undefined : 400,
	scroll: false,
	layout: 'fit',
	fullscreen: Ext.is.Phone ? true : undefined,
	//    url: '/ws/rest/v3/capture/ws_property_fire_hazard.php',
	errorText: 'Sorry, we had problems communicating with the Pozi server. Please try again.',
	errorTitle: 'Communication error',
        
	initComponent: function(){
		Ext.regModel('PropertyAddress', {
			// Potential issue if property numbers are repeated or missing - would be better to use a real PK for the Id field
			idProperty:'prop_num',
			fields: [
				{name: 'label',     type: 'string', mapping: 'row.label'},
				{name: 'prop_num',    type: 'string', mapping: 'row.prop_num'}
			]
		});

		Ext.regModel('ReferenceTable', {
			// Potential issue if property numbers are repeated or missing - would be better to use a real PK for the Id field
			idProperty:'id',
			fields: [
				{name: 'id',     type: 'string'},
				{name: 'label',    type: 'string'}
			]
		});

//		Ext.regModel('HazardStatus', {
//			// Potential issue if property numbers are repeated or missing - would be better to use a real PK for the Id field
//			idProperty:'id',
//			fields: [
//				{name: 'id',     type: 'string'},
//				{name: 'label',    type: 'string'}
//			]
//		});

		// Be careful to the refresh timeline of the content - it has to be refreshed each time the form is invoked
		propertyAddressStore = new Ext.data.JsonStore({
	//           data : [
	//                { label : '123 High St',  prop_num : '123123'},
	//                { label : '45 Royal Parade', prop_num : '456456'},
	//                { label : 'Long Road', prop_num : '789789'}
	//           ],
			proxy: {
				type: 'rest',
				url : '/ws/rest/v3/ws_closest_properties.php',
				reader: {
					type: 'json',
					root: 'rows',
					totalCount : 'total_rows'
				}
			},
			// Max number of records returned
			pageSize: 10,	
			model : 'PropertyAddress',
			autoLoad : false,
			autoDestroy : true,
			listeners: {
				load: function(ds,records,o) {
					var cb = Ext.getCmp('prop_num');
					var rec = records[0];
					cb.setValue(rec.data.type);
					cb.fireEvent('select',cb,rec);
					},
				scope: this
			}
		});
		
		hazardTypeDataStore = new Ext.data.JsonStore({
	           data : [
	                { id : '1',  label : '1 - Full Cut'},
	                { id : '2', label : '2 - Fire Break'},
	                { id : '3', label : '3 - Other'}
	           ],
	           model: 'ReferenceTable'
	        });

		this.formContainer = new Ext.form.FormPanel({
			id:'form_capture',
			scroll: false,
			items: [{
				xtype: 'fieldset',
				scroll: false,
				title: 'Enter new hazard',
				items: [{
					xtype: 'selectfield',
					label: 'Property',
					name:'prop_num',
					id:'prop_num',
					valueField : 'prop_num',
					displayField : 'label',
					store : propertyAddressStore,
					// By construction, this field will always be populated - so we technically don't have to mark it as required
					 required: true
		                },
				{
					xtype: 'textfield',
					label: 'Comments',
					name:'comments'
		                },
				{
					xtype: 'selectfield',
					label: 'Type',
					name:'haz_type',
					id:'haz_type',
					valueField : 'id',
					displayField : 'label',
					store : hazardTypeDataStore,
					// By construction, this field will always be populated - so we technically don't have to mark it as required
					 required: true
		                },
				{  
					xtype:'hiddenfield',
					name:'lat', 
					value: map.getCenter().transform(sm,gg).lat
				},
				{  
					xtype:'hiddenfield',
					name:'lon',
					value: map.getCenter().transform(sm,gg).lon
				},
				{  
					xtype:'hiddenfield',
					name:'config',
					value: 'mitchellgis'
				}  
		                ]
			}],
//			listeners : {
//				submit : function(form, result){
//					console.log('success', Ext.toArray(arguments));
//				},
//				exception : function(form, result){
//					console.log('failure', Ext.toArray(arguments));
//				}
//			},
            
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'bottom',
				items: [{
//                            text: 'Load closest properties',
//                            ui: 'round',
//                            handler: function() {
//				// Refresh the combo manually first	
//				var latlon = map.getCenter();
//				latlon.transform(sm, gg);
//				propertyAddressStore.load({params:{longitude:latlon.lon,latitude:latlon.lat}});
//                            }
//                        },
//				{
					text: 'Cancel',
					handler: function() {
						// Important: clear the store elements before resetting the form
						while(propertyAddressStore.getCount()>0)
						{
							propertyAddressStore.removeAt(0);
						}
						Ext.getCmp('form_capture').reset();
						app.captureFormPopupPanel.hide();
					}
				},
				{xtype: 'spacer'},
				{
					text: 'Save',
					ui: 'confirm',
					handler: function() {
						Ext.getCmp('form_capture').submit({
							url: '/ws/rest/v3/ws_create_property_fire_hazard.php',
							submitEmptyText: false,
							waitMsg: 'Saving ...',
							success: on_capture_success,
							failure: on_capture_failure
						});
					}
				}]
			}]
		});
        
		var on_capture_success = function(form, action){
			// Important: clear the store elements before resetting the form
			while(propertyAddressStore.getCount()>0)
			{
				propertyAddressStore.removeAt(0);
			}
			Ext.getCmp('form_capture').reset();
			app.captureFormPopupPanel.hide();
			
			// Reload the vector layer - it should contain the new point
			getFeatures();
		};

		var on_capture_failure = function(form, action){
			alert("Capture failed");
		};
        
		this.items = [{
			xtype: 'panel',
			layout: 'fit',
			items: [this.formContainer]
		}];
		App.CaptureFormPopupPanel.superclass.initComponent.call(this);
	},
	listeners : {
		show:function(){
			if (propertyAddressStore)
		    	{
				if (propertyAddressStore.getCount() > 0)
				{
					// This should not happen as we empty the store on save and cancel
					alert('store exists and is populated');
					
				}
				else
				{
					// Populate the combo on show
					var latlon = map.getCenter();
					latlon.transform(sm, gg);
					propertyAddressStore.load({params:{longitude:latlon.lon,latitude:latlon.lat,config:'mitchellgis'}});

				}				
			}
			else
			{
				// Unclear if this is a valid scenario
				alert('store does not exist');
			}
		    },
	}

});



App.CaptureUpdateFormPopupPanel = Ext.extend(Ext.Panel, {
	map: null,
	feature: null,
	floating: true,
	modal: true,
	centered: true,
	// Deactivated mask on tap to allow for selection in the drop down list
	hideOnMaskTap: false,
	width: Ext.is.Phone ? undefined : 400,
	height: Ext.is.Phone ? undefined : 400,
	scroll: false,
	layout: 'fit',
	fullscreen: Ext.is.Phone ? true : undefined,
	errorText: 'Sorry, we had problems communicating with the Pozi server. Please try again.',
	errorTitle: 'Communication error',

	setFeature: function(f){
		this.formContainer.setValues({
			'prop_num2':f.data.add_label,
			'comments':f.data.comments,
			'haz_type':f.data.haz_type,
			'haz_status':f.data.haz_status,
			'haz_id':f.data.id
		});
		
	},
        
	initComponent: function(){
		Ext.regModel('ReferenceTable', {
			// Potential issue if property numbers are repeated or missing - would be better to use a real PK for the Id field
			idProperty:'id',
			fields: [
				{name: 'id',     type: 'string'},
				{name: 'label',    type: 'string'}
			]
		});
		
		hazardTypeDataStore = new Ext.data.JsonStore({
	           data : [
	                { id : '1',  label : '1 - Full Cut'},
	                { id : '2', label : '2 - Fire Break'},
	                { id : '3', label : '3 - Other'}
	           ],
	           model: 'ReferenceTable'
	        });

		hazardStatusDataStore = new Ext.data.JsonStore({
	           data : [
	                { id : '1',  label : ''},
	                { id : '2', label : 'Non Compliant'}
	           ],
	           model: 'ReferenceTable'
	        });

    
		this.formContainer = new Ext.form.FormPanel({
			id:'form_capture_update',
			scroll: false,
			items: [{
				xtype: 'fieldset',
				scroll: false,
				title: 'Update existing hazard',
				items: [{
					xtype: 'textfield',
					label: 'Property',
					name:'prop_num2',
					id:'prop_num2',
					disabled: true,
					 required: true,
					 value: clickedFeature.data.add_label
		                },
				{
					xtype: 'textfield',
					label: 'Comments',
					name:'comments',
					value: clickedFeature.data.comments
		                },
				{
					xtype: 'selectfield',
					label: 'Type',
					name:'haz_type',
					id:'haz_type',
					valueField : 'id',
					displayField : 'label',
					store : hazardTypeDataStore,
					// By construction, this field will always be populated - so we technically don't have to mark it as required
					 required: true,
					 value: clickedFeature.data.haz_type
		                },
				{
					xtype: 'selectfield',
					label: 'Status',
					name:'haz_status',
					id:'haz_status',
					valueField : 'id',
					displayField : 'label',
					store : hazardStatusDataStore,
					// By construction, this field will always be populated - so we technically don't have to mark it as required
					 required: false,
					 value: clickedFeature.data.haz_status
		                },
				{  
					xtype:'hiddenfield',
					name:'haz_id',
					value: clickedFeature.data.id
				},
				{  
					xtype:'hiddenfield',
					name:'config',
					value: 'mitchellgis'				}

		                ]
			}],
            
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'bottom',
				items: [{
					text: 'Cancel',
					handler: function() {
						// Something wrong in this handler - we can't click twice on the same pin
						Ext.getCmp('form_capture_update').reset();
						app.captureUpdateFormPopupPanel.hide();
						selectControl.unselectAll();
					}
				},
				{xtype: 'spacer'},
				{
				    text: 'Delete',
				    ui: 'decline-round',
				    handler: function() {
				    
					Ext.Msg.confirm("Are you sure you want to delete this fire hazard? This operation can not be undone.", "", 
						function(e){
							if(e == 'yes')
							{
								// Call the delete service	
								Ext.Ajax.request({
								  loadMask: true,
								  url: '/ws/rest/v3/ws_delete_property_fire_hazard.php',
								  params: {
										haz_id: clickedFeature.data.id
									},
								  success: on_capture_success,
								  failure: on_capture_failure
								});
							}
						}
				    	);		

				    }			
				},
				{xtype: 'spacer'},				
				{
					text: 'Save',
					ui: 'confirm',
					handler: function() {
						Ext.getCmp('form_capture_update').submit({
							url: '/ws/rest/v3/ws_update_property_fire_hazard.php',
							submitEmptyText: false,
							waitMsg: 'Saving ...',
							success: on_capture_success,
							failure: on_capture_failure
						});
					}
				}]
			}]
		});
        
		var on_capture_success = function(form, action){
			// Important: clear the store elements before resetting the form
//			while(propertyAddressStoreUpdate.getCount()>0)
//			{
//				propertyAddressStoreUpdate.removeAt(0);
//			}
			Ext.getCmp('form_capture_update').reset();
			app.captureUpdateFormPopupPanel.hide();
			
			// Reload the vector layer - it should contain the new point
			getFeatures();
		};

		var on_capture_failure = function(form, action){
			alert("Capture failed");
		};
        
		this.items = [{
			xtype: 'panel',
			layout: 'fit',
			items: [this.formContainer]
		}];
		App.CaptureUpdateFormPopupPanel.superclass.initComponent.call(this);
	},
	listeners : {
		show:function(){
//			if (propertyAddressStoreUpdate)
//		    	{
//				if (propertyAddressStoreUpdate.getCount() > 0)
//				{
//					// Not a problem, we have a record in there
//					//alert('store exists and is populated');
//					
//				}
//				else
//				{
//					// Populate the combo on show
//					// Not necessary anymore
//				}				
//			}
//			else
//			{
//				// Unclear if this is a valid scenario
//				alert('store does not exist');
//			}
	    },
	}

});