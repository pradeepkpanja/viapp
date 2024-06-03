const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");

myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: false,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectNewUser(userId, stream);
    });
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

let msg = $("input");
console.log(msg);

$("html").keydown((e) => {
  if (e.which == 13 && msg.val().length !== 0) {
    console.log(msg.val());
    socket.emit("message", msg.val());
    msg.val("");
  }
});

socket.on("createMessage", (message) => {
  $("ul").append(`<li class="message"><b>User</b></br>${message}</li></br>`);
  scrollToBottom();
});

const scrollToBottom = () => {
  let d = $(".main_chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

//mute function

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
};

const setMuteButton = () => {
  const html = `<i class="fa-solid fa-microphone"></i>
  <span>Mute</span>`;

  document.querySelector(".main_mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fa-solid fa-microphone-slash"></i>
  <span>Unmute</span>`;

  document.querySelector(".main_mute_button").innerHTML = html;
};

// Play or stop the video stream

const playStop = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    setStopVideo();
  }
};

const setPlayVideo = () => {
  const html = `<i class="stop fa-solid fa-video-slash"></i>
  <span>Play</span>`;

  document.querySelector(".main_video_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `<i class=" fa-solid fa-video"></i>
  <span>Stop Video</span>`;

  document.querySelector(".main_video_button").innerHTML = html;
};
