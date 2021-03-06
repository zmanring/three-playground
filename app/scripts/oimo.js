var renderer = new THREE.WebGLRenderer({
	antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true;

document.body.appendChild(renderer.domElement);

var onRenderFcts = [];
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000)
camera.position.z = 100;

//////////////////////////////////////////////////////////////////////////////////
//		oimo world							//
//////////////////////////////////////////////////////////////////////////////////

var world = new OIMO.World()
onRenderFcts.push(function(delta) {
  world.step()
})

// Lighting
// LIGHT
var spotLight = new THREE.SpotLight(0xffffff, 3);
spotLight.position.set(0, 800, 500);

spotLight.castShadow = true;

spotLight.shadowMapWidth = 1024;
spotLight.shadowMapHeight = 1024;

spotLight.shadowCameraNear = 500;
spotLight.shadowCameraFar = 4000;
spotLight.shadowCameraFov = 30;

scene.add(spotLight);

// HemisphereLight
// var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x0000ff, 1);
// hemisphereLight.position.set(1, 0, 1).normalize();
// scene.add(hemisphereLight);

//////////////////////////////////////////////////////////////////////////////////
//		Ground								//
//////////////////////////////////////////////////////////////////////////////////

var geometry = new THREE.CubeGeometry(200, 1, 200);
var material = new THREE.MeshLambertMaterial({
	color: '#666',
	side: THREE.DoubleSide
});

var mesh = new THREE.Mesh(geometry, material);

mesh.position.y = -geometry.height / 2

mesh.castShadow = false;
mesh.receiveShadow = true;

scene.add(mesh)

var ground = THREEx.Oimo.createBodyFromMesh(world, mesh, false)

//////////////////////////////////////////////////////////////////////////////////
//		add an object and make it move					//
//////////////////////////////////////////////////////////////////////////////////
for (var i = 0; i < 50; i++) {
  (function() {
    if (Math.random() < 0.5) {
      var width = 3 + (Math.random() - 0.5) * 1
      var height = 3 + (Math.random() - 0.5) * 1
      var depth = 3 + (Math.random() - 0.5) * 1
      var geometry = new THREE.CubeGeometry(width, height, depth)
    } else {
      var radius = 3 + (Math.random() - 0.5) * 0
      var geometry = new THREE.SphereGeometry(radius)
    }

    var material = new THREE.MeshNormalMaterial()
    var mesh = new THREE.Mesh(geometry, material)

		mesh.castShadow = true;
		mesh.receiveShadow = false;

    scene.add(mesh)

    mesh.position.x = (Math.random() - 0.5) * 20
    mesh.position.y = 25 + (Math.random() - 0.5) * 15
    mesh.position.z = (Math.random() - 0.5) * 20
    //////////////////////////////////////////////////////////////////////////////////
    //		comment								//
    //////////////////////////////////////////////////////////////////////////////////

    // create IOMO.Body from mesh
    var body = THREEx.Oimo.createBodyFromMesh(world, mesh);
    window.body = body
    // add an updater for them
    var updater = new THREEx.Oimo.Body2MeshUpdater(body, mesh)
    onRenderFcts.push(function(delta) {
      updater.update()
    })

    // if the position.y < 20, reset the position
    onRenderFcts.push(function(delta) {
      if (mesh.position.y < -20) {
        mesh.position.x = (Math.random() - 0.5) * 20
        mesh.position.y = 25 + (Math.random() - 0.5) * 15
        mesh.position.z = (Math.random() - 0.5) * 20
        body.setPosition(mesh.position.x, mesh.position.y, mesh.position.z);
      }
    })
  })()
}
//////////////////////////////////////////////////////////////////////////////////
//		comment								//
//////////////////////////////////////////////////////////////////////////////////


// var iomoStats = new THREEx.Oimo.Stats(world)
// document.body.appendChild(iomoStats.domElement)
// onRenderFcts.push(function(delta) {
//   iomoStats.update()
// })

//////////////////////////////////////////////////////////////////////////////////
//		Camera Controls							//
//////////////////////////////////////////////////////////////////////////////////
var mouse = {
  x: 0,
  y: 0
}
document.addEventListener('mousemove', function(event) {
  mouse.x = (event.clientX / window.innerWidth) - 0.5
  mouse.y = (event.clientY / window.innerHeight) - 0.5
}, false)
onRenderFcts.push(function(delta, now) {
  camera.position.x += (mouse.x * 50 - camera.position.x) * (delta * 3)
  camera.position.y += (mouse.y * 50 - (camera.position.y - 5)) * (delta * 3)
  camera.lookAt(scene.position)
})


//////////////////////////////////////////////////////////////////////////////////
//		render the scene						//
//////////////////////////////////////////////////////////////////////////////////
onRenderFcts.push(function() {
  renderer.render(scene, camera);
})

//////////////////////////////////////////////////////////////////////////////////
//		loop runner							//
//////////////////////////////////////////////////////////////////////////////////
var lastTimeMsec = null

requestAnimationFrame(function animate(nowMsec) {
  // keep looping
  requestAnimationFrame(animate);
  // measure time
  lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
  var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
  lastTimeMsec = nowMsec
  // call each update function
  onRenderFcts.forEach(function(onRenderFct) {
    onRenderFct(deltaMsec / 1000, nowMsec / 1000)
  });
});
