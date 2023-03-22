fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.cornerColor = '#108ce6';
fabric.Object.prototype.borderColor = '#108ce6';
fabric.Object.prototype.cornerSize = 10;
fabric.Object.prototype.lockRotation = true;

let count = 0;
let executed_openpose_editor = false;

let lockMode = false;
const undo_history = [];
const redo_history = [];

coco_body_keypoints = [
  'nose',
  'neck',
  'right_shoulder',
  'right_elbow',
  'right_wrist',
  'left_shoulder',
  'left_elbow',
  'left_wrist',
  'right_hip',
  'right_knee',
  'right_ankle',
  'left_hip',
  'left_knee',
  'left_ankle',
  'right_eye',
  'left_eye',
  'right_ear',
  'left_ear',
];

let connect_keypoints = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [1, 5],
  [5, 6],
  [6, 7],
  [1, 8],
  [8, 9],
  [9, 10],
  [1, 11],
  [11, 12],
  [12, 13],
  [0, 14],
  [14, 16],
  [0, 15],
  [15, 17],
  [18, 19],
  [19, 20],
  [20, 21],
  [21, 22],
  [18, 23],
  [23, 24],
  [24, 25],
  [25, 26],
  [18, 27],
  [27, 28],
  [28, 29],
  [29, 30],
  [18, 31],
  [31, 32],
  [32, 33],
  [33, 34],
  [18, 35],
  [35, 36],
  [36, 37],
  [37, 38],
  [39, 40],
  [40, 41],
  [41, 42],
  [42, 43],
  [39, 44],
  [44, 45],
  [45, 46],
  [46, 47],
  [39, 48],
  [48, 49],
  [49, 50],
  [50, 51],
  [39, 52],
  [52, 53],
  [53, 54],
  [54, 55],
  [39, 56],
  [56, 57],
  [57, 58],
  [58, 59],
];

let connect_color = [
  [128, 0, 0],
  [178, 34, 34],
  [220, 20, 60],
  [255, 0, 0],
  [255, 105, 180],
  [255, 140, 0],
  [255, 165, 0],
  [255, 215, 0],
  [255, 218, 185],
  [255, 228, 181],
  [255, 239, 213],
  [255, 240, 245],
  [255, 245, 238],
  [255, 248, 220],
  [255, 250, 205],
  [255, 250, 240],
  [255, 255, 0],
  [255, 255, 224],
  [255, 255, 240],
  [255, 255, 255],
  [0, 0, 0],
  [0, 0, 128],
  [0, 0, 255],
  [0, 100, 0],
  [0, 128, 0],
  [0, 255, 0],
  [47, 79, 79],
  [64, 64, 64],
  [105, 105, 105],
  [128, 128, 0],
  [128, 128, 128],
  [139, 0, 0],
  [139, 69, 19],
  [139, 69, 49],
  [143, 188, 143],
  [144, 238, 144],
  [165, 42, 42],
  [169, 169, 169],
  [173, 216, 230],
  [184, 134, 11],
  [186, 85, 211],
  [218, 112, 214],
  [199, 21, 133],
  [205, 92, 92],
  [210, 105, 30],
  [218, 165, 32],
  [222, 184, 135],
  [238, 130, 238],
  [240, 128, 128],
  [240, 230, 140],
  [245, 222, 179],
  [248, 248, 255],
  [250, 128, 114],
  [250, 235, 215],
  [255, 0, 255],
  [255, 20, 147],
  [255, 69, 0],
  [255, 99, 71],
  [255, 127, 80],
  [255, 140, 0],
];

let openpose_obj = {
  // width, height
  resolution: [512, 512],
  // fps...?
  fps: 1,
  // frames
  frames: [
    {
      frame_current: 1,
      // armatures
      armatures: {},
    },
  ],
};

const default_keypoints = [
  [241, 77],
  [241, 120],
  [191, 118],
  [177, 183],
  [163, 252],
  [298, 118],
  [317, 182],
  [332, 245],
  [225, 241],
  [213, 359],
  [215, 454],
  [270, 240],
  [282, 360],
  [286, 456],
  [232, 59],
  [253, 60],
  [225, 70],
  [260, 72],
  [254, 632],
  [266, 641],
  [276, 653],
  [269, 663],
  [265, 672],
  [246, 659],
  [237, 675],
  [227, 686],
  [217, 693],
  [235, 656],
  [223, 670],
  [211, 684],
  [202, 692],
  [227, 655],
  [216, 664],
  [205, 679],
  [197, 689],
  [219, 657],
  [209, 660],
  [201, 665],
  [194, 674],
  [254, 632],
  [265, 642],
  [275, 653],
  [269, 663],
  [265, 671],
  [246, 660],
  [237, 675],
  [227, 686],
  [217, 694],
  [235, 656],
  [224, 670],
  [211, 685],
  [200, 692],
  [227, 655],
  [216, 664],
  [205, 678],
  [195, 688],
  [218, 656],
  [208, 659],
  [200, 664],
  [194, 674],
];

function gradioApp() {
  const elems = document.getElementsByTagName('gradio-app');
  const gradioShadowRoot = elems.length == 0 ? null : elems[0].shadowRoot;
  return !!gradioShadowRoot ? gradioShadowRoot : document;
}

function calcResolution(resolution) {
  const width = resolution[0];
  const height = resolution[1];
  const viewportWidth = window.innerWidth / 2.25;
  const viewportHeight = window.innerHeight * 0.75;
  const ratio = Math.min(viewportWidth / width, viewportHeight / height);
  return { width: width * ratio, height: height * ratio };
}

function resizeCanvas(width, height) {
  const elem = openpose_editor_elem;
  const canvas = openpose_editor_canvas;

  let resolution = calcResolution([width, height]);

  canvas.setWidth(width);
  canvas.setHeight(height);
  elem.style.width = resolution['width'] + 'px';
  elem.style.height = resolution['height'] + 'px';
  elem.nextElementSibling.style.width = resolution['width'] + 'px';
  elem.nextElementSibling.style.height = resolution['height'] + 'px';
  elem.parentElement.style.width = resolution['width'] + 'px';
  elem.parentElement.style.height = resolution['height'] + 'px';
}

function undo() {
  const canvas = openpose_editor_canvas;
  if (undo_history.length > 0) {
    lockMode = true;
    if (undo_history.length > 1) redo_history.push(undo_history.pop());
    const content = undo_history[undo_history.length - 1];
    canvas.loadFromJSON(content, function () {
      canvas.renderAll();
      lockMode = false;
    });
  }
}

function redo() {
  const canvas = openpose_editor_canvas;
  if (redo_history.length > 0) {
    lockMode = true;
    const content = redo_history.pop();
    undo_history.push(content);
    canvas.loadFromJSON(content, function () {
      canvas.renderAll();
      lockMode = false;
    });
  }
}

function setPose(keypoints) {
  const canvas = openpose_editor_canvas;

  canvas.clear();

  canvas.backgroundColor = '#000';

  const res = [];
  for (let i = 0; i < keypoints.length; i += 60) {
    const chunk = keypoints.slice(i, i + 60);
    res.push(chunk);
  }

  for (item of res) {
    addPose(item);
    openpose_editor_canvas.discardActiveObject();
  }
}

function addPose(keypoints = undefined) {
  if (keypoints === undefined) {
    keypoints = default_keypoints;
  }

  const canvas = openpose_editor_canvas;
  const group = new fabric.Group();

  function makeCircle(color, left, top, line1, line2, line3, line4, line5) {
    var c = new fabric.Circle({
      left: left,
      top: top,
      strokeWidth: 1,
      radius: 5,
      fill: color,
      stroke: color,
    });
    c.hasControls = c.hasBorders = false;

    c.line1 = line1;
    c.line2 = line2;
    c.line3 = line3;
    c.line4 = line4;
    c.line5 = line5;

    return c;
  }

  function makeLine(coords, color) {
    return new fabric.Line(coords, {
      fill: color,
      stroke: color,
      strokeWidth: 10,
      selectable: false,
      evented: false,
    });
  }

  const lines = [];
  const circles = [];

  for (i = 0; i < connect_keypoints.length; i++) {
    // 接続されるidxを指定　[0, 1]なら0と1つなぐ
    const item = connect_keypoints[i];
    const line = makeLine(
      keypoints[item[0]].concat(keypoints[item[1]]),
      `rgba(${connect_color[i].join(', ')}, 0.7)`
    );
    lines.push(line);
    canvas.add(line);
  }

  for (i = 0; i < keypoints.length; i++) {
    list = [];
    connect_keypoints.filter((item, idx) => {
      if (item.includes(i)) {
        list.push(lines[idx]);
        return idx;
      }
    });
    circle = makeCircle(
      `rgb(${connect_color[i].join(', ')})`,
      keypoints[i][0],
      keypoints[i][1],
      ...list
    );
    circle['id'] = i;
    circles.push(circle);
    // canvas.add(circle)
    group.addWithUpdate(circle);
  }

  canvas.discardActiveObject();
  canvas.setActiveObject(group);
  canvas.add(group);
  group.toActiveSelection();
  canvas.requestRenderAll();
}

function initCanvas(elem) {
  const canvas = (window.openpose_editor_canvas = new fabric.Canvas(elem, {
    backgroundColor: '#000',
    // selection: false,
    preserveObjectStacking: true,
  }));

  window.openpose_editor_elem = elem;

  canvas.on('object:moving', function (e) {
    if ('_objects' in e.target) {
      const rtop = e.target.top;
      const rleft = e.target.left;
      for (const item of e.target._objects) {
        let p = item;
        const top =
          rtop +
          p.top * e.target.scaleY +
          (e.target.height * e.target.scaleY) / 2;
        const left =
          rleft +
          p.left * e.target.scaleX +
          (e.target.width * e.target.scaleX) / 2;
        if (p['id'] === 0) {
          p.line1 && p.line1.set({ x1: left, y1: top });
        } else {
          p.line1 && p.line1.set({ x2: left, y2: top });
        }
        p.line2 && p.line2.set({ x1: left, y1: top });
        p.line3 && p.line3.set({ x1: left, y1: top });
        p.line4 && p.line4.set({ x1: left, y1: top });
        p.line5 && p.line5.set({ x1: left, y1: top });
      }
    } else {
      var p = e.target;
      if (p['id'] === 0) {
        p.line1 && p.line1.set({ x1: p.left, y1: p.top });
      } else {
        p.line1 && p.line1.set({ x2: p.left, y2: p.top });
      }
      p.line2 && p.line2.set({ x1: p.left, y1: p.top });
      p.line3 && p.line3.set({ x1: p.left, y1: p.top });
      p.line4 && p.line4.set({ x1: p.left, y1: p.top });
      p.line5 && p.line5.set({ x1: p.left, y1: p.top });
    }
    canvas.renderAll();
  });

  canvas.on('object:scaling', function (e) {
    if ('_objects' in e.target) {
      const rtop = e.target.top;
      const rleft = e.target.left;
      for (const item of e.target._objects) {
        let p = item;
        const top =
          rtop +
          p.top * e.target.scaleY +
          (e.target.height * e.target.scaleY) / 2;
        const left =
          rleft +
          p.left * e.target.scaleX +
          (e.target.width * e.target.scaleX) / 2;
        if (p['id'] === 0) {
          p.line1 && p.line1.set({ x1: left, y1: top });
        } else {
          p.line1 && p.line1.set({ x2: left, y2: top });
        }
        p.line2 && p.line2.set({ x1: left, y1: top });
        p.line3 && p.line3.set({ x1: left, y1: top });
        p.line4 && p.line4.set({ x1: left, y1: top });
        p.line5 && p.line5.set({ x1: left, y1: top });
      }
    }
    canvas.renderAll();
  });

  canvas.on('object:rotating', function (e) {
    if ('_objects' in e.target) {
      const rtop = e.target.top;
      const rleft = e.target.left;
      for (const item of e.target._objects) {
        let p = item;
        const top = rtop + p.top; // + e.target.height / 2;
        const left = rleft + p.left; // + e.target.width / 2;
        if (p['id'] === 0) {
          p.line1 && p.line1.set({ x1: left, y1: top });
        } else {
          p.line1 && p.line1.set({ x2: left, y2: top });
        }
        p.line2 && p.line2.set({ x1: left, y1: top });
        p.line3 && p.line3.set({ x1: left, y1: top });
        p.line4 && p.line4.set({ x1: left, y1: top });
        p.line5 && p.line5.set({ x1: left, y1: top });
      }
    }
    canvas.renderAll();
  });

  canvas.on('object:added', function () {
    if (lockMode) return;
    undo_history.push(JSON.stringify(canvas));
    redo_history.length = 0;
  });

  canvas.on('object:modified', function () {
    if (lockMode) return;
    undo_history.push(JSON.stringify(canvas));
    redo_history.length = 0;
  });

  resizeCanvas(...openpose_obj.resolution);

  setPose(default_keypoints);

  undo_history.push(JSON.stringify(canvas));

  const json_observer = new MutationObserver((m) => {
    if (
      gradioApp().querySelector('#tab_openpose_editor').style.display !==
      'block'
    )
      return;
    try {
      const raw = gradioApp()
        .querySelector('#hide_json')
        .querySelector('textarea')
        .value.replaceAll("'", '"');
      console.log(raw);
      const json = JSON.parse(raw);
      let candidate = json['candidate'];
      let subset = json['subset'];
      let hand_peaks = json['hand_peaks'];

      const li = [];
      subset = subset.splice(0, 18);
      for (let i = 0; subset.length > i; i++) {
        if (Number.isInteger(subset[i]) && subset[i] >= 0) {
          li.push(candidate[subset[i]]);
        } else {
          const ra_width = Math.floor(Math.random() * canvas.width);
          const ra_height = Math.floor(Math.random() * canvas.height);
          li.push([ra_width, ra_height]);
        }
      }

      for (hand_peak of hand_peaks) {
        li.push(hand_peak);
      }
      console.log(li);
      setPose(li);

      const fileReader = new FileReader();
      fileReader.onload = function () {
        const dataUri = this.result;
        canvas.setBackgroundImage(dataUri, canvas.renderAll.bind(canvas), {
          opacity: 0.5,
        });
        const img = new Image();
        img.onload = function () {
          resizeCanvas(this.width, this.height);
        };
        img.src = dataUri;
      };
      fileReader.readAsDataURL(
        gradioApp()
          .querySelector('#openpose_editor_input')
          .querySelector('input').files[0]
      );
    } catch (e) {
      console.log(e);
    }
  });
  json_observer.observe(gradioApp().querySelector('#hide_json'), {
    attributes: true,
  });

  // document.addEventListener('keydown', function(e) {
  //     if (e.key !== undefined) {
  //         if((e.key == "z" && (e.metaKey || e.ctrlKey || e.altKey))) undo()
  //         if((e.key == "y" && (e.metaKey || e.ctrlKey || e.altKey))) redo()
  //     }
  // })
}

function resetCanvas() {
  const canvas = openpose_editor_canvas;
  canvas.clear();
  canvas.backgroundColor = '#000';
}

function savePNG() {
  openpose_editor_canvas.getObjects('image').forEach((img) => {
    img.set({
      opacity: 0,
    });
  });
  if (openpose_editor_canvas.backgroundImage)
    openpose_editor_canvas.backgroundImage.opacity = 0;
  openpose_editor_canvas.discardActiveObject();
  openpose_editor_canvas.renderAll();
  openpose_editor_elem.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pose.png';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  openpose_editor_canvas.getObjects('image').forEach((img) => {
    img.set({
      opacity: 1,
    });
  });
  if (openpose_editor_canvas.backgroundImage)
    openpose_editor_canvas.backgroundImage.opacity = 0.5;
  openpose_editor_canvas.renderAll();
  return openpose_editor_canvas;
}

function serializeJSON() {
  const canvas = openpose_editor_canvas;
  const json = JSON.stringify(
    {
      width: canvas.width,
      height: canvas.height,
      keypoints: openpose_editor_canvas
        .getObjects()
        .filter((item) => {
          if (item.type === 'circle') return item;
        })
        .map((item) => {
          return [Math.round(item.left), Math.round(item.top)];
        }),
    },
    null,
    4
  );
  return json;
}

function saveJSON() {
  const json = serializeJSON();
  const blob = new Blob([json], {
    type: 'application/json',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'pose.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function loadJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.addEventListener('change', function (e) {
    const file = e.target.files[0];
    var fileReader = new FileReader();
    fileReader.onload = function () {
      loadPreset(this.result);
    };
    fileReader.readAsText(file);
  });
  input.click();
}

function savePreset() {
  var name = prompt('Preset Name');
  const json = serializeJSON();
  return [name, json];
}

function loadPreset(json) {
  try {
    json = JSON.parse(json);
    if (json['width'] && json['height']) {
      resizeCanvas(json['width'], json['height']);
    } else {
      throw new Error('width, height is invalid');
    }
    if (json['keypoints'].length % 60 === 0) {
      setPose(json['keypoints']);
    } else {
      throw new Error('keypoints is invalid');
    }
    return [json['width'], json['height']];
  } catch (e) {
    console.error(e);
    alert('Invalid JSON');
  }
}

function addBackground() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.addEventListener('change', function (e) {
    const canvas = openpose_editor_canvas;
    const file = e.target.files[0];
    var fileReader = new FileReader();
    fileReader.onload = function () {
      var dataUri = this.result;
      canvas.setBackgroundImage(dataUri, canvas.renderAll.bind(canvas), {
        opacity: 0.5,
      });
      const img = new Image();
      img.onload = function () {
        resizeCanvas(this.width, this.height);
      };
      img.src = dataUri;
    };
    fileReader.readAsDataURL(file);
  });
  input.click();
  return;
}

function detectImage() {
  const input = gradioApp()
    .querySelector('#openpose_editor_input')
    .querySelector('input');
  input.accept = 'image/*';
  input.click();
  return;
}

function sendImage(type, index) {
  openpose_editor_canvas.getObjects('image').forEach((img) => {
    img.set({
      opacity: 0,
    });
  });
  if (openpose_editor_canvas.backgroundImage)
    openpose_editor_canvas.backgroundImage.opacity = 0;
  openpose_editor_canvas.discardActiveObject();
  openpose_editor_canvas.renderAll();
  openpose_editor_elem.toBlob((blob) => {
    const file = new File([blob], 'pose.png');
    const dt = new DataTransfer();
    dt.items.add(file);
    const list = dt.files;
    const selector =
      type === 'txt2img'
        ? '#txt2img_script_container'
        : '#img2img_script_container';
    if (type === 'txt2img') {
      switch_to_txt2img();
    } else if (type === 'img2img') {
      switch_to_img2img();
    }

    const accordion = gradioApp()
      .querySelector(selector)
      .querySelector('#controlnet .transition');
    if (accordion.classList.contains('rotate-90')) {
      accordion.click();
    }

    const tabs = gradioApp()
      .querySelector(selector)
      .querySelectorAll(
        '#controlnet > div:nth-child(2) > .tabs > .tabitem, #controlnet > div:nth-child(2) > div:not(.tabs)'
      );
    const tab = tabs[index];
    if (tab.classList.contains('tabitem')) {
      tab.parentElement.firstElementChild
        .querySelector(`:nth-child(${Number(index) + 1})`)
        .click();
    }
    const input = tab.querySelector("input[type='file']");
    try {
      input.previousElementSibling.previousElementSibling
        .querySelector("button[aria-label='Clear']")
        .click();
    } catch (e) {
      console.error(e);
    }
    input.value = '';
    input.files = list;
    const event = new Event('change', { bubbles: true, composed: true });
    input.dispatchEvent(event);
  });
  openpose_editor_canvas.getObjects('image').forEach((img) => {
    img.set({
      opacity: 1,
    });
  });
  if (openpose_editor_canvas.backgroundImage)
    openpose_editor_canvas.backgroundImage.opacity = 0.5;
  openpose_editor_canvas.renderAll();
}

window.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver((m) => {
    if (
      !executed_openpose_editor &&
      gradioApp().querySelector('#openpose_editor_canvas')
    ) {
      executed_openpose_editor = true;
      initCanvas(gradioApp().querySelector('#openpose_editor_canvas'));
      // gradioApp().querySelectorAll("#tabs > div > button").forEach((elem) => {
      //     if (elem.innerText === "OpenPose Editor") elem.click()
      // })
      observer.disconnect();
    }
  });
  observer.observe(gradioApp(), { childList: true, subtree: true });
});
