class CommentsController < ApplicationController
  def index
    @comments = Comment.where(approved: false).order(created_at: :desc)
  end

  def show
    @comment = Comment.find(params[:id])
  end

  def create
    @comment = Comment.new(comment_params)
    if @comment.save
      redirect_to root_path, notice: "Comment submitted and awaiting approval."
    else
      redirect_to root_path, alert: "Something went wrong."
    end
  end

  private

  def comment_params
    params.require(:comment).permit(:name, :email, :body)
  end
end