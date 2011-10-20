Ext.namespace("GeoExt.ux");
GeoExt.ux.PrintPreview = Ext.extend(Ext.Container, {
	paperSizeText: "Paper size:",
	resolutionText: "Resolution:",
	printText: "Print",
	emptyTitleText: "Enter map title here.",
	includeLegendText: "Include legend?",
	emptyCommentText: "Enter comments here.",
	creatingPdfText: "Creating PDF...",
	printProvider: null,
	sourceMap: null,
	printMapPanel: null,
	mapTitleField: "mapTitle",
	commentField: "comment",
	legend: null,
	includeLegend: false,
	mapTitle: null,
	comment: null,
	addMapOverlay: true,
	busyMask: null,
	form: null,
	autoEl: "center",
	cls: "x-panel-body x-panel-body-noheader",
	initComponent: function () {
		var printMapPanelOptions = {
			sourceMap: this.sourceMap,
			printProvider: this.printProvider
		};
		if (this.printMapPanel) {
			if (!(this.printMapPanel instanceof GeoExt.PrintMapPanel)) {
				printMapPanelOptions.xtype = "gx_printmappanel"
				this.printMapPanel = new GeoExt.PrintMapPanel(Ext.applyIf(this.printMapPanel, printMapPanelOptions));
			}
		} else {
			this.printMapPanel = new GeoExt.PrintMapPanel(printMapPanelOptions);
		}
		this.sourceMap = this.printMapPanel.sourceMap;
		this.printProvider = this.printMapPanel.printProvider;
		this.form = this.createForm();
		if (!this.items) {
			this.items = [];
		}
		this.items.push(this.createToolbar(), {
			xtype: "container",
			cls: "gx-printpreview",
			autoHeight: this.autoHeight,
			autoWidth: this.autoWidth,
			items: [this.form, this.printMapPanel]
		});
		GeoExt.ux.PrintPreview.superclass.initComponent.call(this);
		this.addMapOverlay && this.printMapPanel.add(this.createMapOverlay());
		this.printMapPanel.on({
			"resize": this.updateSize,
			scope: this
		});
		this.on({
			"render": function () {
				if (!this.busyMask) {
					this.busyMask = new Ext.LoadMask(this.getEl(), {
						msg: this.creatingPdfText
					});
				}
				this.printProvider.on({
					"beforeprint": this.busyMask.show,
					"print": this.busyMask.hide,
					"printexception": this.busyMask.hide,
					scope: this.busyMask
				});
			},
			scope: this
		});
	},
	createToolbar: function () {
		var items = [];

		var store_dpi_data = [['150', 'low-res'],['300', 'hi-res']];
		var store_dpi = new Ext.data.ArrayStore({
			fields: ['value', 'name'],
			data : store_dpi_data 
		});
		
		// Display the template drop down even if there is only 1 template
		//this.printProvider.layouts.getCount() > 1 && 
		items.push(this.paperSizeText, {
			xtype: "combo",
			width: 98,
			plugins: new GeoExt.plugins.PrintProviderField({
				printProvider: this.printProvider
			}),
			store: this.printProvider.layouts,
			displayField: "name",
			typeAhead: true,
			mode: "local",
			forceSelection: true,
			triggerAction: "all",
			selectOnFocus: true
		}, "&nbsp;");
		this.printProvider.dpis.getCount() > 1 && items.push(this.resolutionText, {
			xtype: "combo",
			width: 62,
			id: 'combo-dpi',
			//plugins: new GeoExt.plugins.PrintProviderField({
			//	printProvider: this.printProvider
			//}),
			//store: this.printProvider.dpis,
			store: store_dpi,
			displayField: "name",
			valueField: "value",
			//tpl: '<tpl for="."><div class="x-combo-list-item">{name} dpi</div></tpl>',
			typeAhead: true,
			mode: "local",
			forceSelection: true,
			triggerAction: "all",
			selectOnFocus: true,
//			autoSelect: true,
			allowBlank: false,
			value:'hi-res',
//			setValue: function (v) {
//				v = parseInt(v) + " dpi";
//				Ext.form.ComboBox.prototype.setValue.apply(this, arguments);
//			}
		}, "&nbsp;");
		items.push("->", {
			text: this.printText,
			iconCls: "icon-print",
			handler: function () {
				this.printMapPanel.print(this.includeLegend && {
					legend: this.legend
				});
			},
			scope: this
		});
		return {
			xtype: "toolbar",
			items: items
		};
	},
	createForm: function () {
		var titleCfg = {
			xtype: "textfield",
			name: this.mapTitleField,
			value: this.mapTitle,
			emptyText: this.emptyTitleText,
			margins: "0 5 0 0",
			flex: 1,
			anchor: "100%",
			hideLabel: true,
			plugins: new GeoExt.plugins.PrintProviderField({
				printProvider: this.printProvider
			})
		};
		if (this.legend) {
			var legendCheckbox = new Ext.form.Checkbox({
				name: "legend",
				checked: this.includeLegend,
				boxLabel: this.includeLegendText,
				hideLabel: true,
				ctCls: "gx-item-nowrap",
				handler: function (cb, checked) {
					this.includeLegend = checked;
				},
				scope: this
			});
		}
		return new Ext.form.FormPanel({
			autoHeight: true,
			border: false,
			defaults: {
				anchor: "100%"
			},
			items: [this.legend ? {
				xtype: "container",
				layout: "hbox",
				cls: "x-form-item",
				items: [titleCfg, legendCheckbox]
			} : titleCfg,
//			{
//				xtype: "textarea",
//				name: this.commentField,
//				value: this.comment,
//				emptyText: this.emptyCommentText,
//				hideLabel: true,
//				plugins: new GeoExt.plugins.PrintProviderField({
//					printProvider: this.printProvider
//				})
//			}
			]
		});
	},
	createMapOverlay: function () {
		var scaleLine = new OpenLayers.Control.ScaleLine();
		this.printMapPanel.map.addControl(scaleLine);
		scaleLine.activate();
		return new Ext.Panel({
			cls: "gx-map-overlay",
			layout: "column",
			width: 235,
			bodyStyle: "padding:5px",
			items: [{
				xtype: "box",
				el: scaleLine.div,
				width: scaleLine.maxWidth
			}, {
				xtype: "container",
				layout: "form",
				style: "padding: .2em 5px 0 0;",
				columnWidth: 1,
				cls: "x-small-editor x-form-item",
				items: {
					xtype: "combo",
					name: "scale",
					anchor: "100%",
					hideLabel: true,
					store: this.printMapPanel.previewScales,
					displayField: "name",
					typeAhead: true,
					mode: "local",
					forceSelection: true,
					triggerAction: "all",
					selectOnFocus: true,
					getListParent: function () {
						return this.el.up(".x-window") || document.body;
					},
					plugins: new GeoExt.plugins.PrintPageField({
						printPage: this.printMapPanel.printPage
					})
				}
			}, {
				xtype: "box",
				autoEl: {
					tag: "div",
					cls: "gx-northarrow"
				}
			}],
			listeners: {
				"render": function () {
					function stop(evt) {
						evt.stopPropagation();
					}
					this.getEl().on({
						"click": stop,
						"dblclick": stop,
						"mousedown": stop
					});
				}
			}
		});
	},
	updateSize: function () {
		this.suspendEvents();
		var mapWidth = this.printMapPanel.getWidth();
		this.form.setWidth(mapWidth);
		this.form.items.get(0).setWidth(mapWidth);
		var minWidth = this.initialConfig.minWidth || 0;
		this.items.get(0).setWidth(this.form.ownerCt.el.getPadding("lr") + Math.max(mapWidth, minWidth));
		var parent = this.ownerCt;
		if (parent && parent instanceof Ext.Window) {
			this.ownerCt.syncShadow();
		}
		this.resumeEvents();
	},
	beforeDestroy: function () {
		if (this.busyMask) {
			this.printProvider.un("beforeprint", this.busyMask.show, this.busyMask);
			this.printProvider.un("print", this.busyMask.hide, this.busyMask);
		}
		this.printMapPanel.un("resize", this.updateSize, this);
		GeoExt.ux.PrintPreview.superclass.beforeDestroy.apply(this, arguments);
	}
});
Ext.reg("gxux_printpreview", GeoExt.ux.PrintPreview);