
import * as THREE from 'three';
THREE.OBJLoader = function( manager ) {

  this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.OBJLoader.prototype = {

  constructor: THREE.OBJLoader,

  load: function( url, onLoad, onProgress, onError ) {

    var scope = this;

    var loader = new THREE.XHRLoader( scope.manager );
    loader.setCrossOrigin( this.crossOrigin );
    loader.load( url, function( text ) {

      onLoad( scope.parse( text ) );

    }, onProgress, onError );

  },

  parse: function( text ) {

    console.time( 'OBJLoader' );

    var object, objects = [];
    var geometry, material;

    function parseVertexIndex( value ) {

      var index = parseInt( value );

      return ( index >= 0 ? index - 1 : index + vertices.length / 3 ) * 3;

    }

    function parseNormalIndex( value ) {

      var index = parseInt( value );

      return ( index >= 0 ? index - 1 : index + normals.length / 3 ) * 3;

    }

    function parseUVIndex( value ) {

      var index = parseInt( value );

      return ( index >= 0 ? index - 1 : index + uvs.length / 2 ) * 2;

    }

    function addVertex( a, b, c ) {

      geometry.vertices.push(
        vertices[ a ], vertices[ a + 1 ], vertices[ a + 2 ],
        vertices[ b ], vertices[ b + 1 ], vertices[ b + 2 ],
        vertices[ c ], vertices[ c + 1 ], vertices[ c + 2 ]
      );

    }

    function addNormal( a, b, c ) {

      geometry.normals.push(
        normals[ a ], normals[ a + 1 ], normals[ a + 2 ],
        normals[ b ], normals[ b + 1 ], normals[ b + 2 ],
        normals[ c ], normals[ c + 1 ], normals[ c + 2 ]
      );

    }

    function addUV( a, b, c ) {

      geometry.uvs.push(
        uvs[ a ], uvs[ a + 1 ],
        uvs[ b ], uvs[ b + 1 ],
        uvs[ c ], uvs[ c + 1 ]
      );

    }

    function addFace( a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd ) {

      var ia = parseVertexIndex( a );
      var ib = parseVertexIndex( b );
      var ic = parseVertexIndex( c );

      if ( d === undefined ) {

        addVertex( ia, ib, ic );

      } else {

        var id = parseVertexIndex( d );

        addVertex( ia, ib, id );
        addVertex( ib, ic, id );

      }

      if ( ua !== undefined ) {

        var ia = parseUVIndex( ua );
        var ib = parseUVIndex( ub );
        var ic = parseUVIndex( uc );

        if ( d === undefined ) {

          addUV( ia, ib, ic );

        } else {

          var id = parseUVIndex( ud );

          addUV( ia, ib, id );
          addUV( ib, ic, id );

        }

      }

      if ( na !== undefined ) {

        var ia = parseNormalIndex( na );
        var ib = parseNormalIndex( nb );
        var ic = parseNormalIndex( nc );

        if ( d === undefined ) {

          addNormal( ia, ib, ic );

        } else {

          var id = parseNormalIndex( nd );

          addNormal( ia, ib, id );
          addNormal( ib, ic, id );

        }

      }

    }

    // create mesh if no objects in text

    if ( /^o /gm.test( text ) === false ) {

      geometry = {
        vertices: [],
        normals: [],
        uvs: []
      };

      material = {
        name: ''
      };

      object = {
        name: '',
        geometry: geometry,
        material: material
      };

      objects.push( object );

    }

    var vertices = [];
    var normals = [];
    var uvs = [];

    // v float float float

    var vertex_pattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

    // vn float float float

    var normal_pattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

    // vt float float

    var uv_pattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

    // f vertex vertex vertex ...

    var face_pattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;

    // f vertex/uv vertex/uv vertex/uv ...

    var face_pattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;

    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

    var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;

    // f vertex//normal vertex//normal vertex//normal ... 

    var face_pattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/;

    //

    var lines = text.split( '\n' );

    for ( var i = 0; i < lines.length; i ++ ) {

      var line = lines[ i ];
      line = line.trim();

      var result;

      if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

        continue;

      } else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {

        // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

        vertices.push(
          parseFloat( result[ 1 ] ),
          parseFloat( result[ 2 ] ),
          parseFloat( result[ 3 ] )
        );

      } else if ( ( result = normal_pattern.exec( line ) ) !== null ) {

        // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

        normals.push(
          parseFloat( result[ 1 ] ),
          parseFloat( result[ 2 ] ),
          parseFloat( result[ 3 ] )
        );

      } else if ( ( result = uv_pattern.exec( line ) ) !== null ) {

        // ["vt 0.1 0.2", "0.1", "0.2"]

        uvs.push(
          parseFloat( result[ 1 ] ),
          parseFloat( result[ 2 ] )
        );

      } else if ( ( result = face_pattern1.exec( line ) ) !== null ) {

        // ["f 1 2 3", "1", "2", "3", undefined]

        addFace(
          result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ]
        );

      } else if ( ( result = face_pattern2.exec( line ) ) !== null ) {

        // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
        
        addFace(
          result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ],
          result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ]
        );

      } else if ( ( result = face_pattern3.exec( line ) ) !== null ) {

        // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

        addFace(
          result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ],
          result[ 3 ], result[ 7 ], result[ 11 ], result[ 15 ],
          result[ 4 ], result[ 8 ], result[ 12 ], result[ 16 ]
        );

      } else if ( ( result = face_pattern4.exec( line ) ) !== null ) {

        // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

        addFace(
          result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ],
          undefined, undefined, undefined, undefined,
          result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ]
        );

      } else if ( /^o /.test( line ) ) {

        geometry = {
          vertices: [],
          normals: [],
          uvs: []
        };

        material = {
          name: ''
        };

        object = {
          name: line.substring( 2 ).trim(),
          geometry: geometry,
          material: material
        };

        objects.push( object );

      } else if ( /^g /.test( line ) ) {

        // group

      } else if ( /^usemtl /.test( line ) ) {

        // material

        material.name = line.substring( 7 ).trim();

      } else if ( /^mtllib /.test( line ) ) {

        // mtl file

      } else if ( /^s /.test( line ) ) {

        // smooth shading

      } else {

        // console.log( "THREE.OBJLoader: Unhandled line " + line );

      }

    }

    var container = new THREE.Object3D();

    for ( var i = 0, l = objects.length; i < l; i ++ ) {

      var object = objects[ i ];
      var geometry = object.geometry;

      var buffergeometry = new THREE.BufferGeometry();

      buffergeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( geometry.vertices ), 3 ) );

      if ( geometry.normals.length > 0 ) {
        buffergeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( geometry.normals ), 3 ) );
      }

      if ( geometry.uvs.length > 0 ) {
        buffergeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( geometry.uvs ), 2 ) );
      }

      var material = new THREE.MeshLambertMaterial();
      material.name = object.material.name;

      var mesh = new THREE.Mesh( buffergeometry, material );
      mesh.name = object.name;

      container.add( mesh );

    }

    console.timeEnd( 'OBJLoader' );

    return container;

  }

};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BloomPass = function( strength, kernelSize, sigma, resolution ) {

  strength = ( strength !== undefined ) ? strength : 1;
  kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
  sigma = ( sigma !== undefined ) ? sigma : 4.0;
  resolution = ( resolution !== undefined ) ? resolution : 256;

  // render targets

  var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

  this.renderTargetX = new THREE.WebGLRenderTarget( resolution, resolution, pars );
  this.renderTargetY = new THREE.WebGLRenderTarget( resolution, resolution, pars );

  // copy material

  if ( THREE.CopyShader === undefined )
    console.error( 'THREE.BloomPass relies on THREE.CopyShader' );

  var copyShader = THREE.CopyShader;

  this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

  this.copyUniforms[ 'opacity' ].value = strength;

  this.materialCopy = new THREE.ShaderMaterial( {

    uniforms: this.copyUniforms,
    vertexShader: copyShader.vertexShader,
    fragmentShader: copyShader.fragmentShader,
    blending: THREE.AdditiveBlending,
    transparent: true

  } );

  // convolution material

  if ( THREE.ConvolutionShader === undefined )
    console.error( 'THREE.BloomPass relies on THREE.ConvolutionShader' );

  var convolutionShader = THREE.ConvolutionShader;

  this.convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );

  this.convolutionUniforms[ 'uImageIncrement' ].value = THREE.BloomPass.blurx;
  this.convolutionUniforms[ 'cKernel' ].value = THREE.ConvolutionShader.buildKernel( sigma );

  this.materialConvolution = new THREE.ShaderMaterial( {

    uniforms: this.convolutionUniforms,
    vertexShader:  convolutionShader.vertexShader,
    fragmentShader: convolutionShader.fragmentShader,
    defines: {
      'KERNEL_SIZE_FLOAT': kernelSize.toFixed( 1 ),
      'KERNEL_SIZE_INT': kernelSize.toFixed( 0 )
    }

  } );

  this.enabled = true;
  this.needsSwap = false;
  this.clear = false;


  this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
  this.scene = new THREE.Scene();

  this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
  this.scene.add( this.quad );

};

THREE.BloomPass.prototype = {

  render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

    if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

    // Render quad with blured scene into texture (convolution pass 1)

    this.quad.material = this.materialConvolution;

    this.convolutionUniforms[ 'tDiffuse' ].value = readBuffer;
    this.convolutionUniforms[ 'uImageIncrement' ].value = THREE.BloomPass.blurX;

    renderer.render( this.scene, this.camera, this.renderTargetX, true );


    // Render quad with blured scene into texture (convolution pass 2)

    this.convolutionUniforms[ 'tDiffuse' ].value = this.renderTargetX;
    this.convolutionUniforms[ 'uImageIncrement' ].value = THREE.BloomPass.blurY;

    renderer.render( this.scene, this.camera, this.renderTargetY, true );

    // Render original scene with superimposed blur to texture

    this.quad.material = this.materialCopy;

    this.copyUniforms[ 'tDiffuse' ].value = this.renderTargetY;

    if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

    renderer.render( this.scene, this.camera, readBuffer, this.clear );

  }

};

THREE.BloomPass.blurX = new THREE.Vector2( 0.001953125, 0.0 );
THREE.BloomPass.blurY = new THREE.Vector2( 0.0, 0.001953125 );

/**
 * Depth-of-field post-process with bokeh shader
 */


THREE.BokehPass = function( scene, camera, params ) {

  this.scene = scene;
  this.camera = camera;

  var focus = ( params.focus !== undefined ) ? params.focus : 1.0;
  var aspect = ( params.aspect !== undefined ) ? params.aspect : camera.aspect;
  var aperture = ( params.aperture !== undefined ) ? params.aperture : 0.025;
  var maxblur = ( params.maxblur !== undefined ) ? params.maxblur : 1.0;

  // render targets

  var width = params.width || window.innerWidth || 1;
  var height = params.height || window.innerHeight || 1;

  this.renderTargetColor = new THREE.WebGLRenderTarget( width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat
  } );

  this.renderTargetDepth = this.renderTargetColor.clone();

  // depth material

  this.materialDepth = new THREE.MeshDepthMaterial();

  // bokeh material

  if ( THREE.BokehShader === undefined ) {
    console.error( 'THREE.BokehPass relies on THREE.BokehShader' );
  }
  
  var bokehShader = THREE.BokehShader;
  var bokehUniforms = THREE.UniformsUtils.clone( bokehShader.uniforms );
  console.log( THREE.UniformsUtils,THREE.BokehShader,this.renderTargetDepth,bokehUniforms,);

  bokehUniforms[ 'tDepth' ].value = this.renderTargetDepth;

  bokehUniforms[ 'focus' ].value = focus;
  bokehUniforms[ 'aspect' ].value = aspect;
  bokehUniforms[ 'aperture' ].value = aperture;
  bokehUniforms[ 'maxblur' ].value = maxblur;

  this.materialBokeh = new THREE.ShaderMaterial({
    uniforms: bokehUniforms,
    vertexShader: bokehShader.vertexShader,
    fragmentShader: bokehShader.fragmentShader
  });

  this.uniforms = bokehUniforms;
  this.enabled = true;
  this.needsSwap = false;
  this.renderToScreen = false;
  this.clear = false;

  this.camera2 = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
  this.scene2 = new THREE.Scene();

  this.quad2 = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
  this.scene2.add( this.quad2 );

};

THREE.BokehPass.prototype = {

  render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

    this.quad2.material = this.materialBokeh;

    // Render depth into texture

    this.scene.overrideMaterial = this.materialDepth;

    renderer.render( this.scene, this.camera, this.renderTargetDepth, true );

    // Render bokeh composite

    this.uniforms[ 'tColor' ].value = readBuffer;

    if ( this.renderToScreen ) {

      renderer.render( this.scene2, this.camera2 );

    } else {

      renderer.render( this.scene2, this.camera2, writeBuffer, this.clear );

    }

    this.scene.overrideMaterial = null;

  }

};


/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.DotScreenPass = function( center, angle, scale ) {

  if ( THREE.DotScreenShader === undefined )
    console.error( 'THREE.DotScreenPass relies on THREE.DotScreenShader' );

  var shader = THREE.DotScreenShader;

  this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

  if ( center !== undefined ) this.uniforms[ 'center' ].value.copy( center );
  if ( angle !== undefined ) this.uniforms[ 'angle'].value = angle;
  if ( scale !== undefined ) this.uniforms[ 'scale'].value = scale;

  this.material = new THREE.ShaderMaterial( {

    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader

  } );

  this.enabled = true;
  this.renderToScreen = false;
  this.needsSwap = true;


  this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
  this.scene = new THREE.Scene();

  this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
  this.scene.add( this.quad );

};

THREE.DotScreenPass.prototype = {

  render: function( renderer, writeBuffer, readBuffer, delta ) {

    this.uniforms[ 'tDiffuse' ].value = readBuffer;
    this.uniforms[ 'tSize' ].value.set( readBuffer.width, readBuffer.height );

    this.quad.material = this.material;

    if ( this.renderToScreen ) {

      renderer.render( this.scene, this.camera );

    } else {

      renderer.render( this.scene, this.camera, writeBuffer, false );

    }

  }

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function( renderer, renderTarget ) {

  this.renderer = renderer;

  if ( renderTarget === undefined ) {

    var width = window.innerWidth || 1;
    var height = window.innerHeight || 1;
    var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

    renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

  }

  this.renderTarget1 = renderTarget;
  this.renderTarget2 = renderTarget.clone();

  this.writeBuffer = this.renderTarget1;
  this.readBuffer = this.renderTarget2;

  this.passes = [];

  if ( THREE.CopyShader === undefined )
    console.error( 'THREE.EffectComposer relies on THREE.CopyShader' );

  this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

THREE.EffectComposer.prototype = {

  swapBuffers: function() {

    var tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;

  },

  addPass: function( pass ) {

    this.passes.push( pass );

  },

  insertPass: function( pass, index ) {

    this.passes.splice( index, 0, pass );

  },

  render: function( delta ) {

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

    var maskActive = false;

    var pass, i, il = this.passes.length;

    for ( i = 0; i < il; i ++ ) {

      pass = this.passes[ i ];

      if ( !pass.enabled ) continue;

      pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

      if ( pass.needsSwap ) {

        if ( maskActive ) {

          var context = this.renderer.context;

          context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

          this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

          context.stencilFunc( context.EQUAL, 1, 0xffffffff );

        }

        this.swapBuffers();

      }

      if ( pass instanceof THREE.MaskPass ) {

        maskActive = true;

      } else if ( pass instanceof THREE.ClearMaskPass ) {

        maskActive = false;

      }

    }

  },

  reset: function( renderTarget ) {

    if ( renderTarget === undefined ) {

      renderTarget = this.renderTarget1.clone();

      renderTarget.width = window.innerWidth;
      renderTarget.height = window.innerHeight;

    }

    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

  },

  setSize: function( width, height ) {

    var renderTarget = this.renderTarget1.clone();

    renderTarget.width = width;
    renderTarget.height = height;

    this.reset( renderTarget );

  }

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.FilmPass = function( noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale ) {

  if ( THREE.FilmShader === undefined )
    console.error( 'THREE.FilmPass relies on THREE.FilmShader' );

  var shader = THREE.FilmShader;

  this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

  this.material = new THREE.ShaderMaterial( {

    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader

  } );

  if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
  if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
  if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
  if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;

  this.enabled = true;
  this.renderToScreen = false;
  this.needsSwap = true;


  this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
  this.scene = new THREE.Scene();

  this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
  this.scene.add( this.quad );

};

THREE.FilmPass.prototype = {

  render: function( renderer, writeBuffer, readBuffer, delta ) {

    this.uniforms[ 'tDiffuse' ].value = readBuffer;
    this.uniforms[ 'time' ].value += delta;

    this.quad.material = this.material;

    if ( this.renderToScreen ) {

      renderer.render( this.scene, this.camera );

    } else {

      renderer.render( this.scene, this.camera, writeBuffer, false );

    }

  }

};

/**
 
 */

THREE.GlitchPass = function( dt_size ) {

  if ( THREE.DigitalGlitch === undefined ) console.error( 'THREE.GlitchPass relies on THREE.DigitalGlitch' );
	
  var shader = THREE.DigitalGlitch;
  this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

  if(dt_size===undefined) dt_size=64;
	
	
  this.uniforms[ 'tDisp'].value=this.generateHeightmap(dt_size);
	

  this.material = new THREE.ShaderMaterial({
    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader
  });

  console.log(this.material);
	
  this.enabled = true;
  this.renderToScreen = false;
  this.needsSwap = true;


  this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
  this.scene = new THREE.Scene();

  this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
  this.scene.add( this.quad );
	
  this.goWild=false;
  this.curF=0;
  this.generateTrigger();
	
};

THREE.GlitchPass.prototype = {

  render: function( renderer, writeBuffer, readBuffer, delta ) 
  {
    this.uniforms[ 'tDiffuse' ].value = readBuffer;
    this.uniforms[ 'seed' ].value=Math.random();//default seeding
    this.uniforms[ 'byp' ].value=0;
		
    if(this.curF % this.randX ===0 || this.goWild===true)
    {
      this.uniforms[ 'amount' ].value=Math.random()/30;
      this.uniforms[ 'angle' ].value=THREE.Math.randFloat(-Math.PI,Math.PI);
      this.uniforms[ 'seed_x' ].value=THREE.Math.randFloat(-1,1);
      this.uniforms[ 'seed_y' ].value=THREE.Math.randFloat(-1,1);
      this.uniforms[ 'distortion_x' ].value=THREE.Math.randFloat(0,1);
      this.uniforms[ 'distortion_y' ].value=THREE.Math.randFloat(0,1);
      this.curF=0;
      this.generateTrigger();
    }
    else if(this.curF % this.randX <this.randX/5)
    {
      this.uniforms[ 'amount' ].value=Math.random()/90;
      this.uniforms[ 'angle' ].value=THREE.Math.randFloat(-Math.PI,Math.PI);
      this.uniforms[ 'distortion_x' ].value=THREE.Math.randFloat(0,1);
      this.uniforms[ 'distortion_y' ].value=THREE.Math.randFloat(0,1);
      this.uniforms[ 'seed_x' ].value=THREE.Math.randFloat(-0.3,0.3);
      this.uniforms[ 'seed_y' ].value=THREE.Math.randFloat(-0.3,0.3);
    }
    else if(this.goWild===false)
    {
      this.uniforms[ 'byp' ].value=1;
    }
    this.curF++;
		
    this.quad.material = this.material;
    if ( this.renderToScreen ) 
    {
      renderer.render( this.scene, this.camera );
    } 
    else 
    {
      renderer.render( this.scene, this.camera, writeBuffer, false );
    }
  },
  generateTrigger:function()
  {
    this.randX=THREE.Math.randInt(120,240);
  },
  generateHeightmap:function(dt_size)
  {
    var data_arr = new Float32Array( dt_size*dt_size * 3 );
    console.log(dt_size);
    var length=dt_size*dt_size;
		
    for ( var i = 0; i < length; i++) 
    {
      var val=THREE.Math.randFloat(0,1);
      data_arr[ i*3 + 0 ] = val;
      data_arr[ i*3 + 1 ] = val;
      data_arr[ i*3 + 2 ] = val;
    }
		
    var texture = new THREE.DataTexture( data_arr, dt_size, dt_size, THREE.RGBFormat, THREE.FloatType );
    console.log(texture);
    console.log(dt_size);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    texture.flipY = false;
    return texture;
  }
};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function( scene, camera ) {

  this.scene = scene;
  this.camera = camera;

  this.enabled = true;
  this.clear = true;
  this.needsSwap = false;

  this.inverse = false;

};

THREE.MaskPass.prototype = {

  render: function( renderer, writeBuffer, readBuffer, delta ) {

    var context = renderer.context;

    // don't update color or depth

    context.colorMask( false, false, false, false );
    context.depthMask( false );

    // set up stencil

    var writeValue, clearValue;

    if ( this.inverse ) {

      writeValue = 0;
      clearValue = 1;

    } else {

      writeValue = 1;
      clearValue = 0;

    }

    context.enable( context.STENCIL_TEST );
    context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
    context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
    context.clearStencil( clearValue );

    // draw into the stencil buffer

    renderer.render( this.scene, this.camera, readBuffer, this.clear );
    renderer.render( this.scene, this.camera, writeBuffer, this.clear );

    // re-enable update of color and depth

    context.colorMask( true, true, true, true );
    context.depthMask( true );

    // only render where stencil is set to 1

    context.stencilFunc( context.EQUAL, 1, 0xffffffff ); // draw if === 1
    context.stencilOp( context.KEEP, context.KEEP, context.KEEP );

  }

};


THREE.ClearMaskPass = function() {

  this.enabled = true;

};

THREE.ClearMaskPass.prototype = {

  render: function( renderer, writeBuffer, readBuffer, delta ) {

    var context = renderer.context;

    context.disable( context.STENCIL_TEST );

  }

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

  this.scene = scene;
  this.camera = camera;

  this.overrideMaterial = overrideMaterial;

  this.clearColor = clearColor;
  this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

  this.oldClearColor = new THREE.Color();
  this.oldClearAlpha = 1;

  this.enabled = true;
  this.clear = true;
  this.needsSwap = false;

};

THREE.RenderPass.prototype = {

  render: function( renderer, writeBuffer, readBuffer, delta ) {

    this.scene.overrideMaterial = this.overrideMaterial;

    if ( this.clearColor ) {

      this.oldClearColor.copy( renderer.getClearColor() );
      this.oldClearAlpha = renderer.getClearAlpha();

      renderer.setClearColor( this.clearColor, this.clearAlpha );

    }

    renderer.render( this.scene, this.camera, readBuffer, this.clear );

    if ( this.clearColor ) {

      renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

    }

    this.scene.overrideMaterial = null;

  }

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SavePass = function( renderTarget ) {

  if ( THREE.CopyShader === undefined )
    console.error( 'THREE.SavePass relies on THREE.CopyShader' );

  var shader = THREE.CopyShader;

  this.textureID = 'tDiffuse';

  this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

  this.material = new THREE.ShaderMaterial( {

    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader

  } );

  this.renderTarget = renderTarget;

  if ( this.renderTarget === undefined ) {

    this.renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
    this.renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, this.renderTargetParameters );

  }

  this.enabled = true;
  this.needsSwap = false;
  this.clear = false;


  this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
  this.scene = new THREE.Scene();

  this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
  this.scene.add( this.quad );

};

THREE.SavePass.prototype = {

  render: function( renderer, writeBuffer, readBuffer, delta ) {

    if ( this.uniforms[ this.textureID ] ) {

      this.uniforms[ this.textureID ].value = readBuffer;

    }

    this.quad.material = this.material;

    renderer.render( this.scene, this.camera, this.renderTarget, this.clear );

  }

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function( shader, textureID ) {

  this.textureID = ( textureID !== undefined ) ? textureID : 'tDiffuse';

  this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

  this.material = new THREE.ShaderMaterial( {

    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader

  } );

  this.renderToScreen = false;

  this.enabled = true;
  this.needsSwap = true;
  this.clear = false;


  this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
  this.scene = new THREE.Scene();

  this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
  this.scene.add( this.quad );

};

THREE.ShaderPass.prototype = {

  render: function( renderer, writeBuffer, readBuffer, delta ) {

    if ( this.uniforms[ this.textureID ] ) {

      this.uniforms[ this.textureID ].value = readBuffer;

    }

    this.quad.material = this.material;

    if ( this.renderToScreen ) {

      renderer.render( this.scene, this.camera );

    } else {

      renderer.render( this.scene, this.camera, writeBuffer, this.clear );

    }

  }

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.TexturePass = function( texture, opacity ) {

  if ( THREE.CopyShader === undefined )
    console.error( 'THREE.TexturePass relies on THREE.CopyShader' );

  var shader = THREE.CopyShader;

  this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

  this.uniforms[ 'opacity' ].value = ( opacity !== undefined ) ? opacity : 1.0;
  this.uniforms[ 'tDiffuse' ].value = texture;

  this.material = new THREE.ShaderMaterial( {

    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader

  } );

  this.enabled = true;
  this.needsSwap = false;


  this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
  this.scene = new THREE.Scene();

  this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
  this.scene.add( this.quad );

};

THREE.TexturePass.prototype = {

  render: function( renderer, writeBuffer, readBuffer, delta ) {

    this.quad.material = this.material;

    renderer.render( this.scene, this.camera, readBuffer );

  }

};

/**
 * @author mrdoob / http://www.mrdoob.com
 *
 * Simple test shader
 */

THREE.BasicShader = {

  uniforms: {},

  vertexShader: [

    'void main() {',

    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'void main() {',

    'gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.5 );',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Bleach bypass shader [http://en.wikipedia.org/wiki/Bleach_bypass]
 * - based on Nvidia example
 * http://developer.download.nvidia.com/shaderlibrary/webpages/shader_library.html#post_bleach_bypass
 */

THREE.BleachBypassShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'opacity':  { type: 'f', value: 1.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform float opacity;',

    'uniform sampler2D tDiffuse;',

    'varying vec2 vUv;',

    'void main() {',

    'vec4 base = texture2D( tDiffuse, vUv );',

    'vec3 lumCoeff = vec3( 0.25, 0.65, 0.1 );',
    'float lum = dot( lumCoeff, base.rgb );',
    'vec3 blend = vec3( lum );',

    'float L = min( 1.0, max( 0.0, 10.0 * ( lum - 0.45 ) ) );',

    'vec3 result1 = 2.0 * base.rgb * blend;',
    'vec3 result2 = 1.0 - 2.0 * ( 1.0 - blend ) * ( 1.0 - base.rgb );',

    'vec3 newColor = mix( result1, result2, L );',

    'float A2 = opacity * base.a;',
    'vec3 mixRGB = A2 * newColor.rgb;',
    'mixRGB += ( ( 1.0 - A2 ) * base.rgb );',

    'gl_FragColor = vec4( mixRGB, base.a );',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Blend two textures
 */

THREE.BlendShader = {

  uniforms: {

    'tDiffuse1': { type: 't', value: null },
    'tDiffuse2': { type: 't', value: null },
    'mixRatio':  { type: 'f', value: 0.5 },
    'opacity':   { type: 'f', value: 1.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform float opacity;',
    'uniform float mixRatio;',

    'uniform sampler2D tDiffuse1;',
    'uniform sampler2D tDiffuse2;',

    'varying vec2 vUv;',

    'void main() {',

    'vec4 texel1 = texture2D( tDiffuse1, vUv );',
    'vec4 texel2 = texture2D( tDiffuse2, vUv );',
    'gl_FragColor = opacity * mix( texel1, texel2, mixRatio );',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 */

THREE.BokehShader = {

  uniforms: {

    'tColor':   { type: 't', value: null },
    'tDepth':   { type: 't', value: null },
    'focus':    { type: 'f', value: 1.0 },
    'aspect':   { type: 'f', value: 1.0 },
    'aperture': { type: 'f', value: 0.025 },
    'maxblur':  { type: 'f', value: 1.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'varying vec2 vUv;',

    'uniform sampler2D tColor;',
    'uniform sampler2D tDepth;',

    'uniform float maxblur;', // max blur amount
    'uniform float aperture;', // aperture - bigger values for shallower depth of field

    'uniform float focus;',
    'uniform float aspect;',

    'void main() {',

    'vec2 aspectcorrect = vec2( 1.0, aspect );',

    'vec4 depth1 = texture2D( tDepth, vUv );',

    'float factor = depth1.x - focus;',

    'vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );',

    'vec2 dofblur9 = dofblur * 0.9;',
    'vec2 dofblur7 = dofblur * 0.7;',
    'vec2 dofblur4 = dofblur * 0.4;',

    'vec4 col = vec4( 0.0 );',

    'col += texture2D( tColor, vUv.xy );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );',

    'col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );',

    'col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );',

    'col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );',
    'col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );',
    'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );',

    'gl_FragColor = col / 41.0;',
    'gl_FragColor.a = 1.0;',

    '}'

  ].join('\n')

};


/**
 * @author zz85 / https://github.com/zz85 | twitter.com/blurspline
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
 *
 * Requires #define RINGS and SAMPLES integers
 */



// THREE.BokehShader = {

//   uniforms: {

//     'textureWidth':  { type: 'f', value: 1.0 },
//     'textureHeight':  { type: 'f', value: 1.0 },

//     'focalDepth':   { type: 'f', value: 1.0 },
//     'focalLength':   { type: 'f', value: 24.0 },
//     'fstop': { type: 'f', value: 0.9 },

//     'tColor':   { type: 't', value: null },
//     'tDepth':   { type: 't', value: null },

//     'maxblur':  { type: 'f', value: 1.0 },

//     'showFocus':   { type: 'i', value: 0 },
//     'manualdof':   { type: 'i', value: 0 },
//     'vignetting':   { type: 'i', value: 0 },
//     'depthblur':   { type: 'i', value: 0 },

//     'threshold':  { type: 'f', value: 0.5 },
//     'gain':  { type: 'f', value: 2.0 },
//     'bias':  { type: 'f', value: 0.5 },
//     'fringe':  { type: 'f', value: 0.7 },

//     'znear':  { type: 'f', value: 0.1 },
//     'zfar':  { type: 'f', value: 100 },

//     'noise':  { type: 'i', value: 1 },
//     'dithering':  { type: 'f', value: 0.0001 },
//     'pentagon': { type: 'i', value: 0 },

//     'shaderFocus':  { type: 'i', value: 1 },
//     'focusCoords':  { type: 'v2', value: new THREE.Vector2()},


//   },

//   vertexShader: [

//     'varying vec2 vUv;',

//     'void main() {',

//     'vUv = uv;',
//     'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

//     '}'

//   ].join('\n'),

//   fragmentShader: [

//     'varying vec2 vUv;',

//     'uniform sampler2D tColor;',
//     'uniform sampler2D tDepth;',
//     'uniform float textureWidth;',
//     'uniform float textureHeight;',

//     'const float PI = 3.14159265;',

//     'float width = textureWidth; //texture width',
//     'float height = textureHeight; //texture height',

//     'vec2 texel = vec2(1.0/width,1.0/height);',

//     'uniform float focalDepth;  //focal distance value in meters, but you may use autofocus option below',
//     'uniform float focalLength; //focal length in mm',
//     'uniform float fstop; //f-stop value',
//     'uniform bool showFocus; //show debug focus point and focal range (red = focal point, green = focal range)',

//     '/*',
//     'make sure that these two values are the same for your camera, otherwise distances will be wrong.',
//     '*/',

//     'uniform float znear; // camera clipping start',
//     'uniform float zfar; // camera clipping end',

//     '//------------------------------------------',
//     '//user variables',

//     'const int samples = SAMPLES; //samples on the first ring',
//     'const int rings = RINGS; //ring count',

//     'const int maxringsamples = rings * samples;',

//     'uniform bool manualdof; // manual dof calculation',
//     'float ndofstart = 1.0; // near dof blur start',
//     'float ndofdist = 2.0; // near dof blur falloff distance',
//     'float fdofstart = 1.0; // far dof blur start',
//     'float fdofdist = 3.0; // far dof blur falloff distance',

//     'float CoC = 0.03; //circle of confusion size in mm (35mm film = 0.03mm)',

//     'uniform bool vignetting; // use optical lens vignetting',

//     'float vignout = 1.3; // vignetting outer border',
//     'float vignin = 0.0; // vignetting inner border',
//     'float vignfade = 22.0; // f-stops till vignete fades',

//     'uniform bool shaderFocus;',

//     'bool autofocus = shaderFocus;',
//     '//use autofocus in shader - use with focusCoords',
//     '// disable if you use external focalDepth value',

//     'uniform vec2 focusCoords;',
//     '// autofocus point on screen (0.0,0.0 - left lower corner, 1.0,1.0 - upper right)',
//     '// if center of screen use vec2(0.5, 0.5);',

//     'uniform float maxblur;',
//     '//clamp value of max blur (0.0 = no blur, 1.0 default)',

//     'uniform float threshold; // highlight threshold;',
//     'uniform float gain; // highlight gain;',

//     'uniform float bias; // bokeh edge bias',
//     'uniform float fringe; // bokeh chromatic aberration / fringing',

//     'uniform bool noise; //use noise instead of pattern for sample dithering',

//     'uniform float dithering;',
//     'float namount = dithering; //dither amount',

//     'uniform bool depthblur; // blur the depth buffer',
//     'float dbsize = 1.25; // depth blur size',

//     '/*',
//     'next part is experimental',
//     'not looking good with small sample and ring count',
//     'looks okay starting from samples = 4, rings = 4',
//     '*/',

//     'uniform bool pentagon; //use pentagon as bokeh shape?',
//     'float feather = 0.4; //pentagon shape feather',

//     '//------------------------------------------',

//     'float penta(vec2 coords) {',
//     '//pentagonal shape',
//     'float scale = float(rings) - 1.3;',
//     'vec4  HS0 = vec4( 1.0,         0.0,         0.0,  1.0);',
//     'vec4  HS1 = vec4( 0.309016994, 0.951056516, 0.0,  1.0);',
//     'vec4  HS2 = vec4(-0.809016994, 0.587785252, 0.0,  1.0);',
//     'vec4  HS3 = vec4(-0.809016994,-0.587785252, 0.0,  1.0);',
//     'vec4  HS4 = vec4( 0.309016994,-0.951056516, 0.0,  1.0);',
//     'vec4  HS5 = vec4( 0.0        ,0.0         , 1.0,  1.0);',

//     'vec4  one = vec4( 1.0 );',

//     'vec4 P = vec4((coords),vec2(scale, scale));',

//     'vec4 dist = vec4(0.0);',
//     'float inorout = -4.0;',

//     'dist.x = dot( P, HS0 );',
//     'dist.y = dot( P, HS1 );',
//     'dist.z = dot( P, HS2 );',
//     'dist.w = dot( P, HS3 );',

//     'dist = smoothstep( -feather, feather, dist );',

//     'inorout += dot( dist, one );',

//     'dist.x = dot( P, HS4 );',
//     'dist.y = HS5.w - abs( P.z );',

//     'dist = smoothstep( -feather, feather, dist );',
//     'inorout += dist.x;',

//     'return clamp( inorout, 0.0, 1.0 );',
//     '}',

//     'float bdepth(vec2 coords) {',
//     '// Depth buffer blur',
//     'float d = 0.0;',
//     'float kernel[9];',
//     'vec2 offset[9];',

//     'vec2 wh = vec2(texel.x, texel.y) * dbsize;',

//     'offset[0] = vec2(-wh.x,-wh.y);',
//     'offset[1] = vec2( 0.0, -wh.y);',
//     'offset[2] = vec2( wh.x -wh.y);',

//     'offset[3] = vec2(-wh.x,  0.0);',
//     'offset[4] = vec2( 0.0,   0.0);',
//     'offset[5] = vec2( wh.x,  0.0);',

//     'offset[6] = vec2(-wh.x, wh.y);',
//     'offset[7] = vec2( 0.0,  wh.y);',
//     'offset[8] = vec2( wh.x, wh.y);',

//     'kernel[0] = 1.0/16.0;   kernel[1] = 2.0/16.0;   kernel[2] = 1.0/16.0;',
//     'kernel[3] = 2.0/16.0;   kernel[4] = 4.0/16.0;   kernel[5] = 2.0/16.0;',
//     'kernel[6] = 1.0/16.0;   kernel[7] = 2.0/16.0;   kernel[8] = 1.0/16.0;',


//     'for( int i=0; i<9; i++ ) {',
//     'float tmp = texture2D(tDepth, coords + offset[i]).r;',
//     'd += tmp * kernel[i];',
//     '}',

//     'return d;',
//     '}',


//     'vec3 color(vec2 coords,float blur) {',
//     '//processing the sample',

//     'vec3 col = vec3(0.0);',

//     'col.r = texture2D(tColor,coords + vec2(0.0,1.0)*texel*fringe*blur).r;',
//     'col.g = texture2D(tColor,coords + vec2(-0.866,-0.5)*texel*fringe*blur).g;',
//     'col.b = texture2D(tColor,coords + vec2(0.866,-0.5)*texel*fringe*blur).b;',

//     'vec3 lumcoeff = vec3(0.299,0.587,0.114);',
//     'float lum = dot(col.rgb, lumcoeff);',
//     'float thresh = max((lum-threshold)*gain, 0.0);',
//     'return col+mix(vec3(0.0),col,thresh*blur);',
//     '}',

//     'vec2 rand(vec2 coord) {',
//     '// generating noise / pattern texture for dithering',

//     'float noiseX = ((fract(1.0-coord.s*(width/2.0))*0.25)+(fract(coord.t*(height/2.0))*0.75))*2.0-1.0;',
//     'float noiseY = ((fract(1.0-coord.s*(width/2.0))*0.75)+(fract(coord.t*(height/2.0))*0.25))*2.0-1.0;',

//     'if (noise) {',
//     'noiseX = clamp(fract(sin(dot(coord ,vec2(12.9898,78.233))) * 43758.5453),0.0,1.0)*2.0-1.0;',
//     'noiseY = clamp(fract(sin(dot(coord ,vec2(12.9898,78.233)*2.0)) * 43758.5453),0.0,1.0)*2.0-1.0;',
//     '}',

//     'return vec2(noiseX,noiseY);',
//     '}',

//     'vec3 debugFocus(vec3 col, float blur, float depth) {',
//     'float edge = 0.002*depth; //distance based edge smoothing',
//     'float m = clamp(smoothstep(0.0,edge,blur),0.0,1.0);',
//     'float e = clamp(smoothstep(1.0-edge,1.0,blur),0.0,1.0);',

//     'col = mix(col,vec3(1.0,0.5,0.0),(1.0-m)*0.6);',
//     'col = mix(col,vec3(0.0,0.5,1.0),((1.0-e)-(1.0-m))*0.2);',

//     'return col;',
//     '}',

//     'float linearize(float depth) {',
//     'return -zfar * znear / (depth * (zfar - znear) - zfar);',
//     '}',


//     'float vignette() {',
//     'float dist = distance(vUv.xy, vec2(0.5,0.5));',
//     'dist = smoothstep(vignout+(fstop/vignfade), vignin+(fstop/vignfade), dist);',
//     'return clamp(dist,0.0,1.0);',
//     '}',

//     'float gather(float i, float j, int ringsamples, inout vec3 col, float w, float h, float blur) {',
//     'float rings2 = float(rings);',
//     'float step = PI*2.0 / float(ringsamples);',
//     'float pw = cos(j*step)*i;',
//     'float ph = sin(j*step)*i;',
//     'float p = 1.0;',
//     'if (pentagon) {',
//     'p = penta(vec2(pw,ph));',
//     '}',
//     'col += color(vUv.xy + vec2(pw*w,ph*h), blur) * mix(1.0, i/rings2, bias) * p;',
//     'return 1.0 * mix(1.0, i /rings2, bias) * p;',
//     '}',

//     'void main() {',
//     '//scene depth calculation',

//     'float depth = linearize(texture2D(tDepth,vUv.xy).x);',

//     '// Blur depth?',
//     'if (depthblur) {',
//     'depth = linearize(bdepth(vUv.xy));',
//     '}',

//     '//focal plane calculation',

//     'float fDepth = focalDepth;',

//     'if (autofocus) {',

//     'fDepth = linearize(texture2D(tDepth,focusCoords).x);',

//     '}',

//     '// dof blur factor calculation',

//     'float blur = 0.0;',

//     'if (manualdof) {',
//     'float a = depth-fDepth; // Focal plane',
//     'float b = (a-fdofstart)/fdofdist; // Far DoF',
//     'float c = (-a-ndofstart)/ndofdist; // Near Dof',
//     'blur = (a>0.0) ? b : c;',
//     '} else {',
//     'float f = focalLength; // focal length in mm',
//     'float d = fDepth*1000.0; // focal plane in mm',
//     'float o = depth*1000.0; // depth in mm',

//     'float a = (o*f)/(o-f);',
//     'float b = (d*f)/(d-f);',
//     'float c = (d-f)/(d*fstop*CoC);',

//     'blur = abs(a-b)*c;',
//     '}',

//     'blur = clamp(blur,0.0,1.0);',

//     '// calculation of pattern for dithering',

//     'vec2 noise = rand(vUv.xy)*namount*blur;',

//     '// getting blur x and y step factor',

//     'float w = (1.0/width)*blur*maxblur+noise.x;',
//     'float h = (1.0/height)*blur*maxblur+noise.y;',

//     '// calculation of final color',

//     'vec3 col = vec3(0.0);',

//     'if(blur < 0.05) {',
//     '//some optimization thingy',
//     'col = texture2D(tColor, vUv.xy).rgb;',
//     '} else {',
//     'col = texture2D(tColor, vUv.xy).rgb;',
//     'float s = 1.0;',
//     'int ringsamples;',

//     'for (int i = 1; i <= rings; i++) {',
//     '/*unboxstart*/',
//     'ringsamples = i * samples;',

//     'for (int j = 0 ; j < maxringsamples ; j++) {',
//     'if (j >= ringsamples) break;',
//     's += gather(float(i), float(j), ringsamples, col, w, h, blur);',
//     '}',
//     '/*unboxend*/',
//     '}',

//     'col /= s; //divide by sample count',
//     '}',

//     'if (showFocus) {',
//     'col = debugFocus(col, blur, depth);',
//     '}',

//     'if (vignetting) {',
//     'col *= vignette();',
//     '}',

//     'gl_FragColor.rgb = col;',
//     'gl_FragColor.a = 1.0;',
//     '} '

//   ].join('\n')

// };

/**
 * @author tapio / http://tapio.github.com/
 *
 * Brightness and contrast adjustment
 * https://github.com/evanw/glfx.js
 * brightness: -1 to 1 (-1 is solid black, 0 is no change, and 1 is solid white)
 * contrast: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */

THREE.BrightnessContrastShader = {

  uniforms: {

    'tDiffuse':   { type: 't', value: null },
    'brightness': { type: 'f', value: 0 },
    'contrast':   { type: 'f', value: 0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',

    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'uniform float brightness;',
    'uniform float contrast;',

    'varying vec2 vUv;',

    'void main() {',

    'gl_FragColor = texture2D( tDiffuse, vUv );',

    'gl_FragColor.rgb += brightness;',

    'if (contrast > 0.0) {',
    'gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) / (1.0 - contrast) + 0.5;',
    '} else {',
    'gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * (1.0 + contrast) + 0.5;',
    '}',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Color correction
 */

THREE.ColorCorrectionShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'powRGB':   { type: 'v3', value: new THREE.Vector3( 2, 2, 2 ) },
    'mulRGB':   { type: 'v3', value: new THREE.Vector3( 1, 1, 1 ) }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',

    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'uniform vec3 powRGB;',
    'uniform vec3 mulRGB;',

    'varying vec2 vUv;',

    'void main() {',

    'gl_FragColor = texture2D( tDiffuse, vUv );',
    'gl_FragColor.rgb = mulRGB * pow( gl_FragColor.rgb, powRGB );',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Colorify shader
 */

THREE.ColorifyShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'color':    { type: 'c', value: new THREE.Color( 0xffffff ) }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform vec3 color;',
    'uniform sampler2D tDiffuse;',

    'varying vec2 vUv;',

    'void main() {',

    'vec4 texel = texture2D( tDiffuse, vUv );',

    'vec3 luma = vec3( 0.299, 0.587, 0.114 );',
    'float v = dot( texel.xyz, luma );',

    'gl_FragColor = vec4( v * color, texel.w );',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */

THREE.ConvolutionShader = {

  defines: {

    'KERNEL_SIZE_FLOAT': '25.0',
    'KERNEL_SIZE_INT': '25',

  },

  uniforms: {

    'tDiffuse':        { type: 't', value: null },
    'uImageIncrement': { type: 'v2', value: new THREE.Vector2( 0.001953125, 0.0 ) },
    'cKernel':         { type: 'fv1', value: [] }

  },

  vertexShader: [

    'uniform vec2 uImageIncrement;',

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform float cKernel[ KERNEL_SIZE_INT ];',

    'uniform sampler2D tDiffuse;',
    'uniform vec2 uImageIncrement;',

    'varying vec2 vUv;',

    'void main() {',

    'vec2 imageCoord = vUv;',
    'vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );',

    'for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {',

    'sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];',
    'imageCoord += uImageIncrement;',

    '}',

    'gl_FragColor = sum;',

    '}'


  ].join('\n'),

  buildKernel: function( sigma ) {

    // We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

    function gauss( x, sigma ) {

      return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

    }

    var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

    if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
    halfWidth = ( kernelSize - 1 ) * 0.5;

    values = new Array( kernelSize );
    sum = 0.0;
    for ( i = 0; i < kernelSize; ++i ) {

      values[ i ] = gauss( i - halfWidth, sigma );
      sum += values[ i ];

    }

    // normalize the kernel

    for ( i = 0; i < kernelSize; ++i ) values[ i ] /= sum;

    return values;

  }

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'opacity':  { type: 'f', value: 1.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform float opacity;',

    'uniform sampler2D tDiffuse;',

    'varying vec2 vUv;',

    'void main() {',

    'vec4 texel = texture2D( tDiffuse, vUv );',
    'gl_FragColor = opacity * texel;',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader using mipmaps
 * - from Matt Handley @applmak
 * - requires power-of-2 sized render target with enabled mipmaps
 */

THREE.DOFMipMapShader = {

  uniforms: {

    'tColor':   { type: 't', value: null },
    'tDepth':   { type: 't', value: null },
    'focus':    { type: 'f', value: 1.0 },
    'maxblur':  { type: 'f', value: 1.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform float focus;',
    'uniform float maxblur;',

    'uniform sampler2D tColor;',
    'uniform sampler2D tDepth;',

    'varying vec2 vUv;',

    'void main() {',

    'vec4 depth = texture2D( tDepth, vUv );',

    'float factor = depth.x - focus;',

    'vec4 col = texture2D( tColor, vUv, 2.0 * maxblur * abs( focus - depth.x ) );',

    'gl_FragColor = col;',
    'gl_FragColor.a = 1.0;',

    '}'

  ].join('\n')

};

/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

THREE.DigitalGlitch = {

  uniforms: {

    'tDiffuse':		{ type: 't', value: null },//diffuse texture
    'tDisp':		{ type: 't', value: null },//displacement texture for digital glitch squares
    'byp':			{ type: 'i', value: 0 },//apply the glitch ?
    'amount':		{ type: 'f', value: 0.08 },
    'angle':		{ type: 'f', value: 0.02 },
    'seed':			{ type: 'f', value: 0.02 },
    'seed_x':		{ type: 'f', value: 0.02 },//-1,1
    'seed_y':		{ type: 'f', value: 0.02 },//-1,1
    'distortion_x':	{ type: 'f', value: 0.5 },
    'distortion_y':	{ type: 'f', value: 0.6 },
    'col_s':		{ type: 'f', value: 0.05 }
  },

  vertexShader: [

    'varying vec2 vUv;',
    'void main() {',
    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
  ].join('\n'),

  fragmentShader: [
    'uniform int byp;',//should we apply the glitch ?
		
    'uniform sampler2D tDiffuse;',
    'uniform sampler2D tDisp;',
		
    'uniform float amount;',
    'uniform float angle;',
    'uniform float seed;',
    'uniform float seed_x;',
    'uniform float seed_y;',
    'uniform float distortion_x;',
    'uniform float distortion_y;',
    'uniform float col_s;',
			
    'varying vec2 vUv;',
		
		
    'float rand(vec2 co){',
    'return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);',
    '}',
				
    'void main() {',
    'if(byp<1) {',
    'vec2 p = vUv;',
    'float xs = floor(gl_FragCoord.x / 0.5);',
    'float ys = floor(gl_FragCoord.y / 0.5);',
    //based on staffantans glitch shader for unity https://github.com/staffantan/unityglitch
    'vec4 normal = texture2D (tDisp, p*seed*seed);',
    'if(p.y<distortion_x+col_s && p.y>distortion_x-col_s*seed) {',
    'if(seed_x>0.){',
    'p.y = 1. - (p.y + distortion_y);',
    '}',
    'else {',
    'p.y = distortion_y;',
    '}',
    '}',
    'if(p.x<distortion_y+col_s && p.x>distortion_y-col_s*seed) {',
    'if(seed_y>0.){',
    'p.x=distortion_x;',
    '}',
    'else {',
    'p.x = 1. - (p.x + distortion_x);',
    '}',
    '}',
    'p.x+=normal.x*seed_x*(seed/5.);',
    'p.y+=normal.y*seed_y*(seed/5.);',
    //base from RGB shift shader
    'vec2 offset = amount * vec2( cos(angle), sin(angle));',
    'vec4 cr = texture2D(tDiffuse, p + offset);',
    'vec4 cga = texture2D(tDiffuse, p);',
    'vec4 cb = texture2D(tDiffuse, p - offset);',
    'gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);',
    //add noise
    'vec4 snow = 200.*amount*vec4(rand(vec2(xs * seed,ys * seed*50.))*0.2);',
    'gl_FragColor = gl_FragColor+ snow;',
    '}',
    'else {',
    'gl_FragColor=texture2D (tDiffuse, vUv);',
    '}',
    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.DotScreenShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'tSize':    { type: 'v2', value: new THREE.Vector2( 256, 256 ) },
    'center':   { type: 'v2', value: new THREE.Vector2( 0.5, 0.5 ) },
    'angle':    { type: 'f', value: 1.57 },
    'scale':    { type: 'f', value: 1.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform vec2 center;',
    'uniform float angle;',
    'uniform float scale;',
    'uniform vec2 tSize;',

    'uniform sampler2D tDiffuse;',

    'varying vec2 vUv;',

    'float pattern() {',

    'float s = sin( angle ), c = cos( angle );',

    'vec2 tex = vUv * tSize - center;',
    'vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;',

    'return ( sin( point.x ) * sin( point.y ) ) * 4.0;',

    '}',

    'void main() {',

    'vec4 color = texture2D( tDiffuse, vUv );',

    'float average = ( color.r + color.g + color.b ) / 3.0;',

    'gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );',

    '}'

  ].join('\n')

};

/**
 * @author zz85 / https://github.com/zz85 | https://www.lab4games.net/zz85/blog
 *
 * Edge Detection Shader using Frei-Chen filter
 * Based on http://rastergrid.com/blog/2011/01/frei-chen-edge-detector
 *
 * aspect: vec2 of (1/width, 1/height)
 */

THREE.EdgeShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'aspect':    { type: 'v2', value: new THREE.Vector2( 512, 512 ) },
  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'varying vec2 vUv;',

    'uniform vec2 aspect;',

    'vec2 texel = vec2(1.0 / aspect.x, 1.0 / aspect.y);',


    'mat3 G[9];',

    // hard coded matrix values!!!! as suggested in https://github.com/neilmendoza/ofxPostProcessing/blob/master/src/EdgePass.cpp#L45

    'const mat3 g0 = mat3( 0.3535533845424652, 0, -0.3535533845424652, 0.5, 0, -0.5, 0.3535533845424652, 0, -0.3535533845424652 );',
    'const mat3 g1 = mat3( 0.3535533845424652, 0.5, 0.3535533845424652, 0, 0, 0, -0.3535533845424652, -0.5, -0.3535533845424652 );',
    'const mat3 g2 = mat3( 0, 0.3535533845424652, -0.5, -0.3535533845424652, 0, 0.3535533845424652, 0.5, -0.3535533845424652, 0 );',
    'const mat3 g3 = mat3( 0.5, -0.3535533845424652, 0, -0.3535533845424652, 0, 0.3535533845424652, 0, 0.3535533845424652, -0.5 );',
    'const mat3 g4 = mat3( 0, -0.5, 0, 0.5, 0, 0.5, 0, -0.5, 0 );',
    'const mat3 g5 = mat3( -0.5, 0, 0.5, 0, 0, 0, 0.5, 0, -0.5 );',
    'const mat3 g6 = mat3( 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.6666666865348816, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204 );',
    'const mat3 g7 = mat3( -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, 0.6666666865348816, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408 );',
    'const mat3 g8 = mat3( 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408 );',

    'void main(void)',
    '{',

    'G[0] = g0,',
    'G[1] = g1,',
    'G[2] = g2,',
    'G[3] = g3,',
    'G[4] = g4,',
    'G[5] = g5,',
    'G[6] = g6,',
    'G[7] = g7,',
    'G[8] = g8;',

    'mat3 I;',
    'float cnv[9];',
    'vec3 sample;',

    /* fetch the 3x3 neighbourhood and use the RGB vector's length as intensity value */
    'for (float i=0.0; i<3.0; i++) {',
    'for (float j=0.0; j<3.0; j++) {',
    'sample = texture2D(tDiffuse, vUv + texel * vec2(i-1.0,j-1.0) ).rgb;',
    'I[int(i)][int(j)] = length(sample);',
    '}',
    '}',

    /* calculate the convolution values for all the masks */
    'for (int i=0; i<9; i++) {',
    'float dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);',
    'cnv[i] = dp3 * dp3;',
    '}',

    'float M = (cnv[0] + cnv[1]) + (cnv[2] + cnv[3]);',
    'float S = (cnv[4] + cnv[5]) + (cnv[6] + cnv[7]) + (cnv[8] + M);',

    'gl_FragColor = vec4(vec3(sqrt(M/S)), 1.0);',
    '}',

  ].join('\n')
};

/**
 * @author zz85 / https://github.com/zz85 | https://www.lab4games.net/zz85/blog
 *
 * Edge Detection Shader using Sobel filter
 * Based on http://rastergrid.com/blog/2011/01/frei-chen-edge-detector
 *
 * aspect: vec2 of (1/width, 1/height)
 */

THREE.EdgeShader2 = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'aspect':    { type: 'v2', value: new THREE.Vector2( 512, 512 ) },
  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'varying vec2 vUv;',
    'uniform vec2 aspect;',


    'vec2 texel = vec2(1.0 / aspect.x, 1.0 / aspect.y);',

    'mat3 G[2];',

    'const mat3 g0 = mat3( 1.0, 2.0, 1.0, 0.0, 0.0, 0.0, -1.0, -2.0, -1.0 );',
    'const mat3 g1 = mat3( 1.0, 0.0, -1.0, 2.0, 0.0, -2.0, 1.0, 0.0, -1.0 );',


    'void main(void)',
    '{',
    'mat3 I;',
    'float cnv[2];',
    'vec3 sample;',

    'G[0] = g0;',
    'G[1] = g1;',

    /* fetch the 3x3 neighbourhood and use the RGB vector's length as intensity value */
    'for (float i=0.0; i<3.0; i++)',
    'for (float j=0.0; j<3.0; j++) {',
    'sample = texture2D( tDiffuse, vUv + texel * vec2(i-1.0,j-1.0) ).rgb;',
    'I[int(i)][int(j)] = length(sample);',
    '}',

    /* calculate the convolution values for all the masks */
    'for (int i=0; i<2; i++) {',
    'float dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);',
    'cnv[i] = dp3 * dp3; ',
    '}',

    'gl_FragColor = vec4(0.5 * sqrt(cnv[0]*cnv[0]+cnv[1]*cnv[1]));',
    '} ',

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 * @author davidedc / http://www.sketchpatch.net/
 *
 * NVIDIA FXAA by Timothy Lottes
 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
 * - WebGL port by @supereggbert
 * http://www.glge.org/demos/fxaa/
 */

THREE.FXAAShader = {

  uniforms: {

    'tDiffuse':   { type: 't', value: null },
    'resolution': { type: 'v2', value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

  },

  vertexShader: [

    'void main() {',

    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'uniform vec2 resolution;',

    '#define FXAA_REDUCE_MIN   (1.0/128.0)',
    '#define FXAA_REDUCE_MUL   (1.0/8.0)',
    '#define FXAA_SPAN_MAX     8.0',

    'void main() {',

    'vec3 rgbNW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * resolution ).xyz;',
    'vec3 rgbNE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * resolution ).xyz;',
    'vec3 rgbSW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * resolution ).xyz;',
    'vec3 rgbSE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * resolution ).xyz;',
    'vec4 rgbaM  = texture2D( tDiffuse,  gl_FragCoord.xy  * resolution );',
    'vec3 rgbM  = rgbaM.xyz;',
    'vec3 luma = vec3( 0.299, 0.587, 0.114 );',

    'float lumaNW = dot( rgbNW, luma );',
    'float lumaNE = dot( rgbNE, luma );',
    'float lumaSW = dot( rgbSW, luma );',
    'float lumaSE = dot( rgbSE, luma );',
    'float lumaM  = dot( rgbM,  luma );',
    'float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );',
    'float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );',

    'vec2 dir;',
    'dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));',
    'dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));',

    'float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );',

    'float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );',
    'dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),',
				  'max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),',
    'dir * rcpDirMin)) * resolution;',
    'vec4 rgbA = (1.0/2.0) * (',
        	'texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (1.0/3.0 - 0.5)) +',
    'texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (2.0/3.0 - 0.5)));',
    		'vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (',
    'texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (0.0/3.0 - 0.5)) +',
      		'texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (3.0/3.0 - 0.5)));',
    		'float lumaB = dot(rgbB, vec4(luma, 0.0));',

    'if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {',

    'gl_FragColor = rgbA;',

    '} else {',
    'gl_FragColor = rgbB;',

    '}',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */

THREE.FilmShader = {

  uniforms: {

    'tDiffuse':   { type: 't', value: null },
    'time':       { type: 'f', value: 0.0 },
    'nIntensity': { type: 'f', value: 0.5 },
    'sIntensity': { type: 'f', value: 0.05 },
    'sCount':     { type: 'f', value: 4096 },
    'grayscale':  { type: 'i', value: 1 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    // control parameter
    'uniform float time;',

    'uniform bool grayscale;',

    // noise effect intensity value (0 = no effect, 1 = full effect)
    'uniform float nIntensity;',

    // scanlines effect intensity value (0 = no effect, 1 = full effect)
    'uniform float sIntensity;',

    // scanlines effect count value (0 = no effect, 4096 = full effect)
    'uniform float sCount;',

    'uniform sampler2D tDiffuse;',

    'varying vec2 vUv;',

    'void main() {',

    // sample the source
    'vec4 cTextureScreen = texture2D( tDiffuse, vUv );',

    // make some noise
    'float x = vUv.x * vUv.y * time *  1000.0;',
    'x = mod( x, 13.0 ) * mod( x, 123.0 );',
    'float dx = mod( x, 0.01 );',

    // add noise
    'vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );',

    // get us a sine and cosine
    'vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );',

    // add scanlines
    'cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;',

    // interpolate between source and result by intensity
    'cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );',

    // convert to grayscale if desired
    'if( grayscale ) {',

    'cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );',

    '}',

    'gl_FragColor =  vec4( cResult, cTextureScreen.a );',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Focus shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

THREE.FocusShader = {

  uniforms : {

    'tDiffuse':       { type: 't', value: null },
    'screenWidth':    { type: 'f', value: 1024 },
    'screenHeight':   { type: 'f', value: 1024 },
    'sampleDistance': { type: 'f', value: 0.94 },
    'waveFactor':     { type: 'f', value: 0.00125 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform float screenWidth;',
    'uniform float screenHeight;',
    'uniform float sampleDistance;',
    'uniform float waveFactor;',

    'uniform sampler2D tDiffuse;',

    'varying vec2 vUv;',

    'void main() {',

    'vec4 color, org, tmp, add;',
    'float sample_dist, f;',
    'vec2 vin;',
    'vec2 uv = vUv;',

    'add = color = org = texture2D( tDiffuse, uv );',

    'vin = ( uv - vec2( 0.5 ) ) * vec2( 1.4 );',
    'sample_dist = dot( vin, vin ) * 2.0;',

    'f = ( waveFactor * 100.0 + sample_dist ) * sampleDistance * 4.0;',

    'vec2 sampleSize = vec2(  1.0 / screenWidth, 1.0 / screenHeight ) * vec2( f );',

    'add += tmp = texture2D( tDiffuse, uv + vec2( 0.111964, 0.993712 ) * sampleSize );',
    'if( tmp.b < color.b ) color = tmp;',

    'add += tmp = texture2D( tDiffuse, uv + vec2( 0.846724, 0.532032 ) * sampleSize );',
    'if( tmp.b < color.b ) color = tmp;',

    'add += tmp = texture2D( tDiffuse, uv + vec2( 0.943883, -0.330279 ) * sampleSize );',
    'if( tmp.b < color.b ) color = tmp;',

    'add += tmp = texture2D( tDiffuse, uv + vec2( 0.330279, -0.943883 ) * sampleSize );',
    'if( tmp.b < color.b ) color = tmp;',

    'add += tmp = texture2D( tDiffuse, uv + vec2( -0.532032, -0.846724 ) * sampleSize );',
    'if( tmp.b < color.b ) color = tmp;',

    'add += tmp = texture2D( tDiffuse, uv + vec2( -0.993712, -0.111964 ) * sampleSize );',
    'if( tmp.b < color.b ) color = tmp;',

    'add += tmp = texture2D( tDiffuse, uv + vec2( -0.707107, 0.707107 ) * sampleSize );',
    'if( tmp.b < color.b ) color = tmp;',

    'color = color * vec4( 2.0 ) - ( add / vec4( 8.0 ) );',
    'color = color + ( add / vec4( 8.0 ) - color ) * ( vec4( 1.0 ) - vec4( sample_dist * 0.5 ) );',

    'gl_FragColor = vec4( color.rgb * color.rgb * vec3( 0.95 ) + color.rgb, 1.0 );',

    '}'


  ].join('\n')
};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Based on Nvidia Cg tutorial
 */

THREE.FresnelShader = {

  uniforms: {

    'mRefractionRatio': { type: 'f', value: 1.02 },
    'mFresnelBias': { type: 'f', value: 0.1 },
    'mFresnelPower': { type: 'f', value: 2.0 },
    'mFresnelScale': { type: 'f', value: 1.0 },
    'tCube': { type: 't', value: null }

  },

  vertexShader: [

    'uniform float mRefractionRatio;',
    'uniform float mFresnelBias;',
    'uniform float mFresnelScale;',
    'uniform float mFresnelPower;',

    'varying vec3 vReflect;',
    'varying vec3 vRefract[3];',
    'varying float vReflectionFactor;',

    'void main() {',

    'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
    'vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',

    'vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );',

    'vec3 I = worldPosition.xyz - cameraPosition;',

    'vReflect = reflect( I, worldNormal );',
    'vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );',
    'vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );',
    'vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );',
    'vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );',

    'gl_Position = projectionMatrix * mvPosition;',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform samplerCube tCube;',

    'varying vec3 vReflect;',
    'varying vec3 vRefract[3];',
    'varying float vReflectionFactor;',

    'void main() {',

    'vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );',
    'vec4 refractedColor = vec4( 1.0 );',

    'refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;',
    'refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;',
    'refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;',

    'gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );',

    '}'

  ].join('\n')

};

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.HorizontalBlurShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'h':        { type: 'f', value: 1.0 / 512.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'uniform float h;',

    'varying vec2 vUv;',

    'void main() {',

    'vec4 sum = vec4( 0.0 );',

    'sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;',
    'sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;',
    'sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;',
    'sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;',
    'sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;',
    'sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;',
    'sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;',
    'sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;',

    'gl_FragColor = sum;',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Simple fake tilt-shift effect, modulating two pass Gaussian blur (see above) by vertical position
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 * - "r" parameter control where "focused" horizontal line lies
 */

THREE.HorizontalTiltShiftShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'h':        { type: 'f', value: 1.0 / 512.0 },
    'r':        { type: 'f', value: 0.35 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'uniform float h;',
    'uniform float r;',

    'varying vec2 vUv;',

    'void main() {',

    'vec4 sum = vec4( 0.0 );',

    'float hh = h * abs( r - vUv.y );',

    'sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * hh, vUv.y ) ) * 0.051;',
    'sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * hh, vUv.y ) ) * 0.0918;',
    'sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * hh, vUv.y ) ) * 0.12245;',
    'sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * hh, vUv.y ) ) * 0.1531;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;',
    'sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * hh, vUv.y ) ) * 0.1531;',
    'sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * hh, vUv.y ) ) * 0.12245;',
    'sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * hh, vUv.y ) ) * 0.0918;',
    'sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * hh, vUv.y ) ) * 0.051;',

    'gl_FragColor = sum;',

    '}'

  ].join('\n')

};

/**
 * @author tapio / http://tapio.github.com/
 *
 * Hue and saturation adjustment
 * https://github.com/evanw/glfx.js
 * hue: -1 to 1 (-1 is 180 degrees in the negative direction, 0 is no change, etc.
 * saturation: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */

THREE.HueSaturationShader = {

  uniforms: {

    'tDiffuse':   { type: 't', value: null },
    'hue':        { type: 'f', value: 0 },
    'saturation': { type: 'f', value: 0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',

    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'uniform float hue;',
    'uniform float saturation;',

    'varying vec2 vUv;',

    'void main() {',

    'gl_FragColor = texture2D( tDiffuse, vUv );',

    // hue
    'float angle = hue * 3.14159265;',
    'float s = sin(angle), c = cos(angle);',
    'vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;',
    'float len = length(gl_FragColor.rgb);',
    'gl_FragColor.rgb = vec3(',
    'dot(gl_FragColor.rgb, weights.xyz),',
    'dot(gl_FragColor.rgb, weights.zxy),',
    'dot(gl_FragColor.rgb, weights.yzx)',
    ');',

    // saturation
    'float average = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0;',
    'if (saturation > 0.0) {',
    'gl_FragColor.rgb += (average - gl_FragColor.rgb) * (1.0 - 1.0 / (1.001 - saturation));',
    '} else {',
    'gl_FragColor.rgb += (average - gl_FragColor.rgb) * (-saturation);',
    '}',

    '}'

  ].join('\n')

};

/**
 * @author felixturner / http://airtight.cc/
 *
 * Kaleidoscope Shader
 * Radial reflection around center point
 * Ported from: http://pixelshaders.com/editor/
 * by Toby Schachman / http://tobyschachman.com/
 *
 * sides: number of reflections
 * angle: initial angle in radians
 */

THREE.KaleidoShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'sides':    { type: 'f', value: 6.0 },
    'angle':    { type: 'f', value: 0.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'uniform float sides;',
    'uniform float angle;',
		
    'varying vec2 vUv;',

    'void main() {',

    'vec2 p = vUv - 0.5;',
    'float r = length(p);',
    'float a = atan(p.y, p.x) + angle;',
    'float tau = 2. * 3.1416 ;',
    'a = mod(a, tau/sides);',
    'a = abs(a - tau/sides/2.) ;',
    'p = r * vec2(cos(a), sin(a));',
    'vec4 color = texture2D(tDiffuse, p + 0.5);',
    'gl_FragColor = color;',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

THREE.LuminosityShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',

    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',

    'varying vec2 vUv;',

    'void main() {',

    'vec4 texel = texture2D( tDiffuse, vUv );',

    'vec3 luma = vec3( 0.299, 0.587, 0.114 );',

    'float v = dot( texel.xyz, luma );',

    'gl_FragColor = vec4( v, v, v, texel.w );',

    '}'

  ].join('\n')

};

/**
 * @author felixturner / http://airtight.cc/
 *
 * Mirror Shader
 * Copies half the input to the other half
 *
 * side: side of input to mirror (0 = left, 1 = right, 2 = top, 3 = bottom)
 */

THREE.MirrorShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'side':     { type: 'i', value: 1 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'uniform int side;',
		
    'varying vec2 vUv;',

    'void main() {',

    'vec2 p = vUv;',
    'if (side === 0){',
    'if (p.x > 0.5) p.x = 1.0 - p.x;',
    '}else if (side === 1){',
    'if (p.x < 0.5) p.x = 1.0 - p.x;',
    '}else if (side === 2){',
    'if (p.y < 0.5) p.y = 1.0 - p.y;',
    '}else if (side === 3){',
    'if (p.y > 0.5) p.y = 1.0 - p.y;',
    '} ',
    'vec4 color = texture2D(tDiffuse, p);',
    'gl_FragColor = color;',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Normal map shader
 * - compute normals from heightmap
 */

THREE.NormalMapShader = {

  uniforms: {

    'heightMap':  { type: 't', value: null },
    'resolution': { type: 'v2', value: new THREE.Vector2( 512, 512 ) },
    'scale':      { type: 'v2', value: new THREE.Vector2( 1, 1 ) },
    'height':     { type: 'f', value: 0.05 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform float height;',
    'uniform vec2 resolution;',
    'uniform sampler2D heightMap;',

    'varying vec2 vUv;',

    'void main() {',

    'float val = texture2D( heightMap, vUv ).x;',

    'float valU = texture2D( heightMap, vUv + vec2( 1.0 / resolution.x, 0.0 ) ).x;',
    'float valV = texture2D( heightMap, vUv + vec2( 0.0, 1.0 / resolution.y ) ).x;',

    'gl_FragColor = vec4( ( 0.5 * normalize( vec3( val - valU, val - valV, height  ) ) + 0.5 ), 1.0 );',

    '}'

  ].join('\n')

};

// Parallax Occlusion shaders from
//    http://sunandblackcat.com/tipFullView.php?topicid=28
// No tangent-space transforms logic based on
//   http://mmikkelsen3d.blogspot.sk/2012/02/parallaxpoc-mapping-and-no-tangent.html

THREE.ParallaxShader = {
  // Ordered from fastest to best quality.
  modes: {
    none:  'NO_PARALLAX',
    basic: 'USE_BASIC_PARALLAX',
    steep: 'USE_STEEP_PARALLAX',
    occlusion: 'USE_OCLUSION_PARALLAX', // a.k.a. POM
    relief: 'USE_RELIEF_PARALLAX',
  },

  uniforms: {
    'bumpMap': { type: 't', value: null },
    'map': { type: 't', value: null },
    'parallaxScale': { type: 'f', value: null },
    'parallaxMinLayers': { type: 'f', value: null },
    'parallaxMaxLayers': { type: 'f', value: null }
  },

  vertexShader: [
    'varying vec2 vUv;',
    'varying vec3 vViewPosition;',
    'varying vec3 vNormal;',

    'void main() {',

    'vUv = uv;',
    'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
    'vViewPosition = -mvPosition.xyz;',
    'vNormal = normalize( normalMatrix * normal );',
    'gl_Position = projectionMatrix * mvPosition;',

    '}'

  ].join( '\n' ),

  fragmentShader: [
    'uniform sampler2D bumpMap;',
    'uniform sampler2D map;',

    'uniform float parallaxScale;',
    'uniform float parallaxMinLayers;',
    'uniform float parallaxMaxLayers;',

    'varying vec2 vUv;',
    'varying vec3 vViewPosition;',
    'varying vec3 vNormal;',

    '#ifdef USE_BASIC_PARALLAX',

    'vec2 parallaxMap( in vec3 V ) {',

    'float initialHeight = texture2D( bumpMap, vUv ).r;',

    // No Offset Limitting: messy, floating output at grazing angles.
    //"vec2 texCoordOffset = parallaxScale * V.xy / V.z * initialHeight;",

    // Offset Limiting
    'vec2 texCoordOffset = parallaxScale * V.xy * initialHeight;',
    'return vUv - texCoordOffset;',

    '}',

    '#else',

    'vec2 parallaxMap( in vec3 V ) {',

    // Determine number of layers from angle between V and N
    'float numLayers = mix( parallaxMaxLayers, parallaxMinLayers, abs( dot( vec3( 0.0, 0.0, 1.0 ), V ) ) );',

    'float layerHeight = 1.0 / numLayers;',
    'float currentLayerHeight = 0.0;',
    // Shift of texture coordinates for each iteration
    'vec2 dtex = parallaxScale * V.xy / V.z / numLayers;',

    'vec2 currentTextureCoords = vUv;',

    'float heightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;',

    // while ( heightFromTexture > currentLayerHeight )
    'for ( int i = 0; i === 0; i += 0 ) {',
    'if ( heightFromTexture <= currentLayerHeight ) {',
    'break;',
    '}',
    'currentLayerHeight += layerHeight;',
    // Shift texture coordinates along vector V
    'currentTextureCoords -= dtex;',
    'heightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;',
    '}',

    '#ifdef USE_STEEP_PARALLAX',

    'return currentTextureCoords;',

    '#elif defined( USE_RELIEF_PARALLAX )',

    'vec2 deltaTexCoord = dtex / 2.0;',
    'float deltaHeight = layerHeight / 2.0;',

    // Return to the mid point of previous layer
    'currentTextureCoords += deltaTexCoord;',
    'currentLayerHeight -= deltaHeight;',

    // Binary search to increase precision of Steep Parallax Mapping
    'const int numSearches = 5;',
    'for ( int i = 0; i < numSearches; i += 1 ) {',

    'deltaTexCoord /= 2.0;',
    'deltaHeight /= 2.0;',
    'heightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;',
    // Shift along or against vector V
    'if( heightFromTexture > currentLayerHeight ) {', // Below the surface

    'currentTextureCoords -= deltaTexCoord;',
    'currentLayerHeight += deltaHeight;',

    '} else {', // above the surface

    'currentTextureCoords += deltaTexCoord;',
    'currentLayerHeight -= deltaHeight;',

    '}',

    '}',
    'return currentTextureCoords;',

    '#elif defined( USE_OCLUSION_PARALLAX )',

    'vec2 prevTCoords = currentTextureCoords + dtex;',

    // Heights for linear interpolation
    'float nextH = heightFromTexture - currentLayerHeight;',
    'float prevH = texture2D( bumpMap, prevTCoords ).r - currentLayerHeight + layerHeight;',

    // Proportions for linear interpolation
    'float weight = nextH / ( nextH - prevH );',

    // Interpolation of texture coordinates
    'return prevTCoords * weight + currentTextureCoords * ( 1.0 - weight );',

    '#else', // NO_PARALLAX

    'return vUv;',

    '#endif',

    '}',
    '#endif',

    'vec2 perturbUv( vec3 surfPosition, vec3 surfNormal, vec3 viewPosition ) {',

 			'vec2 texDx = dFdx( vUv );',
    'vec2 texDy = dFdy( vUv );',

    'vec3 vSigmaX = dFdx( surfPosition );',
    'vec3 vSigmaY = dFdy( surfPosition );',
    'vec3 vR1 = cross( vSigmaY, surfNormal );',
    'vec3 vR2 = cross( surfNormal, vSigmaX );',
    'float fDet = dot( vSigmaX, vR1 );',

    'vec2 vProjVscr = ( 1.0 / fDet ) * vec2( dot( vR1, viewPosition ), dot( vR2, viewPosition ) );',
    'vec3 vProjVtex;',
    'vProjVtex.xy = texDx * vProjVscr.x + texDy * vProjVscr.y;',
    'vProjVtex.z = dot( surfNormal, viewPosition );',

    'return parallaxMap( vProjVtex );',
    '}',

    'void main() {',

    'vec2 mapUv = perturbUv( -vViewPosition, normalize( vNormal ), normalize( vViewPosition ) );',
    'gl_FragColor = texture2D( map, mapUv );',

    '}',

  ].join( '\n' )

};

/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

THREE.RGBShiftShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'amount':   { type: 'f', value: 0.005 },
    'angle':    { type: 'f', value: 0.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'uniform float amount;',
    'uniform float angle;',

    'varying vec2 vUv;',

    'void main() {',

    'vec2 offset = amount * vec2( cos(angle), sin(angle));',
    'vec4 cr = texture2D(tDiffuse, vUv + offset);',
    'vec4 cga = texture2D(tDiffuse, vUv);',
    'vec4 cb = texture2D(tDiffuse, vUv - offset);',
    'gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Screen-space ambient occlusion shader
 * - ported from
 *   SSAO GLSL shader v1.2
 *   assembled by Martins Upitis (martinsh) (http://devlog-martinsh.blogspot.com)
 *   original technique is made by ArKano22 (http://www.gamedev.net/topic/550699-ssao-no-halo-artifacts/)
 * - modifications
 * - modified to use RGBA packed depth texture (use clear color 1,1,1,1 for depth pass)
 * - refactoring and optimizations
 */

THREE.SSAOShader = {

  uniforms: {

    'tDiffuse':     { type: 't', value: null },
    'tDepth':       { type: 't', value: null },
    'size':         { type: 'v2', value: new THREE.Vector2( 512, 512 ) },
    'cameraNear':   { type: 'f', value: 1 },
    'cameraFar':    { type: 'f', value: 100 },
    'onlyAO':       { type: 'i', value: 0 },
    'aoClamp':      { type: 'f', value: 0.5 },
    'lumInfluence': { type: 'f', value: 0.5 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',

    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform float cameraNear;',
    'uniform float cameraFar;',

    'uniform bool onlyAO;', // use only ambient occlusion pass?

    'uniform vec2 size;', // texture width, height
    'uniform float aoClamp;', // depth clamp - reduces haloing at screen edges

    'uniform float lumInfluence;', // how much luminance affects occlusion

    'uniform sampler2D tDiffuse;',
    'uniform sampler2D tDepth;',

    'varying vec2 vUv;',

    // "#define PI 3.14159265",
    '#define DL 2.399963229728653', // PI * ( 3.0 - sqrt( 5.0 ) )
    '#define EULER 2.718281828459045',

    // helpers

    'float width = size.x;', // texture width
    'float height = size.y;', // texture height

    'float cameraFarPlusNear = cameraFar + cameraNear;',
    'float cameraFarMinusNear = cameraFar - cameraNear;',
    'float cameraCoef = 2.0 * cameraNear;',

    // user variables

    'const int samples = 8;', // ao sample count
    'const float radius = 5.0;', // ao radius

    'const bool useNoise = false;', // use noise instead of pattern for sample dithering
    'const float noiseAmount = 0.0003;', // dithering amount

    'const float diffArea = 0.4;', // self-shadowing reduction
    'const float gDisplace = 0.4;', // gauss bell center


    // RGBA depth

    'float unpackDepth( const in vec4 rgba_depth ) {',

    'const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );',
    'float depth = dot( rgba_depth, bit_shift );',
    'return depth;',

    '}',

    // generating noise / pattern texture for dithering

    'vec2 rand( const vec2 coord ) {',

    'vec2 noise;',

    'if ( useNoise ) {',

    'float nx = dot ( coord, vec2( 12.9898, 78.233 ) );',
    'float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );',

    'noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );',

    '} else {',

    'float ff = fract( 1.0 - coord.s * ( width / 2.0 ) );',
    'float gg = fract( coord.t * ( height / 2.0 ) );',

    'noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;',

    '}',

    'return ( noise * 2.0  - 1.0 ) * noiseAmount;',

    '}',

    'float readDepth( const in vec2 coord ) {',

    // "return ( 2.0 * cameraNear ) / ( cameraFar + cameraNear - unpackDepth( texture2D( tDepth, coord ) ) * ( cameraFar - cameraNear ) );",
    'return cameraCoef / ( cameraFarPlusNear - unpackDepth( texture2D( tDepth, coord ) ) * cameraFarMinusNear );',


    '}',

    'float compareDepths( const in float depth1, const in float depth2, inout int far ) {',

    'float garea = 2.0;', // gauss bell width
    'float diff = ( depth1 - depth2 ) * 100.0;', // depth difference (0-100)

    // reduce left bell width to avoid self-shadowing

    'if ( diff < gDisplace ) {',

    'garea = diffArea;',

    '} else {',

    'far = 1;',

    '}',

    'float dd = diff - gDisplace;',
    'float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );',
    'return gauss;',

    '}',

    'float calcAO( float depth, float dw, float dh ) {',

    'float dd = radius - depth * radius;',
    'vec2 vv = vec2( dw, dh );',

    'vec2 coord1 = vUv + dd * vv;',
    'vec2 coord2 = vUv - dd * vv;',

    'float temp1 = 0.0;',
    'float temp2 = 0.0;',

    'int far = 0;',
    'temp1 = compareDepths( depth, readDepth( coord1 ), far );',

    // DEPTH EXTRAPOLATION

    'if ( far > 0 ) {',

    'temp2 = compareDepths( readDepth( coord2 ), depth, far );',
    'temp1 += ( 1.0 - temp1 ) * temp2;',

    '}',

    'return temp1;',

    '}',

    'void main() {',

    'vec2 noise = rand( vUv );',
    'float depth = readDepth( vUv );',

    'float tt = clamp( depth, aoClamp, 1.0 );',

    'float w = ( 1.0 / width )  / tt + ( noise.x * ( 1.0 - noise.x ) );',
    'float h = ( 1.0 / height ) / tt + ( noise.y * ( 1.0 - noise.y ) );',

    'float ao = 0.0;',

    'float dz = 1.0 / float( samples );',
    'float z = 1.0 - dz / 2.0;',
    'float l = 0.0;',

    'for ( int i = 0; i <= samples; i ++ ) {',

    'float r = sqrt( 1.0 - z );',

    'float pw = cos( l ) * r;',
    'float ph = sin( l ) * r;',
    'ao += calcAO( depth, pw * w, ph * h );',
    'z = z - dz;',
    'l = l + DL;',

    '}',

    'ao /= float( samples );',
    'ao = 1.0 - ao;',

    'vec3 color = texture2D( tDiffuse, vUv ).rgb;',

    'vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );',
    'float lum = dot( color.rgb, lumcoeff );',
    'vec3 luminance = vec3( lum );',

    'vec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );', // mix( color * ao, white, luminance )

    'if ( onlyAO ) {',

    'final = vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );', // ambient occlusion only

    '}',

    'gl_FragColor = vec4( final, 1.0 );',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Sepia tone shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.SepiaShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'amount':   { type: 'f', value: 1.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform float amount;',

    'uniform sampler2D tDiffuse;',

    'varying vec2 vUv;',

    'void main() {',

    'vec4 color = texture2D( tDiffuse, vUv );',
    'vec3 c = color.rgb;',

    'color.r = dot( c, vec3( 1.0 - 0.607 * amount, 0.769 * amount, 0.189 * amount ) );',
    'color.g = dot( c, vec3( 0.349 * amount, 1.0 - 0.314 * amount, 0.168 * amount ) );',
    'color.b = dot( c, vec3( 0.272 * amount, 0.534 * amount, 1.0 - 0.869 * amount ) );',

    'gl_FragColor = vec4( min( vec3( 1.0 ), color.rgb ), color.a );',

    '}'

  ].join('\n')

};

/**
 * @author flimshaw / http://charliehoey.com
 *
 * Technicolor Shader
 * Simulates the look of the two-strip technicolor process popular in early 20th century films.
 * More historical info here: http://www.widescreenmuseum.com/oldcolor/technicolor1.htm
 * Demo here: http://charliehoey.com/technicolor_shader/shader_test.html
 */

THREE.TechnicolorShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'varying vec2 vUv;',

    'void main() {',

    'vec4 tex = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );',
    'vec4 newTex = vec4(tex.r, (tex.g + tex.b) * .5, (tex.g + tex.b) * .5, 1.0);',

    'gl_FragColor = newTex;',

    '}'

  ].join('\n')

};

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Triangle blur shader
 * based on glfx.js triangle blur shader
 * https://github.com/evanw/glfx.js
 *
 * A basic blur filter, which convolves the image with a
 * pyramid filter. The pyramid filter is separable and is applied as two
 * perpendicular triangle filters.
 */

THREE.TriangleBlurShader = {

  uniforms : {

    'texture': { type: 't', value: null },
    'delta':   { type: 'v2', value:new THREE.Vector2( 1, 1 ) }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    '#define ITERATIONS 10.0',

    'uniform sampler2D texture;',
    'uniform vec2 delta;',

    'varying vec2 vUv;',

    'float random( vec3 scale, float seed ) {',

    // use the fragment position for a different seed per-pixel

    'return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed );',

    '}',

    'void main() {',

    'vec4 color = vec4( 0.0 );',

    'float total = 0.0;',

    // randomize the lookup values to hide the fixed number of samples

    'float offset = random( vec3( 12.9898, 78.233, 151.7182 ), 0.0 );',

    'for ( float t = -ITERATIONS; t <= ITERATIONS; t ++ ) {',

    'float percent = ( t + offset - 0.5 ) / ITERATIONS;',
    'float weight = 1.0 - abs( percent );',

    'color += texture2D( texture, vUv + delta * percent ) * weight;',
    'total += weight;',

    '}',

    'gl_FragColor = color / total;',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Unpack RGBA depth shader
 * - show RGBA encoded depth as monochrome color
 */

THREE.UnpackDepthRGBAShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'opacity':  { type: 'f', value: 1.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform float opacity;',

    'uniform sampler2D tDiffuse;',

    'varying vec2 vUv;',

    // RGBA depth

    'float unpackDepth( const in vec4 rgba_depth ) {',

    'const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );',
    'float depth = dot( rgba_depth, bit_shift );',
    'return depth;',

    '}',

    'void main() {',

    'float depth = 1.0 - unpackDepth( texture2D( tDiffuse, vUv ) );',
    'gl_FragColor = opacity * vec4( vec3( depth ), 1.0 );',

    '}'

  ].join('\n')

};

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.VerticalBlurShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'v':        { type: 'f', value: 1.0 / 512.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'uniform float v;',

    'varying vec2 vUv;',

    'void main() {',

    'vec4 sum = vec4( 0.0 );',

    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;',

    'gl_FragColor = sum;',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Simple fake tilt-shift effect, modulating two pass Gaussian blur (see above) by vertical position
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 * - "r" parameter control where "focused" horizontal line lies
 */

THREE.VerticalTiltShiftShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'v':        { type: 'f', value: 1.0 / 512.0 },
    'r':        { type: 'f', value: 0.35 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'uniform float v;',
    'uniform float r;',

    'varying vec2 vUv;',

    'void main() {',

    'vec4 sum = vec4( 0.0 );',

    'float vv = v * abs( r - vUv.y );',

    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * vv ) ) * 0.051;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * vv ) ) * 0.0918;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * vv ) ) * 0.12245;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * vv ) ) * 0.1531;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * vv ) ) * 0.1531;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * vv ) ) * 0.12245;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * vv ) ) * 0.0918;',
    'sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * vv ) ) * 0.051;',

    'gl_FragColor = sum;',

    '}'

  ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

THREE.VignetteShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'offset':   { type: 'f', value: 1.0 },
    'darkness': { type: 'f', value: 1.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',
    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform float offset;',
    'uniform float darkness;',

    'uniform sampler2D tDiffuse;',

    'varying vec2 vUv;',

    'void main() {',

    // Eskil's vignette

    'vec4 texel = texture2D( tDiffuse, vUv );',
    'vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );',
    'gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );',

    /*
			// alternative version from glfx.js
			// this one makes more "dusty" look (as opposed to "burned")

			"vec4 color = texture2D( tDiffuse, vUv );",
			"float dist = distance( vUv, vec2( 0.5 ) );",
			"color.rgb *= smoothstep( 0.8, offset * 0.799, dist *( darkness + offset ) );",
			"gl_FragColor = color;",
			*/

    '}'

  ].join('\n')

};

//# sourceMappingURL=vendors.js.map



THREE.UnrealBloomPass = function( resolution, strength, radius, threshold ) {

  THREE.Pass.call( this );

  this.strength = ( strength !== undefined ) ? strength : 1;
  this.radius = radius;
  this.threshold = threshold;
  this.resolution = ( resolution !== undefined ) ? new THREE.Vector2( resolution.x, resolution.y ) : new THREE.Vector2( 256, 256 );

  // render targets
  var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
  this.renderTargetsHorizontal = [];
  this.renderTargetsVertical = [];
  this.nMips = 5;
  var resx = Math.round( this.resolution.x / 2 );
  var resy = Math.round( this.resolution.y / 2 );

  this.renderTargetBright = new THREE.WebGLRenderTarget( resx, resy, pars );
  this.renderTargetBright.texture.name = 'UnrealBloomPass.bright';
  this.renderTargetBright.texture.generateMipmaps = false;

  for ( var i = 0; i < this.nMips; i ++ ) {

    var renderTarget = new THREE.WebGLRenderTarget( resx, resy, pars );

    renderTarget.texture.name = 'UnrealBloomPass.h' + i;
    renderTarget.texture.generateMipmaps = false;

    this.renderTargetsHorizontal.push( renderTarget );

    var renderTarget = new THREE.WebGLRenderTarget( resx, resy, pars );

    renderTarget.texture.name = 'UnrealBloomPass.v' + i;
    renderTarget.texture.generateMipmaps = false;

    this.renderTargetsVertical.push( renderTarget );

    resx = Math.round( resx / 2 );

    resy = Math.round( resy / 2 );

  }

  // luminosity high pass material

  if ( THREE.LuminosityHighPassShader === undefined )
    console.error( 'THREE.UnrealBloomPass relies on THREE.LuminosityHighPassShader' );

  var highPassShader = THREE.LuminosityHighPassShader;
  this.highPassUniforms = THREE.UniformsUtils.clone( highPassShader.uniforms );

  this.highPassUniforms[ 'luminosityThreshold' ].value = threshold;
  this.highPassUniforms[ 'smoothWidth' ].value = 0.01;

  this.materialHighPassFilter = new THREE.ShaderMaterial( {
    uniforms: this.highPassUniforms,
    vertexShader: highPassShader.vertexShader,
    fragmentShader: highPassShader.fragmentShader,
    defines: {}
  } );

  // Gaussian Blur Materials
  this.separableBlurMaterials = [];
  var kernelSizeArray = [ 3, 5, 7, 9, 11 ];
  var resx = Math.round( this.resolution.x / 2 );
  var resy = Math.round( this.resolution.y / 2 );

  for ( var i = 0; i < this.nMips; i ++ ) {

    this.separableBlurMaterials.push( this.getSeperableBlurMaterial( kernelSizeArray[ i ] ) );

    this.separableBlurMaterials[ i ].uniforms[ 'texSize' ].value = new THREE.Vector2( resx, resy );

    resx = Math.round( resx / 2 );

    resy = Math.round( resy / 2 );

  }

  // Composite material
  this.compositeMaterial = this.getCompositeMaterial( this.nMips );
  this.compositeMaterial.uniforms[ 'blurTexture1' ].value = this.renderTargetsVertical[ 0 ].texture;
  this.compositeMaterial.uniforms[ 'blurTexture2' ].value = this.renderTargetsVertical[ 1 ].texture;
  this.compositeMaterial.uniforms[ 'blurTexture3' ].value = this.renderTargetsVertical[ 2 ].texture;
  this.compositeMaterial.uniforms[ 'blurTexture4' ].value = this.renderTargetsVertical[ 3 ].texture;
  this.compositeMaterial.uniforms[ 'blurTexture5' ].value = this.renderTargetsVertical[ 4 ].texture;
  this.compositeMaterial.uniforms[ 'bloomStrength' ].value = strength;
  this.compositeMaterial.uniforms[ 'bloomRadius' ].value = 0.1;
  this.compositeMaterial.needsUpdate = true;

  var bloomFactors = [ 1.0, 0.8, 0.6, 0.4, 0.2 ];
  this.compositeMaterial.uniforms[ 'bloomFactors' ].value = bloomFactors;
  this.bloomTintColors = [ new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ),
    new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ) ];
  this.compositeMaterial.uniforms[ 'bloomTintColors' ].value = this.bloomTintColors;

  // copy material
  if ( THREE.CopyShader === undefined ) {

    console.error( 'THREE.BloomPass relies on THREE.CopyShader' );

  }

  var copyShader = THREE.CopyShader;

  this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );
  this.copyUniforms[ 'opacity' ].value = 1.0;

  this.materialCopy = new THREE.ShaderMaterial( {
    uniforms: this.copyUniforms,
    vertexShader: copyShader.vertexShader,
    fragmentShader: copyShader.fragmentShader,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true
  } );

  this.enabled = true;
  this.needsSwap = false;

  this.oldClearColor = new THREE.Color();
  this.oldClearAlpha = 1;

  this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
  this.scene = new THREE.Scene();

  this.basic = new THREE.MeshBasicMaterial();

  this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
  this.quad.frustumCulled = false; // Avoid getting clipped
  this.scene.add( this.quad );

};



THREE.Pass = function() {

  // if set to true, the pass is processed by the composer
  this.enabled = true;

  // if set to true, the pass indicates to swap read and write buffer after rendering
  this.needsSwap = true;

  // if set to true, the pass clears its buffer before rendering
  this.clear = false;

  // if set to true, the result of the pass is rendered to screen
  this.renderToScreen = false;

};

Object.assign( THREE.Pass.prototype, {

  setSize: function( width, height ) {},

  render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

    console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

  }

} );
THREE.UnrealBloomPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

  constructor: THREE.UnrealBloomPass,

  dispose: function() {

    for ( var i = 0; i < this.renderTargetsHorizontal.length; i ++ ) {

      this.renderTargetsHorizontal[ i ].dispose();

    }

    for ( var i = 0; i < this.renderTargetsVertical.length; i ++ ) {

      this.renderTargetsVertical[ i ].dispose();

    }

    this.renderTargetBright.dispose();

  },

  setSize: function( width, height ) {

    var resx = Math.round( width / 2 );
    var resy = Math.round( height / 2 );

    this.renderTargetBright.setSize( resx, resy );

    for ( var i = 0; i < this.nMips; i ++ ) {

      this.renderTargetsHorizontal[ i ].setSize( resx, resy );
      this.renderTargetsVertical[ i ].setSize( resx, resy );

      this.separableBlurMaterials[ i ].uniforms[ 'texSize' ].value = new THREE.Vector2( resx, resy );

      resx = Math.round( resx / 2 );
      resy = Math.round( resy / 2 );

    }

  },

  render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

    this.oldClearColor.copy( renderer.getClearColor() );
    this.oldClearAlpha = renderer.getClearAlpha();
    var oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    renderer.setClearColor( new THREE.Color( 0, 0, 0 ), 0 );

    if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

    // Render input to screen

    if ( this.renderToScreen ) {

      this.quad.material = this.basic;
      this.basic.map = readBuffer.texture;

      renderer.render( this.scene, this.camera, undefined, true );

    }

    // 1. Extract Bright Areas

    this.highPassUniforms[ 'tDiffuse' ].value = readBuffer.texture;
    this.highPassUniforms[ 'luminosityThreshold' ].value = this.threshold;
    this.quad.material = this.materialHighPassFilter;

    renderer.render( this.scene, this.camera, this.renderTargetBright, true );

    // 2. Blur All the mips progressively

    var inputRenderTarget = this.renderTargetBright;

    for ( var i = 0; i < this.nMips; i ++ ) {

      this.quad.material = this.separableBlurMaterials[ i ];

      this.separableBlurMaterials[ i ].uniforms[ 'colorTexture' ].value = inputRenderTarget.texture;
      this.separableBlurMaterials[ i ].uniforms[ 'direction' ].value = THREE.UnrealBloomPass.BlurDirectionX;
      renderer.render( this.scene, this.camera, this.renderTargetsHorizontal[ i ], true );

      this.separableBlurMaterials[ i ].uniforms[ 'colorTexture' ].value = this.renderTargetsHorizontal[ i ].texture;
      this.separableBlurMaterials[ i ].uniforms[ 'direction' ].value = THREE.UnrealBloomPass.BlurDirectionY;
      renderer.render( this.scene, this.camera, this.renderTargetsVertical[ i ], true );

      inputRenderTarget = this.renderTargetsVertical[ i ];

    }

    // Composite All the mips

    this.quad.material = this.compositeMaterial;
    this.compositeMaterial.uniforms[ 'bloomStrength' ].value = this.strength;
    this.compositeMaterial.uniforms[ 'bloomRadius' ].value = this.radius;
    this.compositeMaterial.uniforms[ 'bloomTintColors' ].value = this.bloomTintColors;

    renderer.render( this.scene, this.camera, this.renderTargetsHorizontal[ 0 ], true );

    // Blend it additively over the input texture

    this.quad.material = this.materialCopy;
    this.copyUniforms[ 'tDiffuse' ].value = this.renderTargetsHorizontal[ 0 ].texture;

    if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );


    if ( this.renderToScreen ) {

      renderer.render( this.scene, this.camera, undefined, false );

    } else {

      renderer.render( this.scene, this.camera, readBuffer, false );

    }

    // Restore renderer settings

    renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );
    renderer.autoClear = oldAutoClear;

  },

  getSeperableBlurMaterial: function( kernelRadius ) {

    return new THREE.ShaderMaterial( {

      defines: {
        'KERNEL_RADIUS': kernelRadius,
        'SIGMA': kernelRadius
      },

      uniforms: {
        'colorTexture': { value: null },
        'texSize': { value: new THREE.Vector2( 0.5, 0.5 ) },
        'direction': { value: new THREE.Vector2( 0.5, 0.5 ) }
      },

      vertexShader:
        `varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,

      fragmentShader:
        `#include <common>
        varying vec2 vUv;
        uniform sampler2D colorTexture;
        uniform vec2 texSize;
        uniform vec2 direction;
        
        float gaussianPdf(in float x, in float sigma) {
          return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
        }
        void main() {
          vec2 invSize = 1.0 / texSize;
          float fSigma = float(SIGMA);
          float weightSum = gaussianPdf(0.0, fSigma);
          vec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;
          for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
            float x = float(i);
            float w = gaussianPdf(x, fSigma);
            vec2 uvOffset = direction * invSize * x;
            vec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;
            vec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;
            diffuseSum += (sample1 + sample2) * w;
            weightSum += 2.0 * w;
          }\
          gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
        }`
    } );

  },

  getCompositeMaterial: function( nMips ) {

    return new THREE.ShaderMaterial( {

      defines: {
        'NUM_MIPS': nMips
      },

      uniforms: {
        'blurTexture1': { value: null },
        'blurTexture2': { value: null },
        'blurTexture3': { value: null },
        'blurTexture4': { value: null },
        'blurTexture5': { value: null },
        'dirtTexture': { value: null },
        'bloomStrength': { value: 1.0 },
        'bloomFactors': { value: null },
        'bloomTintColors': { value: null },
        'bloomRadius': { value: 0.0 }
      },

      vertexShader:
        `varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,

      fragmentShader:
        `varying vec2 vUv;
        uniform sampler2D blurTexture1;
        uniform sampler2D blurTexture2;
        uniform sampler2D blurTexture3;
        uniform sampler2D blurTexture4;
        uniform sampler2D blurTexture5;
        uniform sampler2D dirtTexture;
        uniform float bloomStrength;
        uniform float bloomRadius;
        uniform float bloomFactors[NUM_MIPS];
        uniform vec3 bloomTintColors[NUM_MIPS];
        
        float lerpBloomFactor(const in float factor) { 
          float mirrorFactor = 1.2 - factor;
          return mix(factor, mirrorFactor, bloomRadius);
        }
        
        void main() {
          gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) + 
                           lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) + 
                           lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) + 
                           lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) + 
                           lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
        }`
    } );

  }

} );

THREE.UnrealBloomPass.BlurDirectionX = new THREE.Vector2( 1.0, 0.0 );
THREE.UnrealBloomPass.BlurDirectionY = new THREE.Vector2( 0.0, 1.0 );


THREE.LuminosityHighPassShader = {

  shaderID: 'luminosityHighPass',

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'luminosityThreshold': { type: 'f', value: 1.0 },
    'smoothWidth': { type: 'f', value: 1.0 },
    'defaultColor': { type: 'c', value: new THREE.Color( 0x000000 ) },
    'defaultOpacity':  { type: 'f', value: 0.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',

    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'uniform vec3 defaultColor;',
    'uniform float defaultOpacity;',
    'uniform float luminosityThreshold;',
    'uniform float smoothWidth;',

    'varying vec2 vUv;',

    'void main() {',

    'vec4 texel = texture2D( tDiffuse, vUv );',

    'vec3 luma = vec3( 0.299, 0.587, 0.114 );',

    'float v = dot( texel.xyz, luma );',

    'vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );',

    'float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );',

    'gl_FragColor = mix( outputColor, texel, alpha );',

    '}'

  ].join('\n')

};

