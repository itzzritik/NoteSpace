var typingTimer,doneTypingInterval = 500;
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
        path: (window.location.pathname).substring(1,(window.location.pathname).length),
        value: "" + window.editor.getValue()
    }))
}

$('.menu-link').click(function (e) {
    e.preventDefault();
    $('.menu').toggleClass('open');
    $('.editor').toggleClass('open');
});

'use strict';
require.config({baseUrl: '/monaco-editor/min/'});
require(['vs/editor/editor.main'], function() {
    window.editor = monaco.editor.create(document.getElementById('container'), {
        value: "<%= value %>",
        language: 'javascript'
    });
});