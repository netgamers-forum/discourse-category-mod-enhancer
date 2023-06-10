# frozen_string_literal: true

MyPluginModule::Engine.routes.draw do
  # define routes here
end

Discourse::Application.routes.draw { mount ::MyPluginModule::Engine, at: "my-plugin" }
