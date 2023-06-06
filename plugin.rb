# name: discourse-category-mod-enhancer
# about: Discourse Category Mod Enhancer
# version: 1.0
# authors: Crius, Char, Drest, ilNibbio
# url: https://github.com/netgamers-forum/discourse-category-mod-enhancer

enabled_site_setting :category_mod_enhancer_enabled

after_initialize do
    # TODO: register our version of guardian.rb and replace the function `is_staff` with our logic
    # TODO: register our version of the controllers that invoke the guardian for is_staff and include the `(category)`
    # TODO: exclude our version of the `is_staff` from the checks for accessing user's details or taking actions on users
end