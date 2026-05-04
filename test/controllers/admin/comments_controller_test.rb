require "test_helper"

class Admin::CommentsControllerTest < ActionDispatch::IntegrationTest
  def valid_credentials
    ActionController::HttpAuthentication::Basic.encode_credentials(
      ENV["ADMIN_USERNAME"], ENV["ADMIN_PASSWORD"]
    )
  end

  test "blocks unauthenticated access" do
    get admin_comments_url
    assert_response :unauthorized
  end

  test "allows access with valid credentials" do
    get admin_comments_url, headers: { "HTTP_AUTHORIZATION" => valid_credentials }
    assert_response :success
  end

  test "blocks access with wrong password" do
    get admin_comments_url, headers: {
      "HTTP_AUTHORIZATION" => ActionController::HttpAuthentication::Basic.encode_credentials("admin", "wrong")
    }
    assert_response :unauthorized
  end
end
