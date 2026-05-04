module Admin
  class DashboardController < BaseController
    def index
      @pending_comments = Comment.where(approved: false).count
      @total_comments = Comment.count
      @total_projects = Project.count
    end
  end
end
