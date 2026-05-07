class Project < ApplicationRecord
  has_rich_text :description
  has_one_attached :cover_photo
  has_many :project_tags
  has_many :tags, through: :project_tags

  validates :title, presence: true

  def tag_names=(names)
    self.tags = names.split(",").map(&:strip).reject(&:blank?).map do |name|
      Tag.find_or_create_by!(name: name.downcase)
    end
  end
end
