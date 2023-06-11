# frozen_string_literal: true

module ::MyPluginModule
  class ExamplesController < ::ApplicationController
    requires_plugin PLUGIN_NAME
  end
end
