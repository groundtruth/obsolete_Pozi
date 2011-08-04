Instructions

1) replace Openlayers.js with the latest release
It has to include support for WFS layers, protocol and all functions we added to the geoexplorer base



2) gxp.js
As of 4/8/2011, the manual fixes introduced to cater for namespaced workspaces and Apache fronting are:

5768,5769d5768
<         // Temporary fix for workspaced layers - solves the authorised when editing a style (the cookie is for http://localhost/
<         config.baseUrl = config.baseUrl.replace(/\/(BULOKE|MITCHELL|CENTRALGOLDFIELDS)/, "").replace(/:8080/, "");
5816,5818c5814
<                         // Temporary fix
<                         //url: this.baseUrl + "/layers/" + this.target.layerRecord.get("name") + "/styles.json",
<                         url: this.baseUrl + "/layers/" + this.target.layerRecord.get("name").replace(/(BULOKE|MITCHELL|CENTRALGOLDFIELDS):/, "") + "/styles.json",
---
>                         url: this.baseUrl + "/layers/" + this.target.layerRecord.get("name") + "/styles.json",
5846,5847c5842
<             // Temporary fix
<             url: this.baseUrl + "/layers/" + this.target.layerRecord.get("name").replace(/(BULOKE|MITCHELL|CENTRALGOLDFIELDS):/, "") + ".json",
---
>             url: this.baseUrl + "/layers/" + this.target.layerRecord.get("name") + ".json",
7994,7996c7989
<                 // Original did not allow vector layers to print 
<                 //return (layer instanceof OpenLayers.Layer.WMS || layer instanceof OpenLayers.Layer.OSM);
<                 return (layer instanceof OpenLayers.Layer.WMS || layer instanceof OpenLayers.Layer.OSM || layer instanceof OpenLayers.Layer.Vector);
---
>                 return (layer instanceof OpenLayers.Layer.WMS || layer instanceof OpenLayers.Layer.OSM);
8097,8101c8090
<                             // Temporary workaround for Central Goldfields demo
<                             //var url = source.url.split("?").shift().replace(/\/(wms|ows)\/?$/, "/rest");
<                             var url = source.url.split("?").shift().replace(/\/(BULOKE|CENTRALGOLDFIELDS|MITCHELL)\/(wms|ows)\/?$/, "/rest");
<                             url = url.replace(/http:\/\/localhost:8080/, "");
<                             url = url.replace(/http:\/\/localhost/, "");
---
>                             var url = source.url.split("?").shift().replace(/\/(wms|ows)\/?$/, "/rest");



3) GeoExplorer.js
As of 4/8/2011, the manual fixes to cater for site-specific configuration files are:

288,289c288
< //		var tools = ["-"];
< 		var tools = [];
---
> 		var tools = ["-"];
408d407
< 		/*
455,467c453,465
< //			ptype: "gxp_featuremanager",
< //			id: "featuremanager",
< //			maxFeatures: 20
< //		}, {
< //			ptype: "gxp_featureeditor",
< //			featureManager: "featuremanager",
< //			autoLoadFeatures: true,
< //			toggleGroup: this.toggleGroup,
< //			actionTarget: {
< //				target: "paneltbar",
< //				index: 6
< //			}
< //		}, {
---
> 			ptype: "gxp_featuremanager",
> 			id: "featuremanager",
> 			maxFeatures: 20
> 		}, {
> 			ptype: "gxp_featureeditor",
> 			featureManager: "featuremanager",
> 			autoLoadFeatures: true,
> 			toggleGroup: this.toggleGroup,
> 			actionTarget: {
> 				target: "paneltbar",
> 				index: 6
> 			}
> 		}, {
475,492c473,490
< //			ptype: "gxp_zoom",
< //			actionTarget: {
< //				target: "paneltbar",
< //				index: 11
< //			}
< //		}, {
< //			ptype: "gxp_navigationhistory",
< //			actionTarget: {
< //				target: "paneltbar",
< //				index: 13
< //			}
< //		}, {
< //			ptype: "gxp_zoomtoextent",
< //			actionTarget: {
< //				target: "paneltbar",
< //				index: 15
< //			}
< //		}, {
---
> 			ptype: "gxp_zoom",
> 			actionTarget: {
> 				target: "paneltbar",
> 				index: 11
> 			}
> 		}, {
> 			ptype: "gxp_navigationhistory",
> 			actionTarget: {
> 				target: "paneltbar",
> 				index: 13
> 			}
> 		}, {
> 			ptype: "gxp_zoomtoextent",
> 			actionTarget: {
> 				target: "paneltbar",
> 				index: 15
> 			}
> 		}, {
510d508
< 		*/
596c593,594
< 					panel.buttons[0].enable();
---
> 					panel.buttons[
> 					0].enable();


