var typingTimer, doneTypingInterval = 0;
$(".edit").bind("propertychange blur change keyup input cut paste", function (event) {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
        if (notebook[currTab.prop('id')].content != window.editor.getValue()) {
            notebook[currTab.prop('id')].content = window.editor.getValue();
            pushIntoUpdateStack({
                id: currTab.prop('id'),
                content: notebook[currTab.prop('id')].content
            });
            updateServer(currTab.find('.ripple'), function() {});
        }
    }, doneTypingInterval);
});

$('.menu-link').click(function () {
    if (menuOpen != -1) {
        $('.menu').toggleClass('open');
        $('.editor').toggleClass('open');
        menuOpen = +!menuOpen;
        $('.tab .delete').css('height', (parseInt($('.tab .delete').css('width'), 10) * menuOpen) + 'px');
    }
});

$('.tabs').on('click', '.tabPane', function (e) {
    if (((currTab == null) ? '' : currTab.prop('id')) != $(this).prop('id')) {
        if (currTab != null) {
            currTab.css("background-color", "transparent");
            currTab.find('.tab').css("background-position", "-100%");
            currTab.find('.title input').prop("disabled", true);
            currTab.find('.title input').css("cursor", "pointer");
            currTab.find(".delete").css("background-color", cssVar.getPropertyValue('--nav_color'));
        }
        if (typingTimer != null) clearTimeout(typingTimer);
        if (menuOpen != -1 && currTab != null && notebook[currTab.prop('id')].content != window.editor.getValue()) {
            notebook[currTab.prop('id')].content = window.editor.getValue();
            pushIntoUpdateStack({
                id: currTab.prop('id'),
                content: notebook[currTab.prop('id')].content
            });
            updateServer(currTab.find('.ripple'), function() {});
        }
        currTab = $(this);
        currTab.find('.tab').css("background-position", '0');
        currTab.css("background-color", cssVar.getPropertyValue('--nav_color'));
        currTab.find(".delete").css("background-color", cssVar.getPropertyValue('--sidebar_color'));
        currTab.find('.title input').css("cursor", "text");
        currTab.find('.title input').prop("disabled", false);
        window.monaco.editor.setModelLanguage(window.monaco.editor.getModels()[0], notebook[currTab.prop('id')].type);
        window.editor.setValue(notebook[currTab.prop('id')].content || '');
    }
    currTab = $(this);
});

// Delete Notes
/*$('.tabs').on('click', '.tab', function (e) {
    if (menuOpen == 1) {
        e.stopPropagation();
        var card = $(this).parent();
        tabTitles.splice(card.prop('id'), 1);
        tabColors.splice(card.prop('id'), 1);
        card.css("height", '0');
        setTimeout(function () {
            card.remove();
            updateIDs(0);
        }, 260);
    }
});*/

$(".tabs").on({
    mouseenter: function () {
        if (menuOpen == 1) {
            $(this).find('.delete').css('opacity', '1');
            $(this).find('.delete').css('border-radius', (parseInt(cssVar.getPropertyValue('--nav_height'), 10) / 2) + 'px');
            $(this).find('.delete').css('transform', 'scale(0.8)');
            if (currTab.prop('id') == $(this).parent().prop('id')) $(this).css("background-position", "-100%");
        }
        else if (currTab.prop('id') != $(this).parent().prop('id')) {
            $(this).css("background-position", "-95%");
        }
    },
    mouseleave: function () {
        $(this).find(".circleProgress > circle#progress").attr("class", "");
        $(this).find(".delete .cross1 , .delete .cross2").css("background-color", "#ffffff");
        if (menuOpen == 1) {
            $(this).find('.delete').css('opacity', '0');
            $(this).find('.delete').css('border-radius', '0');
            $(this).find('.delete').css('transform', 'scale(1)');
            if (currTab.prop('id') == $(this).parent().prop('id')) $(this).css("background-position", "0");
        }
        else if (currTab.prop('id') != $(this).parent().prop('id')) {
            $(this).css("background-position", "-100%");
        }
    },
    mouseup: function (e) {
        clearTimeout(pressTimer);
        $(this).find(".delete .cross1 , .delete .cross2").css("background-color", "#ffffff");
        $(this).find(".circleProgress > circle#progress").attr("class", "");

    },
    mousedown: function (e) {
        let card = $(this);
        card.find(".circleProgress > circle#progress").attr("class", "active");
        pressTimer = window.setTimeout(function () {
            card.find(".circleProgress > circle#progress").attr("class", "active launch");
            card.find(".delete .cross1 , .delete .cross2").css("background-color", "#ff4e46");
        }, 1000);
    }
}, '.tab');

$('.tabs').on('keypress blur', '.title input', function (e) {
    var card = $(this).parent().parent(),
        keycode = (event.keyCode ? event.keyCode : event.which);
    if ((e.type == "focusout" || (e.type == "keypress" && keycode == '13'))) {
        $(this).val($(this).val().trim());
        if (notebook[currTab.prop('id')].title != $(this).val()) {
            if ($(this).val() != "") {
                notebook[currTab.prop('id')].title = $(this).val();
                card.find('.tab p').text(notebook[currTab.prop('id')].title.charAt(0).toUpperCase());
                pushIntoUpdateStack({
                    id: currTab.prop('id'),
                    title: notebook[currTab.prop('id')].title
                });
                updateServer(card.find('.ripple'), function() {});
            }
            else $(this).val(notebook[currTab.prop('id')].title);
        }
    }
});

$('.edit').focusin(function () {
    if (menuOpen == 1) $('.menu-link').click();
});

$('.newTab').click(function () {
    if (newTabReady && menuOpen != -1) {
        let id = newId();
        notebook[id] = {
            title: $.isEmptyObject(notebook)? 'New Tab' : newTitle(),
            color: cssVar.getPropertyValue('--new_tab_color'),
            type: 'plaintext',
            content: ''
        }

        pushNewTab(id);
        $("body").get(0).style.setProperty("--new_tab_color", newColor());

        pushIntoUpdateStack({
            id: id,
            title: notebook[id].title,
            color: notebook[id].color,
            type: notebook[id].type,
            content: notebook[id].content,
            tab: 'new'
        });

        newTabReady = !newTabReady;
        updateServer($('.tabs').children().last().find('.ripple'), function() {
            if (menuOpen == 1) 
                $('.tab .delete').css('height', (parseInt(cssVar.getPropertyValue('--nav_height'), 10) * menuOpen) + 'px');
            newTabReady = !newTabReady;
        });
    }
});


window.addEventListener('online', function(e) {
    console.log('Online');
});
  
window.addEventListener('offline', function(e) {
    console.log('Offline');
});