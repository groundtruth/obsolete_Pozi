Ext.USE_NATIVE_JSON = true;
(function () {
	Ext.preg("gx_wmssource", gxp.plugins.WMSSource);
	Ext.preg("gx_olsource", gxp.plugins.OLSource);
	Ext.preg("gx_googlesource", gxp.plugins.GoogleSource);
	Ext.preg("gx_bingsource", gxp.plugins.BingSource);
	Ext.preg("gx_osmsource", gxp.plugins.OSMSource);
})();

var GeoExplorer = Ext.extend(gxp.Viewer, {
	zoomSliderText: "<div>Zoom Level: {zoom}</div><div>Scale: 1:{scale}</div>",
	loadConfigErrorText: "Trouble reading saved configuration: <br />",
	loadConfigErrorDefaultText: "Server Error.",
	xhrTroubleText: "Communication Trouble: Status ",
	layersText: "Layers",
	titleText: "Title",
	saveErrorText: "Trouble saving: ",
	bookmarkText: "Bookmark URL",
	permakinkText: 'Permalink',
	appInfoText: "GeoExplorer",
	aboutText: "About GeoExplorer",
	mapInfoText: "Map Info",
	descriptionText: "Description",
	contactText: "Contact",
	aboutThisMapText: "About this Map",
	mapPanel: null,
	toggleGroup: "toolGroup",
	constructor: function (config) {
		this.mapItems = [{
			xtype: "gxp_scaleoverlay"
		}, {
			xtype: "gx_zoomslider",
			vertical: true,
			height: 100,
			plugins: new GeoExt.ZoomSliderTip({
				template: this.zoomSliderText
			})
		}];
		config.viewerTools = [{
			leaf: true,
			text: gxp.plugins.Navigation.prototype.tooltip,
			checked: true,
			iconCls: "gxp-icon-pan",
			ptype: "gxp_navigation",
			toggleGroup: this.toggleGroup,
			actionTarget: {
				target: "paneltbar",
				index: 2
			}
		}, {
			leaf: true,
			text: gxp.plugins.WMSGetFeatureInfo.prototype.infoActionTip,
			checked: true,
			iconCls: "gxp-icon-getfeatureinfo",
			ptype: "gxp_wmsgetfeatureinfo",
			toggleGroup: this.toggleGroup,
			actionTarget: {
				target: "paneltbar",
				index: 3
			}
		}, {
			leaf: true,
			text: gxp.plugins.Measure.prototype.measureTooltip,
			checked: true,
			iconCls: "gxp-icon-measure-length",
			ptype: "gxp_measure",
			toggleGroup: this.toggleGroup,
			actionTarget: {
				target: "paneltbar",
				index: 4
			}
		}, {
			leaf: true,
			text: gxp.plugins.Zoom.prototype.zoomInTooltip + " / " + gxp.plugins.Zoom.prototype.zoomOutTooltip,
			checked: true,
			iconCls: "gxp-icon-zoom-in",
			ptype: "gxp_zoom",
			actionTarget: {
				target: "paneltbar",
				index: 5
			}
		}, {
			leaf: true,
			text: gxp.plugins.NavigationHistory.prototype.previousTooltip + " / " + gxp.plugins.NavigationHistory.prototype.nextTooltip,
			checked: true,
			iconCls: "gxp-icon-zoom-previous",
			ptype: "gxp_navigationhistory",
			actionTarget: {
				target: "paneltbar",
				index: 7
			}
		}, {
			leaf: true,
			text: gxp.plugins.ZoomToExtent.prototype.tooltip,
			checked: true,
			iconCls: gxp.plugins.ZoomToExtent.prototype.iconCls,
			ptype: "gxp_zoomtoextent",
			actionTarget: {
				target: "paneltbar",
				index: 9
			}
		}, {
			leaf: true,
			text: gxp.plugins.Legend.prototype.tooltip,
			checked: true,
			iconCls: "gxp-icon-legend",
			ptype: "gxp_legend",
			actionTarget: {
				target: "paneltbar",
				index: 10
			}
		}, {
			leaf: true,
			text: gxp.plugins.GoogleEarth.prototype.tooltip,
			checked: true,
			iconCls: "gxp-icon-googleearth",
			ptype: "gxp_googleearth",
			actionTarget: {
				target: "paneltbar",
				index: 11
			}
		}];
		GeoExplorer.superclass.constructor.apply(this, arguments);
	},
	loadConfig: function (config) {
		var mapUrl = window.location.hash.substr(1);
		var match = mapUrl.match(/^maps\/(\d+)$/);
		if (match) {
			this.id = Number(match[
			1]);
			OpenLayers.Request.GET({
				url: mapUrl,
				success: function (request) {
					var addConfig = Ext.util.JSON.decode(request.responseText);
					this.applyConfig(Ext.applyIf(addConfig, config));
				},
				failure: function (request) {
					var obj;
					try {
						obj = Ext.util.JSON.decode(request.responseText);
					} catch (err) {

					}
					var msg = this.loadConfigErrorText;
					if (obj && obj.error) {
						msg += obj.error;
					} else {
						msg += this.loadConfigErrorDefaultText;
					}
					this.on({
						ready: function () {
							this.displayXHRTrouble(msg, request.status);
						},
						scope: this
					});
					delete this.id;
					window.location.hash = "";
					this.applyConfig(config);
				},
				scope: this
			});
		} else {
			var query = Ext.urlDecode(document.location.search.substr(1));
			if (query && query.q) {
				var queryConfig = Ext.util.JSON.decode(query.q);
				Ext.apply(config, queryConfig);
			}
			this.applyConfig(config);
		}
	},
	displayXHRTrouble: function (msg, status) {
		Ext.Msg.show({
			title: this.xhrTroubleText + status,
			msg: msg,
			icon: Ext.MessageBox.WARNING
		});
	},
	initPortal: function () {
		var westPanel = new Ext.Panel({
			border: false,
			layout: "border",
			region: "west",
			width: 250,
			split: true,
			collapsible: true,
			collapseMode: "mini",
			header: false,
			items: [{
				region: 'center',
				autoScroll: true,
				tbar: [

				],
				border: false,
				id: 'tree',
				title: this.layersText
			}, {
				region: 'south',
				xtype: "container",
				layout: "fit",
				border: false,
				height: 200,
				id: 'legend'
			}]
		});
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
		this.portalItems = [{
			region: "center",
			layout: "border",
			tbar: this.toolbar,
			items: [
			this.mapPanelContainer, westPanel]
		}];
		GeoExplorer.superclass.initPortal.apply(this, arguments);
	},
	createTools: function () {
//		var tools = ["-"];
		var tools = [];
		return tools;
	},
	save: function (callback, scope) {
		var configStr = Ext.util.JSON.encode(this.getState());
		var method, url;
		if (this.id) {
			method = "PUT";
			url = "maps/" + this.id;
		} else {
			method = "POST";
			url = "maps";
		}
		OpenLayers.Request.issue({
			method: method,
			url: url,
			data: configStr,
			callback: function (request) {
				this.handleSave(request);
				if (callback) {
					callback.call(scope || this);
				}
			},
			scope: this
		});
	},
	handleSave: function (request) {
		if (request.status == 200) {
			var config = Ext.util.JSON.decode(request.responseText);
			var mapId = config.id;
			if (mapId) {
				this.id = mapId;
				window.location.hash = "#maps/" + mapId;
			}
		} else {
			throw this.saveErrorText + request.responseText;
		}
	},
	showUrl: function () {
		var win = new Ext.Window({
			title: this.bookmarkText,
			layout: 'form',
			labelAlign: 'top',
			modal: true,
			bodyStyle: "padding: 5px",
			width: 300,
			items: [{
				xtype: 'textfield',
				fieldLabel: this.permakinkText,
				readOnly: true,
				anchor: "100%",
				selectOnFocus: true,
				value: window.location.href
			}]
		});
		win.show();
		win.items.first().selectText();
	},
	getBookmark: function () {
		var params = Ext.apply(OpenLayers.Util.getParameters(), {
			q: Ext.util.JSON.encode(this.getState())
		});
		var url = document.location.href.split("?").shift() + "?" + Ext.urlEncode(params);
		return url;
	},
	displayAppInfo: function () {
		var appInfo = new Ext.Panel({
			title: this.appInfoText,
			html: "<iframe style='border: none; height: 100%; width: 100%' src='about.html' frameborder='0' border='0'><a target='_blank' href='about.html'>" + this.aboutText + "</a> </iframe>"
		});
		var about = Ext.applyIf(this.about, {
			title: '',
			"abstract": '',
			contact: ''
		});
		var mapInfo = new Ext.Panel({
			title: this.mapInfoText,
			html: '<div class="gx-info-panel">' + '<h2>' + this.titleText + '</h2><p>' + about.title + '</p><h2>' + this.descriptionText + '</h2><p>' + about['abstract'] + '</p> <h2>' + this.contactText + '</h2><p>' + about.contact + '</p></div>',
			height: 'auto',
			width: 'auto'
		});
		var tabs = new Ext.TabPanel({
			activeTab: 0,
			items: [
			mapInfo, appInfo]
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
	}
});

GeoExplorer.Composer = Ext.extend(GeoExplorer, {
	saveMapText: "Save Map",
	exportMapText: "Export Map",
	toolsTitle: "Choose tools to include in the toolbar:",
	previewText: "Preview",
	backText: "Back",
	nextText: "Next",
	loginText: "Login",
	loginErrorText: "Invalid username or password.",
	userFieldText: "User",
	passwordFieldText: "Password",
	constructor: function (config) {
		if (config.authStatus === 401) {
			this.authorizedRoles = [

			];
		} else {
			this.authorizedRoles = ["ROLE_ADMINISTRATOR"];
		}
		delete config.authStatus;
		/*
		config.tools = [{
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
			actionTarget: ["tree.tbar", "layertree.contextMenu"]
		}, {
			ptype: "gxp_layerproperties",
			actionTarget: ["tree.tbar", "layertree.contextMenu"]
		}, {
			ptype: "gxp_styler",
			actionTarget: ["tree.tbar", "layertree.contextMenu"]
		}, {
			ptype: "gxp_zoomtolayerextent",
			actionTarget: {
				target: "layertree.contextMenu",
				index: 0
			}
		}, {
			ptype: "gxp_navigation",
			toggleGroup: this.toggleGroup,
			actionTarget: {
				target: "paneltbar",
				index: 6
			}
		}, {
			ptype: "gxp_wmsgetfeatureinfo",
			toggleGroup: this.toggleGroup,
			actionTarget: {
				target: "paneltbar",
				index: 7
			}
		}, {
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
			ptype: "gxp_measure",
			toggleGroup: this.toggleGroup,
			actionTarget: {
				target: "paneltbar",
				index: 8
			}
		}, {
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
			printService: config.printService,
			actionTarget: {
				target: "paneltbar",
				index: 5
			}
		}, {
			ptype: "gxp_googleearth",
			actionTarget: {
				target: "paneltbar",
				index: 9
			},
			apiKey: 'ABQIAAAAeDjUod8ItM9dBg5_lz0esxTnme5EwnLVtEDGnh-lFVzRJhbdQhQBX5VH8Rb3adNACjSR5kaCLQuBmw'
		}];
		*/
		GeoExplorer.Composer.superclass.constructor.apply(this, arguments);
	},
	destroy: function () {
		this.loginButton = null;
		GeoExplorer.Composer.superclass.destroy.apply(this, arguments);
	},
	showLoginDialog: function () {
		var panel = new Ext.FormPanel({
			url: "login",
			frame: true,
			labelWidth: 60,
			defaultType: "textfield",
			errorReader: {
				read: function (response) {
					var success = false;
					var records = [

					];
					if (response.status === 200) {
						success = true;
					} else {
						records = [{
							data: {
								id: "username",
								msg: this.loginErrorText
							}
						}, {
							data: {
								id: "password",
								msg: this.loginErrorText
							}
						}];
					}
					return {
						success: success,
						records: records
					};
				}
			},
			items: [
			{
				fieldLabel: this.userFieldText,
				name: "username",
				allowBlank: false
			}, {
				fieldLabel: this.passwordFieldText,
				name: "password",
				inputType: "password",
				allowBlank: false
			},{
				xtype:"label",
				cls: "x-form-item",
				text: "Note: your map will be refreshed.",
				name: "lblLogin"
			}],
			buttons: [{
				text: this.loginText,
				formBind: true,
				handler: submitLogin,
				scope: this
			}],
			keys: [{
				key: [
				Ext.EventObject.ENTER],
				handler: submitLogin,
				scope: this
			}]
		});

		function submitLogin() {
			panel.buttons[0].disable();

			// Prefixes the username with the workspace name
			win.hide();
			var typedUsername=panel.getForm().items.items[0].getValue();
			if (typedUsername != "admin")
			{
				panel.getForm().items.items[0].setValue(gtWorkspaceName+"."+typedUsername);
			}
			//
			panel.getForm().submit({
				success: function (form, action) {
					var cookie = action.response.getResponseHeader("Set-Cookie");
					if (cookie) {
						document.cookie = cookie;
					}
					this.authorizedRoles = ["ROLE_ADMINISTRATOR"];
					Ext.getCmp('paneltbar').items.each(function (tool) {
						if (tool.needsAuthorization === true) {
							tool.enable();
						}
					});
					this.loginButton.hide();
					win.close();
					// Issue with users having to refresh the page to access their priviledged functionalities
					window.location.reload();
				},
				failure: function (form, action) {
					// Reset the username to what was initially typed, and show the login window
					panel.getForm().items.items[0].setValue(typedUsername);
					win.show();
					//
					this.authorizedRoles = [

					];
					panel.buttons[0].enable();
					form.markInvalid({
						"username": this.loginErrorText,
						"password": this.loginErrorText
					});
				},
				scope: this
			});
		}
		var win = new Ext.Window({
			title: this.loginText,
			layout: "fit",
			width: 235,
			// Changed to make the login refresh message visible
			height: 145,
			plain: true,
			border: false,
			modal: true,
			items: [
			panel]
		});
		win.show();
	},
	createTools: function () {
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
		var aboutButton = new Ext.Button({
			text: this.appInfoText,
			iconCls: "icon-geoexplorer",
			handler: this.displayAppInfo,
			scope: this
		});
		tools.unshift("-");
		tools.unshift(new Ext.Button({
			tooltip: this.exportMapText,
			needsAuthorization: true,
			disabled: !this.isAuthorized(),
			handler: function () {
				this.save(this.showEmbedWindow);
			},
			scope: this,
			iconCls: 'icon-export'
		}));
		tools.unshift(new Ext.Button({
			tooltip: this.saveMapText,
			needsAuthorization: true,
			disabled: !this.isAuthorized(),
			handler: function () {
				this.save(this.showUrl);
			},
			scope: this,
			iconCls: "icon-save"
		}));
		tools.unshift("-");
		tools.unshift(aboutButton);
		return tools;
	},
	openPreview: function (embedMap) {
		var preview = new Ext.Window({
			title: this.previewText,
			layout: "fit",
			items: [{
				border: false,
				html: embedMap.getIframeHTML()
			}]
		});
		preview.show();
		var body = preview.items.get(0).body;
		var iframe = body.dom.firstChild;
		var loading = new Ext.LoadMask(body);
		loading.show();
		Ext.get(iframe).on('load', function () {
			loading.hide();
		});
	},
	showEmbedWindow: function () {
		var toolsArea = new Ext.tree.TreePanel({
			title: this.toolsTitle,
			autoScroll: true,
			root: {
				nodeType: 'async',
				expanded: true,
				children: this.viewerTools
			},
			rootVisible: false,
			id: 'geobuilder-0'
		});
		var previousNext = function (incr) {
			var l = Ext.getCmp('geobuilder-wizard-panel').getLayout();
			var i = l.activeItem.id.split('geobuilder-')[
			1];
			var next = parseInt(i, 10) + incr;
			l.setActiveItem(next);
			Ext.getCmp('wizard-prev').setDisabled(next == 0);
			Ext.getCmp('wizard-next').setDisabled(next == 1);
			if (incr == 1) {
				this.save();
			}
		};
		var embedMap = new gxp.EmbedMapDialog({
			id: 'geobuilder-1',
			url: "viewer" + "#maps/" + this.id
		});
		var wizard = {
			id: 'geobuilder-wizard-panel',
			border: false,
			layout: 'card',
			activeItem: 0,
			defaults: {
				border: false,
				hideMode: 'offsets'
			},
			bbar: [{
				id: 'preview',
				text: this.previewText,
				handler: function () {
					this.save(this.openPreview.createDelegate(this, [
					embedMap]));
				},
				scope: this
			}, '->',
			{
				id: 'wizard-prev',
				text: this.backText,
				handler: previousNext.createDelegate(this, [-1]),
				scope: this,
				disabled: true
			}, {
				id: 'wizard-next',
				text: this.nextText,
				handler: previousNext.createDelegate(this, [
				1]),
				scope: this
			}],
			items: [
			toolsArea, embedMap]
		};
		new Ext.Window({
			layout: 'fit',
			width: 500,
			height: 300,
			title: this.exportMapText,
			items: [
			wizard]
		}).show();
	}
});

Ext.namespace("GeoExplorer");
GeoExplorer.Viewer = Ext.extend(GeoExplorer, {
	applyConfig: function (config) {
		var allTools = config.viewerTools || this.viewerTools;
		var tools = [

		];
		for (var i = 0, len = allTools.length; i < len; i++) {
			var tool = allTools[
			i];
			if (tool.checked === true) {
				tools.push({
					ptype: tool.ptype,
					toggleGroup: tool.toggleGroup,
					actionTarget: tool.actionTarget
				});
			}
		}
		config.tools = tools;
		GeoExplorer.Viewer.superclass.applyConfig.call(this, config);
	},
	initPortal: function () {
		this.toolbar = new Ext.Toolbar({
			disabled: true,
			id: "paneltbar",
			items: this.createTools()
		});
		this.on("ready", function () {
			this.toolbar.enable();
		}, this);
		this.mapPanelContainer = new Ext.Panel({
			layout: "card",
			region: "center",
			defaults: {
				border: false
			},
			items: [
			this.mapPanel, new gxp.GoogleEarthPanel({
				mapPanel: this.mapPanel,
				listeners: {
					beforeadd: function (record) {
						return record.get("group") !== "background";
					}
				}
			})],
			activeItem: 0
		});
		this.portalItems = [{
			region: "center",
			layout: "border",
			tbar: this.toolbar,
			items: [
			this.mapPanelContainer]
		}];
		GeoExplorer.superclass.initPortal.apply(this, arguments);
	},
	createTools: function () {
		var tools = GeoExplorer.Viewer.superclass.createTools.apply(this, arguments);
		var layerChooser = new Ext.Button({
			tooltip: 'Layer Switcher',
			iconCls: 'icon-layer-switcher',
			menu: new gxp.menu.LayerMenu({
				layers: this.mapPanel.layers
			})
		});
		tools.unshift("-");
		tools.unshift(layerChooser);
		var aboutButton = new Ext.Button({
			tooltip: this.aboutText,
			iconCls: "icon-about",
			handler: this.displayAppInfo,
			scope: this
		});
		tools.push("->");
		tools.push(aboutButton);
		return tools;
	}
});