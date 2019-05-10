var token = (window.location.pathname).substring(1, (window.location.pathname).length),
    cssVar = window.getComputedStyle(document.body),
    tabIds = [],
    tabTitles = [],
    tabColors = [],
    tabTypes = [],
    tabContents = [],
    menuOpen = -1,
    currTab = null,
    newTabReady = true,
    hoverTabColor = null,
    titleVal = "",
    data = [],
    newData = [];

function newId(){
    var id;
    do{id=(Math.PI * Math.max(0.01, Math.random())).toString(36).substr(2, 5);}
    while(tabIds.indexOf(id) > -1);
    tabIds.push(id);
    return id;
}
function newColor(){
    var color;
    do{color=palette[Math.floor(Math.random() * (palette.length-1))];}
    while(color==tabColors[tabColors.length-1]);
    return color;
}
function newTitle(){
    var tabTitle;
    do{tabTitle=title[Math.floor(Math.random() * (title.length-1))];}
    while(tabTitles.indexOf(tabTitle) > -1);
    tabTitles.push(tabTitle);
    return tabTitle;
}

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
        data=http.responseText;
        if(data!=""){
            data = JSON.parse(data).notebook;
            console.log(JSON.stringify(data, null, 4));
            data.forEach(function (note) {
                tabIds.push(note.id);
                tabTitles.push(note.title);
                tabColors.push(note.color);
                tabTypes.push(note.type);
                tabContents.push(note.content);
            });
            $("body").get(0).style.setProperty("--new_tab_color", newColor());
            updateUI(true);
            //window.editor.setValue(data[0].value);
        }
        else {
            menuOpen = 0;
            $("body").get(0).style.setProperty("--new_tab_color", newColor());
            $('.newTab').click();
        }
    };
    http.send(JSON.stringify({token: token}));
};

var typingTimer,doneTypingInterval = 1000;
$(".edit").bind("propertychange change keyup input cut paste", function(event){
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function(){
        updateServer(function(){},currTab.find('.ripple'));
    }, doneTypingInterval);
});

$('.menu-link').click(function () {
    if(menuOpen != -1){
        $('.menu').toggleClass('open');
        $('.editor').toggleClass('open');
        menuOpen = +!menuOpen;
        $('.tab .delete').css('height',(parseInt(cssVar.getPropertyValue('--nav_height'),10)*menuOpen)+'px');
    }
});

$('.tabs').on('click', '.tabPane', function(e) {
    if(currTab!=null && currTab!=$(this)) {
        currTab.css("background-color","transparent");
        currTab.find('.tab').css("background-color","transparent");
        currTab.find('.title input').css("cursor","pointer");
    }
    currTab = $(this);
    $(this).find('.tab').css("background-color",$(this).find('.ripple').css('background-color'));
    $(this).css("background-color",cssVar.getPropertyValue('--nav_color'));
    $(this).find('.title input').css("cursor","text");
    titleVal=$(this).find('.title input').val();
});

$('.tabs').on('click', '.tab', function (e) {
    if (menuOpen == 1) {
        e.stopPropagation();
        var card = $(this).parent();
        tabTitles.splice(card.attr('id'), 1);
        tabColors.splice(card.attr('id'), 1);
        card.css("height", '0');
        setTimeout(function () {
            card.remove();
            updateIDs(0);
        }, 260);
    }
});

$(".tabs").on({
    mouseenter: function () {
        if(menuOpen==1){
            $(this).find('.delete').css('opacity', '1');
            $(this).find('.delete').css('border-radius', (parseInt(cssVar.getPropertyValue('--nav_height'),10)/2)+'px');
            $(this).find('.delete').css('transform', 'scale(0.8)');
            hoverTabColor=$(this).css('background-color');
            $(this).css('background-color', $(this).parent().css('background-color'));
        }
    },
    mouseleave: function () {
        if (menuOpen == 1) {
            $(this).find('.delete').css('opacity', '0');
            $(this).find('.delete').css('border-radius', '0');
            $(this).find('.delete').css('transform', 'scale(1)');
            $(this).css('background-color', hoverTabColor);
        }
    }
},'.tab');

$('.tabs').on('keypress blur', '.title input', function(e) {
    var card = $(this).parent().parent(),
        keycode = (event.keyCode ? event.keyCode : event.which);
        $(this).val($(this).val().trim());
    if((e.type == "focusout" || (e.type == "keypress" && keycode == '13')) && titleVal!=$(this).val() && tabTitles.indexOf($(this).val())==-1){
        if($(this).val()!=""){
            titleVal=$(this).val();
            tabTitles[tabIds.indexOf(currTab.attr('id'))]=titleVal;
            card.find('.tab p').text(titleVal.charAt(0).toUpperCase());
            newData.push({
                id: currTab.attr('id'),
                title: titleVal
            });
            console.log(JSON.stringify(newData, null, 4));
            updateServer(function(){},card.find('.ripple'));
            //setTimeout(function(){card.find('.ripple').toggleClass("animate");}, 400);
        }
        else $(this).val(tabTitles[currTab.attr('id')]);
    }
});

$('.edit').focusin(function(){
    if(menuOpen==1)$('.menu-link').click();
});

$('.newTab').click(function () {
    if(newTabReady){
        tabColors.push(cssVar.getPropertyValue('--new_tab_color'));
        pushNewTab(newTitle(), cssVar.getPropertyValue('--new_tab_color'));
        $("body").get(0).style.setProperty("--new_tab_color", newColor());
        newData.push({
            id: tabIds[tabIds.length-1],
            title: tabTitles[tabTitles.length-1],
            color: tabColors[tabColors.length-1],
            type: 'plaintext',
            content : ''
        });
        console.log(JSON.stringify(newData, null, 4));
        if(data!=""){
            newTabReady=!newTabReady;
            updateServer(function(){
                if(menuOpen==1) $('.tab .delete').css('height',(parseInt(cssVar.getPropertyValue('--nav_height'),10)*menuOpen)+'px');
                newTabReady=!newTabReady;
            }, $('.tabs').children().last().find('.ripple'));
        }
        else data="{}";
    }
});

function pushNewTab(title, color){
    var newTab =
        '<div class="tabPane" id="'+newId()+'">' +
        '<span class="ripple"></span>'+
        '<div class="title">'+
        '<input value="'+title+'">'+
        '</div> '+
        '<div class="tab">' +
        '<div class="delete"><img src="/public/img/del.svg"></img></div>'+
        '<p>'+title.charAt(0).toUpperCase()+'</p>' +
        '</div> ' +
        '</div>';
    $('.tabs').append(newTab);
    
    var lastTab=$('.tabs').children().last();
    lastTab.css("height",cssVar.getPropertyValue('--nav_height'));
    lastTab=lastTab.find('.ripple');
    lastTab.css("background-color",color);
    lastTab.click();
}
function updateUI(menu){
    if(!(menu && tabTitles.length > 5)) menuOpen=0;
    function addTabs(i, delay) {
		setTimeout(function() {
            pushNewTab(tabTitles[i], tabColors[i]);
            if(i==tabTitles.length-1){
                setTimeout(function() {
                    $('.tabs').children().first().click();
                    if(menu && tabTitles.length > 5) 
                        setTimeout(function() {
                            menuOpen=0;
                            //$('.menu-link').click();
                        },500);
                },200);
            }
            if(i<tabTitles.length-1)addTabs(++i,50/i);
		}, delay);
    }
    addTabs(0,0);
}
function updateIDs(i){
    $('.tabs > div').map(function() {
        $(this).prop('id',i++);
    }); 
    $('.tabs > div').map(function() {
        console.log($(this).prop('id')+" - "+$(this).find('.title input').val());
    });
}
function updateServer(postfunction, ripple){
    if(menuOpen){
        ripple.toggleClass("animate");
        ripple.parent().find('.tab').css('width','0');
        ripple.parent().find('.tab .delete').css('width','0');

    }
    else ripple.parent().find('.tab').toggleClass("animate");
    const http = new XMLHttpRequest();
    http.open('POST', '/save');
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange=function(e) {
        if (http.readyState == XMLHttpRequest.DONE){   
            if (http.responseText == 1) {
                postfunction();
            }
            else{console.log(e);}
            if(menuOpen){
                ripple.toggleClass("animate");
                ripple.parent().find('.tab').css('width',cssVar.getPropertyValue('--nav_height'));
                ripple.parent().find('.tab .delete').css('width',(parseInt(cssVar.getPropertyValue('--nav_height'),10)*menuOpen)+'px');
            }
            else ripple.parent().find('.tab').toggleClass("animate");
        } 
    }
    http.send(JSON.stringify({
        token: token,
        updates: newData
    }));
}