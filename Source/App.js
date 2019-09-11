(function () {
    "use strict";

    // TODO: Add your ion access token from cesium.com/ion/
    // Cesium.Ion.defaultAccessToken = '<YOUR ACCESS TOKEN HERE>';

    //////////////////////////////////////////////////////////////////////////
    // Creating the Viewer
    //////////////////////////////////////////////////////////////////////////

    var viewer = new Cesium.Viewer('cesiumContainer', {
        scene3DOnly: true,
        selectionIndicator: false,
        baseLayerPicker: false
    });

    //////////////////////////////////////////////////////////////////////////
    // Loading Imagery
    //////////////////////////////////////////////////////////////////////////

    // Remove default base layer
    viewer.imageryLayers.remove(viewer.imageryLayers.get(0));

    // Add Sentinel-2 imagery
    viewer.imageryLayers.addImageryProvider(new Cesium.IonImageryProvider({ assetId: 3954 }));

    //////////////////////////////////////////////////////////////////////////
    // Loading Terrain
    //////////////////////////////////////////////////////////////////////////

    // Load Cesium World Terrain
    viewer.terrainProvider = Cesium.createWorldTerrain({
        requestWaterMask : true, // required for water effects
        requestVertexNormals : true // required for terrain lighting
    });
    // Enable depth testing so things behind the terrain disappear.
    viewer.scene.globe.depthTestAgainstTerrain = true;

    //////////////////////////////////////////////////////////////////////////
    // Configuring the Scene
    //////////////////////////////////////////////////////////////////////////

    // Enable lighting based on sun/moon positions
    // viewer.scene.globe.enableLighting = true;

    // Create an initial camera view
    var initialPosition = new Cesium.Cartesian3.fromDegrees(108.4329473653, 34.11098748, 7378665);
    var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(0, -90.0, 0);
    var homeCameraView = {
        destination : initialPosition,
        orientation : {
            heading : initialOrientation.heading,
            pitch : initialOrientation.pitch,
            roll : initialOrientation.roll
        }
    };
    // Set the initial view
    viewer.scene.camera.setView(homeCameraView);

    // Add some camera flight animation options
    homeCameraView.duration = 2.0;
    homeCameraView.maximumHeight = 2000;
    homeCameraView.pitchAdjustHeight = 2000;
    homeCameraView.endTransform = Cesium.Matrix4.IDENTITY;
    // Override the default home button
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
        e.cancel = true;
        viewer.scene.camera.flyTo(homeCameraView);
    });

    //addMultipleBillboards(viewer);

    document.getElementById('file').onchange = function(){
        var file = this.files[0];      
        var reader = new FileReader();
        reader.onload = function(progressEvent){          
          var lines = this.result.split('\n');
          for(var n = 0; n < lines.length; n++){
            
            var array = lines[n].split(" ").map(Number);
            var x = 73.0 + array[0] * 0.01;
            var y = 54.2 - array[1] * 0.01;
            var z = array[2] * 500.0;
            var p = array[3];
            // 以下几个参数需要根据具体数据进行修改，或者自行统计
            // 本示例使用的是Jet color算法，根据指定的最值计算颜色值，也可以引用JS库Colormap使用合适的色带或者自定义色带
            var min = 40; // 以40.txt文件为例
            var max = 60;
            var alpha = 0.6;

            viewer.entities.add({
                position : Cesium.Cartesian3.fromDegrees(x, y, z),
                point : {
                    pixelSize : 10,
                    color : getJetColor(p, min, max, alpha),
                    outlineColor : Cesium.Color.TRANSPARENT,
                    // pixelSize will multiply by the scale factor, so in this example the size will range from 50px (near) to 1px (far).
                    scaleByDistance : new Cesium.NearFarScalar(1.5e2, 5.0, 1.5e6, 0.1)
                }
            });
          }
        };
        reader.readAsText(file);
      };
}());

// Jet color
function getJetColor(v, vmin, vmax, alpha) {
    if (v < vmin){
        v = vmin;
    }
    if (v > vmax){
        v = vmax;
    }
    var dv = vmax - vmin;

    if (v < (vmin + 0.25 * dv)) {
        return new Cesium.Color(0, 4 * (v - vmin) / dv, 0.6, alpha);
    }
    else if (v < (vmin + 0.5 * dv)) {
        return new Cesium.Color(0, 1, 1 + 4 * (vmin + 0.25 * dv - v) / dv, alpha);
    }
    else if (v < (vmin + 0.75 * dv)) {
        return new Cesium.Color(4 * (v - vmin - 0.5 * dv) / dv, 1, 0, alpha);
    }
    else {
        return new Cesium.Color(1, 1 + 4 * (vmin + 0.75 * dv - v) / dv, 0, alpha);
    }
}

function addMultipleBillboards(viewer) {
    var iconUrl = './Source/Images/white_3px.png';
    viewer.entities.add({
        position : Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883, 5000),
        billboard : {
            image : iconUrl,
            width: 10,
            height: 10,
            color: Cesium.Color.RED.withAlpha(0.5)
        }
    });
    viewer.entities.add({
        position : Cesium.Cartesian3.fromDegrees(-80.50, 35.14, 5000),
        billboard : {
            image : iconUrl,
            width: 10,
            height: 10,
            color: Cesium.Color.GREEN.withAlpha(0.5)
        }
    });
    viewer.entities.add({
        position : Cesium.Cartesian3.fromDegrees(-80.12, 25.46, 5000),
        billboard : {
            image : iconUrl,
            width: 10,
            height: 10,
            color: Cesium.Color.BLUE.withAlpha(0.5)
        }
    });
}
