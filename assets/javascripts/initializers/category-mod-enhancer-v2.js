import { withPluginApi } from 'discourse/lib/plugin-api';
import showModal from "discourse/lib/show-modal";

export default {
  name: 'category-mod-enhancer-v2',
  initialize(container, app) {
    withPluginApi("0.8.7", (api) => {
      const user = api.getCurrentUser()
      if(user) {
        api.decorateWidget('topic-admin-menu:adminMenuButtons', (decorator) => {
          const topic = decorator.attrs.topic
          const details = topic.get("details");
          const can_moderate_category = details.get("can_moderate_category")
          if(can_moderate_category){
            // Adds the button to the admin menu if not already there
            if (!decorator.attrs.actionButtons.find((b) => b.action === "showTopicSlowModeUpdate")) {
              decorator.attrs.actionButtons.push({
                className: "topic-admin-slow-mode",
                buttonClass: "popup-menu-btn",
                action: "showTopicSlowModeUpdate",
                icon: "hourglass-start",
                label: "actions.slow_mode",
                button_group: "time",
              })
            }
            if (!decorator.attrs.actionButtons.find((b) => b.action === "showTopicTimerModal")) {
              decorator.attrs.actionButtons.push({
                className: "admin-topic-timer-update",
                buttonClass: "popup-menu-btn",
                action: "showTopicTimerModal",
                icon: "far-clock",
                label: "actions.timed_update",
                button_group: "time",
              })
            }
            if (!decorator.attrs.actionButtons.find((b) => b.action === "showChangeTimestamp")) {
              decorator.attrs.actionButtons.push({
                className: "topic-admin-change-timestamp",
                buttonClass: "popup-menu-btn",
                action: "showChangeTimestamp",
                icon: "calendar-alt",
                label: "change_timestamp.title",
                button_group: "time",
              })
            }
            if (!decorator.attrs.actionButtons.find((b) => b.action === "resetBumpDate")) {
              decorator.attrs.actionButtons.push({
                className: "topic-admin-reset-bump-date",
                buttonClass: "popup-menu-btn",
                action: "resetBumpDate",
                icon: "anchor",
                label: "actions.reset_bump_date",
                button_group: "time",
              })
            }
            if (!decorator.attrs.actionButtons.find((b) => b.url === `/review?topic_id=${topic.id}&status=all`)) {
              decorator.attrs.actionButtons.push({
                icon: "list",
                buttonClass: "popup-menu-btn",
                fullLabel: "review.moderation_history",
                url: `/review?topic_id=${topic.id}&status=all`,
              })
            }
          }
        })
      }
    })
  }
}
