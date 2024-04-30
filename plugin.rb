# frozen_string_literal: true

# name: discourse-category-mod-enhancer
# about: TODO
# version: 0.0.1
# authors: Daniele Mancini
# url: TODO
# required_version: 2.7.0

enabled_site_setting :plugin_name_enabled

module ::MyPluginModule
    PLUGIN_NAME = "discourse-category-mod-enhancer"
end

require_relative "lib/my_plugin_module/engine"

after_initialize do
    # category moderators can moderate topics in their category
    add_to_class(:guardian, :can_moderate?) do |obj|
        obj && authenticated? && !is_silenced? &&
          (
            is_staff? ||
              (obj.is_a?(Topic) && (@user.has_trust_level?(TrustLevel[4]) || can_perform_action_available_to_group_moderators?(obj)) && can_see_topic?(obj))

          )
    end

    add_to_class(:post_guardian, :can_lock_post?) do |post|
        can_see_post?(post) && (is_staff? || (post.topic && can_moderate?(post.topic)))
    end

    add_to_class(:post_guardian, :can_rebake?) do |post|
        return false unless authenticated?
        is_staff? || @user.has_trust_level?(TrustLevel[4]) || can_perform_action_available_to_group_moderators?(post.topic)
    end

    add_to_class(:post_guardian, :can_wiki?) do |post|
        return false unless authenticated?
        return true if is_staff? || @user.has_trust_level?(TrustLevel[4]) || can_perform_action_available_to_group_moderators?(post.topic)

        if @user.has_trust_level?(SiteSetting.min_trust_to_allow_self_wiki) && is_my_own?(post)
            return false if post.hidden?
            return !post.edit_time_limit_expired?(@user)
        end

        false
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

    class ::PostsController < ApplicationController
        def post_type
            post = find_post_from_params
            guardian.can_moderate?(post.topic)
            params.require(:post_type)
            raise Discourse::InvalidParameters.new(:post_type) if Post.types[params[:post_type].to_i].blank?

            post.revise(current_user, post_type: params[:post_type].to_i)

            render body: nil
        end
    end
end
