const token = (window.location.pathname).substring(1,(window.location.pathname).length),
    palette = ["#EF5350","#EC407A","#AB47BC","#7E57C2","#5C6BC0","#42A5F5","#29B6F6","#26C6DA","#26A69A","#66BB6A","#9CCC65","#D4E157","#FFEE58","#FFCA28","#FFA726","#FF7043","#8D6E63"];
var current;

function newColor(){return palette[Math.floor(Math.random() * palette.length-1)];}

$(".newTab").css("background-color",current=newColor());

require.config({ paths: { 'vs': 'monaco-editor/min/vs' }});
window.editor = "";
require(['vs/editor/editor.main'], function() {
    window.editor = monaco.editor.create(document.getElementsByClassName('edit')[0], {
        value: "",
        language: 'javascript',
        minimap: { enabled: true },
        theme: "vs-dark"
    });
}); 

window.onresize = function (){
    window.editor.layout();
};

var typingTimer,doneTypingInterval = 1000;
$('.edit').on('keyup', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
});
$('.edit').on('keydown', function () {
    clearTimeout(typingTimer);
});

function doneTyping() {
    $(".ripple").toggleClass("animate");
    const http = new XMLHttpRequest()
    http.open('POST', '/save')
    http.setRequestHeader('Content-type', 'application/json')
    http.onload = function () {
        console.log('done');
        $(".ripple").toggleClass("animate");
    }
    http.send(JSON.stringify({
        path: token,
        value: "" + window.editor.getValue()
    }))
}

$('.menu-link').click(function (e) {
    e.preventDefault();
    $('.menu').toggleClass('open');
    $('.editor').toggleClass('open');
});

const http = new XMLHttpRequest();
http.open('POST', '/getData');
http.setRequestHeader('Content-type', 'application/json');
http.onload = function() {
    var data = JSON.parse(http.responseText);
    window.editor.setValue(data[0].value);
};
http.send(JSON.stringify({token: token}));
