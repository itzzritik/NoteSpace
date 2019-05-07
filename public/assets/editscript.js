const token = (window.location.pathname).substring(1,(window.location.pathname).length);

require.config({ paths: { 'vs': 'monaco-editor/min/vs' }});
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
