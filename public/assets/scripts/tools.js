var token = (window.location.pathname).substring(1, (window.location.pathname).length),
    cssVar = window.getComputedStyle(document.body),
    socket,
    firstLoad = true;
    notebook = {},
    menuOpen = -1,
    currTab = null,
    newTabReady = true,
    hoverTabColor = null,
    updateStack = [];

window.editor = '';
require.config({ paths: { 'vs': 'lib/monaco-editor/min/vs' } });
require(['vs/editor/editor.main'], function () {
    window.editor = monaco.editor.create(document.getElementsByClassName('edit')[0], {
        value: "",
        language: 'javascript',
        minimap: { enabled: true },
        automaticLayout: true,
        theme: "vs-dark"
    });
});

window.onresize = function () {
    window.editor && window.editor.layout();
};

function newId() {
    var id;
    do { id = (Math.PI * Math.max(0.01, Math.random())).toString(36).substr(2, 5); }
    while (id in notebook);
    return id;
}

function newColor() {
    var color;
    do { color = palette[Math.floor(Math.random() * (palette.length - 1))]; }
    while (!$.isEmptyObject(notebook) && color == notebook[Object.keys(notebook)[Object.keys(notebook).length - 1]].color);
    return color;
}

function newTitle() {
    return titleData[Math.floor(Math.random() * (titleData.length - 1))];
}

function pushIntoUpdateStack(newUpdate) {
    for (var i = 0; i < updateStack.length; i++) {
        if (updateStack[i].id == newUpdate.id) {
            jQuery.extend(updateStack[i], newUpdate);
            return;
        }
    }
    updateStack.push(newUpdate);
}

function splash() {
    $('.splash p').text('');
    $('.splash .loading-wrapper').delay(300).queue(function (next) {
        $('meta[name="theme-color"]').prop('content', cssVar.getPropertyValue('--nav_color'));
        $(this).css("animation", "splashwrapper 0.8s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275)");
    });
    $('.splash #loading-content').css("animation", "splashcontent 0.8s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275)");
    $('.splash .splashlogo').css("animation", "splashlogo 0.8s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275)");
    setTimeout(function () {
        $('.splash').remove();
    }, 1100);
};

function pushNewTab(id) {
    var newTab =
        '<div class="tabPane" id="' + id + '">' +
        '<div class="title">' +
        '<input value="' + notebook[id].title + '">' +
        '</div>' +
        '<span class="ripple"></span>' +
        '<div class="tab">' +
        '<div class="delete">' +
        '<span class="cross-icon"><span class="menu-line cross1"></span> <span class="menu-line cross2"></span>' +
        '<svg class="circleProgress" viewBox="0 0 311.812 311.812">' +
        '<circle id="progress" class="" fill="none" stroke="#000000" stroke-width="10" stroke-linecap="round" stroke-miterlimit="10" stroke-dasharray="0,1000" cx="155.906" cy="155.906" r="141.027"/>' +
        '</svg>' +
        '</div>' +
        '<p>' + notebook[id].title.charAt(0).toUpperCase() + '</p>' +
        '</div> ' +
        '</div>';
    $('.tabs').append(newTab);

    var lastTab = $('.tabs').children().last();
    lastTab.css("height", cssVar.getPropertyValue('--nav_height'));
    lastTab.find('.title input').prop("disabled", true);
    lastTab.find('.tab').css("background-image", 'linear-gradient(to right, ' + notebook[id].color + ' 50%, transparent 50%)');
    lastTab.find('.ripple').css("background-color", notebook[id].color);
    lastTab.click();
}

function initUI(menu, cb) {
    for (let id in notebook) pushNewTab(id);
    $('.tabs').children().first().click();
    cb();
}

function updateUI(updates) {
    updates.forEach(function(update, i) {
        if ('tab' in update) { 
            if (update.tab == 'new') {
                notebook[update.id] = {
                    title: update.title,
                    color: update.color,
                    type: update.type,
                    content: update.content
                }
                pushNewTab(update.id);
            }
            else if (update.tab == 'del') {}
        }
        else {
            if ('title' in update) {
                notebook[update.id]['title'] = update.title;
                $('#' + update.id + ' .title input').val(update.title);
                $('#' + update.id + ' .tab p').text(update.title.charAt(0).toUpperCase());
            }
            if ('content' in update) {
                notebook[update.id]['content'] = update.content;
                if(update.id == currTab.prop('id')) window.editor.setValue(update.content || '');
            }
        }
    });
}

function updateIDs(i) {
    $('.tabs > div').map(function () {
        $(this).prop('id', i++);
    });
    $('.tabs > div').map(function () {
        console.log($(this).prop('id') + " - " + $(this).find('.title input').val());
    });
}

function updateServer(ripple, callback) {
    if (menuOpen) {
        ripple.addClass("animate");
        ripple.parent().find('.tab').css('width', '0');
        ripple.parent().find('.tab .delete').css('width', '0');
    }
    else {
        ripple.parent().css('background-color', cssVar.getPropertyValue('--sidebar_color'));
        ripple.parent().find('.tab').addClass("animate");
    }

    saveUpdateData(function (err) {
        if (err) console.log(err);
        else updateStack = [];

        callback();
        ripple.removeClass("animate");
        ripple.parent().find('.tab').css('width', cssVar.getPropertyValue('--nav_height'));
        ripple.parent().find('.tab .delete').css('width', (parseInt(cssVar.getPropertyValue('--nav_height'), 10) * menuOpen) + 'px');
        if (ripple.parent().prop('id') == currTab.prop('id'))
            ripple.parent().css('background-color', cssVar.getPropertyValue('--nav_color'));
        ripple.parent().find('.tab').removeClass("animate");
    });
}