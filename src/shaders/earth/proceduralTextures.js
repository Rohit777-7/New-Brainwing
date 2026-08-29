import * as THREE from "three";

/*
 * The starter's earthShader expects day/night/topography samplers, but no
 * texture assets ship with the repo (see public/assets/earth/README.txt -
 * the globe was meant to run without external downloads). These generate
 * small placeholder textures on the canvas at runtime so the shader has
 * something to sample until real Earth imagery is dropped in.
 */

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function createDayTexture() {
  const w = 512, h = 256;
  const ctx = createCanvas(w, h).getContext("2d");

  const ocean = ctx.createLinearGradient(0, 0, 0, h);
  ocean.addColorStop(0, "#123a5e");
  ocean.addColorStop(0.5, "#0f2c48");
  ocean.addColorStop(1, "#0a1e33");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#2f5d43";
  for (let i = 0; i < 260; i++) {
    const x = Math.random() * w;
    const y = h * 0.15 + Math.random() * h * 0.7;
    const rx = 6 + Math.random() * 22;
    const ry = rx * (0.4 + Math.random() * 0.4);
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(ctx.canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

export function createNightTexture() {
  const w = 512, h = 256;
  const ctx = createCanvas(w, h).getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#ffdca0";
  for (let i = 0; i < 420; i++) {
    const x = Math.random() * w;
    const y = h * 0.15 + Math.random() * h * 0.7;
    const r = 0.6 + Math.random() * 1.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(ctx.canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

export function createTopographyTexture() {
  const w = 256, h = 128;
  const ctx = createCanvas(w, h).getContext("2d");
  const image = ctx.createImageData(w, h);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = 90 + Math.random() * 60;
    image.data[i] = v;
    image.data[i + 1] = v;
    image.data[i + 2] = v;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(ctx.canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

export function createCloudsTexture() {
  const w = 512, h = 256;
  const ctx = createCanvas(w, h).getContext("2d");
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 6 + Math.random() * 26;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(ctx.canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}
