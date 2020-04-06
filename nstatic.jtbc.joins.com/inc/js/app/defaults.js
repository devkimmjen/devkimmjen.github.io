// defaults.js?d=20200225

!function($, document, window) {
    $.support.cors = true;
    var $document = $(document);
    // exception handling
    $document.ajaxError(function(e, xhr, settings, thrownError) {
        if (settings.globalExceptionHandle === true) {
            // 명시적인 ajax 에러 알림 필요가 있다고 판단되는 경우에만 아래 실행..
            var message = '서비스 이용에 불편을 드려 죄송합니다.\n관리자에게 문의해주세요.';
            if ($.layer) {
                $.layer.alert(message);
            } else {
                alert(message);
            }
        }
    });
    
    Handlebars.registerHelper('dateFormat', function(timestamp, format) {
        return moment(timestamp).format(format || 'YYYY.MM.DD');
    });

    $document.on('click', '._page-print', function() {
        window.print();
    });

    $document.on('click', '._jtbc-route', function() {
        $.layer.open('template-jtbc-route');
    });
}(jQuery, document, window);// 이미지 fallback 기능
!function($, document) {
    'use strict';

    var defaultImageSource = function($image) {
        if (/^http:\/\/placehold\.it\//i.test($image.prop('src'))) {
            return;
        }
        $image.prop('src', '');
    };

    var imageSourceFallback = function($image, source, initializer) {
        var fallbackSource = null;
        if (initializer === true) {
            fallbackSource = source;
        } else if (/^https?:\/\/(fs|photo|bbsfile).dev.jtbc.joins.com\/.+/i.test(source)) {
            fallbackSource = source.replace(/^(https?:\/\/)(fs|photo|bbsfile).dev.(jtbc.joins.com\/.+)/i, '$1$2.$3');
        } else if (/^https?:\/\/(photo|bbsfile).jtbc.joins.com\/.+/i.test(source) && /\.tn(300|350)\.(jpg|jpeg|png|gif)$/.test(source)) {
            fallbackSource = source.replace(/\.tn\d+\.(jpg|jpeg|png|gif)$/, '.tn150.$1');
        } else if (/\.tn\d+\.(jpg|jpeg|png|gif)$/.test(source)) {
            fallbackSource = source.replace(/\.tn\d+\.(jpg|jpeg|png|gif)$/, '');
        }

        if (fallbackSource === null) {
            defaultImageSource($image);
        } else {
            var _image = new Image();
            if (_image.attachEvent) {
                _image.attachEvent('onerror', function() {
                    imageSourceFallback($image, fallbackSource);
                });
                _image.attachEvent('onload', function() {
                    $image.prop('src', fallbackSource);
                    $image.data('src', fallbackSource);
                    $image.attr('data-src', fallbackSource);
                    $(document).trigger('ux_images_loaded', $image);
                });
            } else {
                _image.addEventListener('error', function() {
                    imageSourceFallback($image, fallbackSource);
                });
                _image.addEventListener('load', function() {
                    $image.prop('src', fallbackSource);
                    $image.data('src', fallbackSource);
                    $image.attr('data-src', fallbackSource);
                    $(document).trigger('ux_images_loaded', $image);
                });
            }
            _image.src = fallbackSource;
        }
    };

    $.fn.sourceFallback = function() {
        var $that = this;
        var $image = $that.filter('img');
        imageLoadCheck($image);
        return $that;
    };

    var imageLoadCheck = function($imageList) {
        if (!$imageList.length) {
            return;
        }
        var $checkImageList = $imageList.not('._lazy-load');
        if (!$checkImageList.length) {
            return;
        }
        $checkImageList.each(function(i, imageElement) {
            var $image = $(imageElement);
            var imageSource = $image.prop('src');
            if (!imageSource) {
                imageSource = $image.data('src');
            }
            if (imageSource) {
                imageSourceFallback($image, imageSource, true);
            }
            $image.addClass('_fallback');
        });
    };

    var $document = $(document);
    $document.ready(function() {
        var $image = $('img');
        imageLoadCheck($image);
        $image.sourceFallback();
    });

    $document.ajaxComplete(function() {
        var $image = $('img:not(._fallback)');
        var $imageFallbackExclude = $('._fallback-exclude-wrap');
        $image = $image.not($imageFallbackExclude.find('img'));
        imageLoadCheck($image);
    });

}(jQuery, document);// 2줄 이상 말줄임 표시 기능
!function($, document) {
    'use strict';

    var applyEllipse = function() {
        var $ellipseElements = $('._dotdotdot');
        $ellipseElements.dotdotdot({wrap: 'letter'});
        $ellipseElements.removeClass('_dotdotdot').addClass('_dot-apply');

        var $ellipseShortElements = $('._dotdot');
        $ellipseShortElements.dotdotdot({wrap: 'letter', ellipsis: '..'});
        $ellipseShortElements.removeClass('_dotdot').addClass('_dot-apply');
    };

    var $document = $(document);
    $document.ready(function() {
        applyEllipse();
    });

    $document.ajaxComplete(function() {
        applyEllipse();
    });

}(jQuery, document);
// 사이드바 영역에 SPECIAL 앵커 브리핑 로드
!function($, document, Handlebars) {
    'use strict';

    $(document).ready(function() {
        var $sidebarNewsWrap = $('#sidebar-news-special-area');
        if (!$sidebarNewsWrap.length) {
            return;
        }

        var dataUrl = $sidebarNewsWrap.data('url');
        var $template = $('#template-news-special');
        if (!dataUrl || !$template.length) {
            return;
        }

        var templateSource = $template.html();
        var template = Handlebars.compile(templateSource);

        $.ajax(dataUrl, {
            method: 'GET',
            dataType: 'script'
        }).done(function() {
            if (window['jtbc_news_index_new_index_new_tvspecial']) {
                var data = window['jtbc_news_index_new_index_new_tvspecial'];
                var context = {title: '', headline: {image: '', title: '', link: {}}, newsList:[]};
                if (data.image && data.image.length) {
                    context.headline.image = data.image[0].value;
                }
                if (data.content && data.content.length) {
                    context.headline.title = data.content[0].value;
                }
                if (data.text && data.text.length) {
                    $.each(data.text, function(i, text) {
                        if (i === 0) {
                            context.title = text.value;
                        } else {
                            context.newsList.push({title: text.value, link: ''});
                        }
                    });
                }
                if (data.link && data.link.length) {
                    var maxLinkIndex = context.newsList.length + 2;
                    $.each(data.link, function(i, link) {
                        var linkInfo = {source: link.value, target: (link.target || '_self')};
                        if (i === 1) {
                            context.headline.link = linkInfo;
                        } else if (i > 1 && i < maxLinkIndex) {
                            context.newsList[i - 2].link = linkInfo;
                        }
                    });
                }
                var html = template(context);
                $sidebarNewsWrap.before(html);
            }
        }).complete(function() {
            $sidebarNewsWrap.remove();
            $template.remove();
        });
    });
}(jQuery, document, Handlebars);// Date Picker
!function($, document, Handlebars, moment) {
    'use strict';

    var template = null;

    var $body = null;

    var getMonthDateTemplateContext = function(yearMonth, current) {
        var currentDate = null;
        if (current) {
            currentDate = moment(current, 'YYYYMMDD');
        }
        if (currentDate == null || !currentDate.isValid()) {
            currentDate = moment();
        }
        var visibleYearMonthDate = null;
        if (yearMonth) {
            visibleYearMonthDate = moment(yearMonth, 'YYYYMM');
        }
        if (visibleYearMonthDate == null || !visibleYearMonthDate.isValid()) {
            visibleYearMonthDate = moment(currentDate);
        }
        var firstDateDayOfWeek = visibleYearMonthDate.startOf('month').day();
        var lastDate = visibleYearMonthDate.endOf('month');
        var loopCount = lastDate.date() + firstDateDayOfWeek;
        var datePrefix = visibleYearMonthDate.format('YYYYMM');
        var weekList = [];
        var weekDayList = null;
        for (var i = 0; i < loopCount; i++) {
            if (i % 7 === 0) {
                weekDayList = [];
                weekList.push(weekDayList);
            }

            if (i < firstDateDayOfWeek) {
                weekDayList.push({});
            } else {
                var day = i - firstDateDayOfWeek + 1;
                var dayValue = datePrefix + (day < 10 ? '0' + day : day);
                weekDayList.push({value: dayValue, label: day, active: (dayValue === current)});
            }
        }

        var lastDateDayOfWeek = lastDate.day();
        if (lastDateDayOfWeek < 6) {
            weekDayList = weekList[weekList.length - 1];
            for (var w = 0, wSize = 6 - lastDateDayOfWeek; w <wSize; w++) {
                weekDayList.push({});
            }
        }

        return {
            year: visibleYearMonthDate.format('YYYY'),
            month: visibleYearMonthDate.format('MM'),
            weekList: weekList,
            previous: moment(visibleYearMonthDate).subtract(1, 'months').format('YYYYMM'),
            next: moment(visibleYearMonthDate).add(1, 'months').format('YYYYMM')
        };
    };

    var monthChangeHandler = function($datePicker, $target, current) {
        var targetMonth = $target.data('month');
        var templateContext = getMonthDateTemplateContext(targetMonth, current);
        var html = template(templateContext);
        $datePicker.html(html);
    };

    var removeDatePickerInstance = function($target) {
        if (!($target && $target.data)) {
            return;
        }
        var removeDatePickerId = $target.data('jtbcDatePicker');
        $('#' + removeDatePickerId).remove();
        $target.data('jtbcDatePicker', null);
    };

    var datePickerClickHandler = function(event, $datePickerTrigger, instanceOptions) {
        if (!template) {
            return;
        }

        if (instanceOptions && instanceOptions['disable'] && instanceOptions['disable'].call(this)) {
            return;
        }

        if ($datePickerTrigger.data('jtbcDatePicker')) {
            // HIDE
            removeDatePickerInstance($datePickerTrigger);
        } else {
            // SHOW
            var current = $datePickerTrigger.data('current') + '';
            var templateContext = getMonthDateTemplateContext(current.substring(0, 6), current);

            var datePickerId = 'jtbc-dp-' + new Date().getTime();
            var targetOffset = $datePickerTrigger.offset();
            var styleList = [
                'position:', 'absolute;',
                'top:', (targetOffset.top + $datePickerTrigger.outerHeight() - 1), 'px;',
                'left:', targetOffset.left, 'px;'
            ];

            var html = '<div id="' + datePickerId + '" style="' + styleList.join('') + '" class="_jtbc-date-picker-wrap">' + template(templateContext) + '</div>';
            $body.append(html);

            var $datePicker = $('#' + datePickerId);
            $datePicker.data('triggerElement', $datePickerTrigger);
            $datePicker.on('click', '._prev-month,._next-month', function(event) {
                monthChangeHandler($datePicker, $(event.currentTarget), current);
                event.stopPropagation();
                event.preventDefault();
                return false;
            });
            $datePicker.on('click', '._day', function(event) {
                var $dateTarget = $(event.currentTarget);
                var selectedDate = $dateTarget.data('day');
                var beforeYear = new Date();
                beforeYear.setYear(beforeYear.getFullYear()-1);
                beforeYear = beforeYear.getFullYear() +''+ (beforeYear.getMonth()+1) +''+ beforeYear.getDate();
                if(beforeYear > selectedDate){
                    alert("조회기간은 최대 1년까지만 제공됩니다.");
                    selectedDate = beforeYear;
                }

                if (instanceOptions && instanceOptions['onselect']) {
                    instanceOptions['onselect'].call(this, selectedDate);
                }
                removeDatePickerInstance($datePickerTrigger);
                event.stopPropagation();
                event.preventDefault();
                return false;
            });

            $datePickerTrigger.data('jtbcDatePicker', datePickerId);
        }

        event.stopPropagation();
        event.preventDefault();
        return false;
    };

    $.fn.jtbcDatePicker = function(options) {
        var instanceOptions = options;

        var _this = this;
        _this.on('click', function(event) {
            datePickerClickHandler(event, $(event.currentTarget), instanceOptions);
        });

        return this;
    };

    $(document).ready(function() {
        var $template = $('#template-date-picker');
        if (!$template.length) {
            return;
        }

        var templateSource = $template.html();
        template = Handlebars.compile(templateSource);

        $body = $(document.body);

        $body.on('click', function(event) {
            var $target = $(event.originalEvent.target);
            if ($target.is('._jtbc-date-picker-wrap') || $target.closest('._jtbc-date-picker-wrap').length > 0) {
                return true;
            }

            var $datePickerWrapList = $('._jtbc-date-picker-wrap');
            if ($datePickerWrapList.length) {
                for (var i = 0, size = $datePickerWrapList.length; i < size; i++) {
                    removeDatePickerInstance($datePickerWrapList.eq(i).data('triggerElement'));
                }
            }
        });
    });
}(jQuery, document, Handlebars, moment);
// 게시판 공통 Script
!function($, document, window) {
    'use strict';

    function boardListTitleEllipsisHandler($wrap) {
        var $titleElements = $wrap.find('td.title');
        $titleElements.each(function(i, element) {
            var $element = $(element);
            var $title = $element.children('a');
            if ($title.length) {
                var elementWidth = $element.width();
                var $previousAll = $title.prevAll();
                for (var p = 0, pSize = $previousAll.length; p < pSize; p++) {
                    elementWidth -= ($previousAll.eq(p).outerWidth() + 1);
                }
                var $nextAll = $title.nextAll();
                for (var n = 0, nSize = $nextAll.length; n < nSize; n++) {
                    var $next = $nextAll.eq(n);
                    if ($next.is('.icon_wrap')) {
                        var $nextChildren = $next.children();
                        for (var c = 0, cSize = $nextChildren.length; c < cSize; c++) {
                            elementWidth -= ($nextChildren.eq(c).outerWidth());
                        }
                        elementWidth -= 1;
                    } else {
                        elementWidth -= ($next.outerWidth() + 1);
                    }
                }
                elementWidth -= ($title.outerWidth() - $title.innerWidth() + 10);
                var titleWidth = $title.width();
                if (titleWidth > elementWidth) {
                    $title.css('width', elementWidth + 'px');
                }
            }
        });
    }

    function updatePaginationBoardList($wrap, pageIndex, excludeFilter, extraSubmitData) {
        if ($wrap.data('loading')) {
            return;
        }
        var updateURL = $wrap.data('url');
        if (!updateURL) {
            return;
        }
        var submitData = [{name: 'page', value: pageIndex}];
        var host = $wrap.data('host');
        if (!host) {
            return;
        }
        submitData.push({name: 'host', value: host});
        if (!excludeFilter) {
            var $filterType = $wrap.find('._board-filter-type');
            var $filterTerm = $wrap.find('._board-filter-term');
            if ($filterType.length && $filterTerm.length) {
                var type = $filterType.val();
                var term = $filterTerm.val();
                if ($.trim(term).length) {
                    submitData.push({name: 'type', value: type});
                    submitData.push({name: 'term', value: term});
                }
            }
        }
        var $layoutTabWrap = $wrap.find('._layout-tab-wrap');
        if ($layoutTabWrap.length) {
            var $activeLayoutTab = $layoutTabWrap.find('li.on ._layout-tab');
            if ($activeLayoutTab.length) {
                submitData.push({name: 'layout', value: $activeLayoutTab.data('layout')});
            }
        }
        if (extraSubmitData) {
            $.merge(submitData, extraSubmitData);
        }
        $wrap.data('loading', true);

        $.ajax(updateURL, {
            data: submitData,
            method: 'POST',
            dataType: 'html',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function(data) {
            $wrap.html(data);
            var caption = $wrap.data('caption');
            if (caption) {
                var $caption = $wrap.find('table caption');
                if ($caption.length) {
                    var oldCaption = $caption.text();
                    $caption.text(caption + oldCaption);
                }
            }
            var wrapOffset = $wrap.offset();
            if (wrapOffset.top < document.body.scrollTop) {
                $wrap.velocity('scroll', {
                    duration: 500,
                    delay: 50,
                    offset: -50
                });
            }
            var $layoutTabWrap = $wrap.find('._layout-tab-wrap');
            if ($layoutTabWrap.length) {
                var $activeLayoutTab = $layoutTabWrap.find('li.on ._layout-tab');
                if ($activeLayoutTab.length) {
                    var layout = $activeLayoutTab.data('layout');
                    var $thumbnailWrap = $wrap.find('._layout-' + layout + '-content');
                    thumbnailLayoutImageLoader($thumbnailWrap);
                }
            }
            // select element ux plugin 연동.
            if (window['formControl']) {
                var uiFormControlInitializer = window['formControl'];
                if (uiFormControlInitializer.initSelect && typeof uiFormControlInitializer.initSelect === 'function') {
                    uiFormControlInitializer.initSelect();
                }
                if (uiFormControlInitializer.initCheckbox && typeof uiFormControlInitializer.initCheckbox === 'function') {
                    uiFormControlInitializer.initCheckbox();
                }
            }

            boardListTitleEllipsisHandler($wrap);
        }).always(function() {
            $wrap.data('loading', false);
        });
    }

    function updateCelebPaginationBoardList($wrap, pageIndex) {
        if ($wrap.data('loading')) {
            return;
        }
        var updateURL = $wrap.data('url');
        if (!updateURL) {
            return;
        }

        var host = $wrap.data('host');
        if (!host) {
            return;
        }

        $.ajax(updateURL + '/celeb', {
            data: [
                {name : 'page', value: pageIndex}
            ],
            method: 'POST',
            dataType: 'html',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function(data){
            $('.wrap_celeb_top').html(data);
        }).always(function() {

        });
    }

    function changePhotoTabContent($wrap, layout) {
        var layoutContentSelector = '._layout-' + layout + '-content';
        var $layoutContentElements = $wrap.find('._layout-content');
        var $activeLayoutContent = $layoutContentElements.filter(layoutContentSelector);
        if ($activeLayoutContent.is(':visible')) {
            return;
        }
        var $hideLayoutContentElements;
        if ($activeLayoutContent.length) {
            $hideLayoutContentElements = $layoutContentElements.not($activeLayoutContent);
        } else {
            $hideLayoutContentElements = $layoutContentElements;
        }
        $hideLayoutContentElements.css('display', 'none');
        $activeLayoutContent.css('display', '');
        thumbnailLayoutImageLoader($wrap);
    }

    function thumbnailLayoutImageLoader($wrap) {
        var $thumbnail = $wrap.find('._thumbnail-item');
        var thumbnailSize = $thumbnail.length;
        if (!thumbnailSize) {
            return;
        }

        var $thumbnailContainer = $wrap.find('._photo-viewer');
        if ($thumbnailContainer.length !== 1) {
            // 썸네일 컨테이너가 1개이여야만 함. by etribe
            return;
        }

        var photoPluginInitialized = false;
        var thumbnailSequentialLoadHandler = function(loadedIndex) {
            if (loadedIndex > -1) {
                var $thumbnailItem = $thumbnail.eq(loadedIndex);
                $thumbnailItem.css('display', '').removeClass('_thumbnail-item');

                if (!photoPluginInitialized) {
                    photoPluginInitialized = true;
                    $thumbnailContainer.masonry( {
                        itemSelector: '.photo_item',
                        transitionDuration: '0',
                        stagger: 30,
                        columnWidth: 226
                    });
                }

                $thumbnailContainer.css('display', 'block');
                $thumbnailContainer.append($thumbnailItem).masonry('appended', $thumbnailItem).masonry();
            }

            var nextLoadIndex = loadedIndex + 1;
            if (nextLoadIndex < thumbnailSize) {
                var $nextThumbnailItem = $thumbnail.eq(nextLoadIndex);
                var $nextThumbnailImage = $nextThumbnailItem.find('img').eq(0);
                var imageSource = $nextThumbnailImage.data('src');
                imageSourceFallback($nextThumbnailImage, 'INITIAL:' + imageSource, nextLoadIndex);
            }
        };

        var imageSourceFallback = function($thumbnailImage, source, loadIndex) {
            var fallbackSource = null;
            if (/^INITIAL:/.test(source)) {
                fallbackSource = source.substring(8);
            } else if (/^https?:\/\/(fs|photo).dev.jtbc.joins.com\/.+/i.test(source)) {
                fallbackSource = source.replace(/^(https?:\/\/)(fs|photo).dev.(jtbc.joins.com\/.+)/i, '$1$2.$3');
            } else if (/\.(tn350|tn300)\.(jpg|jpeg|png|gif)$/.test(source)) {
                fallbackSource = source.replace(/\.tn\d+\.(jpg|jpeg|png|gif)$/, '.tn150.$1');
            } else if (/\.tn\d+\.(jpg|jpeg|png|gif)$/.test(source)) {
                fallbackSource = source.replace(/\.tn\d+\.(jpg|jpeg|png|gif)$/, '');
            }

            if (fallbackSource === null) {
                $thumbnailImage.data('src', null);
                thumbnailSequentialLoadHandler(loadIndex);
            } else {
                var _image = new Image();
                if (_image.attachEvent) {
                    _image.attachEvent('onerror', function() {
                        imageSourceFallback($thumbnailImage, fallbackSource, loadIndex);
                    });
                    _image.attachEvent('onload', function() {
                        $thumbnailImage.prop('src', fallbackSource);
                        thumbnailSequentialLoadHandler(loadIndex);
                    });
                } else {
                    _image.addEventListener('error', function() {
                        imageSourceFallback($thumbnailImage, fallbackSource, loadIndex);
                    });
                    _image.addEventListener('load', function() {
                        $thumbnailImage.prop('src', fallbackSource);
                        thumbnailSequentialLoadHandler(loadIndex);
                    });
                }
                _image.src = fallbackSource;
            }
        };

        thumbnailSequentialLoadHandler(-1);
    }

    function updateBoardArticleRecommendCount($wrap, $button) {
        if ($wrap.data('recommend')) {
            return;
        }
        var recommendURL = $wrap.data('host');
        if (!recommendURL) {
            return;
        }
        var $articleWrap = $wrap.find('._article-wrap');
        if (!$articleWrap.length) {
            return;
        }
        var board = $articleWrap.data('board');
        var article = $articleWrap.data('article');
        $wrap.data('recommend', true);

        $.ajax(recommendURL + 'article/recommend', {
            data: [
                {name: 'board', value: board},
                {name: 'article', value: article}
            ],
            method: 'POST',
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function(data) {
            if (data['recommend']) {
                var $recommendCount = $wrap.find('._recommend-cnt');
                if ($recommendCount.length) {
                    $recommendCount.text($recommendCount.text().replace(/\d+/, data['recommend']));
                }
            }
            $button.addClass('_log-exist');
            $button.children().addClass('on');
        }).always(function() {
            $wrap.data('recommend', false);
        });
    }

    var downloadCounter = 1;
    function attachmentDownloader($wrap, attachment) {
        var downloadURL = $wrap.data('host');
        if (!downloadURL) {
            return;
        }
        var $articleWrap = $wrap.find('._article-wrap');
        if (!$articleWrap.length) {
            return;
        }
        var board = $articleWrap.data('board');
        var article = $articleWrap.data('article');

        downloadCounter += 1;
        var parameterDataHTMLs = [];
        parameterDataHTMLs.push('<input type="hidden" name="board" value="' + board + '"/>');
        parameterDataHTMLs.push('<input type="hidden" name="article" value="' + article + '"/>');
        parameterDataHTMLs.push('<input type="hidden" name="attach" value="' + attachment + '"/>');
        var frameName = 'iframe-download-' + downloadCounter,
            formElement = window.document.createElement('form'),
            frameElement = window.document.createElement('iframe');
        formElement.style.display = 'none';
        formElement.target = frameName;
        formElement.action = downloadURL + 'download/attachment';
        formElement.method = 'POST';
        frameElement.src = 'javascript:false;';
        frameElement.name = frameName;
        var downloadCompleteEventHandler = function() {
            formElement.innerHTML = '<iframe src="javascript:false;"></iframe>';
            window.setTimeout(function() { window.document.body.removeChild(formElement); }, 1000);
        };
        var frameLoadEventHandler = function() {
            if (window.detachEvent) {
                frameElement.detachEvent('onload');
                frameElement.attachEvent('onload', downloadCompleteEventHandler);
            } else {
                frameElement.removeEventListener('load', function(){});
                frameElement.addEventListener('load', downloadCompleteEventHandler);
            }
        };
        if (window.attachEvent) {
            frameElement.attachEvent('onload', frameLoadEventHandler);
        } else {
            frameElement.addEventListener('load', frameLoadEventHandler);
        }
        formElement.innerHTML = parameterDataHTMLs.join('');
        formElement.appendChild(frameElement);
        document.body.appendChild(formElement);
        formElement.submit();
    }

    var reportOptionList = null;
    function getReportOptionList() {
        var deferred = $.Deferred();
        if (reportOptionList === null) {
            $.ajax('/helper/report-options', {
                method: 'POST',
                dataType: 'json'
            }).done(function(data) {
                if (data.options) {
                    reportOptionList = data.options;
                }
                deferred.resolve(reportOptionList);
            }).fail(function() {
                deferred.reject('option load error');
            });
        } else {
            deferred.resolve(reportOptionList);
        }
        return deferred;
    }

    function articleReportLayerCloseCallback($wrap) {
        var $articleReportButton = $wrap.find('._article-report');
        if ($articleReportButton.length) {
            $articleReportButton.each(function(i, element){
                if (i == 0) {
                    $(element).focus();
                }
            });
        }
    }

    function showArticleReportForm($wrap, host, postData, $input, cancelCallback) {
        if ($wrap.data('reporting')) {
            return;
        }
        $wrap.data('reporting', true);
        getReportOptionList().done(function(optionList) {
            var $layer = $.layer.open('template-content-report', {options: optionList}, {closeCallback: cancelCallback});
            $layer.on('click', '._layer-close', function() {
                $.layer.close($layer);
                articleReportLayerCloseCallback($wrap);
            });
            $layer.on('click', '._content-report-btn', function() {
                if ($layer.data('reporting')) {
                    return;
                }
                var $option = $layer.find('._report-option');
                var $detail = $layer.find('._report-detail');
                var option = $option.val();
                if (!option) {
                    $.layer.alert($option.data('required'));
                    return;
                }
                var detail = $detail.val();
                if ($input) {
                    $input.data('reason', option);
                    $input.data('reasonDetail', detail);
                    $.layer.close($layer);
                } else {
                    var submitData = $.merge([
                        {name: 'reason', value: option},
                        {name: 'detail', value: detail}
                    ], postData);
                    $layer.data('reporting', true);
                    $.ajax(host + 'article/report', {
                        data: submitData,
                        method: 'POST',
                        dataType: 'json',
                        crossDomain: true,
                        xhrFields: {
                            withCredentials: true
                        },
                        globalExceptionHandle: true
                    }).done(function(data) {
                        if (data.message) {
                            $.layer.alert(data.message, {
                                closeCallback: function() {
                                    articleReportLayerCloseCallback($wrap);
                                }
                            });
                        }
                        $.layer.close($layer);
                        articleReportLayerCloseCallback($wrap);
                    }).always(function() {
                        $layer.data('reporting', false);
                    });
                }
            });
        }).always(function() {
            $wrap.data('reporting', false);
        });
    }

    function deleteArticle($wrap, host, postData, listUrl) {
        if ($wrap.data('deleting')) {
            return;
        }
        $wrap.data('deleting', true);


        $.ajax(host + 'article/delete', {
            data: postData,
            method: 'POST',
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function(data) {
            if (data.message) {
                $.layer.alert(data.message);
            }
            if (listUrl) {
                window.location.href = listUrl;
            }
        }).always(function() {
            $wrap.data('deleting', false);
        });
    }

    function editArticleMainThumbnailHandler($attachImageWrap, $mainThumbnailItem) {
        var $itemList = $attachImageWrap.children('li');
        if (!$itemList.length) {
            return;
        }
        var mainThumbnailMarker;
        if ($mainThumbnailItem && $mainThumbnailItem.length) {
            mainThumbnailMarker = $attachImageWrap.data('main-thumbnail');
            var $beforeMainThumbnail = $itemList.filter('._main-thumb');
            if ($beforeMainThumbnail.length) {
                var maimThumbnailMarkerTag = mainThumbnailMarker.replace(/^<([a-zA-Z]+)\s*>.+$/, '$1');
                $beforeMainThumbnail.children(maimThumbnailMarkerTag).remove();
                $beforeMainThumbnail.removeClass('_main-thumb');
            }
            $mainThumbnailItem.prepend(mainThumbnailMarker);
            $mainThumbnailItem.addClass('_main-thumb');
        } else {
            if ($itemList.filter('._main-thumb').length) {
                // 대표 이미지로 지정된 항목이 있다면 skip.
                return;
            }
            mainThumbnailMarker = $attachImageWrap.data('main-thumbnail');
            if (mainThumbnailMarker) {
                $itemList.eq(0).prepend(mainThumbnailMarker);
                $itemList.eq(0).addClass('_main-thumb');
            }
        }
    }

    function insertAttachLinkPreviewToEditor($layer, $editorRequired, host, url) {
        if ($layer.data('attach-link')) {
            return;
        }
        $layer.data('attach-link', true);

        $.ajax(host + 'attach/preview', {
            data: [{name: 'url', value: url}, {name: 'mode', value: 'editor-insert'}],
            method: 'POST',
            dataType: 'html',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function(data) {
            if ($.fn.ckeditor) {
                var editorInstance = $.map(CKEDITOR.instances, function(editor, name) {
                    return name;
                });
                if (editorInstance.length === 1) {
                    CKEDITOR.instances[editorInstance[0]].insertHtml(data);
                }
            } else if ($.fn.froalaEditor) {
                $editorRequired.froalaEditor('html.insert', data, true);
            }

            $.layer.close($layer);
        }).always(function() {
            $layer.data('attach-link', false);
        });
    }

    function editorContentIsEmpty(source) {
        var removeTagText = source.replace(/(<([^>]+)>)/ig, '');
        var trimText = $.trim(removeTagText);
        return (trimText.length === 0 && source.indexOf('<img ') === -1);
    }

    function editorContentContainDenyIframeDomain(source) {
        if (!source) {
            return false;
        }
        var lowercaseSource = source.toLowerCase();
        if (lowercaseSource.indexOf('iframe') === -1) {
            return false;
        }

        var iframeRegex = /<iframe\s.*?src=("([^"]*)"|'([^']*)'|\S*)/g;
        var domainRegEx = /^"https?:\/\/(jtbc\.joins\.com|.[a-z0-9-\.]+\.jtbc\.joins\.com|www\.youtube\.com|videofarm\.daum\.net|serviceapi\.rmcnmv\.naver\.com)(\/.*)"$/;
        var matches = iframeRegex.exec(lowercaseSource);
        while (matches !== null) {
            if (matches.length > 2) {
                if (!domainRegEx.test(matches[1])) {
                    return true;
                }
            }
            matches = iframeRegex.exec(lowercaseSource);
        }

        return false;
    }

    //문자열의 Btye 값을 구한다.
    function getByte(str){
        var len = 0;
        for(var i=0; i<str.length; i++) {
            var c = str.charCodeAt(i);
            if(c > 128 || c == 0x22 || c == 0x27 || c == 0x2F || c == 0x5C || c == 0x7C) { // ", ', /, \, |
                len += 2;
            } else if(c == 0x0D) { // 0x0A 에서 1카운트 0x0D 는 무시
                len += 0;
            } else {
                len += 1;
            }
        }
        return len;
    }

    function postSomeArticle($wrap, $attachImageWrap, $attachFileWrap, host, postData, succeedUrl) {
        if ($wrap.data('posting')) {
            return;
        }

        var postPayload = {imageList: [], attachList: [], social: null, sensitive: {defaults:[], custom:[]}, reserveOn: null};
        var sensitiveRequiredMessage = null;
        var i, size;
        for (i = 0, size = postData.length; i < size; i++) {
            var data = postData[i];
            if (data.value === 'Y') {
                postPayload[data.name] = true;
            } else if (data.value === 'N') {
                postPayload[data.name] = false;
            } else if (data.name.indexOf('input-default-') === 0 || data.name.indexOf('input-custom-') === 0) {
                if (!sensitiveRequiredMessage) {
                    var inputElement = document.getElementById(data.name);
                    if (inputElement) {
                        var $input = $(inputElement);
                        var requiredMessage = $input.data('required');
                        if (requiredMessage && $.trim($input.val()).length === 0) {
                            sensitiveRequiredMessage = requiredMessage;
                        }
                        
                        var regExp = /^[0-9,-]+$/;
                        var numberMessage = $input.data('number');
                        if (!sensitiveRequiredMessage && numberMessage && $.trim($input.val()).length !== 0 && !regExp.test($.trim($input.val()))) {
                            sensitiveRequiredMessage = numberMessage;
                        }

                        if(getByte($input.val()) > 60){
                            sensitiveRequiredMessage = $input.attr('title') + " 항목은 최대 60Byte 까지 입력할 수 있습니다.";
                        }
                    }
                }
                var inputCode = data.name.replace(/^input-(default|custom)-(.+)$/, '$2');
                if (data.name.indexOf('input-default-') === 0) {
                    postPayload.sensitive.defaults.push({code: inputCode, value: data.value});
                } else {
                    postPayload.sensitive.custom.push({code: inputCode, value: data.value});
                }
            } else {
                postPayload[data.name] = data.value;
            }
        }
        var $attachImageList = $attachImageWrap.find('._attach-img-thumb ._attach-img');
        var $mainAttachImage = $attachImageWrap.find('li._main-thumb').find($attachImageList);
        for (i = 0, size = $attachImageList.length; i < size; i++) {
            var $attachImage = $attachImageList.eq(i);
            var attachImageKey = $attachImage.data('file');
            if (attachImageKey) {
                postPayload.imageList.push({
                    file: attachImageKey,
                    main: $mainAttachImage.is($attachImage)
                });
            } else {
                postPayload.imageList.push({
                    url: $attachImage.prop('src'),
                    alt: $attachImage.prop('alt'),
                    size: $attachImage.data('size'),
                    type: $attachImage.data('type'),
                    origin: $attachImage.data('origin'),
                    main: $mainAttachImage.is($attachImage)
                });
            }
        }
        var $attachFileList = $attachFileWrap.find('._attach-file');
        for (i = 0, size = $attachFileList.length; i < size; i++) {
            var $attachFile = $attachFileList.eq(i);
            var attachFileKey = $attachFile.data('file');
            if (attachFileKey) {
                postPayload.attachList.push({
                    file: attachFileKey
                });
            } else {
                postPayload.attachList.push({
                    url: $attachFile.data('store'),
                    size: $attachFile.data('size'),
                    type: $attachFile.data('type'),
                    origin: $attachFile.data('origin')
                });
            }
        }

        // 제목이 입력되지 않은 경우.
        if (!(postPayload.title) || $.trim(postPayload.title).length === 0) {
            var titleRequired = $wrap.find('._article-title').data('required');
            if (titleRequired) {
                $.layer.alert(titleRequired);
                return;
            }
        }

        // 제목 입력 길이 체크 
        var $titleWrap = $wrap.find('._article-title');
        if ($titleWrap.length) {
            if ($titleWrap.val().length >= $titleWrap.data('maxlength')) {
                $titleWrap.val($titleWrap.val().substring(0, $titleWrap.data('maxlength')));
                $.layer.alert($titleWrap.data('exception'));
                $titleWrap.focus();
                return;
            }
        }

        // 내용이 입력되지 않은 경우.
        if (!postPayload.content) {
            var $content = $wrap.find('._article-content');
            if ($content.length && $content.is('._editor-required')) {
                if ($.fn.ckeditor) {
                    postPayload.content = $content.val();
                } else if ($.fn.froalaEditor) {
                    postPayload.content = $content.froalaEditor('html.get');
                }
            }
            // 에디터의 버그인지 content 에 조회가 안 되는 경우가 있어 다시 확인 처리. by etribe
        }

        if (editorContentContainDenyIframeDomain(postPayload.content)) {
            var contentEditorLink = $wrap.find('._article-content').data('editorlink');
            if (contentEditorLink) {
                $.layer.alert(contentEditorLink);
                return;
            }
        }

        if (!(postPayload.content) || editorContentIsEmpty(postPayload.content)) {
            var contentRequired = $wrap.find('._article-content').data('required');
            if (contentRequired) {
                $.layer.alert(contentRequired);
                return;
            }
        }


        // 추가정보 수집 필수항목 누락인 경우
        if (sensitiveRequiredMessage) {
            $.layer.alert(sensitiveRequiredMessage);
            return;
        }
        // 개인정보 수집 이용 동의 버튼이 존재하는 경우.
        var $consent = $('#privacy-consent');
        if ($consent.length && !$consent.prop('checked')) {
            var message = $consent.data('message');
            if (message) {
                $.layer.alert(message);
                return;
            }
        }

        // 포토형 게시판에 첨부 이미지가 없는 경우.
        var attachImageRequired = $attachImageWrap.data('required');
        var $noticeEdit = $('#notice-on');
        if (attachImageRequired && postPayload.imageList.length === 0 && ($noticeEdit.length === 0 || !$noticeEdit.prop('checked'))) {
            $.layer.alert(attachImageRequired);
            return;
        }

        // 소셜 공유하기로 한 상태인 경우.
        var $postSocialList = $wrap.find('._post-social:checked');
        if ($postSocialList.length) {
            postPayload.social = {
                twitter: null,
                facebook: null,
                title: null,
                link: null
            };
            if ($.social) {
                $.extend(postPayload.social, $.social.postDefaults());
            }
            postPayload.social.link = succeedUrl;
            for (var s = 0, sSize = $postSocialList.length; s < sSize; s++) {
                var $social = $postSocialList.eq(s);
                var platform = $social.data('social');
                if (platform === 'facebook') {
                    if ($social.data('token')) {
                        postPayload.social.facebook = $social.data('token');
                    } else {
                        if ($social.data('message')) {
                            $.layer.alert($social.data('message'));
                        }
                        return;


                    }
                } else if (platform === 'twitter') {
                    var twitterAccessToken = null;
                    if ($.social) {
                        //postPayload.social.title = $.social.getTwitterTitle()
                        $.extend(postPayload.social, $.social.getTwitterTitle());
                        twitterAccessToken = $.social.twitterAccessToken();
                    }
                    if (!twitterAccessToken) {
                        if ($social.data('message')) {
                            $.layer.alert($social.data('message'));
                        }
                        return;
                    }
                    postPayload.social.twitter = twitterAccessToken;
                }
            }
        }

        // 예약 공지글에 대한 예약일시 확인.
        if (postPayload['reserve-yn'] === true) {
            var reserveRequiredMessage;
            var reserveDateTime;
            if (!(postPayload['date'])) {
                var $dateElement = $('#reserve-date');
                reserveRequiredMessage = $dateElement.data('message');
                if (reserveRequiredMessage) {
                    $.layer.alert(reserveRequiredMessage);
                    return;
                }
            }
            reserveDateTime = postPayload['date'];

            if (!(postPayload['hour'])) {
                var $hourElement = $('#reserve-hour');
                reserveRequiredMessage = $hourElement.data('message');
                if (reserveRequiredMessage) {
                    $.layer.alert(reserveRequiredMessage);
                    return;
                }
            }
            reserveDateTime += postPayload['hour'];

            if (!(postPayload['minute'])) {
                var $minuteElement = $('#reserve-minute');
                reserveRequiredMessage = $minuteElement.data('message');
                if (reserveRequiredMessage) {
                    $.layer.alert(reserveRequiredMessage);
                    return;
                }
            }
            reserveDateTime += postPayload['minute'];
            postPayload.reserveOn = moment(reserveDateTime, 'YYYYMMDDHHmm').valueOf();
        }

        if ($wrap.data('posting')) {
            return;
        }

        $wrap.data('posting', true);

        $.ajax(host + 'article/post', {
            contentType: 'application/json',
            data: JSON.stringify(postPayload),
            method: 'POST',
            dataType: 'json',
            processData: true,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            }
        }).done(function(data) {
            if (data.article) {
                if(data.message != undefined){
                    $.layer.alert(data.message, {
                        closeCallback: function() {
                            window.location.href = $wrap.find('._article-confirm-list').data('listurl');
                        }
                    });

                }else{
                    window.location.href = succeedUrl.replace('{{ARTICLE}}', data.article);
                }
            }
        }).fail(function(jqXHR) {
            if (jqXHR.status === 406) {
                var response = jqXHR.responseText;
                if (!response) {
                    return;
                }
                var responseJSON = $.parseJSON(response);
                if (!(responseJSON && responseJSON.message)) {
                    return;
                }
                var message = responseJSON.message;
                if (message) {
                    message = message.replace(/\|B\|(.+)\|B\|/, '<strong class="point">$1</strong>')
                }
                $.layer.alert(message);
            }
            $wrap.data('posting', false);
        });
    }
    
    function postSomeWatchArticle($wrap, $attachImageWrap, $attachFileWrap, host, postData, succeedUrl) {
        if ($wrap.data('posting')) {
            return;
        }

        var postPayload = {imageList: [], attachList: []};
        var i, size;
        for (i = 0, size = postData.length; i < size; i++) {
            var data = postData[i];
            if (data.value === 'Y') {
                postPayload[data.name] = true;
            } else if (data.value === 'N') {
                postPayload[data.name] = false;
            } else {
                postPayload[data.name] = data.value;
            }
        }
        var $attachImageList = $attachImageWrap.find('._attach-img-thumb ._attach-img');
        var $mainAttachImage = $attachImageWrap.find('li._main-thumb').find($attachImageList);
        for (i = 0, size = $attachImageList.length; i < size; i++) {
            var $attachImage = $attachImageList.eq(i);
            var attachImageKey = $attachImage.data('file');
            if (attachImageKey) {
                postPayload.imageList.push({
                    file: attachImageKey,
                    main: $mainAttachImage.is($attachImage)
                });
            } else {
                postPayload.imageList.push({
                    url: $attachImage.prop('src'),
                    alt: $attachImage.prop('alt'),
                    size: $attachImage.data('size'),
                    type: $attachImage.data('type'),
                    origin: $attachImage.data('origin'),
                    main: $mainAttachImage.is($attachImage)
                });
            }
        }
        var $attachFileList = $attachFileWrap.find('._attach-file');
        for (i = 0, size = $attachFileList.length; i < size; i++) {
            var $attachFile = $attachFileList.eq(i);
            var attachFileKey = $attachFile.data('file');
            if (attachFileKey) {
                postPayload.attachList.push({
                    file: attachFileKey
                });
            } else {
                postPayload.attachList.push({
                    url: $attachFile.data('store'),
                    size: $attachFile.data('size'),
                    type: $attachFile.data('type'),
                    origin: $attachFile.data('origin')
                });
            }
        }
        // 제목이 입력되지 않은 경우.
        if (!(postPayload.title) || $.trim(postPayload.title).length === 0) {
            var titleRequired = $wrap.find('._article-title').data('required');
            if (titleRequired) {
                $.layer.alert(titleRequired);
                return;
            }
        }

        // 제목 입력 길이 체크 
        var $titleWrap = $wrap.find('._article-title');
        if ($titleWrap.length) {
            if ($titleWrap.val().length >= $titleWrap.data('maxlength')) {
                $titleWrap.val($titleWrap.val().substring(0, $titleWrap.data('maxlength')));
                $.layer.alert($titleWrap.data('exception'));
                $titleWrap.focus();
                return;
            }
        }

        // 작성자가 입력되지 않은 경우.
        if (!(postPayload.nickname) || $.trim(postPayload.nickname).length === 0) {
            var nicknameRequired = $wrap.find('._article-nickname').data('required');
            if (nicknameRequired) {
                $.layer.alert(nicknameRequired);
                return;
            }
        }
        
        // 내용이 입력되지 않은 경우.
        if (!postPayload.content) {
            var $content = $wrap.find('._article-content');
            if ($content.length && $content.is('._editor-required')) {
                postPayload.content = $content.froalaEditor('html.get');
            }
            // 에디터의 버그인지 content 에 조회가 안 되는 경우가 있어 다시 확인 처리. by etribe
        }
        if (!(postPayload.content) || editorContentIsEmpty(postPayload.content)) {
            var contentRequired = $wrap.find('._article-content').data('required');
            if (contentRequired) {
                $.layer.alert(contentRequired);
                return;
            }
        }

        // TODO : CMS 연동 필드
        var linkedItemCount = $wrap.find('input[name="linkedItemCount"]').val();
        for (var linkedLoop = 0; linkedLoop < linkedItemCount; linkedLoop++) {
        	if ($.trim($wrap.find('input[name="selectItem"]').eq(linkedLoop).val()).length === 0) {
        		var itemRequired = $wrap.find('input[name="selectItem"]').eq(linkedLoop).data('required');
                if (itemRequired) {
                    $.layer.alert(itemRequired);
                    return;
                }
        	}
        }
        
        if (postPayload.passwordKey !== undefined) {
        	if (!(postPayload.passwordKey) || $.trim(postPayload.passwordKey).length === 0) {
                var passwordRequired = $wrap.find('._article-password').data('required');
                if (passwordRequired) {
                    $.layer.alert(passwordRequired);
                    return;
                }
            }
        }
        
        var $checkAgree = $wrap.find('input[name="checkAgree"]');
        if ($checkAgree.length > 0) {
        	if ($checkAgree.prop("checked") == false) {
        		var agreeRequired = $checkAgree.data('required');
                if (agreeRequired) {
                    $.layer.alert(agreeRequired);
                    return;
                }
        	}
        }

        $wrap.data('posting', true);

        // TODO : 암호화 submit
        alert("TODO : 암호화 submit");
        /*
        $.ajax(host + 'article/post', {
            contentType: 'application/json',
            data: JSON.stringify(postPayload),
            method: 'POST',
            dataType: 'json',
            processData: true,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            }
        }).done(function(data) {
            if (data.article) {
                window.location.href = succeedUrl.replace('{{ARTICLE}}', data.article);
            }
        }).fail(function(jqXHR) {
            if (jqXHR.status === 406) {
                var response = jqXHR.responseText;
                if (!response) {
                    return;
                }
                var responseJSON = $.parseJSON(response);
                if (!(responseJSON && responseJSON.message)) {
                    return;
                }
                var message = responseJSON.message;
                if (message) {
                    message = message.replace(/\|B\|(.+)\|B\|/, '<strong class="point">$1</strong>')
                }
                $.layer.alert(message);
            }
        }).always(function() {
            $wrap.data('posting', false);
        });
        */
    }

    function articleShareSuccessHandler($target, boardHost, socialPlatform, submitData) {
        if ($target.data('loading')) {
            return;
        }
        $target.data('loading', true);
        $.ajax(boardHost + 'share/' + socialPlatform, {
            data: submitData,
            method: 'POST',
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            }
        }).done(function(data) {
            if (data.message) {
                if ($.layer) {
                    $.layer.alert(data.message);
                } else {
                    alert(data.message);
                }
            }
        }).always(function() {
            $target.data('loading', false);
        });
    }

    /**
     * 관리모드로 특정 항목들을 관리 설정한다.
     * @param $wrap
     * @param $checkboxItems
     * @param manageType
     */
    function manageArticleHandler($wrap, $checkboxItems, manageType) {
        if ($wrap.data('loading')) {
            return;
        }
        var manageURL = $wrap.data('url');
        if (!manageURL) {
            return;
        }
        var submitData = [{name: 'manage', value: manageType}];
        for (var i = 0, size = $checkboxItems.length; i < size; i++) {
            submitData.push({name: 'article', value: $checkboxItems.eq(i).val()});
        }
        $wrap.data('loading', true);

        $.ajax(manageURL + '/manage', {
            data: submitData,
            method: 'POST',
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function(data) {
            var pageIndex = $wrap.find('._pagination').data('current') || '1';
            if (data.message) {
                $.layer.alert(data.message, {
                    closeCallback: function() {
                        updatePaginationBoardList($wrap, pageIndex);
                    }
                });
            } else {
                updatePaginationBoardList($wrap, pageIndex);
            }
        }).always(function() {
            $wrap.data('loading', false);
        });
    }

    function manageArticleReportHandler($wrap, $checkboxItems) {
        if ($wrap.data('reporting')) {
            return;
        }
        $wrap.data('reporting', true);
        getReportOptionList().done(function(optionList) {
            var $layer = $.layer.open('template-content-report-manage', {options: optionList});
            $layer.on('click', '._content-report-btn', function() {
                if ($layer.data('reporting')) {
                    return;
                }
                var $option = $layer.find('._report-option');
                var $detail = $layer.find('._report-detail');
                var option = $option.val();
                if (!option) {
                    $.layer.alert($option.data('required'));
                    return;
                }
                var detail = $detail.val();
                var postData = [{name: 'manage', value: 'REPORT'}];
                for (var i = 0, size = $checkboxItems.length; i < size; i++) {
                    postData.push({name: 'article', value: $checkboxItems.eq(i).val()});
                }
                var submitData = $.merge([
                    {name: 'reason', value: option},
                    {name: 'detail', value: detail}
                ], postData);
                var manageURL = $wrap.data('url');
                if (!manageURL) {
                    return;
                }
                $layer.data('reporting', true);
                $.ajax(manageURL + '/manage', {
                    data: submitData,
                    method: 'POST',
                    dataType: 'json',
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    globalExceptionHandle: true
                }).done(function(data) {
                    var pageIndex = $wrap.find('._pagination').data('current') || '1';
                    if (data.message) {
                        $.layer.alert(data.message, {
                            closeCallback: function() {
                                updatePaginationBoardList($wrap, pageIndex);
                            }
                        });
                    } else {
                        updatePaginationBoardList($wrap, pageIndex);
                    }
                    $.layer.close($layer);
                }).always(function() {
                    $layer.data('reporting', false);
                });
            });
        }).always(function() {
            $wrap.data('reporting', false);
        });
    }

    function updateBoardArticleManageStatus($wrap, statusData, listUrl) {
        if ($wrap.data('managing')) {
            return;
        }
        var manageURL = $wrap.data('host');
        if (!manageURL) {
            return;
        }
        var $articleWrap = $wrap.find('._article-wrap');
        if (!$articleWrap.length) {
            return;
        }
        var board = $articleWrap.data('board');
        var article = $articleWrap.data('article');
        var submitData = [
            {name: 'board', value: board},
            {name: 'article', value: article}
        ];
        $.merge(submitData, statusData);
        $wrap.data('managing', true);

        $.ajax(manageURL + 'manage/status', {
            data: submitData,
            method: 'POST',
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function() {
            window.location.href = listUrl;
        }).fail(function() {
            $wrap.data('managing', false);
        });
    }

    $(document).ready(function() {
        var $boardWrapList = $('._paginate-board-wrap');
        if ($boardWrapList.length === 1) {
            // 게시물 말줄임 처리.
            boardListTitleEllipsisHandler($boardWrapList);

            // 게시판 운영원칙 팝업
            $boardWrapList.on('click', 'a._board-principle', function(event) {
                var $target = $(event.currentTarget);
                var targetUrl = $target.data('target');
                if (!targetUrl) {
                    return;
                }
                window.open(targetUrl, 'board_principle', 'width=550, height=600, scrollbars=yes');
            });

            // 게시판이 한 페이지에 1개가 있을 경우에만 처리되도록 함. by etribe
            $boardWrapList.on('click', '._pagination a', function(event) {
                var $target = $(event.currentTarget);
                var page = $target.data('page');
                if (page) {
                    updatePaginationBoardList($boardWrapList, page);
                }
            });

            //셀럽 페이징
            $boardWrapList.on('click', '._celebPrev,._celebNext', function() {
                updateCelebPaginationBoardList($boardWrapList, $(this).data('page'));
                return false;
            });


            $boardWrapList.on('click', '._article-manage', function() {
                updatePaginationBoardList($boardWrapList, 1, null, [{name: 'manage', value: true}]);
            });

            $boardWrapList.on('click', '._article-normal', function() {
                updatePaginationBoardList($boardWrapList, 1, null, [{name: 'manage', value: false}]);
            });

            $boardWrapList.on('keypress', 'input._board-filter-term', function(event) {
                if (event.keyCode === 13) {
                    updatePaginationBoardList($boardWrapList, 1);
                }
            });

            $boardWrapList.on('click', '._board-filter-btn', function() {
                updatePaginationBoardList($boardWrapList, 1);
            });

            $boardWrapList.on('click', '._board-refresh', function() {
                updatePaginationBoardList($boardWrapList, 1, true);
            });

            $boardWrapList.on('click', '._layout-tab', function(event) {
                var $target = $(event.currentTarget);
                var layout = $target.data('layout');
                if (layout) {
                    changePhotoTabContent($boardWrapList, layout);
                    // set layout cookie (레이아웃 기억하기)
                    var boardId = $boardWrapList.data('board');
                    var cookieValue = layout + '@' + boardId;
                    document.cookie = [
                        'photo.layout.remember', '=', cookieValue,
                        ';path=/'
                    ].join('');
                }
            });

            $boardWrapList.on('click', '._article-login-required', function(event) {
                var $target = $(event.currentTarget);
                var layout = $target.data('layout');

                var message = $target.data('required');
                var loginUrl = $target.data('url');
                if (message) {
                    $.layer.confirm(message, function (){
                        window.location.href = loginUrl;
                    });
                }
            });


            // 최초 로딩시 페이지 레이아웃이 기억된 내용이 있다면 해당 레이아웃으로 표시될 수 있도록 구현
            // get layout cookie (레이아웃 기억 되찾기)
            var photoLayoutRemember = (function(cookieData) {
                if (cookieData) {
                    var cookies = cookieData.split(';');
                    for(var c = 0, cSize = cookies.length; c < cSize; c++) {
                        var cookie = cookies[c];
                        while (cookie.charAt(0) == ' ') {
                            cookie = cookie.substring(1);
                        }
                        if (cookie.indexOf('photo.layout.remember') === 0) {
                            return cookie.substring('photo.layout.remember'.length + 1, cookie.length);
                        }
                    }
                }
                return '';
            })(document.cookie);
            if (photoLayoutRemember) {
                var validBoardId = $boardWrapList.data('board');
                photoLayoutRemember = photoLayoutRemember.replace('@' + validBoardId, '');
                var $layoutTabs = $boardWrapList.find('._layout-tab');
                var $targetTab = $layoutTabs.filter(function() {
                    return $(this).data('layout') === photoLayoutRemember;
                });
                if ($targetTab.length) {
                    var $activeTabLi = $targetTab.closest('li');
                    var $deactivateTabLis = $layoutTabs.not($targetTab).closest('li');
                    $activeTabLi.addClass('on');
                    $deactivateTabLis.removeClass('on');
                    changePhotoTabContent($boardWrapList, photoLayoutRemember);
                }
            }

            // 관리모드 관련 코드
            // 전체 선택 버튼
            $boardWrapList.on('click', '#manage-checkbox-all,._article-manage-select-all', function(event) {
                var $target = $(event.currentTarget);
                var checkboxChecked = true;
                if ($target.is('#manage-checkbox-all')) {
                    checkboxChecked = $target.prop('checked');
                }
                var $checkboxElement = $boardWrapList.find('#manage-checkbox-all,input._manage-item').filter(function() {
                    return !this.disabled;
                });
                $checkboxElement.prop('checked', checkboxChecked);
                for (var i = 0, size = $checkboxElement.length; i < size; i++) {
                    var checkboxUiControl = $checkboxElement.eq(i).data('checkbox');
                    if (checkboxUiControl && typeof checkboxUiControl.refresh === 'function') {
                        checkboxUiControl.refresh();
                    }
                }
            });

            // 개별 선택 버튼
            $boardWrapList.on('click', 'input._manage-item', function(event) {
                var $target = $(event.currentTarget);
                var allChecked = true;
                if ($target.prop('checked')) {
                    var $checkboxItems = $boardWrapList.find('input._manage-item').filter(function() {
                        return !this.disabled;
                    });
                    for (var i = 0, size = $checkboxItems.length; i < size; i++) {
                        if (!$checkboxItems[i].checked) {
                            allChecked = false;
                            break;
                        }
                    }
                } else {
                    allChecked = false;
                }
                var $checkboxAll = $boardWrapList.find('#manage-checkbox-all');
                $checkboxAll.prop('checked', allChecked);
                var checkboxUiControl = $checkboxAll.data('checkbox');
                if (checkboxUiControl && typeof checkboxUiControl.refresh === 'function') {
                    checkboxUiControl.refresh();
                }
            });

            // 신고 / 신고해제 / 비노출 버튼 클릭
            $boardWrapList.on('click', '._article-manage-report,._article-manage-report-release,._article-manage-hide', function(event) {
                var $target = $(event.currentTarget);
                var $checkboxItems = $boardWrapList.find('input._manage-item').filter(function() {
                    return !this.disabled && this.checked;
                });
                var message;
                if ($checkboxItems.length) {
                    message = $target.data('confirm');
                    var confirmHandler = function() {
                        manageArticleHandler($boardWrapList, $checkboxItems, 'HIDE');
                    };
                    if ($target.is('._article-manage-report')) {
                        confirmHandler = function() {
                            manageArticleReportHandler($boardWrapList, $checkboxItems);
                        };
                    } else if ($target.is('._article-manage-report-release')) {
                        confirmHandler = function() {
                            manageArticleHandler($boardWrapList, $checkboxItems, 'REPORT_RELEASE');
                        };
                    }
                    if (message) {
                        $.layer.confirm(message, confirmHandler);
                    } else {
                        confirmHandler();
                    }
                } else {
                    // 선택된 항목이 존재하지 않을 경우.
                    message = $target.data('required');
                    if (message) {
                        $.layer.alert(message);
                    }
                }
            });

            // 공지 게시물 순서 조정.
            $boardWrapList.on('click', '._notice-order-up,._notice-order-down', function(event) {
                var $target = $(event.currentTarget);
                var noticeKey = $target.data('notice');
                var toUp = $target.is('._notice-order-up');

                var message = null;
                var $row = $target.closest('tr');
                if (toUp) {
                    message = $row.data('up');
                } else {
                    message = $row.data('down');
                }
                if (message) {
                    $.layer.alert(message);
                    return;
                }

                var manageURL = $boardWrapList.data('url');
                if (!manageURL) {
                    return;
                }
                var submitData = [{name: 'notice', value: noticeKey}, {name: 'direction', value: toUp ? 'UP' : 'DOWN'}];
                if ($boardWrapList.data('ordering')) {
                    return;
                }
                $boardWrapList.data('ordering', true);

                $.ajax(manageURL + '/order', {
                    data: submitData,
                    method: 'POST',
                    dataType: 'json',
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    globalExceptionHandle: true
                }).done(function(data) {
                    var pageIndex = $boardWrapList.find('._pagination').data('current') || '1';
                    if (data.message) {
                        $.layer.alert(data.message, {
                            closeCallback: function() {
                                updatePaginationBoardList($boardWrapList, pageIndex);
                            }
                        });
                    } else {
                        updatePaginationBoardList($boardWrapList, pageIndex);
                    }
                }).always(function() {
                    $boardWrapList.data('ordering', false);
                });
            });
        }

        var $boardWrapDetail = $('._article-detail-wrap');
        if ($boardWrapDetail.length === 1) {
            // 게시물이 한 페이지에 1개가 있을 경우에만 처리되도록 함. by etribe
            $boardWrapDetail.on('click', '._article-recommend', function(event) {
                var $target = $(event.currentTarget);
                if ($target.is('._log-exist')) {
                    var message = $target.data('message');
                    if (message) {
                        $.layer.alert(message, {
                            closeCallback: function() {
                                $target.focus();
                            }
                        });
                    }
                    return;
                }
                updateBoardArticleRecommendCount($boardWrapDetail, $target);
            });

            // 게시물에 첨부파일이 있는 경우
            var $attachmentWrap = $boardWrapDetail.find('._board-download-attachment-wrap');
            if ($attachmentWrap.length) {
                var $attachmentLayer = $attachmentWrap.find('._attachment-layer');
                if ($attachmentLayer.length) {
                    var $body = $(document.body);
                    var layerExternalClickHandler = function(event) {
                        var $target = $(event.originalEvent.target);
                        if (!$target.length) {
                            $target = $(event.originalEvent.srcElement);
                        }
                        if ($target.is($attachmentLayer) || $target.closest($attachmentLayer).length
                            || $target.is($attachmentWrap) || $target.closest($attachmentWrap).length) {
                            return true;
                        }

                        $body.off('click', layerExternalClickHandler);
                        $attachmentLayer.removeClass('on');
                    };

                    $attachmentWrap.on('click', '._download-btn', function() {
                        $body.on('click', layerExternalClickHandler);
                        $attachmentLayer.addClass('on');
                    });
                    $attachmentWrap.on('click', '._layer-close', function() {
                        $body.off('click', layerExternalClickHandler);
                        $attachmentLayer.removeClass('on');
                        var $downloadButton = $attachmentWrap.find('._download-btn');
                        if ($downloadButton.length) {
                            $downloadButton.focus();
                        }
                    });
                    $attachmentLayer.on('click', 'a._attachment', function(event) {
                        var $target = $(event.currentTarget);
                        var attachment = $target.data('file');
                        if (attachment) {
                            attachmentDownloader($boardWrapDetail, attachment);
                        }
                    });
                }
            }

            $boardWrapDetail.on('click', '._article-report', function() {
                var boardHost = $boardWrapDetail.data('host');
                var $article = $boardWrapDetail.find('._article-wrap');
                var postData = [
                    {name: 'board', value: $article.data('board')},
                    {name: 'article', value: $article.data('article')}
                ];
                showArticleReportForm($boardWrapDetail, boardHost, postData);
            });

            $boardWrapDetail.on('click', '._article-delete', function(event) {
                var $target = $(event.currentTarget);
                var message = $target.data('message');
                if (message) {
                    $.layer.confirm(message, function() {
                        var boardHost = $boardWrapDetail.data('host');
                        var listUrl = $boardWrapDetail.find('._article-list').prop('href');
                        var $article = $boardWrapDetail.find('._article-wrap');
                        var postData = [
                            {name: 'board', value: $article.data('board')},
                            {name: 'article', value: $article.data('article')},
                            {name: 'celeb', value : $article.data('celeb')}
                        ];
                        deleteArticle($boardWrapDetail, boardHost, postData, listUrl);
                    });
                }
            });

            // 게시물 공유 기능
            $boardWrapDetail.on('click', '._board-share-social-wrap ._share-facebook', function() {
                var submitData = $.social.postDefaults(false);
                $.social.facebookShare(submitData.link);
            });

            $boardWrapDetail.on('click', '._board-share-social-wrap ._share-twitter', function(event) {
                var boardHost = $boardWrapDetail.data('host');
                if (!boardHost) {
                    boardHost = $('._board-share-social-wrap').data('host');
                    if (!boardHost) {
                        return;
                    }
                }

                var $target = $(event.currentTarget);

                $.social.twitterConnect();

                var twitterCheckCount = 0;
                var twitterShare = function() {
                    var accessToken = $.social.twitterAccessToken();
                    if (accessToken) {
                        var strProgramTitle = $('meta[property="programTitle"]').attr('content');
                        if(strProgramTitle != undefined && strProgramTitle != null)
                            strProgramTitle = " #JTBC #"+strProgramTitle.replace(/ /gi, "_");
                        else
                            strProgramTitle = "";

                        var strBoardTitle = $('meta[property="og:boardTitle"]').attr('content');
                        if(strBoardTitle != undefined && strBoardTitle != null && strBoardTitle != "")
                            strBoardTitle = "["+ strBoardTitle + "]";
                        else
                            strBoardTitle = "";

                        var submitData = $.social.postDefaults();
                        submitData['token'] = accessToken;
                        submitData['content'] = strBoardTitle + submitData['title']+strProgramTitle;
                        submitData['title'] = null;
                        articleShareSuccessHandler($target, boardHost, 'twitter', submitData);
                        return;
                    }
                    twitterCheckCount++;
                    if (twitterCheckCount > 1000 * 60 * 10) {
                        if (console && console.log) {
                            console.log('occur twitter access token exception');
                        }
                        return;
                    }
                    setTimeout(twitterShare, 1000);
                };

                twitterShare();
            });

            $boardWrapDetail.on('click', '._board-share-social-wrap ._share-kakaostory', function() {
                var boardHost = $boardWrapDetail.data('host');
                if (!boardHost) {
                    boardHost = $('._board-share-social-wrap').data('host');
                    if (!boardHost) {
                        return;
                    }
                }
                var $target = $(event.currentTarget);

                $.social.kakaoConnect();
                var accessToken = $.social.kakaoAccessToken();
                Kakao.Auth.login({
                    success: function(authObj) {
                        accessToken = Kakao.Auth.getAccessToken();
                        kakaoShare();
                    },
                    fail: function(err) {
                        console.log(JSON.stringify(err));
                    }
                });

                var kakaoShare = function() {
                    if (accessToken) {
                        var submitData = $.social.postDefaults(true);
                        submitData['token'] = accessToken;
                        submitData['content'] = submitData['content'];
                        submitData['title'] = submitData['title'];
                        articleShareSuccessHandler($target, boardHost, 'kakaostory', submitData);
                        return;
                    }
                }
            });

            $boardWrapDetail.on('click', '._board-share-social-wrap ._share-naver', function() {
                var boardHost = $boardWrapDetail.data('host');
                if (!boardHost) {
                    boardHost = $('._board-share-social-wrap').data('host');
                    if (!boardHost) {
                        return;
                    }
                }

                $.social.naverConnect();
                var $target = $(event.currentTarget);

                var naverCheckCount = 0;
                var naverShare = function() {
                    var accessToken = $.social.naverAccessToken();
                    if (accessToken) {
                        var submitData = $.social.postDefaults(true);
                        submitData['token'] = accessToken;
                        articleShareSuccessHandler($target, boardHost, 'naver', submitData);
                        return;
                    }
                    naverCheckCount++;
                    if (naverCheckCount > 1000 * 60 * 10) {
                        if (console && console.log) {
                            console.log('occur naver access token exception');
                        }
                        return;
                    }
                    setTimeout(naverShare, 1000);
                };

                naverShare();
            });

            if (window['Clipboard']) {
                var clipboard = new Clipboard('._share-clipboard-url', {
                    text: function() {
                        var data = $.social.postDefaults();
                        if (data.link) {
                            return data.link;
                        }
                        return '';
                    }
                });
                clipboard.on('success', function(e) {
                    var $trigger = $(e.trigger);
                    var message = $trigger.data('message');
                    if (message) {
                        if ($.layer) {
                            $.layer.alert(message, {
                                closeCallback: function() {
                                    $trigger.focus();
                                }
                            });
                        } else {
                            alert(message);
                        }
                    }
                });
            } else {
                // IE 8 대응
                $boardWrapDetail.on('click', '._share-clipboard-url', function(event) {
                    var $trigger = $(event.currentTarget);
                    var data = $.social.postDefaults();
                    var clipboardText = '';
                    if (data.link) {
                        clipboardText = data.link;
                    }
                    if (window.clipboardData && window.clipboardData.setData) {
                        window.clipboardData.setData('Text', clipboardText);
                        var message = $trigger.data('message');
                        if (message) {
                            if ($.layer) {
                                $.layer.alert(message, {
                                    closeCallback: function() {
                                        $trigger.focus();
                                    }
                                });
                            } else {
                                alert(message);
                            }
                        }
                    }
                });
            }

            // 게시물 관리 취소버튼 클릭
            $boardWrapDetail.on('click', '._article-manage-cancel', function(event) {
                var $target = $(event.currentTarget);
                var listUrl = $target.data('listurl');
                if (!listUrl) {
                    return;
                }
                var message = $target.data('message');
                if (message) {
                    $.layer.confirm(message, function() {
                        window.location.href = listUrl;
                    });
                } else {
                    window.location.href = listUrl;
                }
            });

            // 게시물 관리 저장버튼 클릭
            var $manageModify = $boardWrapDetail.find('._article-manage-modify');
            if ($manageModify.length) {
                var snapshot = {
                    'report': $boardWrapDetail.find('#report-y').prop('checked'),
                    'topfix': $boardWrapDetail.find('#top-fix-yn').prop('checked'),
                    'hide': $boardWrapDetail.find('#hide-yn').prop('checked')
                };
                $manageModify.on('click', function(event) {
                    var $report = $boardWrapDetail.find('#report-y');
                    var report = $report.prop('checked');
                    var $topFix = $boardWrapDetail.find('#top-fix-yn');
                    var topFix = $topFix.prop('checked');
                    var hide = $boardWrapDetail.find('#hide-yn').prop('checked');
                    var hasChanged = (snapshot.report !== report || snapshot.topfix !== topFix || snapshot.hide !== hide);
                    var message;
                    if (!hasChanged) {
                        message = $manageModify.data('nochange');
                        $.layer.alert(message);
                        return;
                    }
                    var submitData = [];
                    if (report !== snapshot.report) {
                        // 현재 신고가 선택된 상태이고, 이전에 신고가 선택된 상태가 아니라면.
                        submitData.push({name: 'report', value: report});
                        if (report) {
                            var reasonCode = $report.data('reason');
                            var reasonDetail = $report.data('reasonDetail');
                            submitData.push({name: 'reason', value: reasonCode});
                            submitData.push({name: 'detail', value: reasonDetail});
                        }
                    }
                    if (topFix !== snapshot.topfix) {
                        if (topFix && hide) {
                            var validation = $topFix.data('invalid');
                            $.layer.alert(validation);
                            return;
                        }
                        submitData.push({name: 'topfix', value: topFix});
                    }
                    if (hide !== snapshot.hide) {
                        submitData.push({name: 'hide', value: hide});
                    }
                    message = $manageModify.data('message');
                    var $target = $(event.currentTarget);
                    var listUrl = $target.data('listurl');
                    if (message) {
                        $.layer.confirm(message, function() {
                            updateBoardArticleManageStatus($boardWrapDetail, submitData, listUrl);
                        });
                    } else {
                        updateBoardArticleManageStatus($boardWrapDetail, submitData, listUrl);
                    }
                });
            }

            var customUiRefreshHandler = function($element) {
                var radioBox = $element.data('radio');
                if (radioBox && typeof radioBox['refresh'] === 'function') {
                    radioBox.refresh();
                    return;
                }
                var checkBox = $element.data('checkbox');
                if (checkBox && typeof checkBox['refresh'] === 'function') {
                    checkBox.refresh();
                }
            };

            // 게시물 신고 기능 클릭시
            $boardWrapDetail.on('click', '#report-y', function(event) {
                var $target = $(event.currentTarget);
                showArticleReportForm($boardWrapDetail, null, null, $target, function() {
                    var $reportN = $boardWrapDetail.find('#report-n');
                    $reportN.prop('checked', true);
                    customUiRefreshHandler($target);
                    customUiRefreshHandler($reportN);
                });
            });

            // 게시물 비노출 클릭시
            $boardWrapDetail.on('click', '#hide-yn', function(event) {
                var $target = $(event.currentTarget);
                if ($target.prop('checked')) {
                    var message = $target.data('message');
                    if (message) {
                        $.layer.confirm(message, function() {
                            var $reportY = $boardWrapDetail.find('#report-y');
                            var $reportN = $boardWrapDetail.find('#report-n');
                            $reportY.prop('disabled', true);
                            $reportN.prop('checked', true).prop('disabled', true);
                            var $topFixYN = $boardWrapDetail.find('#top-fix-yn');
                            $topFixYN.prop('checked', false).prop('disabled', true);
                            customUiRefreshHandler($reportY);
                            customUiRefreshHandler($reportN);
                            customUiRefreshHandler($topFixYN);
                        }, {
                            closeCallback: function() {
                                $target.prop('checked', false);
                                customUiRefreshHandler($target);
                            }
                        });
                    }
                } else {
                    var $reportY = $boardWrapDetail.find('#report-y');
                    var $reportN = $boardWrapDetail.find('#report-n');
                    $reportY.prop('disabled', false);
                    $reportN.prop('disabled', false);
                    var $topFixYN = $boardWrapDetail.find('#top-fix-yn');
                    $topFixYN.prop('disabled', false);
                    customUiRefreshHandler($reportY);
                    customUiRefreshHandler($reportN);
                    customUiRefreshHandler($topFixYN);
                }
            });
        }

        var $boardWrapEdit = $('._article-edit-wrap');
        if ($boardWrapEdit.length) {
            // 에디터 초기화.
            var $editorRequired = $boardWrapEdit.find('._editor-required');
            if ($.fn.ckeditor) {
                var editorStyles = [];
                var linkElements = document.getElementsByTagName('link');
                for (var i = 0, size = linkElements.length; i < size; i++) {
                    var $link = $(linkElements[i]);
                    if ($link.data('editor')) {
                        editorStyles.push($link.prop('href'));
                    }
                }
                var height = $editorRequired.eq(0).height();
                $editorRequired.ckeditor({
                    height: height,
                    contentsCss: editorStyles
                });
            } else if ($.fn.froalaEditor) {
                var editorToolbarButtons = ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|',
                    'fontFamily', 'fontSize', 'color', '|',
                    'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '|',
                    'insertLink', 'insertTable', 'undo', 'redo', '|', 'html'];
                $editorRequired.froalaEditor({
                    language: 'ko',
                    theme: 'jtbc',
                    heightMin: $editorRequired.eq(0).height(),
                    toolbarButtons: editorToolbarButtons,
                    toolbarButtonsMD: editorToolbarButtons,
                    toolbarButtonsSM: editorToolbarButtons,
                    toolbarButtonsXS: editorToolbarButtons,
                    imageEditButtons: ['imageAlign', 'imageRemove', '|', 'imageLink', 'linkOpen', 'linkEdit', 'linkRemove', '-', 'imageDisplay', 'imageStyle', 'imageAlt', 'imageSize'],
                    imageDefaultWidth: 0,
                    toolbarSticky: false,
                    tabSpaces: false
                });
            }

            var $articleForm = $boardWrapEdit.find('._article-form');
            var boardHost = $boardWrapEdit.data('host');
            var boardId = $articleForm.data('board');
            if (!(boardHost && boardId)) {
                return;
            }

            // 이미지 첨부 기능
            var imageTemplateSource = $('#template-article-image').html();
            var $attachImageWrap =$boardWrapEdit.find('._editor-attach-img-wrap');
            if (imageTemplateSource) {
                var imageAttachTemplate = Handlebars.compile(imageTemplateSource);
                $boardWrapEdit.on('click', 'a._upload-img-editor', function(event) {
                    var $layer = $.layer.open('template-image-uploader', {insertEditor: true, enablePosition: true});
                    var $target = $(event.currentTarget);
                    $layer.on('click', '._layer-close', function() {
                        $.layer.close($layer);
                        $target.focus();
                    });
                    var $uploadFile = $layer.find('._upload-file');

                    if ($uploadFile.length) {
                        $uploadFile.on('change', function(event) {
                            var $fileInput = $(event.currentTarget);

                            if(this.files[0].size > 5120000) {
                                alert("5M 이하 사진 파일만 가능합니다.");
                                return false;
                            }

                            var filename = $fileInput.val().split('/').pop().split('\\').pop();
                            var $input = $fileInput.closest('._upload-file-wrap').find('input[type="text"]');
                            if ($input.length) {
                                $input.val(filename);
                            }
                            $fileInput.addClass('_upload-pending');
                        });

                        $layer.on('click', '._upload-image-file', function() {
                            var $maxWidth = $layer.find('select._max-width-option');
                            var formData = {
                                board: boardId,
                                'article': true,
                                'max-width': $maxWidth.val()
                            };
                            var $position = $layer.find('select._position-option');

                            var $fileInput = $('<input type="file" style="display:none;"/>');
                            $layer.append($fileInput);
                            $.uploader($fileInput, $layer.find('._upload-pending'), boardHost + 'upload/image', formData).done(function(data) {
                                var $imageComment = $layer.find('textarea._img-comment');
                                var imageAlt = $imageComment.val();


                                var html = imageAttachTemplate({source: data.url, alt: imageAlt, size: data.size, type: data.type, origin: data.origin});
                                $attachImageWrap.append(html);
                                editArticleMainThumbnailHandler($attachImageWrap);
                                // 에디터에 이미지 추가.
                                var align = $position.val();
                                var alignClass;
                                if (align === 'LEFT') {
                                    alignClass = 'fr-fil';
                                } else if (align === 'RIGHT') {
                                    alignClass = 'fr-fir';
                                } else  {
                                    alignClass = 'fr-fic';
                                }
                                var imageHtml = '<img src="' + data.url + '" alt="' + imageAlt.replace(/\\"/g, '&quot;') + '" class="fr-dib ' + alignClass + '"/>';
                                if ($.fn.ckeditor) {
                                    var editorInstance = $.map(CKEDITOR.instances, function(editor, name) {
                                        return name;
                                    });
                                    if (editorInstance.length === 1) {
                                        CKEDITOR.instances[editorInstance[0]].insertHtml(imageHtml);
                                    }
                                } else if ($.fn.froalaEditor) {
                                    $editorRequired.froalaEditor('html.insert', imageHtml, true);
                                }
                                $.layer.close($layer);
                            });
                        });
                    }
                });

                // 첨부 이미지 삭제 버튼 클릭시
                $attachImageWrap.on('click', 'a._attach-img-del', function(event) {
                    var $target = $(event.currentTarget);
                    var $item = $target.closest('li');
                    $item.remove();
                    editArticleMainThumbnailHandler($attachImageWrap);
                    // TODO 에디터에서 해당 이미지 삭제 필요?
                });

                // 첨부 이미지 대표 이미지 수정시
                $attachImageWrap.on('click', '._attach-img-thumb', function(event) {
                    var $target = $(event.currentTarget);
                    var $mainThumbnail = $attachImageWrap.find('li._main-thumb');
                    if ($mainThumbnail.find($target).length) {
                        // 현재 클릭된 이미지가 대표 이미지라면.
                        return;
                    }
                    var $attachImageList = $attachImageWrap.children('li');
                    var $currentImageItem = $attachImageList.find($target).closest($attachImageList);
                    editArticleMainThumbnailHandler($attachImageWrap, $currentImageItem);
                });
            }

            // 링크 페이지 추가
            $boardWrapEdit.on('click', 'a._attach-link-editor', function(event) {
                var $layer = $.layer.open('template-link-attach');
                var $target = $(event.currentTarget);
                $layer.on('click', '._layer-close', function() {
                    $.layer.close($layer);
                    $target.focus();
                });

                $layer.on('click', '._attach-link-preview', function() {
                    var $input = $layer.find('._url-input');
                    var inputUrl = $input.val();
                    if (!inputUrl) {
                        $.layer.alert($input.data('required'));
                        return;
                    }

                    if (!/^(http(s)?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?.*)?$/i.test(inputUrl)) {
                        $.layer.alert($input.data('invalid'));
                        return;
                    }

                    if (!/^http.+/i.test(inputUrl)) {
                        inputUrl = 'http://' + inputUrl;
                    }
                    insertAttachLinkPreviewToEditor($layer, $editorRequired, boardHost, inputUrl);
                });
            });

            // 파일 첨부 기능
            var attachTemplateSource = $('#template-article-file').html();
            var $attachFileWrap =$boardWrapEdit.find('._editor-attach-file-wrap');
            if (attachTemplateSource) {
                var fileAttachTemplate = Handlebars.compile(attachTemplateSource);
                var maxSize = $attachFileWrap.data('max') || 50;

                $boardWrapEdit.on('click', 'a._upload-file-editor', function(event) {
                    var $layer = $.layer.open('template-file-uploader', {maxSize: maxSize});
                    var $target = $(event.currentTarget);
                    $layer.on('click', '._layer-close', function() {
                        $.layer.close($layer);
                        $target.focus();
                    });
                    var $uploadFile = $layer.find('._upload-file');
                    if ($uploadFile.length) {
                        $uploadFile.on('change', function(event) {
                            var $fileInput = $(event.currentTarget);
                            var filename = $fileInput.val().split('/').pop().split('\\').pop();
                            var $input = $fileInput.closest('._upload-file-wrap').find('input[type="text"]');
                            if ($input.length) {
                                $input.val(filename);
                            }
                            $fileInput.addClass('_upload-pending');
                        });

                        $layer.on('click', '._upload-attach-file', function() {
                            var formData = {
                                board: boardId
                            };

                            var $fileInput = $('<input type="file" style="display:none;"/>');
                            $layer.append($fileInput);
                            $.uploader($fileInput, $layer.find('._upload-pending'), boardHost + 'upload/attach', formData).done(function(data) {
                                var html = fileAttachTemplate({source: data.url, size: {value: data.size, label: data.sizeLabel}, type: data.type, origin: data.origin});
                                $attachFileWrap.append(html);
                                $.layer.close($layer);
                            });
                        });
                    }
                });

                // 첨부 파일 삭제 버튼 클릭시
                $attachFileWrap.on('click', 'a._attach-file-del', function(event) {
                    var $target = $(event.currentTarget);
                    var $item = $target.closest('li');
                    $item.remove();
                });
            }

            $boardWrapEdit.on('click', '._article-preview', function() {
                var previewContext = {title: '', content: '', sensitive: null};
                var postData = $articleForm.serializeArray();
                var sensitiveDefault = [];
                var sensitiveCustom = [];
                var inputElement, columnLabel;
                for (var i = 0, size = postData.length; i < size; i++) {
                    var postDataName = postData[i].name;
                    if (postDataName === 'title') {
                        previewContext.title = postData[i].value;
                    } else if (postDataName === 'content') {
                        previewContext.content = postData[i].value;
                    } else if (postDataName.indexOf('input-default-') === 0) {
                        inputElement = document.getElementById(postDataName);
                        if (inputElement) {
                            columnLabel = $(inputElement).prop('title') || '';
                            sensitiveDefault.push({label: columnLabel, value: postData[i].value});
                        }
                    } else if (postDataName.indexOf('input-custom-') === 0) {
                        inputElement = document.getElementById(postDataName);
                        if (inputElement) {
                            columnLabel = $(inputElement).prop('title') || '';
                            sensitiveCustom.push({label: columnLabel, value: postData[i].value});
                        }
                    }
                }
                if (!(previewContext.content)) {
                    var $content = $boardWrapEdit.find('._article-content');
                    if ($content.length && $content.is('._editor-required')) {
                        if ($.fn.ckeditor) {
                            previewContext.content = $content.val();
                        } else if ($.fn.froalaEditor) {
                            previewContext.content = $content.froalaEditor('html.get');
                        }
                    }
                }
                if (sensitiveDefault.length || sensitiveCustom.length) {
                    previewContext.sensitive = {
                        defaults: sensitiveDefault,
                        custom: sensitiveCustom,
                        caption: $('#article-add-input-table').find('caption').text()
                    };
                }
                $.layer.open('template-preview-article', previewContext);
            });

            $boardWrapEdit.on('click', '._article-post', function(event) {
                var $target = $(event.currentTarget);
                var redirectUrl = $target.data('succeed');

                if($('input[name="celebArticleYn"]').length){
                    $('input[name="nickname"]').val($('[name="celebNo"] option:selected').text());

                    if($('input[name="celebArticleYn"]').prop('checked')){
                        $('input[name="celebArticleYn"]').val('Y');
                    }else{
                        $('input[name="celebArticleYn"]').val('N');
                    }
                }

                postSomeArticle($boardWrapEdit, $attachImageWrap, $attachFileWrap, boardHost, $articleForm.serializeArray(), redirectUrl);
            });

            // 소셜 토글
            $boardWrapEdit.on('click', '._post-social', function(event) {
                var $target = $(event.currentTarget);
                if (!$target.prop('checked')) {
                    return;
                }

                var platform = $target.data('social');
                if (platform === 'facebook' && $.social) {
                    $.social.facebookConnect().done(function(accessToken) {
                        $target.data('token', accessToken);
                    });
                } else if (platform === 'twitter' && $.social) {
                    $.social.twitterConnect();
                }
            });

            // 글 작성 취소시
            $boardWrapEdit.on('click', '._article-confirm-list', function(event) {
                var $target = $(event.currentTarget);
                var listUrl = $target.data('listurl');
                if (!listUrl) {
                    return;
                }
                var message = $target.data('message');
                if (message) {
                    $.layer.confirm(message, function() {
                        window.location.href = listUrl;
                    });
                } else {
                    window.location.href = listUrl;
                }
            });

            // 공지사항 예약 기능 활성/바활성
            var $reserveOn = $('#reserve-on');
            if ($reserveOn.length) {
                var $noticeOn = $('#notice-on');
                var $noticeOff = $('#notice-off');
                var $reserveOff = $('#reserve-off');
                var $reserveDate = $('#reserve-date');
                var $reserveDateWrap = $reserveDate.closest('._calendar-wrap');
                var $reserveHour = $('#reserve-hour');
                var $reserveMinute = $('#reserve-minute');

                var customUiRefreshHandler = function($element) {
                    var selectBox = $element.data('selectbox');
                    if (selectBox && typeof selectBox['refresh'] === 'function') {
                        selectBox.refresh();
                        return;
                    }
                    var radioBox = $element.data('radio');
                    if (radioBox && typeof radioBox['refresh'] === 'function') {
                        radioBox.refresh();
                    }
                };

                if ($.fn.jtbcDatePicker) {
                    $reserveDateWrap.data('current', $reserveDate.val());
                    $reserveDateWrap.jtbcDatePicker({
                        'disable': function() {
                            return $reserveDate.prop('disabled');
                        },
                        'onselect': function(dateText) {
                            var inputValue, display;
                            if (dateText) {
                                var selected = moment(dateText, 'YYYYMMDD');
                                inputValue = selected.format('YYYYMMDD');
                                display = selected.format($reserveDateWrap.data('format'));
                            } else {
                                inputValue = '';
                                display = $reserveDateWrap.data('label');
                            }

                            $reserveDateWrap.data('current', inputValue);
                            $reserveDate.val(inputValue);
                            $reserveDateWrap.find('._calendar-display').html(display);
                        }
                    });
                }

                $noticeOn.on('click', function() {
                    $reserveOn.prop('disabled', false);
                    $reserveOff.prop('disabled', false);
                    var reserveOn = !$reserveOn.prop('checked');
                    $reserveDate.prop('disabled', reserveOn);
                    $reserveHour.prop('disabled', reserveOn);
                    $reserveMinute.prop('disabled', reserveOn);
                    customUiRefreshHandler($reserveOn);
                    customUiRefreshHandler($reserveOff);
                    customUiRefreshHandler($reserveDate);
                    customUiRefreshHandler($reserveHour);
                    customUiRefreshHandler($reserveMinute);
                    if ($reserveDate.prop('disabled')) {
                        $reserveDateWrap.addClass('disabled');
                        $reserveDateWrap.find('._calendar-display').html($reserveDateWrap.data('label'));
                        $reserveDateWrap.data('current', '');
                    } else {
                        $reserveDateWrap.removeClass('disabled');
                    }
                });

                $noticeOff.on('click', function() {
                    $reserveOn.prop('disabled', true);
                    $reserveOff.prop('checked', true).prop('disabled', true);
                    $reserveDate.prop('disabled', true);
                    $reserveHour.prop('disabled', true).val('');
                    $reserveMinute.prop('disabled', true).val('');
                    customUiRefreshHandler($reserveOn);
                    customUiRefreshHandler($reserveOff);
                    customUiRefreshHandler($reserveDate);
                    customUiRefreshHandler($reserveHour);
                    customUiRefreshHandler($reserveMinute);
                    $reserveDateWrap.addClass('disabled');
                    $reserveDateWrap.find('._calendar-display').html($reserveDateWrap.data('label'));
                    $reserveDateWrap.data('current', '');
                });

                $reserveOn.on('click', function() {
                    $reserveDate.prop('disabled', false);
                    $reserveHour.prop('disabled', false);
                    $reserveMinute.prop('disabled', false);
                    customUiRefreshHandler($reserveDate);
                    customUiRefreshHandler($reserveHour);
                    customUiRefreshHandler($reserveMinute);
                    $reserveDateWrap.removeClass('disabled');
                });
                $reserveOff.on('click', function() {
                    $reserveDate.prop('disabled', true);
                    $reserveHour.prop('disabled', true).val('');
                    $reserveMinute.prop('disabled', true).val('');
                    customUiRefreshHandler($reserveDate);
                    customUiRefreshHandler($reserveHour);
                    customUiRefreshHandler($reserveMinute);
                    $reserveDateWrap.addClass('disabled');
                    $reserveDateWrap.find('._calendar-display').html($reserveDateWrap.data('label'));
                    $reserveDateWrap.data('current', '');
                });
            }
            
            // TODO : 방청신청 게시판 등록
            $boardWrapEdit.on('click', '._article-watch-post', function(event) {
                var $target = $(event.currentTarget);
                var redirectUrl = $target.data('succeed');
                postSomeWatchArticle($boardWrapEdit, $attachImageWrap, $attachFileWrap, boardHost, $articleForm.serializeArray(), redirectUrl);
            });
        }

        function postSomeApplicationArticle($wrap, pageIndex, host, subject, allYn, manage, openType){
            var submitData = [];
            subject = subject==""||subject==undefined?0:subject;

            submitData.push({name: 'page', value: pageIndex});
            submitData.push({name: 'subject', value: subject});
            submitData.push({name: 'allYn', value: allYn});
            submitData.push({name: 'manage', value: manage});
            submitData.push({name: 'openType', value: openType});

            if(manage)
                document.cookie = ['ticket.list.manage', '=', 'Y',';path=/'].join('');
            else
                document.cookie = ['ticket.list.manage', '=', 'N',';path=/'].join('');

            document.cookie = ['ticket.list.all', '=', allYn,';path=/'].join('');

            var $lyaer_loading;

            if($.layer != undefined)
                $lyaer_loading = $.layer.open('template-loading');

            $.ajax(host, {
                data: submitData,
                method: 'POST',
                dataType: 'html',
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                globalExceptionHandle: true
            }).done(function(data) {
                $wrap.html(data);

                if(allYn == "Y"){
                    $('._my_board').removeClass('hidden');
                    $('._all_board').addClass('hidden');
                }else{
                    $('._my_board').addClass('hidden');
                    $('._all_board').removeClass('hidden');
                }


            }).always(function() {
                if($.layer != undefined)
                    $.layer.close($lyaer_loading);
            });
        }

        //신청 리스트 템플릿
        var $ticketListWrap = $('#board-list');
        if($ticketListWrap.length){
            var hostDataUrl = $ticketListWrap.data('host-data');
            var ticketListManage = (function(cookieData) {
                if (cookieData) {
                    var cookies = cookieData.split(';');
                    for(var c = 0, cSize = cookies.length; c < cSize; c++) {
                        var cookie = cookies[c];
                        while (cookie.charAt(0) == ' ') {
                            cookie = cookie.substring(1);
                        }
                        if (cookie.indexOf('ticket.list.manage') === 0) {
                            return cookie.substring('ticket.list.manage'.length + 1, cookie.length);
                        }
                    }
                }
                return '';
            })(document.cookie);

            var ticketListAll = (function(cookieData) {
                if (cookieData) {
                    var cookies = cookieData.split(';');
                    for(var c = 0, cSize = cookies.length; c < cSize; c++) {
                        var cookie = cookies[c];
                        while (cookie.charAt(0) == ' ') {
                            cookie = cookie.substring(1);
                        }
                        if (cookie.indexOf('ticket.list.all') === 0) {
                            return cookie.substring('ticket.list.all'.length + 1, cookie.length);
                        }
                    }
                }
                return 'N';
            })(document.cookie);

            var openType = (function(cookieData) {
                if (cookieData) {
                    var cookies = cookieData.split(';');
                    for(var c = 0, cSize = cookies.length; c < cSize; c++) {
                        var cookie = cookies[c];
                        while (cookie.charAt(0) == ' ') {
                            cookie = cookie.substring(1);
                        }
                        if (cookie.indexOf('ticket.list.open.type') === 0) {
                            return cookie.substring('ticket.list.open.type'.length + 1, cookie.length);
                        }
                    }
                }
                return 'N';
            })(document.cookie);

            var manage = false;

            if(ticketListManage == "Y"){
                manage = true;
                ticketListAll ="Y";
            }else{
                if($ticketListWrap.data('list') == "Y")
                    ticketListAll = "N";
                else
                    ticketListAll = "Y";
            }

            postSomeApplicationArticle($ticketListWrap, 1, hostDataUrl, 0, ticketListAll, manage, openType);

            var _selecttit = {
                titSlideUp : function(obj){
                    obj.removeClass('on');
                    $('.selectoption').css('display', 'none');
                    $(obj.attr('href')).stop().slideUp(600);
                },
                titSlideDown : function(obj){
                    obj.addClass('on');
                    $('.selectoption').css('display', 'block');
                    $(obj.attr('href')).stop().slideDown(600);
                }
            };

            $('.select_box').on('click', '.iopt01 a,._subject',function(){
                var _tit = $('._subject');

                if (_tit.hasClass('on')){
                    _selecttit.titSlideUp(_tit);
                }else{
                    _selecttit.titSlideDown(_tit);
                }

                if($(this).hasClass('selecttit01')){
                    //_tit.data('id', "");
                }else{
                    var subject = $(this).data('id');
                    _tit.html($(this).html());
                    _tit.data('id', subject);

                    $('.selecttxt').addClass('hidden');
                    $('.slelcttitle').find('[data-id="'+subject+'"]').removeClass('hidden');

                    if(subject == undefined || subject == "")
                        subject = 0;

                    postSomeApplicationArticle($ticketListWrap, 1, hostDataUrl, parseInt(subject), ticketListAll, manage, openType);

                }
                return false;
            });

            //글쓰기
            $ticketListWrap.on('click', 'a._reg', function(event){
                if($(this).data('service') == "Y"){
                    location.href = $ticketListWrap.data('host-url')+"/write";
                }else{
                    $.layer.alert("모집 기간이 아닙니다.");
                }

                return false;
            });

            //글 상세보기 이벤트
            $ticketListWrap.on('click', '.tb_info ._write', function(){
                location.href = $ticketListWrap.data('host-url')+"/"+$(this).data('article-no');
                return false;
            });


            //페이징 영역 번호 클릭 이벤트
            $ticketListWrap.on('click', '._ticketPagination a', function(event){
                postSomeApplicationArticle($ticketListWrap, $(this).data('page'), hostDataUrl, $('._subject').data('id'), ticketListAll , manage, openType);
            });


            //내글보기
            $ticketListWrap.on('click', '._my_board', function(){
                ticketListAll = 'N';
                postSomeApplicationArticle($ticketListWrap, 1, hostDataUrl, $('._subject').data('id'), ticketListAll, false, openType);
                return false;
            });

            //전체글보기
            $ticketListWrap.on('click', '._all_board', function(){
                ticketListAll = 'Y';
                postSomeApplicationArticle($ticketListWrap, 1, hostDataUrl, $('._subject').data('id'), ticketListAll, false, openType);
                return false;
            });

            //관리자모드
            $ticketListWrap.on('click', '._admin', function(){
                if($(this).data('type') == "on"){
                    postSomeApplicationArticle($ticketListWrap, 1, hostDataUrl, $('._subject').data('id'), "Y", true, openType);
                    manage = true;
                    ticketListAll = 'Y';

                }else{
                    postSomeApplicationArticle($ticketListWrap, 1, hostDataUrl, $('._subject').data('id'), "Y", false, openType);
                    manage = false;
                    ticketListAll = 'N';
                }
                return false;
            });

            //공지 쓰기
            $ticketListWrap.on('click', '._notice', function(){
                location.href = $ticketListWrap.data('host-url')+"/write/notice";
                return false;
            });

            //엑셀
            $ticketListWrap.on('click', '._excel', function(){
                var hostDataUrl = $ticketListWrap.data('host-data');
                var pm          = $ticketListWrap.data('pm');
                var subject = 0;

                if($('._subject').data('id') != undefined && $('._subject').data('id') != "")
                    subject = $('._subject').data('id');

                var startNum = parseInt($('._start-num').val());
                var endNum   = parseInt($('._end-num').val());

                if((endNum - startNum) >= 10000 ){
                    $.layer.alert("최대 출력건수는 10000건입니다.");
                    return false;
                }else if(endNum < startNum){
                    $.layer.alert("마지막 번호는 시작번호보다 큰수를 입력해야합니다.");
                    return false;
                }else if (endNum <= 0 || startNum <= 0){
                    $.layer.alert("0보다 큰수를 입력해야합니다.");
                    return false;
                }

                var $lyaer_loading;

                if($.layer != undefined)
                    $lyaer_loading = $.layer.open('template-loading');

                window.open(hostDataUrl+'/excel?subject='+subject+'&startNum='+ startNum + "&endNum=" + endNum + "&pm=" + pm);
                window.setTimeout(function() { $.layer.close($lyaer_loading); }, 3000);

                return false;
            });


            //당첨자 보기 버튼 클릭시 이벤트
            $ticketListWrap.on('click', '._open', function(){
                if($(this).is(':checked')){
                    openType = 'Y';
                }else{
                    openType = 'N';
                }
                document.cookie = ['ticket.list.open.type', '=', openType,';path=/'].join('');

                postSomeApplicationArticle($ticketListWrap, 1, hostDataUrl, $('._subject').data('id'), ticketListAll, manage, openType);

                return false;
            });

            //새로고침
            $ticketListWrap.on('click', '.refrash', function(){
               postSomeApplicationArticle($ticketListWrap, 1, hostDataUrl, $('._subject').data('id'), ticketListAll, manage, openType);
                return false;
            });

            // 게시판 운영원칙 팝업
            $ticketListWrap.on('click', 'a._board-principle', function(event) {
                var $target = $(event.currentTarget);
                var targetUrl = $target.data('target');
                if (!targetUrl) {
                    return;
                }
                window.open(targetUrl, 'board_principle', 'width=550, height=600, scrollbars=yes');
            });

        }

        //방청신청 상세화면
        var $ticketDetail = $('._ticketDetail');
        var $_btnArea = $('._btnArea');

        if($ticketDetail.length){

            //삭제 이벤트
            $_btnArea.on('click', 'a._del', function(){
                $.layer.confirm("해당 게시글을 삭제하시겠습니까?", function() {
                    var article = $ticketDetail.data('article');

                    /*if(article == undefined || article == ""){
                        $.layer.alert("오류가 발생했습니다.<br/>새로고침 후 다시 등록해주세요.");
                        return false;
                    }*/

                    var host = $ticketDetail.data('host')+"ticket/delete";
                    var submitData = [];
                    submitData.push({name: 'bbsCode', value: $ticketDetail.data('board')});
                    submitData.push({name: 'article', value: $ticketDetail.data('article')});

                    var $lyaer_loading;

                    if($.layer != undefined)
                        $lyaer_loading = $.layer.open('template-loading');

                    $.ajax(host, {
                        data: submitData,
                        method: 'POST',
                        dataType: 'json',
                        crossDomain: true,
                        xhrFields: {
                            withCredentials: true
                        },
                        globalExceptionHandle: true
                    }).done(function(data) {
                        if(data.succeed){
                            window.location.href = $ticketDetail.data('listurl');
                        }else{
                            $.layer.alert("오류가 발생했습니다.<br/>새로고침 후 다시 등록해주세요.");
                        }

                    }).always(function() {
                        if($.layer != undefined)
                            $.layer.close($lyaer_loading);
                    });
                });

                return false;
            });

            //첨부파일 다운로드
            $ticketDetail.on('click', 'a._attachment', function(event) {
                var $target = $(event.currentTarget);
                var attachment = $target.data('file');
                if (attachment) {

                    var downloadURL = $ticketDetail.data('host');
                    if (!downloadURL) {
                        return;
                    }

                    var board = $ticketDetail.data('board');
                    var article = $ticketDetail.data('article');

                    downloadCounter += 1;
                    var parameterDataHTMLs = [];
                    parameterDataHTMLs.push('<input type="hidden" name="board" value="' + board + '"/>');
                    parameterDataHTMLs.push('<input type="hidden" name="article" value="' + article + '"/>');
                    parameterDataHTMLs.push('<input type="hidden" name="attach" value="' + attachment + '"/>');
                    var frameName = 'iframe-download-' + downloadCounter,
                        formElement = window.document.createElement('form'),
                        frameElement = window.document.createElement('iframe');
                    formElement.style.display = 'none';
                    formElement.target = frameName;
                    formElement.action = downloadURL + 'download/attachment';
                    formElement.method = 'POST';
                    frameElement.src = 'javascript:false;';
                    frameElement.name = frameName;
                    var downloadCompleteEventHandler = function() {
                        formElement.innerHTML = '<iframe src="javascript:false;"></iframe>';
                        window.setTimeout(function() { window.document.body.removeChild(formElement); }, 1000);
                    };
                    var frameLoadEventHandler = function() {
                        if (window.detachEvent) {
                            frameElement.detachEvent('onload');
                            frameElement.attachEvent('onload', downloadCompleteEventHandler);
                        } else {
                            frameElement.removeEventListener('load', function(){});
                            frameElement.addEventListener('load', downloadCompleteEventHandler);
                        }
                    };
                    if (window.attachEvent) {
                        frameElement.attachEvent('onload', frameLoadEventHandler);
                    } else {
                        frameElement.addEventListener('load', frameLoadEventHandler);
                    }
                    formElement.innerHTML = parameterDataHTMLs.join('');
                    formElement.appendChild(frameElement);
                    document.body.appendChild(formElement);
                    formElement.submit();

                    return false;
                }
            });


            //당첨버튼 클릭 이벤트
            $_btnArea.on('click', 'a._open', function(){
                $.layer.confirm("해당 게시글을 당첨처리 하시겠습니까?", function() {
                    var article = $ticketDetail.data('article');
                    var $btn = $_btnArea.find('a._open');

                    var host = $ticketDetail.data('host')+"write/open";
                    var submitData = [];
                    submitData.push({name: 'bbsCode', value: $ticketDetail.data('board')});
                    submitData.push({name: 'article', value: article});
                    submitData.push({name: 'openType', value: $btn.data('type')});

                    var $lyaer_loading;

                    if($.layer != undefined)
                        $lyaer_loading = $.layer.open('template-loading');

                    $.ajax(host, {
                        data: submitData,
                        method: 'POST',
                        dataType: 'json',
                        crossDomain: true,
                        xhrFields: {
                            withCredentials: true
                        },
                        globalExceptionHandle: true
                    }).done(function(data) {
                        if(data.succeed){
                            $.layer.alert($btn.text()+"처리 되었습니다.");
                            if($btn.data('type') == 'Y'){
                                $btn.data('type', 'N');
                                $btn.text('당첨 취소');
                            }else{
                                $btn.data('type', 'Y');
                                $btn.text('당첨');
                            }
                        }else{
                            $.layer.alert("오류가 발생했습니다.<br/>새로고침 후 다시 등록해주세요.");
                        }

                    }).always(function() {
                        if($.layer != undefined)
                            $.layer.close($lyaer_loading);
                    });;
                });


                return false;
            });

            //글쓰기
            $_btnArea.on('click', 'a._reg', function(event){
                if($(this).data('service') == "Y"){
                    location.href = $(this).data('host-url');
                }else{
                    $.layer.alert("모집 기간이 아닙니다.");
                }

                return false;
            });

        }


        //ticekt 내용 작성 탬플릿
        var $ticketWrap = $('#ticketWrap');
        var $ticketBtnWrap = $('#ticketBtnWrap');
        if ($ticketWrap.length && $ticketBtnWrap.length) {
            var _selecttit = {
                titSlideUp : function(obj){
                    obj.removeClass('on');
                    $('.selectoption').css('display', 'none');
                    $(obj.attr('href')).stop().slideUp(600);
                },
                titSlideDown : function(obj){
                    obj.addClass('on');
                    $('.selectoption').css('display', 'block');
                    $(obj.attr('href')).stop().slideDown(600);
                }
            };

            $('.select_box').on('click', '.iopt01 a,._subject',function(){
                var _tit = $('._subject');

                if (_tit.hasClass('on')){
                    _selecttit.titSlideUp(_tit);
                }else{
                    _selecttit.titSlideDown(_tit);
                }

                if($(this).hasClass('selecttit01')){
                    //_tit.data('id', "");
                }else{
                    _tit.html($(this).html());
                    _tit.data('id', $(this).data('id'));

                    $('.selecttxt02').addClass('hidden');
                    $ticketWrap.find('p[data-id="'+$(this).data('id')+'"]').removeClass('hidden');
                }
                return false;
            });

            $(document).ajaxStart(function() {
                $('#layerloading-id').show();
            });

            $(document).ajaxStop(function() {
                $('#layerloading-id').hide();
            });



            // 이미지 첨부 기능
            var imageTemplateSource = $('#template-article-image').html();
            var $attachImageWrap =$ticketWrap.find('._editor-attach-img-wrap');
            if (imageTemplateSource) {
                var imageAttachTemplate = Handlebars.compile(imageTemplateSource);
                $ticketWrap.on('click', 'a._upload-img-editor', function(event) {
                    if($('._editor-attach-img-wrap li').length >= 5){
                        $.layer.alert("이미지 첨부는 5개까지만 가능합니다.");
                        return false;
                    }

                    var $layer = $.layer.open('template-image-uploader', {insertEditor: true, enablePosition: true});
                    var $target = $(event.currentTarget);
                    $layer.on('click', '._layer-close', function() {
                        $.layer.close($layer);
                        $target.focus();
                    });
                    var $uploadFile = $layer.find('._upload-file');

                    if ($uploadFile.length) {
                        $uploadFile.on('change', function(event) {
                            var $fileInput = $(event.currentTarget);

                            if(Math.ceil(this.files[0].size/1024) > $('._editor-attach-img-wrap').data('max')*1024) {
                                $.layer.alert("최대 파일용량은 " + $('._editor-attach-img-wrap').data('max') + "MB 입니다.");
                                return false;
                            }

                            var filename = $fileInput.val().split('/').pop().split('\\').pop();
                            var $input = $fileInput.closest('._upload-file-wrap').find('input[type="text"]');
                            if ($input.length) {
                                $input.val(filename);
                            }
                            $fileInput.addClass('_upload-pending');
                        });

                        $layer.on('click', '._upload-image-file', function() {
                            var $maxWidth = $layer.find('select._max-width-option');
                            var formData = {
                                board: $ticketWrap.data('code'),
                                'article': true,
                                'max-width': $maxWidth.val()
                            };
                            var $fileInput = $('<input type="file" style="display:none;"/>');
                            $layer.append($fileInput);
                            $.uploader($fileInput, $layer.find('._upload-pending'),
                                $ticketWrap.data('host') + 'upload/image', formData).done(function(data) {

                                var $imageComment = $layer.find('textarea._img-comment');
                                var imageAlt = $imageComment.val();

                                var html = imageAttachTemplate({source: data.url, alt: imageAlt, size: data.size, type: data.type, origin: data.origin});
                                $attachImageWrap.append(html);
                                editArticleMainThumbnailHandler($attachImageWrap);

                                $.layer.close($layer);

                            });
                        });
                    }
                });
            }

            var attachTemplateSource = $('#template-article-file').html();
            var $attachFileWrap =$ticketWrap.find('._editor-attach-file-wrap');
            if(attachTemplateSource){
                /* 파일첨부 */
                $ticketWrap.on('click', 'a._upload-file-editor', function(event) {
                    if($('._editor-attach-file-wrap li').length >= 5){
                        $.layer.alert("파일 첨부는 5개까지만 가능합니다.");
                        return false;
                    }

                    var fileAttachTemplate = Handlebars.compile(attachTemplateSource);
                    var $layer = $.layer.open('template-file-uploader', {maxSize: $ticketWrap.data('size')});
                    var $target = $(event.currentTarget);
                    $layer.on('click', '._layer-close', function() {
                        $.layer.close($layer);
                        $target.focus();
                    });
                    var $uploadFile = $layer.find('._upload-file');
                    if ($uploadFile.length) {
                        $uploadFile.on('change', function(event) {
                            var $fileInput = $(event.currentTarget);

                            if(Math.ceil(this.files[0].size/1024) > $('._editor-attach-file-wrap').data('max')*1024) {
                                $.layer.alert("최대 파일용량은 " + $('._editor-attach-file-wrap').data('max') + "MB 입니다.");
                                return false;
                            }

                            var filename = $fileInput.val().split('/').pop().split('\\').pop();
                            var $input = $fileInput.closest('._upload-file-wrap').find('input[type="text"]');
                            if ($input.length) {
                                $input.val(filename);
                            }

                            $fileInput.addClass('_upload-pending');
                        });

                        $layer.on('click', '._upload-attach-file', function() {
                            var formData = {
                                board: $ticketWrap.data('code')
                            };

                            var $fileInput = $('<input type="file" style="display:none;"/>');
                            $layer.append($fileInput);
                            $.uploader($fileInput, $layer.find('._upload-pending'), $ticketWrap.data('host') + 'upload/attach', formData).done(function(data) {
                                var html = fileAttachTemplate({
                                    source: data.url
                                    , size: {value: data.size, label: data.sizeLabel}
                                    , type: data.type
                                    , origin: data.origin
                                });
                                $attachFileWrap.append(html);
                                $.layer.close($layer);
                            });
                        });
                    }
                });

                // 첨부 파일 삭제 버튼 클릭시
                $ticketWrap.on('click', 'a._attach-file-del', function(event) {
                    var $target = $(event.currentTarget);
                    var $item = $target.closest('li');
                    $item.remove();
                });
            }

            /* 취소 */
            $ticketBtnWrap.on('click', 'a._cancel', function(event){
                var message = "작성을 취소하시겠습니까?";
                if (message) {
                    $.layer.confirm(message, function() {
                        window.location.href = $ticketWrap.data('listurl');
                    });
                }

                return false;
            });

            /* 기타 */
            $ticketWrap.on('click', 'input[name="ETC"]', function(){
                if($(this).is(':checked')){
                    $(this).parent().parent().find('._etc').prop('disabled', false);
                }else {
                    $(this).parent().parent().find('._etc').prop('disabled', true);
                }
            });

            /*글등록*/
            $ticketBtnWrap.on('click', 'a._reg', function(event){
                var submitData = [];
                var $questions = $ticketWrap.find('._question');

                submitData.push({name:"bbsCode", value:$ticketWrap.data('code')});

                var questions = [];
                var validation_check ={
                    val : true
                    ,position :""
                };

                $.each($questions, function(index){
                    var $position = $(this);
                    switch ($(this).data("type")) {
                        case 'M':   //객관식
                            if($(this).data('multi') == "Y"){
                                var multi_con = "";
                                var etcVal = "";

                                $.each($(this).find('input[type="checkbox"]:checked'), function(){
                                    if($(this).val() == "etc"){
                                        etcVal = $position.find("._etc").val();
                                    }else{
                                        multi_con += $(this).val() + "^|^|";
                                    }
                                });

                                if(etcVal+multi_con.replace(/\^\|\^\|/gi, "") == "") {
                                    validation_check.val = false;
                                    validation_check.position = $(this).data('id');
                                    return false;
                                }else{
                                    questions.push({question_id : $(this).data('id'), question_val:multi_con, etc:etcVal});
                                }

                            }else{
                                var $questionRadio = $(this).find('input[type="radio"]:checked');
                                var questionRadioVal = "";

                                if($questionRadio.val() != undefined) {
                                    questionRadioVal = $questionRadio.val();
                                }

                                if(questionRadioVal == "") {
                                    validation_check.val = false;
                                    validation_check.position = $(this).data('id');
                                    return false;
                                }else{
                                    questions.push({question_id : $(this).data('id'), question_val:questionRadioVal});
                                }

                            }
                            break;
                        case 'E':   //주관식
                            var $easyText = $(this).find('._text');
                            var easyTextVal = $easyText.val();

                            if(easyTextVal == "") {
                                validation_check.val = false;
                                validation_check.position = $(this).data('id');
                                return false;
                            }else{
                                questions.push({question_id : $(this).data('id'), question_val:easyTextVal});
                            }

                            break;
                    }
                });


                var $subject = $ticketWrap.find('._subject');
                var subjectSeq = 0;
                var articleNo = 0;

                if($subject.data('id') != undefined && $subject.data('id') != ""){
                    subjectSeq = parseInt($subject.data('id'));
                }

                if($subject.length > 0 && subjectSeq == ""){
                    alert("주제를 선택해주세요");
                    $subject.focus();
                    return false;
                }

                var $title = $ticketWrap.find('._title');
                var titleVal = $title.val();
                if (!titleVal) {
                    $.layer.alert($title.data('required'));
                    $title.focus();
                    return false;
                }

                if(titleVal.length > 50){
                    $.layer.alert("제목은 최대 50자까지 입력 가능합니다.");
                    $title.focus();
                    return false;
                }

                if(!validation_check.val){
                    $.layer.alert("내용을 모두 입력해주세요.");
                    $('[data-id="'+validation_check.position+'"]').find('input').focus();
                    return false;
                }

                if(!$ticketWrap.find('#info_agree').is(':checked')){
                    $.layer.alert("개인 정보 수집 이용에 동의해주세요.");
                    $ticketWrap.find('#info_agree').focus();
                    return false;
                }

                $.each(questions, function(index){
                    submitData.push({name:'list['+index+'].id', value:this.question_id});
                    submitData.push({name:'list['+index+'].answer', value:this.question_val});
                    submitData.push({name:'list['+index+'].etc', value:this.etc});
                });

                /*m-f*/
                /*$.each($('.upload_file li'), function(index){
                    submitData.push({name:'fileList['+index+'].size', value:parseInt($(this).data('size'))});
                    submitData.push({name:'fileList['+index+'].origin', value:$(this).data('origin')});
                    submitData.push({name:'fileList['+index+'].store', value:$(this).data('store')});
                    submitData.push({name:'fileList['+index+'].fileType', value:$(this).data('file-type')});
                    submitData.push({name:'fileList['+index+'].order', value:index});
                });*/


                var file_index = 0;
                $.each($('._editor-attach-img-wrap li'), function(index){
                    //if(index == 0){
                        submitData.push({name:'fileList['+file_index+'].size', value:parseInt($(this).data('size'))});
                        submitData.push({name:'fileList['+file_index+'].origin', value:$(this).data('origin')});
                        submitData.push({name:'fileList['+file_index+'].store', value:$(this).data('store')});
                        submitData.push({name:'fileList['+file_index+'].fileType', value:$(this).data('file-type')});
                        submitData.push({name:'fileList['+file_index+'].order', value:file_index});
                        file_index++;
                    //}
                });

                $.each($('._editor-attach-file-wrap li'), function(index){
                    //if(index == 0){
                        submitData.push({name:'fileList['+file_index+'].size', value:parseInt($(this).data('size'))});
                        submitData.push({name:'fileList['+file_index+'].origin', value:$(this).data('origin')});
                        submitData.push({name:'fileList['+file_index+'].store', value:$(this).data('store')});
                        submitData.push({name:'fileList['+file_index+'].fileType', value:$(this).data('file-type')});
                        submitData.push({name:'fileList['+file_index+'].order', value:file_index});
                        file_index++;
                    //}
                });



                if($ticketWrap.data('article-no') != undefined && $ticketWrap.data('article-no') != ""){
                    articleNo = parseInt($ticketWrap.data('article-no'));
                }

                submitData.push({name:'subjectSeq', value:subjectSeq});
                submitData.push({name:'title', value:titleVal});
                submitData.push({name:'articleNo', value:articleNo});


                var bbsHost = $ticketWrap.data('host');
                if (!bbsHost) {
                    return false;
                }

                var $lyaer_loading = $.layer.open('template-loading');

                $.ajax(bbsHost + 'ticket/reg', {
                    data: submitData,
                    method: 'POST',
                    dataType: 'json',
                    crossDomain: true,
                    processData: true,
                    xhrFields: {
                        withCredentials: true
                    }
                }).done(function(data) {
                    if(data.succeed){
                        window.location.href = $ticketWrap.data('listurl');
                    }else{
                        $.layer.alert("오류가 발생했습니다.<br/>새로고침 후 다시 등록해주세요.");
                    }

                }).always(function() {
                    $.layer.close($lyaer_loading);
                }).fail(function(jqXHR){
                    if (jqXHR.status === 406) {
                        var response = jqXHR.responseText;
                        if (!response) {
                            return;
                        }
                        var responseJSON = $.parseJSON(response);
                        if (!(responseJSON && responseJSON.message)) {
                            return;
                        }
                        var message = responseJSON.message;
                        if (message) {
                            message = message.replace(/\|B\|(.+)\|B\|/, '<strong class="point">$1</strong>')
                        }
                        $.layer.alert(message);
                    }
                });


                return false;
            });

        }


        function fnNullCheck(val, message){
            if(val == undefined || val == ""){
                $.layer.alert(message);
                return false;
            }else{
                return true;
            }
        }

        //방청신청 공지사항 등록폼
        var $noticeFrom = $('#_notice-from');
        if($noticeFrom.length){
            $noticeFrom.on('click', 'a._reg', function(){
                var bbsHost = $noticeFrom.data('host');


                var board = $noticeFrom.data('board');
                var title = $noticeFrom.find('._title').val();
                var writerNm = $noticeFrom.find('._writerNm').val();
                var desc = $noticeFrom.find('._desc').val();
                var delYn = $noticeFrom.find('input[name="exp"]:checked').val();

                if(!fnNullCheck(title, "제목을 입력해주세요.")){
                    return false;
                }

                if(!fnNullCheck(writerNm, "작성자를 입력해주세요.")){
                    return false;
                }

                if(!fnNullCheck(desc, "공지내용을 입력해주세요.")){
                    return false;
                }

                var submitData = [
                    {name: 'bbsCode', value: board}
                    ,{name: 'title', value: title}
                    ,{name: 'writerNm', value: writerNm}
                    ,{name: 'desc', value: desc}
                    ,{name: 'delYn', value: delYn}
                ];

                if($('#reserve-on').is(':checked')){
                    var opentime_date = $noticeFrom.find('#reserve-date').val();
                    var opentime_hour = $noticeFrom.find('#reserve-hour').val();
                    var opentime_minute = $noticeFrom.find('#reserve-minute').val();

                    if(!fnNullCheck(opentime_date, $noticeFrom.find('#reserve-date').data('message'))){
                        return false;
                    }

                    if(!fnNullCheck(opentime_hour, $noticeFrom.find('#reserve-hour').data('message'))){
                        return false;
                    }

                    if(!fnNullCheck(opentime_minute, $noticeFrom.find('#reserve-minute').data('message'))){
                        return false;
                    }

                    submitData.push({name: 'opentime-date', value: opentime_date});
                    submitData.push({name: 'opentime-hour', value: opentime_hour});
                    submitData.push({name: 'opentime-minute', value: opentime_minute});
                }else{
                    submitData.push({name: 'opentime-date', value: ""});
                    submitData.push({name: 'opentime-hour', value: ""});
                    submitData.push({name: 'opentime-minute', value: ""});
                }

                if($noticeFrom.data('type') == 'update'){
                    submitData.push({name: 'article', value: $noticeFrom.data('article')});
                }

                console.log(submitData);

                var $lyaer_loading;

                if($.layer != undefined)
                    $lyaer_loading = $.layer.open('template-loading');

                $.ajax(bbsHost + 'ticket/reg/notice', {
                    data: submitData,
                    method: 'POST',
                    dataType: 'json',
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    }
                }).done(function(data) {
                    if(data.succeed){
                        window.location.href = $noticeFrom.data('listurl');
                    }else{
                        $.layer.alert("오류가 발생했습니다.<br/>새로고침 후 다시 등록해주세요.");
                    }

                }).always(function() {
                    $.layer.close($lyaer_loading);
                }).fail(function(jqXHR){
                    if (jqXHR.status === 406) {
                        var response = jqXHR.responseText;
                        if (!response) {
                            return;
                        }
                        var responseJSON = $.parseJSON(response);
                        if (!(responseJSON && responseJSON.message)) {
                            return;
                        }
                        var message = responseJSON.message;
                        if (message) {
                            message = message.replace(/\|B\|(.+)\|B\|/, '<strong class="point">$1</strong>')
                        }
                        $.layer.alert(message);
                    }
                });


                return false;
            });


            // 공지사항 예약 기능 활성/바활성
            var $reserveOn = $('#reserve-on');
            if ($reserveOn.length) {
                var $noticeOn = $('#notice-on');
                var $noticeOff = $('#notice-off');
                var $reserveOff = $('#reserve-off');
                var $reserveDate = $('#reserve-date');
                var $reserveDateWrap = $reserveDate.closest('._calendar-wrap');
                var $reserveHour = $('#reserve-hour');
                var $reserveMinute = $('#reserve-minute');

                var customUiRefreshHandler = function($element) {
                    var selectBox = $element.data('selectbox');
                    if (selectBox && typeof selectBox['refresh'] === 'function') {
                        selectBox.refresh();
                        return;
                    }
                    var radioBox = $element.data('radio');
                    if (radioBox && typeof radioBox['refresh'] === 'function') {
                        radioBox.refresh();
                    }
                };

                if ($.fn.jtbcDatePicker) {
                    $reserveDateWrap.data('current', $reserveDate.val());
                    $reserveDateWrap.jtbcDatePicker({
                        'disable': function() {
                            return $reserveDate.prop('disabled');
                        },
                        'onselect': function(dateText) {
                            var inputValue, display;
                            if (dateText) {
                                var selected = moment(dateText, 'YYYYMMDD');
                                inputValue = selected.format('YYYYMMDD');
                                display = selected.format($reserveDateWrap.data('format'));
                            } else {
                                inputValue = '';
                                display = $reserveDateWrap.data('label');
                            }

                            $reserveDateWrap.data('current', inputValue);
                            $reserveDate.val(inputValue);
                            $reserveDateWrap.find('._calendar-display').html(display);
                        }
                    });
                }

                $noticeOn.on('click', function() {
                    $reserveOn.prop('disabled', false);
                    $reserveOff.prop('disabled', false);
                    var reserveOn = !$reserveOn.prop('checked');
                    $reserveDate.prop('disabled', reserveOn);
                    $reserveHour.prop('disabled', reserveOn);
                    $reserveMinute.prop('disabled', reserveOn);
                    customUiRefreshHandler($reserveOn);
                    customUiRefreshHandler($reserveOff);
                    customUiRefreshHandler($reserveDate);
                    customUiRefreshHandler($reserveHour);
                    customUiRefreshHandler($reserveMinute);
                    if ($reserveDate.prop('disabled')) {
                        $reserveDateWrap.addClass('disabled');
                        $reserveDateWrap.find('._calendar-display').html($reserveDateWrap.data('label'));
                        $reserveDateWrap.data('current', '');
                    } else {
                        $reserveDateWrap.removeClass('disabled');
                    }
                });

                $noticeOff.on('click', function() {
                    $reserveOn.prop('disabled', true);
                    $reserveOff.prop('checked', true).prop('disabled', true);
                    $reserveDate.prop('disabled', true);
                    $reserveHour.prop('disabled', true).val('');
                    $reserveMinute.prop('disabled', true).val('');
                    customUiRefreshHandler($reserveOn);
                    customUiRefreshHandler($reserveOff);
                    customUiRefreshHandler($reserveDate);
                    customUiRefreshHandler($reserveHour);
                    customUiRefreshHandler($reserveMinute);
                    $reserveDateWrap.addClass('disabled');
                    $reserveDateWrap.find('._calendar-display').html($reserveDateWrap.data('label'));
                    $reserveDateWrap.data('current', '');
                });

                $reserveOn.on('click', function() {
                    $reserveDate.prop('disabled', false);
                    $reserveHour.prop('disabled', false);
                    $reserveMinute.prop('disabled', false);
                    customUiRefreshHandler($reserveDate);
                    customUiRefreshHandler($reserveHour);
                    customUiRefreshHandler($reserveMinute);
                    $reserveDateWrap.removeClass('disabled');
                });
                $reserveOff.on('click', function() {
                    $reserveDate.prop('disabled', true);
                    $reserveHour.prop('disabled', true).val('');
                    $reserveMinute.prop('disabled', true).val('');
                    customUiRefreshHandler($reserveDate);
                    customUiRefreshHandler($reserveHour);
                    customUiRefreshHandler($reserveMinute);
                    $reserveDateWrap.addClass('disabled');
                    $reserveDateWrap.find('._calendar-display').html($reserveDateWrap.data('label'));
                    $reserveDateWrap.data('current', '');
                });
            }
        }


		// 1:1문의 첨부파일 다운로드
        var $helpQnaListFileWrap = $('#help-qna-list-wrap');
		if ($helpQnaListFileWrap.length) {
			$helpQnaListFileWrap.on('click', 'a._attachment', function(event) {
                var $target = $(event.currentTarget);
                var article = $target.data('key');
                var attachment = $target.data('file');
				$helpQnaListFileWrap.find('._article-wrap').data('article', article);
                if (attachment) {
                    attachmentDownloader($helpQnaListFileWrap, attachment);
                }
            });
		}

        //출석체크 버튼 이벤트
        var $attEventWrap = $('.stampevent-popup');
        if ($attEventWrap.length) {
            $attEventWrap.on('click', 'button.stampevent-close', function(e){
                e.preventDefault();
                $attEventWrap.remove();
            });


            $attEventWrap.on('click', 'button.img-stamp', function(e){
                e.preventDefault();

                var apiHost = $(this).data('host');
                var attNo = $(this).data('att-no');
                var attMoveUrl = $(this).data('url');

                $.ajax(apiHost + '/event/att/join/' + attNo, {
                    method: 'POST',
                    dataType: 'json',
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    }
                }).done(function(data) {

                    var text_msg1 = (data.text_msg1 == '' || data.text_msg1 == undefined)? "이벤트는 로그인 후 참여 가능합니다." : data.text_msg1;
                    var text_msg2 = (data.text_msg2 == '' || data.text_msg2 == undefined)? "오늘은 이미 출석체크하셨습니다." : data.text_msg2;
                    var text_msg3 = (data.text_msg3 == '' || data.text_msg3 == undefined)? "출석체크가 완료되었습니다." : data.text_msg3;

                    if(data.login == false){
                        //$.layer.alert("출석 이벤트는 로그인 후 참여 가능합니다.");
                        $.layer.alert(text_msg1, {        // 이벤트 창 닫힐때 콜백 함수
                            closeCallback: function() {
                                location.href = 'https://my.joins.com/login/JTBC/login.asp?TargetURL='+location.href;
                            }
                        });

                    }else{
                        if(data.att_cnt > 0){
                            $.layer.alert(text_msg2, {        // 이벤트 창 닫힐때 콜백 함수
                                closeCallback: function() {
                                    return;
                                }
                            });

                        }else{
                            $.layer.alert(text_msg3, {        // 이벤트 창 닫힐때 콜백 함수
                                closeCallback: function() {
                                    if(attMoveUrl != ""){
                                        location.href = attMoveUrl;
                                    }
                                }
                            });

                            $attEventWrap.remove();
                        }
                    }

                }).always(function() {


                }).fail(function() {
                    $.layer.alert("이용에 불편을 드려 죄송합니다. 일시적인 오류가 발생했습니다.");
                });

                $(this).blur();
            });
        }
		
    });
}(jQuery, document, window);
// 기본 페이징 처리 Script
!function($, document) {
    'use strict';

    function updatePaginationContents($wrap, pageIndex) {
        if ($wrap.data('loading')) {
            return;
        }
        var updateURL = $wrap.data('url');
        if (!updateURL) {
            return;
        }
        var submitData = [{name: 'page', value: pageIndex}];
        $wrap.data('loading', true);

        $.ajax(updateURL, {
            data: submitData,
            method: 'POST',
            dataType: 'html',
            globalExceptionHandle: true
        }).done(function(data) {
            $wrap.html(data);
            var wrapOffset = $wrap.offset();
            if (wrapOffset.top < (document.body.scrollTop || document.documentElement.scrollTop)) {
                $wrap.velocity('scroll', {
                    duration: 500,
                    delay: 50,
                    offset: -50
                });
            }

            var accordion = $('#content').data('uiReplayInfoAccordion');
            if (accordion) {
                accordion.refresh();
            }
        }).always(function() {
            $wrap.data('loading', false);
        });
    }

    $(document).ready(function() {
        var $paginatedWrap = $('._paginate-default-wrap');
        if ($paginatedWrap.length === 1) {
            // 페이징 처리 영역이 1개가 있을 경우에만 처리되도록 함. by etribe
            $paginatedWrap.on('click', '._pagination a', function(event) {
                var $target = $(event.currentTarget);
                var page = $target.data('page');
                if (page) {
                    updatePaginationContents($paginatedWrap, page);
                }
            });

            $paginatedWrap.on('click', '._move-first-page', function() {
                updatePaginationContents($paginatedWrap, 1);
            });

            $paginatedWrap.on('click', '._move-last-page', function() {
                updatePaginationContents($paginatedWrap, 'last-page');
            });
        }
    });
}(jQuery, document);// VOD 플레이어 Script
!function($, document, window) {
    'use strict';

    function playerLoad($player) {
        var apiHost = $player.data('host');
        if (!apiHost) {
            return null;
        }

        var showAd = $player.data('ad') === 'Y';

        var $playerContainer = $('#vod-player-container,._onair-player-container');
        var wideCallback = null;
        if ($playerContainer.length) {
            wideCallback = function(toggle) {
                if ($playerContainer.length) {
                    if (toggle) {
                        $playerContainer.addClass('wide');
                    } else {
                        $playerContainer.removeClass('wide');
                    }
                }
            };
        }

        var vodPlayer = window['vodPlayerLoad'];
        if (vodPlayer) {
            var vodId = $player.data('vod');
            //var vodId = $('#player-id').data('vod');
            if (!vodId) {
                if ($playerContainer.is('._onair-player-container')) {
                    vodId = 'onair';
                }
            }
        }

        if (!vodId) {
            return;
        }

        var division = $player.data('division') || 'DR';
        var $playContinue = $('#vod-play-continue');
        var $playPayment = $('#vod-play-pay');
        // 임베드 플레이어 자동 재생 여부.
        var embedPlayerAuto = $('#player-wrap').data('embed-play');

        vodPlayer(vodId, {
            section: division,
            autoStart: ($playContinue.is('.on') || $playPayment.is('.on') || (embedPlayerAuto === 'auto')),
            ad: showAd,
            apiHost: apiHost,
            wideCallback: wideCallback,
            finishCallback: function(vod, preview) {
            	var $playContinue = $('#vod-play-continue');
                var $prerequisite = $player.find('._required-prerequisite');
                if (preview && $prerequisite.length && !($playContinue.length && $playContinue.is('.on'))) {
                    var $playerWrap = $('#player-wrap');
                    $playerWrap.css('display', 'none');
                    $prerequisite.css('display', '');
                } else {
                    if (!($playContinue.length && $playContinue.is('.on'))) {
                        return;
                    }
                    var $vodPlaylist = $('#vod-playlist');
                    if (!$vodPlaylist.length) {
                        return;
                    }

                    var $nextVod = $vodPlaylist.find('._next-vod');
                    var $firstVod = $vodPlaylist.find('._first-vod');
                    var $callVod = null;
                    if ($nextVod.length) {
                    	$callVod = $nextVod; 
                    } else if ($firstVod.length) {
                    	$callVod = $firstVod;
                    }

                    if ($callVod) {
                    	if ($callVod.is('._ga-event') && $.analytics) {
                            $.analytics.triggerManualEventLog($callVod);
                        }
                        if ($playContinue.is('.on')) {
                            window.location.href = $callVod.prop('href') + '#player-wrap';
                        } else {
                            window.location.href = $callVod.prop('href');
                        }
                    }
                    
                }
            },
            playOnCallback: function(vod) {
            	if (console && console.log) {
            		console.log('player playOnCallback call');
                }
                if ($player.data('loading')) {
                    return;
                }

                var payCode = $player.data('pay');
                var payAmount = $player.data('amount');
                var voucher = $player.data('voucher');
                var referCode = $player.data('refer');

                var submitData = [
                    {name: 'vod', value: vod},
                    {name: 'referCode', value: referCode},
                    {name: 'pay', value: payCode},
                    {name: 'amount', value: payAmount},
                    {name: 'voucher', value: voucher}
                ];
                
                if ($player.data('preview') !== undefined) {
                	submitData.push({name: 'preview', value: $player.data('preview')});
                }

                $player.data('loading', true);
                $.ajax(apiHost + 'vod/play-on-log', {
                    data: submitData,
                    method: 'POST',
                    dataType: 'json',
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    }
                }).done(function(data) {

                }).always(function() {
                    $player.data('loading', false);
                });
            },
            menuCallback: function(vod, type) {
            	if (console && console.log) {
            		console.log('player menuCallback call');
                }
            	playerMenuHandler($player, vodId, type);
            },
            layerCallback: function() {
            	if (console && console.log) {
            		console.log('player layerCallback call');
                }
            	var $layer = $.layer.open('template-player-restrain');
            }
        });

        return vodId;
    }

    function recommendSomeVod($wrap, $button, vodId) {
        if ($button.is('._log-exist')) {
            var message = $button.data('message');
            if (message) {
                $.layer.alert(message, {
                    closeCallback: function() {
                        $button.focus();
                    }
                });
            }
            return;
        }
        if ($wrap.data('recommend')) {
            return;
        }
        var vodHost = $wrap.data('host');
        $wrap.data('recommend', true);

        var apiUrl;
        if (vodHost) {
            apiUrl = vodHost + 'vod/recommend-log';
        } else {
            apiUrl = '/vod/recommend-log';
        }

        $.ajax(apiUrl, {
            data: [{name: 'vod', value: vodId}],
            method: 'POST',
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function(data) {
            if (data['recommend']) {
                var $recommendCount = $wrap.find('._recommend-cnt');
                if ($recommendCount.length) {
                    $recommendCount.text(data['recommend']);
                }
                $button.addClass('_log-exist');
                $button.children('em').addClass('on');
                $button.removeClass('zero');
            }
        }).always(function() {
            $wrap.data('recommend', false);
        });
    }

    function purchaseVod($wrap, vodId, billUrl) {
        if ($wrap.data('loading')) {
            return;
        }
        $wrap.data('loading', true);

        // 서버에서 결제 팝업 표시를 위한 기초정보 가져오기.
        $.ajax(billUrl + 'payment/ready-episode-once', {
            data: [{name: 'vod', value: vodId}],
            method: 'POST',
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function(data) {
            var context = {};
            if (data) {
                $.extend(context, data);
            }
            $.payment.purchase($wrap, context, false, function() {
                window.location.reload(true);
            });
        }).always(function() {
            $wrap.data('loading', false);
        });
    }

    function voucherReadyOpen($wrap, vodId, billUrl, apiHost, submitData) {
        if ($wrap.data('loading')) {
            return;
        }
        $wrap.data('loading', true);

        // 서버에서 이용권 선택 팝업 표시를 위한 기초정보 가져오기.
        $.ajax(billUrl + 'voucher/ready-list', {
            data: [{name: 'vod', value: vodId}],
            method: 'POST',
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function(data) {
            var formId = 'voucher_open_' + Math.floor(new Date().getTime() / 1000);
            var context = {formId: formId};
            if (data) {
                $.extend(context, data);
            }

            var $layer = $.layer.open('template-voucher-open', context);
            var $form = $layer.find('#' + formId);
            $layer.on('click', '._voucher-open', function(event) {
                var $target = $(event.currentTarget);
                var message = $target.data('required');
                var formData = $form.serializeArray();
                var selectedVoucher = null;
                for (var i = 0, size = formData.length; i < size; i++) {
                    if (formData[i].name === 'voucher') {
                        selectedVoucher = formData[i].value;
                        break;
                    }
                }
                
                if (!selectedVoucher) {
                	if (message) {
                		$.layer.alert(message);
                	}
                    return;
                }

                if ($form.find('input[name="voucher"]:checked').data('count-status') === true) {
                	submitData.push({name: 'pay', value: $form.find('input[name="voucher"]:checked').data('division')});
                	submitData.push({name: 'voucher', value: selectedVoucher});
                	     
                	voucherCountAllowCollect($target, selectedVoucher, billUrl, apiHost, submitData, $layer);
                } else {
                	voucherOpen($target, selectedVoucher, billUrl, $layer);
                }
            });
        }).always(function() {
            $wrap.data('loading', false);
        });
    }
    
    function voucherOpen($wrap, voucherId, billUrl, $layer) {
        if ($wrap.data('loading')) {
            return;
        }
        $wrap.data('loading', true);

        // 서버에서 이용권 선택 팝업 표시를 위한 기초정보 가져오기.
        $.ajax(billUrl + 'voucher/open', {
            data: [{name: 'voucher', value: voucherId}],
            method: 'POST',
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function(data) {
            if (data.message) {
                $.layer.alert(data.message, {
                    closeCallback: function() {
                        window.location.reload(true)
                    }
                });
            }
            if (data.success) {
                $.layer.close($layer);
            }
        }).always(function() {
            $wrap.data('loading', false);
        });
    }
    
    function voucherCountAllowCollect($wrap, voucherId, billUrl, apiHost, submitData, $preLayout) {
    	if (console && console.log) {
    		console.log('voucherCountAllowCollect');
        	console.log(submitData);
        }
    	
    	if ($wrap.data('loading')) {
            return;
        }
        $wrap.data('loading', true);

        var selectedVod = null;
		for (var i = 0, size = submitData.length; i < size; i++) {
			if (submitData[i].name === 'vod') {
				selectedVod = submitData[i].value;
				break;
			}
		}
        
        // 서버에서 이용권 선택 팝업 표시를 위한 기초정보 가져오기.
        $.ajax(billUrl + 'voucher/allow-detail', {
            data: submitData,
            method: 'POST',
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function(data) {
        	var formId = 'voucher_allow_collect_' + Math.floor(new Date().getTime() / 1000);
            var context = {formId: formId};
            if (data) {
                $.extend(context, data);
            }
            
            var $layer = $.layer.open('template-voucher-collect-agree', context);
            var $form = $layer.find('#' + formId);
            $layer.on('click', '._voucher-agree', function(event) {
            	voucherCountTypeAllowAgree(apiHost, submitData);
            });
            $layer.on('click', '._layer-close-voucher-agree', function(event) {
            	if ($preLayout !== undefined) {
            		$.layer.close($preLayout);
                	$('.dimm').css('display', 'none');
            	}
            	$.layer.close($layer);
            });
        }).always(function() {
            $wrap.data('loading', false);
        });
    }
    
    function voucherCountTypeAllowAgree(apiHost, submitData) {
    	$.ajax(apiHost + 'vod/play-on-log', {
            data: submitData,
            method: 'POST',
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            }
        }).done(function(data) {
        }).always(function() {
        	window.location.reload(true);
        });
    }

    function vodShareSuccessHandler($target, apiHost, socialPlatform, submitData) {
        $.ajax(apiHost + 'share/' + socialPlatform, {
            data: submitData,
            method: 'POST',
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            }
        }).done(function(data) {
            if (data.share) {
                var $wrap = $target.closest('._vod-share-wrap');
                $wrap.find('._share-count-label').html(data.share);
                $wrap.find('._vod-share').removeClass('zero');
            }
            $target.closest('._share-social-wrap').css('display', 'none');
        }).always(function() {
        });
    }
    
    function playerMenuHandler($player, vodId, menuType) {
    	var apiHost = $player.data('host');
        var redirectUrl = $player.data('url-redirect');
        var billUrl = "#";
        if ($player.data('url-bill') !== undefined) {
        	billUrl = $player.data('url-bill');
		}
    		
    	if (menuType == 'LOGIN' || menuType == 'OA_REQUIRED_AUTH' ) {
    		if ($player.data('url-login') !== undefined) {
    			location.href = $player.data('url-login');
    		}
    	} else if (menuType == 'SIGN_UP' || menuType == 'OA_REQUIRED_SIGN_UP') {
    		if ($player.data('url-join') !== undefined) {
    			location.href = $player.data('url-join');
    		}
    	} else if (menuType == 'REQUIRED_PAY' || menuType == 'OA_REQUIRED_PAY') {
    		if ($player.data('url-pay') !== undefined) {
    			location.href = $player.data('url-pay');
    		}
    	} else if (menuType == 'REQUIRED_OPEN' || menuType == 'OA_REQUIRED_OPEN') {
			var payCode = $player.data('pay');
			var payAmount = $player.data('amount');
			var voucher = $player.data('voucher');
			var referCode = $player.data('refer');
			var submitData = [
				{name: 'vod', value: vodId},
				{name: 'referCode', value: referCode},
				{name: 'amount', value: payAmount}
			];
			
            voucherReadyOpen($('._vod-detail-wrap'), vodId, billUrl, apiHost, submitData);
            
    	} else if (menuType == 'REQUIRED_ALLOW_COLLECT_OPEN') {
            var payCode = $player.data('pay');
            var payAmount = $player.data('amount');
            var voucher = $player.data('voucher');
            var referCode = $player.data('refer');
            
            var submitData = [
                {name: 'vod', value: vodId},
                {name: 'referCode', value: referCode},
                {name: 'pay', value: payCode},
                {name: 'amount', value: payAmount},
                {name: 'voucher', value: voucher}
            ];
            
            voucherCountAllowCollect($('._vod-detail-wrap'), voucher, billUrl, apiHost, submitData);
    	}
    }

    $(document).ready(function() {
        var $player = $('._vod-player');
        if ($player.length) {
            var vodId = playerLoad($player);
            var programTitle = $player.data('programtitle') != undefined ?" #JTBC #"+$player.data('programtitle').replace(/ /gi, "_"):"";

            var $vodDetailWrap = $('._vod-detail-wrap');
            if ($vodDetailWrap.length) {
            	$vodDetailWrap.on('click', '._player-replay', function(event) {
            		if (console && console.log) {
                    	console.log('_player-replay');
                    }
            		if (window['jwplayerFnc'] && jwplayerFnc.replay) {
            			jwplayerFnc.replay();
            		}
            		var $prerequisite = $vodDetailWrap.find('._required-prerequisite');
                    var $playerWrap = $('#player-wrap');
                    $playerWrap.css('display', 'block');
                    $prerequisite.css('display', 'none');
                });
            	
                $vodDetailWrap.on('click', '._vod-recommend', function(event) {
                    var $target = $(event.currentTarget);
                    recommendSomeVod($vodDetailWrap, $target, vodId);
                });

                $vodDetailWrap.on('click', '._vod-comment', function() {
                    var commentTabClickTrigger = $player.data('tab.comment.click');
                    if (commentTabClickTrigger && typeof commentTabClickTrigger === 'function') {
                        commentTabClickTrigger.call(this);
                        var $commentWrap = $('._comment-content-wrap');
                        if (!$commentWrap.length) {
                            return;
                        }
                        var wrapOffset = $commentWrap.offset();
                        if (wrapOffset.top > document.body.scrollTop) {
                            $commentWrap.velocity('scroll', {
                                duration: 500,
                                delay: 50,
                                offset: -200
                            });
                        }
                    }
                });

                $vodDetailWrap.on('click', '._share-social-wrap ._share-kakaostory', function(event) {
                    var apiHost = $player.data('host');
                    if (!apiHost) {
                        return;
                    }
                    var $target = $(event.currentTarget);

                    $.social.kakaoConnect();
                    var accessToken = $.social.kakaoAccessToken();
                    Kakao.Auth.login({
                        success: function(authObj) {
                            accessToken = Kakao.Auth.getAccessToken();
                            kakaShare();
                        },
                        fail: function(err) {
                            console.log(JSON.stringify(err));
                        }
                    });

                    var kakaShare = function() {
                        if (accessToken) {
                            var submitData = $.social.postDefaults(true);
                            submitData['token'] = accessToken;
                            submitData['vod'] = vodId;
                            submitData['content'] = submitData['content'];
                            submitData['title'] = submitData['title'];
                            vodShareSuccessHandler($target, apiHost, 'kakaostory', submitData);
                            return;
                        }
                    }

                });

                $vodDetailWrap.on('click', '._share-social-wrap ._share-facebook', function(event) {
                    var apiHost = $player.data('host');
                    if (!apiHost) {
                        return;
                    }
                    var $target = $(event.currentTarget);

                    var submitData = $.social.postDefaults(false);
                    $.social.facebookShare(submitData.link).done(function() {
                        $.extend(submitData, {vod: vodId, skipApiShare: true});
                        vodShareSuccessHandler($target, apiHost, 'facebook', submitData);
                    });
                });

                $vodDetailWrap.on('click', '._share-social-wrap ._share-twitter', function(event) {
                    var apiHost = $player.data('host');
                    if (!apiHost) {
                        return;
                    }
                    var $target = $(event.currentTarget);

                    $.social.twitterConnect();

                    var twitterCheckCount = 0;
                    var twitterShare = function() {
                        var accessToken = $.social.twitterAccessToken();
                        if (accessToken) {
                            var submitData = $.social.postDefaults();
                            submitData['token'] = accessToken;
                            submitData['vod'] = vodId;
                            submitData['content'] = submitData['title'] + programTitle;
                            submitData['title'] = null;
                            vodShareSuccessHandler($target, apiHost, 'twitter', submitData);
                            return;
                        }
                        twitterCheckCount++;
                        if (twitterCheckCount > 1000 * 60 * 10) {
                            if (console && console.log) {
                                console.log('occur twitter access token exception');
                            }
                            return;
                        }
                        setTimeout(twitterShare, 1000);
                    };

                    twitterShare();
                });

                $vodDetailWrap.on('click', '._share-social-wrap ._share-naver', function(event) {
                    var apiHost = $player.data('host');
                    if (!apiHost) {
                        return;
                    }
                    var $target = $(event.currentTarget);

                    $.social.naverConnect();

                    var naverCheckCount = 0;
                    var naverShare = function() {
                        var accessToken = $.social.naverAccessToken();
                        if (accessToken) {
                            var submitData = $.social.postDefaults(true);
                            submitData['token'] = accessToken;
                            submitData['vod'] = vodId;
                            vodShareSuccessHandler($target, apiHost, 'naver', submitData);
                            return;
                        }
                        naverCheckCount++;
                        if (naverCheckCount > 1000 * 60 * 10) {
                            if (console && console.log) {
                                console.log('occur naver access token exception');
                            }
                            return;
                        }
                        setTimeout(naverShare, 1000);
                    };

                    naverShare();
                });

                if (window['Clipboard']) {
                    new Clipboard('._copy-clipboard', {
                        target: function(trigger) {
							var message = $(trigger).data('message');
							if (message) {
								if ($.layer) {
									$.layer.alert(message, {
                                        closeCallback: function() {
                                            $(trigger).focus();
                                        }
                                    });
								} else {
									alert(message);
								}
							}							
                            return $(trigger).closest('._copy-clipboard-wrap').find('input._copy-clipboard-target')[0];
                        }
                    });
                } else {
                    // IE 8 대응
                    $vodDetailWrap.on('click', '._copy-clipboard', function(event) {
                        var $trigger = $(event.currentTarget);
                        var clipboardText = $trigger.val();
                        if (window.clipboardData && window.clipboardData.setData) {
                            window.clipboardData.setData('Text', clipboardText);
                            var message = $trigger.data('message');
                            if (message) {
                                if ($.layer) {
                                    $.layer.alert(message, {
                                        closeCallback: function() {
                                            $trigger.focus();
                                        }
                                    });
                                } else {
                                    alert(message);
                                }
                            }
                        }
                    });
                }

                $vodDetailWrap.on('click', 'input[type="checkbox"]._embed-auto-play', function(event) {
                    var $target = $(event.currentTarget);
                    var $clipboardTarget = $vodDetailWrap.find('input._copy-clipboard-embed');
                    if ($clipboardTarget.length) {
                        var embedSource = $clipboardTarget.val();
                        var $iframe = $(embedSource);
                        var embedSourceUrl = $iframe.prop('src');
                        var autoPlayChecked = $target.prop('checked');
                        if (autoPlayChecked && embedSourceUrl.indexOf('autoplay=1') === -1) {
                            if (embedSourceUrl.indexOf('?') > -1) {
                                embedSourceUrl = embedSourceUrl + '&autoplay=1';
                            } else {
                                embedSourceUrl = embedSourceUrl + '?autoplay=1';
                            }
                        } else if (!autoPlayChecked && embedSourceUrl.indexOf('autoplay=1') > -1) {
                            embedSourceUrl = embedSourceUrl.replace(/(&|\?)autoplay=1/gi, '');
                        }
                        $clipboardTarget.val(embedSource.replace(/src="[^"]+"/gi, 'src="' + embedSourceUrl + '"'));
                    }
                });

                $vodDetailWrap.on('click', '._purchase-once', function(event) {
                    var $target = $(event.currentTarget);
                    var billUrl = $target.data('host');
                    purchaseVod($vodDetailWrap, vodId, billUrl);
                });

                $vodDetailWrap.on('click', '._purchase-exist', function(event) {
                    var $target = $(event.currentTarget);
                    var message = $target.data('message');
                    if (message) {
                        $.layer.alert(message.replace('\\n', '\n'), {
                            closeCallback: function() {
                                $target.focus();
                            }
                        });
                    }
                });

                $vodDetailWrap.on('click', '._player-menu', function(event) {
                    var $target = $(event.currentTarget);
                    var menuType = $target.data('menutype');
                    if (menuType) {
                        playerMenuHandler($player, vodId, menuType);
                    }
                });
            }
        }

        var $vodTabWrap = $('#vod-tab-wrap');
        if ($vodTabWrap.length) {
            var $vodTabContentList = $vodTabWrap.find('._tab-content');
            var $vodTabNavComment = $vodTabWrap.find('._tab-nav-comment');
            $vodTabWrap.on('click', '._tab-nav a', function(event) {
                var $target = $(event.currentTarget);
                var content = $target.data('tab');
                var $showTab = null;
                var $hideTab = null;
                if (content) {
                    $showTab = $vodTabContentList.filter('#tab-content-' + content);
                    $hideTab = $vodTabContentList.not($showTab);
                } else {
                    $hideTab = $vodTabContentList;
                }

                if ($showTab && $showTab.length && content === 'comment') {
                    var commentInitializer = $showTab.find('._comment-content-wrap').data('comment.initializer');
                    if (commentInitializer && typeof commentInitializer === 'function') {
                        commentInitializer.call(this);
                    }
                }

                if ($showTab && $showTab.length) {
                    var $lazyLoadImage = $showTab.find('img._lazy-load');
                    for (var i = 0, size = $lazyLoadImage.length; i < size; i++) {
                        var $image = $lazyLoadImage.eq(i);
                        $image.removeClass('_lazy-load');
                        if ($.fn.sourceFallback) {
                            $image.sourceFallback();
                        }
                        $image.prop('src', $image.data('src'));
                    }
                }

                if ($hideTab) {
                    $hideTab.css('display', 'none');
                }
                if ($showTab) {
                    $showTab.css('display', '');
                }
            });

            if ($player.length) {
                $player.data('tab.comment.click', function() {
                    $vodTabNavComment.trigger('click');
                });
            }
        }

        var $playContinue = $('#vod-play-continue');
        if ($playContinue.length) {
            $playContinue.on('click', function() {
                var cookieValue;
                var today = new Date();
                var cookieExpire = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toGMTString();
                if (!$playContinue.is('.on')) {
                    $playContinue.addClass('on');
                    // add cookie;
                    $playContinue.data('ga-lbl', 'on');
                    cookieValue = 'on';
                } else {
                    $playContinue.removeClass('on');
                    // remove cookie;
                    $playContinue.data('ga-lbl', 'off');
                    cookieValue = 'off';
                }
                document.cookie = [
                    'vod.play.continue', '=', cookieValue,
                    ';path=/',
                    ';expires=', cookieExpire
                ].join('');
            });
        }
    });
}(jQuery, document, window);
// 레이어 팝업 handler.
!function($, document, window, Handlebars) {
    'use strict';

    var $dimmLayer = null;
    var layerZIndex = 100000;
    var layerEffectDuration = 300;

    var confirmTemplate = null;
    var alertTemplate = null;
    var templateCache = {};

    function showLayer(that, html, options) {
        if (!$dimmLayer) {
            $dimmLayer = $('.dimm');
        }
        $dimmLayer.css('display', 'block');

        var popupId = 'popup-' + Math.floor(new Date().getTime() / 1000);
        var $layer = $('<div id="' + popupId + '" class="ly_pop_wrap _popup-layer" style="background:#fff;position:fixed;visibility:hidden;overflow:auto;width:auto;z-index:' + layerZIndex++ + '"></div>');
        $layer.html(html);
        $layer.appendTo(document.body);
        that.resetPosition($layer);
        var $beforeVisibleLayerList = $('._popup-layer').not($layer);
        if ($beforeVisibleLayerList.length) {
            $layer.data('beforeLayerPopups', $beforeVisibleLayerList);
            $beforeVisibleLayerList.velocity('fadeOut', {duration: layerEffectDuration});
        }
        var $inputElements = $layer.find('input,select,textarea');
        if ($inputElements.length) {
            $inputElements[0].focus();
        } else {
            var $linkElements = $layer.find('a');
            if ($linkElements.length) {
                $linkElements[0].focus();
            }
        }
        // select element ux plugin 연동.
        if (window['formControl']) {
            if (window['formControl'].initSelect) {
                window['formControl'].initSelect();
            }
            // radio element ux plugin 연동.
            if (window['formControl'].initRadio) {
                window['formControl'].initRadio();
            }
            // checkbox element ux plugin 연동.
            if (window['formControl'].initCheckbox) {
                window['formControl'].initCheckbox();
            }
        }
        $layer.data('layer.options', options);
        $layer.on('click', '._layer-close', function() {
            that.close($layer);
            var layerOption = $layer.data('layer.options');
            if (layerOption && layerOption.closeCallback && typeof layerOption.closeCallback === 'function') {
                layerOption.closeCallback.call(this);
            }
        });
        return $layer;
    }

    $.layer = {
        confirm: function(message, callback, options) {
            if (confirmTemplate === null) {
                var source = $('#template-confirm').html();
                if (!source) {
                    return;
                }
                confirmTemplate = Handlebars.compile(source);
            }
            var that = this;
            var html = confirmTemplate({message: (message ? message.replace(/\n/, '<br/>') : '')});
            var $layer = showLayer(that, html, options);
            $layer.on('click', '._layer-confirm', function() {
                if (callback) {
                    callback.call(that);
                    that.close($layer);
                }
            });
            return $layer;
        },
        alert: function(message, options) {
            if (alertTemplate === null) {
                var source = $('#template-alert').html();
                if (!source) {
                    return;
                }
                alertTemplate = Handlebars.compile(source);
            }
            var that = this;
            var html = alertTemplate({message: (message ? message.replace(/\n/, '<br/>') : '')});
            return showLayer(that, html, options);
        },
        open: function(templateId, context, options) {
            var that = this;
            var mergedContext = $.extend({uniqueIdNo: (layerZIndex % 100000)}, context);
            var template;
            if (templateCache[templateId]) {
                template = templateCache[templateId];
            } else {
                var source = $('#' + templateId).html();
                if (!source && console && console.error) {
                    console.error('template[' + templateId + '] missing');
                    return;
                }
                template = Handlebars.compile(source);
                templateCache[templateId] = template;
            }
            var html = template(mergedContext);
            return showLayer(that, html, options);
        },
        close: function($layer) {
            var that = this;
            var $showLayers;
            var $removeLayers;
            if ($layer && $layer.length) {
                $showLayers = $layer.data('beforeLayerPopups');
                $removeLayers = $layer;
            } else {
                $removeLayers = $('._popup-layer');
            }

            if ($showLayers && $showLayers.length) {
                $showLayers.css({'display': '', 'visibility': 'hidden'});
                that.resetPosition($showLayers)
            }
            if ($removeLayers && $removeLayers.length) {
                $removeLayers.velocity('fadeOut', {duration: layerEffectDuration, complete: function() {
                    $removeLayers.remove();

                    var $allLayerList = $('._popup-layer');

                    if (!$allLayerList.length) {
                        if (!$dimmLayer) {
                            $dimmLayer = $('.dimm');
                        }
                        $dimmLayer.css('display', 'none');
                    }
                }});
            }
        },
        resetPosition: function($layer) {
            var $win = $(window);
            $layer.css('height', '');
            var windowHeight = $win.height();
            var layerHeight = $layer.height();
            var x = Math.max(($win.width() / 2) - ($layer.width() / 2), 0);
            var y = Math.max((windowHeight / 2) - (layerHeight / 2) - 50, 0);
            if (!$layer.is(':visible') || $layer.css('visibility') === 'hidden') {
                $layer.css({'top': y + 'px', 'left': x + 'px', 'visibility': '', 'display': 'none'});
                $layer.velocity('fadeIn', {duration: layerEffectDuration});
            } else {
                $layer.velocity({top: y, left: x}, layerEffectDuration);
            }

            if (layerHeight > windowHeight) {
                $layer.css({'height': windowHeight + 'px'});
            }
        }
    };

    var windowResizeTimer;

    var windowResizeHandler = function() {
        var $layers = $('._popup-layer');
        if ($layers.length) {
            $layers = $layers.filter(':visible');
        }
        if ($layers.length) {
            $.each($layers, function(i, layer) {
                $.layer.resetPosition($(layer));
            });
        }
    };

    window.onresize = function() {
        window.clearTimeout(windowResizeTimer);
        windowResizeTimer = window.setTimeout(windowResizeHandler, 200);
    };

    $.uploader = function($fileInput, $uploadFileInput, hostUrl, formData) {
        var deferred = $.Deferred();
        if ($fileInput.length !== 1) {
            deferred.reject('call administrator.');
        }
        $fileInput.fileupload({
            url: hostUrl,
            dataType: 'json',
            formData: formData,
            done: function(e, data) {
                var result = data.result;
                if (!result) {
                    console.log('unknown error');
                } else if (!result['succeed']) {
                    $.layer.alert(result['message']);
                } else if (result['succeed'] === true && result['filename'] && result['filepath'] && result['imageUrl']) {
                    deferred.resolve({
                        origin: result['filename'],
                        path: result['filepath'],
                        url: result['imageUrl'],
                        size: result['size'],
                        sizeLabel: result['sizeLabel'],
                        type: result['type']
                    });
                    return;
                }
                deferred.reject();
            }
        });
        $fileInput.fileupload('add', {
            fileInput: $uploadFileInput
        });
        return deferred.promise();
    };
}(jQuery, document, window, Handlebars);// 게시판 댓글 handler.
!function($, document, Handlebars) {
    'use strict';

    function getBoardData($commentWrap) {
        var $articleDetailWrap = $('._article-detail-wrap');
        var host = $articleDetailWrap.data('host');
        var board, article, pfpComment;
        if (host) {
            var $articleWrap = $articleDetailWrap.find('._article-wrap');
            board = $articleWrap.data('board');
            article = $articleWrap.data('article');
        } else {
            host = $commentWrap.data('host');
            board = $commentWrap.data('content');
            article = $commentWrap.data('detail');
            pfpComment = $commentWrap.data('pfp-comment');
        }

        if (host && board) {
            return {
                host: host,
                board: board,
                article: article,
                pfpComment: pfpComment,
                apiHost: null
            };
        }
        return null;
    }

    function updateCommentCount($wrap, $commentListWrap) {
        if (!($commentListWrap && $commentListWrap.length)) {
            $commentListWrap = $wrap.find('._comment-list-wrap');
        }
        var totalCount = $commentListWrap.data('total');
        var $total = $wrap.find('._comment-count');
        $total.html(totalCount);
        var $commentLabel = $('._comment-count-label');
        if ($commentLabel.length && totalCount > 0) {
            // 유지보수 측면에서 html 에서 해당 label 변경 값을 가져오는게 나을수도... by etribe
            var totalCountLabel;
            if (totalCount > 99) {
                totalCountLabel = '99+';
            } else {
                totalCountLabel = totalCount;
            }
            $commentLabel.html(totalCountLabel);
            var $zero = $commentLabel.closest('.zero');
            if ($zero.length) {
                $zero.removeClass('zero');
            }
        }
    }

    function updatePaginateCommentList($wrap, host, page, postData) {
        if ($wrap.data('loading')) {
            return;
        }
        var submitData = $.merge([{name: 'page', value: page}], postData);
        $wrap.data('loading', true);

        $.ajax(host + 'comment/paginate', {
            data: submitData,
            method: 'POST',
            dataType: 'html',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function(data) {
            var $commentListWrap = $wrap.find('._comment-list-wrap');
            if ($commentListWrap.length) {
                $commentListWrap.replaceWith(data);
                $commentListWrap = $wrap.find('._comment-list-wrap');
            } else {
                $wrap.append(data);
                $commentListWrap = $wrap.find('._comment-list-wrap');
            }
            updateCommentCount($wrap, $commentListWrap);
        }).always(function() {
            $wrap.data('loading', false);
        });
    }

    function loadAttachLinkPreview($writeWrap, host, url) {
        if ($writeWrap.data('attach-link')) {
            return;
        }
        $writeWrap.data('attach-link', true);
        var writerId = 'attach-link-' + Math.floor(new Date().getTime() / 1000);
        $writeWrap.data('uuid', writerId);

        var $attachLinkWrap = $writeWrap.find('._attach-link');
        $attachLinkWrap.html('<div class="textarea"><div class="in_mov"><span class="cont_loading"></span></div></div>');

        $.ajax(host + 'attach/preview', {
            data: [{name: 'url', value: url}, {name: 'writer', value: writerId}],
            method: 'POST',
            dataType: 'html',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            }
        }).done(function(data) {
            var $previewLink = $(data);
            var writerId = $previewLink.data('writer');
            if (writerId === $writeWrap.data('uuid')) {
                $writeWrap.data('preview-link', url);
                var $attachLinkWrap = $writeWrap.find('._attach-link');
                $attachLinkWrap.html(data);
                $writeWrap.data('writer', null);
            }
        }).fail(function() {
            var $attachLinkWrap = $writeWrap.find('._attach-link');
            $attachLinkWrap.html('');
        }).always(function() {
            $writeWrap.data('attach-link', false);
        });
    }

    function postSomeComment($wrap, $writeWrap, host, postData) {
        var $commentContent = $writeWrap.find('textarea._comment-content');

        if ($writeWrap.data('posting')) {
            return;
        }
        var payload = $.extend({}, postData, {
            comment: $commentContent.val(),
            image: null,
            link: null,
            social: null
        });

        var $attachImage = $writeWrap.find('._attach-image img._attach-img:eq(0)');
        if ($attachImage.length) {
            payload.image = {
                url: $attachImage.prop('src'),
                alt: $attachImage.prop('alt'),
                size: $attachImage.data('size'),
                type: $attachImage.data('type'),
                origin: $attachImage.data('origin')
            };
        }

        var $attachLink = $writeWrap.find('._attach-link ._link-preview:eq(0)');
        if ($attachLink.length) {
            var $attachLinkClone = $attachLink.clone();
            $attachLinkClone.removeClass('_link-preview');
            payload.link = $attachLinkClone[0].outerHTML;
        }

        if (!(payload.comment && $.trim(payload.comment).length) && $attachImage.length < 1) {
            $commentContent[0].focus();
            $.layer.alert($commentContent.data('required') || 'comment required');
            return;
        }

        // 공유 여부 확인
        var $postSocialList = $writeWrap.find('._post-social.on');
        if ($postSocialList.length) {
            payload.social = {
                twitter: null,
                facebook: null,
                title: null,
                link: null,
                serviceTitle:null
            };
            if ($.social) {
                $.extend(payload.social, $.social.postDefaults());
            }
            for (var i = 0, size = $postSocialList.length; i < size; i++) {
                var $social = $postSocialList.eq(i);
                var platform = $social.data('social');
                if (platform === 'facebook') {
                    if ($social.data('token')) {
                        payload.social.facebook = $social.data('token');
                    } else {
                        if ($social.data('message')) {
                            $.layer.alert($social.data('message'));
                        }
                        return;
                    }
                } else if (platform === 'twitter') {
                    var twitterAccessToken = null;
                    if ($.social) {
                        var serviceTitle = "";
                        if($('meta[property="programTitle"]').attr('content') != undefined && $('meta[property="programTitle"]').attr('content') != ""){
                            serviceTitle = $('meta[property="programTitle"]').attr('content');
                        }

                        if($('._vod-player').data('programtitle') != undefined && $('._vod-player').data('programtitle') != "" ){
                            serviceTitle = $('._vod-player').data('programtitle');
                        }

                        if(serviceTitle != ""){
                            serviceTitle = " #JTBC #" + serviceTitle.replace(/ /gi, "_");
                            payload.social.serviceTitle = serviceTitle;
                        }
                        $.extend(payload.social, $.social.getTwitterTitle());

                        twitterAccessToken = $.social.twitterAccessToken();
                    }
                    if (!twitterAccessToken) {
                        if ($social.data('message')) {
                            $.layer.alert($social.data('message'));
                        }
                        return;
                    }
                    payload.social.twitter = twitterAccessToken;
                }
            }
        }

        $writeWrap.data('posting', true);

        $.ajax(host + 'comment/post', {
            contentType: 'application/json',
            data: JSON.stringify(payload),
            method: 'POST',
            dataType: 'html',
            processData: true,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            }
        }).done(function(data) {
            $wrap.html(data);
            updateCommentCount($wrap);
        }).fail(function(jqXHR) {
            if (jqXHR.status === 406) {
                var response = jqXHR.responseText;
                if (!response) {
                    return;
                }
                var responseJSON = $.parseJSON(response);
                if (!(responseJSON && responseJSON.message)) {
                    return;
                }
                var message = responseJSON.message;
                if (message) {
                    message = message.replace(/\|B\|(.+)\|B\|/, '<strong class="point">$1</strong>').replace(/\n/gi, "<br>")
                }
                $.layer.alert(message);
            }
        }).always(function() {
            $writeWrap.data('posting', false);
        });
    }

    function deleteSomeComment($wrap, host, postData) {
        if ($wrap.data('deleting')) {
            return;
        }

        $wrap.data('deleting', true);

        $.ajax(host + 'comment/delete', {
            data: postData,
            method: 'POST',
            dataType: 'html',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function(data) {
            var $commentListWrap = $wrap.find('._comment-list-wrap');
            $commentListWrap.replaceWith(data);
            $commentListWrap = $wrap.find('._comment-list-wrap');
            var totalCount = $commentListWrap.data('total');
            var $total = $wrap.find('._comment-count');
            $total.html(totalCount);
        }).always(function() {
            $wrap.data('deleting', false);
        });
    }

    function updateCommentRecommendCount($commentWrap, $button, host, postData) {
        if ($commentWrap.data('recommend')) {
            return;
        }
        $commentWrap.data('recommend', true);

        $.ajax(host + 'comment/recommend', {
            data: postData,
            method: 'POST',
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            globalExceptionHandle: true
        }).done(function(data) {
            if (data['recommend']) {
                var $recommendCount = $button.find('._count');
                if ($recommendCount.length) {
                    $recommendCount.text(data['recommend']);
                }
                $button.addClass('_log-exist on');
            }
        }).always(function() {
            $commentWrap.data('recommend', false);
        });
    }

    var reportOptionList = null;
    function getReportOptionList(host) {
        var deferred = $.Deferred();
        if (reportOptionList === null) {
            var requestUrl;
            if (host) {
                requestUrl = host + 'helper/report-options';
            } else {
                requestUrl = '/helper/report-options'
            }
            $.ajax(requestUrl, {
                method: 'POST',
                dataType: 'json'
            }).done(function(data) {
                if (data.options) {
                    reportOptionList = data.options;
                }
                deferred.resolve(reportOptionList);
            }).fail(function() {
                deferred.reject('option load error');
            });
        } else {
            deferred.resolve(reportOptionList);
        }
        return deferred;
    }

    function commentReportLayerCloseCallback($wrap) {
        var $commentReportButton = $wrap.find('._comment-report');
        if ($commentReportButton.length) {
            $commentReportButton.each(function(i, element){
                if (i == 0) {
                    $(element).focus();
                }
            });
        }
    }

    function showCommentReportForm($wrap, host, postData, apiHost) {
        if ($wrap.data('reporting')) {
            return;
        }
        $wrap.data('reporting', true);
        getReportOptionList(apiHost).done(function(optionList) {
            var $layer = $.layer.open('template-content-report', {options: optionList});
            $layer.on('click', '._layer-close', function() {
                $.layer.close($layer);
                commentReportLayerCloseCallback($wrap);
            });

            $layer.on('click', '._content-report-btn', function() {
                if ($layer.data('reporting')) {
                    return;
                }
                var $option = $layer.find('._report-option');
                var $detail = $layer.find('._report-detail');
                var option = $option.val();
                if (!option) {
                    $.layer.alert($option.data('required'));
                    return;
                }
                var detail = $detail.val();
                var submitData = $.merge([
                    {name: 'reason', value: option},
                    {name: 'detail', value: detail}
                ], postData);
                $layer.data('reporting', true);
                $.ajax(host + 'comment/report', {
                    data: submitData,
                    method: 'POST',
                    dataType: 'json',
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    globalExceptionHandle: true
                }).done(function(data) {
                    if (data.message) {
                        $.layer.alert(data.message, {
                            closeCallback: function() {
                                commentReportLayerCloseCallback($wrap);
                            }
                        });
                    }
                    $.layer.close($layer);
                    commentReportLayerCloseCallback($wrap);
                }).always(function() {
                    $layer.data('reporting', false);
                });
            });
        }).always(function() {
            $wrap.data('reporting', false);
        });
    }

    $(document).ready(function() {

        var $commentWrap = $('._comment-content-wrap');
        if (!$commentWrap.length) {
            return;
        }
        
        // 게시판 운영원칙 팝업
        $commentWrap.on('click', 'a._board-principle', function(event) {
            var $target = $(event.currentTarget);
            var targetUrl = $target.data('target');
            if (!targetUrl) {
                return;
            }
            window.open(targetUrl, 'board_principle', 'width=550, height=600, scrollbars=yes');
        });

        $commentWrap.on('click', 'a._auth-not-required', function(event){
            var $target = $(event.currentTarget);
            $target.hide();
            var $commentContent = $target.closest('._comment-write-wrap').find('._comment-content');
            if ($commentContent.length) {
                $commentContent[0].focus();
            }
        });

        var boardData = getBoardData($commentWrap);
        $commentWrap.data('comment.initializer', function() {
            $commentWrap.data('comment.initializer', null);
            var postData = [
                {name: 'ci', value: boardData.board},
                {name: 'pfpComment', value: boardData.pfpComment}
            ];
            updatePaginateCommentList($commentWrap, boardData.host, 1, postData);
        });

        var imageTemplateSource = $('#template-comment-image').html();
        if (imageTemplateSource) {
            var imageAttachTemplate = Handlebars.compile(imageTemplateSource);

            $commentWrap.on('click', '._comment-write-wrap a._upload-img', function(event) {
                var $commentWrap = $(event.currentTarget).closest('._comment-write-wrap');
                var $layer = $.layer.open('template-image-uploader', {});
                var $target = $(event.currentTarget);
                $layer.on('click', '._layer-close', function() {
                    $.layer.close($layer);
                    $target.focus();
                });
                var $uploadFile = $layer.find('._upload-file');
                if ($uploadFile.length) {
                    if (boardData) {
                        $uploadFile.on('change', function(event) {
                            var $fileInput = $(event.currentTarget);
                            var filename = $fileInput.val().split('/').pop().split('\\').pop();
                            var $input = $fileInput.closest('._upload-file-wrap').find('input[type="text"]');
                            if ($input.length) {
                                $input.val(filename);
                            }
                            $fileInput.addClass('_upload-pending');
                        });

                        $layer.on('click', '._upload-image-file', function() {
                            var formData = {
                                board: boardData.board,
                                article: !!(boardData.article),
                                comment: true
                            };

                            var $fileInput = $('<input type="file" style="display:none;"/>');
                            $layer.append($fileInput);
                            $.uploader($fileInput, $layer.find('._upload-pending'), boardData.host + 'upload/image', formData).done(function(data) {
                                var $imageComment = $layer.find('textarea._img-comment');
                                var html = imageAttachTemplate({source: data.url, alt: $imageComment.val(), size: data.size, type: data.type, origin: data.origin});
                                var $attachImageWrap = $commentWrap.find('._attach-image');
                                var $attachImageButton = $commentWrap.find('a._upload-img');
                                window.setTimeout(function() {
                                    $attachImageWrap.append(html);
                                    $attachImageButton.css('display', 'none');
                                }, 100);
                                // 개발서버에서 이미지가 바로 반영이 안 되는 문제가 있어 서버에 반영될 수 있도록 약간의 delay 를 줌.
                                $.layer.close($layer);
                                var $authRequiredLayer = $commentWrap.find('a._auth-not-required');
                                if ($authRequiredLayer.length) {
                                    $authRequiredLayer.css('display', 'none');
                                }
                                var $commentContentWrap = $commentWrap.find('textarea._comment-content');
                                if ($commentContentWrap.length) {
                                    $commentContentWrap.focus();
                                }
                            });
                        });
                    }
                }
            });

            // 첨부 이미지 삭제 버튼 클릭시
            $commentWrap.on('click', '._comment-write-wrap a._attach-img-del', function(event) {
                var $commentWriteWrap = $(event.currentTarget).closest('._comment-write-wrap');
                var $attachImageWrap = $commentWriteWrap.find('._attach-image');
                var $attachImageButton = $commentWriteWrap.find('a._upload-img');
                $attachImageWrap.html('');
                $attachImageButton.css('display', '');
            });
        }

        // 글 내용에 URL 이 입력된 경우
        $commentWrap.on('keypress blur', '._comment-write-wrap textarea._comment-content', function(event) {
            if (event.keyCode === 13 || event.keyCode === 32 || event.type === 'focusout') {
                var $target = $(event.currentTarget);
                var $writeWrap = $target.closest('._comment-write-wrap');
                if ($writeWrap.data('preview-link')) {
                    // 이미 미리보기 데이터가 있다면 더 이상 진행 안 함.
                    return;
                }
                var text = $target.val();
                var detectUrlList = [];
                var pattern = /(((https?:\/\/)|(www\.))[^\s]+)/gi;
                var matcher;
                while (matcher = pattern.exec(text)) {
                    var detectUrl = matcher[1];
                    if (!/^http.+/i.test(detectUrl)) {
                        detectUrl = 'http://' + detectUrl;
                    }
                    if (/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?.*)?$/i.test(detectUrl)) {
                        detectUrlList.push(detectUrl);
                    }
                }
                if (!detectUrlList.length) {
                    return;
                }
                var disableUrlArray = $writeWrap.data('link-preview-disable');
                var previewUrl = null;
                if (disableUrlArray) {
                    for (var i = 0, size = detectUrlList.length; i < size; i++) {
                        if ($.inArray(detectUrlList[i], disableUrlArray) === -1) {
                            previewUrl = detectUrlList[i];
                            break;
                        }
                    }
                    // 이미 preview 를 하지 않기로 한 경우. (파싱된 preview 를 삭제한 경우)
                } else {
                    previewUrl = detectUrlList[0];
                }
                if (previewUrl === null) {
                    return;
                }

                loadAttachLinkPreview($writeWrap, boardData.host, previewUrl);
            }
        });

        // 글 내용중 URL 삭제 버튼을 클릭한 경우.
        $commentWrap.on('click', '._attach-link a._link-remove', function(event) {
            var $target = $(event.currentTarget);
            var $attachLinkWrap = $target.closest('._attach-link');
            var $writeWrap = $target.closest('._comment-write-wrap');
            var previewLink = $writeWrap.data('preview-link');
            $writeWrap.data('preview-link', null);
            var previewDisableList = $writeWrap.data('link-preview-disable');
            if (!previewDisableList) {
                previewDisableList = [];
            }
            previewDisableList.push(previewLink);
            $writeWrap.data('link-preview-disable', previewDisableList);
            $attachLinkWrap.html('');
        });

        // 글 등록 버튼 클릭시
        $commentWrap.on('click', '._comment-write-wrap a._comment-post-btn', function(event) {
            var $commentWriteWrap = $(event.currentTarget).closest('._comment-write-wrap');
            var postData = {ci: boardData.board, article: boardData.article, parent: 0, pfpComment: boardData.pfpComment};
            if ($commentWriteWrap.closest('._comment-reply-write').length) {
                var $parentComment = $commentWriteWrap.closest('._comment-item');
                if ($parentComment.length) {
                    postData.parent = $parentComment.data('comment');
                }
            }
            postSomeComment($commentWrap, $commentWriteWrap, boardData.host, postData);
        });

        // 더보기 클릭시
        $commentWrap.on('click', '._btn-comment-more', function(event) {
            var $target = $(event.currentTarget);
            var page = $target.data('nextpage');
            var postData = [
                {name: 'ci', value: boardData.board},
                {name: 'article', value: boardData.article}
            ];
            updatePaginateCommentList($commentWrap, boardData.host, page, postData);
        });

        // 새로고침 클릭시
        $commentWrap.on('click', '._btn-comment-refresh', function() {
            var postData = [
                {name: 'ci', value: boardData.board},
                {name: 'article', value: boardData.article},
                {name: 'pfpComment', value: boardData.pfpComment}
            ];
            updatePaginateCommentList($commentWrap, boardData.host, 1, postData);
        });

        // 글 삭제 클릭시
        $commentWrap.on('click', '._comment-delete', function(event) {
            var $target = $(event.currentTarget);
            var message = $target.data('message') || 'Delete Confirm';
            $.layer.confirm(message, function() {
                var $commentItem = $target.closest('._comment-item');
                if (!$commentItem.length) {
                    return;
                }
                var comment = $commentItem.data('comment');
                if (!comment) {
                    return;
                }
                var postData = [
                    {name: 'ci', value: boardData.board},
                    {name: 'article', value: boardData.article},
                    {name: 'comment', value: comment},
                    {name: 'pfpComment', value: boardData.pfpComment}
                ];
                deleteSomeComment($commentWrap, boardData.host, postData);
            });
        });

        // '답글달기' 클릭시
        var replyTemplateHtml = $('#template-comment-reply').html();
        if (replyTemplateHtml) {
            $commentWrap.on('click', '._comment-reply-btn', function(event) {
                var $target = $(event.currentTarget);
                var $item = $target.closest('._comment-item');
                var $replyWriteWrap = $item.find('._comment-reply-write');
                if ($replyWriteWrap.find('._comment-write-wrap').length) {
                    // 이미 활성화된 답글달기가 있으므로 skip.
                    return;
                }

                $replyWriteWrap.html(replyTemplateHtml);
            });
        }

        // 추천 버튼 클릭.
        $commentWrap.on('click', '._comment-recommend', function(event) {
            var $target = $(event.currentTarget);
            if ($target.is('._log-exist')) {
                var message = $target.data('message');
                $.layer.alert(message, {
                    closeCallback: function() {
                        $target.focus();
                    }
                });
                return;
            }
            var $commentItem = $target.closest('._comment-item');
            var postData = [
                {name: 'ci', value: boardData.board},
                {name: 'article', value: boardData.article},
                {name: 'comment', value: $commentItem.data('comment')},
                {name: 'pfpComment', value: boardData.pfpComment}
            ];
            updateCommentRecommendCount($commentItem, $target, boardData.host, postData);
        });

        // 신고 클릭
        $commentWrap.on('click', '._comment-report', function(event) {
            var $target = $(event.currentTarget);
            var $commentItem = $target.closest('._comment-item');
            var postData = [
                {name: 'ci', value: boardData.board},
                {name: 'article', value: boardData.article},
                {name: 'comment', value: $commentItem.data('comment')},
                {name: 'pfpComment', value: boardData.pfpComment}
            ];
            showCommentReportForm($commentItem, boardData.host, postData, boardData.apiHost);
        });

        // 소셜 토글
        $commentWrap.on('click', '._post-social', function(event) {
            var $target = $(event.currentTarget);
            $target.toggleClass('on');
            if (!$target.is('.on')) {
                return;
            }
            var platform = $target.data('social');
            if (platform === 'facebook' && $.social) {
                $.social.facebookConnect().done(function(accessToken) {
                    $target.data('token', accessToken);
                });
            } else if (platform === 'twitter' && $.social) {
                $.social.twitterConnect();
            }
        });
    });
}(jQuery, document, Handlebars);// 로그인이 필요한 경우에 대한 동작 처리
!function($, document, window) {
    'use strict';

    $(document).on('click', '._auth-required', function(event)  {
        var $globalLoginButton = $('#btn-login-global');
        if ($globalLoginButton.length) {
            var loginURL = $globalLoginButton.prop('href');
            if (!loginURL || loginURL === '#') {
                return;
            }

            var $target = $(event.currentTarget);
            if ($target.closest('._comment-content-wrap').length) {
                // 댓글 영역에서의 클릭으로 로그인 페이지 이동이라면.
                var today = new Date();
                var cookieExpire = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toGMTString();
                document.cookie = 'page.focus.initial=_comment;path=/;expires=' + cookieExpire;
            }

            window.location.href = loginURL;
        }
    });

    $(document).ready(function() {
        var pageInitialFocus = (function(cookieData) {
            if (cookieData) {
                var cookies = cookieData.split(';');
                for(var c = 0, cSize = cookies.length; c < cSize; c++) {
                    var cookie = cookies[c];
                    while (cookie.charAt(0) == ' ') {
                        cookie = cookie.substring(1);
                    }
                    if (cookie.indexOf('page.focus.initial') === 0) {
                        return cookie.substring('page.focus.initial'.length + 1, cookie.length);
                    }
                }
            }
            return '';
        })(document.cookie);
        if (pageInitialFocus) {
            document.cookie = 'page.focus.initial=;path=/;expires=' + new Date().toGMTString();
        }
        if (pageInitialFocus === '_comment') {
            // 댓글 영역 이동처리.
            var $commentWrap = $('._comment-content-wrap');
            if (!$commentWrap.length) {
                return;
            }

            var $tabContent = $commentWrap.closest('._tab-content');
            if ($tabContent.length) {
                var $commentTabNav = $('._tab-nav-comment');
                if ($commentTabNav.length) {
                    $commentTabNav.trigger('click');
                }
            }

            $commentWrap.velocity('scroll', {
                duration: 500,
                delay: 50,
                offset: -200
            });
        }
    });
}(jQuery, document, window);!function($, window, document) {
    var metaList = document.getElementsByTagName('meta');
    var facebookAppId = null;
    var kakaoAppId = null;
    var naverAppId = null;
    var openGraphTitle = null;
    var openGraphPageURL = null;
    var openGraphPageDescription = null;
    var openGraphPageImage = null;
    var openGraphPageBoardTitle = null;
    var openGraphProgramTitle = null;
    var baseURL = null;
    for (var i = 0, size = metaList.length; i < size; i++) {
        var meta = metaList[i];
        var metaName = meta.getAttribute('name');
        var metaProperty = meta.getAttribute('property');
        var metaContent = meta.getAttribute('content');
        if (metaName === 'fbAppId') {
            facebookAppId = metaContent;
        } else if (metaProperty === 'og:title') {
            openGraphTitle = metaContent;
        } else if (metaProperty === 'og:url') {
            openGraphPageURL = metaContent;
        } else if (metaProperty === 'og:description') {
            openGraphPageDescription = metaContent;
        } else if (metaProperty === 'og:image') {
            openGraphPageImage = metaContent;
        }else if(metaProperty === 'og:boardTitle'){
            openGraphPageBoardTitle = metaContent;
        }else if(metaProperty === 'programTitle'){
            openGraphProgramTitle = metaContent.replace(/ /gi, "_");
        }else if (metaName === 'jtbc:base') {
            baseURL = metaContent;
        } else if (metaName === 'kakaoAppId') {
            kakaoAppId = metaContent;
        }else if (metaName === 'naverAppId') {
            naverAppId = metaContent;
        }
    }

    var facebookAccessToken = null;
    var twitterAccessToken = null;
    var kakaoAccessToken = null;
    var kakaoInint = false;
    var naverAccessToken = null;

    window.socialTwitterCallback = function(accessToken) {
        twitterAccessToken = accessToken;
        if (typeof twttierCallback == 'function') {
            twttierCallback();
        }
    };

    window.socialNaverCallback = function(accessToken ) {
        naverAccessToken = accessToken;
    };

    $.social = {
        postDefaults: function(withDescription) {
            return {
                title: openGraphTitle || document.title,
                link: openGraphPageURL || window.location.href,
                content: withDescription ? openGraphPageDescription : null,
                image: openGraphPageImage ? openGraphPageImage : null
            };
        },
        getTwitterTitle:function() {
            return {
                title : openGraphPageBoardTitle || openGraphTitle,
                programTitle : openGraphProgramTitle
            }
        },
        facebookConnect: function() {
            var deferred = $.Deferred();
            if (facebookAccessToken) {
                deferred.resolve(facebookAccessToken);
            } else if (FB) {
                FB.login(function(response) {
                    if (response.authResponse) {
                        facebookAccessToken = response.authResponse.accessToken;
                        deferred.resolve(facebookAccessToken);
                    } else {
                        deferred.reject();
                    }
                }, {scope: 'publish_actions'});
            } else {
                deferred.reject('Facebook SDK not loaded.');
            }
            return deferred;
        },
        facebookShare: function(link) {
            var deferred = $.Deferred();
            if (FB) {
                FB.ui({
                    method: 'share',
                    display: 'popup',
                    href: link
                }, function(response) {
                    if (response && response['post_id']) {
                        deferred.resolve(response['post_id']);
                        return;
                    }
                    deferred.reject();
                });
            } else {
                deferred.reject('Facebook SDK not loaded.');
            }
            return deferred;
        },
        twitterConnect: function() {
            if (twitterAccessToken) {
                return;
            }
            if (!baseURL) {
                baseURL = window.location.origin + '/';
            }
            window.open(baseURL + 'social/twitter/oauth');
        },
        twitterAccessToken: function() {
            return twitterAccessToken;
        },
        kakaoConnect:function() {
            if(kakaoInint){
                return;
            }
            kakaoInint = true;
            Kakao.init(kakaoAppId);
        },
        kakaoAccessToken:function() {
            return kakaoAccessToken;
        },
        naverAccessToken: function() {
            return naverAccessToken;
        },
        naverConnect:function () {
            if (naverAccessToken) {
                return;
            }
            if (!baseURL) {
                baseURL = window.location.origin + '/';
            }

            var encodeURL = encodeURIComponent(baseURL +"social/naver/oauth");
            window.open("https://nid.naver.com/oauth2.0/authorize?client_id="+ naverAppId
                + "&response_type=code"
                + "&redirect_uri="+ encodeURL
                + "&sate=jtbcsns"
            );
        }
    };

    if (facebookAppId) {
        window.fbAsyncInit = function() {
            FB.init({
                appId      : facebookAppId,
                xfbml      : true,
                version    : 'v3.1'
            });

            /*
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected' && response.authResponse) {
                    facebookAccessToken = response.authResponse.accessToken;
                }
            });
            */
        };

        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/ko_KR/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }

    if(kakaoAppId){
        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "//developers.kakao.com/sdk/js/kakao.story.min.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'kakaostory-js-sdk'));

        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "//developers.kakao.com/sdk/js/kakao.min.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'kakao-js-sdk'));

    }


}(jQuery, window, document);!(function($) {
    'use strict';

    $.validator.setDefaults({
        ignore: '',
        invalidHandler: function(event, validator) {
            if (validator.numberOfInvalids() > 0) {
                for (var i = 0, size = validator.errorList.length; i < size; i++) {
                    var invalidData = validator.errorList[i];
                    var $invalidElement = $(invalidData.element);
                    var invalidMethod = invalidData.method.toLowerCase();
                    var invalidMessage;
                    if ($invalidElement.is('[type="radio"]')) {
                        invalidMessage = $(document.getElementsByName($invalidElement.prop('name'))[0]).data(invalidMethod);
                    } else {
                        invalidMessage = $invalidElement.data(invalidMethod);
                    }
                    if (invalidMessage) {
                        if ($.layer) {
                            $.layer.alert(invalidMessage, {
                                closeCallback: function() {
                                    if ($invalidElement && $invalidElement.length) {
                                        $invalidElement[0].focus();
                                    }
                                }
                            });
                        } else{
                            alert(invalidMessage);
                        }
                        return;
                    }
                }
            }
        },
        showErrors: function() {}
    });

})(jQuery);!(function($, document) {
    'use strict';

    var metaList = document.getElementsByTagName('meta');
    var googleAnalyticsTrackers = null;
    for (var i = 0, size = metaList.length; i < size; i++) {
        var meta = metaList[i];
        var metaName = meta.getAttribute('name');
        var metaContent = meta.getAttribute('content');
        if (metaName === 'gaTrackers') {
            googleAnalyticsTrackers = metaContent;
        }
    }

    var trackers = [];

    $.analytics = {
        triggerManualEventLog: function($element) {
            var category = $element.data('ga-cat');
            var action = $element.data('ga-act');
            var label = $element.data('ga-lbl');

            ga('send', 'event', category, action, label);
            if (trackers && trackers.length) {
                for (var t = 0, tSize = trackers.length; t < tSize; t++) {
                    ga(trackers[t] + '.send', 'event', category, action, label);
                }
            }
        }
    };

    if (googleAnalyticsTrackers) {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        trackers = (function() {
            var trackerIdList = googleAnalyticsTrackers.split(',');
            var trackerList = [];
            if (trackerIdList && trackerIdList.length) {
                for (var i = 0, size = trackerIdList.length; i < size; i++) {
                    var tracker = trackerIdList[i];
                    if (i === 0) {
                        ga('create', tracker, 'auto');
                    } else {
                        var trackerName = 'jtbc' + i;
                        ga('create', tracker, 'auto', trackerName);
                        trackerList.push(trackerName);
                    }
                }
            }
            return trackerList;
        })(googleAnalyticsTrackers);

        ga('send', 'pageview');
        if (trackers && trackers.length) {
            for (var t = 0, tSize = trackers.length; t < tSize; t++) {
                ga(trackers[t] + '.send', 'pageview');
            }

            var $document = $(document);
            $(document).ready(function() {
                $document.on('click', '._ga-event', function(event) {
                    var $target = $(event.currentTarget);
                    var category = $target.data('ga-cat');
                    var action = $target.data('ga-act');
                    var label = $target.data('ga-lbl');

                    ga('send', 'event', category, action, label);
                    if (trackers && trackers.length) {
                        for (var t = 0, tSize = trackers.length; t < tSize; t++) {
                            ga(trackers[t] + '.send', 'event', category, action, label);
                        }
                    }
                });
            });
        }
    }

})(jQuery, document);!function($, document, window) {
    'use strict';

    var $ongoingPayment = null;

    window.paymentFail = function(message) {
        setTimeout(function() {
            $.layer.alert(message);
        }, 200);
        // 브라우져의 부드러운 인터랙션을 위해 임의이 시간 (200 밀리초) delay.
    };

    window.paymentSuccess = function(message, goodsId, goodsName, goodsDescription, checkoutPrice, paymentMethod, username, phone, email, isEvent) {
        var context = {
            goods: {
                name: goodsName,
                description: goodsDescription,
                priceLabel: checkoutPrice
            },
            payment: {
                method: paymentMethod,
                name: username,
                phone: phone,
                email: email
            }
        };
        var layerOptions = {closeCallback: null};
        var verifyPaymentResult = true;
        var $paymentRequestLayer = null;
        if ($ongoingPayment && $ongoingPayment.length) {
            var $layer = $ongoingPayment.data('payment.ongoing');
            if ($layer && $layer.length) {
                $paymentRequestLayer = $layer;
            }

            var paymentData = $ongoingPayment.data('payment.data');
            if (paymentData && paymentData.length) {
                for (var i = 0, size = paymentData.length; i < size; i++) {
                    if (!paymentData[i].value) {
                        continue;
                    }
                    if (paymentData[i].name === 'goods' || paymentData[i].name === 'episode') {
                        verifyPaymentResult = verifyPaymentResult && (goodsId === paymentData[i].value.toUpperCase());
                    } else if (paymentData[i].name === 'description') {
                        context.goods.description = paymentData[i].value;
                    }
                }
            }

            var finishCallback = $ongoingPayment.data('payment.finishCallback');
            if (finishCallback && typeof finishCallback === 'function') {
                layerOptions.closeCallback = finishCallback;
            }
        }

        setTimeout(function() {
            if (verifyPaymentResult) {
                var $layer = $.layer.open('template-voucher-complete', context, layerOptions);

                var $timer = $layer.find('._close-timer');
                if ($timer.length) {
                    var closeTime = $timer.data('close');
                    if (closeTime) {
                        closeTime = parseInt(closeTime, 10);
                    }
                    if (closeTime) {
                        var timerId = setInterval(function() {
                            $timer.data('close', $timer.data('close') - 1);
                            $timer.text($timer.data('close'));
                        }, 1000);

                        setTimeout(function() {

                            if(isEvent == 'event') {

                                clearInterval(timerId);
                                $.layer.close($layer);

                                var $eventEndlayer = $.layer.open('template-voucher-complete-event-end', context, layerOptions);

                                /*
                                if (layerOptions && layerOptions.closeCallback) {
                                    layerOptions.closeCallback.call(this);
                                }
                                */
                            } else {
                                clearInterval(timerId);
                                $.layer.close($layer);
                                if (layerOptions && layerOptions.closeCallback) {
                                    layerOptions.closeCallback.call(this);
                                }
                            }

                        }, closeTime * 1000);
                        setTimeout(function() {
                            $layer.find('.auto_close a.btns.btn_basic').show();
                        }, (closeTime + 1) * 1000);
                    }
                }
            } else {
                $.layer.alert(message, layerOptions);
            }
            if ($paymentRequestLayer && $paymentRequestLayer.length) {
                $.layer.close($paymentRequestLayer);
            }
        }, 200);
        // 브라우져의 부드러운 인터랙션을 위해 임의이 시간 (200 밀리초) delay.
    };

    $.payment = {
        purchase: function($wrap, data, autoPay, finishCallback) {
            $ongoingPayment = $wrap;
            if (finishCallback) {
                $ongoingPayment.data('payment.finishCallback', finishCallback);
            } else {
                $ongoingPayment.data('payment.finishCallback', null);
            }

            var formId = 'checkout_' + Math.floor(new Date().getTime() / 1000);
            var formTargetId = formId + '_request';
            var context = {formId: formId, formTargetId: formTargetId};
            if (data) {
                $.extend(context, data);
            }
            var $layer = $.layer.open('template-voucher-purchase', context);
            var $form = $layer.find('#' + formId);
            $form.find('input[name=return]').val(window.location.href);
            $form.validate({
                rules: {
                    'method': {
                        required: true
                    },
                    'name': {
                        required: true
                    },
                    'phone': {
                        required: true,
                        number: true
                    },
                    'email': {
                        required: true,
                        email: true
                    },
                    'consent-pay': {
                        required: true
                    },
                    'consent-use': {
                        required: true
                    },
                    'consent-sp': {
                        required: true
                    },
                    'consent-auto': {
                        required: autoPay
                    }
                },
                submitHandler: function() {
                    $ongoingPayment.data('payment.ongoing', $layer);
                    $ongoingPayment.data('payment.data', $form.serializeArray());
                    window.open('about:blank', formTargetId,"width=820,height=600");
                    $form[0].submit();
                    // TODO: 결제중입니다. 표시 필요?
                    //$layer.css('visibility', 'hidden');
                }
            });
            $layer.on('click', '._checkout', function() {
                var ajaxUrl = $form.attr('action').match(/^(http:\/\/|https:\/\/)[a-z0-9]+([\-.][a-z0-9]+)*\.[a-z]{2,}(:[0-9]+)?/gm);
                var ajaxData = {
                    goods: $form.find('input[name=goods]').val(),
                    auto: $form.find('input[name=auto]').val()
                };
                $.ajax({
                    url: ajaxUrl[0] + '/payment/request/validate',
                    method: 'POST',
                    data: ajaxData,
                    dataType: 'json',
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    }
                }).done(function () {
                    $form.submit();
                }).fail(function (jqXHR) {
                    var message = (jqXHR.status === 500) ? '결제 시도 중 오류가 발생하였습니다. 잠시 후 다시 시도해 주십시오. 문제가 지속될 경우 고객센터로 문의해 주십시오.' : jqXHR.responseJSON.message;
                    $.layer.alert(message, {
                        closeCallback: function() {
                            $.layer.close($layer);
                        }
                    });
                });
            });

            var $consentAll = $layer.find('._consent-all'), $consentItemList = $layer.find('input:checkbox._consent-item');
            $consentAll.on('click', function() {
                var checked = $consentAll.prop('checked');
                $.each($consentItemList, function(i, element) {
                    element.checked = checked;
                    $(element).data('checkbox').refresh();
                })
            });

            $consentItemList.on('click', function() {
                var allChecked = true;
                for (var i = 0, size = $consentItemList.length; i < size; i++) {
                    if (!$consentItemList.eq(i).prop('checked')) {
                        allChecked = false;
                        break;
                    }
                }
                $consentAll.prop('checked', allChecked);
                $consentAll.data('checkbox').refresh();
            });
        },
        legacy: function($wrap, billingURL, data, finishCallback) {
            $ongoingPayment = $wrap;
            if (finishCallback) {
                $ongoingPayment.data('payment.finishCallback', finishCallback);
            } else {
                $ongoingPayment.data('payment.finishCallback', null);
            }

            var formId = 'checkout_' + Math.floor(new Date().getTime() / 1000);
            var formTargetId = formId + '_request';
            var hiddenList = [];
            for (var i = 0, size = data.length; i < size; i++) {
                hiddenList.push('<input type="hidden" name="' + data[i].name + '" value="' + data[i].value.replace(/"/g, '&quot;') + '"/>');
            }
            var $form = $('<form id="' + formId + '" method="post" action="' + billingURL + 'payment/request" target="' + formTargetId + '"></form>');
            $(document.body).append($form);
            $form.append(hiddenList.join(''));

            window.open('about:blank', formTargetId, 'width=700,height=640');
            $form[0].submit();
        }
    };
}(jQuery, document, window);!function($, document) {
    'use strict';

    var searchHandler = function($wrap) {
        var formId = $wrap.data('form-id');
        var $form = $wrap.find('.' + formId);
        var searchSubmitBeforeHandler = function() {
            var $input = $form.find('input[name="term"]');
            var pattern = /[^0-9a-zA-Zㄱ-힣\s]/g;
            var value = $input.val();
            if (pattern.test(value)) {
                $.layer.alert($input.data('exception'), {
                    closeCallback: function() {
                        $input.val(value.replace(pattern, ''));
                        $form.submit();
                    }
                });
            } else {
                $form.submit();
            }
        };

        $wrap.on('click', '._btn-search-confirm', function() {
            searchSubmitBeforeHandler();
        });
        $wrap.on('keypress', 'input[name="term"]', function(event) {
            if (event.keyCode === 13) {
                searchSubmitBeforeHandler();
                return false;
            }
        });
    };

    var latestSearchEnable = (function(cookieData) {
        if (cookieData) {
            var cookies = cookieData.split(';');
            var cookieName = 'latest.search.term.enable';
            for(var c = 0, cSize = cookies.length; c < cSize; c++) {
                var cookie = cookies[c];
                if (cookie.indexOf(cookieName) > -1) {
                    while (cookie.charAt(0) == ' ') {
                        cookie = cookie.substring(1);
                    }
                    var option = cookie.substring(cookieName.length + 1, cookie.length)
                    if (option == 'on') {
                        return true;
                    }
                }
            }
        }
        return false;
    })(document.cookie);

    function setLatestSearchCookie(cookieName, cookieValue) {
        var today  = new Date();
        var cookieExpire = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toGMTString();
        if(cookieValue.length) {
            document.cookie = [
                cookieName, '=', cookieValue,
                ';path=/',
                ';expires=', cookieExpire
            ].join('');
        } else {
            document.cookie = cookieName + '=' + ';path=/' + ';expires=' + new Date().toGMTString();
        }

    }
    function toggleLatestSearch($wrap, enable) {
        var $disable = $wrap.find('a._latest-search-disable');
        var $enable = $wrap.find('a._latest-search-enable');
        var $reset = $wrap.find('a._latest-search-reset');
        if (!$disable.length) {
            return;
        }
        if (!$enable.length) {
            return;
        }
        if (!$reset.length) {
            return;
        }
        if (enable) {
            $disable.show();
            $reset.show();
            $enable.hide();
        } else {
            $disable.hide();
            $reset.hide();
            $enable.show();
        }
    }

    $(document).ready(function() {
        var $searchConfirm = $('._btn-search-confirm');
        if ($searchConfirm.length) {
            $searchConfirm.each(function(i, element) {
                var $searchConfirmWrap = $(element).closest('div');
                searchHandler($searchConfirmWrap);
            });
        }

        var $searchParentWrap = $('._latest-search-parent-wrap');
        if ($searchParentWrap.length) {
            var $latestSearchWrap = $searchParentWrap.find('._latest-search-wrap');
            if ($latestSearchWrap.length) {

                var $body = $(document.body);
                var layerExternalClickHandler = function(event) {
                    var $target = $(event.originalEvent.target);
                    if (!$target.length) {
                        $target = $(event.originalEvent.srcElement);
                    }
                    if ($target.is($latestSearchWrap) || $target.closest($latestSearchWrap).length
                        || $target.is($searchParentWrap) || $target.closest($searchParentWrap).length) {
                        return true;
                    }
                    $body.off('click', layerExternalClickHandler);
                    $latestSearchWrap.hide();
                };

                $searchParentWrap.on('focus', '._search-input', function() {
                    $body.on('click', layerExternalClickHandler);
                    $latestSearchWrap.show();
                });

                $latestSearchWrap.on('click', 'a._latest-search-element', function(event){
                	event.preventDefault();
                    var $target = $(event.currentTarget);
                    var latestTerm = $target.data('term');
                    if (!latestTerm) {
                        return;
                    }
                    var $searchInput = $searchParentWrap.find('._search-input');
                    if ($searchInput.length) {
                        $searchInput.val(latestTerm);
                        var formId = $searchParentWrap.data('form-id');
                        if (formId !== undefined) {
                        	$searchParentWrap.find('.' + formId).submit();
                        }
                    }
                });

                var $latestSearchFuncWrap = $('._latest-search-function-wrap');
                if ($latestSearchFuncWrap.length) {

                    var $disableTextWrap = $latestSearchWrap.find('div._latest-search-disable-text');
                    var $noDataTextWrap = $latestSearchWrap.find('._latest-search-no-data');
                    var $dataWrap = $latestSearchWrap.find('._latest-search-list');
                    if (!$dataWrap.length) {
                        return;
                    }
                    if (!$disableTextWrap.length) {
                        return;
                    }
                    if (!$noDataTextWrap.length) {
                        return;
                    }
                    var enableCookieName = $latestSearchFuncWrap.data('enable-cookie-name');
                    if (!enableCookieName) {
                        return;
                    }

                    if (latestSearchEnable) {
                        $disableTextWrap.hide();
                        var $dataElementWrap = $dataWrap.find('ul._term-element-wrap');
                        if ($dataElementWrap.length) {
                            var $termElement = $dataElementWrap.find('li._term-element');
                            if ($termElement.length) {
                                $dataWrap.show();
                            } else {
                                $noDataTextWrap.show();
                            }
                        } else {
                            $noDataTextWrap.show();
                        }
                    } else {
                        $disableTextWrap.show();
                        $noDataTextWrap.hide();
                        $dataWrap.hide();
                    }

                    toggleLatestSearch($latestSearchFuncWrap, latestSearchEnable);

                    $latestSearchFuncWrap.on('click', 'a._latest-search-reset', function(event){
                        var resetCookieName = $latestSearchFuncWrap.data('reset-cookie-name');
                        if (!resetCookieName) {
                            return;
                        }
                        setLatestSearchCookie(resetCookieName, '');
                        var $target = $(event.currentTarget);
                        $noDataTextWrap.show();
                        $target.hide();
                        $dataWrap.html('');
                        $dataWrap.hide();
                    });
                    $latestSearchFuncWrap.on('click', 'a._latest-search-disable', function(event){
                        var $target = $(event.currentTarget);
                        var enable = $target.data('enable');
                        setLatestSearchCookie(enableCookieName, enable);
                        toggleLatestSearch($latestSearchFuncWrap, false);
                        $disableTextWrap.show();
                        $noDataTextWrap.hide();
                        $dataWrap.hide();
                    });
                    $latestSearchFuncWrap.on('click', 'a._latest-search-enable', function(event){
                        var $target = $(event.currentTarget);
                        var enable = $target.data('enable');
                        setLatestSearchCookie(enableCookieName, enable);
                        toggleLatestSearch($latestSearchFuncWrap, true);
                        $disableTextWrap.hide();
                        if ($dataWrap.find('ul > li').length == 0) {
                            $dataWrap.hide();
                            $noDataTextWrap.show();
                        } else {
                            $dataWrap.show();
                            $noDataTextWrap.hide();
                        }
                    });
                }
            }
        }

    });

}(jQuery, document);!function($, document) {
    'use strict';

    var cookies = null;
    var isLogin = false;
    var currentRequestURL = '';

    var initPersonal = function() {
        if (!String.prototype.trim) {   // trim 메소드 재정의
            String.prototype.trim = function () {
                return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
            };
        }
    };

    var getCookies = function(cookie) {
        return cookie.split(';');
    };

    var validateLogin = function() {
        var ssoInfo = getCookie( 'SSOInfo');
        var socialId = getCookie('JCUBE_SOCIAL_ID');
        return ssoInfo != '' || socialId != '';
    };

    var getCookie = function(cname) {
        if (cookies === undefined) {
            return '';
        }

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.indexOf(cname + '=') == 0) {
                return cookie.replace(cname + '=', '');
            }
        }

        return '';
    };

    var getCurrentRequestURL = function() {
        var reqURL = location.href;
        if (location.hostname.indexOf("onair.") > -1 && location.pathname.indexOf("/onair") == 0) {
            reqURL = location.href.replace(location.pathname, location.pathname.substring("/onair".length));
        } else if (location.hostname.indexOf("vod.") > -1 && location.pathname.indexOf("/vod") == 0) {
            reqURL = location.href.replace(location.pathname, location.pathname.substring("/vod".length));
        }
        return reqURL;
    };

    var fixedEncodeURIComponent = function(str) {
        if (str === undefined || str == null || str == ""){
            return "";
        }
        return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
    };

    var getJoinsIcon = function() {
        var icon = '';
        switch (getCookie( 'JCUBE_SOCIAL_TYPE')) {
            case 'facebook':
                icon = "<span class=\"ico_util ico_facebook\">페이스북 계정</span>";
                break;
            case 'twitter':
                icon = "<span class=\"ico_util ico_twitter\">트위터 계정</span>";
                break;
            case 'kakao':
                icon = "<span class=\"ico_util ico_kakao\">카카오 계정</span>";
                break;
            default:
                icon = "<span class=\"ico_util ico_joins\">조인스 계정</span>";
        }

        return icon;
    };

    var getBaseFullURL = function(path) {
        var baseDomain = 'jtbc.joins.com';
        if (path.indexOf('/') == 0) {
            path = path.substring(1);
        }
        return 'http://' + baseDomain + '/' + path;
    };

    var drawLoginArea = function() {
        var targetURL = fixedEncodeURIComponent(currentRequestURL);
        if (isLogin) {
            $(".login_area_01").append("<a href=\"/logout?t=" + targetURL + "\">" + getJoinsIcon() + " 로그아웃</a>");
            $(".login_area_02").append("<a href=\"" + getBaseFullURL('my') + "\">마이페이지</a>");
            if (location.pathname.indexOf('/my') == 0) {
                $(".login_area_02").addClass('on');
            }
        } else {
            $(".login_area_01").append("<a href=\"https://my.joins.com/register/regist.asp?TargetURL=" + targetURL + "\">회원가입</a>");
            $(".login_area_02").append("<a href=\"https://my.joins.com/login/JTBC/login.asp?TargetURL=" + targetURL + "\" id=\"btn-login-global\">로그인</a>");
        }
    };

    $(document).ready(function() {
        initPersonal();
        cookies = getCookies(document.cookie);
        isLogin = validateLogin();
        currentRequestURL = getCurrentRequestURL();
        drawLoginArea();
    });

}(jQuery, document);