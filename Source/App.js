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
        baseLayerPicker: false,
        animation: false
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

    // drawBoxes(viewer);
    // drawPrimitives(viewer);
    drawTriangles(viewer);

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
            var max = 55;
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

          viewer.zoomTo(viewer.entities);
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

// Box
function drawBoxes(viewer) {
    var blueBox = viewer.entities.add({
        name : 'Blue box',
        position: Cesium.Cartesian3.fromDegrees(-114.0, 40.0, 300000.0),
        box : {
            dimensions : new Cesium.Cartesian3(400000.0, 300000.0, 300000.0),
            material : Cesium.Color.BLUE.withAlpha(0.5)
        }
    });
    
    
    var yellowBox = viewer.entities.add({
        name : 'Yellow box',
        position: Cesium.Cartesian3.fromDegrees(-114.0, 40.0, 300000.0),
        box : {
            dimensions : new Cesium.Cartesian3(300000.0, 200000.0, 200000.0),
            material : Cesium.Color.YELLOW.withAlpha(0.5)
        }
    });
    
    var redBox = viewer.entities.add({
        name : 'Red box',
        position: Cesium.Cartesian3.fromDegrees(-114.0, 40.0, 300000.0),
        box : {
            dimensions : new Cesium.Cartesian3(200000.0, 100000.0, 150000.0),
            material : Cesium.Color.RED.withAlpha(0.5),
            outline : true,
            outlineColor : Cesium.Color.BLACK
        }
    });
    
    viewer.zoomTo(viewer.entities);
}

function drawPrimitives(viewer) {
    var scene = viewer.scene;
    
    // 1. Draw a translucent ellipse on the surface with a checkerboard pattern
    var instance = new Cesium.GeometryInstance({
        geometry : new Cesium.EllipseGeometry({
            center : Cesium.Cartesian3.fromDegrees(-100.0, 20.0, 5000),
            semiMinorAxis : 500000.0,
            semiMajorAxis : 1000000.0,
            rotation : Cesium.Math.PI_OVER_FOUR,
            vertexFormat : Cesium.VertexFormat.POSITION_AND_ST
        }),
        id : 'object returned when this instance is picked and to get/set per-instance attributes'
    });
    scene.primitives.add(new Cesium.Primitive({
        geometryInstances : instance,
        appearance : new Cesium.EllipsoidSurfaceAppearance({
        material : Cesium.Material.fromType('Checkerboard')
        })
    }));
    viewer.zoomTo(scene.primitives);

    // 2. Draw different instances each with a unique color
    var rectangleInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
            rectangle: Cesium.Rectangle.fromDegrees(-140.0, 30.0, -100.0, 40.0),
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
        }),
        id: 'rectangle',
        attributes: {
            color: new Cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5)
        }
    });
    var ellipsoidInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.EllipsoidGeometry({
            radii: new Cesium.Cartesian3(500000.0, 500000.0, 1000000.0),
            vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
        }),
        modelMatrix: Cesium.Matrix4.multiplyByTranslation(Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(-95.59777, 40.03883)), new Cesium.Cartesian3(0.0, 0.0, 500000.0), new Cesium.Matrix4()),
        id: 'ellipsoid',
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.AQUA)
        }
    });
    scene.primitives.add(new Cesium.Primitive({
        geometryInstances: [rectangleInstance, ellipsoidInstance],
        appearance: new Cesium.PerInstanceColorAppearance()
    }));

    // 3. Create the geometry on the main thread.
    scene.primitives.add(new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: Cesium.EllipsoidGeometry.createGeometry(new Cesium.EllipsoidGeometry({
                radii: new Cesium.Cartesian3(500000.0, 500000.0, 1000000.0),
                vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
            })),
            modelMatrix: Cesium.Matrix4.multiplyByTranslation(Cesium.Transforms.eastNorthUpToFixedFrame(
                Cesium.Cartesian3.fromDegrees(-95.59777, 40.03883)), new Cesium.Cartesian3(0.0, 0.0, 500000.0), new Cesium.Matrix4()),
            id: 'ellipsoid',
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.AQUA)
            }
        }),
        appearance: new Cesium.PerInstanceColorAppearance()
    }));


    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    // var instances = [];
 
    // for ( var lon = -180.0; lon < 180.0; lon += 5.0 )
    // {
    //     for ( var lat = -90.0; lat < 90.0; lat += 5.0 )
    //     {
    //         instances.push( new Cesium.GeometryInstance( {
    //             geometry : new Cesium.RectangleGeometry( {
    //                 rectangle : Cesium.Rectangle.fromDegrees( lon, lat, lon + 5.0, lat + 5.0 )
    //             } ),
    //             attributes : {
    //                 color : Cesium.ColorGeometryInstanceAttribute.fromColor( Cesium.Color.fromRandom( {
    //                     alpha : 0.5
    //                 } ) )
    //             }
    //         } ) );
    //     }
    // }
    
    // scene.primitives.add( new Cesium.Primitive( {
    //     geometryInstances : instances, //合并
    //     //某些外观允许每个几何图形实例分别指定某个属性，例如：
    //     appearance : new Cesium.PerInstanceColorAppearance()
    // } ) );
}

function drawTriangles(viewer) {
    var extent = Cesium.Rectangle.fromDegrees(-98, 30, -90, 39);
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
    Cesium.Camera.DEFAULT_VIEW_FACTOR = 0.5;

    var mypositions = Cesium.Cartesian3.fromDegreesArrayHeights([
        // Triangle A1
        -90.6714, 35.9641, 9322.543,
        -94.6717, 38.9642, 9325.51,
        -97.6717, 35.9639, 9324.724,

        // Triangle A2
        -90.6714, 35.9641, 59322.543,
        -94.6717, 38.9642, 59325.51,
        -97.6717, 35.9639, 59324.724]);

    // unroll 'mypositions' into a flat array here
    var numPositions = mypositions.length;

    var pos = new Float64Array(numPositions * 3);
    var normals = new Float32Array(numPositions * 3);
    for (var i = 0; i < numPositions; ++i) {
        pos[i * 3] = mypositions[i].x;
        pos[i * 3 + 1] = mypositions[i].y;
        pos[i * 3 + 2] = mypositions[i].z;
        normals[i * 3] = 0.0;
        normals[i * 3 + 1] = 0.0;
        normals[i * 3 + 2] = 1.0;
    }

    var geometry = new Cesium.Geometry({
        attributes: {
            position: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.DOUBLE, // not FLOAT
                componentsPerAttribute: 3,
                values: pos
            }),
            normal: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 3,
                values: normals
            })

        },

        // Don't need the following line if no vertices are shared.
        indices: new Uint32Array([0, 1, 2, 3, 4, 5, 0, 2, 5, 0, 5, 3, 0, 3, 4, 0, 4, 1, 1, 2, 5, 1, 4, 5]),
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere: Cesium.BoundingSphere.fromVertices(pos)
    });

    var myInstance = new Cesium.GeometryInstance({
        geometry: geometry,
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED.withAlpha(0.1))
        },
        show: new Cesium.ShowGeometryInstanceAttribute(true)
    });

    viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: [myInstance],
        asynchronous: false,
        appearance: new Cesium.PerInstanceColorAppearance({
            closed: true,
            translucent: false
        })
    }));

    viewer.camera.flyTo({
        destination : Cesium.Cartesian3.fromDegrees(-94.6714, 35.9641, 10000000.0)
    });
}