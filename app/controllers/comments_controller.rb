class CommentsController < ApplicationController
  def new
    @comment = Comment.new()
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
