import { withPluginApi } from 'discourse/lib/plugin-api';
export default {
  name: 'category-mod-enhancer',
  initialize(container, app) {
    withPluginApi("1.13.0", (api) => {
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

        api.addPostAdminMenuButton(attrs => {
          if(!(user.admin || user.moderator)){
            return {
              icon: "sync-alt",
              label: "post.controls.rebake",
              className: "popup-menu-button rebuild-html",
              action: (post) => {
                post.rebake();
              },
            };
          }
        })
        api.addPostAdminMenuButton((attrs) => {
          if(!(user.admin || user.moderator) && attrs.user_id){
            if(attrs.locked){
              return {
                icon: "unlock",
                label: "post.controls.unlock_post",
                title: "post.controls.unlock_post_description",
                className: "popup-menu-button unlock-post",
                action: (post) => {
                  post.updatePostField("locked", false);
                },
              };
            }else{
              return {
                icon: "lock",
                label: "post.controls.lock_post",
                title: "post.controls.lock_post_description",
                className: "popup-menu-button lock-post",
                action: (post) => {
                  post.updatePostField("locked", true);
                },
              };
            }
          }
        })
        api.addPostAdminMenuButton((attrs) => {
          if(!(user.admin || user.moderator) && attrs.hidden){
            return {
              icon: "far-eye",
              label: "post.controls.unhide",
              className: "popup-menu-button unhide-post",
              action: (post) => {
                post.updatePostField("hidden", false);
              },
            };
          }
        })
        api.addPostAdminMenuButton((attrs) => {
          if(!(user.admin || user.moderator) && attrs.canPermanentlyDelete){
            return {
              icon: "trash-alt",
              label: "post.controls.permanently_delete",
              className: "popup-menu-button permanently-delete",
              action: (post) => {
                post.destroy(user,{ force_destroy: true })
              },
            };
          }
        })
        api.addPostAdminMenuButton((attrs) => {
          if(!(user.admin || user.moderator)){
            return {
              icon: "list",
              className: "popup-menu-button moderation-history",
              label: "review.moderation_history",
              action: (post) => {
                window.open(`/review?topic_id=${post.topic_id}&status=all`, '_blank');
              },
            }
          }
        })

        api.addPostAdminMenuButton((attrs) =>{
          if (!(user.admin || user.moderator) && !attrs.isWhisper){
            let label = ""
            let action = null
            if (attrs.isModeratorAction) {
              label = "post.controls.revert_to_regular";
            } else {
              label = "post.controls.convert_to_moderator";
            }
            return {
              icon: "shield-alt",
              className: "popup-menu-button toggle-post-type",
              label: label,
              action: (post) => {
                const regular = post.site.get("post_types.regular");
                const moderator = post.site.get("post_types.moderator_action");
                post.updatePostField("post_type", post.get("post_type") === moderator ? regular : moderator);
              }
            }
          }
        })
      }
    })
  }
}
