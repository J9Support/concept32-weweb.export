---
name: ww-timeline
description: Timeline component for visualizing chronological events with customizable markers and layouts.
keywords:
  - timeline 
  - events
  - chronology
  - vertical
  - horizontal
  - markers
  - history
---

#### ww-timeline

***Description***: A flexible timeline component that supports both vertical and horizontal layouts, with customizable markers and event content. Perfect for displaying chronological events, project milestones, or history visualization.

***Specifications***:
- Multiple layout options (vertical/horizontal)
- Customizable marker shapes (circle/square)
- Optional icons in markers with customizable size
- Flexible event alignment options
- Connector line styling options
- Responsive design with container queries
- Dynamic connector positioning based on screen size
- Click events for both markers and content
- Support for dynamic data binding
- Responsive properties for different device sizes

***Properties***:
- `data`: Array of event objects to display in the timeline (bindable)
- `markerShape`: Shape of timeline markers - "circle" or "square" (default: "circle")
- `markerIconOnOff`: Toggle marker icon visibility (default: false)
- `markerIcon`: Icon to display in markers (requires markerIconOnOff: true)
- `markerIconColor`: Color of the marker icon (default: "#FFFFFF") 
- `markerIconSize`: Size of the marker icon (default: "12px", responsive)
- `markerSize`: Size of the timeline markers (default: "16px", responsive)
- `markerBackgroundColor`: Background color of markers (default: "#4B5563")
- `connectorColor`: Color of the timeline connector line (default: "#E5E7EB")
- `connectorWidth`: Width of the timeline connector line (default: "2px", responsive)
- `timelineLayout`: Timeline orientation - "vertical" or "horizontal" (default: "vertical", responsive)
- `eventsAlignment`: Alignment of timeline events (default: "left", responsive)
  - For vertical layout: "left", "right", or "alternate"
  - For horizontal layout: "top" or "bottom"

***Children***:
- `timelineElement`: Container element for event content (ww-flexbox)

***Responsive Behavior***:
- In vertical layout:
  - On small containers: Connector stays at the left/right edge based on alignment
  - On large containers (>500px): Connector moves to the center, content stays on one side
  - Left alignment: Content stays on the right of the centered connector on large screens
  - Right alignment: Content stays on the left of the centered connector on large screens
- In horizontal layout:
  - Connector adapts to full width of scrollable content area
  - Fixed connector element ensures proper visibility across the entire scrollable area

***Events***:
- `click`: Triggered when clicking an event's content
  - Event data: event object from timeline data
- `markerClick`: Triggered when clicking an event's marker
  - Event data: event object from timeline data

***Context***:
- `context.item.data`: Event object from timeline data
- `context.item.index`: Index of the event in the timeline data

Example:
<elements>
{"uid":0,"tag":"ww-timeline","name":"Project Timeline","props":{"default":{"data":{"wwFormula":"variables['52a19975-4ade-40a3-a5f0-632ef2fbe4d8']"},"markerIcon":"lucide/activity","markerSize":"40px","markerShape":"circle","connectorColor":"#e2e8f0","connectorWidth":"2px","markerIconSize":"25px","timelineLayout":"vertical","eventsAlignment":"alternate","markerIconColor":"#975E5E","markerIconOnOff":true,"markerBackgroundColor":"#E3E3E3","eventsAlignmentVertical":"alternate","eventsAlignmentHorizontal":"top"}},"styles":{"default":{"width":"100%","display":"block","maxWidth":"1200px","animationDelay":"600ms","animationDuration":"800ms","animationFillMode":"both","animationKeyframes":"@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }","animationIterationCount":"1","animationTimingFunction":"cubic-bezier(0.4, 0, 0.2, 1)"}},"children":{"timelineElement":{"uid":1}}}
{"uid":1,"tag":"ww-flexbox","name":"Timeline Card","states":[{"id":"_wwHover","label":"hover"}],"styles":{"default":{"width":"350px","display":"flex","padding":"24px","boxShadow":"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)","transition":"all 0.3s ease","borderRadius":"16px","backgroundColor":"#ffffff","flexDirection":"column"},"_wwHover_default":{"display":"flex","boxShadow":"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)","transform":"translateY(-4px)"}},"children":{"children":[{"uid":2},{"uid":6},{"uid":9}]}}
{"uid":2,"tag":"ww-flexbox","name":"Card Header","states":[{"id":"_wwHover","label":"hover"}],"styles":{"default":{"margin":"0 0 16px 0","display":"flex","alignItems":"center","flexDirection":"row"},"_wwHover_default":{"display":"flex"}},"children":{"children":[{"uid":3},{"uid":5}]}}
{"uid":3,"tag":"ww-flexbox","name":"Status Badge","states":[{"id":"_wwHover","label":"hover"}],"styles":{"default":{"margin":"0 12px 0 0","display":"flex","padding":"6px 12px","borderRadius":"12px","backgroundColor":{"wwFormula":"context.item.data?.status === 'completed' ? '#dcfce7' : context.item.data?.status === 'in-progress' ? '#fef9c3' : '#f1f5f9'"},"alignItems":"center","fontSize":"12px","textTransform":"uppercase"},"_wwHover_default":{"display":"flex"}},"children":{"children":[{"uid":4}]}}
{"uid":4,"tag":"ww-text","name":"Status Text","states":[{"id":"_wwHover","label":"hover"}],"props":{"default":{"tag":"span","text":{"en":{"wwFormula":"context.item.data?.status"}}}},"styles":{"default":{"margin":"0","color":{"wwFormula":"context.item.data?.status === 'completed' ? '#16a34a' : context.item.data?.status === 'in-progress' ? '#ca8a04' : '#64748b'"},"textAlign":"center","fontWeight":"600"}}}
{"uid":5,"tag":"ww-text","name":"Date","states":[{"id":"_wwHover","label":"hover"}],"props":{"default":{"tag":"p","text":{"en":{"wwFormula":"context.item.data?.date"}}}},"styles":{"default":{"margin":"0","color":"#64748b","fontSize":"14px","textAlign":"left","fontWeight":"500"}}}
{"uid":6,"tag":"ww-flexbox","name":"Card Content","states":[{"id":"_wwHover","label":"hover"}],"styles":{"default":{"margin":"0 0 20px 0","display":"flex","flexDirection":"column"},"_wwHover_default":{"display":"flex"}},"children":{"children":[{"uid":7},{"uid":8}]}}
{"uid":7,"tag":"ww-text","name":"Card Title","states":[{"id":"_wwHover","label":"hover"}],"props":{"default":{"tag":"h3","text":{"en":{"wwFormula":"context.item.data?.title"}}}},"styles":{"default":{"margin":"0 0 8px 0","color":"#1e293b","fontSize":"24px","textAlign":"left","fontWeight":"600"}}}
{"uid":8,"tag":"ww-text","name":"Card Description","states":[{"id":"_wwHover","label":"hover"}],"props":{"default":{"tag":"p","text":{"en":{"wwFormula":"context.item.data?.description"}}}},"styles":{"default":{"margin":"0","color":"#64748b","fontSize":"14px","textAlign":"left","lineHeight":"1.6"}}}
{"uid":9,"tag":"ww-flexbox","name":"Card Footer","states":[{"id":"_wwHover","label":"hover"}],"styles":{"default":{"margin":"auto 0 0 0","display":"flex","columnGap":"24px","flexDirection":"row"},"_wwHover_default":{"display":"flex"}},"children":{"children":[{"uid":10},{"uid":13}]}}
{"uid":10,"tag":"ww-flexbox","name":"Team Metric","states":[{"id":"_wwHover","label":"hover"}],"styles":{"default":{"display":"flex","alignItems":"center","flexDirection":"row"},"_wwHover_default":{"display":"flex"}},"children":{"children":[{"uid":11},{"uid":12}]}}
{"uid":11,"tag":"ww-icon","name":"Team Icon","states":[{"id":"_wwHover","label":"hover"}],"props":{"default":{"icon":"lucide/users","color":"#64748b"}},"styles":{"default":{"width":"16px","height":"16px","margin":"0 8px 0 0"}}}
{"uid":12,"tag":"ww-text","name":"Team Count","states":[{"id":"_wwHover","label":"hover"}],"props":{"default":{"tag":"p","text":{"en":{"wwFormula":"context.item.data?.metrics?.team + ' team members'"}}}},"styles":{"default":{"margin":"0","color":"#64748b","fontSize":"14px","textAlign":"left"}}}
{"uid":13,"tag":"ww-flexbox","name":"Tasks Metric","states":[{"id":"_wwHover","label":"hover"}],"styles":{"default":{"display":"flex","alignItems":"center","flexDirection":"row"},"_wwHover_default":{"display":"flex"}},"children":{"children":[{"uid":14},{"uid":15}]}}
{"uid":14,"tag":"ww-icon","name":"Tasks Icon","states":[{"id":"_wwHover","label":"hover"}],"props":{"default":{"icon":"lucide/badge-check","color":"#64748b"}},"styles":{"default":{"width":"16px","height":"16px","margin":"0 8px 0 0"}}}
{"uid":15,"tag":"ww-text","name":"Tasks Count","states":[{"id":"_wwHover","label":"hover"}],"props":{"default":{"tag":"p","text":{"en":{"wwFormula":"context.item.data?.metrics?.tasks + ' tasks'"}}}},"styles":{"default":{"margin":"0","color":"#64748b","fontSize":"14px","textAlign":"left"}}}
</elements>
