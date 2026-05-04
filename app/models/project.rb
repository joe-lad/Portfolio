class Project < ApplicationRecord
  has_rich_text :description
  has_one_attached :cover_photo
end
