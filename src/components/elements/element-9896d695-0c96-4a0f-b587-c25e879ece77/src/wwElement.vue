<template>
  <div
    class="ww-timeline"
    :class="[
      `ww-timeline--${content.timelineLayout}`,
      `ww-timeline--align-${validAlignment}`,
    ]"
    :style="{
      '--marker-size': content.markerSize,
      '--connector-color': content.connectorColor,
      '--connector-width': content.connectorWidth,
      '--marker-icon-size': content.markerIconSize,
      '--marker-icon-color': content.markerIconColor,
      '--marker-background-color': content.markerBackgroundColor,
      '--connector-full-width': `${connectorWidth}px`,
    }"
  >
    <!-- Fixed connector line for horizontal layout -->
    <div
      v-if="content.timelineLayout === 'horizontal'"
      class="ww-timeline__fixed-connector"
      :class="`ww-timeline__fixed-connector--${validAlignment}`"
    />
    <div ref="containerRef" class="ww-timeline__container">
      <div
        v-for="(item, index) in content.data"
        :key="index"
        class="ww-timeline__event"
        :class="{
          'ww-timeline__event--alternate':
            content.timelineLayout === 'vertical' &&
            validAlignment === 'alternate' &&
            index % 2 === 1,
        }"
      >
        <wwLayoutItemContext is-repeat :index="index" :data="item">
          <!-- Event marker -->
          <div
            class="ww-timeline__marker"
            :class="[`ww-timeline__marker--${content.markerShape}`]"
            @click.stop="onMarkerClick(item)"
          >
            <template v-if="content.markerIconOnOff && content.markerIcon">
              <span v-html="iconHTML" class="ww-timeline__marker-icon" />
            </template>
          </div>

          <!-- Event content -->
          <div class="ww-timeline__content" @click.stop="onClick(item)">
            <wwElement
              v-bind="content.timelineElement"
              class="ww-timeline__content-element"
            />
          </div>
        </wwLayoutItemContext>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from "vue";
import { useElementSize } from "@vueuse/core";

export default {
  props: {
    content: {
      type: Object,
      required: true,
    },
  },
  emits: ["trigger-event"],
  setup(props) {
    // References for measuring elements
    const containerRef = ref(null);
    const { width: containerWidth } = useElementSize(containerRef);

    // Icon handling
    const icon = computed(() => props.content.markerIcon);
    const { getIcon } = wwLib.useIcons();
    const iconHTML = ref("");

    // For horizontal timeline, calculate total content width based on actual content
    const connectorWidth = computed(() => {
      if (props.content.timelineLayout === "horizontal") {
        // If we have a measurement for the container width, use it
        // Otherwise, calculate a width based on the number of events
        const dataLength = props.content?.data?.length || 0;
        const minWidth = Math.max(100, dataLength * 250);

        // +40 is for margins
        return containerWidth.value > 0 ? containerWidth.value + 40 : minWidth;
      }
      return 0;
    });

    watch(
      icon,
      async () => {
        iconHTML.value = await getIcon(icon.value);
      },
      { immediate: true },
    );

    // Handle alignment based on layout
    const validAlignment = computed(() => {
      const layout = props.content.timelineLayout;
      const alignment = props.content.eventsAlignment;

      if (layout === "vertical") {
        // Check if the alignment is valid for vertical layout
        return ["left", "right", "alternate"].includes(alignment)
          ? alignment
          : "alternate"; // Default fallback for vertical
      } else {
        // Check if the alignment is valid for horizontal layout
        return ["top", "bottom"].includes(alignment) ? alignment : "top"; // Default fallback for horizontal
      }
    });

    return {
      iconHTML,
      validAlignment,
      containerRef,
      connectorWidth,
    };
  },
  methods: {
    onClick(item) {
      this.$emit("trigger-event", {
        name: "timeline:click",
        event: { value: item },
      });
    },
    onMarkerClick(item) {
      this.$emit("trigger-event", {
        name: "timeline:markerClick",
        event: { value: item },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.ww-timeline {
  position: relative;
  width: 100%;

  &--vertical {
    .ww-timeline__container {
      padding: 20px 0;
    }

    .ww-timeline__event {
      position: relative;
      margin: 0;
      padding-bottom: 20px;
      min-height: 50px;
    }

    /* Left alignment (default) */
    &.ww-timeline--align-left {
      .ww-timeline__event {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        justify-content: flex-end;
      }

      /* Allow container to be used for container queries */
      .ww-timeline__container {
        container-type: inline-size;
        padding-left: 40px;

        /* Small screens - connector at left */
        &::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 8px; /* Position at 8px from the left edge */
          width: var(--connector-width);
          transform: translateX(
            calc(-1 * var(--connector-width) / 2)
          ); /* Center the connector regardless of width */
          background-color: var(--connector-color);
        }

        /* Larger container - connector in center */
        @container (min-width: 500px) {
          padding-left: 0;

          &::before {
            left: 50%;
            transform: translateX(-50%);
          }
        }
      }

      .ww-timeline__marker {
        position: absolute;
        left: -32px; /* Position relative to connector */
        top: 15px;
        transform: translateX(-50%); /* Center the marker on the connector */

        /* Larger container - marker in center */
        @container (min-width: 500px) {
          left: calc(50% - (var(--marker-size) / 2) - 20px);
          transform: none;
        }
      }

      .ww-timeline__content {
        text-align: left;
        display: flex;
        justify-content: flex-start;
        width: 100%;

        /* Larger container - keep all content on the right side of center connector */
        @container (min-width: 500px) {
          width: calc(50% - var(--marker-size) / 2);
          margin-right: 0;
          text-align: left;
          justify-content: flex-start;
          align-items: flex-start;
        }
      }
    }

    /* Right alignment */
    &.ww-timeline--align-right {
      .ww-timeline__container {
        container-type: inline-size;
        padding-right: 40px;

        /* Default - connector at right */
        &::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          right: 8px; /* Position at 8px from the right edge */
          width: var(--connector-width);
          transform: translateX(
            calc(var(--connector-width) / 2)
          ); /* Center the connector regardless of width */
          background-color: var(--connector-color);
        }

        /* Large screens - connector in center */
        @container (min-width: 500px) {
          padding-right: 0;

          &::before {
            right: auto;
            left: 50%;
            transform: translateX(-50%);
          }
        }
      }

      .ww-timeline__marker {
        position: absolute;
        right: -32px; /* Position relative to connector */
        top: 15px;
        transform: translateX(50%); /* Center the marker on the connector */

        /* Large screens - marker in center */
        @container (min-width: 500px) {
          left: calc(50% - (var(--marker-size) / 2) + 20px);
          transform: none;
        }
      }

      .ww-timeline__content {
        text-align: right;
        align-items: flex-end;
        display: flex;
        justify-content: flex-end;
        width: 100%; /* Use full width */

        /* Large screens - content on left side of center connector */
        @container (min-width: 500px) {
          width: calc(50% - var(--marker-size) / 2);
          margin-left: 0;
          text-align: right;
          justify-content: flex-end;
          align-items: flex-end;
        }
      }
    }

    /* Alternate alignment */
    &.ww-timeline--align-alternate {
      .ww-timeline__container {
        position: relative;

        &::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%); /* Center properly */
          width: var(--connector-width);
          background-color: var(--connector-color);
          z-index: 1;
        }
      }

      .ww-timeline__event {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: flex-end;
        padding-right: 50%;
        padding-left: 0;

        .ww-timeline__marker {
          position: absolute;
          left: 50%;
          top: 15px;
          transform: translateX(-50%);
          z-index: 2;
        }

        .ww-timeline__content {
          width: 100%;
          margin-right: 30px;
          text-align: right;
          align-items: flex-end;
          display: flex;
          justify-content: flex-end;
        }

        &--alternate {
          justify-content: flex-start;
          padding-left: 50%;
          padding-right: 0;

          .ww-timeline__content {
            margin-right: 0;
            margin-left: 30px;
            text-align: left;
            align-items: flex-start;
            justify-content: flex-start;
            width: 100%;
          }
        }
      }
    }
  }

  &--horizontal {
    position: relative; /* Positioning context for fixed connector */

    .ww-timeline__container {
      display: flex;
      position: relative;
      padding: 40px 20px 20px;
      overflow-x: auto;
      width: 100%; /* Ensure the container takes full width */
    }

    .ww-timeline__event {
      position: relative;
      flex: 0 0 auto; /* Don't allow event to grow or shrink */
      margin: 0 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .ww-timeline__content {
      width: auto; /* Allow content to size to its children */
      flex: 0 0 auto; /* Prevent flex growing/shrinking */
    }

    /* Top alignment (default) */
    &.ww-timeline--align-top {
      .ww-timeline__container {
        padding-top: calc(20px + var(--marker-size));

        /* Hide the original ::before connector when using fixed connector */
        &::before {
          display: none;
        }
      }

      .ww-timeline__marker {
        position: absolute;
        top: calc(-1 * var(--marker-size) - 12px);
      }

      .ww-timeline__content {
        justify-content: center;
        text-align: center;
      }
    }

    /* Bottom alignment */
    &.ww-timeline--align-bottom {
      .ww-timeline__container {
        padding-top: 20px;
        padding-bottom: calc(20px + var(--marker-size));

        /* Hide the original ::before connector when using fixed connector */
        &::before {
          display: none;
        }
      }

      .ww-timeline__marker {
        position: absolute;
        bottom: calc(-1 * var(--marker-size) - 12px);
      }

      .ww-timeline__content {
        justify-content: center;
        text-align: center;
      }
    }
  }
}

.ww-timeline__marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--marker-size);
  height: var(--marker-size);
  background-color: var(--marker-background-color);
  z-index: 2;
  cursor: pointer;
  /* No transition or hover effect */

  &--circle {
    border-radius: 50%;
  }

  &--square {
    border-radius: 2px;
  }
}

.ww-timeline__marker-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--marker-icon-size);
  height: var(--marker-icon-size);
  color: var(--marker-icon-color);

  :deep(svg) {
    width: 100% !important;
    height: 100% !important;
  }
}

.ww-timeline__fixed-connector {
  position: absolute;
  left: 0;
  z-index: 0;
  pointer-events: none; /* Allow clicking through the connector */
  background-color: var(--connector-color);
  height: var(--connector-width);
  width: var(--connector-full-width);

  &--top {
    top: calc(
      8px + calc(var(--marker-size) / 2) - calc(var(--connector-width) / 2)
    );
  }

  &--bottom {
    bottom: calc(
      8px + calc(var(--marker-size) / 2) - calc(var(--connector-width) / 2)
    );
  }
}

.ww-timeline__content {
  cursor: pointer;
  display: flex;
  /* Full width by default to allow proper alignment */
  width: 100%;
}

.ww-timeline__content-element {
  /* Base styles for the content element */
  display: flex;
  flex-direction: column;
  gap: 8px;

  /* This ensures any width/height set on the element will be respected */
  width: inherit; /* Inherit any width set on this element */
  height: inherit; /* Inherit any height set on this element */
}

/* Different alignment depending on timeline layout and alignment */
.ww-timeline--vertical {
  &.ww-timeline--align-left .ww-timeline__content-element {
    align-items: flex-start;
  }

  &.ww-timeline--align-right .ww-timeline__content-element {
    align-items: flex-end;
  }

  &.ww-timeline--align-alternate {
    .ww-timeline__content-element {
      align-items: flex-end;
    }

    .ww-timeline__event--alternate .ww-timeline__content-element {
      align-items: flex-start;
    }
  }
}

.ww-timeline--horizontal .ww-timeline__content-element {
  align-items: center;
}
</style>
