var token = (window.location.pathname).substring(1,(window.location.pathname).length),
    tabColors = [],
    tabTitles = [],
    cssVar = window.getComputedStyle(document.body),
    menuOpen = false;
    currTab = null,
    titleVal = "";

function newColor(){
    var color;
    do{color=palette[Math.floor(Math.random() * (palette.length-1))];}
    while(color==tabColors[tabColors.length-1]);
    tabColors.push(color);
    return color;
}
$("body").get(0).style.setProperty("--new_tab_color", newColor());

require.config({ paths: { 'vs': 'lib/monaco-editor/min/vs' }});
window.editor = "";
require(['vs/editor/editor.main'], function() {
    window.editor = monaco.editor.create(document.getElementsByClassName('edit')[0], {
        value: "",
        language: 'java',
        minimap: { enabled: true },
        theme: "vs-dark"
    });
}); 

window.onresize = function (){
    window.editor.layout();
};
window.onload = function(){
    const http = new XMLHttpRequest();
    http.open('POST', '/getData');
    http.setRequestHeader('Content-type', 'application/json');
    http.onload = function() {
        if(http.responseText!=""){
            var data = JSON.parse(http.responseText);
            tabColors = data.colors;
            tabTitles = data.titles;
            updateUI();

            //window.editor.setValue(data[0].value);
        }
        else $('.newTab').click();
    };
    http.send(JSON.stringify({token: token}));
};

var typingTimer,doneTypingInterval = 1000;
$('.edit').on('keyup', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function(){
        $(".nav .ripple").toggleClass("animate");
        updateServer(function(){$(".nav .ripple").toggleClass("animate")});
    }, doneTypingInterval);
});
$('.edit').on('keydown', function () {
    clearTimeout(typingTimer);
});

$('.menu-link').click(function () {
    $('.menu').toggleClass('open');
    $('.editor').toggleClass('open');
    menuOpen = !menuOpen;
});

$('.newTab').click(function () {
    var tabTitle = title[Math.floor(Math.random() * (title.length-1))];
    pushNewTab(tabTitles.length, tabTitle);
    tabTitles.push(tabTitle);
    $("body").get(0).style.setProperty("--new_tab_color", newColor());
    if(tabTitles.length==1) $('.tabs').children().last().click();
});

$('.tabs').on('click', '.tabPane', function(e) {
    var card = $(this);
    if(currTab!=null && currTab!=card.attr('id')) {
        card.parent().find('#'+currTab).css("background-color","transparent");
        card.parent().find('#'+currTab).find('.tab').css("background-color","transparent");
        card.parent().find('#'+currTab).find('.title input').css("cursor","pointer");
    }
    currTab = card.attr('id');
    card.find('.tab').css("background-color",tabColors[card.attr('id')]);
    card.css("background-color","#3C3C3C");
    card.find('.title input').css("cursor","text");
    titleVal=card.find('.title input').val();
});

$('.tabs').on('keypress blur', '.title input', function(e) {
    var card = $(this).parent().parent(),
        keycode = (event.keyCode ? event.keyCode : event.which);
    if((e.type == "focusout" && titleVal!=$(this).val()) || (e.type == "keypress" && keycode == '13' && titleVal!=$(this).val())){
        if($(this).val()!=""){
            titleVal=$(this).val();
            tabTitles[currTab]=titleVal;
            card.find('.tab p').text(titleVal.charAt(0).toUpperCase());
        }
        else $(this).val(tabTitles[currTab]);
        card.find('.ripple').toggleClass("animate");
        updateServer(function(){card.find('.ripple').toggleClass("animate");});
        //setTimeout(function(){card.find('.ripple').toggleClass("animate")}, 400);
    }
});

$('.edit').focusin(function(){
    if(menuOpen)$('.menu-link').click();
});

function pushNewTab(i, title){
    var newTab =
        '<div class="tabPane" id="'+i+'">' +
        '<span class="ripple"></span>'+
        '<div class="title">'+
        '<input value="'+title+'">'+
        '</div> '+
        '<div class="tab">' +
        '<p>'+title.charAt(0).toUpperCase()+'</p>' +
        '</div> ' +
        '</div>';
    $('.tabs').append(newTab);

    var lastTab=$('.tabs').children().last();
    lastTab.css("height",cssVar.getPropertyValue('--nav_height'));
    lastTab=lastTab.find('.ripple');
    lastTab.css("background-color",tabColors[i]);
    //lastTab.toggleClass("animate");setTimeout(function(){lastTab.toggleClass("animate")}, 400);
}
function updateUI(){
    for(var i=0;i<tabTitles.length;i++)
        pushNewTab(i, tabTitles[i]);
    $('.tabs').children().first().click();
}
function updateServer(postfunction){
    const http = new XMLHttpRequest();
    http.open('POST', '/save');
    http.setRequestHeader('Content-type', 'application/json');
    http.onload = function () {
        postfunction();
    }
    http.send(JSON.stringify({
        notebook:{
            token: token,
            titles: tabTitles,
            colors: tabColors
        }
    }));
}