import socket from "./socket"
import { Presence } from "phoenix"
import "phoenix_html"
let channel = '';
let msg = document.getElementById('wbx_user_input');
let userType = document.getElementById('wbx_user_type');
let userName = document.getElementById('wbx_user_name');
let userClientName = document.getElementById('wbx_user_client_name');

let localRoom = document.getElementById('wbx_room_id');
let wvid = document.getElementById('wbx_wv_id');
let file_wmx = document.getElementById('file_wmx');
let images = ["JPEG", "JPG", "PNG", "GIF", "TIFF", "PSD", "PDF", "EPS", "AI", "INDD", "RAW"]
let audios = ["PCM", "WAV", "AIFF", "MP3", "AAC", "OGG", "WMA", "FLAC", "ALAC", "WMA"]
let files = ["DOC", "DOCX", "HTML", "HTM", "ODT", "PDF", "XLS", "XLSX", "ODS", "PPT", "PPTX", "TXT"]
let videos = ["WEBM", "MPG", "MP2", "MPEG", "MPE", "MPV", "MP4", "M4P", "M4V", "AVI", "WMV", "MOV", "QT", "FLV", "SWF", "AVCHD"]
let msgId = document.getElementById('messages');
let flag = false;
let serverUserAvaliable = false;
let unseenCount = {};
const typingTimeout = 2000;
var typingTimer;
let userTyping = false;
let isChatInitByClient = false;
let msgCount = 0;
let serverMsgCount = 0;
let chatQuestions = [];
let userDetails = '';
var serverMsgType = "";
// let totalmsgCount = 0;


var aSound = document.createElement('audio');
$(document).ready(function () {
  chatQuestionFun();
});


function chatQuestionFun() {
  window.localStorage.setItem('name', "");
  $.ajax({
    type: "GET",
    url: "http://192.168.43.238:8096/api/chat/" + localRoom.value,
    data: {
      wvid: wvid.value,
    },
    success: function (data) {
      chatQuestions = data.questions;
      if (data.user !== null && typeof data.user !== undefined && typeof data.user !== 'undefined') {
        userDetails = data.user;
        window.localStorage.setItem('vid', userDetails.id);
        window.localStorage.setItem('name', userDetails.name)
        window.localStorage.setItem('email', userDetails.email)
        // userName.value = userDetails.name;
        userClientName.value = userDetails.name;

      }
      joinChannel()
    },
    error: function (request, status, error) {
    }
  });
}



function joinChannel() {
  if (channel === '' && localRoom !== '') {
    channel = socket.channel('room:' + localRoom.value, { wvid: wvid.value, user_type: userType.value, user_name: userName.value });
    let presence = new Presence(channel)
    var unMsg = JSON.parse(window.window.localStorage.getItem("unseenCount"));
    if (typeof unMsg === undefined || unMsg === null || unMsg === 'null' || unMsg === 'undefined') {
      window.window.localStorage.setItem("unseenCount", JSON.stringify(unseenCount));
    }
    presence.onSync(() => renderOnlineUsers(presence))
    //presence.onSync(() => )

    // presence.onLeave((id, current, leftPres) => {
    //   if (current.metas.length === 0) {
    //     console.log("user has left from all devices", leftPres)
    //   } else {
    //     console.log("user left from a device", leftPres)
    //   }
    // })
    channel.join();
    channel.push('user:msgcount', { wvid: wvid.value, "room": localRoom.value }).receive(
      "ok", (reply) => { serverMsgCount = reply.count; }
    )
    aSound.setAttribute('src', 'https://chat.webmaxy.com:4040/js/beep.mp3');
    channel.push("ping", { wvid: wvid.value, "room": localRoom.value, "user_type": userType.value })
  }
  if (channel !== '' && !flag) {
    channel.on('shout', function (payload) {
      if (payload !== '') {
        if (payload.sent_by === 'SERVER') {
        }
        msgCount++;
        if (msgCount === 1) {
          if (payload.sent_by === 'CLIENT' && userDetails === '') {
            isChatInitByClient = true;
          }
        }
        let d1 = document.getElementById('to_loading');
        let d2 = document.getElementById('from_loading');
        d1.setAttribute("style", "display:none;");
        d2.setAttribute("style", "display:none;")
        let divMsg = "";
        let isFile = true;
        if (payload.msg_type === "TEXT") {
          divMsg = urlify(payload.message);
          isFile = false;
        } else if (payload.msg_type === 'IMAGES') {
          divMsg = getFiles(payload.message, 'IMAGES', '');
        } else if (payload.msg_type === 'AUDIO') {
          divMsg = getFiles(payload.message, 'AUDIO', '');
        } else if (payload.msg_type === 'DOCS') {
          divMsg = getFiles(payload.message, 'DOCS', payload.file_name);
        } else if (payload.msg_type === 'VIDEO') {
          divMsg = getFiles(payload.message, 'VIDEO', '');
        } else if (payload.msg_type === 'EMAIL') {
          serverMsgType = payload.msg_type;
          divMsg = urlify(payload.message);
          isFile = false;
        } else if (payload.msg_type === 'STRING') {
          divMsg = urlify(payload.message);
          isFile = false;
          //if (window.localStorage.getItem("name") === '') {
          serverMsgType = payload.msg_type;
          //}
        }

        var unMsg = JSON.parse(window.window.localStorage.getItem("unseenCount"));
        if (payload.wvid === wvid.value) {
          aSound.play();
          $('#unseen_message_' + payload.wvid).hide();
          unMsg[payload.wvid] = 0;
          window.window.localStorage.setItem("unseenCount", JSON.stringify(unMsg));
          if (payload.sent_by === "CLIENT") {
            $('#messages').append('<li class="reverse"><div class="chat-content">   <h5 style="text-align:right;">' + $('#wbx_user_client_name').val() + '</h5>   <div class="box bg-light-inverse">' + divMsg + '</div></div><div class="chat-img"><img src="https://apps.webmaxy.com/assets/images/users/5.jpg" alt="user"></div><div class="chat-time">' + moment(payload.time).subtract(new Date().getTimezoneOffset(), 'minutes').format("hh:mm a") + '</div></li>');
          } else {
            $('#messages').append('<li><div class="chat-img"><img src="https://apps.webmaxy.com/assets/images/users/2.jpg" alt="user"></div><div class="chat-content">    <h5>' + $('#wbx_user_name').val() + '</h5>    <div class="box bg-light-info">' + divMsg + '</div></div><div class="chat-time">' + moment(payload.time).subtract(new Date().getTimezoneOffset(), 'minutes').format("hh:mm a") + '</div></li>');
          }
          $('#last_msg_' + wvid.value).text(divMsg);
          if (userType.value !== 'SERVER') {
            let mag = payload.message;
            if (isFile) {
              mag = payload.file_name
            }
          }
          if (serverMsgCount < 2 && payload.sent_by === 'CLIENT' && userType.value === 'CLIENT') {
            sentServerMsg();
          }

        } else {
          if (userType.value === 'SERVER') {
            let li = document.getElementById(payload.wvid)
            $('#last_msg_' + payload.wvid).text(divMsg);
            if (unMsg[payload.wvid] === null || unMsg[payload.wvid] === 'null' || typeof unMsg[payload.wvid] === undefined || typeof unMsg[payload.wvid] === 'undefined') {
              unMsg[payload.wvid] = 1;
              $('#unseen_message_' + payload.wvid).text(1);
            } else {
              unMsg[payload.wvid] = unMsg[payload.wvid] + 1;
              $('#unseen_message_' + payload.wvid).text(unMsg[payload.wvid]);
            }
            window.window.localStorage.setItem("unseenCount", JSON.stringify(unMsg));
            $('#unseen_message_' + payload.wvid).show();
            // li.setAttribute("style", "background-color:#FF4440!important; color:#fff!important")
          }
        }
        setTimeout(() => {
          msgId.scrollTop = msgId.scrollHeight
        }, 100);
      }
    });
    flag = true;
  }
}



function sendmesg(type, msg1, file_name) {
  if (channel !== '') {
    if (serverMsgType === "EMAIL") {
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(msg1)) {
        alert("You have entered an invalid email address!")
        return (false)
      }
    }
    if (serverMsgType !== '' && window.localStorage.getItem('name') === '') {
      setUserDetail(msg1, function () {
        sendMsg(type, msg1, file_name)
      });
    } else {
      sendMsg(type, msg1, file_name)
    }
    sendPush(msg1);
    msg.value = '';
  }
}

function sendMsg(type, msg1, file_name) {
  channel.push('shout', {
    message: msg1,
    sent_by: userType.value,
    msg_type: type,
    is_read: "FALSE",
    room_id: localRoom.value,
    wvid: wvid.value,
    time: moment().add(new Date().getTimezoneOffset(), 'minutes'),
    file_name: file_name
  });
}



const sentServerMsg = function () {
  if (chatQuestions.length > 0) {
    var question = chatQuestions[serverMsgCount];
    sendmesgServer(question.type, question.question, 'TEXT')
    serverMsgCount++;
  }
}

function sendmesgServer(type, msg1, file_name) {
  if (channel !== '') {
    channel.push('shout', {
      message: msg1,
      sent_by: "SERVER",
      msg_type: type,
      is_read: "FALSE",
      room_id: localRoom.value,
      wvid: wvid.value,
      time: moment().add(new Date().getTimezoneOffset(), 'minutes'),
      file_name: file_name
    });
    // totalmsgCount++;
    //  sendPush(msg1);
    msg.value = '';
  }
}


let userList = [];
if (typeof msg !== undefined && msg !== null) {
  msg.addEventListener('keypress', function (event) {
    if (event.keyCode == 13 && msg.value.length > 0) {
      sendmesg("TEXT", msg.value, 'TEXT')
    }
  });
}
if (typeof file_wmx !== undefined && file_wmx !== null) {
  file_wmx.addEventListener('change', function () {
    var formData = new FormData();
    formData.append('image', $('#file_wmx')[0].files[0]);
    var fileType = $('#file_wmx').val().split('.').pop().toUpperCase();
    var msgType = '';
    if (videos.includes(fileType)) {
      msgType = 'VIDEO';
    } else if (files.includes(fileType)) {
      msgType = 'DOCS';
    } else if (audios.includes(fileType)) {
      msgType = 'AUDIO';
    } else if (images.includes(fileType)) {
      msgType = 'IMAGES';
    } else {
      alert("File not supported!");
      return false;
    }
    $('#wbx_img_chat').hide();
    $('.loader_wbx').show();
    $.ajax({
      type: "POST",
      url: 'https://apps.webmaxy.com/api/chat-image',
      crossDomain: true,
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        var data = JSON.parse(data);
        sendmesg(msgType, data.path, $("#file_wmx")[0].files[0].name)
        $('#wbx_img_chat').show();
        $('.loader_wbx').hide();
      },
      error: function (request, status, error) { }
    });
  })
}


const setUserDetail = function (msg, callback) {
  $.ajax({
    type: "POST",
    url: "http://192.168.43.238:8096/api/user",
    data: {
      type: serverMsgType,
      value: msg,
      wvid: wvid.value,
      app_id: localRoom.value,
      id: window.localStorage.getItem('vid')
    },
    success: function (data) {
      window.localStorage.setItem('vid', data.id)
      if (serverMsgType === 'STRING') {
        // userName.value=data.user.name
        window.localStorage.setItem('name', data.user.name)
        userClientName.value = data.user.name;
      } else {
        if (serverMsgType === 'EMAIL') {
          window.localStorage.setItem('email', data.user.email)
        }
      }

      if (serverMsgCount === 2) {
        serverMsgType = '';
      }
      callback();
    },
    error: function (request, status, error) {
    }
  });
}



if (typeof document.querySelector("#wbx_user_input") !== undefined && document.querySelector("#wbx_user_input") !== null) {
  document.querySelector("#wbx_user_input").addEventListener('keydown', () => {
    userStartsTyping()
    clearTimeout(typingTimer);
  })
}
if (typeof document.querySelector("#wbx_user_input") !== undefined && document.querySelector("#wbx_user_input") !== null) {
  document.querySelector("#wbx_user_input").addEventListener('keyup', () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(userStopsTyping, typingTimeout);
  })
}
const userStartsTyping = function () {
  if (userTyping) { return }
  userTyping = true
  channel.push('user:typing', { typing: true, wvid: wvid.value, 'sent_by': userType.value, "user_name": userName.value })
}
const userStopsTyping = function () {
  clearTimeout(typingTimer);
  userTyping = false
  channel.push('user:typing', { typing: false, wvid: wvid.value, 'sent_by': userType.value, "user_name": userName.value })
}




const sendPush = function (msg) {
  $.ajax({
    type: "POST",
    url: "http://192.168.43.238:8096/api/send-push",
    data: {
      msg: msg,
      wvid: wvid.value,
    },
    success: function (data) {

    },
    error: function (request, status, error) {
    }
  });
}



function urlify(text) {
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function (url) {
    return '<a href="' + url + '" target="_blank">' + url + '</a>';
  })
}


function getFiles(msg1, type, file) {
  if (type === 'IMAGES') {
    return '<img src="https://webmaxy.s3-us-west-1.amazonaws.com/chatimage/' + msg1 + '" style="width: 150px;height: 101px;">';
  } else if (type === 'AUDIO') {
    return '<audio controls  style="width: 100%;"><source src="https://webmaxy.s3-us-west-1.amazonaws.com/chatimage/' + msg1 + '"  type="audio/mpeg" style="width: 150px;height: 101px;"></audio>';
  } else if (type === 'DOCS') {
    return '<a href="https://webmaxy.s3-us-west-1.amazonaws.com/chatimage/' + msg1 + '" target="_blank">' + file + '</a>';
  } else if (type === 'VIDEO') {
    return '<video style="width: 100%;" controls><source src="https://webmaxy.s3-us-west-1.amazonaws.com/chatimage/' + msg1 + '" type="video/mp4" style="width: 150px;height: 101px;"></video>';
  }
}

function getEventTarget(e) {
  e = e || window.event;
  return e.srcElement;
}
var ul = document.getElementById('main_papa');
if (typeof ul !== undefined && ul !== null) {
  ul.onclick = function (event) {
    var target = getEventTarget(event);
    var id = target.parentNode.getAttribute("data-id");
    $('#wbx_wv_id').val(id);
    let li = document.getElementById(id)
    li.setAttribute("style", "background-color:#fff!important;color:#000!important")
    msgId.innerHTML = "";
    channel.push("ping", { "wvid": id, "room": localRoom.value, "user_type": userType.value })
    $('#chat_view').show();
  };
}
// close.addEventListener('click', function (event) {
//   // ul.innerHTML = "";
//   channel.leave();
//   channel = '';
//   // name.value = '';
//   msg.value = '';
//   localRoom.value = '';
//   flag = false;
// });
var liveUser = [];
function renderOnlineUsers(presence) {
  $('.profile-status').removeClass('online');
  var len = presence.list.length;
  var i = 0;
  presence.list((id, { metas: [first, ...rest] }) => {
    i++;
    $('#online_status_' + first.wvid).addClass('online');
    // setTimeout(() => {
    //   var q = timeDifference(first.online_at)
    //   console.log(q);
    //   $('#online_time_' + first.wvid).text(q);
    // }, 5000);



    if (userType.value === 'CLIENT' && first.user_type === 'SERVER') {
      serverUserAvaliable = true;
    }
    if (first.sent_by === 'CLIENT' && userType === 'CLIENT' && wvid.value === first.wvid) {
      $('#wbx_user_client_name').val(first.user_name);
    }
    if (i === len) {
      $('#wbx_user_name').val(first.user_name);
      if (serverUserAvaliable) {
        $('#online_message').show();
        $('#offline_message').hide();
        $('#online_server_status').attr("style", "background:#6fff15;border: 2px solid #6fff15;");
        $('#server_online_user').text(first.user_name);
      } else {
        $('#online_message').hide();
        $('#offline_message').show();
        $('#online_server_status').attr("style", "background:#ffa115;border: 2px solid #ffa115;")
        $('#server_online_user').text('');
      }
    }
    if (userList.indexOf(id) === -1) {
      userList.push(id);
      if (id !== '') {
        var unMsg = JSON.parse(window.window.localStorage.getItem("unseenCount"));
        if (typeof unMsg === undefined || unMsg === null || unMsg === 'null' || typeof unMsg === 'undefined') {
          unMsg = {};
          unMsg[id] = 0;
          window.window.localStorage.setItem("unseenCount", JSON.stringify(unMsg));
        } else {
          if (unMsg[id] === null || unMsg[id] === 'null' || typeof unMsg[id] === undefined || typeof unMsg[id] === 'undefined') {
            unMsg[id] = 0;
            window.window.localStorage.setItem("unseenCount", JSON.stringify(unMsg));
          }
        }
        setTimeout(() => {
          checkavailableUser(id);
        }, 1000);
      }
    } else {
      var ut = "to";
      if (userType.value === first.sent_by) {
        ut = "from";
      }
      if (first.typing && userType.value !== first.sent_by && wvid.value === first.wvid) {
        let d = document.getElementById(ut + '_loading')
        d.setAttribute("style", "display:block;")
      }
    }
  });
}

function timeDifference(previous) {

  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var elapsed = (new Date().getTime() / 1000) - previous;
  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + ' seconds ago';
  }
  else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago';
  }
  else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago';
  }
  else {
    return Math.round(elapsed / msPerHour) + ' hours  asd ago';
  }

  // else if (elapsed < msPerMonth) {
  //   return 'approximately ' + Math.round(elapsed / msPerDay) + ' days ago';
  // }

}

