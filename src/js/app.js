import * as THREE from 'three';
import {TimelineMax} from 'gsap';
var OrbitControls = require('three-orbit-controls')(THREE);
import fragment from './fragment.glsl';
import vertex from './vertex.glsl';

import './lib/postprocessing';



let texts = [],tubeGeometry,camera, pos, controls, scene, renderer, geometry, geometry1, material,plane,tex1,tex2;
let destination = {x:0,y:0};
let textures = [];

function init() {
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerWidth);

  var container = document.getElementById('container');
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.001, 100
  );
  camera.position.set( 0, 0, 10 );


  // controls = new OrbitControls(camera, renderer.domElement);


  // material = new THREE.ShaderMaterial( {
  //   side: THREE.DoubleSide,
  //   uniforms: {
  //     time: { type: 'f', value: 0 },
  //     pixels: {type: 'v2', value: new THREE.Vector2(window.innerWidth,window.innerHeight)},
  //     accel: {type: 'v2', value: new THREE.Vector2(0.5,2)},
  //     progress: {type: 'f', value: 0},
  //     uvRate1: {
  //       value: new THREE.Vector2(1,1)
  //     },
  //   },
  //   // wireframe: true,
  //   vertexShader: vertex,
  //   fragmentShader: fragment
  // });

  // plane = new THREE.Mesh(new THREE.PlaneGeometry( 1,1, 1, 1 ),material);
  // scene.add(plane);

  function CustomSinCurve( scale ) {

    THREE.Curve.call( this );

    this.scale = ( scale === undefined ) ? 1 : scale;

  }

  CustomSinCurve.prototype = Object.create( THREE.Curve.prototype );
  CustomSinCurve.prototype.constructor = CustomSinCurve;

  CustomSinCurve.prototype.getPoint = function( t ) {

    var tx = Math.cos( 2 * Math.PI * t );
    var ty = Math.sin( 2 * Math.PI * t );
    var tz = 0.1*Math.sin( 8 * Math.PI * t );






    return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );

  };

  var path = new CustomSinCurve( 10 );
  tubeGeometry = new THREE.TubeGeometry( path, 200, 1, 8, false );
  var material = new THREE.MeshBasicMaterial( { 
    side: THREE.DoubleSide,
    map: THREE.ImageUtils.loadTexture('img/map.png')
  } );
  material.map.wrapS = THREE.RepeatWrapping;
  material.map.wrapT = THREE.RepeatWrapping;
  material.map.repeat.set(10,1);
  var mesh = new THREE.Mesh( tubeGeometry, material );
  scene.add( mesh );




  // texts

  let loader = new THREE.FontLoader();
  let font = loader.load(
    // resource URL
    '/js/font.json',

    // onLoad callback
    function( font ) {
      

      let song = [
        'Hello',
        'Is it me',
        'you looking for?',
        '?',
      ];
      



      let textmaterial = new THREE.MeshBasicMaterial( {color: 0xffffff});

      // let textmesh = new THREE.Mesh(textgeometry,textmaterial);

      song.forEach((v,i) => {
        let textgeometry = new THREE.TextGeometry( v, {
          font: font,
          size: 0.08,
          height: 0.01
        } );
        console.log(v);
        textgeometry.center();
        let textmesh = new THREE.Mesh(textgeometry,textmaterial);
        texts.push(textmesh);
        scene.add(textmesh);
        textmesh.position.copy(
          tubeGeometry.parameters.path.getPointAt( 0.2+i*0.15 )
        );
      });
        
   

      // scene.add(textmesh);


    }
  );



  

  resize();

 
}

window.addEventListener('resize', resize); 
function resize() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  renderer.setSize( w, h );
  camera.aspect = w / h;




  camera.updateProjectionMatrix();
}

let time = 0;
let normal = new THREE.Vector3();
let binormal = new THREE.Vector3();



let speed = 0;
let position = 0;
document.addEventListener('wheel',function(event) {
  speed += event.deltaY*0.0002;
});



function animate() {


  // var time = Date.now();
  time = time + 7;
  // time = position*400;
  var looptime = 20 * 1000;
  var t = ( time % looptime ) / looptime;
  var pos = tubeGeometry.parameters.path.getPointAt( t );
  // pos.multiplyScalar( params.scale );
  // interpolation
  var segments = tubeGeometry.tangents.length;
  var pickt = t * segments;
  var pick = Math.floor( pickt );
  var pickNext = ( pick + 1 ) % segments;
  binormal.subVectors( tubeGeometry.binormals[ pickNext ], tubeGeometry.binormals[ pick ] );
  binormal.multiplyScalar( pickt - pick ).add( tubeGeometry.binormals[ pick ] );
  var dir = tubeGeometry.parameters.path.getTangentAt( t );
  var offset = 0;
  normal.copy( binormal ).cross( dir );
  // we move on a offset on its binormal
  pos.add( normal.clone().multiplyScalar( offset ) );
  camera.position.copy( pos );
  // using arclength for stablization in look ahead
  var lookAt = tubeGeometry.parameters.path.getPointAt( ( t + 1 / tubeGeometry.parameters.path.getLength() ) % 1 );
  // camera orientation 2 - up orientation via normal
  camera.matrix.lookAt( camera.position, lookAt, normal );
  camera.rotation.setFromRotationMatrix( camera.matrix, camera.rotation.order );



  texts.forEach(t => {
    t.quaternion.copy(camera.quaternion);
  });



  // mouse pos
  position += speed;
  speed *=0.9;



  
  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.render(scene, camera);
}





init();
animate();





