class PagesController < ApplicationController
  def home
    @comment = Comment.new()
    @comments = Comment.where(approved: false).order(created_at: :desc)
    @projects = Project.all.order(created_at: :desc)
  end
end
