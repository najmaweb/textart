//in this codepen i wrap letters in spans, which allows me to modify each letter programatically. i then create a function to modify the blur factor on each letter based on the distance from the center of the word, and apply an additional blur and fade effect on scroll based on the users scroll position. finally, because the div containing the text must have an absolute pixel width because of the perspective shift, i use a function to apply a scale to the text container which allows the text to scale responsively to the screen.

$(document).ready(function() {

    //variables for animations and for perspective-div resizing
    var $textContainer = $(".text-container");
    var $perspectiveBox = $("#perspective-box");
    var $img = $(".img-container img");
    var pageWidth, pageHeight;
    var basePage = {
        width: 1100,
        height: 1000,
        scale: 1,
        scaleX: 1,
        scaleY: 1
    };
    var $page = $('#perspective-box');



    function wrapWithSpans(classToWrap) {
        var i = 0;
        //creates a div to hold all the text with spans
        var holderDiv = $('<div class=".text-holder"></div>')
            //adds spans to all the text in the div we want to blur ('blur-text'), and adds the text with spans to the holder div
        while (i < $(classToWrap).text().length) {
            holderDiv.append($('<span id="char-' + i + '">' + $(classToWrap).text()[i] + '</span>'));

            i++;
        }
        //delete contents of blur-text
        $(classToWrap).empty();

        //add contents of holder div to blur-text div
        $(classToWrap).append(holderDiv.html());
    }

    function blurTheText(classToBlur, extraBlur) {
        //Add a blur effect to each span
        var i = 0;
        var letterToBlurClass = $(classToBlur + " span");
        var numberOfSpans = $(classToBlur + " > span").length;
        while (i < numberOfSpans) {
            var letterToBlur = letterToBlurClass.eq(i);
            //get the amount to blur each letter
            var returnedBlurAmount = getBlurAmount(i, numberOfSpans, letterToBlurClass, extraBlur);
            //adds the new blurry CSS to each letter that we want to blur
            letterToBlur.css({
                "text-shadow": "0 0 " + (returnedBlurAmount) + "px rgba(255,255,255,0.8)",
                "color": "transparent",
            });
            i++

        }
    };

    //determines how much to blur each letter, using index and number of letters (spans)
    function getBlurAmount(i, numberOfSpans, letterToBlurClass, extraBlur) {
        var middleOfString = numberOfSpans / 2
        var fontSize = parseFloat(letterToBlurClass.css("font-size"));
        var blurAmount
        extraBlur = extraBlur || 0;
        if (i < middleOfString) {
            blurAmount = (middleOfString - i) * (fontSize / 28) + extraBlur;
        } else {
            blurAmount = (i - middleOfString) * (fontSize / 28) + extraBlur;
        }
        return blurAmount;
    };

    var textLinesArr = ["#blur-text","#blur-text0","#blur-text1","#blur-text2","#blur-text3",
    "#blur-text4","#blur-text5","#blur-text6","#blur-text7","#blur-text8","#blur-text9"];

    function wrapAllLinesWithSpans () {
      var i = 0;
      while (i < textLinesArr.length) {
        wrapWithSpans(textLinesArr[i]);
        i++;
      }
    }
    wrapAllLinesWithSpans();

    //determines the extra blur amount which we use to adjust the blur while scrolling
    function adjustBlur(scrollBlurAmount) {
      var i = 0;
      while (i < textLinesArr.length) {
        blurTheText(textLinesArr[i], scrollBlurAmount);
        i++;
      }
    };
    adjustBlur(0);

    //grabbed now and debounce functions from underscore so I don't need cdn
    //debounce makes sure our resize  and our on scroll don't fire too many times
    var now = Date.now || function() {
        return new Date().getTime();
    };

    var debounce = function(func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function() {
            var last = now() - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function() {
            context = this;
            args = arguments;
            timestamp = now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    };

    //animates the image on the left with a fade in
    function fadeInAnimation() {
      $img.animate({
          "opacity": 1
      }, 3000, "linear");
    }
    fadeInAnimation();

    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;

    if (!isSafari) {
        //animates the perspective box to skew and blur on scroll
        $(window).scroll(debounce(function() {
            if ($(window).scrollTop() > $textContainer.height()) {
                return
            }
            else {
                //get the height of the perspective box container
                var perspectiveBoxHeight = $textContainer.height();
                var distanceFromTopOfScreen = $(window).scrollTop();
                var percentageOfTotalScrollDistance = (distanceFromTopOfScreen / perspectiveBoxHeight);
                var amountToChangePerspective = 500 * percentageOfTotalScrollDistance;
                var amountToChangeOpacity = 1 - percentageOfTotalScrollDistance;
                var extraBlur = 50 * percentageOfTotalScrollDistance;
                debounce(adjustBlur, 150)(extraBlur);
                $perspectiveBox.css("perspective", 1100 - amountToChangePerspective + "px");
                $img.css("opacity", amountToChangeOpacity);
            }
        }, 1));
    }

    //resize the perspective box div responsively (as modified from https://codepen.io/cRckls/pen/mcGCL)

    //defines the size of the box we want to fill
    function getPageSize() {
        pageHeight = $textContainer.height();
        pageWidth = $textContainer.width();
    }

    //here are the functions we're using to resize the box

    getPageSize();
    scalePages($page, pageWidth, pageHeight);
    addMargins($page);

    $page.animate({
        "opacity": "1",
        "perspective": "1100px"
    }, 4000, "swing", function() {
        $page.css({
            "transition": "all 500ms ease-in-out, perspective 1ms",
            "-webkit-transition": "all 500ms ease-in-out, perspective 1ms"
        });
    });

    //using underscore to delay resize method till finished resizing window
    $(window).resize(debounce(function() {
        getPageSize();
        scalePages($page, pageWidth, pageHeight);
        addMargins($page);
    }, 150));

    //calculates and adds the scale value to the css on blur-text box
    function scalePages(page, maxWidth, maxHeight) {
        var scaleX = 1,
            scaleY = 1;
        scaleX = (maxWidth / basePage.width) * 1.3;
        scaleY = (maxHeight / basePage.height) * 1.3;
        basePage.scaleX = scaleX;
        basePage.scaleY = scaleY;
        basePage.scale = (scaleX > scaleY) ? scaleY : scaleX;

        var newLeftPos = Math.abs(Math.floor(((basePage.width * basePage.scale) - maxWidth) / 2));
        var newTopPos = Math.abs(Math.floor(((basePage.height * basePage.scale) - maxHeight) / 2));

        page.css({
            "-webkit-transform": "scale(" + basePage.scale + ")",
            "transform": "scale(" + basePage.scale + ")",
            "left": newLeftPos + "px",
            "top": newTopPos + "px"
        });
    }

    //above function doesn't position the resized box very well. this adjusts margins to help out.
    function addMargins(page) {
        var newTopMarg = 0;
        var newLeftMarg = -350;
        if (pageWidth >= 775) {
            newTopMarg = (pageWidth * .25);
            newLeftMarg = -250;
        } else {
            newTopMarg = -(140 - (pageWidth * .13));
        }
        page.css({
            "margin-top": newTopMarg + "px",
            "margin-left": newLeftMarg + "px"
        });
    }
});