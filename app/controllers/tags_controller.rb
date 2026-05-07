class TagsController < ApplicationController
  def search
    tags = Tag.where("name ILIKE ?", "%#{params[:q]}%").limit(10).pluck(:name)
    render json: tags
  end
end
