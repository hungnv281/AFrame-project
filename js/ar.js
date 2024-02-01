function checkDeviceType() {
  const screenWidth = window.innerWidth;

  if (screenWidth < 768) {
      return "mobile";
  } else if (screenWidth >= 768 && screenWidth < 1024) {
      return "tablet";
  }
}


function closeGuide() {
  var guideContainer = document.querySelector(".guide-container");
  guideContainer.style.display = "none";
}

AFRAME.registerComponent("gesture-handler", {
  schema: {
    enabled: { default: true },
    rotationFactor: { default: 5 },
    minScale: { default: 0.3 },
    maxScale: { default: 8 },
  },

  init: function () {
    this.handleScale = this.handleScale.bind(this);
    this.handleRotation = this.handleRotation.bind(this);

    this.isVisible = false;
    this.initialScale = this.el.object3D.scale.clone();
    this.scaleFactor = 1;

    this.el.sceneEl.addEventListener("markerFound", (e) => {
    alert("Pleaseeeeeee");
      
      this.isVisible = true;
    });

    this.el.sceneEl.addEventListener("markerLost", (e) => {
      this.isVisible = false;
    });
  },

  update: function () {
    if (this.data.enabled) {
      this.el.sceneEl.addEventListener("onefingermove", this.handleRotation);
      this.el.sceneEl.addEventListener("twofingermove", this.handleScale);
    } else {
      this.el.sceneEl.removeEventListener("onefingermove", this.handleRotation);
      this.el.sceneEl.removeEventListener("twofingermove", this.handleScale);
    }
  },

  remove: function () {
    this.el.sceneEl.removeEventListener("onefingermove", this.handleRotation);
    this.el.sceneEl.removeEventListener("twofingermove", this.handleScale);
  },

  handleRotation: function (event) {
    if (this.isVisible) {
      this.el.object3D.rotation.y += event.detail.positionChange.x * this.data.rotationFactor;
      this.el.object3D.rotation.x += event.detail.positionChange.y * this.data.rotationFactor;
    }
  },

  handleScale: function (event) {
    if (this.isVisible) {
      this.scaleFactor *= 1 + event.detail.spreadChange / event.detail.startSpread;

      this.scaleFactor = Math.min(
        Math.max(this.scaleFactor, this.data.minScale),
        this.data.maxScale
      );

      this.el.object3D.scale.x = this.scaleFactor * this.initialScale.x;
      this.el.object3D.scale.y = this.scaleFactor * this.initialScale.y;
      this.el.object3D.scale.z = this.scaleFactor * this.initialScale.z;
    }
  },
});

// Component that detects and emits events for touch gestures

AFRAME.registerComponent("gesture-detector", {
  schema: {
    element: { default: "" },
  },

  init: function () {
    this.targetElement = this.data.element && document.querySelector(this.data.element);

    if (!this.targetElement) {
      this.targetElement = this.el;
    }

    this.internalState = {
      previousState: null,
    };

    this.emitGestureEvent = this.emitGestureEvent.bind(this);

    this.targetElement.addEventListener("touchstart", this.emitGestureEvent);

    this.targetElement.addEventListener("touchend", this.emitGestureEvent);

    this.targetElement.addEventListener("touchmove", this.emitGestureEvent);
  },

  remove: function () {
    this.targetElement.removeEventListener("touchstart", this.emitGestureEvent);

    this.targetElement.removeEventListener("touchend", this.emitGestureEvent);

    this.targetElement.removeEventListener("touchmove", this.emitGestureEvent);
  },

  emitGestureEvent(event) {
    const currentState = this.getTouchState(event);

    const previousState = this.internalState.previousState;

    const gestureContinues =
      previousState && currentState && currentState.touchCount == previousState.touchCount;

    const gestureEnded = previousState && !gestureContinues;

    const gestureStarted = currentState && !gestureContinues;

    if (gestureEnded) {
      const eventName = this.getEventPrefix(previousState.touchCount) + "fingerend";

      this.el.emit(eventName, previousState);

      this.internalState.previousState = null;
    }

    if (gestureStarted) {
      currentState.startTime = performance.now();

      currentState.startPosition = currentState.position;

      currentState.startSpread = currentState.spread;

      const eventName = this.getEventPrefix(currentState.touchCount) + "fingerstart";

      this.el.emit(eventName, currentState);

      this.internalState.previousState = currentState;
    }

    if (gestureContinues) {
      const eventDetail = {
        positionChange: {
          x: currentState.position.x - previousState.position.x,

          y: currentState.position.y - previousState.position.y,
        },
      };

      if (currentState.spread) {
        eventDetail.spreadChange = currentState.spread - previousState.spread;
      }

      // Update state with new data

      Object.assign(previousState, currentState);

      // Add state data to event detail

      Object.assign(eventDetail, previousState);

      const eventName = this.getEventPrefix(currentState.touchCount) + "fingermove";

      this.el.emit(eventName, eventDetail);
    }
  },

  getTouchState: function (event) {
    if (event.touches.length === 0) {
      return null;
    }

    // Convert event.touches to an array so we can use reduce

    const touchList = [];

    for (let i = 0; i < event.touches.length; i++) {
      touchList.push(event.touches[i]);
    }

    const touchState = {
      touchCount: touchList.length,
    };

    // Calculate center of all current touches

    const centerPositionRawX =
      touchList.reduce((sum, touch) => sum + touch.clientX, 0) / touchList.length;

    const centerPositionRawY =
      touchList.reduce((sum, touch) => sum + touch.clientY, 0) / touchList.length;

    touchState.positionRaw = { x: centerPositionRawX, y: centerPositionRawY };

    // Scale touch position and spread by average of window dimensions

    const screenScale = 2 / (window.innerWidth + window.innerHeight);

    touchState.position = {
      x: centerPositionRawX * screenScale,
      y: centerPositionRawY * screenScale,
    };

    // Calculate average spread of touches from the center point

    if (touchList.length >= 2) {
      const spread =
        touchList.reduce((sum, touch) => {
          return (
            sum +
            Math.sqrt(
              Math.pow(centerPositionRawX - touch.clientX, 2) +
                Math.pow(centerPositionRawY - touch.clientY, 2)
            )
          );
        }, 0) / touchList.length;

      touchState.spread = spread * screenScale;
    }

    return touchState;
  },

  getEventPrefix(touchCount) {
    const numberNames = ["one", "two", "three", "many"];

    return numberNames[Math.min(touchCount, 4) - 1];
  },
});

const listDataQRcode = [
  {
    id: 1,
    data: "sanh-c1",
    title: "Sanh C1",
    type: "image",
    url: "./asset/image/Toa-nha_C1.png",
    sound: "",
    text: "Tòa nhà C1 Bách Khoa là một tòa nhà nằm tại trường Đại học Bách Khoa Hà Nội, Việt Nam. Tòa nhà này có nhiều tầng và được sử dụng cho các hoạt động giảng dạy, nghiên cứu và hành chính của trường. Đây là một trong những tòa nhà quan trọng và đặc biệt của trường Đại học Bách Khoa Hà Nội.",
    scale: checkDeviceType() === 'mobile' ? "0.12 0.12 0.12" : "0.2 0.2 0.2",
    position: checkDeviceType() === 'mobile' ? "-1.4 0.3 -5" : "-1.4 0.3 -5",
  }
]
const popupText = document.querySelector("#popup");
const spanPopupText = document.querySelector("#popup-text");
const titlePopupText = document.querySelector(".title-popup-text");
function openPopupText(data) {
  const modelDescribe = document.querySelector("#a-entity-describe");
  const textModel = document.querySelector("#a-text");
  spanPopupText.innerHTML = data?.text || "";
  titlePopupText.innerHTML = data?.title || "";
  popupText.style.display = "block";
  if (modelDescribe) {
    modelDescribe.style.display = "none";
  }
  if (textModel) {
    textModel.style.display = "none";
  }
}

function closePopupText() {
  const modelDescribe = document.querySelector("#a-entity-describe");
  const textModel = document.querySelector("#a-text");
  spanPopupText.innerHTML = "";
  titlePopupText.innerHTML = "";
  popupText.style.display = "none";
  if (modelDescribe) {
    modelDescribe.style.display = "block";
  }
  if (textModel) {
    textModel.style.display = "block";
  }
}

const popupModel = document.querySelector("#popup-model-view");
const modelViewer = document.querySelector("#viewmodel");
const titlePopupModel = document.querySelector(".title-popup-model");
function openPopupModel(data) {
  const model = document.querySelector("#a-entity");
  modelViewer.src = data.src;
  titlePopupModel.innerHTML = data.title;
  popupModel.style.display = "block";
  if (model) {
    model.style.display = "none";
  }
}

function closePopupModel() {
  const model = document.querySelector("#a-entity");
  modelViewer.src = "";
  titlePopupModel.innerHTML = "";
  popupModel.style.display = "none";
  if (model) {
    model.style.display = "block";
  }
}

// Get dom a-scene
const scene = document.querySelector("#scene");

const video = document.createElement("video");
const canvasElement = document.getElementById("canvas-video");
const canvas = canvasElement.getContext("2d");

function drawLine(begin, end) {
  canvas.beginPath();
  canvas.moveTo(begin.x, begin.y);
  canvas.lineTo(end.x, end.y);
  canvas.lineWidth = 3;
  canvas.strokeStyle = "#4da6ff";
  canvas.stroke();
}

const showSpinner = (show) => {
  const spinner = document.querySelector(".spinner");
  if (show) spinner.style.display = "block";
  else spinner.style.display = "none";
};

function scanQRCode() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvasElement.hidden = false;
    canvasElement.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
    var code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    if (code) {
      drawLine(code.location.topLeftCorner, code.location.topRightCorner);
      drawLine(code.location.topRightCorner, code.location.bottomRightCorner);
      drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner);
      drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner);
      if (code?.data) {
        fetchDataFromAPI(code?.data)
          .then((data) => {
            // Handle show model, img, video
            displayContent(data);
          })
          .catch((error) => {
            console.error(error);
            showSpinner(false);
          });
      }
    }
  }
  requestAnimationFrame(scanQRCode);
}

// Call API => Get data model
function fetchDataFromAPI(qrData) {
  showSpinner(true);
  const data = listDataQRcode.find((item) => item.data === qrData);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(data);
    }, 500);
  });
}

let timeShow;

// Show content model based on data QRcode
function displayContent(data) {
  clearTimeout(timeShow);
  const model = document.querySelector("#a-entity");
  const gltfModel = model?.getAttribute("gltf-model") || null;
  const modelDescribe = document.querySelector("#a-entity-describe");
  const video = document.querySelector("#a-video");
  const image = document.querySelector("#a-img");
  const text = document.querySelector("#a-text");
  const canvas = document.querySelector(".group-canvas");
  if (data?.type === "model" && gltfModel != data?.url) {
    // Remove old model
    model && model.remove();
    modelDescribe && modelDescribe.remove();
    // Create model 3D
    const modelEntity = document.createElement("a-entity");
    modelEntity && modelEntity.setAttribute("id", "a-entity");
    modelEntity && modelEntity.setAttribute("gltf-model", `${data?.url}`);
    modelEntity && modelEntity.setAttribute(
      "animation",
      "property: rotation; from: 0 0 0; to: 0 360 0; loop: true; dur: 15000; easing: linear"
    );
    modelEntity && modelEntity.setAttribute("scale", `${data?.scale}`);
    modelEntity && modelEntity.setAttribute("position", "0 0 5"); //
    modelEntity && modelEntity.setAttribute("rotation", "0 0 0");
    modelEntity && modelEntity.setAttribute("visible", "true");
    modelEntity && modelEntity.setAttribute("gesture-handler", "minScale: 0.25; maxScale: 10");
    modelEntity && modelEntity.setAttribute("sound", `src: url(${data?.sound}); autoplay: true; loop: true;`);
    // modelEntity.addEventListener("click", function () {
    //   alert(123123);
    //   openPopupModel(data);
    // });

    const lightElement = document.createElement("a-light");
    lightElement.setAttribute("type", "point");
    lightElement.setAttribute("color", "#ffffff");
    lightElement.setAttribute("intensity", "3");
    lightElement.setAttribute("distance", "20");

    const aNft = document.createElement("a-nft");
    aNft.setAttribute("type", "nft");
    aNft.setAttribute("url",`${data?.urlCheck}`);
    aNft.setAttribute("smooth", "true");
    aNft.setAttribute("smoothTolerance", "0.01");
    aNft.setAttribute("smoothThreshold", "5");
    aNft.setAttribute("smoothCount", "10");
    aNft.setAttribute("raycaster", "objects: .clickable");
    aNft.setAttribute("emitevents", "true");
    aNft.setAttribute("cursor", "fuse: false; rayOrigin: mouse;");



      modelEntity && aNft.appendChild(modelEntity);
      scene.appendChild(aNft);
      console.log("🚀 ~ file: ar.js:466 ~ displayContent ~ scene:", scene, modelEntity.getAttribute("url"))
    // scene.appendChild(modelEntity);

    scene.appendChild(lightElement);

    // Describe of model

  } else if (data?.type === "image" && !image) {
    // Image
    const imageEntity = document.createElement("img");
    imageEntity.setAttribute("id", "a-img");
    imageEntity.setAttribute("src", data.url);
    imageEntity.setAttribute("alt", "image");
    imageEntity.setAttribute("class", "image-describe");

    canvas.appendChild(imageEntity);
    model && model.remove();
    video && video.remove();
    text && text.remove();
    modelDescribe && modelDescribe.remove();
  } else if (data?.type === "video" && !video) {
    const video = document.createElement("video");
    video.setAttribute("id", "a-video");
    video.setAttribute("controls", "");
    video.setAttribute("poster", "./asset/image/thumbnail.png");

    const source = document.createElement("source");
    source.setAttribute("src", data?.url);
    source.setAttribute("type", "video/mp4");

    video.appendChild(source);
    canvas.appendChild(video);

    model && model.remove();
    image && image.remove();
    text && text.remove();
    modelDescribe && modelDescribe.remove();
  } else if (data?.type === "text" && !text) {
    // Text description
    const textEntity = document.createElement("div");
    textEntity.setAttribute("id", "a-text");
    textEntity.setAttribute("class", "text-description");
    textEntity.innerHTML = data?.text || "";
    textEntity.addEventListener("click", function () {
      openPopupText(data);
    });

    canvas.appendChild(textEntity);
    if (textEntity.textContent.length > 250) {
      var trimmedText = textEntity.textContent.slice(0, 250) + "...";
      textEntity.textContent = trimmedText;
    }

    model && model.remove();
    image && image.remove();
    video && video.remove();
    modelDescribe && modelDescribe.remove();
 
  }

  if (data?.text) {
    const divElement = document.createElement("div");
    divElement.id = "a-entity-describe";
    divElement.classList.add("text-description-model");

    const title = document.createElement("div");
    title.classList.add("title-describe");
    title.innerHTML = data?.title || "";

    const content = document.createElement("div");
    content.classList.add("content-describe");
    content.innerHTML = data?.text || "";

    divElement.appendChild(title);
    divElement.appendChild(content);

    if (content.textContent.length > 150) {
      var trimmedText = content.textContent.slice(0, 150) + "...";
      content.textContent = trimmedText;
    }
    divElement.addEventListener("click", function () {
      openPopupText(data);
    });

    canvas.appendChild(divElement);
  }

  video && video.remove();
  image && image.remove();
  text && text.remove();
  // Remote all after 5s don't scan QR
  timeShow = setTimeout(() => {
    model && model.remove();
    video && video.remove();
    image && image.remove();
    text && text.remove();
    modelDescribe && modelDescribe.remove();
  }, 50000);
  showSpinner(false);
}

function initVideoStream() {
  // Check if the user has interacted with the site
  document.addEventListener("click", startVideoPlayback);
  document.addEventListener("touchstart", startVideoPlayback);
}

function startVideoPlayback() {
  // Remove interactive events and start playing video
  document.removeEventListener("click", startVideoPlayback);
  document.removeEventListener("touchstart", startVideoPlayback);

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then(function (stream) {
      video.srcObject = stream;
      video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
      video.play();

      requestAnimationFrame(scanQRCode);
    });
}

initVideoStream();

/* global AFRAME, THREE */
