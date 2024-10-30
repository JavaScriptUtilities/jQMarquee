/*
 * Plugin Name: jQMarquee
 * Version: 0.8.0
 * Plugin URL: https://github.com/JavaScriptUtilities/jQMarquee
 * jQMarquee may be freely distributed under the MIT license.
 */

document.addEventListener("DOMContentLoaded", function() {
    'use strict';

    function refresh_fake_marquee() {
        jQuery('.fake-marquee').jQMarquee();
    }
    refresh_fake_marquee();
    jQuery('body')
        .on('wpu-ajax-ready', refresh_fake_marquee)
        .on('refresh-jq-marquee', refresh_fake_marquee);
});

(function($) {
    'use strict';

    window.jQMarqueeScrollSpeed = 1;
    $.fn.jQMarquee = function() {
        return this.each(function() {

            /* Items */
            var $item = jQuery(this),
                $children = $item.children(),
                $body = jQuery('body'),
                $wrapper = $item.parent(),
                winWidth = 0;

            /* Global values */
            var maxWidth,
                baseWidth,
                numbersOfClones = 1,
                actualNumberOfClones = 0,
                isPaused = false,
                initialLeft = 0,
                direction = 'rtl',
                _hasPauseonHover = $item.attr('data-marquee-pause-on-hover') == '1',
                _hasMarqueeDraggable = $item.attr('data-marquee-draggable') == '1',
                _hasChangeDirectionOnScroll = $item.attr('data-marquee-change-direction-on-scroll') == '1',
                firstItem,
                currentLeft;

            /* Avoid double launch */
            if ($item.attr('data-has-marquee') == '1') {
                return;
            }
            $item.attr('data-has-marquee', '1');

            /* Avoid empty children */
            if (!$children.length) {
                return;
            }
            firstItem = $children.eq(0);

            /* Check direction */
            if ($item.attr('data-marquee-direction')) {
                direction = $item.attr('data-marquee-direction');
            }

            if (_hasPauseonHover || _hasMarqueeDraggable) {
                $wrapper.on('mouseenter', function() {
                    isPaused = true;
                }).on('mouseleave', function() {
                    isPaused = false;
                });
            }

            var lastScrollTop = 0,
                initialDirection = direction;
            if (_hasChangeDirectionOnScroll) {
                jQuery(window).on('scroll', function() {
                    var st = jQuery(this).scrollTop();
                    if (st > lastScrollTop) {
                        direction = initialDirection == 'rtl' ? 'rtl' : 'ltr';
                    } else {
                        direction = initialDirection == 'rtl' ? 'ltr' : 'rtl';
                    }
                    lastScrollTop = st;
                });
            }

            /* Drag marquee */
            var isDragging = false,
                lastX = 0;
            if (_hasMarqueeDraggable) {

                /* Starting touch on the element */
                $wrapper.on('mousedown touchstart', function(e) {

                    /* Avoid dragging on links */
                    if (jQuery(e.target).closest('a').length || jQuery(e.target).closest('button').length) {
                        return;
                    }

                    isDragging = true;
                    $body.attr('data-marquee-dragging', '1');
                    lastX = getClientX(e);
                });

                /* Stopping move */
                jQuery(window).on('mouseup touchend', function() {
                    $body.attr('data-marquee-dragging', '0');
                    isDragging = false;

                /* Moving if dragging has started */
                }).on('mousemove touchmove', function(e) {
                    if (!isDragging) {
                        return;
                    }
                    e.preventDefault();
                    var currentX = getClientX(e);
                    var diffX = currentX - lastX;
                    lastX = currentX;
                    moveMarquee(direction == 'ltr' ? diffX : -diffX);
                });
            }


            function computeValues() {
                var tmpWinWidth = window.innerWidth;
                if (tmpWinWidth == winWidth) {
                    return;
                }

                var firstItemWidth = Math.max(100, firstItem.innerWidth());

                /* Create enough clones to fill the window */
                numbersOfClones = Math.ceil(window.innerWidth / firstItemWidth) + 1;

                /* Create and append clones */
                firstItem.css('min-width', firstItem.get(0).scrollWidth);
                for (var _i = actualNumberOfClones; _i < numbersOfClones; _i++) {
                    $item.append(firstItem.clone());
                }
                actualNumberOfClones = Math.max(actualNumberOfClones, numbersOfClones);

                /* Refresh lottie animations if needed */
                jQuery('body').trigger('refresh-lottie-items');

                /* Set  */
                winWidth = tmpWinWidth;
                baseWidth = firstItem.innerWidth();
                maxWidth = baseWidth;
                initialLeft = maxWidth;
                if (direction == 'ltr') {
                    initialLeft = maxWidth * 2;
                    maxWidth = maxWidth * 4;
                }
                currentLeft = initialLeft;
            }

            jQuery(window).on('resize', computeValues);
            computeValues();

            /* Animate frame by frame */
            window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

            function animateFrame() {
                if (!isPaused && !isDragging) {
                    moveMarquee();
                }
                setTimeout(function() {
                    requestAnimationFrame(animateFrame);
                }, 10);
            }
            requestAnimationFrame(animateFrame);

            function moveMarquee(scrollAmount) {
                scrollAmount = scrollAmount || window.jQMarqueeScrollSpeed;
                if (direction == 'ltr') {
                    currentLeft -= scrollAmount;
                    if (currentLeft < 0) {
                        currentLeft = initialLeft;
                    }
                    if (currentLeft > initialLeft) {
                        currentLeft = 0;
                    }
                } else {
                    currentLeft += scrollAmount;
                    if (currentLeft > maxWidth * 2) {
                        currentLeft = initialLeft;
                    }
                    if (currentLeft < initialLeft) {
                        currentLeft = maxWidth * 2;
                    }
                    if (currentLeft < 0) {
                        currentLeft = initialLeft;
                    }
                }
                setItemLeft(currentLeft);
            }

            function setItemLeft(currentLeft) {
                var t = 'translate3d(' + (0 - currentLeft + 'px,0,0') + ')';
                $item.get(0).style.WebkitTransform = t;
                $item.get(0).style.MozTransform = t;
                $item.get(0).style.transform = t;
            }

            function getClientX(e){
                return e.clientX || e.touches[0].clientX;
            }


        });

    };
})(jQuery);
