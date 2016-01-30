var message = $('#message')
var student_id = getCookie('student_id');
var token = getCookie('token')
var registered_list = []

message.html('자동 로그인 중입니다')

function auto_login(){
  if (student_id === '' || token === ''){
    message.html('로그인이 필요합니다')
    $('#login-section').show()
    $('#join-section').show()
    return
  }
  var params = {'student_id': student_id}
  $.ajax({
    beforeSend: function (xhr){
      xhr.setRequestHeader('x-user-token', token)
    },
    url: '/auto_login',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify(params),
    dataType: 'json',
  }).done(function (data){
    if (data.result){
      message.html('')
      $('#after-login').show()
      $('.student-id').html(student_id)
      get_user_info()
    } else {
      message.html('로그인이 필요합니다')
      $('#login-section').show()
      $('#join-section').show()
    }
  })
}
auto_login()

$("#login").click(function (){
  var student_id = $('#login-section input[name=student-id]').val()
  var password = $('#login-section input[name=password]').val()
  login(student_id, password);
});
function login(s, p){
  var pattern = /20[0-9]{2}-[12][0-9]{4}/;
  if (s === '' || p === '' || !pattern.test(s)){
    message.html('아이디와 비밀번호를 확인해주세요')
    return;
  }
  var params = {'student_id': s, 'password': p}
  $.ajax({
    url: '/login',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify(params),
    dataType: 'json',
  }).done(function(data){
    if (data.result){
      token = data.token
      student_id = s
      message.html('')
      $('#login-section').hide()
      $('#join-section').hide()
      $('#after-login').show()
      $('.student-id').html(student_id)
      setCookie('student_id', student_id, 7)
      setCookie('token', token, 7)
      get_user_info()
    } else {
      message.html('로그인에 실패했습니다')
    }
  })
}

$("#join").click(function (){
  var student_id = $('#join-section input[name=student-id]').val()
  var password = $('#join-section input[name=password]').val()
  var password_confirm = $('#join-section input[name=password-confirm]').val()
  join(student_id, password, password_confirm);
});
function join(s, p, c){
  var pattern = /20[0-9]{2}-[12][0-9]{4}/;
  if (s === '' || p === '' || p !== c || !pattern.test(s)){
    message.html('입력하신 정보를 확인해주세요')
    return;
  }
  var params = {'student_id': s, 'password': p}
  $.ajax({
    url: '/join',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify(params),
    dataType: 'json',
  }).done(function(data){
    if (data.result){
      message.html('회원가입에 성공하셨습니다')
      $('#login-section input[name=student-id]').val(s)
      $('.student-id').html(student_id)
    } else {
      message.html('회원가입에 실패하셨습니다 ' + data.message)
    }
  })
}

var socket = new WebSocketRails("ws://dev.wafflestudio.com:12000/websocket");
var chan = socket.subscribe('watch')
chan.bind('push', function(data){
  pushed(data.lecture_id)
})
function pushed(lecture_id){
  function inArray(id, list){
    var i;
    for (i = 0; i < list.length; i++)
      if (list[i] == id) return true
    return false
  }
  if (inArray(lecture_id, registered_list)){
    link = '<a href="http://sugang.snu.ac.kr/sugang/co/co012.action">수강신청 페이지로 가기</a>'
    sound = '<audio loop autoplay><source src="http://leeingnyo.me/repository/44f0f77e92596c0707bea55d1a079793cac50a28faa2b951c5adca0e37b0cb3e/wu.mp3" type="audio/mpeg"></audio>'
    message.html('자리가 비었습니다! ' + link + sound)
    $('#'+lecture_id).css('background', 'red')
    var a = setInterval(function(){alert('자리가 비었습니다!'); clearInterval(a)}, 1 * 1000)
  }
}

function get_user_info(){
  $.ajax({
    beforeSend: function (xhr){
      xhr.setRequestHeader('x-user-token', token)
    },
    url: '/users/' + student_id,
    type: 'get',
    dataType: 'json'
  }).done(function (data){
    var lectures = data.lectures
    var tbody = $('#registered-lectures tbody')
    registered_list = []
    index = 0
    tbody.html('')
    lectures.forEach(function (lecture, index){
      var tr = '<tr id="'+ lecture.id +'">'
        tr += '<td style="display: none;">'+ lecture.id +'</td>'
          registered_list[index++] = lecture.id
        tr += '<td>'+ lecture.subject_number + ' ' + lecture.lecture_number +'</td>'
        tr += '<td>'+ lecture.name +'</td>'
        tr += '<td>'+ lecture.lecturer +'</td>'
        tr += '<td>'+ lecture.time +'</td>'
        tr += '<td>'+ lecture.enrolled + ' / ' + lecture.whole_capacity +'</td>'
        tr += '<td>'+ lecture.competitors_number +'</td>'
        tr += '<td>'+ '<button class="unregister">해제</button>' +'</td>'
      tr += '</tr>'
      tbody.append(tr)
    })
    binding_on_registered_lectures()
  })
}

function binding_on_registered_lectures(){
  $('#registered-lectures tbody .unregister').click(function (){
    var lecture_id = $(this).parent().parent().children()[0].innerHTML
    unregister(lecture_id)
  })
}

function unregister(lecture_id){
  params = {'lecture_id': lecture_id}
  $.ajax({
    beforeSend: function (xhr){
      xhr.setRequestHeader('x-user-token', token)
    },
    url: '/users/' + student_id + '/unregister',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify(params),
    dataType: 'json',
  }).done(function (data){
      message.html('강의를 해제했습니다')
      get_user_info()
    if (data.result){
    } else {
      message.html('실패')
    }
  })
}

function register(lecture_id){
  params = {'lecture_id': lecture_id}
  $.ajax({
    beforeSend: function (xhr){
      xhr.setRequestHeader('x-user-token', token)
    },
    url: '/users/' + student_id + '/register',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify(params),
    dataType: 'json',
  }).done(function (data){
      message.html('강의를 등록했습니다')
      get_user_info()
    if (data.result){
    } else {
      message.html('실패')
    }
  })
}

$('#search-section button').click(function (){
  search()
})

function search(){
  message.html('')
  var q = $('input[name=query]').val()
  if (q === ""){
    message.html('검색어를 입력해주세요')
    return;
  }
  $.ajax({
    url: '/search?query=' + q,
    dataType: 'json',
  }).done(function (data){
    var lectures = data.lectures
    var tbody = $('#searched-lectures tbody')
    tbody.html('')
    lectures.forEach(function (lecture, index){
      var tr = '<tr>'
        tr += '<td style="display: none;">'+ lecture.id +'</td>'
        tr += '<td>'+ lecture.subject_number + ' ' + lecture.lecture_number +'</td>'
        tr += '<td>'+ lecture.name +'</td>'
        tr += '<td>'+ lecture.lecturer +'</td>'
        tr += '<td>'+ lecture.time +'</td>'
        tr += '<td>'+ lecture.enrolled + ' / ' + lecture.whole_capacity +'</td>'
        tr += '<td>'+ lecture.competitors_number +'</td>'
        tr += '<td>'
        if ($.inArray(lecture.id, registered_list) !== -1){
          // 등록되었으면
          tr += '<div class="reg">'
        } else {
          tr += '<div class="unreg">'
        }
          tr += '<button class="register">등록</button>'
          tr += '<button class="unregister">해제</button>'
          tr += '</div>'
        tr += '</td>'
        tr += '</tr>'
      tbody.append(tr)
    })
    binding_on_searched_lectures()
  })
}

function binding_on_searched_lectures(){
  $('#searched-lectures tbody .unregister').click(function (){
    var lecture_id = $(this).parent().parent().parent().children()[0].innerHTML
    $(this).parent().children().toggle()
    unregister(lecture_id)
  })
  $('#searched-lectures tbody .register').click(function (){
    var lecture_id = $(this).parent().parent().parent().children()[0].innerHTML
    $(this).parent().children().toggle()
    register(lecture_id)
  })
}

$('#logout').click(function (){
  setCookie('student_id', '', 0)
  setCookie('token', '', 0)
  message.html('로그아웃하셨습니다')
  token = ''
  student_id = ''
  $('#login-section').show()
  $('#join-section').show()
  $('#after-login').hide()
  $('input').val('')
})

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1);
      if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
  }
  return "";
}
