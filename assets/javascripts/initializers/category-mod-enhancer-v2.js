import { withPluginApi } from 'discourse/lib/plugin-api';
import { h } from "virtual-dom";

export default {
  name: 'category-mod-enhancer-v2',
  initialize(container, app) {
    withPluginApi("1.6.0", (api) => {
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
        api.decorateWidget('post-admin-menu:after', (decorator) => {
          const model = decorator.getModel()
          const siteSettings = model.siteSettings;
          const attrs = decorator.attrs;
          const topic = model.get("topic")
          const details = topic.get("details");
          const can_moderate_category = details.get("can_moderate_category")
          // push the button to the post admin menu if not already there (admin and moderator already have it), a bit hacky but works
          if(can_moderate_category && !(user.admin || user.moderator)){
            // Adds the button to the post admin menu if not already there
            const contents = []
            const return_contents = []
            contents.push({
              icon: "list",
              className: "popup-menu-button moderation-history",
              label: "review.moderation_history",
              url: `/review?topic_id=${topic.id}&status=all`,
            });

            if (attrs.canPermanentlyDelete) {
              contents.push({
                icon: "trash-alt",
                className: "popup-menu-button permanently-delete",
                label: "post.controls.permanently_delete",
                action: "permanentlyDeletePost",
              });
            }

            if (!attrs.isWhisper) {
              const buttonAtts = {
                action: "togglePostType",
                icon: "shield-alt",
                className: "popup-menu-button toggle-post-type",
              };

              if (attrs.isModeratorAction) {
                buttonAtts.label = "post.controls.revert_to_regular";
              } else {
                buttonAtts.label = "post.controls.convert_to_moderator";
              }
              contents.push(buttonAtts);
            }

            if (attrs.hidden) {
              contents.push({
                icon: "far-eye",
                label: "post.controls.unhide",
                action: "unhidePost",
                className: "popup-menu-button unhide-post",
              });
            }

            if (attrs.user_id) {
              if (attrs.locked) {
                contents.push({
                  icon: "unlock",
                  label: "post.controls.unlock_post",
                  action: "unlockPost",
                  title: "post.controls.unlock_post_description",
                  className: "popup-menu-button unlock-post",
                });
              } else {
                contents.push({
                  icon: "lock",
                  label: "post.controls.lock_post",
                  action: "lockPost",
                  title: "post.controls.lock_post_description",
                  className: "popup-menu-button lock-post",
                });
              }
            }

            if (can_moderate_category || attrs.canWiki) {
              if (attrs.wiki) {
                contents.push({
                  action: "toggleWiki",
                  label: "post.controls.unwiki",
                  icon: "far-edit",
                  className: "popup-menu-button wiki wikied",
                });
              } else {
                contents.push({
                  action: "toggleWiki",
                  label: "post.controls.wiki",
                  icon: "far-edit",
                  className: "popup-menu-button wiki",
                });
              }
            }

            if (attrs.canPublishPage) {
              contents.push({
                icon: "file",
                label: "post.controls.publish_page",
                action: "showPagePublish",
                className: "popup-menu-button publish-page",
              });
            }

            contents.push({
              icon: "sync-alt",
              label: "post.controls.rebake",
              action: "rebakePost",
              className: "popup-menu-button rebuild-html",
            });

            contents.forEach((button) => {
              button.secondaryAction = "closeAdminMenu";
              return_contents.push(decorator.attach("post-admin-menu-button", button));
            })
            return h("ul", return_contents);
          }
        })
      }
    })
  }
}
