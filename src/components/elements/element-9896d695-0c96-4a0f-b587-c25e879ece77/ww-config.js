export default {
  inherit: {
    type: "ww-layout",
  },
  editor: {
    label: {
      en: "Timeline",
    },
    icon: "history",
    customStylePropertiesOrder: [
      {
        label: "Marker style",
        isCollapsible: true,
        properties:  [
          "markerShape",
          "markerSize",
          "markerBackgroundColor",
          "markerIconOnOff",
          "markerIcon",
          "markerIconColor",
          "markerIconSize",
        ],
      },
      {
        label: "Timeline style",
        isCollapsible: true,
        properties: [
          "connectorColor",
          "connectorWidth",
          "timelineLayout",
          "eventsAlignment",
        ],
      },  
    ],
    customSettingsPropertiesOrder: ["data"],
  },
  properties: {
    // Marker styling
    markerShape: {
      label: { en: "Marker Shape" },
      type: "TextRadioGroup",
      section: "style",
      bindable: true,
      responsive: true,
      classes: true,
      defaultValue: "circle",
      options: {
        choices: [
          { value: "circle", title: "Circle", icon: "16/circle-info" },
          { value: "square", title: "Square", icon: "16/minus" },
        ],
      },
    },
    markerIconOnOff: {
      label: { en: "Show Icon" },
      type: "OnOff",
      section: "style",
      bindable: true,
      responsive: true,
      classes: true,
      defaultValue: false,
    },
    markerIcon: {
      label: { en: "Marker Icon" },
      type: "SystemIcon",
      section: "style",
      bindable: true,
      responsive: true,
      classes: true,
      defaultValue: null,
      hidden: (content) => !content.markerIconOnOff,
    },
    markerIconColor: {
      label: { en: "Marker Icon Color" },
      type: "Color",
      section: "style",
      bindable: true,
      responsive: true,
      classes: true,
      defaultValue: "#FFFFFF",
      hidden: (content) => !content.markerIconOnOff,
    },
    markerIconSize: {
      label: { en: "Marker Icon Size" },
      type: "Length",
      section: "style",
      bindable: true,
      responsive: true,
      classes: true,
      defaultValue: "12px",
      hidden: (content) => !content.markerIconOnOff,
    },
    markerSize: {
      label: { en: "Marker Size" },
      type: "Length",
      section: "style",
      bindable: true,
      responsive: true,
      classes: true,
      defaultValue: "16px",
    },
    markerBackgroundColor: {
      label: { en: "Marker Background" },
      type: "Color",
      section: "style",
      bindable: true,
      responsive: true,
      classes: true,
      defaultValue: "#4B5563",
    },

    // Timeline styling
    connectorColor: {
      label: { en: "Connector Color" },
      type: "Color",
      section: "style",
      bindable: true,
      responsive: true,
      classes: true,
      defaultValue: "#E5E7EB",
    },
    connectorWidth: {
      label: { en: "Connector Width" },
      type: "Length",
      section: "style",
      bindable: true,
      responsive: true,
      classes: true,
      defaultValue: "2px",
    },
    timelineLayout: {
      label: { en: "Layout" },
      type: "TextRadioGroup",
      section: "style",
      bindable: true,
      responsive: true,
      classes: true,
      defaultValue: "vertical",
      options: {
        choices: [
          { value: "vertical", title: "Vertical", icon: "type-rows" },
          { value: "horizontal", title: "Horizontal", icon: "type-columns" },
        ],
      },
    },
    eventsAlignment: {
      label: { en: "Events Alignment" },
      type: "TextRadioGroup",
      section: "style",
      bindable: true,
      responsive: true,
      classes: true,
      defaultValue: "left",
      options: (content) => {
        if (content.timelineLayout === "vertical") {
          return {
            choices: [
              { value: "left", title: "Left", icon: "16/alignment-left" },
              { value: "right", title: "Right", icon: "16/alignment-right" },
              {
                value: "alternate",
                title: "Alternate",
                icon: "16/alignment-justify",
              },
            ],
          };
        } else {
          return {
            choices: [
              { value: "top", title: "Top", icon: "16/arrow-top" },
              { value: "bottom", title: "Bottom", icon: "16/arrow-bottom" },
            ],
          };
        }
      },
    },

    data: {
      label: { en: "Timeline Data" },
      type: "ObjectList",
      options: {
        useSchema: true,
      },
      section: "settings",
      bindable: true,
      defaultValue: [],
    },

    // Hidden elements for child components
    timelineElement: {
      hidden: true,
      defaultValue: { isWwObject: true, type: "ww-flexbox" },
    },
  },
  triggerEvents: [
    {
      name: "timeline:click",
      label: { en: "On event click" },
      event: { value: null },
    },
    {
      name: "timeline:markerClick",
      label: { en: "On marker click" },
      event: { value: null },
    },
  ],
};
