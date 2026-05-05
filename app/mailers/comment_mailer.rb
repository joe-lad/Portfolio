class CommentMailer < ApplicationMailer
  default from: "joe@jknight.uk"

  def comment_confirmation(comment)
    @comment = comment
    mail(to: comment.email, subject: "We received your comment")
  end

  def new_comment_notification(comment)
    @comment = comment
    mail(to: "joeknight2004@protonmail.com", subject: "New comment from #{comment.email}")
  end
end
