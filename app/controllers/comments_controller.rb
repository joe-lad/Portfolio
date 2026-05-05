class CommentsController < ApplicationController
  def create
    @comment = Comment.new(comment_params)
    if @comment.save
      CommentMailer.comment_confirmation(@comment).deliver_now
      CommentMailer.new_comment_notification(@comment).deliver_now
      redirect_to root_path, notice: "Comment submitted for approval."
    else
      flash[:errors] = @comment.errors.full_messages
      redirect_to root_path(anchor: "leave-a-comment")
    end
  end

  private

  def comment_params
    params.require(:comment).permit(:name, :email, :body)
  end
end
