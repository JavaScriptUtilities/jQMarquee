/*
 * Plugin Name: jQMarquee
 * Version: 0.1.0
 * Plugin URL: https://github.com/JavaScriptUtilities/jQMarquee
 * jQMarquee may be freely distributed under the MIT license.
 */

document.addEventListener("DOMContentLoaded", function() {
    function refresh_fake_marquee() {
        jQuery('.fake-marquee').jQMarquee();
    }
    refresh_fake_marquee();
    jQuery('body').on('wpu-ajax-ready', refresh_fake_marquee);
    jQuery('body').on('refresh-jq-marquee', refresh_fake_marquee);
});

(function($) {
    $.fn.jQMarquee = function() {
        return this.each(function() {

            /* Items */
            var $item = jQuery(this),
                $children = $item.children();

            /* Global values */
            var maxWidth,
                initialLeft = 0,
                direction = 'rtl',
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

            /* Check direction */
            if ($item.attr('data-marquee-direction')) {
                direction = $item.attr('data-marquee-direction');
            }

            /* Duplicate item */
            var $fakeChildren = $children.eq(0).clone();
            $item.append($fakeChildren);
            $item.append($children.eq(0).clone());
            $item.append($children.eq(0).clone());

            jQuery('body').trigger('refresh-lottie-items');

            function computeValues() {
                maxWidth = $fakeChildren.innerWidth();
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
                    currentLeft -= 1;
                    if (currentLeft < 0) {
                        currentLeft = initialLeft;
                    }
                }
                else {
                    currentLeft += 1;
                    if (currentLeft > maxWidth) {
                        currentLeft = initialLeft;
                    }
                }

                $item.get(0).style.transform = 'translate3d(' + (0 - currentLeft + 'px,0,0') + ')';
                setTimeout(function() {
                    requestAnimationFrame(animateFrame);
                }, 10);
            }
            requestAnimationFrame(animateFrame);
        });
    };
})(jQuery);
