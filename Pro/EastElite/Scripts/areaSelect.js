
(function ($) {
    $.fn.areaSelect = function (option) {
        var opt = {}
        opt = $.extend(opt, option);
        var _this = $(this);
     
        _this.on('mousedown', function (e) {
           
            _this.find('li').removeClass('item-active');
            var startTop = e.pageY;
            var startLeft = e.pageX;
            var endTop, endLeft;
            var selectBox = $('<div id="select-box"></div>');
            $('body').append(selectBox);
            selectBox.css({ 'position': 'absolute', 'top': startTop + 'px', 'left': startLeft + 'px', 'background': '#8bbff9', 'transition': 'all 0s', 'width': 0, 'height': 0, 'z-index': 10, 'opacity': '0.5', 'filter': 'alpha(opacity = 50)', 'border': ' 1px solid #1362b4' });

            $(document).on('mousemove', function (e) {
                e.preventDefault();
                endTop = e.pageY;
                endLeft = e.pageX;
                if (e.pageY - startTop > 0 && e.pageX - startLeft > 0) {
                    var height = e.pageY - startTop;
                    var width = e.pageX - startLeft;
                    selectBox.css({
                        'width': width + 'px',
                        'height': height + 'px'
                    })
                } else if (e.pageY - startTop < 0 && e.pageX - startLeft < 0) {
                    var height = -(e.pageY - startTop);
                    var width = -(e.pageX - startLeft);
                    selectBox.css({
                        'width': width + 'px',
                        'height': height + 'px',
                        'top': e.pageY + 'px',
                        'left': e.pageX + 'px'
                    })
                } else if (e.pageY - startTop > 0 && e.pageX - startLeft < 0) {
                    var height = (e.pageY - startTop);
                    var width = -(e.pageX - startLeft);
                    selectBox.css({
                        'width': width + 'px',
                        'height': height + 'px',
                        'top': startTop + 'px',
                        'left': e.pageX + 'px'
                    })
                } else if (e.pageY - startTop < 0 && e.pageX - startLeft > 0) {
                    var height = -(e.pageY - startTop);
                    var width = (e.pageX - startLeft);
                    selectBox.css({
                        'width': width + 'px',
                        'height': height + 'px',
                        'top': e.pageY + 'px',
                        'left': startLeft + 'px'
                    })
                }
                _this.find('li').each(function () {
                    if ((startLeft < $(this).offset().left + $(this).width() && $(this).offset().left < endLeft && $(this).offset().top < endTop && $(this).offset().top + $(this).height() > startTop && (e.pageY - startTop > 0 && e.pageX - startLeft > 0)) ||
                        (endLeft < $(this).offset().left + $(this).width() && $(this).offset().left < startLeft && $(this).offset().top < startTop && $(this).offset().top + $(this).height() > endTop && (e.pageY - startTop < 0 && e.pageX - startLeft < 0)) ||
                        (endLeft < $(this).offset().left + $(this).width() && $(this).offset().left < startLeft && $(this).offset().top < endTop && $(this).offset().top + $(this).height() > startTop && (e.pageY - startTop > 0 && e.pageX - startLeft < 0)) ||
                        (startLeft < $(this).offset().left + $(this).width() && $(this).offset().left < endLeft && $(this).offset().top < startTop && $(this).offset().top + $(this).height() > endTop && (e.pageY - startTop < 0 && e.pageX - startLeft > 0))) {
                        $(this).addClass('item-active');
                        return;
                    } else {
                        $(this).removeClass('item-active');
                    }
                });
            })
            $(document).on('mouseup', function () {
                $('#select-box').remove();
                $(document).unbind('mousemove');
                DFBG.FlieOA.Flie.isSelect();
            })
        });
      
    }
  
})(jQuery)
