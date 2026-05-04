module Admin
  class CommentsController < BaseController
    def index
      @comments = Comment.order(created_at: :desc)
    end

    def update
      @comment = Comment.find(params[:id])
      @comment.update(approved: true)
      redirect_to admin_comments_path, notice: "Comment approved."
    end

    def destroy
      @comment = Comment.find(params[:id])
      @comment.destroy
      redirect_to admin_comments_path, notice: "Comment deleted."
    end
  end
end
