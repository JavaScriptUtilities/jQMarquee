/*
 * Plugin Name: jQMarquee
 * Version: 0.4.0
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

            function computeValues() {
                var tmpWinWidth = window.innerWidth;
                if (tmpWinWidth == winWidth) {
                    return;
                }

                /* Create enough clones to fill the window */
                numbersOfClones = Math.ceil(window.innerWidth / firstItem.innerWidth());

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
                if (direction == 'ltr') {
                    initialLeft = maxWidth * 2;
                    maxWidth = maxWidth * 3;
                }
                currentLeft = initialLeft;
            }

            jQuery(window).on('resize', computeValues);
            computeValues();

            /* Animate frame by frame */
            window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

            function animateFrame() {
                if (direction == 'ltr') {
                    currentLeft -= window.jQMarqueeScrollSpeed;
                    if (currentLeft < 0) {
                        currentLeft = initialLeft;
                    }
                }
                else {
                    currentLeft += window.jQMarqueeScrollSpeed;
                    if (currentLeft > maxWidth) {
                        currentLeft = initialLeft;
                    }
                }

                var t = 'translate3d(' + (0 - currentLeft + 'px,0,0') + ')';
                $item.get(0).style.WebkitTransform = t;
                $item.get(0).style.MozTransform = t;
                $item.get(0).style.transform = t;
                setTimeout(function() {
                    requestAnimationFrame(animateFrame);
                }, 10);
            }
            requestAnimationFrame(animateFrame);
        });
    };
})(jQuery);
