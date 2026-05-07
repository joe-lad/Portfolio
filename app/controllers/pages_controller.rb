class PagesController < ApplicationController
  def home
    @comment = Comment.new()
    @comments = Comment.where(approved: true).order(created_at: :desc)
    @projects = Project.where(featured: true).order(created_at: :desc).includes(:tags).all
  end
end
