# test/controllers/admin/projects_controller_test.rb
require "test_helper"

class Admin::ProjectsControllerTest < ActionDispatch::IntegrationTest
  def valid_credentials
    ActionController::HttpAuthentication::Basic.encode_credentials(
      ENV["ADMIN_USERNAME"], ENV["ADMIN_PASSWORD"]
    )
  end

  def headers
    { "HTTP_AUTHORIZATION" => valid_credentials }
  end

  # index
  test "blocks unauthenticated access to index" do
    get admin_projects_url
    assert_response :unauthorized
  end

  test "allows access to index with valid credentials" do
    get admin_projects_url, headers: headers
    assert_response :success
  end

  # new
  test "blocks unauthenticated access to new" do
    get new_admin_project_url
    assert_response :unauthorized
  end

  test "allows access to new with valid credentials" do
    get new_admin_project_url, headers: headers
    assert_response :success
  end

  # create
  test "blocks unauthenticated create" do
    post admin_projects_url, params: { project: { title: "Test" } }
    assert_response :unauthorized
  end

  test "creates project with valid credentials" do
    assert_difference("Project.count", 1) do
      post admin_projects_url, headers: headers, params: {
        project: { title: "Test Project", featured: false }
      }
    end
    assert_redirected_to admin_projects_url
  end

  test "does not create project with invalid params" do
    assert_no_difference("Project.count") do
      post admin_projects_url, headers: headers, params: {
        project: { title: "" }
      }
    end
    assert_response :unprocessable_entity
  end

  # edit
  test "blocks unauthenticated access to edit" do
    project = projects(:one)
    get edit_admin_project_url(project)
    assert_response :unauthorized
  end

  test "allows access to edit with valid credentials" do
    project = projects(:one)
    get edit_admin_project_url(project), headers: headers
    assert_response :success
  end

  # update
  test "blocks unauthenticated update" do
    project = projects(:one)
    patch admin_project_url(project), params: { project: { title: "Updated" } }
    assert_response :unauthorized
  end

  test "updates project with valid credentials" do
    project = projects(:one)
    patch admin_project_url(project), headers: headers, params: {
      project: { title: "Updated Title" }
    }
    assert_redirected_to admin_projects_url
    assert_equal "Updated Title", project.reload.title
  end

  # destroy
  test "blocks unauthenticated destroy" do
    project = projects(:one)
    delete admin_project_url(project)
    assert_response :unauthorized
  end

  test "destroys project with valid credentials" do
    project = projects(:one)
    assert_difference("Project.count", -1) do
      delete admin_project_url(project), headers: headers
    end
    assert_redirected_to admin_projects_url
  end
end
