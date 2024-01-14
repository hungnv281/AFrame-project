console.log("Initial ====>llllll");
document.addEventListener("DOMContentLoaded", () => {
  const images360 = ["bk_gate", "sanh-c1", "sanh-c1-c2","love_street","library"];
  let isInVRMode = false;
  let isOpenSidebar = true;
  let isPauseRotation = true;

  const rooms = document.querySelectorAll(".room");
  const mainSky = document.querySelector("#main-sky");
  const mainScene = document.querySelector("#main-scene");
  const roomTitle = document.querySelector(".room-title");
  const btnControlSidebar = document.querySelector(".btn-menu");
  const sidebar = document.querySelector(".sidebar");
  const btnPause = document.querySelector(".btn-pause");
  const vrCamera = document.querySelector("#vr-camera");
  const laserPointer = document.querySelector("#laser");
  const btnsNextRoom = document.querySelectorAll(".next-room");
  const btnsPreviousRoom = document.querySelectorAll(".previous-room");

  // Videos
  const video22 = document.querySelector("#intro_video");
  const videoControls = document.querySelector(".videoControl");

  // Audios
  const audio1MainDOM = document.querySelector("#audio-main");
  const audio2MainDOM = document.querySelector("#audio-seconds");
  const controlAudioDOM = document.querySelector("#control-audio");

  const browserUi = document.querySelector(".browser-ui");
  const containerLoading = document.querySelector(".container-loading");

  browserUi.style.display = "block";
  // containerLoading.style.display = "none";
  mainScene.setAttribute("visible", true);

  // Remove className focus for room
  const removeFocusRoom = () => {
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].className.includes("focus")) {
        rooms[i].classList.remove("focus");
        break;
      }
    }
  };

  // Add focus room
  const addFocusRoom = (roomIndex) => {
    for (let i = 0; i < rooms.length; i++) {
      if (i === roomIndex) {
        rooms[i].classList.add("focus");
        break;
      }
    }
  };

  // Handle event click room
  const clickRoom = (event, roomIndex) => {
    roomTitle.innerHTML = event.target.textContent;
    console.log('123123',roomTitle);
    mainSky.setAttribute("src", `#${images360[roomIndex]}`);
    removeFocusRoom();
    addFocusRoom(roomIndex);
  };

  // Handle event Pause or Play rotation 360 Image
  const clickBtnPause = () => {
    if (isPauseRotation) {
      vrCamera.setAttribute("animation", "property: rotation; to: 0 360 0; loop: true; dur: infinite");
    } else {
      const { x, y, z } = vrCamera.getAttribute("rotation");
      vrCamera.removeAttribute("animation");
      vrCamera.setAttribute("rotation", `${x} ${y} ${z}`);
    }
    isPauseRotation = !isPauseRotation;
    btnPause.textContent = isPauseRotation ? "Play" : "Pause";
  };

  // Control sidebar
  const clickControlSidebar = () => {
    if (isOpenSidebar) {
      sidebar.style.left = "-220px";
      btnControlSidebar.textContent = "Show";
    } else {
      sidebar.style.left = 0;
      btnControlSidebar.textContent = "Hidden";
    }
    isOpenSidebar = !isOpenSidebar;
  };

  // Detect onClick room on sidebar
  rooms.forEach((room, roomIndex) => {
    room.addEventListener("click", (event) => clickRoom(event, roomIndex));
  });

  btnPause.addEventListener("click", clickBtnPause);
  btnControlSidebar.addEventListener("click", clickControlSidebar);

  // Detech when select VR mode
  document.querySelector("a-scene").addEventListener("enter-vr", function () {
    isInVRMode = true;
    const popupsForRoom = document.querySelectorAll(`.content`);
    popupsForRoom.forEach((popupForRoom, roomIndex) => {
      const scaleValue = popupForRoom.getAttribute("scale");
      // popupForRoom.setAttribute(
      //   "scale",
      //   `${scaleValue.x / 1.25} ${scaleValue.y / 1.25} ${scaleValue.z / 1.25}`
      // );
    });
  });

  // Detech when exit VR mode
  document.querySelector("a-scene").addEventListener("exit-vr", function () {
    isInVRMode = false;
    const popupsForRoom = document.querySelectorAll(`.content`);
    popupsForRoom.forEach((popupForRoom, roomIndex) => {
      const scaleValue = popupForRoom.getAttribute("scale");
      popupForRoom.setAttribute(
        "scale",
        `${scaleValue.x * 1.25} ${scaleValue.y * 1.25} ${scaleValue.z * 1.25}`
      );
    });
  });

  vrCamera.addEventListener("onChange", function (event) {
    console.log("------------", event.target.value);
  });

  // Handle laser pointer scan item
  const handleLaserPointer = (event) => {
    var intersectedElement = event.detail.els[0];
    console.log("Laser pointer intersects with an object:", intersectedElement);
    if (intersectedElement.classList.contains("intersectable")) {
      const roomId = intersectedElement?.getAttribute("value");
      mainSky.setAttribute("src", `#${roomId}`);
    }
  };
  // Xử lý ẩn các items ngoài room đang được load
  const handleHideItemsOtherRoomId = (roomId) => {
    for (let i = 0; i < images360.length; i++) {
      if (roomId !== images360[i]) {
        const parentItem = document.querySelector(`#items-${images360[i]}`);
        parentItem?.setAttribute("visible", false);
        const childItems = parentItem?.querySelectorAll(".item");
        // popup
        const parentPopup = document.querySelector(`.content-${images360[i]}`);
        parentPopup?.setAttribute("visible", false);
        const iconClose = parentPopup?.querySelector(`.close-popup-${images360[i]}`);
        iconClose?.classList.remove("intersectable");
        iconClose?.classList.remove("clickable");
        // Gỡ va chạm khi các items được ẩn
        for (let j = 0; j < childItems?.length; j++) {
          childItems[j].classList.remove("intersectable");
          childItems[j].classList.remove("clickable");
        }
      }
    }
  };
  // Xử lý hiển thị các items của room đang được load
  const handleShowUiFollowRoomId = (roomId) => {
    if (roomId) {
      const parentItem = document.querySelector(`#items-${roomId}`);
      parentItem.setAttribute("visible", true);
      const childItems = parentItem?.querySelectorAll(".item");
      // popup
      const parentPopup = document.querySelector(`.content-${roomId}`);
      const iconClose = parentPopup?.querySelector(`.close-popup-${roomId}`);
      iconClose.classList.add("intersectable");
      iconClose.classList.add("clickable");
      // Thêm va chạm khi các items hiển thị ra
      for (let j = 0; j < childItems?.length; j++) {
        childItems[j].classList.add("intersectable");
        childItems[j].classList.add("clickable");
      }
    }
  };
  // Func xử lý lúc đầu khi image 360 được load lên
  document.querySelector("#main-sky").addEventListener("materialtextureloaded", function (event) {
    if (event.detail?.src?.id) {
      const roomId = event.detail.src.id;
      handleHideItemsOtherRoomId(roomId);
      handleShowUiFollowRoomId(roomId);
      // Pause audio when load main sky
      audio1MainDOM.components.sound.pauseSound();
      audio2MainDOM.components.sound.pauseSound();
      controlAudioDOM.textContent = "Play Audio";
      playing = false;
    }
  });

  images360.forEach((inforRoom) => {
    document.querySelector(`#infor-${inforRoom}`)?.addEventListener("click", () => {
      const contentRoom = document.querySelector(`.content-${inforRoom}`);
      if (inforRoom !== "bk_gate") {
        const camRotation = vrCamera.getAttribute("rotation");
        contentRoom.setAttribute("rotation", `0 ${camRotation.y} 0`);
      }

      contentRoom?.setAttribute("visible", !contentRoom.getAttribute("visible"));
    });
    // close popup
    document.querySelector(`.close-popup-${inforRoom}`)?.addEventListener("click", () => {
      const popupForRoom = document.querySelector(`.content-${inforRoom}`);
      popupForRoom?.setAttribute("visible", false);
      // cheat Gajasimha
      if (inforRoom === "sanh-c1") {
        const aText = popupForRoom.querySelector(".aText");
        const aImage = popupForRoom.querySelector(".aImage");
        aText.setAttribute(
          "value",
          "Tòa nhà C1 Bách Khoa là một tòa nhà nằm tại trường Đại học Bách Khoa Hà Nội, Việt Nam. Tòa nhà này có nhiều tầng và được sử dụng cho các hoạt động giảng dạy, nghiên cứu và hành chính của trường. Đây là một trong những tòa nhà quan trọng và đặc biệt của trường Đại học Bách Khoa Hà Nội."
        );
        aImage.setAttribute("src", "../asset/image/Toa-nha_C1.png");
      }
      if (inforRoom === "bk_gate") {
        handlePauseVideo();
        video22.currentTime = 0;
      }
    });
  });

  document.querySelector(`.close-popup-sanh-c1-new`)?.addEventListener("click", () => {
    const popupForRoom = document.querySelector(`.content-sanh-c1-new`);
    popupForRoom?.setAttribute("visible", false);
  });

  // cheat Gajasimha
  document.querySelector("#infor-sanh-c1-new").addEventListener("click", () => {
    const content = document.querySelector(".content-sanh-c1-new");
    const aText = content.querySelector(".aText");
    const aImage = content.querySelector(".aImage");
    const camRotation = vrCamera.getAttribute("rotation");
    content.setAttribute("rotation", `0 ${camRotation.y} 0`);

    // content.setAttribute("rotation", "0 -100 0");
    aText.setAttribute(
      "value",
      "Tòa nhà C1 Bách Khoa là một tòa nhà nằm tại trường Đại học Bách Khoa Hà Nội, Việt Nam. Tòa nhà này có nhiều tầng và được sử dụng cho các hoạt động giảng dạy, nghiên cứu và hành chính của trường. Đây là một trong những tòa nhà quan trọng và đặc biệt của trường Đại học Bách Khoa Hà Nội."
    );
    aImage.setAttribute("src", "../asset/image/Toa-nha_C1.png");
    if (content.getAttribute("visible")) {
      aText.setAttribute(
        "value",
        "Tòa nhà C1 Bách Khoa là một tòa nhà nằm tại trường Đại học Bách Khoa Hà Nội, Việt Nam. Tòa nhà này có nhiều tầng và được sử dụng cho các hoạt động giảng dạy, nghiên cứu và hành chính của trường. Đây là một trong những tòa nhà quan trọng và đặc biệt của trường Đại học Bách Khoa Hà Nội."
      );
      aImage.setAttribute("src", "../asset/image/Toa-nha_C1.png");
    }
    content.setAttribute("visible", !content.getAttribute("visible"));
  });

  document.querySelector("#infor-sanh-c1-model").addEventListener("click", () => {
    const content = document.querySelector(".content-sanh-c1-model");
    content.setAttribute("visible", !content.getAttribute("visible"));
  });

  document.querySelector(`.close-popup-sanh-c1-model`)?.addEventListener("click", () => {
    const popupForRoom = document.querySelector(`.content-sanh-c1-model`);
    popupForRoom?.setAttribute("visible", false);
  });

  const handleClickNextRoom = (_, currentIndexRoom) => {
    const indexSelected = currentIndexRoom + 1 === images360?.length ? 0 : currentIndexRoom + 1;
    roomTitle.innerHTML = rooms[indexSelected]?.textContent;
    mainSky.setAttribute("src", `#${images360[indexSelected]}`);
    removeFocusRoom();
    addFocusRoom(indexSelected);
    if (!video22.paused) {
      handlePauseVideo();
      video22.currentTime = 0;
    }
  };

  const handlePreviousRoom = (_, currentIndexRoom) => {
    const indexSelected = currentIndexRoom === 0 ? 2 : currentIndexRoom - 1;
    roomTitle.innerHTML = rooms[indexSelected]?.textContent;
    mainSky.setAttribute("src", `#${images360[indexSelected]}`);
    removeFocusRoom();
    addFocusRoom(indexSelected);
    if (!video22.paused) {
      handlePauseVideo();
      video22.currentTime = 0;
    }
  };

  btnsNextRoom.forEach((btnNext, roomIndex) => {
    btnNext.addEventListener("click", (event) => handleClickNextRoom(event, roomIndex));
  });

  btnsPreviousRoom.forEach((btnPrevious, roomIndex) => {
    btnPrevious.addEventListener("click", (event) => handlePreviousRoom(event, roomIndex));
  });

  // Xử lý video
  const handlePlayVideo = () => {
    video22?.play();
    videoControls.setAttribute("src", "#pause-button");
  };

  const handlePauseVideo = () => {
    video22.pause();
    videoControls.setAttribute("src", "#play-button");
  };

  videoControls?.addEventListener("click", function () {
    if (video22.paused) {
      handlePlayVideo();
    } else handlePauseVideo();
  });

  //Xử lý audio play and stop
  let playing = false;
  controlAudioDOM.addEventListener("click", function () {
    if (!playing) {
      if (roomTitle.innerHTML.includes("2-1")) {
        audio1MainDOM.components.sound.playSound();
      } else {
        audio2MainDOM.components.sound.playSound();
      }
      controlAudioDOM.textContent = "Stop Audio";
    } else {
      if (roomTitle.innerHTML.includes("2-1")) {
        audio1MainDOM.components.sound.pauseSound();
      } else {
        audio2MainDOM.components.sound.pauseSound();
      }
      controlAudioDOM.textContent = "Play Audio";
    }
    playing = !playing;
  });

  // Xử lý vạ chạm khi laser pointer của kính scan qua item được setting va chạm
  laserPointer.addEventListener("raycaster-intersection", handleLaserPointer);
});
