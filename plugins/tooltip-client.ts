import { defineNuxtPlugin } from "#app";
import $ from "jquery";

export default defineNuxtPlugin(() => {
    $(document).ready(function () {
        const $tooltip = $('<div class="tooltip"></div>').appendTo("body");

        $tooltip.css({
            position: "absolute",
            backgroundColor: "#333333",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "4px",
            fontSize: "12px",
            display: "none",
            transition: "opacity 0.2s",
            zIndex: "999999",
            maxWidth: "500px",
        });

        $(document).find('.text-truncate').each(function () {
            const $this = $(this);

            // Kiểm tra nếu nội dung bị tràn
            if (this.scrollWidth > this.offsetWidth) {
                $this.attr('data-tooltip', $this.text());
            } else {
                $this.removeAttr('data-tooltip');
            }
        });

        $(document).on("mouseenter", "[data-tooltip], .text-truncate", function () {
            const $this = $(this);
            if ($this.hasClass("text-truncate") && this.scrollWidth > this.offsetWidth) {
                $this.attr("data-tooltip", $this.text());
            }

            const tooltipText = $this.attr("data-tooltip");
            if (!tooltipText?.trim()) return;

            const plainText = $("<div>").html(tooltipText).text();
            $tooltip.text(plainText).css({ display: "block", opacity: 0 }).animate({ opacity: 1 }, 100);

            const targetOffset = $this.offset();
            const targetWidth = $this.outerWidth();
            const tooltipWidth = $tooltip.outerWidth();
            const tooltipHeight = $tooltip.outerHeight();

            const top = targetOffset.top - tooltipHeight - 10;
            const left = targetOffset.left + targetWidth / 2 - tooltipWidth / 2;

            $tooltip.css({ top, left });
        });

        $(document).on("mouseleave", "[data-tooltip]", function () {
            $tooltip.css("display", "none");
        });
    });
});
