# name: discourse-category-mod-enhancer
# about: Discourse Category Mod Enhancer
# version: 1.0
# authors: Crius, Char, Drest, ilNibbio
# url: https://github.com/netgamers-forum/discourse-category-mod-enhancer

enabled_site_setting :category_mod_enhancer_enabled

module ::MyPluginModule
    PLUGIN_NAME = "discourse-category-mod-enhancer-v2"
end

require_relative "lib/my_plugin_module/engine"

after_initialize do
    # category moderators can moderate topics in their category
    add_to_class(:guardian, :can_moderate?) do |obj|
        obj && authenticated? && !is_silenced? &&
          (
            is_staff? ||
              (obj.is_a?(Topic) && (@user.has_trust_level?(TrustLevel[4]) || can_perform_action_available_to_group_moderators?(obj) ) && can_see_topic?(obj))

          )
    end
    class ::TopicsController < ApplicationController
        def reset_bump_date
            params.require(:id)
            topic = Topic.find_by(id: params[:id])

            guardian.can_moderate?(topic)

            raise Discourse::NotFound.new unless topic

            topic.reset_bumped_at
            render body: nil
        end

        def change_timestamps
            topic_id = params.require(:topic_id).to_i
            timestamp = params.require(:timestamp).to_f
            topic = Topic.with_deleted.find(topic_id)

            guardian.can_moderate?(topic)

            previous_timestamp = topic.first_post.created_at

            begin
                TopicTimestampChanger.new(topic: topic, timestamp: timestamp).change!

                StaffActionLogger.new(current_user).log_topic_timestamps_changed(
                  topic,
                  Time.zone.at(timestamp),
                  previous_timestamp,
                  )

                render json: success_json
            rescue ActiveRecord::RecordInvalid, TopicTimestampChanger::InvalidTimestampError
                render json: failed_json, status: 422
            end
        end
    end
end