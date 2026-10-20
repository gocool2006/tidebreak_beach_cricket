import { useEffect, useRef, useState } from 'react';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import { StyleSheet, Text, View } from 'react-native';
import * as THREE from 'three';

export type CricketShot = 'defend' | 'drive' | 'pull' | 'loft';

export type MatchAction = {
  shot: CricketShot;
  runs: number;
  wicket: boolean;
  startedAt: number;
};

export type FieldSet = 'ATTACKING 1' | 'ATTACKING 2' | 'DEFENSIVE';

type Props = {
  deliveryProgress: number;
  deliveryActive: boolean;
  deliveryLine: string;
  deliveryTargetX?: number;
  deliveryTargetZ?: number;
  bowlingRunUpProgress?: number;
  batterMovementX?: number;
  batterMovementY?: number;
  swing?: 'NONE' | 'IN' | 'AWAY';
  showPitchTarget?: boolean;
  pitchTargetX?: number;
  pitchTargetZ?: number;
  battingTeam: string;
  bowlingTeam: string;
  fieldSet?: FieldSet;
  action: MatchAction | null;
  fullScreen?: boolean;
};

type PlayerRole = 'batter' | 'bowler' | 'fielder' | 'keeper';

type PlayerRig = {
  root: THREE.Group;
  torso: THREE.Group;
  rightArm: THREE.Group;
  leftArm: THREE.Group;
  rightForearm: THREE.Group;
  leftForearm: THREE.Group;
  rightLeg: THREE.Group;
  leftLeg: THREE.Group;
  rightKnee: THREE.Group;
  leftKnee: THREE.Group;
  bat: THREE.Group | null;
  role: PlayerRole;
  base: THREE.Vector3;
  facing: number;
  scale: number;
  fieldIndex: number | null;
};

const FIELD_SPOTS: Record<FieldSet, [number, number, number][]> = {
  'ATTACKING 1': [[-3.35, 0, -2.65], [3.35, 0, -3.15], [-2.75, 0, 0.12], [2.85, 0, -0.3], [-1.95, 0, -4.1], [2.05, 0, -4.35]],
  'ATTACKING 2': [[-2.4, 0, -1.9], [2.4, 0, -2.5], [-3.2, 0, 0.65], [3.2, 0, 0.6], [-1.45, 0, -4.4], [1.45, 0, -4.4]],
  DEFENSIVE: [[-4.35, 0, -4.2], [4.35, 0, -4.2], [-4.5, 0, 0.45], [4.5, 0, 0.45], [-3.8, 0, 3.15], [3.8, 0, 3.15]],
};

type SceneRig = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  cameraFocus: THREE.Vector3;
  renderer: THREE.WebGLRenderer;
  gl: ExpoWebGLRenderingContext;
  players: PlayerRig[];
  wickets: THREE.Group;
  ball: THREE.Group;
  targetMarker: THREE.Group;
  dispose: () => void;
};

const TEAM_COLORS: Record<string, string> = {
  India: '#1768C4',
  Australia: '#D6AE25',
  'Sri Lanka': '#1374A6',
  'New Zealand': '#172B39',
  England: '#C62E43',
};

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;

export default function BeachMatch3D(props: Props) {
  const latestProps = useRef(props);
  const stopRender = useRef<(() => void) | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    latestProps.current = props;
  });

  useEffect(() => () => {
    stopRender.current?.();
    stopRender.current = null;
  }, []);

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    stopRender.current?.();
    setRenderError(null);
    try {
      const rig = createScene(gl, latestProps.current);
      let frameId = 0;
      let stopped = false;
      const startTime = Date.now();

      const drawFrame = () => {
        if (stopped) return;
        try {
          animateScene(rig, latestProps.current, (Date.now() - startTime) / 1000);
          rig.renderer.render(rig.scene, rig.camera);
          gl.endFrameEXP();
          frameId = requestAnimationFrame(drawFrame);
        } catch (error) {
          stopped = true;
          cancelAnimationFrame(frameId);
          console.error('3D frame rendering failed:', error);
          setRenderError(error instanceof Error ? error.message : String(error));
        }
      };

      drawFrame();
      stopRender.current = () => {
        stopped = true;
        cancelAnimationFrame(frameId);
        rig.dispose();
      };
    } catch (error) {
      console.error('3D scene initialization failed:', error);
      setRenderError(error instanceof Error ? error.message : String(error));
    }
  };

  const hudText = props.deliveryActive
    ? 'BOWLER IN · WATCH THE BALL'
    : props.action
      ? props.action.wicket
        ? 'STUMPS HIT'
        : props.action.runs === 6
          ? 'LOFTED OVER THE ROPE'
          : props.action.runs === 4
            ? 'RACING TO THE BOUNDARY'
            : 'SHOT FOLLOW-THROUGH'
      : 'TAP NEXT DELIVERY TO PLAY';

  return (
    <View style={[styles.viewport, props.fullScreen && styles.fullScreenViewport]}>
      <GLView style={StyleSheet.absoluteFill} msaaSamples={2} onContextCreate={onContextCreate} />
      {!props.fullScreen && <View pointerEvents="none" style={styles.hud}>
        <View style={styles.hudPill}><View style={styles.liveDot} /><Text style={styles.hudText}>LIVE 3D ACTION</Text></View>
        <View style={styles.cameraPill}><Text style={styles.cameraText}>BEHIND THE BATTER</Text></View>
        <View style={styles.hintPill}><Text style={styles.hintText}>{hudText}</Text></View>
      </View>}
      {renderError && <View pointerEvents="none" style={styles.errorCard}><Text style={styles.errorTitle}>3D SCENE ERROR</Text><Text style={styles.errorText}>{renderError}</Text></View>}
    </View>
  );
}

function createScene(gl: ExpoWebGLRenderingContext, props: Props): SceneRig {
  const width = Math.max(gl.drawingBufferWidth, 1);
  const height = Math.max(gl.drawingBufferHeight, 1);
  const canvas = {
    width,
    height,
    clientWidth: width,
    clientHeight: height,
    style: {},
    getContext: () => gl,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  } as unknown as HTMLCanvasElement;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    context: gl as unknown as WebGLRenderingContext,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#94A9AD');
  scene.fog = new THREE.Fog('#94A9AD', 24, 46);

  const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 110);
  camera.position.set(0, 4.9, -11.6);
  const cameraFocus = new THREE.Vector3(0, 1.05, -2.3);
  camera.lookAt(cameraFocus);

  const ambient = new THREE.HemisphereLight('#DDF8FF', '#7A704B', 1.45);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight('#FFF0D0', 2.1);
  sun.position.set(-4, 10, 5);
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#C9F4FF', 0.6);
  fill.position.set(6, 6, -8);
  scene.add(fill);

  const materials = createMaterials();
  const geometry = {
    sphere: new THREE.SphereGeometry(1, 20, 14),
    capsule: new THREE.CapsuleGeometry(1, 1, 5, 12),
    cylinder: new THREE.CylinderGeometry(1, 1, 1, 12),
    box: new THREE.BoxGeometry(1, 1, 1),
  };

  buildArena(scene, geometry, materials);
  const nearWickets = buildWickets(scene, geometry, materials, [0, 0, 1.18]);
  buildWickets(scene, geometry, materials, [0, 0, -5.12]);

  const players = [
    buildPlayer(scene, geometry, materials, 'batter', [0, 0, 0.48], Math.PI, TEAM_COLORS[props.battingTeam] ?? '#1768C4', 1),
    buildPlayer(scene, geometry, materials, 'bowler', [0, 0, -5.95], 0, TEAM_COLORS[props.bowlingTeam] ?? '#D6AE25', 1),
  ];
  const fielderSpots = FIELD_SPOTS[props.fieldSet ?? 'ATTACKING 1'];
  players.push(buildPlayer(scene, geometry, materials, 'keeper', [0, 0, 2.05], Math.PI, TEAM_COLORS[props.bowlingTeam] ?? '#D6AE25', 0.74));
  for (const [index, position] of fielderSpots.entries()) {
    const fielder = buildPlayer(scene, geometry, materials, 'fielder', position, index % 2 === 0 ? 0.2 : -0.2, TEAM_COLORS[props.bowlingTeam] ?? '#D6AE25', 0.53);
    fielder.fieldIndex = index;
    players.push(fielder);
  }

  const ball = new THREE.Group();
  const ballBody = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 12), materials.ball);
  ballBody.castShadow = true;
  ball.add(ballBody);
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.007, 4, 18), materials.seam);
  seam.rotation.set(Math.PI / 2, 0.15, 0);
  ball.add(seam);
  ball.visible = false;
  scene.add(ball);

  const targetMarker = new THREE.Group();
  const markerRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 5, 28), materials.aim);
  markerRing.rotation.x = Math.PI / 2;
  targetMarker.add(markerRing);
  addMesh(targetMarker, geometry.sphere, materials.aim, [0, 0.015, 0], [0.065, 0.025, 0.065]);
  targetMarker.visible = false;
  scene.add(targetMarker);

  const dispose = () => {
    renderer.dispose();
    const geometries = new Set<THREE.BufferGeometry>();
    const sceneMaterials = new Set<THREE.Material>();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
        meshMaterials.forEach((material) => sceneMaterials.add(material));
      }
    });
    const sceneTextures = new Set<THREE.Texture>();
    geometries.forEach((item) => item.dispose());
    sceneMaterials.forEach((item) => {
      if (item instanceof THREE.MeshStandardMaterial && item.map) sceneTextures.add(item.map);
      item.dispose();
    });
    sceneTextures.forEach((texture) => texture.dispose());
  };

  return { scene, camera, cameraFocus, renderer, gl, players, wickets: nearWickets, ball, targetMarker, dispose };
}

function createMaterials() {
  const standard = (color: string, roughness = 0.82, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const grassTexture = createSurfaceTexture('grass');
  const pitchTexture = createSurfaceTexture('pitch');
  grassTexture.repeat.set(7, 7);
  pitchTexture.repeat.set(1, 3);
  const textured = (color: string, map: THREE.Texture, roughness: number) => new THREE.MeshStandardMaterial({ color, map, roughness });
  return {
    grass: textured('#FFFFFF', grassTexture, 0.98),
    field: textured('#FFFFFF', grassTexture, 0.98),
    rope: standard('#F2E5BD', 0.76),
    pitch: textured('#FFFFFF', pitchTexture, 0.96),
    crease: new THREE.MeshBasicMaterial({ color: '#FFF6DA' }),
    stand: standard('#374954', 0.9),
    standWood: standard('#53656A', 0.86),
    standLight: standard('#77898A', 0.86),
    stadiumSteel: standard('#26353E', 0.72, 0.36),
    stadiumRoof: standard('#52636B', 0.7, 0.22),
    adBoard: standard('#172A33', 0.6),
    adAccent: standard('#20BDB2', 0.5),
    crowdA: standard('#E26F5A', 0.9),
    crowdB: standard('#214B50', 0.9),
    crowdC: standard('#E9D9B9', 0.9),
    crowdD: standard('#75924D', 0.9),
    aim: new THREE.MeshBasicMaterial({ color: '#FF8066' }),
    wicket: standard('#F5E8C8', 0.55),
    skin: standard('#C48B67', 0.78),
    fielderSkin: standard('#B77D5B', 0.78),
    batterPants: standard('#E6E1D4', 0.8),
    batterPads: standard('#C7BFAE', 0.7),
    shoes: standard('#F4EFE4', 0.86),
    helmet: standard('#1C3550', 0.46),
    bowlerHelmet: standard('#243A37', 0.46),
    helmetGrill: standard('#D5D3C5', 0.48, 0.24),
    shirtBadge: standard('#EDE8D4', 0.75),
    faceDetail: standard('#332922', 0.78),
    jerseyAccent: standard('#F17E36', 0.7),
    groundShadow: new THREE.MeshBasicMaterial({ color: '#10231B', transparent: true, opacity: 0.2, depthWrite: false }),
    bat: standard('#D2A05D', 0.58),
    batFace: standard('#E6BD7A', 0.62),
    batHandle: standard('#54463A', 0.74),
    ball: standard('#FFF8E9', 0.5),
    seam: standard('#C83A36', 0.65),
  };
}

function createSurfaceTexture(surface: 'grass' | 'pitch') {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  let seed = surface === 'grass' ? 8291 : 19477;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const grain = (random() - 0.5) * (surface === 'grass' ? 24 : 34);
      const stripe = surface === 'grass' ? Math.sin((y / size) * Math.PI * 12) * 5 : 0;
      if (surface === 'grass') {
        data[i] = clamp(78 + grain + stripe, 0, 255);
        data[i + 1] = clamp(128 + grain + stripe, 0, 255);
        data[i + 2] = clamp(63 + grain * 0.62 + stripe * 0.5, 0, 255);
      } else {
        const wear = Math.sin((x / size) * Math.PI * 24) * 3 + Math.sin((y / size) * Math.PI * 8) * 2;
        data[i] = clamp(190 + grain + wear, 0, 255);
        data[i + 1] = clamp(163 + grain * 0.82 + wear, 0, 255);
        data[i + 2] = clamp(112 + grain * 0.56 + wear * 0.7, 0, 255);
      }
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function addMesh(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number],
  scale: [number, number, number],
  rotation?: [number, number, number],
) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  object.scale.set(...scale);
  if (rotation) object.rotation.set(...rotation);
  parent.add(object);
  return object;
}

function addPlane(
  scene: THREE.Scene,
  width: number,
  height: number,
  position: [number, number, number],
  material: THREE.Material,
) {
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(...position);
  scene.add(plane);
  return plane;
}

function buildArena(
  scene: THREE.Scene,
  geometry: { sphere: THREE.SphereGeometry; capsule: THREE.CapsuleGeometry; cylinder: THREE.CylinderGeometry; box: THREE.BoxGeometry },
  materials: ReturnType<typeof createMaterials>,
) {
  addPlane(scene, 58, 58, [0, -0.08, -4], materials.grass);

  const field = new THREE.Mesh(new THREE.CircleGeometry(16.5, 64), materials.field);
  field.rotation.x = -Math.PI / 2;
  field.position.set(0, -0.018, -1.95);
  scene.add(field);

  const rope = new THREE.Mesh(new THREE.TorusGeometry(13.2, 0.055, 5, 96), materials.rope);
  rope.rotation.x = -Math.PI / 2;
  rope.position.set(0, -0.005, -1.95);
  rope.scale.set(1.22, 0.86, 1);
  scene.add(rope);

  addMesh(scene, geometry.box, materials.adBoard, [0, 4.2, -14.6], [4.1, 2, 0.15]);
  addMesh(scene, geometry.box, materials.adAccent, [0, 3.12, -14.48], [3.9, 0.08, 0.08]);

  addMesh(scene, geometry.box, materials.pitch, [0, 0.025, -1.97], [3.2, 0.045, 6.45]);
  addMesh(scene, geometry.box, materials.crease, [0, 0.052, -1.97], [0.032, 0.012, 6.35]);
  addMesh(scene, geometry.box, materials.crease, [0, 0.058, 1.1], [3.35, 0.014, 0.09]);
  addMesh(scene, geometry.box, materials.crease, [0, 0.058, -5.06], [3.35, 0.014, 0.09]);

  buildStand(scene, geometry, materials, [-9.1, 0, -3.4]);
  buildStand(scene, geometry, materials, [9.1, 0, -3.4]);
  buildStand(scene, geometry, materials, [0, 0, -15.2], Math.PI / 2);
  buildStand(scene, geometry, materials, [0, 0, 12.4], Math.PI / 2);

  for (const side of [-1, 1]) {
    addMesh(scene, geometry.box, materials.stadiumSteel, [side * 9.2, 6.1, -3.4], [0.22, 0.22, 17.8]);
    addMesh(scene, geometry.box, materials.stadiumRoof, [side * 10.1, 7.25, -3.4], [2.1, 0.22, 18.2]);
    addMesh(scene, geometry.box, materials.stadiumSteel, [side * 8.25, 5.05, -3.4], [0.16, 2.3, 0.18]);
    addMesh(scene, geometry.box, materials.stadiumSteel, [side * 10.8, 5.05, -3.4], [0.16, 2.3, 0.18]);
    addMesh(scene, geometry.box, materials.adBoard, [side * 7.45, 0.5, -3.4], [0.12, 0.72, 13.4]);
    addMesh(scene, geometry.box, materials.adAccent, [side * 7.37, 0.76, -3.4], [0.035, 0.08, 13.2]);
  }

  addMesh(scene, geometry.box, materials.stadiumSteel, [0, 6.1, -11.7], [17.8, 0.22, 0.22]);
  addMesh(scene, geometry.box, materials.stadiumRoof, [0, 7.25, -12.6], [18.2, 0.22, 2.1]);
  for (const side of [-1, 1]) {
    addMesh(scene, geometry.box, materials.stadiumSteel, [side * 4.8, 5.05, -10.65], [0.18, 2.3, 0.16]);
    addMesh(scene, geometry.box, materials.stadiumSteel, [side * 4.8, 5.05, -13.25], [0.18, 2.3, 0.16]);
  }
  addMesh(scene, geometry.box, materials.adBoard, [0, 0.5, -7.1], [13.4, 0.72, 0.12]);
  addMesh(scene, geometry.box, materials.adAccent, [0, 0.76, -7.02], [13.2, 0.08, 0.035]);

  for (const position of [[-10.6, 0, -10.7], [10.6, 0, -10.7], [-10.6, 0, 3.8], [10.6, 0, 3.8]] as [number, number, number][]) {
    buildFloodlight(scene, geometry, materials, position);
  }
}

function buildStand(
  scene: THREE.Scene,
  geometry: { sphere: THREE.SphereGeometry; box: THREE.BoxGeometry },
  materials: ReturnType<typeof createMaterials>,
  position: [number, number, number],
  rotationY = 0,
) {
  const stand = new THREE.Group();
  stand.position.set(...position);
  stand.rotation.y = rotationY;
  scene.add(stand);
  addMesh(stand, geometry.box, materials.stand, [0, 2.05, 0], [0.9, 4.1, 9.4]);
  for (let row = 0; row < 10; row += 1) {
    const y = 0.32 + row * 0.36;
    addMesh(stand, geometry.box, row % 2 ? materials.standLight : materials.standWood, [-0.52, y, 0], [1.05, 0.12, 9.7]);
    addMesh(stand, geometry.box, materials.stadiumSteel, [-0.15, y + 0.2, 0], [0.12, 0.32, 9.7]);
  }
  const crowd = new THREE.InstancedMesh(geometry.sphere, materials.crowdA, 190);
  crowd.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  const dummy = new THREE.Object3D();
  const colors = [materials.crowdA.color, materials.crowdB.color, materials.crowdC.color, materials.crowdD.color];
  let instance = 0;
  for (let row = 0; row < 10; row += 1) {
    for (let seat = 0; seat < 19; seat += 1) {
      dummy.position.set(-0.47, 0.42 + row * 0.34, -4.5 + seat * 0.5);
      const size = 0.055 + ((row + seat) % 3) * 0.008;
      dummy.scale.set(size, size * 1.25, size);
      dummy.updateMatrix();
      crowd.setMatrixAt(instance, dummy.matrix);
      crowd.setColorAt(instance, colors[(row * 3 + seat * 7) % colors.length]);
      instance += 1;
    }
  }
  crowd.count = instance;
  stand.add(crowd);
}

function buildFloodlight(
  scene: THREE.Scene,
  geometry: { box: THREE.BoxGeometry; cylinder: THREE.CylinderGeometry },
  materials: ReturnType<typeof createMaterials>,
  position: [number, number, number],
) {
  const pole = new THREE.Group();
  pole.position.set(...position);
  scene.add(pole);
  addMesh(pole, geometry.cylinder, materials.stadiumSteel, [0, 4.2, 0], [0.15, 8.4, 0.15]);
  addMesh(pole, geometry.box, materials.stadiumSteel, [0, 8.45, 0], [1.45, 0.34, 0.42]);
  addMesh(pole, geometry.box, materials.adAccent, [0, 8.25, 0], [1.05, 0.08, 0.3]);
}

function buildWickets(
  scene: THREE.Scene,
  geometry: { cylinder: THREE.CylinderGeometry },
  materials: ReturnType<typeof createMaterials>,
  position: [number, number, number],
) {
  const group = new THREE.Group();
  group.position.set(...position);
  scene.add(group);
  for (const x of [-0.2, 0, 0.2]) addMesh(group, geometry.cylinder, materials.wicket, [x, 0.42, 0], [0.036, 0.82, 0.036]);
  for (const x of [-0.1, 0.1]) addMesh(group, geometry.cylinder, materials.wicket, [x, 0.84, 0], [0.025, 0.15, 0.025], [0, 0, Math.PI / 2]);
  return group;
}

function buildPlayer(
  scene: THREE.Scene,
  geometry: { sphere: THREE.SphereGeometry; capsule: THREE.CapsuleGeometry; cylinder: THREE.CylinderGeometry; box: THREE.BoxGeometry },
  materials: ReturnType<typeof createMaterials>,
  role: PlayerRole,
  position: [number, number, number],
  facing: number,
  color: string,
  scale: number,
): PlayerRig {
  const root = new THREE.Group();
  root.position.set(...position);
  root.rotation.y = facing;
  root.scale.setScalar(scale);
  scene.add(root);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.52, 24), materials.groundShadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.035;
  shadow.scale.set(1.25, 0.58, 1);
  root.add(shadow);

  const shirt = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
  const pants = role === 'batter' ? materials.batterPants : shirt;
  const skin = role === 'fielder' ? materials.fielderSkin : materials.skin;
  const torso = new THREE.Group();
  torso.position.y = 0.9;
  root.add(torso);
  capsuleMesh(torso, geometry.capsule, shirt, [0, 0.29, 0], 0.23, 0.75);
  addMesh(torso, geometry.cylinder, pants, [0, 0.01, 0], [0.18, 0.2, 0.18]);
  addMesh(torso, geometry.sphere, skin, [0, 0.73, 0], [0.16, 0.16, 0.16]);
  addMesh(torso, geometry.sphere, materials.faceDetail, [-0.052, 0.755, 0.145], [0.018, 0.022, 0.012]);
  addMesh(torso, geometry.sphere, materials.faceDetail, [0.052, 0.755, 0.145], [0.018, 0.022, 0.012]);
  addMesh(torso, geometry.sphere, materials.shirtBadge, [0, 0.705, 0.158], [0.017, 0.025, 0.018]);
  if (role === 'batter' || role === 'keeper') {
    addMesh(torso, geometry.sphere, materials.helmet, [0, 0.85, 0], [0.185, 0.16, 0.185]);
    addMesh(torso, geometry.box, materials.helmet, [0, 0.805, 0.15], [0.26, 0.045, 0.14]);
    addMesh(torso, geometry.box, materials.helmetGrill, [0, 0.76, 0.18], [0.21, 0.025, 0.025]);
    addMesh(torso, geometry.box, materials.helmetGrill, [-0.07, 0.74, 0.18], [0.018, 0.12, 0.025]);
    addMesh(torso, geometry.box, materials.helmetGrill, [0.07, 0.74, 0.18], [0.018, 0.12, 0.025]);
  } else {
    addMesh(torso, geometry.cylinder, materials.bowlerHelmet, [0, 0.87, 0], [0.17, 0.09, 0.17]);
    addMesh(torso, geometry.box, materials.bowlerHelmet, [0, 0.82, 0.14], [0.24, 0.035, 0.16]);
  }
  addMesh(torso, geometry.box, materials.shirtBadge, [0, 0.27, 0.242], [0.24, 0.048, 0.018]);
  addMesh(torso, geometry.box, materials.jerseyAccent, [-0.17, 0.32, 0.225], [0.025, 0.5, 0.018]);
  addMesh(torso, geometry.box, materials.jerseyAccent, [0.17, 0.32, 0.225], [0.025, 0.5, 0.018]);
  addMesh(torso, geometry.box, materials.shirtBadge, [0, 0.33, -0.235], [0.18, 0.12, 0.018]);

  const rightArm = buildArm(root, geometry, shirt, skin, 0.24);
  const leftArm = buildArm(root, geometry, shirt, skin, -0.24);
  const rightLeg = buildLeg(root, geometry, pants, materials, 0.105, role === 'batter');
  const leftLeg = buildLeg(root, geometry, pants, materials, -0.105, role === 'batter');
  let bat: THREE.Group | null = null;
  if (role === 'batter') {
    bat = new THREE.Group();
    bat.position.set(0.31, 0.66, 0.1);
    root.add(bat);
    addMesh(bat, geometry.box, materials.bat, [0, 0.47, 0], [0.16, 0.76, 0.055], [0, 0, -0.1]);
    addMesh(bat, geometry.cylinder, materials.batHandle, [0, 0.96, 0], [0.045, 0.28, 0.045]);
    addMesh(bat, geometry.box, materials.batFace, [0, 0.69, 0.035], [0.11, 0.48, 0.012]);
  }

  return {
    root, torso, rightArm, leftArm,
    rightForearm: rightArm.userData.forearm as THREE.Group,
    leftForearm: leftArm.userData.forearm as THREE.Group,
    rightLeg: rightLeg.upper, leftLeg: leftLeg.upper,
    rightKnee: rightLeg.knee, leftKnee: leftLeg.knee,
    bat, role,
    base: new THREE.Vector3(...position), facing, scale,
    fieldIndex: null,
  };
}

function capsuleMesh(
  parent: THREE.Object3D,
  geometry: THREE.CapsuleGeometry,
  material: THREE.Material,
  position: [number, number, number],
  radius: number,
  height: number,
) {
  return addMesh(parent, geometry, material, position, [radius, height / 3, radius]);
}

function buildArm(
  root: THREE.Group,
  geometry: { capsule: THREE.CapsuleGeometry; sphere: THREE.SphereGeometry },
  shirt: THREE.Material,
  skin: THREE.Material,
  side: number,
) {
  const upper = new THREE.Group();
  upper.position.set(side, 1.39, 0);
  root.add(upper);
  capsuleMesh(upper, geometry.capsule, shirt, [0, -0.19, 0], 0.09, 0.42);
  const forearm = new THREE.Group();
  forearm.position.set(0, -0.35, 0);
  upper.add(forearm);
  capsuleMesh(forearm, geometry.capsule, skin, [0, -0.17, 0], 0.071, 0.36);
  addMesh(forearm, geometry.sphere, side > 0 ? shirt : skin, [0, -0.33, 0.025], [0.09, 0.09, 0.09]);
  upper.userData.forearm = forearm;
  return upper;
}

function buildLeg(
  root: THREE.Group,
  geometry: { capsule: THREE.CapsuleGeometry; box: THREE.BoxGeometry },
  pants: THREE.Material,
  materials: ReturnType<typeof createMaterials>,
  side: number,
  padded: boolean,
): { upper: THREE.Group; knee: THREE.Group } {
  const upper = new THREE.Group();
  upper.position.set(side, 0.87, 0);
  root.add(upper);
  capsuleMesh(upper, geometry.capsule, pants, [0, -0.22, 0], 0.105, 0.49);
  const knee = new THREE.Group();
  knee.position.set(0, -0.45, 0);
  upper.add(knee);
  capsuleMesh(knee, geometry.capsule, pants, [0, -0.17, 0.02], 0.09, 0.38);
  if (padded) addMesh(knee, geometry.box, materials.batterPads, [0, -0.17, 0.09], [0.16, 0.28, 0.06]);
  addMesh(knee, geometry.box, materials.shoes, [0, -0.34, 0.1], [0.24, 0.12, 0.35]);
  return { upper, knee };
}

function animateScene(rig: SceneRig, props: Props, time: number) {
  const { players, ball, wickets, targetMarker } = rig;
  const action = props.action;
  const actionElapsed = action ? clamp((Date.now() - action.startedAt) / 1100) : 0;
  const runUpProgress = clamp(props.bowlingRunUpProgress ?? 0);
  const cameraBlend = smooth(Math.max(runUpProgress, props.deliveryActive ? 0.68 : 0, action ? 0.76 : 0));
  const cameraEase = 0.045;
  rig.camera.position.x += (0 - rig.camera.position.x) * cameraEase;
  rig.camera.position.y += (4.9 - cameraBlend * 0.3 - rig.camera.position.y) * cameraEase;
  rig.camera.position.z += (-11.6 + cameraBlend * 0.35 - rig.camera.position.z) * cameraEase;
  rig.cameraFocus.x += (0 - rig.cameraFocus.x) * cameraEase;
  rig.cameraFocus.y += (1.05 + cameraBlend * 0.1 - rig.cameraFocus.y) * cameraEase;
  rig.cameraFocus.z += (-2.3 + cameraBlend * 0.18 - rig.cameraFocus.z) * cameraEase;
  rig.camera.lookAt(rig.cameraFocus);
  targetMarker.visible = Boolean(props.showPitchTarget && !props.deliveryActive);
  targetMarker.position.set(props.pitchTargetX ?? 0, 0.07, props.pitchTargetZ ?? -2.55);

  for (const player of players) {
    const { role, base, facing, root, torso, rightArm, leftArm, rightForearm, leftForearm, rightLeg, leftLeg, rightKnee, leftKnee, bat, fieldIndex } = player;
    const isBatter = role === 'batter';
    const isBowler = role === 'bowler';
    const isFielder = role === 'fielder';
    const isKeeper = role === 'keeper';
    const activeFieldSet = props.fieldSet ?? 'ATTACKING 1';
    const fielderBase = isFielder && fieldIndex !== null ? FIELD_SPOTS[activeFieldSet][fieldIndex] : null;
    const baseX = fielderBase?.[0] ?? base.x;
    const baseZ = fielderBase?.[2] ?? base.z;
    const bob = Math.sin(time * 2.5 + baseX) * 0.012;
    if (fielderBase) root.position.set(fielderBase[0], fielderBase[1], fielderBase[2]);
    else root.position.copy(base);
    if (isBatter) {
      root.position.x += clamp(props.batterMovementX ?? 0, -1, 1) * 0.42;
      root.position.z += clamp(props.batterMovementY ?? 0, -1, 1) * 0.2;
    }
    root.rotation.y = facing;
    torso.position.y = (isKeeper ? 0.68 : 0.9) + bob;

    let armR = isBatter ? -0.22 : 0;
    let armL = isBatter ? 0.38 : 0;
    let foreR = isBatter ? -0.16 : -0.08;
    let foreL = isBatter ? -0.24 : -0.12;
    let swing = -0.34 + Math.sin(time * 1.5) * 0.025;
    let lean = isBatter ? -0.035 : 0;
    let twist = isBatter ? Math.sin(time * 1.1) * 0.025 : 0;
    let legR = isBatter ? 0.025 : Math.sin(time * 1.4 + base.x) * 0.012;
    let legL = isBatter ? -0.045 : -legR;
    let kneeR = isBatter ? 0.08 : 0;
    let kneeL = isBatter ? 0.04 : 0;

    if (isBowler && (runUpProgress > 0 || props.deliveryActive)) {
      const runIn = smooth(runUpProgress);
      const delivery = props.deliveryActive ? clamp(props.deliveryProgress) : 0;
      const runPhase = runUpProgress * Math.PI * 5.2;
      const stride = Math.sin(runPhase);
      const airborne = Math.max(0, Math.cos(runPhase));
      const running = runUpProgress < 0.98 && !props.deliveryActive;
      root.position.z += runIn * 0.72 + (props.deliveryActive ? smooth(delivery / 0.5) * 0.22 : 0);
      root.position.y += running ? runIn * (0.018 + airborne * 0.035) : props.deliveryActive ? Math.sin(delivery * Math.PI) * 0.06 : 0;
      if (running) {
        armR = -0.38 + stride * 0.42;
        armL = 0.56 - stride * 0.38;
        foreR = -0.18 - Math.max(0, stride) * 0.22;
        foreL = -0.12 - Math.max(0, -stride) * 0.2;
        legR = stride * 0.53;
        legL = -stride * 0.53;
        kneeR = Math.max(0, -Math.cos(runPhase)) * 0.76;
        kneeL = Math.max(0, Math.cos(runPhase)) * 0.76;
        lean = 0.08 + runIn * 0.055;
        twist = -stride * 0.075;
      } else {
        const load = smooth(delivery / 0.16);
        const release = smooth((delivery - 0.16) / 0.13);
        const follow = smooth((delivery - 0.29) / 0.31);
        armR = mix(-0.3, -1.42, load);
        armR = mix(armR, 1.48, release);
        armR = mix(armR, -0.42, follow);
        armL = mix(0.45, -0.62, release);
        armL = mix(armL, 0.22, follow);
        foreR = mix(-0.18, 0.92, release);
        foreR = mix(foreR, -0.16, follow);
        foreL = mix(-0.12, -0.36, release);
        legR = -0.06 + release * 0.52 - follow * 0.16;
        legL = 0.06 - release * 0.28 + follow * 0.08;
        kneeR = 0.05 + release * 0.18 + follow * 0.34;
        kneeL = 0.04 + release * 0.32 - follow * 0.16;
        lean = 0.09 + release * 0.2 - follow * 0.22;
        twist = -0.08 + release * 0.3 - follow * 0.22;
      }
    } else if (isKeeper) {
      armR = 0.5;
      armL = -0.5;
      foreR = -0.3;
      foreL = -0.3;
      legR = -0.38;
      legL = -0.38;
      kneeR = 0.58;
      kneeL = 0.58;
      lean = 0.12;
    } else if (isBatter && action) {
      const windUp = smooth(actionElapsed / 0.18);
      const contact = smooth((actionElapsed - 0.16) / 0.2);
      const follow = smooth((actionElapsed - 0.34) / 0.42);
      const pulse = Math.sin(Math.PI * clamp((actionElapsed - 0.08) / 0.72));
      lean = action.wicket ? follow * 0.17 : mix(0.02, action.shot === 'drive' ? 0.19 : 0.11, pulse);
      if (action.wicket) {
        armR = -0.35 - follow * 0.42;
        armL = 0.3 - follow * 0.28;
        swing = -0.3 - follow * 0.2;
      } else {
        const direction = action.shot === 'pull' ? 1 : -1;
        const contactAngle = action.shot === 'defend' ? 0.18 : direction * (action.shot === 'loft' ? 1.52 : 1.16);
        const followAngle = action.shot === 'loft' ? 1.24 : contactAngle * 0.34;
        swing = mix(-0.66, contactAngle, contact);
        swing = mix(swing, followAngle, follow);
        armR = mix(-0.48 - windUp * 0.28, direction * 0.72, contact);
        armR = mix(armR, direction * 0.26 - (action.shot === 'loft' ? 0.22 : 0), follow);
        armL = mix(0.4 + windUp * 0.2, direction * 0.62, contact);
        armL = mix(armL, direction * 0.18, follow);
        foreR = -0.14 - contact * 0.44 + follow * 0.15;
        foreL = -0.2 - contact * 0.32 + follow * 0.1;
        legR = -0.08 + contact * 0.28 - follow * 0.16;
        legL = -0.04 - contact * 0.16 + follow * 0.12;
        kneeR = 0.08 + contact * 0.18 + follow * 0.1;
        kneeL = 0.04 + contact * 0.1 + follow * 0.14;
        twist = direction * (windUp * 0.1 - contact * 0.24 + follow * 0.14);
      }
      if (windUp < 1) swing = mix(-0.34, swing, windUp);
    } else if (isFielder && action) {
      const chasing =
        (action.shot === 'pull' && Math.abs(baseX) > 2.4 && baseZ > -1) ||
        (action.shot === 'drive' && baseZ < -3.2 && baseX < 0) ||
        (action.shot === 'loft' && baseZ < -2.2 && baseX > 0) ||
        (action.shot === 'defend' && baseZ > -1.2);
      const run = chasing ? smooth((Date.now() - action.startedAt - 90) / 340) : 0;
      const xDirection = action.shot === 'pull' ? Math.sign(baseX) * 0.55 : action.shot === 'drive' ? -0.48 : 0.34;
      if (chasing) {
        root.position.x += xDirection * run;
        root.position.z += 0.35 * run;
      }
      armR = Math.sin(time * 16) * 0.62 * run;
      armL = -armR;
      legR = Math.sin(time * 16) * 0.48 * run;
      legL = -legR;
      kneeR = Math.max(0, Math.cos(time * 16)) * 0.64 * run;
      kneeL = Math.max(0, -Math.cos(time * 16)) * 0.64 * run;
    }

    rightArm.rotation.z = armR;
    leftArm.rotation.z = armL;
    rightForearm.rotation.z = foreR;
    leftForearm.rotation.z = foreL;
    rightLeg.rotation.x = legR;
    leftLeg.rotation.x = legL;
    rightKnee.rotation.x = kneeR;
    leftKnee.rotation.x = kneeL;
    torso.rotation.x = lean;
    torso.rotation.y = twist;
    if (bat) {
      bat.rotation.z = swing;
      bat.rotation.x = isBatter && action?.shot === 'pull' ? 0.75 : 0.12;
    }
  }

  if (action?.wicket) {
    const hit = smooth((Date.now() - action.startedAt) / 600);
    wickets.rotation.x = hit * 0.82;
    wickets.rotation.z = hit * 0.22;
  } else {
    wickets.rotation.set(0, 0, 0);
  }

  ball.rotation.x += 0.14;
  ball.rotation.z += 0.07;
  if (props.deliveryActive) {
    const travel = clamp(props.deliveryProgress / 0.67);
    const line = props.deliveryLine === 'OFF STUMP' ? -0.43 : props.deliveryLine === 'LEG STUMP' ? 0.43 : 0;
    const targetX = props.deliveryTargetX ?? line;
    const targetZ = props.deliveryTargetZ ?? 0.13;
    const swing = props.swing === 'IN' ? -0.18 : props.swing === 'AWAY' ? 0.18 : 0;
    ball.visible = true;
    ball.position.set(
      line * (1 - travel) + targetX * travel + Math.sin(travel * Math.PI) * swing,
      1.55 - travel * 0.83 + Math.sin(travel * Math.PI) * 0.18,
      -5.12 + (targetZ + 5.12) * travel,
    );
  } else if (action) {
    const elapsed = clamp((Date.now() - action.startedAt) / 1300);
    ball.visible = elapsed < 1;
    if (action.wicket) {
      ball.position.set(-0.13 * elapsed, 1.18 - elapsed * 0.18, 0.28 + elapsed * 0.72);
    } else {
      const endX = action.shot === 'pull' ? 5.9 : action.shot === 'loft' ? 1.15 : action.shot === 'drive' ? -2.1 : 0.55;
      const endZ = action.shot === 'pull' ? -0.35 : action.shot === 'defend' ? -0.48 : -11.6;
      const arc = action.runs === 6 ? 3.8 : action.runs === 4 ? 1.25 : action.runs === 0 ? 0.26 : 0.82;
      const flight = smooth(elapsed / 0.78);
      ball.position.set(0.12 + (endX - 0.12) * flight, 0.9 * (1 - flight) + 0.13 + Math.sin(Math.PI * flight) * arc, 0.34 + (endZ - 0.34) * flight);
    }
  } else {
    ball.visible = false;
  }
}

const styles = StyleSheet.create({
  viewport: { height: 264, width: '100%', overflow: 'hidden', borderRadius: 13, backgroundColor: '#9EDBE0' },
  fullScreenViewport: { flex: 1, width: '100%', height: '100%', borderRadius: 0 },
  hud: { ...StyleSheet.absoluteFill, padding: 10, justifyContent: 'space-between' },
  hudPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, backgroundColor: 'rgba(8,36,37,0.78)', borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#BDEB74' },
  hudText: { color: '#F4F3E8', fontSize: 7, fontWeight: '900', letterSpacing: 1.2 },
  cameraPill: { alignSelf: 'flex-end', marginTop: 'auto', backgroundColor: 'rgba(9,38,38,0.55)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
  cameraText: { color: '#E6F0E6', fontSize: 6, fontWeight: '900', letterSpacing: 1 },
  hintPill: { alignSelf: 'center', backgroundColor: 'rgba(7,30,28,0.78)', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20 },
  hintText: { color: '#DFF0D3', fontSize: 7, fontWeight: '900', letterSpacing: 0.8, textAlign: 'center' },
  errorCard: { position: 'absolute', alignSelf: 'center', top: 82, maxWidth: '88%', padding: 10, borderRadius: 10, backgroundColor: 'rgba(7,30,28,0.88)' },
  errorTitle: { color: '#FFB2A5', fontSize: 9, fontWeight: '900', textAlign: 'center' },
  errorText: { color: '#FFF5E9', fontSize: 8, textAlign: 'center', marginTop: 4 },
});
