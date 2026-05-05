# Preview all emails at http://localhost:3000/rails/mailers/comment_mailer
class CommentMailerPreview < ActionMailer::Preview
  # Preview this email at http://localhost:3000/rails/mailers/comment_mailer/comment_confirmation
  def comment_confirmation
    CommentMailer.comment_confirmation
  end
end
