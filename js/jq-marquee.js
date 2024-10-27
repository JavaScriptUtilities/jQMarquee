/*
 * Plugin Name: jQMarquee
 * Version: 0.6.0
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
                winWidth = 0;

            /* Global values */
            var maxWidth,
                numbersOfClones = 1,
                actualNumberOfClones = 0,
                isPaused = false,
                initialLeft = 0,
                direction = 'rtl',
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

            if ($item.attr('data-marquee-pause-on-hover') == '1') {
                $item.on('mouseenter', function() {
                    isPaused = true;
                }).on('mouseleave', function() {
                    isPaused = false;
                });
            }


            var lastScrollTop = 0,
                initialDirection = direction;
            if($item.attr('data-marquee-change-direction-on-scroll') == '1') {
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
                maxWidth = firstItem.innerWidth();
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
                if (!isPaused) {
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
                } else {
                    currentLeft += scrollAmount;
                    if (currentLeft > maxWidth * 2) {
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


        });

    };
})(jQuery);
